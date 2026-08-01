import Weapon from '../Weapon';

export class Shotgun extends Weapon {
  constructor() {
    super({
      key: 'shotgun',
      name: 'Shotgun',
      fireRate: 1.6,
      damage: 18,
      projectileCount: 5,
      spread: 0.5,
      projectileSpeed: 540,
      projectileSize: 6,
      color: '#ff9f4a',
    });
  }
}
export default Shotgun;
