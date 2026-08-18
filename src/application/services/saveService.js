import { indexedDbSaveRepository } from '../../infrastructure/persistence/indexeddb/saveRepository';

export function createSaveService(repository = indexedDbSaveRepository) {
  return Object.freeze({ ...repository });
}

export const saveService = createSaveService();
