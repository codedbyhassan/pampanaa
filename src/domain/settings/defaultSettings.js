import { DEFAULT_KEYMAP } from '../../utils/constants';

export const DEFAULT_SETTINGS = Object.freeze({
  key: 'main',
  volume: 0.5,
  difficultyLevel: 4,
  musicEnabled: true,
  sfxEnabled: true,
  musicVolume: 0.35,
  shipDesign: 'interceptor',
  controlScheme: 'auto',
  colorblind: false,
  reducedMotion: false,
  uiTheme: 'nebula',
  backgroundTheme: 'auto',
  showFps: false,
  screenShake: true,
  damageNumbers: true,
  autoSave: true,
  keymap: Object.freeze({ ...DEFAULT_KEYMAP }),
  hasSeenOnboarding: false,
});
