# OrchestrAI Cloud Functions

Server-side AI scoring for the Module 7 capstone review workflow.

## Architecture

```
React SPA (Hosting)
   ↓ httpsCallable
Firebase Cloud Function (this directory)
   ↓ fetch
OpenRouter API
   ↓ routes to
Qwen (or any configured model)
   ↓ writes back to
Firebase Realtime Database  →  Admin Review Detail surfaces the suggestion
```

## Functions exposed

| Function | Type | Purpose |
|---|---|---|
| `scoreCapstoneTierB` | onCall | Scores a single submission against the 9-category rubric. Writes the suggestion to `/reviews/{submissionId}/tierBSuggestion`. |
| `pingTierBProvider` | onCall | Lightweight connectivity test — pings the OpenRouter endpoint with a 1-token completion. Used by the admin "Test Connection" button. |

## First-time deploy (requires Blaze plan)

```bash
# 1. From repo root
cd functions
npm install

# 2. Copy env file and fill in secrets
cp .env.example .env
# edit .env: set OPENROUTER_API_KEY (and optionally GITHUB_TOKEN)

# 3. Build TypeScript
npm run build

# 4. Deploy
firebase deploy --only functions
```

Functions are deployed in the same Firebase project as Hosting (`vthinkorchestrai-auth`). The frontend calls them via `getFunctions(app)` + `httpsCallable(functions, 'scoreCapstoneTierB')` — no extra URL config needed.

## Updating env vars without redeploy code

```bash
firebase functions:secrets:set OPENROUTER_API_KEY
```
(Modern Firebase Functions uses Secret Manager; pass the secret to the function via `functions.runWith({ secrets: [...] })` — already wired in `src/index.ts`.)

## Local testing with the emulator

```bash
npm run serve
# then in another terminal
curl http://localhost:5001/vthinkorchestrai-auth/us-central1/scoreCapstoneTierB \
  -X POST -H 'Content-Type: application/json' \
  -d '{"data":{"submissionId":"test-uid_CAP-01"}}'
```

## Cost estimate

| Model | Per-submission cost (~6K input + 1K output tokens) |
|---|---|
| qwen/qwen-2.5-72b-instruct | ~$0.0008 |
| anthropic/claude-3.5-haiku | ~$0.005 |
| openai/gpt-4o-mini | ~$0.001 |

100 submissions/month on Qwen ≈ $0.08. Negligible.

## Status

Scaffold ready — deploy once Blaze plan is active and `OPENROUTER_API_KEY` is set.
