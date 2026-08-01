import Enemy from '../Enemy';
import { vectorToPlayer } from '../EnemyAI';

/** Two-phase boss: alternates between chasing and a radial burst-fire volley. */
export class Boss extends Enemy {
  constructor(x, y, scale = 1, wave = 5) {
    const tier = 1 + Math.floor(wave / 5) * 0.6;
    super({
      type: 'Boss',
      x,
      y,
      size: 84,
      speed: 48,
      health: 900 * scale * tier,
      contactDamage: 26 * scale,
      scoreValue: 250 * Math.round(tier),
    });
    this.name = `Warden Mk.${Math.max(1, Math.floor(wave / 5))}`;
    this.phase = 'chase';
    this.phaseTimer = 4;
    this.burstTimer = 0;
    this.damageScale = scale;
  }

  update(dt, engine) {
    super.update(dt);
    this.phaseTimer -= dt;
    if (this.phaseTimer <= 0) {
      this.phase = this.phase === 'chase' ? 'burst' : 'chase';
      this.phaseTimer = this.phase === 'chase' ? 4 : 2.6;
      this.burstTimer = 0;
    }

    if (this.phase === 'chase') {
      this.move(dt, vectorToPlayer(this, engine.player));
    } else {
      this.burstTimer -= dt;
      if (this.burstTimer <= 0) {
        this.burstTimer = 0.6;
        const count = 14;
        const offset = Math.random() * Math.PI;
        for (let i = 0; i < count; i++) {
          const a = offset + (i / count) * Math.PI * 2;
          engine.spawnProjectile({
            x: this.x + Math.cos(a) * 46,
            y: this.y + Math.sin(a) * 46,
            vx: Math.cos(a) * 240,
            vy: Math.sin(a) * 240,
            width: 10,
            height: 10,
            damage: 9 * this.damageScale,
            color: engine.palette.enemyProjectile,
            source: 'enemy',
            life: 4,
          });
        }
      }
    }
  }
}
export default Boss;
