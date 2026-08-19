import { WORLD } from '../../utils/constants';
import Vector2D from '../physics/Vector2D';

export class Projectile {
  constructor() {
    this.active = false;
    this.x = 0; this.y = 0; this.prevX = 0; this.prevY = 0;
    this.vx = 0; this.vy = 0; this.width = 6; this.height = 6; this.damage = 0; this.life = 0;
    this.source = 'player'; this.color = '#fff'; this.weaponKey = 'blaster';
    this.homing = false; this.piercing = false; this.target = null;
  }

  spawn(config) {
    Object.assign(this, config);
    this.active = true;
    this.life = config.life ?? 2;
    this.prevX = this.x;
    this.prevY = this.y;
    this.target = null;
  }

  deactivate() { this.active = false; this.target = null; }

  update(dt, engine) {
    this.life -= dt;
    if (this.life <= 0) { this.deactivate(); return; }

    if (this.homing) {
      if (!this.target || !this.target.active) this.target = engine.findNearestEnemy(this.x, this.y);
      if (this.target) {
        const desired = Vector2D.normalize({ x: this.target.x - this.x, y: this.target.y - this.y });
        const speed = Math.hypot(this.vx, this.vy) || 1;
        const steer = Math.min(1, 3.5 * dt);
        const n = Vector2D.normalize({ x: this.vx / speed + desired.x * steer, y: this.vy / speed + desired.y * steer });
        this.vx = n.x * speed; this.vy = n.y * speed;
      }
    }

    this.prevX = this.x;
    this.prevY = this.y;
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    if (this.x < -40 || this.x > WORLD.width + 40 || this.y < -40 || this.y > WORLD.height + 40) this.deactivate();
  }

  draw(ctx) {
    if (!this.active) return;
    const w = Math.max(8, this.width * 1.5);
    const h = Math.max(4, this.height * 1.1);
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(Math.atan2(this.vy, this.vx));
    ctx.globalAlpha = 0.22;
    ctx.fillStyle = this.color;
    ctx.fillRect(-w * 0.65, -h * 0.75, w * 1.3, h * 1.5);
    ctx.globalAlpha = 1;
    ctx.fillStyle = this.color;
    ctx.fillRect(-w / 2, -h / 2, w, h);
    ctx.fillStyle = '#fff';
    ctx.fillRect(-w * 0.2, -h * 0.18, w * 0.4, h * 0.36);
    ctx.restore();
  }
}

export default Projectile;
