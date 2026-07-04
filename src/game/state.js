export class SaveState {
  constructor(storageKey = 'project-odin-save-v4') {
    this.storageKey = storageKey;
    this.data = this.load();
  }

  defaults() {
    return {
      version: 4,
      visitedRealms: [],
      discoveredArtifacts: [],
      achievements: [],
      tablets: [],
      trialWins: 0,
      trustTokens: [],
      lastRealm: null,
      codexOpenCount: 0,
      repositoryCache: null,
      repositoryCacheAt: null,
      player: { x: 0, z: 890 },
      settings: { reduceMotion: false, audio: true, quality: 'high', cinematicCamera: true },
      backend: { online: false, lastHealthCheck: null }
    };
  }

  load() {
    try {
      const raw = localStorage.getItem(this.storageKey);
      if (!raw) return this.defaults();
      return { ...this.defaults(), ...JSON.parse(raw) };
    } catch {
      return this.defaults();
    }
  }

  persist() {
    localStorage.setItem(this.storageKey, JSON.stringify(this.data));
  }

  visitRealm(id) {
    this.data.lastRealm = id;
    if (!this.data.visitedRealms.includes(id)) {
      this.data.visitedRealms.push(id);
      this.persist();
      return true;
    }
    this.persist();
    return false;
  }

  discoverArtifact(id) {
    if (!this.data.discoveredArtifacts.includes(id)) {
      this.data.discoveredArtifacts.push(id);
      this.persist();
      return true;
    }
    return false;
  }

  unlockTablet(index) {
    if (!this.data.tablets.includes(index)) {
      this.data.tablets.push(index);
      this.persist();
      return true;
    }
    return false;
  }

  unlockAchievement(id) {
    if (!this.data.achievements.includes(id)) {
      this.data.achievements.push(id);
      this.persist();
      return true;
    }
    return false;
  }

  recordTrialWin(token) {
    this.data.trialWins += 1;
    if (token && !this.data.trustTokens.includes(token)) this.data.trustTokens.push(token);
    this.persist();
  }

  saveRepositories(payload) {
    this.data.repositoryCache = payload;
    this.data.repositoryCacheAt = new Date().toISOString();
    this.persist();
  }

  savePlayer(player) {
    this.data.player = { x: Math.round(player.x), z: Math.round(player.z) };
    this.persist();
  }

  noteCodexOpen() {
    this.data.codexOpenCount += 1;
    this.persist();
  }


  setBackendStatus(status) {
    this.data.backend = { online: Boolean(status?.online), lastHealthCheck: new Date().toISOString(), detail: status?.data || status?.error || null };
    this.persist();
  }

  updateSetting(key, value) {
    this.data.settings = { ...this.data.settings, [key]: value };
    this.persist();
  }

  reset() {
    this.data = this.defaults();
    this.persist();
  }
}
