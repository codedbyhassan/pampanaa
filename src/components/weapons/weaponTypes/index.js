import Blaster from './Blaster';
import Shotgun from './Shotgun';
import Laser from './Laser';
import HomingMissile from './HomingMissile';
import Flamethrower from './Flamethrower';
import TeslaArc from './TeslaArc';
import CryoLance from './CryoLance';

export const WEAPON_ORDER = [
  'blaster',
  'shotgun',
  'laser',
  'homingMissile',
  'flamethrower',
  'teslaArc',
  'cryoLance',
];

export const WEAPON_META = {
  blaster: { name: 'Blaster', color: '#ffe066', element: 'Kinetic' },
  shotgun: { name: 'Shotgun', color: '#ff9f4a', element: 'Kinetic' },
  laser: { name: 'Laser', color: '#7bf1ff', element: 'Photon' },
  homingMissile: { name: 'Homing', color: '#ff6bd6', element: 'Explosive' },
  flamethrower: { name: 'Flame', color: '#ff8a3d', element: 'Fire' },
  teslaArc: { name: 'Tesla', color: '#9be8ff', element: 'Electric' },
  cryoLance: { name: 'Cryo', color: '#a5f3ff', element: 'Ice' },
};

/** Player-facing descriptions used by the in-game codex. */
export const WEAPON_DESCRIPTIONS = {
  blaster: 'Reliable single-shot cannon. No cooldown surprises, good all-round damage.',
  shotgun: 'Short-range burst of five pellets. Devastating point blank, weak at distance.',
  laser: 'Rapid low-damage beam bolts that travel almost instantly.',
  homingMissile: 'Slow, heavy missiles that steer into the nearest target on their own.',
  flamethrower: 'Continuous 420px cone that sets enemies alight. Damage falls off with distance.',
  teslaArc: 'Chain lightning. Latches onto a target and jumps to nearby enemies, losing power per jump.',
  cryoLance: 'Twin ice shards that freeze and slow whatever they hit, stacking frost into a full freeze.',
};

export function createWeapons() {
  return {
    blaster: new Blaster(),
    shotgun: new Shotgun(),
    laser: new Laser(),
    homingMissile: new HomingMissile(),
    flamethrower: new Flamethrower(),
    teslaArc: new TeslaArc(),
    cryoLance: new CryoLance(),
  };
}
