# Mstrmnd skill super pack

Collected from [skills.sh/topic](https://www.skills.sh/topic/) using the official [skills CLI](https://github.com/vercel-labs/skills).

```bash
npx skills add <owner/repo>
npx skills add <owner/repo> --skill <skill-name>
npx skills find <query>
```

## Install

```bash
pnpm skills:install          # core: design/ui + vercel + react + next + ai + locked stack
pnpm skills:install:full     # every skill listed on the eight topic cards
pnpm skills:list             # show what is installed
```

Core is what this repo actually uses. Full is the complete topic-card harvest for other agents.

## Forks

| Upstream | Why | Our copy |
|---|---|---|
| [vercel-labs/skills](https://github.com/vercel-labs/skills) | Official CLI | [S7331331337S/skills-1](https://github.com/S7331331337S/skills-1) |
| [vercel-labs/agent-skills](https://github.com/vercel-labs/agent-skills) | Official Vercel skill collection | [S7331331337S/agent-skills](https://github.com/S7331331337S/agent-skills) |
| [expo/skills](https://github.com/expo/skills) | Already forked as the `skills` repo | [S7331331337S/skills](https://github.com/S7331331337S/skills) |

`S7331331337S/skills` was already the Expo pack, so the CLI fork landed as `skills-1`.

## Topic cards harvested

From https://www.skills.sh/topic/:

| Card | Slug | Count on the card |
|---|---|---|
| Frontend & React | `/topic/react` | 6 |
| Next.js | `/topic/nextjs` | 7 |
| Design & UI | `/topic/design` | 16 |
| Mobile | `/topic/mobile` | 6 |
| Agent workflows | `/topic/agent-workflows` | 20 |
| Databases | `/topic/databases` | 13 |
| Testing | `/topic/testing` | 5 |
| Marketing | `/topic/marketing` | 21 |

Plus AI extras used by this stack: `vercel/ai`, `vercel/eve`, `vercel/workflow`, `stripe/ai`.

Next.js skills moved from `vercel-labs/next-skills` to `vercel/next.js`. `next-best-practices` is no longer a skill — Next.js 16.3 writes it into `AGENTS.md` via `next dev`.

## Core sources

See `skill-pack/catalog.json` for the machine list. Core installs:

- `vercel-labs/agent-skills` (React, composition, web design, deploy, RN)
- `vercel/next.js` (cache components, dev loop, partial prefetch)
- `vercel/ai` (`ai-sdk`)
- `shadcn-ui/ui` (`shadcn`)
- `anthropics/skills` (`frontend-design`, `skill-creator`, `webapp-testing`)
- `pbakaus/impeccable`, `leonxlnx/taste-skill`, `emilkowalski/skill`, `nextlevelbuilder/ui-ux-pro-max-skill`
- `https://uizze.com/` (`anti-ui-slop`)
- `supabase/agent-skills`, `vercel/workflow`, `vercel/eve`, `stripe/ai`
- `obra/superpowers` (plan / debug / TDD / verify)
- `vercel-labs/skills` (`find-skills`)

Repo-owned routers live in `skills/mstrmnd-skill-pack` and `skills/mstrmnd-stack`. Other agents can install those with:

```bash
npx skills add <this-repo>
```

after this branch is on the default remote.

## Agents

The installer writes a canonical copy to `.agents/skills` (Cursor, GitHub Copilot, OpenCode, Amp, Codex, Gemini CLI) and symlinks that tree into `.claude/skills` and `.windsurf/skills`. Re-run with more `-a` flags if you need another agent from the [CLI support table](https://github.com/vercel-labs/skills#supported-agents).

Core install in this repo: **86 skills**, 22 sources, 0 failures. `npx skills list` is the live inventory; `skills-lock.json` pins hashes.
