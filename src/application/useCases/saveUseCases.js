import { appService } from '../services/appService';

export const saveUseCases = Object.freeze({
  saveLatest: (snapshot) => appService.saves.saveLatest(snapshot),
  loadLatest: () => appService.saves.loadLatest(),
  clearLatest: () => appService.saves.clearLatest(),
  savePreset: (snapshot, name) => appService.saves.savePreset(snapshot, name),
  listPresets: () => appService.saves.listPresets(),
  loadPreset: (id) => appService.saves.loadPreset(id),
  overwritePreset: (id, snapshot) => appService.saves.overwritePreset(id, snapshot),
  renamePreset: (id, name) => appService.saves.renamePreset(id, name),
  deletePreset: (id) => appService.saves.deletePreset(id),
});
