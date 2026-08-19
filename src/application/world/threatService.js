import { THREAT_CATALOG } from '../../domain/world/worldCatalog';
import { BOSS_CATALOG, getThreatPresentation, createThreatState } from '../../domain/world/threatPresentation';

export function createThreatService({ onEvent } = {}) {
  const emit = (type, payload = {}) => onEvent?.(type, payload);
  return Object.freeze({
    getThreats: () => THREAT_CATALOG,
    getThreat: (id) => THREAT_CATALOG.find((item) => item.id === id) ?? null,
    getPresentation: (id) => getThreatPresentation(id),
    getBosses: () => BOSS_CATALOG,
    getBoss: (id) => BOSS_CATALOG.find((boss) => boss.id === id) ?? null,
    createState: (input) => createThreatState(input),
    beginBoss(bossId) {
      const boss = BOSS_CATALOG.find((item) => item.id === bossId);
      if (!boss) return null;
      emit('BOSS_ENTERED', { boss });
      return boss;
    },
    updateBossPhase(boss, phase) {
      if (!boss) return null;
      emit('BOSS_PHASE_CHANGED', { boss, phase });
      return { ...boss, phase };
    },
    defeatBoss(boss) {
      if (!boss) return null;
      emit('BOSS_DEFEATED', { boss });
      return boss;
    },
  });
}
