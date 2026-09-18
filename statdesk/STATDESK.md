# Stat Desk — operating instructions for the local session

This file is read by the Claude Code session that runs on Nick's main computer
with the Chrome extension connected (`claude --chrome`). That session is the hub.
Nothing here overrides the rule above all rules: NEVER FABRICATE. Not numbers,
not claims. Nothing beats a guess.

## Before anything else: read `statdesk/HANDOFF.md`

It holds the current state, the verified picks, the open questions, and what
the last session left unfinished. Do not redo work that it says is done.

## Sources, in priority order

1. STATHEAD (Baseball Reference) — PRIMARY. Nick's subscription, already signed
   in, in his own Chrome. Claude drives the logged-in tab: opens the Season /
   Game / Streak / Span Finder, sets the filters, runs the query, and READS the
   result table from the page. All eras count, 1871 to today.
2. ESPN and STATMUSE — cross-check only, through the same browser. Never the
   sole source for any number. Never for historical claims.
3. MLB STATS API (statsapi.mlb.com) — automated bonus source. Free, official,
   no key, no sign-up, no approval needed. Reached by `statdesk/run.sh`, which
   pulls every active player's line and writes the ranked brief. If the host is
   unreachable, the run stops and says so; Stathead discovery below still works.

## Two ways to reach Stathead

HEADLESS (preferred, works from any device): `node statdesk/run.js --stathead`
logs in with `STATHEAD_USER` / `STATHEAD_PASS`, builds the Season Finder URLs,
reads the result tables and writes the same provenance records. Setup:
`statdesk/CLOUD-ACCESS.md`. Everything in this file about complete result sets,
row-by-row checks and never republishing applies to it unchanged.

BROWSER (fallback): Nick's signed-in Chrome, per the rules below. Use it when
the headless path is blocked by Cloudflare or a CAPTCHA, or when the
environment has no credentials stored.

## Browser rules (apply to Stathead, ESPN, StatMuse)

- Use Nick's existing signed-in tab. If a login page or CAPTCHA appears, stop
  and ask Nick to handle it. Never enter credentials.
- Read numbers from the page. Never type a number from memory into a brief.
- After every query, save a provenance record before writing anything:
  `statdesk/data/browser/YYYY-MM-DD/Qnnn.md` containing: the source, the page
  URL, the timestamp, the filters used, the row count shown by the page, and
  the full result table as text, copied from the page.
  Append one line per query to `statdesk/data/browser/queries.log`.
- The provenance cache is for verification and traceability only. Never
  republish a Stathead or Baseball Reference table, and never build a database
  from them. That is the line their terms draw.
- Page through every page of results before any claim. If the table is capped
  or truncated, tighten the filter until the full set is visible, or the claim
  becomes a question for Nick.

## The claim check (row by row)

Any superlative or pattern ("first", "only", "most", "no one else", "first
teammates to") must be proven against the COMPLETE result set. Check every row
for the exact shape of the claim, including rows that look irrelevant. Then
write the check that was run, e.g. "checked all 20 rows for same-team
same-season pairs; found 2." If the check cannot be completed, the claim is a
QUESTION for Nick, never a statement. The brief writer in `statdesk/lib/brief.js`
enforces this for generated text; the local session enforces it for everything
else.

## Current-season lines

Every 2026 line is "2026 in progress" until the regular season ends.

## The morning formula

1. PULL — run `./statdesk/run.sh` (Mac/Linux) or `statdesk\run.cmd` (Windows).
   It pulls the MLB Stats API, logs every call, and writes
   `statdesk/briefs/YYYY-MM-DD-statdesk.md` with the top 10 ideas, each with its
   Stathead query. If the pull fails, the brief says STOPPED and why.
2. DISCOVER IN STATHEAD — run `node statdesk/run.js --stathead-list` to print
   the preset discovery queries for the current season (one per anomaly rule).
   Run each one in Nick's browser, save provenance, and add any current player
   who appears as a candidate idea. This step works even when the API pull fails.
3. DRAFT — for every find: player and pulled numbers with the exact window; why
   it is interesting in one line; the historical question as an exact Stathead
   query; a DRAFT kicker. No graphics.
4. RANK AND SUBMIT — 10 strongest to the brief, anomalies with a specific
   historical hook first, generic hot streaks last. Six lines per idea.
5. STOP. Nick picks. Verification runs in the browser on his picks only.
   Graphics render only for verified picks, per the nosebleed-brand skill.
6. HAND OFF. Update the "Current state" block of `statdesk/HANDOFF.md`, then
   run `./statdesk/handoff.sh` (Windows: `statdesk\handoff.cmd`). It commits
   and PUSHES. Report the pushed commit hash. Do this after every commit, and
   always before the session closes, restarts, or switches to `--chrome`. A
   commit that is not pushed does not exist to the next session.

## Attribution on anything published

"Source: Stathead / Baseball Reference, queried Mon DD YYYY" for Stathead-
verified claims; "Source: MLB Stats API, pulled Mon DD YYYY" for API numbers.
Both when both were used.
