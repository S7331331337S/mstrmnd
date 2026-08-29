# Eve tools — CANVAS agent

Agent root: `agents/canvas/`

CANVAS is the Content Engine v2 **creation** seat. One thesis in → parallel format drafts out. It is not a seventh product and not four specialist agent seats.

## Conventions

- One tool per file under `agent/tools/`; **filename = tool name**.
- Use `defineTool` from `eve/tools` + Zod `inputSchema`.
- Authenticated user id comes from eve session auth (`principalId` = Supabase `auth.users.id`).
- Writes use the Supabase **service role** client.
- Return shape: `{ success: true, ... }`.
- Voice bibles are files under `canon/` (read by `start_canvas_job`), not a fourth worker.

## Channel auth

Same pattern as intelligence-gathering / signal-report:

1. Supabase Bearer JWT → `principalId = user.id`
2. `localDev()` fallback for `eve dev`

Default local port: **3003** (`PORT=3003`). Web points via `NEXT_PUBLIC_CANVAS_EVE_URL`.

## Tools

| Tool | Input | Writes |
|---|---|---|
| `start_canvas_job` | DESK payload (`template`, `voice`, `thesis`, optional formats / image brief) | Inserts `ce_jobs` (`status=drafting`), returns execution plan |
| `draft_text_format` | `job_id`, text `format`, `body` | Inserts `ce_items` (OPERATOR banned-vocab gate) |
| `draft_visual_spec` | `job_id`, optional `prompt` | Inserts `ce_items` format=`visual_spec` (prompt block, no image model) |
| `index_item` | `item_id`, optional `mark_job_complete` | `ce_items.status=indexed`; optionally `ce_jobs.status=awaiting_approval` |

## Capability routing

- Text formats → `draft_text_format`
- `visual_spec` → `draft_visual_spec` (only when SCOUT `imageBrief` is present)
- Audio / video / multimodal → **deferred** (Phase 2 Creative Studio)

Independent formats share one plan level (studio DAG fan-out). CIPHER, HERALD, Slack one-tap, and AXIOM writers are **not** in this slice. Jobs stop at `awaiting_approval`.

## Web trigger

`POST /api/canvas/run`

- UI preview → returns mock indexed `press_card` + `linkedin` items (no eve call)
- Live → starts an eve session on the canvas agent with the user JWT

## Local run

```bash
pnpm --filter @mstrmnd/canvas dev
# PORT=3003 — point web via NEXT_PUBLIC_CANVAS_EVE_URL
```

Required env:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_ANON_KEY` (channel JWT verify)
- `AI_GATEWAY_API_KEY` or Vercel OIDC for models
