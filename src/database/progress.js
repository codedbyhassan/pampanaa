import { getDB } from './db';
import { profileKey } from './profiles';

export const DEFAULT_PROGRESS = {
  key: 'main',
  unlockedWeapons: ['blaster'],
  unlockedSkins: ['default'],
  selectedSkin: 'default',
  highestWaveReached: 0,
  /** Every wave the player has actually cleared — powers the level select. */
  clearedWaves: [],
  bestScoreByWave: {},
  totalPlayTime: 0,
  totalEnemiesDefeated: 0,
  stats: {
    totalKillsByType: { Chaser: 0, Shooter: 0, Tank: 0, Swarmer: 0, Splitter: 0, Boss: 0 },
    totalDeaths: 0,
    gamesPlayed: 0,
    shotsFiredByWeapon: {
      blaster: 0,
      shotgun: 0,
      laser: 0,
      homingMissile: 0,
      flamethrower: 0,
    },
  },
};

export async function getProgress() {
  const db = await getDB();
  if (!db) return structuredClone(DEFAULT_PROGRESS);
  const saved = await db.get('playerProgress', profileKey());
  if (!saved) return structuredClone(DEFAULT_PROGRESS);
  const base = structuredClone(DEFAULT_PROGRESS);
  return {
    ...base,
    ...saved,
    clearedWaves: saved.clearedWaves || [],
    bestScoreByWave: saved.bestScoreByWave || {},
    stats: {
      ...base.stats,
      ...(saved.stats || {}),
      totalKillsByType: { ...base.stats.totalKillsByType, ...(saved.stats?.totalKillsByType || {}) },
      shotsFiredByWeapon: {
        ...base.stats.shotsFiredByWeapon,
        ...(saved.stats?.shotsFiredByWeapon || {}),
      },
    },
  };
}

export async function updateProgress(patch) {
  const db = await getDB();
  const current = await getProgress();
  const next = { ...current, ...patch, key: profileKey() };
  if (db) await db.put('playerProgress', next);
  return next;
}

/** Records a cleared wave and its best score for the level-select screen. */
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
  const next = { ...structuredClone(DEFAULT_PROGRESS), key: profileKey() };
  if (db) await db.put('playerProgress', next);
  return next;
}
