import { getDB } from './db';
import { createProfileId, normaliseProfileName } from '../domain/profiles/profile';

const STORAGE_KEY = 'pampanaa.activeProfile';
const ID_STORAGE_KEY = 'pampanaa.activeProfileId';
const MAX_NAME_LENGTH = 24;
const PROFILE_SEPARATOR = '::';

let active = null;
let activeId = null;

export function normaliseName(name) {
  return normaliseProfileName(name, MAX_NAME_LENGTH);
}

export function getActiveProfileId() {
  if (activeId) return activeId;
  if (typeof window === 'undefined') return null;
  activeId = window.localStorage.getItem(ID_STORAGE_KEY) || null;
  return activeId;
}

export function getActiveProfileName() {
  if (active) return active;
  if (typeof window === 'undefined') return null;
  const stored = window.localStorage.getItem(STORAGE_KEY);
  active = stored ? normaliseName(stored) : null;
  return active;
}

export function setActiveProfile(profile) {
  active = profile?.name ? normaliseName(profile.name) : null;
  activeId = profile?.profileId || null;
  if (typeof window !== 'undefined') {
    if (active) window.localStorage.setItem(STORAGE_KEY, active);
    else window.localStorage.removeItem(STORAGE_KEY);
    if (activeId) window.localStorage.setItem(ID_STORAGE_KEY, activeId);
    else window.localStorage.removeItem(ID_STORAGE_KEY);
  }
  return profile || null;
}

export function setActiveProfileName(name) {
  return setActiveProfile({ name });
}

/** Stable namespace used by legacy profile-owned records. */
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

async function migrateLegacyProfileIds(db, profiles) {
  const missing = profiles.filter((profile) => !profile.profileId);
  if (!missing.length) return profiles;

  const tx = db.transaction(['profiles'], 'readwrite');
  const store = tx.objectStore('profiles');
  const migrated = profiles.map((profile) => {
    if (profile.profileId) return profile;
    const next = { ...profile, profileId: createProfileId() };
    store.put(next);
    return next;
  });
  await tx.done;
  return migrated;
}

export async function listProfiles() {
  const db = await getDB();
  if (!db) return [];
  const all = await db.getAll('profiles');
  const migrated = await migrateLegacyProfileIds(db, all);
  return migrated.sort((a, b) => (b.lastPlayed || 0) - (a.lastPlayed || 0));
}

export async function getProfile(name) {
  const db = await getDB();
  if (!db) return null;
  const record = (await db.get('profiles', normaliseName(name))) || null;
  if (!record) return null;
  if (record.profileId) return record;
  const migrated = { ...record, profileId: createProfileId() };
  await db.put('profiles', migrated);
  return migrated;
}

export async function getProfileById(profileId) {
  const db = await getDB();
  if (!db || !profileId) return null;
  return (await db.getFromIndex('profiles', 'profileId', profileId)) || null;
}

export async function signIn(name) {
  const clean = normaliseName(name);
  if (!clean) return null;

  const db = await getDB();
  const existing = db ? await getProfile(clean) : null;
  const record = {
    profileId: existing?.profileId || createProfileId(),
    name: clean,
    createdAt: existing?.createdAt || Date.now(),
    lastPlayed: Date.now(),
    sessions: (existing?.sessions || 0) + 1,
  };

  if (db) await db.put('profiles', record);
  setActiveProfile(record);
  return record;
}

export async function renameProfile(newName) {
  const current = getActiveProfileName();
  const profileId = getActiveProfileId();
  const clean = normaliseName(newName);
  if (!current || !clean) throw new Error('Profile name must be non-empty.');
  if (clean === current) return clean;

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

  await profiles.put({ ...currentRecord, name: clean, profileId: currentRecord.profileId || profileId, lastPlayed: Date.now() });

  const currentSettings = await settings.get(profileKey('main', current));
  if (currentSettings) {
    await settings.put({ ...currentSettings, key: profileKey('main', clean), profileId: currentRecord.profileId || profileId });
    await settings.delete(profileKey('main', current));
  }

  const currentProgress = await progress.get(profileKey('main', current));
  if (currentProgress) {
    await progress.put({ ...currentProgress, key: profileKey('main', clean), profileId: currentRecord.profileId || profileId });
    await progress.delete(profileKey('main', current));
  }

  const allSaves = await saves.getAll();
  for (const save of allSaves) {
    if (save.profileId === (currentRecord.profileId || profileId) || isProfileKey(save.id, current)) {
      const suffix = stripProfileKey(save.id, current);
      await saves.put({ ...save, id: profileKey(suffix || 'latest', clean), profileId: currentRecord.profileId || profileId, profile: clean });
      if (save.id !== profileKey(suffix || 'latest', clean)) await saves.delete(save.id);
    }
  }

  const allAchievements = await achievements.getAll();
  for (const achievement of allAchievements) {
    if (achievement.profileId === (currentRecord.profileId || profileId) || isProfileKey(achievement.id, current)) {
      const suffix = stripProfileKey(achievement.id, current);
      const nextId = profileKey(suffix || achievement.achievementId || 'achievement', clean);
      await achievements.put({ ...achievement, id: nextId, profileId: currentRecord.profileId || profileId });
      if (achievement.id !== nextId) await achievements.delete(achievement.id);
    }
  }

  const allScores = await scores.getAll();
  for (const score of allScores) {
    if (score.profileId === (currentRecord.profileId || profileId) || score.profile === current || score.name === current) {
      await scores.put({ ...score, name: clean, profile: clean, profileId: currentRecord.profileId || profileId });
    }
  }

  await profiles.delete(current);
  await tx.done;
  setActiveProfile({ ...currentRecord, name: clean, profileId: currentRecord.profileId || profileId });
  return clean;
}

export function signOut() {
  setActiveProfile(null);
}

export async function touchProfile(patch = {}) {
  const name = getActiveProfileName();
  if (!name) return null;
  const db = await getDB();
  if (!db) return null;
  const existing = (await db.get('profiles', name)) || { name, createdAt: Date.now(), sessions: 0 };
  const next = { ...existing, ...patch, name, profileId: existing.profileId || getActiveProfileId() || createProfileId(), lastPlayed: Date.now() };
  await db.put('profiles', next);
  setActiveProfile(next);
  return next;
}

export async function deleteProfile(name) {
  const clean = normaliseName(name);
  if (!clean) return;
  const db = await getDB();
  if (!db) return;
  const profile = await getProfile(clean);
  const profileId = profile?.profileId;
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
  for (const save of allSaves) if (save.profileId === profileId || isProfileKey(save.id, clean)) await saves.delete(save.id);
  const allAchievements = await achievements.getAll();
  for (const achievement of allAchievements) if (achievement.profileId === profileId || isProfileKey(achievement.id, clean)) await achievements.delete(achievement.id);
  const allScores = await scores.getAll();
  for (const score of allScores) if (score.profileId === profileId || score.profile === clean || score.name === clean) await scores.delete(score.id);

  await tx.done;
  if (getActiveProfileName() === clean) setActiveProfile(null);
}
