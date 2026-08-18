import { createSessionService } from '../../application/game/sessionService';
import { createMissionService } from '../../application/campaign/missionService';

const WAVE_EVENTS = new Set(['waveAdvance', 'bossDefeated', 'kill', 'gameOver']);

export class EncounterRuntime {
  constructor({ onDomainEvent, mission } = {}) {
    this.onDomainEvent = onDomainEvent;
    this.service = createSessionService({ onEvent: (name, payload) => this.emit(name, payload) });
    this.missionService = createMissionService({ onEvent: (name, payload) => this.emit(name, payload) });
    this.missionDefinition = mission;
    this.ended = false;
  }

  emit(name, payload) {
    this.onDomainEvent?.(name, payload);
  }

  startSession(input) {
    this.ended = false;
    const session = this.service.start(input);
    this.missionService.start(this.missionDefinition ?? {
      id: input?.missionId,
      chapterId: input?.chapterId,
      title: 'The First Watch',
      description: 'Hold the perimeter while Pampanaa prepares its defenses.',
      objectives: [{ id: 'hold_perimeter', title: 'Hold the perimeter', completed: false }],
    });
    return session;
  }

  startEncounter(input) {
    if (this.ended) return null;
    return this.service.startEncounter(input);
  }

  handleSimulationEvent(name, payload = {}) {
    if (this.ended || !WAVE_EVENTS.has(name)) return;

    if (name === 'waveAdvance') {
      this.complete();
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
      this.missionService.updateObjective('hold_perimeter', { completed: true });
      return;
    }

    if (name === 'kill') {
      this.emit('ENEMY_DEFEATED', payload);
      return;
    }

    if (name === 'gameOver') {
      this.fail();
      this.end('failed');
      this.emit('SESSION_FAILED', payload);
    }
  }

  complete() {
    return this.service.completeEncounter();
  }

  fail(reason = 'encounter_failed') {
    const encounter = this.service.failEncounter({ reason });
    this.missionService.fail(reason);
    return encounter;
  }

  end(outcome = 'completed') {
    if (this.ended) return this.session;
    this.ended = true;
    if (outcome === 'failed') this.missionService.fail('session_failed');
    return this.service.end(outcome);
  }

  get session() {
    return this.service.getSession();
  }

  get encounter() {
    return this.service.getEncounter();
  }

  get mission() {
    return this.missionService.getMission();
  }
}

export default EncounterRuntime;
