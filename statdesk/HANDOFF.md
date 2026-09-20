# Stat Desk — running handoff

Read this first, every session. Update the "Current state" section before any
session closes, then run `./statdesk/handoff.sh` (or `statdesk\handoff.cmd`)
so it is committed AND pushed. A commit that is not pushed is invisible to the
next session. That is how the 2026-09-13/14 work got stranded (see history).

## Current state (update this block)

Last updated: 2026-09-15 evening, local session on Nick's PC with `--chrome`.
Full morning formula ran end to end. Everything is pushed.

### What this session did

All six steps of the morning formula, for 2026-09-15:

1. PULL — ran locally, 25/25 API calls ok. **statsapi.mlb.com is reachable from
   Nick's machine.** The Sep 15 cloud session's "blocked host" was a cloud
   network problem, not an outage. Run the pull locally.
2. DISCOVER — 16 preset Stathead queries plus 5 follow-ups, Q001–Q021.
3. DRAFT + 4. RANK — `statdesk/briefs/2026-09-15-fresh10.md`.
5. STOP — waiting on Nick's picks.
6. HAND OFF — this block.

### Where the work is

Everything is on GitHub on `stats-research-pipeline`. Read these files rather
than a summary of them:

- `statdesk/briefs/2026-09-15-fresh10.md` — **today's Fresh 10**, ranked, with a
  STATHEAD Q line per idea, alternates, flags, and the four rules that returned
  zero rows.
- `statdesk/briefs/2026-09-15-statdesk.md` — the generated API brief (204
  findings scanned, top 10).
- `statdesk/data/browser/2026-09-15/Q001–Q021.md` — provenance for today's 21
  searches (URL, filters, row count, full table, row-by-row claim check),
  indexed in `statdesk/data/browser/queries.log`.
- `statdesk/data/mlb/2026-09-15/` — 25 cached API responses, indexed in
  `calls.log`.
- Earlier work: `2026-09-13-picks.md` (verified picks),
  `2026-09-14-fresh10.md` (superseded by today's — its age lines predate the
  age fix, do not reuse them).

### Next action for Nick

Pick from the Fresh 10 in `statdesk/briefs/2026-09-15-fresh10.md` (reply with
numbers). Verification runs in the browser on picks only, about 5 minutes each,
using each idea's STATHEAD Q line. If picking on a later date, re-run the pull
first so the numbers are current.

Idea 1 (Crow-Armstrong, 3 steals from 40-40, 2 hits from 400) and idea 2
(Detmers, 3 strikeouts from 700) are both time-sensitive. Both could resolve in
a single game.

### CLOSED Sep 15: the season-age bug is verified fixed

The `seasonAge()` June 30 helper in `statdesk/sports/mlb/adapter.js` now agrees
with Stathead. Q007 shows Caminero and Stewart at age 22 on the page, exactly
matching the adapter's output. Age-based rules are trustworthy again, and the
Sep 14 "re-check Caminero" item is closed — he is 22, with 40 homers.

Background, in case it recurs: the adapter used to take age from the API's
`currentAge` (age today). Baseball Reference and Stathead age a season by how
old the player was on JUNE 30. That is what made the Sep 14 Max Muncy query
return 0 rows, and it silently hit every age-based rule. It was never two
players being merged — 571970 (Dodgers, born 1990-08-25) and 691777
(Athletics, born 2002-08-25) are two real players with the same name and
birthday, pulled separately and correctly.

### KNOWN Sep 15: Stathead runs about one game behind the MLB API

Seen three times today: Murakami 501 PA on Stathead vs 503 from the API (Q001),
Simpson 573 vs 574 (Q002), Adell 96 career HR vs 97 (Q020). Neither source is
wrong and neither needs fixing. It means a milestone distance can differ by one
depending on the source. Publish the Stathead number with the Stathead date,
and say which source.

### Open items

- Career totals confirmed on Baseball Reference this run: Detmers 697 K (Q018),
  Crow-Armstrong 398 H (Q019), Adell 96 HR (Q020). Still API-only and NOT
  confirmed: Betts (311 HR / 198 SB / 1,875 H), Caminero (92 HR), Sale
  (2,769 K).
- Crow-Armstrong's career HR (83) and career SB (101) were behind a page ad on
  his Baseball Reference page and were not read. Re-read before publishing
  either. His career hits (398) WERE read and confirmed.
- Nuñez: pre-1898 stolen bases may have been scored under a different rule.
  That came from general knowledge, not Stathead. Lead with the OPS+ hook, not
  the 1888 hook.
- Detmers: only 2 pre-1960 seasons appeared in the game-log search. Say "in
  Baseball Reference game logs", never "ever".
- Stewart: the history angle did not hold. Drop him or post plain numbers.

### Blocking Nick daily: the cloud chat cannot reach the MLB API

He does not want to open PowerShell every morning. The only thing stopping a
claude.ai chat from running the pull is the cloud environment's network
allowlist: `statsapi.mlb.com` is not on it, so every cloud pull 403s. Fix and
its exact limits: `statdesk/CLOUD-ACCESS.md`. Until that setting changes, a
cloud session can only write a STOPPED brief, and the run has to happen on his
machine.

## Session-architecture facts (so the restart problem does not repeat)

- Chrome tools only load when a session STARTS with `claude --chrome`. They
  cannot be added to a running session. If a session has no browser, the fix
  is: write this handoff, run `handoff.sh`, `/exit`, then
  `claude --chrome` in the repo folder.
- Restarting creates a new session and archives the old one. That is normal.
  Everything the new session needs must be in this file and on GitHub.
- The remote-control link (claude.ai/code/session_…) only works while the
  computer is awake and the session is running. It is not storage.
- The local memory plugin (claude-mem, localhost:37777) is per-computer. Do
  not rely on it for handoff; this file is the handoff.
- The MLB Stats API sometimes returns 502 or "request cancelled" from the
  cloud; run the pull locally. Stathead discovery works without the API.

## History

- 2026-09-11: first cloud run, API pull failed (blocked host). Decision: hub
  moves to Nick's computer with Chrome (730206b).
- 2026-09-13 AM: morning formula ran locally; Nick picked 5 (Nuñez, Detmers,
  Martinez, Stewart, Sale); deep API pull committed 7cc1751.
- 2026-09-13 PM: session had no Chrome tools (started without `--chrome`).
  Restarted as "desktop-f00l87b-binary-kurzweil" with `--chrome`; 12 Stathead
  searches verified the 5 picks; committed f8aaa41. Nick's rule recorded:
  "always hand off before closing a session".
- 2026-09-14: fresh 10 run; committed c82ddd9. Nothing pushed.
- 2026-09-15 PM: full morning formula ran locally with `--chrome`. Pushed the
  5 stranded commits first (c82ddd9..4f9b349), then pull (db7634a), 21
  provenance records (589c3f5), Fresh 10 (03b08c5). API reachable from Nick's
  machine; age fix verified against Stathead.
- 2026-09-15 AM: Nick's computer unreachable from remote control; cloud session
  could not see any of the above. This file, `handoff.sh`, and the push rule
  in `CLAUDE.md` added so it cannot happen again.
