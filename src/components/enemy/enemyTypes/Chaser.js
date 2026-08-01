import Enemy from '../Enemy';

/** Front-line drone. Holds formation, no weapon — pure body blocker. */
export class Chaser extends Enemy {
  constructor(x, y, scale = 1) {
    super({
      type: 'Chaser',
      x,
      y,
      size: 30,
      speed: 190,
      health: 34 * scale,
      contactDamage: 8 * scale,
      scoreValue: 10,
    });
  }
}
export default Chaser;
