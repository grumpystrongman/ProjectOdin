# Jeff Barnes: Project ODIN Portfolio World

Project ODIN is a full-screen Three.js first-person portfolio world for Jeff Barnes. The experience uses an ancient-sci-fi / dark-fantasy atmosphere, but the purpose is straightforward: help visitors learn about Jeff, his projects, his leadership philosophy, his AI and data engineering work, his healthcare analytics background, and how to contact him.

The frontend keeps the existing FastAPI backend, trust-token/contact gate logic, GitHub repository sync, save state, smoke test, Vite, and Three.js foundation. The visual and interaction layer is being rebuilt toward a more grounded FPS-style exploration game.

## Current Build

- Landing page now leads with **Jeff Barnes**, not ODIN lore.
- Project ODIN is positioned as the immersive portfolio experience, not the identity of the person.
- Full-screen Three.js world with fog, stars, terrain variation, ruins, towers, monoliths, dramatic lighting, shadows, and a glowing data river.
- Districts are labeled in plain English: About Jeff, Healthcare Analytics, Data Platform, Leadership, AI / Agents, Future Lab, Projects, and Posts.
- LinkedIn profile is wired to `https://www.linkedin.com/in/cmajeff/`.
- LinkedIn and Posts Gallery district has structured gallery cards for profile, leadership, healthcare analytics, AI/data platforms, and projects.
- The gallery currently uses structured placeholders because LinkedIn blocked automated fetching. Exported screenshots/images can be dropped in later without redesigning the interaction flow.
- Physical clickable artifacts, tablets, vault, portals, gate, terrain, ruins, pathway rings, data river, and repository signals.
- Pointer-lock mouse-look controls.
- WASD movement.
- Arrow-key movement mapped like FPS controls.
- Mouse-wheel zoom via camera FOV.
- Left-click raycast interaction.
- Optional `E` interaction shortcut.
- Esc releases pointer lock and opens the pause overlay.
- Minimal HUD, central reticle, contextual in-world prompt, and clean Codex overlay.
- Cinematic camera entrance on start.
- Existing GitHub workshop sync preserved.
- Existing FastAPI backend and trust-token/contact verification flow preserved.
- Future `.glb` / `.gltf` import support prepared through scene asset anchors and `loadGltfAsset`.

## LinkedIn Gallery Asset Plan

The site is wired to Jeff's LinkedIn profile, but real LinkedIn post images and post text should be added from exported assets rather than scraped.

Recommended asset structure:

```text
public/assets/linkedin/
  profile-headshot.jpg
  post-leadership-01.jpg
  post-healthcare-analytics-01.jpg
  post-ai-data-platforms-01.jpg
  post-projects-01.jpg
```

Then update `src/game/content.js` by setting each `linkedinGallery[].image` field to the matching asset path and replacing placeholder excerpts with the exported post text or a short excerpt.

## Run Frontend

```bash
npm install
npm run smoke
npm run dev
```

Vite will print the local development URL, usually `http://localhost:5173`.

## Controls

| Action | Control |
|---|---|
| Start / lock mouse | Click Explore Jeff's Work, then click the game canvas |
| Look around | Mouse |
| Zoom | Mouse wheel |
| Move | WASD |
| Move alternate | Arrow keys |
| Sprint | Hold Shift |
| Interact | Left-click targeted object |
| Interact alternate | E |
| Open Codex | C |
| Release mouse / pause | Esc |
| Resume pointer lock | Click Resume or click the world canvas |

## Interaction Model

The player moves through the world in first person. The reticle locks onto physical scene objects using Three.js raycasting. When the player looks at an artifact, tablet, portal, vault, gallery card, structure, terrain feature, or the Great Gate, a small contextual prompt appears. Left-click inspects or activates that world object.

The Vault of Trust is an in-world structure. Looking at it and clicking starts the Architect Trial. The existing server-first trust-token verification remains intact, with the static fallback still available when the backend is offline. The contact reveal now renders a readable Jeff Barnes contact card rather than distorted seal text.

## Run Backend

```bash
pip install -r requirements.txt
npm run backend
```

The backend runs at `http://localhost:8011`. The client still works in static fallback mode when the backend is not present.

## Run Fullstack Helper

```bash
pip install -r requirements.txt
npm install
npm run fullstack
```

## Tests

```bash
npm run smoke
npm run build
```

`npm run smoke` verifies the required backend/frontend files and checks for the immersive controls layer, Jeff-centered landing page, LinkedIn gallery wiring, pointer lock, mouse-look, WASD/arrow movement, mouse-wheel zoom, raycast interaction, reticle/prompt UI, in-world vault, GitHub sync wiring, and trust-token fallback wiring.

## Production Direction

Next steps should focus on making the world more grounded and less abstract: stronger district layout, believable paths, walls, bridges, stairs, collision, authored geometry, imported `.glb` / `.gltf` assets, and real LinkedIn/profile images from exported files. The current scene intentionally includes `registerAssetAnchor`, `getAssetAnchor`, and `loadGltfAsset` hooks so future imported models can be mounted onto the Great Gate, districts, relics, tablets, gallery, and vault without rewriting the interaction system.
