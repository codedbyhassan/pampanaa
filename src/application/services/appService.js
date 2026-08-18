import { profileService } from './profileService';
import { gameStateService } from './gameStateService';
import { saveService } from './saveService';
import { achievementService } from './achievementService';
import { scoreService } from './scoreService';

/**
 * Composition root for renderer-facing application services.
 * UI code can depend on this facade instead of knowing individual
 * infrastructure adapters.
 */
export const appService = Object.freeze({
  profiles: profileService,
  gameState: gameStateService,
  saves: saveService,
  achievements: achievementService,
  scores: scoreService,
});
