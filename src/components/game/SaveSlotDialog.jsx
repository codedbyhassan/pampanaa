import { useEffect, useState } from 'react';
import { listPresets, savePreset, overwritePreset } from '../../database/saves';

/**
 * Save & Quit never silently overwrites: the pilot picks a slot, either a
 * fresh one they can name or one of the existing saves to write over.
 */
export function SaveSlotDialog({ snapshot, defaultName, onSaved, onCancel }) {
  const [slots, setSlots] = useState([]);
  const [name, setName] = useState(defaultName || 'New save');
  const [busy, setBusy] = useState(false);
  const [confirming, setConfirming] = useState(null);

  useEffect(() => {
    listPresets().then(setSlots);
  }, []);

  const createNew = async () => {
    if (busy) return;
    setBusy(true);
    await savePreset(snapshot, name.trim() || 'New save');
    onSaved();
  };

  const overwrite = async (id) => {
    if (busy) return;
    setBusy(true);
    await overwritePreset(id, snapshot);
    onSaved();
  };

  const formatDate = (t) => new Date(t).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });

  return (
    <div className="sg-modal">
      <div className="sg-modal__inner sg-modal__inner--wide sg-stack">
        <h2 className="sg-h2">Choose a save slot</h2>
        <p className="sg-muted">
          Wave {snapshot?.wave || 1} · Score {snapshot?.score || 0}
        </p>

        <div className="sg-slot sg-slot--new">
          <input
            className="sg-input"
            value={name}
            maxLength={28}
            placeholder="Name this save"
            onChange={(e) => setName(e.target.value)}
          />
          <button className="sg-btn sg-btn--primary" disabled={busy} onClick={createNew}>
            Save to new slot
          </button>
        </div>

        <div className="sg-label">Overwrite an existing slot</div>
        {slots.length === 0 ? (
          <p className="sg-muted">No saved slots yet.</p>
        ) : (
          <ul className="sg-slot-list">
            {slots.map((s) => (
              <li key={s.id} className="sg-slot">
                <div>
                  <b>{s.presetName}</b>
                  <span className="sg-muted">
                    {' '}
                    · Wave {s.wave || 1} · {formatDate(s.timestamp)}
                  </span>
                </div>
                {confirming === s.id ? (
                  <div className="sg-slot__actions">
                    <button className="sg-btn sg-btn--sm sg-btn--danger" disabled={busy} onClick={() => overwrite(s.id)}>
                      Confirm overwrite
                    </button>
                    <button className="sg-btn sg-btn--sm" onClick={() => setConfirming(null)}>
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button className="sg-btn sg-btn--sm" onClick={() => setConfirming(s.id)}>
                    Overwrite
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}

        <button className="sg-btn" onClick={onCancel}>
          Back to pause
        </button>
      </div>
    </div>
  );
}

export default SaveSlotDialog;
