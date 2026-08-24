# Mstrmnd Architecture

## Stack (locked)

| Layer | Choice |
|---|---|
| Frontend | Next.js 16.3 App Router on Vercel (`apps/web`) |
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
  ├─ /pricing ──► Stripe Checkout (Solo/Pro/Mastermind)
  │                      │
  │                      ▼
  │              webhook → profiles.subscription_tier
  │
  └─ /dashboard ──► protected; requires onboarding_completed
                         │
                         ├─ subscription panel
                         └─ signal reports ← POST /api/signal-reports/generate
                                │
                                ▼
                         eve signal-report agent (Bearer JWT)
                                │
                                └─ tools → signal_reports (service role)
```

## Boundaries

- **Web** owns UX, Supabase SSR auth, message persistence, and calling the eve HTTP session APIs.
- **eve intelligence-gathering** owns conversational onboarding and profile writes via the Supabase **service role**.
- **eve signal-report** owns weekly/monthly report generation into `signal_reports` via the service role.
- **Supabase** owns identity, persistence, and row-level security.
- **Stripe** Checkout + webhook write `subscription_tier` / customer ids on `profiles`.

## Monorepo layout

```text
apps/web                         Next.js 16.3
agents/intelligence-gathering    eve onboarding agent
agents/signal-report             eve signal report agent
packages/shared                  shared TS types
packages/schemas                 earlier contract package (retained)
supabase/migrations              SQL + RLS
docs/                            architecture, schema, tools
```
