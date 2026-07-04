# Deployment Plan

## Recommended

1. Build frontend with `npm run build`.
2. FastAPI serves `dist/` static assets.
3. `/api/health`, `/api/github/repositories`, `/api/trust-token`, and `/api/contact/verify` stay same-origin.
4. Use environment variables for contact and token secret.

## Environment Variables

- `ODIN_TRUST_SECRET`
- `ODIN_GITHUB_USER`
- `ODIN_CONTACT_EMAIL`
- `ODIN_CONTACT_PHONE`

## Hosting Options

- Azure App Service for Python backend plus static frontend.
- Render or Fly.io for simple prototype hosting.
- Static hosting only is acceptable for demos, but contact verification remains local fallback.
