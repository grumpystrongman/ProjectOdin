import * as THREE from 'three';
import { WorldPassScene } from './worldPassScene.js';

function mat(color, roughness = 0.9, metalness = 0.02) {
  return new THREE.MeshStandardMaterial({ color, roughness, metalness });
}

function addMesh(group, mesh, shadow = true) {
  if (shadow) {
    mesh.castShadow = true;
    mesh.receiveShadow = true;
  }
  group.add(mesh);
  return mesh;
}

function roofSlab(width, height, depth, color = 0x3f2d26) {
  return new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), mat(color, 0.96));
}

WorldPassScene.prototype.addVillageBuilding = function addFableStyleVillageBuilding(group, buildType, color, realm) {
  const palette = {
    hall: { plaster: 0xc8b08b, trim: 0x3f2619, roof: 0x3b3130, stone: 0x5f5b51 },
    grandHall: { plaster: 0xc6b39b, trim: 0x382218, roof: 0x35333b, stone: 0x676259 },
    scribeHouse: { plaster: 0xb8a081, trim: 0x3b2116, roof: 0x513027, stone: 0x5b554b },
    forge: { plaster: 0x7f7566, trim: 0x2d1a12, roof: 0x2f2e32, stone: 0x4d4b45 },
    workshop: { plaster: 0xb89460, trim: 0x3d2417, roof: 0x533126, stone: 0x605847 },
    sanctuary: { plaster: 0xc2ad86, trim: 0x332017, roof: 0x3b3130, stone: 0x676359 },
    library: { plaster: 0xbfa887, trim: 0x2f2018, roof: 0x2f3340, stone: 0x58564f },
    marketWorkshop: { plaster: 0xbf9864, trim: 0x3b2115, roof: 0x5b3525, stone: 0x625747 },
    dojo: { plaster: 0xc8b58d, trim: 0x281914, roof: 0x24242a, stone: 0x5a554d },
    theater: { plaster: 0xb98e74, trim: 0x341b16, roof: 0x642c2c, stone: 0x5d5145 },
    wharf: { plaster: 0xa8b9a3, trim: 0x2f271e, roof: 0x4d3729, stone: 0x56615a },
    arena: { plaster: 0xb7825f, trim: 0x301b12, roof: 0x4b2a24, stone: 0x5f5146 }
  }[buildType] || { plaster: 0xbfa782, trim: 0x382116, roof: 0x473128, stone: 0x5c574d };

  const scaleBoost = buildType === 'grandHall' ? 1.22 : buildType === 'sanctuary' || buildType === 'library' ? 1.12 : 1;
  const width = 220 * scaleBoost;
  const depth = 165 * scaleBoost;
  const height = 120 * scaleBoost;
  const plaster = mat(palette.plaster, 0.94);
  const trim = mat(palette.trim, 0.9);
  const roof = mat(palette.roof, 0.98);
  const stone = mat(palette.stone, 0.96);
  const accent = mat(color || 0xf0c26f, 0.55, 0.08);

  const foundation = addMesh(group, new THREE.Mesh(new THREE.BoxGeometry(width + 36, 34, depth + 34), stone));
  foundation.position.y = 17;

  const lower = addMesh(group, new THREE.Mesh(new THREE.BoxGeometry(width, height * 0.68, depth), plaster));
  lower.position.y = 34 + height * 0.34;
  this.markInteractable(lower, { type: 'portal', id: realm.id, label: realm.name });

  const upper = addMesh(group, new THREE.Mesh(new THREE.BoxGeometry(width * 1.08, height * 0.55, depth * 0.9), plaster));
  upper.position.y = 34 + height * 0.98;
  upper.position.x = buildType === 'forge' ? -10 : buildType === 'wharf' ? 8 : 0;
  this.markInteractable(upper, { type: 'portal', id: realm.id, label: realm.name });

  const leftRoof = roofSlab(width * 1.15, 26, depth * 1.18, palette.roof);
  leftRoof.position.set(-width * 0.19, 34 + height * 1.34, 0);
  leftRoof.rotation.z = -0.48;
  const rightRoof = roofSlab(width * 1.15, 26, depth * 1.18, palette.roof);
  rightRoof.position.set(width * 0.19, 34 + height * 1.34, 0);
  rightRoof.rotation.z = 0.48;
  addMesh(group, leftRoof);
  addMesh(group, rightRoof);
  this.markInteractable(leftRoof, { type: 'portal', id: realm.id, label: realm.name });
  this.markInteractable(rightRoof, { type: 'portal', id: realm.id, label: realm.name });

  const frontGable = addMesh(group, new THREE.Mesh(new THREE.ConeGeometry(width * 0.32, height * 0.72, 3), plaster));
  frontGable.position.set(0, 34 + height * 1.2, -depth * 0.52);
  frontGable.rotation.z = Math.PI / 2;
  frontGable.scale.x = 0.9;

  const gableRoofL = roofSlab(width * 0.42, 18, depth * 0.16, palette.roof);
  gableRoofL.position.set(-width * 0.11, 34 + height * 1.39, -depth * 0.58);
  gableRoofL.rotation.z = -0.58;
  const gableRoofR = roofSlab(width * 0.42, 18, depth * 0.16, palette.roof);
  gableRoofR.position.set(width * 0.11, 34 + height * 1.39, -depth * 0.58);
  gableRoofR.rotation.z = 0.58;
  addMesh(group, gableRoofL);
  addMesh(group, gableRoofR);

  const door = addMesh(group, new THREE.Mesh(new THREE.BoxGeometry(48, 74, 12), trim));
  door.position.set(0, 70, -depth / 2 - 10);
  this.markInteractable(door, { type: 'portal', id: realm.id, label: realm.name });

  const doorArch = addMesh(group, new THREE.Mesh(new THREE.TorusGeometry(33, 5, 8, 26, Math.PI), trim));
  doorArch.position.set(0, 105, -depth / 2 - 15);
  doorArch.rotation.z = Math.PI;

  const beamPositions = [-width * 0.42, -width * 0.22, width * 0.22, width * 0.42];
  beamPositions.forEach((x, i) => {
    const beam = addMesh(group, new THREE.Mesh(new THREE.BoxGeometry(10, height * 1.2, 10), trim));
    beam.position.set(x, 34 + height * 0.72, -depth / 2 - 13);
    const brace = addMesh(group, new THREE.Mesh(new THREE.BoxGeometry(10, height * 0.82, 9), trim));
    brace.position.set(x * 0.72, 34 + height * 0.76, -depth / 2 - 14);
    brace.rotation.z = i % 2 ? -0.45 : 0.45;
  });

  [-width * 0.31, width * 0.31].forEach((x) => {
    const windowFrame = addMesh(group, new THREE.Mesh(new THREE.BoxGeometry(45, 48, 9), trim));
    windowFrame.position.set(x, 92, -depth / 2 - 14);
    const glass = addMesh(group, new THREE.Mesh(new THREE.BoxGeometry(31, 34, 11), this.materials.glass));
    glass.position.set(x, 92, -depth / 2 - 18);
    this.markInteractable(glass, { type: 'portal', id: realm.id, label: realm.name });
  });

  const sign = this.makeTextSprite(realm.name, realm.short, 0.55);
  sign.position.set(0, 162 * scaleBoost, -depth / 2 - 22);
  group.add(sign);

  const crest = addMesh(group, new THREE.Mesh(new THREE.TorusGeometry(25, 4, 8, 32), accent));
  crest.position.set(0, 185 * scaleBoost, -depth / 2 - 24);

  if (buildType === 'forge') {
    const chimney = addMesh(group, new THREE.Mesh(new THREE.BoxGeometry(38, 118, 38), stone));
    chimney.position.set(width * 0.33, 34 + height * 1.18, depth * 0.18);
    const cap = addMesh(group, new THREE.Mesh(new THREE.BoxGeometry(52, 16, 52), stone));
    cap.position.set(width * 0.33, 34 + height * 1.82, depth * 0.18);
  }

  if (buildType === 'wharf') {
    const deck = addMesh(group, new THREE.Mesh(new THREE.BoxGeometry(width * 0.9, 14, depth * 0.7), this.materials.wood));
    deck.position.set(0, 30, -depth * 0.78);
  }

  if (buildType === 'arena') {
    const ring = addMesh(group, new THREE.Mesh(new THREE.TorusGeometry(width * 0.34, 6, 8, 42), accent));
    ring.position.set(0, 48, -depth * 0.77);
    ring.rotation.x = Math.PI / 2;
  }

  return { base: lower, roof: leftRoof };
};

function installMapHintButton() {
  if (document.getElementById('mapMenuButton')) return;
  const button = document.createElement('button');
  button.id = 'mapMenuButton';
  button.className = 'map-menu-button';
  button.innerHTML = '<kbd>M</kbd><span>Map & Menu</span>';
  button.title = 'Press M to open the large map and travel menu';
  button.addEventListener('click', () => {
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'm', bubbles: true }));
  });
  document.body.appendChild(button);

  const ribbon = document.createElement('div');
  ribbon.id = 'mapHintRibbon';
  ribbon.className = 'map-hint-ribbon';
  ribbon.innerHTML = '<strong>Press M</strong> for the full map, menu, and district travel.';
  document.body.appendChild(ribbon);
  setTimeout(() => ribbon.classList.add('fade'), 9000);
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', installMapHintButton);
else installMapHintButton();
