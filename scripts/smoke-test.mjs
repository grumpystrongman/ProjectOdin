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
  'src/game/fantasyArt.js',
  'src/game/githubSync.js',
  'src/game/profileImage.js',
  'src/game/projectShowcase.js',
  'src/game/resumeData.js',
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
const profileImage = fs.readFileSync(path.join(root, 'src/game/profileImage.js'), 'utf8');
const resumeData = fs.readFileSync(path.join(root, 'src/game/resumeData.js'), 'utf8');
const fantasyArt = fs.readFileSync(path.join(root, 'src/game/fantasyArt.js'), 'utf8');
const projectShowcase = fs.readFileSync(path.join(root, 'src/game/projectShowcase.js'), 'utf8');
const audio = fs.readFileSync(path.join(root, 'src/game/audio.js'), 'utf8');
const styles = fs.readFileSync(path.join(root, 'src/styles.css'), 'utf8');
const linkedinData = fs.readFileSync(path.join(root, 'public/data/linkedin-gallery.json'), 'utf8');

const checks = [
  ['Three.js scene import', scene.includes("from 'three'")],
  ['OdinScene exported', scene.includes('export class OdinScene')],
  ['Jeff Commons identity leads the site', index.includes('Jeff Barnes Commons') && index.includes('Enter the Commons')],
  ['Resume Hall wired', index.includes('resumeButton') && main.includes('openResumeHall') && resumeData.includes('Principal Enterprise Architect')],
  ['About Jeff wired', index.includes('aboutButton') && main.includes('openAboutJeff') && resumeData.includes('I build data and AI systems')],
  ['Fantasy artwork wired', fantasyArt.includes('commonsMap') && main.includes('fantasyArt')],
  ['Labeled world present', scene.includes('makeSignBoard') && content.includes('Resume Hall') && content.includes('Chronicle House') && content.includes('Leadership Library')],
  ['Jeff profile image wired with fallback', index.includes('profilePortrait') && main.includes('jeffProfileImage') && profileImage.includes('data:image/svg+xml') && main.includes('fallbackPortrait')],
  ['Music control wired', index.includes('musicButton') && index.includes('musicPauseButton') && main.includes('startMusic') && audio.includes('resume()')],
  ['Faster movement wired', main.includes('2100') && main.includes("keys.has('shift')")],
  ['LinkedIn profile wired', content.includes('https://www.linkedin.com/in/cmajeff/') && main.includes('linkedinGallery')],
  ['LinkedIn gallery export present', linkedinData.includes('linkedin-7478760880571088896') && linkedinData.includes('media.licdn.com')],
  ['Full article reader present', main.includes('articleText') && main.includes('Open original article') && main.includes('fullText')],
  ['Project showcase links present', projectShowcase.includes('ThreadlineAI') && main.includes('renderProjectShowcase')],
  ['Mobile preview panels present', main.includes('mobilePreview') && styles.includes('mobile-frame')],
  ['Readable interaction detail panel present', index.includes('detailPanel') && main.includes('openDetail') && main.includes('closeDetailPanel')],
  ['Detail panel releases pointer lock', main.includes('document.exitPointerLock') && main.includes('detailPanel.classList.remove')],
  ['Gallery images rendered with fallback', main.includes('renderGalleryCard') && main.includes('<img src=') && main.includes('onerror')],
  ['Warm fantasy audio present', audio.includes('tickMelody') && audio.includes('resume')],
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
  ['Detailed minimap roads present', main.includes('ctx.lineTo') && index.includes('minimap')],
  ['Corvus panel present', index.includes('corvusPanel')]
];

const failed = checks.filter(([, ok]) => !ok);
if (failed.length) {
  console.error('Smoke test failures:');
  for (const [name] of failed) console.error(`- ${name}`);
  process.exit(1);
}

console.log('Project ODIN immersive frontend smoke test passed.');
