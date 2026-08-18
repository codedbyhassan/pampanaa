import { indexedDbProfileRepository } from '../../infrastructure/persistence/indexeddb/profileRepository';

/**
 * Application-facing profile operations.
 *
 * Consumers depend on the repository contract, not on IndexedDB modules.
 * A different persistence adapter can be injected for tests or future sync.
 */
export function createProfileService(repository = indexedDbProfileRepository) {
  return Object.freeze({
    list: repository.list,
    get: repository.get,
    getActiveName: repository.getActiveName,
    signIn: repository.signIn,
    signOut: repository.signOut,
    rename: repository.rename,
    touch: repository.touch,
    remove: repository.remove,
  });
}

export const profileService = createProfileService();
