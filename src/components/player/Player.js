import { WORLD, PLAYER, SKINS } from '../../utils/constants';
import { drawShip } from '../../canvas/spriteDrawer';

export class Player {
  constructor(skin = 'default') {
    this.reset(skin);
  }

  reset(skin = 'default') {
    this.x = WORLD.width / 2;
    this.y = WORLD.height * 0.78;
    this.vx = 0;
    this.vy = 0;
    this.width = PLAYER.width;
    this.height = PLAYER.height;
    this.speed = PLAYER.speed;
    this.maxHealth = PLAYER.maxHealth;
    this.health = PLAYER.maxHealth;
    this.active = true;
    this.angle = -Math.PI / 2;
    this.skin = skin;
    this.activeBuffs = { shield: 0, rapidFire: 0, scoreMultiplier: 0 };
  }

  get color() {
    return SKINS[this.skin] || SKINS.default;
  }

  hasBuff(name) {
    return this.activeBuffs[name] > 0;
  }

  applyBuff(name, duration) {
    this.activeBuffs[name] = Math.max(this.activeBuffs[name] || 0, duration);
  }

  heal(amount) {
    this.health = Math.min(this.maxHealth, this.health + amount);
  }

  takeDamage(amount) {
    if (!this.active || this.hasBuff('shield')) return false;
    this.health = Math.max(0, this.health - amount);
    if (this.health === 0) this.active = false;
    return true;
  }

  update(dt, input) {
    for (const key of Object.keys(this.activeBuffs)) {
      if (this.activeBuffs[key] > 0) {
        this.activeBuffs[key] = Math.max(0, this.activeBuffs[key] - dt);
      }
    }

    const len = Math.hypot(input.x, input.y);
    const dirX = len > 1 ? input.x / len : input.x;
    const dirY = len > 1 ? input.y / len : input.y;

    this.vx = dirX * this.speed;
    this.vy = dirY * this.speed;

    this.x += this.vx * dt;
    this.y += this.vy * dt;

    const halfW = this.width / 2;
    const halfH = this.height / 2;
    this.x = Math.max(halfW, Math.min(WORLD.width - halfW, this.x));
    this.y = Math.max(halfH, Math.min(WORLD.height - halfH, this.y));

    if (input.aim && (input.aim.x !== 0 || input.aim.y !== 0)) {
      this.angle = Math.atan2(input.aim.y - this.y, input.aim.x - this.x);
    } else if (len > 0.01) {
      this.angle = Math.atan2(dirY, dirX);
    }
  }

  draw(ctx, time = 0) {
    if (!this.active) return;
    const thrust = Math.min(1, Math.hypot(this.vx, this.vy) / this.speed);
    drawShip(ctx, this.x, this.y, this.width, this.angle, this.color, {
      thrust,
      time,
      shielded: this.hasBuff('shield'),
    });
  }
}

export default Player;
