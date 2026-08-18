import { DEFAULT_PROGRESS } from './defaultProgress';
import { DOMAIN_SCHEMA_VERSION, asInteger, asNonNegativeNumber, clone, freezeModel } from '../shared/schema';

export const PROGRESS_SCHEMA_VERSION = DOMAIN_SCHEMA_VERSION;

function normaliseStats(stats = {}) {
  const base = clone(DEFAULT_PROGRESS.stats);
  return {
    ...base,
    ...stats,
    totalKillsByType: { ...base.totalKillsByType, ...(stats.totalKillsByType || {}) },
    shotsFiredByWeapon: { ...base.shotsFiredByWeapon, ...(stats.shotsFiredByWeapon || {}) },
  };
}

export function createProgress(input = {}) {
  const source = input || {};
  return freezeModel({
    ...clone(DEFAULT_PROGRESS),
    ...source,
    unlockedWeapons: [...new Set(source.unlockedWeapons || DEFAULT_PROGRESS.unlockedWeapons)],
    unlockedSkins: [...new Set(source.unlockedSkins || DEFAULT_PROGRESS.unlockedSkins)],
    clearedWaves: [...new Set((source.clearedWaves || []).map((wave) => asInteger(wave)).filter((wave) => wave > 0))].sort((a, b) => a - b),
    bestScoreByWave: { ...(source.bestScoreByWave || {}) },
    highestWaveReached: asInteger(source.highestWaveReached, 0),
    totalPlayTime: asNonNegativeNumber(source.totalPlayTime),
    totalEnemiesDefeated: asNonNegativeNumber(source.totalEnemiesDefeated),
    stats: normaliseStats(source.stats),
    schemaVersion: PROGRESS_SCHEMA_VERSION,
  });
}

export function recordWaveCleared(progress, wave, score = 0) {
  const current = createProgress(progress);
  const clearedWaves = [...new Set([...current.clearedWaves, asInteger(wave)])].filter((value) => value > 0).sort((a, b) => a - b);
  const bestScoreByWave = { ...current.bestScoreByWave };
  const safeScore = asNonNegativeNumber(score);
  bestScoreByWave[wave] = Math.max(bestScoreByWave[wave] || 0, safeScore);
  return createProgress({
    ...current,
    clearedWaves,
    bestScoreByWave,
    highestWaveReached: Math.max(current.highestWaveReached, asInteger(wave) + 1),
  });
}

export function patchProgress(current, patch = {}) {
  return createProgress({ ...current, ...patch });
}
