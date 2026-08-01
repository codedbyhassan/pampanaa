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
    ctx.save();
    ctx.fillStyle = this.color;
    ctx.shadowColor = this.color;
    ctx.shadowBlur = 8;
    ctx.translate(this.x, this.y);
    ctx.rotate(Math.atan2(this.vy, this.vx));
    ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
    ctx.restore();
  }
}

export default Projectile;
