import {
  getActiveProfileName,
  renameProfile as renameProfileRecord,
  signIn as signInProfile,
  signOut as signOutProfile,
  touchProfile,
} from '../../database/profiles';

/** Application-facing profile operations. UI should not know persistence details. */
export const profileService = Object.freeze({
  getActiveName: getActiveProfileName,
  signIn: signInProfile,
  signOut: signOutProfile,
  rename: renameProfileRecord,
  touch: touchProfile,
});
