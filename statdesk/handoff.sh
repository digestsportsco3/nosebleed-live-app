#!/usr/bin/env bash
# Commit everything in statdesk/ (and any other changes) and push the current
# branch. Run this before any session closes. Usage: ./statdesk/handoff.sh ["message"]
set -euo pipefail
cd "$(dirname "$0")/.."
branch="$(git branch --show-current)"
msg="${1:-Stat Desk handoff $(date +%Y-%m-%d)}"
git add -A
if ! git diff --cached --quiet; then
  git commit -m "$msg"
fi
for delay in 0 2 4 8 16; do
  sleep "$delay"
  if git push -u origin "$branch"; then
    echo "HANDOFF PUSHED: $(git rev-parse --short HEAD) on $branch"
    exit 0
  fi
done
echo "HANDOFF NOT PUSHED. Fix the network/login and run this again." >&2
exit 1
