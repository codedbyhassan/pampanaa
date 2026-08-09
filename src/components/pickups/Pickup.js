import { ObjectPool } from '../../utils/objectPool';
import {
  PICKUP_POOL_SIZE,
  PICKUP_FALL_SPEED,
  PICKUP_DRIFT,
  PICKUP_MAGNET_RADIUS,
  WORLD,
} from '../../utils/constants';
import { PICKUP_TYPES, randomPickupType } from './pickupTypes';

function makePickup() {
  return { active: false, x: 0, y: 0, vx: 0, vy: 0, width: 26, height: 26, type: 'health', life: 0 };
}

/**
 * Pickups fall toward the player rather than waiting where they dropped: they
 * sink at a steady rate, drift into the player's column, and snap in once close.
 */
export class PickupSystem {
  constructor() {
    this.pool = new ObjectPool(makePickup, PICKUP_POOL_SIZE);
  }

  spawn(x, y, type) {
    const p = this.pool.acquire();
    p.active = true;
    p.x = x;
    p.y = y;
    p.vx = (Math.random() - 0.5) * 60;
    p.vy = PICKUP_FALL_SPEED * 0.5;
    p.type = type || randomPickupType();
    p.life = 14;
  }

  update(dt, player) {
    // A magnet buff turns the whole arena into pull range; otherwise pickups
    // drift down on their own and only snap in when you get close.
    const magnet = player?.hasBuff?.('magnet');
    const radius = magnet ? Number.POSITIVE_INFINITY : PICKUP_MAGNET_RADIUS;

    this.pool.forEachActive((p) => {
      p.life -= dt;

      const dx = player ? player.x - p.x : 0;
      const dy = player ? player.y - p.y : 0;
      const dist = Math.hypot(dx, dy);

      if (player && dist < radius) {
        // Magnet phase: home straight in.
        const pull = magnet ? 620 : 460;
        p.x += (dx / (dist || 1)) * pull * dt;
        p.y += (dy / (dist || 1)) * pull * dt;
      } else {
        p.vy = Math.min(PICKUP_FALL_SPEED, p.vy + 220 * dt);
        p.vx += Math.max(-1, Math.min(1, dx / 260)) * PICKUP_DRIFT * dt;
        p.vx *= 0.985;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
      }


      p.x = Math.max(14, Math.min(WORLD.width - 14, p.x));
      if (p.life <= 0 || p.y > WORLD.height + 40) p.active = false;
    });
  }

  forEachActive(fn) {
    this.pool.forEachActive(fn);
  }

  draw(ctx, time) {
    this.pool.forEachActive((p) => {
      const def = PICKUP_TYPES[p.type];
      const pulse = 1 + Math.sin(time * 5) * 0.1;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(Math.sin(time * 2 + p.x * 0.01) * 0.15);
      ctx.scale(pulse, pulse);
      ctx.globalAlpha = p.life < 3 ? 0.4 + Math.abs(Math.sin(time * 10)) * 0.6 : 1;

      ctx.shadowColor = def.color;
      ctx.shadowBlur = 16;
      ctx.fillStyle = def.color;
      ctx.beginPath();
      const r = 7;
      const s = 12;
      ctx.moveTo(-s + r, -s);
      ctx.arcTo(s, -s, s, s, r);
      ctx.arcTo(s, s, -s, s, r);
      ctx.arcTo(-s, s, -s, -s, r);
      ctx.arcTo(-s, -s, s, -s, r);
      ctx.closePath();
      ctx.fill();
      ctx.shadowBlur = 0;

      ctx.fillStyle = 'rgba(255,255,255,0.25)';
      ctx.fillRect(-s + 2, -s + 2, s * 2 - 4, 5);

      ctx.fillStyle = '#0b0f1a';
      ctx.font = 'bold 13px ui-monospace, monospace';
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
