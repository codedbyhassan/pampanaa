import { useGame } from '../contexts/GameContext';
import { useAudio } from '../contexts/AudioContext';
import { loadLatestSave } from '../database/saves';

export function MainMenu({ onNavigate, onStart, onContinue }) {
  const { progress, hasSave, profile, signOut } = useGame();
  const { resumeAudio } = useAudio();

  const begin = (mode) => {
    resumeAudio();
    onStart(mode);
  };

  return (
    <div className="sg-panel">
      <h1 className="sg-title">Pampanaa</h1>
      <p className="sg-subtitle">
        {profile} · Best wave {progress.highestWaveReached || 0}
      </p>

      <div className="sg-stack">
        <button className="sg-btn sg-btn--primary" onClick={() => begin('campaign')}>
          Start Campaign
        </button>
        <button className="sg-btn" onClick={() => begin('endless')}>
          Endless Mode
        </button>
        <button className="sg-btn" onClick={() => onNavigate('levels')}>
          Levels &amp; Replay
        </button>
        {hasSave && (
          <button
            className="sg-btn"
            onClick={async () => {
              const save = await loadLatestSave();
              if (save) {
                resumeAudio();
                onContinue(save);
              }
            }}
          >
            Continue
          </button>
        )}
        <div className="sg-row" style={{ flexWrap: 'nowrap' }}>
          <button className="sg-btn" style={{ flex: 1 }} onClick={() => onNavigate('leaderboard')}>
            Scores
          </button>
          <button className="sg-btn" style={{ flex: 1 }} onClick={() => onNavigate('achievements')}>
            Awards
          </button>
          <button className="sg-btn" style={{ flex: 1 }} onClick={() => onNavigate('stats')}>
            Stats
          </button>
        </div>
        <button className="sg-btn" onClick={() => onNavigate('settings')}>
          Settings
        </button>
        <button className="sg-btn sg-btn--sm" onClick={signOut}>
          Switch player
        </button>
      </div>
    </div>
  );
}

export default MainMenu;
