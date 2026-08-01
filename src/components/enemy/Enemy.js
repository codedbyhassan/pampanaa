import { WORLD } from '../../utils/constants';
import { drawEnemyShape } from '../../canvas/spriteDrawer';

const CONTACT_COOLDOWN = 0.7;

/**
 * Formation-based enemy. Enemies never pursue the player: they fly in from
 * off-screen, ease into a choreographed slot and then hold it while the whole
 * squad sways together. Sub-classes only vary stats and their firing pattern.
 */
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
    this.angle = Math.PI / 2;
    this.bob = Math.random() * Math.PI * 2;

    // Formation state
    this.slot = null;
    this.mode = 'free';
    this.entryDelay = 0;
    this.fireInterval = config.fireInterval ?? 0;
    this.fireTimer = (config.fireInterval ?? 0) * (0.4 + Math.random());
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

  update(dt, engine) {
    if (this.contactTimer > 0) this.contactTimer -= dt;
    this.bob += dt;

    if (this.mode === 'entering' || this.mode === 'locked') {
      if (this.entryDelay > 0) {
        this.entryDelay -= dt;
      } else {
        const target = engine.formation.slotPosition(this.slot);
        const arrived = this.seek(dt, target.x, target.y, this.mode === 'entering' ? 1.4 : 3);
        if (arrived) this.mode = 'locked';
      }
    } else {
      // Free-floating remnants (e.g. splitter children) drift gently downward.
      this.y += 70 * dt;
      this.x += Math.sin(this.bob * 2) * 30 * dt;
      if (this.y > WORLD.height + 80) this.deactivate();
    }

    if (this.mode === 'locked' && this.fireInterval > 0) {
      this.fireTimer -= dt * engine.fireRateMul;
      if (this.fireTimer <= 0) {
        this.fireTimer = this.fireInterval * (0.75 + Math.random() * 0.5);
        this.shoot(engine);
      }
    }
  }

  /** Default: unarmed. */
  // eslint-disable-next-line no-unused-vars
  shoot(engine) {}

  /** Downward shot with a gentle lead toward the player's column. */
  fireAtPlayer(engine, speed = 300, damage = 8, size = 9) {
    const dx = engine.player.x - this.x;
    const angle = Math.PI / 2 + Math.max(-0.55, Math.min(0.55, dx / 900));
    engine.spawnProjectile({
      x: this.x,
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

  draw(ctx, palette) {
    if (!this.active) return;
    const wobble = Math.sin(this.bob * 2.2) * 0.12;
    drawEnemyShape(ctx, this.type, this.x, this.y, this.width, palette[this.type], wobble);
    if (this.health < this.maxHealth && this.type !== 'Boss') {
      const w = this.width;
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.fillRect(this.x - w / 2, this.y - this.height / 2 - 9, w, 4);
      ctx.fillStyle = '#6ee7a0';
      ctx.fillRect(this.x - w / 2, this.y - this.height / 2 - 9, w * (this.health / this.maxHealth), 4);
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
