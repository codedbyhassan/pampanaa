export class GameEventBus {
  #listeners = new Map();

  on(event, listener) {
    if (typeof listener !== 'function') return () => {};
    const listeners = this.#listeners.get(event) || new Set();
    listeners.add(listener);
    this.#listeners.set(event, listeners);
    return () => this.off(event, listener);
  }

  off(event, listener) {
    const listeners = this.#listeners.get(event);
    if (!listeners) return;
    listeners.delete(listener);
    if (!listeners.size) this.#listeners.delete(event);
  }

  emit(event, payload = {}) {
    const listeners = this.#listeners.get(event);
    if (!listeners) return;
    for (const listener of [...listeners]) listener(payload);
  }

  clear() {
    this.#listeners.clear();
  }
}

export default GameEventBus;
