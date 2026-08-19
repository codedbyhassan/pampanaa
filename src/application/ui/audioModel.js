export const AUDIO_CHANNELS = Object.freeze({ MUSIC: 'music', SFX: 'sfx', UI: 'ui', AMBIENCE: 'ambience' });

export const AUDIO_EVENTS = Object.freeze({
  MENU_OPEN: 'menu.open',
  MISSION_START: 'mission.start',
  OBJECTIVE_COMPLETE: 'objective.complete',
  WAVE_START: 'wave.start',
  PLAYER_HIT: 'player.hit',
  ENEMY_DEFEATED: 'enemy.defeated',
  BOSS_APPEAR: 'boss.appear',
  MISSION_COMPLETE: 'mission.complete',
  MISSION_FAILED: 'mission.failed',
});

export function createAudioState(input = {}) {
  return Object.freeze({
    muted: Boolean(input.muted),
    volumes: Object.freeze({
      [AUDIO_CHANNELS.MUSIC]: Math.max(0, Math.min(1, Number(input.music ?? 0.7))),
      [AUDIO_CHANNELS.SFX]: Math.max(0, Math.min(1, Number(input.sfx ?? 0.9))),
      [AUDIO_CHANNELS.UI]: Math.max(0, Math.min(1, Number(input.ui ?? 0.8))),
      [AUDIO_CHANNELS.AMBIENCE]: Math.max(0, Math.min(1, Number(input.ambience ?? 0.6))),
    }),
  });
}
