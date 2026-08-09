import { WORLD } from '../../utils/constants';
import Vector2D from '../physics/Vector2D';

export class Projectile {
  constructor() {
    this.active = false;
    this.x = 0;
    this.y = 0;
    this.vx = 0;
    this.vy = 0;
    this.width = 6;
    this.height = 6;
    this.damage = 0;
    this.life = 0;
    this.source = 'player';
    this.color = '#fff';
    this.weaponKey = 'blaster';
    this.homing = false;
    this.piercing = false;
    this.target = null;
  }

  spawn(config) {
    Object.assign(this, config);
    this.active = true;
    this.life = config.life ?? 2;
    this.target = null;
  }

  deactivate() {
    this.active = false;
    this.target = null;
  }

  update(dt, engine) {
    this.life -= dt;
    if (this.life <= 0) {
      this.deactivate();
      return;
    }

    if (this.homing) {
      if (!this.target || !this.target.active) this.target = engine.findNearestEnemy(this.x, this.y);
      if (this.target) {
        const desired = Vector2D.normalize({
          x: this.target.x - this.x,
          y: this.target.y - this.y,
        });
        const speed = Math.hypot(this.vx, this.vy) || 1;
        const steer = 3.5 * dt;
        const nx = this.vx / speed + desired.x * steer;
        const ny = this.vy / speed + desired.y * steer;
        const n = Vector2D.normalize({ x: nx, y: ny });
        this.vx = n.x * speed;
        this.vy = n.y * speed;
      }
    }

    this.x += this.vx * dt;
    this.y += this.vy * dt;

    if (this.x < -40 || this.x > WORLD.width + 40 || this.y < -40 || this.y > WORLD.height + 40) {
      this.deactivate();
    }
  }

  draw(ctx) {
    if (!this.active) return;
    // Rounds are drawn with a dark rim, a saturated body and a white-hot core
    // so they stay readable over bright nebulae as well as black space.
    const w = Math.max(9, this.width * 1.6);
    const h = Math.max(5, this.height * 1.15);
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(Math.atan2(this.vy, this.vx));

    ctx.globalAlpha = 0.35;
    ctx.fillStyle = this.color;
    ctx.shadowColor = this.color;
    ctx.shadowBlur = 18;
    ctx.beginPath();
    ctx.ellipse(0, 0, w * 0.9, h * 1.5, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.globalAlpha = 1;
    ctx.shadowBlur = 10;
    ctx.strokeStyle = 'rgba(4,8,18,0.85)';
    ctx.lineWidth = 2;
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.roundRect(-w / 2, -h / 2, w, h, h / 2);
    ctx.fill();
    ctx.stroke();

    ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(255,255,255,0.95)';
    ctx.beginPath();
    ctx.roundRect(-w * 0.28, -h * 0.22, w * 0.56, h * 0.44, h * 0.22);
    ctx.fill();
    ctx.restore();
  }

}

export default Projectile;
