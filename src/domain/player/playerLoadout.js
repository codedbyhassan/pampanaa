export const WEAPON_KEYS = Object.freeze({ BLASTER: 'blaster', PULSE: 'pulse', ARC: 'arc' });
export const AMP_KEYS = Object.freeze({ DAMAGE: 'damage', FIRE: 'fire', PIERCE: 'pierce', MULTISHOT: 'multishot' });
export const BUFF_KEYS = Object.freeze({ SHIELD: 'shield', RAPID_FIRE: 'rapidFire', SCORE_MULTIPLIER: 'scoreMultiplier', AUTO_LOCK: 'autoLock', MULTISHOT: 'multishot', MAGNET: 'magnet' });
export const PICKUP_KEYS = Object.freeze({ REPAIR: 'repair', SHIELD: 'shield', RAPID_FIRE: 'rapidFire', SCORE_MULTIPLIER: 'scoreMultiplier', AUTO_LOCK: 'autoLock', MAGNET: 'magnet', DAMAGE_AMP: 'damageAmp', FIRE_AMP: 'fireAmp', PIERCE_AMP: 'pierceAmp', MULTISHOT_AMP: 'multishotAmp' });

export const WEAPON_CATALOG = Object.freeze({
  [WEAPON_KEYS.BLASTER]: Object.freeze({ id: WEAPON_KEYS.BLASTER, name: 'Blaster', family: 'kinetic', cadence: 'balanced', description: 'The Warden standard weapon.' }),
  [WEAPON_KEYS.PULSE]: Object.freeze({ id: WEAPON_KEYS.PULSE, name: 'Pulse', family: 'energy', cadence: 'rapid', description: 'A fast energy weapon built for sustained pressure.' }),
  [WEAPON_KEYS.ARC]: Object.freeze({ id: WEAPON_KEYS.ARC, name: 'Arc', family: 'energy', cadence: 'heavy', description: 'A heavier discharge with deliberate timing.' }),
});

export const PICKUP_CATALOG = Object.freeze({
  [PICKUP_KEYS.REPAIR]: Object.freeze({ id: PICKUP_KEYS.REPAIR, name: 'Repair', category: 'recovery', duration: 0 }),
  [PICKUP_KEYS.SHIELD]: Object.freeze({ id: PICKUP_KEYS.SHIELD, name: 'Shield', category: 'defense', duration: 8 }),
  [PICKUP_KEYS.RAPID_FIRE]: Object.freeze({ id: PICKUP_KEYS.RAPID_FIRE, name: 'Rapid Fire', category: 'temporary', duration: 8 }),
  [PICKUP_KEYS.SCORE_MULTIPLIER]: Object.freeze({ id: PICKUP_KEYS.SCORE_MULTIPLIER, name: 'Score Multiplier', category: 'temporary', duration: 10 }),
  [PICKUP_KEYS.AUTO_LOCK]: Object.freeze({ id: PICKUP_KEYS.AUTO_LOCK, name: 'Auto-Lock', category: 'tactical', duration: 10 }),
  [PICKUP_KEYS.MAGNET]: Object.freeze({ id: PICKUP_KEYS.MAGNET, name: 'Magnet', category: 'tactical', duration: 10 }),
  [PICKUP_KEYS.DAMAGE_AMP]: Object.freeze({ id: PICKUP_KEYS.DAMAGE_AMP, name: 'Damage Amp', category: 'weapon', amp: AMP_KEYS.DAMAGE, duration: 0 }),
  [PICKUP_KEYS.FIRE_AMP]: Object.freeze({ id: PICKUP_KEYS.FIRE_AMP, name: 'Fire Amp', category: 'weapon', amp: AMP_KEYS.FIRE, duration: 0 }),
  [PICKUP_KEYS.PIERCE_AMP]: Object.freeze({ id: PICKUP_KEYS.PIERCE_AMP, name: 'Pierce Amp', category: 'weapon', amp: AMP_KEYS.PIERCE, duration: 0 }),
  [PICKUP_KEYS.MULTISHOT_AMP]: Object.freeze({ id: PICKUP_KEYS.MULTISHOT_AMP, name: 'Multishot Amp', category: 'weapon', amp: AMP_KEYS.MULTISHOT, duration: 0 }),
});

export function createPlayerLoadout(input = {}) {
  const activeWeaponKey = WEAPON_CATALOG[input.activeWeaponKey] ? input.activeWeaponKey : WEAPON_KEYS.BLASTER;
  const weaponAmps = {};
  for (const key of Object.keys(WEAPON_CATALOG)) weaponAmps[key] = { damage: 0, fire: 0, pierce: 0, multishot: 0, ...(input.weaponAmps?.[key] ?? {}) };
  return Object.freeze({ activeWeaponKey, weaponAmps: Object.freeze(weaponAmps) });
}

export function createPlayerBuffState(input = {}) {
  return Object.freeze(Object.fromEntries(Object.values(BUFF_KEYS).map((key) => [key, Math.max(0, Number(input[key] ?? 0))])));
}
