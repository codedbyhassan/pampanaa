import { getDB } from './db';

export async function addScore({ name, score, wave, mode = 'campaign' }) {
  const db = await getDB();
  if (!db) return;
  await db.add('highScores', {
    name: name?.trim() || 'Anonymous',
    score,
    wave: wave ?? 1,
    mode,
    date: new Date().toISOString(),
  });
}

export async function getTopScores(limit = 10, mode = null) {
  const db = await getDB();
  if (!db) return [];
  const all = await db.getAll('highScores');
  return all
    .map((r) => ({ ...r, mode: r.mode || 'campaign' }))
    .filter((r) => (mode ? r.mode === mode : true))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}
