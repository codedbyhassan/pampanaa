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
  speed: 320,
  width: 34,
  height: 34,
};

export const PROJECTILE_POOL_SIZE = 400;
export const PARTICLE_POOL_SIZE = 400;
export const DAMAGE_NUMBER_POOL_SIZE = 80;
export const PICKUP_POOL_SIZE = 32;

/** Pickups drift down toward the player instead of sitting where they dropped. */
export const PICKUP_FALL_SPEED = 130;
export const PICKUP_DRIFT = 90;
export const PICKUP_MAGNET_RADIUS = 170;

/**
 * Formation choreography. Each wave spawns a fixed squad that flies in along an
 * entry path, locks into a pattern, and sways together — nothing ever chases
 * the player. Clearing the squad advances the wave.
 */
export const FORMATIONS = [
  'grid',
  'vee',
  'arc',
  'diamond',
  'columns',
  'rings',
  'spiral',
  'lattice',
  'wave',
  'cross',
  'hourglass',
  'orbit',
];

/** Squad-wide choreography routines layered on top of the base pattern. */
export const CHOREOGRAPHY = [
  'sway',
  'pendulum',
  'breathe',
  'carousel',
  'tide',
  'figure8',
  'drift',
];

const ROSTER_POOL = [
  'Swarmer',
  'Chaser',
  'Shooter',
  'Tank',
  'Splitter',
  'Orbiter',
  'Pentagram',
  'Torus',
  'Lemniscate',
  'Astroid',
  'Rosette',
  'Helix',
  'Sierpinski',
  'Squircle',
];

export const WAVES = [
  { wave: 1, formation: 'grid', choreography: 'sway', rows: 2, cols: 6, roster: ['Chaser'], fireRateMul: 0.5 },
  { wave: 2, formation: 'vee', choreography: 'pendulum', rows: 2, cols: 7, roster: ['Chaser', 'Swarmer'], fireRateMul: 0.6 },
  { wave: 3, formation: 'arc', choreography: 'breathe', rows: 2, cols: 8, roster: ['Chaser', 'Shooter'], fireRateMul: 0.7 },
  { wave: 4, formation: 'diamond', choreography: 'tide', rows: 3, cols: 7, roster: ['Swarmer', 'Shooter', 'Orbiter'], fireRateMul: 0.8 },
  { wave: 6, formation: 'columns', choreography: 'carousel', rows: 3, cols: 7, roster: ['Chaser', 'Shooter', 'Tank'], fireRateMul: 0.85 },
  { wave: 7, formation: 'rings', choreography: 'figure8', rows: 2, cols: 8, roster: ['Orbiter', 'Pentagram', 'Swarmer'], fireRateMul: 0.9 },
  { wave: 8, formation: 'spiral', choreography: 'drift', rows: 3, cols: 8, roster: ['Lemniscate', 'Shooter', 'Torus'], fireRateMul: 0.95 },
  { wave: 9, formation: 'lattice', choreography: 'sway', rows: 3, cols: 8, roster: ['Astroid', 'Splitter', 'Tank'], fireRateMul: 1 },
  { wave: 11, formation: 'wave', choreography: 'tide', rows: 3, cols: 9, roster: ['Rosette', 'Helix', 'Shooter'], fireRateMul: 1.05 },
  { wave: 12, formation: 'cross', choreography: 'carousel', rows: 3, cols: 8, roster: ['Sierpinski', 'Pentagram', 'Torus'], fireRateMul: 1.1 },
  { wave: 13, formation: 'hourglass', choreography: 'breathe', rows: 4, cols: 8, roster: ['Squircle', 'Astroid', 'Tank'], fireRateMul: 1.15 },
  { wave: 14, formation: 'orbit', choreography: 'figure8', rows: 3, cols: 9, roster: ['Helix', 'Lemniscate', 'Rosette'], fireRateMul: 1.2 },
  { wave: 16, formation: 'lattice', choreography: 'drift', rows: 3, cols: 9, roster: ['Cogwheel', 'Heptagram', 'Crescent'], fireRateMul: 1.25 },
  { wave: 17, formation: 'wave', choreography: 'carousel', rows: 4, cols: 9, roster: ['Trefoil', 'Epicycle', 'Spirograph'], fireRateMul: 1.3 },
  { wave: 18, formation: 'hourglass', choreography: 'figure8', rows: 4, cols: 9, roster: ['Spirograph', 'Cogwheel', 'Squircle'], fireRateMul: 1.35 },
];

export function getWaveConfig(wave) {
  const explicit = WAVES.find((w) => w.wave === wave);
  if (explicit) return { statScale: 1 + Math.floor(wave / 5) * 0.12, ...explicit };

  const step = Math.max(0, wave - 4);
  return {
    wave,
    formation: FORMATIONS[(wave - 1) % FORMATIONS.length],
    choreography: CHOREOGRAPHY[(wave + 2) % CHOREOGRAPHY.length],
    rows: Math.min(4, 2 + Math.floor(step / 5)),
    cols: Math.min(9, 6 + Math.floor(step / 4)),
    roster: ROSTER_POOL.slice(0, Math.min(ROSTER_POOL.length, 3 + Math.floor(step / 3))),
    fireRateMul: Math.min(1.6, 0.8 + step * 0.04),
    statScale: 1 + step * 0.08,
  };
}

/**
 * A single 1–10 slider drives every fairness knob: enemy toughness, how often
 * they shoot, how fast formations move and how many ships each wave carries.
 */
export const DIFFICULTY_MIN = 1;
export const DIFFICULTY_MAX = 10;
export const DIFFICULTY_LABELS = {
  1: 'Sightseeing',
  2: 'Relaxed',
  3: 'Casual',
  4: 'Standard',
  5: 'Brisk',
  6: 'Spirited',
  7: 'Tense',
  8: 'Hostile',
  9: 'Brutal',
  10: 'Nightmare',
};

export const DIFFICULTY_DESCRIPTIONS = {
  1: 'Very easy - perfect for learning the game and practicing mechanics.',
  2: 'Relaxed gameplay - low pressure, good for casual play.',
  3: 'Casual - friendly challenge with time to think.',
  4: 'Standard - balanced, recommended difficulty for most players.',
  5: 'Brisk - getting challenging, enemies are noticeably tougher.',
  6: 'Spirited - difficult, requires sharp reflexes and strategy.',
  7: 'Tense - expert difficulty, minimal amplifier drops, enemy formations are aggressive.',
  8: 'Hostile - highly challenging, for skilled players only.',
  9: 'Brutal - extreme difficulty, expect many deaths.',
  10: 'Nightmare - only for mastery seekers, extreme enemy stats and frequency.',
};

export function difficultyMods(level = 4) {
  const l = Math.max(DIFFICULTY_MIN, Math.min(DIFFICULTY_MAX, Math.round(level)));
  const t = (l - 1) / 9; // 0..1
  return {
    level: l,
    label: DIFFICULTY_LABELS[l],
    statMul: 0.55 + t * 1.0, // enemy health / damage
    fireMul: 0.45 + t * 1.25, // projectile frequency
    swayMul: 0.6 + t * 0.9, // formation speed
    entryMul: 0.75 + t * 0.6, // fly-in speed
    densityMul: 0.7 + t * 0.6, // squad size
    pickupMul: 1.5 - t * 0.7, // generosity of drops
  };
}

export const PALETTES = {
  default: {
    player: '#5ee6a8',
    playerProjectile: '#ffe066',
    enemyProjectile: '#ff5c7a',
  },
  colorblind: {
    player: '#4cc9f0',
    playerProjectile: '#ffd166',
    enemyProjectile: '#f77f00',
  },
};

/** Full ship redesigns — geometry, not just tint. */
export const SHIP_DESIGNS = {
  interceptor: { label: 'Interceptor', color: '#5ee6a8' },
  delta: { label: 'Delta Wing', color: '#7bd3ff' },
  saucer: { label: 'Saucer', color: '#ffd54a' },
  falcon: { label: 'Falcon', color: '#ff8a5c' },
  needle: { label: 'Needle', color: '#c9a2ff' },
  manta: { label: 'Manta', color: '#ff6bd6' },
};

export const SHIP_DESIGN_KEYS = Object.keys(SHIP_DESIGNS);

export const SHIP_COLORS = {
  default: '#5ee6a8',
  aurora: '#5ee6a8',
  ice: '#7bd3ff',
  gold: '#ffd54a',
  crimson: '#ff4d6d',
  violet: '#c9a2ff',
  ember: '#ff8a5c',
};

/** Selectable interface skins — applied as data-ui-theme on the app root. */
export const SKINS = SHIP_COLORS;

/** Selectable interface skins — applied as data-ui-theme on the app root. */
export const UI_THEMES = {
  nebula: { label: 'Nebula', swatch: '#5ee6a8' },
  sunset: { label: 'Sunset', swatch: '#ff8a5c' },
  arcade: { label: 'Arcade', swatch: '#ffd54a' },
  frost: { label: 'Frost', swatch: '#7bd3ff' },
  orchid: { label: 'Orchid', swatch: '#c9a2ff' },
  graphite: { label: 'Graphite', swatch: '#9fb2c8' },
};

export const UI_THEME_KEYS = Object.keys(UI_THEMES);

export const DEFAULT_KEYMAP = {
  up: 'KeyW',
  down: 'KeyS',
  left: 'KeyA',
  right: 'KeyD',
  fire: 'Space',
};

/** Achievement thresholds — pulled into constants to eliminate magic numbers. */
export const ACHIEVEMENT_THRESHOLDS = {
  WAVE_5: 5,
  WAVE_10: 10,
  HARD_DIFFICULTY: 7,
  CENTURY_KILLS: 100,
};

export const WEAPON_UNLOCK_WAVE = {
  blaster: 0,
  shotgun: 2,
  laser: 4,
  homingMissile: 6,
  flamethrower: 8,
};
