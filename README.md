# Mstrmnd

User-owned agentic intelligence layer.

Conversational onboarding seeds a private profile, then powers a personal/business mastermind and weekly/monthly signal reports.

> MSTRMND installs the intelligence layer between a company's vision and its daily execution.

## Stack

| Layer | Choice |
|---|---|
| Frontend | Next.js 16.3 App Router (`apps/web`) on Vercel |
| Auth + DB + RLS | Supabase |
| Agent runtime | eve (`agents/intelligence-gathering`, `agents/signal-report`, `agents/canvas`) on Vercel |
| Models | Vercel AI Gateway |
| Durability | Vercel Workflows (via eve) |
| External tools | Vercel Connect |
| Payments | Stripe — Solo $49 / Pro $149 / Mastermind $349 |
| UI | AI SDK UI primitives + shadcn/ui |

## Structure

```text
apps/web/                         Next.js 16.3 App Router
agents/intelligence-gathering/    eve Intelligence Gathering Agent
agents/signal-report/             eve Signal Report Agent
agents/canvas/                    eve Content Engine CANVAS (creation seat)
packages/shared/                  shared profile/types
packages/schemas/                 runtime contract types (retained)
supabase/migrations/              SQL + RLS
docs/
  architecture.md
  schema.md
  eve-tools.md
  signal-report-tools.md
  canvas.md
```

## Phase 1 status

**Foundation complete**

- [x] Supabase initial schema + RLS + profile auto-create trigger
- [x] eve intelligence-gathering agent (`instructions.md` + 6 tools)
- [x] eve signal-report agent (`instructions.md` + 4 tools)
- [x] Next.js: `/`, `/login`, `/signup`, `/onboarding`, `/dashboard`, `/pricing`
- [x] Chat persistence + Stripe checkout/webhook scaffolding
- [x] Dashboard signal reports panel (preview + live trigger)
- [x] Docs for architecture, schema, eve tools, signal-report tools
- [x] Content Engine CANVAS eve agent (`ce_jobs` / `ce_items`, parallel text + visual-spec drafts)

## Commands

```bash
pnpm install

# 1) Database
supabase start
supabase db reset   # applies supabase/migrations

# 2) Agents (eve)
pnpm --filter @mstrmnd/intelligence-gathering dev   # :3001
pnpm --filter @mstrmnd/signal-report dev             # :3002
pnpm --filter @mstrmnd/canvas dev                    # :3003

# 3) Web
pnpm --filter @mstrmnd/web dev
```

Copy env templates:

- `apps/web/.env.local.example` → `apps/web/.env.local`
- `agents/intelligence-gathering/.env.example` → `agents/intelligence-gathering/.env`
- `agents/signal-report/.env.example` → `agents/signal-report/.env`
- `agents/canvas/.env.example` → `agents/canvas/.env`

## Docs

- [`docs/architecture.md`](docs/architecture.md)
- [`docs/schema.md`](docs/schema.md)
- [`docs/eve-tools.md`](docs/eve-tools.md)
- [`docs/signal-report-tools.md`](docs/signal-report-tools.md)
- [`docs/canvas.md`](docs/canvas.md)

## Deploy

Production: [https://mstrmnd-web.vercel.app](https://mstrmnd-web.vercel.app)

GitHub: [S7331331337S/mstrmnd](https://github.com/S7331331337S/mstrmnd) · Vercel project `mstrmnd-web` with **Root Directory** `apps/web`. `apps/web/vercel.json` sets install/build for the monorepo.

Until Supabase/Stripe/eve are bound, `NEXT_PUBLIC_UI_PREVIEW=1` keeps `/`, `/onboarding`, `/dashboard`, and `/pricing` browseable.
