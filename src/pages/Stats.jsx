import { useGame } from '../contexts/GameContext';
import { WEAPON_META } from '../components/weapons/weaponTypes';
import { progressionFromLegacyProgress } from '../domain/player/playerProgression';

export function Stats({ onBack }) {
  const { progress } = useGame();
  const stats = progress.stats;
  const progression = progressionFromLegacyProgress(progress);
  const kills = Object.entries(stats.totalKillsByType);
  const maxKills = Math.max(1, ...kills.map(([, v]) => v));
  const favorite = Object.entries(stats.shotsFiredByWeapon).sort((a, b) => b[1] - a[1])[0];
  const xpPercent = (progression.experience / progression.experienceToNextRank) * 100;

  return (
    <div className="sg-panel sg-panel--wide">
      <div className="sg-label">Warden Career</div>
      <h2 className="sg-h2">Rank {progression.rank}</h2>
      <div className="sg-row"><span>Experience</span><span className="sg-accent">{progression.experience} / {progression.experienceToNextRank} XP</span></div>
      <div className="sg-bar" style={{ margin: '8px 0 20px' }}><div className="sg-bar__fill" style={{ width: `${Math.min(100, xpPercent)}%` }} /></div>
      <ul className="sg-list" style={{ marginBottom: 16 }}>
        <li><span>Missions completed</span><span className="sg-accent">{progression.missionsCompleted}</span></li>
        <li><span>Encounters resolved</span><span className="sg-accent">{progression.encountersResolved}</span></li>
        <li><span>Threats defeated</span><span className="sg-accent">{progression.enemiesDefeated}</span></li>
        <li><span>Achievements</span><span className="sg-accent">{progression.achievements}</span></li>
        <li><span>Games played</span><span className="sg-accent">{stats.gamesPlayed}</span></li>
        <li><span>Deaths</span><span className="sg-accent">{stats.totalDeaths}</span></li>
        <li><span>Favorite weapon</span><span className="sg-accent">{favorite && favorite[1] > 0 ? WEAPON_META[favorite[0]]?.name : '—'}</span></li>
      </ul>
      <div className="sg-label" style={{ marginBottom: 8 }}>Threat record</div>
      <div className="sg-stack" style={{ gap: 8 }}>
        {kills.map(([type, count]) => <div key={type}><div className="sg-row" style={{ justifyContent: 'space-between', fontSize: 12 }}><span>{type}</span><span className="sg-muted">{count}</span></div><div className="sg-bar"><div className="sg-bar__fill" style={{ width: `${(count / maxKills) * 100}%` }} /></div></div>)}
      </div>
      <button className="sg-btn" style={{ marginTop: 20, width: '100%' }} onClick={onBack}>Back</button>
    </div>
  );
}

export default Stats;
