import './styles.css';
import { realms, artifacts, tablets, corvusLines, achievements, githubSeeds, socialProfile, linkedinGallery } from './game/content.js';
import { resumeData } from './game/resumeData.js';
import { fantasyArt } from './game/fantasyArt.js';
import { jeffProfileImage } from './game/profileImage.js';
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
const aboutButton = $('aboutButton');
const resumeButton = $('resumeButton');
const profilePortrait = $('profilePortrait');
const hud = $('hud');
const artifactPanel = $('artifactPanel');
const detailPanel = $('detailPanel');
const closeDetail = $('closeDetail');
const detailKicker = $('detailKicker');
const detailTitle = $('detailTitle');
const detailContent = $('detailContent');
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
const resumePauseButton = $('resumeButton');

if (profilePortrait) profilePortrait.src = jeffProfileImage;

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
let galleryPayload = linkedinGallery;
let lastSaveAt = 0;
let focusedInteraction = null;
let worldClickHint = '';

const player = {
  x: save.data.player?.x ?? 0,
  z: save.data.player?.z ?? 1040,
  yaw: save.data.player?.yaw ?? 0,
  pitch: save.data.player?.pitch ?? -0.05,
  fov: save.data.player?.fov ?? 66,
  headBob: 0,
  vx: 0,
  vz: 0
};

const world = {
  time: 0,
  corvusText: `Welcome to ${socialProfile.name} Commons.`,
  syncStatus: save.data.repositoryCache ? 'cached' : 'seeded'
};

document.addEventListener('keydown', onKeyDown);
document.addEventListener('keyup', (event) => keys.delete(event.key.toLowerCase()));
document.addEventListener('mousemove', onMouseMove);
document.addEventListener('pointerlockchange', onPointerLockChange);
canvas.addEventListener('click', onWorldClick);
canvas.addEventListener('wheel', onMouseWheel, { passive: false });

startButton?.addEventListener('click', begin);
continueButton?.addEventListener('click', begin);
codexButton?.addEventListener('click', openCodex);
aboutButton?.addEventListener('click', openAboutJeff);
resumeButton?.addEventListener('click', openResumeHall);
closeCodex?.addEventListener('click', () => { codexPanel.classList.add('hidden'); lockPointer(); });
closeTrial?.addEventListener('click', () => { trialModal.classList.add('hidden'); lockPointer(); });
closeDetail?.addEventListener('click', closeDetailPanel);
syncButton?.addEventListener('click', hydrateRepositories);
backendButton?.addEventListener('click', checkBackend);
cameraButton?.addEventListener('click', () => startCameraBeat('arrival'));
resetButton?.addEventListener('click', () => { save.reset(); window.location.reload(); });
resumePauseButton?.addEventListener('click', lockPointer);

document.querySelectorAll('[data-trial]').forEach((button) => button.addEventListener('click', () => trial.choose(button.dataset.trial)));

renderMinimap();
updateHud();
loadGalleryData();
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
  if (!started || !codexPanel.classList.contains('hidden') || !trialModal.classList.contains('hidden') || !detailPanel.classList.contains('hidden')) return;
  canvas.requestPointerLock?.();
}

function onPointerLockChange() {
  const locked = document.pointerLockElement === canvas;
  const contentOpen = !detailPanel.classList.contains('hidden') || !codexPanel.classList.contains('hidden') || !trialModal.classList.contains('hidden');
  pauseOverlay.classList.toggle('hidden', locked || !started || contentOpen);
  reticle.classList.toggle('paused', !locked);
}

function onMouseMove(event) {
  if (!started || document.pointerLockElement !== canvas) return;
  player.yaw -= event.movementX * 0.002;
  player.pitch -= event.movementY * 0.002;
  player.pitch = clamp(player.pitch, -1.16, 1.02);
}

function onMouseWheel(event) {
  if (!started || !detailPanel.classList.contains('hidden') || !codexPanel.classList.contains('hidden')) return;
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
  if (!detailPanel.classList.contains('hidden') && key === 'escape') {
    event.preventDefault();
    closeDetailPanel();
    return;
  }
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
  focusedInteraction = started ? scene.getFocusedInteraction(player, 780) : null;
  renderInteractionPrompt();
  renderDirector(beat);
  requestAnimationFrame(loop);
}

function update(dt) {
  world.time += dt;
  const accel = keys.has('shift') ? 1120 : 720;
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
    player.headBob += dt * (keys.has('shift') ? 15 : 10);
  } else {
    player.headBob += (0 - player.headBob) * 0.08;
  }

  player.vx *= friction;
  player.vz *= friction;
  player.x = clamp(player.x + player.vx * dt, -1450, 1450);
  player.z = clamp(player.z + player.vz * dt, -1450, 1180);

  const priorRealm = activeRealm;
  activeRealm = null;
  vaultNear = false;
  let nearestRealm = null;
  let nearestRealmDistance = Infinity;

  for (const realm of realms) {
    const d = distanceTo(realm.x, realm.z);
    if (d < nearestRealmDistance) { nearestRealmDistance = d; nearestRealm = realm; }
    if (d < 270) {
      activeRealm = realm.id;
      save.visitRealm(realm.id);
      const lines = corvusLines[realm.id] || corvusLines.idle;
      world.corvusText = lines[Math.floor(world.time / 6) % lines.length];
      audio.setRealm(realm.stem);
    }
  }

  vaultNear = distanceTo(0, 850) < 180;
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
    worldClickHint = 'Nothing selected. Center the reticle on a named building, sign, article wall, artifact, tablet, river, or terrain feature.';
    showToastMessage('Exploration Mode', worldClickHint);
    return;
  }
  const { type, id, label } = focusedInteraction.userData;
  if (type === 'artifact') inspectArtifact(id);
  else if (type === 'galleryPost') showGalleryPost(id);
  else if (type === 'tablet') inspectTablet(Number(id));
  else if (type === 'portal') inspectPortal(id);
  else if (type === 'vault') openTrial();
  else if (type === 'gate') openAboutJeff();
  else if (type === 'river') openDetail('Mill River', 'Mill River', `<p>The river connects the village. In this portfolio world it represents governed data moving through platforms, workflows, decisions, and people.</p>`);
  else if (type === 'terrain') openDetail('Jeff Barnes Commons', 'Commons Meadow', `<p>You are walking through a storybook portfolio town. Each named location is a doorway into Jeff’s resume, public writing, projects, leadership philosophy, AI work, and healthcare analytics background.</p>`);
  else openDetail('World Object', label || 'World Object', `<p>${escapeHTML(label || 'This object belongs to the Commons.')}</p>`);
}

function renderInteractionPrompt() {
  if (!started) return;
  if (!focusedInteraction) {
    interactionPrompt.textContent = vaultNear ? 'Click or press E to enter Contact Tower' : (worldClickHint || `Explore ${socialProfile.name} Commons. WASD/arrows move. Mouse wheel zooms. Click named buildings and signs to open full pages.`);
    reticle.classList.remove('locked');
    return;
  }
  const { type, id, label } = focusedInteraction.userData;
  reticle.classList.add('locked');
  if (type === 'artifact') interactionPrompt.textContent = `Click to open: ${artifacts[id]?.title || label}`;
  else if (type === 'galleryPost') interactionPrompt.textContent = `Click to read article: ${galleryPayload.find((item) => item.id === id)?.title || label}`;
  else if (type === 'tablet') interactionPrompt.textContent = `Click to read tablet ${Number(id) + 1}`;
  else if (type === 'portal') interactionPrompt.textContent = `Click to enter: ${realms.find((r) => r.id === id)?.name || label}`;
  else if (type === 'vault') interactionPrompt.textContent = 'Click to open Contact Tower';
  else if (type === 'river') interactionPrompt.textContent = 'Click to inspect Mill River';
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
  if (artifact.action === 'resume') return openResumeHall();
  if (artifact.action === 'about') return openAboutJeff();
  if (artifact.action === 'map') return openCommonsMap();
  if (artifact.action === 'gallery') return showGalleryList();
  if (artifact.action === 'linkedin') return openDetail('LinkedIn Profile', 'Jeff Barnes on LinkedIn', `<p>Open Jeff's LinkedIn profile and recent posts.</p>${linkButton(socialProfile.linkedin, 'Open LinkedIn Profile')}`);
  showArtifact(id);
}

function inspectTablet(index) {
  if (!tablets[index]) return;
  if (save.unlockTablet(index)) {
    audio.accent();
    if (save.data.tablets.length >= 6) unlock('tabletKeeper');
  }
  openDetail(`Leadership Tablet ${index + 1}`, 'Inscription', `<blockquote>${escapeHTML(tablets[index])}</blockquote>${metaPills([`${save.data.tablets.length} tablets recovered`, 'Leadership Library'])}`);
}

function inspectPortal(id) {
  const realm = realms.find((r) => r.id === id);
  if (!realm) return;
  save.visitRealm(id);
  activeRealm = id;
  const actions = {
    about: linkButton('#about', 'Read About Jeff'),
    resume: linkButton('#resume', 'Open Resume Hall'),
    chronicle: linkButton('#gallery', 'Open Article Gallery')
  };
  openDetail(realm.short, realm.name, `<img class="detail-hero" src="${escapeAttribute(imageForRealm(id))}" alt="${escapeAttribute(realm.name)} artwork"><p><strong>${escapeHTML(realm.title)}</strong></p><p>${escapeHTML(realm.body)}</p><p>${escapeHTML(realm.plain || realm.quest)}</p>${actions[id] || ''}`);
  bindHashActionLinks();
  updateHud(realm, 0);
}

function showArtifact(id) {
  const artifact = artifacts[id];
  const realm = realms.find((r) => r.id === artifact.realm);
  openDetail(`${realm.name} / ${artifact.type}`, artifact.title, `<p>${escapeHTML(artifact.body)}</p>${metaPills([`${save.data.discoveredArtifacts.length} readings`, `${save.data.visitedRealms.length} locations`, `${world.syncStatus} workshop`])}`);
  updateHud(realm, 0);
}

function openAboutJeff() {
  openDetail('About Jeff Barnes', 'Builder, Architect, Leader', `<div class="profile-reader"><img src="${jeffProfileImage}" alt="Jeff Barnes portrait"><div>${resumeData.about.map((p) => `<p>${escapeHTML(p)}</p>`).join('')}${metaPills(['Healthcare analytics', 'Enterprise architecture', 'AI governance', 'Data engineering', 'Leadership'])}<p>${linkButton(socialProfile.linkedin, 'Open LinkedIn')}</p></div></div>`);
}

function openCommonsMap() {
  openDetail('Village Map', 'Jeff Barnes Commons', `<img class="detail-hero" src="${fantasyArt.commonsMap}" alt="Map of Jeff Barnes Commons"><p>Use the named roads and signs: Resume Hall, Chronicle House, The Foundry, AI Workshop, Healthcare Analytics Hall, Leadership Library, and Project Workshop.</p>`);
}

function openResumeHall() {
  const accomplishments = resumeData.accomplishments.map((item) => `<li>${escapeHTML(item)}</li>`).join('');
  const skills = resumeData.skills.map((skill) => `<span>${escapeHTML(skill)}</span>`).join('');
  const technical = resumeData.technical.map((skill) => `<span>${escapeHTML(skill)}</span>`).join('');
  const experience = resumeData.experience.map((job) => `<article class="resume-job"><h3>${escapeHTML(job.organization)}</h3><p><strong>${escapeHTML(job.role)}</strong><br>${escapeHTML(job.location)} / ${escapeHTML(job.dates)}</p><ul>${job.bullets.map((b) => `<li>${escapeHTML(b)}</li>`).join('')}</ul></article>`).join('');
  openDetail('Resume Hall', resumeData.headline, `<img class="detail-hero" src="${fantasyArt.resumeHall}" alt="Resume Hall artwork"><p><strong>${escapeHTML(resumeData.name)}</strong> — ${escapeHTML(resumeData.location)} / ${escapeHTML(resumeData.email)} / ${escapeHTML(resumeData.phone)}</p>${resumeData.summary.map((p) => `<p>${escapeHTML(p)}</p>`).join('')}<h3>Key Accomplishments</h3><ul>${accomplishments}</ul><h3>Core Capabilities</h3><div class="skill-cloud">${skills}</div><h3>Technical Skills</h3><div class="skill-cloud">${technical}</div><h3>Professional Experience</h3>${experience}<h3>Education</h3><p>${escapeHTML(resumeData.education)}</p>`);
}

function showGalleryList() {
  const cards = galleryPayload.map((item) => renderGalleryCard(item)).join('');
  openDetail('Chronicle House', 'Recent Articles and Images', `<img class="detail-hero" src="${fantasyArt.chronicleHouse}" alt="Chronicle House artwork"><p>These imported posts open as full scrollable articles with original source links. LinkedIn-hosted images may expire later; when that happens, replace them with local assets.</p><div class="detail-gallery-grid">${cards}</div>`);
}

function showGalleryPost(id) {
  const item = galleryPayload.find((post) => post.id === id);
  if (!item) return;
  openDetail(`Article / ${item.category}`, item.title, renderGalleryCard(item, true));
}

function imageForRealm(id) {
  return ({ about: fantasyArt.commonsMap, resume: fantasyArt.resumeHall, chronicle: fantasyArt.chronicleHouse, foundry: fantasyArt.workshop, ai: fantasyArt.workshop, healthcare: fantasyArt.healthcareHall, leadership: fantasyArt.leadershipLibrary, workshop: fantasyArt.workshop })[id] || fantasyArt.commonsMap;
}

function openTrial() {
  document.exitPointerLock?.();
  trial.reset();
  contactCanvas.classList.add('hidden');
  trialModal.classList.remove('hidden');
  pauseOverlay.classList.add('hidden');
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
    trialLog.innerHTML = `${escapeHTML(snapshot.log)} <button id="retryTrial">Reset Trial</button>`;
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
    showToastMessage('Contact Tower Verified', 'Server trust token accepted.');
  } catch {
    renderContactGlyphs(contactCanvas, snapshot.token);
    showToastMessage('Contact Tower Opened', 'Static fallback contact card rendered.');
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

async function loadGalleryData() {
  try {
    const response = await fetch('/data/linkedin-gallery.json', { cache: 'no-store' });
    if (!response.ok) return;
    const payload = await response.json();
    if (Array.isArray(payload.items) && payload.items.length) galleryPayload = payload.items;
  } catch {
    galleryPayload = linkedinGallery;
  }
}

function openCodex() {
  document.exitPointerLock?.();
  pauseOverlay.classList.add('hidden');
  save.noteCodexOpen();
  const manifestRows = assetManifest.productionNeeds.map((need) => `<li>${escapeHTML(need)}</li>`).join('');
  const backendStatus = save.data.backend?.online ? 'online' : 'offline/static';
  const repoRows = repositoryPayload.map((repo) => `<li><strong>${escapeHTML(repo.repo)}</strong> — ${escapeHTML(repo.title)}<br><span>${escapeHTML(repo.realm)} / ${escapeHTML(repo.status)} / signal ${escapeHTML(String(repo.signal))} / ${escapeHTML(repo.language || 'unknown')}</span></li>`).join('');
  const realmRows = realms.map((realm) => `<article><h3>${escapeHTML(realm.name)}</h3><p><strong>${escapeHTML(realm.title)}</strong></p><p>${escapeHTML(realm.body)}</p><p><span>${escapeHTML(realm.plain)}</span></p></article>`).join('');
  const galleryRows = galleryPayload.map((item) => `<article class="gallery-card">${item.image ? `<img src="${escapeAttribute(item.image)}" alt="${escapeAttribute(item.title)}" loading="lazy">` : ''}<h3>${escapeHTML(item.title)}</h3><p><strong>${escapeHTML(item.category)}</strong></p><p>${paragraphs(articleText(item))}</p><p>${linkButton(item.url, 'Open original article')}</p></article>`).join('');
  codexContent.innerHTML = `<div class="profile-reader"><img src="${jeffProfileImage}" alt="Jeff Barnes portrait"><div><h3>${escapeHTML(socialProfile.name)}</h3><p><strong>${escapeHTML(resumeData.headline)}</strong></p><p>${escapeHTML(resumeData.about[0])}</p><p>${linkButton(socialProfile.linkedin, 'Open LinkedIn profile')}</p></div></div><h3>Progress</h3><p>${save.data.visitedRealms.length}/${realms.length} locations visited. ${save.data.discoveredArtifacts.length}/${Object.keys(artifacts).length} readings opened. ${save.data.tablets.length}/${tablets.length} tablets recovered.</p><h3>Village Locations</h3>${realmRows}<h3>Chronicle House Articles</h3><p>Imported cards load from <code>public/data/linkedin-gallery.json</code>. Click any post in the world or here to read the full panel and open the source.</p>${galleryRows}<h3>Living Workshop</h3><p>Source: ${escapeHTML(world.syncStatus)}. Backend: ${backendStatus}. Press Sync Workshop to refresh repository signals.</p><ul>${repoRows}</ul><h3>Production Asset Pipeline</h3><ul>${manifestRows}</ul><h3>Achievements</h3><ul>${save.data.achievements.map((id) => `<li><strong>${escapeHTML(achievements[id]?.title || id)}</strong> — ${escapeHTML(achievements[id]?.text || '')}</li>`).join('') || '<li>No achievements yet.</li>'}</ul>`;
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
    objectiveText.textContent = realm.plain || `${realm.short} location active.`;
    realmTag.textContent = `${realm.short}`;
  } else if (vaultNear) {
    objectiveTitle.textContent = `Contact ${socialProfile.name}`;
    objectiveText.textContent = 'Look at Contact Tower and click, or press E, to begin the contact-gate trial.';
    realmTag.textContent = 'CONTACT';
  } else {
    objectiveTitle.textContent = `Explore ${socialProfile.name} Commons`;
    objectiveText.textContent = nearestRealm ? `Nearest named location: ${nearestRealm.name}. Distance ${Math.round(distance)}.` : 'Move through the village and click named locations.';
    realmTag.textContent = `${world.syncStatus} workshop`;
  }
}

function renderMinimap() {
  const ctx = minimap.getContext('2d');
  const w = minimap.width;
  const h = minimap.height;
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = 'rgba(45,31,18,.72)';
  ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = 'rgba(240,194,111,.5)';
  ctx.strokeRect(1, 1, w - 2, h - 2);
  const sx = (x) => w / 2 + x / 14;
  const sz = (z) => h / 2 + z / 14;
  realms.forEach((realm) => {
    ctx.fillStyle = realm.color;
    ctx.beginPath();
    ctx.arc(sx(realm.x), sz(realm.z), activeRealm === realm.id ? 6 : 4, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.fillStyle = '#f2c76d';
  ctx.fillRect(sx(0) - 4, sz(850) - 4, 8, 8);
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(sx(player.x), sz(player.z), 4, 0, Math.PI * 2);
  ctx.fill();
}

function openDetail(kicker, title, html) {
  document.exitPointerLock?.();
  pauseOverlay.classList.add('hidden');
  artifactPanel?.classList.add('hidden');
  detailKicker.textContent = kicker;
  detailTitle.textContent = title;
  detailContent.innerHTML = html;
  detailPanel.classList.remove('hidden');
}

function closeDetailPanel() {
  detailPanel.classList.add('hidden');
  detailContent.innerHTML = '';
  lockPointer();
}

function renderGalleryCard(item, single = false) {
  const text = articleText(item);
  return `<article class="detail-gallery-card ${single ? 'single' : ''}">${item.image ? `<img src="${escapeAttribute(item.image)}" alt="${escapeAttribute(item.title)}" loading="lazy">` : '<div class="image-placeholder">Image pending</div>'}<div><p class="eyebrow">${escapeHTML(item.category || 'Article')}</p><h3>${escapeHTML(item.title)}</h3><div class="article-body">${paragraphs(text)}</div>${metaPills([item.age, item.engagement ? `${item.engagement} reactions` : null, item.impressions].filter(Boolean))}<p>${linkButton(item.url, 'Open original article')}</p></div></article>`;
}

function articleText(item) { return item.fullText || item.text || item.content || item.excerpt || ''; }
function paragraphs(text = '') { return escapeHTML(text).split('\n').filter(Boolean).map((line) => `<p class="detail-paragraph">${line}</p>`).join(''); }
function metaPills(values) { return `<div class="artifact-meta">${values.map((value) => `<span>${escapeHTML(value)}</span>`).join('')}</div>`; }
function linkButton(url, label) { if (!url || url === '#') return ''; return `<a class="detail-link" href="${escapeAttribute(url)}" target="_blank" rel="noreferrer">${escapeHTML(label)}</a>`; }
function bindHashActionLinks() { detailContent.querySelectorAll('a[href="#about"]').forEach((a) => a.addEventListener('click', (e) => { e.preventDefault(); openAboutJeff(); })); detailContent.querySelectorAll('a[href="#resume"]').forEach((a) => a.addEventListener('click', (e) => { e.preventDefault(); openResumeHall(); })); detailContent.querySelectorAll('a[href="#gallery"]').forEach((a) => a.addEventListener('click', (e) => { e.preventDefault(); showGalleryList(); })); }

function unlock(id) { if (!achievements[id]) return; if (save.unlockAchievement(id)) showToastMessage(achievements[id].title, achievements[id].text); }
function showToastMessage(title, text) { achievementToast.classList.remove('hidden'); achievementToast.innerHTML = `<strong>${escapeHTML(title)}</strong><span>${escapeHTML(text)}</span>`; clearTimeout(showToastMessage.timer); showToastMessage.timer = setTimeout(() => achievementToast.classList.add('hidden'), 4200); }
function escapeHTML(value = '') { return String(value).replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char])); }
function escapeAttribute(value = '') { return escapeHTML(value); }
function distanceTo(x, z) { return Math.hypot(x - player.x, z - player.z); }
function clamp(value, min, max) { return Math.max(min, Math.min(max, value)); }
