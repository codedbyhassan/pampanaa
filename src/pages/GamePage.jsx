import GameContainer from '../components/game/GameContainer';
import { useGame } from '../contexts/GameContext';

export function GamePage({ mode, missionId = 'mission_1', startWave = 1, resumeSnapshot, onQuit }) {
  const { settings, saveSettings } = useGame();

  if (!settings.hasSeenOnboarding) {
    return (
      <div className="sg-panel sg-stack">
        <div className="sg-label">Mission briefing</div>
        <h2 className="sg-h2">The Last Watch</h2>
        <p className="sg-muted" style={{ margin: 0, lineHeight: 1.7 }}>
          The Haven has survived by staying silent. Tonight, something has answered the perimeter.
          Hold the settlement, survive the encounter and investigate the signal.
        </p>
        <ul className="sg-list">
          <li><span>Move</span><b>WASD / arrows</b></li>
          <li><span>Aim &amp; fire</span><b>Mouse or Space</b></li>
          <li><span>Switch weapon</span><b>Scroll wheel · 1–7 · Q/E</b></li>
          <li><span>Pause</span><b>Escape</b></li>
        </ul>
        <button className="sg-btn sg-btn--primary" onClick={() => saveSettings({ hasSeenOnboarding: true })}>Enter the mission</button>
      </div>
    );
  }

  return <GameContainer mode={mode} missionId={missionId} startWave={startWave} resumeSnapshot={resumeSnapshot} onQuit={onQuit} />;
}

export default GamePage;
