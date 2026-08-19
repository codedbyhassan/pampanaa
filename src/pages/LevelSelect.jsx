import { useState } from 'react';
import { useGame } from '../contexts/GameContext';
import { getWaveConfig, STAGES } from '../utils/constants';
import { loadLatestGameSnapshot, clearGameSnapshot } from '../application/persistence/gamePersistence';

export function LevelSelect({ onPlayWave, onContinue, onBack }) {
  const { progress, hasSave, setHasSave } = useGame();
  const [busy, setBusy] = useState(false);
  const cleared = new Set(progress.clearedWaves || []);
  const highest = Math.max(1, progress.highestWaveReached || 1);
  const maxUnlocked = Math.max(highest, cleared.size ? Math.max(...cleared) + 1 : 1);
  const waves = Array.from({ length: Math.max(20, maxUnlocked + 5) }, (_, i) => i + 1);
  const resume = async () => { setBusy(true); const save = await loadLatestGameSnapshot(); setBusy(false); if (save) onContinue(save); };

  return <div className="sg-panel sg-panel--wide">
    <div className="sg-label">Encounter archive</div><h2 className="sg-h2">Replay</h2>
    <p className="sg-muted" style={{ marginTop: -8, marginBottom: 18, lineHeight: 1.7 }}>Replay encounters unlocked through the campaign. Encounters are gameplay stages inside missions.</p>
    <div className="sg-stack" style={{ marginBottom: 20 }}>
      <button className="sg-btn sg-btn--primary" onClick={() => onPlayWave(maxUnlocked)}>Resume at encounter {maxUnlocked}</button>
      {hasSave && <button className="sg-btn" disabled={busy} onClick={resume}>Continue saved mission</button>}
      <button className="sg-btn" onClick={() => onPlayWave(1)}>Start first encounter</button>
      {hasSave && <button className="sg-btn sg-btn--danger" onClick={async () => { await clearGameSnapshot(); setHasSave(false); }}>Discard saved run</button>}
    </div>
    {STAGES.map((stage) => {
      const to = Math.min(stage.to, waves.length); if (stage.from > waves.length) return null;
      const stageWaves = waves.filter((w) => w >= stage.from && w <= to); if (!stageWaves.length) return null;
      return <div key={stage.id} style={{ marginBottom: 22 }}><div className="sg-label" style={{ marginBottom: 4 }}>{stage.name}</div><p className="sg-muted" style={{ margin: '0 0 10px', fontSize: 12 }}>{stage.blurb}</p><div className="sg-levelgrid">{stageWaves.map((w) => { const unlocked = w <= maxUnlocked; const done = cleared.has(w); const cfg = getWaveConfig(w); return <button key={w} className="sg-level" disabled={!unlocked} data-done={done} data-boss={w % 5 === 0} onClick={() => onPlayWave(w)} title={`${cfg.formation} formation · ${cfg.choreography} choreography`}><b>{w}</b><span>{w % 5 === 0 ? 'Boss' : cfg.formation}</span>{done && <em>★ {progress.bestScoreByWave?.[w] || 0}</em>}</button>; })}</div></div>;
    })}
    <button className="sg-btn" style={{ width: '100%', marginTop: 20 }} onClick={onBack}>Back</button>
  </div>;
}
export default LevelSelect;
