import { SKINS, UI_THEMES, UI_THEME_KEYS } from '../utils/constants';
import { useGame } from '../contexts/GameContext';
import { useAudio } from '../contexts/AudioContext';
import { loadLatestSave } from '../database/saves';

export function MainMenu({ onNavigate, onStart, onContinue }) {
  const { progress, hasSave, saveProgress, settings, saveSettings } = useGame();
  const { resumeAudio } = useAudio();
  const skins = progress.unlockedSkins || ['default'];

  const begin = (mode) => {
    resumeAudio();
    onStart(mode);
  };

  return (
    <div className="sg-panel">
      <h1 className="sg-title">Voidbreak</h1>
      <p className="sg-subtitle">Formation shooter · Best wave {progress.highestWaveReached || 0}</p>

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
      </div>

      <div style={{ marginTop: 22 }}>
        <div className="sg-label" style={{ textAlign: 'center', marginBottom: 8 }}>Interface theme</div>
        <div className="sg-themes">
          {UI_THEME_KEYS.map((key) => (
            <button
              key={key}
              className="sg-theme"
              data-active={(settings.uiTheme || 'nebula') === key}
              onClick={() => saveSettings({ uiTheme: key })}
            >
              <span
                className="sg-theme__dot"
                style={{ background: UI_THEMES[key].swatch, color: UI_THEMES[key].swatch }}
              />
              {UI_THEMES[key].label}
            </button>
          ))}
        </div>
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
                style={{ background: SKINS[skin], color: SKINS[skin] }}
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
