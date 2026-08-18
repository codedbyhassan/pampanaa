import { getDB } from './db';

const STORAGE_KEY = 'pampanaa.activeProfile';
const MAX_NAME_LENGTH = 24;
const PROFILE_SEPARATOR = '::';

let active = null;

export function normaliseName(name) {
  return String(name || '')
    .trim()
    .replace(/\s+/g, ' ')
    .slice(0, MAX_NAME_LENGTH);
}

export function getActiveProfileName() {
  if (active) return active;
  if (typeof window === 'undefined') return null;
  const stored = window.localStorage.getItem(STORAGE_KEY);
  active = stored ? normaliseName(stored) : null;
  return active;
}

export function setActiveProfileName(name) {
  const clean = normaliseName(name);
  active = clean || null;
  if (typeof window !== 'undefined') {
    if (clean) window.localStorage.setItem(STORAGE_KEY, clean);
    else window.localStorage.removeItem(STORAGE_KEY);
  }
  return active;
}

/** Stable namespace used by all profile-owned records. */
export function profileKey(suffix = 'main', profileName = getActiveProfileName()) {
  const name = normaliseName(profileName) || 'guest';
  return `${name}${PROFILE_SEPARATOR}${suffix}`;
}

export function isProfileKey(key, profileName = getActiveProfileName()) {
  const prefix = `${normaliseName(profileName) || 'guest'}${PROFILE_SEPARATOR}`;
  return String(key || '').startsWith(prefix);
}

export function stripProfileKey(key, profileName = getActiveProfileName()) {
  const prefix = `${normaliseName(profileName) || 'guest'}${PROFILE_SEPARATOR}`;
  return String(key || '').startsWith(prefix) ? String(key).slice(prefix.length) : String(key || '');
}

export async function listProfiles() {
  const db = await getDB();
  if (!db) return [];
  const all = await db.getAll('profiles');
  return all.sort((a, b) => (b.lastPlayed || 0) - (a.lastPlayed || 0));
}

export async function getProfile(name) {
  const db = await getDB();
  if (!db) return null;
  return (await db.get('profiles', normaliseName(name))) || null;
}

/** Creates the profile if missing, then marks it active and freshly played. */
export async function signIn(name) {
  const clean = normaliseName(name);
  if (!clean) return null;

  const db = await getDB();
  const existing = db ? await db.get('profiles', clean) : null;
  const record = {
    name: clean,
    createdAt: existing?.createdAt || Date.now(),
    lastPlayed: Date.now(),
    sessions: (existing?.sessions || 0) + 1,
  };

  if (db) await db.put('profiles', record);
  setActiveProfileName(clean);
  return record;
}

/**
 * Renames a profile atomically across every profile-owned IndexedDB store.
 * This prevents a half-renamed profile if one write fails.
 */
export async function renameProfile(newName) {
  const current = getActiveProfileName();
  const clean = normaliseName(newName);
  if (!current || !clean) throw new Error('Profile name must be non-empty.');
  if (clean === current) return current;

  const db = await getDB();
  if (!db) throw new Error('Unable to access database.');

  const existing = await db.get('profiles', clean);
  if (existing) throw new Error('That player name is already taken.');

  const currentRecord = await db.get('profiles', current);
  if (!currentRecord) throw new Error('Current profile record not found.');

  const stores = ['profiles', 'settings', 'playerProgress', 'savedGames', 'achievements', 'highScores'];
  const tx = db.transaction(stores, 'readwrite');
  const profiles = tx.objectStore('profiles');
  const settings = tx.objectStore('settings');
  const progress = tx.objectStore('playerProgress');
  const saves = tx.objectStore('savedGames');
  const achievements = tx.objectStore('achievements');
  const scores = tx.objectStore('highScores');

  await profiles.put({ ...currentRecord, name: clean, lastPlayed: Date.now() });

  const currentSettings = await settings.get(profileKey('main', current));
  if (currentSettings) {
    await settings.put({ ...currentSettings, key: profileKey('main', clean) });
    await settings.delete(profileKey('main', current));
  }

  const currentProgress = await progress.get(profileKey('main', current));
  if (currentProgress) {
    await progress.put({ ...currentProgress, key: profileKey('main', clean) });
    await progress.delete(profileKey('main', current));
  }

  const allSaves = await saves.getAll();
  for (const save of allSaves) {
    if (!isProfileKey(save.id, current)) continue;
    const suffix = stripProfileKey(save.id, current);
    await saves.put({ ...save, id: profileKey(suffix, clean) });
    await saves.delete(save.id);
  }

  const allAchievements = await achievements.getAll();
  for (const achievement of allAchievements) {
    if (!isProfileKey(achievement.id, current)) continue;
    const suffix = stripProfileKey(achievement.id, current);
    await achievements.put({ ...achievement, id: profileKey(suffix, clean) });
    await achievements.delete(achievement.id);
  }

  const allScores = await scores.getAll();
  for (const score of allScores) {
    if (score.profile === current || score.name === current) {
      await scores.put({ ...score, name: clean, profile: clean });
    }
  }

  await profiles.delete(current);
  await tx.done;

  setActiveProfileName(clean);
  return clean;
}

export function signOut() {
  setActiveProfileName(null);
}

export async function touchProfile(patch = {}) {
  const name = getActiveProfileName();
  if (!name) return null;
  const db = await getDB();
  if (!db) return null;
  const existing = (await db.get('profiles', name)) || { name, createdAt: Date.now(), sessions: 0 };
  const next = { ...existing, ...patch, name, lastPlayed: Date.now() };
  await db.put('profiles', next);
  return next;
}

/** Deletes a profile and every record owned by it. */
export async function deleteProfile(name) {
  const clean = normaliseName(name);
  if (!clean) return;
  const db = await getDB();
  if (!db) return;

  const stores = ['profiles', 'settings', 'playerProgress', 'savedGames', 'achievements', 'highScores'];
  const tx = db.transaction(stores, 'readwrite');
  const profiles = tx.objectStore('profiles');
  const settings = tx.objectStore('settings');
  const progress = tx.objectStore('playerProgress');
  const saves = tx.objectStore('savedGames');
  const achievements = tx.objectStore('achievements');
  const scores = tx.objectStore('highScores');

  await profiles.delete(clean);
  await settings.delete(profileKey('main', clean));
  await progress.delete(profileKey('main', clean));

  const allSaves = await saves.getAll();
  for (const save of allSaves) {
    if (isProfileKey(save.id, clean)) await saves.delete(save.id);
  }

  const allAchievements = await achievements.getAll();
  for (const achievement of allAchievements) {
    if (isProfileKey(achievement.id, clean)) await achievements.delete(achievement.id);
  }

  const allScores = await scores.getAll();
  for (const score of allScores) {
    if (score.profile === clean || score.name === clean) await scores.delete(score.id);
  }

  await tx.done;
  if (getActiveProfileName() === clean) setActiveProfileName(null);
}
