# AGENTS.md — Mstrmnd

User-owned agentic intelligence layer.

> Before planning or coding, read [`docs/MASTER.md`](docs/MASTER.md) and [`docs/architecture.md`](docs/architecture.md).

## Locked stack

- Frontend: Next.js App Router on Vercel (`apps/web`)
- Auth + DB + RLS: Supabase
- Agent runtime: eve (`agents/intelligence-gathering`, `agents/signal-report`)
- Models: Vercel AI Gateway
- Durability: Vercel Workflows (via eve)
- External tools: Vercel Connect
- Payments: Stripe (Solo $49 / Pro $149 / Mastermind $349)
- UI: AI SDK UI primitives + shadcn/ui

**Do not invent alternative stacks.**

## Commands

```bash
pnpm install
pnpm verify
pnpm --filter @mstrmnd/intelligence-gathering dev
pnpm --filter @mstrmnd/signal-report dev
pnpm --filter @mstrmnd/web dev
```

## HARD invariants

1. Every table has RLS; users only touch their own rows.
2. Eve tools write profiles/reports with the Supabase service role and **merge** JSONB on profiles.
3. Onboarding asks 1–2 focused questions at a time.
4. No features outside the current phase scope.
5. Dark Swiss, monochrome UI.

## Layout

- `apps/web` — Next.js
- `agents/intelligence-gathering` — eve onboarding agent
- `agents/signal-report` — eve signal report agent
- `packages/shared` — shared types
- `supabase/migrations` — SQL
- `docs/` — architecture, schema, eve-tools, signal-report-tools
