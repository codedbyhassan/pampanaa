import { appService } from '../services/appService';

export const gameStateUseCases = Object.freeze({
  load: () => appService.gameState.load(),
  saveSettings: (patch) => appService.gameState.saveSettings(patch),
  saveProgress: (patch) => appService.gameState.saveProgress(patch),
  saveLatest: (snapshot) => appService.saves.saveLatest(snapshot),
  loadLatest: () => appService.saves.loadLatest(),
  clearLatest: () => appService.saves.clearLatest(),
});
