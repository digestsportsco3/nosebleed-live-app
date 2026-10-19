# Nosebleed Live: App Store unblock decision memo

As of October 19, 2026. Prepared for team review. Research notes and the six council memos are in `research_notes/App Store unblock council/`.

## Bottom line

Resubmit a stripped US-only build within two weeks and stop chasing league permission: the permission does not exist for us at any price while BetUS is in the picture, and Apple does not require it if the marks are gone.

1. **Ship scenario A.** Team names, abbreviations and our own color chips; no logos, shields, crests or headshots anywhere, web included. No offshore sportsbooks and no outbound sportsbook links in the app; Polymarket and Kalshi links off in iOS. ESPN's undocumented feed off; The Odds API for scores and odds. US-only availability. Capacitor shell with push and share so the app is more than a website. Estimated $11.6K to $14.8K to build and $147 to $177 a month to run.
2. **Sell the pass the certain way first.** Hide the "Unlock the Warroom" card in the iOS build for the resubmission, then ship In-App Purchase with sign-in as the first update, enrolled in the Small Business Program before the first sale. A US-only Whop link-out is lawful today at 0% commission, but it is what was rejected and the commission is being set by a court; keep it behind a flag.
3. **Take BetUS out of the app now; decide the sponsorship with the retainer number in hand.** Removal is required for approval. The council's recommendation is to wind the sponsorship down on the contract's terms, because it is the single thing blocking data licenses, licensed-operator affiliate deals and ad-platform permission, and it carries a 30 to 50% estimated chance of an adverse letter within a year.
4. **Do not fund official data yet.** Reapply only after three to six months of documented clean operation, with the evidence package in this memo. SportsDataIO first, Sportradar's media tier second, Genius not at all.
5. **Five facts the team must supply before this is final:** the verbatim rejection text, the App Store Connect availability setting, the pass price, the BetUS retainer, and The Odds API terms as read by counsel.

Target: resubmission Monday November 2, 2026 with two engineers, November 9 with one.

## What Apple rejected, and what the build actually ships

Apple cited two things, but the current build carries five App Review problems, and the two Apple named are the easiest to fix. Reviewers work from the [App Review Guidelines](https://developer.apple.com/app-store/review/guidelines/) text last updated October 16, 2026.

| Element in the build | Where it lives | Guideline | Status |
| --- | --- | --- | --- |
| Team logos for 16 leagues hotlinked from ESPN's CDN | `providers/logos.js`, rendered in `app.js` | 5.2.1 (IP) | Rejected (NFL named; every league is equally exposed) |
| League shields: NFL, MLB, NBA, NHL, WNBA, NCAA, UFC, FIFA, from ESPN's CDN | `app.js` lines 651 to 660 | 5.2.1 | Rejected by implication |
| "Unlock the Warroom" card opens nosebleedsport.com, checkout via Whop | `app.js` near line 1726 | 3.1.1 / 3.1.1(a) | Rejected; lawful on the US storefront, see Fix 2 |
| Outbound links to five offshore books (BetUS, Bovada, MyBookie, BetOnline, LowVig) plus Polymarket and Kalshi market links | `BOOK_LINKS` in `app.js` | 5.3.4 (real-money gaming must be licensed where offered) | Hidden risk, not yet cited |
| Player headshots and all box-score, history and news data from ESPN's undocumented JSON | `providers/headshots.js`, `server.js` | 5.2.2 (third-party service terms) and publicity rights | Hidden risk; forum cases show reviewers ask for the data provider's terms next |
| Web app in a wrapper with no push, widgets or offline | no native project in the repo | 4.2 (minimum functionality) | Hidden risk |

**Logos.** The rule is strict: "Don't use protected third-party material such as trademarks... without permission," and "authorization must be provided upon request." The only permission reviewers are documented accepting is a written license or a counsel letter. A disclaimer does not count. Every documented sports-app rejection involved logos or league marks; no case was found of Apple rejecting a scores app for text names, abbreviations and colors (Apple Developer Forums threads 103672, 718427, 130430).

**The Whop link.** Since May 1, 2025, Guideline 3.1.1(a) says entitlements "are not required for developers to include buttons, external links, or other calls to action in their United States storefront apps," and Apple charges nothing on those purchases today. The Ninth Circuit affirmed the contempt finding on December 11, 2025 but sent the zero-commission bar back for a cost-based rate; Apple has proposed up to 15% (9to5Mac, August 13, 2026). The Supreme Court took the contempt-standard question on June 30, 2026 with argument no earlier than 2027. The likeliest reasons the link was rejected: the build was available outside the US, where the link is still banned, or the reviewer applied the pre-2025 rule by habit.

**Open question for the team:** what exact guideline numbers and wording did the rejection carry, and was the app's availability set to the United States only in App Store Connect?

## Fix 1: team names, abbreviations and colors, no marks anywhere

Remove every team logo, league shield, club crest and player headshot from the build and identify teams by name, abbreviation and a generic color chip. That configuration is defensible in the US under the facts doctrine and nominative fair use, and it is what Apple's 5.2.1 review is actually asking for. The color-chip fallback already exists in `app.js`, so this is mostly deletion.

| Element | Class | Authority | 12-month risk of a letter (counsel estimate) |
| --- | --- | --- | --- |
| Live scores, clocks, schedules, standings, box scores | Green | NBA v. Motorola (2d Cir. 1997); Feist | under 5% |
| Team and league names and abbreviations in plain app type, data context | Green | New Kids on the Block; Toyota v. Tabari | under 5% |
| Player names, records, statistics | Green | C.B.C. v. MLBAM (8th Cir. 2007); Daniels v. FanDuel | under 5% |
| Odds numbers and names of licensed US books | Green on IP; contract-bound by The Odds API terms | facts; nominative use | under 5% |
| Team color tint on a generic chip with the abbreviation | Gray-green | Smack Apparel (5th Cir. 2008) protects colors plus other indicia, on merchandise | under 5% |
| Chip shaped or typed to look like a badge or wordmark | Gray-red | Smack Apparel; New Kids prong 2 | 10 to 20% |
| League or team name in the app name, icon, store title or inside the sponsor unit | Gray-red | New Kids prong 3; Apple 4.1(c) and 5.2.1 | 15 to 30% (F1, NCAA, EPL highest) |
| Logos, shields, crests, F1 team marks, UFC logo, any hosting | Red | Lanham Act plus copyright; theScore's paid NFL license proves a market | Apple rejection near certain; league letter 10 to 25% |
| Hotlinked ESPN headshots | Red-gray | copyright, Disney terms, publicity in an ad context | 5 to 15% |
| ESPN undocumented JSON as the data basis of the iOS build | Red for Apple | Guideline 5.2.2 "authorization must be provided upon request" | rejection likely once a reviewer asks |

**Rules that keep the green rows green.**

- Keep league names out of the app name, icon, App Store title, screenshot copy and push titles. "Scores for NFL fans" is nominative; "NFL Scores" is not.
- Never place a league or team name inside a sponsored unit. The third nominative-use prong, nothing that suggests sponsorship, is the one a sponsor banner attacks; the NCAA's March 2026 suit against DraftKings pleads exactly this false-association theory.
- Add one non-affiliation line in settings and the store description.
- Chips stay circles or rounded squares in the app's own font. No shield shapes, no stripes, no wordmark imitation.

**F1 and soccer crests.** Formula One Licensing BV polices the "F1" mark against domains and creator handles and filed a 150-registration counterfeiting suit in Nevada in 2024. Say "Formula 1 Grand Prix" results descriptively, never "F1" as a section brand. Premier League, La Liga and Serie A enforcement is overwhelmingly against stream piracy and routes through app-store takedowns, and clubs will plead over crests (Manchester United v. Sega). The UK and EU database right in Football Dataco v. Sportradar only reaches apps that target UK or EU users, so US-only availability is cheap insurance.

**Already in the codebase that has to go:** `LEAGUE_LOGOS` in `app.js`, `providers/logos.js`, `providers/headshots.js`, and the Google favicon fetch for sportsbook chips.

## Fix 2: how the Betting Pass gets sold on iOS

Apple does not require us to sell the pass through In-App Purchase on the US storefront, but the certain way to pass review this month is to show no purchase call to action in the iOS build at all, then add In-App Purchase in the first update so members can sign in. The code has exactly one purchase surface, the locked-picks card, so every route is a small change; the cost is the native wrapper and the entitlement bridge.

| Route | Apple's take | Build (engineer estimate at $800 per day) | Re-rejection risk | What it buys |
| --- | --- | --- | --- | --- |
| 3. Hide the card in the iOS build; free pick and record only; no member gating | 0% | 2 to 3 days on top of a Capacitor shell (2 to 3 days) | Lowest | Approval; no iOS conversion |
| 2. Keep the Whop link, restrict availability to the US storefront, cite 3.1.1(a) in Review Notes | 0% today; a court-set rate of 0 to 15% is pending on remand | 4 to 6 days including the shell | Reviewer-dependent; third-party guides report continued 3.1.1 rejections when the link reaches non-US storefronts | iOS conversion through Whop; no Apple relationship |
| 1. StoreKit 2 via Capacitor and RevenueCat, plus a Whop webhook bridge and sign-in | 15% under the Small Business Program (under $1M proceeds), 30% otherwise, 15% on renewals after year one | 8 to 12 days | Low | Web members can sign in (3.1.3(b) requires the item also be sold as IAP); works outside the US |

**Why not fight on route 2 first.** Guideline 3.1.1(a) says entitlements "are not required for developers to include buttons, external links, or other calls to action in their United States storefront apps," so a US-only link-out is lawful. But Apple already rejected it once, each cycle costs a week, and the commission on link-outs is being set by the district court right now, so the economics are unknown. Hiding the card costs nothing and removes the argument.

**Sequence.** Resubmit with route 3. Ship route 1 as the first update, about three to four weeks later: one auto-renewing "Betting Pass" product, email or magic-link sign-in producing a stable App User ID, a server webhook receiver for RevenueCat and Whop writing one entitlements table, and `/api/picks` reading the entitlement from the bearer token (locked picks already never leave the server). Add the US link-out later only if the court-set rate lands well under 15%.

**Things that must not appear on pass screens.** Sportsbook deep links, the words "credit" or "bet", any claim that is not a dated verifiable record. Describe the pass in metadata and Review Notes as a subscription to analysis and editorial content.

**Open fact for the team:** the Whop seller fee and the pass price, so the cost section can compare 15% In-App Purchase against Whop's take.

## The BetUS problem

BetUS inside the app is an independent rejection ground Apple has not cited yet, and the sponsorship is the single thing that most changes our legal and licensing posture. The minimum for approval is removing every offshore book and link from the iOS build and the web app now. Whether to end the sponsorship is a revenue decision the cost section frames.

**Why it blocks data and marks deals.** The NFL, NBA, MLB, NHL and NCAA route data and marks only to state-licensed operators that buy official data; Genius holds the NFL and NCAA, Sportradar holds MLB, NHL, PGA Tour and WTA. Sportradar states it runs license verification against issuing regulators, and its media-data addendum lists gambling as a restricted ad category. In 2025 and 2026 BetUS was named in cease-and-desist orders from Michigan (May 2025) and Florida; Massachusetts attacked offshore marketing "using U.S. teams, players, and content creators"; Tennessee warned that businesses "working with" offshore books face criminal penalties. The specific reason for our denial is unconfirmed; the BetUS inference is strong but still an inference.

**Our own exposure.** Criminal statutes target operators, so our risk runs through accomplice and "promoting gambling" theories (New York Penal Law 225.05, a misdemeanor; New Jersey 2C:37-2). New Jersey's regulator sent cease-and-desists to affiliates promoting Bovada in 2014 and barred them from licensure. FanDuel tells its affiliates it may terminate them for promoting offshore sites. Counsel's estimate: with the paid, linked, geo-unrestricted placement live, a 30 to 50% chance of some adverse letter within 12 months; without it and with logos gone, under 10%.

**Platforms.** Apple 5.3.4 requires licensing wherever an app offers real-money gaming, and reviewers apply it to apps that merely appear to facilitate betting. Google Play lists "a dedicated sports odds tracker app containing integrated gambling ads linking to a sports betting site" as a violation, so an Android build with any sportsbook outbound links is at risk even with licensed books. Meta, TikTok and Google require operator licensing evidence before any gambling promotion, which BetUS cannot supply.

| Restructuring option | What it buys | What it does not buy |
| --- | --- | --- |
| (a) New entity for the app with the same owners | Clean contracts and a licensing vehicle later | Regulators assess principals and 10% owners, so no clean record |
| (b) BetUS on social only, out of the app | Shrinks the App Store problem | Still an affiliate promoting an unlicensed operator in the eyes of NJ-style regulators and data providers |
| (c) Terminate BetUS, allowlist US-licensed books in The Odds API, join DraftKings, FanDuel, BetMGM, Caesars, Fanatics on CPA, register as a vendor in target states | The only path data providers, regulators and ad platforms treat as clean | Revenue gap until affiliate volume builds; CPA roughly $100 to $500 per depositor is a third-party estimate |
| (d) DFS pick'em or sweepstakes partners | Short-term revenue | PrizePicks ended against-the-house pick'em in August 2025, Underdog exited seven states in September 2026, sweepstakes banned in NJ, NY, CT, MT, IN, OK |
| (e) Kalshi or Polymarket | A CFTC-regulated "not a sportsbook" story | Circuit split as of October 2026, NY AG says promoting them is "promoting gambling"; not a near-term partner |

**Timeline if we take option (c)** (estimate, no source gives firm durations): offshore removal in 2 weeks; new entity, written ad policy and affiliate applications by week 6; state registrations in months 2 to 6 (Colorado minor vendor about $350, Michigan about $200, Pennsylvania registration with fingerprints); reapply to data providers in months 4 to 9 with an evidence package: executed BetUS termination, dated removal proof, the Odds API allowlist config, a notarized officer's no-offshore certification modeled on New Jersey's 2015 form, at least one state registration, and the Apple approval.

**The Betting Pass itself needs no gaming license.** No US state licenses tout services; Nevada stripped its 2019 attempt. Exposure is FTC and state consumer-protection law on record claims, plus Apple 5.3.3 if the pass reads as wagering credit. Standard disclosures: entertainment only, no guarantee, no wagers accepted, verifiable dated records, 21+, 1-800-GAMBLER, and no sportsbook deep links on pass screens.

## Data providers with zero league licenses

Four self-serve providers will sell to a betting-adjacent app under about $250 a month and cover most of our list; none of them grants logo rights, and the two free sources we lean on today, ESPN's undocumented JSON and the leagues' own public endpoints, are the ones whose terms bar commercial use. Prices below are from provider pages unless marked third-party; the research session's proxy blocked direct fetches of most provider sites, so confirm on the page before signing.

| Provider | Our sports covered | Official? | Logos | Betting or affiliate policy | Published price | ToS risk for us |
| --- | --- | --- | --- | --- | --- | --- |
| The Odds API (in use) | Odds for all; scores for NFL, NBA, MLB, NHL, NCAA, soccer, MMA; outrights only for golf, tennis, F1 | No | None | Carries BetUS, Bovada, BetOnline, MyBookie; "not a wagering operator"; compliance is ours | Free 500 credits; $30 20K; $59 100K; $119 5M; $249 15M per month (third-party summary) | Low |
| balldontlie | All 14 of ours including PGA, WTA, F1, MMA | No | Not addressed | Odds endpoints exist; terms not found | $9.99 or $39.99 per sport per month; All-Access $299.99 per month | Medium; terms unverified |
| API-Sports | Soccer, NBA, NFL, MLB, NHL, F1, MMA, NCAA and WNBA via basketball; no tennis or golf | No | "Identification only"; developer clears rights | Not found | $19 to $39 per sport per month; prices differ by channel | Low to medium |
| Sportmonks | EPL, La Liga, Serie A, F1 | No | "Arrange your own proof of IP" | Not addressed | Starter EUR 29 for 5 leagues; Growth EUR 99; Pro EUR 249 | Low |
| Goalserve | Soccer, NFL, NBA, MLB, NHL, tennis, golf, MMA, F1 | No | Nothing found | Sells to bookmakers | US sports $400; soccer $150 to $550; tennis $150; golf $200; all sports $800 per month | Low to medium |
| SportsDataIO | NFL, NBA, MLB, NHL, NCAA, golf self-serve; soccer, MMA, WNBA, tennis quote-only | No | Headshots licensed via USA Today, sold separately; team logos not granted | Courts "betting brands and affiliates"; odds from "legal onshore" books only | $99 to $149 developer tiers (delayed); real-time quote-only; Vendr median $16,496 per year (third-party) | Medium |
| Sportradar | All of ours; official for MLB, NHL, NBA, PGA, WTA | Yes | Images API "media use only," "prohibited for betting clients" | Written approval required for any gambling-connected use | Not published; EUR 1,300 to 4,990 plus per month (competitor estimates) | High as configured |
| Genius Sports | NFL and NCAA exclusive, EPL, NBA | Yes | Marks only to authorized gaming licensees | Official data only to licensed operators | Not published; no developer tier found | Not realistically available |
| OpticOdds | Odds only | No | None | Carries Bovada | About $5,000 per month (competitor report) | Out of budget |
| ESPN undocumented JSON (in use) | Everything | No | Served, unlicensed | Disney terms bar automated extraction | Free | High; fails Apple 5.2.2 |
| MLB Stats API, NHL api-web, NBA stats (in use) | MLB, NHL, NBA | Yes | No reuse grant | MLB: "individual, non-commercial, non-bulk"; NBA: no sponsorship tie-in | Free | High for a sponsored commercial app |

**What the market looks like now.** One Sportradar "no" closes MLB, NHL, PGA Tour, WTA and the former IMG Arena leagues; Genius holds the NFL through 2029 and the NCAA through 2032. Secondary collection latency is 1 to 15 seconds, which is irrelevant at our 30-second poll, so the real official-versus-unofficial gap is marks rights and vendor willingness, not speed. Small leagues (UFL, PLL, NWSL, MLS) route through the same two gatekeepers and publish no developer programs.

| Sport | LEAN mapping (near-zero cost) | MID mapping (paid, ToS-clean) |
| --- | --- | --- |
| NFL, NBA, MLB, NHL | The Odds API scores and odds | balldontlie GOAT per sport, or Goalserve US package |
| NCAAF, NCAAB, WNBA | The Odds API | API-Sports or a SportsDataIO quote |
| EPL, La Liga, Serie A | The Odds API | Sportmonks Starter or API-Football |
| UFC | The Odds API | API-Sports MMA or balldontlie |
| PGA Tour, WTA | The Odds API outrights only | balldontlie, or Sportradar single-sport trial then quote |
| F1 | No live source today | Sportmonks or API-Sports Formula-1 |

Integration effort against the existing server adapters: 2 to 4 person-days per provider, because the front end only consumes normalized Nosebleed shapes.

## Cost pressure test

Scenario A (lean) is the only one that passes the README's own $250-a-month hurdle, pays back on a handful of Betting Pass subscribers, and survives every stress case; B costs about three times A in year one and needs a confirmed balldontlie license; C does not close on current information and should not be funded until a data provider says yes in writing.

**Assumptions, stated once.** Request volume uses the engineer's live-gated scheduler (scores only while a game is live, odds every 5 minutes): 265K to 660K Odds API credits in a peak month, versus 2.5M to 3.1M if we keep the current fan-out. Both fit The Odds API's $119 tier (5M credits, third-party summary of the pricing page, confirm before relying on it). Contractor rate $800 per person-day. Hosting $20 to $50 a month. Apple Developer Program $99 a year. Pass price unknown, so break-even is shown at $20, $30 and $50. BetUS retainer unknown, carried as $X.

| Scenario | What it is | One-time build | Run per month | Year 1 | Steady state per year |
| --- | --- | --- | --- | --- | --- |
| A Lean | The Odds API for scores and odds, names and color chips, no marks, no offshore links, iOS purchase card hidden, US-only storefront, Capacitor shell with push, ESPN removed | $11.6K to $14.8K (14.5 to 18.5 days) | $147 to $177 | $13.4K to $16.9K | $1.8K to $2.1K |
| B Mid | A plus balldontlie GOAT for NFL, NBA, MLB, NHL ($160) or All-Access ($300), Sportmonks Starter for soccer (about $32), IAP with sign-in, push notifications | $23.6K to $35.6K cumulative (CFO-adjusted; engineer's figure $29.2K to $39.6K) | $339 to $477 | $27.7K to $45.3K | $4.1K to $5.7K plus 15% Apple on iOS pass sales |
| C Official-later | B plus BetUS termination, new entity, US-licensed affiliate programs, state vendor registrations, reapply to SportsDataIO or Sportradar in 6 to 12 months | $34.8K to $56.4K cumulative engineering, plus registrations ($350 Colorado, about $200 Michigan, Pennsylvania and New Jersey unpriced), plus entity and counsel (unpriced, $E) | $1,714 to $1,852 with SportsDataIO (Vendr median, third-party); $1,769 to $5,966 with Sportradar (competitor estimates) | $49K to $79K before $E and 12 months of forgone retainer | $20.6K to $71.6K |

Logo add-ons and direct small-league deals cost $0 in B because the data memo found neither lawfully available to a betting-adjacent app. The year-one B figure assumes IAP is built; without it B is roughly A plus $200 to $300 a month.

| Stress case | A | B | C | Recovery |
| --- | --- | --- | --- | --- |
| ESPN blocks us or sends a letter | $0 in strict A; the web app flips the same image-mode flag | $0, already replaced | $0 | Kill switch per provider; never circumvent a block |
| The Odds API revokes the key (the single point of failure in every scenario) | Lose scores and odds; SportsGameOdds Pro at $299 to $499 a month plus a 2 to 3 day adapter: $2.2K to $4.6K a year plus about $2K | Same | Same | Build the second odds adapter early; keep attribution and no redistribution |
| Cease-and-desist on marks | About $0; nothing ships but text and chips; remedy is a chip redesign | Same | Same | Ship the same image-free mode on the web app in the same release |
| 2x price at renewal | plus $1.4K a year | plus $4.1K to $5.7K a year | plus $16.5K to $66K a year; the C case flips negative | Annual terms where published; cap any single feed at the hurdle |
| Add one more sport | $0, same Odds API tier | plus $480 a year and a 2 to 3 day adapter | Per-sport enterprise pricing, unpriced | Prefer providers priced per sport |
| Court sets 15% on US link-outs | 15% of iOS link-out revenue: $3.6K to $9K a year per 100 subscribers | Same, but IAP already built | Same | Drop the link-out, keep IAP |
| Forced to IAP at 15% or 30% | $6.4K to $9.6K build plus 15%; 30% only if not enrolled in the Small Business Program | Commission only | Commission only | Enroll in the Small Business Program before the first sale |

**Break-even in Betting Pass subscribers** (gross of Whop's 2.7% plus $0.30 or Apple's 15%):

| Scenario and period | At $20 a month | At $30 | At $50 |
| --- | --- | --- | --- |
| A year 1 | 56 to 71 | 38 to 48 | 23 to 29 |
| A steady | 8 to 9 | 5 to 6 | 3 to 4 |
| B year 1 | 139 to 189 | 93 to 126 | 56 to 76 |
| B steady | 17 to 24 | 12 to 16 | 7 to 10 |
| C year 1, SportsDataIO case, before $E and the retainer | 205 to 280 | 137 to 187 | 82 to 112 |
| C steady, SportsDataIO | 86 to 93 | 58 to 62 | 35 to 38 |
| C steady, Sportradar estimate | 89 to 299 | 59 to 199 | 36 to 120 |

As a share of a BetUS retainer: A year 1 is 22 to 28% of a $5,000-a-month retainer and 11 to 14% of $10,000; C year 1 is 82 to 112% of $5,000 before counting that C removes the retainer itself. At $X = $5,000, C needs about $80K to $132K a year of new revenue with no sourced affiliate replacement.

**CFO verdict.** Fund A now. Pre-approve B's IAP and adapters once a human confirms the Odds API tiers on the pricing page and reads balldontlie's terms. Do not fund C on current information. The biggest downside that could not be eliminated is single-vendor dependency on The Odds API.

**Numbers the team must fill in:** pass price, BetUS retainer, entity and counsel cost, the Odds API tiers as shown on the pricing page, balldontlie's terms, Whop's fee schedule, the exact Apple rejection text, and one week of observed `meta.usage` from the server to replace the modeled volume.

## Risk matrix

Likelihood is counsel and CFO estimates over 12 months at current scale; impact is what it does to launch and revenue.

| Item | Likelihood | Impact | Quadrant | Action |
| --- | --- | --- | --- | --- |
| Logos stay in the build | Near certain (Apple) | High | Fix before resubmission | Delete |
| BetUS linked in the app | 30 to 50% adverse letter | High | Fix before resubmission | Delete from app; founder decision on the sponsorship |
| ESPN feed in the iOS build | Likely once a reviewer asks | Medium-high | Fix before resubmission | Off in iOS and web |
| The Odds API revokes the key | Low to medium | High | Insure against | Second odds adapter early |
| 2x renewal price (scenario C only) | Medium | Medium-high | Insure against | Annual terms; do not fund C |
| Data providers deny us again | High on current information | Medium | Monitor | Reapply only with the evidence package |
| League name in app title or sponsor unit | 15 to 30% | Medium | Accept by avoiding | Keep names out of branding and sponsor units |
| Court sets 15% on US link-outs | Medium | Low-medium | Monitor | Keep IAP; drop link-out if rate lands at 15% |
| Color chip styled like a badge | 10 to 20% | Low | Accept by avoiding | Generic shapes only |
| Names, abbreviations, scores, odds as text | Under 5% | Low | Accept | None |

## 30-day action plan

Starts Tuesday October 20, 2026. Resubmission target Monday November 2 with two engineers in parallel (about 15 to 18 person-days), Monday November 9 with one. If App Review rejects on 3.1.1 again, engineering flips the purchase card off and resubmits the same day; if it asks for 5.2.2 authorization, legal uploads The Odds API terms and the scores vendor contract.

**Day-one inputs that gate everything else**

- [ ] The verbatim rejection text and the App Store Connect availability setting
- [ ] The Odds API terms and the scores vendor's terms, read by counsel by October 27
- [ ] The BetUS contract's termination clause
- [ ] APNs key and Apple Developer account-holder access by October 22
- [ ] A live privacy-policy page by October 22

**Week 1 (Oct 20 to 23)**

- [ ] Founder: pull rejection text and availability settings; set availability to United States only; inventory every BetUS placement; create APNs key; confirm Paid Apps agreement
- [ ] Legal: obtain and read the BetUS termination clause, The Odds API terms and the English Disney Terms of Use; shortlist two scores vendors and request their terms
- [ ] Engineering: image-free mode (`IMAGE_MODE=none`), remove `history.js` logo field, favicon fetch and headshot provider; bookmaker allowlist in `server.js`; remove all book-link hrefs; flag off Polymarket and Kalshi for iOS; static `data/teams.json` and authored `data/teamcolors.json`; Capacitor iOS shell; live-gated Odds API scheduler; ESPN behind an off flag
- [ ] Product: privacy-policy and support pages live; new store metadata with no league names

**Week 2 (Oct 26 to 30)**

- [ ] Legal: terms verdict on the two scores vendors; sign the one that passes; review Review Notes, disclaimer, age-rating answers; sign-off on the package
- [ ] Engineering: adapter for the signed vendor; push notifications for followed games; native share and haptics; purchase card hidden behind a flag; ESPN off on all surfaces, confirmed in network logs; TestFlight build and QA; bundle checked for marks
- [ ] Product: launch sport list fixed from licensed coverage; Review Notes drafted; screenshots with chip rendering
- [ ] Founder: serve BetUS notice per the clause; stop new BetUS creative; archive dated screenshots and commit hashes of every removal

**Week 3 (Nov 2 to 6)**

- [ ] Nov 2: Founder submits; Resolution Center reply references the new build and quotes 3.1.1(a); Legal assembles the provider evidence package
- [ ] Nov 3: Founder sends the re-approach email; Product completes social cleanup
- [ ] Nov 4 to 6: respond to App Review within 24 hours; Engineering starts the IAP design (RevenueCat, StoreKit 2, sign-in, entitlement service, Whop webhooks)

**Week 4 (Nov 9 to 13)**

- [ ] Founder: enroll in the Small Business Program; replacement sponsor outreach (non-gambling and licensed operators only)
- [ ] Legal: apply to DraftKings, FanDuel, BetMGM CPA affiliate programs; file Colorado and Pennsylvania registrations; note Epic's Supreme Court brief (Nov 13) and any remand ruling
- [ ] Engineering: server-sent events live channel; second scores adapter if coverage is thin
- [ ] Product: first week of `meta.usage` reviewed; Odds API tier adjusted

**Week 5 (Nov 16 to 18)**

- [ ] Engineering: IAP build in progress (target weeks 5 to 7)
- [ ] Founder: provider replies logged; one follow-up if silent
- [ ] Product: retro on what Apple asked, what the provider said, and what the sport list lost

## Draft re-approach email

Send this only after the restructuring it describes has actually happened; every bracket is a fact the team supplies. The denying party is not recorded in our notes, so the variants at the end cover the three likely recipients.

> **Subject:** Nosebleed Live. We restructured. Second look?
>
> [Provider contact],
>
> You passed on Nosebleed Live in [month]. Fair call. Here is what changed.
>
> We ended the BetUS sponsorship, effective [date]. No offshore sportsbook appears in the app, on nosebleedsport.com, or across our 44 social accounts. The odds board shows US-licensed books only. No outbound links to any book.
>
> We removed every league and team logo and every player photo. Teams are names, abbreviations and our own colors. The app says plainly that we are not affiliated with any league.
>
> We moved to a licensed data stack. Odds come from The Odds API under its commercial terms. Scores come from [vendor]. We want your feed to replace it.
>
> What we are: a fan-first scores, odds and picks app. US only. Rated 18+. Picks are paid editorial. We take no wagers.
>
> What we want: a media license for [sports], live scores, schedules, standings and box scores, for display in the app and on the web. Starting budget is [amount] a month. We will sign a representation that neither Nosebleed Sports nor any of its principals has a commercial relationship with any operator not licensed in a US state.
>
> Ready to send today: the executed BetUS termination, dated screenshots of every removal, our bookmaker allowlist, and Apple's approval of the clean build.
>
> Who should I talk to?
>
> [Name]
> Founder, Nosebleed Sports
> [phone]

**If it is Sportradar:** add "We are applying under your Master Terms for Non-Betting Services and the Official Media Data Addendum," and ask directly whether a paid editorial subscription fits the addendum's "media and editorial, non-commercial" language. Do not ask about the Images API in this email.

**If it is Genius Sports:** there is no self-serve media tier. Replace the "what we want" paragraph with one question: does any media data license exist for an independent publisher for NFL, EPL or NCAA data, and if not, which licensed-operator partnership route would they accept. A "no" is likely.

**If it is SportsDataIO:** replace "media license" with "a use-case-scoped commercial license," name the feeds (real-time NFL, NBA, MLB, NHL plus NCAA), ask for attribution requirements, and request the Imagn headshot add-on as a separate line. Their help pages already permit betting-analytics and affiliate use, so lead with price, not suitability.

## Council positions and what survived the adversarial round

Six personas filed independent memos, then each attacked the weakest claim in every other memo. The recommendation above is what stood after that round.

| Persona | Position | What fell under attack |
| --- | --- | --- |
| App Store review specialist | Ship a logo-free build, keep the Whop link on a US-only storefront under 3.1.1(a), resubmit through Resolution Center, never appeal the logo build | "Config flip" undercounted six image code paths; a rights file that names ESPN would hurt, not help; no vendor sublicenses logos to us |
| Sports IP attorney | Facts are free, names are nominative, logos are red, the BetUS placement is the real exposure | "Gray for web, red for iOS" split on ESPN fell: same server, same terms, off on both; an unpaid unlinked BetUS row is not safely gray given NJ guidance and FanDuel's affiliate rule |
| Sports data industry exec | Keep The Odds API, add API-Sports or balldontlie, no marks; official data requires dropping offshore first and enterprise money second | Asserted Sportradar was the denier (unknown); rated balldontlie and API-Sports low-risk with unread terms; every price is a search snippet |
| Gaming compliance officer | Only full offshore removal makes us licensable; new entity alone launders nothing; social-only BetUS still taints the brand | "Betting Pass read as real-money credit" as the likeliest cause of rejection fell; an App Review Board appeal on the Whop ground fell |
| Indie app engineer | Hide the purchase card, build IAP behind it, Capacitor plus push, keep ESPN as a dated bridge | The ESPN "tolerated-risk bridge" is "until we get caught" and violates the brief; Option 3 over Option 2 rested on a misreading of 3.1.3(b); Sportradar trials for PGA, WTA, F1, UFC fell because Sportradar will not sell to a betting client |
| CFO and red team | Fund A now, pre-approve B's IAP and adapters after a human reads the Odds API tiers and balldontlie terms, do not fund C | Survives; the un-eliminated downside is single-vendor dependency on The Odds API |

**Claims that stood clean:** scores and names need no license and logos do; a US-storefront link-out is lawful under the verbatim guideline text; the 15% figure is Apple's August 2026 proposal, not a ruling, and the rate today is 0%; BetUS is the primary legal exposure; keeping BetUS on social only does not make us licensable; The Odds API is the single point of failure in every scenario.

**One recorded dissent.** The attorney would allow an unpaid, unlinked BetUS odds row as a data point; the council overruled it because New Jersey's affiliate guidance and licensed operators' affiliate terms treat any placement as promotion.

**The one thing the founders must decide:** the engineer and CFO would hide the purchase card for the first resubmission to remove reviewer variance; the App Review specialist and the synthesis would keep it visible behind a flag, with neutral copy, and flip it off the same day if 3.1.1 is cited again. Both are compliant. The choice is a week of possible delay against iOS conversions from day one with no install base yet.

## Sources

All claims are as of October 19, 2026. The research session's proxy blocked direct fetches of most provider, court and regulator pages, so where a memo relied on a search summary of a page it says so; the full per-persona bibliographies are in `research_notes/App Store unblock council/`.

**Apple**

- App Review Guidelines, text last updated October 16, 2026: https://developer.apple.com/app-store/review/guidelines/ (3.1.1, 3.1.1(a), 3.1.3, 3.1.3(b), 4.2, 5.2.1, 5.2.2, 5.3.3, 5.3.4)
- Apple Developer News: https://developer.apple.com/news/ (May 1, 2025 US-storefront update; October 16, 2026 guideline update)
- App Store Small Business Program: https://developer.apple.com/app-store/small-business-program/
- Developer Forums threads on 5.2.1 sports rejections: https://developer.apple.com/forums/thread/103672, https://developer.apple.com/forums/thread/718427, https://developer.apple.com/forums/thread/130430

**Epic v. Apple**

- Ninth Circuit opinion, No. 25-2935, December 11, 2025: https://cdn.ca9.uscourts.gov/datastore/opinions/2025/12/11/25-2935.pdf
- Supreme Court docket 25-1311 (SCOTUSblog): https://www.scotusblog.com/cases/apple-inc-v-epic-games-inc/
- 9to5Mac, August 13, 2026: https://9to5mac.com/2026/08/13/apple-proposes-commissions-of-up-to-15-for-off-app-store-purchases-in-the-us/
- AppleInsider, August 13, 2026: https://appleinsider.com/articles/26/08/13/supreme-court-denies-yet-another-stay-in-apple-vs-epic-proceedings-as-deadlines-loom

**Sports IP law**

- NBA v. Motorola, 105 F.3d 841 (2d Cir. 1997): https://law.justia.com/cases/federal/appellate-courts/F3/105/841/500161/
- C.B.C. Distribution v. MLB Advanced Media, 505 F.3d 818 (8th Cir. 2007): https://ecf.ca8.uscourts.gov/opndir/07/10/063357P.pdf
- Daniels v. FanDuel (Loeb & Loeb): https://www.loeb.com/en/insights/publications/2018/11/daniels-v-fanduel
- Crowell & Moring on NCAA v. DraftKings (2026): https://www.crowell.com/a/web/92DLZef8Ns1px7QygHECvy/ncaas-anti-sports-betting-stance-becomes-an-ip-issue.pdf
- The Fashion Law on Formula One's 2024 Nevada suit: https://www.thefashionlaw.com/f1-files-suit-over-counterfeits-amid-rise-in-u-s-demand
- Disney Terms of Use: https://disneytermsofuse.com/english/

**Gaming regulation**

- Michigan cease-and-desist to BetUS, May 2025 (Yogonet): https://www.yogonet.com/international/news/2025/05/08/104126-michigan-issues-ceaseanddesist-orders-to-offshore-gambling-site-betus
- Florida cease-and-desists (Legal Sports Report): https://www.legalsportsreport.com/223576/cd-florida-sports-betting-mybookie-bovada-betus/
- Massachusetts AG letters, 2025: https://www.mass.gov/news/attorney-generals-office-issues-cease-and-desist-letters-to-two-online-gambling-operators-for-illegal-offshore-casino-and-sports-betting-operations
- Tennessee SWC warning (Public Gaming): https://members.publicgaming.com/news-categories/regulatory-issues/14528-tennessee-sports-betting-regulator-fines-two-offshore-sportsbooks
- New Jersey DGE affiliate cease-and-desists, 2014 (Gaming Intelligence): https://www.gamingintelligence.com/legal/19093-nj-regulator-targets-affiliates-promoting-illegal-gaming-sites/
- FanDuel warning to affiliates (GGB News): https://ggbnews.com/article/fanduel-group-warns-affiliates-on-offshore-gambling-sites
- Google Play real-money gambling policy: https://support.google.com/googleplay/android-developer/answer/9877032

**Data providers**

- The Odds API docs and terms: https://the-odds-api.com/liveapi/guides/v4/, https://the-odds-api.com/terms-and-conditions.html; tiers via https://oddspapi.io/blog/odds-api-pricing-2026-comparison/ (third-party)
- balldontlie: https://www.balldontlie.io/
- API-Sports terms and pricing: https://api-sports.io/terms, https://www.api-football.com/pricing
- Sportmonks plans and terms: https://www.sportmonks.com/football-api/world-plan/, https://www.sportmonks.com/terms-of-service/
- Goalserve prices: https://www.goalserve.com/en/sport-data-feeds/full-package-api/prices
- SportsDataIO: https://sportsdata.io/developers, https://sportsdata.io/betting-brands-affiliates; Vendr median (third-party): https://vendr.com/marketplace/sportsdataio
- Sportradar terms: https://developer.sportradar.com/sportradar-updates/page/master-terms-and-conditions-for-non-betting-services, https://developer.sportradar.com/sportradar-updates/page/official-media-data-addendum, https://developer.sportradar.com/images-and-editorials/reference/images-faqs
- NBA.com Terms of Use: https://www.nba.com/termsofuse; NHL.com Terms of Service: https://www.nhl.com/info/terms-of-service
- RevenueCat pricing: https://www.revenuecat.com/pricing/

**Codebase (ground truth):** `app.js`, `server.js`, `providers/logos.js`, `providers/headshots.js`, `providers/history.js`, `data/leagues.json`, `README.md` on branch `claude/zen-ritchie-ou3u8z`.
