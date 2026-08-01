import { ObjectPool } from '../../utils/objectPool';
import { DAMAGE_NUMBER_POOL_SIZE } from '../../utils/constants';

function makeNumber() {
  return { active: false, x: 0, y: 0, life: 0, text: '', color: '#fff' };
}

const LIFETIME = 0.6;

export class DamageNumbers {
  constructor() {
    this.pool = new ObjectPool(makeNumber, DAMAGE_NUMBER_POOL_SIZE);
  }

  spawn(x, y, amount, color = '#ffe066') {
    const n = this.pool.acquire();
    n.active = true;
    n.x = x + (Math.random() - 0.5) * 12;
    n.y = y;
    n.life = LIFETIME;
    n.text = `−${Math.round(amount)}`;
    n.color = color;
  }

  update(dt) {
    this.pool.forEachActive((n) => {
      n.life -= dt;
      if (n.life <= 0) {
        n.active = false;
        return;
      }
      n.y -= 40 * dt;
    });
  }

  draw(ctx) {
    ctx.save();
    ctx.font = 'bold 14px ui-monospace, monospace';
    ctx.textAlign = 'center';
    this.pool.forEachActive((n) => {
      ctx.globalAlpha = Math.max(0, n.life / LIFETIME);
      ctx.fillStyle = n.color;
      ctx.fillText(n.text, n.x, n.y);
    });
    ctx.restore();
  }

  clear() {
    this.pool.releaseAll();
  }
}

export default DamageNumbers;
