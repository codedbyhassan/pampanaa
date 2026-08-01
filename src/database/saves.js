import { getDB } from './db';

const SLOT = 'latest';

export async function saveGame(snapshot) {
  const db = await getDB();
  if (!db) return;
  await db.put('savedGames', { ...snapshot, id: SLOT, timestamp: Date.now() });
}

export async function loadLatestSave() {
  const db = await getDB();
  if (!db) return null;
  return (await db.get('savedGames', SLOT)) || null;
}

export async function clearSave() {
  const db = await getDB();
  if (!db) return;
  await db.delete('savedGames', SLOT);
}
