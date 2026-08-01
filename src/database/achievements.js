import { getDB } from './db';

export async function getUnlockedAchievements() {
  const db = await getDB();
  if (!db) return [];
  return db.getAll('achievements');
}

export async function unlockAchievement(id) {
  const db = await getDB();
  if (!db) return false;
  const existing = await db.get('achievements', id);
  if (existing) return false;
  await db.put('achievements', { id, unlockedAt: new Date().toISOString() });
  return true;
}
