import { asString, freezeModel } from '../shared/schema';

export const SESSION_STATES = Object.freeze({
  RUNNING: 'running',
  PAUSED: 'paused',
  COMPLETED: 'completed',
  FAILED: 'failed',
});

export function createGameSession(input = {}) {
  const state = Object.values(SESSION_STATES).includes(input.state) ? input.state : SESSION_STATES.RUNNING;
  return freezeModel({
    id: asString(input.id, `session_${Date.now()}`),
    profileId: asString(input.profileId),
    campaignId: asString(input.campaignId, 'main'),
    missionId: asString(input.missionId, 'mission_1'),
    encounterId: asString(input.encounterId),
    state,
    startedAt: asString(input.startedAt, new Date().toISOString()),
    endedAt: input.endedAt ? asString(input.endedAt) : null,
  });
}
