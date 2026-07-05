export class AdaptiveAudio {
  constructor() {
    this.ctx = null;
    this.master = null;
    this.started = false;
    this.currentRealm = 'idle';
    this.nodes = {};
    this.lastAccent = 0;
    this.melodyTimer = null;
    this.ornamentTimer = null;
    this.scale = [0, 2, 3, 5, 7, 9, 10, 12];
    this.phraseIndex = 0;
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
    this.master.gain.value = 0.18;
    this.master.connect(this.ctx.destination);

    this.delay = this.ctx.createDelay(1.4);
    this.delay.delayTime.value = 0.42;
    this.delayGain = this.ctx.createGain();
    this.delayGain.gain.value = 0.18;
    this.delay.connect(this.delayGain);
    this.delayGain.connect(this.master);

    this.createDrone('earth', 82.41, 0.04, 'sine');
    this.createDrone('fifth', 123.47, 0.028, 'triangle');
    this.createDrone('air', 329.63, 0.012, 'sine');
    this.createWind();
    this.createPulse();
    this.started = true;
    this.resume();
    this.tickMelody();
    this.tickOrnament();
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
    filter.frequency.value = name === 'air' ? 1300 : 520;
    g.gain.value = gain;
    osc.connect(filter);
    filter.connect(g);
    g.connect(this.master);
    osc.start();
    this.nodes[name] = { osc, g, filter };
  }

  createWind() {
    const bufferSize = this.ctx.sampleRate * 2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * 0.28;
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 480;
    filter.Q.value = 0.7;
    const gain = this.ctx.createGain();
    gain.gain.value = 0.018;
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.master);
    noise.start();
    this.nodes.wind = { noise, filter, gain };
  }

  createPulse() {
    this.nodes.pulse = {};
    this.tickPulse();
  }

  tickPulse() {
    if (!this.ctx || !this.nodes.pulse) return;
    const now = this.ctx.currentTime;
    const root = this.realmRoot();
    this.playPluck(root / 2, now, 0.055, 1.8);
    if (this.currentRealm === 'foundry') this.playLowDrum(now + 0.18);
    setTimeout(() => this.tickPulse(), this.currentRealm === 'foundry' ? 920 : 1850);
  }

  tickMelody() {
    if (!this.ctx || !this.started) return;
    const now = this.ctx.currentTime;
    const root = this.realmRoot();
    const phrases = {
      idle: [0, 7, 10, 7, 5, 3, 2, 0],
      about: [0, 3, 5, 7, 10, 7, 5, 3],
      resume: [0, 5, 7, 12, 10, 7, 5, 2],
      chronicle: [0, 2, 3, 7, 5, 3, 2, -2],
      foundry: [0, 0, 5, 7, 0, -5, 0, 3],
      ai: [0, 7, 12, 14, 10, 7, 3, 2],
      healthcare: [0, 3, 7, 10, 7, 5, 3, 0],
      leadership: [0, 5, 10, 12, 10, 7, 5, 3],
      workshop: [0, 2, 5, 7, 12, 10, 7, 5]
    };
    const phrase = phrases[this.currentRealm] || phrases.idle;
    const step = phrase[this.phraseIndex % phrase.length];
    this.phraseIndex += 1;
    const freq = root * Math.pow(2, step / 12);
    this.playPluck(freq, now, 0.07, 2.7);
    if (Math.random() > 0.45) this.playFlute(freq * 2, now + 0.18, 0.035, 2.9);
    clearTimeout(this.melodyTimer);
    this.melodyTimer = setTimeout(() => this.tickMelody(), 1350 + Math.random() * 900);
  }

  tickOrnament() {
    if (!this.ctx || !this.started) return;
    const now = this.ctx.currentTime;
    const root = this.realmRoot();
    if (Math.random() > 0.35) {
      [0, 7, 12].forEach((step, i) => this.playBell(root * Math.pow(2, step / 12), now + i * 0.11, 0.025, 2.1));
    }
    clearTimeout(this.ornamentTimer);
    this.ornamentTimer = setTimeout(() => this.tickOrnament(), 4200 + Math.random() * 3400);
  }

  playPluck(freq, start, gain = 0.05, duration = 2.2) {
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, start);
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(2400, start);
    filter.frequency.exponentialRampToValueAtTime(540, start + duration);
    g.gain.setValueAtTime(0.0001, start);
    g.gain.exponentialRampToValueAtTime(gain, start + 0.028);
    g.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    osc.connect(filter);
    filter.connect(g);
    g.connect(this.master);
    g.connect(this.delay);
    osc.start(start);
    osc.stop(start + duration + 0.1);
  }

  playFlute(freq, start, gain = 0.03, duration = 2.5) {
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, start);
    filter.type = 'lowpass';
    filter.frequency.value = 1700;
    g.gain.setValueAtTime(0.0001, start);
    g.gain.linearRampToValueAtTime(gain, start + 0.18);
    g.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    osc.connect(filter);
    filter.connect(g);
    g.connect(this.master);
    g.connect(this.delay);
    osc.start(start);
    osc.stop(start + duration + 0.1);
  }

  playBell(freq, start, gain = 0.025, duration = 1.9) {
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq * 2, start);
    g.gain.setValueAtTime(0.0001, start);
    g.gain.exponentialRampToValueAtTime(gain, start + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    osc.connect(g);
    g.connect(this.master);
    g.connect(this.delay);
    osc.start(start);
    osc.stop(start + duration);
  }

  playLowDrum(start) {
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(92, start);
    osc.frequency.exponentialRampToValueAtTime(44, start + 0.34);
    g.gain.setValueAtTime(0.0001, start);
    g.gain.exponentialRampToValueAtTime(0.08, start + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, start + 0.55);
    osc.connect(g);
    g.connect(this.master);
    osc.start(start);
    osc.stop(start + 0.6);
  }

  realmRoot() {
    return {
      idle: 220,
      about: 220,
      resume: 196,
      chronicle: 246.94,
      foundry: 174.61,
      ai: 261.63,
      healthcare: 196,
      leadership: 246.94,
      workshop: 220
    }[this.currentRealm] || 220;
  }

  setRealm(realm) {
    if (!this.started || realm === this.currentRealm) return;
    this.currentRealm = realm;
    const root = this.realmRoot();
    const now = this.ctx.currentTime;
    this.nodes.earth.osc.frequency.exponentialRampToValueAtTime(root / 2.67, now + 1.6);
    this.nodes.fifth.osc.frequency.exponentialRampToValueAtTime(root / 1.78, now + 1.9);
    this.nodes.air.filter.frequency.linearRampToValueAtTime(realm === 'ai' ? 1850 : realm === 'foundry' ? 680 : 1180, now + 1.4);
    if (this.nodes.wind) this.nodes.wind.gain.gain.linearRampToValueAtTime(realm === 'leadership' ? 0.01 : 0.018, now + 1.1);
  }

  accent() {
    if (!this.started || Date.now() - this.lastAccent < 250) return;
    this.lastAccent = Date.now();
    const now = this.ctx.currentTime;
    this.playBell(523.25, now, 0.06, 1.2);
    this.playPluck(783.99, now + 0.08, 0.05, 1.4);
  }
}
