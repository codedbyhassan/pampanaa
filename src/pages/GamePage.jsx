import { useEffect, useState } from 'react';
import GameContainer from '../components/game/GameContainer';
import { loadAssets } from '../canvas/assetLoader';
import { useGame } from '../contexts/GameContext';

export function GamePage({ mode, resumeSnapshot, onQuit }) {
  const { settings, saveSettings } = useGame();
  const [loaded, setLoaded] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(!settings.hasSeenOnboarding);

  useEffect(() => {
    loadAssets().then(() => setLoaded(true));
  }, []);

  if (!loaded) return <div className="sg-panel sg-subtitle">Loading…</div>;

  if (showOnboarding) {
    return (
      <div className="sg-panel sg-stack">
        <h2 className="sg-h2">How to play</h2>
        <p className="sg-muted" style={{ margin: 0, lineHeight: 1.7 }}>
          Move with WASD or arrow keys. Aim with the mouse and fire with click or Space.
          Switch weapons with keys 1–5. Press Escape to pause.
        </p>
        <button
          className="sg-btn sg-btn--primary"
          onClick={() => {
            saveSettings({ hasSeenOnboarding: true });
            setShowOnboarding(false);
          }}
        >
          Got it
        </button>
      </div>
    );
  }

  return <GameContainer mode={mode} resumeSnapshot={resumeSnapshot} onQuit={onQuit} />;
}

export default GamePage;
