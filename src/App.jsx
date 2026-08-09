import { useState } from 'react';
import { GameProvider, useGame } from './contexts/GameContext';
import { AudioProvider } from './contexts/AudioContext';
import Splash from './pages/Splash';
import MenuShell from './pages/MenuShell';
import GamePage from './pages/GamePage';
import Profile from './pages/Profile';
import AchievementToast from './components/game/AchievementToast';
import soundManager from './components/audio/SoundManager';
import './styles/global.css';

const INTRO_KEY = 'pampanaa-intro-seen';

function Shell() {
  const { loaded, profile, refreshAll } = useGame();
  const [intro, setIntro] = useState(
    () => typeof window === 'undefined' || !window.sessionStorage?.getItem(INTRO_KEY),
  );
  const [page, setPage] = useState('menu');
  const [mode, setMode] = useState('campaign');
  const [startWave, setStartWave] = useState(1);
  const [resumeSnapshot, setResumeSnapshot] = useState(null);

  const quitToMenu = () => {
    setResumeSnapshot(null);
    setPage('menu');
    refreshAll();
  };

  const dismissIntro = () => {
    try {
      window.sessionStorage?.setItem(INTRO_KEY, '1');
    } catch {
      /* storage unavailable — intro simply replays */
    }
    setIntro(false);
  };

  if (intro) return <Splash onDone={dismissIntro} />;
  if (!loaded) return <div className="sg-panel sg-subtitle">Loading…</div>;
  if (!profile) return <Profile />;

  return (
    <>
      {page === 'menu' && (
        <MenuShell
          onStart={(m) => {
            setMode(m);
            setStartWave(1);
            setResumeSnapshot(null);
            setPage('game');
          }}
          onContinue={(save) => {
            setMode(save.mode || 'campaign');
            setResumeSnapshot(save);
            setPage('game');
          }}
          onPlayWave={(wave) => {
            setMode('campaign');
            setResumeSnapshot(null);
            setStartWave(wave);
            setPage('game');
          }}
        />
      )}
      {page === 'game' && (
        <GamePage
          mode={mode}
          startWave={startWave}
          resumeSnapshot={resumeSnapshot}
          onQuit={quitToMenu}
        />
      )}
      <AchievementToast />
    </>
  );
}

/**
 * Applies the selected interface skin to the app root and gives every
 * interactive control an audible click via one delegated listener.
 */
function ThemedRoot({ children }) {
  const { settings } = useGame();
  const onPointerDown = (e) => {
    const el = e.target.closest?.('button, .sg-nav__item, .sg-choice, .sg-swatch');
    if (!el || el.disabled) return;
    soundManager.init();
    soundManager.play(el.classList.contains('sg-nav__item') ? 'autolock' : 'ui');
  };
  return (
    <div className="sg-root" data-ui-theme={settings.uiTheme || 'nebula'} onPointerDown={onPointerDown}>
      {children}
    </div>
  );
}

export function App() {
  return (
    <GameProvider>
      <AudioProvider>
        <ThemedRoot>
          <Shell />
        </ThemedRoot>
      </AudioProvider>
    </GameProvider>
  );
}

export default App;
