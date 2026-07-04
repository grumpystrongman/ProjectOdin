# Sprint 3 Execution

Sprint 3 moves Project ODIN from a cinematic 2D canvas prototype into a real WebGL scene graph.

## Completed

- Replaced the canvas-only renderer with a Three.js `OdinScene` class.
- Added procedural terrain, fog, stars, data river, monoliths, artifact meshes, tablets, vault, and Corvus companion geometry.
- Added dynamic camera following with a cinematic third-person/observer feel.
- Added artifact discovery persistence, tablet recovery persistence, player position persistence, and expanded achievement logic.
- Added a minimap and Corvus dialogue panel.
- Added public GitHub synchronization layer with cache and curated fallback data.
- Added repository satellites around realms so GitHub projects are visible in-world.
- Added trust-token abstraction for the contact gate. Static hosting falls back to local tokens; production can provide `/api/trust-token`.
- Expanded the Architect's Trial to four move types: Speed, Reliability, Innovation, and Governance.
- Updated smoke tests to verify the Sprint 3 architecture.

## Validation

Run:

```bash
npm run smoke
npm run build
```

## Notes

Sprint 3 is still procedural rather than using commissioned art assets. That is intentional. The priority was to move the prototype onto the correct technical foundation before investing in final art production.

## Definition of Done

Sprint 3 is done when the playable prototype:

1. Runs as a Vite app.
2. Renders the world through Three.js.
3. Persists discoveries and progress.
4. Can attempt GitHub synchronization from the browser.
5. Keeps the contact reveal behind a playable trial.
6. Has a clear path to server-side token validation.
