# Phase 1 — Canonical Foundation

## Objective

Establish the core source of truth and stable runtime contracts so humans and agents share one coherent model of MSTRMND before orchestration work expands.

## What lands in Phase 1

### Doctrine (completion test)

A new human or agent can explain:

1. **What MSTRMND is** — the intelligence layer between vision and daily execution  
2. **How it operates** — vision → context → planning → orchestration → execution → evaluation → learning  
3. **What it sells** — Blueprint → Launch → Core engagement ladder and operating offers  
4. **What rules govern systems** — canon, security/governance, evaluation/observability, agent/skill/connector standards  

Offline copy for CI and bootstrapping: `fixtures/doctrine-min/`.  
Live canon: pinned `mstrmnd.md` commit in `doctrine.pin.json`.

### Schemas (runtime contracts)

`@mstrmnd/schemas` defines vendor-neutral contracts:

| Contract | Purpose |
|---|---|
| `RuntimeScope` | org / workspace / user / agent / workflow / run / client / project / role / brand |
| `Provenance` | source, adapter, path, doctrine ref, producer |
| `MemoryNode` / `MemorySourceRecord` | scoped memory with required provenance |
| `IdentityModel` | scoped identity profile |
| `Artifact` | scoped generated/ingested artifacts |
| `AuditEvent` | append-only consequential activity |
| `PolicyDecision` | allow / deny / modify / require-approval |
| `ContextPack` | operator / company / business context assembly shape |
| `WorkspaceMount` / `WorkspaceNode` | file/folder workspace substrate |
| `AgentSpec` / `RunState` | agent + run lifecycle |

**Rule:** no new memory or artifact may be created without `scope` and `provenance`.

## Exit criteria

- [x] Doctrine fixture covers Phase 1 canon paths
- [x] `pnpm doctrine:ci` passes
- [x] `pnpm typecheck` passes for `@mstrmnd/schemas`
- [x] README + MASTER document mission, offers, and governance
- [ ] Live sync green in CI once doctrine token is available (optional for Phase 1 merge)

## Out of scope for Phase 1

- Hermes / MCP runtime apps
- Obsidian adapters
- Model providers
- Multi-tenant deploy
- PRESS editorial workflows
