import { createPlayerProgression, recordProgressionEvent } from '../../domain/player/playerProgression';

export function createProgressionService({ onEvent } = {}) {
  let progression = null;
  const emit = (type, payload = {}) => onEvent?.(type, payload);

  return Object.freeze({
    initialize(input = {}) {
      progression = createPlayerProgression(input);
      emit('PROGRESSION_INITIALIZED', { progression });
      return progression;
    },

    applyEvent(event) {
      if (!progression) progression = createPlayerProgression({ profileId: event?.profileId });
      const next = recordProgressionEvent(progression, event);
      if (next !== progression) {
        progression = next;
        emit('PROGRESSION_UPDATED', { progression, event });
      }
      return progression;
    },

    getProgression: () => progression,
  });
}
