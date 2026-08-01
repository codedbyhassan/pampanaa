import { WORLD } from '../utils/constants';

/**
 * Sizes the canvas backing store for devicePixelRatio so rendering stays crisp
 * on high-DPI displays. Returns a ready-to-draw 2D context.
 */
export function setupCanvas(canvas) {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.floor(WORLD.width * dpr);
  canvas.height = Math.floor(WORLD.height * dpr);
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.imageSmoothingEnabled = true;
  return ctx;
}

export default setupCanvas;
