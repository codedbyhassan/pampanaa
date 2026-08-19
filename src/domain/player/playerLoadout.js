export const WEAPON_KEYS = Object.freeze({ BLASTER: 'blaster', SHOTGUN: 'shotgun', LASER: 'laser', HOMING_MISSILE: 'homingMissile', FLAMETHROWER: 'flamethrower', TESLA_ARC: 'teslaArc', CRYO_LANCE: 'cryoLance' });
export const AMP_KEYS = Object.freeze({ DAMAGE: 'damage', FIRE: 'fire', PIERCE: 'pierce', MULTISHOT: 'multishot' });
export const BUFF_KEYS = Object.freeze({ SHIELD: 'shield', RAPID_FIRE: 'rapidFire', SCORE_MULTIPLIER: 'scoreMultiplier', AUTO_LOCK: 'autoLock', MULTISHOT: 'multishot', MAGNET: 'magnet' });
export const PICKUP_KEYS = Object.freeze({ REPAIR: 'health', SHIELD: 'shield', RAPID_FIRE: 'rapidFire', SCORE_MULTIPLIER: 'scoreMultiplier', AUTO_LOCK: 'autoLock', MULTISHOT: 'multishot', MAGNET: 'magnet', DAMAGE_AMP: 'damageAmp', FIRE_AMP: 'fireAmp', PIERCE_AMP: 'pierceAmp', MULTISHOT_AMP: 'multishotAmp' });

export const WEAPON_CATALOG = Object.freeze({
  [WEAPON_KEYS.BLASTER]: Object.freeze({ id: 'blaster', name: 'Blaster', family: 'kinetic', cadence: 'balanced' }),
  [WEAPON_KEYS.SHOTGUN]: Object.freeze({ id: 'shotgun', name: 'Shotgun', family: 'kinetic', cadence: 'burst' }),
  [WEAPON_KEYS.LASER]: Object.freeze({ id: 'laser', name: 'Laser', family: 'photon', cadence: 'rapid' }),
  [WEAPON_KEYS.HOMING_MISSILE]: Object.freeze({ id: 'homingMissile', name: 'Homing Missile', family: 'explosive', cadence: 'heavy' }),
  [WEAPON_KEYS.FLAMETHROWER]: Object.freeze({ id: 'flamethrower', name: 'Flamethrower', family: 'fire', cadence: 'continuous' }),
  [WEAPON_KEYS.TESLA_ARC]: Object.freeze({ id: 'teslaArc', name: 'Tesla Arc', family: 'electric', cadence: 'chain' }),
  [WEAPON_KEYS.CRYO_LANCE]: Object.freeze({ id: 'cryoLance', name: 'Cryo Lance', family: 'ice', cadence: 'burst' }),
});

export const PICKUP_CATALOG = Object.freeze({
  [PICKUP_KEYS.REPAIR]: Object.freeze({ id: 'health', name: 'Repair', category: 'recovery', duration: 0 }),
  [PICKUP_KEYS.SHIELD]: Object.freeze({ id: 'shield', name: 'Shield', category: 'defense', duration: 5 }),
  [PICKUP_KEYS.RAPID_FIRE]: Object.freeze({ id: 'rapidFire', name: 'Rapid Fire', category: 'temporary', duration: 7 }),
  [PICKUP_KEYS.SCORE_MULTIPLIER]: Object.freeze({ id: 'scoreMultiplier', name: 'Double Score', category: 'temporary', duration: 9 }),
  [PICKUP_KEYS.AUTO_LOCK]: Object.freeze({ id: 'autoLock', name: 'Auto-Lock', category: 'tactical', duration: 12 }),
  [PICKUP_KEYS.MULTISHOT]: Object.freeze({ id: 'multishot', name: 'Multi-Shot', category: 'temporary', duration: 10 }),
  [PICKUP_KEYS.MAGNET]: Object.freeze({ id: 'magnet', name: 'Magnet', category: 'tactical', duration: 12 }),
  [PICKUP_KEYS.DAMAGE_AMP]: Object.freeze({ id: 'damageAmp', name: 'Damage Amplifier', category: 'weapon', amp: AMP_KEYS.DAMAGE, duration: 0 }),
  [PICKUP_KEYS.FIRE_AMP]: Object.freeze({ id: 'fireAmp', name: 'Cadence Amplifier', category: 'weapon', amp: AMP_KEYS.FIRE, duration: 0 }),
  [PICKUP_KEYS.PIERCE_AMP]: Object.freeze({ id: 'pierceAmp', name: 'Piercing Rounds', category: 'weapon', amp: AMP_KEYS.PIERCE, duration: 0 }),
  [PICKUP_KEYS.MULTISHOT_AMP]: Object.freeze({ id: 'multishotAmp', name: 'Barrel Multiplier', category: 'weapon', amp: AMP_KEYS.MULTISHOT, duration: 0 }),
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
