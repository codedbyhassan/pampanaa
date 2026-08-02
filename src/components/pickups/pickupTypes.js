/**
 * Pickups fall to the player. Two families:
 *  - timed buffs (shield, rapid fire, score, auto-lock)
 *  - permanent amplifiers that stack for the whole run and get stronger the
 *    more you collect, and whose bullets start burning/slowing enemies.
 */
export const PICKUP_TYPES = {
  health: {
    label: 'Repair',
    color: '#5ee6a8',
    glyph: '+',
    sound: 'pickup',
    apply: (player) => player.heal(25),
  },
  shield: {
    label: 'Shield',
    color: '#7bd3ff',
    glyph: 'S',
    duration: 5,
    sound: 'shieldUp',
    apply: (player) => player.applyBuff('shield', 5),
  },
  rapidFire: {
    label: 'Rapid Fire',
    color: '#ffd166',
    glyph: 'R',
    duration: 7,
    sound: 'pickup',
    apply: (player) => player.applyBuff('rapidFire', 7),
  },
  scoreMultiplier: {
    label: 'Double Score',
    color: '#ff8ad1',
    glyph: '×2',
    duration: 9,
    sound: 'pickup',
    apply: (player) => player.applyBuff('scoreMultiplier', 9),
  },
  autoLock: {
    label: 'Auto-Lock',
    color: '#8bff6b',
    glyph: '◎',
    duration: 12,
    sound: 'autolock',
    apply: (player) => player.applyBuff('autoLock', 12),
  },
  multishot: {
    label: 'Multi-Shot',
    color: '#ffe066',
    glyph: '×2',
    duration: 10,
    sound: 'amplify',
    apply: (player) => player.applyBuff('multishot', 10),
  },
  multishotAmp: {
    label: 'Barrel Multiplier',
    color: '#ffb703',
    glyph: '×+',
    permanent: true,
    sound: 'amplify',
    apply: (player) => player.addAmp('multishot'),
  },
  damageAmp: {
    label: 'Damage Amplifier',
    color: '#ff5c7a',
    glyph: '▲',
    permanent: true,
    sound: 'amplify',
    apply: (player) => player.addAmp('damage'),
  },
  fireAmp: {
    label: 'Cadence Amplifier',
    color: '#ffa14a',
    glyph: '»',
    permanent: true,
    sound: 'amplify',
    apply: (player) => player.addAmp('fire'),
  },
  pierceAmp: {
    label: 'Piercing Rounds',
    color: '#c9a2ff',
    glyph: '⌖',
    permanent: true,
    sound: 'amplify',
    apply: (player) => player.addAmp('pierce'),
  },
};

export const PICKUP_KEYS = Object.keys(PICKUP_TYPES);

/** Weighted roll — amplifiers are rarer than consumables. */
const WEIGHTS = {
  health: 22,
  shield: 14,
  rapidFire: 14,
  scoreMultiplier: 10,
  autoLock: 12,
  multishot: 14,
  multishotAmp: 9,
  damageAmp: 10,
  fireAmp: 10,
  pierceAmp: 8,
};

export function randomPickupType() {
  const total = Object.values(WEIGHTS).reduce((a, b) => a + b, 0);
  let roll = Math.random() * total;
  for (const [key, weight] of Object.entries(WEIGHTS)) {
    roll -= weight;
    if (roll <= 0) return key;
  }
  return 'health';
}
