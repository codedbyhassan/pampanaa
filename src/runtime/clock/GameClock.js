const MAX_DELTA_SECONDS = 0.05;

export class GameClock {
  #last = null;
  #running = false;

  start(now = performance.now()) {
    this.#last = now;
    this.#running = true;
  }

  stop() {
    this.#running = false;
    this.#last = null;
  }

  tick(now = performance.now()) {
    if (!this.#running) return 0;
    if (this.#last === null) this.#last = now;
    const delta = Math.max(0, (now - this.#last) / 1000);
    this.#last = now;
    return Math.min(delta, MAX_DELTA_SECONDS);
  }

  get running() {
    return this.#running;
  }
}

export default GameClock;
