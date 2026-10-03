# Agents

Three eve agents live in `agents/`. Each one is a separate deployable. `agent/agent.ts` is only the model config (`anthropic/claude-sonnet-4` through Vercel AI Gateway). The behaviour is in `agent/instructions.md`, the abilities in `agent/tools/*.ts`, and the entry point in `agent/channels/eve.ts`.

| Agent | Package | Purpose | Tools | Writes to |
|---|---|---|---|---|
| Intelligence Gathering | `@mstrmnd/intelligence-gathering` | Chats with you to build a private profile: identity, goals, signal preferences, style, context | `update_identity`, `update_goals`, `update_signal_preferences`, `update_style_preferences`, `update_context`, `complete_onboarding` | `profiles` |
| Signal Report | `@mstrmnd/signal-report` | Turns the profile into a weekly or monthly brief | `load_profile`, `start_signal_report`, `write_signal_report`, `fail_signal_report` | `signal_reports` |
| CANVAS | `@mstrmnd/canvas` | Creation seat of the Content Engine. Takes a thesis and drafts every format in parallel. Never publishes | `start_canvas_job`, `draft_text_format`, `draft_visual_spec`, `index_item` | `ce_jobs`, `ce_items` |

## Seeing what they are doing

Today an agent only does something when a request reaches it. Triggers:

- Intelligence Gathering: the `/onboarding` chat in `apps/web`.
- Signal Report: the dashboard "generate" button, which calls `POST /api/signal-reports/generate`.
- CANVAS: `POST /api/canvas/run`.

Where to look:

- Results: Supabase tables above (`signal_reports.status`, `ce_jobs`).
- Run logs: Vercel project > Logs, for each agent deployment.
- Not built yet: a single activity feed. This is the top item in [roadmap.md](./roadmap.md) ("Agent activity log").

## Calling an agent

All three expose the same HTTP shape and require `Authorization: Bearer <Supabase access token>`; the token's user id becomes the `principalId` the tools write as.

```bash
# start a session
curl -X POST "$AGENT_URL/eve/v1/session" \
  -H "authorization: Bearer $MSTRMND_ACCESS_TOKEN" \
  -H "content-type: application/json" \
  -d '{"message":"Generate my weekly signal report"}'
# continue it
curl -X POST "$AGENT_URL/eve/v1/session/$SESSION_ID" ...
```

Or use the operator CLI from the repo root:

```bash
pnpm mstrmnd agents                       # what each agent is and its URL
pnpm mstrmnd status                       # is each one reachable
pnpm mstrmnd ask signal "weekly report"   # needs MSTRMND_ACCESS_TOKEN
```

URLs come from `NEXT_PUBLIC_EVE_URL`, `NEXT_PUBLIC_SIGNAL_EVE_URL`, `NEXT_PUBLIC_CANVAS_EVE_URL` (defaults are local ports 3001-3003).

## Not agents (yet)

No vision or multimodal agent exists. `draft_visual_spec` in CANVAS writes a text spec for an image; it does not look at images.
