import * as THREE from 'three';
import { realms, artifacts, tablets } from './content.js';

export class OdinScene {
  constructor(canvas) {
    this.canvas = canvas;
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x07101f, 0.0018);
    this.camera = new THREE.PerspectiveCamera(58, window.innerWidth / window.innerHeight, 0.1, 5000);
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;
    this.clock = new THREE.Clock();
    this.world = new THREE.Group();
    this.scene.add(this.world);
    this.realmObjects = new Map();
    this.artifactObjects = new Map();
    this.tabletObjects = [];
    this.repoObjects = [];
    this.mix = { gate: 0, storm: 0 };
    this.init();
    window.addEventListener('resize', () => this.resize());
  }

  init() {
    this.scene.background = new THREE.Color(0x03070d);
    const hemi = new THREE.HemisphereLight(0xb8ecff, 0x101014, 0.62);
    this.scene.add(hemi);
    const moon = new THREE.DirectionalLight(0xd7f6ff, 1.15);
    moon.position.set(-500, 900, 400);
    moon.castShadow = true;
    moon.shadow.camera.left = -1500;
    moon.shadow.camera.right = 1500;
    moon.shadow.camera.top = 1500;
    moon.shadow.camera.bottom = -1500;
    this.scene.add(moon);

    this.makeGround();
    this.makeSky();
    this.makeGate();
    this.makeDataRiver();
    this.makeRealms();
    this.makeTablets();
    this.makeVault();
    this.makeCorvus();
    this.makeParticles();
  }

  makeGround() {
    const geo = new THREE.PlaneGeometry(3200, 3200, 120, 120);
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i), y = pos.getY(i);
      const h = Math.sin(x * 0.006) * 10 + Math.cos(y * 0.007) * 13 + Math.sin((x + y) * 0.003) * 18;
      pos.setZ(i, h);
    }
    geo.computeVertexNormals();
    const mat = new THREE.MeshStandardMaterial({ color: 0x111822, roughness: 0.92, metalness: 0.08 });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.rotation.x = -Math.PI / 2;
    mesh.receiveShadow = true;
    this.world.add(mesh);

    for (let i = 0; i < 90; i++) {
      const stone = new THREE.Mesh(
        new THREE.BoxGeometry(12 + Math.random() * 28, 20 + Math.random() * 90, 12 + Math.random() * 28),
        new THREE.MeshStandardMaterial({ color: new THREE.Color().setHSL(0.58, 0.1, 0.13 + Math.random() * 0.08), roughness: 0.86 })
      );
      stone.position.set((Math.random() - 0.5) * 2500, stone.geometry.parameters.height / 2 - 8, (Math.random() - 0.5) * 2500);
      stone.rotation.y = Math.random() * Math.PI;
      stone.castShadow = true;
      this.world.add(stone);
    }
  }

  makeSky() {
    const stars = new THREE.BufferGeometry();
    const positions = [];
    for (let i = 0; i < 900; i++) {
      positions.push((Math.random() - 0.5) * 4200, 500 + Math.random() * 1400, (Math.random() - 0.5) * 4200);
    }
    stars.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    const points = new THREE.Points(stars, new THREE.PointsMaterial({ color: 0xbceeff, size: 4, transparent: true, opacity: 0.75 }));
    this.scene.add(points);
    this.stars = points;
  }

  makeGate() {
    const mat = new THREE.MeshStandardMaterial({ color: 0x18202a, roughness: 0.74, metalness: 0.2 });
    this.gateLeft = new THREE.Mesh(new THREE.BoxGeometry(80, 380, 46), mat);
    this.gateRight = this.gateLeft.clone();
    this.gateLeft.position.set(-55, 190, 820);
    this.gateRight.position.set(55, 190, 820);
    this.gateLeft.castShadow = this.gateRight.castShadow = true;
    this.world.add(this.gateLeft, this.gateRight);
    const top = new THREE.Mesh(new THREE.BoxGeometry(220, 55, 54), mat);
    top.position.set(0, 400, 820);
    top.castShadow = true;
    this.world.add(top);
    const glow = new THREE.PointLight(0x7ee7ff, 2.2, 600);
    glow.position.set(0, 190, 790);
    this.world.add(glow);
    this.gateGlow = glow;
  }

  makeDataRiver() {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-760, 8, 620), new THREE.Vector3(-360, 10, 260), new THREE.Vector3(-120, 8, 80),
      new THREE.Vector3(110, 10, -150), new THREE.Vector3(400, 8, -360), new THREE.Vector3(710, 10, -620)
    ]);
    const geo = new THREE.TubeGeometry(curve, 90, 10, 12, false);
    const mat = new THREE.MeshBasicMaterial({ color: 0x23dfff, transparent: true, opacity: 0.38 });
    this.river = new THREE.Mesh(geo, mat);
    this.world.add(this.river);
  }

  makeRealms() {
    for (const realm of realms) {
      const group = new THREE.Group();
      group.position.set(realm.x, 0, realm.z);
      const color = new THREE.Color(realm.color);
      const base = new THREE.Mesh(
        new THREE.CylinderGeometry(80, 110, 24, 8),
        new THREE.MeshStandardMaterial({ color: 0x141b24, roughness: 0.82, metalness: 0.14 })
      );
      base.position.y = 12;
      base.castShadow = true;
      const monolith = new THREE.Mesh(
        new THREE.BoxGeometry(58, 210 + realm.elevation, 38),
        new THREE.MeshStandardMaterial({ color: 0x1d2734, roughness: 0.7, metalness: 0.25, emissive: color, emissiveIntensity: 0.08 })
      );
      monolith.position.y = 132 + realm.elevation / 2;
      monolith.castShadow = true;
      const cap = new THREE.Mesh(
        new THREE.OctahedronGeometry(36, 0),
        new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.55, roughness: 0.35 })
      );
      cap.position.y = 285 + realm.elevation;
      const light = new THREE.PointLight(color, 1.8, 420);
      light.position.y = 250;
      group.add(base, monolith, cap, light);

      realm.artifacts.forEach((artifactId, i) => {
        const angle = (i / realm.artifacts.length) * Math.PI * 2 + 0.4;
        const artifactGroup = new THREE.Group();
        artifactGroup.position.set(Math.cos(angle) * 128, 36, Math.sin(angle) * 128);
        const artifactMesh = new THREE.Mesh(
          new THREE.DodecahedronGeometry(22, 0),
          new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.36, roughness: 0.28, metalness: 0.5 })
        );
        artifactMesh.castShadow = true;
        artifactGroup.add(artifactMesh);
        group.add(artifactGroup);
        this.artifactObjects.set(artifactId, { group: artifactGroup, mesh: artifactMesh, realm, worldX: realm.x + artifactGroup.position.x, worldZ: realm.z + artifactGroup.position.z });
      });

      this.world.add(group);
      this.realmObjects.set(realm.id, { group, realm, light, cap, monolith });
    }
  }

  makeTablets() {
    tablets.forEach((text, i) => {
      const angle = (i / tablets.length) * Math.PI * 2;
      const radius = 930 + (i % 3) * 80;
      const tablet = new THREE.Mesh(
        new THREE.BoxGeometry(38, 82, 12),
        new THREE.MeshStandardMaterial({ color: 0x222832, roughness: 0.78, metalness: 0.18, emissive: 0x1b6a88, emissiveIntensity: 0.06 })
      );
      tablet.position.set(Math.cos(angle) * radius, 42, Math.sin(angle) * radius);
      tablet.rotation.y = -angle;
      tablet.castShadow = true;
      this.world.add(tablet);
      this.tabletObjects.push({ mesh: tablet, text, index: i, x: tablet.position.x, z: tablet.position.z });
    });
  }

  makeVault() {
    this.vault = new THREE.Group();
    this.vault.position.set(0, 0, 720);
    const ringMat = new THREE.MeshStandardMaterial({ color: 0x202733, roughness: 0.5, metalness: 0.45, emissive: 0x113344, emissiveIntensity: 0.12 });
    const ring = new THREE.Mesh(new THREE.TorusGeometry(90, 8, 16, 96), ringMat);
    ring.position.y = 110;
    ring.rotation.x = Math.PI / 2;
    const plinth = new THREE.Mesh(new THREE.CylinderGeometry(105, 130, 42, 10), ringMat);
    plinth.position.y = 21;
    const light = new THREE.PointLight(0xf2c76d, 2, 420);
    light.position.y = 120;
    this.vault.add(plinth, ring, light);
    this.world.add(this.vault);
  }

  makeCorvus() {
    this.corvus = new THREE.Group();
    const body = new THREE.Mesh(new THREE.ConeGeometry(18, 42, 7), new THREE.MeshStandardMaterial({ color: 0x080b0f, metalness: 0.6, roughness: 0.35, emissive: 0x003344, emissiveIntensity: 0.22 }));
    body.rotation.x = Math.PI;
    const wingGeo = new THREE.BoxGeometry(54, 4, 14);
    const wingMat = new THREE.MeshStandardMaterial({ color: 0x10151c, metalness: 0.5, roughness: 0.42 });
    const left = new THREE.Mesh(wingGeo, wingMat);
    const right = new THREE.Mesh(wingGeo, wingMat);
    left.position.set(-34, 5, 0); right.position.set(34, 5, 0);
    left.rotation.z = 0.35; right.rotation.z = -0.35;
    const eye = new THREE.PointLight(0x7ee7ff, 1.2, 120);
    eye.position.set(0, 8, -16);
    this.corvus.add(body, left, right, eye);
    this.scene.add(this.corvus);
  }

  makeParticles() {
    const geo = new THREE.BufferGeometry();
    const positions = [];
    for (let i = 0; i < 700; i++) positions.push((Math.random() - 0.5) * 2400, Math.random() * 500, (Math.random() - 0.5) * 2400);
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    this.particles = new THREE.Points(geo, new THREE.PointsMaterial({ color: 0x7ee7ff, size: 2.2, transparent: true, opacity: 0.28 }));
    this.scene.add(this.particles);
  }

  update({ player, activeRealm, discoveredArtifacts, repositories, cameraBeat }) {
    const t = this.clock.getElapsedTime();
    const cinematic = cameraBeat?.active ? Math.sin(cameraBeat.progress * Math.PI) : 0;
    const orbit = cameraBeat?.active?.id === 'arrival' ? 260 * cinematic : 0;
    this.camera.position.x += (player.x + orbit - this.camera.position.x) * 0.06;
    this.camera.position.z += (player.z + 360 + 120 * cinematic - this.camera.position.z) * 0.06;
    this.camera.position.y += (210 + 120 * cinematic - this.camera.position.y) * 0.05;
    this.camera.lookAt(player.x, 55 + 60 * cinematic, player.z - 230);

    this.gateLeft.position.x = -55 - this.mix.gate * 55;
    this.gateRight.position.x = 55 + this.mix.gate * 55;
    this.gateGlow.intensity = 1.4 + this.mix.gate * 2.8 + Math.sin(t * 2) * 0.2;
    this.river.material.opacity = 0.28 + Math.sin(t * 1.8) * 0.08;
    this.river.rotation.y = Math.sin(t * 0.08) * 0.015;

    for (const [id, item] of this.realmObjects.entries()) {
      const active = id === activeRealm;
      item.cap.rotation.y += 0.01 + (active ? 0.02 : 0);
      item.light.intensity += ((active ? 3.4 : 1.4) - item.light.intensity) * 0.05;
      item.monolith.material.emissiveIntensity += ((active ? 0.25 : 0.08) - item.monolith.material.emissiveIntensity) * 0.05;
    }

    for (const [id, item] of this.artifactObjects.entries()) {
      item.mesh.rotation.x += 0.011;
      item.mesh.rotation.y += 0.017;
      item.group.position.y = 42 + Math.sin(t * 2 + item.worldX * 0.01) * 8;
      item.mesh.material.emissiveIntensity = discoveredArtifacts.includes(id) ? 0.85 : 0.28;
    }

    this.tabletObjects.forEach((tablet, i) => {
      tablet.mesh.position.y = 42 + Math.sin(t + i) * 3;
      tablet.mesh.material.emissiveIntensity = 0.05 + Math.sin(t * 2 + i) * 0.025;
    });

    this.vault.rotation.y = Math.sin(t * 0.35) * 0.08;
    this.corvus.position.set(player.x + Math.sin(t * 0.7) * 140, 180 + Math.sin(t * 1.3) * 24, player.z - 160 + Math.cos(t * 0.5) * 90);
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
      const mesh = new THREE.Mesh(
        new THREE.IcosahedronGeometry(9, 0),
        new THREE.MeshStandardMaterial({ color: 0x72ffc2, emissive: 0x72ffc2, emissiveIntensity: 0.28, metalness: 0.5, roughness: 0.3 })
      );
      this.world.add(mesh);
      this.repoObjects.push(mesh);
    }
    repositories.forEach((repo, i) => {
      const realm = realms.find((r) => r.id === repo.realm) || realms[5];
      const mesh = this.repoObjects[i];
      const angle = t * 0.35 + i * 1.7;
      const radius = 170 + (repo.signal || 50) * 0.7;
      mesh.position.set(realm.x + Math.cos(angle) * radius, 90 + Math.sin(t + i) * 22, realm.z + Math.sin(angle) * radius);
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
