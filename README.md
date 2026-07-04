# Project ODIN: The Architect's Path

Project ODIN is now a full-screen Three.js exploration game instead of a dashboard-style prototype. The frontend keeps the existing FastAPI backend, trust-token/contact gate logic, GitHub repository sync, save state, smoke test, Vite, and Three.js foundation, but the visual and interaction layer has been rebuilt as an immersive ancient-sci-fi world hub.

The experience is intentionally closer to a small Myst-like discovery space, an Assassin's Creed-style historical hub, and an MMORPG capital-city portfolio world than a normal website.

## Current Build

- Full-screen Three.js world with fog, stars, terrain variation, ruins, towers, monoliths, dramatic lighting, shadows, and a glowing data river.
- Central Great Gate as a physical world object.
- Realm portals as explorable locations, not dashboard buttons.
- Physical clickable artifacts, tablets, vault, portals, and gate.
- Pointer-lock mouse-look controls.
- WASD movement.
- Arrow-key movement.
- Left-click raycast interaction.
- Optional `E` interaction shortcut.
- Esc releases pointer lock and opens the pause overlay.
- Minimal HUD, central reticle, contextual in-world prompt, and clean Codex overlay.
- Cinematic camera entrance on start.
- Existing Codex/progress/save-state behavior preserved.
- Existing GitHub workshop sync preserved.
- Existing FastAPI backend and trust-token/contact verification flow preserved.
- Future `.glb` / `.gltf` import support prepared through scene asset anchors and `loadGltfAsset`.

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
| Start / lock mouse | Click Enter the World, then click the game canvas |
| Look around | Mouse |
| Move | WASD |
| Move alternate | Arrow keys |
| Sprint | Hold Shift |
| Interact | Left-click targeted object |
| Interact alternate | E |
| Open Codex | C |
| Release mouse / pause | Esc |
| Resume pointer lock | Click Resume or click the world canvas |

## Interaction Model

The player moves through the world in first person. The reticle locks onto physical scene objects using Three.js raycasting. When the player looks at an artifact, tablet, portal, vault, or the Great Gate, a small contextual prompt appears. Left-click inspects or activates that world object.

The Vault of Trust is now an in-world structure. Looking at it and clicking starts the Architect Trial. The existing server-first trust-token verification remains intact, with the static fallback still available when the backend is offline.

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

`npm run smoke` verifies the required backend/frontend files and checks for the immersive controls layer: pointer lock, mouse-look, WASD/arrow movement, raycast interaction, reticle/prompt UI, in-world vault, GitHub sync wiring, and trust-token fallback wiring.

## Production Direction

Next steps should focus on replacing select procedural primitives with authored `.glb` / `.gltf` assets while preserving the same asset-anchor contract. The current scene intentionally includes `registerAssetAnchor`, `getAssetAnchor`, and `loadGltfAsset` hooks so future imported models can be mounted onto the Great Gate, realm portals, relics, tablets, and vault without rewriting the interaction system.
