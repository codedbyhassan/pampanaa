import { indexedDbScoreRepository } from '../../infrastructure/persistence/indexeddb/scoreRepository';

export function createScoreService(repository = indexedDbScoreRepository) {
  return Object.freeze({
    add: repository.add,
    top: repository.top,
    profile: repository.profile,
  });
}

export const scoreService = createScoreService();
