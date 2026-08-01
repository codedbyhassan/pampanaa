import Enemy from '../Enemy';

export class Splitter extends Enemy {
  constructor(x, y, scale = 1, isSplit = false) {
    super({
      type: 'Splitter',
      x,
      y,
      size: isSplit ? 20 : 36,
      speed: isSplit ? 170 : 165,
      health: (isSplit ? 20 : 55) * scale,
      contactDamage: (isSplit ? 5 : 10) * scale,
      scoreValue: isSplit ? 8 : 20,
      fireInterval: isSplit ? 0 : 4.5,
    });
    this.isSplit = isSplit;
    this.scale = scale;
    this.damageScale = scale;
  }

  shoot(engine) {
    this.fireAtPlayer(engine, 240, 6 * this.damageScale, 8);
  }

  /**
   * Children inherit the parent's slot so the formation stays intact; the last
   * one to die simply leaves a gap. Split instances never split again.
   */
  onDeath(engine) {
    if (this.isSplit) return;
    const offsets = [-0.06, 0.06];
    offsets.forEach((dx, i) => {
      const child = new Splitter(this.x + i * 30 - 15, this.y, this.scale, true);
      if (this.slot) child.assignSlot({ ...this.slot, ox: this.slot.ox + dx }, 0);
      engine.enemies.push(child);
    });
  }
}
export default Splitter;
