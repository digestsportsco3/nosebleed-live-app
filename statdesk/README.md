# Nosebleed Stat Desk (Big League Digest)

Every morning: a ranked list of 10 Hembo-style stat post ideas, statistically
true, sourced, framed as questions for Nick to verify. Sources in priority
order: Stathead (primary, through Nick's signed-in Chrome), ESPN and StatMuse
(cross-check), MLB Stats API (automated bonus, no key or approval needed).

The hub is a Claude Code session on Nick's main computer started with
`claude --chrome`. Start here: `statdesk/SETUP-LOCAL.md`. Operating rules for
that session: `statdesk/STATDESK.md`.

## Run it from a claude.ai chat (no terminal)

One setting change makes the daily pull work from a cloud chat, so Nick can ask
for the 10 and get them back in the chat. See `statdesk/CLOUD-ACCESS.md`. The
Stathead half still needs his own browser; that is by design, not a gap.

## Run it on demand

macOS / Linux:  `./statdesk/run.sh`
Windows:        `statdesk\run.cmd`

Options: `--date YYYY-MM-DD` (re-run a past date), `--sport mlb` (default; nba/nfl are stubs).

## Schedule it (7:00 AM Eastern, daily)

macOS / Linux:  `./statdesk/scheduler/install-mac-linux.sh`
Windows (PowerShell as admin): `.\statdesk\scheduler\install-windows.ps1`

Caveat: the computer must be on (and awake) at 7:00 AM or the run is skipped.
Output of scheduled runs is appended to `statdesk/data/scheduler.log`.

## What's where

- `statdesk/data/<sport>/calls.log` — one line per API call: ID, timestamp, URL, status. Every number in a brief cites one of these IDs.
- `statdesk/data/<sport>/YYYY-MM-DD/<callID>.json` — the raw response for each call, cached.
- `statdesk/briefs/` — the daily ranked lists.
- `statdesk/lib/` — sport-agnostic: logged HTTP, scanner, brief writer.
- `statdesk/sports/mlb/` — the MLB adapter (which endpoints, how they normalize) and the rule set (anomaly tests, milestone thresholds, heat windows, Stathead query templates).
- `statdesk/sports/nba/`, `statdesk/sports/nfl/` — placeholders with the interface a new sport must implement. The scanner and brief writer need no changes to add a sport.

## The pull (MLB), in order

1. Season hitting for all players (1 call), season pitching for all players (1 call).
2. Standings (1 call) — team W-L and games remaining (162 minus games played).
3. Ages and career totals for every hitter with 200+ PA and pitcher with 40+ IP, in batches of 50 (about 15–25 calls).
4. League-wide splits for the last 10, 15 and 30 calendar days, hitting and pitching (6 calls). Windows end on the last completed day of games.
5. Today's schedule (1 call).
6. For heat-check finalists only: individual game logs, to state exact last-10/15-game (hitters) or last-5/10-start (pitchers) lines with exact dates.

If any step fails or returns nothing, the run stops and writes a "STOPPED: PULL FAILED" brief listing the calls attempted. No numbers are filled in.

## Guardrails built into the code

- Numbers print exactly as returned. Rate stats computed from game-log sums say so in the brief.
- The brief writer refuses to write any line that uses a superlative (first, only, most, never, record, ever...) as a statement. Superlatives may only appear as questions for Nick to verify.
- Every idea's season line carries "in progress" during the season.
- Graphics are never rendered by this pipeline.
