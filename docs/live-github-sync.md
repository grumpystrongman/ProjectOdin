# Live GitHub Sync

Sprint 3 adds `src/game/githubSync.js`.

## Current Behavior

The browser attempts to fetch public repositories from:

```text
https://api.github.com/users/grumpystrongman/repos?sort=pushed&per_page=100
```

It then filters and normalizes repositories into in-world artifacts.

## Fallbacks

If GitHub rate limits, blocks, or the visitor is offline, the system falls back in this order:

1. Cached repository payload from local save state.
2. Curated seed data from `content.js`.

## Why Client-Side For Now

This is safe for public repo metadata and keeps Sprint 3 static-host friendly. Production should move this behind a backend route for caching, privacy, rate-limit control, and richer enrichment.

## Production Path

Add a FastAPI endpoint:

```text
GET /api/github/workshop
```

Responsibilities:

- Fetch public GitHub repository data.
- Cache the response.
- Add curated metadata and realm mappings.
- Remove irrelevant repositories.
- Return only fields needed by the game.

## In-World Mapping

Repositories receive:

- `repo`
- `title`
- `realm`
- `status`
- `signal`
- `language`
- `url`
- `updated`
- `stars`
- `forks`

The `signal` field controls the size and orbital energy of repository satellites in the Living Workshop.
