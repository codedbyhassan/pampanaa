import { PICKUP_CATALOG, WEAPON_CATALOG } from '../../domain/player/playerLoadout';

function polygon(ctx, sides, radius, rotation = 0) {
  ctx.beginPath();
  for (let i = 0; i < sides; i += 1) {
    const a = rotation + (Math.PI * 2 * i) / sides;
    const x = Math.cos(a) * radius;
    const y = Math.sin(a) * radius;
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  }
  ctx.closePath();
}

export function drawWardenWeapon(ctx, x, y, angle, weaponKey, intensity = 1) {
  const weapon = WEAPON_CATALOG[weaponKey] ?? WEAPON_CATALOG.blaster;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.globalAlpha = 0.65 + intensity * 0.35;
  ctx.lineWidth = 2;
  ctx.strokeStyle = '#dbeafe';
  ctx.fillStyle = weapon.family === 'energy' ? '#67e8f9' : '#e2e8f0';
  const width = weaponKey === 'arc' ? 5 : 3;
  ctx.fillRect(-width / 2, -18, width, 16);
  ctx.strokeRect(-width / 2, -18, width, 16);
  ctx.restore();
}

export function drawPlayerPickup(ctx, pickup, time = 0) {
  const definition = PICKUP_CATALOG[pickup.type];
  if (!definition) return;
  const pulse = 1 + Math.sin(time * 5 + pickup.x) * 0.08;
  const radius = pickup.radius * pulse;
  ctx.save();
  ctx.translate(pickup.x, pickup.y);
  ctx.globalAlpha = Math.max(0, 1 - pickup.age / pickup.lifetime);
  ctx.lineWidth = 2;
  ctx.strokeStyle = '#e2e8f0';
  ctx.fillStyle = definition.category === 'defense' ? '#67e8f9' : definition.category === 'weapon' ? '#c4b5fd' : '#f8fafc';
  polygon(ctx, definition.category === 'weapon' ? 4 : 6, radius, Math.PI / 4);
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(0, 0, radius * 0.35, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}
