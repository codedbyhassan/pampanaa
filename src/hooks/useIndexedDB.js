import { useCallback, useEffect, useState } from 'react';
import { addScore, getTopScores } from '../database/scores';
import { getSettings, updateSettings } from '../database/settings';
import { getProgress, updateProgress } from '../database/progress';
import { saveGame, loadLatestSave, clearSave } from '../database/saves';
import { getUnlockedAchievements, unlockAchievement } from '../database/achievements';
import { getDB } from '../database/db';

/** Thin hook exposing the persistence modules; the DB connection opens once. */
export function useIndexedDB() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getDB().then(() => {
      if (!cancelled) setReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return {
    ready,
    addScore: useCallback(addScore, []),
    getTopScores: useCallback(getTopScores, []),
    getSettings: useCallback(getSettings, []),
    updateSettings: useCallback(updateSettings, []),
    getProgress: useCallback(getProgress, []),
    updateProgress: useCallback(updateProgress, []),
    saveGame: useCallback(saveGame, []),
    loadLatestSave: useCallback(loadLatestSave, []),
    clearSave: useCallback(clearSave, []),
    getUnlockedAchievements: useCallback(getUnlockedAchievements, []),
    unlockAchievement: useCallback(unlockAchievement, []),
  };
}

export default useIndexedDB;
