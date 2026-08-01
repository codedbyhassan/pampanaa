import { WORLD, setWorldSize } from '../utils/constants';

/**
 * Fits the canvas to its container (the full viewport) and updates the shared
 * WORLD dimensions so gameplay uses CSS pixels 1:1 — no letterboxing, no
 * scaling artefacts, and never larger than the viewport itself.
 */
export function setupCanvas(canvas) {
  const rect = canvas.getBoundingClientRect();
  const width = rect.width || canvas.clientWidth || 960;
  const height = rect.height || canvas.clientHeight || 600;
  setWorldSize(width, height);

  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.floor(WORLD.width * dpr);
  canvas.height = Math.floor(WORLD.height * dpr);
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.imageSmoothingEnabled = true;
  return ctx;
}

export default setupCanvas;
