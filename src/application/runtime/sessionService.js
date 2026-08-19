export function createRuntimeSessionService({ onEvent } = {}) {
  let session = null;
  const emit = (type, payload = {}) => onEvent?.(type, payload);

  return Object.freeze({
    start(input = {}) {
      session = Object.freeze({ id: input.id ?? `session_${Date.now()}`, profileId: input.profileId ?? null, missionId: input.missionId ?? null, encounterId: input.encounterId ?? null, startedAt: new Date().toISOString(), status: 'active' });
      emit('SESSION_STARTED', { session });
      return session;
    },
    complete(result = {}) {
      if (!session) return null;
      session = Object.freeze({ ...session, ...result, status: 'completed', completedAt: new Date().toISOString() });
      emit('SESSION_COMPLETED', { session });
      return session;
    },
    fail(reason = 'runtime_failed') {
      if (!session) return null;
      session = Object.freeze({ ...session, status: 'failed', failureReason: reason, completedAt: new Date().toISOString() });
      emit('SESSION_FAILED', { session });
      return session;
    },
    getSession: () => session,
  });
}
