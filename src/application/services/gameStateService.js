import { DEFAULT_SETTINGS, getSettings, updateSettings } from '../../database/settings';
import { DEFAULT_PROGRESS, getProgress, updateProgress } from '../../database/progress';
import { loadLatestSave } from '../../database/saves';
import { getUnlockedAchievements, unlockAchievement } from '../../database/achievements';

/**
 * Application service for the player-facing game state.
 * Persistence implementations stay behind this boundary so React contexts
 * coordinate use-cases instead of importing individual database modules.
 */
export const gameStateService = Object.freeze({
  defaults: Object.freeze({
    settings: DEFAULT_SETTINGS,
    progress: DEFAULT_PROGRESS,
  }),

  async loadSnapshot() {
    const [settings, progress, achievements, save] = await Promise.all([
      getSettings(),
      getProgress(),
      getUnlockedAchievements(),
      loadLatestSave(),
    ]);

    return { settings, progress, achievements, hasSave: Boolean(save) };
  },

  updateSettings,
  updateProgress,
  getUnlockedAchievements,
  unlockAchievement,
});
