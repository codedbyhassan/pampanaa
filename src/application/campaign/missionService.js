import { createMissionRuntime, isMissionComplete, MISSION_STATES, updateMissionObjective } from '../../domain/campaign/missionRuntime';

export function createMissionService({ onEvent } = {}) {
  let mission = null;
  const emit = (type, payload = {}) => onEvent?.(type, payload);

  return Object.freeze({
    start(input = {}) {
      mission = createMissionRuntime({ ...input, state: MISSION_STATES.ACTIVE, startedAt: new Date().toISOString() });
      emit('MISSION_STARTED', { mission });
      return mission;
    },

    updateObjective(objectiveId, patch = {}) {
      if (!mission) return null;
      mission = updateMissionObjective(mission, objectiveId, patch);
      emit('OBJECTIVE_UPDATED', { mission, objectiveId, patch });
      if (isMissionComplete(mission)) {
        mission = createMissionRuntime({ ...mission, state: MISSION_STATES.COMPLETED, completedAt: new Date().toISOString() });
        emit('MISSION_COMPLETED', { mission });
      }
      return mission;
    },

    fail(reason = 'mission_failed') {
      if (!mission) return null;
      mission = createMissionRuntime({ ...mission, state: MISSION_STATES.FAILED, completedAt: new Date().toISOString() });
      emit('MISSION_FAILED', { mission, reason });
      return mission;
    },

    getMission: () => mission,
  });
}
