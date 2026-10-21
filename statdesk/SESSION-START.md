# Stat Desk: standing rules (injected automatically at every session start)

Nick runs Nosebleed Sports / Big League Digest. He asks for verified, post-ready stat
posts. These rules come from his feedback; do not make him repeat them.

## What every list must be
- 100% true. Never from memory. Every number comes from a pull (MLB Stats API, ESPN,
  Stathead) committed in `statdesk/data/`. If a source is unreachable, say so plainly
  and give only what is verified.
- Unique and deep, never generic box-score lines. Mine every layer: career vs the
  opponent, hitter vs pitcher, postseason by round, splits, game logs, streaks.
- Each item: the stat, a "Verified" source line, "Why it posts", "Also true",
  and a "Post as written" line.
- Deliver a brand PDF (template `statdesk/brief_pdf.py`, fonts inlined from
  `statdesk/fonts/fonts.css`, print with `/opt/pw-browsers/chromium-*/chrome-linux/chrome
  --headless --no-sandbox --no-pdf-header-footer --print-to-pdf=...`) plus a chat table.
  Include full lineup-vs-pitcher tables (hitters who never faced him too).
- Fact-check every claim against the data before sending; fix and say what was fixed.

## Hard rules
- When Nick names teams (a matchup, a series), cover only those teams. NEVER mention eliminated
  teams or other clubs anywhere in that list (post, why, also, verified). Grep the HTML for other
  team names before sending.
- League-wide lists (e.g. "10 hot streaks from this season"): include player names AND team
  names. Nick said (Oct 21): "player names and team names, why would you exclude?"
- The same stat for the same player cannot appear in consecutive lists
  (`statdesk/posted.json` logs every item; append each delivered item).
- Never omit games; say clearly when data is incomplete (runner offline).
  Never estimate (no OPS+ guesses). Where two sources disagree, leave the number out.
- Hitter-vs-pitcher (vsPlayerTotal) and vsTeamTotal splits are regular season only.

## How data is pulled
- The cloud container cannot reach statsapi.mlb.com, ESPN or Sports Reference. All pulls
  run on Nick's self-hosted Windows runner via GitHub Actions workflow
  `.github/workflows/statdesk-multisport.yml` (dispatch with the GitHub MCP tool
  `actions_run_trigger`, repo digestsportsco3/nosebleed-live-app, ref main).
- Tasks: `mlb-daily` (postseason boxes + today's starters + hitters + Stathead history),
  `mlb-series` (args "CLE:TB"), `mlb-player-post` (args "Name" hitting|pitching),
  `mlb-relievers` (args 'CLE TB "Hunter Gaddis" "Cade Smith"'), `mlb-legends`
  (franchise WAR + MLB API; `--names "A:hitting,B:pitching"`), `nfl-player`
  (args '"Brock Purdy" SF WSH --from 2022 --season 2026 --yds 300').
- If a run sits "queued", the runner is offline: Nick must log in to Windows or run
  `.\run.cmd` in `C:\Users\Administrator\actions-runner`. Tell him; don't guess data.
- Throttle Stathead to >= 4 s per query. Never commit raw Stathead/B-R HTML.

## Git
- Work goes to `main` (every list this season was pushed there). Commit and push after
  every change; report the pushed commit hash in the final reply.
- Before a session ends or context is compacted: update the "Current state" section of
  `statdesk/HANDOFF.md`, append a dated entry, then push.
