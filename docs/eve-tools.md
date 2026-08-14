# Eve tools — Intelligence Gathering Agent

Agent root: `agents/intelligence-gathering/`

## Conventions

- One tool per file under `agent/tools/`; **filename = tool name**.
- Use `defineTool` from `eve/tools` + Zod `inputSchema`.
- Tools run in the app runtime with `process.env` access.
- Authenticated user id comes from eve session auth (`principalId` = Supabase `auth.users.id`).
- Profile writes use the Supabase **service role** client.
- JSONB fields are **merged**, never wholesale overwritten.
- Return shape: `{ success: true, updated: ... }`.

## Channel auth

`agent/channels/eve.ts` accepts:

1. Supabase Bearer JWT → `principalId = user.id`
2. `localDev()` fallback for `eve dev`

The Next.js onboarding chat sends `Authorization: Bearer <supabase_access_token>`.

## Tools

| Tool | Input | Writes |
|---|---|---|
| `update_identity` | `role?`, `company?`, `stage?`, `location?`, `primary_domains?[]` | `profiles.identity` |
| `update_goals` | `personal?[]`, `business?[]` | `profiles.goals` |
| `update_signal_preferences` | `topics?[]`, `cadence?` (`weekly`\|`monthly`), `depth?` | `profiles.signal_preferences` |
| `update_style_preferences` | `tone?`, `format?` | `profiles.style_preferences` |
| `update_context` | `tools?[]`, `constraints?[]`, `notes?` | `profiles.context` |
| `complete_onboarding` | `summary` (string) | `onboarding_completed=true`, `onboarding_completed_at`, `memory_summary` |

## Merge semantics

`lib/profile-write.ts` deep-merges object patches into the existing JSONB value so successive tool calls accumulate knowledge. Array fields in a patch replace that key’s array (callers should pass the full desired list for that key).

## Local run

```bash
# from repo root
pnpm --filter @mstrmnd/intelligence-gathering dev
# default eve port — point web via NEXT_PUBLIC_EVE_URL
```

Required env:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_ANON_KEY` (channel JWT verify)
- `AI_GATEWAY_API_KEY` or Vercel OIDC for models
