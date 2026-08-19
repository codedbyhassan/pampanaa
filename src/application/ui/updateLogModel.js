export const UPDATE_TYPES = Object.freeze({ STORY: 'story', MISSION: 'mission', PROGRESSION: 'progression', SYSTEM: 'system' });

export function createUpdate(input = {}) {
  return Object.freeze({
    id: input.id ?? `update_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    type: Object.values(UPDATE_TYPES).includes(input.type) ? input.type : UPDATE_TYPES.SYSTEM,
    title: String(input.title ?? ''),
    message: String(input.message ?? ''),
    timestamp: input.timestamp ?? new Date().toISOString(),
  });
}

export function appendUpdate(log, input) {
  const next = [...(Array.isArray(log) ? log : []), createUpdate(input)];
  return next.slice(-40);
}
