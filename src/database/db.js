import { openDB } from 'idb';

export const DB_NAME = 'shooting-game';
export const DB_VERSION = 5;

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

function upgradeDatabase(db) {
  if (!db.objectStoreNames.contains(STORES.SCORES)) {
    const store = db.createObjectStore(STORES.SCORES, { keyPath: 'id', autoIncrement: true });
    ensureIndex(store, 'score', 'score');
    ensureIndex(store, 'mode', 'mode');
    ensureIndex(store, 'profile', 'profile');
  } else {
    const store = db.transaction.objectStore(STORES.SCORES);
    ensureIndex(store, 'score', 'score');
    ensureIndex(store, 'mode', 'mode');
    ensureIndex(store, 'profile', 'profile');
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
  } else {
    const store = db.transaction.objectStore(STORES.SAVES);
    ensureIndex(store, 'timestamp', 'timestamp');
    ensureIndex(store, 'profile', 'profile');
  }

  if (!db.objectStoreNames.contains(STORES.ACHIEVEMENTS)) {
    db.createObjectStore(STORES.ACHIEVEMENTS, { keyPath: 'id' });
  }

  // v4 — name-based player profiles. Kept for backward compatibility with
  // existing installations. Profile-owned records remain namespaced by key.
  if (!db.objectStoreNames.contains(STORES.PROFILES)) {
    const store = db.createObjectStore(STORES.PROFILES, { keyPath: 'name' });
    ensureIndex(store, 'lastPlayed', 'lastPlayed');
  } else {
    const store = db.transaction.objectStore(STORES.PROFILES);
    ensureIndex(store, 'lastPlayed', 'lastPlayed');
  }
}

export function getDB() {
  if (typeof window === 'undefined' && typeof indexedDB === 'undefined') return Promise.resolve(null);

  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        upgradeDatabase(db);
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

/**
 * Runs a callback inside one IndexedDB transaction. The callback receives the
 * transaction object so related writes can commit or roll back together.
 */
export async function withTransaction(storeNames, mode, callback) {
  const db = await getDB();
  if (!db) return null;

  const tx = db.transaction(storeNames, mode);
  try {
    const result = await callback(tx);
    await tx.done;
    return result;
  } catch (error) {
    try {
      tx.abort();
    } catch {
      // The transaction may already have completed or aborted.
    }
    throw error;
  }
}
