# AGENTS.md — MSTRMND

**Flagship monorepo for the MSTRMND intelligence layer.**

Models change. The intelligence layer persists.

> Before planning or coding, read [`docs/MASTER.md`](docs/MASTER.md).

## What this repo is

`mstrmnd` is the primary product home for MSTRMND.

- **Doctrine** is authored in [`mstrmnd.md`](https://github.com/S7331331337S/mstrmnd.md) and consumed here through a pinned sync.
- **Phase 1** lands canonical foundation docs (fixture) + stable `@mstrmnd/schemas` contracts.
- Later phases add context, memory, orchestration, registries, and host plugins — only with real behavior.

[`mstrmnd-core`](https://github.com/S7331331337S/mstrmnd-core) remains the current Operator Zero runtime reference. Prefer converging useful runtime into this flagship repo over inventing parallel empty packages.

## Stack & tooling

- **pnpm 10+ / Node 20+ / turbo monorepo.** Use pnpm, never npm.
- Drive via turbo + pnpm filters from the repo root.

## Common commands

- `pnpm install` — install workspace deps
- `pnpm typecheck` / `pnpm build` — `tsc --noEmit`
- `pnpm verify` — typecheck + doctrine fixture gate
- `pnpm doctrine:sync` / `pnpm doctrine:validate` / `pnpm doctrine:ci`

## Layout

- `packages/schemas` — `@mstrmnd/schemas` (scope, provenance, audit, policy, memory, run, …)
- `fixtures/doctrine-min` — offline doctrine tree for CI (not the live canon)
- `docs/MASTER.md` — shared agent brief + backlog
- `scripts/` — doctrine sync/validate

## HARD invariants

1. **Human approval** is a hard stop for consequential actions.
2. **Model-agnostic:** providers are replaceable; do not couple domain logic to one vendor.
3. **Adapters at the edge:** vendors translate into stable schemas.
4. **Doctrine pinned:** never depend on floating `main` at runtime. Pin lives in `doctrine.pin.json`.
5. **Explicit scope + provenance** on memory, artifacts, tool calls, audit events, and runs.
6. **No empty packages** for optics — extract packages only when they own real behavior.
7. **Name reality accurately** (scaffold vs shipped).

## Multi-agent rules

- Update `docs/MASTER.md` backlog checkboxes when you complete or defer work.
- Prefer small PRs that advance one backlog item.
- `pnpm verify` before declaring done.
- Doctrine changes land in `mstrmnd.md` first; then bump the pin here.
