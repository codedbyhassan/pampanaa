import { asString, freezeModel } from '../shared/schema';

export const MISSION_STATES = Object.freeze({
  LOCKED: 'locked',
  AVAILABLE: 'available',
  ACTIVE: 'active',
  COMPLETED: 'completed',
  FAILED: 'failed',
});

export function createMissionRuntime(input = {}) {
  const objectives = Array.isArray(input.objectives) ? input.objectives.map((objective) => ({ ...objective })) : [];
  const completedObjectives = objectives.filter((objective) => objective.completed).length;

  return freezeModel({
    id: asString(input.id, 'mission_1'),
    chapterId: asString(input.chapterId, 'chapter_1'),
    title: asString(input.title, 'The First Watch'),
    description: asString(input.description, 'Hold the perimeter while Pampanaa prepares its defenses.'),
    state: Object.values(MISSION_STATES).includes(input.state) ? input.state : MISSION_STATES.AVAILABLE,
    objectives,
    completedObjectives,
    encounterIds: Array.isArray(input.encounterIds) ? [...input.encounterIds] : [],
    startedAt: input.startedAt ?? null,
    completedAt: input.completedAt ?? null,
  });
}

export function updateMissionObjective(mission, objectiveId, patch = {}) {
  const nextObjectives = mission.objectives.map((objective) => (
    objective.id === objectiveId ? { ...objective, ...patch } : objective
  ));
  return createMissionRuntime({
    ...mission,
    objectives: nextObjectives,
    completedObjectives: nextObjectives.filter((objective) => objective.completed).length,
  });
}

export function isMissionComplete(mission) {
  return mission.objectives.length > 0 && mission.objectives.every((objective) => objective.completed);
}
