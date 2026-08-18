import { FACTION_CATALOG, REGION_CATALOG, THREAT_CATALOG } from '../../domain/world/worldCatalog';

export function createWorldService({ onEvent } = {}) {
  const emit = (type, payload = {}) => onEvent?.(type, payload);

  return Object.freeze({
    getFactions: () => FACTION_CATALOG,
    getRegions: () => REGION_CATALOG,
    getThreats: () => THREAT_CATALOG,
    getFaction: (id) => FACTION_CATALOG.find((faction) => faction.id === id) ?? null,
    getRegion: (id) => REGION_CATALOG.find((region) => region.id === id) ?? null,
    getThreat: (id) => THREAT_CATALOG.find((threat) => threat.id === id) ?? null,
    discoverRegion(id) {
      const region = REGION_CATALOG.find((item) => item.id === id);
      if (!region) return null;
      emit('REGION_DISCOVERED', { region });
      return region;
    },
  });
}
