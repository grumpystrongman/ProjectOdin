import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { WorldPassScene } from './worldPassScene.js';

const asset = (path) => path.replaceAll(' ', '%20');

const PLACEMENTS = [
  { id: 'commons-fountain', path: '/assets/vendor/kenney-fantasy-town-kit/Models/GLB format/fountain-round.glb', x: 0, z: 260, y: 12, scale: 74, rotation: 0 },
  { id: 'arrival-gate', path: '/assets/vendor/kenney-castle-kit/Models/GLB format/gate.glb', x: 0, z: 930, y: 0, scale: 62, rotation: Math.PI },
  { id: 'contact-tower-base', path: '/assets/vendor/kenney-castle-kit/Models/GLB format/tower-square-base.glb', x: 0, z: 850, y: 0, scale: 62, rotation: 0 },
  { id: 'contact-tower-top', path: '/assets/vendor/kenney-castle-kit/Models/GLB format/tower-square-top-roof-high.glb', x: 0, z: 850, y: 92, scale: 62, rotation: 0 },
  { id: 'bridge-west', path: '/assets/vendor/kenney-castle-kit/Models/GLB format/bridge-straight.glb', x: -90, z: 210, y: 7, scale: 92, rotation: -0.72 },
  { id: 'bridge-east', path: '/assets/vendor/kenney-castle-kit/Models/GLB format/bridge-straight.glb', x: 520, z: -185, y: 7, scale: 92, rotation: -0.72 },
  { id: 'market-stall-green', path: '/assets/vendor/kenney-fantasy-town-kit/Models/GLB format/stall-green.glb', x: 255, z: 410, y: 0, scale: 58, rotation: -0.7 },
  { id: 'market-stall-red', path: '/assets/vendor/kenney-fantasy-town-kit/Models/GLB format/stall-red.glb', x: -255, z: 412, y: 0, scale: 58, rotation: 0.7 },
  { id: 'market-cart', path: '/assets/vendor/kenney-fantasy-town-kit/Models/GLB format/cart-high.glb', x: -120, z: 435, y: 0, scale: 58, rotation: -0.35 },
  { id: 'project-cart', path: '/assets/vendor/kenney-fantasy-town-kit/Models/GLB format/cart.glb', x: 710, z: 510, y: 0, scale: 58, rotation: 0.45 },
  { id: 'commons-lantern-a', path: '/assets/vendor/kenney-fantasy-town-kit/Models/GLB format/lantern.glb', x: -145, z: 335, y: 32, scale: 48, rotation: 0 },
  { id: 'commons-lantern-b', path: '/assets/vendor/kenney-fantasy-town-kit/Models/GLB format/lantern.glb', x: 145, z: 335, y: 32, scale: 48, rotation: 0 },
  { id: 'resume-banner', path: '/assets/vendor/kenney-fantasy-town-kit/Models/GLB format/banner-red.glb', x: -635, z: 205, y: 80, scale: 52, rotation: 0.88 },
  { id: 'leadership-banner', path: '/assets/vendor/kenney-fantasy-town-kit/Models/GLB format/banner-green.glb', x: 315, z: -545, y: 80, scale: 52, rotation: -0.55 },
  { id: 'proving-gate', path: '/assets/vendor/kenney-castle-kit/Models/GLB format/gate.glb', x: 1040, z: -292, y: 0, scale: 52, rotation: -0.6 },
  { id: 'proving-red-banner', path: '/assets/vendor/kenney-fantasy-town-kit/Models/GLB format/banner-red.glb', x: 960, z: -360, y: 72, scale: 52, rotation: -0.6 },
  { id: 'proving-green-banner', path: '/assets/vendor/kenney-fantasy-town-kit/Models/GLB format/banner-green.glb', x: 1122, z: -500, y: 72, scale: 52, rotation: -0.6 },
  { id: 'proving-rock-large', path: '/assets/vendor/kenney-fantasy-town-kit/Models/GLB format/rock-large.glb', x: 918, z: -520, y: 4, scale: 70, rotation: 0.25 },
  { id: 'proving-rock-wide', path: '/assets/vendor/kenney-fantasy-town-kit/Models/GLB format/rock-wide.glb', x: 1160, z: -360, y: 4, scale: 70, rotation: -0.55 },
  { id: 'proving-cart', path: '/assets/vendor/kenney-fantasy-town-kit/Models/GLB format/cart-high.glb', x: 1088, z: -590, y: 0, scale: 55, rotation: 0.95 },
  { id: 'fence-left-1', path: '/assets/vendor/kenney-fantasy-town-kit/Models/GLB format/fence.glb', x: -245, z: 850, y: 0, scale: 70, rotation: Math.PI / 2 },
  { id: 'fence-left-2', path: '/assets/vendor/kenney-fantasy-town-kit/Models/GLB format/fence.glb', x: -245, z: 710, y: 0, scale: 70, rotation: Math.PI / 2 },
  { id: 'fence-right-1', path: '/assets/vendor/kenney-fantasy-town-kit/Models/GLB format/fence.glb', x: 245, z: 850, y: 0, scale: 70, rotation: Math.PI / 2 },
  { id: 'fence-right-2', path: '/assets/vendor/kenney-fantasy-town-kit/Models/GLB format/fence.glb', x: 245, z: 710, y: 0, scale: 70, rotation: Math.PI / 2 },
  { id: 'tree-high-a', path: '/assets/vendor/kenney-fantasy-town-kit/Models/GLB format/tree-high.glb', x: -860, z: 790, y: 0, scale: 80, rotation: 0.1 },
  { id: 'tree-high-b', path: '/assets/vendor/kenney-fantasy-town-kit/Models/GLB format/tree-high-round.glb', x: 890, z: 770, y: 0, scale: 80, rotation: -0.3 },
  { id: 'tree-crooked-a', path: '/assets/vendor/kenney-fantasy-town-kit/Models/GLB format/tree-crooked.glb', x: -1020, z: 330, y: 0, scale: 76, rotation: 0.5 },
  { id: 'tree-crooked-b', path: '/assets/vendor/kenney-fantasy-town-kit/Models/GLB format/tree-high-crooked.glb', x: 1030, z: -245, y: 0, scale: 76, rotation: -0.45 },
  { id: 'rock-river-a', path: '/assets/vendor/kenney-fantasy-town-kit/Models/GLB format/rock-large.glb', x: -360, z: 325, y: 4, scale: 62, rotation: 0.2 },
  { id: 'rock-river-b', path: '/assets/vendor/kenney-fantasy-town-kit/Models/GLB format/rock-wide.glb', x: 405, z: -60, y: 4, scale: 62, rotation: -0.35 }
];

function configureModel(root, scene) {
  root.traverse((node) => {
    if (!node.isMesh) return;
    node.castShadow = true;
    node.receiveShadow = true;
    if (node.material) {
      node.material.roughness = Math.max(node.material.roughness ?? 0.75, 0.72);
      node.material.metalness = Math.min(node.material.metalness ?? 0.05, 0.12);
    }
  });
  scene.world.add(root);
}

export function installVendorAssetLayer(scene) {
  if (scene.__vendorAssetLayerInstalled) return;
  scene.__vendorAssetLayerInstalled = true;

  const loader = new GLTFLoader();
  const group = new THREE.Group();
  group.name = 'Kenney CC0 GLB asset layer';
  scene.world.add(group);
  scene.vendorAssetLayer = group;

  for (const placement of PLACEMENTS) {
    loader.load(
      asset(placement.path),
      (gltf) => {
        const model = gltf.scene;
        model.name = placement.id;
        model.position.set(placement.x, scene.terrainHeight(placement.x, placement.z) + placement.y, placement.z);
        model.rotation.y = placement.rotation || 0;
        model.scale.setScalar(placement.scale || 1);
        configureModel(model, scene);
        group.add(model);
      },
      undefined,
      (error) => {
        console.warn(`Vendor asset failed to load: ${placement.id}`, error);
      }
    );
  }
}

const originalInit = WorldPassScene.prototype.init;
WorldPassScene.prototype.init = function patchedWorldPassInit(...args) {
  originalInit.apply(this, args);
  installVendorAssetLayer(this);
};
