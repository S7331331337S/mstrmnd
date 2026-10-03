# Integrations and environment

Policy: stay OSS and in-repo where practical. Add an external service only when an operator asks for it. Agents that cannot self-serve a need should open a note in `pulse.md` rather than adding a dependency.

## In use

| Service | Role | Env vars | Where used |
|---|---|---|---|
| Supabase | Auth, Postgres, RLS | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` (server only), `SUPABASE_URL`, `SUPABASE_ANON_KEY` (agents) | `apps/web/lib/supabase`, agent `channels/eve.ts` and tools |
| Stripe | Checkout and webhook | `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_SOLO`, `STRIPE_PRICE_PRO`, `STRIPE_PRICE_MASTERMIND` | `apps/web/app/api/stripe/*` |
| Vercel AI Gateway | Model access | none (zero config on Vercel) | `agent.ts` in each agent |
| eve agent URLs | Web to agent calls | `NEXT_PUBLIC_EVE_URL`, `NEXT_PUBLIC_SIGNAL_EVE_URL`, `NEXT_PUBLIC_CANVAS_EVE_URL` | `apps/web/lib/*eve.ts` |
| App | Misc | `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_UI_PREVIEW`, `MSTRMND_DEV_USER_ID` (dev only) | various |

## Connecting a new project to Supabase

1. Create or choose the project. Copy URL and anon key into the host's env vars.
2. Run `supabase/migrations/*.sql` in order (`00001` core, `00002` content engine).
3. Keep RLS on. Agents authenticate with the user's Bearer token, so policies are the only guard.
4. Never expose `SUPABASE_SERVICE_ROLE_KEY` to the browser.

## Adding Clerk (or any other auth) instead

Not wired. The agents' `supabaseBearerAuth()` in `channels/eve.ts` and the RLS policies assume Supabase user ids. Swapping auth means changing all of: web middleware and login pages, each agent's channel auth function, and the `auth.uid()` policies. Recommendation: stay on Supabase Auth unless there is a concrete need Clerk solves.

## Checklist for any new integration

- Add its env vars to the table above.
- Add a one-line entry to [pulse.md](./pulse.md).
- Update [roadmap.md](./roadmap.md) if it unlocks or blocks something.
