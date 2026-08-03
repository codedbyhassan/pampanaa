import { useEffect, useState } from 'react';
import { useGame } from '../contexts/GameContext';
import { useAudio } from '../contexts/AudioContext';
import { PlayerShooter } from '../components/ui/PlayerShooter';
import {
  DEFAULT_KEYMAP,
  DIFFICULTY_MIN,
  DIFFICULTY_MAX,
  DIFFICULTY_DESCRIPTIONS,
  difficultyMods,
  SHIP_DESIGNS,
  SHIP_DESIGN_KEYS,
  UI_THEMES,
  UI_THEME_KEYS,
} from '../utils/constants';
import { THEMES, THEME_GROUPS } from '../canvas/backgroundThemes';
import soundManager from '../components/audio/SoundManager';
import { resetSettings } from '../database/settings';
import { resetProgress } from '../database/progress';
import { clearSave } from '../database/saves';

const BINDINGS = [
  ['up', 'Move up'],
  ['down', 'Move down'],
  ['left', 'Move left'],
  ['right', 'Move right'],
  ['fire', 'Fire'],
];

const SECTIONS = [
  { id: 'profile', label: 'Player' },
  { id: 'gameplay', label: 'Gameplay' },
  { id: 'background', label: 'Backgrounds' },
  { id: 'appearance', label: 'Appearance' },
  { id: 'audio', label: 'Audio' },
  { id: 'controls', label: 'Controls' },
  { id: 'access', label: 'Accessibility' },
  { id: 'data', label: 'Data' },
];

/** Flat CSS approximation of a parallax theme, used as a picker preview. */
function ThemePreview({ theme, tall = false }) {
  return (
    <span
      className="sg-bgpreview"
      data-tall={tall}
      style={{
        background: theme.sky
          ? `linear-gradient(180deg, ${theme.sky[0]}, ${theme.sky[1]})`
          : theme.background,
      }}
    >
      {theme.layers.map((l, i) => (
        <span
          key={i}
          style={{
            background: l.color,
            height: `${16 + i * 12}%`,
            opacity: 0.55 + i * 0.15,
            borderRadius: l.kind === 'waves' || l.kind === 'hills' || l.kind === 'dunes' ? '50% 50% 0 0' : 2,
          }}
        />
      ))}
    </span>
  );
}

function Field({ label, hint, children }) {
  return (
    <div className="sg-field">
      <span className="sg-label">{label}</span>
      {children}
      {hint && <span className="sg-muted">{hint}</span>}
    </div>
  );
}

export function Settings({ onBack, backLabel = 'Back to menu', isModal = false }) {
  const { settings, saveSettings, profile, signOut, progress, refreshAll, renameProfile } = useGame();
  const { volume, setVolume } = useAudio();
  const [rebinding, setRebinding] = useState(null);
  const [profileName, setProfileName] = useState(profile || '');
  const [renameError, setRenameError] = useState(null);
  const [renaming, setRenaming] = useState(false);
  const [section, setSection] = useState('profile');

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

  useEffect(() => {
    setProfileName(profile || '');
    setRenameError(null);
  }, [profile]);

  const handleRenameProfile = async () => {
    const nextName = profileName.trim();
    if (!nextName || nextName === profile) return;
    setRenameError(null);
    setRenaming(true);
    try {
      const result = await renameProfile(nextName);
      if (!result) throw new Error('Unable to rename profile.');
      await refreshAll();
    } catch (error) {
      setRenameError(error?.message || 'Unable to rename profile.');
    } finally {
      setRenaming(false);
    }
  };

  const bgKey = settings.backgroundTheme || 'auto';
  const activeSection = SECTIONS.find((s) => s.id === section);

  return (
    <div className={`sg-settings ${isModal ? 'sg-settings--modal' : ''}`}>
      <aside className="sg-side">
        <div className="sg-side__head">
          <h2 className="sg-h2" style={{ margin: 0 }}>Settings</h2>
          <span className="sg-muted">{profile}</span>
        </div>
        <nav className="sg-side__nav">
          {SECTIONS.map((s) => (
            <button
              key={s.id}
              className="sg-navitem"
              data-active={section === s.id}
              onClick={() => setSection(s.id)}
            >
              <b>{s.label}</b>
            </button>
          ))}
        </nav>
        <button className="sg-btn sg-btn--sm" onClick={onBack}>
          {backLabel}
        </button>
      </aside>

      <section className="sg-content">
        <header className="sg-content__head">
          <h3>{activeSection.label}</h3>
        </header>

        {section === 'profile' && (
          <>
            <Field label="Signed in as" hint="Progress, settings and saves are stored under this name in IndexedDB.">
              <div className="sg-readout">
                <b>{profile}</b>
                <span>
                  Best wave {progress.highestWaveReached || 0} · {(progress.clearedWaves || []).length} waves cleared
                </span>
              </div>
            </Field>
            <Field label="Player name" hint="Rename your current profile and keep the active save data.">
              <div className="sg-field-row">
                <input
                  className="sg-input sg-input--wide"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                />
                <button
                  className="sg-btn sg-btn--sm"
                  onClick={handleRenameProfile}
                  disabled={!profileName.trim() || profileName.trim() === profile || renaming}
                >
                  {renaming ? 'Saving...' : 'Rename'}
                </button>
              </div>
              {renameError && <span className="sg-error">{renameError}</span>}
            </Field>
            <Field label="Session" hint="Switching player reloads that profile's world from the local database.">
              <button className="sg-btn" onClick={signOut}>Switch player</button>
            </Field>
          </>
        )}

        {section === 'gameplay' && (
          <>
            <Field
              label={`Difficulty · ${settings.difficultyLevel ?? 4} · ${difficultyMods(settings.difficultyLevel ?? 4).label}`}
              hint={DIFFICULTY_DESCRIPTIONS[settings.difficultyLevel ?? 4]}
            >
              <input
                className="sg-slider"
                type="range"
                min={DIFFICULTY_MIN}
                max={DIFFICULTY_MAX}
                step="1"
                value={settings.difficultyLevel ?? 4}
                onChange={(e) => saveSettings({ difficultyLevel: Number(e.target.value) })}
              />
            </Field>
            <Field label="Run options" hint="Auto-save writes a resume point every time a wave is cleared.">
              <div className="sg-toggle-group">
                <button
                  className="sg-toggle"
                  data-active={settings.autoSave !== false}
                  onClick={() => saveSettings({ autoSave: settings.autoSave === false })}
                >
                  Auto-save
                </button>
                <button
                  className="sg-toggle"
                  data-active={!!settings.damageNumbers}
                  onClick={() => saveSettings({ damageNumbers: !settings.damageNumbers })}
                >
                  Damage numbers
                </button>
                <button
                  className="sg-toggle"
                  data-active={settings.screenShake !== false}
                  onClick={() => saveSettings({ screenShake: settings.screenShake === false })}
                >
                  Screen shake
                </button>
              </div>
            </Field>
            <Field label="Onboarding" hint="Shows the how-to-play card again before the next run.">
              <button className="sg-btn" onClick={() => saveSettings({ hasSeenOnboarding: false })}>
                Replay tutorial card
              </button>
            </Field>
          </>
        )}

        {section === 'background' && (
          <>
            <Field label="Current selection" hint={bgKey === 'auto' ? 'Rotating through every environment as waves progress.' : THEMES[bgKey].description}>
              <div className="sg-readout sg-readout--wide">
                {bgKey === 'auto' ? (
                  <b>Auto rotate</b>
                ) : (
                  <>
                    <ThemePreview theme={THEMES[bgKey]} tall />
                    <b>{THEMES[bgKey].name}</b>
                  </>
                )}
              </div>
            </Field>

            <div className="sg-field">
              <span className="sg-label">Rotation</span>
              <button
                className="sg-bgcard"
                data-active={bgKey === 'auto'}
                onClick={() => saveSettings({ backgroundTheme: 'auto' })}
              >
                <span className="sg-bgpreview sg-bgpreview--auto" />
                <span className="sg-bgcard__body">
                  <b>Auto</b>
                  <em>Cycles environments every three waves.</em>
                </span>
              </button>
            </div>

            {Object.entries(THEME_GROUPS).map(([group, keys]) => (
              <div className="sg-field" key={group}>
                <span className="sg-label">{group}</span>
                <div className="sg-bggrid">
                  {keys.map((key) => (
                    <button
                      key={key}
                      className="sg-bgcard"
                      data-active={bgKey === key}
                      onClick={() => saveSettings({ backgroundTheme: key })}
                    >
                      <ThemePreview theme={THEMES[key]} />
                      <span className="sg-bgcard__body">
                        <b>{THEMES[key].name}</b>
                        <em>{THEMES[key].description}</em>
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </>
        )}

        {section === 'appearance' && (
          <>
            <Field label="Interface theme" hint="Recolours every menu, HUD element and button.">
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
            </Field>
            <Field label="Ship design" hint="Select a hull silhouette and preview the active ship in the header.">
              <div className="sg-ship-grid">
                {SHIP_DESIGN_KEYS.map((key) => (
                  <button
                    key={key}
                    className="sg-ship-card"
                    data-active={(settings.shipDesign || 'interceptor') === key}
                    onClick={() => saveSettings({ shipDesign: key })}
                    type="button"
                  >
                    <PlayerShooter shipDesign={key} size={84} />
                    <div className="sg-ship-card__body">
                      <b>{SHIP_DESIGNS[key].label}</b>
                      <span>{SHIP_DESIGNS[key].color}</span>
                    </div>
                  </button>
                ))}
              </div>
            </Field>
          </>
        )}

        {section === 'audio' && (
          <>
            <Field label={`Master volume · ${Math.round(volume * 100)}%`} hint="Applies to every sound effect in the game.">
              <input
                className="sg-slider"
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={volume}
                onChange={(e) => setVolume(Number(e.target.value))}
              />
            </Field>
            <Field label="Channels" hint="Music is generated procedurally and reacts to wave intensity.">
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
            </Field>
            <Field label={`Music volume · ${Math.round((settings.musicVolume ?? 0.35) * 100)}%`} hint="Independent from the master volume.">
              <input
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
            </Field>
          </>
        )}

        {section === 'controls' && (
          <>
            <Field label="Control scheme" hint="Auto picks touch on touchscreens and keyboard everywhere else.">
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
            </Field>
            <Field label="Key bindings" hint="Click a binding, then press the key you want to use.">
              <ul className="sg-list">
                {BINDINGS.map(([action, label]) => (
                  <li key={action}>
                    <span>{label}</span>
                    <button className="sg-btn sg-btn--sm" onClick={() => captureKey(action)}>
                      {rebinding === action
                        ? 'Press a key…'
                        : settings.keymap?.[action] || DEFAULT_KEYMAP[action]}
                    </button>
                  </li>
                ))}
                <li>
                  <span>Switch weapon</span>
                  <b>Scroll · 1–5 · Q/E</b>
                </li>
                <li>
                  <span>Pause</span>
                  <b>Escape</b>
                </li>
              </ul>
            </Field>
            <Field label="Reset" hint="Restores WASD and Space.">
              <button className="sg-btn" onClick={() => saveSettings({ keymap: { ...DEFAULT_KEYMAP } })}>
                Restore default bindings
              </button>
            </Field>
          </>
        )}

        {section === 'access' && (
          <>
            <Field label="Vision & motion" hint="Colourblind mode swaps every entity palette for a high-contrast set.">
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
            </Field>
            <Field label="Diagnostics" hint="Shows a live frame-rate readout in the corner of the playfield.">
              <button
                className="sg-toggle"
                data-active={!!settings.showFps}
                onClick={() => saveSettings({ showFps: !settings.showFps })}
              >
                FPS counter
              </button>
            </Field>
          </>
        )}

        {section === 'data' && (
          <>
            <Field label="Settings" hint="Returns every option on this page to its default value.">
              <button
                className="sg-btn"
                onClick={async () => {
                  await resetSettings();
                  await refreshAll();
                }}
              >
                Reset settings
              </button>
            </Field>
            <Field label="Saved run" hint="Deletes the current resume point only. Progress is kept.">
              <button
                className="sg-btn"
                onClick={async () => {
                  await clearSave();
                  await refreshAll();
                }}
              >
                Clear saved run
              </button>
            </Field>
            <Field label="Progress" hint="Wipes cleared waves, unlocks and lifetime statistics for this player.">
              <button
                className="sg-btn sg-btn--danger"
                onClick={async () => {
                  await resetProgress();
                  await clearSave();
                  await refreshAll();
                }}
              >
                Erase progress
              </button>
            </Field>
          </>
        )}
      </section>
    </div>
  );
}

export default Settings;
