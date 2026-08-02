import { useEffect, useState } from 'react';
import { useGame } from '../contexts/GameContext';
import { listProfiles } from '../database/profiles';

/**
 * Name-based sign-in. Every session is stored in IndexedDB under the chosen
 * name, so returning with the same name restores settings, progress and saves.
 */
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
      <p className="sg-subtitle">Sign in with a name to load your world</p>

      <form
        className="sg-stack"
        onSubmit={(e) => {
          e.preventDefault();
          enter(name);
        }}
      >
        <input
          className="sg-input"
          placeholder="Player name"
          maxLength={24}
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button className="sg-btn sg-btn--primary" type="submit" disabled={!name.trim()}>
          Continue
        </button>
      </form>

      {profiles.length > 0 && (
        <div style={{ marginTop: 24 }}>
          <div className="sg-label" style={{ marginBottom: 8 }}>Existing players</div>
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

      <p className="sg-muted" style={{ marginTop: 18, lineHeight: 1.7 }}>
        Profiles live only on this device, inside your browser's IndexedDB. No account,
        no server, no password.
      </p>
    </div>
  );
}

export default Profile;
