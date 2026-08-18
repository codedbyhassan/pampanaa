import { getDB } from './db';
import { getActiveProfileName } from './profiles';

export async function addScore({ name, score, wave, mode = 'campaign' }) {
  const db = await getDB();
  if (!db) return null;

  const profile = getActiveProfileName();
  const record = {
    name: name?.trim() || profile || 'Anonymous',
    profile: profile || null,
    score: Number(score) || 0,
    wave: wave ?? 1,
    mode,
    date: new Date().toISOString(),
  };

  return db.add('highScores', record);
}

export async function getTopScores(limit = 10, mode = null) {
  const db = await getDB();
  if (!db) return [];

  const safeLimit = Math.max(1, Math.min(Number(limit) || 10, 100));
  const all = await db.getAll('highScores');

  return all
    .map((record) => ({ ...record, mode: record.mode || 'campaign' }))
    .filter((record) => (mode ? record.mode === mode : true))
    .sort((a, b) => (b.score || 0) - (a.score || 0))
    .slice(0, safeLimit);
}

export async function getProfileScores(limit = 10, mode = null) {
  const profile = getActiveProfileName();
  if (!profile) return [];

  const all = await getTopScores(100, mode);
  return all.filter((record) => record.profile === profile || (!record.profile && record.name === profile)).slice(0, limit);
}
