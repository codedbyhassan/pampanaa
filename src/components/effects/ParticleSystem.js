import { ObjectPool } from '../../utils/objectPool';
import { PARTICLE_POOL_SIZE } from '../../utils/constants';

function makeParticle() {
  return { active: false, x: 0, y: 0, vx: 0, vy: 0, life: 0, maxLife: 1, size: 3, color: '#fff' };
}

export class ParticleSystem {
  constructor() {
    this.pool = new ObjectPool(makeParticle, PARTICLE_POOL_SIZE);
    this.reducedMotion = false;
  }

  emitOne({ x, y, vx, vy, life, size, color }) {
    const p = this.pool.acquire();
    p.active = true;
    p.x = x;
    p.y = y;
    p.vx = vx;
    p.vy = vy;
    p.life = life;
    p.maxLife = life;
    p.size = size;
    p.color = color;
  }

  burst(x, y, color, count = 8, power = 190) {
    const n = this.reducedMotion ? Math.max(2, Math.round(count / 4)) : count;
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2;
      const speed = power * (0.4 + Math.random() * 0.8);
      this.emitOne({
        x,
        y,
        vx: Math.cos(a) * speed,
        vy: Math.sin(a) * speed,
        life: 0.35 + Math.random() * 0.3,
        size: 2 + Math.random() * 3,
        color,
      });
    }
  }

  update(dt) {
    this.pool.forEachActive((p) => {
      p.life -= dt;
      if (p.life <= 0) {
        p.active = false;
        return;
      }
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vx *= 1 - 2 * dt;
      p.vy *= 1 - 2 * dt;
    });
  }

  draw(ctx) {
    this.pool.forEachActive((p) => {
      ctx.globalAlpha = Math.max(0, p.life / p.maxLife);
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
    });
    ctx.globalAlpha = 1;
  }

  clear() {
    this.pool.releaseAll();
  }
}

export default ParticleSystem;
