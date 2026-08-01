import { WORLD } from '../../utils/constants';
import { drawEnemyShape } from '../../canvas/spriteDrawer';

const CONTACT_COOLDOWN = 0.7;

export class Enemy {
  constructor(config) {
    this.type = config.type;
    this.x = config.x;
    this.y = config.y;
    this.vx = 0;
    this.vy = 0;
    this.width = config.size;
    this.height = config.size;
    this.speed = config.speed;
    this.maxHealth = config.health;
    this.health = config.health;
    this.contactDamage = config.contactDamage;
    this.scoreValue = config.scoreValue;
    this.active = true;
    this.contactTimer = 0;
    this.angle = 0;
  }

  canContact() {
    return this.contactTimer <= 0;
  }

  onContact() {
    this.contactTimer = CONTACT_COOLDOWN;
  }

  takeDamage(amount) {
    this.health -= amount;
    if (this.health <= 0) {
      this.health = 0;
      return true;
    }
    return false;
  }

  deactivate() {
    this.active = false;
  }

  move(dt, dir) {
    this.vx = dir.x * this.speed;
    this.vy = dir.y * this.speed;
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.x = Math.max(-60, Math.min(WORLD.width + 60, this.x));
    this.y = Math.max(-60, Math.min(WORLD.height + 60, this.y));
    if (dir.x !== 0 || dir.y !== 0) this.angle = Math.atan2(dir.y, dir.x);
  }

  update(dt) {
    if (this.contactTimer > 0) this.contactTimer -= dt;
  }

  draw(ctx, palette) {
    if (!this.active) return;
    drawEnemyShape(ctx, this.type, this.x, this.y, this.width, palette[this.type], this.angle);
    if (this.health < this.maxHealth && this.type !== 'Boss') {
      const w = this.width;
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.fillRect(this.x - w / 2, this.y - this.height / 2 - 8, w, 4);
      ctx.fillStyle = '#6ee7a0';
      ctx.fillRect(this.x - w / 2, this.y - this.height / 2 - 8, w * (this.health / this.maxHealth), 4);
    }
  }

  snapshot() {
    return {
      type: this.type,
      x: Math.round(this.x),
      y: Math.round(this.y),
      health: this.health,
      maxHealth: this.maxHealth,
      isSplit: this.isSplit || false,
    };
  }
}

export default Enemy;
