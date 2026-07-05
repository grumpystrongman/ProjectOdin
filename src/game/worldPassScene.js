import * as THREE from 'three';
import { OdinScene } from './scene3d.js';
import { realms } from './content.js';

const PROXY_MATERIAL = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false });

const COMPOSITION_COTTAGES = [
  [-360, 760, 0.35, 0.78], [340, 760, -0.35, 0.78],
  [-500, 300, 1.05, 0.68], [520, 315, -1.05, 0.68],
  [-110, 735, 0.08, 0.58], [110, 735, -0.08, 0.58]
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
        const aProxy = a.object.userData.proxy ? -0.12 : 0;
        const bProxy = b.object.userData.proxy ? -0.12 : 0;
        return aTerrain - bTerrain || (a.distance + aProxy) - (b.distance + bProxy);
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

  addWorldPassComposition() {
    this.addArrivalRoad();
    this.addCommonsRing();
    this.addCottagesAndFrames();
    this.addWayfindingStones();
  }

  addArrivalRoad() {
    const road = new THREE.Mesh(new THREE.BoxGeometry(120, 5, 760), this.materials.path);
    road.position.set(0, this.terrainHeight(0, 690) + 4, 690);
    road.receiveShadow = true;
    this.world.add(road);

    for (let i = 0; i < 9; i++) {
      const z = 980 - i * 72;
      this.addLampPost(-88, this.terrainHeight(-88, z), z, 100 + i);
      this.addLampPost(88, this.terrainHeight(88, z), z, 130 + i);
    }
  }

  addCommonsRing() {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(274, 10, 12, 88), this.materials.stone);
    ring.position.set(0, this.terrainHeight(0, 260) + 9, 260);
    ring.rotation.x = Math.PI / 2;
    ring.receiveShadow = true;
    this.world.add(ring);

    const inner = new THREE.Mesh(new THREE.CylinderGeometry(160, 174, 4, 72), this.materials.dirt);
    inner.position.set(0, this.terrainHeight(0, 260) + 4, 260);
    inner.receiveShadow = true;
    this.world.add(inner);
  }

  addCottagesAndFrames() {
    COMPOSITION_COTTAGES.forEach(([x, z, rotation, scale], i) => {
      const group = new THREE.Group();
      group.position.set(x, this.terrainHeight(x, z), z);
      group.rotation.y = rotation;
      const base = new THREE.Mesh(new THREE.BoxGeometry(150 * scale, 74 * scale, 112 * scale), this.materials.plaster);
      base.position.y = 37 * scale;
      const roof = new THREE.Mesh(new THREE.ConeGeometry(96 * scale, 64 * scale, 4), this.materials.roof);
      roof.position.y = 100 * scale;
      roof.rotation.y = Math.PI / 4;
      const door = new THREE.Mesh(new THREE.BoxGeometry(28 * scale, 48 * scale, 7 * scale), this.materials.wood);
      door.position.set(0, 29 * scale, -59 * scale);
      [base, roof, door].forEach((part) => { part.castShadow = true; part.receiveShadow = true; group.add(part); });
      this.world.add(group);
      this.collisionBlocks.push({ x, z, radius: 82 * scale, label: `background cottage ${i + 1}` });
    });

    [-1, 1].forEach((side) => {
      for (let i = 0; i < 8; i++) {
        const z = 855 - i * 82;
        this.addFenceSegment(side * 172, z, Math.PI / 2);
      }
    });
  }

  addWayfindingStones() {
    const markers = [
      ['Resume Hall', -250, 345, -0.58],
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
    this.collisionBlocks.push({ x, z, radius: 34, label: 'village fence' });
  }

  buildCollisionModel() {
    realms.forEach((realm) => this.collisionBlocks.push({ x: realm.x, z: realm.z, radius: realm.id === 'about' ? 170 : 150, label: realm.name }));
    this.collisionBlocks.push({ x: 0, z: 850, radius: 124, label: 'Contact Tower' });
    [
      [-120, 420, 70], [150, 420, 62], [-500, 420, 86], [510, 410, 58],
      [-120, -150, 54], [760, 520, 70], [-850, -450, 60]
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
