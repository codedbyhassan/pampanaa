export function PauseMenu({ onResume, onSaveQuit, onQuit, onSettings, saveDisabled, updates = [] }) {
  const formatTime = (value) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="sg-modal">
      <div className="sg-modal__inner sg-stack" style={{ maxWidth: 760 }}>
        <div>
          <div className="sg-label">Mission paused</div>
          <h2 className="sg-h2" style={{ marginBottom: 4 }}>Paused</h2>
          <p className="sg-muted" style={{ margin: 0 }}>Updates are kept here so the battlefield stays clear.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 220px', gap: 20, alignItems: 'start' }}>
          <section className="sg-panel" style={{ maxHeight: 300, overflowY: 'auto' }}>
            <div className="sg-label">Mission log</div>
            {updates.length === 0 ? (
              <p className="sg-muted" style={{ marginBottom: 0 }}>No updates yet.</p>
            ) : (
              <div className="sg-stack" style={{ gap: 10, marginTop: 10 }}>
                {[...updates].reverse().map((update) => (
                  <article key={update.id} style={{ paddingBottom: 10, borderBottom: '1px solid rgba(255,255,255,.07)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                      <strong>{update.title}</strong>
                      <span className="sg-muted" style={{ fontSize: 11 }}>{formatTime(update.timestamp)}</span>
                    </div>
                    <p className="sg-muted" style={{ margin: '4px 0 0', lineHeight: 1.5 }}>{update.message}</p>
                  </article>
                ))}
              </div>
            )}
          </section>

          <div className="sg-stack">
            <button className="sg-btn sg-btn--primary" onClick={onResume}>Resume</button>
            <button className="sg-btn" onClick={onSettings}>Settings</button>
            <button className="sg-btn" onClick={onSaveQuit} disabled={saveDisabled}>Save &amp; Quit</button>
            <button className="sg-btn sg-btn--danger" onClick={onQuit}>Quit to Menu</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PauseMenu;
