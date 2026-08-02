import Weapon from '../Weapon';

const CONE = 0.42; // half-angle in radians
const RANGE = 420; // reaches deep into the formation lanes

/**
 * Continuous cone weapon: no projectiles, damages every enemy inside the cone
 * on each fire tick and renders through the pooled particle system. Range and
 * width both scale with amplifier pickups, and the multiplier pickup adds
 * extra flame jets instead of extra bullets.
 */
export class Flamethrower extends Weapon {
  constructor() {
    super({
      key: 'flamethrower',
      name: 'Flamethrower',
      fireRate: 20,
      damage: 5,
      color: '#ff8a3d',
      continuous: true,
      range: RANGE,
    });
  }

  reach(owner) {
    return RANGE * (1 + (owner.amps?.fire || 0) * 0.08);
  }

  cone(owner) {
    return Math.min(1.0, CONE * (1 + ((owner.shotMultiplier || 1) - 1) * 0.35));
  }

  fire(engine, owner, angle) {
    const reach = this.reach(owner);
    const cone = this.cone(owner);
    const dmg = this.damage * (owner.damageMul || 1) * (owner.shotMultiplier || 1);

    for (const enemy of engine.enemies) {
      if (!enemy.active) continue;
      const dx = enemy.x - owner.x;
      const dy = enemy.y - owner.y;
      const dist = Math.hypot(dx, dy);
      if (dist > reach + (enemy.width || 0) / 2) continue;
      let diff = Math.atan2(dy, dx) - angle;
      while (diff > Math.PI) diff -= Math.PI * 2;
      while (diff < -Math.PI) diff += Math.PI * 2;
      // Widen the cone slightly at distance so far enemies are still catchable.
      const allowance = cone + Math.atan2((enemy.width || 20) / 2, Math.max(40, dist));
      if (Math.abs(diff) <= allowance) {
        // Falloff keeps close range strongest without making the tail useless.
        const falloff = 1 - 0.45 * Math.min(1, dist / reach);
        engine.damageEnemy(enemy, dmg * falloff, this.key);
        enemy.applyBurn?.(dmg * 0.6, 1.4);
      }
    }

    // Visual jet: several long-lived particles so the flame visibly spans reach.
    const jets = 2 + Math.round((owner.shotMultiplier || 1) - 1);
    for (let i = 0; i < jets; i++) {
      const a = angle + (Math.random() - 0.5) * cone * 2;
      const speed = reach * (1.6 + Math.random() * 0.7);
      const life = (reach / speed) * (1.4 + Math.random() * 0.5);
      engine.particles.emitOne({
        x: owner.x + Math.cos(a) * 20,
        y: owner.y + Math.sin(a) * 20,
        vx: Math.cos(a) * speed,
        vy: Math.sin(a) * speed,
        life,
        size: 9 + Math.random() * 7,
        color: Math.random() > 0.5 ? '#ff8a3d' : '#ffd166',
      });
    }
    engine.trackShot(this.key);
  }
}
export default Flamethrower;
