import { SKINS } from '../utils/constants';
import { useGame } from '../contexts/GameContext';
import { useAudio } from '../contexts/AudioContext';
import { loadLatestSave } from '../database/saves';

export function MainMenu({ onNavigate, onStart, onContinue }) {
  const { progress, hasSave, saveProgress } = useGame();
  const { resumeAudio } = useAudio();
  const skins = progress.unlockedSkins || ['default'];

  const begin = (mode) => {
    resumeAudio();
    onStart(mode);
  };

  return (
    <div className="sg-panel">
      <h1 className="sg-title">Voidbreak</h1>
      <p className="sg-subtitle">Top-down arena shooter · Best wave: {progress.highestWaveReached || 0}</p>

      <div className="sg-stack">
        <button className="sg-btn sg-btn--primary" onClick={() => begin('campaign')}>
          Start Campaign
        </button>
        <button className="sg-btn" onClick={() => begin('endless')}>
          Endless Mode
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
        <button className="sg-btn" onClick={() => onNavigate('leaderboard')}>
          Leaderboard
        </button>
        <button className="sg-btn" onClick={() => onNavigate('achievements')}>
          Achievements
        </button>
        <button className="sg-btn" onClick={() => onNavigate('stats')}>
          Stats
        </button>
        <button className="sg-btn" onClick={() => onNavigate('settings')}>
          Settings
        </button>
      </div>

      {skins.length > 1 && (
        <div style={{ marginTop: 20 }}>
          <div className="sg-label" style={{ textAlign: 'center', marginBottom: 8 }}>Ship skin</div>
          <div className="sg-skins">
            {skins.map((skin) => (
              <button
                key={skin}
                className="sg-skin"
                data-active={progress.selectedSkin === skin}
                style={{ background: SKINS[skin] }}
                aria-label={`${skin} skin`}
                onClick={() => saveProgress({ selectedSkin: skin })}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default MainMenu;
