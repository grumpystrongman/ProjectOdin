import * as THREE from 'three';
import { realms, artifacts, corvusLines, achievements, githubSeeds } from './content.js';
import { WorldPassScene } from './worldPassScene.js';

function ensureRealm(realm) {
  const existing = realms.find((item) => item.id === realm.id);
  if (existing) Object.assign(existing, realm);
  else realms.push(realm);
}

function ensureArtifact(id, artifact) {
  artifacts[id] = { ...(artifacts[id] || {}), ...artifact };
}

ensureRealm({
  id: 'youtube',
  name: 'YouTube Theater',
  short: 'YOUTUBE',
  x: -1120,
  z: 60,
  color: '#ff6a61',
  stem: 'theater',
  elevation: 18,
  title: 'Videos, demos, talks, and public storytelling',
  body: 'A small lantern theater for future YouTube content, demos, explainers, humor, leadership stories, AI walkthroughs, and project showcases.',
  plain: 'YouTube channel, video concepts, demos, talks, shorts, and public storytelling.',
  quest: 'Visit the YouTube Theater to see Jeff’s video and demo roadmap.',
  artifacts: ['youtube-stage', 'demo-reel', 'shorts-lantern']
});

ensureRealm({
  id: 'fishing',
  name: 'Angler’s Wharf',
  short: 'FISHING',
  x: 1130,
  z: 260,
  color: '#5fd1c7',
  stem: 'wharf',
  elevation: 12,
  title: 'Fishing, travel, water, and outdoor interests',
  body: 'A riverside wharf for fishing, Alaska planning, halibut and salmon dreams, quiet water, travel, and the parts of life that keep work grounded.',
  plain: 'Fishing interests, Alaska, riverside travel, outdoor stories, and personal adventure.',
  quest: 'Walk to the Angler’s Wharf to see the outdoor and fishing side of the village.',
  artifacts: ['alaska-chart', 'halibut-hook', 'river-logbook']
});

ensureRealm({
  id: 'martial',
  name: 'Hall of Disciplines',
  short: 'MARTIAL ARTS',
  x: -1080,
  z: -270,
  color: '#f1c453',
  stem: 'dojo',
  elevation: 20,
  title: 'Martial arts history, lineage, discipline, and teaching',
  body: 'A dedicated hall for Jeff’s martial arts background, teaching lineages, rank history, Kyusho work, BJJ, and the founding of Feng Xiao Zhang Kung Fu as his own spinoff style.',
  plain: 'Feng Xiao Zhang Kung Fu, Tae Kwon Do, Karate, Xiao Zhang Kung Fu, Jew Gar Tang Kwan, Kyusho Jitsu, and BJJ.',
  quest: 'Enter the Hall of Disciplines to read the lineage scrolls.',
  artifacts: ['feng-xiao-zhang-seal', 'rudibaugh-lineage-scroll', 'xiao-zhang-scroll', 'jew-gar-tang-kwan-tablet', 'kyusho-bjj-mat']
});

ensureRealm({
  id: 'extreme-sports',
  name: 'Proving Grounds',
  short: 'EXTREME SPORTS',
  x: 1040,
  z: -430,
  color: '#ff5f45',
  stem: 'arena',
  elevation: 18,
  title: 'Strength, endurance, obstacle racing, and armored combat',
  body: 'A rugged arena for the physical side of Jeff’s story: power lifting, strongman competitions, Spartan Trifectas, half marathons, ultra marathons, and fighting for Team USA in Bohurt in Barcelona, Spain, and Rome.',
  plain: 'Power lifting, strongman, Spartan Trifectas, endurance running, ultra marathons, and Team USA Bohurt.',
  quest: 'Enter the Proving Grounds to see the competitions, endurance events, and combat sports that shaped Jeff’s grit.',
  artifacts: ['iron-platform', 'strongman-stones', 'spartan-trifecta-shield', 'ultra-trail-markers', 'bohurt-team-usa-banner']
});

ensureArtifact('youtube-stage', { realm: 'youtube', title: 'Video Stage', type: 'YouTube', body: 'A future home for long-form videos, demos, project walkthroughs, leadership lessons, and AI/analytics explanations.' });
ensureArtifact('demo-reel', { realm: 'youtube', title: 'Demo Reel', type: 'Demos', body: 'Short demos for Project Odin, ThreadlineAI, analytics workflows, and code experiments.' });
ensureArtifact('shorts-lantern', { realm: 'youtube', title: 'Shorts Lantern', type: 'Short Form', body: 'A place for funny, sharp, useful short-form videos across leadership, technology, spooky creative work, and practical career lessons.' });
ensureArtifact('alaska-chart', { realm: 'fishing', title: 'Alaska Chart', type: 'Travel / Fishing', body: 'A future travel and fishing board for Alaska, halibut, salmon, anniversary travel, and outdoor adventure.' });
ensureArtifact('halibut-hook', { realm: 'fishing', title: 'Halibut Hook', type: 'Fishing', body: 'Fishing belongs in the village because the site should show the full person, not only the executive résumé.' });
ensureArtifact('river-logbook', { realm: 'fishing', title: 'River Logbook', type: 'Outdoor Life', body: 'A logbook for fishing stories, outdoor interests, motorcycle backroads, and the quieter side of exploration.' });
ensureArtifact('feng-xiao-zhang-seal', { realm: 'martial', title: 'Feng Xiao Zhang Founder Seal', type: 'Founder / GrandMaster', body: 'Founder GrandMaster Feng Xiao Zhang Kung Fu. This should be presented as Jeff’s own spinoff style and personal martial expression.' });
ensureArtifact('rudibaugh-lineage-scroll', { realm: 'martial', title: 'Rudibaugh Lineage Scroll', type: 'Tae Kwon Do / Karate', body: '6th Degree Master Sun Do Won Tae Kwon Do under Master Ken Rudibaugh, and 6th Degree Master Karate through Art of Karate from Master James Rudibaugh.' });
ensureArtifact('xiao-zhang-scroll', { realm: 'martial', title: 'Xiao Zhang Kung Fu Scroll', type: 'Kung Fu', body: '5th Degree Master Xiao Zhang Kung Fu under Master James Dean.' });
ensureArtifact('jew-gar-tang-kwan-tablet', { realm: 'martial', title: 'Jew Gar Tang Kwan Tablet', type: 'Instructor Lineage', body: '5th Degree Instructor Jew Gar Tang Kwan under Master Raymon Pridgen.' });
ensureArtifact('kyusho-bjj-mat', { realm: 'martial', title: 'Kyusho and BJJ Mat', type: 'Pressure Points / Grappling', body: 'PL-1 Instructor Kyusho Jitsu through Evan Pantazi, James Corn, and Kyusho International; Blue Belt BJJ from Ring Lords Vale Tudo in Cary, NC.' });
ensureArtifact('iron-platform', { realm: 'extreme-sports', title: 'Iron Platform', type: 'Power Lifting', body: 'Power lifting: disciplined heavy training, technical lifts, patient progression, and strength built over time.' });
ensureArtifact('strongman-stones', { realm: 'extreme-sports', title: 'Strongman Stones', type: 'Strongman Competitions', body: 'Strongman competitions: odd-object strength, loading, carrying, pressing, pulling, and doing hard things without perfect conditions.' });
ensureArtifact('spartan-trifecta-shield', { realm: 'extreme-sports', title: 'Spartan Trifecta Shield', type: 'Obstacle Racing', body: 'Multiple Spartan Trifectas completed across Sprint, Super, and Beast distances: mud, climbs, carries, obstacles, and long-course problem solving under fatigue.' });
ensureArtifact('ultra-trail-markers', { realm: 'extreme-sports', title: 'Ultra Trail Markers', type: 'Endurance Running', body: 'Completed half marathons and two ultra marathons: Dances with Dirt 50K and Huff 50K.' });
ensureArtifact('bohurt-team-usa-banner', { realm: 'extreme-sports', title: 'Team USA Bohurt Banner', type: 'Armored Combat', body: 'Fought for Team USA in Bohurt in Barcelona, Spain, and Rome. Full-contact armored combat gives the Proving Grounds its battle-ring identity.' });

artifacts['github-forge'] = {
  ...artifacts['github-forge'],
  action: 'github',
  body: 'Open Jeff’s GitHub profile and featured repositories: ThreadlineAI, Project Odin, OpenAegis, OpenPulse, and other active build work.'
};

githubSeeds.push(
  { repo: 'GitHub Profile', title: 'All public repositories and build activity', realm: 'workshop', status: 'live', signal: 100, language: 'Portfolio', url: 'https://github.com/grumpystrongman' }
);

corvusLines.idle = ['Welcome to Jeff Barnes Commons.', 'Every destination has a home now: resume, writing, projects, AI, healthcare, leadership, code, YouTube, fishing, martial arts, extreme sports, and contact.', 'Open the map to travel directly to any named district.'];
corvusLines.youtube = ['The YouTube Theater is for demos, public voice, humor, and future channel work.'];
corvusLines.fishing = ['Angler’s Wharf keeps the village honest: work is not the whole life.'];
corvusLines.martial = ['The Hall of Disciplines records lineage, practice, teaching, and controlled force.'];
corvusLines['extreme-sports'] = ['The Proving Grounds remember what the office cannot see: strength, endurance, and grit under load.'];
achievements.extremeSports = { title: 'Entered the Proving Grounds', text: 'Discovered Jeff’s strength, endurance, obstacle racing, and armored combat history.' };
achievements.martialHall = { title: 'Entered the Hall of Disciplines', text: 'Discovered Jeff’s martial arts lineage and teaching history.' };

function material(color, roughness = 0.9) {
  return new THREE.MeshStandardMaterial({ color, roughness, metalness: 0.02 });
}

WorldPassScene.prototype.makeTextSprite = function makePhysicalTextPanel(title, subtitle, scale = 1) {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 384;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#5b3519';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = 'rgba(20,10,5,.35)';
  for (let i = 0; i < 90; i++) ctx.fillRect(Math.random() * 1024, Math.random() * 384, 2 + Math.random() * 34, 1);
  ctx.strokeStyle = '#f0c26f';
  ctx.lineWidth = 14;
  ctx.strokeRect(26, 26, 972, 332);
  ctx.fillStyle = '#ffe8b5';
  ctx.font = '700 58px Georgia';
  ctx.textAlign = 'center';
  ctx.fillText(title, 512, 142);
  ctx.fillStyle = 'rgba(255,232,181,.84)';
  ctx.font = '500 28px Georgia';
  this.wrapText(ctx, subtitle || '', 512, 206, 850, 40);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(180 * scale, 68 * scale), new THREE.MeshBasicMaterial({ map: texture, transparent: true }));
  return mesh;
};

WorldPassScene.prototype.makeSignBoard = function makeGroundedSignBoard(title, subtitle, x, y, z, scale = 1) {
  const group = new THREE.Group();
  group.position.set(x, this.terrainHeight(x, z) + Math.min(y, 88), z);
  const postL = new THREE.Mesh(new THREE.CylinderGeometry(5 * scale, 7 * scale, 96 * scale, 8), this.materials.wood);
  const postR = postL.clone();
  postL.position.set(-72 * scale, -46 * scale, 0);
  postR.position.set(72 * scale, -46 * scale, 0);
  const board = new THREE.Mesh(new THREE.BoxGeometry(192 * scale, 70 * scale, 10 * scale), this.materials.sign);
  const label = this.makeTextSprite(title, subtitle, scale);
  label.position.set(0, 3 * scale, -7 * scale);
  group.add(postL, postR, board, label);
  group.lookAt(0, group.position.y, 260);
  group.traverse((part) => { if (part.isMesh) { part.castShadow = true; part.receiveShadow = true; } });
  this.world.add(group);
  this.signs.push(group);
  return board;
};

WorldPassScene.prototype.addFenceArc = function skipBadFenceArcs() {};

WorldPassScene.prototype.makeTreesAndFences = function makeCuratedStorybookTrees() {
  const treeSpots = [
    [-1320, 820, 1.25, 'oak'], [-1160, 590, 1.05, 'willow'], [-940, 815, 1.15, 'oak'], [-780, 980, 1.05, 'willow'],
    [820, 1020, 1.15, 'oak'], [1040, 820, 1.3, 'willow'], [1310, 620, 1.1, 'oak'], [1260, 250, 1.0, 'willow'],
    [-1320, -120, 1.1, 'oak'], [-1240, -480, 1.25, 'willow'], [-880, -1020, 1.05, 'oak'], [-430, -1240, 1.0, 'willow'],
    [240, -1240, 1.08, 'oak'], [730, -1090, 1.16, 'willow'], [1180, -760, 1.1, 'oak'], [1320, -330, 1.18, 'willow']
  ];
  treeSpots.forEach(([x, z, scale, type], index) => this.addStorybookTree(x, z, scale, type, index));
};

WorldPassScene.prototype.addStorybookTree = function addStorybookTree(x, z, scale = 1, type = 'oak', index = 0) {
  const y = this.terrainHeight(x, z);
  const group = new THREE.Group();
  group.position.set(x, y, z);
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(12 * scale, 20 * scale, 92 * scale, 12), this.materials.bark);
  trunk.position.y = 46 * scale;
  trunk.rotation.z = type === 'willow' ? Math.sin(index) * 0.08 : 0;
  const crownMat = material(type === 'willow' ? 0x6b8f3a : 0x4f7f35, 0.94);
  const crownParts = type === 'willow' ? 5 : 4;
  for (let i = 0; i < crownParts; i++) {
    const crown = new THREE.Mesh(new THREE.SphereGeometry((48 + i * 5) * scale, 18, 12), crownMat);
    crown.scale.set(1.1 + (i % 2) * 0.25, type === 'willow' ? 1.45 : 0.82, 1.0);
    crown.position.set((i - 2) * 22 * scale, (105 + Math.sin(i) * 18) * scale, Math.cos(i * 1.7) * 20 * scale);
    crown.castShadow = true;
    group.add(crown);
  }
  trunk.castShadow = true;
  group.add(trunk);
  this.world.add(group);
};

WorldPassScene.prototype.makeVillageProps = function makeSaferVillageProps() {
  [[-260, 230], [260, 250], [360, -250], [760, 520]].forEach(([x, z], i) => this.addLampPost(x, this.terrainHeight(x, z), z, i));
};

WorldPassScene.prototype.makeParticles = function makeSubtleParticles() {
  const geo = new THREE.BufferGeometry();
  const positions = [];
  for (let i = 0; i < 120; i++) positions.push((Math.random() - 0.5) * 2500, 90 + Math.random() * 260, (Math.random() - 0.5) * 2500);
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  this.particles = new THREE.Points(geo, new THREE.PointsMaterial({ color: 0xffe2a3, size: 2.2, transparent: true, opacity: 0.2 }));
  this.scene.add(this.particles);
};
