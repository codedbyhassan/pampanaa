import Enemy from '../Enemy';
import { maintainDistance } from '../EnemyAI';

export class Shooter extends Enemy {
  constructor(x, y, scale = 1) {
    super({
      type: 'Shooter',
      x,
      y,
      size: 28,
      speed: 80,
      health: 35 * scale,
      contactDamage: 6 * scale,
      scoreValue: 15,
    });
    this.fireTimer = 1.2;
    this.damageScale = scale;
  }

  update(dt, engine) {
    super.update(dt);
    this.move(dt, maintainDistance(this, engine.player, 250));

    this.fireTimer -= dt;
    if (this.fireTimer <= 0) {
      this.fireTimer = 1.8;
      const angle = Math.atan2(engine.player.y - this.y, engine.player.x - this.x);
      engine.spawnProjectile({
        x: this.x,
        y: this.y,
        vx: Math.cos(angle) * 300,
        vy: Math.sin(angle) * 300,
        width: 8,
        height: 8,
        damage: 8 * this.damageScale,
        color: engine.palette.enemyProjectile,
        source: 'enemy',
        life: 3,
      });
    }
  }
}
export default Shooter;
