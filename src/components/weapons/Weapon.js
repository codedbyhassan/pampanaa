/**
 * Base weapon. Subclasses only vary configuration — cooldown and firing
 * bookkeeping live here so they are never reimplemented per weapon.
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

  fire(engine, owner, angle) {
    const count = this.projectileCount;
    const dmgMul = owner.damageMul || 1;
    const pierce = (owner.amps?.pierce || 0) > 0;
    for (let i = 0; i < count; i++) {
      const offset = count === 1 ? 0 : (i / (count - 1) - 0.5) * this.spread;
      const a = angle + offset;
      engine.spawnProjectile({
        x: owner.x + Math.cos(a) * 18,
        y: owner.y + Math.sin(a) * 18,
        vx: Math.cos(a) * this.projectileSpeed,
        vy: Math.sin(a) * this.projectileSpeed,
        width: this.projectileSize * (1 + (owner.amps?.damage || 0) * 0.08),
        height: this.projectileSize * (1 + (owner.amps?.damage || 0) * 0.08),
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
