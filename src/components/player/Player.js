import { WORLD, PLAYER, SKINS } from '../../utils/constants';
import { drawWarden } from './wardenRenderer';
import { createWardenVisual, normaliseWardenDesign } from '../../domain/player/playerVisual';

export class Player {
  constructor(skin = 'default') {
    this.reset(skin);
  }

  reset(skin = 'default') {
    this.x = WORLD.width / 2;
    this.y = WORLD.height * 0.78;
    this.vx = 0;
    this.vy = 0;
    this.width = PLAYER.width;
    this.height = PLAYER.height;
    this.speed = PLAYER.speed;
    this.maxHealth = PLAYER.maxHealth;
    this.health = PLAYER.maxHealth;
    this.active = true;
    this.angle = -Math.PI / 2;
    this.skin = skin;
    this.visual = createWardenVisual({ design: 'interceptor' });
    this.hitFlash = 0;
    this.activeBuffs = {
      shield: 0,
      rapidFire: 0,
      scoreMultiplier: 0,
      autoLock: 0,
      multishot: 0,
      magnet: 0,
    };
    this.weaponAmps = {};
    this.activeWeaponKey = 'blaster';
    this.design = 'interceptor';
    this.tookDamageThisWave = false;
  }

  get color() {
    return SKINS[this.skin] || SKINS.default;
  }

  get noseOffset() {
    return this.width * 0.9;
  }

  ampsFor(key = this.activeWeaponKey) {
    if (!this.weaponAmps[key]) {
      this.weaponAmps[key] = { damage: 0, fire: 0, pierce: 0, multishot: 0 };
    }
    return this.weaponAmps[key];
  }

  get amps() {
    return this.ampsFor(this.activeWeaponKey);
  }

  addAmp(kind, weaponKey = this.activeWeaponKey) {
    const amps = this.ampsFor(weaponKey);
    amps[kind] = (amps[kind] || 0) + 1;
  }

  damageMulFor(key = this.activeWeaponKey) {
    return 1 + this.ampsFor(key).damage * 0.2;
  }

  fireRateMulFor(key = this.activeWeaponKey) {
    return 1 + this.ampsFor(key).fire * 0.15;
  }

  shotMultiplierFor(key = this.activeWeaponKey) {
    const stacks = Math.min(5, this.ampsFor(key).multishot || 0);
    return (1 + stacks) * (this.hasBuff('multishot') ? 2 : 1);
  }

  get damageMul() {
    return this.damageMulFor();
  }

  get fireRateMul() {
    return this.fireRateMulFor();
  }

  get shotMultiplier() {
    return this.shotMultiplierFor();
  }

  hasBuff(name) {
    return this.activeBuffs[name] > 0;
  }

  applyBuff(name, duration) {
    this.activeBuffs[name] = Math.max(this.activeBuffs[name] || 0, duration);
  }

  heal(amount) {
    this.health = Math.min(this.maxHealth, this.health + amount);
  }

  takeDamage(amount) {
    if (!this.active || this.hasBuff('shield')) return false;
    this.tookDamageThisWave = true;
    this.health = Math.max(0, this.health - amount);
    this.hitFlash = 1;
    if (this.health === 0) this.active = false;
    return true;
  }

  setDesign(design) {
    this.design = normaliseWardenDesign(design);
    this.visual = createWardenVisual({ design: this.design, accent: this.color });
  }

  update(dt, input) {
    for (const key of Object.keys(this.activeBuffs)) {
      if (this.activeBuffs[key] > 0) this.activeBuffs[key] = Math.max(0, this.activeBuffs[key] - dt);
    }
    this.hitFlash = Math.max(0, this.hitFlash - dt * 5);

    const len = Math.hypot(input.x, input.y);
    const dirX = len > 1 ? input.x / len : input.x;
    const dirY = len > 1 ? input.y / len : input.y;
    this.vx = dirX * this.speed;
    this.vy = dirY * this.speed;
    this.x += this.vx * dt;
    this.y += this.vy * dt;

    const halfW = this.width / 2;
    const halfH = this.height / 2;
    this.x = Math.max(halfW, Math.min(WORLD.width - halfW, this.x));
    this.y = Math.max(halfH, Math.min(WORLD.height - halfH, this.y));

    let target = this.angle;
    if (input.aim && (input.aim.x !== 0 || input.aim.y !== 0)) {
      target = Math.atan2(input.aim.y - this.y, input.aim.x - this.x);
    } else if (len > 0.01) {
      target = -Math.PI / 2 + Math.max(-1, Math.min(1, dirX)) * 0.5;
    } else {
      target = -Math.PI / 2;
    }

    let diff = target - this.angle;
    while (diff > Math.PI) diff -= Math.PI * 2;
    while (diff < -Math.PI) diff += Math.PI * 2;
    this.angle += diff * Math.min(1, dt * 16);
  }

  draw(ctx, time = 0) {
    if (!this.active) return;
    const thrust = Math.min(1, Math.hypot(this.vx, this.vy) / this.speed);
    drawWarden(ctx, this.x, this.y, this.width, this.angle, {
      thrust,
      time,
      visual: { ...this.visual, accent: this.color },
      shielded: this.hasBuff('shield'),
      autoLock: this.hasBuff('autoLock'),
      hitFlash: this.hitFlash,
      disabled: !this.active,
    });
  }
}

export default Player;
