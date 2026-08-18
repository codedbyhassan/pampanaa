import { DOMAIN_SCHEMA_VERSION, asBoolean, asInteger, asNonNegativeNumber, asString, freezeModel } from '../shared/schema';

export const GAME_SESSION_SCHEMA_VERSION = DOMAIN_SCHEMA_VERSION;
export const GAME_SESSION_STATUSES = Object.freeze(['idle', 'ready', 'running', 'paused', 'completed', 'failed']);

export function createGameSession(input = {}) {
  if (!input.profileId) throw new Error('A game session requires profileId ownership.');

  const status = GAME_SESSION_STATUSES.includes(input.status) ? input.status : 'ready';
  return freezeModel({
    sessionId: asString(input.sessionId),
    profileId: input.profileId,
    mode: asString(input.mode, 'campaign') || 'campaign',
    wave: Math.max(1, asInteger(input.wave, 1)),
    score: asNonNegativeNumber(input.score),
    status,
    startedAt: input.startedAt || null,
    endedAt: input.endedAt || null,
    elapsedMs: asNonNegativeNumber(input.elapsedMs),
    isPaused: asBoolean(input.isPaused),
    schemaVersion: GAME_SESSION_SCHEMA_VERSION,
  });
}

export function startGameSession(input = {}) {
  return createGameSession({ ...input, status: 'running', startedAt: input.startedAt || new Date().toISOString(), isPaused: false });
}

export function pauseGameSession(session) {
  return createGameSession({ ...session, status: 'paused', isPaused: true });
}

export function resumeGameSession(session) {
  return createGameSession({ ...session, status: 'running', isPaused: false });
}

export function finishGameSession(session, status = 'completed') {
  return createGameSession({ ...session, status, endedAt: new Date().toISOString(), isPaused: false });
}
