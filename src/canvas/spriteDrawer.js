/**
 * Procedural vector art for every entity — no image assets, so shapes stay
 * crisp at any resolution and can be tinted per palette/skin.
 */

function glow(ctx, color, blur) {
  ctx.shadowColor = color;
  ctx.shadowBlur = blur;
}

/** Player ship: layered hull, canopy, wing fins and a live engine flame. */
export function drawShip(ctx, x, y, size, angle, color, opts = {}) {
  const s = size * 1.25;
  const thrust = opts.thrust ?? 0;
  const time = opts.time ?? 0;
  const shielded = opts.shielded;

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle + Math.PI / 2); // sprite is drawn nose-up

  // Engine flame
  const flame = (0.5 + thrust * 0.5) * (0.8 + Math.sin(time * 30) * 0.2);
  const grad = ctx.createLinearGradient(0, s * 0.35, 0, s * (0.5 + flame * 0.7));
  grad.addColorStop(0, 'rgba(255,255,255,0.95)');
  grad.addColorStop(0.4, color);
  grad.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.moveTo(-s * 0.18, s * 0.34);
  ctx.lineTo(0, s * (0.55 + flame * 0.6));
  ctx.lineTo(s * 0.18, s * 0.34);
  ctx.closePath();
  ctx.fill();

  // Wings
  glow(ctx, color, 14);
  ctx.fillStyle = color;
  ctx.globalAlpha = 0.55;
  ctx.beginPath();
  ctx.moveTo(0, -s * 0.18);
  ctx.lineTo(-s * 0.62, s * 0.34);
  ctx.lineTo(-s * 0.22, s * 0.24);
  ctx.lineTo(0, s * 0.42);
  ctx.lineTo(s * 0.22, s * 0.24);
  ctx.lineTo(s * 0.62, s * 0.34);
  ctx.closePath();
  ctx.fill();

  // Hull
  ctx.globalAlpha = 1;
  ctx.beginPath();
  ctx.moveTo(0, -s * 0.6);
  ctx.quadraticCurveTo(s * 0.26, -s * 0.1, s * 0.2, s * 0.36);
  ctx.lineTo(-s * 0.2, s * 0.36);
  ctx.quadraticCurveTo(-s * 0.26, -s * 0.1, 0, -s * 0.6);
  ctx.closePath();
  ctx.fill();
  ctx.shadowBlur = 0;

  // Hull highlight
  ctx.fillStyle = 'rgba(255,255,255,0.35)';
  ctx.beginPath();
  ctx.moveTo(0, -s * 0.55);
  ctx.lineTo(s * 0.1, s * 0.1);
  ctx.lineTo(-s * 0.1, s * 0.1);
  ctx.closePath();
  ctx.fill();

  // Canopy
  ctx.fillStyle = 'rgba(12,20,38,0.9)';
  ctx.beginPath();
  ctx.ellipse(0, -s * 0.16, s * 0.11, s * 0.2, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  ctx.beginPath();
  ctx.ellipse(-s * 0.03, -s * 0.22, s * 0.04, s * 0.07, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();

  if (shielded) {
    ctx.save();
    ctx.translate(x, y);
    ctx.strokeStyle = 'rgba(123,211,255,0.75)';
    ctx.lineWidth = 2;
    glow(ctx, '#7bd3ff', 18);
    ctx.beginPath();
    ctx.arc(0, 0, size * 1.05 + Math.sin(time * 6) * 2, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }
}

function polygon(ctx, sides, radius, rotation = 0) {
  ctx.beginPath();
  for (let i = 0; i < sides; i++) {
    const a = rotation + (i / sides) * Math.PI * 2;
    const px = Math.cos(a) * radius;
    const py = Math.sin(a) * radius;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
}

const SHAPES = {
  Chaser(ctx, r, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(0, r);
    ctx.lineTo(-r, -r * 0.6);
    ctx.lineTo(-r * 0.35, -r * 0.25);
    ctx.lineTo(0, -r * 0.7);
    ctx.lineTo(r * 0.35, -r * 0.25);
    ctx.lineTo(r, -r * 0.6);
    ctx.closePath();
    ctx.fill();
  },
  Shooter(ctx, r, color) {
    ctx.fillStyle = color;
    polygon(ctx, 6, r, Math.PI / 6);
    ctx.fill();
    ctx.fillStyle = 'rgba(10,14,26,0.75)';
    ctx.fillRect(-r * 0.16, r * 0.25, r * 0.32, r * 0.6);
  },
  Tank(ctx, r, color) {
    ctx.fillStyle = color;
    polygon(ctx, 8, r, Math.PI / 8);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.35)';
    ctx.lineWidth = 3;
    polygon(ctx, 8, r * 0.6, Math.PI / 8);
    ctx.stroke();
  },
  Swarmer(ctx, r, color) {
    ctx.fillStyle = color;
    polygon(ctx, 3, r, Math.PI / 2);
    ctx.fill();
  },
  Splitter(ctx, r, color) {
    ctx.fillStyle = color;
    polygon(ctx, 4, r, Math.PI / 4);
    ctx.fill();
    ctx.strokeStyle = 'rgba(10,14,26,0.6)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, -r);
    ctx.lineTo(0, r);
    ctx.stroke();
  },
  Boss(ctx, r, color, time) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(0, r);
    ctx.lineTo(-r, r * 0.15);
    ctx.lineTo(-r * 0.62, -r * 0.85);
    ctx.lineTo(r * 0.62, -r * 0.85);
    ctx.lineTo(r, r * 0.15);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = 'rgba(8,12,22,0.85)';
    ctx.beginPath();
    ctx.ellipse(0, -r * 0.1, r * 0.45, r * 0.28, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = `rgba(255,255,255,${0.4 + Math.sin(time * 4) * 0.3})`;
    ctx.beginPath();
    ctx.arc(0, -r * 0.1, r * 0.13, 0, Math.PI * 2);
    ctx.fill();
  },
};

export function drawEnemyShape(ctx, type, x, y, size, color, wobble = 0) {
  const r = size / 2;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(wobble);
  glow(ctx, color, type === 'Boss' ? 26 : 12);
  (SHAPES[type] || SHAPES.Chaser)(ctx, r, color, performance.now() / 1000);
  ctx.restore();
  ctx.shadowBlur = 0;
}
