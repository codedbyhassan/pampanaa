import { getDB } from './db';
import { profileKey } from './profiles';
import { DEFAULT_KEYMAP } from '../utils/constants';

export const DEFAULT_SETTINGS = {
  key: 'main',
  volume: 0.5,
  difficultyLevel: 4,
  musicEnabled: true,
  sfxEnabled: true,
  musicVolume: 0.35,
  shipDesign: 'interceptor',
  controlScheme: 'auto',
  colorblind: false,
  reducedMotion: false,
  uiTheme: 'nebula',
  backgroundTheme: 'auto',
  showFps: false,
  screenShake: true,
  damageNumbers: true,
  autoSave: true,
  keymap: { ...DEFAULT_KEYMAP },
  hasSeenOnboarding: false,
};

export async function getSettings() {
  const db = await getDB();
  if (!db) return { ...DEFAULT_SETTINGS };
  const saved = await db.get('settings', profileKey());
  return {
    ...DEFAULT_SETTINGS,
    ...(saved || {}),
    keymap: { ...DEFAULT_KEYMAP, ...(saved?.keymap || {}) },
  };
}

export async function updateSettings(patch) {
  const db = await getDB();
  if (!db) return { ...DEFAULT_SETTINGS, ...patch };
  const current = await getSettings();
  const next = { ...current, ...patch, key: profileKey() };
  await db.put('settings', next);
  return next;
}

export async function resetSettings() {
  const db = await getDB();
  const next = { ...DEFAULT_SETTINGS, key: profileKey() };
  if (db) await db.put('settings', next);
  return next;
}
