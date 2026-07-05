const MUSIC_TRACKS = [
  {
    id: 'local-village-loop',
    title: 'Jeff Barnes Commons Village Loop',
    artist: 'Local licensed file',
    license: 'place royalty-free / CC0 / CC-BY cleared MP3 here',
    url: '/assets/audio/fable-village-loop.mp3',
    local: true
  },
  {
    id: 'river-flute',
    title: 'River Flute',
    artist: 'Kevin MacLeod',
    license: 'Creative Commons Attribution 4.0',
    url: 'https://incompetech.com/music/royalty-free/mp3-royaltyfree/River%20Flute.mp3',
    attribution: 'River Flute by Kevin MacLeod (incompetech.com), licensed under Creative Commons: By Attribution 4.0.'
  },
  {
    id: 'magic-scout-calm',
    title: 'Magic Scout - A Calm Experience',
    artist: 'Kevin MacLeod',
    license: 'Creative Commons Attribution 4.0',
    url: 'https://incompetech.com/music/royalty-free/mp3-royaltyfree/Magic%20Scout%20-%20A%20Calm%20Experience.mp3',
    attribution: 'Magic Scout - A Calm Experience by Kevin MacLeod (incompetech.com), licensed under Creative Commons: By Attribution 4.0.'
  }
];

export class AdaptiveAudio {
  constructor() {
    this.started = false;
    this.currentRealm = 'idle';
    this.trackIndex = 0;
    this.track = MUSIC_TRACKS[0];
    this.audio = null;
    this.masterVolume = 0.42;
    this.lastAccent = 0;
    this.status = 'idle';
  }

  start() {
    if (this.started) {
      this.resume();
      return;
    }
    this.started = true;
    this.status = 'starting';
    this.loadTrack(0);
  }

  loadTrack(index) {
    this.trackIndex = index;
    this.track = MUSIC_TRACKS[index];
    if (!this.track) {
      this.status = 'unavailable';
      return;
    }

    if (this.audio) {
      this.audio.pause();
      this.audio.src = '';
      this.audio.load?.();
    }

    const audio = new Audio(this.track.url);
    audio.loop = true;
    audio.preload = 'auto';
    audio.crossOrigin = 'anonymous';
    audio.volume = this.track.local ? this.masterVolume : 0.34;
    audio.addEventListener('error', () => this.tryNextTrack());
    audio.addEventListener('canplay', () => { this.status = 'ready'; });
    this.audio = audio;
    this.resume();
  }

  tryNextTrack() {
    if (this.trackIndex < MUSIC_TRACKS.length - 1) {
      this.loadTrack(this.trackIndex + 1);
      return;
    }
    this.status = 'unavailable';
  }

  resume() {
    if (!this.audio) return;
    const playAttempt = this.audio.play();
    if (playAttempt?.catch) {
      playAttempt.catch(() => {
        this.status = 'blocked';
      });
    }
  }

  setRealm(realm) {
    this.currentRealm = realm || 'idle';
    if (!this.audio) return;
    const target = realm === 'foundry' ? 0.38 : realm === 'leadership' ? 0.28 : 0.34;
    this.fadeVolume(target, 850);
  }

  fadeVolume(target, ms = 650) {
    if (!this.audio) return;
    const start = this.audio.volume;
    const startTime = performance.now();
    const step = (now) => {
      const t = Math.min(1, (now - startTime) / ms);
      this.audio.volume = start + (target - start) * t;
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  accent() {
    this.lastAccent = Date.now();
  }

  getCredit() {
    return this.track?.attribution || `${this.track?.title || 'Music'} / ${this.track?.license || 'licensed track'}`;
  }
}
