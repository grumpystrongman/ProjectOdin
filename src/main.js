import { realms, artifacts, tablets, corvusLines, achievements, githubSeeds } from './game/content.js';
import { ArchitectsTrial, renderContactGlyphs } from './game/trial.js';
import { SaveState } from './game/state.js';
import { AdaptiveAudio } from './game/audio.js';
import { OdinScene } from './game/scene3d.js';
import { syncGithubRepositories } from './game/githubSync.js';
import { fetchBackendHealth, verifyContactToken } from './game/apiClient.js';
import { CameraDirector } from './game/cameraDirector.js';
import { assetManifest } from './game/assetManifest.js';

const canvas = document.getElementById('gameCanvas');
const titleScreen = document.getElementById('titleScreen');
const startButton = document.getElementById('startButton');
const continueButton = document.getElementById('continueButton');
const codexButton = document.getElementById('codexButton');
const hud = document.getElementById('hud');
const artifactPanel = document.getElementById('artifactPanel');
const artifactRealm = document.getElementById('artifactRealm');
const artifactTitle = document.getElementById('artifactTitle');
const artifactBody = document.getElementById('artifactBody');
const artifactMeta = document.getElementById('artifactMeta');
const objectiveTitle = document.getElementById('objectiveTitle');
const objectiveText = document.getElementById('objectiveText');
const realmTag = document.getElementById('realmTag');
const achievementCount = document.getElementById('achievementCount');
const achievementToast = document.getElementById('achievementToast');
const codexPanel = document.getElementById('codexPanel');
const codexContent = document.getElementById('codexContent');
const closeCodex = document.getElementById('closeCodex');
const trialModal = document.getElementById('trialModal');
const closeTrial = document.getElementById('closeTrial');
const trialStats = document.getElementById('trialStats');
const trialLog = document.getElementById('trialLog');
const contactCanvas = document.getElementById('contactCanvas');
const syncButton = document.getElementById('syncButton');
const backendButton = document.getElementById('backendButton');
const cameraButton = document.getElementById('cameraButton');
const resetButton = document.getElementById('resetButton');
const directorPanel = document.getElementById('directorPanel');
const directorText = document.getElementById('directorText');
const corvusPanel = document.getElementById('corvusPanel');
const corvusText = document.getElementById('corvusText');
const minimap = document.getElementById('minimap');

const save = new SaveState();
const audio = new AdaptiveAudio();
const scene = new OdinScene(canvas);
const keys = new Set();
let started = false;
let activeRealm = null;
let activeArtifact = null;
let activeTablet = null;
let vaultNear = false;
let repositoryPayload = save.data.repositoryCache || githubSeeds;
let lastSaveAt = 0;

const player = {
  x: save.data.player?.x ?? 0,
  z: save.data.player?.z ?? 890,
  vx: 0,
  vz: 0
};

const world = {
  time: 0,
  corvusText: 'Corvus waits above the gate.',
  syncStatus: save.data.repositoryCache ? 'cached' : 'seeded'
};

const director = new CameraDirector();
const trial = new ArchitectsTrial({ onUpdate: renderTrial, onReveal: handleTrialReveal });

document.addEventListener('keydown', (event) => {
  const key = event.key.toLowerCase();
  keys.add(key);
  if (key === 'e' && vaultNear) openTrial();
  if (key === 'c') openCodex();
  if (key === 'r' && trialModal.classList.contains('hidden') === false) trial.reset();
});
document.addEventListener('keyup', (event) => keys.delete(event.key.toLowerCase()));

startButton.addEventListener('click', begin);
continueButton.addEventListener('click', begin);
codexButton.addEventListener('click', openCodex);
closeCodex.addEventListener('click', () => codexPanel.classList.add('hidden'));
closeTrial.addEventListener('click', () => trialModal.classList.add('hidden'));
syncButton.addEventListener('click', hydrateRepositories);
backendButton.addEventListener('click', checkBackend);
cameraButton.addEventListener('click', () => startCameraBeat('arrival'));
resetButton.addEventListener('click', () => { save.reset(); window.location.reload(); });
document.querySelectorAll('[data-trial]').forEach((button) => button.addEventListener('click', () => trial.choose(button.dataset.trial)));

renderMinimap();
updateHud();
requestAnimationFrame(loop);

function begin() {
  started = true;
  titleScreen.classList.add('hidden');
  hud.classList.remove('hidden');
  corvusPanel.classList.remove('hidden');
  audio.start();
  startCameraBeat('arrival');
  checkBackend(false);
  unlock('firstStep');
  hydrateRepositories(false);
  updateHud();
}

async function checkBackend(showToast = true) {
  backendButton.disabled = true;
  backendButton.textContent = 'Checking...';
  const status = await fetchBackendHealth();
  save.setBackendStatus(status);
  backendButton.disabled = false;
  backendButton.textContent = status.online ? 'Backend Online' : 'Backend Offline';
  if (status.online) unlock('backendOnline');
  if (showToast) showToastMessage('Backend Status', status.online ? 'FastAPI service is online.' : 'Static mode active. Backend unavailable.');
  if (!codexPanel.classList.contains('hidden')) openCodex();
  return status;
}

async function hydrateRepositories(showToast = true) {
  syncButton.disabled = true;
  syncButton.textContent = 'Syncing...';
  const result = await syncGithubRepositories({ save });
  repositoryPayload = result.repositories;
  world.syncStatus = result.source;
  syncButton.disabled = false;
  syncButton.textContent = 'Sync Workshop';
  if (result.source === 'github') unlock('syncedWorkshop');
  if (showToast) showToastMessage('Workshop Sync', `Repository data loaded from ${result.source}.`);
  updateHud();
  if (!codexPanel.classList.contains('hidden')) openCodex();
}

function loop(ts) {
  const dt = Math.min(0.033, (ts - (loop.last || ts)) / 1000);
  loop.last = ts;
  if (started) update(dt);
  const beat = director.update(ts);
  scene.update({ player, activeRealm, discoveredArtifacts: save.data.discoveredArtifacts, repositories: repositoryPayload, cameraBeat: beat });
  renderDirector(beat);
  requestAnimationFrame(loop);
}

function update(dt) {
  world.time += dt;
  const accel = keys.has('shift') ? 1180 : 820;
  const friction = 0.82;
  if (keys.has('w') || keys.has('arrowup')) player.vz -= accel * dt;
  if (keys.has('s') || keys.has('arrowdown')) player.vz += accel * dt;
  if (keys.has('a') || keys.has('arrowleft')) player.vx -= accel * dt;
  if (keys.has('d') || keys.has('arrowright')) player.vx += accel * dt;
  player.vx *= friction;
  player.vz *= friction;
  player.x = clamp(player.x + player.vx * dt, -1220, 1220);
  player.z = clamp(player.z + player.vz * dt, -1220, 1040);

  const priorRealm = activeRealm;
  activeRealm = null;
  activeArtifact = null;
  activeTablet = null;

  let nearestRealm = null;
  let nearestRealmDistance = Infinity;
  let nearestArtifact = null;
  let nearestArtifactDistance = Infinity;
  let nearestTablet = null;
  let nearestTabletDistance = Infinity;

  for (const realm of realms) {
    const d = distanceTo(realm.x, realm.z);
    if (d < nearestRealmDistance) { nearestRealmDistance = d; nearestRealm = realm; }
    if (d < 230) {
      activeRealm = realm.id;
      save.visitRealm(realm.id);
      const lines = corvusLines[realm.id] || corvusLines.idle;
      world.corvusText = lines[Math.floor(world.time / 6) % lines.length];
      audio.setRealm(realm.stem);
    }
  }

  for (const [id, artifact] of Object.entries(artifacts)) {
    const realm = realms.find((item) => item.id === artifact.realm);
    const index = realm.artifacts.indexOf(id);
    const angle = (index / realm.artifacts.length) * Math.PI * 2 + 0.4;
    const x = realm.x + Math.cos(angle) * 128;
    const z = realm.z + Math.sin(angle) * 128;
    const d = distanceTo(x, z);
    if (d < nearestArtifactDistance) nearestArtifact = { id, artifact, realm, distance: d };
    nearestArtifactDistance = Math.min(nearestArtifactDistance, d);
  }

  const tabletRadius = 930;
  tablets.forEach((text, index) => {
    const angle = (index / tablets.length) * Math.PI * 2;
    const radius = tabletRadius + (index % 3) * 80;
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;
    const d = distanceTo(x, z);
    if (d < nearestTabletDistance) nearestTablet = { index, text, distance: d };
    nearestTabletDistance = Math.min(nearestTabletDistance, d);
  });

  if (nearestArtifact && nearestArtifact.distance < 105) {
    activeArtifact = nearestArtifact.id;
    if (save.discoverArtifact(activeArtifact)) {
      audio.accent();
      unlock('firstArtifact');
      if (nearestArtifact.realm.id === 'workshop') unlock('workshop');
    }
    showArtifact(activeArtifact);
  } else if (nearestTablet && nearestTablet.distance < 92) {
    activeTablet = nearestTablet.index;
    if (save.unlockTablet(activeTablet)) {
      audio.accent();
      if (save.data.tablets.length >= 6) unlock('tabletKeeper');
    }
    showTablet(nearestTablet.index);
  } else {
    artifactPanel.classList.add('hidden');
  }

  vaultNear = distanceTo(0, 720) < 130;
  if (vaultNear) {
    world.corvusText = corvusLines.vault[0];
    audio.setRealm('idle');
  }

  if (activeRealm !== priorRealm) {
    if (save.data.visitedRealms.length >= 3) unlock('threeRealms');
    if (save.data.visitedRealms.length >= realms.length) unlock('allRealms');
    updateHud(nearestRealm, nearestRealmDistance);
  }

  if (Date.now() - lastSaveAt > 1800) {
    save.savePlayer(player);
    lastSaveAt = Date.now();
  }
  corvusText.textContent = world.corvusText;
  renderMinimap();
}

function showArtifact(id) {
  const artifact = artifacts[id];
  const realm = realms.find((r) => r.id === artifact.realm);
  artifactPanel.classList.remove('hidden');
  artifactRealm.textContent = `${realm.name} / ${artifact.type}`;
  artifactTitle.textContent = artifact.title;
  artifactBody.textContent = artifact.body;
  artifactMeta.innerHTML = `<span>${save.data.discoveredArtifacts.length} artifacts</span><span>${save.data.visitedRealms.length} realms</span><span>${world.syncStatus} workshop</span>`;
  updateHud(realm, 0);
}

function showTablet(index) {
  artifactPanel.classList.remove('hidden');
  artifactRealm.textContent = `Architect Tablet ${index + 1}`;
  artifactTitle.textContent = 'Recovered Inscription';
  artifactBody.textContent = tablets[index];
  artifactMeta.innerHTML = `<span>${save.data.tablets.length} tablets recovered</span><span>leadership codex</span>`;
}

function openTrial() {
  trial.reset();
  contactCanvas.classList.add('hidden');
  trialModal.classList.remove('hidden');
  renderTrial(trial.snapshot());
}

function renderTrial(snapshot) {
  if (!snapshot) return;
  const moves = Object.entries(snapshot.moves).map(([id, move]) => `<button data-trial="${id}">${move.label}</button>`).join('');
  document.querySelector('.trial-actions').innerHTML = moves;
  document.querySelectorAll('[data-trial]').forEach((button) => button.addEventListener('click', () => trial.choose(button.dataset.trial)));
  trialStats.innerHTML = `
    <span><small>Turn</small><b>${snapshot.turn}</b></span>
    <span><small>Insight</small><b>${snapshot.insight}</b></span>
    <span><small>Stability</small><b>${snapshot.stability}</b></span>
    <span><small>Pressure</small><b>${snapshot.pressure}</b></span>
    <span><small>Token</small><b>${snapshot.token ? 'Issued' : 'Locked'}</b></span>`;
  trialLog.textContent = snapshot.log;
  if (snapshot.failed) {
    trialLog.innerHTML = `${snapshot.log} <button id="retryTrial">Reset Trial</button>`;
    document.getElementById('retryTrial').addEventListener('click', () => trial.reset());
  }
}

async function handleTrialReveal(snapshot) {
  save.recordTrialWin(snapshot.token);
  unlock('trialClear');
  contactCanvas.classList.remove('hidden');
  try {
    const verified = await verifyContactToken(snapshot.token);
    renderContactGlyphs(contactCanvas, snapshot.token, verified.contact);
    showToastMessage('Vault Verified', 'Server trust token accepted.');
  } catch {
    renderContactGlyphs(contactCanvas, snapshot.token);
    showToastMessage('Vault Opened', 'Static fallback contact seal rendered.');
  }
  audio.accent();
}

function openCodex() {
  save.noteCodexOpen();
  const manifestRows = assetManifest.productionNeeds.map((need) => `<li>${need}</li>`).join('');
  const backendStatus = save.data.backend?.online ? 'online' : 'offline/static';
  const repoRows = repositoryPayload.map((repo) => `<li><strong>${repo.repo}</strong> — ${repo.title}<br><span>${repo.realm} / ${repo.status} / signal ${repo.signal} / ${repo.language || 'unknown'}</span></li>`).join('');
  const realmRows = realms.map((realm) => `<article><h3>${realm.name}</h3><p>${realm.body}</p><p><strong>Artifacts:</strong> ${realm.artifacts.map((id) => save.data.discoveredArtifacts.includes(id) ? artifacts[id].title : 'Unknown relic').join(', ')}</p></article>`).join('');
  const tabletRows = tablets.map((tablet, i) => `<li>${save.data.tablets.includes(i) ? tablet : 'Unrecovered inscription'}</li>`).join('');
  codexContent.innerHTML = `
    <h3>Progress</h3>
    <p>${save.data.visitedRealms.length}/${realms.length} realms visited. ${save.data.discoveredArtifacts.length}/${Object.keys(artifacts).length} artifacts discovered. ${save.data.tablets.length}/${tablets.length} tablets recovered.</p>
    <h3>Realms</h3>${realmRows}
    <h3>Living Workshop</h3><p>Source: ${world.syncStatus}. Backend: ${backendStatus}. Press Sync Workshop to refresh repository signals.</p><ul>${repoRows}</ul>
    <h3>Production Asset Pipeline</h3><ul>${manifestRows}</ul>
    <h3>Leadership Tablets</h3><ol>${tabletRows}</ol>
    <h3>Achievements</h3><ul>${save.data.achievements.map((id) => `<li><strong>${achievements[id]?.title || id}</strong> — ${achievements[id]?.text || ''}</li>`).join('') || '<li>No achievements yet.</li>'}</ul>`;
  codexPanel.classList.remove('hidden');
}

function startCameraBeat(id) {
  // Respect player settings for cinematic camera and reduced motion. If the
  // player has disabled cinematicCamera or enabled reduceMotion, skip
  // authored camera beats entirely.
  const settings = save?.data?.settings || {};
  if (settings.reduceMotion || settings.cinematicCamera === false) return;
  const beat = director.start(id);
  if (beat) {
    directorPanel.classList.remove('hidden');
    directorText.textContent = `${beat.title}: ${beat.text}`;
  }
}

function renderDirector(beatState) {
  if (!beatState?.active) {
    if (directorPanel && !director.isPlaying) directorPanel.classList.add('hidden');
    return;
  }
  const pct = Math.round(beatState.progress * 100);
  directorPanel.classList.remove('hidden');
  directorText.textContent = `${beatState.active.title} / ${pct}% — ${beatState.active.text}`;
}

function updateHud(nearestRealm = null, distance = null) {

  achievementCount.textContent = `${save.data.achievements.length} achievements`;
  if (activeRealm) {
    const realm = realms.find((r) => r.id === activeRealm);
    objectiveTitle.textContent = realm.quest;
    objectiveText.textContent = `${realm.name}: ${realm.body}`;
    realmTag.textContent = `${realm.short} active`;
  } else if (vaultNear) {
    objectiveTitle.textContent = 'Open the Vault of Trust';
    objectiveText.textContent = 'Press E to begin The Architect\'s Trial and unlock contact access.';
    realmTag.textContent = 'Vault nearby';
  } else {
    objectiveTitle.textContent = 'Explore the Six Realms';
    objectiveText.textContent = nearestRealm ? `Nearest realm: ${nearestRealm.name}. Distance ${Math.round(distance)}.` : 'Move toward monoliths. Discover artifacts. Press C for the codex. Press E near the vault.';
    realmTag.textContent = `${world.syncStatus} workshop`;
  }
}

function renderMinimap() {
  const ctx = minimap.getContext('2d');
  const w = minimap.width;
  const h = minimap.height;
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = 'rgba(4,7,13,.68)';
  ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = 'rgba(126,231,255,.22)';
  ctx.strokeRect(1, 1, w - 2, h - 2);
  const sx = (x) => w / 2 + x / 10;
  const sz = (z) => h / 2 + z / 10;
  realms.forEach((realm) => {
    ctx.fillStyle = realm.color;
    ctx.beginPath();
    ctx.arc(sx(realm.x), sz(realm.z), activeRealm === realm.id ? 6 : 4, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.fillStyle = '#f2c76d';
  ctx.fillRect(sx(0) - 4, sz(720) - 4, 8, 8);
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(sx(player.x), sz(player.z), 4, 0, Math.PI * 2);
  ctx.fill();
}

function unlock(id) {
  if (!achievements[id]) return;
  if (save.unlockAchievement(id)) {
    showToastMessage(achievements[id].title, achievements[id].text);
  }
}

function showToastMessage(title, text) {
  achievementToast.classList.remove('hidden');
  achievementToast.innerHTML = `<strong>${title}</strong><span>${text}</span>`;
  clearTimeout(showToastMessage.timer);
  showToastMessage.timer = setTimeout(() => achievementToast.classList.add('hidden'), 4200);
}

function distanceTo(x, z) {
  return Math.hypot(x - player.x, z - player.z);
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}
