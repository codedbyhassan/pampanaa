import { getDB } from './db';
import { getActiveProfileId, getActiveProfileName, profileKey } from './profiles';

export async function getUnlockedAchievements() {
  const db = await getDB();
  if (!db) return [];
  const profileId = getActiveProfileId();
  const profile = getActiveProfileName() || 'guest';
  const all = await db.getAll('achievements');
  return all
    .filter((a) => (profileId && a.profileId === profileId) || String(a.id).startsWith(`${profile}::`))
    .map((a) => ({
      ...a,
      id: a.achievementId || String(a.id).slice(profile.length + 2),
    }));
}

export async function unlockAchievement(id) {
  const db = await getDB();
  if (!db) return false;
  const profileId = getActiveProfileId();
  const profile = getActiveProfileName() || 'guest';
  const key = profileKey(id, profile);
  const existing = await db.get('achievements', key);
  if (existing) return false;
  await db.put('achievements', {
    id: key,
    achievementId: String(id),
    profileId: profileId || null,
    unlockedAt: new Date().toISOString(),
  });
  return true;
}
