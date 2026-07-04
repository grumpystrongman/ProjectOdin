import * as THREE from 'three';
import { realms, artifacts, tablets } from './content.js';

export class OdinScene {
  constructor(canvas) {
    this.canvas = canvas;
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x02050b);
    this.scene.fog = new THREE.FogExp2(0x06101c, 0.00115);
    this.camera = new THREE.PerspectiveCamera(68, window.innerWidth / window.innerHeight, 0.1, 6200);
    this.camera.rotation.order = 'YXZ';
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.08;
    this.clock = new THREE.Clock();
    this.raycaster = new THREE.Raycaster();
    this.center = new THREE.Vector2(0, 0);
    this.world = new THREE.Group();
    this.scene.add(this.world);
    this.realmObjects = new Map();
    this.artifactObjects = new Map();
    this.tabletObjects = [];
    this.repoObjects = [];
    this.interactables = [];
    this.assetAnchors = new Map();
    this.mix = { gate: 0 };
    this.materials = this.makeMaterials();
    this.init();
    window.addEventListener('resize', () => this.resize());
  }

  makeMaterials() {
    return {
      blackStone: new THREE.MeshStandardMaterial({ color: 0x111821, roughness: 0.86, metalness: 0.1 }),
      darkMetal: new THREE.MeshStandardMaterial({ color: 0x1a2330, roughness: 0.48, metalness: 0.42 }),
      obsidian: new THREE.MeshStandardMaterial({ color: 0x05080d, roughness: 0.42, metalness: 0.55, emissive: 0x061b2a, emissiveIntensity: 0.1 }),
      gold: new THREE.MeshStandardMaterial({ color: 0xf2c76d, roughness: 0.32, metalness: 0.76, emissive: 0x432100, emissiveIntensity: 0.18 }),
      water: new THREE.MeshPhysicalMaterial({ color: 0x0edbff, roughness: 0.12, metalness: 0.05, transmission: 0.25, transparent: true, opacity: 0.48, emissive: 0x0a91c6, emissiveIntensity: 0.62 }),
      glass: new THREE.MeshPhysicalMaterial({ color: 0x80f7ff, roughness: 0.08, metalness: 0.18, transparent: true, opacity: 0.42, transmission: 0.35, emissive: 0x31dfff, emissiveIntensity: 0.35 })
    };
  }

  init() {
    const hemi = new THREE.HemisphereLight(0xaeeaff, 0x08070a, 0.52);
    this.scene.add(hemi);
    const moon = new THREE.DirectionalLight(0xd7f6ff, 1.45);
    moon.position.set(-680, 1180, 520);
    moon.castShadow = true;
    moon.shadow.mapSize.set(2048, 2048);
    moon.shadow.camera.left = -1800;
    moon.shadow.camera.right = 1800;
    moon.shadow.camera.top = 1800;
    moon.shadow.camera.bottom = -1800;
    this.scene.add(moon);
    const ember = new THREE.DirectionalLight(0xff8f3d, 0.32);
    ember.position.set(900, 420, -860);
    this.scene.add(ember);
    this.makeSky();
    this.makeTerrain();
    this.makeDataRiver();
    this.makeGreatGate();
    this.makeRealmPortals();
    this.makeTablets();
    this.makeVault();
    this.makeRuins();
    this.makeCorvus();
    this.makeParticles();
  }

  terrainHeight(x, z) {
    return Math.sin(x * 0.006) * 9 + Math.cos(z * 0.007) * 12 + Math.sin((x + z) * 0.003) * 17 - 10;
  }

  makeSky() {
    const dome = new THREE.Mesh(new THREE.SphereGeometry(3100, 48, 24), new THREE.MeshBasicMaterial({ color: 0x030812, side: THREE.BackSide }));
    this.scene.add(dome);
    const stars = new THREE.BufferGeometry();
    const positions = [];
    for (let i = 0; i < 1500; i++) {
      const radius = 1500 + Math.random() * 1400;
      const theta = Math.random() * Math.PI * 2;
      positions.push(Math.cos(theta) * radius, 360 + Math.random() * 1400, Math.sin(theta) * radius);
    }
    stars.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    this.stars = new THREE.Points(stars, new THREE.PointsMaterial({ size: 3.2, transparent: true, opacity: 0.82, color: 0xbceeff }));
    this.scene.add(this.stars);
  }

  makeTerrain() {
    const geo = new THREE.PlaneGeometry(3400, 3400, 160, 160);
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getY(i);
      pos.setZ(i, this.terrainHeight(x, z));
    }
    geo.computeVertexNormals();
    const mesh = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: 0x101720, roughness: 0.94, metalness: 0.05 }));
    mesh.rotation.x = -Math.PI / 2;
    mesh.receiveShadow = true;
    this.markInteractable(mesh, { type: 'terrain', id: 'ground', label: 'Ancient ground' });
    this.world.add(mesh);
    for (let r = 260; r <= 1100; r += 220) {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(r, 2.2, 8, 220), this.materials.darkMetal);
      ring.rotation.x = Math.PI / 2;
      ring.position.y = this.terrainHeight(0, 0) + 1.5;
      ring.receiveShadow = true;
      this.markInteractable(ring, { type: 'ruin', id: `path-ring-${r}`, label: 'Ancient pathway ring' });
      this.world.add(ring);
    }
  }

  makeDataRiver() {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-860, 4, 650), new THREE.Vector3(-520, 6, 360), new THREE.Vector3(-260, 4, 100),
      new THREE.Vector3(-20, 7, -30), new THREE.Vector3(240, 5, -240), new THREE.Vector3(520, 6, -450), new THREE.Vector3(840, 4, -700)
    ]);
    this.river = new THREE.Mesh(new THREE.TubeGeometry(curve, 150, 13, 16, false), this.materials.water);
    this.markInteractable(this.river, { type: 'river', id: 'data-river', label: 'Glowing data river' });
    this.world.add(this.river);
    this.riverLight = new THREE.PointLight(0x23dfff, 2.4, 900);
    this.riverLight.position.set(-80, 80, -10);
    this.world.add(this.riverLight);
  }

  makeGreatGate() {
    this.gate = new THREE.Group();
    this.gate.position.set(0, 0, 820);
    const left = new THREE.Mesh(new THREE.BoxGeometry(88, 430, 70), this.materials.obsidian);
    const right = left.clone();
    left.position.set(-74, 215, 0);
    right.position.set(74, 215, 0);
    const top = new THREE.Mesh(new THREE.BoxGeometry(270, 64, 76), this.materials.obsidian);
    top.position.set(0, 455, 0);
    const lintel = new THREE.Mesh(new THREE.BoxGeometry(310, 14, 86), this.materials.gold);
    lintel.position.set(0, 505, 0);
    const inner = new THREE.Mesh(new THREE.TorusGeometry(118, 6, 18, 128), this.materials.glass);
    inner.position.y = 245;
    inner.rotation.x = Math.PI / 2;
    [left, right, top, lintel, inner].forEach((part) => {
      part.castShadow = true;
      part.receiveShadow = true;
      this.markInteractable(part, { type: 'gate', id: 'great-gate', label: 'Great Gate' });
      this.gate.add(part);
    });
    this.gateGlow = new THREE.PointLight(0x7ee7ff, 3.2, 700);
    this.gateGlow.position.set(0, 230, -45);
    this.gate.add(this.gateGlow);
    this.world.add(this.gate);
    this.assetAnchors.set('great-gate', this.gate);
  }

  makeRealmPortals() {
    for (const realm of realms) {
      const group = new THREE.Group();
      group.position.set(realm.x, this.terrainHeight(realm.x, realm.z), realm.z);
      const color = new THREE.Color(realm.color);
      const platform = new THREE.Mesh(new THREE.CylinderGeometry(118, 150, 28, 12), this.materials.darkMetal);
      platform.position.y = 14;
      const portalRing = new THREE.Mesh(new THREE.TorusGeometry(92, 8, 18, 128), new THREE.MeshStandardMaterial({ color: 0x171f2b, roughness: 0.44, metalness: 0.62, emissive: color, emissiveIntensity: 0.12 }));
      portalRing.position.y = 155;
      portalRing.rotation.x = Math.PI / 2;
      const veil = new THREE.Mesh(new THREE.CircleGeometry(80, 64), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.2, side: THREE.DoubleSide }));
      veil.position.y = 155;
      veil.rotation.x = -Math.PI / 2;
      const spire = new THREE.Mesh(new THREE.ConeGeometry(42, 260 + realm.elevation, 7), new THREE.MeshStandardMaterial({ color: 0x1c2634, roughness: 0.68, metalness: 0.22, emissive: color, emissiveIntensity: 0.08 }));
      spire.position.y = 170 + realm.elevation / 2;
      const cap = new THREE.Mesh(new THREE.OctahedronGeometry(36, 1), new THREE.MeshStandardMaterial({ color, roughness: 0.25, metalness: 0.2, emissive: color, emissiveIntensity: 0.7 }));
      cap.position.y = 330 + realm.elevation;
      const light = new THREE.PointLight(color, 1.7, 520);
      light.position.y = 200;
      [platform, portalRing, veil, spire, cap].forEach((part) => { part.castShadow = true; this.markInteractable(part, { type: 'portal', id: realm.id, label: realm.name }); });
      group.add(platform, portalRing, veil, spire, cap, light);
      this.makeArtifactRing(group, realm, color);
      this.makeRealmRuins(group, color);
      this.world.add(group);
      this.realmObjects.set(realm.id, { group, realm, light, cap, spire, portalRing, veil });
      this.assetAnchors.set(`realm:${realm.id}`, group);
    }
  }

  makeArtifactRing(group, realm, color) {
    realm.artifacts.forEach((artifactId, i) => {
      const angle = (i / realm.artifacts.length) * Math.PI * 2 + 0.42;
      const artifactGroup = new THREE.Group();
      artifactGroup.position.set(Math.cos(angle) * 152, 48, Math.sin(angle) * 152);
      const pedestal = new THREE.Mesh(new THREE.CylinderGeometry(25, 36, 32, 8), this.materials.darkMetal);
      pedestal.position.y = -18;
      const core = new THREE.Mesh(this.artifactGeometryFor(artifactId), new THREE.MeshStandardMaterial({ color, roughness: 0.24, metalness: 0.58, emissive: color, emissiveIntensity: 0.34 }));
      const halo = new THREE.Mesh(new THREE.TorusGeometry(32, 2.2, 8, 48), this.materials.glass);
      halo.rotation.x = Math.PI / 2;
      [pedestal, core, halo].forEach((part) => { part.castShadow = true; this.markInteractable(part, { type: 'artifact', id: artifactId, label: artifacts[artifactId]?.title || artifactId }); });
      artifactGroup.add(pedestal, core, halo);
      group.add(artifactGroup);
      this.artifactObjects.set(artifactId, { group: artifactGroup, mesh: core, halo, realm, worldX: realm.x + artifactGroup.position.x, worldZ: realm.z + artifactGroup.position.z });
      this.assetAnchors.set(`artifact:${artifactId}`, artifactGroup);
    });
  }

  artifactGeometryFor(id) {
    if (id.includes('map') || id.includes('lens')) return new THREE.IcosahedronGeometry(22, 1);
    if (id.includes('hammer') || id.includes('bell')) return new THREE.CylinderGeometry(13, 18, 48, 8);
    if (id.includes('table')) return new THREE.BoxGeometry(42, 14, 42);
    if (id.includes('lantern') || id.includes('globe')) return new THREE.SphereGeometry(22, 24, 16);
    return new THREE.DodecahedronGeometry(23, 0);
  }

  makeRealmRuins(group, color) {
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2 + 0.2;
      const radius = 230 + (i % 3) * 34;
      const height = 70 + ((i * 31) % 95);
      const ruin = new THREE.Mesh(new THREE.BoxGeometry(18 + (i % 4) * 7, height, 18 + (i % 5) * 5), new THREE.MeshStandardMaterial({ color: 0x151d26, roughness: 0.9, metalness: 0.08, emissive: color, emissiveIntensity: i % 4 === 0 ? 0.04 : 0 }));
      ruin.position.set(Math.cos(angle) * radius, height / 2, Math.sin(angle) * radius);
      ruin.rotation.y = angle + Math.PI / 7;
      ruin.castShadow = true;
      ruin.receiveShadow = true;
      this.markInteractable(ruin, { type: 'ruin', id: `realm-ruin-${Math.round(angle * 1000)}`, label: 'Realm ruin' });
      group.add(ruin);
    }
  }

  makeTablets() {
    tablets.forEach((text, i) => {
      const angle = (i / tablets.length) * Math.PI * 2;
      const radius = 930 + (i % 3) * 88;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const y = this.terrainHeight(x, z) + 54;
      const tablet = new THREE.Mesh(new THREE.BoxGeometry(44, 92, 14), new THREE.MeshStandardMaterial({ color: 0x222832, roughness: 0.72, metalness: 0.2, emissive: 0x1b6a88, emissiveIntensity: 0.08 }));
      tablet.position.set(x, y, z);
      tablet.rotation.y = -angle;
      tablet.castShadow = true;
      this.markInteractable(tablet, { type: 'tablet', id: String(i), label: `Tablet ${i + 1}` });
      this.world.add(tablet);
      this.tabletObjects.push({ mesh: tablet, text, index: i, x, z });
      this.assetAnchors.set(`tablet:${i}`, tablet);
    });
  }

  makeVault() {
    this.vault = new THREE.Group();
    this.vault.position.set(0, this.terrainHeight(0, 720), 720);
    const ringMat = new THREE.MeshStandardMaterial({ color: 0x202733, roughness: 0.42, metalness: 0.55, emissive: 0x251600, emissiveIntensity: 0.12 });
    const plinth = new THREE.Mesh(new THREE.CylinderGeometry(126, 160, 52, 12), ringMat);
    plinth.position.y = 26;
    const ring = new THREE.Mesh(new THREE.TorusGeometry(118, 9, 16, 128), ringMat);
    ring.position.y = 142;
    ring.rotation.x = Math.PI / 2;
    const door = new THREE.Mesh(new THREE.CylinderGeometry(86, 86, 10, 64), this.materials.gold);
    door.position.y = 142;
    door.rotation.x = Math.PI / 2;
    [plinth, ring, door].forEach((part) => { part.castShadow = true; this.markInteractable(part, { type: 'vault', id: 'vault', label: 'Vault of Trust' }); this.vault.add(part); });
    this.vaultLight = new THREE.PointLight(0xf2c76d, 2.4, 520);
    this.vaultLight.position.y = 155;
    this.vault.add(this.vaultLight);
    this.world.add(this.vault);
    this.assetAnchors.set('vault', this.vault);
  }

  makeRuins() {
    const mat = new THREE.MeshStandardMaterial({ color: 0x131b24, roughness: 0.92, metalness: 0.08 });
    for (let i = 0; i < 120; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 360 + Math.random() * 1180;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      if (Math.hypot(x, z - 820) < 220) continue;
      const h = 20 + Math.random() * 125;
      const stone = new THREE.Mesh(new THREE.BoxGeometry(10 + Math.random() * 34, h, 10 + Math.random() * 34), mat);
      stone.position.set(x, this.terrainHeight(x, z) + h / 2 - 2, z);
      stone.rotation.y = Math.random() * Math.PI;
      stone.castShadow = true;
      stone.receiveShadow = true;
      this.markInteractable(stone, { type: 'ruin', id: `outer-ruin-${i}`, label: 'Ancient ruin' });
      this.world.add(stone);
    }
  }

  makeCorvus() {
    this.corvus = new THREE.Group();
    const body = new THREE.Mesh(new THREE.ConeGeometry(18, 42, 7), new THREE.MeshStandardMaterial({ color: 0x080b0f, metalness: 0.62, roughness: 0.32, emissive: 0x003344, emissiveIntensity: 0.22 }));
    body.rotation.x = Math.PI;
    const left = new THREE.Mesh(new THREE.BoxGeometry(58, 4, 14), this.materials.obsidian);
    const right = left.clone();
    left.position.set(-35, 5, 0);
    right.position.set(35, 5, 0);
    left.rotation.z = 0.34;
    right.rotation.z = -0.34;
    const eye = new THREE.PointLight(0x7ee7ff, 1.3, 130);
    eye.position.set(0, 8, -16);
    this.corvus.add(body, left, right, eye);
    this.scene.add(this.corvus);
  }

  makeParticles() {
    const geo = new THREE.BufferGeometry();
    const positions = [];
    for (let i = 0; i < 950; i++) positions.push((Math.random() - 0.5) * 2700, Math.random() * 560, (Math.random() - 0.5) * 2700);
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    this.particles = new THREE.Points(geo, new THREE.PointsMaterial({ color: 0x7ee7ff, size: 2.1, transparent: true, opacity: 0.25 }));
    this.scene.add(this.particles);
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
    const cinematic = cameraBeat?.active ? Math.sin(cameraBeat.progress * Math.PI) : 0;
    const moving = Math.abs(player.vx) + Math.abs(player.vz) > 3;
    const bob = moving ? Math.sin(player.headBob) * 2.4 : 0;
    const height = this.terrainHeight(player.x, player.z) + 76 + bob;
    this.camera.fov += ((player.fov || 68) - this.camera.fov) * 0.16;
    this.camera.updateProjectionMatrix();
    if (cinematic > 0.02 && cameraBeat?.active?.id === 'arrival') {
      this.camera.position.set(player.x + Math.sin(t * 0.35) * (260 + 180 * cinematic), height + 110 + 150 * cinematic, player.z + 430 + 160 * cinematic);
      this.camera.lookAt(player.x, height + 24, player.z - 220);
    } else {
      this.camera.position.x += (player.x - this.camera.position.x) * 0.5;
      this.camera.position.y += (height - this.camera.position.y) * 0.5;
      this.camera.position.z += (player.z - this.camera.position.z) * 0.5;
      this.camera.rotation.y = player.yaw;
      this.camera.rotation.x = player.pitch;
      this.camera.rotation.z = 0;
    }
    this.gateGlow.intensity = 1.8 + this.mix.gate * 3.2 + Math.sin(t * 2) * 0.22;
    this.river.material.opacity = 0.42 + Math.sin(t * 1.8) * 0.08;
    this.river.rotation.y = Math.sin(t * 0.08) * 0.012;
    for (const [id, item] of this.realmObjects.entries()) {
      const active = id === activeRealm;
      item.cap.rotation.y += 0.012 + (active ? 0.02 : 0);
      item.portalRing.rotation.z += 0.006 + (active ? 0.012 : 0);
      item.veil.material.opacity += ((active ? 0.42 : 0.19) - item.veil.material.opacity) * 0.05;
      item.light.intensity += ((active ? 4.2 : 1.5) - item.light.intensity) * 0.05;
      item.spire.material.emissiveIntensity += ((active ? 0.23 : 0.08) - item.spire.material.emissiveIntensity) * 0.05;
    }
    for (const [id, item] of this.artifactObjects.entries()) {
      item.mesh.rotation.x += 0.011;
      item.mesh.rotation.y += 0.017;
      item.halo.rotation.z += 0.02;
      item.group.position.y = 50 + Math.sin(t * 2 + item.worldX * 0.01) * 8;
      item.mesh.material.emissiveIntensity = discoveredArtifacts.includes(id) ? 0.92 : 0.32;
    }
    this.tabletObjects.forEach((tablet, i) => { tablet.mesh.position.y = this.terrainHeight(tablet.x, tablet.z) + 54 + Math.sin(t + i) * 3; });
    this.vault.rotation.y = Math.sin(t * 0.35) * 0.06;
    this.vaultLight.intensity = 2.0 + Math.sin(t * 1.6) * 0.34;
    this.corvus.position.set(player.x + Math.sin(t * 0.7) * 140, height + 110 + Math.sin(t * 1.3) * 24, player.z - 160 + Math.cos(t * 0.5) * 90);
    this.corvus.rotation.y = Math.sin(t) * 0.5;
    this.particles.rotation.y += 0.0007;
    this.stars.rotation.y += 0.00015;
    this.mix.gate += (Math.min(1, discoveredArtifacts.length / 8) - this.mix.gate) * 0.02;
    this.updateRepoSatellites(repositories, t);
    this.renderer.render(this.scene, this.camera);
  }

  updateRepoSatellites(repositories, t) {
    if (!repositories) return;
    while (this.repoObjects.length < repositories.length) {
      const mesh = new THREE.Mesh(new THREE.IcosahedronGeometry(10, 0), new THREE.MeshStandardMaterial({ color: 0x72ffc2, emissive: 0x72ffc2, emissiveIntensity: 0.32, metalness: 0.55, roughness: 0.28 }));
      this.markInteractable(mesh, { type: 'ruin', id: `repo-signal-${this.repoObjects.length}`, label: 'Repository signal' });
      this.world.add(mesh);
      this.repoObjects.push(mesh);
    }
    repositories.forEach((repo, i) => {
      const realm = realms.find((r) => r.id === repo.realm) || realms[5];
      const mesh = this.repoObjects[i];
      const angle = t * 0.35 + i * 1.7;
      const radius = 180 + (repo.signal || 50) * 0.72;
      mesh.position.set(realm.x + Math.cos(angle) * radius, this.terrainHeight(realm.x, realm.z) + 102 + Math.sin(t + i) * 22, realm.z + Math.sin(angle) * radius);
      mesh.scale.setScalar(0.8 + (repo.signal || 50) / 120);
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
