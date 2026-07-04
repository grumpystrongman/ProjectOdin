import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const required = [
  'server/app/main.py',
  'src/game/apiClient.js',
  'src/game/cameraDirector.js',
  'src/game/assetManifest.js',
  'index.html',
  'src/main.js',
  'src/styles.css',
  'src/game/audio.js',
  'src/game/content.js',
  'src/game/githubSync.js',
  'src/game/scene3d.js',
  'src/game/state.js',
  'src/game/token.js',
  'src/game/trial.js',
  'public/data/linkedin-gallery.json',
  'docs/sprint-3-execution.md',
  'docs/live-github-sync.md',
  'docs/sprint-4-backlog.md'
];

const missing = required.filter((file) => !fs.existsSync(path.join(root, file)));
if (missing.length) {
  console.error(`Missing required files: ${missing.join(', ')}`);
  process.exit(1);
}

const index = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const main = fs.readFileSync(path.join(root, 'src/main.js'), 'utf8');
const scene = fs.readFileSync(path.join(root, 'src/game/scene3d.js'), 'utf8');
const trial = fs.readFileSync(path.join(root, 'src/game/trial.js'), 'utf8');
const content = fs.readFileSync(path.join(root, 'src/game/content.js'), 'utf8');
const linkedinData = fs.readFileSync(path.join(root, 'public/data/linkedin-gallery.json'), 'utf8');

const checks = [
  ['Three.js scene import', scene.includes("from 'three'")],
  ['OdinScene exported', scene.includes('export class OdinScene')],
  ['Jeff identity leads the site', index.includes('Jeff Barnes') && index.includes('Explore Jeff')],
  ['LinkedIn profile wired', content.includes('https://www.linkedin.com/in/cmajeff/') && main.includes('linkedinGallery')],
  ['LinkedIn gallery export present', linkedinData.includes('linkedin-7478760880571088896') && linkedinData.includes('media.licdn.com')],
  ['Posts gallery district present', content.includes('LinkedIn and Posts Gallery') && content.includes('post-gallery-wall')],
  ['Readable interaction detail panel present', index.includes('detailPanel') && main.includes('openDetail') && main.includes('closeDetailPanel')],
  ['Detail panel releases pointer lock', main.includes('document.exitPointerLock') && main.includes('detailPanel.classList.remove')],
  ['Gallery images rendered in detail panel', main.includes('renderGalleryCard') && main.includes('<img src=')],
  ['Pointer lock controls wired', main.includes('requestPointerLock') && main.includes('pointerlockchange')],
  ['Mouse look wired', main.includes('movementX') && main.includes('movementY')],
  ['WASD and arrow movement wired', main.includes("keys.has('w')") && main.includes("keys.has('arrowup')")],
  ['Arrow keys prevent page scrolling', main.includes('movementKeys') && main.includes('event.preventDefault()')],
  ['Mouse wheel zoom wired', main.includes("addEventListener('wheel'") && main.includes('onMouseWheel') && scene.includes('this.camera.fov')],
  ['Raycast interaction wired', scene.includes('Raycaster') && scene.includes('getFocusedInteraction')],
  ['Generic world geometry interactable', scene.includes("type: 'terrain'") && scene.includes("type: 'river'") && scene.includes("type: 'ruin'")],
  ['Reticle present', index.includes('reticle') && index.includes('interactionPrompt')],
  ['In-world vault present', scene.includes("type: 'vault'")],
  ['GLTF future asset hook present', scene.includes('loadGltfAsset')],
  ['GitHub sync wired', main.includes('syncGithubRepositories')],
  ['Trust token fallback wired', trial.includes('createTrustToken')],
  ['Readable contact card wired', trial.includes('Jeff Barnes') && trial.includes('CONTACT UNLOCKED')],
  ['Minimap present', index.includes('minimap')],
  ['Corvus panel present', index.includes('corvusPanel')]
];

const failed = checks.filter(([, ok]) => !ok);
if (failed.length) {
  console.error('Smoke test failures:');
  for (const [name] of failed) console.error(`- ${name}`);
  process.exit(1);
}

console.log('Project ODIN immersive frontend smoke test passed.');
