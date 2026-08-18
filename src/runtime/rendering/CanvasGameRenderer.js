export class CanvasGameRenderer {
  constructor(context) {
    this.context = context;
  }

  setContext(context) {
    this.context = context;
  }

  render(simulation, deltaSeconds = 0) {
    if (!this.context || !simulation) return;
    simulation.draw(this.context, deltaSeconds);
  }
}

export default CanvasGameRenderer;
