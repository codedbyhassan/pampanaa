import { getDB } from './db';
import { getActiveProfileName } from './profiles';

export async function getUnlockedAchievements() {
  const db = await getDB();
  if (!db) return [];
  const profile = getActiveProfileName() || 'guest';
  const all = await db.getAll('achievements');
  return all
    .filter((a) => String(a.id).startsWith(`${profile}::`))
    .map((a) => ({ ...a, id: String(a.id).slice(profile.length + 2) }));
}

export async function unlockAchievement(id) {
  const db = await getDB();
  if (!db) return false;
  const profile = getActiveProfileName() || 'guest';
  const key = `${profile}::${id}`;
  const existing = await db.get('achievements', key);
  if (existing) return false;
  await db.put('achievements', { id: key, unlockedAt: new Date().toISOString() });
  return true;
}
