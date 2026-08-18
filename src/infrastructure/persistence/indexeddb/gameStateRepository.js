import { getSettings, updateSettings } from '../../../database/settings';
import { getProgress, updateProgress } from '../../../database/progress';
import { loadLatestSave } from '../../../database/saves';
import { getUnlockedAchievements, unlockAchievement } from '../../../database/achievements';
import { createGameStateRepository } from '../../../domain/gameState/gameStateRepository';

/** IndexedDB adapter for player-facing game state. */
export const indexedDbGameStateRepository = createGameStateRepository({
  getSettings,
  updateSettings,
  getProgress,
  updateProgress,
  getUnlockedAchievements,
  unlockAchievement,
  loadLatestSave,
});
