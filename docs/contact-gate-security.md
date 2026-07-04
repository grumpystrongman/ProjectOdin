# Contact Gate Security

The contact reveal is intentionally not ordinary HTML text.

## Sprint 3 Behavior

- The visitor must complete The Architect's Trial.
- The trial issues a trust token through `createTrustToken`.
- On static hosting, the token is a local fallback token.
- In production, `/api/trust-token` should validate the score server-side and return a signed unlock token.
- Contact information is rendered to canvas with mild distortion.

## Threat Model

This is not cryptographic protection. It is bot-friction and spam reduction.

It helps against:

- Basic DOM scraping.
- Naive crawlers.
- Simple email harvesters.

It does not stop:

- Screenshot OCR.
- Human scraping.
- Browser automation that plays the trial.

## Production Upgrade

- Move contact values out of the frontend bundle.
- Require server-issued token to fetch encrypted contact payload.
- Render to canvas after decrypting in-memory.
- Add rate limiting.
- Add proof-of-work or invisible challenge only if spam becomes real.
