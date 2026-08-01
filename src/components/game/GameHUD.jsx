import PlayerHealthBar from '../player/PlayerHealthBar';
import WeaponSelector from './WeaponSelector';
import { PICKUP_TYPES } from '../pickups/pickupTypes';
import { WEAPON_META } from '../weapons/weaponTypes';

const BUFF_LABEL = {
  shield: PICKUP_TYPES.shield.label,
  rapidFire: PICKUP_TYPES.rapidFire.label,
  scoreMultiplier: PICKUP_TYPES.scoreMultiplier.label,
};

export function GameHUD({ hud, mode, fps }) {
  const activeBuffs = Object.entries(hud.buffs || {}).filter(([, v]) => v > 0);

  return (
    <div className="sg-hud">
      <div className="sg-hud__top">
        <div className="sg-hud__card sg-stack" style={{ gap: 4 }}>
          <div className="sg-hud__stat">
            Score <b>{hud.score}</b>
          </div>
          <div className="sg-hud__stat">
            Wave <b>{hud.wave}</b> {mode === 'endless' && <span className="sg-muted">endless</span>}
          </div>
        </div>

        <div className="sg-hud__card sg-stack" style={{ gap: 6, alignItems: 'flex-end' }}>
          <div className="sg-hud__stat">
            Hull <b>{Math.round(hud.health)}</b>
          </div>
          <PlayerHealthBar health={hud.health} />
          <div className="sg-hud__stat" style={{ color: WEAPON_META[hud.weapon]?.color }}>
            {WEAPON_META[hud.weapon]?.name}
          </div>
        </div>
      </div>

      {activeBuffs.length > 0 && (
        <div className="sg-buffs">
          {activeBuffs.map(([key, value]) => (
            <div className="sg-buff" key={key}>
              {BUFF_LABEL[key]} · {Math.ceil(value)}s
            </div>
          ))}
        </div>
      )}

      {hud.boss && (
        <div className="sg-bossbar">
          <div className="sg-hud__stat">{hud.boss.name}</div>
          <div className="sg-bossbar__track">
            <div
              className="sg-bossbar__fill"
              style={{ width: `${Math.max(0, (hud.boss.health / hud.boss.maxHealth) * 100)}%` }}
            />
          </div>
        </div>
      )}

      {hud.waveBanner && <div className="sg-banner">Wave {hud.wave}</div>}

      <WeaponSelector current={hud.weapon} unlocked={hud.unlockedWeapons} />
      {fps != null && <div className="sg-fps">{fps} FPS</div>}
    </div>
  );
}

export default GameHUD;
