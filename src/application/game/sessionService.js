import { createGameSession, SESSION_STATES } from '../../domain/game/sessionModel';
import { ENCOUNTER_STATES, createEncounter } from '../../domain/game/encounterModel';

export function createSessionService({ onEvent } = {}) {
  let session = null;
  let encounter = null;

  const emit = (name, payload = {}) => onEvent?.(name, payload);

  return Object.freeze({
    start(input = {}) {
      session = createGameSession(input);
      emit('SESSION_STARTED', { session });
      return session;
    },

    startEncounter(input = {}) {
      if (!session) throw new Error('A game session must exist before an encounter starts.');
      encounter = createEncounter({ ...input, sessionId: session.id, state: ENCOUNTER_STATES.ACTIVE });
      emit('ENCOUNTER_STARTED', { encounter });
      return encounter;
    },

    completeEncounter(result = {}) {
      if (!encounter) return null;
      encounter = createEncounter({ ...encounter, ...result, state: ENCOUNTER_STATES.COMPLETED });
      emit('ENCOUNTER_COMPLETED', { encounter });
      return encounter;
    },

    failEncounter(result = {}) {
      if (!encounter) return null;
      encounter = createEncounter({ ...encounter, ...result, state: ENCOUNTER_STATES.FAILED });
      emit('ENCOUNTER_FAILED', { encounter });
      return encounter;
    },

    end(outcome = 'completed') {
      if (!session) return null;
      const state = outcome === 'failed' ? SESSION_STATES.FAILED : SESSION_STATES.COMPLETED;
      session = createGameSession({ ...session, state, endedAt: new Date().toISOString() });
      emit('SESSION_ENDED', { session });
      return session;
    },

    getSession: () => session,
    getEncounter: () => encounter,
  });
}
