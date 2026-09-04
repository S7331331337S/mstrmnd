---
name: mstrmnd-skill-pack
description: Index for the Mstrmnd agent skill super pack. Use when choosing which installed skill to load for Design/UI, Vercel, React, Next.js, AI SDK, eve, Supabase, Stripe, or agent workflow work. Read skill-pack/catalog.json before installing more skills.
---

# Mstrmnd skill super pack

This repo vendors a curated skill pack collected from [skills.sh/topic](https://www.skills.sh/topic/). Skills are installed into project agent directories via the official CLI:

```bash
npx skills add <owner/repo>
pnpm skills:install          # core profile
pnpm skills:install:full     # every topic-card skill
```

Canonical catalog: `skill-pack/catalog.json`.
Human index: `docs/skill-pack.md`.

## Load the right skill

| If the task is… | Load |
|---|---|
| React performance, waterfalls, bundles, memo | `vercel-react-best-practices` |
| Component APIs, composition, compound components | `vercel-composition-patterns` |
| Next.js cache components / PPR | `next-cache-components-optimizer` or `next-cache-components-adoption` |
| Next.js local `next dev` loop | `next-dev-loop` |
| shadcn/ui + Tailwind theming | `shadcn` |
| Visual polish, a11y, spacing, type | `web-design-guidelines` then `frontend-design` |
| Taste pass (minimal / bold / quiet) | impeccable: `critique`, `polish`, `distill`, `quieter`, `bolder`, `delight` |
| Stop generic AI UI | `anti-ui-slop` (uizze) plus Dark Swiss invariant in `AGENTS.md` |
| AI SDK `generateText` / `useChat` / tools | `ai-sdk` |
| eve agent files, tools, channels | `eve` |
| Vercel Workflows durability | `workflow` |
| Supabase + RLS + Postgres | `supabase` and `supabase-postgres-best-practices` |
| Stripe Checkout / webhooks | `stripe-best-practices` |
| Deploy / env / preview URLs | `deploy-to-vercel` |
| Discover more mid-session | `find-skills` |
| Plan → execute → verify | `writing-plans`, `executing-plans`, `verification-before-completion` |

Always also load `mstrmnd-stack` so locked-stack invariants are not drifted.

## Do not vendor randomly

Install new skills with the CLI, then add the source to `skill-pack/catalog.json`. Do not copy third-party `SKILL.md` files by hand.

## Forks we keep

- CLI: https://github.com/S7331331337S/skills-1 (upstream `vercel-labs/skills`; named `skills-1` because `S7331331337S/skills` is the Expo pack)
- Official Vercel collection: https://github.com/S7331331337S/agent-skills
