import { WORLD } from '../../../utils/constants';
import { drawBossShape } from '../../../canvas/spriteDrawer';

/**
 * Named thinker-bosses. Each is a stationary-lane duel: the boss telegraphs an
 * attack, executes it, then drops its shielding and exposes a core for a fixed
 * damage window. It never hunts the player.
 */
export const BOSS_ROSTER = [
  {
    name: 'Newton',
    title: 'Principia Engine',
    glyph: 'F=ma',
    shape: 'orbital',
    color: '#ffd54a',
    attacks: ['gravityWall', 'volley'],
  },
  {
    name: 'Pythagoras',
    title: 'Right Angle Choir',
    glyph: 'a²+b²',
    shape: 'triadic',
    color: '#8bff6b',
    attacks: ['triangleFan', 'spiralArms'],
  },
  {
    name: 'Einstein',
    title: 'Relativity Core',
    glyph: 'E=mc²',
    shape: 'relativity',
    color: '#7bd3ff',
    attacks: ['lightSweep', 'ringPulse'],
  },
  {
    name: 'Lovelace',
    title: 'Analytical Loom',
    glyph: '0110',
    shape: 'loom',
    color: '#ff6bd6',
    attacks: ['binaryStream', 'volley'],
  },
  {
    name: 'Curie',
    title: 'Radiant Lattice',
    glyph: 'Ra',
    shape: 'radiant',
    color: '#c9a2ff',
    attacks: ['ringPulse', 'spiralArms'],
  },
  {
    name: 'Turing',
    title: 'Halting Machine',
    glyph: '⊨',
    shape: 'tape',
    color: '#5ee6a8',
    attacks: ['binaryStream', 'lightSweep'],
  },
  {
    name: 'Hypatia',
    title: 'Conic Sections',
    glyph: '∮',
    shape: 'conic',
    color: '#ffa14a',
    attacks: ['triangleFan', 'ringPulse'],
  },
  {
    name: 'Ramanujan',
    title: 'Infinite Series',
    glyph: '∞',
    shape: 'series',
    color: '#ff5c7a',
    attacks: ['spiralArms', 'gravityWall'],
  },
  {
    name: 'Nietzsche',
    title: 'Eternal Return',
    glyph: '⟳',
    shape: 'return',
    color: '#9fb2c8',
    attacks: ['ringPulse', 'lightSweep'],
  },
  {
    name: 'Euclid',
    title: 'Axiom Array',
    glyph: '△',
    shape: 'triadic',
    color: '#7bf1ff',
    attacks: ['triangleFan', 'binaryStream'],
  },
  {
    name: 'Noether',
    title: 'Symmetry Engine',
    glyph: '∂L',
    shape: 'orbital',
    color: '#b6ff6b',
    attacks: ['ringPulse', 'gravityWall'],
  },
  {
    name: 'Fibonacci',
    title: 'Golden Spiral',
    glyph: 'φ',
    shape: 'series',
    color: '#ffcf6b',
    attacks: ['spiralArms', 'triangleFan'],
  },
  {
    name: 'Kepler',
    title: 'Elliptic Choir',
    glyph: '☉',
    shape: 'conic',
    color: '#6bb7ff',
    attacks: ['gravityWall', 'ringPulse'],
  },
  {
    name: 'Tesla',
    title: 'Resonant Coil',
    glyph: '⚡',
    shape: 'radiant',
    color: '#9be8ff',
    attacks: ['binaryStream', 'lightSweep'],
  },
  {
    name: 'Boltzmann',
    title: 'Entropy Furnace',
    glyph: 'S=k',
    shape: 'loom',
    color: '#ff8a3d',
    attacks: ['spiralArms', 'volley'],
  },
  {
    name: 'Gödel',
    title: 'Incompleteness',
    glyph: '¬□',
    shape: 'tape',
    color: '#d0d6e0',
    attacks: ['lightSweep', 'gravityWall'],
  },
];

export function bossForWave(wave) {
  return BOSS_ROSTER[(Math.floor(wave / 5) - 1 + BOSS_ROSTER.length) % BOSS_ROSTER.length];
}

const PHASE_TIME = { telegraph: 1.4, attack: 6, vulnerable: 2.6 };

/** Bosses are duels of attrition — armoured, layered and slow to fall. */
const BASE_HEALTH = 1600;

export class Boss {
  constructor(x, y, scale = 1, wave = 5) {
    const tier = 1 + Math.floor(wave / 5) * 0.85;
    const def = bossForWave(wave);
    this.def = def;
    this.type = 'Boss';
    this.name = def.name;
    this.title = def.title;
    this.color = def.color;
    this.x = x;
    this.y = y;
    this.width = 110;
    this.height = 110;
    this.speed = 150;
    this.maxHealth = Math.round(BASE_HEALTH * scale * tier);
    this.health = this.maxHealth;
    this.contactDamage = 20 * scale;
    this.scoreValue = 300 * Math.round(tier);
    this.damageScale = scale;
    this.active = true;
    this.contactTimer = 0;
    this.bob = 0;
    this.patrol = 0;
    this.mode = 'boss';
    this.armor = 0;

    this.phase = 'telegraph';
    this.phaseTimer = PHASE_TIME.telegraph;
    this.attackIndex = 0;
    this.attack = def.attacks[0];
    this.burstTimer = 0;
    this.sweep = 0;
    this.burn = 0;
    this.slow = 0;
    this.frost = 0;
    this.freeze = 0;
    /** Second wind: below 40% the boss enrages — faster phases, harder shots. */
    this.enraged = false;
    this.shieldLayers = 1 + Math.floor(wave / 10);
  }

  applyChill(duration) {
    // Bosses resist freezing outright; ice only slows them.
    this.applySlow(duration * 0.6);
  }

  get vulnerable() {
    return this.phase === 'vulnerable';
  }

  canContact() {
    return this.contactTimer <= 0;
  }

  onContact() {
    this.contactTimer = 0.7;
  }

  applyBurn(dps, duration) {
    this.burn = Math.max(this.burn, duration);
    this.burnDps = Math.max(this.burnDps || 0, dps);
  }

  applySlow(duration) {
    this.slow = Math.max(this.slow, duration);
  }

  /** Armoured except during the exposed-core window, where hits land double. */
  takeDamage(amount) {
    // Armoured except during the exposed-core window. Extra shield layers on
    // later bosses cut incoming damage further.
    const layers = 1 + (this.shieldLayers - 1) * 0.18;
    const mul = (this.vulnerable ? 2.1 : 0.25) / layers;
    this.health -= amount * mul;
    if (this.health <= 0) {
      this.health = 0;
      return true;
    }
    return false;
  }

  deactivate() {
    this.active = false;
  }

  seek(dt, tx, ty, speedMul = 1) {
    const dx = tx - this.x;
    const dy = ty - this.y;
    const dist = Math.hypot(dx, dy);
    if (dist < 1.5) return true;
    const step = Math.min(dist, this.speed * speedMul * dt);
    this.x += (dx / dist) * step;
    this.y += (dy / dist) * step;
    return false;
  }

  nextPhase(engine) {
    if (this.phase === 'telegraph') {
      this.phase = 'attack';
      this.phaseTimer = PHASE_TIME.attack;
    } else if (this.phase === 'attack') {
      this.phase = 'vulnerable';
      this.phaseTimer = PHASE_TIME.vulnerable;
      engine.sound.play('bossVulnerable');
    } else {
      this.phase = 'telegraph';
      this.phaseTimer = PHASE_TIME.telegraph;
      this.attackIndex = (this.attackIndex + 1) % this.def.attacks.length;
      this.attack = this.def.attacks[this.attackIndex];
      engine.sound.play('bossTelegraph');
    }
    this.burstTimer = 0;
    engine.syncBoss();
  }

  update(dt, engine) {
    if (this.contactTimer > 0) this.contactTimer -= dt;
    if (this.slow > 0) this.slow -= dt;
    if (this.burn > 0) {
      this.burn -= dt;
      this.health -= (this.burnDps || 0) * dt;
    }
    this.bob += dt;
    this.patrol += dt * (this.slow > 0 ? 0.6 : 1);

    const targetY = WORLD.height * 0.2;
    const drift = this.vulnerable ? 0.12 : 0.55;
    const targetX = WORLD.width / 2 + Math.sin(this.patrol * drift) * WORLD.width * 0.3;
    this.seek(dt, targetX, targetY, 2.5);

    if (!this.enraged && this.health < this.maxHealth * 0.4) {
      this.enraged = true;
      this.speed *= 1.25;
      engine.sound.play('bossTelegraph');
    }

    this.phaseTimer -= dt * (this.enraged ? 1.25 : 1);
    if (this.phaseTimer <= 0) this.nextPhase(engine);
    if (this.phase !== 'attack') return;

    this.burstTimer -= dt;
    if (this.burstTimer > 0) return;
    this.runAttack(engine);
  }

  shot(engine, x, y, angle, speed, damage, size = 12) {
    engine.spawnProjectile({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      width: size,
      height: size,
      damage: damage * this.damageScale,
      color: engine.palette.enemyProjectile,
      source: 'enemy',
      life: 7,
    });
  }

  runAttack(engine) {
    const d = this.damageScale * (this.enraged ? 1.35 : 1);
    switch (this.attack) {
      case 'volley': {
        this.burstTimer = 0.85;
        for (const off of [-0.35, 0, 0.35]) this.shot(engine, this.x, this.y + 40, Math.PI / 2 + off, 300, 8);
        break;
      }
      case 'gravityWall': {
        this.burstTimer = 1.5;
        const gap = Math.random() * (WORLD.width - 200) + 100;
        for (let x = 30; x < WORLD.width; x += 66) {
          if (Math.abs(x - gap) < 96) continue;
          this.shot(engine, x, this.y + 30, Math.PI / 2, 190, 7, 14);
        }
        break;
      }
      case 'triangleFan': {
        this.burstTimer = 1.1;
        for (let i = 0; i < 9; i++) {
          const a = Math.PI / 2 - 0.8 + (i / 8) * 1.6;
          this.shot(engine, this.x, this.y + 30, a, 250 + (i % 3) * 40, 6);
        }
        break;
      }
      case 'spiralArms': {
        this.burstTimer = 0.12;
        this.sweep += 0.42;
        for (let arm = 0; arm < 3; arm++) {
          const a = this.sweep + (arm / 3) * Math.PI * 2;
          this.shot(engine, this.x + Math.cos(a) * 50, this.y + Math.sin(a) * 50, a, 220, 5, 10);
        }
        break;
      }
      case 'ringPulse': {
        this.burstTimer = 1.6;
        for (let i = 0; i < 18; i++) {
          const a = (i / 18) * Math.PI * 2;
          this.shot(engine, this.x + Math.cos(a) * 54, this.y + Math.sin(a) * 54, a, 210, 6, 11);
        }
        break;
      }
      case 'lightSweep': {
        this.burstTimer = 0.09;
        this.sweep += 0.1;
        const a = Math.PI / 2 + Math.sin(this.sweep) * 0.9;
        this.shot(engine, this.x, this.y + 34, a, 420, 5, 9);
        break;
      }
      case 'binaryStream': {
        this.burstTimer = 0.28;
        const side = Math.sin(this.bob * 3) > 0 ? -1 : 1;
        this.shot(engine, this.x + side * 46, this.y + 24, Math.PI / 2, 340, 6 * d, 10);
        this.shot(engine, this.x - side * 46, this.y + 24, Math.PI / 2, 340, 6 * d, 10);
        break;
      }
      default:
        this.burstTimer = 1;
    }
  }

  draw(ctx) {
    if (!this.active) return;
    drawBossShape(ctx, {
      x: this.x,
      y: this.y,
      size: this.width,
      color: this.color,
      shape: this.def.shape,
      glyph: this.def.glyph,
      phase: this.phase,
      time: this.bob,
      progress: 1 - this.phaseTimer / (PHASE_TIME[this.phase] || 1),
    });
  }

  snapshot() {
    return { type: 'Boss', x: Math.round(this.x), y: Math.round(this.y), health: this.health };
  }
}

export default Boss;
