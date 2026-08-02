import { useState } from 'react';
import { useGame } from '../contexts/GameContext';
import { getWaveConfig } from '../utils/constants';
import { loadLatestSave, clearSave } from '../database/saves';

/**
 * Level select / replay. Cleared waves can be replayed, the highest reached
 * wave can be resumed, and an in-progress save can be continued or discarded.
 */
export function LevelSelect({ onPlayWave, onContinue, onBack }) {
  const { progress, hasSave, setHasSave } = useGame();
  const [busy, setBusy] = useState(false);

  const cleared = new Set(progress.clearedWaves || []);
  const highest = Math.max(1, progress.highestWaveReached || 1);
  const maxUnlocked = Math.max(highest, cleared.size ? Math.max(...cleared) + 1 : 1);
  const waves = Array.from({ length: Math.max(12, maxUnlocked + 2) }, (_, i) => i + 1);

  const resume = async () => {
    setBusy(true);
    const save = await loadLatestSave();
    setBusy(false);
    if (save) onContinue(save);
  };

  return (
    <div className="sg-panel sg-panel--wide">
      <h2 className="sg-h2">Level Select</h2>
      <p className="sg-muted" style={{ marginTop: -8, marginBottom: 18, lineHeight: 1.7 }}>
        Replay any wave you have already cleared, jump straight back to your current level,
        or start the campaign over from wave one.
      </p>

      <div className="sg-stack" style={{ marginBottom: 20 }}>
        <button className="sg-btn sg-btn--primary" onClick={() => onPlayWave(maxUnlocked)}>
          Resume at wave {maxUnlocked}
        </button>
        {hasSave && (
          <button className="sg-btn" disabled={busy} onClick={resume}>
            Continue saved run
          </button>
        )}
        <button className="sg-btn" onClick={() => onPlayWave(1)}>
          Start over from wave 1
        </button>
        {hasSave && (
          <button
            className="sg-btn sg-btn--danger"
            onClick={async () => {
              await clearSave();
              setHasSave(false);
            }}
          >
            Discard saved run
          </button>
        )}
      </div>

      <div className="sg-label" style={{ marginBottom: 8 }}>Waves</div>
      <div className="sg-levelgrid">
        {waves.map((w) => {
          const unlocked = w <= maxUnlocked;
          const done = cleared.has(w);
          const cfg = getWaveConfig(w);
          return (
            <button
              key={w}
              className="sg-level"
              disabled={!unlocked}
              data-done={done} data-boss={w % 5 === 0}
              onClick={() => onPlayWave(w)}
              title={`${cfg.formation} formation · ${cfg.choreography} choreography`}
            >
              <b>{w}</b>
              <span>{w % 5 === 0 ? 'Boss' : cfg.formation}</span>
              {done && <em>★ {progress.bestScoreByWave?.[w] || 0}</em>}
            </button>
          );
        })}
      </div>

      <button className="sg-btn" style={{ width: '100%', marginTop: 20 }} onClick={onBack}>
        Back
      </button>
    </div>
  );
}

export default LevelSelect;
