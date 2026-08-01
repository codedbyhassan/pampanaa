import { useState } from 'react';
import { useGame } from '../contexts/GameContext';
import { useAudio } from '../contexts/AudioContext';
import { DEFAULT_KEYMAP, UI_THEMES, UI_THEME_KEYS } from '../utils/constants';

const BINDINGS = [
  ['up', 'Move up'],
  ['down', 'Move down'],
  ['left', 'Move left'],
  ['right', 'Move right'],
  ['fire', 'Fire'],
];

export function Settings({ onBack }) {
  const { settings, saveSettings } = useGame();
  const { volume, setVolume } = useAudio();
  const [rebinding, setRebinding] = useState(null);

  const captureKey = (action) => {
    setRebinding(action);
    const handler = (e) => {
      e.preventDefault();
      saveSettings({ keymap: { ...settings.keymap, [action]: e.code } });
      setRebinding(null);
      window.removeEventListener('keydown', handler);
    };
    window.addEventListener('keydown', handler);
  };

  return (
    <div className="sg-panel">
      <h2 className="sg-h2">Settings</h2>

      <div className="sg-field">
        <span className="sg-label">Interface theme</span>
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

      <div className="sg-field">
        <label className="sg-label" htmlFor="vol">Volume · {Math.round(volume * 100)}%</label>
        <input
          id="vol"
          className="sg-slider"
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={volume}
          onChange={(e) => setVolume(Number(e.target.value))}
        />
      </div>

      <div className="sg-field">
        <span className="sg-label">Difficulty</span>
        <div className="sg-toggle-group">
          {['easy', 'normal', 'hard'].map((d) => (
            <button
              key={d}
              className="sg-toggle"
              data-active={settings.difficulty === d}
              onClick={() => saveSettings({ difficulty: d })}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      <div className="sg-field">
        <span className="sg-label">Control scheme</span>
        <div className="sg-toggle-group">
          {['auto', 'keyboard', 'touch', 'gamepad'].map((c) => (
            <button
              key={c}
              className="sg-toggle"
              data-active={settings.controlScheme === c}
              onClick={() => saveSettings({ controlScheme: c })}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="sg-field">
        <span className="sg-label">Accessibility</span>
        <div className="sg-toggle-group">
          <button
            className="sg-toggle"
            data-active={settings.colorblind}
            onClick={() => saveSettings({ colorblind: !settings.colorblind })}
          >
            Colorblind palette
          </button>
          <button
            className="sg-toggle"
            data-active={settings.reducedMotion}
            onClick={() => saveSettings({ reducedMotion: !settings.reducedMotion })}
          >
            Reduced motion
          </button>
        </div>
      </div>

      <div className="sg-field">
        <span className="sg-label">Key bindings</span>
        <ul className="sg-list">
          {BINDINGS.map(([action, label]) => (
            <li key={action}>
              <span>{label}</span>
              <button className="sg-btn sg-btn--sm" onClick={() => captureKey(action)}>
                {rebinding === action ? 'Press a key…' : settings.keymap?.[action] || DEFAULT_KEYMAP[action]}
              </button>
            </li>
          ))}
          <li>
            <span>Switch weapon</span>
            <b>Scroll · 1–5 · Q/E</b>
          </li>
        </ul>
      </div>

      <button className="sg-btn" style={{ width: '100%' }} onClick={onBack}>
        Back
      </button>
    </div>
  );
}

export default Settings;
