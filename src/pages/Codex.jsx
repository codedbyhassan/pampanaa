import { FACTION_CATALOG, REGION_CATALOG, THREAT_CATALOG } from '../domain/world/worldCatalog';

export function Codex({ onBack }) {
  return (
    <section className="sg-panel sg-panel--wide">
      <div className="sg-label">Archive</div>
      <h2 className="sg-h2">Codex</h2>
      <p className="sg-muted" style={{ lineHeight: 1.7 }}>
        What Pampanaa knows is recorded here. Discoveries will expand this archive as the campaign advances.
      </p>
      <div className="sg-stack" style={{ gap: 18 }}>
        <section>
          <div className="sg-label">Regions</div>
          {REGION_CATALOG.map((region) => <div key={region.id} className="sg-row"><span>{region.name}</span><span>{region.unlocked ? 'Discovered' : 'Unknown'}</span></div>)}
        </section>
        <section>
          <div className="sg-label">Factions</div>
          {FACTION_CATALOG.map((faction) => <div key={faction.id} className="sg-row"><span>{faction.name}</span><span>{faction.alignment}</span></div>)}
        </section>
        <section>
          <div className="sg-label">Threats</div>
          {THREAT_CATALOG.map((threat) => <div key={threat.id} className="sg-row"><span>{threat.name}</span><span>{threat.role}</span></div>)}
        </section>
      </div>
      <button className="sg-btn" style={{ width: '100%', marginTop: 20 }} onClick={onBack}>Back</button>
    </section>
  );
}

export default Codex;
