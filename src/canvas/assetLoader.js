const sprites = {};

/** Inline SVG placeholder art — swapped for real files later without code changes. */
const SOURCES = {
  player: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><polygon points="60,32 8,56 20,32 8,8" fill="#ffffff"/></svg>`,
  Chaser: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><polygon points="32,4 60,56 4,56" fill="#ffffff"/></svg>`,
  Shooter: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect x="8" y="8" width="48" height="48" rx="10" fill="#ffffff"/></svg>`,
  Tank: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><polygon points="32,2 62,20 62,44 32,62 2,44 2,20" fill="#ffffff"/></svg>`,
  Swarmer: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><circle cx="32" cy="32" r="26" fill="#ffffff"/></svg>`,
  Splitter: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><polygon points="32,4 60,32 32,60 4,32" fill="#ffffff"/></svg>`,
  Boss: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><polygon points="32,2 58,16 58,48 32,62 6,48 6,16" fill="#ffffff"/><circle cx="32" cy="32" r="10" fill="#111"/></svg>`,
};

export function getSprite(name) {
  return sprites[name] || null;
}

/**
 * Preloads all sprites. Failures are swallowed so the renderer can fall back to
 * primitive shapes rather than crashing the game.
 */
export function loadAssets() {
  const entries = Object.entries(SOURCES);
  return Promise.all(
    entries.map(
      ([name, svg]) =>
        new Promise((resolve) => {
          try {
            const img = new Image();
            img.onload = () => {
              sprites[name] = img;
              resolve();
            };
            img.onerror = () => resolve();
            img.src = `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
          } catch {
            resolve();
          }
        }),
    ),
  ).then(() => sprites);
}

export default loadAssets;
