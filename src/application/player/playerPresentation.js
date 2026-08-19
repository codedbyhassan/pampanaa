import { normaliseWardenDesign } from '../../domain/player/playerVisual';

export function createPlayerPresentation(player, weaponKey = player?.activeWeaponKey) {
  if (!player) return null;
  return Object.freeze({
    identity: 'warden',
    design: normaliseWardenDesign(player.design),
    health: player.health,
    maxHealth: player.maxHealth,
    healthRatio: player.maxHealth > 0 ? player.health / player.maxHealth : 0,
    activeWeaponKey: weaponKey ?? 'blaster',
    buffs: Object.freeze({ ...player.activeBuffs }),
    weaponAmps: Object.freeze(JSON.parse(JSON.stringify(player.weaponAmps || {}))),
    activeAmps: Object.freeze({ ...player.amps }),
    shielded: player.hasBuff('shield'),
    autoLock: player.hasBuff('autoLock'),
    moving: Math.hypot(player.vx, player.vy) > 1,
  });
}
