export const PROFILE_ID_PREFIX = 'pmp_';

function fallbackId() {
  return `${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

/** Generates an opaque, stable identity for a player profile. */
export function createProfileId() {
  const uuid = globalThis.crypto?.randomUUID?.();
  return `${PROFILE_ID_PREFIX}${uuid || fallbackId()}`;
}

export function normaliseProfileName(name, maxLength = 24) {
  return String(name || '')
    .trim()
    .replace(/\s+/g, ' ')
    .slice(0, maxLength);
}

export function isValidProfileId(id) {
  return typeof id === 'string' && id.startsWith(PROFILE_ID_PREFIX) && id.length > PROFILE_ID_PREFIX.length;
}
