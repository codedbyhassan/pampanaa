import { DEFAULT_SETTINGS } from '../../database/settings';
import { DEFAULT_PROGRESS } from '../../database/progress';
import { indexedDbGameStateRepository } from '../../infrastructure/persistence/indexeddb/gameStateRepository';

/**
 * Application service for player-facing game state.
 *
 * React coordinates use-cases through this service. Persistence technology
 * stays behind the repository contract and can be replaced or mocked.
 */
export function createGameStateService(repository = indexedDbGameStateRepository) {
  return Object.freeze({
    defaults: Object.freeze({
      settings: DEFAULT_SETTINGS,
      progress: DEFAULT_PROGRESS,
    }),

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
