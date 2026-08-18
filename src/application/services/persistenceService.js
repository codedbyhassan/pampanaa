import { healthCheck } from '../../infrastructure/persistence/indexeddb/persistence';
import { exportDatabase, importDatabase } from '../../infrastructure/persistence/indexeddb/backup';
import { clearDatabase, clearProfileData } from '../../infrastructure/persistence/indexeddb/recovery';

export const persistenceService = Object.freeze({
  healthCheck,
  exportDatabase,
  importDatabase,
  clearDatabase,
  clearProfileData,
});
