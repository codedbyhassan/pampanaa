import { asInteger, asString, freezeModel } from '../shared/schema';

export const CAMPAIGN_SCHEMA_VERSION = 2;

export const CHAPTERS = Object.freeze([
  { id: 'chapter-1', number: 1, title: 'The Silence' },
  { id: 'chapter-2', number: 2, title: 'The Frontier' },
  { id: 'chapter-3', number: 3, title: 'The Signal' },
  { id: 'chapter-4', number: 4, title: 'The Truth' },
  { id: 'chapter-5', number: 5, title: 'Pampanaa' },
]);

export const MISSION_STATES = Object.freeze({ LOCKED: 'locked', AVAILABLE: 'available', ACTIVE: 'active', COMPLETED: 'completed', FAILED: 'failed' });

export function createCampaignStage(input = {}) {
  const from = Math.max(1, asInteger(input.from, 1));
  const to = Math.max(from, asInteger(input.to, from));
  return freezeModel({ id: asInteger(input.id, 1), name: asString(input.name, 'Campaign Stage'), from, to, blurb: asString(input.blurb), schemaVersion: CAMPAIGN_SCHEMA_VERSION });
}

export function createMission(input = {}) {
  const title = asString(input.title, 'Mission');
  const objective = asString(input.objective, 'Hold the perimeter.');
  const state = Object.values(MISSION_STATES).includes(input.state) ? input.state : MISSION_STATES.AVAILABLE;
  return freezeModel({ id: asString(input.id, 'mission-1'), chapterId: asString(input.chapterId, 'chapter-1'), title, objective, state, schemaVersion: CAMPAIGN_SCHEMA_VERSION });
}

export function createCampaignProgress(input = {}) {
  return freezeModel({
    campaignId: asString(input.campaignId, 'main') || 'main',
    currentChapterId: asString(input.currentChapterId, 'chapter-1'),
    currentMissionId: asString(input.currentMissionId, ''),
    currentWave: Math.max(1, asInteger(input.currentWave, 1)),
    unlockedWave: Math.max(1, asInteger(input.unlockedWave, 1)),
    completedMissionIds: [...new Set(Array.isArray(input.completedMissionIds) ? input.completedMissionIds.map(String) : [])],
    discoveredIds: [...new Set(Array.isArray(input.discoveredIds) ? input.discoveredIds.map(String) : [])],
    schemaVersion: CAMPAIGN_SCHEMA_VERSION,
  });
}
