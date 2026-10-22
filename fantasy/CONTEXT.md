# NOSEBLEED FANTASY — PROJECT CONTEXT

Last updated: 2026-10-22 · Status: **NOT LAUNCHED**

This file is the single source of truth for the Nosebleed Fantasy newsletter.
Read it before doing any fantasy-newsletter work so nothing has to be
re-explained from scratch.

## What this is

A premium, fantasy-football-only newsletter. Separate product from the main
Nosebleed Sports newsletter. Three sends a week, all gated behind the Whop
premium tier.

## Who owns what

- **Nick** — fantasy newsletter content and editorial direction
- **Luke** — Nosebleed Sports (main) newsletter, full creative control
- **Nado** — technical: beehiiv wiring, templates, data pipeline, cron
- **Claude** — drafts the content; outputs clean markdown for Nado

## Locked decisions

**Scoring format: FULL PPR.** Label it in every masthead. Changing this later
breaks every ranking, start/sit and waiver call retroactively.

**Access: 100% premium.** No free version, no free tier of the fantasy list.
One Whop product grants Discord + both premium newsletters + rankings hub.
Never sold separately.

**Growth path:** because it is fully gated, the fantasy list has no organic
acquisition of its own. It is fed by (a) a free "3 starts, 3 sits" block in
Luke's Friday sports newsletter, (b) Discord, (c) X. That free block in Luke's
newsletter is load-bearing — do not let it get cut.

**Delivery: beehiiv.** ONE publication with tags (`sports` / `fantasy` /
`premium`), not two publications. Three template variants (Tue/Thu/Sun), NOT
one 3x template — the section sets differ materially.

**Accountability: THE LEDGER is approved and published.** Running start/sit +
waiver hit rate, every week, including misses. This is the single biggest
differentiator; nobody else in fantasy does it.

## Cadence (all times ET)

| Send | Time | Length | Content cutoff |
|---|---|---|---|
| Tue — The Flagship | 11:00 AM | 1,000–1,400 w | Tue 9:30 AM |
| Thu — The Midweek | 11:00 AM | 400–600 w | Thu 9:30 AM |
| Sun — The Final Word | 11:00 AM | 150–250 w | Sun 10:00 AM |

Why these slots: each sits just ahead of a real deadline. Waiver claims lock
Tuesday night. TNF locks Thursday 8:15 PM. Sunday lineups lock at 1:00 PM.

Why Tue 11 AM and not 8 AM: Monday Night Football must be in the recap and
snap counts do not post until Tuesday morning. Buys data quality for a few
hours of open rate.

Why Sun 11 AM: two hours before lock, and it catches Sunday-morning insider
reports that break between 9 and 11. Trade-off is less reader runway, so the
Sunday email MUST be scannable in 60 seconds. If it creeps past 250 words the
later send time works against it.

Holiday exceptions — send 9:00 AM, shortened: Thu Nov 26 (Thanksgiving),
Thu Dec 24, Thu Dec 31.

Offseason (Feb–Jul): Tuesday only, weekly or biweekly.

## Discord (part of the product, not an extra)

- **Tue 8:00 AM** — conventional waiver board post
- **Fri 4:30 PM** — final NFL injury designations + line moves
- **Sun 11:30 AM** — inactives thread (official inactives post ~11:30)

These exist because a 3x email schedule cannot reach every deadline. They cost
nothing to produce and make Discord load-bearing rather than decorative.

## The three editions

### Tuesday — The Flagship

1. Masthead + edition label
2. **The Damage Report** — week recap as verdict, not box score (~200 w)
3. **Nosebleed Wire** — opens with **The Big Three** (three adds, each with a
   one-word priority tag: Must-add / Strong / Speculative), then tiers
   underneath: Value / Deep Stash / Cut Bait (~350 w)
4. **The Movement** — snap share, target share, red zone. WEEK-OVER-WEEK
   CHANGE ONLY, never season averages (~200 w)
5. **The Floor Report** — boom/bust *rates*, not point totals (~150 w)
6. **The Trade Block** — 2 buy / 2 sell / 1 hold, each with a copy-paste offer
   the reader can send (~180 w)
7. **The Split** — the one player we disagree on, both cases (~100 w)
8. **The Ledger** — running record (~50 w)
9. **Reader Desk** — OFF AT LAUNCH (see below)
10. Footer

### Thursday — The Midweek

1. Masthead + edition label
2. **Thursday Lock** — TNF start/sit + prop angle (~120 w)
3. **Streamers** — QB/TE/DST/K, this week + one ahead (~120 w)
4. **Still On The Wire** — post-waiver free agents (~100 w)
5. **The Matchup Board** — defense-vs-position exploits (~120 w)
6. **Practice Report** — Wed/Thu participation (~80 w)
7. Footer

### Sunday — The Final Word

Fixed five bullets, 20 minutes to produce. If it takes longer, it is too big.

1. **What Changed** — designations since Friday + Sunday AM reports
2. **Wind & Weather**
3. **Two Swaps** — named
4. **One Dart** — late value play
5. **Discord CTA** — inactives thread at 11:30

Masthead above, footer below.

> **"FAAB Court" was killed.** Do not reintroduce a percentage-based section.
> The Big Three uses priority tags instead.

## Reader Desk — deferred on purpose

Real reader mail only; never fabricated (brand rule, and obvious to readers if
faked). Launch the section in Week 3–4, not at launch — a mailbag with two
questions reads worse than no mailbag.

Action: open a `#fantasy-questions` Discord channel on day one, pin "ask here,
best ones make the newsletter." Bank ~10 real questions before the section goes
live. This is the Fantasy Footballers mailbag model and it works because the
questions are real and specific.

## Sourcing rule — important

The Fantasy Footballers premium subscription is **research and benchmarking
input only**. Use it to see which categories subscribers expect and how calls
get framed. Never reproduce their rankings, Top 200, SOS grids or analyst notes
in the product — it is paid proprietary content and republishing it inside our
own paid product is a copyright and terms problem.

Bye weeks, opponents and schedules are public NFL facts — free to use. All
published numbers come from our own pulls.

Brand rule (from the Nosebleed brand system): **never fabricate stats.** Every
number traces to a source file.

## Data sources

All nflverse URLs verified live 2026-09-22 (HTTP 200).

**Free, no key — nflverse (public GitHub release assets):**

- Weekly player stats:
  `github.com/nflverse/nflverse-data/releases/download/stats_player/stats_player_week_2026.csv`
  — **already contains `target_share`, `air_yards_share`, `wopr`, `racr` AND
  `fantasy_points_ppr`** (our exact format, pre-calculated). This one file
  powers The Damage Report + The Movement + The Floor Report.
  NOTE: the old `player_stats/player_stats_2026.csv` path is a 404.
- Snap counts: `.../releases/download/snap_counts/snap_counts_2026.csv`
  (`offense_pct` is the field that matters)
- Injuries: `.../releases/download/injuries/injuries_2026.csv`
  (`report_status`, `practice_status`)
- Schedule + lines + weather: `.../releases/download/schedules/games.csv`
  — **carries `spread_line`, `total_line`, moneylines, `temp`, `wind`, `roof`,
  `surface`.** Schedule + Vegas + weather in one file.
- Play-by-play (red zone splits only, 11 MB):
  `.../releases/download/pbp/play_by_play_2026.csv`
  (filter `yardline_100 <= 20`)
- WARNING: `depth_charts_2026.csv` is 52 MB (daily snapshots). Filter or skip.

**Free, no key — unverified from the sandbox (egress blocked; Nado to test):**

- Sleeper trending adds/drops:
  `api.sleeper.app/v1/players/nfl/trending/add?lookback_hours=24&limit=25`
  (join to the player map at `/v1/players/nfl`, ~5 MB — cache weekly)
- Open-Meteo weather: `api.open-meteo.com/v1/forecast`
  (needs a stadium lat/lon table, ~30 rows, one-time build)

**Paid — Nado has keys:**

- Ball Don't Lie (`api.balldontlie.io/nfl/v1/...`) — live odds, props,
  injuries, play-by-play. NFL free tier is teams/players/games only; stats
  start at $9.99, advanced/odds/pbp at $39.99.
  **Do NOT use for snap counts** — it does not appear to expose them, and
  nflverse has them free.

**Pull schedule:** Tue 07:00 / Thu 07:30 / Sun 09:00 ET. Drop as dated files
(`/data/2026/wkNN/...`). Drafts are written from files on disk, never live
fetches — a flaky API delays a pull, it does not kill a send.

## Subject line rules

- Promise a **decision**, not a topic. "Week 6 Waiver Wire" is a topic.
  "Spend big on him" is a decision.
- **Never lead with a day or week label.** The edition label lives in the
  masthead.
- The preheader is a second subject line — name the player or number the email
  leads with. Never "view in browser."

Patterns that hold up over a 20-week season: The Number · The Named Verdict ·
The Countdown · The Admission ("we were wrong about three of them") · The Split
· The Warning · The Contrarian · The Scoreboard (only possible because of the
Ledger) · The Cold Open · The Clean Utility.

## Season tentpoles (2026 schedule facts)

- **Week 11 — six-team bye:** CLE, SEA, GB, ATL, LAR, NE. Largest of the
  season, lands at most leagues' trade deadline. Special edition. Warn readers
  in Week 10, not Week 11.
- **Week 12 — zero byes**, falls on Thanksgiving. Full slate, peak attention.
  Publish the ambitious piece here.
- **Week 14 — last bye** (DAL, ARI), collides with playoff seeding.
- **Weeks 15–17** — championship run. Smallest audience, best retention data,
  the renewal base. Resting-starters watch begins Week 16.

## Voice

Per the Nosebleed brand system: "from the upper deck." Short sentences.
Confident, fan-first, a little irreverent. Write like the smartest fan in the
section. No corporate phrasing ("we're thrilled to announce").

**Compliance:** any block showing odds or implied totals needs a source band —
"Lines shown: [Sportsbook], as displayed [Day Mon DD YYYY]." Not optional.

## Open items

- [ ] **Launch date — not set.** See re-anchoring note below.
- [ ] Franchise names — current ones are working titles. "Nosebleed Wire" is
      locked. Others open to rename; lock before issue one because readers
      navigate by them.
- [ ] Confirm the 2026 NFL trade deadline date (Weeks 8–9 content hangs on it)
- [ ] Nado to send sample files for Sleeper / Open-Meteo / Ball Don't Lie
- [ ] Welcome email: launch date is the only variable left to hardcode
- [ ] Decide on a second welcome email at +48h if launch is more than 3 days out

## Re-anchoring note — read this

The season calendar was built around a Sept 8 launch that has passed. As of
late October the season is roughly two-thirds through its regular season; a
launch now enters mid-season.

Phase 0 (draft week) and Phase 1 (overreaction season) content is moot. A
mid-season launch needs a different Issue #1 — not a "welcome to week one"
issue, but a "here is what we have seen and here is what we do differently"
issue that establishes authority immediately. The phase structure after that
still holds, just shifted.

**Before writing any issue, confirm the current NFL week and the launch week.**

## Reference docs

- Season calendar (franchises, week-by-week, bye map, subject line playbook):
  https://claude.ai/artifact/NAENdrfCNJaRshkQBWfX6Z
- Cadence + beehiiv/Whop architecture:
  https://claude.ai/artifact/LEBgcYy6xEKMr4jsfdwCxZ
