import { createWriteStream, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { dirname, extname, join, relative, resolve } from 'node:path';
import { pipeline } from 'node:stream/promises';
import { spawnSync } from 'node:child_process';
import https from 'node:https';
import http from 'node:http';

const root = resolve(process.cwd());
const publicDir = join(root, 'public');
const vendorDir = join(publicDir, 'assets', 'vendor');
const downloadsDir = join(vendorDir, '_downloads');
const textureDir = join(publicDir, 'assets', 'textures');
const audioDir = join(publicDir, 'assets', 'audio');

const downloads = [
  {
    id: 'kenney-fantasy-town-kit',
    kind: 'zip',
    url: 'https://kenney.nl/media/pages/assets/fantasy-town-kit/efe948d309-1754222374/kenney_fantasy-town-kit_2.0.zip',
    file: join(downloadsDir, 'kenney_fantasy-town-kit_2.0.zip'),
    outDir: join(vendorDir, 'kenney-fantasy-town-kit'),
    source: 'Kenney Fantasy Town Kit',
    license: 'Creative Commons CC0'
  },
  {
    id: 'kenney-nature-kit',
    kind: 'zip',
    url: 'https://kenney.nl/media/pages/assets/nature-kit/37ac38a37b-1677698939/kenney_nature-kit.zip',
    file: join(downloadsDir, 'kenney_nature-kit.zip'),
    outDir: join(vendorDir, 'kenney-nature-kit'),
    source: 'Kenney Nature Kit',
    license: 'Creative Commons CC0'
  },
  {
    id: 'kenney-castle-kit',
    kind: 'zip',
    url: 'https://kenney.nl/media/pages/assets/castle-kit/a395102d20-1711543616/kenney_castle-kit.zip',
    file: join(downloadsDir, 'kenney_castle-kit.zip'),
    outDir: join(vendorDir, 'kenney-castle-kit'),
    source: 'Kenney Castle Kit',
    license: 'Creative Commons CC0'
  },
  {
    id: 'cobblestone-diffuse',
    kind: 'file',
    url: 'https://dl.polyhaven.org/file/ph-assets/Textures/jpg/1k/cobblestone_floor_08/cobblestone_floor_08_diff_1k.jpg',
    file: join(textureDir, 'cobblestone_floor_08_diff_1k.jpg'),
    source: 'Poly Haven Cobblestone Floor 08',
    license: 'Creative Commons CC0'
  },
  {
    id: 'cobblestone-normal',
    kind: 'file',
    url: 'https://dl.polyhaven.org/file/ph-assets/Textures/jpg/1k/cobblestone_floor_08/cobblestone_floor_08_nor_gl_1k.jpg',
    file: join(textureDir, 'cobblestone_floor_08_nor_gl_1k.jpg'),
    source: 'Poly Haven Cobblestone Floor 08',
    license: 'Creative Commons CC0'
  },
  {
    id: 'cobblestone-rough',
    kind: 'file',
    url: 'https://dl.polyhaven.org/file/ph-assets/Textures/jpg/1k/cobblestone_floor_08/cobblestone_floor_08_rough_1k.jpg',
    file: join(textureDir, 'cobblestone_floor_08_rough_1k.jpg'),
    source: 'Poly Haven Cobblestone Floor 08',
    license: 'Creative Commons CC0'
  },
  {
    id: 'village-loop',
    kind: 'file',
    url: 'https://incompetech.com/music/royalty-free/mp3-royaltyfree/River%20Flute.mp3',
    file: join(audioDir, 'fable-village-loop.mp3'),
    source: 'River Flute by Kevin MacLeod',
    license: 'Creative Commons Attribution 4.0'
  }
];

function ensureDir(path) {
  mkdirSync(path, { recursive: true });
}

async function download(url, file) {
  ensureDir(dirname(file));
  if (existsSync(file) && statSync(file).size > 1024) return;
  await new Promise((resolvePromise, reject) => {
    const request = (target, redirects = 0) => {
      const client = target.startsWith('https:') ? https : http;
      const req = client.get(target, { headers: { 'User-Agent': 'ProjectOdinAssetDownloader/1.0' } }, async (res) => {
        if ([301, 302, 303, 307, 308].includes(res.statusCode) && res.headers.location && redirects < 5) {
          res.resume();
          request(new URL(res.headers.location, target).toString(), redirects + 1);
          return;
        }
        if (res.statusCode !== 200) {
          res.resume();
          reject(new Error(`Download failed ${res.statusCode}: ${target}`));
          return;
        }
        try {
          await pipeline(res, createWriteStream(file));
          resolvePromise();
        } catch (error) {
          reject(error);
        }
      });
      req.on('error', reject);
    };
    request(url);
  });
}

function extractZip(zipFile, outDir) {
  ensureDir(outDir);
  const marker = join(outDir, '.extracted');
  if (existsSync(marker)) return;
  rmSync(outDir, { recursive: true, force: true });
  ensureDir(outDir);

  if (process.platform === 'win32') {
    const ps = spawnSync('powershell.exe', ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-Command', `Expand-Archive -LiteralPath '${zipFile.replaceAll("'", "''")}' -DestinationPath '${outDir.replaceAll("'", "''")}' -Force`], { stdio: 'inherit' });
    if (ps.status !== 0) throw new Error(`PowerShell Expand-Archive failed for ${zipFile}`);
  } else {
    const unzip = spawnSync('unzip', ['-o', zipFile, '-d', outDir], { stdio: 'inherit' });
    if (unzip.status !== 0) throw new Error(`unzip failed for ${zipFile}. Install unzip or extract the file manually.`);
  }
  writeFileSync(marker, new Date().toISOString());
}

function walk(dir, files = []) {
  if (!existsSync(dir)) return files;
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    const stats = statSync(path);
    if (stats.isDirectory()) walk(path, files);
    else files.push(path);
  }
  return files;
}

function buildIndex() {
  const files = walk(vendorDir)
    .filter((file) => !file.includes(`${downloadsDir}`))
    .filter((file) => ['.glb', '.gltf', '.obj', '.fbx', '.png', '.jpg', '.jpeg'].includes(extname(file).toLowerCase()))
    .map((file) => `/${relative(publicDir, file).replaceAll('\\\\', '/').replaceAll('\\', '/')}`);

  const index = {
    generatedAt: new Date().toISOString(),
    licenseSummary: 'Kenney assets are CC0. Poly Haven textures are CC0. The included music download is Creative Commons Attribution 4.0 and requires attribution.',
    modelFiles: files.filter((file) => ['.glb', '.gltf'].includes(extname(file).toLowerCase())),
    objFiles: files.filter((file) => extname(file).toLowerCase() === '.obj'),
    textureFiles: files.filter((file) => ['.png', '.jpg', '.jpeg'].includes(extname(file).toLowerCase())),
    preferredSearchTerms: ['house', 'building', 'roof', 'door', 'window', 'tree', 'pine', 'barrel', 'cart', 'bridge', 'wall', 'tower']
  };
  writeFileSync(join(vendorDir, 'asset-index.json'), JSON.stringify(index, null, 2));
}

function writeAttribution() {
  const lines = [
    '# Third-party assets',
    '',
    'Downloaded by `npm run assets`.',
    '',
    '| Asset | Source | License | URL |',
    '|---|---|---|---|',
    ...downloads.map((item) => `| ${item.id} | ${item.source} | ${item.license} | ${item.url} |`),
    '',
    'Music credit required when using the downloaded MP3:',
    '',
    '> River Flute by Kevin MacLeod (incompetech.com), licensed under Creative Commons: By Attribution 4.0.',
    '',
    'Quaternius Medieval Village MegaKit is also CC0 and a strong art target, but its public page routes through a hosted download flow/Itch page. Pull it manually from the official page when you want the full modular village source pack.'
  ];
  writeFileSync(join(publicDir, 'assets', 'ATTRIBUTION.md'), lines.join('\n'));
}

async function main() {
  ensureDir(vendorDir);
  ensureDir(downloadsDir);
  ensureDir(textureDir);
  ensureDir(audioDir);

  for (const item of downloads) {
    console.log(`Downloading ${item.id}...`);
    await download(item.url, item.file);
    if (item.kind === 'zip') {
      console.log(`Extracting ${item.id}...`);
      extractZip(item.file, item.outDir);
    }
  }

  buildIndex();
  writeAttribution();

  console.log('Free assets downloaded and indexed. Restart Vite if it was already running.');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
