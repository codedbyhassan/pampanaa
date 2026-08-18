import { DOMAIN_SCHEMA_VERSION, asNonNegativeInteger, asString, freezeModel } from '../shared/schema';

export const SCORE_SCHEMA_VERSION = DOMAIN_SCHEMA_VERSION;
export const SCORE_MODES = Object.freeze(['campaign', 'endless', 'challenge']);

export function createScore(input = {}) {
  if (!input.profileId) throw new Error('A score requires profileId ownership.');

  const mode = SCORE_MODES.includes(input.mode) ? input.mode : 'campaign';
  return freezeModel({
    ...input,
    name: asString(input.name).trim() || 'Anonymous',
    profile: asString(input.profile),
    profileId: input.profileId,
    score: asNonNegativeInteger(input.score),
    wave: Math.max(1, asNonNegativeInteger(input.wave, 1)),
    mode,
    date: input.date || new Date().toISOString(),
    schemaVersion: SCORE_SCHEMA_VERSION,
  });
}

export function compareScores(a, b) {
  return (b?.score || 0) - (a?.score || 0) || new Date(b?.date || 0) - new Date(a?.date || 0);
}
