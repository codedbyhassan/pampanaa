import { getDB } from './db';
import { profileKey } from './profiles';

// Auto-save to 'latest' preset for quick continue
export async function saveGame(snapshot) {
  const db = await getDB();
  if (!db) return;
  await db.put('savedGames', { 
    ...snapshot, 
    id: profileKey('latest'), 
    presetName: 'Latest Session',
    timestamp: Date.now(),
    isAutoSave: true 
  });
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

// Preset system: multiple saves per profile
export async function savePreset(snapshot, presetName = 'New Preset') {
  const db = await getDB();
  if (!db) return null;
  const presetId = profileKey(`preset-${Date.now()}`);
  const preset = {
    id: presetId,
    presetName,
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
  return allSaves.filter(s => !s.isAutoSave && s.id?.includes('preset-')).sort((a, b) => b.timestamp - a.timestamp);
}

export async function loadPreset(presetId) {
  const db = await getDB();
  if (!db) return null;
  return (await db.get('savedGames', presetId)) || null;
}

export async function updatePresetName(presetId, newName) {
  const db = await getDB();
  if (!db) return;
  const preset = await db.get('savedGames', presetId);
  if (preset) {
    preset.presetName = newName;
    await db.put('savedGames', preset);
  }
}

export async function deletePreset(presetId) {
  const db = await getDB();
  if (!db) return;
  await db.delete('savedGames', presetId);
}
