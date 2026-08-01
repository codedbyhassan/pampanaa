import { WORLD } from '../utils/constants';

/** Deterministic pseudo-random so layer shapes stay stable frame to frame. */
function rand(seed) {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

export function drawBackground(ctx, theme, time) {
  ctx.fillStyle = theme.background;
  ctx.fillRect(0, 0, WORLD.width, WORLD.height);

  theme.layers.forEach((layer, li) => {
    ctx.fillStyle = layer.color;
    const offset = (time * layer.speed) % (WORLD.width + layer.size);

    if (layer.kind === 'stars') {
      for (let i = 0; i < layer.count; i++) {
        const baseX = rand(li * 100 + i) * (WORLD.width + layer.size);
        const y = rand(li * 200 + i * 7) * WORLD.height;
        const x = ((baseX - offset) % (WORLD.width + layer.size) + WORLD.width + layer.size) %
          (WORLD.width + layer.size);
        ctx.fillRect(x, y, layer.size, layer.size);
      }
    } else {
      for (let i = 0; i < layer.count; i++) {
        const spacing = (WORLD.width + layer.size) / layer.count;
        const baseX = i * spacing;
        const h = layer.size * (0.6 + rand(li * 50 + i) * 0.8);
        const x = ((baseX - offset) % (WORLD.width + layer.size) + WORLD.width + layer.size) %
          (WORLD.width + layer.size) - layer.size / 2;
        ctx.beginPath();
        ctx.moveTo(x, WORLD.height);
        ctx.lineTo(x + layer.size / 2, WORLD.height - h);
        ctx.lineTo(x + layer.size, WORLD.height);
        ctx.closePath();
        ctx.fill();
      }
    }
  });
}

export default drawBackground;
