import { realms, artifacts, socialProfile } from './content.js';

const SAVE_KEY = 'project-odin-save-v4';

const FALLBACK_DESTINATIONS = [
  ['about', 'Jeff Barnes Commons', 'Center square', 0, 260, '#f0c26f'],
  ['resume', 'Resume Hall', 'Career, accomplishments, executive story', -680, 85, '#8aa7ff'],
  ['chronicle', 'Chronicle House', 'Writing, posts, essays, public voice', -520, 520, '#d684ff'],
  ['foundry', 'The Foundry', 'Data engineering, platforms, architecture', 590, 35, '#ff9c55'],
  ['ai', 'AI Workshop', 'AI strategy, governance, model adoption', 705, 560, '#76e8c2'],
  ['healthcare', 'Healthcare Analytics Hall', 'Clinical, operational, finance analytics', -755, -520, '#7bd7ff'],
  ['leadership', 'Leadership Library', 'Management, coaching, philosophy', 315, -545, '#9be48b'],
  ['workshop', 'Project Workshop', 'GitHub, prototypes, software builds', 780, -650, '#ffd466'],
  ['youtube', 'YouTube Theater', 'Videos, demos, public storytelling', -1120, 60, '#ff6a61'],
  ['fishing', 'Angler’s Wharf', 'Fishing, Alaska, outdoors, travel', 1130, 260, '#5fd1c7'],
  ['martial', 'Hall of Disciplines', 'Martial arts lineage and practice', -1080, -270, '#f1c453'],
  ['extreme-sports', 'Proving Grounds', 'Strength, endurance, Bohurt, Spartan', 1040, -430, '#ff5f45']
];

function destinations() {
  const known = realms.length ? realms : [];
  const merged = [...known];
  for (const [id, name, title, x, z, color] of FALLBACK_DESTINATIONS) {
    if (!merged.some((realm) => realm.id === id)) merged.push({ id, name, title, plain: title, x, z, color });
  }
  return merged;
}

function safe(value = '') {
  return String(value).replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));
}

function saveTravel(realm) {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    const data = raw ? JSON.parse(raw) : { version: 4 };
    const visited = Array.isArray(data.visitedRealms) ? data.visitedRealms : [];
    if (!visited.includes(realm.id)) visited.push(realm.id);
    data.visitedRealms = visited;
    data.lastRealm = realm.id;
    data.player = { x: Math.round(realm.x), z: Math.round(realm.z - 175), yaw: 0, pitch: -0.05, fov: 66 };
    localStorage.setItem(SAVE_KEY, JSON.stringify(data));
  } catch {
    // Ignore localStorage failures. Travel will degrade to close-only behavior.
  }
}

function makeMountainRange(idPrefix, count, startX, startY, width, height) {
  let output = '';
  for (let i = 0; i < count; i++) {
    const x = startX + i * width * 0.7;
    const y = startY + Math.sin(i * 1.7) * 18;
    output += `<path class="map-mountain" d="M${x} ${y + height} L${x + width / 2} ${y} L${x + width} ${y + height} M${x + width * 0.32} ${y + height * 0.58} L${x + width / 2} ${y + height * 0.2} L${x + width * 0.67} ${y + height * 0.58}"/>`;
  }
  return output;
}

function makeForest(count, startX, startY, spreadX, spreadY) {
  let output = '';
  for (let i = 0; i < count; i++) {
    const x = startX + ((i * 47) % spreadX);
    const y = startY + ((i * 83) % spreadY);
    output += `<path class="map-tree" d="M${x} ${y + 18} L${x + 11} ${y} L${x + 22} ${y + 18} Z M${x + 11} ${y + 18} L${x + 11} ${y + 28}"/>`;
  }
  return output;
}

function mapSvg() {
  return `<svg class="novel-map-art" viewBox="0 0 1600 980" preserveAspectRatio="none" aria-hidden="true">
    <defs>
      <radialGradient id="paperGlow" cx="48%" cy="42%" r="68%">
        <stop offset="0" stop-color="#f5df9c"/>
        <stop offset=".55" stop-color="#d3ad66"/>
        <stop offset="1" stop-color="#8b5b2d"/>
      </radialGradient>
      <filter id="inkRough"><feTurbulence type="fractalNoise" baseFrequency="0.018" numOctaves="3" seed="19"/><feDisplacementMap in="SourceGraphic" scale="3"/></filter>
    </defs>
    <rect width="1600" height="980" rx="48" fill="url(#paperGlow)"/>
    <path class="map-coast" d="M63 189 C158 89 296 128 375 77 C485 4 603 99 700 57 C862 -12 963 85 1099 67 C1250 45 1422 112 1535 64 C1587 160 1493 248 1545 331 C1604 426 1505 506 1546 624 C1582 728 1468 777 1485 906 C1329 952 1179 884 1055 930 C912 984 795 879 662 928 C519 981 397 894 250 921 C150 940 63 849 105 727 C43 652 120 560 67 466 C16 375 142 289 63 189 Z"/>
    <path class="map-river" d="M72 632 C220 559 348 570 477 512 C638 440 711 340 878 386 C1034 429 1137 304 1288 260 C1404 224 1495 178 1566 108"/>
    <path class="map-road" d="M192 508 C333 385 474 432 642 390 C822 344 938 411 1125 333 C1242 285 1349 279 1462 229"/>
    <path class="map-road" d="M250 754 C394 661 530 647 685 540 C818 448 920 471 1068 578 C1197 671 1320 626 1470 712"/>
    <path class="map-road thin" d="M788 455 C721 574 682 690 681 865"/>
    <path class="map-road thin" d="M788 455 C668 340 560 270 423 173"/>
    ${makeMountainRange('n', 10, 1010, 92, 76, 122)}
    ${makeMountainRange('s', 9, 780, 768, 70, 106)}
    ${makeForest(52, 92, 135, 405, 260)}
    ${makeForest(42, 1090, 545, 355, 225)}
    <circle class="map-compass-ring" cx="178" cy="785" r="82"/>
    <path class="map-compass" d="M178 675 L202 785 L178 895 L154 785 Z M68 785 L178 761 L288 785 L178 809 Z"/>
    <text class="map-title-ink" x="800" y="118" text-anchor="middle">Jeff Barnes Commons</text>
    <text class="map-subtitle-ink" x="800" y="154" text-anchor="middle">A map of work, craft, discipline, stories, and adventure</text>
  </svg>`;
}

function destinationStyle(realm) {
  const bounds = { minX: -1220, maxX: 1220, minZ: -780, maxZ: 980 };
  const left = ((realm.x - bounds.minX) / (bounds.maxX - bounds.minX)) * 100;
  const top = (1 - ((realm.z - bounds.minZ) / (bounds.maxZ - bounds.minZ))) * 100;
  return `left:${left}%;top:${top}%;--pin:${realm.color || '#f0c26f'}`;
}

function detailsFor(realm) {
  const items = Object.entries(artifacts)
    .filter(([, artifact]) => artifact.realm === realm.id)
    .slice(0, 6)
    .map(([, artifact]) => `<li><strong>${safe(artifact.title)}</strong><span>${safe(artifact.type || '')}</span></li>`)
    .join('');
  return `<h3>${safe(realm.name)}</h3><p>${safe(realm.plain || realm.title || realm.body || '')}</p>${items ? `<ul>${items}</ul>` : ''}`;
}

function buildOverlay() {
  let overlay = document.getElementById('mapFirstOverlay');
  if (overlay) return overlay;

  overlay = document.createElement('section');
  overlay.id = 'mapFirstOverlay';
  overlay.className = 'map-first-overlay hidden';
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('role', 'dialog');

  const realmList = destinations();
  const pins = realmList.map((realm) => `<button class="novel-map-pin" style="${destinationStyle(realm)}" data-map-destination="${safe(realm.id)}"><span>${safe(realm.name)}</span></button>`).join('');
  const cards = realmList.map((realm) => `<article class="map-first-card" data-card-destination="${safe(realm.id)}"><p class="eyebrow">${safe(realm.short || 'District')}</p><h3>${safe(realm.name)}</h3><p>${safe(realm.plain || realm.title || '')}</p><button data-travel-now="${safe(realm.id)}">Travel here</button></article>`).join('');

  overlay.innerHTML = `
    <div class="map-first-shell">
      <header class="map-first-header">
        <div><p class="eyebrow">Map & Menu</p><h2>${safe(socialProfile.name)} Commons</h2><p>Choose a destination. This is the primary navigation experience until the 3D art is strong enough to carry the site.</p></div>
        <div class="map-first-actions"><button data-close-map>Explore 3D</button><button data-reset-map-save>Reset Spawn</button></div>
      </header>
      <div class="novel-map-wrap">${mapSvg()}${pins}</div>
      <aside class="map-first-detail" id="mapFirstDetail">${detailsFor(realmList[0])}</aside>
      <div class="map-first-grid">${cards}</div>
    </div>`;
  document.body.appendChild(overlay);

  overlay.querySelector('[data-close-map]')?.addEventListener('click', closeMap);
  overlay.querySelector('[data-reset-map-save]')?.addEventListener('click', () => {
    try { localStorage.removeItem(SAVE_KEY); } catch {}
    location.reload();
  });
  overlay.querySelectorAll('[data-map-destination]').forEach((button) => button.addEventListener('mouseenter', () => showDetail(button.dataset.mapDestination)));
  overlay.querySelectorAll('[data-map-destination]').forEach((button) => button.addEventListener('focus', () => showDetail(button.dataset.mapDestination)));
  overlay.querySelectorAll('[data-map-destination]').forEach((button) => button.addEventListener('click', () => travel(button.dataset.mapDestination)));
  overlay.querySelectorAll('[data-travel-now]').forEach((button) => button.addEventListener('click', () => travel(button.dataset.travelNow)));

  return overlay;
}

function showDetail(id) {
  const realm = destinations().find((item) => item.id === id);
  const detail = document.getElementById('mapFirstDetail');
  if (realm && detail) detail.innerHTML = detailsFor(realm);
  document.querySelectorAll('.map-first-card').forEach((card) => card.classList.toggle('active', card.dataset.cardDestination === id));
}

function openMap() {
  const overlay = buildOverlay();
  overlay.classList.remove('hidden');
  document.exitPointerLock?.();
  showDetail(destinations()[0]?.id || 'about');
}

function closeMap() {
  document.getElementById('mapFirstOverlay')?.classList.add('hidden');
}

function travel(id) {
  const realm = destinations().find((item) => item.id === id);
  if (!realm) return;
  saveTravel(realm);
  const overlay = buildOverlay();
  overlay.querySelector('.map-first-header p:last-child').textContent = `Traveling to ${realm.name}. Reloading at that district.`;
  setTimeout(() => location.reload(), 280);
}

function install() {
  buildOverlay();
  document.addEventListener('keydown', (event) => {
    if (event.key?.toLowerCase() === 'm') {
      event.preventDefault();
      event.stopPropagation();
      openMap();
    }
    if (event.key === 'Escape' && !document.getElementById('mapFirstOverlay')?.classList.contains('hidden')) closeMap();
  }, true);

  document.getElementById('mapMenuButton')?.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    openMap();
  }, true);

  document.getElementById('startButton')?.addEventListener('click', () => {
    setTimeout(openMap, 450);
  });
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', install);
else install();
