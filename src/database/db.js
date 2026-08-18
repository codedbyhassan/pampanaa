import { openDB } from 'idb';

export const DB_NAME = 'shooting-game';
export const DB_VERSION = 7;

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

function ensureStore(db, transaction, name, options = {}) {
  return db.objectStoreNames.contains(name) ? transaction.objectStore(name) : db.createObjectStore(name, options);
}

function upgradeDatabase(db, transaction, oldVersion) {
  const scores = ensureStore(db, transaction, STORES.SCORES, { keyPath: 'id', autoIncrement: true });
  ensureIndex(scores, 'score', 'score');
  ensureIndex(scores, 'mode', 'mode');
  ensureIndex(scores, 'profile', 'profile');
  ensureIndex(scores, 'profileId', 'profileId');

  ensureStore(db, transaction, STORES.SETTINGS, { keyPath: 'key' });
  ensureStore(db, transaction, STORES.PROGRESS, { keyPath: 'key' });

  const saves = ensureStore(db, transaction, STORES.SAVES, { keyPath: 'id' });
  ensureIndex(saves, 'timestamp', 'timestamp');
  ensureIndex(saves, 'profile', 'profile');
  ensureIndex(saves, 'profileId', 'profileId');

  const achievements = ensureStore(db, transaction, STORES.ACHIEVEMENTS, { keyPath: 'id' });
  ensureIndex(achievements, 'profileId', 'profileId');

  const profiles = ensureStore(db, transaction, STORES.PROFILES, { keyPath: 'name' });
  ensureIndex(profiles, 'lastPlayed', 'lastPlayed');
  ensureIndex(profiles, 'profileId', 'profileId', { unique: true });

  if (oldVersion < 7) {
    // v7 reserves the schema for persistence hardening. Existing key paths are
    // retained for backwards compatibility while ownership is enforced by
    // the domain models and adapters.
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
