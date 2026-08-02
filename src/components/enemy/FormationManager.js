import { WORLD } from '../../utils/constants';
import Enemy from './Enemy';

export function createEnemy(type, x, y, scale, colorblind = false, sizeMul = 1) {
  return new Enemy(type, x, y, scale, colorblind, sizeMul);
}

/** Pattern generators return slot offsets in a normalised -1..1 x space. */
const PATTERNS = {
  grid: (rows, cols) => {
    const slots = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        slots.push({ row: r, ox: (c - (cols - 1) / 2) / Math.max(1, (cols - 1) / 2), oy: r });
      }
    }
    return slots;
  },
  vee: (rows, cols) => {
    const slots = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const t = (c - (cols - 1) / 2) / Math.max(1, (cols - 1) / 2);
        slots.push({ row: r, ox: t, oy: r + Math.abs(t) * 1.6 });
      }
    }
    return slots;
  },
  arc: (rows, cols) => {
    const slots = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const t = (c - (cols - 1) / 2) / Math.max(1, (cols - 1) / 2);
        slots.push({ row: r, ox: t, oy: r + (1 - Math.cos(t * 1.2)) * 2.4 });
      }
    }
    return slots;
  },
  diamond: (rows, cols) => {
    const slots = [];
    for (let r = 0; r < rows; r++) {
      const width = cols - Math.abs(r - (rows - 1) / 2) * 2;
      const count = Math.max(2, Math.round(width));
      for (let c = 0; c < count; c++) {
        const t = count === 1 ? 0 : (c - (count - 1) / 2) / ((count - 1) / 2);
        slots.push({ row: r, ox: t * 0.9, oy: r });
      }
    }
    return slots;
  },
  columns: (rows, cols) => {
    const slots = [];
    for (let c = 0; c < cols; c++) {
      for (let r = 0; r < rows; r++) {
        const t = (c - (cols - 1) / 2) / Math.max(1, (cols - 1) / 2);
        slots.push({ row: r, ox: t, oy: r + (c % 2 ? 0.5 : 0) });
      }
    }
    return slots;
  },
  rings: (rows, cols) => {
    const slots = [];
    for (let r = 0; r < rows; r++) {
      const radius = 0.35 + r * 0.32;
      for (let c = 0; c < cols; c++) {
        const a = (c / cols) * Math.PI * 2;
        slots.push({ row: r, ox: Math.cos(a) * radius, oy: 1.2 + Math.sin(a) * radius * 1.6 });
      }
    }
    return slots;
  },
  /** Archimedean spiral: r = a·θ. */
  spiral: (rows, cols) => {
    const slots = [];
    const total = rows * cols;
    for (let i = 0; i < total; i++) {
      const th = (i / total) * Math.PI * 4;
      const rad = 0.08 + (i / total) * 0.85;
      slots.push({ row: i % rows, ox: Math.cos(th) * rad, oy: 1.1 + Math.sin(th) * rad * 1.5 });
    }
    return slots;
  },
  /** Offset (hexagonal) lattice. */
  lattice: (rows, cols) => {
    const slots = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const shift = r % 2 ? 0.5 : 0;
        const t = (c + shift - (cols - 1) / 2) / Math.max(1, (cols - 1) / 2);
        slots.push({ row: r, ox: t, oy: r * 0.9 });
      }
    }
    return slots;
  },
  /** Sine wave rows. */
  wave: (rows, cols) => {
    const slots = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const t = (c - (cols - 1) / 2) / Math.max(1, (cols - 1) / 2);
        slots.push({ row: r, ox: t, oy: r + Math.sin(t * Math.PI * 1.5) * 0.9 });
      }
    }
    return slots;
  },
  cross: (rows, cols) => {
    const slots = [];
    for (let c = 0; c < cols; c++) {
      const t = (c - (cols - 1) / 2) / Math.max(1, (cols - 1) / 2);
      slots.push({ row: 0, ox: t, oy: 1 });
      slots.push({ row: 1, ox: 0, oy: c * 0.55 });
    }
    for (let r = 0; r < rows; r++) {
      slots.push({ row: r, ox: r % 2 ? 0.55 : -0.55, oy: 1 + r * 0.6 });
    }
    return slots;
  },
  hourglass: (rows, cols) => {
    const slots = [];
    for (let r = 0; r < rows; r++) {
      const k = Math.abs(r - (rows - 1) / 2) / Math.max(0.5, (rows - 1) / 2);
      const count = Math.max(2, Math.round(cols * (0.35 + k * 0.65)));
      for (let c = 0; c < count; c++) {
        const t = count === 1 ? 0 : (c - (count - 1) / 2) / ((count - 1) / 2);
        slots.push({ row: r, ox: t, oy: r });
      }
    }
    return slots;
  },
  /** Concentric ellipses, planet-and-moons style. */
  orbit: (rows, cols) => {
    const slots = [];
    for (let r = 0; r < rows; r++) {
      const rad = 0.3 + r * 0.3;
      const count = cols + r * 2;
      for (let c = 0; c < count; c++) {
        const a = (c / count) * Math.PI * 2 + r * 0.4;
        slots.push({ row: r, ox: Math.cos(a) * rad, oy: 1.2 + Math.sin(a) * rad * 1.2 });
      }
    }
    return slots;
  },
};

/**
 * Squad-wide choreography. Each routine returns an anchor offset so the whole
 * formation moves as one — no individual enemy ever tracks the player.
 */
const ROUTINES = {
  sway: (t, w) => ({ x: Math.sin(t * 0.45) * w * 0.16, y: Math.sin(t * 0.9) * 12, scale: 1, rot: 0 }),
  pendulum: (t, w) => ({ x: Math.sin(t * 0.7) * w * 0.22, y: Math.abs(Math.cos(t * 0.7)) * 26, scale: 1, rot: Math.sin(t * 0.7) * 0.12 }),
  breathe: (t, w) => ({ x: Math.sin(t * 0.3) * w * 0.08, y: 0, scale: 1 + Math.sin(t * 0.8) * 0.22, rot: 0 }),
  carousel: (t, w) => ({ x: Math.cos(t * 0.5) * w * 0.14, y: Math.sin(t * 0.5) * 30, scale: 1, rot: t * 0.25 }),
  tide: (t, w) => ({ x: Math.sin(t * 0.35) * w * 0.26, y: Math.sin(t * 1.4) * 18, scale: 1 + Math.sin(t * 0.5) * 0.1, rot: 0 }),
  figure8: (t, w) => ({ x: Math.sin(t * 0.6) * w * 0.2, y: Math.sin(t * 1.2) * 34, scale: 1, rot: Math.sin(t * 0.6) * 0.2 }),
  drift: (t, w) => ({ x: Math.sin(t * 0.22) * w * 0.3, y: Math.sin(t * 0.44) * 22, scale: 1 + Math.sin(t * 0.33) * 0.14, rot: Math.sin(t * 0.22) * 0.1 }),
};

/**
 * Owns the choreography: builds the squad for a wave, holds each member in its
 * slot, and moves the whole formation as a single marching body.
 */
export class FormationManager {
  constructor(engine) {
    this.engine = engine;
    this.time = 0;
    this.routine = 'sway';
    this.rowGap = 62;
    this.spanRatio = 0.34;
    this.topRatio = 0.16;
  }

  get motion() {
    const swayMul = this.engine.difficultyMods.swayMul;
    const fn = ROUTINES[this.routine] || ROUTINES.sway;
    const m = fn(this.time * swayMul, WORLD.width);
    return {
      x: WORLD.width / 2 + m.x,
      y: WORLD.height * this.topRatio + m.y,
      scale: m.scale,
      rot: m.rot,
    };
  }

  get anchor() {
    const m = this.motion;
    return { x: m.x, y: m.y };
  }

  slotPosition(slot) {
    if (!slot) return { x: WORLD.width / 2, y: -80 };
    const m = this.motion;
    const span = WORLD.width * this.spanRatio * m.scale;
    const ox = slot.ox * span;
    const oy = slot.oy * this.rowGap * m.scale;
    const cos = Math.cos(m.rot);
    const sin = Math.sin(m.rot);
    return { x: m.x + ox * cos - oy * sin, y: m.y + ox * sin + oy * cos };
  }

  update(dt) {
    this.time += dt;
  }

  /** Builds and launches the squad for the given wave config. */
  spawnWave(config, scale) {
    const build = PATTERNS[config.formation] || PATTERNS.grid;
    this.routine = config.choreography && ROUTINES[config.choreography] ? config.choreography : 'sway';
    const density = this.engine.difficultyMods.densityMul;
    let slots = build(config.rows, config.cols);
    if (density < 1) {
      const keep = Math.max(4, Math.round(slots.length * density));
      slots = slots.filter((_, i) => i % Math.ceil(slots.length / keep) === 0 || i < keep).slice(0, keep);
    }

    const roster = config.roster;
    const enemies = [];
    const entryMul = this.engine.difficultyMods.entryMul;

    slots.forEach((slot, i) => {
      const type = roster[Math.min(roster.length - 1, slot.row) % roster.length];
      const target = this.slotPosition(slot);
      const fromLeft = i % 2 === 0;
      const enemy = this.engine.createEnemy(
        type,
        fromLeft ? -70 - (i % 6) * 40 : WORLD.width + 70 + (i % 6) * 40,
        target.y * 0.4,
        scale,
      );
      enemy.assignSlot(slot, (i * 0.06) / entryMul);
      enemies.push(enemy);
    });

    return enemies;
  }
}

export default FormationManager;
