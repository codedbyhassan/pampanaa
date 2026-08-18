import { DOMAIN_SCHEMA_VERSION, asString, freezeModel } from '../shared/schema';

export const ACHIEVEMENT_SCHEMA_VERSION = DOMAIN_SCHEMA_VERSION;

export function createAchievement(input = {}) {
  const achievementId = asString(input.achievementId || input.id).trim();
  if (!achievementId) throw new Error('An achievement requires achievementId.');
  if (!input.profileId) throw new Error('An achievement requires profileId ownership.');

  return freezeModel({
    ...input,
    achievementId,
    profileId: input.profileId,
    unlockedAt: input.unlockedAt || new Date().toISOString(),
    schemaVersion: ACHIEVEMENT_SCHEMA_VERSION,
  });
}
