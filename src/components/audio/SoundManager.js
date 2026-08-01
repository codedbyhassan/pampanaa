/**
 * Web Audio tone generator — no asset files, all sounds are synthesized.
 */
export class SoundManager {
  constructor() {
    this.ctx = null;
    this.volume = 0.5;
    this.lastPlay = {};
  }

  init() {
    if (typeof window === 'undefined') return;
    const Ctor = window.AudioContext || window.webkitAudioContext;
    if (!Ctor) return;
    if (!this.ctx) this.ctx = new Ctor();
    if (this.ctx.state === 'suspended') this.ctx.resume();
  }

  setVolume(v) {
    this.volume = v;
  }

  tone({ freq, endFreq, duration, type = 'square', gain = 0.2 }) {
    if (!this.ctx || this.volume <= 0) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const amp = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    if (endFreq) osc.frequency.exponentialRampToValueAtTime(Math.max(20, endFreq), now + duration);
    amp.gain.setValueAtTime(gain * this.volume, now);
    amp.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    osc.connect(amp).connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + duration + 0.02);
  }

  play(name) {
    if (!this.ctx) return;
    // Throttle rapid-fire sounds so high fire-rate weapons don't clip.
    const now = this.ctx.currentTime;
    if (name === 'shoot' && now - (this.lastPlay.shoot || 0) < 0.05) return;
    this.lastPlay[name] = now;

    switch (name) {
      case 'shoot':
        return this.tone({ freq: 880, endFreq: 420, duration: 0.07, type: 'square', gain: 0.12 });
      case 'hit':
        return this.tone({ freq: 420, endFreq: 260, duration: 0.07, type: 'triangle', gain: 0.14 });
      case 'explosion':
        return this.tone({ freq: 180, endFreq: 40, duration: 0.28, type: 'sawtooth', gain: 0.2 });
      case 'playerHit':
        return this.tone({ freq: 240, endFreq: 90, duration: 0.2, type: 'sawtooth', gain: 0.22 });
      case 'pickup':
        return this.tone({ freq: 620, endFreq: 1200, duration: 0.16, type: 'sine', gain: 0.18 });
      case 'waveComplete':
        this.tone({ freq: 520, duration: 0.14, type: 'sine', gain: 0.16 });
        setTimeout(() => this.tone({ freq: 780, duration: 0.2, type: 'sine', gain: 0.16 }), 130);
        return;
      case 'unlock':
        this.tone({ freq: 660, duration: 0.12, type: 'triangle', gain: 0.18 });
        setTimeout(() => this.tone({ freq: 990, duration: 0.26, type: 'triangle', gain: 0.18 }), 110);
        return;
      default:
        return undefined;
    }
  }
}

export const soundManager = new SoundManager();
export default soundManager;
