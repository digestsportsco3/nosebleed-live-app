# CFO / Red Team — Cost pressure test of the App Store unblock options

Persona: CFO / red team on the Nosebleed Sports council. Date: 2026-10-19. Scope: cost, downside and break-even for the three scenarios the council put forward; attack every other memo on money and risk. No law was re-researched. Every number below is either traced to a council memo (file name plus the provider page that memo cites) or labeled **ASSUMPTION** / **ESTIMATE**. Third-party price points keep the flags memos 03 and 05 put on them.

**What I could not get.** `https://nosebleedsport.com/#offers`, `https://nosebleedsport.com` and `https://whop.com/pricing` all failed DNS resolution through the sandbox proxy (`getaddrinfo ENOTFOUND`), so the Betting Pass price and tiers are **unknown to me** and every break-even is given at $20, $30 and $50 per month. The BetUS retainer is **unknown** and is carried as $X per month with a sensitivity line at $2,500 / $5,000 / $10,000. The repo's own `README.md` line 93 sets a budget target of "less than $250/month for the first production MVP"; I use that as the hurdle line throughout.

---

## 0. Assumptions, stated once

**Request volume (base case = engineer's live-gated scheduler; stress line = today's naive fan-out).** From [05-indie-engineer.md](05-indie-engineer.md) KQ5:

| Line | Peak-month credits to The Odds API | Notes |
|---|---|---|
| Naive (current: `sport=All`, 60 s TTL, every key every minute) | **2.46M** (scores at 1 credit) to **~3.1M** (scores at 2 credits) | Memo 05 table: 0.90M calls / 1.76M credits average month, 1.25M / 2.46M peak. Memo 03 says scores with `daysFrom` cost 2 credits ([v4 docs](https://the-odds-api.com/liveapi/guides/v4/) via [oddspapi, third-party](https://oddspapi.io/blog/odds-api-pricing-2026-comparison/)); the app sends `daysFrom=3`, so the 2-credit line is the one to budget. |
| Live-gated, full odds (scores at 60 s only while a game is live; odds every 5 min; 3 markets) | **525K** (scores=1) / **660K** (scores=2) | Memo 05 KQ5: scores ≈135K (270K at 2 credits) + odds 389K. |
| Live-gated, h2h-only list + on-demand spreads/totals | **265K** / **400K** | Memo 05 KQ5: scores 135K/270K + odds 130K. |
| ESPN undocumented JSON | 921,600 calls/month naive → 345,600 season-gated → ~135K live-gated | Free, unlicensed (memo 03 KQ2, [Disney ToU](https://disneytermsofuse.com/english/)); $0 in every table but a ToS liability, not an asset. |

**Season assumptions** (memo 05 KQ5, engineer's estimates, not sourced): NFL 5 months, NBA 8, MLB 7, NHL 8, EPL/La Liga/Serie A 10 each, UFC 12, WTA ~3 concurrent keys × 11, NCAAF 5, NCAAB 6, WNBA 5, golf 1–2 outright keys × 9, F1 none → ~10 concurrent Odds API keys on average, ~14 in a peak month (Oct–Nov). A "month" is 30 days.

**Price anchors used in every scenario.**

| Item | Figure | Source and flag |
|---|---|---|
| The Odds API paid tiers | free 500 credits; $30/mo 20K; $59/mo 100K; **$119/mo 5M**; $249/mo 15M | Memo 03 KQ2, **third-party summary of the official page** ([oddspapi](https://oddspapi.io/blog/odds-api-pricing-2026-comparison/)); memo 05 lists the official tiers as a Gap (host blocked). **Must be confirmed on the-odds-api.com before any number here is relied on.** |
| Hosting (single Node process, SSE-capable VPS) | $20–50/mo | Memo 05 KQ5, **ESTIMATE** |
| Contractor rate | **$800/person-day** ($100/h × 8) | Memo 05, **ASSUMPTION** |
| Apple Developer Program | $99/yr | **ASSUMPTION** — not in any memo; Apple's published annual membership fee, not re-verified this session |
| Apple IAP commission | 15% (Small Business Program, ≤$1M proceeds) or 30% standard; 15% on auto-renew after year one | [01-app-store-review.md](01-app-store-review.md) KQ3, [Apple Small Business Program](https://developer.apple.com/app-store/small-business-program/) |
| Apple US link-out commission | **0% today**; Apple's remand proffer proposes **up to 15%** (10%/5% tiers for programs); Epic argues 0%; no ruling found as of 2026-10-19 | Memo 01 KQ2 ([AppleInsider, Aug 13 2026](https://appleinsider.com/articles/26/08/13/apples-latest-commission-rates-for-external-app-store-purchases-havent-satisfied-epic), via search summary). A Supreme Court reversal in 2027 could revive Apple's earlier 27%/12% program (memo 01 inference). |
| Whop seller fee | **2.7% + $0.30** per domestic card sale, no monthly fee; **+3% platform fee** reported on sales gated through Discord/Telegram/TradingView (one source says on every sale — sources conflict); payout fees $2.50–$23 per withdrawal; $15 per dispute | Search summary only (whop.com blocked): [insightraider](https://insightraider.com/en/answers/what-are-the-whop-fees), [fungies](https://fungies.io/whop-alternatives-2026.md), [costbench](https://costbench.com/software/community-platform/whop/), [ruzuku](https://www.ruzuku.com/learn/articles/whop-pricing), [schoolmaker](https://schoolmaker.com/blog/whop-review.md), [group.app](https://www.group.app/blog/whop-review/), [creatoreconomytools](https://creatoreconomytools.com/tool/whop), [costbench calculator](https://costbench.com/software/community-platform/whop/calculator/), [insightraider earnings](https://insightraider.com/en/answers/how-much-money-can-you-make-on-whop). Memo 05 KQ2 found Whop's own docs conflicting at 2.7% vs 2.9% + $0.30. **Treat the effective Whop take as 2.7–5.7% + $0.30; the team must read docs.whop.com/fees.** |
| RevenueCat | free until $2.5K monthly tracked revenue, then 1% | Memo 05 KQ2, [RevenueCat pricing](https://www.revenuecat.com/pricing/) |
| FX for € prices | **1.10 USD/EUR** | **ASSUMPTION** (no memo gives a rate) |

---

## 1. Three scenarios: run cost, build cost, annual totals

### Scenario definitions and what the memos say about each

**A — LEAN.** The Odds API as the only paid feed for scores and odds on every key it serves; **no ESPN** (that is what "ToS-compliant" means — memo 03 KQ2 and [02-sports-ip-attorney.md](02-sports-ip-attorney.md) KQ5 both classify the ESPN proxy as a Disney ToS breach and a 5.2.2 problem for the iOS build). Consequence the council must accept: clocks, line scores, box scores and the history view are dropped in the iOS build until B lands, and PGA/WTA/F1 are odds-only (memo 05 KQ4: Odds API has scores "for selected sports", golf/tennis/F1 keys are outrights). Names/abbreviations/own color palette, no marks, no offshore book links, Capacitor shell with push (the engineer costed push inside A). The engineer's own LEAN keeps ESPN as a "dated bridge"; I show that as **A′** — same cost, carries the ToS exposure.

**B — MID.** A plus paid secondary feeds: balldontlie GOAT per sport or All-Access, Sportmonks Starter for soccer, IAP via Capacitor + RevenueCat + Whop bridge, provider failover. Two items the brief asked me to price come in at **$0 because they do not exist**: (1) logo add-ons — memo 03 KQ5: "No lawful logo sublicense is available to Nosebleed as currently configured" (Sportradar Images bars betting clients, SportsDataIO only papers headshots, API-Sports/Sportmonks disclaim); (2) direct deals with smaller leagues — memo 03 KQ6: UFL/NWSL/MLS route through Sportradar, PLL through Genius/Champion Data, LIV is in Chapter 11, TGL/MLS NEXT/OTE have no program. I therefore strike the engineer's "logo add-on plumbing" (1 day) and move his "Sportradar single-sport trial adapters" (4–6 days) to C, since Sportradar will not contract with a betting client (memo 03 KQ3) and trial adapters for a provider that will not sell are sunk cost in B.

**C — OFFICIAL-LATER.** B now, plus the restructuring in [04-compliance-officer.md](04-compliance-officer.md) KQ4(c)/KQ5 (terminate BetUS, filter the odds board to US-licensed books, NewCo, CPA-tier state registrations, 3–6 months of clean operation) and reapplication to SportsDataIO first, Sportradar media terms second, Genius not realistically at all (memo 03 KQ2/KQ3). The engineer's C refactor (canonical IDs, persistent store, SSE, asset pipeline, remote-config toggles, widget) is the technical side of the same scenario.

### Build cost (one-time)

| Scenario | Person-days | $ at $800/day | Source |
|---|---|---|---|
| A | 14.5–18.5 | **$11.6–14.8K** | Memo 05 KQ6 Scenario A table (image-free mode 1.5; palette 1.3; CTA 1–2; Capacitor shell 2–3; push/share/haptics 4–6; scheduler + ESPN gating 2; ASC/TestFlight 1; QA 1.5). In strict no-ESPN A the "season-gate ESPN" day becomes a removal; I keep the range unchanged. |
| B increment, engineer's | 22–31 | $17.6–24.8K | Memo 05 KQ6 Scenario B table |
| B increment, **CFO-adjusted** (minus Sportradar trials 4–6, minus logo plumbing 1) | 15–26 | **$12.0–20.8K** | My adjustment of the same table |
| A+B cumulative | 29.5–49.5 (eng) / 29.5–44.5 (CFO) | **$29.2–39.6K (eng) / $23.6–35.6K (CFO)** | |
| C increment (refactor) | 14–21 | **$11.2–16.8K** | Memo 05 KQ6 Scenario C table |
| C one-time restructuring (non-engineering) | — | CO minor vendor **$350**; MI affiliate **~$200 per vertical**; PA registration + "posted" investigation fee + fingerprints (**unpriced**); NJ vendor registration (**unpriced**); NewCo formation and counsel (**unpriced in any memo — team to fill in, placeholder $E**); rev-share tier later: CO **$11,200+ plus hourly investigation**, NJ CSIE-level (unpriced) | Memo 04 KQ2/KQ4 ([BettingUSA](https://www.bettingusa.com/affiliate/), [iGaming Future](https://igamingfuture.com/talking-the-licensing-process-in-the-us/), [58 Pa. Code 1405a.3](https://www.law.cornell.edu/regulations/pennsylvania/58-Pa-Code-SS-1405a-3)) |
| A+B+C cumulative engineering | 43.5–70.5 | **$40.4–56.4K (eng) / $34.8–52.4K (CFO)** | |

### Monthly run cost at our volume

| Line item | A | B | C (after official feed lands) | Source / flag |
|---|---|---|---|---|
| The Odds API, 5M-credit tier | $119 | $119 | $119 (kept for odds; filtered to US-licensed books in C) | Memo 03 KQ2, **third-party**. Live-gated peak 265–660K credits sits above the 100K/$59 tier and far inside 5M, so **$119 is the line in every scenario**. |
| Hosting | $20–50 | $20–50 | $20–50 | Memo 05, ESTIMATE |
| Apple Developer Program | $8.25 | $8.25 | $8.25 | ASSUMPTION ($99/yr) |
| balldontlie GOAT × 4 (NBA/NFL/MLB/NHL) | — | $160 | $160 | Memo 03/05, [StackOne](https://docs.stackone.com/connectors/balldontlie/guides/link-account/api-key), [balldontlie.io](https://www.balldontlie.io/); **ToS on commercial/betting use not found (memo 03 Gap)** |
| …or balldontlie All-Access (all 14 sports) | — | $299.99 (replaces the $160 line and covers NCAAF/NCAAB/WNBA/PGA/WTA/F1/UFC) | $299.99 | Memo 03 KQ2 ([balldontlie.io](https://www.balldontlie.io/)); older third-party post said $499.99 — **conflict flagged** |
| Sportmonks Starter (5 soccer leagues) | — | €29 ≈ $32 | €29 ≈ $32 | Memo 03/05, [Sportmonks plans](https://www.sportmonks.com/football-api/plans-pricing); FX ASSUMPTION |
| Logo add-ons | — | **$0 — none lawfully available** | $0 unless Sportradar Images is granted after restructuring (**unpriced**) | Memo 03 KQ5 |
| Direct small-league deals | — | **$0 — none exist** | $0 | Memo 03 KQ6 |
| RevenueCat | — | 0 until $2.5K MTR, then 1% of IAP revenue | same | Memo 05, [RevenueCat](https://www.revenuecat.com/pricing/) |
| Official feed (C only) | — | — | SportsDataIO **~$1,375/mo** (Vendr median $16,496/yr, **third-party**); Sportradar **€1,300–4,990+/mo ≈ $1.4–5.5K** (Sportmonks, **competitor estimate**) or **"$10,000+/mo"** (SharpAPI, **competitor estimate**); Genius **not published / not available** | Memo 03 KQ2 ([Vendr](https://vendr.com/marketplace/sportsdataio), [Sportmonks on Sportradar](https://www.sportmonks.com/football-api/alternatives/sportradar/), [SharpAPI](https://sharpapi.io/compare/sportradar-alternative)) |
| **Total run / month** | **$147–177** | **$339–369 (GOAT×4 + Sportmonks) to $447–477 (All-Access)** | **$1,714–1,852 (SportsDataIO)**; $1,769–5,966 (Sportradar est.); ~$10.3–10.5K ($10K/mo est.) | Platform fees on pass revenue excluded here; see §4 |
| vs README hurdle ($250/mo) | **passes** | **fails by 1.4–1.9×** | **fails by 7–42×** | README.md line 93 |

Stress line, naive volume: at today's 60 s TTL the naive peak (2.46–3.1M credits) **still fits the $119 / 5M tier**. The scheduler work therefore saves **$0/month at the current TTL**; what it buys is headroom (one TTL cut to 30 s puts the naive peak at 4.9M, at the tier ceiling; 10 s TTL is 14.8M, above the $249 tier) and a way to stop hammering ESPN at 921,600 calls/month, which memo 05 calls "the single most likely thing to earn a block". I still fund the 2 days ($1,600) — but as insurance, not savings.

### Annual totals

| Scenario | Year 1 (build + 12 × run) | Steady state (run only, per year) | Notes |
|---|---|---|---|
| **A** | **$13.4–16.9K** | **$1.8–2.1K** | Run $147–177/mo |
| **B** | **$33.3–45.3K (engineer's build) / $27.7–41.3K (CFO-adjusted)** | **$4.1–5.7K** | plus 15% Apple + ≤1% RevenueCat on iOS pass sales |
| **C (SportsDataIO case)** | **$49.1–67.0K** | **$20.6–22.2K** | Year 1 = A+B+C engineering $40.4–56.4K + 12 × B run + CPA-tier registrations $550–750 + official feed for the last 3 months only (memo 04: earliest license 6–9 months after BetUS termination) + **$E** (NewCo/counsel, unpriced) **+ 12 × $X foregone BetUS retainer** |
| **C (Sportradar estimate case)** | **$49.3–79.3K** | **$21.2–71.6K** | same structure, €1.3–5K/mo feed; the "$10K+/mo" SharpAPI figure gives **$124–126K/yr steady**, which I show only to mark the ceiling |

Every C figure excludes the lost retainer (12X), which is the dominant term if X is anywhere in the sensitivity range (see §3).

---

## 2. Stress tests

Dollar deltas are per year unless stated; "recovery" is what I would actually do, with the engineer's day-rate where it needs code.

| Stressor | A | B | C | Recovery action |
|---|---|---|---|---|
| **ESPN block** (CDN/IP block or Disney C&D; memo 02 KQ5 puts a letter at 5–15%/yr and endpoint breakage "close to certain over a multi-year horizon") | Strict A: **$0**, no exposure. A′ (engineer's bridge): lose clocks/line scores/box scores/history/headshot flags overnight; **$0 run delta, 0.5–1 day ($400–800)** to flip `IMAGE_MODE`/disable the providers; product regression, not a cost event | **$0** — ESPN already replaced | **$0** | Ship A with the ESPN providers behind a kill switch; never circumvent a block (memo 02: Ryanair v. Booking.com shows circumvention is what turns a ToS issue into CFAA liability) |
| **The Odds API termination** (terms allow key revocation on suspected redistribution; it is the only source of `/api/scores` and `/api/odds` in every scenario) | Lose scores + odds entirely. Replace with SportsGameOdds Pro **$299/mo annual or $499 monthly** (memo 03 KQ2, [SportsGameOdds pricing](https://sportsgameodds.com/pricing), official page via search; carries betus/bovada keys) → **+$2.2–4.6K/yr** plus a 2–3 day adapter (**$1.6–2.4K, ESTIMATE** by analogy with memo 05's per-provider figures). OpticOdds at ~$5K/mo (third-party) is not an option. | Same +$2.2–4.6K/yr + adapter; scores partially covered by balldontlie already, so the hit is odds | Same; after restructuring, the SportsDataIO Odds tier at $99/mo (memo 03, [sportsdata.io/developers](https://sportsdata.io/developers), "legal onshore" books only) becomes an alternative | Build the odds adapter seam so a second odds vendor is a config change (already the README's rule); pre-register a SportsGameOdds free Amateur key as a warm standby; keep `meta.usage` headers on a dashboard so a quota breach never looks like a termination |
| **Cease-and-desist on marks** | All three scenarios ship **no logos, crests, shields or headshots**, so a marks C&D can only reach plain-text names/abbreviations/color chips: memo 02's classification puts those at <5%/yr with "redesign chip / add disclaimer" as the remedy → **~$0–400** (0.5 day). The **web app** still serves ESPN logos today; the same `IMAGE_MODE=none` flag (memo 05 KQ1) removes them there at **$0 extra** — do it in the same release so the web property is not the thing that draws the letter. Tail risk if logos were ever reinstated: statutory copyright damages up to $150K per work (memo 02 KQ3) — the one line in this memo with no budget answer, so the rule is simply "no marks, anywhere, ever, without a license document". | same | same | Same release discipline; keep league/team names out of the app name, icon and sponsor unit (memo 02 KQ2: that is where risk rises to 15–30%/yr) |
| **2× price escalation at renewal** | Odds API $119→$238: **+$1.4K/yr** | $339–477 → $678–954: **+$4.1–5.7K/yr** | Official feed doubling: SportsDataIO $16.5K→$33K (**+$16.5K/yr**); Sportradar €1.3–5K → €2.6–10K (**+$17–66K/yr**); the whole C business case flips negative | Lock annual terms where the vendor publishes a discount (Goalserve 12-month pricing, Sportmonks €24 yearly vs €29, SportsGameOdds $299 annual vs $499 monthly — all memo 03); cap any single feed at the README hurdle; walk away from any enterprise quote that cannot be terminated for convenience inside 12 months |
| **Adding one more sport** | Odds API: +~35K live-gated credits per key-month (525K ÷ 15 keys) or +173–216K naive — **$0, same tier**. If the sport has no Odds API scores (golf/tennis/F1 pattern), the live-score gap stays | +$39.99/mo balldontlie GOAT (**+$480/yr**) or $0 on All-Access; or API-Sports $15–39/mo (memo 03, prices **conflict across the vendor's own channels**); +2–3 day adapter (**$1.6–2.4K**) | Sportradar prices "monthly per sport, charged only in months with games" (memo 03, [Sportradar golf FAQ](https://developer.sportradar.com/golf/v2/docs/faqs)) — **unpriced**; SportsDataIO quotes "per client based on leagues" — **unpriced**; expect four figures per sport per year | Add sports only through the normalized seam; treat any sport without an Odds API scores key as "odds-only" until a priced feed exists |
| **Court-set 15% Apple link-out commission** | Costs **15% of iOS link-out pass revenue**, zero today. Per 100 iOS subscribers: **$3.6K/yr at $20, $5.4K at $30, $9.0K at $50** | same | same | Already-built IAP (B) makes this a pricing decision, not a crisis; if the rate lands at 15% the link-out loses its only advantage over IAP and should be dropped to remove reviewer variance |
| **Forced move to IAP at 15% / 30%** | A has no IAP: forced move means **$6.4–9.6K build (memo 05 Option 1, 8–12 days)** plus 15%: $3.6–9.0K per 100 subs/yr; at 30% (if SBP eligibility is lost or not enrolled): **$7.2–18.0K per 100 subs/yr** | Build already sunk in B; delta is the commission only | same | Enroll in the Small Business Program before the first IAP sale (memo 01 KQ3: rate applies 15 days after the end of the enrollment month); the 30% line is avoidable by paperwork and is the cheapest stress in this table to pre-empt |

One stressor the brief did not list but which dominates C: **BetUS termination itself**. Memo 04 KQ4 is explicit that a NewCo with the same principals "does not launder the association" and that FanDuel-style affiliate terms treat past offshore promotion as disqualifying, so the replacement revenue (DraftKings/FanDuel CPA $100–500 per depositor, rev-share 20–35% — **all third-party and conflicting, memo 04 KQ4(c)**) is not bankable. C's downside is therefore 12X of lost retainer with no sourced replacement, not the feed price.

---

## 3. Break-even

Figures the team must fill in: **P** = Betting Pass monthly price (and any annual tier), **X** = BetUS monthly retainer, **E** = NewCo formation and counsel, **S_iOS** = share of pass sales expected to originate in the iOS app. Everything below is parametric in P and X.

### 3a. Subscribers needed to cover annual cost (gross price; see net-of-fee adjustment below)

| Scenario / period | Annual cost | Subs at **$20** | Subs at **$30** | Subs at **$50** |
|---|---|---|---|---|
| A, year 1 | $13.4–16.9K | 56–71 | 38–48 | 23–29 |
| A, steady | $1.8–2.1K | 8–9 | 5–6 | 3–4 |
| B, year 1 (engineer's build) | $33.3–45.3K | 139–189 | 93–126 | 56–76 |
| B, steady | $4.1–5.7K | 17–24 | 12–16 | 7–10 |
| C, year 1 (SportsDataIO case, excl. 12X and E) | $49.1–67.0K | 205–280 | 137–187 | 82–112 |
| C, year 1 (Sportradar estimate case, excl. 12X and E) | $49.3–79.3K | 206–331 | 137–221 | 83–133 |
| C, steady (SportsDataIO) | $20.6–22.2K | 86–93 | 58–62 | 35–38 |
| C, steady (Sportradar estimate) | $21.2–71.6K | 89–299 | 59–199 | 36–120 |
| C, steady ("$10K+/mo" estimate) | $124–126K | 517–524 | 345–350 | 207–210 |

Net-of-fee price per subscriber-month (what actually lands): at **$20 / $30 / $50** gross — Whop web, 2.7% + $0.30: **$19.16 / $28.89 / $48.35**; Whop with the reported 3% platform fee: **$18.56 / $27.99 / $46.85**; Apple IAP 15% + RevenueCat 1%: **$16.83 / $25.25 / $42.08**; IAP 30% + 1%: **$13.86 / $20.79 / $34.65**; link-out with a court-set 15% plus Whop: **$16.16 / $24.39 / $40.85**. Divide the gross subscriber counts above by 0.84–0.96 depending on channel; at IAP 15% the counts rise by roughly one-fifth.

Reading: A's steady state is covered by a single-digit subscriber count at any plausible price — it is effectively free to keep alive. B's steady state is covered by 7–24 subscribers. C's steady state needs 35–300 subscribers *on top of* replacing the retainer, and the span is so wide only because the Sportradar price is a competitor's estimate.

### 3b. Share of a BetUS retainer of $X per month

Annual cost ÷ 12X:

| Scenario / period | X = $2,500 ($30K/yr) | X = $5,000 ($60K/yr) | X = $10,000 ($120K/yr) |
|---|---|---|---|
| A, year 1 | 45–56% | 22–28% | 11–14% |
| A, steady | 6–7% | 3–4% | 1–2% |
| B, year 1 | 111–151% | 55–76% | 28–38% |
| B, steady | 14–19% | 7–10% | 3–5% |
| C, year 1 (SportsDataIO) | 164–223% | 82–112% | 41–56% |
| C, steady (SportsDataIO) | 69–74% | 34–37% | 17–19% |
| C, steady (Sportradar est.) | 71–239% | 35–119% | 18–60% |

The C column is a contradiction in terms: C requires terminating the retainer it is being measured against. The honest C break-even is "pass subscribers (3a) plus whatever licensed-affiliate revenue materializes must exceed $20.6–71.6K/yr **and** 12X". At X = $5,000 that is $80–132K/yr of new revenue, i.e. 220–370 subscribers at $30 gross before fees. **No memo supplies a sourced affiliate revenue figure that would close that gap.**

---

## 4. Purchase-path decision

| Path | Fee today | Fee risk | Build | Review risk | Conversion | Controls the relationship |
|---|---|---|---|---|---|---|
| **Whop link-out, US-only storefront** | Whop 2.7% + $0.30 (+3% if gated); Apple **0%** | Court-set **0–15%** on remand; possible return to 27%/12% entitlement regime if Apple wins at SCOTUS in 2027 (memo 01 KQ2) | 4–6 days (**$3.2–4.8K**, memo 05 Option 2) | **Reviewer-dependent**: the link is exactly what was just rejected; memo 01's own sources ([ptkd](https://ptkd.com/journal/apple-rejection-3-1-1-in-app-purchase-links), [Stora](https://stora.sh/blog/2026-05-16-apple-app-store-external-purchase-links-implementation-guide)) report continued 3.1.1 rejections when gating or steering text is wrong; and memo 01 KQ4 warns the Whop link sits beside picks a reviewer may read under 5.3 | In-app CTA, web checkout; no in-app unlock for web buyers unless IAP also exists (3.1.3(b)) | Nosebleed/Whop |
| **IAP (StoreKit via Capacitor + RevenueCat)** | **15%** (SBP) + ≤1% RevenueCat; 30% if SBP not enrolled | Certain; falls to 15% after year one anyway | 8–12 days (**$6.4–9.6K**, memo 05 Option 1) | Lowest on the purchase path; also the only route that lets Whop web subscribers sign in (3.1.3(b), memo 01 KQ3) | Native paywall; best iOS conversion | Apple |
| **Hide the CTA in iOS** | 0% | None | 2–3 days (**$1.6–2.4K**, memo 05 Option 3) | Lowest overall | **Zero** in-app conversion; without IAP, web subscribers also cannot unlock picks in the app (3.1.3(b)) | n/a |

Money: at 100 iOS subscribers and $30, the gap between IAP and today's link-out is **$5.4K/yr**; the IAP build is **$6.4–9.6K**; so IAP "costs" roughly one extra year of commission on 100 subs over the link-out — until the court sets a rate, at which point the gap shrinks to the difference between 15% and whatever is set, and goes to zero at 15%. Risk: the link-out carries the only purchase-path re-rejection risk in the table, and a re-rejection costs weeks on a product that currently earns nothing on iOS.

**Next 90 days: hide the CTA, ship US-only.** The app has no iOS install base, so forgone in-app conversion for one quarter is close to zero in dollars, while a second rejection on the same ground is the most expensive outcome available. Keep the "Members Only" card as unlinked copy; make the storefront US-only in App Store Connect regardless (it costs nothing and also narrows the 5.3 territorial argument). Do **not** add a sign-in that unlocks web-purchased picks in this build — 3.1.3(b) makes that contingent on an IAP equivalent.

**Steady state: IAP + sign-in, with the US web link kept beside it while it stays at 0%.** This is the hybrid memo 01 KQ3 and memo 05 KQ2 both land on. It removes the Epic litigation from the business plan, lets Whop members use the app, and keeps a 0% channel for as long as the court leaves one. Enroll in the Small Business Program before the first sale; the day the court sets a link-out rate at or near 15%, drop the link and the reviewer variance with it.

---

## 5. Red-team verdicts

**01 — App Store review.** Weakest claim: "Yes for the US storefront, today" on the Whop link-out. On paper it is correct and well quoted (3.1.1(a) verbatim), but the memo cannot say why the link was rejected (its two hypotheses — non-US availability or reviewer misreading — are both inferences), its own third-party sources report reviewers still rejecting 3.1.1 cases post-2025, and the compliance memo adds a third hypothesis (the reviewer read "Betting Pass" as gaming credit under 5.3.3). "Compliant" and "will pass" are different claims; the memo conflates them. **Survives as law, fails as a resubmission plan** — which is why §4 does not bet the 90-day resubmission on it. Its Small Business Program and hybrid-IAP analysis survive intact and are load-bearing here.

**02 — Sports IP attorney.** Weakest claim: the quantified risk table (<5%, 10–25%, 30–50% per year). The memo itself says there is "no published base rate for C&Ds against scores apps", the team-color analysis is by analogy from a merchandise case with no software precedent, and two primary opinions (Smack Apparel, Disney ToU) were not read. **Survives anyway**, because the decision the percentages support — strip every logo, keep plain-text names, generic chips, wall off the sponsor — costs $2.0–2.4K (memo 05 KQ1) and would be the right call at any plausible probability. Nothing in this memo's cost model is sensitive to whether the true C&D rate is 3% or 30%; it is sensitive only to whether marks are ever reinstated, which §2 forbids.

**03 — Data industry exec.** Weakest claim: the provider matrix's "Low / Low-Medium" risk ratings on balldontlie and API-Sports, the two vendors that make B affordable, when the memo could not read either one's terms ("Could not read the actual ToS of balldontlie… or API-Sports for a betting/affiliate clause"). Every price in the matrix, including The Odds API tier that drives all three scenarios, is a search snippet or a competitor's summary, and the SportsDataIO "$16,496/yr" that anchors C is a Vendr median for a vendor whose licenses are "quoted per client". **Survives on structure, not on numbers**: the three conclusions that matter (no lawful logo path, official tier closed while BetUS is on the surface, ESPN and league endpoints are ToS-violating) are sourced to the providers' own pages. Condition for funding B: one person with an unproxied browser confirms the Odds API tiers, balldontlie's commercial/betting terms and the All-Access price before any contract — an hour of work that this environment could not do.

**04 — Gaming compliance officer.** Weakest claim: that restructuring path (c) — terminate BetUS, register as a licensed-operator affiliate, reapply in 6–9 months — produces a fundable business. The memo's own evidence undercuts it: no documented re-approval precedent (memo 03 agrees), every affiliate CPA/rev-share figure is "third-party and conflicting", state registration timelines are "estimates", and its NJ-2015 finding that "the taint attaches to people and the brand, not just the legal entity" means the same principals may be ineligible for the licensed programs that are supposed to replace the retainer. **Survives as a compliance direction, fails as a revenue plan.** The legal exposure analysis (promoting-gambling statutes, Apple/Google/Meta policies, Betting Pass needs no license) survives and is the reason offshore links are out of every scenario here, including A.

**Funding verdict.** I would fund **A now** (strict, no ESPN, CTA hidden, US-only; $13.4–16.9K year 1, ~$2K/yr after), with the two-day scheduler and `meta.usage` dashboard inside it so the first production month produces observed volumes instead of the engineer's estimates. I would **pre-approve B's IAP and balldontlie/Sportmonks adapters** ($12–21K CFO-adjusted) to start the day the resubmission is approved and the Odds API tier and balldontlie terms are confirmed by a human — B is the first scenario that lets web subscribers use the app and that removes the Epic litigation from the plan, and its steady state ($4.1–5.7K/yr) is covered by 7–24 subscribers. I would **not fund C** on current information: it breaches the README hurdle by 7–42×, every official-feed price is a competitor's estimate, the reapplication has no precedent, and its real cost is 12X of retainer with no sourced replacement — it becomes fundable only if X turns out to be small or a licensed sponsor is signed first. The single biggest downside I could not eliminate: **every scenario's scores and odds hang on one vendor, The Odds API, whose terms allow revocation, whose paid tiers I know only from a competitor's blog, and whose cheapest sourced replacement (SportsGameOdds) costs 2.5–4× more** — the seam is built, the standby is not, and no amount of Apple compliance fixes a feed that goes dark.

---

## Numbers the team must fill in before this memo is final

1. **P** — Betting Pass price and tiers from nosebleedsport.com/#offers (blocked here).
2. **X** — BetUS monthly retainer and its termination terms.
3. **E** — NewCo formation and counsel cost (C only).
4. The Odds API paid tiers and the scores-endpoint credit cost, read from the-odds-api.com (every scenario).
5. balldontlie commercial/betting terms and the All-Access price (B and C).
6. Whop's current fee schedule from docs.whop.com/fees, including whether the 3% platform fee applies to the Warroom's gating.
7. Whether Apple's rejection text objected to anything beyond logos and the external link (determines whether A's resubmission scope is complete).
8. One week of observed `meta.usage` headers in production, to replace the season/live-hour assumptions in §0.
