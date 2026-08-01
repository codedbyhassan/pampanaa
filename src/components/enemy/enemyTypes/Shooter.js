import Enemy from '../Enemy';

/** Ranged formation member: lobs aimed shots straight down the field. */
export class Shooter extends Enemy {
  constructor(x, y, scale = 1) {
    super({
      type: 'Shooter',
      x,
      y,
      size: 32,
      speed: 175,
      health: 30 * scale,
      contactDamage: 6 * scale,
      scoreValue: 15,
      fireInterval: 3.4,
    });
    this.damageScale = scale;
  }

  shoot(engine) {
    this.fireAtPlayer(engine, 290, 7 * this.damageScale, 9);
  }
}
export default Shooter;
