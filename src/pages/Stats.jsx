import { useGame } from '../contexts/GameContext';
import { WEAPON_META } from '../components/weapons/weaponTypes';

export function Stats({ onBack }) {
  const { progress } = useGame();
  const stats = progress.stats;
  const kills = Object.entries(stats.totalKillsByType);
  const maxKills = Math.max(1, ...kills.map(([, v]) => v));
  const favorite = Object.entries(stats.shotsFiredByWeapon).sort((a, b) => b[1] - a[1])[0];

  return (
    <div className="sg-panel">
      <h2 className="sg-h2">Lifetime Stats</h2>
      <ul className="sg-list" style={{ marginBottom: 16 }}>
        <li><span>Games played</span><span className="sg-accent">{stats.gamesPlayed}</span></li>
        <li><span>Deaths</span><span className="sg-accent">{stats.totalDeaths}</span></li>
        <li><span>Best wave</span><span className="sg-accent">{progress.highestWaveReached || 0}</span></li>
        <li>
          <span>Favorite weapon</span>
          <span className="sg-accent">
            {favorite && favorite[1] > 0 ? WEAPON_META[favorite[0]]?.name : '—'}
          </span>
        </li>
      </ul>

      <div className="sg-label" style={{ marginBottom: 8 }}>Kills by enemy type</div>
      <div className="sg-stack" style={{ gap: 8 }}>
        {kills.map(([type, count]) => (
          <div key={type}>
            <div className="sg-row" style={{ justifyContent: 'space-between', fontSize: 12 }}>
              <span>{type}</span>
              <span className="sg-muted">{count}</span>
            </div>
            <div className="sg-bar">
              <div className="sg-bar__fill" style={{ width: `${(count / maxKills) * 100}%` }} />
            </div>
          </div>
        ))}
      </div>

      <button className="sg-btn" style={{ marginTop: 20, width: '100%' }} onClick={onBack}>
        Back
      </button>
    </div>
  );
}

export default Stats;
