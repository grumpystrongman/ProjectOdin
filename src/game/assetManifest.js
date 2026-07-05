export const assetManifest = {
  version: '0.5.0-fable-acquisition-integration',
  integrationStatus: 'procedural-test-integration',
  note: 'The world now uses procedural Three.js stand-ins modeled after the selected CC0 asset sources so the site can be tested immediately. The manifest keeps the real acquisition targets for later binary import.',
  sourceFamilies: [
    {
      source: 'Quaternius',
      license: 'CC0',
      role: 'primary village architecture',
      selected: ['Medieval Village MegaKit'],
      integration: 'represented by modular timber-and-stone building geometry in scene3d.js',
      manualDownload: 'https://quaternius.com/packs/medievalvillagemegakit.html'
    },
    {
      source: 'Kenney',
      license: 'CC0',
      role: 'castle, town, nature, UI, icons',
      selected: ['Castle Kit', 'Nature Kit', 'Fantasy Town Kit', 'Fantasy UI Borders', 'UI Pack (RPG Expansion)', 'Game Icons'],
      integration: 'represented by castle gate/towers, village houses, trees, fences, signs, market props, ornate UI-like signboards',
      directDownloads: [
        'https://kenney.nl/media/pages/assets/castle-kit/a395102d20-1711543616/kenney_castle-kit.zip',
        'https://kenney.nl/media/pages/assets/nature-kit/37ac38a37b-1677698939/kenney_nature-kit.zip',
        'https://kenney.nl/media/pages/assets/fantasy-town-kit/efe948d309-1754222374/kenney_fantasy-town-kit_2.0.zip',
        'https://kenney.nl/media/pages/assets/fantasy-ui-borders/ab29cd0165-1701602367/kenney_fantasy-ui-borders.zip',
        'https://kenney.nl/media/pages/assets/ui-pack-rpg-expansion/7ec4a46657-1677661824/kenney_ui-pack-rpg-expansion.zip',
        'https://kenney.nl/media/pages/assets/game-icons/1ebf9c14af-1677661579/kenney_game-icons.zip'
      ]
    },
    {
      source: 'ambientCG',
      license: 'CC0',
      role: 'PBR-style material references',
      selected: ['PavingStones036', 'Bricks008', 'RoofingTiles005', 'WoodFloor044', 'Bark001', 'Ground024', 'Rocks025'],
      integration: 'represented by generated canvas textures for cobblestone roads, sandstone walls, mossy roofs, warm wood, bark, and forest ground',
      directDownloads: [
        'https://ambientcg.com/get?file=PavingStones036_2K-JPG.zip',
        'https://ambientcg.com/get?file=Bricks008_2K-JPG.zip',
        'https://ambientcg.com/get?file=RoofingTiles005_2K-JPG.zip',
        'https://ambientcg.com/get?file=WoodFloor044_2K-JPG.zip',
        'https://ambientcg.com/get?file=Bark001_2K-JPG.zip',
        'https://ambientcg.com/get?file=Ground024_2K-JPG.zip',
        'https://ambientcg.com/get?file=Rocks025_2K-JPG.zip'
      ]
    },
    {
      source: 'Poly Haven',
      license: 'CC0',
      role: 'optional hero texture and lighting polish',
      selected: ['Cobblestone Floor 08', 'Mossy Forest HDRI', 'Autumn Meadow HDRI', 'Wooden Planks'],
      integration: 'represented by warmer lighting, cobblestone material, forest color palette, and wood texture direction',
      manualDownloads: [
        'https://polyhaven.com/a/cobblestone_floor_08',
        'https://polyhaven.com/a/mossy_forest',
        'https://polyhaven.com/a/autumn_meadow',
        'https://polyhaven.com/a/wooden_planks'
      ]
    }
  ],
  materials: [
    { id: 'paving-stones-036', label: 'Cobblestone Roads', role: 'roads, square, bridge approaches', source: 'ambientCG / Poly Haven', status: 'procedural texture integrated' },
    { id: 'bricks-008', label: 'Medieval Sandstone', role: 'gate, tower, building stonework', source: 'ambientCG', status: 'procedural texture integrated' },
    { id: 'roofing-tiles-005', label: 'Mossy Slate Roof', role: 'village roofs and tower caps', source: 'ambientCG', status: 'procedural texture integrated' },
    { id: 'wood-floor-044', label: 'Warm Timber', role: 'doors, beams, carts, barrels, signs', source: 'ambientCG / Poly Haven', status: 'procedural texture integrated' },
    { id: 'bark-001', label: 'Tree Bark', role: 'oak and pine trunks', source: 'ambientCG', status: 'procedural texture integrated' },
    { id: 'ground-024', label: 'Forest Ground', role: 'terrain palette and path edges', source: 'ambientCG', status: 'procedural texture integrated' }
  ],
  worldPlacements: [
    { area: 'The Great Gate', assets: ['Kenney Castle Kit', 'Bricks008', 'RoofingTiles005'], implementation: 'castle gate with twin towers, arch, portcullis, plaque' },
    { area: 'Resume Hall', assets: ['Quaternius Medieval Village MegaKit', 'Kenney Fantasy Town Kit', 'WoodFloor044'], implementation: 'grand hall with banners, warm timber door, village roof' },
    { area: 'Chronicle House', assets: ['Quaternius Medieval Village MegaKit', 'Bricks008'], implementation: 'scribe house with scroll emblem' },
    { area: 'The Foundry', assets: ['Fantasy Town Kit', 'Rocks025', 'Bricks008'], implementation: 'dark-stone forge, chimney, anvil, forge light' },
    { area: 'AI Workshop', assets: ['Fantasy Town Kit', 'UI Pack RPG Expansion'], implementation: 'lantern-lit workshop with workbench/canopy styling' },
    { area: 'Healthcare Analytics Hall', assets: ['Fantasy Town Kit', 'Bricks008'], implementation: 'sanctuary-like analytics hall with stone vertical detail' },
    { area: 'Leadership Library', assets: ['Fantasy Town Kit', 'Wooden Planks'], implementation: 'library shell with shelf details and warm wood' },
    { area: 'Project Workshop', assets: ['Fantasy Town Kit', 'Game Icons'], implementation: 'workshop/market shape with benches, repository satellites nearby' },
    { area: 'Contact Tower', assets: ['Kenney Castle Kit', 'RoofingTiles005'], implementation: 'round tower with battlements, roof cap, contact gate interaction' },
    { area: 'Environment', assets: ['Kenney Nature Kit', 'Ground024', 'Bark001'], implementation: 'denser trees, fences, carts, crates, barrels, well, lamps' }
  ],
  audioStems: [
    { id: 'exploration', mood: 'low strings, cold wind, slow pulse', status: 'web-audio procedural' },
    { id: 'forge', mood: 'sub-bass hammer, metal breath, data shimmer', status: 'web-audio procedural' },
    { id: 'sanctum', mood: 'choir pad, machine whisper, glass pulse', status: 'web-audio procedural' },
    { id: 'vault', mood: 'ritual percussion and suspended tone', status: 'web-audio procedural' }
  ],
  productionNeeds: [
    'Replace procedural stand-ins with downloaded Quaternius / Kenney GLB or OBJ bundles after local asset download.',
    'Use ambientCG / Poly Haven texture ZIPs as actual PBR maps once imported into public/assets.',
    'Add GLTFLoader import path and asset preloader once binaries are committed.',
    'Create hero matte render for the landing screen after final 3D composition is approved.'
  ]
};
