import { createSessionService } from '../../application/game/sessionService';

const WAVE_EVENTS = new Set(['waveAdvance', 'bossDefeated', 'kill', 'gameOver']);

export class EncounterRuntime {
  constructor({ onDomainEvent } = {}) {
    this.onDomainEvent = onDomainEvent;
    this.service = createSessionService({ onEvent: (name, payload) => this.emit(name, payload) });
  }

  emit(name, payload) {
    this.onDomainEvent?.(name, payload);
  }

  startSession(input) {
    return this.service.start(input);
  }

  startEncounter(input) {
    return this.service.startEncounter(input);
  }

  handleSimulationEvent(name, payload = {}) {
    if (!WAVE_EVENTS.has(name)) return;

    if (name === 'waveAdvance') {
      this.emit('WAVE_COMPLETED', payload);
      this.startEncounter({
        id: `encounter_${payload.wave}`,
        missionId: this.service.getSession()?.missionId,
        wave: payload.wave,
      });
      return;
    }

    if (name === 'bossDefeated') {
      this.emit('BOSS_DEFEATED', payload);
      return;
    }

    if (name === 'kill') {
      this.emit('ENEMY_DEFEATED', payload);
      return;
    }

    if (name === 'gameOver') {
      this.service.end('failed');
      this.emit('SESSION_FAILED', payload);
    }
  }

  complete() {
    return this.service.completeEncounter();
  }

  fail() {
    return this.service.failEncounter();
  }

  end(outcome = 'completed') {
    return this.service.end(outcome);
  }

  get session() {
    return this.service.getSession();
  }

  get encounter() {
    return this.service.getEncounter();
  }
}

export default EncounterRuntime;
