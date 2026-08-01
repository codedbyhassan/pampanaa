export const Vector2D = {
  add: (a, b) => ({ x: a.x + b.x, y: a.y + b.y }),
  sub: (a, b) => ({ x: a.x - b.x, y: a.y - b.y }),
  scale: (a, s) => ({ x: a.x * s, y: a.y * s }),
  length: (a) => Math.hypot(a.x, a.y),
  normalize: (a) => {
    const len = Math.hypot(a.x, a.y);
    return len === 0 ? { x: 0, y: 0 } : { x: a.x / len, y: a.y / len };
  },
  distance: (a, b) => Math.hypot(a.x - b.x, a.y - b.y),
  lerp: (a, b, t) => ({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t }),
};

export default Vector2D;
