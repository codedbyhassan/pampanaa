import { useEffect, useState } from 'react';
import { useGame } from '../contexts/GameContext';
import { listProfiles } from '../database/profiles';
import { PlayerShooter } from '../components/ui/PlayerShooter';
import { SHIP_DESIGNS, SHIP_DESIGN_KEYS, SHIP_COLORS } from '../utils/constants';
import soundManager from '../components/audio/SoundManager';

const COLOR_KEYS = Object.keys(SHIP_COLORS).filter((k) => k !== 'default');

/** Two-step onboarding: name your pilot, then outfit the ship in the hangar. */
export function Profile({ onSignedIn }) {
  const { signIn, saveSettings, saveProgress } = useGame();
  const [step, setStep] = useState('name');
  const [name, setName] = useState('');
  const [profiles, setProfiles] = useState([]);
  const [design, setDesign] = useState('interceptor');
  const [skin, setSkin] = useState('aurora');

  useEffect(() => {
    listProfiles().then(setProfiles);
  }, []);

  const enterExisting = async (value) => {
    soundManager.init();
    const record = await signIn(value);
    if (record) onSignedIn?.(record);
  };

  const finish = async () => {
    soundManager.init();
    const record = await signIn(name.trim());
    await saveSettings({ shipDesign: design, skin });
    await saveProgress({ selectedSkin: skin });
    if (record) onSignedIn?.(record);
  };

  if (step === 'hangar') {
    return (
      <div className="sg-panel sg-hangar">
        <h1 className="sg-title">Hangar</h1>
        <p className="sg-subtitle">Pick the airframe and livery for {name.trim()}</p>

        <div className="sg-hangar__preview">
          <PlayerShooter size={140} shipDesign={design} color={SHIP_COLORS[skin]} />
          <div>
            <b>{SHIP_DESIGNS[design].label}</b>
            <span className="sg-muted">{skin}</span>
          </div>
        </div>

        <div className="sg-label">Airframe</div>
        <div className="sg-choicegrid">
          {SHIP_DESIGN_KEYS.map((key) => (
            <button
              key={key}
              className="sg-choice"
              data-active={design === key}
              onClick={() => setDesign(key)}
            >
              <PlayerShooter size={72} shipDesign={key} color={SHIP_COLORS[skin]} />
              <span>{SHIP_DESIGNS[key].label}</span>
            </button>
          ))}
        </div>

        <div className="sg-label">Livery</div>
        <div className="sg-swatches">
          {COLOR_KEYS.map((key) => (
            <button
              key={key}
              className="sg-swatch"
              data-active={skin === key}
              style={{ background: SHIP_COLORS[key] }}
              aria-label={key}
              title={key}
              onClick={() => setSkin(key)}
            />
          ))}
        </div>

        <div className="sg-rowbtns">
          <button className="sg-btn" onClick={() => setStep('name')}>
            Back
          </button>
          <button className="sg-btn sg-btn--primary" onClick={finish}>
            Launch
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="sg-panel">
      <h1 className="sg-title">Pampanaa</h1>
      <p className="sg-subtitle">Choose your pilot</p>

      <form
        className="sg-stack"
        onSubmit={(e) => {
          e.preventDefault();
          if (name.trim()) setStep('hangar');
        }}
      >
        <input
          className="sg-input"
          placeholder="Pilot name"
          maxLength={24}
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button className="sg-btn sg-btn--primary" type="submit" disabled={!name.trim()}>
          Next: choose your ship
        </button>
      </form>

      {profiles.length > 0 && (
        <div style={{ marginTop: 24 }}>
          <div className="sg-label" style={{ marginBottom: 8 }}>Existing pilots</div>
          <ul className="sg-list">
            {profiles.map((p) => (
              <li key={p.name}>
                <span>{p.name}</span>
                <button className="sg-btn sg-btn--sm" onClick={() => enterExisting(p.name)}>
                  Load · wave {p.highestWaveReached || 1}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default Profile;
