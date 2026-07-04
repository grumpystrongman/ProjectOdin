import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { flattenModelManifest } from './modelManifest.js';

export class CommonsModelLoader {
  constructor({ scene, anchors, terrainHeight, markInteractable }) {
    this.scene = scene;
    this.anchors = anchors;
    this.terrainHeight = terrainHeight;
    this.markInteractable = markInteractable;
    this.loader = new GLTFLoader();
    this.loaded = new Map();
    this.missing = new Set();
  }

  async hydrateAll() {
    const entries = flattenModelManifest();
    return Promise.allSettled(entries.map((entry) => this.loadEntry(entry)));
  }

  async loadEntry(entry) {
    if (entry.scatter) return this.loadScatter(entry);
    const anchor = this.anchors.get(entry.key) || null;
    const model = await this.loadModel(entry.path);
    if (!model) return null;
    this.prepareModel(model, entry);
    if (anchor) {
      model.position.set(...(entry.position || [0, 0, 0]));
      model.rotation.set(...(entry.rotation || [0, 0, 0]));
      anchor.add(model);
      if (entry.hideProcedural) this.hideProceduralChildren(anchor, model);
    } else if (entry.position) {
      model.position.set(entry.position[0], this.terrainHeight(entry.position[0], entry.position[2]) + entry.position[1], entry.position[2]);
      model.rotation.set(...(entry.rotation || [0, 0, 0]));
      this.scene.add(model);
    }
    this.loaded.set(entry.key, model);
    return model;
  }

  async loadScatter(entry) {
    const source = await this.loadModel(entry.path);
    if (!source) return null;
    const group = new THREE.Group();
    for (let i = 0; i < (entry.count || 12); i += 1) {
      const clone = source.clone(true);
      const angle = Math.random() * Math.PI * 2;
      const radius = 420 + Math.random() * 1120;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      clone.position.set(x, this.terrainHeight(x, z), z);
      clone.rotation.y = Math.random() * Math.PI * 2;
      clone.scale.setScalar((entry.scale || 1) * (0.72 + Math.random() * 0.62));
      clone.traverse((obj) => {
        if (obj.isMesh) {
          obj.castShadow = true;
          obj.receiveShadow = true;
          this.markInteractable?.(obj, { type: 'ruin', id: entry.key, label: entry.label });
        }
      });
      group.add(clone);
    }
    this.scene.add(group);
    this.loaded.set(entry.key, group);
    return group;
  }

  async loadModel(path) {
    try {
      const gltf = await this.loader.loadAsync(path);
      return gltf.scene;
    } catch {
      this.missing.add(path);
      return null;
    }
  }

  prepareModel(model, entry) {
    model.name = entry.label || entry.key;
    model.scale.setScalar(entry.scale || 1);
    model.traverse((obj) => {
      if (obj.isMesh) {
        obj.castShadow = true;
        obj.receiveShadow = true;
        if (entry.label) this.markInteractable?.(obj, { type: entry.key === 'vault' ? 'vault' : 'ruin', id: entry.key, label: entry.label });
      }
    });
  }

  hideProceduralChildren(anchor, model) {
    anchor.children.forEach((child) => {
      if (child !== model && !child.isLight && child.type !== 'Sprite') child.visible = false;
    });
  }
}
