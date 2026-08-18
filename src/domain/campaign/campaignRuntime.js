import { asString, freezeModel } from '../shared/schema';

export const CHAPTER_STATES = Object.freeze({ LOCKED: 'locked', AVAILABLE: 'available', ACTIVE: 'active', COMPLETED: 'completed' });
export const NARRATIVE_EVENT_TYPES = Object.freeze({ INTRO: 'intro', DISCOVERY: 'discovery', DIALOGUE: 'dialogue', REVELATION: 'revelation', OUTCOME: 'outcome' });

export function createNarrativeEvent(input = {}) {
  return freezeModel({
    id: asString(input.id),
    chapterId: asString(input.chapterId),
    missionId: asString(input.missionId),
    type: Object.values(NARRATIVE_EVENT_TYPES).includes(input.type) ? input.type : NARRATIVE_EVENT_TYPES.DISCOVERY,
    title: asString(input.title),
    text: asString(input.text),
    required: Boolean(input.required),
  });
}

export function createCampaignChapter(input = {}) {
  return freezeModel({
    id: asString(input.id),
    number: Number.isInteger(input.number) ? input.number : 1,
    title: asString(input.title),
    subtitle: asString(input.subtitle),
    state: Object.values(CHAPTER_STATES).includes(input.state) ? input.state : CHAPTER_STATES.LOCKED,
    missionIds: Array.isArray(input.missionIds) ? [...input.missionIds] : [],
    narrativeEventIds: Array.isArray(input.narrativeEventIds) ? [...input.narrativeEventIds] : [],
  });
}

export function createCampaignState(input = {}) {
  return freezeModel({
    id: asString(input.id, 'main'),
    activeChapterId: asString(input.activeChapterId, 'chapter_1'),
    completedChapterIds: Array.isArray(input.completedChapterIds) ? [...input.completedChapterIds] : [],
    completedMissionIds: Array.isArray(input.completedMissionIds) ? [...input.completedMissionIds] : [],
    discoveredEventIds: Array.isArray(input.discoveredEventIds) ? [...input.discoveredEventIds] : [],
    flags: { ...(input.flags ?? {}) },
  });
}

export function applyCampaignEvent(state, event) {
  if (!event?.type) return state;
  const next = { ...state };
  if (event.type === 'MISSION_COMPLETED' && event.mission?.id) {
    next.completedMissionIds = [...new Set([...next.completedMissionIds, event.mission.id])];
  }
  if (event.type === 'DISCOVERY_MADE' && event.discoveryId) {
    next.discoveredEventIds = [...new Set([...next.discoveredEventIds, event.discoveryId])];
  }
  if (event.type === 'NARRATIVE_FLAG_SET' && event.key) {
    next.flags = { ...next.flags, [event.key]: event.value };
  }
  return createCampaignState(next);
}
