# Stat Desk — running handoff

Read this first, every session. Update the "Current state" section before any
session closes, then run `./statdesk/handoff.sh` (or `statdesk\handoff.cmd`)
so it is committed AND pushed. A commit that is not pushed is invisible to the
next session. That is how the 2026-09-13/14 work got stranded (see history).

## Current state (update this block)

Last updated: 2026-09-26. THE PIPELINE IS BUILT AND WORKING END TO END.

### How it runs now

Nick asks in any chat on any device. Claude dispatches the GitHub Actions
workflow `Stat Desk`, it runs on the self-hosted runner on his machine, pulls
the MLB API, runs all 14 Stathead discovery queries in a signed-in Chrome, saves
provenance, commits and pushes. Claude reads the repo back and writes the brief.
Setup is `statdesk/SELF-HOSTED.md` and is already done.

Dispatch it with the `statdesk.yml` workflow, inputs `runner: self-hosted` and
`stathead: true`. If the runner is offline the job sits queued: cancel it and
re-dispatch with `runner: github` for the API-only path, and say so in the brief.

CONCURRENCY, fixed 2026-09-25: the group key now includes the runner choice.
Before the fix both jobs shared `statdesk-<ref>`, so a self-hosted run sitting
queued against a sleeping machine held the lock and the cloud fallback — whose
entire purpose is to work when that machine is off — queued behind it forever
and never started. Cancelling the queued local run released it instantly. With
the runner in the key the fallback can always start, while two runs of the same
kind still serialise. Do not collapse the key back to a single group.

### Historical framing: statdesk/history.js

The 14 DISCOVERY rules are all single-season. They find who is weird THIS year
and can never answer "how rare is this", which is the framing that turns a
milestone into a post. `statdesk/history.js` asks the multi-season question
through the same signed-in browser (40-40, 30-30, 40/30 at 24 or under). It
runs as a workflow step BEFORE ci.js, because ci.js is what commits.

It exits non-zero rather than letting a failed or capped query pass as an empty
list: "nobody has ever done this" and "the query broke" must never look alike.
The step is continue-on-error, so a history failure costs the framing, not the
brief.

RECORDS ARE NAMESPACED BY PREFIX. history.js passes idPrefix "H"; the discovery
pass uses the default "Q". On the first run they both numbered from Q001 into
the same dated folder and the discovery pass overwrote all three history
records seconds after they were written. The step reported success, because it
had succeeded — only the output was gone. The append-only queries.log was the
sole surviving evidence and the only reason it was caught. Any new caller
writing into that folder must pass its own prefix.

Verified 2026-09-25: 7 forty-forty seasons since 1901 (Ohtani 2024, Soriano
2006, Crow-Armstrong 2026, Bonds 1996, Canseco 1988, Rodriguez 1998, Acuña
2023) and 81 thirty-thirty seasons. Both complete, neither capped.

### NAMES ARE NOT UNIQUE — resolve by player id

There are two Max Muncys in the league (Dodgers id 571970, 29 HR; Athletics id
691777, 9 HR). A day-over-day diff keyed on fullName reported one of them
gaining twenty home runs overnight on 2026-09-26. The data was fine; the
comparison was wrong. Anything that joins players across two pulls must key on
`player.id`, never the name.

active-check.js had the same hazard in a worse place: it took the max games
across same-named players, so asking about an injured player would find his
healthy namesake and wave him through — a false pass in the one guard built to
catch a player who has stopped appearing. It now reports AMBIGUOUS and fails
rather than guessing.

### RUN THE ACTIVE CHECK BEFORE EVERY BRIEF

    node statdesk/active-check.js <date> "Name" "Name" ...

Every name in the brief, no exceptions. Exit code 1 means do not publish a
"right now" claim about the flagged player.

Why it exists: on 2026-09-25 the brief led an item with Rafael Devers at a
1.360 OPS over the last 30 days — the highest in baseball, correctly computed
across the complete pull, and wrong to publish. He had not taken a plate
appearance in FOURTEEN days. The 30-day window was carrying a hot stretch that
ended before the window closed. Nick caught it, which is precisely the homework
this pipeline is supposed to abolish. Replaced with Nolan Arenado, .455 over
the last ten days and playing daily.

The lesson generalises: A TRAILING-WINDOW STAT IS A HISTORICAL STAT FOR AN
INJURED PLAYER. Verifying a number is true is not the same as verifying it is
current. Season totals are safe; any "last 30 days", "since the break", "over
his last N" framing is not, unless the player is still on the field.

Thresholds are role-aware. A flat 3-game floor flagged Gavin Williams, who had
thrown 7 shutout innings four days earlier — starters make one or two turns in
ten days. Starters need 1+, everyday players and relievers 3+.

### What Nick wants from a brief

- Ten ideas, each a claim that is ALREADY VERIFIED. Never "check before
  posting". If it cannot be verified it does not go in the brief.
- NO REPEATS. A player already sent does not come back unless their number
  actually moved. He said this explicitly. Prefer fresh names and new
  categories over re-serving the same leaderboard.
- A PDF in the Nosebleed brand, plus the table in chat.
- Every claim computed across the COMPLETE pull (all ~747 hitters, all
  pitchers), not a sample. State the check count.

### Posted and permanently excluded

Sale, Stewart, Nuñez, Detmers, Martinez, Murakami. Tracked in
`statdesk/posted.json`, which the pipeline filters on automatically. Add a name
the day it goes out.

### What went out on Sep 26

1 De La Cruz 30-30 landed (82nd in history per Stathead's 81 prior, third of
2026) 2 Chase Burns 15-3 best win pct 3 Kevin McGonigle 95 BB at 21 4 James
Wood 30/20/100 only 5 Hunter Goodman 39 HR 6 Dylan Cease 239 K 7 Jeffrey
Springs 4-14 6.18 8 Mike Trout 106 BB 9 Oneil Cruz 20/30 in 96 G 10 Gabriel
Moreno .311 catcher. Nine fresh; De La Cruz returned on the milestone.

The active check pulled Michael Lorenzen before print: worst ERA in baseball
(7.21) but no appearance in ten days, so the item was stale. Replaced with
Springs, who is still starting. Second save by that check in two days.

STATHEAD LAG CONFIRMED: its 30-30 table had 81 rows and did NOT include De La
Cruz's same-day steal, and listed Crow-Armstrong at 40 SB and Abrams at 33
while the live API had 41 and 34. About one day behind. That is why his is the
82nd rather than one of the 81.

### What went out on Sep 25

First build ran API + ESPN only with the machine offline and carried an
explicit limit line. The machine came up later; the final version is
Stathead-verified and items 1 and 2 carry real historical framing. Crow-Armstrong and De La Cruz returned legitimately:
both numbers moved overnight and the move was the story.

1 Crow-Armstrong 45 HR / 40 SB — stole his 40th, the ONLY 40-40 player this
season (all-time framing deliberately not asserted). 2 De La Cruz 30 HR / 29 SB,
one steal from 30-30. 3 Nolan Arenado .455 over the last 10 days (REPLACED Rafael Devers, who led
the first draft on a 30-day number while two weeks into an injury — see the
active check above). 4 Cade Smith 41 SV.
5 Gavin Williams 244 K. 6 Brewers 100-59. 7 Jake McCarthy 30/13/32.
8 Jordan Walker 100 RBI at 24. 9 Tyler Rogers 32 holds at 35.
10 Sam Antonacci 28 HBP.

Passes corrected four claims. The activity failure (Devers) plus three number
errors: Walker is NOT the youngest with
100 RBI (Sal Stewart, 22, is); Rogers is TIED at 32 holds with Kelly and
Gaddis, not alone; Rogers is not the appearances leader (Fluharty, 81 G).

### Sent but not yet confirmed posted

Crow-Armstrong, Misiorowski, Schwarber, Arraez, Alvarez, Caminero, Simpson,
Montgomery, Machado, Adell, Alonso, Jensen, Naylor, Clement, Caballero, Olson,
Abrams, Burleson, Rice, Sánchez, Miller, Otto Lopez, Carroll, Reynolds,
Herrera, Fluharty, and as of Sep 24 the fresh ten: Ben Rice (re-served, see
below), Elly De La Cruz, Cal Raleigh, Cam Schlittler, Sandy Alcantara,
Fernando Tatis Jr., Sonny Gray, Miguel Vargas, Randy Arozarena, and the
Baz/Bibee/Singer 15-loss trio. Treat these as used; do not re-serve without a
real change.

Ben Rice appeared on Sep 23 at 39 HR and again on Sep 24 at 41. That is the
ONLY legitimate kind of repeat: the number moved and the move was the story.

### Live watch items

- Pete Crow-Armstrong: DONE. Stole his 40th overnight into Sep 25. 45 HR /
  40 SB, the only 40-40 player this season. Held out of Sep 24 for not moving,
  led Sep 25 the moment he did — the no-repeat rule working as intended.
- Elly De La Cruz: 30 HR / 29 SB. ONE steal from 30-30 (was one of each on
  Sep 24). Would be the third 30-30 man this season after Crow-Armstrong and
  CJ Abrams.
- Strikeout title undecided: Misiorowski 247, Gavin Williams 244, Cease 239,
  Schlittler 239, with a weekend to play.
- MLB wins lead: Sonny Gray reached 18 on Sep 24 and TIED Cristopher Sánchez.
  The Sep 23 brief said Sánchez led alone, which was true that day. Either man
  can take it outright in the final week.
- Ben Rice: reached 40 and is now at 41. Milestone landed Sep 24.

### What went out on Sep 24 (verification notes)

All ten claims recomputed across the complete pull. Two verification passes
were run; the first caught four bad claims, which is why the pass is not
optional:

- 30-30 club already contains Crow-Armstrong and CJ Abrams — a "first/only"
  framing for De La Cruz would have been wrong. He is pitched as the THIRD.
- Lowest average is Cal Raleigh .180, not Matt McLain (.187, second).
- Most batter strikeouts is Colson Montgomery 222, not Neto.
- Walks leader is Yordan Alvarez 107, not Harper.
- Sonny Gray ties Sánchez at 18 wins; Sánchez no longer leads alone.

Brand PDF note: the Google Fonts <link> does NOT load in the cloud renderer —
Chromium there has no CA bundle and the TLS handshake fails, so Oswald silently
falls back and the brief renders off-brand. Fetch the font CSS with curl (the
proxy works), download the TTFs, and inline them as base64 @font-face. The
Sep 24 build does this and is the template to copy.

### Known source behaviour

- Stathead runs about one game behind the MLB API. Publish a Stathead figure
  with the Stathead date.
- Sports Reference refuses headless Chrome and blocks datacenter IPs. Hence the
  visible browser on Nick's machine. Do not try to move it back to the cloud.

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
- 2026-09-24: fresh ten delivered (PDF + chat table). Workflow run
  36013755425 succeeded, all 14 Stathead queries returned, 364 hitter lines
  changed. Ben Rice reached 41 HR making seven 40-homer hitters.
- 2026-09-15 AM: Nick's computer unreachable from remote control; cloud session
  could not see any of the above. This file, `handoff.sh`, and the push rule
  in `CLAUDE.md` added so it cannot happen again.
