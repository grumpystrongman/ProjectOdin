import * as THREE from 'three';
import { OdinScene } from './scene3d.js';
import { realms } from './content.js';

const PROXY_MATERIAL = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false });

const RIVER_PATH = [
  [-980, 650], [-690, 505], [-430, 380], [-165, 265], [80, 160], [315, 20], [565, -165], [900, -440]
];

const COMPOSITION_COTTAGES = [
  [-385, 780, 0.58, 0.82], [380, 780, -0.58, 0.82],
  [-560, 365, 0.92, 0.72], [580, 385, -0.92, 0.72],
  [-235, 720, 0.26, 0.66], [240, 720, -0.26, 0.66]
];

export class WorldPassScene extends OdinScene {
  init() {
    this.collisionBlocks = [];
    this.walkableRings = [];
    this.hoverState = { object: null, pulse: null };
    super.init();
    this.addWorldPassComposition();
    this.buildCollisionModel();
  }

  terrainHeight(x, z) {
    const base = Math.sin(x * 0.0032) * 5 + Math.cos(z * 0.004) * 4 + Math.sin((x + z) * 0.0018) * 5 - 10;
    const riverDistance = this.distanceToPolyline(x, z, RIVER_PATH);
    const riverCut = Math.max(0, 1 - riverDistance / 210);
    const squareFlatten = Math.max(0, 1 - Math.hypot(x, z - 260) / 360);
    return base - riverCut * 22 + squareFlatten * 8;
  }

  distanceToPolyline(x, z, points) {
    let best = Infinity;
    for (let i = 1; i < points.length; i++) {
      const [x1, z1] = points[i - 1];
      const [x2, z2] = points[i];
      const dx = x2 - x1;
      const dz = z2 - z1;
      const lenSq = dx * dx + dz * dz || 1;
      const t = THREE.MathUtils.clamp(((x - x1) * dx + (z - z1) * dz) / lenSq, 0, 1);
      const px = x1 + dx * t;
      const pz = z1 + dz * t;
      best = Math.min(best, Math.hypot(x - px, z - pz));
    }
    return best;
  }

  markInteractable(object, userData) {
    super.markInteractable(object, userData);
    object.userData.clickable = true;
    object.userData.baseScale = object.scale.clone();

    if (!object.geometry || userData.type === 'terrain' || userData.type === 'river' || userData.id?.startsWith('road-')) return;

    const proxy = this.makeClickProxy(object, userData);
    if (proxy) {
      object.add(proxy);
      this.interactables.push(proxy);
    }
  }

  makeClickProxy(object, userData) {
    object.geometry.computeBoundingBox?.();
    const box = object.geometry.boundingBox;
    if (!box) return null;

    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);

    const typeBoost = {
      portal: 2.7,
      artifact: 3.2,
      tablet: 3.0,
      vault: 2.6,
      galleryPost: 3.2
    }[userData.type] || 2.1;

    const proxySize = new THREE.Vector3(
      Math.max(size.x * typeBoost, 86),
      Math.max(size.y * typeBoost, 76),
      Math.max(size.z * typeBoost, 64)
    );
    const proxy = new THREE.Mesh(new THREE.BoxGeometry(proxySize.x, proxySize.y, proxySize.z), PROXY_MATERIAL);
    proxy.position.copy(center);
    proxy.userData.interaction = userData;
    proxy.userData.proxy = true;
    proxy.userData.cursor = 'pointer';
    return proxy;
  }

  getFocusedInteraction(player, maxDistance = 760) {
    this.raycaster.setFromCamera(this.center, this.camera);
    this.raycaster.far = maxDistance;
    const hits = this.raycaster.intersectObjects(this.interactables, false);
    if (!hits.length) return null;

    const ranked = hits
      .filter((item) => item.object?.userData?.interaction && item.distance <= maxDistance)
      .sort((a, b) => {
        const ai = a.object.userData.interaction;
        const bi = b.object.userData.interaction;
        const aTerrain = ai.type === 'terrain' ? 1 : 0;
        const bTerrain = bi.type === 'terrain' ? 1 : 0;
        const aProp = ai.type === 'ruin' ? 1 : 0;
        const bProp = bi.type === 'ruin' ? 1 : 0;
        const aProxy = a.object.userData.proxy ? -0.12 : 0;
        const bProxy = b.object.userData.proxy ? -0.12 : 0;
        return aTerrain - bTerrain || aProp - bProp || (a.distance + aProxy) - (b.distance + bProxy);
      });

    const meaningful = ranked[0];
    if (!meaningful) return null;
    const object = meaningful.object.userData.proxy ? meaningful.object.parent : meaningful.object;
    return { object, distance: meaningful.distance, userData: meaningful.object.userData.interaction };
  }

  getGroundPointAtCenter(maxDistance = 1800) {
    this.raycaster.setFromCamera(this.center, this.camera);
    this.raycaster.far = maxDistance;
    const terrain = this.interactables.find((object) => object.userData?.interaction?.type === 'terrain');
    if (!terrain) return null;
    const hit = this.raycaster.intersectObject(terrain, false)[0];
    if (!hit) return null;
    return { x: hit.point.x, z: hit.point.z };
  }

  makeRoads() {
    const center = new THREE.Mesh(new THREE.CylinderGeometry(245, 255, 5, 96), this.materials.path);
    center.position.set(0, this.terrainHeight(0, 260) + 3, 260);
    center.receiveShadow = true;
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

    this.addArrivalRoad();
    realms.forEach((realm) => this.addRoadTo(realm.x, realm.z));
  }

  addRoadTo(x, z) {
    const len = Math.hypot(x, z - 260);
    const midX = x / 2;
    const midZ = (z + 260) / 2;
    const road = new THREE.Mesh(new THREE.BoxGeometry(92, 4, len), this.materials.path);
    road.position.set(midX, this.terrainHeight(midX, midZ) + 3, midZ);
    road.rotation.y = Math.atan2(x, z - 260);
    road.receiveShadow = true;
    this.world.add(road);

    [-55, 55].forEach((offset) => {
      const curb = new THREE.Mesh(new THREE.BoxGeometry(7, 7, len), this.materials.stone);
      curb.position.set(midX + Math.cos(road.rotation.y) * offset, this.terrainHeight(midX, midZ) + 7, midZ - Math.sin(road.rotation.y) * offset);
      curb.rotation.y = road.rotation.y;
      curb.receiveShadow = true;
      this.world.add(curb);
    });
  }

  makeRiver() {
    const points = RIVER_PATH.map(([x, z]) => new THREE.Vector2(x, z));
    for (let i = 1; i < points.length; i++) {
      const a = points[i - 1];
      const b = points[i];
      const midX = (a.x + b.x) / 2;
      const midZ = (a.y + b.y) / 2;
      const len = Math.hypot(b.x - a.x, b.y - a.y);
      const angle = Math.atan2(b.x - a.x, b.y - a.y);
      const y = this.terrainHeight(midX, midZ) + 3;

      const water = new THREE.Mesh(new THREE.PlaneGeometry(205, len + 45, 8, 1), this.materials.water);
      water.position.set(midX, y, midZ);
      water.rotation.x = -Math.PI / 2;
      water.rotation.z = -angle;
      water.receiveShadow = true;
      this.markInteractable(water, { type: 'river', id: 'mill-river', label: 'Mill River' });
      this.world.add(water);

      [-118, 118].forEach((offset) => {
        const bank = new THREE.Mesh(new THREE.BoxGeometry(12, 8, len + 30), this.materials.stone);
        bank.position.set(midX + Math.cos(angle) * offset, y + 3, midZ - Math.sin(angle) * offset);
        bank.rotation.y = angle;
        bank.castShadow = bank.receiveShadow = true;
        this.world.add(bank);
      });
    }

    this.riverLight = new THREE.PointLight(0x87d8ee, 1.15, 620);
    this.riverLight.position.set(-120, 70, 140);
    this.world.add(this.riverLight);
    this.addBridge(-88, 210, -0.72);
    this.addBridge(520, -185, -0.72);
  }

  addWorldPassComposition() {
    this.addCommonsRing();
    this.addCottagesAndFrames();
    this.addWayfindingStones();
  }

  addArrivalRoad() {
    const road = new THREE.Mesh(new THREE.BoxGeometry(126, 4, 850), this.materials.path);
    road.position.set(0, this.terrainHeight(0, 720) + 4, 720);
    road.receiveShadow = true;
    this.world.add(road);

    for (let i = 0; i < 7; i++) {
      const z = 990 - i * 96;
      this.addLampPost(-132, this.terrainHeight(-132, z), z, 100 + i);
      this.addLampPost(132, this.terrainHeight(132, z), z, 130 + i);
    }
  }

  addCommonsRing() {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(282, 9, 12, 96), this.materials.stone);
    ring.position.set(0, this.terrainHeight(0, 260) + 8, 260);
    ring.rotation.x = Math.PI / 2;
    ring.receiveShadow = true;
    this.world.add(ring);

    const inner = new THREE.Mesh(new THREE.CylinderGeometry(150, 165, 3, 72), this.materials.dirt);
    inner.position.set(0, this.terrainHeight(0, 260) + 4, 260);
    inner.receiveShadow = true;
    this.world.add(inner);
  }

  addCottagesAndFrames() {
    COMPOSITION_COTTAGES.forEach(([x, z, rotation, scale], i) => {
      const group = this.makeTudorCottage(scale, i % 2 ? 0x6f9f9b : 0xbfa782);
      group.position.set(x, this.terrainHeight(x, z), z);
      group.rotation.y = rotation;
      this.world.add(group);
      this.collisionBlocks.push({ x, z, radius: 92 * scale, label: `background cottage ${i + 1}` });
    });

    [-1, 1].forEach((side) => {
      for (let i = 0; i < 6; i++) {
        const z = 975 - i * 112;
        this.addFenceSegment(side * 245, z, Math.PI / 2);
      }
    });
  }

  makeTudorCottage(scale = 1, plasterColor = 0xbfa782) {
    const group = new THREE.Group();
    const plaster = new THREE.MeshStandardMaterial({ color: plasterColor, roughness: 0.88, metalness: 0.02 });
    const base = new THREE.Mesh(new THREE.BoxGeometry(170 * scale, 88 * scale, 126 * scale), plaster);
    base.position.y = 44 * scale;
    const stoneBase = new THREE.Mesh(new THREE.BoxGeometry(180 * scale, 28 * scale, 136 * scale), this.materials.stone);
    stoneBase.position.y = 14 * scale;
    const roof = new THREE.Mesh(new THREE.ConeGeometry(126 * scale, 76 * scale, 4), this.materials.roof);
    roof.position.y = 116 * scale;
    roof.rotation.y = Math.PI / 4;
    roof.scale.z = 0.78;
    group.add(stoneBase, base, roof);

    [-72, 72].forEach((x) => {
      const beam = new THREE.Mesh(new THREE.BoxGeometry(12 * scale, 98 * scale, 10 * scale), this.materials.wood);
      beam.position.set(x * scale, 55 * scale, -68 * scale);
      const brace = new THREE.Mesh(new THREE.BoxGeometry(11 * scale, 110 * scale, 9 * scale), this.materials.wood);
      brace.position.set((x * 0.5) * scale, 58 * scale, -70 * scale);
      brace.rotation.z = x > 0 ? -0.55 : 0.55;
      group.add(beam, brace);
    });

    const lintel = new THREE.Mesh(new THREE.BoxGeometry(165 * scale, 10 * scale, 10 * scale), this.materials.wood);
    lintel.position.set(0, 92 * scale, -69 * scale);
    const door = new THREE.Mesh(new THREE.BoxGeometry(42 * scale, 62 * scale, 8 * scale), this.materials.wood);
    door.position.set(0, 38 * scale, -72 * scale);
    group.add(lintel, door);

    [-48, 48].forEach((x) => {
      const window = new THREE.Mesh(new THREE.BoxGeometry(30 * scale, 30 * scale, 7 * scale), this.materials.glass);
      window.position.set(x * scale, 58 * scale, -74 * scale);
      group.add(window);
    });

    group.traverse((part) => { if (part.isMesh) { part.castShadow = true; part.receiveShadow = true; } });
    return group;
  }

  addWayfindingStones() {
    const markers = [
      ['Resume Hall', -250, 350, -0.58],
      ['Chronicle House', -205, 470, -0.22],
      ['AI Workshop', 215, 360, 0.48],
      ['Project Workshop', 230, 500, 0.22]
    ];
    markers.forEach(([title, x, z, rotation], i) => {
      const stone = new THREE.Mesh(new THREE.CylinderGeometry(18, 22, 70, 6), this.materials.darkStone);
      stone.position.set(x, this.terrainHeight(x, z) + 35, z);
      stone.rotation.y = rotation;
      stone.castShadow = true;
      this.world.add(stone);
      this.markInteractable(stone, { type: 'ruin', id: `waystone-${i}`, label: `Waystone: ${title}` });
    });
  }

  addFenceSegment(x, z, rotation) {
    const group = new THREE.Group();
    group.position.set(x, this.terrainHeight(x, z) + 22, z);
    group.rotation.y = rotation;
    const railA = new THREE.Mesh(new THREE.BoxGeometry(82, 8, 8), this.materials.wood);
    const railB = railA.clone();
    railA.position.y = 10;
    railB.position.y = -8;
    const postA = new THREE.Mesh(new THREE.BoxGeometry(9, 42, 9), this.materials.wood);
    const postB = postA.clone();
    postA.position.x = -42;
    postB.position.x = 42;
    [railA, railB, postA, postB].forEach((part) => { part.castShadow = true; group.add(part); });
    this.world.add(group);
    this.collisionBlocks.push({ x, z, radius: 32, label: 'village fence' });
  }

  makeTreesAndFences() {
    const treeSpots = [
      [-1080, 940, 1.4], [-920, 760, 1.15], [-780, 980, 1.25], [-620, 870, 0.95],
      [760, 965, 1.18], [930, 800, 1.4], [1110, 620, 1.1], [1010, 375, 0.9],
      [-1080, 240, 1.2], [-950, -80, 1.05], [-980, -520, 1.3], [-680, -930, 1.15],
      [1020, -190, 1.18], [880, -560, 1.1], [630, -980, 1.24], [180, -1080, 1.0],
      [-260, -1030, 0.9], [1220, 210, 0.85], [-1220, 560, 1.05], [1260, 980, 1.2]
    ];
    treeSpots.forEach(([x, z, scale], i) => this.addSoftTree(x, z, scale, i));
    realms.forEach((realm) => this.addFenceArc(realm.x, realm.z, 270));
  }

  addSoftTree(x, z, scale, i) {
    const y = this.terrainHeight(x, z);
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(10 * scale, 16 * scale, 76 * scale, 10), this.materials.bark);
    trunk.position.set(x, y + 38 * scale, z);
    trunk.castShadow = true;
    this.world.add(trunk);

    const leafy = i % 4 === 0;
    const crownMat = new THREE.MeshStandardMaterial({ color: leafy ? 0x5b8f35 : 0x365f25, roughness: 0.92 });
    if (leafy) {
      [0, 1, 2].forEach((n) => {
        const crown = new THREE.Mesh(new THREE.SphereGeometry((42 + n * 8) * scale, 18, 12), crownMat);
        crown.scale.set(1.15, 0.72, 1.0);
        crown.position.set(x + (n - 1) * 21 * scale, y + (92 + n * 14) * scale, z + Math.sin(i + n) * 18 * scale);
        crown.castShadow = true;
        this.world.add(crown);
      });
    } else {
      [0, 1, 2].forEach((n) => {
        const crown = new THREE.Mesh(new THREE.ConeGeometry((55 - n * 8) * scale, (105 - n * 12) * scale, 14), crownMat);
        crown.position.set(x, y + (88 + n * 42) * scale, z);
        crown.castShadow = true;
        this.world.add(crown);
      });
    }
  }

  makeVillageProps() {
    const propSpots = [
      [-135, 410, 'cart'], [170, 420, 'barrels'], [-305, 245, 'lamp'], [305, 245, 'lamp'],
      [-510, 465, 'well'], [535, 435, 'crate'], [-155, -165, 'barrels'], [390, -270, 'lamp'],
      [-855, -455, 'crate'], [770, 540, 'cart']
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

  addBarrels(x, y, z, i) {
    const group = new THREE.Group();
    group.position.set(x, y + 20, z);
    for (let j = 0; j < 3; j++) {
      const barrel = new THREE.Mesh(new THREE.CylinderGeometry(18, 20, 38, 16), this.materials.wood);
      barrel.position.set(j * 26 - 20, 0, (j % 2) * 20);
      barrel.rotation.z = Math.PI / 2;
      barrel.castShadow = true;
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
      group.add(crate);
    }
    this.world.add(group);
  }

  addMarketCart(x, y, z, i) {
    const group = new THREE.Group();
    group.position.set(x, y + 32, z);
    group.rotation.y = i % 2 ? 0.4 : -0.35;
    const bed = new THREE.Mesh(new THREE.BoxGeometry(82, 24, 48), this.materials.wood);
    const canopy = new THREE.Mesh(new THREE.ConeGeometry(62, 36, 4), this.materials.roof);
    canopy.position.y = 50;
    canopy.rotation.y = Math.PI / 4;
    [-34, 34].forEach((wx) => {
      const wheel = new THREE.Mesh(new THREE.TorusGeometry(14, 4, 8, 16), this.materials.iron);
      wheel.rotation.y = Math.PI / 2;
      wheel.position.set(wx, -16, 28);
      group.add(wheel);
    });
    [bed, canopy].forEach((part) => { part.castShadow = true; group.add(part); });
    this.world.add(group);
  }

  addVillageBuilding(group, buildType, color, realm) {
    const size = {
      hall: [230, 136, 180],
      grandHall: [300, 172, 220],
      scribeHouse: [230, 145, 190],
      forge: [245, 128, 190],
      workshop: [238, 140, 198],
      sanctuary: [270, 160, 210],
      library: [270, 168, 200],
      marketWorkshop: [260, 136, 220]
    }[buildType] || [230, 136, 180];

    const baseMat = buildType === 'forge' ? this.materials.darkStone : this.materials.plaster;
    const stoneBase = new THREE.Mesh(new THREE.BoxGeometry(size[0] + 18, 34, size[2] + 18), this.materials.stone);
    stoneBase.position.y = 17;
    const base = new THREE.Mesh(new THREE.BoxGeometry(size[0], size[1], size[2]), baseMat);
    base.position.y = 34 + size[1] / 2;
    this.markInteractable(base, { type: 'portal', id: realm.id, label: realm.name });

    const roof = new THREE.Mesh(new THREE.ConeGeometry(size[0] * 0.82, 112, 4), this.materials.roof);
    roof.position.y = size[1] + 95;
    roof.rotation.y = Math.PI / 4;
    roof.scale.z = size[2] / size[0] * 0.9;
    this.markInteractable(roof, { type: 'portal', id: realm.id, label: realm.name });

    const door = new THREE.Mesh(new THREE.BoxGeometry(54, 86, 12), this.materials.wood);
    door.position.set(0, 78, -size[2] / 2 - 8);
    this.markInteractable(door, { type: 'portal', id: realm.id, label: realm.name });

    const gable = new THREE.Mesh(new THREE.ConeGeometry(66, 72, 3), baseMat);
    gable.position.set(0, size[1] + 35, -size[2] / 2 - 13);
    gable.rotation.z = Math.PI / 2;

    const beams = [];
    [-96, -48, 48, 96].forEach((x) => {
      const beam = new THREE.Mesh(new THREE.BoxGeometry(12, size[1] * 0.82, 10), this.materials.wood);
      beam.position.set(x, 50 + size[1] * 0.45, -size[2] / 2 - 10);
      beams.push(beam);
    });
    [-1, 1].forEach((side) => {
      const brace = new THREE.Mesh(new THREE.BoxGeometry(12, size[1] * 0.9, 10), this.materials.wood);
      brace.position.set(side * 54, 65 + size[1] * 0.42, -size[2] / 2 - 11);
      brace.rotation.z = side * 0.52;
      beams.push(brace);
    });
    const lintel = new THREE.Mesh(new THREE.BoxGeometry(size[0] + 14, 14, 12), this.materials.wood);
    lintel.position.set(0, size[1] + 36, -size[2] / 2 - 12);
    beams.push(lintel);

    const windows = [];
    [-74, 74].forEach((x) => {
      const w = new THREE.Mesh(new THREE.BoxGeometry(38, 42, 9), this.materials.glass);
      w.position.set(x, 96, -size[2] / 2 - 12);
      windows.push(w);
      this.markInteractable(w, { type: 'portal', id: realm.id, label: realm.name });
    });

    const accent = new THREE.Mesh(new THREE.TorusGeometry(35, 3.5, 8, 48), new THREE.MeshStandardMaterial({ color, roughness: 0.35, metalness: 0.16, emissive: color, emissiveIntensity: 0.24 }));
    accent.position.set(0, size[1] + 62, -size[2] / 2 - 22);

    [stoneBase, base, roof, door, gable, accent, ...beams, ...windows].forEach((part) => {
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
    const mat = new THREE.MeshBasicMaterial({ map: texture, transparent: true });
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(180 * scale, 68 * scale), mat);
    return mesh;
  }

  buildCollisionModel() {
    realms.forEach((realm) => this.collisionBlocks.push({ x: realm.x, z: realm.z, radius: realm.id === 'about' ? 188 : 168, label: realm.name }));
    this.collisionBlocks.push({ x: 0, z: 850, radius: 132, label: 'Contact Tower' });
    [
      [-135, 410, 70], [170, 420, 62], [-510, 465, 86], [535, 435, 58],
      [-155, -165, 54], [770, 540, 70], [-855, -455, 60]
    ].forEach(([x, z, radius]) => this.collisionBlocks.push({ x, z, radius, label: 'village prop' }));
  }

  resolveMovement(player, nextX, nextZ) {
    let x = THREE.MathUtils.clamp(nextX, -1450, 1450);
    let z = THREE.MathUtils.clamp(nextZ, -1450, 1180);

    for (const block of this.collisionBlocks) {
      const dx = x - block.x;
      const dz = z - block.z;
      const distance = Math.hypot(dx, dz);
      const minDistance = block.radius + 34;
      if (distance > 0.001 && distance < minDistance) {
        const push = minDistance - distance;
        x += (dx / distance) * push;
        z += (dz / distance) * push;
        player.vx *= 0.35;
        player.vz *= 0.35;
      }
    }

    return {
      x: THREE.MathUtils.clamp(x, -1450, 1450),
      z: THREE.MathUtils.clamp(z, -1450, 1180)
    };
  }

  update({ player, activeRealm, discoveredArtifacts, repositories, cameraBeat, navTarget }) {
    if (navTarget) {
      this.drawNavTarget(navTarget);
    } else if (this.navTargetMarker) {
      this.navTargetMarker.visible = false;
    }
    super.update({ player, activeRealm, discoveredArtifacts, repositories, cameraBeat });
  }

  drawNavTarget(target) {
    if (!this.navTargetMarker) {
      this.navTargetMarker = new THREE.Mesh(new THREE.TorusGeometry(36, 3, 8, 40), this.materials.gold);
      this.navTargetMarker.rotation.x = Math.PI / 2;
      this.world.add(this.navTargetMarker);
    }
    this.navTargetMarker.visible = true;
    this.navTargetMarker.position.set(target.x, this.terrainHeight(target.x, target.z) + 7, target.z);
    this.navTargetMarker.rotation.z += 0.03;
  }
}
