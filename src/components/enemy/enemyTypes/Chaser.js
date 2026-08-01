import Enemy from '../Enemy';
import { vectorToPlayer } from '../EnemyAI';

export class Chaser extends Enemy {
  constructor(x, y, scale = 1) {
    super({
      type: 'Chaser',
      x,
      y,
      size: 26,
      speed: 115,
      health: 40 * scale,
      contactDamage: 10 * scale,
      scoreValue: 10,
    });
  }

  update(dt, engine) {
    super.update(dt);
    this.move(dt, vectorToPlayer(this, engine.player));
  }
}
export default Chaser;
