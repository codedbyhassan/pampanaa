import { FACTIONS } from './threatModel';

export const THREAT_CLASSES = Object.freeze({ SKIRMISHER: 'skirmisher', SWARM: 'swarm', ASSAULT: 'assault', CONTROLLER: 'controller', SENTINEL: 'sentinel', COLOSSUS: 'colossus' });
export const BOSS_PHASES = Object.freeze({ ENTRY: 'entry', TELEGRAPH: 'telegraph', ATTACK: 'attack', VULNERABLE: 'vulnerable', CRITICAL: 'critical', DEFEATED: 'defeated' });

export const THREAT_PRESENTATIONS = Object.freeze({
  veiled_swarm: { classId: THREAT_CLASSES.SWARM, codexName: 'Veilspawn', subtitle: 'Signal-fed swarm', silhouette: 'small-fragment', motion: 'erratic', threatCue: 'density' },
  veiled_assault: { classId: THREAT_CLASSES.ASSAULT, codexName: 'Veilbreaker', subtitle: 'Perimeter assault form', silhouette: 'heavy-blade', motion: 'direct', threatCue: 'mass' },
  veiled_control: { classId: THREAT_CLASSES.CONTROLLER, codexName: 'Signal Warden', subtitle: 'Field distortion form', silhouette: 'ring-core', motion: 'deliberate', threatCue: 'field' },
  veiled_colossus: { classId: THREAT_CLASSES.COLOSSUS, codexName: 'The Colossus', subtitle: 'First known Veiled giant', silhouette: 'monolith-core', motion: 'deliberate', threatCue: 'scale', boss: true },
});

const BOSS_STORY = [
  ['Newton', 'Principia Engine', 'A Veiled intelligence reconstructing the physical laws of the dead world.'],
  ['Pythagoras', 'Right Angle Choir', 'A formation intelligence that turns the old perimeter geometry against Haven.'],
  ['Einstein', 'Relativity Core', 'A signal-distorted core where distance and timing no longer behave normally.'],
  ['Lovelace', 'Analytical Loom', 'An ancient network process weaving fragments of the lost transmission together.'],
  ['Curie', 'Radiant Lattice', 'A contaminated reactor intelligence awakened by the returning signal.'],
  ['Turing', 'Halting Machine', 'A dormant decision engine trying to determine whether humanity should continue.'],
  ['Hypatia', 'Conic Sections', 'A buried observatory intelligence defending the route into the old world.'],
  ['Ramanujan', 'Infinite Series', 'A recursive signal-form that keeps rebuilding itself from defeated fragments.'],
  ['Nietzsche', 'Eternal Return', 'A Veiled cycle that repeats the violence encoded in the Silence.'],
  ['Euclid', 'Axiom Array', 'A geometric defense system guarding the final approach to the ruins.'],
  ['Noether', 'Symmetry Engine', 'A network guardian preserving the balance of the abandoned infrastructure.'],
  ['Fibonacci', 'Golden Spiral', 'A signal pattern that grows more complex every time the Haven responds.'],
  ['Kepler', 'Elliptic Choir', 'An orbital intelligence watching the region from the remains of the old array.'],
  ['Tesla', 'Resonant Coil', 'A power system that has learned to answer the returning transmission.'],
  ['Boltzmann', 'Entropy Furnace', 'A failing reactor converting the remaining infrastructure into hostile energy.'],
  ['Gödel', 'Incompleteness', 'The final contradiction in the old network, holding the truth of the Silence.'],
];

export const BOSS_CATALOG = Object.freeze(BOSS_STORY.map(([name, title, storyRole], index) => Object.freeze({
  id: `boss_${index + 1}`,
  runtimeName: name,
  name,
  title,
  chapterId: index < 4 ? 'chapter_2' : index < 8 ? 'chapter_3' : index < 12 ? 'chapter_4' : 'chapter_5',
  regionId: index < 4 ? 'deadlands' : index < 8 ? 'frontier' : index < 12 ? 'ruins' : 'signal_zone',
  factionId: index >= 10 ? FACTIONS.ARCHITECTS : FACTIONS.VEILED,
  storyRole,
  phases: [BOSS_PHASES.TELEGRAPH, BOSS_PHASES.ATTACK, BOSS_PHASES.VULNERABLE, BOSS_PHASES.CRITICAL],
  defeatOutcome: index === BOSS_STORY.length - 1 ? 'The truth of the Silence reaches the Haven.' : 'The recovered signal fragment points deeper into the old network.',
})));

export function getThreatPresentation(id) { return THREAT_PRESENTATIONS[id] ?? null; }
export function getBossDefinition(id) { return BOSS_CATALOG.find((boss) => boss.id === id || boss.runtimeName === id || boss.name === id) ?? null; }
export function getBossDefinitionForIndex(index) { return BOSS_CATALOG[Math.max(0, index) % BOSS_CATALOG.length] ?? null; }
export function createThreatState(input = {}) {
  const definition = THREAT_PRESENTATIONS[input.threatId] ?? {};
  return Object.freeze({ threatId: input.threatId, classId: definition.classId ?? THREAT_CLASSES.ASSAULT, health: Math.max(0, Number(input.health ?? 1)), maxHealth: Math.max(1, Number(input.maxHealth ?? input.health ?? 1)), phase: input.phase ?? (definition.boss ? BOSS_PHASES.ENTRY : null), enraged: Boolean(input.enraged), active: input.active !== false });
}
