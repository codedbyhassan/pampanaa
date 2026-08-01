import Weapon from '../Weapon';

const CONE = 0.55; // half-angle in radians
const RANGE = 170;

/**
 * Continuous cone weapon: no projectiles, damages every enemy inside the cone
 * on each fire tick and renders through the pooled particle system.
 */
export class Flamethrower extends Weapon {
  constructor() {
    super({
      key: 'flamethrower',
      name: 'Flamethrower',
      fireRate: 18,
      damage: 4,
      color: '#ff8a3d',
      continuous: true,
      range: RANGE,
    });
  }

  fire(engine, owner, angle) {
    for (const enemy of engine.enemies) {
      if (!enemy.active) continue;
      const dx = enemy.x - owner.x;
      const dy = enemy.y - owner.y;
      const dist = Math.hypot(dx, dy);
      if (dist > RANGE) continue;
      let diff = Math.atan2(dy, dx) - angle;
      while (diff > Math.PI) diff -= Math.PI * 2;
      while (diff < -Math.PI) diff += Math.PI * 2;
      if (Math.abs(diff) <= CONE) engine.damageEnemy(enemy, this.damage, this.key);
    }

    const spread = (Math.random() - 0.5) * CONE * 2;
    const a = angle + spread;
    const speed = 260 + Math.random() * 120;
    engine.particles.emitOne({
      x: owner.x + Math.cos(a) * 18,
      y: owner.y + Math.sin(a) * 18,
      vx: Math.cos(a) * speed,
      vy: Math.sin(a) * speed,
      life: 0.28,
      size: 7,
      color: Math.random() > 0.5 ? '#ff8a3d' : '#ffd166',
    });
    engine.trackShot(this.key);
  }
}
export default Flamethrower;
