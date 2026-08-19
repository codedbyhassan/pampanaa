import { ObjectPool } from '../../utils/objectPool';
import { PICKUP_POOL_SIZE, PICKUP_FALL_SPEED, PICKUP_DRIFT, PICKUP_MAGNET_RADIUS, WORLD } from '../../utils/constants';
import { PICKUP_TYPES, randomPickupType } from './pickupTypes';
import { drawPlayerPickup } from '../player/playerItemRenderer';

function makePickup() { return { active: false, x: 0, y: 0, vx: 0, vy: 0, width: 26, height: 26, type: 'health', life: 0 }; }

export class PickupSystem {
  constructor() { this.pool = new ObjectPool(makePickup, PICKUP_POOL_SIZE); }

  spawn(x, y, type) {
    const p = this.pool.acquire();
    p.active = true; p.x = x; p.y = y;
    p.vx = (Math.random() - 0.5) * 60; p.vy = PICKUP_FALL_SPEED * 0.5;
    p.type = type || randomPickupType(); p.life = 14;
  }

  update(dt, player) {
    const magnet = player?.hasBuff?.('magnet');
    const radius = magnet ? Number.POSITIVE_INFINITY : PICKUP_MAGNET_RADIUS;
    this.pool.forEachActive((p) => {
      p.life -= dt;
      const dx = player ? player.x - p.x : 0;
      const dy = player ? player.y - p.y : 0;
      const dist = Math.hypot(dx, dy);
      if (player && dist < radius) {
        const pull = magnet ? 620 : 460;
        p.x += (dx / (dist || 1)) * pull * dt; p.y += (dy / (dist || 1)) * pull * dt;
      } else {
        p.vy = Math.min(PICKUP_FALL_SPEED, p.vy + 220 * dt);
        p.vx += Math.max(-1, Math.min(1, dx / 260)) * PICKUP_DRIFT * dt;
        p.vx *= 0.985; p.x += p.vx * dt; p.y += p.vy * dt;
      }
      p.x = Math.max(14, Math.min(WORLD.width - 14, p.x));
      if (p.life <= 0 || p.y > WORLD.height + 40) p.active = false;
    });
  }

  forEachActive(fn) { this.pool.forEachActive(fn); }

  draw(ctx, time) {
    this.pool.forEachActive((p) => {
      if (!PICKUP_TYPES[p.type]) return;
      drawPlayerPickup(ctx, { ...p, radius: 12, lifetime: 14, age: 14 - p.life }, time);
    });
    ctx.globalAlpha = 1;
  }

  clear() { this.pool.releaseAll(); }
}

export default PickupSystem;
