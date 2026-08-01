import Enemy from '../Enemy';

/** Tiny fast filler that packs the outer rows of a formation. */
export class Swarmer extends Enemy {
  constructor(x, y, scale = 1) {
    super({
      type: 'Swarmer',
      x,
      y,
      size: 20,
      speed: 240,
      health: 12 * scale,
      contactDamage: 4 * scale,
      scoreValue: 6,
    });
  }
}
export default Swarmer;
