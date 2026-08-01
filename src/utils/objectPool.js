export class ObjectPool {
  constructor(factory, size) {
    this.items = [];
    for (let i = 0; i < size; i++) this.items.push(factory());
    this.factory = factory;
  }

  /** Returns an inactive item (or grows the pool if fully saturated). */
  acquire() {
    for (let i = 0; i < this.items.length; i++) {
      if (!this.items[i].active) return this.items[i];
    }
    const item = this.factory();
    this.items.push(item);
    return item;
  }

  forEachActive(fn) {
    for (let i = 0; i < this.items.length; i++) {
      if (this.items[i].active) fn(this.items[i]);
    }
  }

  countActive() {
    let n = 0;
    for (let i = 0; i < this.items.length; i++) if (this.items[i].active) n++;
    return n;
  }

  releaseAll() {
    for (let i = 0; i < this.items.length; i++) this.items[i].active = false;
  }
}
