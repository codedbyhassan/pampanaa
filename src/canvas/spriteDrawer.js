/**
 * Procedural vector art for every entity — no image assets, so shapes stay
 * crisp at any resolution. Enemies are drawn from the mathematical shape
 * spectrum; the player ship has several completely different hull designs.
 */

function glow(ctx, color, blur) {
  ctx.shadowColor = color;
  ctx.shadowBlur = blur;
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

function parametric(ctx, radius, fn, steps = 90) {
  ctx.beginPath();
  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * Math.PI * 2;
    const [px, py] = fn(t, radius);
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
}

/* ------------------------------------------------------------------ ships */

const HULLS = {
  interceptor(ctx, s) {
    ctx.beginPath();
    ctx.moveTo(0, -s * 0.6);
    ctx.quadraticCurveTo(s * 0.26, -s * 0.1, s * 0.2, s * 0.36);
    ctx.lineTo(-s * 0.2, s * 0.36);
    ctx.quadraticCurveTo(-s * 0.26, -s * 0.1, 0, -s * 0.6);
    ctx.closePath();
    ctx.fill();
  },
  delta(ctx, s) {
    ctx.beginPath();
    ctx.moveTo(0, -s * 0.66);
    ctx.lineTo(s * 0.5, s * 0.42);
    ctx.lineTo(0, s * 0.2);
    ctx.lineTo(-s * 0.5, s * 0.42);
    ctx.closePath();
    ctx.fill();
  },
  saucer(ctx, s) {
    ctx.beginPath();
    ctx.ellipse(0, 0, s * 0.52, s * 0.32, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(0, -s * 0.12, s * 0.24, s * 0.24, 0, 0, Math.PI * 2);
    ctx.fill();
  },
  falcon(ctx, s) {
    ctx.beginPath();
    ctx.moveTo(0, -s * 0.6);
    ctx.lineTo(s * 0.22, -s * 0.2);
    ctx.lineTo(s * 0.62, 0);
    ctx.lineTo(s * 0.3, s * 0.4);
    ctx.lineTo(-s * 0.3, s * 0.4);
    ctx.lineTo(-s * 0.62, 0);
    ctx.lineTo(-s * 0.22, -s * 0.2);
    ctx.closePath();
    ctx.fill();
  },
  needle(ctx, s) {
    ctx.beginPath();
    ctx.moveTo(0, -s * 0.75);
    ctx.lineTo(s * 0.14, s * 0.3);
    ctx.lineTo(s * 0.34, s * 0.44);
    ctx.lineTo(-s * 0.34, s * 0.44);
    ctx.lineTo(-s * 0.14, s * 0.3);
    ctx.closePath();
    ctx.fill();
  },
  manta(ctx, s) {
    ctx.beginPath();
    ctx.moveTo(0, -s * 0.5);
    ctx.quadraticCurveTo(s * 0.75, s * 0.05, s * 0.34, s * 0.45);
    ctx.quadraticCurveTo(0, s * 0.16, -s * 0.34, s * 0.45);
    ctx.quadraticCurveTo(-s * 0.75, s * 0.05, 0, -s * 0.5);
    ctx.closePath();
    ctx.fill();
  },
};

/** Player ship: layered hull, canopy, wing fins and a live engine flame. */
export function drawShip(ctx, x, y, size, angle, color, opts = {}) {
  const s = size * 1.25;
  const thrust = opts.thrust ?? 0;
  const time = opts.time ?? 0;
  const design = HULLS[opts.design] ? opts.design : 'interceptor';

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
  HULLS[design](ctx, s);
  ctx.shadowBlur = 0;

  // Highlight + canopy
  ctx.fillStyle = 'rgba(255,255,255,0.32)';
  ctx.beginPath();
  ctx.moveTo(0, -s * 0.5);
  ctx.lineTo(s * 0.09, s * 0.08);
  ctx.lineTo(-s * 0.09, s * 0.08);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = 'rgba(12,20,38,0.9)';
  ctx.beginPath();
  ctx.ellipse(0, -s * 0.16, s * 0.11, s * 0.2, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  ctx.beginPath();
  ctx.ellipse(-s * 0.03, -s * 0.22, s * 0.04, s * 0.07, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();

  if (opts.shielded) {
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
  if (opts.autoLock) {
    ctx.save();
    ctx.translate(x, y);
    ctx.strokeStyle = 'rgba(94,230,168,0.8)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([5, 6]);
    ctx.beginPath();
    ctx.arc(0, 0, size * 1.35, time * 2, time * 2 + Math.PI * 1.6);
    ctx.stroke();
    ctx.restore();
  }
  ctx.shadowBlur = 0;
}

/* ---------------------------------------------------------------- enemies */

const SHAPES = {
  dart(ctx, r, color) {
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
  triangle(ctx, r, color) {
    ctx.fillStyle = color;
    polygon(ctx, 3, r, Math.PI / 2);
    ctx.fill();
  },
  square(ctx, r, color) {
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
  hexagon(ctx, r, color) {
    ctx.fillStyle = color;
    polygon(ctx, 6, r, Math.PI / 6);
    ctx.fill();
    ctx.fillStyle = 'rgba(10,14,26,0.75)';
    ctx.fillRect(-r * 0.16, r * 0.25, r * 0.32, r * 0.6);
  },
  octagon(ctx, r, color) {
    ctx.fillStyle = color;
    polygon(ctx, 8, r, Math.PI / 8);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.35)';
    ctx.lineWidth = 3;
    polygon(ctx, 8, r * 0.6, Math.PI / 8);
    ctx.stroke();
  },
  circle(ctx, r, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(10,14,26,0.6)';
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.35, 0, Math.PI * 2);
    ctx.fill();
  },
  /** {5/2} star polygon. */
  pentagram(ctx, r, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
      const a = -Math.PI / 2 + (i * 4 * Math.PI) / 5;
      const px = Math.cos(a) * r;
      const py = Math.sin(a) * r;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
  },
  torus(ctx, r, color) {
    ctx.strokeStyle = color;
    ctx.lineWidth = r * 0.34;
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.72, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.2, 0, Math.PI * 2);
    ctx.fill();
  },
  /** Lemniscate of Bernoulli. */
  lemniscate(ctx, r, color) {
    ctx.fillStyle = color;
    parametric(ctx, r, (t, rad) => {
      const d = 1 + Math.sin(t) ** 2;
      return [(rad * Math.cos(t)) / d, (rad * Math.sin(t) * Math.cos(t)) / d];
    });
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.35)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  },
  /** Astroid: x = r cos³t, y = r sin³t. */
  astroid(ctx, r, color) {
    ctx.fillStyle = color;
    parametric(ctx, r, (t, rad) => [rad * Math.cos(t) ** 3, rad * Math.sin(t) ** 3]);
    ctx.fill();
  },
  /** Rose curve r = a·cos(4θ). */
  rose(ctx, r, color) {
    ctx.fillStyle = color;
    parametric(
      ctx,
      r,
      (t, rad) => {
        const rr = rad * Math.abs(Math.cos(4 * t));
        return [rr * Math.cos(t), rr * Math.sin(t)];
      },
      160,
    );
    ctx.fill();
  },
  /** Cardioid r = a(1 - cos θ). */
  cardioid(ctx, r, color) {
    ctx.fillStyle = color;
    parametric(
      ctx,
      r * 0.55,
      (t, rad) => {
        const rr = rad * (1 - Math.cos(t));
        return [rr * Math.cos(t), rr * Math.sin(t)];
      },
      140,
    );
    ctx.fill();
  },
  /** Projected helix. */
  helix(ctx, r, color) {
    ctx.strokeStyle = color;
    ctx.lineWidth = r * 0.22;
    ctx.lineCap = 'round';
    ctx.beginPath();
    for (let i = 0; i <= 40; i++) {
      const t = (i / 40) * Math.PI * 3;
      const px = Math.sin(t) * r * 0.8;
      const py = -r + (i / 40) * r * 2;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();
  },
  /** Sierpinski triangle, depth 2. */
  sierpinski(ctx, r, color) {
    ctx.fillStyle = color;
    const tri = (ax, ay, bx, by, cx, cy, depth) => {
      if (depth === 0) {
        ctx.beginPath();
        ctx.moveTo(ax, ay);
        ctx.lineTo(bx, by);
        ctx.lineTo(cx, cy);
        ctx.closePath();
        ctx.fill();
        return;
      }
      const m = (p, q) => [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2];
      const A = [ax, ay];
      const B = [bx, by];
      const C = [cx, cy];
      const AB = m(A, B);
      const BC = m(B, C);
      const CA = m(C, A);
      tri(A[0], A[1], AB[0], AB[1], CA[0], CA[1], depth - 1);
      tri(AB[0], AB[1], B[0], B[1], BC[0], BC[1], depth - 1);
      tri(CA[0], CA[1], BC[0], BC[1], C[0], C[1], depth - 1);
    };
    tri(0, -r, r * 0.92, r * 0.7, -r * 0.92, r * 0.7, 2);
  },
  /** Superellipse |x/a|^4 + |y/b|^4 = 1. */
  squircle(ctx, r, color) {
    ctx.fillStyle = color;
    parametric(ctx, r, (t, rad) => [
      rad * Math.sign(Math.cos(t)) * Math.abs(Math.cos(t)) ** 0.5,
      rad * Math.sign(Math.sin(t)) * Math.abs(Math.sin(t)) ** 0.5,
    ]);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.28)';
    ctx.lineWidth = 3;
    ctx.stroke();
  },
};

export function drawEnemyShape(ctx, shape, x, y, size, color, rotation = 0) {
  const r = size / 2;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);
  glow(ctx, color, 12);
  (SHAPES[shape] || SHAPES.dart)(ctx, r, color);
  ctx.restore();
  ctx.shadowBlur = 0;
}

/* ------------------------------------------------------------------ boss */

const BOSS_BODIES = {
  orbital(ctx, r, color, time) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = color;
    ctx.lineWidth = r * 0.06;
    for (let i = 0; i < 3; i++) {
      ctx.save();
      ctx.rotate(time * 0.5 + (i * Math.PI) / 3);
      ctx.beginPath();
      ctx.ellipse(0, 0, r, r * 0.34, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
  },
  triadic(ctx, r, color) {
    ctx.fillStyle = color;
    polygon(ctx, 3, r, -Math.PI / 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.4)';
    ctx.lineWidth = r * 0.05;
    polygon(ctx, 3, r * 0.6, Math.PI / 2);
    ctx.stroke();
  },
  relativity(ctx, r, color, time) {
    ctx.fillStyle = color;
    parametric(ctx, r * 0.75, (t, rad) => [rad * Math.cos(t), rad * 0.62 * Math.sin(t)]);
    ctx.fill();
    ctx.strokeStyle = color;
    ctx.lineWidth = r * 0.05;
    for (let i = 1; i <= 3; i++) {
      ctx.beginPath();
      ctx.arc(0, 0, r * (0.55 + i * 0.16) + Math.sin(time * 2 + i) * 2, 0, Math.PI * 2);
      ctx.stroke();
    }
  },
  loom(ctx, r, color) {
    ctx.fillStyle = color;
    ctx.fillRect(-r * 0.8, -r * 0.55, r * 1.6, r * 1.1);
    ctx.fillStyle = 'rgba(10,14,26,0.7)';
    for (let i = -3; i <= 3; i++) ctx.fillRect(i * r * 0.22 - r * 0.05, -r * 0.55, r * 0.1, r * 1.1);
  },
  radiant(ctx, r, color, time) {
    ctx.fillStyle = color;
    for (let i = 0; i < 8; i++) {
      ctx.save();
      ctx.rotate(time * 0.4 + (i / 8) * Math.PI * 2);
      ctx.beginPath();
      ctx.ellipse(r * 0.55, 0, r * 0.4, r * 0.14, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.34, 0, Math.PI * 2);
    ctx.fill();
  },
  tape(ctx, r, color) {
    ctx.fillStyle = color;
    ctx.fillRect(-r, -r * 0.28, r * 2, r * 0.56);
    ctx.fillStyle = 'rgba(10,14,26,0.75)';
    for (let i = -4; i <= 4; i++) ctx.fillRect(i * r * 0.22 - r * 0.06, -r * 0.2, r * 0.12, r * 0.4);
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.4, 0, Math.PI * 2);
    ctx.fill();
  },
  conic(ctx, r, color) {
    ctx.fillStyle = color;
    parametric(ctx, r * 0.8, (t, rad) => [rad * Math.cos(t), rad * 0.5 * Math.sin(t) - rad * 0.1]);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-r * 0.8, r * 0.6);
    ctx.lineTo(0, -r * 0.2);
    ctx.lineTo(r * 0.8, r * 0.6);
    ctx.closePath();
    ctx.fill();
  },
  series(ctx, r, color) {
    ctx.strokeStyle = color;
    ctx.lineWidth = r * 0.12;
    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      ctx.arc(0, 0, r * (0.25 + i * 0.18), 0, Math.PI * 1.4);
      ctx.stroke();
    }
  },
  return(ctx, r, color, time) {
    ctx.strokeStyle = color;
    ctx.lineWidth = r * 0.16;
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.7, time, time + Math.PI * 1.7);
    ctx.stroke();
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.28, 0, Math.PI * 2);
    ctx.fill();
  },
};

export function drawBossShape(ctx, opts) {
  const { x, y, size, color, shape, glyph, phase, time, progress } = opts;
  const r = size / 2;
  ctx.save();
  ctx.translate(x, y);

  // Telegraph: an expanding warning ring counts down to the attack.
  if (phase === 'telegraph') {
    ctx.save();
    ctx.strokeStyle = 'rgba(255,92,122,0.9)';
    ctx.lineWidth = 3;
    ctx.setLineDash([8, 8]);
    ctx.beginPath();
    ctx.arc(0, 0, r * (1.2 + progress * 0.9), 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  glow(ctx, phase === 'vulnerable' ? '#ffffff' : color, phase === 'vulnerable' ? 40 : 26);
  ctx.save();
  (BOSS_BODIES[shape] || BOSS_BODIES.orbital)(ctx, r, color, time);
  ctx.restore();
  ctx.shadowBlur = 0;

  // Armour plating when protected, exposed core when vulnerable.
  if (phase === 'vulnerable') {
    const pulse = 0.6 + Math.sin(time * 12) * 0.4;
    ctx.fillStyle = `rgba(255,255,255,${pulse})`;
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(94,230,168,0.9)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.5 + Math.sin(time * 8) * 3, 0, Math.PI * 2);
    ctx.stroke();
  } else {
    ctx.strokeStyle = 'rgba(180,200,230,0.55)';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.92, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.fillStyle = 'rgba(255,255,255,0.9)';
  ctx.font = `bold ${Math.round(r * 0.3)}px "JetBrains Mono", ui-monospace, monospace`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(glyph, 0, r * 1.28);
  ctx.restore();
  ctx.shadowBlur = 0;
}
