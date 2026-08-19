import GameEngine from '../canvas/GameEngine';
import '../canvas/gameEnginePersistence';
import GameClock from './clock/GameClock';
import GameInput from './input/GameInput';
import CanvasGameRenderer from './rendering/CanvasGameRenderer';
import EncounterRuntime from './encounters/EncounterRuntime';
import GameEventBus from './events/GameEventBus';
import { createPlayerLoadoutService } from '../application/player/playerLoadoutService';
import { createThreatService } from '../application/world/threatService';
import { createRuntimeSessionService } from '../application/runtime/sessionService';

export const RUNTIME_STATES = Object.freeze({ IDLE: 'idle', RUNNING: 'running', PAUSED: 'paused', STOPPED: 'stopped' });

export class GameRuntime {
  constructor({ canvasContext, settings, progress, mode = 'campaign', mission, startWave = 1, resumeSnapshot, getInput, onSync, onEvent, Engine = GameEngine }) {
    this.state = RUNTIME_STATES.IDLE;
    this.clock = new GameClock(); this.input = new GameInput(); this.renderer = new CanvasGameRenderer(canvasContext); this.events = new GameEventBus();
    this.playerLoadout = createPlayerLoadoutService({ initialLoadout: { activeWeaponKey: progress?.selectedWeapon || 'blaster', weaponAmps: progress?.weaponAmps }, initialBuffs: progress?.activeBuffs, onEvent: (name, payload) => this.events.emit(name, payload) });
    this.threats = createThreatService({ onEvent: (name, payload) => this.events.emit(name, payload) });
    this.sessionRuntime = createRuntimeSessionService({ onEvent: (name, payload) => this.events.emit(name, payload) });
    this.encounters = new EncounterRuntime({ mission, onDomainEvent: (name, payload) => this.events.emit(name, payload) });
    this.getInput = getInput; this.onSync = onSync; this.onEvent = onEvent; this.frameId = null;
    this.simulation = new Engine({ settings, progress, mode, startWave, callbacks: {
      onSync: (patch) => this.onSync?.(patch),
      onEvent: (name, payload) => { this.handleSimulationEvent(name, payload); this.encounters.handleSimulationEvent(name, payload); this.onEvent?.(name, payload); },
    }});
    const sessionInput = { id: `session_${Date.now()}`, profileId: progress?.profileId || progress?.id, missionId: mission?.id || `mission_${startWave}`, encounterId: `encounter_${startWave}` };
    this.sessionRuntime.start(sessionInput);
    this.encounters.startSession({ profileId: sessionInput.profileId, campaignId: mode || 'campaign', missionId: sessionInput.missionId, chapterId: mission?.chapterId });
    this.encounters.startEncounter({ id: sessionInput.encounterId, missionId: sessionInput.missionId, wave: startWave });
    if (resumeSnapshot) this.simulation.restore(resumeSnapshot);
    this.syncPresentation();
  }

  handleSimulationEvent(name, payload = {}) {
    if (name === 'weaponChanged') this.playerLoadout.equipWeapon(payload.weapon || this.simulation.currentWeaponKey);
    if (name === 'pickupCollected') { this.playerLoadout.applyPickup(payload.type, payload.weaponKey || this.simulation.currentWeaponKey); this.onEvent?.('PLAYER_PICKUP_COLLECTED', payload); }
    if (name === 'bossEntered') {
      const boss = this.threats.getBosses().find((item) => item.name === payload.name || item.id === payload.bossId);
      if (boss) { this.threats.beginBoss(boss.id); this.onEvent?.('BOSS_ENTERED', { boss, phase: payload.phase }); }
    }
    if (name === 'bossDefeated') {
      const boss = this.threats.getBosses().find((item) => item.name === payload.name || item.id === payload.bossId);
      if (boss) this.threats.defeatBoss(boss);
      this.sessionRuntime.complete({ outcome: 'boss_defeated', bossId: payload.bossId || boss?.id });
    }
    if (name === 'gameOver') this.sessionRuntime.fail('game_over');
    if (name === 'waveAdvance') this.sessionRuntime.start({ id: this.sessionRuntime.getSession()?.id, missionId: this.mission?.id, encounterId: `encounter_${payload.wave}` });
    this.syncPresentation();
  }

  syncPresentation() { this.onSync?.({ playerLoadout: this.playerLoadout.getLoadout(), playerBuffs: this.playerLoadout.getBuffs(), threatCatalog: this.threats.getThreats(), bossCatalog: this.threats.getBosses(), runtimeSession: this.sessionRuntime.getSession() }); }
  setContext(context) { this.renderer.setContext(context); }
  setInput(input) { this.input.set(input); }
  resize() { this.simulation.handleResize(); }
  start() { if (this.state === RUNTIME_STATES.RUNNING || this.state === RUNTIME_STATES.STOPPED) return; this.state = RUNTIME_STATES.RUNNING; this.clock.start(this.now()); this.scheduleFrame(); }
  pause() { if (this.state !== RUNTIME_STATES.RUNNING) return; this.state = RUNTIME_STATES.PAUSED; this.clock.stop(); this.cancelFrame(); }
  resume() { if (this.state === RUNTIME_STATES.PAUSED || this.state === RUNTIME_STATES.IDLE) this.start(); }
  stop() { if (this.state === RUNTIME_STATES.STOPPED) return; this.state = RUNTIME_STATES.STOPPED; this.clock.stop(); this.cancelFrame(); this.input.reset(); this.encounters.end(this.simulation.status === 'gameOver' ? 'failed' : 'completed'); }
  now() { return globalThis.performance?.now?.() ?? Date.now(); }
  scheduleFrame() { if (this.frameId !== null || this.state !== RUNTIME_STATES.RUNNING || typeof requestAnimationFrame !== 'function') return; this.frameId = requestAnimationFrame((now) => { this.frameId = null; this.frame(now); this.scheduleFrame(); }); }
  cancelFrame() { if (this.frameId === null || typeof cancelAnimationFrame !== 'function') return; cancelAnimationFrame(this.frameId); this.frameId = null; }
  frame(now) { if (this.state !== RUNTIME_STATES.RUNNING) return; const dt = this.clock.tick(now); this.input.set(this.getInput?.() ?? this.input.read()); this.simulation.setInput(this.input.read()); this.simulation.update(dt); this.playerLoadout.tick(dt); this.renderer.render(this.simulation, dt); }
  draw() { this.renderer.render(this.simulation, 0); }
  selectWeapon(key) { const result = this.simulation.selectWeapon(key); this.playerLoadout.equipWeapon(this.simulation.currentWeaponKey); this.syncPresentation(); return result; }
  cycleWeapon(direction) { return this.simulation.cycleWeapon(direction); }
  applyPickup(type) { return this.playerLoadout.applyPickup(type, this.simulation.currentWeaponKey); }
  snapshot() { return this.simulation.snapshot(); }
  get mission() { return this.encounters.mission; }
  get session() { return this.encounters.session; }
  get encounter() { return this.encounters.encounter; }
  get runtimeSession() { return this.sessionRuntime.getSession(); }
  get playerLoadoutState() { return this.playerLoadout.getLoadout(); }
  get playerBuffState() { return this.playerLoadout.getBuffs(); }
  get threatCatalog() { return this.threats.getThreats(); }
  get bossCatalog() { return this.threats.getBosses(); }
  get fps() { return this.simulation.fps; }
  get status() { return this.simulation.status; }
  get score() { return this.simulation.score; }
  get wave() { return this.simulation.wave; }
  get player() { return this.simulation.player; }
  get boss() { return this.simulation.boss; }
  get currentWeaponKey() { return this.simulation.currentWeaponKey; }
  get unlockedWeapons() { return this.simulation.unlockedWeapons; }
  get killsByType() { return this.simulation.killsByType; }
  get shotsByWeapon() { return this.simulation.shotsByWeapon; }
  get playTime() { return this.simulation.playTime; }
}

export default GameRuntime;
