import { Quadtree } from './Quadtree';
import { WORLD } from '../../utils/constants';

export function aabbOverlap(a, b) {
  return Math.abs(a.x - b.x) * 2 < a.width + b.width && Math.abs(a.y - b.y) * 2 < a.height + b.height;
}

export function sweptAabbOverlap(a, b) {
  const minX = Math.min(a.prevX ?? a.x, a.x) - a.width / 2;
  const maxX = Math.max(a.prevX ?? a.x, a.x) + a.width / 2;
  const minY = Math.min(a.prevY ?? a.y, a.y) - a.height / 2;
  const maxY = Math.max(a.prevY ?? a.y, a.y) + a.height / 2;
  const bMinX = b.x - b.width / 2;
  const bMaxX = b.x + b.width / 2;
  const bMinY = b.y - b.height / 2;
  const bMaxY = b.y + b.height / 2;
  return maxX >= bMinX && minX <= bMaxX && maxY >= bMinY && minY <= bMaxY;
}

const tree = new Quadtree({ x: 0, y: 0, width: WORLD.width, height: WORLD.height });

function rectOf(e, pad = 0) {
  const minX = Math.min(e.prevX ?? e.x, e.x) - e.width / 2 - pad;
  const minY = Math.min(e.prevY ?? e.y, e.y) - e.height / 2 - pad;
  const maxX = Math.max(e.prevX ?? e.x, e.x) + e.width / 2 + pad;
  const maxY = Math.max(e.prevY ?? e.y, e.y) + e.height / 2 + pad;
  return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
}

export function resolveCollisions(engine) {
  const player = engine.player;
  if (!player.active) return;

  tree.clear();
  tree.bounds.width = WORLD.width;
  tree.bounds.height = WORLD.height;
  for (const enemy of engine.enemies) if (enemy.active) tree.insert(enemy);

  const candidates = [];
  engine.projectiles.forEachActive((p) => {
    if (p.source !== 'player') return;
    candidates.length = 0;
    tree.query(rectOf(p, 4), candidates);
    for (let i = 0; i < candidates.length; i += 1) {
      const enemy = candidates[i];
      if (!enemy.active || !p.active) continue;
      if (sweptAabbOverlap(p, enemy)) {
        engine.damageEnemy(enemy, p.damage, p.weaponKey);
        if (!p.piercing) p.deactivate();
      }
    }
  });

  engine.projectiles.forEachActive((p) => {
    if (p.source !== 'enemy' || !player.active) return;
    if (sweptAabbOverlap(p, player)) {
      engine.damagePlayer(p.damage, 6);
      p.deactivate();
    }
  });

  const near = tree.query(rectOf(player, 8), []);
  for (let i = 0; i < near.length; i += 1) {
    const enemy = near[i];
    if (!enemy.active) continue;
    if (aabbOverlap(enemy, player) && enemy.canContact()) {
      enemy.onContact();
      engine.damagePlayer(enemy.contactDamage, enemy.type === 'Tank' || enemy.type === 'Boss' ? 14 : 6);
    }
  }

  engine.pickups.forEachActive((pickup) => {
    if (aabbOverlap(pickup, player)) engine.collectPickup(pickup);
  });
}
