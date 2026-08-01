import { getSprite } from './assetLoader';

function tintedDraw(ctx, img, x, y, size, angle, color) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.globalAlpha = 1;
  ctx.drawImage(img, -size / 2, -size / 2, size, size);
  ctx.globalCompositeOperation = 'source-atop';
  ctx.fillStyle = color;
  ctx.globalAlpha = 0.85;
  ctx.fillRect(-size / 2, -size / 2, size, size);
  ctx.restore();
}

export function drawShip(ctx, x, y, size, angle, color) {
  const img = getSprite('player');
  const drawSize = size * 1.7;
  if (img && img.complete && img.naturalWidth) {
    ctx.save();
    ctx.shadowColor = color;
    ctx.shadowBlur = 10;
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(drawSize / 2, 0);
    ctx.lineTo(-drawSize / 2, drawSize / 2.6);
    ctx.lineTo(-drawSize / 4, 0);
    ctx.lineTo(-drawSize / 2, -drawSize / 2.6);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
    return;
  }
  // Fallback rect
  ctx.fillStyle = color;
  ctx.fillRect(x - size / 2, y - size / 2, size, size);
}

export function drawEnemyShape(ctx, type, x, y, size, color, angle = 0) {
  const img = getSprite(type);
  if (img && img.complete && img.naturalWidth) {
    tintedDraw(ctx, img, x, y, size * 1.25, type === 'Boss' ? 0 : angle + Math.PI / 2, color);
    return;
  }
  ctx.fillStyle = color;
  ctx.fillRect(x - size / 2, y - size / 2, size, size);
}

export function drawSprite(ctx, img, x, y, size, angle = 0) {
  if (!img) return false;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.drawImage(img, -size / 2, -size / 2, size, size);
  ctx.restore();
  return true;
}
