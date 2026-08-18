import { DEFAULT_SETTINGS } from '../../domain/settings/defaultSettings';
import { DEFAULT_PROGRESS } from '../../domain/progress/defaultProgress';
import { indexedDbGameStateRepository } from '../../infrastructure/persistence/indexeddb/gameStateRepository';

export function createGameStateService(repository = indexedDbGameStateRepository) {
  return Object.freeze({
    defaults: Object.freeze({ settings: DEFAULT_SETTINGS, progress: DEFAULT_PROGRESS }),

    async loadSnapshot() {
      const [settings, progress, achievements, save] = await Promise.all([
        repository.getSettings(),
        repository.getProgress(),
        repository.getUnlockedAchievements(),
        repository.loadLatestSave(),
      ]);
      return { settings, progress, achievements, hasSave: Boolean(save) };
    },

    updateSettings: repository.updateSettings,
    updateProgress: repository.updateProgress,
    getUnlockedAchievements: repository.getUnlockedAchievements,
    unlockAchievement: repository.unlockAchievement,
  });
}

export const gameStateService = createGameStateService();
