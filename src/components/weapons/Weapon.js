/**
 * Base weapon. Subclasses only vary configuration — cooldown, shot-multiplier
 * maths and firing bookkeeping live here so they are never reimplemented.
 */
export class Weapon {
  constructor(config) {
    this.key = config.key;
    this.name = config.name;
    this.fireRate = config.fireRate; // shots per second
    this.damage = config.damage;
    this.projectileCount = config.projectileCount ?? 1;
    this.spread = config.spread ?? 0; // radians, total cone
    this.projectileSpeed = config.projectileSpeed ?? 620;
    this.projectileSize = config.projectileSize ?? 6;
    this.color = config.color ?? '#ffe066';
    this.continuous = config.continuous ?? false;
    this.homing = config.homing ?? false;
    this.range = config.range ?? 0;
    /** Extra fan added per multiplied barrel, so stacked shots never overlap. */
    this.spreadPerShot = config.spreadPerShot ?? 0.1;
    this.cooldown = 0;
  }

  update(dt) {
    if (this.cooldown > 0) this.cooldown = Math.max(0, this.cooldown - dt);
  }

  get interval() {
    return 1 / this.fireRate;
  }

  tryFire(engine, owner, angle) {
    if (this.cooldown > 0) return false;
    const rapid = owner.hasBuff?.('rapidFire') ? 0.5 : 1;
    const amp = owner.fireRateMul || 1;
    this.cooldown = (this.interval * rapid) / amp;
    this.fire(engine, owner, angle);
    return true;
  }

  /** How many barrels this shot fires, after multiplier pickups. */
  shotCount(owner) {
    return Math.max(1, Math.round(this.projectileCount * (owner.shotMultiplier || 1)));
  }

  /** Cone widens with the number of barrels so multiplied fire stays readable. */
  shotSpread(count) {
    if (count <= 1) return 0;
    const base = this.spread || 0;
    const extra = Math.max(0, count - Math.max(1, this.projectileCount)) * this.spreadPerShot;
    return Math.min(Math.PI * 0.85, base + extra);
  }

  fire(engine, owner, angle) {
    const count = this.shotCount(owner);
    const spread = this.shotSpread(count);
    const dmgMul = owner.damageMul || 1;
    const pierce = (owner.amps?.pierce || 0) > 0;
    const sizeMul = 1 + (owner.amps?.damage || 0) * 0.08;
    for (let i = 0; i < count; i++) {
      const offset = count === 1 ? 0 : (i / (count - 1) - 0.5) * spread;
      const a = angle + offset;
      engine.spawnProjectile({
        x: owner.x + Math.cos(a) * 18,
        y: owner.y + Math.sin(a) * 18,
        vx: Math.cos(a) * this.projectileSpeed,
        vy: Math.sin(a) * this.projectileSpeed,
        width: this.projectileSize * sizeMul,
        height: this.projectileSize * sizeMul,
        damage: this.damage * dmgMul,
        color: this.color,
        source: 'player',
        weaponKey: this.key,
        homing: this.homing,
        piercing: pierce,
        life: 2,
      });
    }
    engine.sound.play('shoot');
    engine.trackShot(this.key);
  }
}

export default Weapon;
