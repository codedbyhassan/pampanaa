import Player from '../components/player/Player';
import Projectile from '../components/weapons/Projectile';
import { createWeapons, WEAPON_ORDER } from '../components/weapons/weaponTypes';
import FormationManager, { createEnemy } from '../components/enemy/FormationManager';
import Boss from '../components/enemy/enemyTypes/Boss';
import ParticleSystem from '../components/effects/ParticleSystem';
import ScreenShake from '../components/effects/ScreenShake';
import DamageNumbers from '../components/effects/DamageNumbers';
import PickupSystem from '../components/pickups/Pickup';
import { PICKUP_TYPES, PICKUP_KEYS } from '../components/pickups/pickupTypes';
import { resolveCollisions } from '../components/physics/collision';
import { ObjectPool } from '../utils/objectPool';
import {
  WORLD,
  PROJECTILE_POOL_SIZE,
  DIFFICULTY,
  PALETTES,
  getWaveConfig,
  WEAPON_UNLOCK_WAVE,
} from '../utils/constants';
import { themeForWave } from './backgroundThemes';
import { drawBackground } from './parallaxRenderer';
import soundManager from '../components/audio/SoundManager';

export class GameEngine {
  constructor({ settings, progress, mode = 'campaign', callbacks }) {
    this.settings = settings;
    this.mode = mode;
    this.callbacks = callbacks; // { onSync, onEvent }
    this.sound = soundManager;
    this.palette = settings.colorblind ? PALETTES.colorblind : PALETTES.default;
    this.difficultyMods = DIFFICULTY[settings.difficulty] || DIFFICULTY.normal;

    this.player = new Player(progress.selectedSkin || 'default');
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
      this.sync({ boss: { name: boss.name, health: boss.health, maxHealth: boss.maxHealth } });
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
    if (enemy === this.boss) {
      this.sync({ boss: { name: enemy.name, health: enemy.health, maxHealth: enemy.maxHealth } });
    }
    if (!died) {
      this.sound.play('hit');
      return;
    }

    enemy.deactivate();
    const isBoss = enemy.type === 'Boss';
    this.particles.burst(enemy.x, enemy.y, this.palette[enemy.type], isBoss ? 40 : 10, isBoss ? 320 : 200);
    this.sound.play('explosion');

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
          PICKUP_KEYS[Math.floor(Math.random() * PICKUP_KEYS.length)],
        );
      }
      this.advanceWave();
      return;
    }

    if (Math.random() < 0.16) this.pickups.spawn(enemy.x, enemy.y);
    if (this.squadRemaining === 0) this.advanceWave();
  }

  advanceWave() {
    this.wave += 1;
    this.waveStarted = false;
    this.waveBannerTimer = 2;
    this.sound.play('waveComplete');

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
    PICKUP_TYPES[pickup.type].apply(this.player);
    this.particles.burst(pickup.x, pickup.y, PICKUP_TYPES[pickup.type].color, 8, 140);
    this.sound.play('pickup');
    this.sync({ health: this.player.health, buffs: { ...this.player.activeBuffs } });
  }

  endGame() {
    if (this.status === 'gameOver') return;
    this.status = 'gameOver';
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
      const angle = aim ? Math.atan2(aim.y - this.player.y, aim.x - this.player.x) : -Math.PI / 2;
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
    for (const enemy of this.enemies) if (enemy.active) enemy.draw(ctx, this.palette);
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
      const enemy = createEnemy(e.type, e.x, e.y, this.enemyStatScale);
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
