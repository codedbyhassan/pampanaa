import { getDB } from './db';
import { getActiveProfileName, isProfileKey, profileKey } from './profiles';

function isOwnedSave(save) {
  return isProfileKey(save?.id);
}

// Auto-save to the latest preset for quick continue.
export async function saveGame(snapshot) {
  const db = await getDB();
  if (!db) return null;

  const record = {
    ...snapshot,
    id: profileKey('latest'),
    profile: getActiveProfileName(),
    presetName: 'Latest Session',
    timestamp: Date.now(),
    isAutoSave: true,
  };

  await db.put('savedGames', record);
  return record;
}

export async function loadLatestSave() {
  const db = await getDB();
  if (!db) return null;
  return (await db.get('savedGames', profileKey('latest'))) || null;
}

export async function clearSave() {
  const db = await getDB();
  if (!db) return;
  await db.delete('savedGames', profileKey('latest'));
}

// Preset system: multiple saves per profile.
export async function savePreset(snapshot, presetName = 'New Preset') {
  const db = await getDB();
  if (!db) return null;

  const preset = {
    id: profileKey(`preset-${Date.now()}`),
    profile: getActiveProfileName(),
    presetName: String(presetName || 'New Preset').trim().slice(0, 40) || 'New Preset',
    ...snapshot,
    timestamp: Date.now(),
    isAutoSave: false,
  };

  await db.put('savedGames', preset);
  return preset;
}

export async function listPresets() {
  const db = await getDB();
  if (!db) return [];

  const allSaves = await db.getAll('savedGames');
  return allSaves
    .filter((save) => !save.isAutoSave && isOwnedSave(save))
    .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
}

export async function loadPreset(presetId) {
  const db = await getDB();
  if (!db || !isOwnedSave({ id: presetId })) return null;
  return (await db.get('savedGames', presetId)) || null;
}

/** Writes a snapshot over an existing slot, keeping its id and name. */
export async function overwritePreset(presetId, snapshot) {
  const db = await getDB();
  if (!db || !isOwnedSave({ id: presetId })) return null;

  const existing = await db.get('savedGames', presetId);
  if (!existing || existing.isAutoSave) return null;

  const updated = {
    ...existing,
    ...snapshot,
    id: presetId,
    profile: getActiveProfileName(),
    presetName: existing.presetName,
    timestamp: Date.now(),
    isAutoSave: false,
  };

  await db.put('savedGames', updated);
  return updated;
}

export async function updatePresetName(presetId, newName) {
  const db = await getDB();
  if (!db || !isOwnedSave({ id: presetId })) return null;

  const preset = await db.get('savedGames', presetId);
  if (!preset || preset.isAutoSave) return null;

  const updated = {
    ...preset,
    presetName: String(newName || '').trim().slice(0, 40) || preset.presetName,
  };
  await db.put('savedGames', updated);
  return updated;
}

export async function deletePreset(presetId) {
  const db = await getDB();
  if (!db || !isOwnedSave({ id: presetId })) return;
  await db.delete('savedGames', presetId);
}
