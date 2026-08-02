import { useEffect, useState } from 'react';
import { useGame } from '../contexts/GameContext';
import { listProfiles } from '../database/profiles';

/** Name-based sign-in: pick an existing pilot or create a new one. */
export function Profile({ onSignedIn }) {
  const { signIn } = useGame();
  const [name, setName] = useState('');
  const [profiles, setProfiles] = useState([]);

  useEffect(() => {
    listProfiles().then(setProfiles);
  }, []);

  const enter = async (value) => {
    const record = await signIn(value);
    if (record) onSignedIn?.(record);
  };

  return (
    <div className="sg-panel">
      <h1 className="sg-title">Pampanaa</h1>
      <p className="sg-subtitle">Choose your pilot</p>

      <form
        className="sg-stack"
        onSubmit={(e) => {
          e.preventDefault();
          enter(name);
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
          Enter
        </button>
      </form>

      {profiles.length > 0 && (
        <div style={{ marginTop: 24 }}>
          <div className="sg-label" style={{ marginBottom: 8 }}>Existing pilots</div>
          <ul className="sg-list">
            {profiles.map((p) => (
              <li key={p.name}>
                <span>{p.name}</span>
                <button className="sg-btn sg-btn--sm" onClick={() => enter(p.name)}>
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
