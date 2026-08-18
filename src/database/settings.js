import { getDB } from './db';
import { getActiveProfileId, profileKey } from './profiles';
import { DEFAULT_KEYMAP } from '../utils/constants';
import { DEFAULT_SETTINGS } from '../domain/settings/defaultSettings';

export { DEFAULT_SETTINGS };

export async function getSettings() {
  const db = await getDB();
  if (!db) return { ...DEFAULT_SETTINGS, keymap: { ...DEFAULT_KEYMAP } };
  const saved = await db.get('settings', profileKey());
  return {
    ...DEFAULT_SETTINGS,
    ...(saved || {}),
    profileId: saved?.profileId || getActiveProfileId() || null,
    keymap: { ...DEFAULT_KEYMAP, ...(saved?.keymap || {}) },
  };
}

export async function updateSettings(patch) {
  const db = await getDB();
  if (!db) return { ...DEFAULT_SETTINGS, ...patch, profileId: getActiveProfileId() || null };
  const current = await getSettings();
  const next = { ...current, ...patch, key: profileKey(), profileId: getActiveProfileId() || current.profileId || null };
  await db.put('settings', next);
  return next;
}

export async function resetSettings() {
  const db = await getDB();
  const next = { ...DEFAULT_SETTINGS, key: profileKey(), profileId: getActiveProfileId() || null };
  if (db) await db.put('settings', next);
  return next;
}
