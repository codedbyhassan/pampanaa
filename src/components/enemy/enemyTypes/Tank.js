import Enemy from '../Enemy';

/** Heavy anchor of the formation: slow, tough, fires a slow twin volley. */
export class Tank extends Enemy {
  constructor(x, y, scale = 1) {
    super({
      type: 'Tank',
      x,
      y,
      size: 48,
      speed: 140,
      health: 130 * scale,
      contactDamage: 14 * scale,
      scoreValue: 35,
      fireInterval: 5,
    });
    this.damageScale = scale;
  }

  shoot(engine) {
    for (const offset of [-0.2, 0.2]) {
      engine.spawnProjectile({
        x: this.x + offset * 40,
        y: this.y + this.height / 2,
        vx: offset * 90,
        vy: 250,
        width: 11,
        height: 11,
        damage: 8 * this.damageScale,
        color: engine.palette.enemyProjectile,
        source: 'enemy',
        life: 6,
      });
    }
  }
}
export default Tank;
