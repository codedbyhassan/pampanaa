import { useEffect, useState } from 'react';
import { getTopScores } from '../database/scores';

export function Leaderboard({ onBack }) {
  const [mode, setMode] = useState('campaign');
  const [scores, setScores] = useState([]);

  useEffect(() => {
    getTopScores(10, mode).then(setScores);
  }, [mode]);

  return (
    <div className="sg-panel">
      <h2 className="sg-h2">Leaderboard</h2>
      <div className="sg-toggle-group" style={{ marginBottom: 16 }}>
        {['campaign', 'endless'].map((m) => (
          <button key={m} className="sg-toggle" data-active={mode === m} onClick={() => setMode(m)}>
            {m}
          </button>
        ))}
      </div>
      {scores.length === 0 ? (
        <p className="sg-muted">No scores yet — go set one.</p>
      ) : (
        <ol className="sg-list">
          {scores.map((s, i) => (
            <li key={s.id}>
              <span>
                {i + 1}. {s.name}
              </span>
              <span className="sg-muted">
                wave {s.wave || 1} · <span className="sg-accent">{s.score}</span>
              </span>
            </li>
          ))}
        </ol>
      )}
      <button className="sg-btn" style={{ marginTop: 20, width: '100%' }} onClick={onBack}>
        Back
      </button>
    </div>
  );
}

export default Leaderboard;
