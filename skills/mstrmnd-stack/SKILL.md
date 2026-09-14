---
name: mstrmnd-stack
description: Locked Mstrmnd stack and hard invariants. Use before adding libraries, choosing a backend, restyling UI, or installing skills that would introduce Convex, Firebase, Prisma, Pages Router, or a new visual system.
---

# Mstrmnd locked stack

Read `docs/MASTER.md` and `docs/architecture.md` first.

## Stack (do not replace)

| Layer | Choice |
|---|---|
| Frontend | Next.js 16.3 App Router on Vercel (`apps/web`) |
| Auth + DB + RLS | Supabase |
| Agent runtime | eve (`agents/intelligence-gathering`, `agents/signal-report`, `agents/canvas`) |
| Models | Vercel AI Gateway |
| Durability | Vercel Workflows (via eve) |
| External tools | Vercel Connect |
| Payments | Stripe (Solo $49 / Pro $149 / Mastermind $349) |
| UI | AI SDK UI primitives + shadcn/ui |
| Runtime | Node.js 24 (CI). Engines floor `>=20.9.0`. |

## Hard invariants

1. Every table has RLS; users only touch their own rows.
2. Eve tools write profiles/reports with the Supabase service role and **merge** JSONB on profiles.
3. Onboarding asks 1–2 focused questions at a time.
4. No features outside the current phase scope.
5. Dark Swiss, monochrome UI.

## Skill routing for this stack

Use skills as adapters onto this stack. Do not follow a skill if it tells you to switch databases, routers, or design systems.

- React/Next: `vercel-react-best-practices`, `vercel-composition-patterns`, `next-cache-components-optimizer`
- UI: `shadcn`, `web-design-guidelines`, `frontend-design` — keep output monochrome Swiss, not the skill's demo aesthetic
- AI: `ai-sdk` (Gateway, not a raw provider SDK)
- Agents: `eve`
- Durability: `workflow`
- Data: `supabase`, `supabase-postgres-best-practices`
- Billing: `stripe-best-practices`
- Ship: `deploy-to-vercel`

Convex, Firebase, Prisma, Neon-as-primary, Pages Router, and new component libraries are out of scope even if a skill recommends them.
