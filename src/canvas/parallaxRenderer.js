import { WORLD } from '../utils/constants';

/** Deterministic pseudo-random so layer shapes stay stable frame to frame. */
function rand(seed) {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

function wrapX(base, offset, span) {
  return (((base - offset) % span) + span) % span;
}

const KINDS = {
  stars(ctx, layer, li, span, offset) {
    for (let i = 0; i < layer.count; i++) {
      const x = wrapX(rand(li * 100 + i) * span, offset, span);
      const y = rand(li * 200 + i * 7) * WORLD.height;
      ctx.fillRect(x, y, layer.size, layer.size);
    }
  },

  grain(ctx, layer, li, span, offset) {
    for (let i = 0; i < layer.count; i++) {
      const x = wrapX(rand(li * 310 + i) * span, offset, span);
      const y = WORLD.height * (0.45 + rand(li * 411 + i * 3) * 0.55);
      ctx.globalAlpha = 0.5;
      ctx.fillRect(x, y, layer.size, layer.size);
      ctx.globalAlpha = 1;
    }
  },

  bubbles(ctx, layer, li, span, offset) {
    for (let i = 0; i < layer.count; i++) {
      const x = wrapX(rand(li * 120 + i) * span, offset, span);
      const drift = (offset * 0.6 + rand(li * 77 + i) * WORLD.height) % WORLD.height;
      const y = WORLD.height - drift;
      const r = layer.size * (0.5 + rand(li * 33 + i) * 0.9);
      ctx.globalAlpha = 0.55;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }
  },

  rain(ctx, layer, li, span, offset) {
    ctx.strokeStyle = layer.color;
    ctx.lineWidth = 1.4;
    ctx.globalAlpha = 0.5;
    for (let i = 0; i < layer.count; i++) {
      const x = wrapX(rand(li * 90 + i) * span, offset, span);
      const y = (rand(li * 140 + i) * WORLD.height + offset * 3) % WORLD.height;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x - layer.size * 0.25, y + layer.size);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  },

  ridge(ctx, layer, li, span, offset) {
    for (let i = 0; i < layer.count; i++) {
      const spacing = span / layer.count;
      const h = layer.size * (0.6 + rand(li * 50 + i) * 0.8);
      const x = wrapX(i * spacing, offset, span) - layer.size / 2;
      ctx.beginPath();
      ctx.moveTo(x, WORLD.height);
      ctx.lineTo(x + layer.size / 2, WORLD.height - h);
      ctx.lineTo(x + layer.size, WORLD.height);
      ctx.closePath();
      ctx.fill();
    }
  },

  hills(ctx, layer, li, span, offset) {
    for (let i = 0; i < layer.count; i++) {
      const spacing = span / layer.count;
      const h = layer.size * (0.5 + rand(li * 61 + i) * 0.7);
      const x = wrapX(i * spacing, offset, span) - layer.size / 2;
      ctx.beginPath();
      ctx.moveTo(x - layer.size * 0.2, WORLD.height);
      ctx.quadraticCurveTo(x + layer.size / 2, WORLD.height - h, x + layer.size * 1.2, WORLD.height);
      ctx.closePath();
      ctx.fill();
    }
  },

  dunes(ctx, layer, li, span, offset) {
    for (let i = 0; i < layer.count; i++) {
      const spacing = span / layer.count;
      const h = layer.size * (0.4 + rand(li * 73 + i) * 0.6);
      const x = wrapX(i * spacing, offset, span);
      ctx.beginPath();
      ctx.moveTo(x - layer.size, WORLD.height);
      ctx.bezierCurveTo(
        x - layer.size * 0.3,
        WORLD.height - h,
        x + layer.size * 0.2,
        WORLD.height - h * 0.9,
        x + layer.size,
        WORLD.height,
      );
      ctx.closePath();
      ctx.fill();
    }
  },

  waves(ctx, layer, li, span, offset) {
    const baseY = WORLD.height * (0.42 + li * 0.14);
    const amp = layer.size * 0.18;
    ctx.beginPath();
    ctx.moveTo(0, WORLD.height);
    for (let x = 0; x <= WORLD.width; x += 12) {
      const y =
        baseY +
        Math.sin((x + offset * 4) / layer.size) * amp +
        Math.sin((x + offset * 7) / (layer.size * 0.45)) * amp * 0.35;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(WORLD.width, WORLD.height);
    ctx.closePath();
    ctx.fill();
  },

  reeds(ctx, layer, li, span, offset) {
    ctx.strokeStyle = layer.color;
    ctx.lineWidth = Math.max(2, layer.size * 0.05);
    for (let i = 0; i < layer.count; i++) {
      const x = wrapX((i / layer.count) * span, offset, span);
      const h = layer.size * (0.5 + rand(li * 21 + i) * 0.8);
      const sway = Math.sin(offset * 0.05 + i) * layer.size * 0.12;
      ctx.beginPath();
      ctx.moveTo(x, WORLD.height);
      ctx.quadraticCurveTo(x + sway * 0.5, WORLD.height - h * 0.6, x + sway, WORLD.height - h);
      ctx.stroke();
    }
  },

  trees(ctx, layer, li, span, offset) {
    for (let i = 0; i < layer.count; i++) {
      const x = wrapX((i / layer.count) * span, offset, span);
      const h = layer.size * (0.6 + rand(li * 17 + i) * 0.7);
      const w = layer.size * 0.22;
      ctx.beginPath();
      ctx.moveTo(x - w, WORLD.height);
      ctx.lineTo(x, WORLD.height - h);
      ctx.lineTo(x + w, WORLD.height);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(x - w * 0.8, WORLD.height - h * 0.42);
      ctx.lineTo(x, WORLD.height - h * 1.08);
      ctx.lineTo(x + w * 0.8, WORLD.height - h * 0.42);
      ctx.closePath();
      ctx.fill();
    }
  },

  buildings(ctx, layer, li, span, offset) {
    for (let i = 0; i < layer.count; i++) {
      const spacing = span / layer.count;
      const w = spacing * (0.45 + rand(li * 41 + i) * 0.35);
      const h = layer.size * (0.45 + rand(li * 87 + i) * 0.85);
      const x = wrapX(i * spacing, offset, span);
      ctx.fillStyle = layer.color;
      ctx.fillRect(x, WORLD.height - h, w, h);
      if (layer.windows) {
        ctx.fillStyle = layer.windows;
        const cols = Math.max(1, Math.floor(w / 14));
        const rows = Math.max(1, Math.floor(h / 22));
        for (let c = 0; c < cols; c++) {
          for (let r = 0; r < rows; r++) {
            if (rand(li * 900 + i * 40 + c * 7 + r) > 0.55) continue;
            ctx.globalAlpha = 0.75;
            ctx.fillRect(x + 5 + c * 14, WORLD.height - h + 8 + r * 22, 5, 8);
            ctx.globalAlpha = 1;
          }
        }
        ctx.fillStyle = layer.color;
      }
    }
  },

  clouds(ctx, layer, li, span, offset) {
    ctx.globalAlpha = 0.45;
    for (let i = 0; i < layer.count; i++) {
      const x = wrapX(rand(li * 55 + i) * span, offset, span);
      const y = WORLD.height * (0.05 + rand(li * 66 + i) * 0.4);
      const w = layer.size * (0.6 + rand(li * 78 + i) * 0.8);
      ctx.beginPath();
      ctx.ellipse(x, y, w, w * 0.32, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(x + w * 0.4, y - w * 0.14, w * 0.5, w * 0.26, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  },
};

export function drawBackground(ctx, theme, time) {
  if (theme.sky) {
    const grad = ctx.createLinearGradient(0, 0, 0, WORLD.height);
    grad.addColorStop(0, theme.sky[0]);
    grad.addColorStop(1, theme.sky[1]);
    ctx.fillStyle = grad;
  } else {
    ctx.fillStyle = theme.background;
  }
  ctx.fillRect(0, 0, WORLD.width, WORLD.height);

  theme.layers.forEach((layer, li) => {
    ctx.fillStyle = layer.color;
    const span = WORLD.width + layer.size;
    const offset = (time * layer.speed) % span;
    (KINDS[layer.kind] || KINDS.stars)(ctx, layer, li, span, offset);
  });
}

export default drawBackground;
