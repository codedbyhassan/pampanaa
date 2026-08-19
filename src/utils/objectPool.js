export class ObjectPool {
  constructor(factory, size, maxSize = Infinity) {
    this.items = [];
    this.factory = factory;
    this.cursor = 0;
    this.maxSize = Number.isFinite(maxSize) ? Math.max(size, maxSize) : Infinity;
    for (let i = 0; i < size; i += 1) this.items.push(factory());
  }

  /** Returns an inactive item using a rotating cursor instead of repeatedly scanning from index 0. */
  acquire() {
    const length = this.items.length;
    for (let offset = 0; offset < length; offset += 1) {
      const index = (this.cursor + offset) % length;
      const item = this.items[index];
      if (!item.active) {
        this.cursor = (index + 1) % length;
        return item;
      }
    }

    if (this.items.length >= this.maxSize) return null;
    const item = this.factory();
    this.items.push(item);
    this.cursor = this.items.length - 1;
    return item;
  }

  forEachActive(fn) {
    for (let i = 0; i < this.items.length; i += 1) {
      if (this.items[i].active) fn(this.items[i]);
    }
  }

  countActive() {
    let n = 0;
    for (let i = 0; i < this.items.length; i += 1) if (this.items[i].active) n += 1;
    return n;
  }

  releaseAll() {
    for (let i = 0; i < this.items.length; i += 1) this.items[i].active = false;
    this.cursor = 0;
  }
}
