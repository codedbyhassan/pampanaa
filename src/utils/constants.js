/**
 * WORLD is mutable on purpose: the playfield fills the viewport, so its size is
 * recomputed whenever the canvas is (re)sized. Every module imports the same
 * object reference and therefore always reads current dimensions.
 */
export const WORLD = { width: 960, height: 600 };

export const MIN_WORLD = { width: 320, height: 260 };

export function setWorldSize(width, height) {
  WORLD.width = Math.max(MIN_WORLD.width, Math.round(width));
  WORLD.height = Math.max(MIN_WORLD.height, Math.round(height));
  return WORLD;
}

export const SHOW_FPS = false;

export const PLAYER = {
  maxHealth: 100,
  speed: 300,
  width: 34,
  height: 34,
};

export const PROJECTILE_POOL_SIZE = 300;
export const PARTICLE_POOL_SIZE = 400;
export const DAMAGE_NUMBER_POOL_SIZE = 80;
export const PICKUP_POOL_SIZE = 24;

/** Pickups drift down toward the player instead of sitting where they dropped. */
export const PICKUP_FALL_SPEED = 130;
export const PICKUP_DRIFT = 90;
export const PICKUP_MAGNET_RADIUS = 150;

/**
 * Formation choreography. Each wave spawns a fixed squad that flies in along an
 * entry path, locks into a pattern, and sways together — nothing ever chases
 * the player. Clearing the squad advances the wave.
 */
export const FORMATIONS = ['grid', 'vee', 'arc', 'diamond', 'columns', 'rings'];

export const WAVES = [
  { wave: 1, formation: 'grid', rows: 2, cols: 6, roster: ['Chaser'], fireRateMul: 0.5 },
  { wave: 2, formation: 'vee', rows: 2, cols: 7, roster: ['Chaser', 'Shooter'], fireRateMul: 0.7 },
  { wave: 3, formation: 'arc', rows: 2, cols: 8, roster: ['Chaser', 'Shooter', 'Tank'], fireRateMul: 0.8 },
  {
    wave: 4,
    formation: 'diamond',
    rows: 3,
    cols: 7,
    roster: ['Swarmer', 'Chaser', 'Shooter', 'Tank'],
    fireRateMul: 0.9,
  },
];

export function getWaveConfig(wave) {
  const explicit = WAVES.find((w) => w.wave === wave);
  if (explicit) return { statScale: 1, ...explicit };

  const step = wave - WAVES.length;
  return {
    wave,
    formation: FORMATIONS[(wave - 1) % FORMATIONS.length],
    rows: Math.min(4, 3 + Math.floor(step / 6)),
    cols: Math.min(9, 7 + Math.floor(step / 4)),
    roster: ['Swarmer', 'Chaser', 'Shooter', 'Tank', 'Splitter'],
    fireRateMul: Math.min(1.6, 0.9 + step * 0.05),
    statScale: 1 + step * 0.1,
  };
}

export const DIFFICULTY = {
  easy: { statMul: 0.7, fireMul: 0.65, swayMul: 0.8 },
  normal: { statMul: 1, fireMul: 1, swayMul: 1 },
  hard: { statMul: 1.3, fireMul: 1.35, swayMul: 1.25 },
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

/** Selectable interface skins — applied as data-ui-theme on the app root. */
export const UI_THEMES = {
  nebula: { label: 'Nebula', swatch: '#5ee6a8' },
  sunset: { label: 'Sunset', swatch: '#ff8a5c' },
  arcade: { label: 'Arcade', swatch: '#ffd54a' },
  frost: { label: 'Frost', swatch: '#7bd3ff' },
};

export const UI_THEME_KEYS = Object.keys(UI_THEMES);

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
