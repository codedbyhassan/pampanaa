import Weapon from '../Weapon';

export class Blaster extends Weapon {
  constructor() {
    super({
      key: 'blaster',
      name: 'Blaster',
      fireRate: 4,
      damage: 22,
      projectileSpeed: 620,
      projectileSize: 7,
      color: '#ffe066',
    });
  }
}
export default Blaster;
