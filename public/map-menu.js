(() => {
  const SAVE_KEY = 'project-odin-save-v4';
  const MAP_BOUNDS = { minX: -1500, maxX: 1500, minZ: -900, maxZ: 1050 };

  const DESTINATIONS = [
    { id: 'about', name: 'Jeff Barnes Commons', short: 'COMMONS', desc: 'Start here: identity, site map, about Jeff, and resume access.', x: 0, z: 500, color: '#f0c26f' },
    { id: 'resume', name: 'Resume Hall', short: 'RESUME', desc: 'Career history, accomplishments, executive summary, skills, and credentials.', x: -680, z: 80, color: '#d9a85c' },
    { id: 'chronicle', name: 'Chronicle House', short: 'WRITING', desc: 'Articles, posts, public voice, essays, and long-form thinking.', x: -600, z: 620, color: '#8ec1ff' },
    { id: 'foundry', name: 'The Foundry', short: 'DATA PLATFORM', desc: 'Fabric, Databricks, dbt, architecture, semantic modeling, and cloud platforms.', x: -220, z: -255, color: '#ff9d4a' },
    { id: 'ai', name: 'AI Workshop', short: 'AI', desc: 'AI governance, LLM workflows, ThreadlineAI, agents, and responsible adoption.', x: 700, z: 85, color: '#6ee7d8' },
    { id: 'healthcare', name: 'Healthcare Analytics Hall', short: 'HEALTHCARE', desc: 'Epic, Clarity, operational analytics, decision support, and patient access.', x: -690, z: -620, color: '#8fcf9f' },
    { id: 'leadership', name: 'Leadership Library', short: 'LEADERSHIP', desc: 'Leadership philosophy, coaching, governance, value-stream design, and people systems.', x: 420, z: -650, color: '#bca3ff' },
    { id: 'workshop', name: 'Project Workshop', short: 'PROJECTS', desc: 'GitHub, ThreadlineAI, Project Odin, OpenAegis, OpenPulse, and prototypes.', x: 650, z: 620, color: '#72ffc2' },
    { id: 'youtube', name: 'YouTube Theater', short: 'YOUTUBE', desc: 'Videos, demos, talks, shorts, and public storytelling.', x: -980, z: 45, color: '#ff6a61' },
    { id: 'fishing', name: 'Angler’s Wharf', short: 'FISHING', desc: 'Fishing, Alaska, outdoors, travel, and personal adventure.', x: 1060, z: 260, color: '#5fd1c7' },
    { id: 'martial', name: 'Hall of Disciplines', short: 'MARTIAL ARTS', desc: 'Martial arts lineage, Feng Xiao Zhang, Tae Kwon Do, Karate, Kung Fu, Kyusho, and BJJ.', x: -980, z: -270, color: '#f1c453' },
    { id: 'extreme-sports', name: 'Proving Grounds', short: 'EXTREME SPORTS', desc: 'Powerlifting, strongman, Spartan Trifectas, ultras, and Team USA Bohurt.', x: 980, z: -430, color: '#ff5f45' },
    { id: 'contact', name: 'Contact Tower', short: 'CONTACT', desc: 'Contact Jeff Barnes and open the final contact gate.', x: 0, z: 760, color: '#fff0c6' }
  ];

  const style = `
    .odin-map-overlay{position:fixed!important;inset:0!important;z-index:2147483000!important;background:radial-gradient(circle at 50% 20%,rgba(216,170,84,.2),rgba(8,5,2,.96) 58%,#000 100%)!important;color:#fff0c6!important;overflow:auto!important;padding:18px!important;box-sizing:border-box!important;font-family:Georgia,'Times New Roman',serif!important}
    .odin-map-overlay.hidden{display:none!important}
    .odin-map-shell{max-width:1780px!important;margin:0 auto!important;display:grid!important;grid-template-columns:minmax(720px,1.6fr) minmax(320px,.55fr)!important;gap:16px!important}
    .odin-map-header{grid-column:1/-1!important;display:flex!important;justify-content:space-between!important;gap:16px!important;align-items:end!important;padding:18px 22px!important;border:1px solid rgba(240,194,111,.5)!important;border-radius:18px!important;background:linear-gradient(145deg,rgba(55,32,12,.94),rgba(16,9,3,.94))!important;box-shadow:0 18px 60px rgba(0,0,0,.38)!important}
    .odin-map-header h2{font-size:clamp(2.1rem,4vw,5rem)!important;line-height:.9!important;margin:.15rem 0!important;color:#fff2c8!important;text-shadow:0 4px 18px rgba(0,0,0,.35)!important}
    .odin-map-header p{margin:.2rem 0!important;max-width:880px!important;color:rgba(255,240,198,.84)!important}
    .odin-map-header .eyebrow,.odin-card .eyebrow,.odin-map-detail .eyebrow{font:900 .76rem system-ui,sans-serif!important;letter-spacing:.16em!important;text-transform:uppercase!important;color:#f0c26f!important}
    .odin-map-actions{display:flex!important;gap:10px!important;flex-wrap:wrap!important;justify-content:flex-end!important}
    .odin-map-overlay button{border:1px solid rgba(240,194,111,.66)!important;border-radius:10px!important;background:linear-gradient(180deg,#7d4f22,#2e1a0a)!important;color:#fff0c6!important;font:900 .82rem system-ui,sans-serif!important;letter-spacing:.06em!important;text-transform:uppercase!important;padding:10px 13px!important;cursor:pointer!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.14),0 9px 25px rgba(0,0,0,.3)!important}
    .odin-map-overlay button:hover{filter:brightness(1.14)!important}
    .odin-map-art{position:relative!important;min-height:calc(100vh - 220px)!important;border:3px solid #261205!important;border-radius:28px!important;overflow:hidden!important;background:#c99b52!important;box-shadow:inset 0 0 160px rgba(37,18,5,.82),0 24px 90px rgba(0,0,0,.5)!important}
    .odin-map-art svg{position:absolute!important;inset:0!important;width:100%!important;height:100%!important}
    .odin-pin{position:absolute!important;z-index:6!important;transform:translate(-50%,-50%)!important;min-width:124px!important;max-width:172px!important;border:2px solid #251105!important;border-radius:999px!important;background:linear-gradient(180deg,#fff0b8,#b88639)!important;color:#201005!important;padding:7px 9px!important;text-align:center!important;font:900 .7rem Georgia,serif!important;box-shadow:0 9px 24px rgba(0,0,0,.38),0 0 0 5px color-mix(in srgb,var(--pin),transparent 58%)!important}
    .odin-pin:after{content:''!important;position:absolute!important;left:50%!important;bottom:-13px!important;width:16px!important;height:16px!important;background:var(--pin)!important;border:2px solid #251105!important;transform:translateX(-50%) rotate(45deg)!important;z-index:-1!important}
    .odin-pin:hover,.odin-pin:focus{filter:brightness(1.12)!important;transform:translate(-50%,-50%) scale(1.05)!important}
    .odin-map-detail{border:1px solid rgba(240,194,111,.48)!important;border-radius:18px!important;background:linear-gradient(145deg,rgba(55,33,14,.93),rgba(14,8,3,.93))!important;padding:18px!important;box-shadow:0 18px 60px rgba(0,0,0,.35)!important}
    .odin-map-detail h3{font-size:2.2rem!important;line-height:1!important;color:#fff2c8!important;margin:.2rem 0 .75rem!important}
    .odin-map-detail p{color:rgba(255,240,198,.84)!important}
    .odin-card-grid{grid-column:1/-1!important;display:grid!important;grid-template-columns:repeat(auto-fit,minmax(230px,1fr))!important;gap:12px!important}
    .odin-card{border:1px solid rgba(240,194,111,.32)!important;border-radius:16px!important;padding:14px!important;background:linear-gradient(145deg,rgba(255,236,177,.08),rgba(0,0,0,.18))!important}
    .odin-card h3{color:#fff2c8!important;margin:.2rem 0!important}
    .odin-card p{color:rgba(255,240,198,.78)!important}
    .odin-card.active{border-color:rgba(240,194,111,.84)!important;box-shadow:0 0 0 2px rgba(240,194,111,.15)!important}
    .odin-card button{width:100%!important;margin-top:7px!important}
    .odin-map-floating{position:fixed!important;right:18px!important;top:16px!important;z-index:2147482000!important;display:flex!important;align-items:center!important;gap:8px!important;border:1px solid rgba(240,194,111,.76)!important;border-radius:999px!important;background:linear-gradient(145deg,rgba(61,36,15,.96),rgba(16,9,3,.94))!important;color:#fff0c6!important;padding:8px 12px!important;box-shadow:0 14px 40px rgba(0,0,0,.45)!important}
    .odin-map-floating kbd{display:inline-grid!important;place-items:center!important;width:32px!important;height:32px!important;border-radius:7px!important;background:#f0c26f!important;color:#211006!important;font-weight:1000!important}
    .odin-map-floating span{font:900 .8rem system-ui,sans-serif!important;letter-spacing:.05em!important;text-transform:uppercase!important}
    @media(max-width:980px){.odin-map-shell{grid-template-columns:1fr!important}.odin-map-header{align-items:start!important;flex-direction:column!important}.odin-map-art{min-height:72vh!important}.odin-pin{min-width:96px!important;font-size:.58rem!important;padding:6px!important}.odin-map-floating{top:auto!important;bottom:16px!important;right:16px!important}}
  `;

  function ensureStyle() {
    if (document.getElementById('odin-map-style')) return;
    const tag = document.createElement('style');
    tag.id = 'odin-map-style';
    tag.textContent = style;
    document.head.appendChild(tag);
  }

  function pctX(x) {
    const pct = ((x - MAP_BOUNDS.minX) / (MAP_BOUNDS.maxX - MAP_BOUNDS.minX)) * 100;
    return Math.max(9, Math.min(91, pct));
  }

  function pctY(z) {
    const pct = (1 - ((z - MAP_BOUNDS.minZ) / (MAP_BOUNDS.maxZ - MAP_BOUNDS.minZ))) * 100;
    return Math.max(8, Math.min(92, pct));
  }

  function mapSvg() {
    return `<svg viewBox="0 0 1600 980" preserveAspectRatio="none" aria-hidden="true">
      <defs><radialGradient id="paper" cx="48%" cy="38%" r="68%"><stop offset="0" stop-color="#f7e0a0"/><stop offset=".58" stop-color="#d0a560"/><stop offset="1" stop-color="#85542a"/></radialGradient><filter id="rough"><feTurbulence type="fractalNoise" baseFrequency=".016" numOctaves="4" seed="7"/><feDisplacementMap in="SourceGraphic" scale="3"/></filter></defs>
      <rect width="1600" height="980" rx="48" fill="url(#paper)"/>
      <path d="M65 193 C168 77 296 128 390 70 C515 -5 615 94 733 58 C860 18 956 85 1104 66 C1258 45 1420 114 1536 63 C1588 158 1494 250 1546 335 C1604 432 1506 506 1548 626 C1584 733 1464 779 1488 907 C1328 951 1180 884 1056 930 C912 984 796 880 662 928 C519 981 398 894 250 922 C151 940 62 850 106 726 C42 653 121 560 68 466 C17 375 143 288 65 193 Z" fill="#d6b16a" stroke="#2a1406" stroke-width="7" filter="url(#rough)"/>
      <path d="M70 634 C221 558 350 572 478 514 C640 441 713 341 880 386 C1035 429 1138 305 1290 260 C1405 224 1494 179 1568 108" fill="none" stroke="#3f7885" stroke-width="42" stroke-linecap="round" opacity=".65"/>
      <path d="M192 508 C333 385 474 432 642 390 C822 344 938 411 1125 333 C1242 285 1349 279 1462 229" fill="none" stroke="#5d3b1b" stroke-width="18" stroke-linecap="round" stroke-dasharray="1 28" opacity=".72"/>
      <path d="M250 754 C394 661 530 647 685 540 C818 448 920 471 1068 578 C1197 671 1320 626 1470 712" fill="none" stroke="#5d3b1b" stroke-width="18" stroke-linecap="round" stroke-dasharray="1 28" opacity=".72"/>
      <g fill="none" stroke="#2a1406" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" opacity=".72">
        ${Array.from({ length: 12 }, (_, i) => `<path d="M${960 + i * 48} ${185 + Math.sin(i) * 18} l32 -82 l32 82 m-44 -26 l12 -32 l14 32"/>`).join('')}
        ${Array.from({ length: 62 }, (_, i) => { const x = 92 + ((i * 43) % 420); const y = 135 + ((i * 71) % 270); return `<path d="M${x} ${y+18} l11 -22 l11 22 m-11 0 v24"/>`; }).join('')}
        ${Array.from({ length: 46 }, (_, i) => { const x = 1090 + ((i * 47) % 350); const y = 545 + ((i * 83) % 235); return `<path d="M${x} ${y+18} l11 -22 l11 22 m-11 0 v24"/>`; }).join('')}
        <circle cx="178" cy="785" r="82"/><path d="M178 675 L202 785 L178 895 L154 785 Z M68 785 L178 761 L288 785 L178 809 Z"/>
      </g>
      <text x="800" y="118" text-anchor="middle" font-family="Georgia" font-size="66" font-weight="900" fill="#271407">Jeff Barnes Commons</text>
      <text x="800" y="154" text-anchor="middle" font-family="Georgia" font-size="24" font-weight="700" fill="#4b2b12">A map of work, craft, discipline, stories, and adventure</text>
    </svg>`;
  }

  function saveTravel(destination) {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      const data = raw ? JSON.parse(raw) : { version: 4 };
      data.lastRealm = destination.id;
      data.player = { x: Math.round(destination.x), z: Math.round(destination.z - 175), yaw: 0, pitch: -0.05, fov: 66 };
      data.visitedRealms = Array.from(new Set([...(data.visitedRealms || []), destination.id]));
      localStorage.setItem(SAVE_KEY, JSON.stringify(data));
    } catch {}
  }

  function detail(destination) {
    return `<p class="eyebrow">${destination.short}</p><h3>${destination.name}</h3><p>${destination.desc}</p><p><strong>Click Travel here</strong> to reload beside this destination.</p><button data-odin-travel="${destination.id}">Travel here</button>`;
  }

  function setActive(id) {
    const destination = DESTINATIONS.find((d) => d.id === id) || DESTINATIONS[0];
    const panel = document.getElementById('odinMapDetail');
    if (panel) panel.innerHTML = detail(destination);
    document.querySelectorAll('.odin-card').forEach((card) => card.classList.toggle('active', card.dataset.odinCard === id));
  }

  function buildOverlay() {
    ensureStyle();
    let overlay = document.getElementById('odinMapOverlay');
    if (overlay) return overlay;
    overlay = document.createElement('section');
    overlay.id = 'odinMapOverlay';
    overlay.className = 'odin-map-overlay hidden';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    const pins = DESTINATIONS.map((d) => `<button class="odin-pin" style="left:${pctX(d.x)}%;top:${pctY(d.z)}%;--pin:${d.color}" data-odin-destination="${d.id}">${d.name}</button>`).join('');
    const cards = DESTINATIONS.map((d) => `<article class="odin-card" data-odin-card="${d.id}"><p class="eyebrow">${d.short}</p><h3>${d.name}</h3><p>${d.desc}</p><button data-odin-travel="${d.id}">Travel here</button></article>`).join('');
    overlay.innerHTML = `<div class="odin-map-shell"><header class="odin-map-header"><div><p class="eyebrow">Map & Menu</p><h2>Jeff Barnes Commons</h2><p>This is the primary navigation layer. Choose any district from the Tolkien-style map or the cards below.</p></div><div class="odin-map-actions"><button data-odin-close>Explore 3D</button><button data-odin-reset>Reset Spawn</button></div></header><div class="odin-map-art">${mapSvg()}${pins}</div><aside class="odin-map-detail" id="odinMapDetail">${detail(DESTINATIONS[0])}</aside><div class="odin-card-grid">${cards}</div></div>`;
    document.body.appendChild(overlay);
    return overlay;
  }

  function openMap() {
    const overlay = buildOverlay();
    overlay.classList.remove('hidden');
    setActive(DESTINATIONS[0].id);
    document.exitPointerLock?.();
  }

  function closeMap() {
    document.getElementById('odinMapOverlay')?.classList.add('hidden');
  }

  function travel(id) {
    const destination = DESTINATIONS.find((d) => d.id === id);
    if (!destination) return;
    saveTravel(destination);
    location.reload();
  }

  function installFloatingButton() {
    if (document.getElementById('odinMapFloating')) return;
    const button = document.createElement('button');
    button.id = 'odinMapFloating';
    button.className = 'odin-map-floating';
    button.setAttribute('data-open-map-first', 'true');
    button.innerHTML = '<kbd>M</kbd><span>Map</span>';
    document.body.appendChild(button);
  }

  function install() {
    ensureStyle();
    buildOverlay();
    installFloatingButton();
    window.ProjectOdinMap = { open: openMap, close: closeMap, travel };
    window.openOdinMap = openMap;
    document.addEventListener('click', (event) => {
      const mapTrigger = event.target.closest?.('[data-open-map-first], #openMapButton, #titleMapButton, #mapMenuButton, #odinMapFloating');
      const destination = event.target.closest?.('[data-odin-destination]');
      const travelButton = event.target.closest?.('[data-odin-travel]');
      const closeButton = event.target.closest?.('[data-odin-close]');
      const resetButton = event.target.closest?.('[data-odin-reset]');
      if (mapTrigger) { event.preventDefault(); event.stopPropagation(); openMap(); return; }
      if (destination) { event.preventDefault(); event.stopPropagation(); setActive(destination.dataset.odinDestination); return; }
      if (travelButton) { event.preventDefault(); event.stopPropagation(); travel(travelButton.dataset.odinTravel); return; }
      if (closeButton) { event.preventDefault(); event.stopPropagation(); closeMap(); return; }
      if (resetButton) { event.preventDefault(); event.stopPropagation(); try { localStorage.removeItem(SAVE_KEY); } catch {}; location.reload(); }
    }, true);
    document.addEventListener('mouseover', (event) => {
      const destination = event.target.closest?.('[data-odin-destination]');
      if (destination) setActive(destination.dataset.odinDestination);
    }, true);
    document.addEventListener('keydown', (event) => {
      if (event.key?.toLowerCase() === 'm') { event.preventDefault(); event.stopPropagation(); openMap(); }
      if (event.key === 'Escape' && !document.getElementById('odinMapOverlay')?.classList.contains('hidden')) closeMap();
    }, true);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', install);
  else install();
})();
