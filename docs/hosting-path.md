# Hosting Path

## Prototype

Use Vite locally:

```bash
npm install
npm run dev
```

## Static Hosting

The Sprint 2 app can be hosted as a static site after:

```bash
npm run build
```

The resulting `dist/` folder can be deployed to Netlify, Vercel, Azure Static Web Apps, GitHub Pages, or an internal static site host.

## Streamlit

Streamlit remains useful as a launcher or wrapper, but it is not ideal for the final immersive experience because the app depends on browser-native canvas, local storage, procedural audio, and eventually WebGL/WebGPU. Keep Streamlit for demos, not the final production target.

## Production Target

Recommended path:

- Frontend: React + React Three Fiber + Zustand or equivalent lightweight state
- Backend: FastAPI
- Hosting: Azure Static Web Apps or Vercel for frontend; Azure Container Apps or App Service for backend
- Data: GitHub API cache, small Postgres or SQLite-backed profile/codex store
- Security: server-side contact unlock token and rate-limited contact reveal endpoint
