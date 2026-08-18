import { asString, freezeModel } from '../shared/schema';

export const DEFAULT_PROGRESSION = Object.freeze({
  rank: 1,
  experience: 0,
  experienceToNextRank: 100,
  missionsCompleted: 0,
  encountersResolved: 0,
  enemiesDefeated: 0,
  bossesDefeated: 0,
  discoveries: 0,
  achievements: 0,
  unlockedWeapons: [],
});

export function createPlayerProgression(input = {}) {
  return freezeModel({
    profileId: asString(input.profileId),
    rank: Number.isInteger(input.rank) && input.rank > 0 ? input.rank : DEFAULT_PROGRESSION.rank,
    experience: Math.max(0, Number(input.experience) || 0),
    experienceToNextRank: Math.max(1, Number(input.experienceToNextRank) || DEFAULT_PROGRESSION.experienceToNextRank),
    missionsCompleted: Math.max(0, Number(input.missionsCompleted) || 0),
    encountersResolved: Math.max(0, Number(input.encountersResolved) || 0),
    enemiesDefeated: Math.max(0, Number(input.enemiesDefeated) || 0),
    bossesDefeated: Math.max(0, Number(input.bossesDefeated) || 0),
    discoveries: Math.max(0, Number(input.discoveries) || 0),
    achievements: Math.max(0, Number(input.achievements) || 0),
    unlockedWeapons: Array.isArray(input.unlockedWeapons) ? [...new Set(input.unlockedWeapons.map(String))] : [],
  });
}

export function addExperience(progression, amount) {
  let experience = progression.experience + Math.max(0, Number(amount) || 0);
  let rank = progression.rank;
  let threshold = progression.experienceToNextRank;
  while (experience >= threshold) {
    experience -= threshold;
    rank += 1;
    threshold = Math.ceil(threshold * 1.25);
  }
  return createPlayerProgression({ ...progression, rank, experience, experienceToNextRank: threshold });
}

export function recordProgressionEvent(progression, event) {
  const changes = {
    MISSION_COMPLETED: { missionsCompleted: progression.missionsCompleted + 1, experience: 100 },
    ENCOUNTER_RESOLVED: { encountersResolved: progression.encountersResolved + 1, experience: 25 },
    ENEMY_DEFEATED: { enemiesDefeated: progression.enemiesDefeated + 1, experience: 5 },
    BOSS_DEFEATED: { bossesDefeated: progression.bossesDefeated + 1, experience: 50 },
    DISCOVERY_MADE: { discoveries: progression.discoveries + 1, experience: 75 },
    ACHIEVEMENT_UNLOCKED: { achievements: progression.achievements + 1, experience: 100 },
  }[event?.type];
  if (!changes) return progression;
  return addExperience(createPlayerProgression({ ...progression, ...changes }), changes.experience);
}
