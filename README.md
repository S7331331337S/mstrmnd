# MSTRMND

**Flagship monorepo for the MSTRMND intelligence layer.**

> MSTRMND installs the intelligence layer between a company's vision and its daily execution.

Models change. The intelligence layer persists.

This repository is the primary product home for MSTRMND: canonical Phase 1 foundation, stable runtime contracts, and the path to Operator Zero execution.

## Phase 1 — Foundation (this PR)

Phase 1 establishes what every human and agent needs before runtime work expands:

| Deliverable | Location |
|---|---|
| Company canon & philosophy | `fixtures/doctrine-min/company/` |
| Positioning & commercial doctrine | `fixtures/doctrine-min/strategy/`, `commercial/` |
| Intelligence architecture + governance | `fixtures/doctrine-min/platform/` |
| Agent / skill / connector standards | `fixtures/doctrine-min/agents/`, `skills/`, `connectors/` |
| Stable runtime schemas | `packages/schemas` (`@mstrmnd/schemas`) |
| Doctrine pin + CI gate | `doctrine.pin.json`, `pnpm verify` |

**Completion test:** a new human or agent can explain what MSTRMND is, how it operates, what it sells, and what rules govern its systems — and TypeScript contracts exist for scope, provenance, audit, and policy.

## Repository map

| Repository | Role |
|---|---|
| **`mstrmnd` (this repo)** | Flagship product monorepo — foundation, schemas, future apps/packages |
| [`mstrmnd.md`](https://github.com/S7331331337S/mstrmnd.md) | Canonical doctrine source of truth (pinned here via `doctrine.pin.json`) |
| [`mstrmnd-core`](https://github.com/S7331331337S/mstrmnd-core) | Existing Operator Zero runtime (Hermes, MCP, memory) — reference implementation |

When doctrine and implementation conflict, update `mstrmnd.md` first, bump the pin here, then adopt in code.

## Stack

- **pnpm 10+ / Node 20+ / TypeScript / turbo**
- Workspace packages under `packages/*` (and later `apps/*`)

## Commands

```bash
pnpm install
pnpm typecheck          # TypeScript verify
pnpm doctrine:ci        # doctrine pin + fixture self-test
pnpm verify             # typecheck + doctrine:ci
pnpm doctrine:sync      # sync pinned doctrine (needs access to mstrmnd.md)
pnpm doctrine:validate  # validate pin / generated manifest
```

## Layout

```text
packages/schemas/     @mstrmnd/schemas — Phase 1 runtime contracts
fixtures/doctrine-min CI / offline doctrine tree (not hand-edited as canon)
scripts/              doctrine sync + validate
docs/MASTER.md        shared agent brief + backlog
AGENTS.md             hard invariants for coding agents
doctrine.pin.json     pinned mstrmnd.md commit
```

## Operating loop

```text
Vision
  → Context + Memory
  → Planning
  → Orchestration
  → Execution
  → Evaluation
  → Learning
  ↺
```

## License / contact

- Public site: https://mstrmnd.ai
- hello@mstrmnd.ai
