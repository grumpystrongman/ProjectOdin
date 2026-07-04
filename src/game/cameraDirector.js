
export class CameraDirector {
  constructor() {
    this.beats = [
      { id: 'arrival', title: 'Arrival at the Gate', duration: 7.5, text: 'The gate wakes before the Seeker understands why.' },
      { id: 'archiveReveal', title: 'Archive Reveal', duration: 6.0, text: 'The first realm rises as memory becomes architecture.' },
      { id: 'vaultReveal', title: 'Vault Reveal', duration: 5.5, text: 'The Vault of Trust answers balance, not urgency.' }
    ];
    this.active = null;
    this.startedAt = 0;
  }

  start(id, now = performance.now()) {
    const beat = this.beats.find((item) => item.id === id);
    if (!beat) return null;
    this.active = beat;
    this.startedAt = now;
    return beat;
  }

  update(now = performance.now()) {
    if (!this.active) return { active: null, progress: 1 };
    const progress = Math.min(1, (now - this.startedAt) / (this.active.duration * 1000));
    const active = this.active;
    if (progress >= 1) this.active = null;
    return { active, progress };
  }

  get isPlaying() { return Boolean(this.active); }
}
