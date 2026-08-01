import { openDB } from 'idb';

const DB_NAME = 'shooting-game';
const DB_VERSION = 3;

let dbPromise = null;

export function getDB() {
  if (typeof window === 'undefined') return Promise.resolve(null);
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('highScores')) {
          const store = db.createObjectStore('highScores', {
            keyPath: 'id',
            autoIncrement: true,
          });
          store.createIndex('score', 'score');
        }
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'key' });
        }
        if (!db.objectStoreNames.contains('playerProgress')) {
          db.createObjectStore('playerProgress', { keyPath: 'key' });
        }
        if (!db.objectStoreNames.contains('savedGames')) {
          const store = db.createObjectStore('savedGames', { keyPath: 'id' });
          store.createIndex('timestamp', 'timestamp');
        }
        if (!db.objectStoreNames.contains('achievements')) {
          db.createObjectStore('achievements', { keyPath: 'id' });
        }
      },
    });
  }
  return dbPromise;
}
