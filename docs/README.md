# Mstrmnd docs index

Start here. Each file answers one operator question.

| Question | Doc |
|---|---|
| What is happening right now, what changed? | [pulse.md](./pulse.md) |
| What do the deployed agents do, and how do I call them? | [agents.md](./agents.md) |
| How do I connect Supabase, Clerk, Stripe, etc.? | [integrations.md](./integrations.md) |
| What is built, next, and later? | [roadmap.md](./roadmap.md) |
| How is it wired together? | [architecture.md](./architecture.md), [schema.md](./schema.md) |
| Tool-level detail | [eve-tools.md](./eve-tools.md), [signal-report-tools.md](./signal-report-tools.md), [canvas.md](./canvas.md) |
| Phase plan | [MASTER.md](./MASTER.md), [PHASE1.md](./PHASE1.md) |

## Rules for keeping docs coherent

1. Product READMEs describe one product. Cross-project facts live here in `docs/`.
2. Every merged change that alters an agent, env var, table or route updates `pulse.md` (one dated line) and the relevant doc.
3. Humans read `README.md` + `docs/`. Agents read `AGENTS.md` + each `agents/*/agent/instructions.md`. Keep the two consistent.
4. Do not add a dependency if a short in-repo module does the job. Ask first (see integrations.md).
