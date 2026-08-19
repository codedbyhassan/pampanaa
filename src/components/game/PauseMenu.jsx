const AMP_LABELS = { damage: 'Damage', fire: 'Fire', pierce: 'Pierce', multishot: 'Multishot' };

function Section({ title, children }) {
  return <section className="sg-panel"><div className="sg-label">{title}</div>{children}</section>;
}

export function PauseMenu({ onResume, onSaveQuit, onQuit, onSettings, saveDisabled, updates = [], playerLoadout, playerBuffs = {}, threatCatalog = [], bossCatalog = [], runtimeSession }) {
  const formatTime = (value) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  const activeBuffs = Object.entries(playerBuffs).filter(([, value]) => value > 0);
  const activeWeapon = playerLoadout?.activeWeaponKey;
  const amps = activeWeapon ? Object.entries(playerLoadout.weaponAmps?.[activeWeapon] || {}).filter(([, value]) => value > 0) : [];

  return (
    <div className="sg-modal">
      <div className="sg-modal__inner sg-stack" style={{ maxWidth: 980 }}>
        <div>
          <div className="sg-label">Mission paused</div>
          <h2 className="sg-h2" style={{ marginBottom: 4 }}>Paused</h2>
          <p className="sg-muted" style={{ margin: 0 }}>The battlefield is clear. Detailed run information stays here.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(250px, 320px)', gap: 20, alignItems: 'start' }}>
          <div className="sg-stack">
            <Section title="Mission log">
              {updates.length === 0 ? <p className="sg-muted" style={{ marginBottom: 0 }}>No updates yet.</p> : (
                <div className="sg-stack" style={{ gap: 10, marginTop: 10, maxHeight: 250, overflowY: 'auto' }}>
                  {[...updates].reverse().map((update) => (
                    <article key={update.id} style={{ paddingBottom: 10, borderBottom: '1px solid rgba(255,255,255,.07)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}><strong>{update.title}</strong><span className="sg-muted" style={{ fontSize: 11 }}>{formatTime(update.timestamp)}</span></div>
                      <p className="sg-muted" style={{ margin: '4px 0 0', lineHeight: 1.5 }}>{update.message}</p>
                    </article>
                  ))}
                </div>
              )}
            </Section>

            <Section title="Warden loadout">
              <div className="sg-stack" style={{ gap: 7, marginTop: 8 }}>
                <div className="sg-hud__stat">Active weapon <b>{activeWeapon || 'Blaster'}</b></div>
                {amps.length > 0 ? amps.map(([key, value]) => <div className="sg-hud__stat" key={key}><span>{AMP_LABELS[key] || key}</span><b>{value}x</b></div>) : <div className="sg-muted">No weapon amplifiers active.</div>}
                {activeBuffs.length > 0 ? activeBuffs.map(([key, value]) => <div className="sg-hud__stat" key={key}><span>{key}</span><b>{Math.ceil(value)}s</b></div>) : <div className="sg-muted">No temporary buffs active.</div>}
              </div>
            </Section>
          </div>

          <div className="sg-stack">
            <Section title="Encounter intelligence">
              <div className="sg-stack" style={{ gap: 7, marginTop: 8 }}>
                <div className="sg-hud__stat">Threat types <b>{threatCatalog.length}</b></div>
                <div className="sg-hud__stat">Known bosses <b>{bossCatalog.length}</b></div>
                {runtimeSession?.status && <div className="sg-hud__stat">Session <b>{runtimeSession.status}</b></div>}
              </div>
            </Section>
            <div className="sg-stack">
              <button className="sg-btn sg-btn--primary" onClick={onResume}>Resume</button>
              <button className="sg-btn" onClick={onSettings}>Settings</button>
              <button className="sg-btn" onClick={onSaveQuit} disabled={saveDisabled}>Save &amp; Quit</button>
              <button className="sg-btn sg-btn--danger" onClick={onQuit}>Quit to Menu</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PauseMenu;
