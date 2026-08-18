import { asString, freezeModel } from '../shared/schema';

export const FACTIONS = Object.freeze({
  HAVEN: 'haven',
  WANDERERS: 'wanderers',
  VEILED: 'veiled',
  ARCHITECTS: 'architects',
});

export const WORLD_REGIONS = Object.freeze({
  HAVEN: 'haven',
  DEADLANDS: 'deadlands',
  FRONTIER: 'frontier',
  RUINS: 'ruins',
  SIGNAL_ZONE: 'signal_zone',
});

export const THREAT_ROLES = Object.freeze({
  SWARM: 'swarm',
  ASSAULT: 'assault',
  SUPPORT: 'support',
  CONTROL: 'control',
  BOSS: 'boss',
});

export function createFaction(input = {}) {
  return freezeModel({
    id: asString(input.id),
    name: asString(input.name),
    alignment: asString(input.alignment, 'unknown'),
    description: asString(input.description),
  });
}

export function createThreatType(input = {}) {
  return freezeModel({
    id: asString(input.id),
    factionId: asString(input.factionId, FACTIONS.VEILED),
    name: asString(input.name),
    role: Object.values(THREAT_ROLES).includes(input.role) ? input.role : THREAT_ROLES.ASSAULT,
    health: Math.max(1, Number(input.health) || 1),
    speed: Math.max(0, Number(input.speed) || 0),
    damage: Math.max(0, Number(input.damage) || 0),
  });
}

export function createWorldRegion(input = {}) {
  return freezeModel({
    id: asString(input.id),
    name: asString(input.name),
    description: asString(input.description),
    connectedRegionIds: Array.isArray(input.connectedRegionIds) ? [...input.connectedRegionIds] : [],
    unlocked: Boolean(input.unlocked),
  });
}
