import './styles.css';
import { realms, artifacts, tablets, corvusLines, achievements, githubSeeds } from './game/content.js';
import { ArchitectsTrial, renderContactGlyphs } from './game/trial.js';
import { SaveState } from './game/state.js';
import { AdaptiveAudio } from './game/audio.js';
import { OdinScene } from './game/scene3d.js';
import { syncGithubRepositories } from './game/githubSync.js';
import { fetchBackendHealth, verifyContactToken } from './game/apiClient.js';
import { CameraDirector } from './game/cameraDirector.js';
import { assetManifest } from './game/assetManifest.js';

const $ = (id) => document.getElementById(id);
const canvas = $('gameCanvas');
const titleScreen = $('titleScreen');
const startButton = $('startButton');
const continueButton = $('continueButton');
const codexButton = $('codexButton');
const hud = $('hud');
const artifactPanel = $('artifactPanel');
const artifactRealm = $('artifactRealm');
const artifactTitle = $('artifactTitle');
const artifactBody = $('artifactBody');
const artifactMeta = $('artifactMeta');
const objectiveTitle = $('objectiveTitle');
const objectiveText = $('objectiveText');
const realmTag = $('realmTag');
const achievementCount = $('achievementCount');
const achievementToast = $('achievementToast');
const codexPanel = $('codexPanel');
const codexContent = $('codexContent');
const closeCodex = $('closeCodex');
const trialModal = $('trialModal');
const closeTrial = $('closeTrial');
const trialStats = $('trialStats');
const trialLog = $('trialLog');
const contactCanvas = $('contactCanvas');
const syncButton = $('syncButton');
const backendButton = $('backendButton');
const cameraButton = $('cameraButton');
const resetButton = $('resetButton');
const directorPanel = $('directorPanel');
const directorText = $('directorText');
const corvusPanel = $('corvusPanel');
const corvusText = $('corvusText');
const minimap = $('minimap');
const reticle = $('reticle');
const interactionPrompt = $('interactionPrompt');
const pauseOverlay = $('pauseOverlay');
const resumeButton = $('resumeButton');

const save = new SaveState();
const audio = new AdaptiveAudio();
const scene = new OdinScene(canvas);
const director = new CameraDirector();
const trial = new ArchitectsTrial({ onUpdate: renderTrial, onReveal: handleTrialReveal });
const keys = new Set();
const movementKeys = new Set(['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'shift']);

let started = false;
let activeRealm = null;
let vaultNear = false;
let repositoryPayload = save.data.repositoryCache || githubSeeds;
let lastSaveAt = 0;
let focusedInteraction = null;
let worldClickHint = '';

const player = {
  x: save.data.player?.x ?? 0,
  z: save.data.player?.z ?? 1040,
  yaw: save.data.player?.yaw ?? 0,
  pitch: save.data.player?.pitch ?? -0.06,
  fov: save.data.player?.fov ?? 68,
  headBob: 0,
  vx: 0,
  vz: 0
};

const world = {
  time: 0,
  corvusText: 'Corvus waits above the gate.',
  syncStatus: save.data.repositoryCache ? 'cached' : 'seeded'
};

document.addEventListener('keydown', onKeyDown);
document.addEventListener('keyup', (event) => keys.delete(event.key.toLowerCase()));
document.addEventListener('mousemove', onMouseMove);
document.addEventListener('pointerlockchange', onPointerLockChange);
canvas.addEventListener('click', onWorldClick);
canvas.addEventListener('wheel', onMouseWheel, { passive: false });

startButton.addEventListener('click', begin);
continueButton.addEventListener('click', begin);
codexButton.addEventListener('click', openCodex);
closeCodex.addEventListener('click', () => { codexPanel.classList.add('hidden'); lockPointer(); });
closeTrial.addEventListener('click', () => { trialModal.classList.add('hidden'); lockPointer(); });
syncButton.addEventListener('click', hydrateRepositories);
backendButton.addEventListener('click', checkBackend);
cameraButton.addEventListener('click', () => startCameraBeat('arrival'));
resetButton.addEventListener('click', () => { save.reset(); window.location.reload(); });
resumeButton.addEventListener('click', lockPointer);
document.querySelectorAll('[data-trial]').forEach((button) => button.addEventListener('click', () => trial.choose(button.dataset.trial)));

renderMinimap();
updateHud();
requestAnimationFrame(loop);

function begin() {
  started = true;
  titleScreen.classList.add('hidden');
  hud.classList.remove('hidden');
  corvusPanel.classList.remove('hidden');
  reticle.classList.remove('hidden');
  interactionPrompt.classList.remove('hidden');
  audio.start();
  startCameraBeat('arrival');
  checkBackend(false);
  hydrateRepositories(false);
  unlock('firstStep');
  updateHud();
  setTimeout(lockPointer, 250);
}

function lockPointer() {
  if (!started || !codexPanel.classList.contains('hidden') || !trialModal.classList.contains('hidden')) return;
  canvas.requestPointerLock?.();
}

function onPointerLockChange() {
  const locked = document.pointerLockElement === canvas;
  pauseOverlay.classList.toggle('hidden', locked || !started);
  reticle.classList.toggle('paused', !locked);
}

function onMouseMove(event) {
  if (!started || document.pointerLockElement !== canvas) return;
  player.yaw -= event.movementX * 0.002;
  player.pitch -= event.movementY * 0.002;
  player.pitch = clamp(player.pitch, -1.16, 1.02);
}

function onMouseWheel(event) {
  if (!started) return;
  event.preventDefault();
  player.fov = clamp(player.fov + Math.sign(event.deltaY) * 4, 42, 84);
  worldClickHint = player.fov <= 48 ? 'Zoomed in' : player.fov >= 80 ? 'Zoomed out' : 'Mouse wheel zoom adjusted';
}

function onWorldClick() {
  if (!started) return;
  if (document.pointerLockElement !== canvas) {
    lockPointer();
    return;
  }
  interactWithFocused();
}

function onKeyDown(event) {
  const key = event.key.toLowerCase();
  if (movementKeys.has(key)) event.preventDefault();
  keys.add(key);
  if (key === 'escape') document.exitPointerLock?.();
  if (key === 'c') openCodex();
  if (key === 'e') interactWithFocused();
  if (key === 'r' && !trialModal.classList.contains('hidden')) trial.reset();
}

function loop(ts) {
  const dt = Math.min(0.033, (ts - (loop.last || ts)) / 1000);
  loop.last = ts;
  if (started) update(dt);
  const beat = director.update(ts);
  scene.update({ player, activeRealm, discoveredArtifacts: save.data.discoveredArtifacts, repositories: repositoryPayload, cameraBeat: beat });
  focusedInteraction = started ? scene.getFocusedInteraction(player, 760) : null;
  renderInteractionPrompt();
  renderDirector(beat);
  requestAnimationFrame(loop);
}

function update(dt) {
  world.time += dt;
  const accel = keys.has('shift') ? 1260 : 820;
  const friction = 0.82;
  let strafe = 0;
  let forward = 0;

  if (keys.has('w') || keys.has('arrowup')) forward += 1;
  if (keys.has('s') || keys.has('arrowdown')) forward -= 1;
  if (keys.has('d') || keys.has('arrowright')) strafe += 1;
  if (keys.has('a') || keys.has('arrowleft')) strafe -= 1;

  if (strafe || forward) {
    const len = Math.hypot(strafe, forward) || 1;
    strafe /= len;
    forward /= len;
    const sin = Math.sin(player.yaw);
    const cos = Math.cos(player.yaw);
    const forwardX = -sin;
    const forwardZ = -cos;
    const rightX = cos;
    const rightZ = -sin;
    player.vx += (rightX * strafe + forwardX * forward) * accel * dt;
    player.vz += (rightZ * strafe + forwardZ * forward) * accel * dt;
    player.headBob += dt * (keys.has('shift') ? 16 : 11);
  } else {
    player.headBob += (0 - player.headBob) * 0.08;
  }

  player.vx *= friction;
  player.vz *= friction;
  player.x = clamp(player.x + player.vx * dt, -1380, 1380);
  player.z = clamp(player.z + player.vz * dt, -1380, 1160);

  const priorRealm = activeRealm;
  activeRealm = null;
  vaultNear = false;
  let nearestRealm = null;
  let nearestRealmDistance = Infinity;

  for (const realm of realms) {
    const d = distanceTo(realm.x, realm.z);
    if (d < nearestRealmDistance) { nearestRealmDistance = d; nearestRealm = realm; }
    if (d < 260) {
      activeRealm = realm.id;
      save.visitRealm(realm.id);
      const lines = corvusLines[realm.id] || corvusLines.idle;
      world.corvusText = lines[Math.floor(world.time / 6) % lines.length];
      audio.setRealm(realm.stem);
    }
  }

  vaultNear = distanceTo(0, 720) < 180;
  if (vaultNear) {
    world.corvusText = corvusLines.vault[0];
    audio.setRealm('idle');
  }
  if (!activeRealm && !vaultNear) world.corvusText = corvusLines.idle[Math.floor(world.time / 8) % corvusLines.idle.length];

  if (activeRealm !== priorRealm) {
    if (save.data.visitedRealms.length >= 3) unlock('threeRealms');
    if (save.data.visitedRealms.length >= realms.length) unlock('allRealms');
  }

  updateHud(nearestRealm, nearestRealmDistance);
  if (Date.now() - lastSaveAt > 1500) {
    save.savePlayer({ x: player.x, z: player.z, yaw: player.yaw, pitch: player.pitch, fov: player.fov });
    lastSaveAt = Date.now();
  }
  corvusText.textContent = world.corvusText;
  renderMinimap();
}

function interactWithFocused() {
  if (!focusedInteraction) {
    if (vaultNear) openTrial();
    worldClickHint = 'Nothing selected. Center the reticle on a structure, relic, tablet, portal, river, or terrain feature.';
    showToastMessage('Exploration Mode', worldClickHint);
    return;
  }
  const { type, id, label } = focusedInteraction.userData;
  if (type === 'artifact') inspectArtifact(id);
  else if (type === 'tablet') inspectTablet(Number(id));
  else if (type === 'portal') inspectPortal(id);
  else if (type === 'vault') openTrial();
  else if (type === 'gate') showToastMessage('The Great Gate', 'This is the central threshold into Jeff Barnes’ work, projects, leadership, AI, and healthcare analytics story.');
  else if (type === 'river') showToastMessage('Glowing Data River', 'The river represents governed data moving through platforms, pipelines, decisions, and people.');
  else if (type === 'terrain') showToastMessage('Ancient Terrain', 'You are walking through the first build of Jeff’s portfolio world. Paths, districts, and imported assets come next.');
  else if (type === 'ruin') showToastMessage(label || 'Ancient Structure', 'This structure is part of the world shell. It will become a richer district element as the hub grows.');
  else showToastMessage(label || 'World Object', 'This object is part of the explorable Project ODIN world.');
}

function renderInteractionPrompt() {
  if (!started) return;
  if (!focusedInteraction) {
    interactionPrompt.textContent = vaultNear ? 'Click or press E to enter the Vault of Trust' : (worldClickHint || 'Explore with mouse-look. WASD/arrows move. Mouse wheel zooms. Center the reticle and click to interact.');
    reticle.classList.remove('locked');
    return;
  }
  const { type, id, label } = focusedInteraction.userData;
  reticle.classList.add('locked');
  if (type === 'artifact') interactionPrompt.textContent = `Click to inspect artifact: ${artifacts[id]?.title || label}`;
  else if (type === 'tablet') interactionPrompt.textContent = `Click to read tablet ${Number(id) + 1}`;
  else if (type === 'portal') interactionPrompt.textContent = `Click to study realm portal: ${realms.find((r) => r.id === id)?.name || label}`;
  else if (type === 'vault') interactionPrompt.textContent = 'Click to enter the Vault of Trust';
  else if (type === 'gate') interactionPrompt.textContent = 'Click to inspect the Great Gate';
  else if (type === 'river') interactionPrompt.textContent = 'Click to inspect the glowing data river';
  else interactionPrompt.textContent = `Click to inspect: ${label || 'world object'}`;
}

function inspectArtifact(id) {
  const artifact = artifacts[id];
  if (!artifact) return;
  if (save.discoverArtifact(id)) {
    audio.accent();
    unlock('firstArtifact');
    if (artifact.realm === 'workshop') unlock('workshop');
  }
  showArtifact(id);
}

function inspectTablet(index) {
  if (!tablets[index]) return;
  if (save.unlockTablet(index)) {
    audio.accent();
    if (save.data.tablets.length >= 6) unlock('tabletKeeper');
  }
  showTablet(index);
}

function inspectPortal(id) {
  const realm = realms.find((r) => r.id === id);
  if (!realm) return;
  save.visitRealm(id);
  activeRealm = id;
  showToastMessage(realm.name, realm.quest);
  updateHud(realm, 0);
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
  document.exitPointerLock?.();
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
  trialStats.innerHTML = `<span><small>Turn</small><b>${snapshot.turn}</b></span><span><small>Insight</small><b>${snapshot.insight}</b></span><span><small>Stability</small><b>${snapshot.stability}</b></span><span><small>Pressure</small><b>${snapshot.pressure}</b></span><span><small>Token</small><b>${snapshot.token ? 'Issued' : 'Locked'}</b></span>`;
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

function openCodex() {
  document.exitPointerLock?.();
  save.noteCodexOpen();
  const manifestRows = assetManifest.productionNeeds.map((need) => `<li>${need}</li>`).join('');
  const backendStatus = save.data.backend?.online ? 'online' : 'offline/static';
  const repoRows = repositoryPayload.map((repo) => `<li><strong>${repo.repo}</strong> — ${repo.title}<br><span>${repo.realm} / ${repo.status} / signal ${repo.signal} / ${repo.language || 'unknown'}</span></li>`).join('');
  const realmRows = realms.map((realm) => `<article><h3>${realm.name}</h3><p>${realm.body}</p><p><strong>Artifacts:</strong> ${realm.artifacts.map((id) => save.data.discoveredArtifacts.includes(id) ? artifacts[id].title : 'Unknown relic').join(', ')}</p></article>`).join('');
  const tabletRows = tablets.map((tablet, i) => `<li>${save.data.tablets.includes(i) ? tablet : 'Unrecovered inscription'}</li>`).join('');
  codexContent.innerHTML = `<h3>Progress</h3><p>${save.data.visitedRealms.length}/${realms.length} realms visited. ${save.data.discoveredArtifacts.length}/${Object.keys(artifacts).length} artifacts discovered. ${save.data.tablets.length}/${tablets.length} tablets recovered.</p><h3>Realms</h3>${realmRows}<h3>Living Workshop</h3><p>Source: ${world.syncStatus}. Backend: ${backendStatus}. Press Sync Workshop to refresh repository signals.</p><ul>${repoRows}</ul><h3>Production Asset Pipeline</h3><ul>${manifestRows}</ul><h3>Leadership Tablets</h3><ol>${tabletRows}</ol><h3>Achievements</h3><ul>${save.data.achievements.map((id) => `<li><strong>${achievements[id]?.title || id}</strong> — ${achievements[id]?.text || ''}</li>`).join('') || '<li>No achievements yet.</li>'}</ul>`;
  codexPanel.classList.remove('hidden');
}

function startCameraBeat(id) {
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
    objectiveText.textContent = `${realm.short} signal active. Look for its physical relics.`;
    realmTag.textContent = `${realm.short} active`;
  } else if (vaultNear) {
    objectiveTitle.textContent = 'Open the Vault of Trust';
    objectiveText.textContent = 'Look at the vault and click, or press E, to begin the Architect Trial.';
    realmTag.textContent = 'Vault nearby';
  } else {
    objectiveTitle.textContent = 'Explore Jeff Barnes’ Project World';
    objectiveText.textContent = nearestRealm ? `Nearest portal: ${nearestRealm.name}. Distance ${Math.round(distance)}.` : 'Mouse-look, move, zoom, and inspect the world.';
    realmTag.textContent = `${world.syncStatus} workshop`;
  }
}

function renderMinimap() {
  const ctx = minimap.getContext('2d');
  const w = minimap.width;
  const h = minimap.height;
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = 'rgba(4,7,13,.55)';
  ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = 'rgba(126,231,255,.22)';
  ctx.strokeRect(1, 1, w - 2, h - 2);
  const sx = (x) => w / 2 + x / 12;
  const sz = (z) => h / 2 + z / 12;
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
  if (save.unlockAchievement(id)) showToastMessage(achievements[id].title, achievements[id].text);
}

function showToastMessage(title, text) {
  achievementToast.classList.remove('hidden');
  achievementToast.innerHTML = `<strong>${title}</strong><span>${text}</span>`;
  clearTimeout(showToastMessage.timer);
  showToastMessage.timer = setTimeout(() => achievementToast.classList.add('hidden'), 4200);
}

function distanceTo(x, z) { return Math.hypot(x - player.x, z - player.z); }
function clamp(value, min, max) { return Math.max(min, Math.min(max, value)); }
