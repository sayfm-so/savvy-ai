#!/usr/bin/env bash
# update-today.sh — refresh today.json from real same-day activity
# Morning routine: collects git logs, then guides Claude+Gemini to write today.json.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
DATE="$(date +%Y-%m-%d)"
TMP_GIT="$REPO_ROOT/.today.git.txt"

cd "$REPO_ROOT"

echo "▶ savvy-world update-today · $DATE"
echo "▶ repo: $REPO_ROOT"

REPOS=(
  "$HOME/savvy"
  "$HOME/g1-imitation"
  "$HOME/Dev/savvy-world-static"
)

: > "$TMP_GIT"
for r in "${REPOS[@]}"; do
  if [[ -d "$r/.git" ]]; then
    echo "── $r ──" >> "$TMP_GIT"
    git -C "$r" log --since=midnight --pretty=format:'%h %s' --all 2>/dev/null >> "$TMP_GIT" || true
    echo "" >> "$TMP_GIT"
  else
    echo "▶ skip (no repo): $r"
  fi
done

echo "▶ git log since midnight saved to: $TMP_GIT"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Next: paste the following into Claude:"
echo ""
echo "  Read docs/plans/2026-04-15-savvy-world-realism-design.md"
echo "  and regenerate today.json for $DATE using:"
echo "    1) today's claude-mem observations"
echo "    2) git commits in $TMP_GIT"
echo "  Follow the role-routing table. Arabic عامية مصرية."
echo ""
echo "Optional: ask Gemini to sanity-check the convos."
echo "  omc ask gemini 'review today.json convos for voice consistency'"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
read -r -p "Press ENTER after today.json is regenerated to validate + commit (or Ctrl-C to abort): "

if ! python3 -m json.tool today.json > /dev/null; then
  echo "✗ today.json is not valid JSON — fix and rerun"
  exit 1
fi

if git diff --quiet today.json; then
  echo "▶ no changes to today.json — skipping commit"
  rm -f "$TMP_GIT"
  exit 0
fi

git add today.json
git commit -m "data: refresh today.json for $DATE"
git push
rm -f "$TMP_GIT"
echo "✓ today.json pushed for $DATE"
