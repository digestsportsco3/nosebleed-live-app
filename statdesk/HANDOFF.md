# Stat Desk — running handoff

Read this first, every session. Update the "Current state" section before any
session closes, then run `./statdesk/handoff.sh` (or `statdesk\handoff.cmd`)
so it is committed AND pushed. A commit that is not pushed is invisible to the
next session. That is how the 2026-09-13/14 work got stranded (see history).

## Current state (update this block)

Last updated: 2026-10-01 (Braves-Phillies Game 3 brief sent; see "What went out on Oct 1"). THE PIPELINE IS BUILT AND WORKING END TO END. Postseason days: run task mlb-matchups (matchups.js + post-history.js), then angles.js, then build the brief from career and matchup angles, never box scores.

### MULTI-SPORT DECADE FACTS (2026-09-28) — NBA, NFL, college, Michael Jordan

Nick asked for the MLB decade-fact pipeline (unique, engaging oddity lines, not
league leaders) for every NBA decade, NFL, college football, college basketball,
plus 100 Michael Jordan facts. He added all Sports Reference sports to his
Stathead subscription for this.

Sources and code, by sport:
- NBA 1940s-2020s: `statdesk/nba/pull.js` (stats.nba.com, self-hosted runner) ->
  `statdesk/nba/facts.js` -> `statdesk/data/nba/facts/<decade>s-facts.json`.
  1940s has 38 lines, 1950s 83, 1960s 98, the rest 100 (early seasons kept few stats).
- Michael Jordan: `statdesk/nba/mj-facts.js` -> `statdesk/data/nba/facts/mj-facts.json`
  (100, from his official career, game logs and commonplayerinfo birthdate —
  ages are exact, never the API's season-age label).
- NFL 2000s-2020s: nflverse CSVs (`statdesk/nfl/fetch.sh`, gitignored raw) ->
  `statdesk/nfl/facts.js`.
- NFL 1920s-1990s, college football, college basketball: `statdesk/sport-facts.js`,
  one Stathead finder query per rule in the signed-in browser, rows stored as
  provenance (`statdesk/data/browser/<date>/S<SPORT>nnn.md`). Output
  `statdesk/data/<nfl|cfb|cbb>/facts/<decade>s-facts.json`. Dispatch with
  `statdesk-multisport.yml`, task `sport-facts`, args `nfl cfb cbb` (and optional
  decades). Each sport commits as it finishes.
- Render any set with `statdesk/render-facts.js` (one landscape page per file,
  closing method page), then headless Chromium to PDF.

Rules in sport-facts.js that must not be loosened:
- Every filter is re-checked locally on the returned rows; a criterion the site
  ignored can never produce a false "only".
- A result set that was cut off (more pages than read) never claims "only" or an
  exact count; it says "more than N".
- Derived "most N-yard seasons" / oldest / youngest lines come from the top-200
  rows of a "most in a season" query and are used only when those rows provably
  include every qualifying season.
- Decade totals use the finder's combined-seasons option, whose value is read off
  the form; if the answer comes back as single seasons the totals are skipped.
- NFL sacks before 1982 are unofficial on Pro Football Reference and are dropped.
- Coverage: college football player seasons start 1956, team seasons 1869 (major
  college). College basketball (men's, comp_id=NCAAM — without it women's seasons
  mix in) starts 1947-48 for players and teams. The 2026 college football season is
  in progress and excluded.

"Why post" notes (asked for 2026-09-28): every line now carries `why`.
Hand-written per fact in `nba/mj-era-facts.js` and `nba/player-facts.js`; for
rule-generated sets `lib/why.js` builds it from the line's kind plus its rule's
angle (sport-facts.js writes it; `tidy-facts.js --rewhy` redoes old files).
`tidy-facts.js` also forces one-decimal rates and adds the NFL unofficial-era
notes (all pre-1932 figures, punting before 1939, returns before 1941).
render-facts.js: with `why` a set takes two pages of 50; a per-page script
steps the type down until it fits. Print with Playwright (wait for
body[data-fit]) so the PDF reflects the fit; check pages with a scroll test.
- `nba/mj-era-facts.js` -> mj-era-facts.json: 100 Jordan-vs-his-era lines, none
  repeating mj-facts.json. Sent.
- `nba/player-facts.js <slug>`: 100 facts for any pulled player plus Jordan
  head-to-heads. Kobe needs `pull.js player 977 kobe` (task nba-extra, which
  also runs the cross-check). NEVER run it with slug mj — it writes
  mj-player-test.json precisely so the hand-built mj-facts.json is not lost.
- NFL 1920s-2020s complete and sent (d48f980).

NHL (2026-09-29): `statdesk/nhl/pull.js` (task nhl-pull, self-hosted: the cloud
container cannot reach api.nhle.com) pulls every skater, goalie, team and bio
season since 1917-18 into statdesk/data/nhl/seasons. `statdesk/nhl/facts.js`
builds the decades (1910s-2020s) with why notes. A stat is used only in seasons
where it was genuinely recorded (untracked stats arrive as zeros). Sent.

TIES (fixed 2026-09-29): season-count lines named one season when several tied.
lib/ties.js names 2-3 tied seasons together and drops 4+; factcore and the MLB
builder use it. MLB files were rewritten in place (raw data is on Nick's
machine); NBA and NFL were rebuilt. Corrected PDFs sent.

KNOWN DATA HOLE, found 2026-09-28 by the Stathead cross-check: stats.nba.com
leagueleaders silently omits some players (Kevin Porter, traded in 1977-78, is
missing entirely), so NBA "only" lines and "next best" names could be wrong.
`pull.js fill` (task nba-fill) adds every roster candidate's missing seasons
from his official career record. AFTER IT LANDS: rebuild nba/facts.js (all
decades), mj-facts.js, mj-era-facts.js and player-facts.js kobe; diff the line
texts against the committed versions; resend any PDF whose lines changed and
tell Nick exactly which lines changed. Cross-check otherwise agreed: 28/28
Jordan seasons, 47/53 decade top-fives (the rest were name spellings).

College basketball finders show percentages as fractions (.647): sport-facts
units carry pctFraction, which converts to percents and sends thresholds in
site scale. The first CBB pass (80427d8) predates the fix: its shooting rules
never fired and must not be rendered; the rerun comes from the nba-fill job.

Status at last update: NBA, MJ and NFL 2000s-2020s done and sent as PDFs earlier.
Run 8 (NFL pre-2000 + CFB + CBB) dispatched 2026-09-28 05:41 UTC on commit 9763f2f.
Still open: render/send those PDFs; Stathead cross-check samples for NBA/MJ.

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

### Repeat rule (CORRECTED by Nick 2026-09-30)

A player is NOT permanently excluded. The rule is: the same STAT for the same
player cannot appear in two lists in a row. Chris Sale can come back with a new
stat. `statdesk/posted.json` entries carry name + stat + date; run.js blocks
only same-player-same-stat pairs from the most recent list.

### NO GENERIC BOX-SCORE STATS (Nick has now said this TWICE)

He sees the box score. A line like "4-for-5, 2 HR, 6 RBI" is not an idea. Every
item needs an angle he cannot get from the box: career numbers against today's
opponent (e.g. Schlittler's career vs the Red Sox), hitters' career lines
against today's starter, a player's postseason career, first/only/Nth-ever
framing from Stathead, splits and oddities. statdesk/matchups.js pulls the
matchup and career data; Stathead supplies the history.

### DECADE FACTS (2026-09-28) — the thing Nick actually wanted

The league-leader grids were NOT what he asked for. He wanted the daily
brief's kind of stat, a hundred per decade: oddities, "only player of the
decade to...", near-misses, contradictions. That is `statdesk/facts.js`:

- ~60 era-aware oddity rules (power/no average, ERA under 2.50 with a losing
  record, 40 HR/15 doubles, walks > hits ...) + 16 extremes + near-misses
  (29 HR, .299, 99 RBI, 19 W ...) + streaks + team-mate pairings + decade
  totals + season counts + youngest/oldest + club facts.
- Every line is a predicate over EVERY player-season in the decade, pulled
  in full; the rows satisfying it are stored with it. "Only/two/few" COUNT
  PLAYERS, not player-seasons (Randy Johnson walking 130+ twice is one
  player, not two — that bug shipped once and was caught in review).
- Rules made of plain comparisons carry a Stathead Season Finder spec.
  `verify-facts.js` re-runs a sample on Nick's machine and compares the
  player-season SETS. FINAL run on the final files (commit 0cc967d): 50
  checks, 49 reproduced exactly (two only by name form: Tristram/Tris
  Speaker, Hank/Henry Aaron), 0 disagreed, 1 unverifiable — Jeff Samardzija
  2014 (7-13, 2.99 across CHC/OAK), which the API carries as one combined
  row under his LAST club with numTeams=2 and Stathead's finder splits into
  stints. That combined-row shape matters beyond verification: before the
  fix a traded player's whole season was credited to his last club in the
  team-mate rules; 14 team-mate lines changed on regeneration. `teams` now
  follows the API's numTeams.
- Selection: score-ranked with diversity caps, then fill passes so every
  decade reaches exactly 100. `render-decade-facts.js`: one landscape page
  per decade, four CSS-balanced columns (a count-based split overflowed),
  plus a closing method page. Delivered as an 11-page PDF.
- Build/regenerate: dispatch `statdesk-decades.yml` (cloud runner, ~2 min for
  ten decades); facts write to `<decade>s-facts.json` next to the leaders
  file. Raw pulls are NOT kept, so any rule change means a regeneration.
- Cross-check: dispatch `statdesk-decades-verify.yml` with mode=facts on the
  self-hosted runner (~4 min for 50 samples).

Known limits: no positions (the API's historical splits carry none), no
park adjustment, no postseason, age is the API's season age and can differ
from Stathead by a year.

### DECADE MODE (added 2026-09-28) — historical leaders, never from memory

Nick asked for 100 stats from each decade, all true. Built as a mode of the
pipeline, not a one-off:

- `statdesk/decades.js` pulls EVERY season in a decade in full from the MLB
  Stats API (official record, seasons back to 1876) plus standings, computes
  the leader in 22 categories mechanically, and commits a compact summary
  per decade to `statdesk/data/decades/<decade>s.json` (leaders + top five
  behind each as provenance + decade totals). Raw pulls are gitignored.
- Workflow `statdesk-decades.yml` runs it on a GitHub-hosted runner (the API
  is not blocked there; only Stathead needs Nick's machine). Own concurrency
  group. About 0.6 s per season.
- `statdesk/render-decades.js` renders one landscape page per decade: a
  10-season x 10-category grid = the 100 facts, decade-totals strip, method.
  Cells are height-capped so ties cannot overflow a page; 3+ way ties go to
  footnotes.
- `statdesk/verify-decades.js` + `statdesk-decades-verify.yml` cross-check
  samples against Stathead's Season Finder on Nick's machine and commit a
  report. Counting stats only. A disagreement fails the job; never reconciled.

Rules learned building it:
- QUALIFICATION IS PER LEAGUE on that league's own schedule. The official
  record has included Negro League seasons (1920-1948) since 2024; those clubs
  played 40-110 games, so one 154-game bar would silently disqualify all of
  them, including the record's own 1943 batting leader (Josh Gibson .466).
  AL/NL bars come from the standings capped at the schedule (154 before
  1961/62, 162 after); other leagues use the most games any hitter played.
  `--al-nl-only` builds the pre-2024-style version if Nick wants it.
- Some historical rows have NO NAME. Guard every name read.
- The API writes "Nolan Ryan Jr."; Stathead writes "Nolan Ryan". Strip
  suffixes before comparing sources.
- Innings compare as outs, never as decimals.
- Reasonableness check on the first full pull: 21 of 21 famous leaders
  matched (Ruth 60, Wilson 191, Williams .406, Maris 61, Wills 104, Gibson
  1.12, Ryan 383, Henderson 130, McGwire 70, Bonds 73, Ichiro 262, Hornsby
  .424, Gibson .466, Thigpen 57, K-Rod 62, Coleman 110, Johnson 364, Halladay
  21, Feller 240, Kiner 47, Mantle 52).

Delivered 2026-09-28: 1920s-2010s (ten decades; Nick's list skipped the
1960s, included anyway and flagged).

STATHEAD CROSS-CHECK RESULT (40 samples, 4 per decade): 39 agree. ONE genuine
source disagreement — 1923 RBI: the official MLB record credits Babe Ruth with
131; Stathead / Baseball Reference credits him with 130, tied with Tris
Speaker. The two record keepers differ by a run on a 1923 total, which is
common for that era. NOT reconciled: the page shows the official figure and
prints the disagreement as a footnote. The renderer now reads the latest
verify report and prints any genuine disagreement on the page it concerns,
so this happens automatically for future decades.

Three other "disagreements" in the raw report were name form only (Hank vs
Henry Aaron, Earl Averill vs Earl Averill Sr.). Both the verifier and the
renderer now treat same value + same surname as agreement.

### THE REGULAR SEASON ENDED 2026-09-27 — read this before the next run

Sept 27 was game 162: every club had played 161 with 15 games scheduled. The
daily fresh-ten format has now run out of regular season, and roughly 60
players have been used (see the sent list). Do NOT dispatch a routine daily
pull tomorrow expecting new leaderboard movement; there will be none until the
postseason generates it.

What to ask Nick before the next brief:
- Postseason coverage instead of a daily ten? Different shape: series previews,
  matchup splits, bullpen usage.
- Season-in-review / awards briefs? The data for these is already pulled and
  the exclusion list stops mattering, because the frame changes from "who is
  new" to "who was best".
- Final standings and league leaders as a one-off wrap?

The pull itself still works unchanged; it is the BRIEF FORMAT that needs a
decision. Nothing in the pipeline has to change to support any of the above.

### What went out on Oct 1: Braves-Phillies Game 3 (Nola vs Kerr), ten items

Nick asked for ten on the one game. Data: task mlb-matchups, which now also runs
postseason.js first, in `data/mlb/matchups/2026-10-01/`.
1. Riley vs Nola 23-64, 7 HR. 2. Acuna vs Nola .339, 11 XBH. 3. Olson 5 HR in 40 AB
vs Nola, but 3-for-30 in WC games. 4. Active ATL hitters vs Nola .286 / 23 HR,
against his career opponents' .237. 5. Nola in WC games: 2 GS, 13.2 IP, 0 R.
6. Nola's last two starts vs ATL: 13.1 IP, 3 ER. 7. Kerr vs PHI in 2026: 6.1 IP,
0 R, 2 H. 8. Kerr has thrown no more than 35 pitches in any 2026 outing; tonight
is his 4th career start. 9. Harris WC career 9-for-16. 10. Schwarber vs ATL .197
with 24 HR.
- NEW SOURCE FACT: `stats=career&gameType=F,D,L,W` returns ONLY the first type
  (F = Wild Card round), and it is correct: it includes the current week.
  For a full postseason career, request D, L and W separately and sum them.
- TRAP: a hitter's vsPlayerTotal against a pitcher counts his at-bats for ANY
  team, while the pitcher's vsTeamTotal counts only that franchise's hitters.
  Never subtract one from the other.

### What went out on Sep 30, second brief: the matchup brief (the model for every postseason day)

This replaced the generic morning brief. It was built from statdesk/matchups.js
(`data/mlb/matchups/2026-09-30/`), `node statdesk/angles.js 2026-09-30`, and
Stathead history (post-history.js, PH001-PH006 in `data/browser/2026-09-30/`).
Items:
1. Schlittler vs BOS, career: 6 GS, 38.2 IP, 2 ER, 49 K. The 2 postseason starts
   (2025 WC G3 8 IP 0 R 12 K; 2026 G1 6.1 IP 0 R 10 K) came from Stathead PH003.
   He is the only Yankee, and the only pitcher before age 26, with two postseason
   10+ K / 0 ER starts.
2. Stott / Marsh / J. Crawford a combined 0-for-27 vs Mahle.
3. Rice 3-for-7, 2 HR vs Gray. Also noted: G1 was the 5th postseason game ever
   with 4 H / 2 HR / 6 RBI, and the first Yankee with 2+ HR / 6+ RBI (PH001/PH002).
4. Goldschmidt 1-for-26 vs Gray.
5. Hays, Machado and Tatis 24-for-62, 6 HR vs Gausman.
6. Albies 9-18 and Riley 7-15 vs Sanchez; Harris 2-15 with 10 K.
7. Rutschman 0-for-10 vs Fried.
8. Bregman 7-for-8 vs King before G1, then 0-for-4 with 3 K.
9. Harper 2-for-21 with 11 K vs Sale.
10. Acuna vs PHI career .313/.395/.542, 21 HR.
CWS-HOU samples were too thin (the best was Doyle 0-for-8 vs Brown).

Source facts learned (do not relearn them):
- vsPlayerTotal, vsTeamTotal and vsTeam are REGULAR SEASON ONLY. Checked
  against the game logs; Sept. 29 is not in them.
- For a pitcher, vsTeamTotal returns batting-against stats only: no ERA and no
  IP. Get the ERA from the gameLog rows against that opponent.
- `careerPlayoffs` and `yearByYearPlayoffs` are BROKEN: they return the
  regular-season career. Get postseason lines from Stathead game finders
  (comp_type=post) or from box scores. angles.js still prints the bogus
  "postseason career" lines; ignore them, or fix matchups.js to use a real
  postseason split.
- Stathead postseason tables already included Sept. 29 when read at 20:53Z on
  Sept. 30.

### What went out on Sep 30 (first postseason brief, generic, superseded)

Built from statdesk/postseason.js (task mlb-postseason): the four Sept. 29 Wild
Card Game 1 box scores plus FINAL regular-season stats. 1 Ben Rice 4-5, 2 HR, 6
RBI (NYY 9-0 BOS) 2 Cam Schlittler 6.1 IP 0 R 10 K 3 Michael King 7 IP 1 H 0 R
8 K (SD 8-0 CHC) 4 two shutouts on day one, 17-0 combined 5 White Sox won 6-3 at
HOU with five pitchers, none past 3 IP (Hagen Smith 3 scoreless) 6 Austin Riley
3-run HR + Michael Harris II 3-for-3 (ATL 5-3 PHI) 7 HR, saves and wins titles
all ended tied (45-45 PCA/Schwarber, 41-41 Baker/Smith, 18-18 Gray/Sanchez)
8 Misiorowski won the K title on the final day (247 -> 252, Williams 248) and the
ERA title 1.80 9 Turang 99 -> 100 RBI on the final day 10 George Lombard Jr., 21,
3-for-4. Sale (9 K for ATL) excluded as posted. No historical claims made.
Final races are SETTLED; do not re-serve them.

### Unresolved as of the final morning (check the results before reusing)

These were live when the Sept 27 brief went out and are now settled. Anything
reusing them must re-pull, not copy the brief:
- HR title TIED: Crow-Armstrong 45, Schwarber 45
- Strikeout title: Gavin Williams 248, Misiorowski 247 (one apart)
- Saves TIED: Cade Smith 41, Bryan Baker 41
- Wins TIED: Sonny Gray 18, Cristopher Sánchez 18
- Brice Turang on 99 RBI, one short of 100

### What went out on Sep 27

1 HR title tied 45-45 2 Hunter Goodman 41 (hit two, joined the 40 club, now
eight deep) 3 K title one apart 4 Saves tied 5 Ohtani two-way: 30 HR/.890 OPS
and 8-2/1.79/95K 6 Juan Soto .919 OPS in 110 G 7 Bobby Witt Jr. 45 SB + 33 2B
8 Yamamoto 0.87 WHIP 9 Paul Skenes 200 K with a losing record 10 Brice Turang
99 RBI. Six fresh; the four race items reused sent names deliberately because
on the final day the race IS the story, not the player.

Ohtani had never been used and is the strongest single item: he pitched 85.2
innings at a 1.79 ERA while hitting 30 homers. Worth remembering that the
pitching file must be checked for two-way players — scanning only the hitting
file hides half of him.

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
