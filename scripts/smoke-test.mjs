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

const checks = [
  ['Three.js scene import', scene.includes("from 'three'")],
  ['OdinScene exported', scene.includes('export class OdinScene')],
  ['GitHub sync wired', main.includes('syncGithubRepositories')],
  ['Trust token fallback wired', trial.includes('createTrustToken')],
  ['Minimap present', index.includes('minimap')],
  ['Corvus panel present', index.includes('corvusPanel')]
];

const failed = checks.filter(([, ok]) => !ok);
if (failed.length) {
  console.error('Smoke test failures:');
  for (const [name] of failed) console.error(`- ${name}`);
  process.exit(1);
}

console.log('Project ODIN Sprint 4 smoke test passed.');
