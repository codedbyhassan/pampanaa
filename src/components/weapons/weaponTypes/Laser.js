import Weapon from '../Weapon';

export class Laser extends Weapon {
  constructor() {
    super({
      key: 'laser',
      name: 'Laser',
      fireRate: 11,
      damage: 7,
      projectileSpeed: 1000,
      projectileSize: 4,
      color: '#7bf1ff',
    });
  }
}
export default Laser;
