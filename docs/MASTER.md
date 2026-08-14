# MSTRMND — Agent Master Plan

**Read this first.** Prefer: (1) hard invariants in `AGENTS.md`, (2) this file, (3) locked stack in `docs/architecture.md`.

## Mission

Build **Mstrmnd** as a user-owned agentic intelligence layer:

1. Conversational onboarding (eve) seeds a private profile
2. Profile powers a personal/business mastermind
3. Weekly/monthly signal reports compound relevance over time

## Locked stack

Next.js App Router + Supabase + eve + AI Gateway + Vercel Workflows + Connect + Stripe + shadcn.

Do **not** invent alternative stacks.

## Active phase

**Phase 1 — Foundation (locked scaffold)**

- [x] Supabase schema + RLS
- [x] eve intelligence-gathering agent + 6 tools
- [x] Next.js auth/onboarding/dashboard skeleton
- [x] Docs: architecture, schema, eve-tools
- [x] Stripe checkout wiring (Solo/Pro/Mastermind + webhook → profile)
- [x] Persist onboarding messages into `conversations` / `messages`
- [x] Signal report generation agent

## Hard invariants

1. User owns the profile; RLS on every table.
2. Eve writes profile merges via service role only.
3. Ask 1–2 questions at a time; tools fire as soon as info is clear.
4. No empty packages / no stack drift.
5. Dark Swiss aesthetic for the web surface.

## Status stamp

- **Last aligned:** 2026-08-08
- **Priority:** Phase 1 foundation complete
- **Next:** Phase 2 — live binds (Vercel/Supabase/Stripe) + cadence automation
