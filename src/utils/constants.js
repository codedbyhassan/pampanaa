export const WORLD = { width: 960, height: 600 };

export const SHOW_FPS = false;

export const PLAYER = {
  maxHealth: 100,
  speed: 260,
  width: 28,
  height: 28,
};

export const PROJECTILE_POOL_SIZE = 300;
export const PARTICLE_POOL_SIZE = 400;
export const DAMAGE_NUMBER_POOL_SIZE = 80;
export const PICKUP_POOL_SIZE = 24;

export const MIN_SPAWN_INTERVAL = 0.35;

export const WAVES = [
  { wave: 1, spawnInterval: 1.5, killsToAdvance: 10, enemyWeights: { Chaser: 1 } },
  { wave: 2, spawnInterval: 1.3, killsToAdvance: 15, enemyWeights: { Chaser: 0.7, Shooter: 0.3 } },
  {
    wave: 3,
    spawnInterval: 1.1,
    killsToAdvance: 20,
    enemyWeights: { Chaser: 0.5, Shooter: 0.3, Tank: 0.2 },
  },
  {
    wave: 4,
    spawnInterval: 1.0,
    killsToAdvance: 24,
    enemyWeights: { Chaser: 0.4, Shooter: 0.25, Tank: 0.15, Swarmer: 0.2 },
  },
];

export function getWaveConfig(wave) {
  const explicit = WAVES.find((w) => w.wave === wave);
  if (explicit) return explicit;
  const base = WAVES[WAVES.length - 1];
  return {
    wave,
    spawnInterval: Math.max(MIN_SPAWN_INTERVAL, 1.5 - wave * 0.05),
    killsToAdvance: Math.round(base.killsToAdvance + (wave - base.wave) * 4),
    enemyWeights: {
      Chaser: 0.3,
      Shooter: 0.2,
      Tank: 0.15,
      Swarmer: 0.2,
      Splitter: 0.15,
    },
    statScale: 1 + (wave - base.wave) * 0.12,
  };
}

export const DIFFICULTY = {
  easy: { statMul: 0.75, intervalMul: 1.25 },
  normal: { statMul: 1, intervalMul: 1 },
  hard: { statMul: 1.25, intervalMul: 0.8 },
};

export const PALETTES = {
  default: {
    player: '#5ee6a8',
    playerProjectile: '#ffe066',
    enemyProjectile: '#ff5c7a',
    Chaser: '#ff5c5c',
    Shooter: '#ffa14a',
    Tank: '#b95cff',
    Swarmer: '#ff8ad1',
    Splitter: '#4ad6ff',
    Boss: '#ff2d55',
  },
  colorblind: {
    player: '#4cc9f0',
    playerProjectile: '#ffd166',
    enemyProjectile: '#f77f00',
    Chaser: '#0077b6',
    Shooter: '#f77f00',
    Tank: '#7209b7',
    Swarmer: '#00b4d8',
    Splitter: '#ffb703',
    Boss: '#d00000',
  },
};

export const SKINS = {
  default: '#5ee6a8',
  gold: '#ffd54a',
  crimson: '#ff4d6d',
};

export const DEFAULT_KEYMAP = {
  up: 'KeyW',
  down: 'KeyS',
  left: 'KeyA',
  right: 'KeyD',
  fire: 'Space',
};

export const WEAPON_UNLOCK_WAVE = {
  blaster: 0,
  shotgun: 2,
  laser: 4,
  homingMissile: 6,
  flamethrower: 8,
};
