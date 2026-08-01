import { useState } from 'react';
import { GameProvider, useGame } from './contexts/GameContext';
import { AudioProvider } from './contexts/AudioContext';
import MainMenu from './pages/MainMenu';
import GamePage from './pages/GamePage';
import Leaderboard from './pages/Leaderboard';
import Settings from './pages/Settings';
import Achievements from './pages/Achievements';
import Stats from './pages/Stats';
import AchievementToast from './components/game/AchievementToast';
import './styles/global.css';

function Shell() {
  const { loaded, refreshAll } = useGame();
  const [page, setPage] = useState('menu');
  const [mode, setMode] = useState('campaign');
  const [resumeSnapshot, setResumeSnapshot] = useState(null);

  const quitToMenu = () => {
    setResumeSnapshot(null);
    setPage('menu');
    refreshAll();
  };

  if (!loaded) return <div className="sg-panel sg-subtitle">Loading…</div>;

  return (
    <>
      {page === 'menu' && (
        <MainMenu
          onNavigate={setPage}
          onStart={(m) => {
            setMode(m);
            setResumeSnapshot(null);
            setPage('game');
          }}
          onContinue={(save) => {
            setMode(save.mode || 'campaign');
            setResumeSnapshot(save);
            setPage('game');
          }}
        />
      )}
      {page === 'game' && (
        <GamePage mode={mode} resumeSnapshot={resumeSnapshot} onQuit={quitToMenu} />
      )}
      {page === 'leaderboard' && <Leaderboard onBack={quitToMenu} />}
      {page === 'settings' && <Settings onBack={quitToMenu} />}
      {page === 'achievements' && <Achievements onBack={quitToMenu} />}
      {page === 'stats' && <Stats onBack={quitToMenu} />}
      <AchievementToast />
    </>
  );
}

/** Applies the selected interface skin to the app root. */
function ThemedRoot({ children }) {
  const { settings } = useGame();
  return (
    <div className="sg-root" data-ui-theme={settings.uiTheme || 'nebula'}>
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
