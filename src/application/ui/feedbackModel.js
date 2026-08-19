export const FEEDBACK_TYPES = Object.freeze({ INFO: 'info', SUCCESS: 'success', WARNING: 'warning', ERROR: 'error', STORY: 'story' });

export function createFeedback(input = {}) {
  return Object.freeze({
    id: input.id ?? `feedback_${Date.now()}`,
    type: Object.values(FEEDBACK_TYPES).includes(input.type) ? input.type : FEEDBACK_TYPES.INFO,
    title: String(input.title ?? ''),
    message: String(input.message ?? ''),
    duration: Number.isFinite(input.duration) ? Math.max(0, input.duration) : 3500,
    createdAt: new Date().toISOString(),
  });
}
