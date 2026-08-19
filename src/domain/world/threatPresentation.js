import { FACTIONS, THREAT_ROLES } from './threatModel';

export const THREAT_CLASSES = Object.freeze({
  SKIRMISHER: 'skirmisher',
  SWARM: 'swarm',
  ASSAULT: 'assault',
  CONTROLLER: 'controller',
  SENTINEL: 'sentinel',
  COLOSSUS: 'colossus',
});

export const BOSS_PHASES = Object.freeze({ ENTRY: 'entry', PRESSURE: 'pressure', CRITICAL: 'critical', DEFEATED: 'defeated' });

export const THREAT_PRESENTATIONS = Object.freeze({
  veiled_swarm: { classId: THREAT_CLASSES.SWARM, codexName: 'Veilspawn', subtitle: 'Signal-fed swarm', silhouette: 'small-fragment', motion: 'erratic', threatCue: 'density' },
  veiled_assault: { classId: THREAT_CLASSES.ASSAULT, codexName: 'Veilbreaker', subtitle: 'Perimeter assault form', silhouette: 'heavy-blade', motion: 'direct', threatCue: 'mass' },
  veiled_control: { classId: THREAT_CLASSES.CONTROLLER, codexName: 'Signal Warden', subtitle: 'Field distortion form', silhouette: 'ring-core', motion: 'deliberate', threatCue: 'field' },
  veiled_colossus: { classId: THREAT_CLASSES.COLOSSUS, codexName: 'The Colossus', subtitle: 'First known Veiled giant', silhouette: 'monolith-core', motion: 'deliberate', threatCue: 'scale', boss: true },
});

export const BOSS_CATALOG = Object.freeze([
  { id: 'veiled_colossus', name: 'The Colossus', title: 'The First Giant', regionId: 'deadlands', chapterId: 'chapter_2', factionId: FACTIONS.VEILED, phases: [BOSS_PHASES.ENTRY, BOSS_PHASES.PRESSURE, BOSS_PHASES.CRITICAL], storyRole: 'The first undeniable proof that the returning signal is changing the Veiled.', defeatOutcome: 'The recovered signal record points deeper toward the Frontier.' },
  { id: 'signal_warden', name: 'The Signal Warden', title: 'Keeper of the Response', regionId: 'signal_zone', chapterId: 'chapter_3', factionId: FACTIONS.ARCHITECTS, phases: [BOSS_PHASES.ENTRY, BOSS_PHASES.PRESSURE, BOSS_PHASES.CRITICAL], storyRole: 'An ancient network guardian answering the signal from beneath the ruins.', defeatOutcome: 'The response reveals that Pampanaa was deliberately left untouched.' },
  { id: 'architect_core', name: 'The Architect Core', title: 'The Sleeping Network', regionId: 'ruins', chapterId: 'chapter_4', factionId: FACTIONS.ARCHITECTS, phases: [BOSS_PHASES.ENTRY, BOSS_PHASES.PRESSURE, BOSS_PHASES.CRITICAL], storyRole: 'The intelligence behind the silence and the old network.', defeatOutcome: 'The truth of the Silence reaches the Haven.' },
]);

export function getThreatPresentation(id) {
  return THREAT_PRESENTATIONS[id] ?? null;
}

export function getBossDefinition(id) {
  return BOSS_CATALOG.find((boss) => boss.id === id) ?? null;
}

export function createThreatState(input = {}) {
  const definition = THREAT_PRESENTATIONS[input.threatId] ?? {};
  return Object.freeze({
    threatId: input.threatId,
    classId: definition.classId ?? THREAT_CLASSES.ASSAULT,
    health: Math.max(0, Number(input.health ?? 1)),
    maxHealth: Math.max(1, Number(input.maxHealth ?? input.health ?? 1)),
    phase: input.phase ?? (definition.boss ? BOSS_PHASES.ENTRY : null),
    enraged: Boolean(input.enraged),
    active: input.active !== false,
  });
}
