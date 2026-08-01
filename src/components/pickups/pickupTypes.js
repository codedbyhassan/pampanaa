export const PICKUP_TYPES = {
  health: { label: 'Health Pack', color: '#5ee6a8', glyph: '+', apply: (player) => player.heal(20) },
  shield: {
    label: 'Shield',
    color: '#7bd3ff',
    glyph: 'S',
    duration: 4,
    apply: (player) => player.applyBuff('shield', 4),
  },
  rapidFire: {
    label: 'Rapid Fire',
    color: '#ffd166',
    glyph: 'R',
    duration: 6,
    apply: (player) => player.applyBuff('rapidFire', 6),
  },
  scoreMultiplier: {
    label: 'Double Score',
    color: '#ff8ad1',
    glyph: '×2',
    duration: 8,
    apply: (player) => player.applyBuff('scoreMultiplier', 8),
  },
};

export const PICKUP_KEYS = Object.keys(PICKUP_TYPES);
