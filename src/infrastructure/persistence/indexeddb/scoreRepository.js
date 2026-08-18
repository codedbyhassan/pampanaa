import { addScore, getProfileScores, getTopScores } from '../../../database/scores';
import { createScoreRepository } from '../../../domain/scores/scoreRepository';

export const indexedDbScoreRepository = createScoreRepository({
  add: addScore,
  top: getTopScores,
  profile: getProfileScores,
});
