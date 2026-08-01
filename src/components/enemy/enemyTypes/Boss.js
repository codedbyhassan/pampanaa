import Enemy from '../Enemy';
import { WORLD } from '../../../utils/constants';

/**
 * Stationary-lane boss: patrols the top of the arena on a fixed sine path and
 * cycles between aimed volleys and a radial burst. It never hunts the player.
 */
export class Boss extends Enemy {
  constructor(x, y, scale = 1, wave = 5) {
    const tier = 1 + Math.floor(wave / 5) * 0.6;
    super({
      type: 'Boss',
      x,
      y,
      size: 96,
      speed: 150,
      health: 800 * scale * tier,
      contactDamage: 20 * scale,
      scoreValue: 250 * Math.round(tier),
    });
    this.name = `Warden Mk.${Math.max(1, Math.floor(wave / 5))}`;
    this.phase = 'volley';
    this.phaseTimer = 4;
    this.burstTimer = 0;
    this.damageScale = scale;
    this.patrol = 0;
    this.mode = 'boss';
  }

  update(dt, engine) {
    if (this.contactTimer > 0) this.contactTimer -= dt;
    this.bob += dt;
    this.patrol += dt;

    const targetY = WORLD.height * 0.2;
    const targetX = WORLD.width / 2 + Math.sin(this.patrol * 0.55) * WORLD.width * 0.3;
    this.seek(dt, targetX, targetY, 2.5);

    this.phaseTimer -= dt;
    if (this.phaseTimer <= 0) {
      this.phase = this.phase === 'volley' ? 'burst' : 'volley';
      this.phaseTimer = this.phase === 'volley' ? 4.5 : 3;
      this.burstTimer = 0;
    }

    this.burstTimer -= dt;
    if (this.burstTimer > 0) return;

    if (this.phase === 'volley') {
      this.burstTimer = 0.9;
      for (const offset of [-0.35, 0, 0.35]) {
        const a = Math.PI / 2 + offset;
        engine.spawnProjectile({
          x: this.x,
          y: this.y + 40,
          vx: Math.cos(a) * 280,
          vy: Math.sin(a) * 280,
          width: 12,
          height: 12,
          damage: 8 * this.damageScale,
          color: engine.palette.enemyProjectile,
          source: 'enemy',
          life: 6,
        });
      }
    } else {
      this.burstTimer = 1.1;
      const count = 12;
      const spread = Math.PI * 0.9;
      const start = Math.PI / 2 - spread / 2;
      for (let i = 0; i < count; i++) {
        const a = start + (i / (count - 1)) * spread;
        engine.spawnProjectile({
          x: this.x + Math.cos(a) * 46,
          y: this.y + Math.sin(a) * 46,
          vx: Math.cos(a) * 220,
          vy: Math.sin(a) * 220,
          width: 10,
          height: 10,
          damage: 7 * this.damageScale,
          color: engine.palette.enemyProjectile,
          source: 'enemy',
          life: 6,
        });
      }
    }
  }
}
export default Boss;
