import { FACTIONS, THREAT_ROLES, WORLD_REGIONS, createFaction, createThreatType, createWorldRegion } from './threatModel';

export const FACTION_CATALOG = Object.freeze([
  createFaction({ id: FACTIONS.HAVEN, name: 'The Haven', alignment: 'human', description: 'The surviving settlement of Pampanaa.' }),
  createFaction({ id: FACTIONS.WANDERERS, name: 'The Wanderers', alignment: 'unknown', description: 'Survivors moving between the dead zones.' }),
  createFaction({ id: FACTIONS.VEILED, name: 'The Veiled', alignment: 'hostile', description: 'The hostile presence emerging around the returning signal.' }),
  createFaction({ id: FACTIONS.ARCHITECTS, name: 'The Architects', alignment: 'unknown', description: 'An ancient intelligence connected to the world's lost network.' }),
]);

export const REGION_CATALOG = Object.freeze([
  createWorldRegion({ id: WORLD_REGIONS.HAVEN, name: 'The Haven', description: 'The last known human settlement.', connectedRegionIds: [WORLD_REGIONS.DEADLANDS], unlocked: true }),
  createWorldRegion({ id: WORLD_REGIONS.DEADLANDS, name: 'The Deadlands', description: 'The silent territory beyond the settlement perimeter.', connectedRegionIds: [WORLD_REGIONS.HAVEN, WORLD_REGIONS.FRONTIER], unlocked: false }),
  createWorldRegion({ id: WORLD_REGIONS.FRONTIER, name: 'The Frontier', description: 'A dangerous boundary where the old world begins to surface.', connectedRegionIds: [WORLD_REGIONS.DEADLANDS, WORLD_REGIONS.RUINS], unlocked: false }),
  createWorldRegion({ id: WORLD_REGIONS.RUINS, name: 'The Ruins', description: 'Remnants of the civilization that disappeared.', connectedRegionIds: [WORLD_REGIONS.FRONTIER, WORLD_REGIONS.SIGNAL_ZONE], unlocked: false }),
  createWorldRegion({ id: WORLD_REGIONS.SIGNAL_ZONE, name: 'The Signal Zone', description: 'The source region of the returning transmission.', connectedRegionIds: [WORLD_REGIONS.RUINS], unlocked: false }),
]);

export const THREAT_CATALOG = Object.freeze([
  createThreatType({ id: 'veiled_swarm', factionId: FACTIONS.VEILED, name: 'Veiled Swarm', role: THREAT_ROLES.SWARM, health: 20, speed: 1.2, damage: 5 }),
  createThreatType({ id: 'veiled_assault', factionId: FACTIONS.VEILED, name: 'Veiled Assault', role: THREAT_ROLES.ASSAULT, health: 60, speed: 0.8, damage: 12 }),
  createThreatType({ id: 'veiled_control', factionId: FACTIONS.VEILED, name: 'Veiled Controller', role: THREAT_ROLES.CONTROL, health: 45, speed: 0.5, damage: 8 }),
  createThreatType({ id: 'veiled_colossus', factionId: FACTIONS.VEILED, name: 'Veiled Colossus', role: THREAT_ROLES.BOSS, health: 500, speed: 0.25, damage: 30 }),
]);
