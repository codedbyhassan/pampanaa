import { WORLD } from '../../utils/constants';
import Chaser from './enemyTypes/Chaser';
import Shooter from './enemyTypes/Shooter';
import Tank from './enemyTypes/Tank';
import Swarmer from './enemyTypes/Swarmer';
import Splitter from './enemyTypes/Splitter';

const TYPES = { Chaser, Shooter, Tank, Swarmer, Splitter };

export function createEnemy(type, x, y, scale, wave) {
  const Ctor = TYPES[type] || Chaser;
  return new Ctor(x, y, scale, wave);
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
      const count = cols;
      const radius = 0.35 + r * 0.32;
      for (let c = 0; c < count; c++) {
        const a = (c / count) * Math.PI * 2;
        slots.push({ row: r, ox: Math.cos(a) * radius, oy: 1.2 + Math.sin(a) * radius * 1.6 });
      }
    }
    return slots;
  },
};

/**
 * Owns the choreography: builds the squad for a wave, holds each member in its
 * slot, and sways the whole formation left/right like a marching band.
 */
export class FormationManager {
  constructor(engine) {
    this.engine = engine;
    this.time = 0;
    this.swayAmplitude = 0.16;
    this.rowGap = 62;
    this.spanRatio = 0.34;
    this.topRatio = 0.16;
  }

  get anchor() {
    const sway = Math.sin(this.time * 0.45) * WORLD.width * this.swayAmplitude * this.engine.difficultyMods.swayMul;
    const bob = Math.sin(this.time * 0.9) * 12;
    return { x: WORLD.width / 2 + sway, y: WORLD.height * this.topRatio + bob };
  }

  slotPosition(slot) {
    if (!slot) return { x: WORLD.width / 2, y: -80 };
    const anchor = this.anchor;
    const span = WORLD.width * this.spanRatio;
    return { x: anchor.x + slot.ox * span, y: anchor.y + slot.oy * this.rowGap };
  }

  update(dt) {
    this.time += dt;
  }

  /** Builds and launches the squad for the given wave config. */
  spawnWave(config, scale) {
    const build = PATTERNS[config.formation] || PATTERNS.grid;
    const slots = build(config.rows, config.cols);
    const roster = config.roster;
    const enemies = [];

    slots.forEach((slot, i) => {
      const type = roster[Math.min(roster.length - 1, slot.row) % roster.length];
      const target = this.slotPosition(slot);
      const fromLeft = i % 2 === 0;
      const enemy = createEnemy(
        type,
        fromLeft ? -70 - (i % 6) * 40 : WORLD.width + 70 + (i % 6) * 40,
        target.y * 0.4,
        scale,
      );
      enemy.assignSlot(slot, i * 0.06);
      enemies.push(enemy);
    });

    return enemies;
  }
}

export default FormationManager;
