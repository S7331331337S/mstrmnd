# AGENTS.md — Mstrmnd

User-owned agentic intelligence layer.

> Before planning or coding, read [`docs/MASTER.md`](docs/MASTER.md) and [`docs/architecture.md`](docs/architecture.md).

## Locked stack

- Frontend: Next.js 16.3 App Router on Vercel (`apps/web`)
- Auth + DB + RLS: Supabase
- Agent runtime: eve (`agents/intelligence-gathering`, `agents/signal-report`, `agents/canvas`)
- Models: Vercel AI Gateway
- Durability: Vercel Workflows (via eve)
- External tools: Vercel Connect
- Payments: Stripe (Solo $49 / Pro $149 / Mastermind $349)
- UI: AI SDK UI primitives + shadcn/ui
- Runtime: Node.js 24 (CI). Engines floor `>=20.9.0`.

**Do not invent alternative stacks.**

## Commands

```bash
pnpm install
pnpm verify
pnpm --filter @mstrmnd/intelligence-gathering dev
pnpm --filter @mstrmnd/signal-report dev
pnpm --filter @mstrmnd/canvas dev
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
- `agents/canvas` — eve Content Engine CANVAS (multi-format drafts)
- `packages/shared` — shared types
- `supabase/migrations` — SQL
- `docs/` — architecture, schema, eve-tools, signal-report-tools
- `.cursor/mcp.json` — hosted Supabase MCP (project `qqcrngshszhgluhvrkqi`)
- `.agents/skills/` — installed agent skills (including Supabase and the checked-in super pack)
- `skills/` — repo-owned agent skills (`mstrmnd-skill-pack`, `mstrmnd-stack`)
- `skill-pack/` — catalog of skills.sh topic-card skills

## Agent skills

Install the curated super pack (Design/UI, Vercel, React, Next.js, AI, locked stack) with `pnpm skills:install`. Index: [`docs/skill-pack.md`](docs/skill-pack.md). Always load `mstrmnd-stack` before following a third-party skill so the locked stack is not replaced.
