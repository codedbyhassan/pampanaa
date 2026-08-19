import { MISSION_CATALOG } from '../domain/campaign/missionCatalog';

export function Missions({ onBack, onStartMission }) {
  return (
    <section className="sg-panel sg-panel--wide">
      <div className="sg-label">Operations</div>
      <h2 className="sg-h2">Missions</h2>
      <p className="sg-muted" style={{ lineHeight: 1.7 }}>
        Every mission has a purpose. Waves and encounters are what happen inside it.
      </p>
      <div className="sg-stack" style={{ gap: 12 }}>
        {MISSION_CATALOG.map((mission) => (
          <article key={mission.id} className="sg-panel">
            <div className="sg-label">{mission.chapterId.replace('chapter_', 'Chapter ')}</div>
            <h3 className="sg-h2" style={{ marginBottom: 6 }}>{mission.title}</h3>
            <p className="sg-muted" style={{ lineHeight: 1.6 }}>{mission.description}</p>
            <div className="sg-stack" style={{ gap: 6, margin: '14px 0' }}>
              {mission.objectives.map((objective) => (
                <div key={objective.id} className="sg-row">
                  <span>{objective.completed ? '✓' : '○'} {objective.title}</span>
                </div>
              ))}
            </div>
            <button className="sg-btn sg-btn--primary" disabled={mission.state === 'locked'} onClick={() => onStartMission?.(mission.id)}>
              {mission.state === 'locked' ? 'Locked' : 'Begin mission'}
            </button>
          </article>
        ))}
      </div>
      <button className="sg-btn" style={{ width: '100%', marginTop: 20 }} onClick={onBack}>Back</button>
    </section>
  );
}

export default Missions;
