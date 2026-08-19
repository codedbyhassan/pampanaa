import { asString, freezeModel } from '../shared/schema';

export const DEFAULT_PROGRESSION = Object.freeze({ rank: 1, experience: 0, experienceToNextRank: 100, missionsCompleted: 0, encountersResolved: 0, enemiesDefeated: 0, bossesDefeated: 0, discoveries: 0, achievements: 0, unlockedWeapons: [] });

const EVENT_REWARDS = Object.freeze({
  'mission.completed': { key: 'missionsCompleted', experience: 100 }, 'encounter.resolved': { key: 'encountersResolved', experience: 25 }, 'enemy.defeated': { key: 'enemiesDefeated', experience: 5 }, 'boss.defeated': { key: 'bossesDefeated', experience: 50 }, 'discovery.made': { key: 'discoveries', experience: 75 }, 'achievement.unlocked': { key: 'achievements', experience: 100 },
  MISSION_COMPLETED: { key: 'missionsCompleted', experience: 100 }, ENCOUNTER_RESOLVED: { key: 'encountersResolved', experience: 25 }, ENEMY_DEFEATED: { key: 'enemiesDefeated', experience: 5 }, BOSS_DEFEATED: { key: 'bossesDefeated', experience: 50 }, DISCOVERY_MADE: { key: 'discoveries', experience: 75 }, ACHIEVEMENT_UNLOCKED: { key: 'achievements', experience: 100 },
});

export function createPlayerProgression(input = {}) {
  return freezeModel({
    profileId: asString(input.profileId), rank: Number.isInteger(input.rank) && input.rank > 0 ? input.rank : 1,
    experience: Math.max(0, Number(input.experience) || 0), experienceToNextRank: Math.max(1, Number(input.experienceToNextRank) || 100),
    missionsCompleted: Math.max(0, Number(input.missionsCompleted) || 0), encountersResolved: Math.max(0, Number(input.encountersResolved) || 0), enemiesDefeated: Math.max(0, Number(input.enemiesDefeated) || 0), bossesDefeated: Math.max(0, Number(input.bossesDefeated) || 0), discoveries: Math.max(0, Number(input.discoveries) || 0), achievements: Math.max(0, Number(input.achievements) || 0),
    unlockedWeapons: Array.isArray(input.unlockedWeapons) ? [...new Set(input.unlockedWeapons.map(String))] : [],
  });
}

export function progressionFromLegacyProgress(progress = {}) {
  return createPlayerProgression({ profileId: progress.profileId, enemiesDefeated: progress.totalEnemiesDefeated, encountersResolved: progress.highestWaveReached, achievements: progress.unlockedAchievements?.length, unlockedWeapons: progress.unlockedWeapons });
}

export function addExperience(progression, amount) {
  let experience = progression.experience + Math.max(0, Number(amount) || 0); let rank = progression.rank; let threshold = progression.experienceToNextRank;
  while (experience >= threshold) { experience -= threshold; rank += 1; threshold = Math.ceil(threshold * 1.25); }
  return createPlayerProgression({ ...progression, rank, experience, experienceToNextRank: threshold });
}

export function recordProgressionEvent(progression, event) {
  const reward = EVENT_REWARDS[event?.type]; if (!reward) return progression;
  const count = (progression[reward.key] ?? 0) + 1;
  return addExperience(createPlayerProgression({ ...progression, [reward.key]: count }), reward.experience);
}
