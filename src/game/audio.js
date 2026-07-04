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
    if (this.started) {
      this.resume();
      return;
    }
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    this.ctx = new AudioContext();
    this.master = this.ctx.createGain();
    this.master.gain.value = 0.22;
    this.master.connect(this.ctx.destination);
    this.createDrone('low', 110, 0.055, 'sine');
    this.createDrone('warmth', 220, 0.036, 'triangle');
    this.createDrone('air', 440, 0.018, 'sine');
    this.createDrone('luteBed', 330, 0.012, 'triangle');
    this.createPulse();
    this.started = true;
    this.resume();
    this.tickMelody();
  }

  resume() {
    if (this.ctx?.state === 'suspended') this.ctx.resume();
  }

  createDrone(name, freq, gain, type) {
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();
    osc.type = type;
    osc.frequency.value = freq;
    filter.type = 'lowpass';
    filter.frequency.value = 880;
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
    g.gain.value = 0.012;
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
    g.linearRampToValueAtTime(0.038, now + 0.04);
    g.exponentialRampToValueAtTime(0.003, now + 0.72);
    setTimeout(() => this.tickPulse(), this.currentRealm === 'foundry' ? 900 : 1550);
  }

  tickMelody() {
    if (!this.ctx || !this.started) return;
    const base = { idle: 220, about: 220, resume: 196, chronicle: 246.94, foundry: 174.61, ai: 261.63, healthcare: 196, leadership: 246.94, workshop: 220 }[this.currentRealm] || 220;
    const phrase = [0, 4, 7, 9, 7, 4, 2, 0];
    const step = phrase[Math.floor(Math.random() * phrase.length)];
    const freq = base * Math.pow(2, step / 12);
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();
    osc.type = Math.random() > 0.5 ? 'sine' : 'triangle';
    osc.frequency.value = freq;
    filter.type = 'lowpass';
    filter.frequency.value = 2000;
    g.gain.setValueAtTime(0.0001, this.ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.06, this.ctx.currentTime + 0.05);
    g.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 2.2);
    osc.connect(filter);
    filter.connect(g);
    g.connect(this.master);
    osc.start();
    osc.stop(this.ctx.currentTime + 2.4);
    clearTimeout(this.melodyTimer);
    this.melodyTimer = setTimeout(() => this.tickMelody(), 1300 + Math.random() * 1900);
  }

  setRealm(realm) {
    if (!this.started || realm === this.currentRealm) return;
    this.currentRealm = realm;
    const freq = { idle: 110, about: 123.47, resume: 130.81, chronicle: 146.83, foundry: 98, ai: 164.81, healthcare: 116.54, leadership: 138.59, workshop: 110 }[realm] || 110;
    const now = this.ctx.currentTime;
    this.nodes.low.osc.frequency.exponentialRampToValueAtTime(freq, now + 1.4);
    this.nodes.warmth.osc.frequency.exponentialRampToValueAtTime(freq * 2.01, now + 1.7);
    this.nodes.air.filter.frequency.linearRampToValueAtTime(realm === 'ai' ? 1900 : 1060, now + 1.3);
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
    g.gain.exponentialRampToValueAtTime(0.12, this.ctx.currentTime + 0.03);
    g.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.9);
    osc.connect(g);
    g.connect(this.master);
    osc.start();
    osc.stop(this.ctx.currentTime + 1.0);
  }
}
