import { getDB, STORES } from '../../../database/db';

const EXPORT_VERSION = 1;

const exportStores = Object.freeze(Object.values(STORES));

export async function exportDatabase() {
  const db = await getDB();
  if (!db) throw new Error('IndexedDB is unavailable.');

  const data = {};
  for (const storeName of exportStores) data[storeName] = await db.getAll(storeName);

  return {
    format: 'pampanaa-backup',
    version: EXPORT_VERSION,
    exportedAt: new Date().toISOString(),
    databaseVersion: db.version,
    stores: data,
  };
}

export async function importDatabase(backup) {
  if (!backup || backup.format !== 'pampanaa-backup' || backup.version !== EXPORT_VERSION) {
    throw new Error('Unsupported or invalid Pampanaa backup.');
  }

  const db = await getDB();
  if (!db) throw new Error('IndexedDB is unavailable.');

  const tx = db.transaction(exportStores, 'readwrite');
  for (const storeName of exportStores) {
    const store = tx.objectStore(storeName);
    await store.clear();
    for (const record of Array.isArray(backup.stores?.[storeName]) ? backup.stores[storeName] : []) {
      await store.put(record);
    }
  }
  await tx.done;
}
