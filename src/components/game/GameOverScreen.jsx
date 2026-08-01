import { useState } from 'react';

export function GameOverScreen({ score, wave, isBest, onSubmit, onRestart, onQuit }) {
  const [name, setName] = useState('');
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="sg-modal">
      <div className="sg-modal__inner sg-stack">
        <h2 className="sg-h2" style={{ color: 'var(--sg-danger)' }}>
          Game Over
        </h2>
        <p className="sg-muted" style={{ margin: 0 }}>
          Final score <span className="sg-accent">{score}</span> · Wave{' '}
          <span className="sg-accent">{wave}</span>
        </p>
        {isBest && <p className="sg-warn" style={{ margin: 0 }}>★ New personal best wave!</p>}

        {!submitted ? (
          <>
            <input
              className="sg-input"
              placeholder="Your name"
              maxLength={16}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <button
              className="sg-btn sg-btn--primary"
              onClick={async () => {
                await onSubmit(name);
                setSubmitted(true);
              }}
            >
              Submit score
            </button>
          </>
        ) : (
          <p className="sg-accent" style={{ margin: 0 }}>Score saved to the leaderboard.</p>
        )}

        <button className="sg-btn" onClick={onRestart}>
          Restart
        </button>
        <button className="sg-btn" onClick={onQuit}>
          Quit to Menu
        </button>
      </div>
    </div>
  );
}

export default GameOverScreen;
