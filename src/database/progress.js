import { getDB } from './db';
import { getActiveProfileId, profileKey } from './profiles';
import { DEFAULT_PROGRESS } from '../domain/progress/defaultProgress';

export { DEFAULT_PROGRESS };

export async function getProgress() {
  const db = await getDB();
  if (!db) return { ...structuredClone(DEFAULT_PROGRESS), profileId: getActiveProfileId() || null };
  const saved = await db.get('playerProgress', profileKey());
  if (!saved) return { ...structuredClone(DEFAULT_PROGRESS), profileId: getActiveProfileId() || null };
  const base = structuredClone(DEFAULT_PROGRESS);
  return {
    ...base,
    ...saved,
    profileId: saved.profileId || getActiveProfileId() || null,
    clearedWaves: saved.clearedWaves || [],
    bestScoreByWave: saved.bestScoreByWave || {},
    stats: {
      ...base.stats,
      ...(saved.stats || {}),
      totalKillsByType: { ...base.stats.totalKillsByType, ...(saved.stats?.totalKillsByType || {}) },
      shotsFiredByWeapon: { ...base.stats.shotsFiredByWeapon, ...(saved.stats?.shotsFiredByWeapon || {}) },
    },
  };
}

export async function updateProgress(patch) {
  const db = await getDB();
  const current = await getProgress();
  const next = { ...current, ...patch, key: profileKey(), profileId: getActiveProfileId() || current.profileId || null };
  if (db) await db.put('playerProgress', next);
  return next;
}

export async function recordWaveCleared(wave, score = 0) {
  const current = await getProgress();
  const cleared = new Set(current.clearedWaves || []);
  cleared.add(wave);
  const best = { ...(current.bestScoreByWave || {}) };
  if ((best[wave] || 0) < score) best[wave] = score;
  return updateProgress({
    clearedWaves: [...cleared].sort((a, b) => a - b),
    bestScoreByWave: best,
    highestWaveReached: Math.max(current.highestWaveReached || 0, wave + 1),
  });
}

export async function resetProgress() {
  const db = await getDB();
  const next = { ...structuredClone(DEFAULT_PROGRESS), key: profileKey(), profileId: getActiveProfileId() || null };
  if (db) await db.put('playerProgress', next);
  return next;
}
