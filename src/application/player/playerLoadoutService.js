import { createPlayerBuffState, createPlayerLoadout, PICKUP_CATALOG } from '../../domain/player/playerLoadout';

export function createPlayerLoadoutService({ onEvent, initialLoadout, initialBuffs } = {}) {
  let loadout = createPlayerLoadout(initialLoadout);
  let buffs = createPlayerBuffState(initialBuffs);
  const emit = (type, payload = {}) => onEvent?.(type, payload);
  const publish = () => emit('PLAYER_LOADOUT_UPDATED', { loadout, buffs });

  return Object.freeze({
    getLoadout: () => loadout,
    getBuffs: () => buffs,
    equipWeapon(key) {
      loadout = createPlayerLoadout({ ...loadout, activeWeaponKey: key, weaponAmps: loadout.weaponAmps });
      publish();
      return loadout;
    },
    applyPickup(type, weaponKey = loadout.activeWeaponKey) {
      const pickup = PICKUP_CATALOG[type];
      if (!pickup) return null;
      if (pickup.amp) {
        const amps = { ...loadout.weaponAmps, [weaponKey]: { ...loadout.weaponAmps[weaponKey], [pickup.amp]: loadout.weaponAmps[weaponKey][pickup.amp] + 1 } };
        loadout = createPlayerLoadout({ ...loadout, weaponAmps: amps });
      } else if (pickup.category === 'recovery') {
        emit('PLAYER_RECOVERY_REQUESTED', { type });
      } else if (pickup.duration > 0) {
        buffs = createPlayerBuffState({ ...buffs, [type]: pickup.duration });
      }
      emit('PLAYER_PICKUP_COLLECTED', { pickup, loadout, buffs });
      return pickup;
    },
    tick(dt) {
      buffs = createPlayerBuffState(Object.fromEntries(Object.entries(buffs).map(([key, value]) => [key, Math.max(0, value - dt)])));
      return buffs;
    },
  });
}
