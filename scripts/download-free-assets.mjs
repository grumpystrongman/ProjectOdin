import { createWriteStream, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { dirname, extname, join, relative, resolve } from 'node:path';
import { pipeline } from 'node:stream/promises';
import { spawnSync } from 'node:child_process';
import https from 'node:https';
import http from 'node:http';

const root = resolve(process.cwd());
const publicDir = join(root, 'public');
const assetsDir = join(publicDir, 'assets');
const vendorDir = join(assetsDir, 'vendor');
const downloadsDir = join(vendorDir, '_downloads');
const textureDir = join(assetsDir, 'textures');
const audioDir = join(assetsDir, 'audio');

const downloads = [
  {
    id: 'kenney-fantasy-town-kit',
    kind: 'zip',
    pageUrl: 'https://kenney.nl/assets/fantasy-town-kit',
    fallbackUrl: 'https://kenney.nl/media/pages/assets/fantasy-town-kit/efe948d309-1754222374/kenney_fantasy-town-kit_2.0.zip',
    file: join(downloadsDir, 'kenney_fantasy-town-kit_2.0.zip'),
    outDir: join(vendorDir, 'kenney-fantasy-town-kit'),
    source: 'Kenney Fantasy Town Kit',
    license: 'Creative Commons CC0',
    required: false
  },
  {
    id: 'kenney-nature-kit',
    kind: 'zip',
    pageUrl: 'https://kenney.nl/assets/nature-kit',
    fallbackUrl: 'https://kenney.nl/media/pages/assets/nature-kit/37ac38a37b-1677698939/kenney_nature-kit.zip',
    file: join(downloadsDir, 'kenney_nature-kit.zip'),
    outDir: join(vendorDir, 'kenney-nature-kit'),
    source: 'Kenney Nature Kit',
    license: 'Creative Commons CC0',
    required: false
  },
  {
    id: 'kenney-castle-kit',
    kind: 'zip',
    pageUrl: 'https://kenney.nl/assets/castle-kit',
    fallbackUrl: 'https://kenney.nl/media/pages/assets/castle-kit/a395102d20-1711543616/kenney_castle-kit.zip',
    file: join(downloadsDir, 'kenney_castle-kit.zip'),
    outDir: join(vendorDir, 'kenney-castle-kit'),
    source: 'Kenney Castle Kit',
    license: 'Creative Commons CC0',
    required: false
  },
  {
    id: 'cobblestone-diffuse',
    kind: 'file',
    url: 'https://dl.polyhaven.org/file/ph-assets/Textures/jpg/1k/cobblestone_floor_08/cobblestone_floor_08_diff_1k.jpg',
    file: join(textureDir, 'cobblestone_floor_08_diff_1k.jpg'),
    source: 'Poly Haven Cobblestone Floor 08',
    license: 'Creative Commons CC0',
    required: false
  },
  {
    id: 'cobblestone-normal',
    kind: 'file',
    url: 'https://dl.polyhaven.org/file/ph-assets/Textures/jpg/1k/cobblestone_floor_08/cobblestone_floor_08_nor_gl_1k.jpg',
    file: join(textureDir, 'cobblestone_floor_08_nor_gl_1k.jpg'),
    source: 'Poly Haven Cobblestone Floor 08',
    license: 'Creative Commons CC0',
    required: false
  },
  {
    id: 'cobblestone-rough',
    kind: 'file',
    url: 'https://dl.polyhaven.org/file/ph-assets/Textures/jpg/1k/cobblestone_floor_08/cobblestone_floor_08_rough_1k.jpg',
    file: join(textureDir, 'cobblestone_floor_08_rough_1k.jpg'),
    source: 'Poly Haven Cobblestone Floor 08',
    license: 'Creative Commons CC0',
    required: false
  },
  {
    id: 'village-loop',
    kind: 'file',
    url: 'https://incompetech.com/music/royalty-free/mp3-royaltyfree/River%20Flute.mp3',
    file: join(audioDir, 'fable-village-loop.mp3'),
    source: 'River Flute by Kevin MacLeod',
    license: 'Creative Commons Attribution 4.0',
    required: false
  }
];

const results = [];

function ensureDir(path) {
  mkdirSync(path, { recursive: true });
}

function fetchText(url) {
  return new Promise((resolvePromise, reject) => {
    const request = (target, redirects = 0) => {
      const client = target.startsWith('https:') ? https : http;
      const req = client.get(target, { headers: { 'User-Agent': 'ProjectOdinAssetDownloader/1.1' } }, (res) => {
        if ([301, 302, 303, 307, 308].includes(res.statusCode) && res.headers.location && redirects < 5) {
          res.resume();
          request(new URL(res.headers.location, target).toString(), redirects + 1);
          return;
        }
        if (res.statusCode !== 200) {
          res.resume();
          reject(new Error(`GET ${target} failed with ${res.statusCode}`));
          return;
        }
        let text = '';
        res.setEncoding('utf8');
        res.on('data', (chunk) => { text += chunk; });
        res.on('end', () => resolvePromise(text));
      });
      req.on('error', reject);
    };
    request(url);
  });
}

async function resolveDownloadUrl(item) {
  if (!item.pageUrl) return item.url;
  try {
    const html = await fetchText(item.pageUrl);
    const candidates = [...html.matchAll(/href=["']([^"']+\.zip)["']/gi)]
      .map((match) => new URL(match[1], item.pageUrl).toString())
      .filter((url) => url.includes('kenney') || url.includes('/media/pages/assets/'));
    if (candidates.length) return candidates[0];
  } catch (error) {
    console.warn(`Could not resolve live download URL for ${item.id}: ${error.message}`);
  }
  return item.fallbackUrl || item.url;
}

async function download(url, file) {
  ensureDir(dirname(file));
  if (existsSync(file) && statSync(file).size > 1024) return false;
  rmSync(file, { force: true });
  await new Promise((resolvePromise, reject) => {
    const request = (target, redirects = 0) => {
      const client = target.startsWith('https:') ? https : http;
      const req = client.get(target, { headers: { 'User-Agent': 'ProjectOdinAssetDownloader/1.1' } }, async (res) => {
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
  return true;
}

function isZip(file) {
  if (!existsSync(file) || statSync(file).size < 4) return false;
  const header = readFileSync(file).subarray(0, 4).toString('hex');
  return header === '504b0304' || header === '504b0506' || header === '504b0708';
}

function extractZip(zipFile, outDir) {
  if (!isZip(zipFile)) throw new Error(`${zipFile} is not a valid ZIP archive`);
  ensureDir(outDir);
  const marker = join(outDir, '.extracted');
  if (existsSync(marker)) return;
  rmSync(outDir, { recursive: true, force: true });
  ensureDir(outDir);

  const extract = process.platform === 'win32'
    ? spawnSync('powershell.exe', ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-Command', `Expand-Archive -LiteralPath '${zipFile.replaceAll("'", "''")}' -DestinationPath '${outDir.replaceAll("'", "''")}' -Force`], { stdio: 'inherit' })
    : spawnSync('unzip', ['-o', zipFile, '-d', outDir], { stdio: 'inherit' });

  if (extract.status !== 0) throw new Error(`ZIP extraction failed for ${zipFile}`);
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

function publicPath(file) {
  return `/${relative(publicDir, file).replaceAll('\\', '/')}`;
}

function buildIndex() {
  const files = walk(vendorDir)
    .filter((file) => !file.startsWith(downloadsDir))
    .filter((file) => ['.glb', '.gltf', '.obj', '.fbx', '.png', '.jpg', '.jpeg'].includes(extname(file).toLowerCase()))
    .map(publicPath);

  const index = {
    generatedAt: new Date().toISOString(),
    licenseSummary: 'Kenney assets are CC0. Poly Haven textures are CC0. The included music download is Creative Commons Attribution 4.0 and requires attribution.',
    results,
    modelFiles: files.filter((file) => ['.glb', '.gltf'].includes(extname(file).toLowerCase())),
    objFiles: files.filter((file) => extname(file).toLowerCase() === '.obj'),
    textureFiles: files.filter((file) => ['.png', '.jpg', '.jpeg'].includes(extname(file).toLowerCase())),
    preferredSearchTerms: ['house', 'building', 'roof', 'door', 'window', 'tree', 'pine', 'barrel', 'cart', 'bridge', 'wall', 'tower']
  };
  ensureDir(vendorDir);
  writeFileSync(join(vendorDir, 'asset-index.json'), JSON.stringify(index, null, 2));
}

function writeAttribution() {
  const lines = [
    '# Third-party assets',
    '',
    'Downloaded by `npm run assets`.',
    '',
    '| Asset | Source | License | URL | Status |',
    '|---|---|---|---|---|',
    ...downloads.map((item) => {
      const result = results.find((entry) => entry.id === item.id);
      const url = result?.url || item.pageUrl || item.url || item.fallbackUrl || '';
      return `| ${item.id} | ${item.source} | ${item.license} | ${url} | ${result?.status || 'not attempted'} |`;
    }),
    '',
    'Music credit required when using the downloaded MP3:',
    '',
    '> River Flute by Kevin MacLeod (incompetech.com), licensed under Creative Commons: By Attribution 4.0.',
    '',
    'Kenney assets are CC0. Attribution is appreciated but not required by the license.',
    '',
    'Quaternius Medieval Village MegaKit is also CC0 and remains a strong art target, but its public page routes through a hosted download/Itch flow. Pull it manually from the official Quaternius page when you want the full modular village source pack.'
  ];
  ensureDir(assetsDir);
  writeFileSync(join(assetsDir, 'ATTRIBUTION.md'), lines.join('\n'));
}

async function processItem(item) {
  const url = await resolveDownloadUrl(item);
  console.log(`Downloading ${item.id} from ${url}`);
  const downloaded = await download(url, item.file);
  if (item.kind === 'zip') {
    console.log(`Extracting ${item.id}...`);
    extractZip(item.file, item.outDir);
  }
  results.push({ id: item.id, status: downloaded ? 'downloaded' : 'already-present', url });
}

async function main() {
  ensureDir(vendorDir);
  ensureDir(downloadsDir);
  ensureDir(textureDir);
  ensureDir(audioDir);

  let failures = 0;
  for (const item of downloads) {
    try {
      await processItem(item);
    } catch (error) {
      failures += 1;
      const status = item.required ? 'failed-required' : 'failed-optional';
      results.push({ id: item.id, status, error: error.message, url: item.pageUrl || item.url || item.fallbackUrl });
      console.warn(`${status}: ${item.id}: ${error.message}`);
      if (item.required) throw error;
    }
  }

  buildIndex();
  writeAttribution();

  const assetCount = walk(vendorDir).filter((file) => ['.glb', '.gltf', '.obj'].includes(extname(file).toLowerCase())).length;
  if (assetCount === 0 && failures === downloads.length) {
    throw new Error('No model assets were available after download attempts.');
  }

  console.log(`Free asset pass complete. Model files indexed: ${assetCount}. Optional failures: ${failures}.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
