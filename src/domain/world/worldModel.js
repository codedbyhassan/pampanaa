import { asString, freezeModel } from '../shared/schema';

export const WORLD_REGIONS = Object.freeze({
  HAVEN: 'haven',
  DEADLANDS: 'deadlands',
  FRONTIER: 'frontier',
  RUINS: 'ruins',
  SIGNAL_ZONE: 'signal-zone',
});

export const FACTIONS = Object.freeze({
  HAVEN: 'haven',
  WANDERERS: 'wanderers',
  VEILED: 'veiled',
  ARCHITECTS: 'architects',
});

export function createWorldRegion(input = {}) {
  return freezeModel({ id: asString(input.id, WORLD_REGIONS.HAVEN), name: asString(input.name, 'Pampanaa'), description: asString(input.description), schemaVersion: 1 });
}

export function createFaction(input = {}) {
  return freezeModel({ id: asString(input.id, FACTIONS.VEILED), name: asString(input.name, 'The Veiled'), alignment: asString(input.alignment, 'unknown'), schemaVersion: 1 });
}
