import { getDB } from './db';
import { profileKey } from './profiles';

export async function saveGame(snapshot) {
  const db = await getDB();
  if (!db) return;
  await db.put('savedGames', { ...snapshot, id: profileKey('latest'), timestamp: Date.now() });
}

export async function loadLatestSave() {
  const db = await getDB();
  if (!db) return null;
  return (await db.get('savedGames', profileKey('latest'))) || null;
}

export async function clearSave() {
  const db = await getDB();
  if (!db) return;
  await db.delete('savedGames', profileKey('latest'));
}
