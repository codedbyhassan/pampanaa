/**
 * Game-state repository contract.
 *
 * This boundary keeps application services independent from the persistence
 * technology used to store settings, progress, achievements and saves.
 */
export function createGameStateRepository({
  getSettings,
  updateSettings,
  getProgress,
  updateProgress,
  getUnlockedAchievements,
  unlockAchievement,
  loadLatestSave,
}) {
  const required = {
    getSettings,
    updateSettings,
    getProgress,
    updateProgress,
    getUnlockedAchievements,
    unlockAchievement,
    loadLatestSave,
  };

  for (const [name, operation] of Object.entries(required)) {
    if (typeof operation !== 'function') {
      throw new TypeError(`Game-state repository requires ${name}().`);
    }
  }

  return Object.freeze(required);
}
