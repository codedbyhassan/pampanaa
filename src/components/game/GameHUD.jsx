import PlayerHealthBar from '../player/PlayerHealthBar';
import WeaponSelector from './WeaponSelector';
import { PICKUP_TYPES } from '../pickups/pickupTypes';
import { WEAPON_META } from '../weapons/weaponTypes';

const BUFF_LABEL = { shield: PICKUP_TYPES.shield.label, rapidFire: PICKUP_TYPES.rapidFire.label, scoreMultiplier: PICKUP_TYPES.scoreMultiplier.label, autoLock: PICKUP_TYPES.autoLock.label, multishot: PICKUP_TYPES.multishot.label };
const AMP_COLORS = { damage: '#FFD700', fire: '#00BFFF', pierce: '#FFB347', multishot: '#FF1493' };
const AMP_LABELS = { damage: 'DMG', fire: 'FIRE', pierce: 'PIERCE', multishot: 'MULTI' };

export function GameHUD({ hud, mode, mission, fps }) {
  const activeBuffs = Object.entries(hud.buffs || {}).filter(([, v]) => v > 0);
  const objective = mission?.objectives?.find((item) => !item.completed) || mission?.objectives?.at(-1);

  return (
    <div className="sg-hud">
      {mission && mode !== 'endless' && (
        <div className="sg-hud__card sg-stack" style={{ gap: 3, maxWidth: 360 }}>
          <div className="sg-label">{mission.title}</div>
          {objective && <div className="sg-hud__stat"><span>Objective</span><b>{objective.title}</b></div>}
        </div>
      )}
      <div className="sg-hud__top">
        <div className="sg-hud__card sg-stack" style={{ gap: 4 }}>
          <div className="sg-hud__stat">Score <b>{hud.score}</b></div>
          <div className="sg-hud__stat">Encounter <b>{hud.wave}</b> {mode === 'endless' && <span className="sg-muted">endless</span>}</div>
        </div>
        <div className="sg-hud__card sg-stack" style={{ gap: 6, alignItems: 'flex-end' }}>
          <div className="sg-hud__stat">Hull <b>{Math.round(hud.health)}</b></div>
          <PlayerHealthBar health={hud.health} />
          <div className="sg-hud__stat" style={{ color: WEAPON_META[hud.weapon]?.color }}>{WEAPON_META[hud.weapon]?.name}</div>
        </div>
      </div>
      {activeBuffs.length > 0 && <div className="sg-buffs">{activeBuffs.map(([key, value]) => <div className="sg-buff" key={key}>{BUFF_LABEL[key] || key} · {Math.ceil(value)}s</div>)}</div>}
      {hud.amps && Object.values(hud.amps).some((v) => v > 0) && (
        <div className="sg-amplifiers">
          <div className="sg-amplifier-badge" style={{ borderColor: WEAPON_META[hud.weapon]?.color, color: WEAPON_META[hud.weapon]?.color }}><span className="sg-amplifier-label">{WEAPON_META[hud.weapon]?.name}</span></div>
          {Object.entries(hud.amps).map(([type, count]) => count > 0 && <div key={type} className="sg-amplifier-badge" style={{ borderColor: AMP_COLORS[type], color: AMP_COLORS[type] }}><span className="sg-amplifier-label">{AMP_LABELS[type]}</span><span className="sg-amplifier-count">{count}x</span></div>)}
        </div>
      )}
      {hud.combo > 0 && <div className="sg-combo" style={{ '--combo-level': Math.floor(hud.combo / 5) }}><div className="sg-combo__label">COMBO</div><div className="sg-combo__count">{hud.combo}</div>{hud.comboMultiplier > 1 && <div className="sg-combo__mult">×{hud.comboMultiplier.toFixed(1)}</div>}</div>}
      {hud.boss && <div className="sg-bossbar"><div className="sg-hud__stat">{hud.boss.name}</div><div className="sg-bossbar__track"><div className="sg-bossbar__fill" style={{ width: `${Math.max(0, (hud.boss.health / hud.boss.maxHealth) * 100)}%` }} /></div></div>}
      {hud.waveBanner && <div className="sg-banner"><div>Encounter {hud.wave}</div>{hud.waveMastery && <div className="sg-banner__mastery" data-mastery={hud.waveMastery}>{hud.waveMastery === 'PERFECT' && '⭐ PERFECT!'}{hud.waveMastery === 'NO_HIT' && '⭐⭐ FLAWLESS!'}</div>}</div>}
      <WeaponSelector current={hud.weapon} unlocked={hud.unlockedWeapons} />
      {fps != null && <div className="sg-fps">{fps} FPS</div>}
    </div>
  );
}

export default GameHUD;
