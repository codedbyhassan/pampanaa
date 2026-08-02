import { useState } from 'react';
import { useGame } from '../contexts/GameContext';
import { useAudio } from '../contexts/AudioContext';
import {
  DEFAULT_KEYMAP,
  UI_THEMES,
  UI_THEME_KEYS,
  SHIP_DESIGNS,
  SHIP_DESIGN_KEYS,
  DIFFICULTY_MIN,
  DIFFICULTY_MAX,
  difficultyMods,
} from '../utils/constants';
import soundManager from '../components/audio/SoundManager';

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
        <label className="sg-label" htmlFor="diff">
          Difficulty · {settings.difficultyLevel ?? 4} ·{' '}
          {difficultyMods(settings.difficultyLevel ?? 4).label}
        </label>
        <input
          id="diff"
          className="sg-slider"
          type="range"
          min={DIFFICULTY_MIN}
          max={DIFFICULTY_MAX}
          step="1"
          value={settings.difficultyLevel ?? 4}
          onChange={(e) => saveSettings({ difficultyLevel: Number(e.target.value) })}
        />
        <span className="sg-muted">
          Scales enemy toughness, squad size, formation speed and how often they shoot.
        </span>
      </div>

      <div className="sg-field">
        <span className="sg-label">Audio</span>
        <div className="sg-toggle-group">
          <button
            className="sg-toggle"
            data-active={settings.sfxEnabled !== false}
            onClick={() => {
              const on = settings.sfxEnabled === false;
              soundManager.setSfxEnabled(on);
              saveSettings({ sfxEnabled: on });
            }}
          >
            Sound effects
          </button>
          <button
            className="sg-toggle"
            data-active={settings.musicEnabled !== false}
            onClick={() => {
              const on = settings.musicEnabled === false;
              soundManager.setMusicEnabled(on);
              if (on) soundManager.startMusic('space');
              saveSettings({ musicEnabled: on });
            }}
          >
            Music
          </button>
        </div>
      </div>

      <div className="sg-field">
        <label className="sg-label" htmlFor="mvol">
          Music volume · {Math.round((settings.musicVolume ?? 0.35) * 100)}%
        </label>
        <input
          id="mvol"
          className="sg-slider"
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={settings.musicVolume ?? 0.35}
          onChange={(e) => {
            soundManager.setMusicVolume(Number(e.target.value));
            saveSettings({ musicVolume: Number(e.target.value) });
          }}
        />
      </div>

      <div className="sg-field">
        <span className="sg-label">Ship design</span>
        <div className="sg-toggle-group">
          {SHIP_DESIGN_KEYS.map((key) => (
            <button
              key={key}
              className="sg-toggle"
              data-active={(settings.shipDesign || 'interceptor') === key}
              onClick={() => saveSettings({ shipDesign: key })}
            >
              {SHIP_DESIGNS[key].label}
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
