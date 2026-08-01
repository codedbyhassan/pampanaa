import Chaser from './enemyTypes/Chaser';
import Shooter from './enemyTypes/Shooter';
import Tank from './enemyTypes/Tank';
import Swarmer from './enemyTypes/Swarmer';
import Splitter from './enemyTypes/Splitter';
import { WORLD } from '../../utils/constants';

const TYPES = { Chaser, Shooter, Tank, Swarmer, Splitter };

export function randomEdgePosition() {
  const edge = Math.floor(Math.random() * 4);
  const m = 30;
  if (edge === 0) return { x: Math.random() * WORLD.width, y: -m };
  if (edge === 1) return { x: WORLD.width + m, y: Math.random() * WORLD.height };
  if (edge === 2) return { x: Math.random() * WORLD.width, y: WORLD.height + m };
  return { x: -m, y: Math.random() * WORLD.height };
}

function pickWeighted(weights) {
  const entries = Object.entries(weights);
  const total = entries.reduce((sum, [, w]) => sum + w, 0);
  let roll = Math.random() * total;
  for (const [type, w] of entries) {
    roll -= w;
    if (roll <= 0) return type;
  }
  return entries[0][0];
}

export function createEnemy(type, x, y, scale, wave) {
  const Ctor = TYPES[type] || Chaser;
  return new Ctor(x, y, scale, wave);
}

export class EnemySpawner {
  constructor(engine) {
    this.engine = engine;
    this.timer = 1;
  }

  reset(interval) {
    this.timer = Math.min(1, interval);
  }

  update(dt) {
    const engine = this.engine;
    if (engine.spawningPaused || engine.isBossWave) return;

    this.timer -= dt;
    if (this.timer > 0) return;

    const config = engine.waveConfig;
    this.timer = config.spawnInterval * engine.difficultyMods.intervalMul;

    const type = pickWeighted(config.enemyWeights);
    const scale = engine.enemyStatScale;

    if (type === 'Swarmer') {
      const groupSize = 3 + Math.floor(Math.random() * 3);
      const base = randomEdgePosition();
      for (let i = 0; i < groupSize; i++) {
        engine.enemies.push(
          createEnemy('Swarmer', base.x + (Math.random() - 0.5) * 70, base.y + (Math.random() - 0.5) * 70, scale),
        );
      }
      return;
    }

    const pos = randomEdgePosition();
    engine.enemies.push(createEnemy(type, pos.x, pos.y, scale));
  }
}

export default EnemySpawner;
