import { getDB } from './db';

export const DEFAULT_PROGRESS = {
  key: 'main',
  unlockedWeapons: ['blaster'],
  unlockedSkins: ['default'],
  selectedSkin: 'default',
  highestWaveReached: 0,
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
  const saved = await db.get('playerProgress', 'main');
  if (!saved) return structuredClone(DEFAULT_PROGRESS);
  const base = structuredClone(DEFAULT_PROGRESS);
  return {
    ...base,
    ...saved,
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
  const next = { ...current, ...patch, key: 'main' };
  if (db) await db.put('playerProgress', next);
  return next;
}
