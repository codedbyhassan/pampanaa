import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { DEFAULT_SETTINGS, getSettings, updateSettings } from '../database/settings';
import { DEFAULT_PROGRESS, getProgress, updateProgress } from '../database/progress';
import { loadLatestSave } from '../database/saves';
import { getUnlockedAchievements, unlockAchievement } from '../database/achievements';
import soundManager from '../components/audio/SoundManager';

const GameContext = createContext(null);

export function GameProvider({ children }) {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [progress, setProgress] = useState(DEFAULT_PROGRESS);
  const [unlockedAchievements, setUnlockedAchievements] = useState([]);
  const [hasSave, setHasSave] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [toasts, setToasts] = useState([]);

  // HUD-facing state — only ever updated on discrete engine events.
  const [status, setStatus] = useState('idle');
  const [hud, setHud] = useState({
    score: 0,
    health: 100,
    wave: 1,
    weapon: 'blaster',
    buffs: { shield: 0, rapidFire: 0, scoreMultiplier: 0 },
    boss: null,
    waveBanner: false,
    unlockedWeapons: ['blaster'],
  });
  const statusRef = useRef('idle');

  const refreshAll = useCallback(async () => {
    const [s, p, a, save] = await Promise.all([
      getSettings(),
      getProgress(),
      getUnlockedAchievements(),
      loadLatestSave(),
    ]);
    setSettings(s);
    setProgress(p);
    setUnlockedAchievements(a);
    setHasSave(!!save);
    soundManager.setVolume(s.volume);
    setLoaded(true);
  }, []);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  const saveSettings = useCallback(async (patch) => {
    const next = await updateSettings(patch);
    setSettings(next);
    if (patch.volume !== undefined) soundManager.setVolume(next.volume);
    return next;
  }, []);

  const saveProgress = useCallback(async (patch) => {
    const next = await updateProgress(patch);
    setProgress(next);
    return next;
  }, []);

  const pushToast = useCallback((achievement) => {
    const id = `${achievement.id}-${Date.now()}`;
    setToasts((prev) => [...prev, { ...achievement, toastId: id }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.toastId !== id)), 3200);
  }, []);

  const tryUnlockAchievement = useCallback(
    async (def) => {
      const created = await unlockAchievement(def.id);
      if (!created) return false;
      setUnlockedAchievements(await getUnlockedAchievements());
      pushToast(def);
      soundManager.play('unlock');
      return true;
    },
    [pushToast],
  );

  /** Engine → React bridge. Called only when values actually change. */
  const syncFromEngine = useCallback((partial) => {
    if (partial.status) {
      statusRef.current = partial.status;
      setStatus(partial.status);
    }
    const { status: _s, ...rest } = partial;
    if (Object.keys(rest).length) setHud((prev) => ({ ...prev, ...rest }));
  }, []);

  const setGameStatus = useCallback((next) => {
    statusRef.current = next;
    setStatus(next);
  }, []);

  const resetHud = useCallback((initial = {}) => {
    setHud({
      score: 0,
      health: 100,
      wave: 1,
      weapon: 'blaster',
      buffs: { shield: 0, rapidFire: 0, scoreMultiplier: 0 },
      boss: null,
      waveBanner: false,
      unlockedWeapons: ['blaster'],
      ...initial,
    });
  }, []);

  const value = useMemo(
    () => ({
      loaded,
      settings,
      progress,
      unlockedAchievements,
      hasSave,
      setHasSave,
      refreshAll,
      saveSettings,
      saveProgress,
      tryUnlockAchievement,
      toasts,
      status,
      statusRef,
      setGameStatus,
      hud,
      syncFromEngine,
      resetHud,
    }),
    [
      loaded,
      settings,
      progress,
      unlockedAchievements,
      hasSave,
      refreshAll,
      saveSettings,
      saveProgress,
      tryUnlockAchievement,
      toasts,
      status,
      setGameStatus,
      hud,
      syncFromEngine,
      resetHud,
    ],
  );

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within GameProvider');
  return ctx;
}

export default GameContext;
