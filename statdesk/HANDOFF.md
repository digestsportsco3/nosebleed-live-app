# Stat Desk — running handoff

Read this first, every session. Update the "Current state" section before any
session closes, then run `./statdesk/handoff.sh` (or `statdesk\handoff.cmd`)
so it is committed AND pushed. A commit that is not pushed is invisible to the
next session. That is how the 2026-09-13/14 work got stranded (see history).

## Current state (update this block)

Last updated: 2026-09-15, cloud session. All local work is recovered and pushed.

### Where the work is

Everything is on GitHub. The three stranded local commits (7cc1751, f8aaa41,
c82ddd9) were pushed to `stats-research-pipeline` on Sep 15 and merged into
`claude/dreamy-curie-yt4y36`. Nothing is left only on one computer.

Read these files rather than a summary of them:

- `statdesk/briefs/2026-09-13-picks.md` — Nick's 5 picks, Stathead-VERIFIED,
  with recommended order, open questions, and draft kickers.
- `statdesk/briefs/2026-09-14-fresh10.md` — the Fresh 10 for Sep 14, with a
  STATHEAD Q line per idea, alternates, and flags.
- `statdesk/data/browser/2026-09-13/Q001–Q012.md` and
  `statdesk/data/browser/2026-09-14/Q001–Q018.md` — provenance for all 30
  Stathead searches (URL, filters, row count, full table, row-by-row check),
  indexed in `statdesk/data/browser/queries.log`.
- `statdesk/data/mlb/` — 39 + 25 cached API responses, indexed in `calls.log`.

### Next action for Nick

Pick from the Fresh 10 in `statdesk/briefs/2026-09-14-fresh10.md` (reply with
numbers). Verification runs in the browser on picks only, about 5 minutes each,
using each idea's STATHEAD Q line. Note the file is dated Sep 14; if picking on
a later date, re-run the pull first so the numbers are current.

### Open items

- Career totals for Betts, Caminero and Luzardo are API-only. Confirm on
  Baseball Reference before publishing.
- Nuñez: pre-1898 stolen bases may have been scored under a different rule.
  That came from general knowledge, not Stathead. If it holds, lead with the
  OPS+ hook instead of the 1888 hook.
- Detmers: only 2 pre-1960 seasons appeared in the game-log search. Say "in
  Baseball Reference game logs", never "ever".
- Stewart: the history angle did not hold. Drop him or post plain numbers.

### RESOLVED Sep 15: the Max Muncy "age mismatch"

It was not two players being merged. The scanner keys every player by MLB ID,
and the cached data is clean: 571970 is the Dodgers' Max Muncy (born 1990-08-25)
and 691777 is the Athletics' Max Muncy (born 2002-08-25, career 18 HR). Both
were pulled separately and correctly. Two real players, same name, same
birthday.

The real bug: the adapter set a player's age from the API's `currentAge`, the
age TODAY. Baseball Reference and Stathead age a season by how old the player
was on JUNE 30. The Dodgers' Muncy is 36 today but 35 for the 2026 season, so
the generated Stathead filter "Age >= 36" returned 0 rows (Q008), while his
page showed 35 (Q011). This silently hit every age-based rule, not just Muncy.

Fixed in `statdesk/sports/mlb/adapter.js`: a `seasonAge()` helper computes the
June 30 age from the birth date, falls back to the age the API reports on the
season split, then to `currentAge`. The age today is kept separately as
`currentAge`, and `ageBasis` records which basis was used. Verified: Dodgers
Muncy 35, Athletics Muncy 23, and July-through-December birthdays no longer
come out a year high.

Not yet re-run: the Sep 14 brief was generated before this fix, so its age
lines still show ages a year high for anyone born July–December. Re-run the
pull before reusing any age-based idea from it. The Caminero idea (#8, "100
homers by age 22") is the one in the Fresh 10 that depends on age. Re-check it.

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
- 2026-09-15: Nick's computer unreachable from remote control; cloud session
  could not see any of the above. This file, `handoff.sh`, and the push rule
  in `CLAUDE.md` added so it cannot happen again.
