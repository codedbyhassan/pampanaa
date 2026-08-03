import { getDB } from './db';

/**
 * Name-based player profiles. Every store in the app is namespaced by the
 * active profile name, so each signed-in player keeps their own settings,
 * progress, saves, achievements and scores inside the same IndexedDB.
 */
const STORAGE_KEY = 'pampanaa.activeProfile';

let active = null;

export function normaliseName(name) {
  return (name || '').trim().slice(0, 24);
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

/** Namespaced record key for the per-profile keyed stores. */
export function profileKey(suffix = 'main') {
  const name = getActiveProfileName() || 'guest';
  return `${name}::${suffix}`;
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

  const nextProfile = { ...currentRecord, name: clean, lastPlayed: Date.now() };
  await db.put('profiles', nextProfile);

  const currentSettings = await db.get('settings', `${current}::main`);
  if (currentSettings) {
    await db.put('settings', { ...currentSettings, key: `${clean}::main` });
    await db.delete('settings', `${current}::main`).catch(() => {});
  }

  const currentProgress = await db.get('playerProgress', `${current}::main`);
  if (currentProgress) {
    await db.put('playerProgress', { ...currentProgress, key: `${clean}::main` });
    await db.delete('playerProgress', `${current}::main`).catch(() => {});
  }

  const currentSave = await db.get('savedGames', `${current}::latest`);
  if (currentSave) {
    await db.put('savedGames', { ...currentSave, id: `${clean}::latest` });
    await db.delete('savedGames', `${current}::latest`).catch(() => {});
  }

  const achievements = (await db.getAll('achievements')).filter((a) => String(a.id).startsWith(`${current}::`));
  for (const achievement of achievements) {
    const id = String(achievement.id).replace(`${current}::`, `${clean}::`);
    await db.put('achievements', { ...achievement, id });
    await db.delete('achievements', achievement.id).catch(() => {});
  }

  await db.delete('profiles', current).catch(() => {});
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

export async function deleteProfile(name) {
  const clean = normaliseName(name);
  const db = await getDB();
  if (!db) return;
  await db.delete('profiles', clean);
  await db.delete('settings', `${clean}::main`).catch(() => {});
  await db.delete('playerProgress', `${clean}::main`).catch(() => {});
  await db.delete('savedGames', `${clean}::latest`).catch(() => {});
  if (getActiveProfileName() === clean) setActiveProfileName(null);
}
