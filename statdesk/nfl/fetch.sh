#!/usr/bin/env bash
# Download nflverse player-season files (regular season + playoffs), 1999 on.
# nflverse builds these from the NFL's own play-by-play (GSIS) data.
set -euo pipefail
dir="$(cd "$(dirname "$0")/../data/nfl/nflverse" 2>/dev/null || mkdir -p "$(dirname "$0")/../data/nfl/nflverse" && cd "$(dirname "$0")/../data/nfl/nflverse" && pwd)"
cd "$dir"
last=${1:-$(date +%Y)}
for y in $(seq 1999 "$last"); do for t in reg post; do
  f="stats_player_${t}_${y}.csv"; [ -s "$f" ] && continue
  curl -sS -L --fail --max-time 60 -o "$f" "https://github.com/nflverse/nflverse-data/releases/download/stats_player/$f" || rm -f "$f"
done; done
ls | wc -l
