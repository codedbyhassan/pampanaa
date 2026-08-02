/**
 * Web Audio engine — every sound (and the music bed) is synthesized, so there
 * are no asset files to load. SFX and music have independent enable flags and
 * volumes so Settings can toggle them separately.
 */
const SCALES = {
  space: [0, 3, 5, 7, 10],
  ocean: [0, 2, 4, 7, 9],
  land: [0, 2, 3, 7, 8],
  fire: [0, 1, 5, 6, 10],
};

export class SoundManager {
  constructor() {
    this.ctx = null;
    this.sfxVolume = 0.6;
    this.musicVolume = 0.35;
    this.sfxEnabled = true;
    this.musicEnabled = true;
    this.lastPlay = {};
    this.musicTimer = null;
    this.musicStep = 0;
    this.musicScale = SCALES.space;
    this.musicRoot = 110;
    this.musicIntensity = 0;
  }

  init() {
    if (typeof window === 'undefined') return;
    const Ctor = window.AudioContext || window.webkitAudioContext;
    if (!Ctor) return;
    if (!this.ctx) this.ctx = new Ctor();
    if (this.ctx.state === 'suspended') this.ctx.resume();
  }

  /** Legacy single-volume entry point kept for older callers. */
  setVolume(v) {
    this.setSfxVolume(v);
  }

  setSfxVolume(v) {
    this.sfxVolume = Math.max(0, Math.min(1, v));
  }

  setMusicVolume(v) {
    this.musicVolume = Math.max(0, Math.min(1, v));
  }

  setSfxEnabled(on) {
    this.sfxEnabled = !!on;
  }

  setMusicEnabled(on) {
    this.musicEnabled = !!on;
    if (!on) this.stopMusic();
  }

  tone({ freq, endFreq, duration, type = 'square', gain = 0.2, delay = 0, channel = 'sfx' }) {
    if (!this.ctx) return;
    const vol = channel === 'music' ? this.musicVolume : this.sfxVolume;
    if (vol <= 0) return;
    const now = this.ctx.currentTime + delay;
    const osc = this.ctx.createOscillator();
    const amp = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    if (endFreq) osc.frequency.exponentialRampToValueAtTime(Math.max(20, endFreq), now + duration);
    amp.gain.setValueAtTime(0.0001, now);
    amp.gain.exponentialRampToValueAtTime(Math.max(0.0002, gain * vol), now + 0.012);
    amp.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    osc.connect(amp).connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + duration + 0.03);
  }

  noise({ duration = 0.3, gain = 0.2, filterFrom = 1800, filterTo = 120 }) {
    if (!this.ctx || this.sfxVolume <= 0) return;
    const now = this.ctx.currentTime;
    const frames = Math.floor(this.ctx.sampleRate * duration);
    const buffer = this.ctx.createBuffer(1, frames, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < frames; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / frames);
    const src = this.ctx.createBufferSource();
    src.buffer = buffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(filterFrom, now);
    filter.frequency.exponentialRampToValueAtTime(Math.max(40, filterTo), now + duration);
    const amp = this.ctx.createGain();
    amp.gain.setValueAtTime(gain * this.sfxVolume, now);
    amp.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    src.connect(filter).connect(amp).connect(this.ctx.destination);
    src.start(now);
  }

  play(name) {
    if (!this.ctx || !this.sfxEnabled) return;
    const now = this.ctx.currentTime;
    const throttled = { shoot: 0.045, hit: 0.03, flame: 0.06 };
    if (throttled[name] && now - (this.lastPlay[name] || 0) < throttled[name]) return;
    this.lastPlay[name] = now;

    switch (name) {
      case 'shoot':
        return this.tone({ freq: 880, endFreq: 420, duration: 0.07, type: 'square', gain: 0.1 });
      case 'laserShoot':
        return this.tone({ freq: 1400, endFreq: 700, duration: 0.12, type: 'sawtooth', gain: 0.08 });
      case 'missile':
        return this.tone({ freq: 300, endFreq: 900, duration: 0.18, type: 'triangle', gain: 0.1 });
      case 'flame':
        return this.noise({ duration: 0.14, gain: 0.08, filterFrom: 900, filterTo: 300 });
      case 'hit':
        return this.tone({ freq: 420, endFreq: 260, duration: 0.06, type: 'triangle', gain: 0.12 });
      case 'explosion':
        this.noise({ duration: 0.32, gain: 0.22 });
        return this.tone({ freq: 180, endFreq: 40, duration: 0.26, type: 'sawtooth', gain: 0.12 });
      case 'bossExplosion':
        this.noise({ duration: 0.9, gain: 0.3, filterFrom: 2400, filterTo: 60 });
        this.tone({ freq: 120, endFreq: 30, duration: 0.8, type: 'sawtooth', gain: 0.2 });
        return this.tone({ freq: 300, endFreq: 60, duration: 0.6, type: 'square', gain: 0.12, delay: 0.1 });
      case 'playerHit':
        return this.tone({ freq: 240, endFreq: 90, duration: 0.2, type: 'sawtooth', gain: 0.2 });
      case 'playerDeath':
        this.tone({ freq: 400, endFreq: 40, duration: 1.1, type: 'sawtooth', gain: 0.2 });
        return this.noise({ duration: 1.0, gain: 0.2 });
      case 'pickup':
        return this.tone({ freq: 620, endFreq: 1200, duration: 0.16, type: 'sine', gain: 0.16 });
      case 'amplify':
        this.tone({ freq: 500, duration: 0.1, type: 'square', gain: 0.12 });
        this.tone({ freq: 760, duration: 0.1, type: 'square', gain: 0.12, delay: 0.08 });
        return this.tone({ freq: 1120, duration: 0.2, type: 'square', gain: 0.12, delay: 0.16 });
      case 'autolock':
        this.tone({ freq: 1300, duration: 0.06, type: 'sine', gain: 0.12 });
        return this.tone({ freq: 1750, duration: 0.12, type: 'sine', gain: 0.1, delay: 0.07 });
      case 'shieldUp':
        return this.tone({ freq: 300, endFreq: 900, duration: 0.3, type: 'sine', gain: 0.14 });
      case 'waveComplete':
        this.tone({ freq: 520, duration: 0.14, type: 'sine', gain: 0.14 });
        this.tone({ freq: 780, duration: 0.2, type: 'sine', gain: 0.14, delay: 0.13 });
        return this.tone({ freq: 1040, duration: 0.26, type: 'sine', gain: 0.12, delay: 0.28 });
      case 'waveStart':
        return this.tone({ freq: 200, endFreq: 520, duration: 0.4, type: 'triangle', gain: 0.12 });
      case 'bossTelegraph':
        this.tone({ freq: 160, duration: 0.22, type: 'square', gain: 0.16 });
        return this.tone({ freq: 160, duration: 0.22, type: 'square', gain: 0.16, delay: 0.26 });
      case 'bossVulnerable':
        return this.tone({ freq: 900, endFreq: 1600, duration: 0.4, type: 'triangle', gain: 0.14 });
      case 'unlock':
        this.tone({ freq: 660, duration: 0.12, type: 'triangle', gain: 0.16 });
        return this.tone({ freq: 990, duration: 0.26, type: 'triangle', gain: 0.16, delay: 0.11 });
      case 'ui':
        return this.tone({ freq: 520, duration: 0.05, type: 'sine', gain: 0.07 });
      case 'error':
        return this.tone({ freq: 200, endFreq: 120, duration: 0.18, type: 'square', gain: 0.12 });
      default:
        return undefined;
    }
  }

  /** Simple generative bed: a bass pulse plus a wandering pentatonic arp. */
  startMusic(mood = 'space') {
    this.init();
    if (!this.ctx || !this.musicEnabled) return;
    this.musicScale = SCALES[mood] || SCALES.space;
    this.musicRoot = mood === 'fire' ? 98 : mood === 'ocean' ? 116 : 110;
    if (this.musicTimer) return;
    this.musicStep = 0;
    const stepMs = 260;
    this.musicTimer = setInterval(() => this.musicTick(), stepMs);
  }

  setIntensity(v) {
    this.musicIntensity = Math.max(0, Math.min(1, v));
  }

  musicTick() {
    if (!this.ctx || !this.musicEnabled || this.musicVolume <= 0) return;
    const step = this.musicStep++;
    const scale = this.musicScale;
    const bar = Math.floor(step / 8) % 4;
    const rootSemis = [0, -2, 3, -5][bar];
    const root = this.musicRoot * Math.pow(2, rootSemis / 12);

    if (step % 4 === 0) {
      this.tone({ freq: root / 2, duration: 0.5, type: 'sine', gain: 0.5, channel: 'music' });
    }
    const semi = scale[(step * 3) % scale.length] + (step % 8 < 4 ? 12 : 24);
    this.tone({
      freq: root * Math.pow(2, semi / 12),
      duration: 0.3,
      type: 'triangle',
      gain: 0.16 + this.musicIntensity * 0.12,
      channel: 'music',
    });
    if (step % 8 === 6) {
      this.tone({
        freq: root * Math.pow(2, (scale[1] + 19) / 12),
        duration: 0.55,
        type: 'sine',
        gain: 0.12,
        channel: 'music',
      });
    }
  }

  stopMusic() {
    if (this.musicTimer) clearInterval(this.musicTimer);
    this.musicTimer = null;
  }
}

export const soundManager = new SoundManager();
export default soundManager;
