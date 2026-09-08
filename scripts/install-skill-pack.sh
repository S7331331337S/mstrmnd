#!/usr/bin/env bash
# Install the Mstrmnd skill super pack via the official skills CLI.
# Docs: https://github.com/vercel-labs/skills
#
# Usage:
#   bash scripts/install-skill-pack.sh          # core profile (design/ui/vercel/react/next/ai)
#   bash scripts/install-skill-pack.sh --full   # every skills.sh topic-card skill
#   bash scripts/install-skill-pack.sh --list   # print planned installs without running

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CATALOG="$ROOT/skill-pack/catalog.json"
PROFILE="core"
DRY_RUN=0

AGENTS=(cursor claude-code github-copilot opencode amp codex gemini-cli windsurf)

while [[ $# -gt 0 ]]; do
  case "$1" in
    --full) PROFILE="full" ;;
    --core) PROFILE="core" ;;
    --list) DRY_RUN=1 ;;
    -h|--help)
      sed -n '2,11p' "$0"
      exit 0
      ;;
    *)
      echo "Unknown flag: $1" >&2
      exit 1
      ;;
  esac
  shift
done

if ! command -v node >/dev/null 2>&1; then
  echo "node is required" >&2
  exit 1
fi

if [[ ! -f "$CATALOG" ]]; then
  echo "Missing catalog: $CATALOG" >&2
  exit 1
fi

mapfile -t LINES < <(node --input-type=module -e "
import { readFileSync } from 'node:fs';
const catalog = JSON.parse(readFileSync(process.argv[1], 'utf8'));
const profile = process.argv[2];
for (const source of catalog.sources) {
  if (profile === 'core' && source.profile === 'full') continue;
  const skills = Array.isArray(source.skills) ? source.skills.join(',') : '*';
  console.log([source.install, skills, source.id].join('\t'));
}
" "$CATALOG" "$PROFILE")

AGENT_FLAGS=()
for agent in "${AGENTS[@]}"; do
  AGENT_FLAGS+=(-a "$agent")
done

echo "Mstrmnd skill super pack"
echo "  profile: $PROFILE"
echo "  sources: ${#LINES[@]}"
echo "  agents:  ${AGENTS[*]}"
echo

ok=0
fail=0
failed_ids=()

for line in "${LINES[@]}"; do
  [[ -z "$line" ]] && continue
  IFS=$'\t' read -r source skills id <<<"$line"
  skill_flags=()
  if [[ "$skills" == "*" ]]; then
    skill_flags=(--skill '*')
  else
    IFS=',' read -ra skill_names <<<"$skills"
    for name in "${skill_names[@]}"; do
      skill_flags+=(--skill "$name")
    done
  fi

  echo "==> $id"
  echo "    npx skills add $source ${skill_flags[*]} ${AGENT_FLAGS[*]} -y"

  if [[ "$DRY_RUN" -eq 1 ]]; then
    continue
  fi

  set +e
  npx --yes skills add "$source" "${skill_flags[@]}" "${AGENT_FLAGS[@]}" -y
  status=$?
  set -e

  if [[ "$status" -eq 0 ]]; then
    ok=$((ok + 1))
  else
    fail=$((fail + 1))
    failed_ids+=("$id")
    echo "    FAILED ($status): $id" >&2
  fi
  echo
done

if [[ "$DRY_RUN" -eq 1 ]]; then
  echo "Dry run only. Re-run without --list to install."
  exit 0
fi

echo "Install complete. ok=$ok fail=$fail"
if [[ "$fail" -gt 0 ]]; then
  echo "Failed sources:" >&2
  printf '  - %s\n' "${failed_ids[@]}" >&2
fi

echo "==> local routers (./skills)"
npx --yes skills add ./skills --skill '*' "${AGENT_FLAGS[@]}" -y || true

echo
npx --yes skills list || true
exit 0
