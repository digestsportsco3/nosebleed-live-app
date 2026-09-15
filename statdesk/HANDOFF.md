# Stat Desk — running handoff

Read this first, every session. Update the "Current state" section before any
session closes, then run `./statdesk/handoff.sh` (or `statdesk\handoff.cmd`)
so it is committed AND pushed. A commit that is not pushed is invisible to the
next session. That is how the 2026-09-13/14 work got stranded (see history).

## Current state (update this block)

Last updated: 2026-09-15, from the cloud session, reconstructed from the
2026-09-13/14 local session transcript.

### Where the work is

- On GitHub (`stats-research-pipeline`): the pipeline code only, up to 730206b.
- ONLY on Nick's main computer (`C:\Users\Administrator\nosebleed-live-app`,
  branch `stats-research-pipeline`), never pushed, three commits:
  - 7cc1751 — deep API pull on the 5 picks of 2026-09-13
    (`statdesk/briefs/2026-09-13-picks.md`, `statdesk/scratchpad/`, 39 API calls)
  - f8aaa41 — Stathead verification of those 5 picks: provenance records
    `statdesk/data/browser/2026-09-13/Q001–Q012.md`, `queries.log`, the updated
    picks file, and a `session-handoff.md`
  - c82ddd9 — fresh 10 for 2026-09-14 (`statdesk/briefs/2026-09-14-fresh10.md`),
    18 more Stathead records, and a wording fix in `statdesk/sports/mlb/rules.js`
    ("almost never" → "rarely" so the brief linter passes)
- TO RECOVER: on that computer run `git push -u origin stats-research-pipeline`.
  Then merge that branch into whatever branch is current, and merge this file
  with the local `session-handoff.md` (this file wins; delete the other).

### Verified picks from 2026-09-13 (Stathead, in Nick's Chrome, 12 searches)

Strongest first. Hook lines are still DRAFTS. Attribution on anything
published: "Source: Stathead / Baseball Reference, queried Sep 13 2026".

1. **Reid Detmers (LAA)** — no pitcher in Baseball Reference game logs has
   191+ strikeouts with 5 or fewer wins. His 9 no-decisions in starts of 6+ IP
   and 1 or fewer earned runs lead MLB (next: Schlittler, 6) and tie
   Samardzija 2014 for most in a season. A 6th win ties him with 5 others
   instead of alone. Caveat: only 2 pre-1960 seasons appeared in the game-log
   search, so say "in Baseball Reference game logs", never "ever".
2. **Nasim Nuñez** — only 3 other seasons have 46+ steals with an OPS this low
   (450+ PA), all from 1888. OPS+ of 50 is the lowest of all 171 seasons with
   40+ SB and 1 or fewer HR. Stathead shows OPS .535 (API said .534; use .535).
   Open question: pre-1898 steals may have been scored under a different rule.
   That came from general knowledge, not Stathead. If true, lead with the OPS+
   line instead of the 1888 line.
3. **Chris Sale** — 27th all-time in strikeouts, 5 short of passing Frank
   Tanana for 26th. Post before his next start. Since 1947 only Verlander and
   Clemens had an ERA this low at 37+ over 150+ IP. He is right at the cutoff;
   one bad start drops him off.
4. **Nick Martinez** — first pitcher since Doug Fister 2014 with ERA 3.00 or
   better, 5.5 or fewer K/9 and 1.5 or fewer BB/9 (6 such seasons since 1990).
5. **Sal Stewart** — the history angle did NOT hold. Tied for 41st; two
   players this young with 30 HR in the same season has happened in 11
   seasons. Drop him, or post just the numbers.

Skipped: the ESPN/StatMuse cross-check (optional per STATDESK.md).

### Fresh 10 for 2026-09-14 (API brief + 16 Stathead discovery searches)

History angles are QUESTIONS until Stathead confirms them. Yesterday's 5 were
left out even though the API repeated 4 of them (Stewart, Sale, Martinez,
Nuñez).

| # | Player | Idea | Numbers (MLB Stats API, pulled Sep 14 2026, 2026 in progress) |
|---|---|---|---|
| 1 | Pete Crow-Armstrong (CHC) | Close to 40 HR / 40 SB | 41 HR, 36 SB; 14 HR in last 30 days |
| 2 | Murakami + Montgomery (CWS) | Teammates with same HR and average | both 31 HR, both .206 |
| 3 | Munetaka Murakami (CWS) | Homers or nothing | 84 hits, 31 HR, 14 2B |
| 4 | Mookie Betts (LAD) | Near 300 career HR and 200 SB | 311 HR, 198 SB career |
| 5 | Luis Arraez | Rarely strikes out | 26 K in 617 PA |
| 6 | Chandler Simpson (TB) | .300 hitter, no homers | .305, 0 HR, 41 SB |
| 7 | Jackson Merrill (SD) | 25/25 with a low OBP | 25 HR, 26 SB, .298 OBP |
| 8 | Junior Caminero (TB) | 100 career HR by age 22 | 45 HR at 21, 40 at 22; 92 career |
| 9 | Jesús Luzardo (PHI) | Near 1,000 career K, and hot | 996 career K; 1.03 ERA last 5 starts |
| 10 | Rafael Devers (SF) | Hot streak | 8 HR in last 11 games |

Still to check:
- Career totals for Betts, Caminero and Luzardo are API-only; confirm on
  Baseball Reference before publishing.
- Yesterday's lines still held on Sep 14: Detmers still at 5 wins; Sale's and
  Nuñez's lines unchanged.

Known data problem: the scanner lists Max Muncy at age 36; Baseball Reference
has him at 35, and his "career" hits are fewer than his 2026 hits. Two players
with the same name are probably merged in the API pull (likely a lookup by
name instead of by player ID in `statdesk/sports/mlb/adapter.js`). He was
left out of the 10. Not fixed yet.

### Next action for Nick

Pick from the fresh 10 (reply with numbers). Verification runs in the browser
on picks only, about 5 minutes each.

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
