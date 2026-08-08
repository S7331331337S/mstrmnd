# Eve tools — Signal Report Agent

Agent root: `agents/signal-report/`

## Conventions

- One tool per file under `agent/tools/`; **filename = tool name**.
- Use `defineTool` from `eve/tools` + Zod `inputSchema`.
- Authenticated user id comes from eve session auth (`principalId` = Supabase `auth.users.id`).
- Report writes use the Supabase **service role** client.
- Return shape: `{ success: true, ... }`.

## Channel auth

Same pattern as intelligence-gathering:

1. Supabase Bearer JWT → `principalId = user.id`
2. `localDev()` fallback for `eve dev`

Default local port: **3002** (`PORT=3002`). Web points via `NEXT_PUBLIC_SIGNAL_EVE_URL`.

## Tools

| Tool | Input | Writes / reads |
|---|---|---|
| `load_profile` | _(none)_ | Reads `profiles` (identity, goals, prefs, style, context, summary) |
| `start_signal_report` | `period_type`, optional dates | Inserts `signal_reports` with `status=generating` |
| `write_signal_report` | `report_id`, `title`, `summary`, section arrays | Updates row → `status=ready` + `content` |
| `fail_signal_report` | `report_id`, `reason` | Updates row → `status=failed` |

## Content shape

`signal_reports.content` jsonb:

```json
{
  "highlights": ["..."],
  "watchlist": ["..."],
  "decisions": ["..."],
  "risks": ["..."],
  "sources": ["profile goals"]
}
```

## Web trigger

`POST /api/signal-reports/generate`

- UI preview → returns a mock ready report (no eve call)
- Live → starts an eve session on the signal-report agent with the user JWT

## Local run

```bash
pnpm --filter @mstrmnd/signal-report dev
# PORT=3002 — point web via NEXT_PUBLIC_SIGNAL_EVE_URL
```

Required env:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_ANON_KEY` (channel JWT verify)
- `AI_GATEWAY_API_KEY` or Vercel OIDC for models
