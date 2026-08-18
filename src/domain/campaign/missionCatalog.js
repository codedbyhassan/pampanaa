import { createMissionRuntime, MISSION_STATES } from './missionRuntime';

export const MISSION_CATALOG = Object.freeze([
  createMissionRuntime({
    id: 'mission_1',
    chapterId: 'chapter_1',
    title: 'The Last Watch',
    description: 'Hold the Haven perimeter while the returning signal cuts through the static.',
    state: MISSION_STATES.AVAILABLE,
    objectives: [
      { id: 'mission_1_objective_1', title: 'Hold the perimeter', completed: false },
      { id: 'mission_1_objective_2', title: 'Survive the incoming waves', completed: false },
      { id: 'mission_1_objective_3', title: 'Investigate the signal', completed: false },
    ],
    encounterIds: ['encounter_1'],
  }),
  createMissionRuntime({
    id: 'mission_2',
    chapterId: 'chapter_2',
    title: 'Beyond the Wall',
    description: 'Enter the Frontier and find evidence of what survived the Silence.',
    state: MISSION_STATES.LOCKED,
    objectives: [
      { id: 'mission_2_objective_1', title: 'Reach the Frontier', completed: false },
      { id: 'mission_2_objective_2', title: 'Recover the abandoned signal record', completed: false },
    ],
    encounterIds: ['encounter_2'],
  }),
  createMissionRuntime({
    id: 'mission_3',
    chapterId: 'chapter_3',
    title: 'The Signal',
    description: 'Trace the transmission to its source.',
    state: MISSION_STATES.LOCKED,
    objectives: [
      { id: 'mission_3_objective_1', title: 'Trace the transmission', completed: false },
      { id: 'mission_3_objective_2', title: 'Survive the signal zone', completed: false },
    ],
    encounterIds: ['encounter_3'],
  }),
]);
