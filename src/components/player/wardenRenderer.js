import { createWardenVisual } from '../../domain/player/playerVisual';

function glow(ctx, color, blur = 12) {
  ctx.shadowColor = color;
  ctx.shadowBlur = blur;
}

function polygon(ctx, points) {
  ctx.beginPath();
  points.forEach(([x, y], index) => index ? ctx.lineTo(x, y) : ctx.moveTo(x, y));
  ctx.closePath();
}

function drawEngine(ctx, s, thrust, accent, time) {
  const pulse = 0.75 + Math.sin(time * 24) * 0.12;
  const length = s * (0.34 + thrust * 0.5) * pulse;
  const gradient = ctx.createLinearGradient(0, s * 0.24, 0, s * 0.24 + length);
  gradient.addColorStop(0, 'rgba(255,255,255,0.95)');
  gradient.addColorStop(0.32, accent);
  gradient.addColorStop(1, 'rgba(125,211,252,0)');
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.moveTo(-s * 0.09, s * 0.25);
  ctx.lineTo(0, s * 0.25 + length);
  ctx.lineTo(s * 0.09, s * 0.25);
  ctx.closePath();
  ctx.fill();
}

function drawInterceptor(ctx, s, visual) {
  polygon(ctx, [
    [0, -s * 0.76],
    [s * 0.16, -s * 0.22],
    [s * 0.62, s * 0.3],
    [s * 0.32, s * 0.24],
    [s * 0.18, s * 0.52],
    [0, s * 0.38],
    [-s * 0.18, s * 0.52],
    [-s * 0.32, s * 0.24],
    [-s * 0.62, s * 0.3],
    [-s * 0.16, -s * 0.22],
  ]);
  ctx.fillStyle = visual.hull;
  ctx.fill();
  ctx.strokeStyle = visual.trim;
  ctx.lineWidth = Math.max(1.2, s * 0.035);
  ctx.stroke();

  ctx.fillStyle = visual.trim;
  polygon(ctx, [[-s * 0.48, s * 0.25], [-s * 0.18, s * 0.18], [-s * 0.12, s * 0.34], [-s * 0.36, s * 0.38]]);
  ctx.fill();
  polygon(ctx, [[s * 0.48, s * 0.25], [s * 0.18, s * 0.18], [s * 0.12, s * 0.34], [s * 0.36, s * 0.38]]);
  ctx.fill();
}

function drawVanguard(ctx, s, visual) {
  polygon(ctx, [[0, -s * 0.68], [s * 0.42, -s * 0.06], [s * 0.54, s * 0.38], [s * 0.16, s * 0.28], [0, s * 0.48], [-s * 0.16, s * 0.28], [-s * 0.54, s * 0.38], [-s * 0.42, -s * 0.06]]);
  ctx.fillStyle = visual.hull;
  ctx.fill();
  ctx.strokeStyle = visual.trim;
  ctx.lineWidth = Math.max(1.2, s * 0.04);
  ctx.stroke();
}

function drawRanger(ctx, s, visual) {
  polygon(ctx, [[0, -s * 0.82], [s * 0.24, -s * 0.14], [s * 0.7, s * 0.26], [s * 0.28, s * 0.18], [s * 0.14, s * 0.48], [-s * 0.14, s * 0.48], [-s * 0.28, s * 0.18], [-s * 0.7, s * 0.26], [-s * 0.24, -s * 0.14]]);
  ctx.fillStyle = visual.hull;
  ctx.fill();
  ctx.strokeStyle = visual.trim;
  ctx.lineWidth = Math.max(1.2, s * 0.035);
  ctx.stroke();
}

export function drawWarden(ctx, x, y, size, angle, opts = {}) {
  const visual = createWardenVisual(opts.visual);
  const s = size * 1.55;
  const thrust = Math.max(0, Math.min(1, opts.thrust ?? 0));
  const time = opts.time ?? 0;
  const hitFlash = Math.max(0, opts.hitFlash ?? 0);
  const disabled = opts.disabled === true;

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle + Math.PI / 2);

  // Grounding shadow keeps the Warden readable without a persistent outline.
  ctx.globalAlpha = 0.28;
  ctx.fillStyle = '#000';
  ctx.beginPath();
  ctx.ellipse(0, s * 0.26, s * 0.48, s * 0.18, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;

  glow(ctx, visual.accent, 9 + thrust * 7);
  drawEngine(ctx, s, thrust, visual.accent, time);

  if (visual.design === 'vanguard') drawVanguard(ctx, s, visual);
  else if (visual.design === 'ranger') drawRanger(ctx, s, visual);
  else drawInterceptor(ctx, s, visual);

  // Central armor spine.
  ctx.fillStyle = visual.trim;
  polygon(ctx, [[0, -s * 0.5], [s * 0.075, s * 0.22], [0, s * 0.34], [-s * 0.075, s * 0.22]]);
  ctx.fill();

  // Cockpit is deliberately dark and compact, making the silhouette readable first.
  ctx.fillStyle = visual.cockpit;
  ctx.strokeStyle = visual.accent;
  ctx.lineWidth = Math.max(1.1, s * 0.025);
  ctx.beginPath();
  ctx.ellipse(0, -s * 0.18, s * 0.105, s * 0.22, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = 'rgba(255,255,255,0.62)';
  ctx.beginPath();
  ctx.ellipse(-s * 0.035, -s * 0.27, s * 0.028, s * 0.075, -0.2, 0, Math.PI * 2);
  ctx.fill();

  // Two small status lights communicate orientation without adding HUD clutter.
  ctx.fillStyle = visual.accent;
  ctx.shadowBlur = 8;
  ctx.beginPath();
  ctx.arc(-s * 0.34, s * 0.18, s * 0.028, 0, Math.PI * 2);
  ctx.arc(s * 0.34, s * 0.18, s * 0.028, 0, Math.PI * 2);
  ctx.fill();

  if (hitFlash > 0) {
    ctx.globalAlpha = Math.min(0.7, hitFlash * 1.5);
    ctx.fillStyle = '#fff';
    polygon(ctx, [[0, -s * 0.76], [s * 0.62, s * 0.3], [0, s * 0.52], [-s * 0.62, s * 0.3]]);
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  if (disabled) {
    ctx.globalAlpha = 0.45;
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, s * 0.88, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 1;
  }

  ctx.restore();

  if (opts.shielded) {
    ctx.save();
    ctx.translate(x, y);
    ctx.strokeStyle = 'rgba(125,211,252,0.7)';
    ctx.lineWidth = 1.5;
    glow(ctx, '#7dd3fc', 14);
    ctx.beginPath();
    ctx.arc(0, 0, size * 1.2 + Math.sin(time * 5) * 2, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  if (opts.autoLock) {
    ctx.save();
    ctx.translate(x, y);
    ctx.strokeStyle = 'rgba(110,231,183,0.55)';
    ctx.lineWidth = 1.2;
    ctx.setLineDash([4, 7]);
    ctx.beginPath();
    ctx.arc(0, 0, size * 1.42, time * 1.6, time * 1.6 + Math.PI * 1.45);
    ctx.stroke();
    ctx.restore();
  }
  ctx.shadowBlur = 0;
}

export default drawWarden;
