import Enemy from '../Enemy';
import { vectorToPlayer } from '../EnemyAI';

export class Splitter extends Enemy {
  constructor(x, y, scale = 1, isSplit = false) {
    super({
      type: 'Splitter',
      x,
      y,
      size: isSplit ? 18 : 32,
      speed: isSplit ? 150 : 105,
      health: (isSplit ? 25 : 60) * scale,
      contactDamage: (isSplit ? 6 : 12) * scale,
      scoreValue: isSplit ? 8 : 20,
    });
    this.isSplit = isSplit;
    this.scale = scale;
  }

  update(dt, engine) {
    super.update(dt);
    this.move(dt, vectorToPlayer(this, engine.player));
  }

  /** Split instances never split again — prevents an infinite chain. */
  onDeath(engine) {
    if (this.isSplit) return;
    for (let i = 0; i < 2; i++) {
      const child = new Splitter(
        this.x + (i === 0 ? -16 : 16),
        this.y + (i === 0 ? -10 : 10),
        this.scale,
        true,
      );
      engine.enemies.push(child);
    }
  }
}
export default Splitter;
