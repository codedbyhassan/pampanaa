import { WORLD, PLAYER, SKINS } from '../../utils/constants';
import { drawShip } from '../../canvas/spriteDrawer';

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
    this.activeBuffs = { shield: 0, rapidFire: 0, scoreMultiplier: 0, autoLock: 0, multishot: 0 };
    /**
     * Amplifiers are tracked PER WEAPON: a pickup only upgrades the weapon that
     * was equipped when it was collected, so every gun levels up separately.
     */
    this.weaponAmps = {};
    this.activeWeaponKey = 'blaster';
    this.design = 'interceptor';
    this.tookDamageThisWave = false;
  }

  get color() {
    return SKINS[this.skin] || SKINS.default;
  }

  ampsFor(key = this.activeWeaponKey) {
    if (!this.weaponAmps[key]) {
      this.weaponAmps[key] = { damage: 0, fire: 0, pierce: 0, multishot: 0 };
    }
    return this.weaponAmps[key];
  }

  /** Amplifiers of the currently equipped weapon (what the HUD shows). */
  get amps() {
    return this.ampsFor(this.activeWeaponKey);
  }

  addAmp(kind, weaponKey = this.activeWeaponKey) {
    const amps = this.ampsFor(weaponKey);
    amps[kind] = (amps[kind] || 0) + 1;
  }

  /** Stacking amplifier multipliers — every pickup makes that gun hit harder. */
  damageMulFor(key = this.activeWeaponKey) {
    return 1 + this.ampsFor(key).damage * 0.2;
  }

  fireRateMulFor(key = this.activeWeaponKey) {
    return 1 + this.ampsFor(key).fire * 0.15;
  }

  /**
   * Multiplier pickups multiply how bullets are fired: every permanent stack
   * adds a barrel, and the timed multi-shot buff doubles the whole spread.
   */
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
    if (this.health === 0) this.active = false;
    return true;
  }

  update(dt, input) {
    for (const key of Object.keys(this.activeBuffs)) {
      if (this.activeBuffs[key] > 0) {
        this.activeBuffs[key] = Math.max(0, this.activeBuffs[key] - dt);
      }
    }

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

    if (input.aim && (input.aim.x !== 0 || input.aim.y !== 0)) {
      this.angle = Math.atan2(input.aim.y - this.y, input.aim.x - this.x);
    } else if (len > 0.01) {
      this.angle = Math.atan2(dirY, dirX);
    }
  }

  draw(ctx, time = 0) {
    if (!this.active) return;
    const thrust = Math.min(1, Math.hypot(this.vx, this.vy) / this.speed);
    drawShip(ctx, this.x, this.y, this.width, this.angle, this.color, {
      thrust,
      time,
      design: this.design,
      shielded: this.hasBuff('shield'),
      autoLock: this.hasBuff('autoLock'),
    });
  }
}

export default Player;
