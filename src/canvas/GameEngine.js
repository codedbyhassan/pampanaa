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
import { PICKUP_TYPES, randomPickupType } from '../components/pickups/pickupTypes';
import { resolveCollisions } from '../components/physics/collision';
import { ObjectPool } from '../utils/objectPool';
import {
  WORLD,
  PROJECTILE_POOL_SIZE,
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
    this.callbacks = callbacks; // { onSync, onEvent }
    this.sound = soundManager;
    this.palette = settings.colorblind ? PALETTES.colorblind : PALETTES.default;
    this.colorblind = !!settings.colorblind;
    this.difficultyMods = difficultyMods(settings.difficultyLevel ?? 4);

    this.player = new Player(progress.selectedSkin || 'default');
    this.player.design = settings.shipDesign || 'interceptor';
    this.weapons = createWeapons();
    this.unlockedWeapons = [...(progress.unlockedWeapons || ['blaster'])];
    this.currentWeaponKey = 'blaster';

    this.enemies = [];
    this.projectiles = new ObjectPool(() => new Projectile(), PROJECTILE_POOL_SIZE);
    this.particles = new ParticleSystem();
    this.particles.reducedMotion = !!settings.reducedMotion;
    this.damageNumbers = new DamageNumbers();
    this.pickups = new PickupSystem();
    this.shake = new ScreenShake();
    this.shake.enabled = !settings.reducedMotion;
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
    this.input = { x: 0, y: 0, firing: false, aim: null };
    this.fps = 0;
    this._fpsAcc = 0;
    this._fpsFrames = 0;
    this.startingWave = 1;
    if (startWave > 1) {
      this.wave = startWave;
      this.startingWave = startWave;
    }
  }

  get waveConfig() {
    return getWaveConfig(this.wave);
  }

  get isBossWave() {
    return this.wave % 5 === 0;
  }

  get enemyStatScale() {
    return this.difficultyMods.statMul * (this.waveConfig.statScale || 1);
  }

  /** Global multiplier applied to every enemy's firing cadence. */
  get fireRateMul() {
    return (this.waveConfig.fireRateMul || 1) * this.difficultyMods.fireMul;
  }

  get theme() {
    return themeForWave(this.wave);
  }

  get currentWeapon() {
    return this.weapons[this.currentWeaponKey];
  }

  isUnlocked(key) {
    return this.unlockedWeapons.includes(key);
  }

  selectWeapon(key) {
    if (!this.weapons[key] || !this.isUnlocked(key) || key === this.currentWeaponKey) return;
    this.currentWeaponKey = key;
    this.sound.play('unlock');
    this.sync({ weapon: key });
  }

  /** Scroll-wheel / gamepad style cycling through unlocked weapons. */
  cycleWeapon(direction) {
    const list = WEAPON_ORDER.filter((k) => this.isUnlocked(k));
    if (list.length < 2) return;
    const index = list.indexOf(this.currentWeaponKey);
    const next = list[(index + (direction > 0 ? 1 : -1) + list.length) % list.length];
    this.selectWeapon(next);
  }

  sync(partial) {
    this.callbacks.onSync?.(partial);
  }

  emit(name, payload) {
    this.callbacks.onEvent?.(name, payload);
  }

  trackShot(key) {
    this.shotsByWeapon[key] = (this.shotsByWeapon[key] || 0) + 1;
  }

  findNearestEnemy(x, y) {
    let best = null;
    let bestDist = Infinity;
    for (const enemy of this.enemies) {
      if (!enemy.active) continue;
      const d = (enemy.x - x) ** 2 + (enemy.y - y) ** 2;
      if (d < bestDist) {
        bestDist = d;
        best = enemy;
      }
    }
    return best;
  }

  /** Central factory so every enemy picks up the run's palette + scaling. */
  createEnemy(type, x, y, scale = this.enemyStatScale, sizeMul = 1) {
    return new Enemy(type, x, y, scale, this.colorblind, sizeMul);
  }

  syncBoss() {
    const b = this.boss;
    if (!b) return this.sync({ boss: null });
    return this.sync({
      boss: {
        name: b.name,
        title: b.title,
        phase: b.phase,
        attack: b.attack,
        health: b.health,
        maxHealth: b.maxHealth,
      },
    });
  }

  spawnProjectile(config) {
    const p = this.projectiles.acquire();
    p.spawn(config);
  }

  /** Keeps entities inside the arena after the viewport (and world) resizes. */
  handleResize() {
    this.player.x = Math.min(this.player.x, WORLD.width - this.player.width / 2);
    this.player.y = Math.min(this.player.y, WORLD.height - this.player.height / 2);
  }

  startWave() {
    this.waveStarted = true;
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
    this.damageNumbers.spawn(enemy.x, enemy.y - enemy.height / 2, amount);
    if (enemy === this.boss) this.syncBoss();
    // Heavily amplified rounds set enemies alight and slow their cadence.
    const amps = this.player.amps || {};
    if (amps.damage >= 2 && weaponKey !== 'burn') enemy.applyBurn?.(2 + amps.damage, 2.5);
    if (amps.fire >= 3) enemy.applySlow?.(1.6);
    if (!died) {
      this.sound.play('hit');
      return;
    }

    enemy.deactivate();
    const isBoss = enemy.type === 'Boss';
    this.particles.burst(enemy.x, enemy.y, enemy.color, isBoss ? 46 : 10, isBoss ? 340 : 200);
    this.sound.play(isBoss ? 'bossExplosion' : 'explosion');

    const mult = this.player.hasBuff('scoreMultiplier') ? 2 : 1;
    this.score += enemy.scoreValue * mult;
    this.sessionKills += 1;
    this.killsByType[enemy.type] = (this.killsByType[enemy.type] || 0) + 1;
    this.sync({ score: this.score });
    this.emit('kill', { type: enemy.type, weaponKey });

    enemy.onDeath?.(this);

    if (isBoss) {
      this.boss = null;
      this.sync({ boss: null });
      this.emit('bossDefeated', { wave: this.wave });
      for (let i = 0; i < 3; i++) {
        this.pickups.spawn(
          enemy.x + (i - 1) * 40,
          enemy.y,
          randomPickupType(),
        );
      }
      this.advanceWave();
      return;
    }

    if (Math.random() < 0.16 * this.difficultyMods.pickupMul) this.pickups.spawn(enemy.x, enemy.y);
    if (this.squadRemaining === 0) this.advanceWave();
  }

  advanceWave() {
    this.wave += 1;
    this.waveStarted = false;
    this.waveBannerTimer = 2;
    this.sound.play('waveComplete');
    this.sound.setIntensity?.(Math.min(1, this.wave / 20));

    const newlyUnlocked = [];
    for (const key of WEAPON_ORDER) {
      const req = WEAPON_UNLOCK_WAVE[key];
      if (req && this.wave >= req && !this.unlockedWeapons.includes(key)) {
        this.unlockedWeapons.push(key);
        newlyUnlocked.push(key);
      }
    }
    if (newlyUnlocked.length) this.sound.play('unlock');

    this.sync({
      wave: this.wave,
      waveBanner: true,
      unlockedWeapons: [...this.unlockedWeapons],
    });
    this.emit('waveAdvance', { wave: this.wave, newlyUnlocked });
  }

  damagePlayer(amount, shakeMagnitude = 6) {
    if (!this.player.active) return;
    const applied = this.player.takeDamage(amount);
    if (!applied) return;
    this.shake.trigger(shakeMagnitude);
    this.sound.play('playerHit');
    this.sync({ health: this.player.health });
    if (!this.player.active) this.endGame();
  }

  collectPickup(pickup) {
    pickup.active = false;
    const def = PICKUP_TYPES[pickup.type];
    def.apply(this.player);
    this.particles.burst(pickup.x, pickup.y, def.color, 10, 150);
    this.sound.play(def.sound || 'pickup');
    this.sync({
      health: this.player.health,
      buffs: { ...this.player.activeBuffs },
      amps: { ...this.player.amps },
    });
  }

  endGame() {
    if (this.status === 'gameOver') return;
    this.status = 'gameOver';
    this.sound.play('playerDeath');
    this.sync({ status: 'gameOver', score: this.score, wave: this.wave, health: 0 });
    this.emit('gameOver', { score: this.score, wave: this.wave });
  }

  setInput(input) {
    this.input = input;
  }

  update(dt) {
    if (this.status !== 'playing') return;
    this.time += dt;
    this.playTime += dt;
    this.formation.update(dt);

    // 1. Input → player
    this.player.update(dt, this.input);
    for (const key of Object.keys(this.weapons)) this.weapons[key].update(dt);
    if (this.input.firing && this.player.active) {
      const aim = this.input.aim;
      let angle = aim ? Math.atan2(aim.y - this.player.y, aim.x - this.player.x) : -Math.PI / 2;
      // Auto-lock overrides aim entirely and tracks the closest living enemy.
      if (this.player.hasBuff('autoLock')) {
        const target = this.findNearestEnemy(this.player.x, this.player.y);
        if (target) angle = Math.atan2(target.y - this.player.y, target.x - this.player.x);
      }
      this.currentWeapon.tryFire(this, this.player, angle);
    }

    // 2. Wave pacing — the next squad launches once the banner clears.
    if (this.waveBannerTimer > 0) {
      this.waveBannerTimer -= dt;
      if (this.waveBannerTimer <= 0) this.sync({ waveBanner: false });
    } else if (!this.waveStarted) {
      this.startWave();
    }

    // 3. Entities
    for (const enemy of this.enemies) if (enemy.active) enemy.update(dt, this);
    this.projectiles.forEachActive((p) => p.update(dt, this));
    this.pickups.update(dt, this.player);
    this.particles.update(dt);
    this.damageNumbers.update(dt);
    this.shake.update(dt);

    // 4. Collisions
    resolveCollisions(this);

    // 5. Cleanup
    if (this.enemies.length > 60) this.enemies = this.enemies.filter((e) => e.active);

    const secs = Math.ceil(Math.max(...Object.values(this.player.activeBuffs)));
    if (secs !== this._lastBuffSec) {
      this._lastBuffSec = secs;
      this.sync({ buffs: { ...this.player.activeBuffs } });
    }
  }

  draw(ctx, dt = 0) {
    ctx.clearRect(0, 0, WORLD.width, WORLD.height);
    ctx.save();
    ctx.translate(this.shake.x, this.shake.y);

    drawBackground(ctx, this.theme, this.time);

    this.pickups.draw(ctx, this.time);
    for (const enemy of this.enemies) if (enemy.active) enemy.draw(ctx);
    this.projectiles.forEachActive((p) => p.draw(ctx));
    this.player.draw(ctx, this.time);
    this.particles.draw(ctx);
    this.damageNumbers.draw(ctx);

    ctx.restore();

    if (dt > 0) {
      this._fpsAcc += dt;
      this._fpsFrames += 1;
      if (this._fpsAcc >= 0.5) {
        this.fps = Math.round(this._fpsFrames / this._fpsAcc);
        this._fpsAcc = 0;
        this._fpsFrames = 0;
      }
    }
  }

  snapshot() {
    return {
      score: this.score,
      wave: this.wave,
      mode: this.mode,
      weapon: this.currentWeaponKey,
      player: {
        x: Math.round(this.player.x),
        y: Math.round(this.player.y),
        health: this.player.health,
      },
      enemies: this.enemies
        .filter((e) => e.active && e.type !== 'Boss')
        .map((e) => e.snapshot()),
    };
  }

  restore(snapshot) {
    this.score = snapshot.score || 0;
    this.wave = snapshot.wave || 1;
    this.startingWave = this.wave;
    this.player.x = snapshot.player?.x ?? WORLD.width / 2;
    this.player.y = snapshot.player?.y ?? WORLD.height * 0.78;
    this.player.health = snapshot.player?.health ?? this.player.maxHealth;
    if (snapshot.weapon && this.isUnlocked(snapshot.weapon)) this.currentWeaponKey = snapshot.weapon;
    this.enemies = (snapshot.enemies || []).map((e) => {
      const enemy = this.createEnemy(e.type, e.x, e.y);
      enemy.maxHealth = e.maxHealth ?? enemy.maxHealth;
      enemy.health = e.health ?? enemy.health;
      if (e.isSplit) enemy.isSplit = true;
      if (e.slot) enemy.assignSlot(e.slot, 0);
      return enemy;
    });
    this.waveStarted = this.enemies.length > 0;
    this.waveBannerTimer = this.waveStarted ? 0 : 1.2;
    this.sync({
      score: this.score,
      wave: this.wave,
      health: this.player.health,
      weapon: this.currentWeaponKey,
    });
  }
}

export default GameEngine;
