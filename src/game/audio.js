export class AdaptiveAudio {
  constructor() {
    this.ctx = null;
    this.master = null;
    this.started = false;
    this.currentRealm = 'idle';
    this.nodes = {};
    this.lastAccent = 0;
    this.melodyTimer = null;
    this.scale = [0, 2, 4, 7, 9, 12, 14, 16];
  }

  start() {
    if (this.started) return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    this.ctx = new AudioContext();
    this.master = this.ctx.createGain();
    this.master.gain.value = 0.16;
    this.master.connect(this.ctx.destination);
    this.createDrone('low', 110, 0.045, 'sine');
    this.createDrone('warmth', 220, 0.028, 'triangle');
    this.createDrone('air', 440, 0.012, 'sine');
    this.createPulse();
    this.started = true;
    this.tickMelody();
  }

  createDrone(name, freq, gain, type) {
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();
    osc.type = type;
    osc.frequency.value = freq;
    filter.type = 'lowpass';
    filter.frequency.value = 760;
    g.gain.value = gain;
    osc.connect(filter);
    filter.connect(g);
    g.connect(this.master);
    osc.start();
    this.nodes[name] = { osc, g, filter };
  }

  createPulse() {
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.value = 55;
    g.gain.value = 0.01;
    osc.connect(g);
    g.connect(this.master);
    osc.start();
    this.nodes.pulse = { osc, g };
    this.tickPulse();
  }

  tickPulse() {
    if (!this.ctx || !this.nodes.pulse) return;
    const now = this.ctx.currentTime;
    const g = this.nodes.pulse.g.gain;
    g.cancelScheduledValues(now);
    g.setValueAtTime(0.002, now);
    g.linearRampToValueAtTime(0.032, now + 0.04);
    g.exponentialRampToValueAtTime(0.003, now + 0.7);
    setTimeout(() => this.tickPulse(), this.currentRealm === 'foundry' ? 960 : 1700);
  }

  tickMelody() {
    if (!this.ctx || !this.started) return;
    const base = {
      idle: 220,
      archive: 196,
      forge: 174.61,
      foundry: 174.61,
      citadel: 246.94,
      sanctum: 261.63,
      observatory: 293.66,
      workshop: 220
    }[this.currentRealm] || 220;
    const step = this.scale[Math.floor(Math.random() * this.scale.length)];
    const freq = base * Math.pow(2, step / 12);
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();
    osc.type = 'sine';
    osc.frequency.value = freq;
    filter.type = 'lowpass';
    filter.frequency.value = 1800;
    g.gain.setValueAtTime(0.0001, this.ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.035, this.ctx.currentTime + 0.06);
    g.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 1.8);
    osc.connect(filter);
    filter.connect(g);
    g.connect(this.master);
    osc.start();
    osc.stop(this.ctx.currentTime + 2.0);
    clearTimeout(this.melodyTimer);
    this.melodyTimer = setTimeout(() => this.tickMelody(), 1900 + Math.random() * 2200);
  }

  setRealm(realm) {
    if (!this.started || realm === this.currentRealm) return;
    this.currentRealm = realm;
    const freq = {
      idle: 110,
      about: 123.47,
      resume: 130.81,
      chronicle: 146.83,
      archive: 146.83,
      forge: 98,
      foundry: 98,
      ai: 164.81,
      sanctum: 164.81,
      healthcare: 116.54,
      leadership: 138.59,
      citadel: 138.59,
      workshop: 110
    }[realm] || 110;
    const now = this.ctx.currentTime;
    this.nodes.low.osc.frequency.exponentialRampToValueAtTime(freq, now + 1.4);
    this.nodes.warmth.osc.frequency.exponentialRampToValueAtTime(freq * 2.01, now + 1.7);
    this.nodes.air.filter.frequency.linearRampToValueAtTime(realm === 'ai' ? 1700 : 960, now + 1.3);
  }

  accent() {
    if (!this.started || Date.now() - this.lastAccent < 250) return;
    this.lastAccent = Date.now();
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(523.25, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(783.99, this.ctx.currentTime + 0.22);
    g.gain.setValueAtTime(0.0001, this.ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.11, this.ctx.currentTime + 0.03);
    g.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.9);
    osc.connect(g);
    g.connect(this.master);
    osc.start();
    osc.stop(this.ctx.currentTime + 1.0);
  }
}
