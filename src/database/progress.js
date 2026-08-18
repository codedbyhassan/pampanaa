import { getDB } from './db';
import { getActiveProfileId, profileKey } from './profiles';
import { DEFAULT_PROGRESS } from '../domain/progress/defaultProgress';
import { createProgress, patchProgress, recordWaveCleared as recordWaveClearedModel } from '../domain/progress/progressModel';

export { DEFAULT_PROGRESS };

export async function getProgress() {
  const db = await getDB();
  if (!db) return createProgress({ profileId: getActiveProfileId() || null });
  const saved = await db.get('playerProgress', profileKey());
  return createProgress({
    ...(saved || {}),
    profileId: saved?.profileId || getActiveProfileId() || null,
  });
}

export async function updateProgress(patch) {
  const db = await getDB();
  const current = await getProgress();
  const next = patchProgress({
    ...current,
    ...patch,
    key: profileKey(),
    profileId: getActiveProfileId() || current.profileId || null,
  });
  if (db) await db.put('playerProgress', next);
  return next;
}

export async function recordWaveCleared(wave, score = 0) {
  const current = await getProgress();
  const next = recordWaveClearedModel(current, wave, score);
  return updateProgress(next);
}

export async function resetProgress() {
  const db = await getDB();
  const next = createProgress({ key: profileKey(), profileId: getActiveProfileId() || null });
  if (db) await db.put('playerProgress', next);
  return next;
}
