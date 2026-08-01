import Blaster from './Blaster';
import Shotgun from './Shotgun';
import Laser from './Laser';
import HomingMissile from './HomingMissile';
import Flamethrower from './Flamethrower';

export const WEAPON_ORDER = ['blaster', 'shotgun', 'laser', 'homingMissile', 'flamethrower'];

export const WEAPON_META = {
  blaster: { name: 'Blaster', color: '#ffe066' },
  shotgun: { name: 'Shotgun', color: '#ff9f4a' },
  laser: { name: 'Laser', color: '#7bf1ff' },
  homingMissile: { name: 'Homing', color: '#ff6bd6' },
  flamethrower: { name: 'Flame', color: '#ff8a3d' },
};

export function createWeapons() {
  return {
    blaster: new Blaster(),
    shotgun: new Shotgun(),
    laser: new Laser(),
    homingMissile: new HomingMissile(),
    flamethrower: new Flamethrower(),
  };
}
