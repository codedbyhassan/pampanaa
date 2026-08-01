export class ScreenShake {
  constructor() {
    this.duration = 0;
    this.magnitude = 0;
    this.x = 0;
    this.y = 0;
    this.enabled = true;
  }

  trigger(magnitude = 6, duration = 0.25) {
    if (!this.enabled) return;
    this.magnitude = Math.max(this.magnitude, magnitude);
    this.duration = Math.max(this.duration, duration);
  }

  update(dt) {
    if (this.duration <= 0) {
      this.x = 0;
      this.y = 0;
      this.magnitude = 0;
      return;
    }
    this.duration -= dt;
    const m = this.magnitude * Math.max(0, this.duration / 0.25);
    this.x = (Math.random() - 0.5) * 2 * m;
    this.y = (Math.random() - 0.5) * 2 * m;
  }

  reset() {
    this.duration = 0;
    this.magnitude = 0;
    this.x = 0;
    this.y = 0;
  }
}

export default ScreenShake;
