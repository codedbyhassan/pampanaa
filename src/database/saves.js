import { getDB } from './db';
import { getActiveProfileId, getActiveProfileName, isProfileKey, profileKey } from './profiles';

function isOwnedSave(save) {
  const profileId = getActiveProfileId();
  return (profileId && save?.profileId === profileId) || isProfileKey(save?.id);
}

export async function saveGame(snapshot) {
  const db = await getDB();
  if (!db) return null;
  const record = {
    ...snapshot,
    id: profileKey('latest'),
    profile: getActiveProfileName(),
    profileId: getActiveProfileId(),
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

export async function savePreset(snapshot, presetName = 'New Preset') {
  const db = await getDB();
  if (!db) return null;
  const preset = {
    id: profileKey(`preset-${Date.now()}`),
    profile: getActiveProfileName(),
    profileId: getActiveProfileId(),
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
  return allSaves.filter((save) => !save.isAutoSave && isOwnedSave(save)).sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
}

export async function loadPreset(presetId) {
  const db = await getDB();
  if (!db || !isOwnedSave({ id: presetId, profileId: getActiveProfileId() })) return null;
  return (await db.get('savedGames', presetId)) || null;
}

export async function overwritePreset(presetId, snapshot) {
  const db = await getDB();
  if (!db || !isOwnedSave({ id: presetId, profileId: getActiveProfileId() })) return null;
  const existing = await db.get('savedGames', presetId);
  if (!existing || existing.isAutoSave) return null;
  const updated = {
    ...existing,
    ...snapshot,
    id: presetId,
    profile: getActiveProfileName(),
    profileId: getActiveProfileId() || existing.profileId,
    presetName: existing.presetName,
    timestamp: Date.now(),
    isAutoSave: false,
  };
  await db.put('savedGames', updated);
  return updated;
}

export async function updatePresetName(presetId, newName) {
  const db = await getDB();
  if (!db || !isOwnedSave({ id: presetId, profileId: getActiveProfileId() })) return null;
  const preset = await db.get('savedGames', presetId);
  if (!preset || preset.isAutoSave) return null;
  const updated = { ...preset, presetName: String(newName || '').trim().slice(0, 40) || preset.presetName };
  await db.put('savedGames', updated);
  return updated;
}

export async function deletePreset(presetId) {
  const db = await getDB();
  if (!db || !isOwnedSave({ id: presetId, profileId: getActiveProfileId() })) return;
  await db.delete('savedGames', presetId);
}
