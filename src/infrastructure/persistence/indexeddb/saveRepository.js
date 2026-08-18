import {
  clearSave,
  deletePreset,
  listPresets,
  loadLatestSave,
  loadPreset,
  overwritePreset,
  saveGame,
  savePreset,
  updatePresetName,
} from '../../../database/saves';
import { createSaveRepository } from '../../../domain/saves/saveRepository';

export const indexedDbSaveRepository = createSaveRepository({
  saveLatest: saveGame,
  loadLatest: loadLatestSave,
  clearLatest: clearSave,
  savePreset,
  listPresets,
  loadPreset,
  overwritePreset,
  renamePreset: updatePresetName,
  deletePreset,
});
