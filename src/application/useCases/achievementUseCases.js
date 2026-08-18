import { appService } from '../services/appService';

export const achievementUseCases = Object.freeze({
  listUnlocked: () => appService.achievements.listUnlocked(),
  unlock: (id) => appService.achievements.unlock(id),
});
