import { indexedDbAchievementRepository } from '../../infrastructure/persistence/indexeddb/achievementRepository';

export function createAchievementService(repository = indexedDbAchievementRepository) {
  return Object.freeze({
    listUnlocked: repository.listUnlocked,
    unlock: repository.unlock,
  });
}

export const achievementService = createAchievementService();
