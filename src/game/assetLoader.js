import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { assetRegistry } from './assetRegistry.js';

const DEFAULT_OPTIONS = {
  maxPriority: 3,
  receiveShadow: true,
  castShadow: true,
  log: true
};

export class OdinAssetLoader {
  constructor(sceneController, options = {}) {
    this.sceneController = sceneController;
    this.options = { ...DEFAULT_OPTIONS, ...options };
    this.loader = new GLTFLoader();
    this.cache = new Map();
    this.loaded = new Map();
    this.failed = new Map();
  }

  async loadRegisteredAssets(slots = assetRegistry.slots) {
    const candidates = slots
      .filter((slot) => slot.priority <= this.options.maxPriority)
      .sort((a, b) => a.priority - b.priority);

    const results = await Promise.allSettled(candidates.map((slot) => this.loadSlot(slot)));
    return {
      loaded: [...this.loaded.keys()],
      failed: [...this.failed.keys()],
      results
    };
  }

  async loadSlot(slot) {
    if (!slot?.path) return null;

    const targets = this.resolveTargets(slot);
    if (!targets.length) return null;

    try {
      const source = await this.getSource(slot.path);
      const mounted = [];

      for (const target of targets) {
        const instance = source.clone(true);
        this.applyTransform(instance, slot.transform);
        this.prepareShadows(instance);
        target.add(instance);
        mounted.push(instance);

        if (slot.target?.hideFallback) this.hideProceduralFallback(target, instance);
      }

      this.loaded.set(slot.id, { slot, mounted });
      return mounted;
    } catch (error) {
      this.failed.set(slot.id, error);
      if (this.options.log) {
        console.info(`[assets] GLB unavailable for ${slot.id}; keeping procedural fallback.`, slot.path);
      }
      return null;
    }
  }

  async getSource(path) {
    if (this.cache.has(path)) return this.cache.get(path);
    const gltf = await this.loader.loadAsync(path);
    const source = gltf.scene || new THREE.Group();
    this.cache.set(path, source);
    return source;
  }

  resolveTargets(slot) {
    const target = slot.target || {};
    if (target.collection === 'signs') return this.sceneController.signs || [];
    if (target.collection && Array.isArray(this.sceneController[target.collection])) return this.sceneController[target.collection];

    const anchor = target.anchor ? this.sceneController.getAssetAnchor?.(target.anchor) : null;
    return anchor ? [anchor] : [];
  }

  applyTransform(object, transform = {}) {
    const [px = 0, py = 0, pz = 0] = transform.position || [];
    const [rx = 0, ry = 0, rz = 0] = transform.rotation || [];
    object.position.add(new THREE.Vector3(px, py, pz));
    object.rotation.x += rx;
    object.rotation.y += ry;
    object.rotation.z += rz;
    object.scale.multiplyScalar(transform.scale ?? 1);
  }

  prepareShadows(object) {
    object.traverse?.((child) => {
      if (!child.isMesh) return;
      child.castShadow = this.options.castShadow;
      child.receiveShadow = this.options.receiveShadow;
    });
  }

  hideProceduralFallback(anchor, loadedInstance) {
    for (const child of anchor.children) {
      if (child === loadedInstance) continue;
      if (child.userData?.keepWithModel) continue;
      child.visible = false;
    }
  }
}

export async function attachConfiguredAssets(sceneController, options = {}) {
  const assetLoader = new OdinAssetLoader(sceneController, options);
  sceneController.assetLoader = assetLoader;
  sceneController.assetLoadState = await assetLoader.loadRegisteredAssets();
  return sceneController.assetLoadState;
}
