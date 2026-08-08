# Phase 1 — Platform Foundation

Locked scaffold for Mstrmnd:

1. Supabase schema + RLS (`supabase/migrations/00001_initial_schema.sql`)
2. eve Intelligence Gathering Agent + six profile tools
3. Next.js App Router skeleton with auth, onboarding chat, dashboard
4. Docs: architecture, schema, eve-tools

## Exit criteria

- [x] Real schema with RLS and profile auto-create trigger
- [x] Real eve tools that merge JSONB profile fields
- [x] Protected `/onboarding` and `/dashboard` routes
- [x] `pnpm typecheck` green
- [ ] Stripe checkout (placeholder only in Phase 1)
- [ ] Message persistence into `conversations` / `messages`

## Local boot order

```bash
supabase start
pnpm --filter @mstrmnd/intelligence-gathering dev
pnpm --filter @mstrmnd/web dev
```
