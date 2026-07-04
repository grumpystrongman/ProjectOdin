import * as THREE from 'three';
import { realms, artifacts, tablets } from './content.js';

export class OdinScene {
  constructor(canvas) {
    this.canvas = canvas;
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x87a9c6);
    this.scene.fog = new THREE.FogExp2(0xd7c08a, 0.00065);
    this.camera = new THREE.PerspectiveCamera(66, window.innerWidth / window.innerHeight, 0.1, 5200);
    this.camera.rotation.order = 'YXZ';
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
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
    return {
      grass: new THREE.MeshStandardMaterial({ color: 0x5f7c3a, roughness: 0.96, metalness: 0.02 }),
      path: new THREE.MeshStandardMaterial({ color: 0x8c6338, roughness: 0.9, metalness: 0.02 }),
      wood: new THREE.MeshStandardMaterial({ color: 0x6a4226, roughness: 0.82, metalness: 0.04 }),
      plaster: new THREE.MeshStandardMaterial({ color: 0xc8a77b, roughness: 0.86, metalness: 0.03 }),
      roof: new THREE.MeshStandardMaterial({ color: 0x6d2f24, roughness: 0.76, metalness: 0.03 }),
      stone: new THREE.MeshStandardMaterial({ color: 0x80776a, roughness: 0.94, metalness: 0.02 }),
      sign: new THREE.MeshStandardMaterial({ color: 0x3a2312, roughness: 0.88, metalness: 0.02 }),
      gold: new THREE.MeshStandardMaterial({ color: 0xf0c26f, roughness: 0.32, metalness: 0.35, emissive: 0x422500, emissiveIntensity: 0.08 }),
      water: new THREE.MeshPhysicalMaterial({ color: 0x3faec4, roughness: 0.2, metalness: 0.04, transparent: true, opacity: 0.72, emissive: 0x0f6a7d, emissiveIntensity: 0.12 }),
      glass: new THREE.MeshPhysicalMaterial({ color: 0xeed08b, roughness: 0.08, metalness: 0.16, transparent: true, opacity: 0.48, emissive: 0xffc566, emissiveIntensity: 0.18 })
    };
  }

  init() {
    const hemi = new THREE.HemisphereLight(0xfff3d0, 0x3d4b2f, 1.15);
    this.scene.add(hemi);
    const sun = new THREE.DirectionalLight(0xffe4a3, 2.2);
    sun.position.set(-650, 1050, 520);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    sun.shadow.camera.left = -1900;
    sun.shadow.camera.right = 1900;
    sun.shadow.camera.top = 1900;
    sun.shadow.camera.bottom = -1900;
    this.scene.add(sun);
    const warm = new THREE.DirectionalLight(0xff8f3d, 0.48);
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
    this.makeParticles();
  }

  terrainHeight(x, z) {
    return Math.sin(x * 0.004) * 7 + Math.cos(z * 0.005) * 6 + Math.sin((x + z) * 0.002) * 8 - 8;
  }

  makeSky() {
    const dome = new THREE.Mesh(new THREE.SphereGeometry(3100, 48, 24), new THREE.MeshBasicMaterial({ color: 0xb7d5ea, side: THREE.BackSide }));
    this.scene.add(dome);
    const sun = new THREE.Mesh(new THREE.SphereGeometry(90, 32, 16), new THREE.MeshBasicMaterial({ color: 0xffd47d }));
    sun.position.set(-820, 850, -680);
    this.scene.add(sun);
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
    this.markInteractable(mesh, { type: 'terrain', id: 'meadow', label: 'Jeff Barnes Commons Meadow' });
    this.world.add(mesh);
  }

  makeRoads() {
    const roadMat = this.materials.path;
    const center = new THREE.Mesh(new THREE.CylinderGeometry(190, 220, 6, 48), roadMat);
    center.position.set(0, this.terrainHeight(0, 260) + 2, 260);
    center.receiveShadow = true;
    this.markInteractable(center, { type: 'ruin', id: 'village-square', label: 'Village Square' });
    this.world.add(center);
    realms.forEach((realm) => this.addRoadTo(realm.x, realm.z));
  }

  addRoadTo(x, z) {
    const len = Math.hypot(x, z - 260);
    const midX = x / 2;
    const midZ = (z + 260) / 2;
    const road = new THREE.Mesh(new THREE.BoxGeometry(54, 5, len), this.materials.path);
    road.position.set(midX, this.terrainHeight(midX, midZ) + 3, midZ);
    road.rotation.y = Math.atan2(x, z - 260);
    road.receiveShadow = true;
    this.markInteractable(road, { type: 'ruin', id: `road-${Math.round(x)}-${Math.round(z)}`, label: 'Named village road' });
    this.world.add(road);
  }

  makeRiver() {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-920, 2, 690), new THREE.Vector3(-620, 3, 440), new THREE.Vector3(-300, 2, 220),
      new THREE.Vector3(-60, 4, 130), new THREE.Vector3(230, 2, -100), new THREE.Vector3(540, 3, -340), new THREE.Vector3(900, 2, -630)
    ]);
    this.river = new THREE.Mesh(new THREE.TubeGeometry(curve, 160, 18, 18, false), this.materials.water);
    this.markInteractable(this.river, { type: 'river', id: 'mill-river', label: 'Mill River' });
    this.world.add(this.river);
    this.riverLight = new THREE.PointLight(0x87d8ee, 1.2, 650);
    this.riverLight.position.set(-120, 80, 140);
    this.world.add(this.riverLight);
  }

  makeCommons() {
    const mapBoard = this.makeSignBoard('Village Map', 'Jeff Barnes Commons', 0, 155, 315, 1.15);
    this.markInteractable(mapBoard, { type: 'artifact', id: 'commons-map', label: 'Commons Map' });
    const welcome = this.makeSignBoard('Welcome', 'Meet Jeff • Read Resume • Explore Work', 0, 130, 500, 1.0);
    this.markInteractable(welcome, { type: 'artifact', id: 'about-jeff', label: 'About Jeff Barnes' });
  }

  makeRealmBuildings() {
    for (const realm of realms) {
      const group = new THREE.Group();
      group.position.set(realm.x, this.terrainHeight(realm.x, realm.z), realm.z);
      const color = new THREE.Color(realm.color);
      const base = new THREE.Mesh(new THREE.BoxGeometry(190, 112, 160), new THREE.MeshStandardMaterial({ color: 0xc4a06c, roughness: 0.86, metalness: 0.02, emissive: color, emissiveIntensity: 0.035 }));
      base.position.y = 58;
      const roof = new THREE.Mesh(new THREE.ConeGeometry(145, 95, 4), this.materials.roof);
      roof.position.y = 142;
      roof.rotation.y = Math.PI / 4;
      const door = new THREE.Mesh(new THREE.BoxGeometry(42, 72, 8), this.materials.wood);
      door.position.set(0, 42, -84);
      const windowL = new THREE.Mesh(new THREE.BoxGeometry(34, 36, 8), this.materials.glass);
      windowL.position.set(-62, 74, -84);
      const windowR = windowL.clone();
      windowR.position.x = 62;
      const lantern = new THREE.PointLight(color, 1.3, 260);
      lantern.position.set(0, 118, -105);
      [base, roof, door, windowL, windowR].forEach((part) => {
        part.castShadow = true;
        part.receiveShadow = true;
        this.markInteractable(part, { type: 'portal', id: realm.id, label: realm.name });
        group.add(part);
      });
      group.add(lantern);
      this.makeArtifactRing(group, realm, color);
      this.world.add(group);
      const sign = this.makeSignBoard(realm.name, realm.plain, realm.x, 145, realm.z - 135, 0.86);
      this.markInteractable(sign, { type: 'portal', id: realm.id, label: realm.name });
      this.realmObjects.set(realm.id, { group, realm, light: lantern, roof, base, sign });
      this.assetAnchors.set(`realm:${realm.id}`, group);
    }
  }

  makeArtifactRing(group, realm, color) {
    realm.artifacts.forEach((artifactId, i) => {
      const angle = (i / realm.artifacts.length) * Math.PI * 2 + 0.42;
      const artifactGroup = new THREE.Group();
      artifactGroup.position.set(Math.cos(angle) * 152, 36, Math.sin(angle) * 138);
      const pedestal = new THREE.Mesh(new THREE.CylinderGeometry(24, 34, 28, 8), this.materials.stone);
      pedestal.position.y = -12;
      const core = new THREE.Mesh(this.artifactGeometryFor(artifactId), new THREE.MeshStandardMaterial({ color, roughness: 0.38, metalness: 0.18, emissive: color, emissiveIntensity: 0.18 }));
      const halo = new THREE.Mesh(new THREE.TorusGeometry(30, 2.2, 8, 48), this.materials.gold);
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
    const tower = new THREE.Mesh(new THREE.CylinderGeometry(72, 95, 240, 16), this.materials.stone);
    tower.position.y = 120;
    const roof = new THREE.Mesh(new THREE.ConeGeometry(92, 90, 16), this.materials.roof);
    roof.position.y = 285;
    const door = new THREE.Mesh(new THREE.BoxGeometry(44, 84, 8), this.materials.wood);
    door.position.set(0, 52, -74);
    [tower, roof, door].forEach((part) => { part.castShadow = true; this.markInteractable(part, { type: 'vault', id: 'contact-tower', label: 'Contact Tower' }); this.vault.add(part); });
    this.vaultLight = new THREE.PointLight(0xf0c26f, 2.4, 520);
    this.vaultLight.position.y = 185;
    this.vault.add(this.vaultLight);
    this.world.add(this.vault);
    const sign = this.makeSignBoard('Contact Tower', 'Email • LinkedIn • Trust Gate', 0, 128, 710, 0.9);
    this.markInteractable(sign, { type: 'vault', id: 'contact-tower', label: 'Contact Tower' });
    this.assetAnchors.set('vault', this.vault);
  }

  makeTreesAndFences() {
    for (let i = 0; i < 125; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 420 + Math.random() * 1180;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      if (Math.abs(x) < 180 && Math.abs(z - 260) < 260) continue;
      const y = this.terrainHeight(x, z);
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(8, 13, 62, 8), this.materials.wood);
      trunk.position.set(x, y + 31, z);
      const crown = new THREE.Mesh(new THREE.ConeGeometry(44 + Math.random() * 22, 105 + Math.random() * 40, 10), new THREE.MeshStandardMaterial({ color: 0x2f5b2e, roughness: 0.92 }));
      crown.position.set(x, y + 105, z);
      trunk.castShadow = crown.castShadow = true;
      this.markInteractable(trunk, { type: 'ruin', id: `tree-${i}`, label: 'Old oak' });
      this.world.add(trunk, crown);
    }
  }

  makeParticles() {
    const geo = new THREE.BufferGeometry();
    const positions = [];
    for (let i = 0; i < 380; i++) positions.push((Math.random() - 0.5) * 2500, 40 + Math.random() * 260, (Math.random() - 0.5) * 2500);
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
    const label = this.makeTextSprite(title, subtitle, scale);
    label.position.set(0, 6 * scale, -10);
    group.add(postL, postR, board, label);
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
    ctx.fillStyle = '#3a2312';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#f0c26f';
    ctx.lineWidth = 14;
    ctx.strokeRect(24, 24, canvas.width - 48, canvas.height - 48);
    ctx.fillStyle = '#f7ddb0';
    ctx.font = '700 58px Georgia';
    ctx.textAlign = 'center';
    ctx.fillText(title, 512, 145);
    ctx.fillStyle = 'rgba(247,221,176,.82)';
    ctx.font = '500 30px Georgia';
    this.wrapText(ctx, subtitle || '', 512, 210, 850, 42);
    const texture = new THREE.CanvasTexture(canvas);
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
      item.light.intensity += ((active ? 3.4 : 1.2) - item.light.intensity) * 0.05;
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
    this.vaultLight.intensity = 1.9 + Math.sin(t * 1.4) * 0.28;
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
