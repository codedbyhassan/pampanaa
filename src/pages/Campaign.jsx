import { CAMPAIGN_CHAPTERS, NARRATIVE_EVENTS } from '../domain/campaign/campaignCatalog';
import { MISSION_CATALOG } from '../domain/campaign/missionCatalog';

export function Campaign({ onBack, onStartMission }) {
  return (
    <section className="sg-panel sg-panel--wide">
      <div className="sg-label">Campaign</div>
      <h2 className="sg-h2">The Silence</h2>
      <p className="sg-muted" style={{ lineHeight: 1.7 }}>
        Pampanaa survived the Silence. Tonight, something has answered its perimeter.
      </p>
      <div className="sg-stack" style={{ gap: 12 }}>
        {CAMPAIGN_CHAPTERS.map((chapter) => {
          const mission = MISSION_CATALOG.find((item) => item.chapterId === chapter.id);
          const event = NARRATIVE_EVENTS.find((item) => item.id === chapter.narrativeEventIds[0]);
          const locked = chapter.state === 'locked';
          return (
            <article key={chapter.id} className="sg-panel" style={{ opacity: locked ? 0.55 : 1 }}>
              <div className="sg-label">Chapter {chapter.number}</div>
              <h3 className="sg-h2" style={{ marginBottom: 4 }}>{chapter.title}</h3>
              <p className="sg-muted" style={{ marginTop: 0 }}>{chapter.subtitle}</p>
              {event && <p style={{ lineHeight: 1.7 }}>{event.text}</p>}
              {mission && (
                <button className="sg-btn sg-btn--primary" disabled={locked} onClick={() => onStartMission?.(mission.id)}>
                  {locked ? 'Locked' : `Begin ${mission.title}`}
                </button>
              )}
            </article>
          );
        })}
      </div>
      <button className="sg-btn" style={{ width: '100%', marginTop: 20 }} onClick={onBack}>Back</button>
    </section>
  );
}

export default Campaign;
