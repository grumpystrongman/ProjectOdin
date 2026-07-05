# Project ODIN GLTF Asset Slots

Drop optimized `.glb` files into these folders to replace procedural Three.js geometry without changing scene code.

## First replacement wave

```text
public/assets/models/props/signpost.glb
public/assets/models/props/lantern.glb
public/assets/models/props/fence.glb
public/assets/models/props/bridge.glb
public/assets/models/roads/road-straight.glb
public/assets/models/nature/tree-oak.glb
public/assets/models/nature/rock-a.glb
```

## Hero buildings

```text
public/assets/models/buildings/about-commons.glb
public/assets/models/buildings/resume-hall.glb
public/assets/models/buildings/chronicle-house.glb
public/assets/models/buildings/foundry.glb
public/assets/models/buildings/ai-workshop.glb
public/assets/models/buildings/healthcare-hall.glb
public/assets/models/buildings/leadership-library.glb
public/assets/models/buildings/project-workshop.glb
public/assets/models/buildings/contact-tower.glb
```

## Asset rules

- Use commercial-friendly assets only.
- Prefer CC0 or clearly licensed royalty-free assets.
- Do not use ripped assets from games such as Fable, The Witcher, Skyrim, or other commercial titles.
- Optimize before shipping: low-poly where possible, compressed textures, small texture sizes, and reusable props.
- Record every downloaded model in `LICENSES.json` before production deployment.

The loader keeps procedural fallback geometry when a GLB is missing or fails to load.
