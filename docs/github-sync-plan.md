# GitHub Sync Plan

Sprint 2 includes curated repository seed data so the Living Workshop can render project artifacts immediately. Sprint 3 should turn this into live synchronization.

## Target Repositories

Initial project artifacts should include:

- ThreadlineAI
- AnalyticsPlatform
- OpenAegis
- OpenPulse
- PayerPlan
- AI-Half-Life
- world-cup-decision-lab
- retail-qa-assistant

## API Shape

Future endpoint:

```http
GET /api/github/workshop
```

Response:

```json
{
  "updatedAt": "2026-07-04T00:00:00Z",
  "repositories": [
    {
      "name": "ThreadlineAI",
      "description": "Windows-native AI sidecar",
      "url": "https://github.com/grumpystrongman/ThreadlineAI",
      "realm": "sanctum",
      "activityScore": 97,
      "language": "C#",
      "lastCommitAt": "2026-07-01T12:00:00Z"
    }
  ]
}
```

## World Mapping

- AI / LLM / agent repositories map to Sanctum.
- Analytics / data platform repositories map to Forge.
- Healthcare operations repositories map to Archive.
- Governance / trust / security repositories map to Workshop or Citadel.
- Simulation / research repositories map to Observatory.

## Sync Behavior

When a repository changes:

- Artifact glow intensity increases.
- Corvus receives new contextual dialogue.
- Codex adds or updates the project entry.
- Achievement checks can unlock based on project categories.

## Privacy and Safety

Only public repository metadata should be shown by default. Private repository names or descriptions should not be exposed unless explicitly configured.
