import { DOMAIN_SCHEMA_VERSION, asBoolean, asNonNegativeInteger, asString, freezeModel } from '../shared/schema';

export const SAVE_SCHEMA_VERSION = DOMAIN_SCHEMA_VERSION;
export const MAX_PRESET_NAME_LENGTH = 40;

export function normalisePresetName(name, fallback = 'New Preset') {
  return asString(name, fallback).trim().slice(0, MAX_PRESET_NAME_LENGTH) || fallback;
}

export function createSave(input = {}) {
  if (!input.profileId) throw new Error('A save requires profileId ownership.');

  return freezeModel({
    ...input,
    profileId: input.profileId,
    presetName: normalisePresetName(input.presetName, input.isAutoSave ? 'Latest Session' : 'New Preset'),
    timestamp: asNonNegativeInteger(input.timestamp, Date.now()),
    isAutoSave: asBoolean(input.isAutoSave),
    schemaVersion: SAVE_SCHEMA_VERSION,
  });
}

export function createLatestSave(input = {}) {
  return createSave({ ...input, presetName: 'Latest Session', isAutoSave: true });
}

export function createPresetSave(input = {}, presetName) {
  return createSave({ ...input, presetName: normalisePresetName(presetName), isAutoSave: false });
}
