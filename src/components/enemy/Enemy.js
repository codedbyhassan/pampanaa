import { WORLD } from '../../utils/constants';
import { drawEnemyShape } from '../../canvas/spriteDrawer';
import { ENEMY_DEFS, enemyColor } from './enemyDefs';

const CONTACT_COOLDOWN = 0.7;

/**
 * Formation-based enemy, fully driven by ENEMY_DEFS. Enemies never pursue the
 * player: they fly in from off-screen, ease into a choreographed slot and hold
 * it while the whole squad moves together. Amplified player bullets can leave
 * burn (damage over time) and slow (fire + motion penalty) on them.
 */
export class Enemy {
  constructor(type, x, y, scale = 1, colorblind = false, sizeMul = 1) {
    const def = ENEMY_DEFS[type] || ENEMY_DEFS.Chaser;
    this.def = def;
    this.type = type;
    this.shape = def.shape;
    this.color = enemyColor(type, colorblind);
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
    this.width = def.size * sizeMul;
    this.height = def.size * sizeMul;
    this.speed = def.speed;
    this.maxHealth = Math.round(def.health * scale * sizeMul);
    this.health = this.maxHealth;
    this.armor = def.armor || 0;
    this.contactDamage = def.contact * scale;
    this.scoreValue = def.score;
    this.active = true;
    this.contactTimer = 0;
    this.angle = Math.PI / 2;
    this.spin = 0;
    this.bob = Math.random() * Math.PI * 2;
    this.sizeMul = sizeMul;

    // Status effects applied by amplified weapons.
    this.burn = 0;
    this.burnDps = 0;
    this.slow = 0;

    // Formation state
    this.slot = null;
    this.mode = 'free';
    this.entryDelay = 0;
    this.fireInterval = def.fireInterval ?? 0;
    this.fireTimer = (def.fireInterval ?? 0) * (0.4 + Math.random());
  }

  assignSlot(slot, entryDelay = 0) {
    this.slot = slot;
    this.mode = 'entering';
    this.entryDelay = entryDelay;
  }

  canContact() {
    return this.contactTimer <= 0;
  }

  onContact() {
    this.contactTimer = CONTACT_COOLDOWN;
  }

  applyBurn(dps, duration) {
    this.burnDps = Math.max(this.burnDps, dps);
    this.burn = Math.max(this.burn, duration);
  }

  applySlow(duration) {
    this.slow = Math.max(this.slow, duration);
  }

  takeDamage(amount) {
    const reduced = amount * (1 - this.armor);
    this.health -= reduced;
    if (this.health <= 0) {
      this.health = 0;
      return true;
    }
    return false;
  }

  deactivate() {
    this.active = false;
  }

  /** Moves toward an absolute point with easing; returns true once arrived. */
  seek(dt, tx, ty, speedMul = 1) {
    const dx = tx - this.x;
    const dy = ty - this.y;
    const dist = Math.hypot(dx, dy);
    if (dist < 1.5) {
      this.x = tx;
      this.y = ty;
      return true;
    }
    const step = Math.min(dist, this.speed * speedMul * dt);
    this.x += (dx / dist) * step;
    this.y += (dy / dist) * step;
    return dist < 4;
  }

  /** Per-species flourish layered on top of the slot position. */
  motionOffset() {
    const t = this.bob;
    const r = this.width * 0.55;
    switch (this.def.motion) {
      case 'orbit':
        return { x: Math.cos(t * 1.6) * r, y: Math.sin(t * 1.6) * r * 0.6 };
      case 'figure8':
        return { x: Math.sin(t * 1.4) * r * 1.4, y: Math.sin(t * 2.8) * r * 0.5 };
      case 'pulse':
        return { x: 0, y: Math.sin(t * 1.2) * r * 0.35 };
      case 'bob':
        return { x: Math.sin(t * 1.1) * r * 0.3, y: Math.cos(t * 0.9) * r * 0.2 };
      // Sharp triangle-wave slide, so the ship snaps between lanes.
      case 'zigzag': {
        const phase = (t * 0.9) % 2;
        return { x: (phase < 1 ? phase * 2 - 1 : 3 - phase * 2) * r * 1.1, y: 0 };
      }
      // Braided sine pair: horizontal weave with a slower vertical roll.
      case 'weave':
        return { x: Math.sin(t * 1.7) * r * 1.2, y: Math.sin(t * 0.7) * r * 0.5 };
      // Nervous high-frequency shudder around the slot.
      case 'jitter':
        return {
          x: (Math.sin(t * 5.1) + Math.sin(t * 2.3)) * r * 0.25,
          y: Math.sin(t * 4.3) * r * 0.2,
        };
      default:
        return { x: 0, y: 0 };
    }
  }

  update(dt, engine) {
    if (this.contactTimer > 0) this.contactTimer -= dt;
    if (this.slow > 0) this.slow -= dt;
    const slowMul = this.slow > 0 ? 0.55 : 1;
    this.bob += dt * slowMul;
    this.spin += dt * (this.def.motion === 'spin' ? 1.8 : 0.4) * slowMul;

    if (this.burn > 0) {
      this.burn -= dt;
      this.health -= this.burnDps * dt;
      if (this.health <= 0) engine.damageEnemy(this, 0, 'burn');
    }

    if (this.mode === 'entering' || this.mode === 'locked') {
      if (this.entryDelay > 0) {
        this.entryDelay -= dt;
      } else {
        const base = engine.formation.slotPosition(this.slot);
        const off = this.mode === 'locked' ? this.motionOffset() : { x: 0, y: 0 };
        const arrived = this.seek(
          dt,
          base.x + off.x,
          base.y + off.y,
          (this.mode === 'entering' ? 1.4 : 3) * slowMul,
        );
        if (arrived) this.mode = 'locked';
      }
    } else {
      this.y += 70 * dt * slowMul;
      this.x += Math.sin(this.bob * 2) * 30 * dt;
      if (this.y > WORLD.height + 80) this.deactivate();
    }

    if (this.mode === 'locked' && this.fireInterval > 0) {
      this.fireTimer -= dt * engine.fireRateMul * slowMul;
      if (this.fireTimer <= 0) {
        this.fireTimer = this.fireInterval * (0.75 + Math.random() * 0.5);
        this.shoot(engine);
      }
    }
  }

  shoot(engine) {
    const dmg = 6 + this.def.contact * 0.25;
    switch (this.def.pattern) {
      case 'aimed':
        return this.fireAtPlayer(engine, 300, dmg);
      case 'double':
        this.fireAtPlayer(engine, 320, dmg, 8, -10);
        return this.fireAtPlayer(engine, 320, dmg, 8, 10);
      case 'spread3':
        return this.fireFan(engine, 3, 0.5, 280, dmg);
      case 'radial5':
        return this.fireFan(engine, 5, 1.5, 240, dmg * 0.8);
      case 'ring8':
        return this.fireRadial(engine, 8, 190, dmg * 0.7);
      case 'burstRing':
        return this.fireRadial(engine, 12, 210, dmg * 0.65);
      case 'diagonal':
        this.fireAngle(engine, Math.PI / 2 - 0.7, 330, dmg);
        return this.fireAngle(engine, Math.PI / 2 + 0.7, 330, dmg);
      case 'radial7':
        return this.fireFan(engine, 7, 2.1, 230, dmg * 0.7);
      // Horizontal curtain of slow rounds the player has to slip through.
      case 'wall5': {
        for (let i = -2; i <= 2; i++) {
          this.fireAngle(engine, Math.PI / 2, 200, dmg * 0.6, 8);
          const last = engine.lastProjectile;
          if (last) last.x = this.x + i * this.width * 0.55;
        }
        return undefined;
      }
      // Two counter-rotating spiral arms.
      case 'twinSpiral': {
        const a = this.bob * 2.4;
        this.fireAngle(engine, a, 250, dmg * 0.7);
        return this.fireAngle(engine, a + Math.PI, 250, dmg * 0.7);
      }
      // Four-way cross that slowly rotates with the body spin.
      case 'cross4': {
        for (let i = 0; i < 4; i++) {
          this.fireAngle(engine, this.spin + (i * Math.PI) / 2, 220, dmg * 0.65);
        }
        return undefined;
      }
      // Wide sweeping beam-like arc that tracks left to right over time.
      case 'sweep': {
        const a = Math.PI / 2 + Math.sin(this.bob * 0.8) * 1.3;
        this.fireAngle(engine, a, 320, dmg);
        return this.fireAngle(engine, a + 0.22, 320, dmg);
      }
      // Heavy, slow arcing shell.
      case 'lob':
        return this.fireAtPlayer(engine, 170, dmg * 1.6, 16);
      case 'spiralShot': {
        const a = Math.PI / 2 + Math.sin(this.bob * 2) * 1.1;
        return this.fireAngle(engine, a, 300, dmg);
      }
      default:
        return undefined;
    }
  }

  fireAngle(engine, angle, speed, damage, size = 9) {
    engine.spawnProjectile({
      x: this.x + Math.cos(angle) * this.width * 0.4,
      y: this.y + Math.sin(angle) * this.height * 0.4,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      width: size,
      height: size,
      damage,
      color: engine.palette.enemyProjectile,
      source: 'enemy',
      life: 6,
    });
  }

  fireFan(engine, count, spread, speed, damage) {
    const base = Math.PI / 2;
    for (let i = 0; i < count; i++) {
      const t = count === 1 ? 0 : i / (count - 1) - 0.5;
      this.fireAngle(engine, base + t * spread, speed, damage);
    }
  }

  fireRadial(engine, count, speed, damage) {
    for (let i = 0; i < count; i++) {
      this.fireAngle(engine, (i / count) * Math.PI * 2, speed, damage, 8);
    }
  }

  /** Downward shot with a gentle lead toward the player's column. */
  fireAtPlayer(engine, speed = 300, damage = 8, size = 9, offsetX = 0) {
    const dx = engine.player.x - this.x;
    const angle = Math.PI / 2 + Math.max(-0.55, Math.min(0.55, dx / 900));
    engine.spawnProjectile({
      x: this.x + offsetX,
      y: this.y + this.height / 2,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      width: size,
      height: size,
      damage,
      color: engine.palette.enemyProjectile,
      source: 'enemy',
      life: 6,
    });
  }

  draw(ctx) {
    if (!this.active) return;
    const rot = this.def.motion === 'spin' ? this.spin : Math.sin(this.bob * 2.2) * 0.12;
    drawEnemyShape(ctx, this.shape, this.x, this.y, this.width, this.color, rot);

    if (this.burn > 0) {
      ctx.save();
      ctx.globalAlpha = 0.45 + Math.sin(this.bob * 14) * 0.2;
      ctx.strokeStyle = '#ff8a3d';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.width * 0.66, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
    if (this.slow > 0) {
      ctx.save();
      ctx.globalAlpha = 0.4;
      ctx.strokeStyle = '#7bd3ff';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 5]);
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.width * 0.78, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    if (this.health < this.maxHealth) {
      const w = this.width;
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.fillRect(this.x - w / 2, this.y - this.height / 2 - 9, w, 4);
      ctx.fillStyle = '#6ee7a0';
      ctx.fillRect(this.x - w / 2, this.y - this.height / 2 - 9, w * (this.health / this.maxHealth), 4);
    }
  }

  onDeath(engine) {
    const split = this.def.split;
    if (!split || this.isSplit) return;
    for (let i = 0; i < split.count; i++) {
      const child = engine.createEnemy(split.type, this.x + (i - (split.count - 1) / 2) * 22, this.y, 0.7);
      child.isSplit = true;
      child.mode = 'free';
      engine.enemies.push(child);
    }
  }

  snapshot() {
    return {
      type: this.type,
      x: Math.round(this.x),
      y: Math.round(this.y),
      health: this.health,
      maxHealth: this.maxHealth,
      slot: this.slot,
      isSplit: this.isSplit || false,
    };
  }
}

export default Enemy;
