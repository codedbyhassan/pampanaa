import { PICKUP_CATALOG } from './playerLoadout';

export function createPlayerPickup(input = {}) {
  const definition = PICKUP_CATALOG[input.type];
  if (!definition) throw new Error(`Unknown player pickup: ${input.type}`);
  return Object.freeze({
    id: input.id ?? `pickup_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    type: definition.id,
    x: Number(input.x ?? 0),
    y: Number(input.y ?? 0),
    radius: Number(input.radius ?? 12),
    lifetime: Number(input.lifetime ?? 15),
    age: 0,
    collected: false,
  });
}

export function updatePlayerPickup(pickup, dt) {
  return createPlayerPickup({ ...pickup, age: pickup.age + dt });
}

export function isPickupExpired(pickup) {
  return pickup.collected || pickup.age >= pickup.lifetime;
}
