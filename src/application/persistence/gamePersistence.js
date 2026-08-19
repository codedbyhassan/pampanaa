import { addScore } from '../../database/scores';
import { saveGame, loadLatestSave, clearSave } from '../../database/saves';
import { recordWaveCleared } from '../../database/progress';

export async function persistGameSnapshot(snapshot) {
  return saveGame(snapshot);
}

export async function loadLatestGameSnapshot() {
  return loadLatestSave();
}

export async function clearGameSnapshot() {
  return clearSave();
}

export async function recordCompletedEncounter(wave, score) {
  return recordWaveCleared(wave, score);
}

export async function submitScore(record) {
  return addScore(record);
}
