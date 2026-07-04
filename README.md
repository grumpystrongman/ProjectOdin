# Project ODIN: The Architect's Path

Sprint 4 turns Project ODIN into a fullstack‑ready vertical slice with a browser game client, FastAPI backend, server‑issued trust tokens, backend repository sync, and a production deployment path. This bundle bumps the internal version to `0.4.1` and adds an audit trail, documented workshop API endpoint, and user‑respecting accessibility settings.

## Sprint 4 Completed

- FastAPI backend with health, repository sync, trust-token issuance, and contact-token verification endpoints
  - Added `/api/github/workshop` alias for the repository sync route (the old `/api/github/repositories` remains for backwards compatibility)
  - Audit log writes `unlock_audit.log` entries on token issuance and contact verification without collecting personal data
- Frontend backend health check and backend-aware Codex
- Server-first GitHub sync with public/static fallback
- Server-issued contact trust token support with local fallback for static hosting
- Camera Director system for authored cinematic beats
  - Respect `reduceMotion` and `cinematicCamera` settings in the save state to disable cinematics for accessibility
- Production asset manifest for art/audio pipeline tracking
- Expanded persistence schema
- Updated smoke test and production build validation
- Fullstack launch helper
  - Save settings schema now exposes `reduceMotion` and `cinematicCamera` flags for accessibility

## Run Frontend

```bash
npm install
npm run smoke
npm run dev
```

## Run Backend

```bash
pip install -r requirements.txt
npm run backend
```

The backend runs at `http://localhost:8011`. For local frontend-to-backend calls through Vite, set a Vite proxy or host the built app behind the FastAPI service in Sprint 5. The client still works in static fallback mode when the backend is not present.

## Run Fullstack Helper

```bash
pip install -r requirements.txt
npm install
npm run fullstack
```

## Production Direction

Sprint 5 should add the final deployment adapter: FastAPI serves the built Vite app, `/api/*` routes are same-origin, secrets are environment-backed, and GitHub Actions builds and publishes the site.
