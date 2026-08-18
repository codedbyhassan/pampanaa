import { getDB } from './db';
import { getActiveProfileId, profileKey } from './profiles';
import { createSettings } from '../domain/settings/settingsModel';

export { DEFAULT_SETTINGS } from '../domain/settings/defaultSettings';

export async function getSettings() {
  const db = await getDB();
  if (!db) return createSettings({ profileId: getActiveProfileId() || null });
  const saved = await db.get('settings', profileKey());
  return createSettings({
    ...(saved || {}),
    profileId: saved?.profileId || getActiveProfileId() || null,
  });
}

export async function updateSettings(patch) {
  const db = await getDB();
  const current = await getSettings();
  const next = createSettings({
    ...current,
    ...patch,
    key: profileKey(),
    profileId: getActiveProfileId() || current.profileId || null,
  });
  if (db) await db.put('settings', next);
  return next;
}

export async function resetSettings() {
  const db = await getDB();
  const next = createSettings({ key: profileKey(), profileId: getActiveProfileId() || null });
  if (db) await db.put('settings', next);
  return next;
}
