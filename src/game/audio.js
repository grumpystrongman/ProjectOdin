export class AdaptiveAudio {
  constructor() {
    this.ctx = null;
    this.master = null;
    this.started = false;
    this.currentRealm = 'idle';
    this.nodes = {};
    this.lastAccent = 0;
  }

  start() {
    if (this.started) return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    this.ctx = new AudioContext();
    this.master = this.ctx.createGain();
    this.master.gain.value = 0.18;
    this.master.connect(this.ctx.destination);
    this.createDrone('low', 55, 0.08, 'sine');
    this.createDrone('choir', 110, 0.035, 'triangle');
    this.createPulse();
    this.started = true;
  }

  createDrone(name, freq, gain, type) {
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();
    osc.type = type;
    osc.frequency.value = freq;
    filter.type = 'lowpass';
    filter.frequency.value = 520;
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
    osc.type = 'sawtooth';
    osc.frequency.value = 27.5;
    g.gain.value = 0.018;
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
    g.setValueAtTime(0.005, now);
    g.linearRampToValueAtTime(0.055, now + 0.03);
    g.exponentialRampToValueAtTime(0.006, now + 0.45);
    setTimeout(() => this.tickPulse(), this.currentRealm === 'forge' ? 780 : 1300);
  }

  setRealm(realm) {
    if (!this.started || realm === this.currentRealm) return;
    this.currentRealm = realm;
    const freq = {
      idle: 55,
      archive: 65.41,
      forge: 73.42,
      citadel: 82.41,
      sanctum: 98,
      observatory: 123.47,
      workshop: 87.31
    }[realm] || 55;
    const now = this.ctx.currentTime;
    this.nodes.low.osc.frequency.exponentialRampToValueAtTime(freq, now + 1.4);
    this.nodes.choir.osc.frequency.exponentialRampToValueAtTime(freq * 2.01, now + 1.7);
    this.nodes.choir.filter.frequency.linearRampToValueAtTime(realm === 'sanctum' ? 1200 : 620, now + 1.3);
  }

  accent() {
    if (!this.started || Date.now() - this.lastAccent < 250) return;
    this.lastAccent = Date.now();
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(440, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, this.ctx.currentTime + 0.18);
    g.gain.setValueAtTime(0.0001, this.ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.16, this.ctx.currentTime + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.7);
    osc.connect(g);
    g.connect(this.master);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.8);
  }
}
