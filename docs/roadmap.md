# Roadmap

Single cross-project view. Detailed phase scope stays in [MASTER.md](./MASTER.md).

## Done (Phase 1)

- Supabase schema, RLS, profile trigger
- Agents: Intelligence Gathering, Signal Report, CANVAS
- Web: `/`, `/login`, `/signup`, `/onboarding`, `/dashboard`, `/pricing`
- Chat persistence, Stripe checkout and webhook
- Operator docs and CLI (`pnpm mstrmnd`)

## Next

| Item | Why | Owner |
|---|---|---|
| Agent activity log (table plus dashboard panel) | Operator cannot see what agents are doing | web + agents |
| Live status on the landing widget | Currently a hand-edited list | web |
| Agent health endpoint | Lets `pnpm mstrmnd status` check more than reachability | agents |
| CIPHER gate and Slack one-tap | Per MASTER.md | agents |
| Report scheduling | Reports only run on demand today | signal-report |

## Later (needs an operator decision)

- Expo app for device and web
- `npx` init command for new workspaces
- Vision/multimodal context agent
- Alternate auth (Clerk) - see integrations.md

## Per-project status

| Project | State |
|---|---|
| `apps/web` | Live. Next.js 16.3 |
| `agents/intelligence-gathering` | Deployed |
| `agents/signal-report` | Deployed |
| `agents/canvas` | Deployed; lives on branch `cursor/canvas-content-engine-1318` |
| `packages/shared`, `packages/schemas` | Stable; `schemas` retained for contracts |
