import { asInteger, asString, freezeModel } from '../shared/schema';

export const ENCOUNTER_STATES = Object.freeze({ PENDING: 'pending', ACTIVE: 'active', RESOLVED: 'resolved', FAILED: 'failed' });

export function createEncounter(input = {}) {
  const state = Object.values(ENCOUNTER_STATES).includes(input.state) ? input.state : ENCOUNTER_STATES.PENDING;
  return freezeModel({
    id: asString(input.id, 'encounter-1'),
    missionId: asString(input.missionId, 'mission-1'),
    threatFactionId: asString(input.threatFactionId, 'veiled'),
    wave: Math.max(1, asInteger(input.wave, 1)),
    state,
    schemaVersion: 1,
  });
}
