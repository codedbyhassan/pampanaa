import { createProfileId, isValidProfileId, normaliseProfileName } from './profile';
import { DOMAIN_SCHEMA_VERSION, asNonNegativeInteger, asString, freezeModel } from '../shared/schema';

export const PROFILE_SCHEMA_VERSION = DOMAIN_SCHEMA_VERSION;
export const MAX_PROFILE_NAME_LENGTH = 24;

export function createProfile(input = {}) {
  const name = normaliseProfileName(input.name, MAX_PROFILE_NAME_LENGTH);
  if (!name) throw new Error('A profile requires a name.');

  const profileId = isValidProfileId(input.profileId) ? input.profileId : createProfileId();
  const createdAt = asNonNegativeInteger(input.createdAt, Date.now());
  const lastPlayed = asNonNegativeInteger(input.lastPlayed, createdAt);

  return freezeModel({
    profileId,
    name,
    createdAt,
    lastPlayed,
    sessions: asNonNegativeInteger(input.sessions),
    schemaVersion: PROFILE_SCHEMA_VERSION,
  });
}

export function renameProfileModel(profile, name) {
  return createProfile({ ...profile, name: asString(name).trim() });
}

export function touchProfileModel(profile, patch = {}) {
  return createProfile({
    ...profile,
    ...patch,
    profileId: profile.profileId,
    name: profile.name,
    lastPlayed: Date.now(),
  });
}
