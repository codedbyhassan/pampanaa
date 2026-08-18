import { getDB } from './db';
import { getActiveProfileId, getActiveProfileName } from './profiles';
import { compareScores, createScore } from '../domain/scores/scoreModel';

export async function addScore({ name, score, wave, mode = 'campaign' }) {
  const db = await getDB();
  const profileId = getActiveProfileId();
  if (!db || !profileId) return null;
  const profile = getActiveProfileName();
  const record = createScore({
    name: name?.trim() || profile || 'Anonymous',
    profile: profile || null,
    profileId,
    score,
    wave,
    mode,
  });
  return db.add('highScores', record);
}

export async function getTopScores(limit = 10, mode = null) {
  const db = await getDB();
  if (!db) return [];
  const safeLimit = Math.max(1, Math.min(Number(limit) || 10, 100));
  const all = await db.getAll('highScores');
  return all
    .map((record) => createScore({
      ...record,
      profileId: record.profileId || 'legacy',
    }))
    .filter((record) => (mode ? record.mode === mode : true))
    .sort(compareScores)
    .slice(0, safeLimit);
}

export async function getProfileScores(limit = 10, mode = null) {
  const profileId = getActiveProfileId();
  const profile = getActiveProfileName();
  if (!profile && !profileId) return [];
  const all = await getTopScores(100, mode);
  return all.filter((record) =>
    (profileId && record.profileId === profileId) ||
    (record.profileId === 'legacy' && (record.profile === profile || (!record.profile && record.name === profile)))
  ).slice(0, limit);
}
