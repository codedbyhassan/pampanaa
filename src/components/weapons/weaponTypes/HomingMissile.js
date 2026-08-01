import Weapon from '../Weapon';

export class HomingMissile extends Weapon {
  constructor() {
    super({
      key: 'homingMissile',
      name: 'Homing Missile',
      fireRate: 1.2,
      damage: 55,
      projectileSpeed: 330,
      projectileSize: 9,
      color: '#ff6bd6',
      homing: true,
    });
  }
}
export default HomingMissile;
