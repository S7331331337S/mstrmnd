# Pulse

Newest first. One line per change that affects agents, routes, tables, env vars or docs. Plain language.

## 2026-03-10

- Added operator docs: `docs/README.md` (index), `agents.md`, `integrations.md`, `roadmap.md`, this file.
- Added `pnpm mstrmnd agents|status|ask` CLI.
- Added Operator status widget to the landing page.

## Earlier

- Upgraded web app to Next.js 16.3, deployed on Vercel.
- CANVAS agent added: `ce_jobs` and `ce_items` tables (`00002_content_engine.sql`), `/api/canvas/run`. This landed on branch `cursor/canvas-content-engine-1318`, which is the branch to read for the newest agent work.
- CI moved to Node 24.
- Phase 1 foundation: persistence, Stripe, onboarding UI.

## Known gaps

- `mstr-workspace` and the Cursor plugin portability work are not in this repository. If they exist, they are in another repo or branch; link them here once located.
- Some docs predate CANVAS and may omit it; `docs/README.md` is the corrected index.
