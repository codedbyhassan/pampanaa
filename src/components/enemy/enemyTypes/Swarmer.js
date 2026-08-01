import Enemy from '../Enemy';
import { vectorToPlayer } from '../EnemyAI';

export class Swarmer extends Enemy {
  constructor(x, y, scale = 1) {
    super({
      type: 'Swarmer',
      x,
      y,
      size: 16,
      speed: 200,
      health: 12 * scale,
      contactDamage: 5 * scale,
      scoreValue: 6,
    });
  }

  update(dt, engine) {
    super.update(dt);
    this.move(dt, vectorToPlayer(this, engine.player));
  }
}
export default Swarmer;
