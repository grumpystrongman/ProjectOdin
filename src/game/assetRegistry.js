export const ASSET_BASE_PATH = '/assets/models';

export const assetRegistry = {
  version: '0.5.0-gltf-pipeline',
  sources: [
    {
      name: 'Quaternius',
      license: 'CC0 / public domain unless a downloaded pack states otherwise',
      url: 'https://quaternius.com/',
      notes: 'Use low-poly fantasy, medieval, nature, and village props first.'
    },
    {
      name: 'Kenney',
      license: 'CC0 unless a downloaded pack states otherwise',
      url: 'https://kenney.nl/assets',
      notes: 'Good source for lightweight props, signs, and simple environmental assets.'
    },
    {
      name: 'Poly Haven',
      license: 'CC0',
      url: 'https://polyhaven.com/',
      notes: 'Prefer textures/material references over large hero meshes.'
    },
    {
      name: 'ambientCG',
      license: 'CC0',
      url: 'https://ambientcg.com/',
      notes: 'Use for commercial-friendly PBR textures after optimization.'
    }
  ],
  slots: [
    {
      id: 'signpost-default',
      label: 'Default signpost',
      kind: 'prop',
      priority: 1,
      path: `${ASSET_BASE_PATH}/props/signpost.glb`,
      target: { collection: 'signs' },
      transform: { scale: 1, position: [0, 0, 0], rotation: [0, 0, 0] },
      license: { status: 'pending-asset', source: 'TBD', license: 'TBD' }
    },
    {
      id: 'lantern-default',
      label: 'Default lantern',
      kind: 'prop',
      priority: 1,
      path: `${ASSET_BASE_PATH}/props/lantern.glb`,
      target: { anchor: 'prop:lanterns' },
      transform: { scale: 1, position: [0, 0, 0], rotation: [0, 0, 0] },
      license: { status: 'pending-asset', source: 'TBD', license: 'TBD' }
    },
    {
      id: 'bridge-default',
      label: 'Default bridge',
      kind: 'prop',
      priority: 1,
      path: `${ASSET_BASE_PATH}/props/bridge.glb`,
      target: { anchor: 'prop:bridge' },
      transform: { scale: 1, position: [0, 0, 0], rotation: [0, 0, 0] },
      license: { status: 'pending-asset', source: 'TBD', license: 'TBD' }
    },
    {
      id: 'fence-default',
      label: 'Default fence section',
      kind: 'prop',
      priority: 2,
      path: `${ASSET_BASE_PATH}/props/fence.glb`,
      target: { anchor: 'prop:fences' },
      transform: { scale: 1, position: [0, 0, 0], rotation: [0, 0, 0] },
      license: { status: 'pending-asset', source: 'TBD', license: 'TBD' }
    },
    {
      id: 'road-straight-default',
      label: 'Straight road segment',
      kind: 'road',
      priority: 2,
      path: `${ASSET_BASE_PATH}/roads/road-straight.glb`,
      target: { anchor: 'prop:roads' },
      transform: { scale: 1, position: [0, 0, 0], rotation: [0, 0, 0] },
      license: { status: 'pending-asset', source: 'TBD', license: 'TBD' }
    },
    {
      id: 'tree-oak-default',
      label: 'Old oak tree',
      kind: 'nature',
      priority: 2,
      path: `${ASSET_BASE_PATH}/nature/tree-oak.glb`,
      target: { anchor: 'prop:trees' },
      transform: { scale: 1, position: [0, 0, 0], rotation: [0, 0, 0] },
      license: { status: 'pending-asset', source: 'TBD', license: 'TBD' }
    },
    {
      id: 'rock-a-default',
      label: 'Rock cluster A',
      kind: 'nature',
      priority: 2,
      path: `${ASSET_BASE_PATH}/nature/rock-a.glb`,
      target: { anchor: 'prop:rocks' },
      transform: { scale: 1, position: [0, 0, 0], rotation: [0, 0, 0] },
      license: { status: 'pending-asset', source: 'TBD', license: 'TBD' }
    },
    ...[
      ['about', 'Jeff Barnes Commons', 'about-commons.glb'],
      ['resume', 'Resume Hall', 'resume-hall.glb'],
      ['chronicle', 'Chronicle House', 'chronicle-house.glb'],
      ['foundry', 'The Foundry', 'foundry.glb'],
      ['ai', 'AI Workshop', 'ai-workshop.glb'],
      ['healthcare', 'Healthcare Analytics Hall', 'healthcare-hall.glb'],
      ['leadership', 'Leadership Library', 'leadership-library.glb'],
      ['workshop', 'Project Workshop', 'project-workshop.glb']
    ].map(([realmId, label, file]) => ({
      id: `building-${realmId}`,
      label,
      kind: 'building',
      priority: 3,
      path: `${ASSET_BASE_PATH}/buildings/${file}`,
      target: { anchor: `realm:${realmId}`, hideFallback: false },
      transform: { scale: 1, position: [0, 0, 0], rotation: [0, 0, 0] },
      license: { status: 'pending-asset', source: 'TBD', license: 'TBD' }
    })),
    {
      id: 'contact-tower',
      label: 'Contact Tower',
      kind: 'building',
      priority: 3,
      path: `${ASSET_BASE_PATH}/buildings/contact-tower.glb`,
      target: { anchor: 'vault', hideFallback: false },
      transform: { scale: 1, position: [0, 0, 0], rotation: [0, 0, 0] },
      license: { status: 'pending-asset', source: 'TBD', license: 'TBD' }
    }
  ]
};

export function getAssetSlotsByPriority(maxPriority = Infinity) {
  return assetRegistry.slots.filter((slot) => slot.priority <= maxPriority);
}
