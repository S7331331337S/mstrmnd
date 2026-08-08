# Mstrmnd

User-owned agentic intelligence layer.

Conversational onboarding seeds a private profile, then powers a personal/business mastermind and weekly/monthly signal reports.

> MSTRMND installs the intelligence layer between a company's vision and its daily execution.

## Stack

| Layer | Choice |
|---|---|
| Frontend | Next.js App Router (`apps/web`) on Vercel |
| Auth + DB + RLS | Supabase |
| Agent runtime | eve (`agents/intelligence-gathering`) on Vercel |
| Models | Vercel AI Gateway |
| Durability | Vercel Workflows (via eve) |
| External tools | Vercel Connect |
| Payments | Stripe — Solo $49 / Pro $149 / Mastermind $349 |
| UI | AI SDK UI primitives + shadcn/ui |

## Structure

```text
apps/web/                         Next.js App Router
agents/intelligence-gathering/    eve Intelligence Gathering Agent
packages/shared/                  shared profile/types
packages/schemas/                 runtime contract types (retained)
supabase/migrations/              SQL + RLS
docs/
  architecture.md
  schema.md
  eve-tools.md
```

## Phase 1 status

**Foundation landed**

- [x] Supabase initial schema + RLS + profile auto-create trigger
- [x] eve intelligence-gathering agent (`instructions.md` + 6 tools)
- [x] Next.js skeleton: `/`, `/login`, `/signup`, `/onboarding`, `/dashboard`
- [x] Supabase SSR auth + middleware redirects
- [x] Dark Swiss UI baseline
- [x] Docs for architecture, schema, eve tools
- [ ] Local Stripe checkout wiring (placeholder only)
- [ ] Production Vercel + Supabase project bind

## Commands

```bash
pnpm install

# 1) Database
supabase start
supabase db reset   # applies supabase/migrations

# 2) Intelligence Gathering Agent (eve)
pnpm --filter @mstrmnd/intelligence-gathering dev

# 3) Web
pnpm --filter @mstrmnd/web dev
```

Copy env templates:

- `apps/web/.env.local.example` → `apps/web/.env.local`
- `agents/intelligence-gathering/.env.example` → `agents/intelligence-gathering/.env`

## Docs

- [`docs/architecture.md`](docs/architecture.md)
- [`docs/schema.md`](docs/schema.md)
- [`docs/eve-tools.md`](docs/eve-tools.md)
