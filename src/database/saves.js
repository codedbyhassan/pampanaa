import { getDB } from './db';
import { getActiveProfileId, getActiveProfileName, isProfileKey, profileKey } from './profiles';
import { createLatestSave, createPresetSave, createSave, normalisePresetName } from '../domain/saves/saveModel';

function isOwnedSave(save) {
  const profileId = getActiveProfileId();
  return Boolean((profileId && save?.profileId === profileId) || isProfileKey(save?.id));
}

export async function saveGame(snapshot) {
  const db = await getDB();
  if (!db || !getActiveProfileId()) return null;
  const record = createLatestSave({
    ...snapshot,
    id: profileKey('latest'),
    profile: getActiveProfileName(),
    profileId: getActiveProfileId(),
  });
  await db.put('savedGames', record);
  return record;
}

export async function loadLatestSave() {
  const db = await getDB();
  if (!db || !getActiveProfileId()) return null;
  const save = await db.get('savedGames', profileKey('latest'));
  return save ? createSave(save) : null;
}

export async function clearSave() {
  const db = await getDB();
  if (!db || !getActiveProfileId()) return;
  await db.delete('savedGames', profileKey('latest'));
}

export async function savePreset(snapshot, presetName = 'New Preset') {
  const db = await getDB();
  if (!db || !getActiveProfileId()) return null;
  const preset = createPresetSave({
    ...snapshot,
    id: profileKey(`preset-${Date.now()}`),
    profile: getActiveProfileName(),
    profileId: getActiveProfileId(),
  }, presetName);
  await db.put('savedGames', preset);
  return preset;
}

export async function listPresets() {
  const db = await getDB();
  if (!db || !getActiveProfileId()) return [];
  const allSaves = await db.getAll('savedGames');
  return allSaves
    .filter((save) => !save.isAutoSave && isOwnedSave(save))
    .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))
    .map(createSave);
}

export async function loadPreset(presetId) {
  const db = await getDB();
  if (!db || !isOwnedSave({ id: presetId, profileId: getActiveProfileId() })) return null;
  const save = await db.get('savedGames', presetId);
  return save && !save.isAutoSave ? createSave(save) : null;
}

export async function overwritePreset(presetId, snapshot) {
  const db = await getDB();
  if (!db || !isOwnedSave({ id: presetId, profileId: getActiveProfileId() })) return null;
  const existing = await db.get('savedGames', presetId);
  if (!existing || existing.isAutoSave) return null;
  const updated = createPresetSave({
    ...existing,
    ...snapshot,
    id: presetId,
    profile: getActiveProfileName(),
    profileId: getActiveProfileId() || existing.profileId,
  }, existing.presetName);
  await db.put('savedGames', updated);
  return updated;
}

export async function updatePresetName(presetId, newName) {
  const db = await getDB();
  if (!db || !isOwnedSave({ id: presetId, profileId: getActiveProfileId() })) return null;
  const preset = await db.get('savedGames', presetId);
  if (!preset || preset.isAutoSave) return null;
  const updated = createSave({ ...preset, presetName: normalisePresetName(newName, preset.presetName) });
  await db.put('savedGames', updated);
  return updated;
}

export async function deletePreset(presetId) {
  const db = await getDB();
  if (!db || !isOwnedSave({ id: presetId, profileId: getActiveProfileId() })) return;
  await db.delete('savedGames', presetId);
}
