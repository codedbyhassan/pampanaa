import GameContainer from '../components/game/GameContainer';
import { useGame } from '../contexts/GameContext';

export function GamePage({ mode, resumeSnapshot, onQuit }) {
  const { settings, saveSettings } = useGame();

  if (!settings.hasSeenOnboarding) {
    return (
      <div className="sg-panel sg-stack">
        <h2 className="sg-h2">How to play</h2>
        <ul className="sg-list">
          <li><span>Move</span><b>WASD / arrows</b></li>
          <li><span>Aim &amp; fire</span><b>Mouse or Space</b></li>
          <li><span>Switch weapon</span><b>Scroll wheel · 1–5 · Q/E</b></li>
          <li><span>Pause</span><b>Escape</b></li>
        </ul>
        <p className="sg-muted" style={{ margin: 0, lineHeight: 1.7 }}>
          Enemies arrive in choreographed formations and hold their lanes — clear the
          whole squad to advance. Power-ups drift down to you, so stay under them.
        </p>
        <button
          className="sg-btn sg-btn--primary"
          onClick={() => saveSettings({ hasSeenOnboarding: true })}
        >
          Launch
        </button>
      </div>
    );
  }

  return <GameContainer mode={mode} resumeSnapshot={resumeSnapshot} onQuit={onQuit} />;
}

export default GamePage;
