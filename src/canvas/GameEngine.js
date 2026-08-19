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
import {
  WORLD,
  PROJECTILE_POOL_SIZE,
  PLAYER,
  difficultyMods,
  PALETTES,
  getWaveConfig,
  WEAPON_UNLOCK_WAVE,
} from '../utils/constants';
import { themeForWave } from './backgroundThemes';
import { drawBackground } from './parallaxRenderer';
import soundManager from '../components/audio/SoundManager';

export class GameEngine {
  constructor({ settings, progress, mode = 'campaign', startWave = 1, callbacks }) {
    this.settings = settings;
    this.mode = mode;
    this.callbacks = callbacks;
    this.sound = soundManager;
    this.palette = settings.colorblind ? PALETTES.colorblind : PALETTES.default;
    this.colorblind = !!settings.colorblind;
    this.difficultyMods = difficultyMods(settings.difficultyLevel ?? 4);

    this.player = new Player(progress.selectedSkin || 'default');
    this.player.setDesign(settings.shipDesign || 'interceptor');
    this.weapons = createWeapons();
    this.unlockedWeapons = [...(progress.unlockedWeapons || ['blaster'])];
    this.currentWeaponKey = 'blaster';
    this.player.activeWeaponKey = 'blaster';

    this.enemies = [];
    this.projectiles = new ObjectPool(() => new Projectile(), PROJECTILE_POOL_SIZE);
    this.particles = new ParticleSystem();
    this.particles.reducedMotion = !!settings.reducedMotion;
    this.damageNumbers = new DamageNumbers();
    this.pickups = new PickupSystem();
    this.shake = new ScreenShake();
    this.shake.enabled = !settings.reducedMotion && settings.screenShake !== false;
    this.formation = new FormationManager(this);

    this.score = 0;
    this.wave = 1;
    this.status = 'playing';
    this.waveBannerTimer = 1.4;
    this.waveStarted = false;
    this.time = 0;
    this.playTime = 0;
    this.boss = null;
    this.sessionKills = 0;
    this.killsByType = {};
    this.shotsByWeapon = {};
    this.combo = 0;
    this.comboTimer = 0;
    this.comboTimerMax = 1.5;
    this.waveStartHealth = PLAYER.maxHealth;
    this.waveMaxTime = 0;
    this.input = { x: 0, y: 0, firing: false, aim: null };
    this.fps = 0;
    this._fpsAcc = 0;
    this._fpsFrames = 0;
    this._lastBossHealth = null;
    this._lastBuffSec = 0;
    this._lastAmpString = '';
    this.startingWave = 1;
    if (startWave > 1) {
      this.wave = startWave;
      this.startingWave = startWave;
    }
  }

  get waveConfig() { return getWaveConfig(this.wave); }
  get isBossWave() { return this.wave % 5 === 0; }
  get enemyStatScale() { return this.difficultyMods.statMul * (this.waveConfig.statScale || 1); }
  get fireRateMul() { return (this.waveConfig.fireRateMul || 1) * this.difficultyMods.fireMul; }
  get theme() { return themeForWave(this.wave, this.settings.backgroundTheme || 'auto'); }
  get currentWeapon() { return this.weapons[this.currentWeaponKey]; }
  isUnlocked(key) { return this.unlockedWeapons.includes(key); }

  selectWeapon(key) {
    if (!this.weapons[key] || !this.isUnlocked(key) || key === this.currentWeaponKey) return;
    this.currentWeaponKey = key;
    this.player.activeWeaponKey = key;
    this.sound.play('unlock');
    this.sync({ weapon: key });
  }

  cycleWeapon(direction) {
    const list = WEAPON_ORDER.filter((k) => this.isUnlocked(k));
    if (list.length < 2) return;
    const index = list.indexOf(this.currentWeaponKey);
    const next = list[(index + (direction > 0 ? 1 : -1) + list.length) % list.length];
    this.selectWeapon(next);
  }

  sync(partial) { this.callbacks.onSync?.(partial); }
  emit(name, payload) { this.callbacks.onEvent?.(name, payload); }
  trackShot(key) { this.shotsByWeapon[key] = (this.shotsByWeapon[key] || 0) + 1; }

  findNearestEnemy(x, y) {
    let best = null;
    let bestDist = Infinity;
    for (const enemy of this.enemies) {
      if (!enemy.active) continue;
      const d = (enemy.x - x) ** 2 + (enemy.y - y) ** 2;
      if (d < bestDist) { bestDist = d; best = enemy; }
    }
    return best;
  }

  createEnemy(type, x, y, scale = this.enemyStatScale, sizeMul = 1) {
    return new Enemy(type, x, y, scale, this.colorblind, sizeMul);
  }

  syncBoss() {
    const b = this.boss;
    if (!b) return this.sync({ boss: null });
    return this.sync({ boss: { name: b.name, title: b.title, phase: b.phase, attack: b.attack, health: b.health, maxHealth: b.maxHealth } });
  }

  spawnProjectile(config) {
    const p = this.projectiles.acquire();
    p.spawn(config);
  }

  handleResize() {
    this.player.x = Math.min(this.player.x, WORLD.width - this.player.width / 2);
    this.player.y = Math.min(this.player.y, WORLD.height - this.player.height / 2);
  }

  startWave() {
    this.waveStarted = true;
    this.player.tookDamageThisWave = false;
    this.waveStartHealth = this.player.health;
    this.waveMaxTime = 0;
    this.enemies = this.enemies.filter((e) => e.active && e.mode === 'free');
    if (this.isBossWave) {
      const boss = new Boss(WORLD.width / 2, -120, this.difficultyMods.statMul, this.wave);
      this.enemies.push(boss);
      this.boss = boss;
      this.syncBoss();
      return;
    }
    this.enemies.push(...this.formation.spawnWave(this.waveConfig, this.enemyStatScale));
  }

  get squadRemaining() {
    let n = 0;
    for (const e of this.enemies) if (e.active && e.mode !== 'free') n++;
    return n;
  }

  damageEnemy(enemy, amount, weaponKey) {
    if (!enemy.active) return;
    const died = enemy.takeDamage(amount);
    if (this.settings.damageNumbers !== false) this.damageNumbers.spawn(enemy.x, enemy.y - enemy.height / 2, amount);
    if (enemy === this.boss) this.syncBoss();
    const amps = weaponKey && weaponKey !== 'burn' ? this.player.ampsFor(weaponKey) : {};
    if (died) {
      this.sessionKills += 1;
      this.killsByType[enemy.type] = (this.killsByType[enemy.type] || 0) + 1;
      this.combo += 1;
      this.comboTimer = this.comboTimerMax;
      const multiplier = 1 + Math.min(this.combo, 10) * 0.1;
      this.score += Math.round(enemy.score * multiplier * (this.player.hasBuff('scoreMultiplier') ? 2 : 1));
      this.emit('enemy_defeated', { enemyType: enemy.type, score: this.score, combo: this.combo });
      if (enemy === this.boss) this.emit('boss_defeated', { boss: enemy.name, score: this.score });
    }
  }

  update(dt) {
    if (this.status !== 'playing') return;
    this.time += dt;
    this.playTime += dt;
    this.player.update(dt, this.input);
    if (this.waveStarted && this.squadRemaining === 0 && !this.boss) this.waveStarted = false;
    this.projectiles.forEach?.((p) => p.update(dt, this));
    for (const enemy of this.enemies) if (enemy.active) enemy.update(dt, this);
    this.particles.update(dt);
    this.damageNumbers.update(dt);
    this.pickups.update(dt, this.player);
    this.shake.update(dt);
  }

  draw(ctx) {
    drawBackground(ctx, this.theme, this.time);
    for (const pickup of this.pickups.items || []) pickup.draw?.(ctx);
    for (const enemy of this.enemies) if (enemy.active) enemy.draw(ctx, this.time);
    this.projectiles.forEach?.((p) => p.draw(ctx));
    this.particles.draw(ctx);
    this.damageNumbers.draw(ctx);
    this.player.draw(ctx, this.time);
  }
}

export default GameEngine;
