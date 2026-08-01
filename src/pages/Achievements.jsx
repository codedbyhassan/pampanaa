import { useGame } from '../contexts/GameContext';
import { ACHIEVEMENTS } from '../utils/achievementDefs';

export function Achievements({ onBack }) {
  const { unlockedAchievements } = useGame();
  const map = Object.fromEntries(unlockedAchievements.map((a) => [a.id, a.unlockedAt]));

  return (
    <div className="sg-panel">
      <h2 className="sg-h2">Achievements</h2>
      <ul className="sg-list">
        {ACHIEVEMENTS.map((a) => (
          <li key={a.id} data-locked={!map[a.id]}>
            <span>
              {a.name}
              <br />
              <span className="sg-muted">{a.description}</span>
            </span>
            <span className="sg-muted">
              {map[a.id] ? new Date(map[a.id]).toLocaleDateString() : 'Locked'}
            </span>
          </li>
        ))}
      </ul>
      <button className="sg-btn" style={{ marginTop: 20, width: '100%' }} onClick={onBack}>
        Back
      </button>
    </div>
  );
}

export default Achievements;
