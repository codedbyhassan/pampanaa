import { getDB, STORES } from '../../../database/db';

export async function clearProfileData(profileId, profileName) {
  const db = await getDB();
  if (!db) return;

  const tx = db.transaction(Object.values(STORES), 'readwrite');
  const keys = [profileId, profileName];

  for (const storeName of [STORES.SETTINGS, STORES.PROGRESS, STORES.SAVES, STORES.ACHIEVEMENTS, STORES.SCORES]) {
    const store = tx.objectStore(storeName);
    const records = await store.getAll();
    for (const record of records) {
      if (record.profileId === profileId || record.profile === profileName || record.name === profileName || keys.includes(record.id) || keys.includes(record.key)) {
        await store.delete(record.id ?? record.key);
      }
    }
  }

  await tx.objectStore(STORES.PROFILES).delete(profileName);
  await tx.done;
}

export async function clearDatabase() {
  const db = await getDB();
  if (!db) return;
  const storeNames = Object.values(STORES);
  const tx = db.transaction(storeNames, 'readwrite');
  for (const storeName of storeNames) await tx.objectStore(storeName).clear();
  await tx.done;
}
