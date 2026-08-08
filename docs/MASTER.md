# MSTRMND — Agent Master Plan

**Read this first.** Every agent working in this repo should treat this file as the shared operating brief.

If this file conflicts with older docs or chat context, prefer: (1) hard invariants in `AGENTS.md`, (2) this master plan, (3) pinned `mstrmnd.md` doctrine, (4) other docs.

---

## Mission

Build **MSTRMND** as a **model-agnostic agent intelligence layer** between an operator’s vision and daily execution.

Canonical line:

> MSTRMND installs the intelligence layer between a company's vision and its daily execution.

### Delivery shape (in order)

| Form | Intent |
|---|---|
| **1. Foundation (Phase 1)** | Canon, positioning, commercial doctrine, architecture standards, stable schemas |
| **2. Runtime** | Context, memory, orchestrator, workspace, policy — Operator Zero dogfood |
| **3. Plugin** | Same layer loads into hosts (Cursor MCP, CLI, harnesses) |
| **4. Template** | Repeatable pack that boots any harness with operator context |

---

## Repository roles

| Repo | Owns |
|---|---|
| [`mstrmnd.md`](https://github.com/S7331331337S/mstrmnd.md) | Doctrine source of truth |
| **`mstrmnd` (this repo)** | Flagship product monorepo — foundation, contracts, future runtime/apps |
| [`mstrmnd-core`](https://github.com/S7331331337S/mstrmnd-core) | Existing runtime reference (Hermes / MCP / memory) until converged |

---

## Active phase

**Phase 1 — Foundation**

Exit criteria (all true):

- [x] Canonical doctrine tree available offline via `fixtures/doctrine-min`
- [x] Doctrine pin + sync/validate scripts + CI gate
- [x] `@mstrmnd/schemas` with scope, provenance, audit, policy, memory, identity, artifact, context, workspace, run
- [x] README / AGENTS / MASTER explain what MSTRMND is, sells, and how systems are governed
- [ ] Live doctrine sync against private `mstrmnd.md` when `MSTRMND_DOCTRINE_TOKEN` is provisioned (pin already points at a reviewed SHA)

---

## Shared backlog

### Done (Phase 1)

- [x] Flagship repo scaffolding (pnpm / turbo / TypeScript)
- [x] Doctrine pin + fixture self-test
- [x] Stable schema package (`@mstrmnd/schemas`)
- [x] Agent brief (`AGENTS.md`, `docs/MASTER.md`, `docs/PHASE1.md`)

### Next (Phase 2+)

- [ ] Context assembler package (doctrine + identity + memory → `ContextPack`)
- [ ] Workspace mounts with path guards
- [ ] Orchestrator + run state (parent agent + sub-agent handoffs)
- [ ] MCP / host plugin surface
- [ ] Policy enforcement over consequential actions
- [ ] Operator pack template

### Deferred

- PRESS / editorial publish-gate work
- Empty package scaffolding for optics
- Multi-tenant managed deploy before Operator Zero dogfood

---

## Hard invariants

1. Human approval remains a hard stop for consequential actions.
2. Providers stay replaceable.
3. Adapters ≠ domain.
4. Explicit scope on memory, credentials, tool calls, artifacts, runs.
5. Doctrine is pinned — never fetch mutable doctrine mid-run.

---

## Status stamp

- **Last aligned:** 2026-08-08
- **Priority:** Phase 1 foundation (this branch)
- **Code maturity:** schemas + doctrine gate; no runtime apps yet
- **Next:** context + workspace packages with real behavior
