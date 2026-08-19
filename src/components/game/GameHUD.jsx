import PlayerHealthBar from '../player/PlayerHealthBar';
import { WEAPON_META } from '../weapons/weaponTypes';

export function GameHUD({ hud, mode, mission, fps }) {
  const objective = mission?.objectives?.find((item) => !item.completed) || mission?.objectives?.at(-1);
  const boss = hud.boss;

  return (
    <div className="sg-hud">
      {mission && mode !== 'endless' && (
        <div className="sg-hud__card sg-stack" style={{ gap: 3, maxWidth: 330 }}>
          <div className="sg-label">{mission.title}</div>
          {objective && <div className="sg-hud__stat"><span>Objective</span><b>{objective.title}</b></div>}
        </div>
      )}

      <div className="sg-hud__top">
        <div className="sg-hud__card sg-stack" style={{ gap: 4 }}>
          <div className="sg-hud__stat">Score <b>{hud.score}</b></div>
          <div className="sg-hud__stat">Encounter <b>{hud.wave}</b>{mode === 'endless' && <span className="sg-muted"> endless</span>}</div>
        </div>
        <div className="sg-hud__card sg-stack" style={{ gap: 5, alignItems: 'flex-end' }}>
          <div className="sg-hud__stat">Hull <b>{Math.round(hud.health)}</b></div>
          <PlayerHealthBar health={hud.health} />
          <div className="sg-hud__stat" style={{ color: WEAPON_META[hud.weapon]?.color }}>{WEAPON_META[hud.weapon]?.name}</div>
        </div>
      </div>

      {boss && (
        <div className="sg-bossbar">
          <div className="sg-hud__stat"><b>{boss.name}</b></div>
          <div className="sg-bossbar__track"><div className="sg-bossbar__fill" style={{ width: `${Math.max(0, Math.min(100, (boss.health / Math.max(1, boss.maxHealth)) * 100))}%` }} /></div>
        </div>
      )}

      {hud.waveBanner && <div className="sg-banner"><div>Encounter {hud.wave}</div></div>}
      {fps != null && <div className="sg-fps">{fps} FPS</div>}
    </div>
  );
}

export default GameHUD;
