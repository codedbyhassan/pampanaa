import { Quadtree } from './Quadtree';
import { WORLD } from '../../utils/constants';

export function aabbOverlap(a, b) {
  return (
    Math.abs(a.x - b.x) * 2 < a.width + b.width && Math.abs(a.y - b.y) * 2 < a.height + b.height
  );
}

const tree = new Quadtree({ x: 0, y: 0, width: WORLD.width, height: WORLD.height });

function rectOf(e, pad = 0) {
  return {
    x: e.x - e.width / 2 - pad,
    y: e.y - e.height / 2 - pad,
    width: e.width + pad * 2,
    height: e.height + pad * 2,
  };
}

export function resolveCollisions(engine) {
  const player = engine.player;
  if (!player.active) return;

  // The arena resizes with the viewport, so re-fit the spatial index bounds.
  tree.clear();
  tree.bounds.width = WORLD.width;
  tree.bounds.height = WORLD.height;
  for (const enemy of engine.enemies) if (enemy.active) tree.insert(enemy);

  // Player projectiles vs enemies (quadtree-narrowed candidates).
  const candidates = [];
  engine.projectiles.forEachActive((p) => {
    if (p.source !== 'player') return;
    candidates.length = 0;
    tree.query(rectOf(p, 4), candidates);
    for (let i = 0; i < candidates.length; i++) {
      const enemy = candidates[i];
      if (!enemy.active || !p.active) continue;
      if (aabbOverlap(p, enemy)) {
        engine.damageEnemy(enemy, p.damage, p.weaponKey);
        if (!p.piercing) p.deactivate();
      }
    }
  });

  // Enemy projectiles vs player.
  engine.projectiles.forEachActive((p) => {
    if (p.source !== 'enemy' || !player.active) return;
    if (aabbOverlap(p, player)) {
      engine.damagePlayer(p.damage, 6);
      p.deactivate();
    }
  });

  // Enemies vs player (contact damage).
  const near = tree.query(rectOf(player, 8), []);
  for (let i = 0; i < near.length; i++) {
    const enemy = near[i];
    if (!enemy.active) continue;
    if (aabbOverlap(enemy, player) && enemy.canContact()) {
      enemy.onContact();
      engine.damagePlayer(enemy.contactDamage, enemy.type === 'Tank' || enemy.type === 'Boss' ? 14 : 6);
    }
  }

  // Pickups vs player.
  engine.pickups.forEachActive((pickup) => {
    if (aabbOverlap(pickup, player)) engine.collectPickup(pickup);
  });
}
