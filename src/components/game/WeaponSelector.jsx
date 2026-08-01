import { WEAPON_ORDER, WEAPON_META } from '../weapons/weaponTypes';
import { WEAPON_UNLOCK_WAVE } from '../../utils/constants';

export function WeaponSelector({ current, unlocked }) {
  return (
    <div className="sg-weapons">
      {WEAPON_ORDER.map((key, i) => {
        const isUnlocked = unlocked.includes(key);
        return (
          <div
            key={key}
            className="sg-weapon"
            data-active={key === current}
            data-locked={!isUnlocked}
            title={isUnlocked ? WEAPON_META[key].name : `Unlocks at wave ${WEAPON_UNLOCK_WAVE[key]}`}
          >
            <span style={{ color: WEAPON_META[key].color }}>{i + 1}</span>{' '}
            {isUnlocked ? WEAPON_META[key].name : '🔒'}
          </div>
        );
      })}
      <span className="sg-weapon__hint">scroll to switch</span>
    </div>
  );
}

export default WeaponSelector;
