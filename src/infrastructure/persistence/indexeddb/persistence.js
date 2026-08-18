import { getDB, STORES, withTransaction } from '../../../database/db';

export const persistence = Object.freeze({
  getDB,
  stores: STORES,
  withTransaction,
});

export async function healthCheck() {
  const db = await getDB();
  if (!db) return { available: false, version: null };
  return { available: true, version: db.version };
}
