import { DEFAULT_SETTINGS } from './defaultSettings';
import { DOMAIN_SCHEMA_VERSION, asBoolean, asFiniteNumber, asInteger, clone, freezeModel } from '../shared/schema';

export const SETTINGS_SCHEMA_VERSION = DOMAIN_SCHEMA_VERSION;

export function createSettings(input = {}) {
  const source = input || {};
  const keymap = { ...DEFAULT_SETTINGS.keymap, ...(source.keymap || {}) };
  return freezeModel({
    ...clone(DEFAULT_SETTINGS),
    ...source,
    keymap,
    volume: Math.min(1, Math.max(0, asFiniteNumber(source.volume, DEFAULT_SETTINGS.volume))),
    difficultyLevel: Math.min(10, Math.max(1, asInteger(source.difficultyLevel, DEFAULT_SETTINGS.difficultyLevel))),
    musicEnabled: asBoolean(source.musicEnabled, DEFAULT_SETTINGS.musicEnabled),
    sfxEnabled: asBoolean(source.sfxEnabled, DEFAULT_SETTINGS.sfxEnabled),
    musicVolume: Math.min(1, Math.max(0, asFiniteNumber(source.musicVolume, DEFAULT_SETTINGS.musicVolume))),
    schemaVersion: SETTINGS_SCHEMA_VERSION,
  });
}

export function patchSettings(current, patch = {}) {
  return createSettings({ ...current, ...patch });
}
