import { useState } from 'react';
import { GameProvider, useGame } from './contexts/GameContext';
import { AudioProvider } from './contexts/AudioContext';
import Splash from './pages/Splash';
import MenuShell from './pages/MenuShell';
import GamePage from './pages/GamePage';
import Profile from './pages/Profile';
import AchievementToast from './components/game/AchievementToast';
import ErrorBoundary from './components/system/ErrorBoundary';
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
      // Storage can be unavailable in restricted browser contexts.
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
          onStart={(nextMode) => {
            setMode(nextMode);
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

function ThemedRoot({ children }) {
  const { settings } = useGame();

  const onPointerDown = (event) => {
    const element = event.target.closest?.('button, .sg-nav__item, .sg-choice, .sg-swatch');
    if (!element || element.disabled) return;

    soundManager.init();
    soundManager.play(element.classList.contains('sg-nav__item') ? 'autolock' : 'ui');
  };

  return (
    <div className="sg-root" data-ui-theme={settings.uiTheme || 'nebula'} onPointerDown={onPointerDown}>
      {children}
    </div>
  );
}

export function App() {
  return (
    <ErrorBoundary>
      <GameProvider>
        <AudioProvider>
          <ThemedRoot>
            <Shell />
          </ThemedRoot>
        </AudioProvider>
      </GameProvider>
    </ErrorBoundary>
  );
}

export default App;
