import { WORLD, PROJECTILE_POOL_SIZE, PLAYER, difficultyMods, PALETTES, getWaveConfig, WEAPON_UNLOCK_WAVE } from '../utils/constants';
import { themeForWave } from './backgroundThemes';
import { drawBackground } from './parallaxRenderer';
import soundManager from '../components/audio/SoundManager';
import Player from '../components/player/Player';
import Projectile from '../components/weapons/Projectile';
import { createWeapons, WEAPON_ORDER } from '../components/weapons/weaponTypes';
import FormationManager from '../components/enemy/FormationManager';
import Enemy from '../components/enemy/Enemy';
import Boss from '../components/enemy/enemyTypes/Boss';
import ParticleSystem from '../components/effects/ParticleSystem';
import ScreenShake from '../components/effects/ScreenShake';
import DamageNumbers from '../components/effects/DamageNumbers';
import PickupSystem from '../components/pickups/Pickup';
import { PICKUP_TYPES, randomPickupType, randomBossPickup } from '../components/pickups/pickupTypes';
import { resolveCollisions } from '../components/physics/collision';
import { ObjectPool } from '../utils/objectPool';

export class GameEngine {
  constructor({ settings, progress, mode = 'campaign', startWave = 1, callbacks }) {
    this.settings = settings; this.mode = mode; this.callbacks = callbacks;
    this.sound = soundManager;
    this.palette = settings.colorblind ? PALETTES.colorblind : PALETTES.default;
    this.colorblind = !!settings.colorblind; this.difficultyMods = difficultyMods(settings.difficultyLevel ?? 4);
    this.player = new Player(progress.selectedSkin || 'default');
    this.player.setDesign(settings.shipDesign || 'interceptor');
    this.weapons = createWeapons(); this.unlockedWeapons = [...(progress.unlockedWeapons || ['blaster'])];
    this.currentWeaponKey = progress.selectedWeapon && this.weapons[progress.selectedWeapon] ? progress.selectedWeapon : 'blaster';
    this.player.activeWeaponKey = this.currentWeaponKey;
    if (progress.weaponAmps) this.player.weaponAmps = structuredClone(progress.weaponAmps);
    if (progress.activeBuffs) this.player.activeBuffs = { ...this.player.activeBuffs, ...progress.activeBuffs };
    this.enemies = []; this.projectiles = new ObjectPool(() => new Projectile(), PROJECTILE_POOL_SIZE, PROJECTILE_POOL_SIZE);
    this.particles = new ParticleSystem(); this.particles.reducedMotion = !!settings.reducedMotion;
    this.damageNumbers = new DamageNumbers(); this.pickups = new PickupSystem(); this.shake = new ScreenShake();
    this.shake.enabled = !settings.reducedMotion && settings.screenShake !== false; this.formation = new FormationManager(this);
    this.score = 0; this.wave = 1; this.status = 'playing'; this.waveBannerTimer = 1.4; this.waveStarted = false;
    this.time = 0; this.playTime = 0; this.boss = null; this.sessionKills = 0; this.killsByType = {}; this.shotsByWeapon = {};
    this.combo = 0; this.comboTimer = 0; this.comboTimerMax = 1.5; this.waveStartHealth = PLAYER.maxHealth; this.waveMaxTime = 0;
    this.input = { x: 0, y: 0, firing: false, aim: null }; this.fps = 0; this._fpsAcc = 0; this._fpsFrames = 0;
    this._lastBossHealth = null; this._lastBuffSec = 0; this._lastAmpString = ''; this.startingWave = 1;
    if (startWave > 1) { this.wave = startWave; this.startingWave = startWave; }
  }

  get waveConfig() { return getWaveConfig(this.wave); }
  get isBossWave() { return this.wave % 5 === 0; }
  get enemyStatScale() { return this.difficultyMods.statMul * (this.waveConfig.statScale || 1); }
  get fireRateMul() { return (this.waveConfig.fireRateMul || 1) * this.difficultyMods.fireMul; }
  get theme() { return themeForWave(this.wave, this.settings.backgroundTheme || 'auto'); }
  get currentWeapon() { return this.weapons[this.currentWeaponKey]; }
  isUnlocked(key) { return this.unlockedWeapons.includes(key); }
  selectWeapon(key) { if (!this.weapons[key] || !this.isUnlocked(key) || key === this.currentWeaponKey) return; this.currentWeaponKey = key; this.player.activeWeaponKey = key; this.sound.play('unlock'); this.sync({ weapon: key }); this.emit('weaponChanged', { weapon: key }); }
  cycleWeapon(direction) { const list = WEAPON_ORDER.filter((k) => this.isUnlocked(k)); if (list.length < 2) return; const index = list.indexOf(this.currentWeaponKey); this.selectWeapon(list[(index + (direction > 0 ? 1 : -1) + list.length) % list.length]); }
  sync(partial) { this.callbacks.onSync?.(partial); }
  emit(name, payload) { this.callbacks.onEvent?.(name, payload); }
  trackShot(key) { this.shotsByWeapon[key] = (this.shotsByWeapon[key] || 0) + 1; }
  findNearestEnemy(x, y) { let best = null; let bestDist = Infinity; for (const enemy of this.enemies) { if (!enemy.active) continue; const d = (enemy.x - x) ** 2 + (enemy.y - y) ** 2; if (d < bestDist) { bestDist = d; best = enemy; } } return best; }
  createEnemy(type, x, y, scale = this.enemyStatScale, sizeMul = 1) { return new Enemy(type, x, y, scale, this.colorblind, sizeMul); }
  syncBoss() { const b = this.boss; if (!b) return this.sync({ boss: null }); return this.sync({ boss: { name: b.name, title: b.title, phase: b.phase, attack: b.attack, health: b.health, maxHealth: b.maxHealth } }); }
  spawnProjectile(config) {
    const p = this.projectiles.acquire();
    if (!p) return false;
    p.spawn(config);
    return true;
  }
  handleResize() { this.player.x = Math.min(this.player.x, WORLD.width - this.player.width / 2); this.player.y = Math.min(this.player.y, WORLD.height - this.player.height / 2); }
  startWave() {
    this.waveStarted = true; this.player.tookDamageThisWave = false; this.waveStartHealth = this.player.health; this.waveMaxTime = 0; this.enemies = this.enemies.filter((e) => e.active && e.mode === 'free');
    if (this.isBossWave) {
      const boss = new Boss(WORLD.width / 2, -120, this.difficultyMods.statMul, this.wave); this.enemies.push(boss); this.boss = boss; this.syncBoss(); this.emit('bossEntered', { name: boss.name, title: boss.title, wave: this.wave, phase: boss.phase }); return;
    }
    this.enemies.push(...this.formation.spawnWave(this.waveConfig, this.enemyStatScale));
  }

  get squadRemaining() { let n = 0; for (const e of this.enemies) if (e.active && e.mode !== 'free') n++; return n; }
  damageEnemy(enemy, amount, weaponKey) {
    if (!enemy.active) return; const died = enemy.takeDamage(amount); if (this.settings.damageNumbers !== false) this.damageNumbers.spawn(enemy.x, enemy.y - enemy.height / 2, amount);
    if (enemy === this.boss) this.syncBoss(); const amps = weaponKey && weaponKey !== 'burn' ? this.player.ampsFor(weaponKey) : {};
    if (amps.damage >= 2 && weaponKey !== 'burn') enemy.applyBurn?.(2 + amps.damage, 2.5); if (amps.fire >= 3) enemy.applySlow?.(1.6); if (weaponKey === 'cryoLance') { const chill = this.pendingChill || 1.6; if (enemy.applyChill) enemy.applyChill(chill); else enemy.applySlow?.(chill); }
    if (!died) { this.sound.play('hit'); this.shake.trigger(Math.min(8, 2 + amount / 50)); return; }
    enemy.deactivate(); const isBoss = enemy.type === 'Boss'; this.particles.burst(enemy.x, enemy.y, enemy.color, isBoss ? 46 : 10, isBoss ? 340 : 200); this.sound.play(isBoss ? 'bossExplosion' : 'explosion'); this.shake.trigger(isBoss ? 18 : 4);
    this.combo += 1; this.comboTimer = this.comboTimerMax; const comboMult = Math.max(1, Math.floor(this.combo / 5)); const comboBonus = Math.max(0, this.combo - 1) * 50; const mult = this.player.hasBuff('scoreMultiplier') ? 2 : 1;
    this.score += (enemy.scoreValue * mult + comboBonus) * (1 + comboMult * 0.5); this.sessionKills += 1; this.killsByType[enemy.type] = (this.killsByType[enemy.type] || 0) + 1;
    this.sync({ score: this.score, combo: this.combo, comboMultiplier: 1 + comboMult * 0.5 }); this.emit('kill', { type: enemy.type, weaponKey, combo: this.combo }); enemy.onDeath?.(this);
    if (isBoss) { this.boss = null; this.sync({ boss: null }); this.emit('bossDefeated', { wave: this.wave, name: enemy.name, title: enemy.title }); for (let i = 0; i < 3; i++) this.pickups.spawn(enemy.x + (i - 1) * 40, enemy.y, randomBossPickup(this.wave)); this.advanceWave(); return; }
    if (Math.random() < 0.16 * this.difficultyMods.pickupMul) this.pickups.spawn(enemy.x, enemy.y); if (this.squadRemaining === 0) this.advanceWave();
  }
  advanceWave() { this.wave += 1; this.waveStarted = false; this.waveBannerTimer = 2; this.sound.play('waveComplete'); this.sound.setIntensity?.(Math.min(1, this.wave / 20)); const waveMastery = !this.player.tookDamageThisWave ? 'FLAWLESS' : null; const newlyUnlocked = []; for (const key of WEAPON_ORDER) { const req = WEAPON_UNLOCK_WAVE[key]; if (req && this.wave >= req && !this.unlockedWeapons.includes(key)) { this.unlockedWeapons.push(key); newlyUnlocked.push(key); } } if (newlyUnlocked.length) this.sound.play('unlock'); this.sync({ wave: this.wave, waveBanner: true, waveMastery, unlockedWeapons: [...this.unlockedWeapons] }); this.emit('waveAdvance', { wave: this.wave, newlyUnlocked, waveMastery }); }
  damagePlayer(amount, shakeMagnitude = 6) { if (!this.player.active) return; const applied = this.player.takeDamage(amount); if (!applied) return; this.shake.trigger(shakeMagnitude); this.sound.play('playerHit'); this.sync({ health: this.player.health }); if (!this.player.active) this.endGame(); }
  collectPickup(pickup) { pickup.active = false; const def = PICKUP_TYPES[pickup.type]; def.apply(this.player, this.currentWeaponKey); this.particles.burst(pickup.x, pickup.y, def.color, 10, 150); this.sound.play(def.sound || 'pickup'); this.sync({ health: this.player.health, buffs: { ...this.player.activeBuffs }, amps: { ...this.player.amps } }); this.emit('pickupCollected', { type: pickup.type, weaponKey: this.currentWeaponKey, label: def.label }); }
  endGame() { if (this.status === 'gameOver') return; this.status = 'gameOver'; this.sound.play('playerDeath'); this.sync({ status: 'gameOver', score: this.score, wave: this.wave, health: 0 }); this.emit('gameOver', { score: this.score, wave: this.wave }); }
  setInput(input) { this.input = input; }
  update(dt) {
    if (this.status !== 'playing') return; this.time += dt; this.playTime += dt; this.formation.update(dt); this.player.update(dt, this.input); for (const key of Object.keys(this.weapons)) this.weapons[key].update(dt);
    if (this.input.firing && this.player.active) { const aim = this.input.aim; let angle = aim ? Math.atan2(aim.y - this.player.y, aim.x - this.player.x) : -Math.PI / 2; if (this.player.hasBuff('autoLock')) { const target = this.findNearestEnemy(this.player.x, this.player.y); if (target) angle = Math.atan2(target.y - this.player.y, target.x - this.player.x); } this.currentWeapon.tryFire(this, this.player, angle); }
    if (this.waveBannerTimer > 0) { this.waveBannerTimer -= dt; if (this.waveBannerTimer <= 0) this.sync({ waveBanner: false }); } else if (!this.waveStarted) this.startWave();
    for (const enemy of this.enemies) if (enemy.active) enemy.update(dt, this); this.projectiles.forEachActive((p) => p.update(dt, this)); this.pickups.update(dt, this.player); this.particles.update(dt); this.damageNumbers.update(dt); this.shake.update(dt); resolveCollisions(this); if (this.enemies.length > 60) this.enemies = this.enemies.filter((e) => e.active);
    if (this.combo > 0) { this.comboTimer -= dt; if (this.comboTimer <= 0) { this.combo = 0; this.sync({ combo: 0, comboMultiplier: 1 }); } }
    const secs = Math.ceil(Math.max(...Object.values(this.player.activeBuffs))); if (secs !== this._lastBuffSec) { this._lastBuffSec = secs; this.sync({ buffs: { ...this.player.activeBuffs } }); }
    const ampString = JSON.stringify(this.player.amps); if (ampString !== this._lastAmpString) { this._lastAmpString = ampString; this.sync({ amps: { ...this.player.amps } }); }
    if (this.boss) { const bossPrev = this._lastBossHealth; if (!bossPrev || bossPrev !== this.boss.health) { this._lastBossHealth = this.boss.health; this.syncBoss(); } }
  }
  draw(ctx, dt = 0) { ctx.clearRect(0, 0, WORLD.width, WORLD.height); ctx.save(); ctx.translate(this.shake.x, this.shake.y); drawBackground(ctx, this.theme, this.time); this.pickups.draw(ctx, this.time); for (const enemy of this.enemies) if (enemy.active) enemy.draw(ctx); this.projectiles.forEachActive((p) => p.draw(ctx)); this.player.draw(ctx, this.time); this.particles.draw(ctx); this.damageNumbers.draw(ctx); ctx.restore(); if (dt > 0) { this._fpsAcc += dt; this._fpsFrames += 1; if (this._fpsAcc >= 0.5) { this.fps = Math.round(this._fpsFrames / this._fpsAcc); this._fpsAcc = 0; this._fpsFrames = 0; } } }
}

export default GameEngine;
