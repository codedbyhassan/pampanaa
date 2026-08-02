import { useEffect, useState } from 'react';
import { useGame } from '../contexts/GameContext';
import { useAudio } from '../contexts/AudioContext';
import { listPresets, loadPreset, updatePresetName, deletePreset, savePreset, loadLatestSave } from '../database/saves';

export function Presets({ onContinue, onClose }) {
  const { resumeAudio } = useAudio();
  const [presets, setPresets] = useState([]);
  const [latest, setLatest] = useState(null);
  const [renaming, setRenaming] = useState(null);
  const [newName, setNewName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPresetsData();
  }, []);

  const loadPresetsData = async () => {
    const presetsList = await listPresets();
    const latestSave = await loadLatestSave();
    setPresets(presetsList);
    setLatest(latestSave);
    setLoading(false);
  };

  const handleContinue = async (preset) => {
    if (!preset) return;
    resumeAudio();
    onContinue(preset);
  };

  const handleRename = async (presetId, currentName) => {
    setRenaming(presetId);
    setNewName(currentName);
  };

  const confirmRename = async (presetId) => {
    if (newName.trim()) {
      await updatePresetName(presetId, newName);
      loadPresetsData();
    }
    setRenaming(null);
    setNewName('');
  };

  const handleDelete = async (presetId) => {
    if (confirm('Delete this preset? This cannot be undone.')) {
      await deletePreset(presetId);
      loadPresetsData();
    }
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="sg-presets">
      <h2 className="sg-subtitle">Game Presets</h2>

      {loading ? (
        <p>Loading presets...</p>
      ) : (
        <>
          {latest && (
            <div className="sg-presets__latest">
              <div className="sg-preset-card">
                <div className="sg-preset-card__info">
                  <h3 className="sg-preset-card__name">Latest Session</h3>
                  <p className="sg-preset-card__meta">Wave {latest.wave || 1} • {formatDate(latest.timestamp)}</p>
                  <p className="sg-preset-card__stats">Score: {latest.score || 0}</p>
                </div>
                <button
                  className="sg-btn sg-btn--primary"
                  onClick={() => handleContinue(latest)}
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          <div className="sg-presets__list">
            <h3 className="sg-label">Saved Presets</h3>
            {presets.length === 0 ? (
              <p className="sg-muted">No presets saved yet. Create one during gameplay by pausing and saving.</p>
            ) : (
              <div className="sg-presets__grid">
                {presets.map((preset) => (
                  <div key={preset.id} className="sg-preset-card">
                    <div className="sg-preset-card__info">
                      {renaming === preset.id ? (
                        <input
                          className="sg-input"
                          value={newName}
                          onChange={(e) => setNewName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') confirmRename(preset.id);
                            if (e.key === 'Escape') setRenaming(null);
                          }}
                          autoFocus
                          style={{ marginBottom: '8px' }}
                        />
                      ) : (
                        <h3 className="sg-preset-card__name">{preset.presetName}</h3>
                      )}
                      <p className="sg-preset-card__meta">Wave {preset.wave || 1} • {formatDate(preset.timestamp)}</p>
                      <p className="sg-preset-card__stats">Score: {preset.score || 0}</p>
                    </div>
                    <div className="sg-preset-card__actions">
                      <button
                        className="sg-btn sg-btn--sm"
                        onClick={() => handleContinue(preset)}
                      >
                        Load
                      </button>
                      <button
                        className="sg-btn sg-btn--sm"
                        onClick={() => handleRename(preset.id, preset.presetName)}
                      >
                        Rename
                      </button>
                      <button
                        className="sg-btn sg-btn--sm sg-btn--danger"
                        onClick={() => handleDelete(preset.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      <button className="sg-btn" onClick={onClose} style={{ marginTop: '24px' }}>
        Back
      </button>
    </div>
  );
}

export default Presets;
