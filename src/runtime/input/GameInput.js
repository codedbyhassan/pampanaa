const EMPTY_INPUT = Object.freeze({ x: 0, y: 0, firing: false, aim: null });

export class GameInput {
  #state = { ...EMPTY_INPUT };

  set(input = {}) {
    this.#state = {
      x: Number.isFinite(input.x) ? input.x : 0,
      y: Number.isFinite(input.y) ? input.y : 0,
      firing: Boolean(input.firing),
      aim: input.aim && Number.isFinite(input.aim.x) && Number.isFinite(input.aim.y)
        ? { x: input.aim.x, y: input.aim.y }
        : null,
    };
  }

  read() {
    return {
      ...this.#state,
      aim: this.#state.aim ? { ...this.#state.aim } : null,
    };
  }

  reset() {
    this.#state = { ...EMPTY_INPUT };
  }
}

export default GameInput;
