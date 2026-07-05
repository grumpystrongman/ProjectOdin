import * as THREE from 'three';
import { realms, artifacts, tablets } from './content.js';

const ASSET_STYLE = {
  cobblestone: 'ambientCG PavingStones036 / Poly Haven Cobblestone Floor 08',
  sandstone: 'ambientCG Bricks008',
  slateRoof: 'ambientCG RoofingTiles005',
  warmWood: 'ambientCG WoodFloor044 / Poly Haven Wooden Planks',
  forestFloor: 'ambientCG Ground024',
  bark: 'ambientCG Bark001',
  villageKit: 'Quaternius Medieval Village MegaKit + Kenney Fantasy Town Kit',
  castleKit: 'Kenney Castle Kit',
  natureKit: 'Kenney Nature Kit',
  uiKit: 'Kenney Fantasy UI Borders + RPG UI Expansion'
};

const REALM_BUILD_TYPES = {
  about: 'hall',
  resume: 'grandHall',
  chronicle: 'scribeHouse',
  foundry: 'forge',
  ai: 'workshop',
  healthcare: 'sanctuary',
  leadership: 'library',
  workshop: 'marketWorkshop'
};

export class OdinScene {
  constructor(canvas) {
    this.canvas = canvas;
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xaed2e2);
    this.scene.fog = new THREE.FogExp2(0xd8c48f, 0.00058);
    this.camera = new THREE.PerspectiveCamera(66, window.innerWidth / window.innerHeight, 0.1, 5200);
    this.camera.rotation.order = 'YXZ';
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.23;
    this.clock = new THREE.Clock();
    this.raycaster = new THREE.Raycaster();
    this.center = new THREE.Vector2(0, 0);
    this.world = new THREE.Group();
    this.scene.add(this.world);
    this.realmObjects = new Map();
    this.artifactObjects = new Map();
    this.tabletObjects = [];
    this.repoObjects = [];
    this.signs = [];
    this.interactables = [];
    this.assetAnchors = new Map();
    this.materials = this.makeMaterials();
    this.init();
    window.addEventListener('resize', () => this.resize());
  }

  makeMaterials() {
    const cobbleTexture = this.makeCobblestoneTexture();
    const stoneTexture = this.makeStoneTexture();
    const roofTexture = this.makeRoofTileTexture();
    const woodTexture = this.makeWoodTexture();
    const grassTexture = this.makeGrassTexture();
    const barkTexture = this.makeBarkTexture();
    const signTexture = this.makeParchmentTexture();
    [cobbleTexture, stoneTexture, roofTexture, woodTexture, grassTexture, barkTexture, signTexture].forEach((texture) => {
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    });
    cobbleTexture.repeat.set(8, 12);
    stoneTexture.repeat.set(4, 3);
    roofTexture.repeat.set(5, 5);
    woodTexture.repeat.set(3, 2);
    grassTexture.repeat.set(18, 18);
    barkTexture.repeat.set(2, 6);

    return {
      grass: new THREE.MeshStandardMaterial({ map: grassTexture, color: 0x6f8d45, roughness: 0.98, metalness: 0.01 }),
      path: new THREE.MeshStandardMaterial({ map: cobbleTexture, color: 0xb49a72, roughness: 0.92, metalness: 0.02 }),
      dirt: new THREE.MeshStandardMaterial({ color: 0x7a5a33, roughness: 0.96, metalness: 0.02 }),
      wood: new THREE.MeshStandardMaterial({ map: woodTexture, color: 0x8a5b31, roughness: 0.86, metalness: 0.04 }),
      bark: new THREE.MeshStandardMaterial({ map: barkTexture, color: 0x65401f, roughness: 0.94, metalness: 0.02 }),
      plaster: new THREE.MeshStandardMaterial({ color: 0xd7b783, roughness: 0.88, metalness: 0.02 }),
      roof: new THREE.MeshStandardMaterial({ map: roofTexture, color: 0x7c3a28, roughness: 0.84, metalness: 0.03 }),
      stone: new THREE.MeshStandardMaterial({ map: stoneTexture, color: 0x8f8777, roughness: 0.95, metalness: 0.02 }),
      darkStone: new THREE.MeshStandardMaterial({ map: stoneTexture, color: 0x5d584f, roughness: 0.96, metalness: 0.04 }),
      sign: new THREE.MeshStandardMaterial({ map: signTexture, color: 0x593317, roughness: 0.86, metalness: 0.02 }),
      gold: new THREE.MeshStandardMaterial({ color: 0xf0c26f, roughness: 0.32, metalness: 0.35, emissive: 0x422500, emissiveIntensity: 0.08 }),
      iron: new THREE.MeshStandardMaterial({ color: 0x4f4b45, roughness: 0.64, metalness: 0.52 }),
      coal: new THREE.MeshStandardMaterial({ color: 0x1d1b17, roughness: 0.82, metalness: 0.12 }),
      water: new THREE.MeshPhysicalMaterial({ color: 0x3faec4, roughness: 0.2, metalness: 0.04, transparent: true, opacity: 0.72, emissive: 0x0f6a7d, emissiveIntensity: 0.12 }),
      glass: new THREE.MeshPhysicalMaterial({ color: 0xeed08b, roughness: 0.08, metalness: 0.16, transparent: true, opacity: 0.48, emissive: 0xffc566, emissiveIntensity: 0.18 })
    };
  }

  makeTexture(size, painter) {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext('2d');
    painter(ctx, size);
    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
  }

  makeCobblestoneTexture() {
    return this.makeTexture(512, (ctx, size) => {
      ctx.fillStyle = '#7d7464';
      ctx.fillRect(0, 0, size, size);
      for (let y = 0; y < size; y += 64) {
        for (let x = -40; x < size; x += 78) {
          const offset = (y / 64) % 2 ? 38 : 0;
          const w = 58 + ((x + y) % 19);
          const h = 42 + ((x * 3 + y) % 14);
          ctx.fillStyle = ['#918878', '#756c5e', '#a19783', '#685f54'][(x + y + 400) % 4];
          this.roundRect(ctx, x + offset + 5, y + 10, w, h, 14);
          ctx.fill();
          ctx.strokeStyle = 'rgba(37,28,20,.38)';
          ctx.lineWidth = 4;
          ctx.stroke();
        }
      }
      ctx.fillStyle = 'rgba(83,111,58,.22)';
      for (let i = 0; i < 70; i++) ctx.fillRect(Math.random() * size, Math.random() * size, 6 + Math.random() * 16, 2 + Math.random() * 5);
    });
  }

  makeStoneTexture() {
    return this.makeTexture(512, (ctx, size) => {
      ctx.fillStyle = '#8f826d';
      ctx.fillRect(0, 0, size, size);
      for (let y = 0; y < size; y += 54) {
        for (let x = -30; x < size; x += 96) {
          const offset = (y / 54) % 2 ? 45 : 0;
          ctx.fillStyle = ['#9a8d77', '#736b5f', '#aa9a7d', '#817664'][(x + y + 200) % 4];
          ctx.fillRect(x + offset, y + 4, 88, 44);
          ctx.strokeStyle = 'rgba(41,34,27,.34)';
          ctx.lineWidth = 5;
          ctx.strokeRect(x + offset, y + 4, 88, 44);
        }
      }
      ctx.fillStyle = 'rgba(89,118,64,.18)';
      for (let i = 0; i < 90; i++) ctx.fillRect(Math.random() * size, Math.random() * size, 4 + Math.random() * 12, 2);
    });
  }

  makeRoofTileTexture() {
    return this.makeTexture(512, (ctx, size) => {
      ctx.fillStyle = '#642d24';
      ctx.fillRect(0, 0, size, size);
      for (let y = 0; y < size; y += 42) {
        for (let x = 0; x < size; x += 46) {
          ctx.fillStyle = ['#78392a', '#55271f', '#8a4a31'][(x + y) % 3];
          ctx.beginPath();
          ctx.ellipse(x + 23, y + 24, 25, 19, 0, Math.PI, 0);
          ctx.fill();
          ctx.strokeStyle = 'rgba(35,13,10,.32)';
          ctx.stroke();
        }
      }
      ctx.fillStyle = 'rgba(93,125,72,.22)';
      for (let i = 0; i < 45; i++) ctx.fillRect(Math.random() * size, Math.random() * size, 12 + Math.random() * 20, 3 + Math.random() * 5);
    });
  }

  makeWoodTexture() {
    return this.makeTexture(512, (ctx, size) => {
      const grad = ctx.createLinearGradient(0, 0, size, 0);
      grad.addColorStop(0, '#6b3f1f');
      grad.addColorStop(0.5, '#a46735');
      grad.addColorStop(1, '#4f2c16');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, size, size);
      ctx.strokeStyle = 'rgba(37,18,7,.42)';
      ctx.lineWidth = 5;
      for (let y = 0; y < size; y += 58) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.bezierCurveTo(140, y + 18, 260, y - 14, size, y + 10);
        ctx.stroke();
      }
      ctx.fillStyle = 'rgba(35,15,6,.35)';
      for (let i = 0; i < 30; i++) {
        ctx.beginPath();
        ctx.ellipse(Math.random() * size, Math.random() * size, 14, 6, Math.random() * Math.PI, 0, Math.PI * 2);
        ctx.fill();
      }
    });
  }

  makeBarkTexture() {
    return this.makeTexture(512, (ctx, size) => {
      ctx.fillStyle = '#4d311c';
      ctx.fillRect(0, 0, size, size);
      for (let x = 0; x < size; x += 28) {
        ctx.strokeStyle = ['#2d1c10', '#6a4428', '#795337'][x % 3];
        ctx.lineWidth = 10 + (x % 17);
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.bezierCurveTo(x + 22, 120, x - 26, 260, x + 11, size);
        ctx.stroke();
      }
    });
  }

  makeGrassTexture() {
    return this.makeTexture(512, (ctx, size) => {
      ctx.fillStyle = '#617f3e';
      ctx.fillRect(0, 0, size, size);
      for (let i = 0; i < 900; i++) {
        ctx.fillStyle = Math.random() > 0.5 ? 'rgba(88,116,52,.55)' : 'rgba(161,139,72,.22)';
        ctx.fillRect(Math.random() * size, Math.random() * size, 2 + Math.random() * 5, 1 + Math.random() * 8);
      }
    });
  }

  makeParchmentTexture() {
    return this.makeTexture(512, (ctx, size) => {
      ctx.fillStyle = '#5d371b';
      ctx.fillRect(0, 0, size, size);
      ctx.strokeStyle = '#f0c26f';
      ctx.lineWidth = 22;
      ctx.strokeRect(28, 28, size - 56, size - 56);
      ctx.strokeStyle = 'rgba(247,226,184,.22)';
      ctx.lineWidth = 2;
      for (let y = 75; y < size - 60; y += 35) {
        ctx.beginPath();
        ctx.moveTo(60, y);
        ctx.lineTo(size - 60, y + Math.sin(y) * 8);
        ctx.stroke();
      }
    });
  }

  roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  init() {
    const hemi = new THREE.HemisphereLight(0xfff3d0, 0x3d4b2f, 1.08);
    this.scene.add(hemi);
    const sun = new THREE.DirectionalLight(0xffdd98, 2.55);
    sun.position.set(-720, 1080, 520);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    sun.shadow.camera.left = -1900;
    sun.shadow.camera.right = 1900;
    sun.shadow.camera.top = 1900;
    sun.shadow.camera.bottom = -1900;
    this.scene.add(sun);
    const warm = new THREE.DirectionalLight(0xff8f3d, 0.62);
    warm.position.set(900, 420, -720);
    this.scene.add(warm);
    this.makeSky();
    this.makeTerrain();
    this.makeRoads();
    this.makeRiver();
    this.makeCommons();
    this.makeRealmBuildings();
    this.makeTablets();
    this.makeContactTower();
    this.makeTreesAndFences();
    this.makeVillageProps();
    this.makeParticles();
  }

  terrainHeight(x, z) {
    return Math.sin(x * 0.004) * 7 + Math.cos(z * 0.005) * 6 + Math.sin((x + z) * 0.002) * 8 - 8;
  }

  makeSky() {
    const dome = new THREE.Mesh(new THREE.SphereGeometry(3100, 48, 24), new THREE.MeshBasicMaterial({ color: 0xb8d7df, side: THREE.BackSide }));
    this.scene.add(dome);
    const sun = new THREE.Mesh(new THREE.SphereGeometry(90, 32, 16), new THREE.MeshBasicMaterial({ color: 0xffd47d }));
    sun.position.set(-820, 850, -680);
    this.scene.add(sun);
    const cloudMat = new THREE.MeshBasicMaterial({ color: 0xfff2d2, transparent: true, opacity: 0.42 });
    for (let i = 0; i < 16; i++) {
      const cloud = new THREE.Group();
      cloud.position.set(-1500 + i * 210, 720 + Math.sin(i) * 70, -960 + (i % 5) * 120);
      for (let j = 0; j < 4; j++) {
        const puff = new THREE.Mesh(new THREE.SphereGeometry(48 + j * 9, 16, 8), cloudMat);
        puff.scale.set(1.8, 0.32, 0.65);
        puff.position.x = j * 52;
        cloud.add(puff);
      }
      this.scene.add(cloud);
    }
  }

  makeTerrain() {
    const geo = new THREE.PlaneGeometry(3400, 3400, 140, 140);
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getY(i);
      pos.setZ(i, this.terrainHeight(x, z));
    }
    geo.computeVertexNormals();
    const mesh = new THREE.Mesh(geo, this.materials.grass);
    mesh.rotation.x = -Math.PI / 2;
    mesh.receiveShadow = true;
    mesh.userData.assetStyle = ASSET_STYLE.forestFloor;
    this.markInteractable(mesh, { type: 'terrain', id: 'meadow', label: 'Jeff Barnes Commons Meadow' });
    this.world.add(mesh);
  }

  makeRoads() {
    const center = new THREE.Mesh(new THREE.CylinderGeometry(210, 235, 7, 64), this.materials.path);
    center.position.set(0, this.terrainHeight(0, 260) + 2, 260);
    center.receiveShadow = true;
    center.userData.assetStyle = ASSET_STYLE.cobblestone;
    this.markInteractable(center, { type: 'ruin', id: 'village-square', label: 'Cobblestone Village Square' });
    this.world.add(center);

    const fountain = new THREE.Group();
    fountain.position.set(0, this.terrainHeight(0, 260) + 8, 260);
    const bowl = new THREE.Mesh(new THREE.TorusGeometry(58, 8, 12, 48), this.materials.stone);
    bowl.rotation.x = Math.PI / 2;
    const basin = new THREE.Mesh(new THREE.CylinderGeometry(52, 62, 18, 48), this.materials.stone);
    const water = new THREE.Mesh(new THREE.CylinderGeometry(44, 48, 4, 48), this.materials.water);
    water.position.y = 10;
    fountain.add(basin, bowl, water);
    this.world.add(fountain);

    realms.forEach((realm) => this.addRoadTo(realm.x, realm.z));
  }

  addRoadTo(x, z) {
    const len = Math.hypot(x, z - 260);
    const midX = x / 2;
    const midZ = (z + 260) / 2;
    const road = new THREE.Mesh(new THREE.BoxGeometry(68, 5, len), this.materials.path);
    road.position.set(midX, this.terrainHeight(midX, midZ) + 3, midZ);
    road.rotation.y = Math.atan2(x, z - 260);
    road.receiveShadow = true;
    road.userData.assetStyle = ASSET_STYLE.cobblestone;
    this.markInteractable(road, { type: 'ruin', id: `road-${Math.round(x)}-${Math.round(z)}`, label: 'Cobblestone village road' });
    this.world.add(road);

    const edgeMat = this.materials.stone;
    [-42, 42].forEach((offset) => {
      const curb = new THREE.Mesh(new THREE.BoxGeometry(8, 8, len), edgeMat);
      curb.position.set(midX + Math.cos(road.rotation.y) * offset, this.terrainHeight(midX, midZ) + 8, midZ - Math.sin(road.rotation.y) * offset);
      curb.rotation.y = road.rotation.y;
      curb.receiveShadow = true;
      this.world.add(curb);
    });
  }

  makeRiver() {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-920, 2, 690), new THREE.Vector3(-620, 3, 440), new THREE.Vector3(-300, 2, 220),
      new THREE.Vector3(-60, 4, 130), new THREE.Vector3(230, 2, -100), new THREE.Vector3(540, 3, -340), new THREE.Vector3(900, 2, -630)
    ]);
    this.river = new THREE.Mesh(new THREE.TubeGeometry(curve, 160, 18, 18, false), this.materials.water);
    this.markInteractable(this.river, { type: 'river', id: 'mill-river', label: 'Mill River' });
    this.world.add(this.river);
    this.riverLight = new THREE.PointLight(0x87d8ee, 1.25, 650);
    this.riverLight.position.set(-120, 80, 140);
    this.world.add(this.riverLight);
    this.addBridge(-70, 150, -0.75);
    this.addBridge(510, -330, -0.75);
  }

  addBridge(x, z, rotation = 0) {
    const group = new THREE.Group();
    group.position.set(x, this.terrainHeight(x, z) + 20, z);
    group.rotation.y = rotation;
    const deck = new THREE.Mesh(new THREE.BoxGeometry(180, 18, 54), this.materials.wood);
    deck.castShadow = deck.receiveShadow = true;
    group.add(deck);
    [-78, 78].forEach((dx) => {
      const rail = new THREE.Mesh(new THREE.BoxGeometry(14, 48, 58), this.materials.wood);
      rail.position.set(dx, 24, 0);
      rail.castShadow = true;
      group.add(rail);
    });
    this.markInteractable(deck, { type: 'ruin', id: `bridge-${x}`, label: 'Timber bridge over the data river' });
    this.world.add(group);
  }

  makeCommons() {
    const gate = this.makeCastleGate(0, 330, 'The Great Gate', 'Portfolio village entrance', 1);
    this.markInteractable(gate, { type: 'artifact', id: 'commons-map', label: 'The Great Gate / Commons Map' });
    const mapBoard = this.makeSignBoard('Village Map', 'Jeff Barnes Commons', 0, 155, 315, 1.15);
    this.markInteractable(mapBoard, { type: 'artifact', id: 'commons-map', label: 'Commons Map' });
    const welcome = this.makeSignBoard('Welcome', 'Meet Jeff • Read Resume • Explore Work', 0, 130, 500, 1.0);
    this.markInteractable(welcome, { type: 'artifact', id: 'about-jeff', label: 'About Jeff Barnes' });
  }

  makeRealmBuildings() {
    for (const realm of realms) {
      const group = new THREE.Group();
      group.position.set(realm.x, this.terrainHeight(realm.x, realm.z), realm.z);
      group.lookAt(0, group.position.y, 260);
      const color = new THREE.Color(realm.color);
      const buildType = REALM_BUILD_TYPES[realm.id] || 'hall';
      const { base, roof } = this.addVillageBuilding(group, buildType, color, realm);
      const lantern = new THREE.PointLight(color, 1.55, 300);
      lantern.position.set(0, 124, -108);
      group.add(lantern);

      this.makeArtifactRing(group, realm, color);
      this.world.add(group);

      const sign = this.makeSignBoard(realm.name, realm.plain, realm.x, 145, realm.z - 135, 0.86);
      this.markInteractable(sign, { type: 'portal', id: realm.id, label: realm.name });
      this.realmObjects.set(realm.id, { group, realm, light: lantern, roof, base, sign });
      this.assetAnchors.set(`realm:${realm.id}`, group);
    }
  }

  addVillageBuilding(group, buildType, color, realm) {
    const size = {
      hall: [220, 116, 170],
      grandHall: [260, 132, 190],
      scribeHouse: [210, 120, 175],
      forge: [230, 112, 180],
      workshop: [220, 118, 185],
      sanctuary: [245, 124, 190],
      library: [245, 138, 180],
      marketWorkshop: [230, 112, 210]
    }[buildType] || [220, 116, 170];

    const baseMat = buildType === 'forge' ? this.materials.darkStone : this.materials.plaster;
    const base = new THREE.Mesh(new THREE.BoxGeometry(size[0], size[1], size[2]), baseMat);
    base.position.y = size[1] / 2;
    base.userData.assetStyle = `${ASSET_STYLE.villageKit}; walls accented with ${ASSET_STYLE.sandstone}`;
    this.markInteractable(base, { type: 'portal', id: realm.id, label: realm.name });

    const roof = new THREE.Mesh(new THREE.ConeGeometry(size[0] * 0.72, 96, 4), this.materials.roof);
    roof.position.y = size[1] + 50;
    roof.rotation.y = Math.PI / 4;
    roof.scale.z = size[2] / size[0];
    roof.userData.assetStyle = ASSET_STYLE.slateRoof;
    this.markInteractable(roof, { type: 'portal', id: realm.id, label: realm.name });

    const door = new THREE.Mesh(new THREE.BoxGeometry(48, 76, 10), this.materials.wood);
    door.position.set(0, 43, -size[2] / 2 - 5);
    this.markInteractable(door, { type: 'portal', id: realm.id, label: realm.name });

    const windows = [];
    [-72, 72].forEach((x) => {
      const w = new THREE.Mesh(new THREE.BoxGeometry(34, 36, 9), this.materials.glass);
      w.position.set(x, 78, -size[2] / 2 - 5);
      windows.push(w);
      this.markInteractable(w, { type: 'portal', id: realm.id, label: realm.name });
    });

    const trim = new THREE.Mesh(new THREE.BoxGeometry(size[0] + 10, 14, 12), this.materials.wood);
    trim.position.set(0, size[1] + 3, -size[2] / 2 - 6);

    const accent = new THREE.Mesh(new THREE.TorusGeometry(34, 3.5, 8, 48), new THREE.MeshStandardMaterial({ color, roughness: 0.35, metalness: 0.16, emissive: color, emissiveIntensity: 0.24 }));
    accent.position.set(0, size[1] + 12, -size[2] / 2 - 13);

    [base, roof, door, trim, accent, ...windows].forEach((part) => {
      part.castShadow = true;
      part.receiveShadow = true;
      group.add(part);
    });

    if (buildType === 'forge') this.addForgeDetails(group, size, realm);
    if (buildType === 'library') this.addLibraryDetails(group, size, realm);
    if (buildType === 'workshop' || buildType === 'marketWorkshop') this.addWorkshopDetails(group, size, realm);
    if (buildType === 'sanctuary') this.addSanctuaryDetails(group, size, realm);
    if (buildType === 'scribeHouse') this.addScribeHouseDetails(group, size, realm);
    if (buildType === 'grandHall') this.addBannerPair(group, size, realm);

    return { base, roof };
  }

  addForgeDetails(group, size, realm) {
    const chimney = new THREE.Mesh(new THREE.BoxGeometry(46, 128, 40), this.materials.darkStone);
    chimney.position.set(size[0] * 0.32, size[1] + 58, size[2] * 0.18);
    const glow = new THREE.PointLight(0xff7a2e, 2.2, 260);
    glow.position.set(0, 62, -size[2] / 2 - 28);
    const anvil = new THREE.Mesh(new THREE.BoxGeometry(72, 22, 38), this.materials.iron);
    anvil.position.set(-78, 24, -size[2] / 2 - 64);
    [chimney, anvil].forEach((part) => {
      part.castShadow = true;
      this.markInteractable(part, { type: 'portal', id: realm.id, label: realm.name });
      group.add(part);
    });
    group.add(glow);
  }

  addLibraryDetails(group, size, realm) {
    for (let i = -1; i <= 1; i++) {
      const shelf = new THREE.Mesh(new THREE.BoxGeometry(38, 84, 12), this.materials.wood);
      shelf.position.set(i * 62, 78, -size[2] / 2 - 11);
      this.markInteractable(shelf, { type: 'portal', id: realm.id, label: realm.name });
      group.add(shelf);
    }
  }

  addWorkshopDetails(group, size, realm) {
    const bench = new THREE.Mesh(new THREE.BoxGeometry(115, 28, 42), this.materials.wood);
    bench.position.set(80, 28, -size[2] / 2 - 70);
    const canopy = new THREE.Mesh(new THREE.ConeGeometry(72, 42, 4), this.materials.roof);
    canopy.position.set(-105, 96, -size[2] / 2 - 40);
    canopy.rotation.y = Math.PI / 4;
    [bench, canopy].forEach((part) => {
      part.castShadow = true;
      this.markInteractable(part, { type: 'portal', id: realm.id, label: realm.name });
      group.add(part);
    });
  }

  addSanctuaryDetails(group, size, realm) {
    const crossBar = new THREE.Mesh(new THREE.BoxGeometry(20, 132, 16), this.materials.stone);
    crossBar.position.set(0, size[1] + 42, -size[2] / 2 - 12);
    const lintel = new THREE.Mesh(new THREE.BoxGeometry(84, 20, 16), this.materials.stone);
    lintel.position.set(0, size[1] + 84, -size[2] / 2 - 12);
    [crossBar, lintel].forEach((part) => {
      part.castShadow = true;
      this.markInteractable(part, { type: 'portal', id: realm.id, label: realm.name });
      group.add(part);
    });
  }

  addScribeHouseDetails(group, size, realm) {
    const scroll = new THREE.Mesh(new THREE.CylinderGeometry(12, 12, 90, 16), this.materials.gold);
    scroll.rotation.z = Math.PI / 2;
    scroll.position.set(0, size[1] + 5, -size[2] / 2 - 18);
    this.markInteractable(scroll, { type: 'portal', id: realm.id, label: realm.name });
    group.add(scroll);
  }

  addBannerPair(group, size, realm) {
    [-95, 95].forEach((x) => {
      const banner = new THREE.Mesh(new THREE.BoxGeometry(28, 92, 5), new THREE.MeshStandardMaterial({ color: 0xb83328, roughness: 0.72, metalness: 0.02 }));
      banner.position.set(x, 82, -size[2] / 2 - 12);
      this.markInteractable(banner, { type: 'portal', id: realm.id, label: realm.name });
      group.add(banner);
    });
  }

  makeArtifactRing(group, realm, color) {
    realm.artifacts.forEach((artifactId, i) => {
      const angle = (i / realm.artifacts.length) * Math.PI * 2 + 0.42;
      const artifactGroup = new THREE.Group();
      artifactGroup.position.set(Math.cos(angle) * 168, 36, Math.sin(angle) * 148);
      const pedestal = new THREE.Mesh(new THREE.CylinderGeometry(26, 38, 30, 8), this.materials.stone);
      pedestal.position.y = -12;
      const core = new THREE.Mesh(this.artifactGeometryFor(artifactId), new THREE.MeshStandardMaterial({ color, roughness: 0.38, metalness: 0.18, emissive: color, emissiveIntensity: 0.18 }));
      const halo = new THREE.Mesh(new THREE.TorusGeometry(32, 2.2, 8, 48), this.materials.gold);
      halo.rotation.x = Math.PI / 2;
      [pedestal, core, halo].forEach((part) => { part.castShadow = true; this.markInteractable(part, { type: 'artifact', id: artifactId, label: artifacts[artifactId]?.title || artifactId }); });
      artifactGroup.add(pedestal, core, halo);
      group.add(artifactGroup);
      this.artifactObjects.set(artifactId, { group: artifactGroup, mesh: core, halo, realm, worldX: realm.x + artifactGroup.position.x, worldZ: realm.z + artifactGroup.position.z });
      this.assetAnchors.set(`artifact:${artifactId}`, artifactGroup);
    });
  }

  artifactGeometryFor(id) {
    if (id.includes('map') || id.includes('lens')) return new THREE.IcosahedronGeometry(20, 1);
    if (id.includes('hammer') || id.includes('bell')) return new THREE.CylinderGeometry(12, 18, 46, 8);
    if (id.includes('table') || id.includes('ledger')) return new THREE.BoxGeometry(44, 14, 36);
    if (id.includes('lantern') || id.includes('globe') || id.includes('oracle')) return new THREE.SphereGeometry(22, 24, 16);
    if (id.includes('resume') || id.includes('scroll')) return new THREE.CylinderGeometry(14, 14, 52, 16);
    return new THREE.DodecahedronGeometry(22, 0);
  }

  makeTablets() {
    tablets.forEach((text, i) => {
      const angle = (i / tablets.length) * Math.PI * 2;
      const radius = 1020 + (i % 2) * 60;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const sign = this.makeSignBoard(`Tablet ${i + 1}`, text, x, 96, z, 0.55);
      this.markInteractable(sign, { type: 'tablet', id: String(i), label: `Leadership Tablet ${i + 1}` });
      this.tabletObjects.push({ mesh: sign, text, index: i, x, z });
    });
  }

  makeContactTower() {
    this.vault = new THREE.Group();
    this.vault.position.set(0, this.terrainHeight(0, 850), 850);
    const tower = new THREE.Mesh(new THREE.CylinderGeometry(76, 98, 250, 18), this.materials.stone);
    tower.position.y = 125;
    const battlements = new THREE.Group();
    for (let i = 0; i < 12; i++) {
      const block = new THREE.Mesh(new THREE.BoxGeometry(18, 28, 24), this.materials.stone);
      const angle = (i / 12) * Math.PI * 2;
      block.position.set(Math.cos(angle) * 78, 252, Math.sin(angle) * 78);
      block.rotation.y = -angle;
      battlements.add(block);
    }
    const roof = new THREE.Mesh(new THREE.ConeGeometry(98, 88, 16), this.materials.roof);
    roof.position.y = 318;
    const door = new THREE.Mesh(new THREE.BoxGeometry(48, 88, 10), this.materials.wood);
    door.position.set(0, 54, -78);
    [tower, roof, door, battlements].forEach((part) => { part.castShadow = true; this.markInteractable(part, { type: 'vault', id: 'contact-tower', label: 'Contact Tower' }); this.vault.add(part); });
    this.vaultLight = new THREE.PointLight(0xf0c26f, 2.6, 560);
    this.vaultLight.position.y = 190;
    this.vault.add(this.vaultLight);
    this.world.add(this.vault);
    const sign = this.makeSignBoard('Contact Tower', 'Email • LinkedIn • Trust Gate', 0, 128, 710, 0.9);
    this.markInteractable(sign, { type: 'vault', id: 'contact-tower', label: 'Contact Tower' });
    this.assetAnchors.set('vault', this.vault);
  }

  makeCastleGate(x, z, title, label, scale = 1) {
    const group = new THREE.Group();
    group.position.set(x, this.terrainHeight(x, z), z);
    group.lookAt(0, group.position.y, 260);
    const left = this.makeTower(-150 * scale, 0, 0, scale);
    const right = this.makeTower(150 * scale, 0, 0, scale);
    const arch = new THREE.Mesh(new THREE.BoxGeometry(250 * scale, 95 * scale, 58 * scale), this.materials.stone);
    arch.position.y = 145 * scale;
    const portcullis = new THREE.Mesh(new THREE.BoxGeometry(118 * scale, 112 * scale, 10 * scale), this.materials.iron);
    portcullis.position.set(0, 70 * scale, -32 * scale);
    const plaque = this.makeTextSprite(title, label, 0.72 * scale);
    plaque.position.set(0, 168 * scale, -44 * scale);
    [arch, portcullis].forEach((part) => { part.castShadow = true; part.receiveShadow = true; });
    group.add(left, right, arch, portcullis, plaque);
    this.world.add(group);
    return arch;
  }

  makeTower(x, y, z, scale = 1) {
    const group = new THREE.Group();
    group.position.set(x, y, z);
    const tower = new THREE.Mesh(new THREE.CylinderGeometry(46 * scale, 58 * scale, 210 * scale, 12), this.materials.stone);
    tower.position.y = 105 * scale;
    const roof = new THREE.Mesh(new THREE.ConeGeometry(62 * scale, 72 * scale, 12), this.materials.roof);
    roof.position.y = 246 * scale;
    [tower, roof].forEach((part) => { part.castShadow = true; part.receiveShadow = true; });
    group.add(tower, roof);
    return group;
  }

  makeTreesAndFences() {
    const positions = [];
    for (let i = 0; i < 150; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 420 + Math.random() * 1180;
      positions.push([Math.cos(angle) * radius, Math.sin(angle) * radius, i]);
    }
    positions.forEach(([x, z, i]) => {
      if (Math.abs(x) < 180 && Math.abs(z - 260) < 260) return;
      const y = this.terrainHeight(x, z);
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(8, 14, 64, 8), this.materials.bark);
      trunk.position.set(x, y + 32, z);
      const isPine = i % 3 !== 0;
      const crown = isPine
        ? new THREE.Mesh(new THREE.ConeGeometry(44 + Math.random() * 22, 108 + Math.random() * 46, 10), new THREE.MeshStandardMaterial({ color: 0x2f5b2e, roughness: 0.92 }))
        : new THREE.Mesh(new THREE.SphereGeometry(50 + Math.random() * 20, 14, 10), new THREE.MeshStandardMaterial({ color: 0x3f6b30, roughness: 0.94 }));
      crown.position.set(x, y + (isPine ? 106 : 94), z);
      trunk.castShadow = crown.castShadow = true;
      this.markInteractable(trunk, { type: 'ruin', id: `tree-${i}`, label: isPine ? 'Pine from Kenney Nature Kit style' : 'Old oak from Kenney Nature Kit style' });
      this.world.add(trunk, crown);
    });

    realms.forEach((realm) => this.addFenceArc(realm.x, realm.z, 245));
  }

  addFenceArc(cx, cz, radius) {
    for (let i = 0; i < 9; i++) {
      const angle = -0.8 + i * 0.2;
      const x = cx + Math.cos(angle) * radius;
      const z = cz + Math.sin(angle) * radius;
      const y = this.terrainHeight(x, z) + 20;
      const post = new THREE.Mesh(new THREE.BoxGeometry(10, 40, 10), this.materials.wood);
      post.position.set(x, y, z);
      post.rotation.y = angle;
      post.castShadow = true;
      this.world.add(post);
      if (i > 0) {
        const prevAngle = -0.8 + (i - 1) * 0.2;
        const px = cx + Math.cos(prevAngle) * radius;
        const pz = cz + Math.sin(prevAngle) * radius;
        const mx = (x + px) / 2;
        const mz = (z + pz) / 2;
        const railLen = Math.hypot(x - px, z - pz);
        const rail = new THREE.Mesh(new THREE.BoxGeometry(railLen, 8, 8), this.materials.wood);
        rail.position.set(mx, this.terrainHeight(mx, mz) + 28, mz);
        rail.rotation.y = -Math.atan2(z - pz, x - px);
        rail.castShadow = true;
        this.world.add(rail);
      }
    }
  }

  makeVillageProps() {
    const propSpots = [
      [-120, 420, 'cart'], [150, 420, 'barrels'], [-260, 230, 'lamp'], [260, 250, 'lamp'],
      [-500, 420, 'well'], [510, 410, 'crate'], [-120, -150, 'barrels'], [360, -250, 'lamp'],
      [-850, -450, 'crate'], [760, 520, 'cart']
    ];
    propSpots.forEach(([x, z, type], i) => {
      const y = this.terrainHeight(x, z);
      if (type === 'lamp') this.addLampPost(x, y, z, i);
      if (type === 'barrels') this.addBarrels(x, y, z, i);
      if (type === 'crate') this.addCrates(x, y, z, i);
      if (type === 'cart') this.addMarketCart(x, y, z, i);
      if (type === 'well') this.addWell(x, y, z, i);
    });
  }

  addLampPost(x, y, z, i) {
    const group = new THREE.Group();
    group.position.set(x, y, z);
    const post = new THREE.Mesh(new THREE.CylinderGeometry(5, 7, 96, 8), this.materials.wood);
    post.position.y = 48;
    const lamp = new THREE.Mesh(new THREE.BoxGeometry(22, 28, 22), this.materials.glass);
    lamp.position.y = 106;
    const light = new THREE.PointLight(0xffd68a, 1.35, 210);
    light.position.y = 106;
    group.add(post, lamp, light);
    this.markInteractable(lamp, { type: 'ruin', id: `lamp-${i}`, label: 'Village lamp post' });
    this.world.add(group);
  }

  addBarrels(x, y, z, i) {
    const group = new THREE.Group();
    group.position.set(x, y + 20, z);
    for (let j = 0; j < 3; j++) {
      const barrel = new THREE.Mesh(new THREE.CylinderGeometry(18, 20, 38, 12), this.materials.wood);
      barrel.position.set(j * 26 - 20, 0, (j % 2) * 20);
      barrel.rotation.z = Math.PI / 2;
      barrel.castShadow = true;
      this.markInteractable(barrel, { type: 'ruin', id: `barrel-${i}-${j}`, label: 'Market barrel' });
      group.add(barrel);
    }
    this.world.add(group);
  }

  addCrates(x, y, z, i) {
    const group = new THREE.Group();
    group.position.set(x, y + 20, z);
    for (let j = 0; j < 3; j++) {
      const crate = new THREE.Mesh(new THREE.BoxGeometry(34, 34, 34), this.materials.wood);
      crate.position.set(j * 34 - 32, j === 1 ? 18 : 0, (j % 2) * 25);
      crate.castShadow = true;
      this.markInteractable(crate, { type: 'ruin', id: `crate-${i}-${j}`, label: 'Workshop crate' });
      group.add(crate);
    }
    this.world.add(group);
  }

  addMarketCart(x, y, z, i) {
    const group = new THREE.Group();
    group.position.set(x, y + 32, z);
    group.rotation.y = i % 2 ? 0.4 : -0.35;
    const bed = new THREE.Mesh(new THREE.BoxGeometry(82, 24, 48), this.materials.wood);
    const canopy = new THREE.Mesh(new THREE.ConeGeometry(56, 34, 4), this.materials.roof);
    canopy.position.y = 48;
    canopy.rotation.y = Math.PI / 4;
    [-34, 34].forEach((wx) => {
      const wheel = new THREE.Mesh(new THREE.TorusGeometry(14, 4, 8, 16), this.materials.iron);
      wheel.rotation.y = Math.PI / 2;
      wheel.position.set(wx, -16, 28);
      group.add(wheel);
    });
    [bed, canopy].forEach((part) => { part.castShadow = true; group.add(part); });
    this.markInteractable(bed, { type: 'ruin', id: `cart-${i}`, label: 'Market cart' });
    this.world.add(group);
  }

  addWell(x, y, z, i) {
    const group = new THREE.Group();
    group.position.set(x, y + 20, z);
    const wall = new THREE.Mesh(new THREE.CylinderGeometry(44, 48, 42, 16, 1, true), this.materials.stone);
    const roof = new THREE.Mesh(new THREE.ConeGeometry(66, 46, 4), this.materials.roof);
    roof.position.y = 82;
    roof.rotation.y = Math.PI / 4;
    [wall, roof].forEach((part) => { part.castShadow = true; group.add(part); });
    this.markInteractable(wall, { type: 'ruin', id: `well-${i}`, label: 'Village well' });
    this.world.add(group);
  }

  makeParticles() {
    const geo = new THREE.BufferGeometry();
    const positions = [];
    for (let i = 0; i < 480; i++) positions.push((Math.random() - 0.5) * 2500, 40 + Math.random() * 320, (Math.random() - 0.5) * 2500);
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    this.particles = new THREE.Points(geo, new THREE.PointsMaterial({ color: 0xffe2a3, size: 2.4, transparent: true, opacity: 0.32 }));
    this.scene.add(this.particles);
  }

  makeSignBoard(title, subtitle, x, y, z, scale = 1) {
    const group = new THREE.Group();
    group.position.set(x, this.terrainHeight(x, z) + y, z);
    const postL = new THREE.Mesh(new THREE.BoxGeometry(8, 105 * scale, 8), this.materials.wood);
    const postR = postL.clone();
    postL.position.set(-70 * scale, -42 * scale, 0);
    postR.position.set(70 * scale, -42 * scale, 0);
    const board = new THREE.Mesh(new THREE.BoxGeometry(180 * scale, 62 * scale, 8), this.materials.sign);
    const topTrim = new THREE.Mesh(new THREE.BoxGeometry(196 * scale, 8 * scale, 12), this.materials.gold);
    topTrim.position.y = 36 * scale;
    const label = this.makeTextSprite(title, subtitle, scale);
    label.position.set(0, 6 * scale, -10);
    group.add(postL, postR, board, topTrim, label);
    group.lookAt(0, group.position.y, 260);
    this.world.add(group);
    this.signs.push(group);
    return board;
  }

  makeTextSprite(title, subtitle, scale = 1) {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 384;
    const ctx = canvas.getContext('2d');
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#6a3e1e');
    gradient.addColorStop(1, '#2f1b0d');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#f0c26f';
    ctx.lineWidth = 14;
    ctx.strokeRect(24, 24, canvas.width - 48, canvas.height - 48);
    ctx.strokeStyle = 'rgba(247,226,184,.45)';
    ctx.lineWidth = 2;
    ctx.strokeRect(48, 48, canvas.width - 96, canvas.height - 96);
    ctx.fillStyle = '#f7ddb0';
    ctx.font = '700 58px Georgia';
    ctx.textAlign = 'center';
    ctx.fillText(title, 512, 145);
    ctx.fillStyle = 'rgba(247,221,176,.82)';
    ctx.font = '500 30px Georgia';
    this.wrapText(ctx, subtitle || '', 512, 210, 850, 42);
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, transparent: true }));
    sprite.scale.set(180 * scale, 68 * scale, 1);
    return sprite;
  }

  wrapText(ctx, text, x, y, maxWidth, lineHeight) {
    const words = String(text).split(' ');
    let line = '';
    for (const word of words) {
      const test = `${line}${word} `;
      if (ctx.measureText(test).width > maxWidth && line) {
        ctx.fillText(line, x, y);
        line = `${word} `;
        y += lineHeight;
      } else line = test;
    }
    ctx.fillText(line, x, y);
  }

  markInteractable(object, userData) {
    object.userData.interaction = userData;
    this.interactables.push(object);
  }

  getFocusedInteraction(player, maxDistance = 760) {
    this.raycaster.setFromCamera(this.center, this.camera);
    this.raycaster.far = maxDistance;
    const hits = this.raycaster.intersectObjects(this.interactables, false);
    const meaningful = hits.find((item) => item.object?.userData?.interaction && item.distance <= maxDistance);
    if (!meaningful) return null;
    return { object: meaningful.object, distance: meaningful.distance, userData: meaningful.object.userData.interaction };
  }

  registerAssetAnchor(key, object3d) { this.assetAnchors.set(key, object3d); }
  getAssetAnchor(key) { return this.assetAnchors.get(key) || null; }
  async loadGltfAsset(key, url, loader) {
    const anchor = this.getAssetAnchor(key);
    if (!anchor || !loader || !url) return null;
    const gltf = await loader.loadAsync(url);
    anchor.add(gltf.scene);
    return gltf.scene;
  }

  update({ player, activeRealm, discoveredArtifacts, repositories, cameraBeat }) {
    const t = this.clock.getElapsedTime();
    const moving = Math.abs(player.vx) + Math.abs(player.vz) > 3;
    const bob = moving ? Math.sin(player.headBob) * 2.0 : 0;
    const height = this.terrainHeight(player.x, player.z) + 62 + bob;
    this.camera.fov += ((player.fov || 66) - this.camera.fov) * 0.16;
    this.camera.updateProjectionMatrix();
    if (cameraBeat?.active?.id === 'arrival') {
      const cinematic = Math.sin(cameraBeat.progress * Math.PI);
      this.camera.position.set(player.x + 230 * cinematic, height + 115 * cinematic, player.z + 360 * cinematic);
      this.camera.lookAt(player.x, height + 28, player.z - 220);
    } else {
      this.camera.position.x += (player.x - this.camera.position.x) * 0.5;
      this.camera.position.y += (height - this.camera.position.y) * 0.5;
      this.camera.position.z += (player.z - this.camera.position.z) * 0.5;
      this.camera.rotation.y = player.yaw;
      this.camera.rotation.x = player.pitch;
      this.camera.rotation.z = 0;
    }
    for (const [id, item] of this.realmObjects.entries()) {
      const active = id === activeRealm;
      item.light.intensity += ((active ? 3.7 : 1.25) - item.light.intensity) * 0.05;
      item.roof.rotation.y = Math.PI / 4 + Math.sin(t * 0.7) * (active ? 0.015 : 0.004);
    }
    for (const [id, item] of this.artifactObjects.entries()) {
      item.mesh.rotation.x += 0.008;
      item.mesh.rotation.y += 0.014;
      item.halo.rotation.z += 0.017;
      item.group.position.y = 36 + Math.sin(t * 1.7 + item.worldX * 0.01) * 5;
      item.mesh.material.emissiveIntensity = discoveredArtifacts.includes(id) ? 0.55 : 0.18;
    }
    this.tabletObjects.forEach((tablet, i) => { tablet.mesh.rotation.y += Math.sin(t + i) * 0.0005; });
    this.vault.rotation.y = Math.sin(t * 0.28) * 0.035;
    this.vaultLight.intensity = 2.1 + Math.sin(t * 1.4) * 0.32;
    this.particles.rotation.y += 0.0005;
    this.updateRepoSatellites(repositories, t);
    this.renderer.render(this.scene, this.camera);
  }

  updateRepoSatellites(repositories, t) {
    if (!repositories) return;
    while (this.repoObjects.length < repositories.length) {
      const mesh = new THREE.Mesh(new THREE.IcosahedronGeometry(10, 0), new THREE.MeshStandardMaterial({ color: 0xffd98a, emissive: 0xffa62b, emissiveIntensity: 0.25, metalness: 0.35, roughness: 0.32 }));
      this.markInteractable(mesh, { type: 'ruin', id: `repo-signal-${this.repoObjects.length}`, label: 'Repository signal' });
      this.world.add(mesh);
      this.repoObjects.push(mesh);
    }
    repositories.forEach((repo, i) => {
      const realm = realms.find((r) => r.id === repo.realm) || realms[0];
      const mesh = this.repoObjects[i];
      const angle = t * 0.3 + i * 1.7;
      const radius = 155 + (repo.signal || 50) * 0.55;
      const y = this.terrainHeight(realm.x, realm.z) + 95 + Math.sin(t + i) * 16;
      mesh.position.set(realm.x + Math.cos(angle) * radius, y, realm.z + Math.sin(angle) * radius);
      mesh.scale.setScalar(0.8 + (repo.signal || 50) / 135);
      mesh.rotation.x += 0.02;
      mesh.rotation.y += 0.015;
    });
  }

  resize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  }
}
