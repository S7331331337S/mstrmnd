# Mstrmnd Architecture

## Stack (locked)

| Layer | Choice |
|---|---|
| Frontend | Next.js App Router on Vercel (`apps/web`) |
| Auth + DB + RLS | Supabase |
| Agent runtime | eve on Vercel (`agents/intelligence-gathering`) |
| Models | Vercel AI Gateway |
| Durability | Vercel Workflows (via eve) |
| External tools | Vercel Connect |
| Payments | Stripe (Solo $49 / Pro $149 / Mastermind $349) |
| UI | AI SDK UI primitives + shadcn/ui |

## Flow

```text
User
  │
  ├─ signup/login ──► Supabase Auth
  │                      │
  │                      ▼
  │                 profiles row (trigger)
  │
  ├─ /onboarding ──► web chat UI
  │                      │
  │                      ▼
  │              eve session (Bearer = Supabase JWT)
  │                      │
  │                      ├─ instructions.md
  │                      ├─ tools → merge JSONB on profiles (service role)
  │                      └─ complete_onboarding → onboarding_completed=true
  │
  └─ /dashboard ──► protected; requires onboarding_completed
                         │
                         └─ (next) Stripe gate + signal reports
```

## Boundaries

- **Web** owns UX, Supabase SSR auth, and calling the eve HTTP session API.
- **eve agent** owns conversational intelligence gathering and profile writes via the Supabase **service role** (RLS still protects user clients).
- **Supabase** owns identity, persistence, and row-level security.
- **Stripe** products already exist; Phase 1 only surfaces tier placeholders.

## Monorepo layout

```text
apps/web                         Next.js
agents/intelligence-gathering    eve agent
packages/shared                  shared TS types
packages/schemas                 earlier contract package (retained)
supabase/migrations              SQL + RLS
docs/                            architecture, schema, tools
```
