export const GAME_EVENTS = Object.freeze({
  SESSION_STARTED: 'session.started',
  MISSION_STARTED: 'mission.started',
  OBJECTIVE_UPDATED: 'objective.updated',
  ENCOUNTER_STARTED: 'encounter.started',
  WAVE_STARTED: 'wave.started',
  WAVE_COMPLETED: 'wave.completed',
  PLAYER_DAMAGED: 'player.damaged',
  ENEMY_DEFEATED: 'enemy.defeated',
  BOSS_DEFEATED: 'boss.defeated',
  PICKUP_COLLECTED: 'pickup.collected',
  WEAPON_UNLOCKED: 'weapon.unlocked',
  DISCOVERY_MADE: 'discovery.made',
  MISSION_COMPLETED: 'mission.completed',
  MISSION_FAILED: 'mission.failed',
  SESSION_ENDED: 'session.ended',
});

export function createGameEvent(type, payload = {}, occurredAt = Date.now()) {
  if (!Object.values(GAME_EVENTS).includes(type)) throw new TypeError(`Unknown Pampanaa game event: ${type}`);
  return Object.freeze({ type, payload: Object.freeze({ ...payload }), occurredAt });
}
