import GameEngine from '../canvas/GameEngine';
import GameClock from './clock/GameClock';
import GameInput from './input/GameInput';
import CanvasGameRenderer from './rendering/CanvasGameRenderer';
import EncounterRuntime from './encounters/EncounterRuntime';
import GameEventBus from './events/GameEventBus';

export const RUNTIME_STATES = Object.freeze({
  IDLE: 'idle',
  RUNNING: 'running',
  PAUSED: 'paused',
  STOPPED: 'stopped',
});

export class GameRuntime {
  constructor({
    canvasContext,
    settings,
    progress,
    mode = 'campaign',
    startWave = 1,
    resumeSnapshot,
    getInput,
    onSync,
    onEvent,
    Engine = GameEngine,
  }) {
    this.state = RUNTIME_STATES.IDLE;
    this.clock = new GameClock();
    this.input = new GameInput();
    this.renderer = new CanvasGameRenderer(canvasContext);
    this.events = new GameEventBus();
    this.encounters = new EncounterRuntime({
      onDomainEvent: (name, payload) => this.events.emit(name, payload),
    });
    this.getInput = getInput;
    this.onSync = onSync;
    this.onEvent = onEvent;
    this.frameId = null;
    this.simulation = new Engine({
      settings,
      progress,
      mode,
      startWave,
      callbacks: {
        onSync: (patch) => this.onSync?.(patch),
        onEvent: (name, payload) => {
          this.encounters.handleSimulationEvent(name, payload);
          this.onEvent?.(name, payload);
        },
      },
    });

    this.encounters.startSession({
      profileId: progress?.profileId || progress?.id,
      campaignId: mode || 'campaign',
      missionId: `mission_${startWave}`,
    });

    if (resumeSnapshot) this.simulation.restore(resumeSnapshot);
  }

  setContext(context) {
    this.renderer.setContext(context);
  }

  setInput(input) {
    this.input.set(input);
  }

  resize() {
    this.simulation.handleResize();
  }

  start() {
    if (this.state === RUNTIME_STATES.RUNNING) return;
    this.state = RUNTIME_STATES.RUNNING;
    const now = globalThis.performance?.now?.() ?? Date.now();
    this.clock.start(now);
    this.scheduleFrame();
  }

  pause() {
    if (this.state !== RUNTIME_STATES.RUNNING) return;
    this.state = RUNTIME_STATES.PAUSED;
    this.clock.stop();
    this.cancelFrame();
  }

  resume() {
    if (this.state !== RUNTIME_STATES.PAUSED) return;
    this.state = RUNTIME_STATES.RUNNING;
    const now = globalThis.performance?.now?.() ?? Date.now();
    this.clock.start(now);
    this.scheduleFrame();
  }

  stop() {
    if (this.state === RUNTIME_STATES.STOPPED) return;
    this.state = RUNTIME_STATES.STOPPED;
    this.clock.stop();
    this.cancelFrame();
    this.input.reset();
  }

  scheduleFrame() {
    if (this.frameId !== null || this.state !== RUNTIME_STATES.RUNNING) return;
    if (typeof requestAnimationFrame !== 'function') return;
    this.frameId = requestAnimationFrame((now) => {
      this.frameId = null;
      this.frame(now);
      this.scheduleFrame();
    });
  }

  cancelFrame() {
    if (this.frameId === null || typeof cancelAnimationFrame !== 'function') return;
    cancelAnimationFrame(this.frameId);
    this.frameId = null;
  }

  frame(now) {
    if (this.state !== RUNTIME_STATES.RUNNING) return;
    const dt = this.clock.tick(now);
    const nextInput = this.getInput?.() ?? this.input.read();
    this.input.set(nextInput);
    this.simulation.setInput(this.input.read());
    this.simulation.update(dt);
    this.renderer.render(this.simulation, dt);
  }

  draw() {
    this.renderer.render(this.simulation, 0);
  }

  snapshot() {
    return this.simulation.snapshot();
  }

  get fps() {
    return this.simulation.fps;
  }

  get status() {
    return this.simulation.status;
  }

  get score() {
    return this.simulation.score;
  }

  get wave() {
    return this.simulation.wave;
  }

  get player() {
    return this.simulation.player;
  }

  get boss() {
    return this.simulation.boss;
  }

  get unlockedWeapons() {
    return this.simulation.unlockedWeapons;
  }

  get killsByType() {
    return this.simulation.killsByType;
  }

  get shotsByWeapon() {
    return this.simulation.shotsByWeapon;
  }

  get playTime() {
    return this.simulation.playTime;
  }
}

export default GameRuntime;
