import { getUnlockedAchievements, unlockAchievement } from '../../../database/achievements';
import { createAchievementRepository } from '../../../domain/achievements/achievementRepository';

export const indexedDbAchievementRepository = createAchievementRepository({
  listUnlocked: getUnlockedAchievements,
  unlock: unlockAchievement,
});
