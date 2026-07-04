export const modelManifest = {
  buildings: [
    { key: 'realm:about', path: '/assets/models/buildings/commons-gate.glb', label: 'Jeff Barnes Commons gate', scale: 1, position: [0, 0, 0], rotation: [0, 0, 0], hideProcedural: false },
    { key: 'realm:resume', path: '/assets/models/buildings/resume-hall.glb', label: 'Resume Hall hero building', scale: 1, position: [0, 0, 0], rotation: [0, 0, 0], hideProcedural: true },
    { key: 'realm:chronicle', path: '/assets/models/buildings/chronicle-house.glb', label: 'Chronicle House hero building', scale: 1, position: [0, 0, 0], rotation: [0, 0, 0], hideProcedural: true },
    { key: 'realm:foundry', path: '/assets/models/buildings/foundry.glb', label: 'The Foundry hero building', scale: 1, position: [0, 0, 0], rotation: [0, 0, 0], hideProcedural: true },
    { key: 'realm:ai', path: '/assets/models/buildings/ai-workshop.glb', label: 'AI Workshop hero building', scale: 1, position: [0, 0, 0], rotation: [0, 0, 0], hideProcedural: true },
    { key: 'realm:healthcare', path: '/assets/models/buildings/healthcare-hall.glb', label: 'Healthcare Analytics Hall hero building', scale: 1, position: [0, 0, 0], rotation: [0, 0, 0], hideProcedural: true },
    { key: 'realm:leadership', path: '/assets/models/buildings/leadership-library.glb', label: 'Leadership Library hero building', scale: 1, position: [0, 0, 0], rotation: [0, 0, 0], hideProcedural: true },
    { key: 'realm:workshop', path: '/assets/models/buildings/project-workshop.glb', label: 'Project Workshop hero building', scale: 1, position: [0, 0, 0], rotation: [0, 0, 0], hideProcedural: true },
    { key: 'vault', path: '/assets/models/buildings/contact-tower.glb', label: 'Contact Tower hero building', scale: 1, position: [0, 0, 0], rotation: [0, 0, 0], hideProcedural: true }
  ],
  props: [
    { key: 'prop:bridge', path: '/assets/models/props/stone-bridge.glb', label: 'Stone bridge', scale: 1, position: [-220, 14, 80], rotation: [0, 0.35, 0] },
    { key: 'prop:well', path: '/assets/models/props/village-well.glb', label: 'Village well', scale: 1, position: [155, 0, 330], rotation: [0, -0.6, 0] },
    { key: 'prop:cart', path: '/assets/models/props/wooden-cart.glb', label: 'Wooden cart', scale: 1, position: [-120, 0, 380], rotation: [0, 0.9, 0] },
    { key: 'prop:market-stall', path: '/assets/models/props/market-stall.glb', label: 'Market stall', scale: 1, position: [210, 0, 200], rotation: [0, -0.35, 0] },
    { key: 'prop:lantern-a', path: '/assets/models/props/lantern-post.glb', label: 'Lantern post', scale: 1, position: [-90, 0, 235], rotation: [0, 0, 0] },
    { key: 'prop:lantern-b', path: '/assets/models/props/lantern-post.glb', label: 'Lantern post', scale: 1, position: [90, 0, 235], rotation: [0, 0, 0] }
  ],
  nature: [
    { key: 'nature:oak-tree', path: '/assets/models/nature/oak-tree.glb', label: 'Oak tree', scale: 1, scatter: true, count: 24 },
    { key: 'nature:rock-set', path: '/assets/models/nature/rock-set.glb', label: 'Rock set', scale: 1, scatter: true, count: 18 },
    { key: 'nature:grass-clump', path: '/assets/models/nature/grass-clump.glb', label: 'Grass clump', scale: 1, scatter: true, count: 36 }
  ]
};

export const modelPrompts = [
  { file: 'buildings/resume-hall.glb', prompt: 'storybook fantasy village resume hall, warm timber and stone, carved wooden sign reading Resume Hall, glowing windows, mossy stone base, steep roof, lanterns, original Fable-like cozy fantasy RPG mood, grounded Witcher-like materials, clean game-ready topology, PBR textures, GLB export' },
  { file: 'buildings/chronicle-house.glb', prompt: 'storybook fantasy writer archive building, medieval timber frame, parchment banners, article wall, glowing windows, cozy fantasy town, Fable-like hand-painted mood, grounded materials, game-ready GLB' },
  { file: 'buildings/foundry.glb', prompt: 'fantasy data foundry workshop, timber and stone forge, warm orange furnace glow, brass instruments, carved sign The Foundry, RPG village hero building, PBR GLB' },
  { file: 'buildings/ai-workshop.glb', prompt: 'fantasy inventor workshop, blue green magical glow, brass telescope, crystal lens, workbench silhouettes, medieval village building, cozy RPG style, GLB' },
  { file: 'buildings/healthcare-hall.glb', prompt: 'fantasy healing hall and analytics archive, warm stone, green banners, subtle medical cross motif, parchment charts, village RPG building, PBR GLB' },
  { file: 'buildings/leadership-library.glb', prompt: 'grand fantasy village library, timber and stone, arched windows, ivy, banners, council table motif, warm candlelight, storybook RPG style, GLB' },
  { file: 'buildings/contact-tower.glb', prompt: 'small fantasy contact tower, stone and timber, glowing beacon, mailbox and raven perch, readable Contact Tower sign, cozy medieval RPG, GLB' },
  { file: 'buildings/commons-gate.glb', prompt: 'hero entrance gate for Jeff Barnes Commons, medieval fantasy village archway, carved wooden beams, stone pillars, golden lanterns, sign reading Jeff Barnes Commons, game-ready GLB' }
];

export function flattenModelManifest() {
  return [...modelManifest.buildings, ...modelManifest.props, ...modelManifest.nature];
}
