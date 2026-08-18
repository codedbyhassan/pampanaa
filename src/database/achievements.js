import { getDB } from './db';
import { getActiveProfileId, getActiveProfileName, profileKey } from './profiles';
import { createAchievement } from '../domain/achievements/achievementModel';

export async function getUnlockedAchievements() {
  const db = await getDB();
  if (!db || !getActiveProfileId()) return [];
  const profileId = getActiveProfileId();
  const profile = getActiveProfileName() || 'guest';
  const all = await db.getAll('achievements');
  return all
    .filter((achievement) => (achievement.profileId === profileId) || String(achievement.id).startsWith(`${profile}::`))
    .map((achievement) => createAchievement({
      ...achievement,
      achievementId: achievement.achievementId || String(achievement.id).slice(profile.length + 2),
      profileId: achievement.profileId || profileId,
    }));
}

export async function unlockAchievement(id) {
  const db = await getDB();
  const profileId = getActiveProfileId();
  if (!db || !profileId) return false;
  const profile = getActiveProfileName() || 'guest';
  const key = profileKey(String(id), profile);
  const existing = await db.get('achievements', key);
  if (existing) return false;
  const record = createAchievement({
    id: key,
    achievementId: String(id),
    profileId,
  });
  await db.put('achievements', record);
  return true;
}
