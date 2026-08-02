/**
 * Parallax background themes. Layers are generated procedurally and drawn with
 * a time-based offset so distant layers drift slower than near ones.
 *
 * Layer kinds supported by the renderer:
 *   stars | ridge | hills | waves | dunes | buildings | trees | clouds |
 *   bubbles | rain | grain | reeds
 */
export const THEMES = {
  space: {
    name: 'Deep Space',
    group: 'Space',
    description: 'The classic void — drifting starfields at three depths.',
    background: '#080b16',
    sky: ['#0b1024', '#05070f'],
    layers: [
      { speed: 6, color: '#1b2340', kind: 'stars', count: 70, size: 2 },
      { speed: 16, color: '#2f3a63', kind: 'stars', count: 40, size: 3 },
      { speed: 34, color: '#4a5892', kind: 'stars', count: 18, size: 4 },
    ],
  },
  nebula: {
    name: 'Nebula Drift',
    group: 'Space',
    description: 'Coloured gas clouds rolling behind a dense starfield.',
    background: '#0b0620',
    sky: ['#1d0f3d', '#070312'],
    layers: [
      { speed: 4, color: '#2a1550', kind: 'clouds', count: 6, size: 220 },
      { speed: 12, color: '#3d1f6e', kind: 'clouds', count: 5, size: 160 },
      { speed: 30, color: '#8f6bd6', kind: 'stars', count: 55, size: 3 },
    ],
  },
  ocean: {
    name: 'Open Ocean',
    group: 'Water',
    description: 'Rolling swell under a bright horizon, with sea spray.',
    background: '#04283c',
    sky: ['#0d5b7a', '#03222f'],
    layers: [
      { speed: 5, color: '#0a4762', kind: 'waves', count: 5, size: 120 },
      { speed: 14, color: '#0f6285', kind: 'waves', count: 6, size: 88 },
      { speed: 32, color: '#2ba0c4', kind: 'waves', count: 7, size: 54 },
      { speed: 46, color: '#bdf0ff', kind: 'bubbles', count: 26, size: 4 },
    ],
  },
  reef: {
    name: 'Coral Reef',
    group: 'Water',
    description: 'Sunlit shallows with swaying reeds and rising bubbles.',
    background: '#03303a',
    sky: ['#0b6d74', '#022a33'],
    layers: [
      { speed: 6, color: '#0a4c52', kind: 'hills', count: 6, size: 150 },
      { speed: 18, color: '#12706b', kind: 'reeds', count: 22, size: 110 },
      { speed: 36, color: '#3fd0b0', kind: 'bubbles', count: 34, size: 5 },
    ],
  },
  abyss: {
    name: 'Midnight Abyss',
    group: 'Water',
    description: 'Deep trench darkness lit by drifting bioluminescence.',
    background: '#020d1c',
    sky: ['#062038', '#01060e'],
    layers: [
      { speed: 4, color: '#06203a', kind: 'hills', count: 5, size: 190 },
      { speed: 15, color: '#0a3358', kind: 'reeds', count: 14, size: 130 },
      { speed: 34, color: '#57e0ff', kind: 'bubbles', count: 30, size: 4 },
    ],
  },
  meadow: {
    name: 'Green Meadow',
    group: 'Land',
    description: 'Soft daytime hills, treelines and slow cumulus.',
    background: '#8fd3f4',
    sky: ['#a9e4fb', '#dff4e0'],
    layers: [
      { speed: 3, color: '#ffffff', kind: 'clouds', count: 5, size: 150 },
      { speed: 10, color: '#5b8f5a', kind: 'hills', count: 5, size: 170 },
      { speed: 22, color: '#3f7141', kind: 'hills', count: 6, size: 120 },
      { speed: 40, color: '#2b5330', kind: 'trees', count: 14, size: 90 },
    ],
  },
  forest: {
    name: 'Night Forest',
    group: 'Land',
    description: 'Layered pine silhouettes under a cold moonlit sky.',
    background: '#0a1420',
    sky: ['#16304a', '#060c14'],
    layers: [
      { speed: 5, color: '#12283c', kind: 'hills', count: 5, size: 180 },
      { speed: 16, color: '#16394a', kind: 'trees', count: 12, size: 130 },
      { speed: 36, color: '#0d2230', kind: 'trees', count: 16, size: 90 },
    ],
  },
  desert: {
    name: 'Desert Dunes',
    group: 'Land',
    description: 'Warm sand ridges rolling under a hazy sun.',
    background: '#e6b980',
    sky: ['#f6d6a8', '#e59a53'],
    layers: [
      { speed: 4, color: '#d99f63', kind: 'dunes', count: 4, size: 190 },
      { speed: 14, color: '#c07f45', kind: 'dunes', count: 5, size: 140 },
      { speed: 34, color: '#9c5f30', kind: 'dunes', count: 6, size: 90 },
      { speed: 52, color: '#f6e2c2', kind: 'grain', count: 40, size: 2 },
    ],
  },
  canyon: {
    name: 'Red Canyon',
    group: 'Land',
    description: 'Jagged mesas in three shades of iron oxide.',
    background: '#1b1008',
    sky: ['#4a2412', '#170c05'],
    layers: [
      { speed: 8, color: '#3a2413', kind: 'ridge', count: 9, size: 150 },
      { speed: 20, color: '#54331a', kind: 'ridge', count: 7, size: 105 },
      { speed: 40, color: '#71441f', kind: 'ridge', count: 5, size: 70 },
    ],
  },
  ice: {
    name: 'Ice Field',
    group: 'Land',
    description: 'Frozen shelf with drifting snow and blue glacier ridges.',
    background: '#071620',
    sky: ['#0f3a52', '#04101a'],
    layers: [
      { speed: 7, color: '#123243', kind: 'ridge', count: 8, size: 130 },
      { speed: 18, color: '#1b4a61', kind: 'stars', count: 45, size: 3 },
      { speed: 38, color: '#2f7b96', kind: 'ridge', count: 5, size: 60 },
    ],
  },
  volcanic: {
    name: 'Volcanic',
    group: 'Land',
    description: 'Basalt ridges with embers rising from the fissures.',
    background: '#180708',
    sky: ['#4a120c', '#120405'],
    layers: [
      { speed: 9, color: '#38100f', kind: 'ridge', count: 8, size: 140 },
      { speed: 22, color: '#5c1b12', kind: 'ridge', count: 6, size: 95 },
      { speed: 45, color: '#8a2c16', kind: 'bubbles', count: 30, size: 4 },
    ],
  },
  city: {
    name: 'Neon City',
    group: 'Urban',
    description: 'Skyline blocks with lit windows and a magenta haze.',
    background: '#0a0618',
    sky: ['#2a0f45', '#080312'],
    layers: [
      { speed: 6, color: '#1b1036', kind: 'buildings', count: 9, size: 210 },
      { speed: 18, color: '#2a1852', kind: 'buildings', count: 11, size: 150, windows: '#ff6bd6' },
      { speed: 38, color: '#150b28', kind: 'buildings', count: 13, size: 100, windows: '#7bd3ff' },
    ],
  },
  storm: {
    name: 'Storm Front',
    group: 'Sky',
    description: 'Heavy cloud banks and driving rain over dark hills.',
    background: '#10141c',
    sky: ['#242c3a', '#0a0d13'],
    layers: [
      { speed: 5, color: '#2b3444', kind: 'clouds', count: 6, size: 200 },
      { speed: 18, color: '#1a212c', kind: 'hills', count: 5, size: 150 },
      { speed: 60, color: '#8fa6c4', kind: 'rain', count: 60, size: 18 },
    ],
  },
  sunset: {
    name: 'Sunset Coast',
    group: 'Sky',
    description: 'Amber sky, distant headlands and a shimmering sea.',
    background: '#2a1030',
    sky: ['#ff9a5c', '#3a1140'],
    layers: [
      { speed: 4, color: '#ffca7a', kind: 'clouds', count: 5, size: 170 },
      { speed: 14, color: '#5c2352', kind: 'hills', count: 5, size: 130 },
      { speed: 34, color: '#8a2f60', kind: 'waves', count: 6, size: 70 },
    ],
  },
};

export const THEME_KEYS = Object.keys(THEMES);

/** Themes grouped by category, for the settings picker. */
export const THEME_GROUPS = THEME_KEYS.reduce((acc, key) => {
  const g = THEMES[key].group;
  (acc[g] ||= []).push(key);
  return acc;
}, {});

const ORDER = ['space', 'ocean', 'meadow', 'canyon', 'city', 'reef', 'ice', 'forest', 'storm', 'desert', 'volcanic', 'nebula', 'abyss', 'sunset'];

/**
 * @param wave      current wave number
 * @param preference 'auto' rotates through every theme; any theme key locks it.
 */
export function themeForWave(wave, preference = 'auto') {
  if (preference && preference !== 'auto' && THEMES[preference]) return THEMES[preference];
  const index = Math.floor((wave - 1) / 3) % ORDER.length;
  return THEMES[ORDER[index]];
}
