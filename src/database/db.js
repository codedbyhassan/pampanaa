import { openDB } from 'idb';

export const DB_NAME = 'shooting-game';
export const DB_VERSION = 6;

export const STORES = Object.freeze({
  SCORES: 'highScores',
  SETTINGS: 'settings',
  PROGRESS: 'playerProgress',
  SAVES: 'savedGames',
  ACHIEVEMENTS: 'achievements',
  PROFILES: 'profiles',
});

let dbPromise = null;

function ensureIndex(store, name, keyPath, options) {
  if (!store.indexNames.contains(name)) store.createIndex(name, keyPath, options);
}

function upgradeDatabase(db, transaction, oldVersion) {
  if (!db.objectStoreNames.contains(STORES.SCORES)) {
    const store = db.createObjectStore(STORES.SCORES, { keyPath: 'id', autoIncrement: true });
    ensureIndex(store, 'score', 'score');
    ensureIndex(store, 'mode', 'mode');
    ensureIndex(store, 'profile', 'profile');
    ensureIndex(store, 'profileId', 'profileId');
  } else {
    const store = transaction.objectStore(STORES.SCORES);
    ensureIndex(store, 'score', 'score');
    ensureIndex(store, 'mode', 'mode');
    ensureIndex(store, 'profile', 'profile');
    ensureIndex(store, 'profileId', 'profileId');
  }

  if (!db.objectStoreNames.contains(STORES.SETTINGS)) {
    db.createObjectStore(STORES.SETTINGS, { keyPath: 'key' });
  }

  if (!db.objectStoreNames.contains(STORES.PROGRESS)) {
    db.createObjectStore(STORES.PROGRESS, { keyPath: 'key' });
  }

  if (!db.objectStoreNames.contains(STORES.SAVES)) {
    const store = db.createObjectStore(STORES.SAVES, { keyPath: 'id' });
    ensureIndex(store, 'timestamp', 'timestamp');
    ensureIndex(store, 'profile', 'profile');
    ensureIndex(store, 'profileId', 'profileId');
  } else {
    const store = transaction.objectStore(STORES.SAVES);
    ensureIndex(store, 'timestamp', 'timestamp');
    ensureIndex(store, 'profile', 'profile');
    ensureIndex(store, 'profileId', 'profileId');
  }

  if (!db.objectStoreNames.contains(STORES.ACHIEVEMENTS)) {
    const store = db.createObjectStore(STORES.ACHIEVEMENTS, { keyPath: 'id' });
    ensureIndex(store, 'profileId', 'profileId');
  } else {
    ensureIndex(transaction.objectStore(STORES.ACHIEVEMENTS), 'profileId', 'profileId');
  }

  if (!db.objectStoreNames.contains(STORES.PROFILES)) {
    const store = db.createObjectStore(STORES.PROFILES, { keyPath: 'name' });
    ensureIndex(store, 'lastPlayed', 'lastPlayed');
    ensureIndex(store, 'profileId', 'profileId', { unique: true });
  } else {
    const store = transaction.objectStore(STORES.PROFILES);
    ensureIndex(store, 'lastPlayed', 'lastPlayed');
    ensureIndex(store, 'profileId', 'profileId', { unique: true });
  }

  // v6: profiles gain immutable IDs. Existing records are backfilled by the
  // profile migration so old installations remain readable.
  if (oldVersion < 6) {
    // The migration is intentionally data-safe: legacy name keys remain the
    // primary key until a later major schema migration can change ownership.
  }
}

export function getDB() {
  if (typeof window === 'undefined' && typeof indexedDB === 'undefined') return Promise.resolve(null);

  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion, newVersion, transaction) {
        upgradeDatabase(db, transaction, oldVersion);
        if (oldVersion > 0 && newVersion > oldVersion) {
          console.info(`[Pampanaa] IndexedDB upgraded ${oldVersion} → ${newVersion}.`);
        }
      },
      blocked() {
        console.warn('[Pampanaa] IndexedDB upgrade is blocked by another open tab/window.');
      },
      blocking() {
        console.warn('[Pampanaa] This database connection is blocking a newer schema version.');
      },
      terminated() {
        dbPromise = null;
      },
    }).catch((error) => {
      dbPromise = null;
      console.error('[Pampanaa] Failed to open IndexedDB.', error);
      throw error;
    });
  }

  return dbPromise;
}

export async function withTransaction(storeNames, mode, callback) {
  const db = await getDB();
  if (!db) return null;

  const tx = db.transaction(storeNames, mode);
  try {
    const result = await callback(tx);
    await tx.done;
    return result;
  } catch (error) {
    try { tx.abort(); } catch { /* already completed/aborted */ }
    throw error;
  }
}
