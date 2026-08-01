import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import soundManager from '../components/audio/SoundManager';
import { useGame } from './GameContext';

const AudioCtx = createContext(null);

export function AudioProvider({ children }) {
  const { settings, saveSettings } = useGame();
  const [volume, setVolumeState] = useState(settings.volume);

  useEffect(() => {
    setVolumeState(settings.volume);
    soundManager.setVolume(settings.volume);
  }, [settings.volume]);

  const setVolume = useCallback(
    (v) => {
      setVolumeState(v);
      soundManager.setVolume(v);
      saveSettings({ volume: v });
    },
    [saveSettings],
  );

  const resumeAudio = useCallback(() => {
    soundManager.init();
    soundManager.setVolume(volume);
  }, [volume]);

  const value = useMemo(
    () => ({ volume, setVolume, resumeAudio, sound: soundManager }),
    [volume, setVolume, resumeAudio],
  );

  return <AudioCtx.Provider value={value}>{children}</AudioCtx.Provider>;
}

export function useAudio() {
  const ctx = useContext(AudioCtx);
  if (!ctx) throw new Error('useAudio must be used within AudioProvider');
  return ctx;
}
