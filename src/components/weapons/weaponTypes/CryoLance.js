import Weapon from '../Weapon';

/**
 * Ice weapon. Slow, heavy shards that chill whatever they hit: enemies take
 * damage, get slowed, and stack "frost" that briefly freezes them solid.
 * Amplifiers on this weapon deepen the chill instead of only adding damage.
 */
export class CryoLance extends Weapon {
  constructor() {
    super({
      key: 'cryoLance',
      name: 'Cryo Lance',
      fireRate: 3,
      damage: 26,
      projectileCount: 2,
      spread: 0.16,
      projectileSpeed: 700,
      projectileSize: 8,
      color: '#a5f3ff',
    });
  }

  /** Chill duration grows with this weapon's own amplifiers. */
  chill(owner) {
    const amps = this.ampsOf(owner);
    return 1.6 + (amps.damage || 0) * 0.25 + (amps.fire || 0) * 0.15;
  }

  fire(engine, owner, angle) {
    engine.pendingChill = this.chill(owner);
    super.fire(engine, owner, angle);
  }
}

export default CryoLance;
