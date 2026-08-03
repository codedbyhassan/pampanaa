import Weapon from '../Weapon';

const RANGE = 340;
const CHAIN_RANGE = 190;

/**
 * Electric chain weapon. It has no projectiles: each tick it latches onto the
 * closest enemy inside range, then the bolt jumps to further enemies, losing a
 * little power per jump. Multiplier pickups add extra jumps instead of extra
 * bullets, and the arc is drawn as short-lived spark particles.
 */
export class TeslaArc extends Weapon {
  constructor() {
    super({
      key: 'teslaArc',
      name: 'Tesla Arc',
      fireRate: 7,
      damage: 14,
      color: '#9be8ff',
      continuous: true,
      range: RANGE,
    });
  }

  reach(owner) {
    const amps = this.ampsOf(owner);
    return RANGE * (1 + (amps.fire || 0) * 0.06);
  }

  chains(owner) {
    const mul = owner.shotMultiplierFor?.(this.key) ?? 1;
    const amps = this.ampsOf(owner);
    return Math.min(8, 1 + Math.round(mul - 1) + (amps.pierce || 0));
  }

  nearest(engine, x, y, radius, seen) {
    let best = null;
    let bestDist = radius * radius;
    for (const enemy of engine.enemies) {
      if (!enemy.active || seen.has(enemy)) continue;
      const d = (enemy.x - x) ** 2 + (enemy.y - y) ** 2;
      if (d < bestDist) {
        bestDist = d;
        best = enemy;
      }
    }
    return best;
  }

  bolt(engine, x1, y1, x2, y2) {
    const steps = 5;
    for (let i = 0; i < steps; i++) {
      const t = i / steps;
      engine.particles.emitOne({
        x: x1 + (x2 - x1) * t + (Math.random() - 0.5) * 14,
        y: y1 + (y2 - y1) * t + (Math.random() - 0.5) * 14,
        vx: (Math.random() - 0.5) * 40,
        vy: (Math.random() - 0.5) * 40,
        life: 0.1 + Math.random() * 0.08,
        size: 3 + Math.random() * 3,
        color: Math.random() > 0.5 ? '#9be8ff' : '#ffffff',
      });
    }
  }

  fire(engine, owner, angle) {
    const dmg = this.damage * (owner.damageMulFor?.(this.key) ?? 1);
    const maxChains = this.chains(owner);
    const seen = new Set();

    let fromX = owner.x + Math.cos(angle) * 18;
    let fromY = owner.y + Math.sin(angle) * 18;
    let power = dmg;
    let hit = false;

    for (let i = 0; i < maxChains; i++) {
      const radius = i === 0 ? this.reach(owner) : CHAIN_RANGE;
      const target = this.nearest(engine, fromX, fromY, radius, seen);
      if (!target) break;
      seen.add(target);
      this.bolt(engine, fromX, fromY, target.x, target.y);
      engine.damageEnemy(target, power, this.key);
      target.applySlow?.(0.4);
      fromX = target.x;
      fromY = target.y;
      power *= 0.78;
      hit = true;
    }

    if (!hit) this.bolt(engine, fromX, fromY, fromX + Math.cos(angle) * 70, fromY + Math.sin(angle) * 70);
    engine.sound.play('shoot');
    engine.trackShot(this.key);
  }
}

export default TeslaArc;
