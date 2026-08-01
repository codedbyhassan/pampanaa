import Vector2D from '../physics/Vector2D';

export function vectorToPlayer(enemy, player) {
  return Vector2D.normalize({ x: player.x - enemy.x, y: player.y - enemy.y });
}

export function distanceToPlayer(enemy, player) {
  return Vector2D.distance(enemy, player);
}

/** Returns a direction that closes to, or backs away from, a preferred range. */
export function maintainDistance(enemy, player, preferredRange, tolerance = 40) {
  const dist = distanceToPlayer(enemy, player);
  const dir = vectorToPlayer(enemy, player);
  if (dist > preferredRange + tolerance) return dir;
  if (dist < preferredRange - tolerance) return { x: -dir.x, y: -dir.y };
  // Strafe sideways when comfortably in range.
  return { x: -dir.y * 0.6, y: dir.x * 0.6 };
}
