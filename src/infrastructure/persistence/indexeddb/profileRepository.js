import {
  deleteProfile,
  getActiveProfileName,
  getProfile,
  listProfiles,
  renameProfile,
  setActiveProfileName,
  signIn,
  signOut,
  touchProfile,
} from '../../../database/profiles';
import { createProfileRepository } from '../../../domain/profiles/profileRepository';

/** IndexedDB adapter for the domain profile repository. */
export const indexedDbProfileRepository = createProfileRepository({
  list: listProfiles,
  get: getProfile,
  signIn,
  rename: renameProfile,
  signOut,
  touch: touchProfile,
  remove: deleteProfile,
  getActiveName: getActiveProfileName,
  setActiveName: setActiveProfileName,
});
