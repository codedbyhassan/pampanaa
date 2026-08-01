import Enemy from '../Enemy';
import { vectorToPlayer } from '../EnemyAI';

export class Tank extends Enemy {
  constructor(x, y, scale = 1) {
    super({
      type: 'Tank',
      x,
      y,
      size: 44,
      speed: 52,
      health: 160 * scale,
      contactDamage: 22 * scale,
      scoreValue: 35,
    });
  }

  update(dt, engine) {
    super.update(dt);
    this.move(dt, vectorToPlayer(this, engine.player));
  }
}
export default Tank;
