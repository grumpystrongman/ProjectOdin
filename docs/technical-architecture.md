# Technical Architecture

## Sprint 3 Stack

- Vite
- Three.js
- Browser localStorage
- Procedural Web Audio
- Static-friendly GitHub synchronization
- Optional Streamlit wrapper

## Runtime Modules

```text
src/main.js              App orchestration and UI wiring
src/game/scene3d.js      Three.js renderer and world scene graph
src/game/content.js      Realm, artifact, tablet, dialogue, achievement data
src/game/state.js        Save state and persistence
src/game/audio.js        Adaptive procedural audio
src/game/trial.js        Architect's Trial game logic and contact canvas rendering
src/game/token.js        Trust token abstraction
src/game/githubSync.js   GitHub repository synchronization and fallback
```

## Direction

Sprint 3 establishes the correct long-term shape: web-native game frontend first, Streamlit wrapper second. Streamlit is useful for quick demos but should not own the experience.

## Production Direction

Frontend:

- React
- React Three Fiber
- Zustand or equivalent state store
- GSAP for authored camera beats
- Howler or Web Audio for final stems

Backend:

- FastAPI
- GitHub caching endpoint
- Contact unlock endpoint
- Optional analytics event endpoint

Storage:

- Local save first
- Optional accountless server persistence later
