import { appService } from '../services/appService';

export const scoreUseCases = Object.freeze({
  add: (payload) => appService.scores.add(payload),
  top: (limit, mode) => appService.scores.top(limit, mode),
  profile: (limit, mode) => appService.scores.profile(limit, mode),
});
