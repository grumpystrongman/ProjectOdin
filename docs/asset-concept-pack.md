# Project ODIN / Jeff Barnes Commons — 3D Asset Concept Pack and Implementation Spec

## Visual Target

The next visual jump is from procedural boxes into a rendered fantasy-town portfolio world: warm, painterly, readable, grounded, and lived-in. The goal is a Fable II / Witcher 3 inspired mood without copying protected assets, music, marks, or exact designs.

The world should feel like a cozy but serious professional village: lanterns, stone paths, mossy walls, timber-framed buildings, painted signs, warm window light, river crossings, trees, fields, ruins, banners, books, parchment maps, and readable wayfinding.

## Hard UX Rule

Every click target that opens a popup must provide at least one of these:

1. A working source link or demo link.
2. A screenshot / rendered preview / mobile-style panel.
3. Full scrollable body content if it is an article, resume item, or post.
4. A clear next action: open original, view source, read full article, inspect resume, or visit project.

No more description-only popups for important objects.

## Asset Folder Structure

```text
public/assets/models/
  buildings/
    commons_town_house_a.glb
    commons_town_house_b.glb
    resume_hall.glb
    chronicle_house.glb
    foundry.glb
    ai_workshop.glb
    healthcare_hall.glb
    leadership_library.glb
    project_workshop.glb
    contact_tower.glb
  props/
    signpost.glb
    notice_board.glb
    lantern_post.glb
    market_cart.glb
    crate_stack.glb
    barrel_stack.glb
    book_stack.glb
    parchment_table.glb
    anvil_table.glb
    bridge_wood.glb
    stone_wall_segment.glb
    fence_segment.glb
    bench.glb
    well.glb
  nature/
    oak_tree_a.glb
    pine_tree_a.glb
    shrub_a.glb
    grass_clump_a.glb
    mossy_rock_a.glb
    cliff_rock_a.glb
  signs/
    sign_resume_hall.glb
    sign_chronicle_house.glb
    sign_foundry.glb
    sign_ai_workshop.glb
    sign_healthcare_hall.glb
    sign_leadership_library.glb
    sign_project_workshop.glb
  vfx/
    glow_orb.glb
    article_plaque.glb
    portfolio_rune.glb

public/assets/textures/
  stone_wall_diffuse.jpg
  stone_wall_normal.jpg
  timber_diffuse.jpg
  timber_normal.jpg
  thatch_roof_diffuse.jpg
  dirt_path_diffuse.jpg
  moss_ground_diffuse.jpg
  parchment_diffuse.jpg

public/assets/screenshots/
  threadlineai-preview.jpg
  project-odin-preview.jpg
  analytics-platform-preview.jpg
  ai-workshop-preview.jpg
  resume-hall-preview.jpg
```

## First Import Priority

### Tier 1 — World Readability

These replace the Minecraft/blocky feeling first.

1. `resume_hall.glb` — hero building, tall timber-framed hall with parchment banners.
2. `chronicle_house.glb` — bookshop / archive house with article plaques outside.
3. `signpost.glb` and named sign variants — readable labels at crossroads.
4. `stone_path_kit` or modular road pieces — removes the flat strip look.
5. `lantern_post.glb` — repeated warm lights along roads.
6. `oak_tree_a.glb`, `shrub_a.glb`, `mossy_rock_a.glb` — breaks empty terrain.
7. `bridge_wood.glb` — river crossing and spatial logic.
8. `contact_tower.glb` — replaces current cylinder tower.

### Tier 2 — District Identity

1. `foundry.glb` — chimney, forge glow, anvil props, metal signs.
2. `ai_workshop.glb` — arcane workshop, blue-green glass, floating lenses.
3. `healthcare_hall.glb` — healer hall / apothecary tone, clean warm lighting.
4. `leadership_library.glb` — library/council hall with books, desk, banners.
5. `project_workshop.glb` — inventor shop / workbench / glowing repository objects.

### Tier 3 — Polish

1. market carts, barrels, crates, benches
2. fences and low stone walls
3. distant hills / cliffs / skyline silhouettes
4. banner cloth planes
5. fog cards and firefly particles
6. article boards using screenshots as textures

## Asset Source Strategy

Use commercial-friendly sources only. Recommended source order:

1. Quaternius CC0 fantasy / nature / modular models.
2. Kenney CC0 game assets where style fits.
3. Poly Haven CC0 textures and HDRIs.
4. ambientCG CC0 textures.
5. Watabou-generated maps as reference and UI/map art.
6. Carefully filtered Sketchfab Creative Commons assets only when license is verified per asset.

Do not use Fable II or Witcher assets/music. Use the mood only.

## Three.js Integration Plan

### New Module

Create:

```text
src/game/assetLoader.js
src/game/assetRegistry.js
```

### `assetRegistry.js`

Define each logical asset and fallback type.

```js
export const assetRegistry = {
  'building:resume': {
    path: '/assets/models/buildings/resume_hall.glb',
    anchor: 'realm:resume',
    fallback: 'proceduralBuilding',
    scale: 1.0,
    position: [0, 0, 0],
    rotation: [0, 0, 0]
  }
};
```

### `assetLoader.js`

Responsibilities:

- load GLTFLoader lazily
- cache loaded GLBs
- attach to existing scene anchors
- preserve fallback if model fails
- expose load status to HUD or Codex

Pseudo-API:

```js
export async function loadRegisteredAssets(scene, registry) {
  const loader = new GLTFLoader();
  const results = [];
  for (const [key, config] of Object.entries(registry)) {
    const anchor = scene.getAssetAnchor(config.anchor);
    if (!anchor) continue;
    try {
      const gltf = await loader.loadAsync(config.path);
      const model = gltf.scene;
      model.position.set(...config.position);
      model.rotation.set(...config.rotation);
      model.scale.setScalar(config.scale);
      anchor.add(model);
      results.push({ key, status: 'loaded' });
    } catch (error) {
      results.push({ key, status: 'fallback', error: error.message });
    }
  }
  return results;
}
```

## Scene Replacement Plan

Do not rip out procedural geometry all at once. Use it as fallback scaffolding.

### Step 1

Add asset anchors for each major building already in `scene3d.js`:

- `realm:resume`
- `realm:chronicle`
- `realm:foundry`
- `realm:ai`
- `realm:healthcare`
- `realm:leadership`
- `realm:workshop`
- `vault`

These already exist for realms and vault in the current scene direction.

### Step 2

Load models after scene init:

```js
loadRegisteredAssets(scene, assetRegistry)
```

### Step 3

When a GLB loads successfully, hide or shrink the procedural block building inside that anchor, but keep:

- interaction metadata
- sign object
- lights
- artifact ring
- minimap location

### Step 4

Add prop scatter by zone:

- Resume Hall: scrolls, banners, bookstands
- Chronicle House: article boards, picture frames, newspaper stand
- Foundry: anvils, carts, smoke chimney, metal glow
- AI Workshop: glass lenses, blue-green lights, floating orb
- Healthcare Hall: apothecary props, lanterns, clean white-green banners
- Leadership Library: council table, books, bell, shelves
- Project Workshop: workbenches, crates, glowing repository stones

## Popup Content Upgrade Plan

Each artifact maps to one of these page types:

### `project`

- title
- subtitle
- screenshot
- mobile/rendered preview
- bullets
- working example/source link
- optional repo link

### `article`

- title
- category
- date
- image
- full text
- open original article link

### `resume`

- summary
- accomplishments
- skills
- experience
- downloadable PDF once a stable PDF asset path is added

### `about`

- portrait
- full about text
- identity tags
- LinkedIn link
- contact link

### `map`

- detailed town map
- clickable location list
- district purpose

## Rendered Page / Mobile View Direction

The current mobile-style frame should evolve into a real inline preview surface:

```text
.preview-frame
  preview-header
  preview-body
  preview-screenshot
  preview-actions
```

Long term, each project should have a static page-like preview inside the popup. It should look like a mini responsive webpage, not a tooltip.

## Music Direction

Use original/procedural or licensed fantasy ambience only. Target mood:

- warm village strings
- lute/plucked texture
- soft drone
- hand drum pulse
- light flute-like melody
- slow exploration tempo

Short-term: procedural WebAudio stays.

Medium-term: add licensed loop files:

```text
public/assets/audio/commons-theme.ogg
public/assets/audio/foundry-theme.ogg
public/assets/audio/chronicle-house.ogg
public/assets/audio/night-ambience.ogg
```

Then `AdaptiveAudio` crossfades between loops by realm.

## Definition of Ready for the 3D Asset Pass

A pass counts as ready when:

- major buildings are not boxes
- roads and terrain have props and edges
- map has meaningful detail
- portrait always appears
- all article/project panels have links and previews
- music starts from visible controls
- movement is fast enough to cross the village without frustration
- popup content feels like a page, not a tooltip

## Next Code Tasks

1. Add `assetRegistry.js`.
2. Add `assetLoader.js`.
3. Add placeholder model folder README files.
4. Add source attribution / license manifest.
5. Update `main.js` to call asset loader after scene creation.
6. Update `scene3d.js` to expose building child groups for hiding procedural fallbacks when GLB loads.
7. Add preview screenshot fields to `projectShowcase.js`.
8. Add downloaded/local image fallback path fields to LinkedIn gallery JSON.
9. Add audio loop loader once licensed loops are selected.
