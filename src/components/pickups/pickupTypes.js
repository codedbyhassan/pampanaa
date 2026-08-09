/**
 * Pickups fall to the player. Two families:
 *  - timed buffs (shield, rapid fire, score, auto-lock)
 *  - permanent amplifiers that stack for the whole run and get stronger the
 *    more you collect, and whose bullets start burning/slowing enemies.
 */
export const PICKUP_TYPES = {
  health: {
    description: 'Instantly repairs 25 hull points. Never wasted at full health — grab it anyway to deny the drop timer.',
    label: 'Repair',
    color: '#5ee6a8',
    glyph: '+',
    sound: 'pickup',
    apply: (player) => player.heal(25),
  },
  shield: {
    description: 'Absorbs all damage for 5 seconds. Ship-wide, not tied to a weapon.',
    label: 'Shield',
    color: '#7bd3ff',
    glyph: 'S',
    duration: 5,
    sound: 'shieldUp',
    apply: (player) => player.applyBuff('shield', 5),
  },
  rapidFire: {
    description: 'Halves the cooldown of every weapon for 7 seconds.',
    label: 'Rapid Fire',
    color: '#ffd166',
    glyph: 'R',
    duration: 7,
    sound: 'pickup',
    apply: (player) => player.applyBuff('rapidFire', 7),
  },
  scoreMultiplier: {
    description: 'Doubles all score earned for 9 seconds.',
    label: 'Double Score',
    color: '#ff8ad1',
    glyph: '×2',
    duration: 9,
    sound: 'pickup',
    apply: (player) => player.applyBuff('scoreMultiplier', 9),
  },
  autoLock: {
    description: 'Your fire automatically tracks the nearest enemy for 12 seconds.',
    label: 'Auto-Lock',
    color: '#8bff6b',
    glyph: '◎',
    duration: 12,
    sound: 'autolock',
    apply: (player) => player.applyBuff('autoLock', 12),
  },
  multishot: {
    description: 'Doubles the barrels of whichever weapon you are holding for 10 seconds.',
    label: 'Multi-Shot',
    color: '#ffe066',
    glyph: '×2',
    duration: 10,
    sound: 'amplify',
    apply: (player) => player.applyBuff('multishot', 10),
  },
  magnet: {
    description:
      'Tractor field for 12 seconds: every pickup on screen abandons its drift and flies straight to you, however far away it is.',
    label: 'Magnet',
    color: '#6be5ff',
    glyph: 'U',
    duration: 12,
    sound: 'shieldUp',
    apply: (player) => player.applyBuff('magnet', 12),
  },

  multishotAmp: {
    description: 'PERMANENT, WEAPON-SPECIFIC: adds one extra barrel to the equipped weapon (max 5). Flame widens its cone, Tesla gains an extra chain jump.',
    label: 'Barrel Multiplier',
    color: '#ffb703',
    glyph: '×+',
    permanent: true,
    sound: 'amplify',
    apply: (player, weaponKey) => player.addAmp('multishot', weaponKey),
  },
  damageAmp: {
    description: 'PERMANENT, WEAPON-SPECIFIC: +20% damage on the equipped weapon. Two stacks make its hits set enemies on fire.',
    label: 'Damage Amplifier',
    color: '#ff5c7a',
    glyph: '▲',
    permanent: true,
    sound: 'amplify',
    apply: (player, weaponKey) => player.addAmp('damage', weaponKey),
  },
  fireAmp: {
    description: 'PERMANENT, WEAPON-SPECIFIC: +15% fire rate on the equipped weapon. Three stacks slow enemies on hit.',
    label: 'Cadence Amplifier',
    color: '#ffa14a',
    glyph: '»',
    permanent: true,
    sound: 'amplify',
    apply: (player, weaponKey) => player.addAmp('fire', weaponKey),
  },
  pierceAmp: {
    description: 'PERMANENT, WEAPON-SPECIFIC: rounds from the equipped weapon punch through enemies instead of stopping.',
    label: 'Piercing Rounds',
    color: '#c9a2ff',
    glyph: '⌖',
    permanent: true,
    sound: 'amplify',
    apply: (player, weaponKey) => player.addAmp('pierce', weaponKey),
  },
};

/** Ordered for the codex: consumables first, then permanent amplifiers. */
export const PICKUP_CODEX_ORDER = [
  'health',
  'shield',
  'rapidFire',
  'scoreMultiplier',
  'autoLock',
  'multishot',
  'damageAmp',
  'fireAmp',
  'multishotAmp',
  'pierceAmp',
];

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

// Boss pickups: only the best amplifiers
const BOSS_PICKUPS = ['multishotAmp', 'damageAmp', 'fireAmp', 'pierceAmp', 'autoLock'];

export function randomBossPickup(wave) {
  // Wave 1-30: exclude high-tier pickups
  // Wave 30-50: autoLock available
  // Wave 50+: all pickups
  let available = BOSS_PICKUPS;
  if (wave < 15) available = ['damageAmp', 'fireAmp', 'pierceAmp'];
  else if (wave < 30) available = ['multishotAmp', 'damageAmp', 'fireAmp', 'pierceAmp'];
  return available[Math.floor(Math.random() * available.length)];
}
