import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { gameStateService } from '../application/services/gameStateService';
import { profileService } from '../application/services/profileService';
import soundManager from '../components/audio/SoundManager';

const GameContext = createContext(null);

const INITIAL_HUD = Object.freeze({
  score: 0,
  health: 100,
  wave: 1,
  weapon: 'blaster',
  buffs: { shield: 0, rapidFire: 0, scoreMultiplier: 0 },
  amps: { damage: 0, fire: 0, pierce: 0, multishot: 0 },
  combo: 0,
  comboMultiplier: 1,
  boss: null,
  waveBanner: false,
  waveMastery: null,
  unlockedWeapons: ['blaster'],
});

function configureAudio(settings) {
  soundManager.setVolume(settings.volume);
  soundManager.setSfxEnabled?.(settings.sfxEnabled !== false);
  soundManager.setMusicEnabled?.(settings.musicEnabled !== false);
  soundManager.setMusicVolume?.(settings.musicVolume ?? 0.35);
}

export function GameProvider({ children }) {
  const [profile, setProfile] = useState(null);
  const [settings, setSettings] = useState(gameStateService.defaults.settings);
  const [progress, setProgress] = useState(gameStateService.defaults.progress);
  const [unlockedAchievements, setUnlockedAchievements] = useState([]);
  const [hasSave, setHasSave] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [status, setStatus] = useState('idle');
  const [hud, setHud] = useState(() => ({ ...INITIAL_HUD }));
  const statusRef = useRef('idle');

  const refreshAll = useCallback(async () => {
    const snapshot = await gameStateService.loadSnapshot();
    setProfile(profileService.getActiveName());
    setSettings(snapshot.settings);
    setProgress(snapshot.progress);
    setUnlockedAchievements(snapshot.achievements);
    setHasSave(snapshot.hasSave);
    configureAudio(snapshot.settings);
    setLoaded(true);
  }, []);

  useEffect(() => {
    refreshAll().catch(() => setLoaded(true));
  }, [refreshAll]);

  const signIn = useCallback(async (name) => {
    const record = await profileService.signIn(name);
    if (!record) return null;
    await refreshAll();
    return record;
  }, [refreshAll]);

  const signOut = useCallback(async () => {
    profileService.signOut();
    setProfile(null);
    setSettings(gameStateService.defaults.settings);
    setProgress(gameStateService.defaults.progress);
    setUnlockedAchievements([]);
    setHasSave(false);
  }, []);

  const saveSettings = useCallback(async (patch) => {
    const next = await gameStateService.updateSettings(patch);
    setSettings(next);
    configureAudio(next);
    return next;
  }, []);

  const saveProgress = useCallback(async (patch) => {
    const next = await gameStateService.updateProgress(patch);
    setProgress(next);
    await profileService.touch({ highestWaveReached: next.highestWaveReached });
    return next;
  }, []);

  const renameProfile = useCallback(async (newName) => {
    const next = await profileService.rename(newName);
    if (!next) return null;
    await refreshAll();
    return next;
  }, [refreshAll]);

  const pushToast = useCallback((achievement) => {
    const id = `${achievement.id}-${Date.now()}`;
    setToasts((prev) => [...prev, { ...achievement, toastId: id }]);
    window.setTimeout(() => setToasts((prev) => prev.filter((t) => t.toastId !== id)), 3200);
  }, []);

  const tryUnlockAchievement = useCallback(async (def) => {
    const created = await gameStateService.unlockAchievement(def.id);
    if (!created) return false;
    setUnlockedAchievements(await gameStateService.getUnlockedAchievements());
    pushToast(def);
    soundManager.play('unlock');
    return true;
  }, [pushToast]);

  const syncFromEngine = useCallback((partial) => {
    if (partial.status) {
      statusRef.current = partial.status;
      setStatus(partial.status);
    }
    const { status: _status, ...hudPatch } = partial;
    if (Object.keys(hudPatch).length) setHud((prev) => ({ ...prev, ...hudPatch }));
  }, []);

  const setGameStatus = useCallback((next) => {
    statusRef.current = next;
    setStatus(next);
  }, []);

  const resetHud = useCallback((initial = {}) => {
    setHud({ ...INITIAL_HUD, ...initial });
  }, []);

  const value = useMemo(() => ({
    loaded,
    profile,
    signIn,
    signOut,
    settings,
    progress,
    unlockedAchievements,
    hasSave,
    setHasSave,
    refreshAll,
    saveSettings,
    saveProgress,
    renameProfile,
    tryUnlockAchievement,
    pushToast,
    toasts,
    status,
    statusRef,
    setGameStatus,
    hud,
    syncFromEngine,
    resetHud,
  }), [
    loaded, profile, signIn, signOut, settings, progress, unlockedAchievements,
    hasSave, refreshAll, saveSettings, saveProgress, renameProfile,
    tryUnlockAchievement, pushToast, toasts, status, setGameStatus, hud,
    syncFromEngine, resetHud,
  ]);

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) throw new Error('useGame must be used within GameProvider');
  return context;
}

export default GameContext;
