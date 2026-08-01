import { ObjectPool } from '../../utils/objectPool';
import { PICKUP_POOL_SIZE } from '../../utils/constants';
import { PICKUP_TYPES, PICKUP_KEYS } from './pickupTypes';

function makePickup() {
  return { active: false, x: 0, y: 0, width: 20, height: 20, type: 'health', life: 0 };
}

export class PickupSystem {
  constructor() {
    this.pool = new ObjectPool(makePickup, PICKUP_POOL_SIZE);
  }

  spawn(x, y, type) {
    const p = this.pool.acquire();
    p.active = true;
    p.x = x;
    p.y = y;
    p.type = type || PICKUP_KEYS[Math.floor(Math.random() * PICKUP_KEYS.length)];
    p.life = 12;
  }

  update(dt) {
    this.pool.forEachActive((p) => {
      p.life -= dt;
      if (p.life <= 0) p.active = false;
    });
  }

  forEachActive(fn) {
    this.pool.forEachActive(fn);
  }

  draw(ctx, time) {
    this.pool.forEachActive((p) => {
      const def = PICKUP_TYPES[p.type];
      const pulse = 1 + Math.sin(time * 5) * 0.08;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.scale(pulse, pulse);
      ctx.globalAlpha = p.life < 3 ? 0.4 + Math.abs(Math.sin(time * 10)) * 0.6 : 1;
      ctx.fillStyle = def.color;
      ctx.fillRect(-10, -10, 20, 20);
      ctx.fillStyle = '#0b0f1a';
      ctx.font = 'bold 12px ui-monospace, monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(def.glyph, 0, 1);
      ctx.restore();
    });
    ctx.globalAlpha = 1;
  }

  clear() {
    this.pool.releaseAll();
  }
}

export default PickupSystem;
