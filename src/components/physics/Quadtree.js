const MAX_ITEMS = 8;
const MAX_DEPTH = 5;

export class Quadtree {
  constructor(bounds, depth = 0) {
    this.bounds = bounds; // { x, y, width, height }
    this.depth = depth;
    this.items = [];
    this.nodes = null;
  }

  clear() {
    this.items.length = 0;
    this.nodes = null;
  }

  split() {
    const { x, y, width, height } = this.bounds;
    const hw = width / 2;
    const hh = height / 2;
    const d = this.depth + 1;
    this.nodes = [
      new Quadtree({ x, y, width: hw, height: hh }, d),
      new Quadtree({ x: x + hw, y, width: hw, height: hh }, d),
      new Quadtree({ x, y: y + hh, width: hw, height: hh }, d),
      new Quadtree({ x: x + hw, y: y + hh, width: hw, height: hh }, d),
    ];
  }

  fitsIn(node, e) {
    const b = node.bounds;
    return (
      e.x - e.width / 2 >= b.x &&
      e.x + e.width / 2 <= b.x + b.width &&
      e.y - e.height / 2 >= b.y &&
      e.y + e.height / 2 <= b.y + b.height
    );
  }

  insert(entity) {
    if (this.nodes) {
      for (const node of this.nodes) {
        if (this.fitsIn(node, entity)) {
          node.insert(entity);
          return;
        }
      }
    }
    this.items.push(entity);
    if (!this.nodes && this.items.length > MAX_ITEMS && this.depth < MAX_DEPTH) {
      this.split();
      const pending = this.items;
      this.items = [];
      for (const item of pending) this.insert(item);
    }
  }

  /** Collects all entities whose subtree region intersects the query rect. */
  query(rect, out = []) {
    if (!intersects(this.bounds, rect)) return out;
    for (let i = 0; i < this.items.length; i++) out.push(this.items[i]);
    if (this.nodes) for (const node of this.nodes) node.query(rect, out);
    return out;
  }
}

function intersects(b, r) {
  return !(
    r.x > b.x + b.width ||
    r.x + r.width < b.x ||
    r.y > b.y + b.height ||
    r.y + r.height < b.y
  );
}

export default Quadtree;
