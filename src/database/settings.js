import { getDB } from './db';
import { DEFAULT_KEYMAP } from '../utils/constants';

export const DEFAULT_SETTINGS = {
  key: 'main',
  volume: 0.5,
  difficulty: 'normal',
  controlScheme: 'auto',
  colorblind: false,
  reducedMotion: false,
  keymap: { ...DEFAULT_KEYMAP },
  hasSeenOnboarding: false,
};

export async function getSettings() {
  const db = await getDB();
  if (!db) return { ...DEFAULT_SETTINGS };
  const saved = await db.get('settings', 'main');
  return { ...DEFAULT_SETTINGS, ...(saved || {}), keymap: { ...DEFAULT_KEYMAP, ...(saved?.keymap || {}) } };
}

export async function updateSettings(patch) {
  const db = await getDB();
  if (!db) return { ...DEFAULT_SETTINGS, ...patch };
  const current = await getSettings();
  const next = { ...current, ...patch, key: 'main' };
  await db.put('settings', next);
  return next;
}
