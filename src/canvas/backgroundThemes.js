/**
 * Simple flat-shape parallax themes. Layers are generated once per theme and
 * drawn with a time-based offset so distant layers drift slower.
 */
export const THEMES = {
  space: {
    name: 'Space',
    background: '#080b16',
    layers: [
      { speed: 6, color: '#1b2340', kind: 'stars', count: 70, size: 2 },
      { speed: 16, color: '#2f3a63', kind: 'stars', count: 40, size: 3 },
      { speed: 34, color: '#4a5892', kind: 'stars', count: 18, size: 4 },
    ],
  },
  canyon: {
    name: 'Canyon',
    background: '#1b1008',
    layers: [
      { speed: 8, color: '#3a2413', kind: 'ridge', count: 9, size: 150 },
      { speed: 20, color: '#54331a', kind: 'ridge', count: 7, size: 105 },
      { speed: 40, color: '#71441f', kind: 'ridge', count: 5, size: 70 },
    ],
  },
  ice: {
    name: 'Ice Field',
    background: '#071620',
    layers: [
      { speed: 7, color: '#123243', kind: 'ridge', count: 8, size: 130 },
      { speed: 18, color: '#1b4a61', kind: 'stars', count: 45, size: 3 },
      { speed: 38, color: '#2f7b96', kind: 'ridge', count: 5, size: 60 },
    ],
  },
  volcanic: {
    name: 'Volcanic',
    background: '#180708',
    layers: [
      { speed: 9, color: '#38100f', kind: 'ridge', count: 8, size: 140 },
      { speed: 22, color: '#5c1b12', kind: 'ridge', count: 6, size: 95 },
      { speed: 45, color: '#8a2c16', kind: 'stars', count: 30, size: 4 },
    ],
  },
};

const ORDER = ['space', 'canyon', 'ice', 'volcanic'];

export function themeForWave(wave) {
  const index = Math.floor((wave - 1) / 4) % ORDER.length;
  return THEMES[ORDER[index]];
}
