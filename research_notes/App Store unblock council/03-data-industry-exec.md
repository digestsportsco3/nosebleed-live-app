# Sports Data Industry Exec — Unofficial/secondary feeds and which providers will sell to Nosebleed Live

Position memo + provider matrix. State as of 19 October 2026.

**Method note (read first).** Direct fetches of provider pricing/ToS pages were blocked by this environment's outbound proxy (403 CONNECT on every non-allowlisted host: sportsdata.io, the-odds-api.com, api-sports.io, sportmonks.com, goalserve.com, betsapi.com, mysportsfeeds.com, balldontlie.io, opticodds.com, gdx.mlb.com, developer.sportradar.com). Every finding below therefore comes from web-search result summaries of those pages or from third-party coverage. Where a number comes from the provider's own page as surfaced by search, it is cited to that page; where it comes from a comparison blog, directory or competitor, it is marked **(third-party / estimate)**. Nothing has been fabricated; where I could not find a price, the matrix says "not published" and the Gaps section says so. The search budget was exhausted before four follow-ups (API-Sports betting terms, Genius Sports media-tier access, WTA data-rights confirmation, Statscore/LSports minimums) could run; those are listed as gaps.

---

## KQ1. How the market is structured: official league data rights vs unofficial "secondary" collection, who collects how, and the realistic latency/accuracy gap

### Takeaway
The market is a two-tier system: a handful of rights-holders (Sportradar, Genius Sports, Stats Perform, plus niche players like ALT Sports Data for F1) hold exclusive or semi-exclusive "official" distribution rights per league and sell them on enterprise contracts, while a long tail of "secondary" providers collect the same scores from TV/streams/scouts/scrapes and sell them on self-serve plans for $10–$800/month. Vendor-published latency tiers put in-venue scouting at ~1–2 s, TV-based at ~3–6 s and stream-based at 7–15 s behind the event; for a 30-second client refresh with a 60-second server cache, that gap is immaterial to the user experience but material to the rights-risk profile.

### Cited Findings

**Who holds what (official rights map for Nosebleed's sports)**
- NFL: Genius Sports is the exclusive distributor of official real-time play-by-play, Next Gen Stats and the official betting feed "to media companies and betting operators globally," extended June 2025 through the end of the 2029 NFL season; Genius took the rights from Sportradar in 2021 — [Covers](https://www.covers.com/industry/nfl-genius-sports-announce-extension-with-multi-year-deal-june-12-2025); [Genius 8-K exhibit](https://www.sec.gov/Archives/edgar/data/1834489/000119312525138766/d48490dex991.htm); [SportsPro](https://www.sportspro.com/news/nfl-genius-sports-betting-data-streaming-partnership-extension-june-2025/)
- NBA/WNBA: Sportradar and Genius Sports both hold non-exclusive rights to distribute official NBA and WNBA betting data to licensed US operators; Sportradar also markets its NBA API as "the NBA's Official Data Provider… powered by on-venue statisticians" — [NBA PR](https://pr.nba.com/nba-sportradar-genius-sports-group-partnerships); [Sportradar marketplace NBA API](https://marketplace.sportradar.com/products/64d186778ad4bfe2bd064a26?domain=media-tech)
- MLB: Sportradar holds an exclusive, expanded partnership through 2032 (from the 2025 season) covering "ultra-low latency official data, media content, including MLB Statcast Data" across its network of "800 sportsbook clients and 900 media companies"; MLB took an equity stake — [SVG](https://www.sportsvideo.org/2025/02/07/major-league-baseball-and-sportradar-announce-expanded-exclusive-partnership-through-2032/); [SBC Americas](https://sbcamericas.com/2025/02/07/mlb-acquires-equity-stake-in-sportradar/)
- NHL: Sportradar signed a 10-year global deal in June 2021 as official betting data, betting streaming and media data rights partner (so roughly through 2031 — inference from the term length) — [NHL.com](https://www.nhl.com/news/nhl-sportradar-10-year-partnership-325502590); [Business Wire](https://www.businesswire.com/news/home/20210629005228/en)
- EPL (and EFL/SPFL): Genius Sports is sole official live data distributor via Football DataCo through the 2028-29 season (extension signed Aug 2024), and gains exclusive Player Market Data distribution from 2025-26 — [Business Wire](https://www.businesswire.com/news/home/20240805058740/en/Genius-Sports-and-Football-DataCo-Extend-Exclusive-Official-Data-Partnership-Through-2029); [Sportico](https://www.sportico.com/business/sports-betting/2024/premier-league-extends-genius-sports-1234792053/)
- PGA Tour, WTA, Wimbledon, MLS, EuroLeague: these were IMG Arena properties; Sportradar agreed in March 2025 to acquire IMG Arena and its rights portfolio (~70 rightsholders, ~38–39k official data events) and reported completion in early November 2025. Sportradar paid no cash; consideration reported at ~$225m with ~$100–122m going to rightsholders as prepayments (split differs by source) — [Insider Sport](https://insidersport.com/2025/11/03/the-new-king-of-sports-data-inside-sportradars-img-arena-acquisition/); [Legal Sports Report](https://www.legalsportsreport.com/228493/sportradar-acquires-img-arenas-sports-betting-rights-portfolio-in-225m-deal/); [Sportcal](https://sportcal.com/news/sportradar-completes-img-arena-acquisition)
- PGA Tour detail: IMG Arena's 2018 deal made it distributor of official ShotLink data "to sports media companies, news services and other media organizations worldwide" and exclusive distributor to regulated betting markets; the ShotLink system is the Tour's proprietary collection — [SVG](https://www.sportsvideo.org/2018/11/20/the-pga-tour-taps-img-arena-for-sports-betting-data/); [SBC Americas](https://sbcamericas.com/2018/11/19/pga-tour-secures-img-arena-as-official-data-distributor/)
- F1: Formula 1 appointed ALT Sports Data as Official Betting Data Supplier in Feb 2025 (term undisclosed); FanDuel became an Official Betting Operator in May 2026 with "access to live data streams" (race telemetry, timing) — [Formula1.com](https://www.formula1.com/en/latest/article/formula-1-appoints-alt-sports-data-as-official-betting-data-supplier-to.3bmi21rSCWWSSTPkmq3Yij); [iGaming Business](https://igamingbusiness.com/sports-betting/formula-1-betting-partnership-alt-sports-data/); [Tribuna](https://tribuna.com/en/betting/news/2026-05-04-formula-1-hands-fanduel-access-to-live-race-data-and-17m-north-american-bettors-in-multiy/)
- UFC: Sportradar's June 2026 Kalshi deal lists UFC among leagues for which Sportradar supplies "official data and live odds"; coverage describes Sportradar as holding UFC data rights, but I found no primary UFC/Sportradar announcement naming a term — [Sportradar IR](https://investors.sportradar.com/news-releases/news-release-details/sportradar-and-kalshi-announce-first-its-kind-data-and); [SBC Americas](https://sbcamericas.com/2026/06/08/sportradar-prediction-markets-kalshi/)
- NCAA: Genius Sports is exclusive distributor of official NCAA data to sportsbooks through 2032 via an "Authorized Gaming Licensee" program that also gives sportsbooks NCAA marks — [Business Wire](https://www.businesswire.com/news/home/20250425480652/en/NCAA-and-Genius-Sports-Expand-Partnership-Through-2032); [Legal Sports Report](https://www.legalsportsreport.com/231676/ncaa-grants-sportsbooks-first-time-access-to-official-data-logos/)
- NWSL: Sportradar describes itself as an official partner handling "global distribution of data & streaming" — [Sportradar on X](https://x.com/Sportradar/status/2032474406589522173)
- Prediction markets (relevant because Nosebleed shows Polymarket/Kalshi): Genius Sports signed Polymarket and Kalshi (Aug 2026) and Sportradar signed Kalshi (June 2026), both framed as supplying "official data" only to "licensed prediction market entities that operate in compliance with applicable regulations" — [Genius newsroom](https://www.geniussports.com/newsroom/polymarket-and-genius-sports-expand-the-role-of-official-data-exclusive-live-sports-streaming-and-integrity-services-in-prediction-markets/); [Sportradar IR](https://investors.sportradar.com/news-releases/news-release-details/sportradar-and-kalshi-announce-first-its-kind-data-and)

**How the secondary layer collects, and what it costs rights-wise**
- Statscore's ScoutsFeed documentation publishes collection tiers: ~2 s or less for scouts in the venue, 3–6 s for low-latency TV, 7–15 s for streams, with the stream tier "not recommended for bookmakers" — [Statscore docs](https://statscore.atlassian.net/wiki/spaces/SCOUT/overview)
- LSports publishes the same tiers (1–2 s venue, 3–6 s TV, 7–15 s streams) and, when sued by Sportradar in Israel for allegedly using Sportradar data, said its data comes from "its own scouting network, television-based collection and its proprietary computer vision technology" — [LSports](https://lsports.eu/?p=1114); [iGaming Expert](https://igamingexpert.com/regions/europe/lsports-rejects-data-piracy-claims/)
- Sportradar's own framing in the official-data debate: official data arrives without delay "compared with a TV feed that generally runs about seven seconds behind, or a scout whose connection may fail" — [CDC Gaming](https://cdcgaming.com/commentary/potential-sportradar-listing-raises-official-data-stakes/)
- Sportradar itself ran an unofficial in-stadium scouting operation for UK football until Genius/Football DataCo sued; Genius's pleading alleged Sportradar scouts were ejected from stadia "on over 300 occasions in the 2019/20 season" (a party's allegation, not a finding). The Oct 2022 settlement had Sportradar stop unofficial in-stadia scouting and buy a sublicence to a delayed "Official FDC Secondary Feed" through 2024 — [Betgenius v Sportradar particulars of claim](https://files.lbr.cloud/public/2021-04/Betgenius%20v%20Sportradar%20POC.pdf); [iGaming Business](https://igamingbusiness.com/legal-compliance/legal/sportradar-granted-sub-licence-will-cease-scouting/); [Sportradar IR](https://investors.sportradar.com/news-releases/news-release-details/sportradar-settles-litigation-genius-sports-and-fdc)
- Opta/Stats Perform's event data is coded by humans watching video: ~350 part-time analysts "record every pass, header and goal while watching live or recorded video" — [FiveThirtyEight](https://fivethirtyeight.com/features/the-people-tracking-every-touch-pass-and-tackle-in-the-world-cup)
- Sportradar's US developer packages are "Real-time" (continuous game-feed pulls) vs "Standard" (game feeds every 15 minutes), with request caps per league; pricing tiers "are set by the frequency a customer pulls from these real-time feeds" — [Sportradar sports data API page](https://sportradar.com/media-tech/data-content/sports-data-api/); [Sportradar golf FAQ](https://developer.sportradar.com/golf/v2/docs/faqs)
- Broadage says its "600+ scout team tracks more than 90,000 sporting events a year" — [Broadage](https://www.broadage.com/about-us)
- US lawmakers largely rejected league proposals to mandate official data for operators, so unofficial feeds remain lawful inputs for US books — [iGaming Business, "Data wars"](https://igamingbusiness.com/sports-betting/data-wars)
- The Odds API's scores endpoint updates "approximately every 30 seconds"; in-play featured-market odds refresh every 40 s and additional markets every 60 s — [The Odds API v4 docs](https://the-odds-api.com/liveapi/guides/v4/); [Update intervals page](https://the-odds-api.com/sports-odds-data/update-intervals.html)

### Inferences
- For a product that polls every 30 s and caches 60 s, a 3–15 s secondary-feed lag is invisible to users; the only place it bites is if Nosebleed ever surfaces in-play odds next to scores and the score lags the line (users will notice "the score is behind the odds"). That is a UX issue, not a legal one.
- The real difference between official and unofficial for a media app is not latency but (a) contractual right to display logos/marks, (b) the vendor's willingness to be associated with the customer, and (c) ToS stability. The secondary layer is legally sound for the facts (scores are not copyrightable in the US; the official-data mandates failed), but every secondary vendor pushes logo/trademark risk to the customer.
- Consolidation (Sportradar+IMG Arena) means PGA Tour, WTA, MLS and EuroLeague official data now all route through one counterparty, Sportradar — the same company that denied-by-silence or declined Nosebleed. A single "no" from Sportradar now closes official doors for 4+ of Nosebleed's sports at once.

### Gaps
- No independent measurement of secondary-feed latency vs official exists in what I found; all numbers are vendor-published.
- Could not confirm from a primary source who currently holds UFC's media-data rights or the WTA rights post-IMG Arena (search budget exhausted before the WTA follow-up).
- The Sportradar "Official FDC Secondary Feed" sublicence ran "through 2024"; I found nothing on whether it was renewed, so whether Sportradar still carries a lawful EPL feed for media is unknown.

---

## KQ2. Provider matrix: coverage, official status, logos, betting/affiliate policy, pricing, limits, latency, ToS risk

### Takeaway
Only four candidates fit a sub-$250/month, no-sales-call, betting-tolerant profile and cover most of Nosebleed's list: The Odds API (already in use; explicitly lists BetUS as a bookmaker key), API-Sports (per-sport $19–39/mo, no betting prohibition surfaced, logos "identification only"), balldontlie ($9.99–39.99/mo per sport, 24 leagues incl. PGA/F1/MMA/WTA) and Goalserve (per-sport $150–400/mo, bookmaker-oriented). SportsDataIO is the only self-serve vendor that both sublicenses headshots and openly courts "betting brands & affiliates," but its real-time production pricing is quote-based and reported in the mid-five-figures per year. Sportradar/Genius/Stats Perform are enterprise, quote-only, and Sportradar's developer terms require written approval for any gambling-connected use and bar betting clients from its Images API.

### Cited Findings

Legend for "Sports": the Nosebleed list is NFL, NBA, MLB, NHL, PGA, EPL, La Liga, Serie A, UFC, WTA, F1, NCAAF, NCAAB, WNBA. "Risk" = ToS/rights risk of using the provider in a BetUS-sponsored media app, low/med/high, with the reason in the row.

**The Odds API (the-odds-api.com) — currently in use**
- Sports: odds + scores for NFL, NBA, MLB, NHL, NCAAF, NCAAB, soccer leagues, golf outrights, MMA, tennis outrights, F1 outrights (scores "for selected sports… gradually being expanded") — [v4 docs](https://the-odds-api.com/liveapi/guides/v4/)
- Official status: unofficial aggregator; scores update ~every 30 s — [v4 docs](https://the-odds-api.com/liveapi/guides/v4/)
- Logos: none.
- Betting/affiliate policy: lists BetUS (`betus`), Bovada, BetOnline.ag, MyBookie.ag under the `us` region; terms say the provider "is not a wagering operator," compliance with responsible-gambling and advertising rules is the user's "sole responsibility," attribution not required, and reselling the data as a competing feed/API is prohibited — [Bookmaker APIs page](https://the-odds-api.com/sports-odds-data/bookmaker-apis.html); [Terms](https://the-odds-api.com/terms-and-conditions.html)
- Pricing (third-party summaries of the official page; confirm on site): free 500 credits/mo; $30/mo 20K credits; $59/mo 100K; $119/mo 5M; $249/mo 15M. /sports and /events are free; scores with daysFrom cost 2 credits, live/upcoming 1 credit — [oddspapi comparison (third-party)](https://oddspapi.io/blog/odds-api-pricing-2026-comparison/); [v4 docs](https://the-odds-api.com/liveapi/guides/v4/)
- Risk: **Low** for data; the vendor explicitly carries offshore books and disclaims operator status. Residual risk is the no-logos gap and the vendor's right to revoke keys on suspected redistribution.

**SportsDataIO (sportsdata.io)**
- Sports: NFL, NBA, MLB, NHL, NCAAF, NCAAB, Golf, NASCAR on the self-serve developer page (8 sports); wider coverage (soccer, MMA, WNBA, tennis) is quote-only per its coverage PDF — [sportsdata.io/developers](https://sportsdata.io/developers); [SDio Coverage PDF](https://sportsdata.io/files/SDio_Coverage.pdf)
- Official status: unofficial for most leagues (collects/normalizes; it markets "legal onshore US sportsbooks" for odds) — [SportsDataIO aggregated odds page](https://sportsdata.io/new-sportsbooks-aggregated-odds-service)
- Logos/images: headshots for NFL/MLB/NBA/NHL licensed "through a partnership with USA Today" (Imagn) and sold separately via sales; team-logo rights not described anywhere I could find; its data dictionary exposes a `WikipediaLogoUrl` field that links to Wikipedia-hosted logo files (no rights grant) — [Player Headshots page](https://sportsdata.io/developers/sports-player-headshots-api); [WNBA data dictionary](https://sportsdata.io/developers/data-dictionary/download/wnba)
- Betting/affiliate policy: runs a dedicated "Betting Brands & Affiliates" product line; ToS surfaced only an 18+ requirement and trademark-ownership boilerplate, no offshore clause — [Betting Brands & Affiliates](https://sportsdata.io/betting-brands-affiliates); [Terms of Service](https://sportsdata.io/terms-of-service)
- Pricing: self-serve developer tiers Fantasy $99/mo, Odds $99/mo, Fantasy+Odds $149/mo; free tier is last-season/one-day-delayed and "not licensed for commercial redistribution"; real-time production is quote-based — [sportsdata.io/developers](https://sportsdata.io/developers); Vendr reports a median buyer pays $16,496/yr **(third-party)** — [Vendr](https://vendr.com/marketplace/sportsdataio)
- Risk: **Medium**. Vendor is affiliate-friendly and will sell real-time data, but the odds book list is "legal onshore" only, logo rights are not granted, and the $99 self-serve tier does not include live play-by-play.

**Sportradar (developer.sportradar.com / marketplace)**
- Sports: all of Nosebleed's list (official for NBA, MLB, NHL, NWSL, PGA/WTA/MLS post-IMG Arena; unofficial for NFL since 2021; EPL only via any FDC sublicence) — see KQ1 citations.
- Logos/images: Images API v3 (team/league logos, headshots, action) is "for media use only" and "prohibited for betting clients"; trial returns watermarked samples; licensing is split per sport and per logo/headshot product — [Images API reference](https://developer.sportradar.com/images-and-editorials/reference); [Images FAQ](https://developer.sportradar.com/images-and-editorials/reference/images-faqs); [Tagboard note](https://support.tagboard.com/knowledge-base/advanced-elements-sportradar)
- Betting/affiliate policy: US developer master terms require "express written approval" (grantable or withholdable at Sportradar's discretion) to use products "in connection with a gambling or betting business," and separate written approval for advertising uses; the Official Media Data Addendum (NBA/NHL/MLB) grants a "limited, revocable, non-sublicensable" right "only for media and editorial purposes and non-commercial use"; NFL/NHL addenda bar displaying "all or substantially all" of the source data — [Terms and Conditions](https://developer.sportradar.com/sportradar-updates/page/terms-and-conditions); [Master Terms for Non-Betting Services](https://developer.sportradar.com/sportradar-updates/page/master-terms-and-conditions-for-non-betting-services); [Official Media Data Addendum](https://developer.sportradar.com/sportradar-updates/page/official-media-data-addendum); [NHL Addendum](https://developer.sportradar.com/sportradar-updates/page/nhl-addendum); [NFL Addendum](https://developer.sportradar.com/NFL_Addendum)
- Pricing: not published; tiered by pull frequency, monthly per sport, charged only in months with games; trial keys = 1 sport, 1,000 calls per rolling 30 days — [Golf FAQ](https://developer.sportradar.com/golf/v2/docs/faqs); [Your account](https://developer.sportradar.com/getting-started/docs/your-account). Third-party estimates: €1,300–4,990+/mo on annual contracts (Sportmonks, a competitor) and "$10,000+/month" (SharpAPI, a competitor) **(estimates)** — [Sportmonks](https://www.sportmonks.com/football-api/alternatives/sportradar/); [SharpAPI](https://sharpapi.io/compare/sportradar-alternative)
- Risk: **High** for Nosebleed as configured. A BetUS-sponsored surface is "in connection with a gambling or betting business" under the developer terms and is a betting client for Images purposes.

**Genius Sports**
- Sports: NFL (exclusive, through 2029), EPL/EFL/SPFL (exclusive, through 2028-29), NBA/WNBA (non-exclusive), NCAA (exclusive through 2032), PLL (2020 betting data/integrity deal) — KQ1 citations; [SBC Americas on PLL](https://sbcamericas.com/2020/05/12/genius-sports-appointed-official-sports-betting-partner-for-pll/)
- Logos: NCAA deal bundles marks for Authorized Gaming Licensees only — [LSR](https://www.legalsportsreport.com/231676/ncaa-grants-sportsbooks-first-time-access-to-official-data-logos/)
- Betting/affiliate policy: Genius's stated position to the NY Senate (2018) is that "official data will not be made available to unlicensed betting operators"; its league programs (NCAA AGL, Pac-12 AGO) distribute only to licensed sportsbooks and can terminate for integrity violations — [NY Senate submission](https://www.nysenate.gov/sites/default/files/1.24.18_genius_sports_integrity_monitoring_information.pdf); [SVG Pac-12](https://www.sportsvideo.org/2026/03/17/pac-12-inks-integrity-data-deals-with-genius-sports-ic360/)
- Pricing: not published; no self-serve developer portal surfaced.
- Risk: **High / not realistically available**. No public media-tier access found (search budget ran out before the follow-up).

**Stats Perform / Opta**
- Sports: global soccer (EPL, La Liga, Serie A), US majors, tennis, golf via its own collection — [Stats Perform products](https://developers.statsperform.com/stats-perform-products)
- Official status: mostly unofficial (video-coded event data); licenses "don't cover live broadcast rights" — [Stats Perform FAQs](https://www.statsperform.com/faqs/stats-perform-faqs-apis-data-delivery/)
- Pricing: not published, "contact our sales team"; competitor estimate "from around €250/month" **(estimate, competitor)** — [Stats Perform FAQs](https://www.statsperform.com/faqs/stats-perform-faqs-support/); [Sportmonks on Opta](https://www.sportmonks.com/football-api/alternatives/opta/)
- Logos: not addressed in anything found.
- Risk: **Medium-High** (enterprise sales-gated; betting policy unknown).

**OpticOdds**
- Sports: all majors; 200+ sportsbooks including Bovada (official docs); BetOnline/Sportsbetting.ag coverage reported by a third-party guide; BetUS not confirmed — [OpticOdds sportsbooks docs](https://developer.opticodds.com/docs/sportsbooks); [agentbets guide (third-party)](https://agentbets.ai/offshore-sportsbook-api/)
- Pricing: not published; community/third-party reports of "approximately $5,000 per month" starting point **(estimate)** — [SportsGameOdds comparison (competitor)](https://sportsgameodds.com/blog/optic-odds-vs-sports-game-odds)
- Latency: vendor claims sub-second — [OpticOdds](https://opticodds.com/sports-betting-api)
- Logos: none. Risk: **Low** on policy, **out of budget**.

**API-Sports (api-sports.io; API-Football, API-NBA, API-NFL, API-MLB, API-NHL, API-Formula-1, API-MMA, API-Basketball)**
- Sports: separate API per sport — football (EPL/La Liga/Serie A), NBA, NFL (+NCAA via American Football), MLB, NHL, Formula-1, MMA (UFC), basketball (NCAA/WNBA via API-Basketball). **No tennis/golf** — [api-sports.io](https://api-sports.io/); [MMA API](https://api-sports.io/sports/mma)
- Official status: unofficial.
- Logos: ToS says logos/trademarks are "provided solely for identification and descriptive purposes," API-Sports "does not own any of these visual assets," "declines all responsibility in case of unauthorized use," and the developer "is fully responsible" for rights clearance — [API-Football terms](https://www.api-football.com/terms); [API-Sports terms](https://api-sports.io/terms)
- Pricing (per sport): Free 100 req/day (10/min); Pro 7,500/day; Ultra 75,000/day; Mega 150,000/day. Prices conflict across the vendor's own channels: $19/$29/$39 on some pages vs $15/$25/$35 on RapidAPI and an API-Football guide — [API-Football pricing](https://www.api-football.com/pricing); [RapidAPI API-American-Football pricing](https://rapidapi.com/it/api-sports/api/api-american-football/pricing); [API-NFL guide](https://www.api-football.com/news/post/how-to-get-started-with-api-nfl-the-complete-beginners-guide)
- Betting policy: not found (search budget exhausted before the follow-up). Odds endpoints exist in the product.
- Risk: **Low-Medium**. Cheap and self-serve; logo risk is explicitly yours; 8 sports × ~$19–39 ≈ $150–$300/mo for Nosebleed's list, excluding golf and tennis.

**Sportmonks**
- Sports: football (EPL/La Liga/Serie A), cricket, Formula 1; no US majors, no tennis/golf/UFC — [Sportmonks](https://www.sportmonks.com/)
- Official status: unofficial.
- Logos: ToS says logos "belong to their legal owners" and you must "arrange your own proof of intellectual property" before displaying them; suggests written permission from clubs/leagues or creating a variation — [Sportmonks ToS](https://www.sportmonks.com/terms-of-service/); [FAQ](https://www.sportmonks.com/faq/)
- Pricing: Starter €29/mo (5 leagues, 2,000 calls/entity/hour), Growth €99/mo (30 leagues), Pro €249/mo (120 leagues), Enterprise custom; free plan = Danish Superliga + Scottish Premiership — [Football API pricing](https://www.sportmonks.com/football-api/world-plan/); [Livescore API page](https://www.sportmonks.com/football-api/solutions/live-score-api/)
- Risk: **Low** for soccer data; covers only 4 of 14 sports.

**Goalserve**
- Sports: soccer, NFL/NCAA, NBA/MLB/NHL (US package), tennis (ATP/WTA), golf (PGA), MMA, F1 (per its feed catalogue) — [Goalserve full package](https://www.goalserve.com/en/sport-data-feeds/full-package-api/prices)
- Official status: unofficial; markets prematch and in-play odds feeds to bookmakers — [Soccer API prices](https://www.goalserve.com/en/sport-data-feeds/soccer-api/prices)
- Logos: nothing found on logo rights (search returned no Goalserve logo terms).
- Pricing (official pages, with sale-vs-list discrepancies noted by the search): Soccer Live Score $150/mo, Full Soccer $550/mo; NFL/NCAA $300/mo; US Sports (NFL+NBA+MLB+NHL) $400/mo; Tennis $150/mo; Golf $200/mo; All Sports $800/mo ($5,100/yr) — [US sports prices](https://www.goalserve.com/en/sport-data-feeds/ussports-api/prices); [Tennis](https://www.goalserve.com/en/sport-data-feeds/tennis-api/prices); [Golf](https://www.goalserve.com/enrms-and-conditions/sport-data-feeds/golf-api/prices); [Full package](https://www.goalserve.com/en/sport-data-feeds/full-package-api/prices)
- Risk: **Low-Medium** on policy (bookmaker-facing vendor); over budget for full coverage ($800/mo).

**BetsAPI**
- Sports: wide (via Bet365/other book event feeds), incl. tennis, MMA, golf, F1.
- Official status: unofficial (scrapes/aggregates sportsbook event feeds; bet365 itself offers no public API) — [BetsAPI docs](https://betsapi.com/docs/); [oddspapi on bet365 (third-party)](https://oddspapi.io/blog/bet365-api-odds-access/)
- Pricing: Events API full package 150/mo at 3,600 req/hour; single-sport events packages 10–30/mo (Soccer 30); Bet365 package 150/mo; trials $1/day; volume packages 50–600/mo; currency not stated on the table (docs say "started with $10 per month") — [Pricing table](https://betsapi.com/mm/pricing_table); [Pricing docs](https://betsapi.com/docs/pricing.html)
- Logos: none found. Risk: **Medium-High** — its data provenance (sportsbook scraping) is the kind of thing Sportradar sues over, and bet365 could cut it off; fine for odds, shaky as a system of record.

**SportsAPI.com / "Sportsbook API"**
- SportsAPI.com is a directory/comparison site, not a feed — [API Evangelist profile](https://providers.apievangelist.com/providers/sportsapi/). No "Sportsbook API" vendor matching the brief was found. **Gap.**

**MySportsFeeds**
- Sports: NFL, MLB, NBA, NHL only.
- Pricing: free for non-commercial use; commercial CORE non-live starts NFL $39/mo, MLB $35, NBA $29, NHL $25 ("FREE for first year"; near-real-time is custom quote); personal from $5/mo — [MySportsFeeds pricing](https://www.mysportsfeeds.com/feed-pricing/)
- Logos: not addressed. Betting policy: not found. Risk: **Medium** — commercial live feeds need a quote; no US-college, soccer, golf, tennis, UFC, F1.

**balldontlie**
- Sports: NBA, NFL, MLB, NHL, WNBA, NCAAF, NCAAB, NCAAW, EPL, La Liga, Serie A, Bundesliga, Ligue 1, UCL, MLS, MMA, Tennis (ATP/WTA), PGA, F1, esports — i.e., **all 14 of Nosebleed's sports** — [balldontlie.io](https://www.balldontlie.io/)
- Pricing: Free 5 req/min; ALL-STAR $9.99/mo (60 req/min); GOAT $39.99/mo (600 req/min), per sport; All-Access $299.99/mo for all sports (an older third-party post said $499.99) — [NBA page](https://nba.balldontlie.io/); [balldontlie.io](https://www.balldontlie.io/); [Highlightly (third-party)](https://highlightly.net/blogs/best-nba-apis-in-2026)
- Betting odds/props endpoints exist (per a connector changelog) — [StackOne changelog](https://docs.stackone.com/connectors/balldontlie/changelog.md)
- Logos / ToS on commercial or betting use: **not found**. Risk: **Medium** — cheapest multi-sport path but terms unverified; provenance undisclosed.

**Tank01 (RapidAPI)**
- Sports: NFL, NBA, MLB, NHL, WNBA, NCAA (per league APIs).
- Pricing: Basic free 1,000 hits/mo; Pro $10/mo 1,000 req/day; Ultra $25/mo 15,000/day; Mega $100/mo 500,000/day (NHL/WNBA Mega 125,000/day); per league — [tank01.com](https://www.tank01.com/); [RapidAPI listing](https://rapidapi.com/tank01/api/tank01-fantasy-stats)
- Logos/betting terms: not found. Risk: **Medium** (hobbyist-grade, provenance undisclosed).

**ESPN undocumented site API — currently in use**
- Official status: unofficial; no documentation, SLA, or support; ESPN closed its public API program in Dec 2014 and stopped issuing keys — [Zuplo guide](https://zuplo.com/learning-center/espn-hidden-api-guide); [App Developer Magazine](https://appdevelopermagazine.com/The%20World%20Wide%20Leader%20in%20Sports%20Leaves%20Developers%20in%20a%20World%20of%20Hurt%20as%20ESPN%20Closes%20Public%20API/)
- ToS: ESPN's terms point to Disney's Terms of Use, which bar using "a robot, spider, script, or other automated means" to "access, monitor, copy or extract" Disney products (ESPN is a named Disney brand), and the current version adds data mining/web scraping/dataset building; ESPN's robots.txt blocks known AI crawlers — [Disney Terms of Use](https://disneytermsofuse.com/english/); [Crawlora (third-party)](https://crawlora.net/blog/how-to-scrape-espn)
- Logos/headshots: served from ESPN's CDN; no license. Risk: **High** (contract breach exposure + zero stability guarantee + unlicensed marks).

**Official league public endpoints**
- MLB Stats API (statsapi.mlb.com): MLBAM's copyright notice at gdx.mlb.com/components/copyright.txt limits use to "individual, non-commercial, non-bulk" with other uses requiring "prior written authorization" (quoted secondhand; the file itself could not be fetched) — [Beexly PR quoting the file](https://github.com/Beexly/Sports/pull/443); [MLB-StatsAPI wrapper README](https://github.com/toddrob99/MLB-StatsAPI)
- NHL (api-web.nhle.com): no published API terms; NHL.com terms allow "personal use only," prohibit "unauthorized spidering, scraping, or harvesting… or use any other unauthorized automated means," and declare all content NHL property — [NHL.com Terms of Service](https://www.nhl.com/info/terms-of-service); [nhl-api-py (notes no spec/stability guarantee)](https://pypi.org/project/nhl-api-py/2.1.0)
- NBA (stats.nba.com): NBA.com Terms of Use §9 restrict statistics to "legitimate news reporting or private, non-commercial purposes," require prominent NBA.com attribution, bar tying stats to sponsorship/commercial identification, and the list continues with a gambling restriction (snippet truncated) — [NBA Terms of Use](https://www.nba.com/termsofuse)
- Logos served by these endpoints: no reuse grant found anywhere. Risk: **High** for a sponsored commercial app on all three.

**Enetpulse / Broadage / Statscore / LSports (scout-network vendors)**
- Enetpulse: pricing unlisted; third-party estimate $500–1,000+/mo; "Breakaway Accelerator" offers discounted pricing for early-stage sports-tech startups **(estimate)** — [SourceForge](https://sourceforge.net/software/product/Enetpulse/); [Sportmonks (competitor)](https://www.sportmonks.com/football-api/alternatives/enetpulse/)
- Broadage: quote-based ("Pricing"/"Get a Quote"), 600+ scouts — [Broadage](https://www.broadage.com/about-us)
- Statscore / LSports: enterprise, bookmaker-oriented; pricing not found (search budget ran out).

**SportsGameOdds (not on the brief, but a cheap scores+odds alternative worth logging)**
- Free Amateur tier (10 req/min, 2,500 objects/mo incl. live scores); Rookie $99/mo billed annually (~$149 monthly); Pro $299 annual / $499 monthly, 53 leagues, 82 bookmakers, sub-minute updates; bookmaker IDs include betus, bovada, betonline, mybookie — [SportsGameOdds pricing](https://sportsgameodds.com/pricing); [bookmaker IDs](https://sportsgameodds.com/docs/data-types/bookmakers)

### Inferences
- Under $250/mo the only full-list configurations are: (a) The Odds API $30–59 + balldontlie All-Access $299.99 (over budget) or balldontlie per-sport GOAT for the 4–5 sports that matter ($40–200); (b) The Odds API + API-Sports for 8 sports ($150–300) with golf/tennis left on The Odds API outrights only. Neither configuration gives you logo rights.
- SportsDataIO is the only vendor in the set that will put headshots on paper, and it is the only one that openly sells to affiliates — but its real-time tier is quote-based and reported at ~$16k/yr, which is 5× the budget.
- Every self-serve vendor that exposes logos (API-Sports, Sportmonks, SportsDataIO via Wikipedia URLs) uses "identification only / you clear the rights" language. The industry's working assumption is nominative fair use for identifying a team in a scores UI; none of them will indemnify you.

### Gaps
- Could not read the actual ToS of balldontlie, Tank01, MySportsFeeds, Goalserve, BetsAPI or API-Sports for a betting/affiliate clause (fetch blocked; search budget exhausted). Treat their betting posture as "unknown, not prohibited in anything surfaced."
- No vendor in the set publishes per-event latency figures for scores except The Odds API (~30 s refresh); API-Sports/Sportmonks/Goalserve claims were not surfaced.
- "Sportsbook API" as a named vendor could not be identified.

---

## KQ3. Do providers refuse customers that promote offshore books? What do Sportradar/Genius policies and league "integrity" terms say? Is reapplication realistic for a media company that drops offshore books?

### Takeaway
There is no published provider policy that names "offshore sportsbook affiliates," but the structure is unambiguous: Sportradar's US developer terms make any gambling-connected use subject to discretionary written approval, its Images API bans betting clients outright, its partner agreements push licensing responsibility onto the customer and exclude the US for unlicensed betting, and Genius/league programs only distribute to licensed operators. Since April 2026 Sportradar has been publicly fighting short-seller claims that 20–40% of its revenue comes from illegal operators, which makes it less, not more, likely to onboard a BetUS-sponsored app. A clean reapplication after removing offshore promotion is plausible on paper but there is no evidence of a documented path, and the only published precedent (FanDuel's affiliate program) shows the industry cutting off sites that mix offshore promotion with licensed partners.

### Cited Findings
- Sportradar US developer master terms: use of products "in connection with a gambling or betting business requires express written approval from Sportradar, which it can grant or withhold at its discretion"; advertising uses also require prior written approval — [Sportradar Terms and Conditions](https://developer.sportradar.com/sportradar-updates/page/terms-and-conditions)
- Sportradar Images API: "for media use only"; "use of this API is prohibited for betting clients" — [Images API reference](https://developer.sportradar.com/images-and-editorials/reference)
- Sportradar Master Partner Agreement (19 March 2025 version): services "may not be used in the United States of America, and/or any other jurisdiction where sports betting is not permitted"; "Partner and Operators are solely responsible to obtain all necessary licences"; Sportradar "is only a service provider and is not an operator" — [Master Partner Agreement](https://sportradar.com/master-partner-agreement/?lang=en-us); [Betting Data GTC archive](https://sportradar.com/general-terms-and-conditions-betting-data-archived-versions/?lang=en-us)
- Sportradar enforcement: it says it "terminated agreements and turned off at least five separate operators" found breaching terms and targeting US punters — [The Straight](https://thestraight.com.au/data-supply-to-illegal-bookmakers-under-the-spotlight-as-sportradar-denies-short-sellers-accusations/)
- April 22, 2026: Muddy Waters and Callisto Research short reports alleged ~270 platforms using Sportradar products operate illegally and that 20–40% of revenue may come from unlicensed markets; shares fell ~23%; Sportradar says it "works exclusively with licensed operators," screens sanctions lists, and that licensed B2B aggregators carry downstream KYC; a securities class action followed (class period Nov 7, 2024–Apr 21, 2026) — [Front Office Sports](https://frontofficesports.com/article/sportradar-refutes-claims-that-it-works-with-illegal-gambling-companies/); [CasinoBeats](https://casinobeats.com/2026/04/23/sportradar-accused-facilitating-illegal-gambling-share-price-crashes/); [Sportradar 6-K](https://www.sec.gov/Archives/edgar/data/0001836470/000110465926049764/tm2612832d2_6k.htm); [Glancy Prongay](https://www.glancylaw.com/cases/sportradar-group-ag/)
- Sportradar's Brazil notice: it restricted a betting service to Brazilian clients from Oct 6, 2026 after a provisional measure banned fixed-odds betting — evidence it actively gates by jurisdictional legality — [Sportradar Imprint](https://sportradar.com/imprint/)
- Genius Sports' stated policy (2018 NY Senate submission): "Official data will not be made available to unlicensed betting operators" — [NY Senate PDF](https://www.nysenate.gov/sites/default/files/1.24.18_genius_sports_integrity_monitoring_information.pdf)
- League-mandated integrity programs: NCAA's Authorized Gaming Licensee program gives sportsbooks official data and marks only while they meet integrity conditions, with termination rights; Pac-12's Genius program distributes "to licensed sportsbooks worldwide" and administers an Authorized Gaming Operator program — [LSR NCAA](https://www.legalsportsreport.com/231676/ncaa-grants-sportsbooks-first-time-access-to-official-data-logos/); [SVG Pac-12](https://www.sportsvideo.org/2026/03/17/pac-12-inks-integrity-data-deals-with-genius-sports-ic360/)
- NFL enforces sportsbook-ad restrictions "through contracts rather than the rulebook," requires official league data and integrity terms for in-game ads, bars prediction-market ads, and does not publish its approved-product list — [Gambling Insider](https://www.gamblinginsider.com/?p=195594); [Gambling.com](https://www.gambling.com/us/news/nfl-bars-sportsbook-partners-from-prediction-market-ads)
- Industry affiliate precedent: FanDuel told affiliates it "no longer wishes to associate itself with websites that promote offshore gambling sites alongside ads for FanDuel," requiring a representation that the site promotes no illegal activity, with termination for noncompliance — [BettingUSA](https://www.bettingusa.com/fanduel-partners-stop-promoting-offshore/)
- New Jersey DGE guidance for media: if an unauthorized site must be mentioned, state that it "is not licensed to provide sports wagering bets in New Jersey" — [Sports Handle](https://sportshandle.com/offshore-legal-sportsbooks-media-nytimes/)
- Secondary vendors that do carry offshore books: The Odds API lists BetUS, Bovada, BetOnline.ag, MyBookie.ag; OpticOdds lists Bovada; SportsGameOdds lists betus/bovada/betonline/mybookie — [The Odds API bookmakers](https://the-odds-api.com/sports-odds-data/bookmaker-apis.html); [OpticOdds sportsbooks](https://developer.opticodds.com/docs/sportsbooks); [SportsGameOdds bookmakers](https://sportsgameodds.com/docs/data-types/bookmakers)
- Prediction-market gating: Sportradar will serve "Kalshi and other licensed prediction market entities that operate in compliance with applicable regulations" — [Sportradar IR](https://investors.sportradar.com/news-releases/news-release-details/sportradar-and-kalshi-announce-first-its-kind-data-and)

### Inferences
- Nosebleed's denial is consistent with the written terms even without an explicit "no offshore affiliates" rule: a BetUS-sponsored app is "in connection with a gambling or betting business," so Sportradar had discretion to decline and, post-Muddy Waters, every commercial incentive to do so. Genius has no public media-tier channel for an indie app at all.
- A reapplication is realistic only if (1) BetUS and any offshore odds are removed from the surface, (2) the app is repositioned as media/editorial with a licensed-operator or no-operator ad model, and (3) the request goes through the media (non-betting) master terms. Expect the Official Media Data Addendum's "media and editorial purposes and non-commercial use" language to be the sticking point for a monetized app; that language is designed for publishers, not for apps that sell odds-adjacent sponsorship.
- The inverse strategy — keep BetUS and go fully secondary — is lawful for scores/odds (The Odds API, API-Sports, balldontlie, Goalserve, SportsGameOdds all carry or tolerate offshore books) but permanently forecloses official marks.

### Gaps
- No provider publishes a written "offshore affiliate" exclusion; the finding is structural, not textual.
- No documented example of a media company being re-approved after dropping offshore promotion was found.
- Genius Sports' current customer-acceptance policy and whether it has any media-tier access for small publishers could not be checked (search budget exhausted).

---

## KQ4. Official public league APIs (MLB Stats API, NHL api-web, NBA stats): is commercial use permitted? Are their logos reusable?

### Takeaway
All three are free to hit but none permits commercial use by their published terms: MLBAM's copyright notice limits statsapi.mlb.com to individual, non-commercial, non-bulk use; NHL.com's terms are personal-use-only and prohibit automated harvesting; NBA.com's terms restrict statistics to news reporting or private non-commercial use with attribution and no sponsorship tie-in. None grants any logo reuse.

### Cited Findings
- MLB: the copyright notice referenced in every Stats API response restricts use to "individual, non-commercial, non-bulk" with other uses needing "prior written authorization" from MLBAM (quoted via a GitHub PR whose author fetched the file; the primary file could not be fetched here) — [Beexly/Sports PR #443](https://github.com/Beexly/Sports/pull/443); [MLB-StatsAPI README](https://github.com/toddrob99/MLB-StatsAPI); [Apify listing describing terms as personal, non-commercial unless licensed](https://apify.com/retrainmap/mlb-stats)
- NHL: api-web.nhle.com has no published specification or stability guarantee; NHL.com Terms of Service permit "personal use only," prohibit "unauthorized spidering, scraping, or harvesting of content" and automated compilation, and state the content is NHL property — [NHL.com ToS](https://www.nhl.com/info/terms-of-service); [nhl-api-py](https://pypi.org/project/nhl-api-py/2.1.0)
- NHL licensed-data comparison: Sportradar's NHL addendum bars re-distributing "all or substantially all of the source NHL Data" and automated copying — [NHL Addendum](https://developer.sportradar.com/sportradar-updates/page/nhl-addendum)
- NBA: NBA.com Terms of Use §9 (NBA Statistics) require prominent NBA.com attribution, limit use to "legitimate news reporting or private, non-commercial purposes," bar tying stats to sponsorship or commercial identification, and continue with a gambling-related restriction (snippet truncated); downloads are for "personal, noncommercial use on a single computer" — [NBA Terms of Use](https://www.nba.com/termsofuse); [nba_api README noting NBA.com ToU governs data](https://github.com/rsforbes/nba_api)
- Scraping facts vs. contract: a US legal Q&A notes that even where statistics are uncopyrightable facts, scraping against a site's terms can expose the scraper to breach-of-contract claims — [Avvo](https://www.avvo.com/legal-answers/can-i-commercially-use-sports-statistics-that-have-3624514.html)
- Logos on these endpoints: no reuse grant found on any of the three; MLB/NHL/NBA terms treat all site content as league property (NHL quoted above).

### Inferences
- For a BetUS-sponsored commercial app, all three public league APIs are **ToS-violating routes** (flagged per the brief's constraint). The "sponsorship or commercial identification" clause in NBA.com's terms is the most directly on-point: an odds/picks app with a sportsbook sponsor is exactly the use it describes.
- Polling 30 s with a 60 s cache is "automated means" under NHL/Disney-style language regardless of volume; volume does not cure the contract issue.

### Gaps
- Exact current wording of gdx.mlb.com/components/copyright.txt not verified first-hand (fetch blocked); the NBA §9 list is truncated in every snippet found.
- No statement from any of the three leagues on how (or whether) they enforce against small commercial apps.

---

## KQ5. Logo add-ons: who lawfully sublicenses logos/headshots, what it costs, who says "clear it yourself"

### Takeaway
Only Sportradar (Images API, media-only, betting clients prohibited) and SportsDataIO (headshots via USA Today/Imagn, quote-only) position themselves as lawful image sublicensors; API-Sports and Sportmonks explicitly disclaim logo rights and put clearance on the developer; SportsDataIO's team-logo field is a Wikipedia URL; Imagn and Getty sell editorial photos on quote/subscription with no published small-publisher price.

### Cited Findings
- Sportradar Images API v3: team/league logos, headshots, venue and action images from 100+ collections and four providers; "media use only," "prohibited for betting clients"; trial logos watermarked; licensed per sport and per logo/headshot product — [Images reference](https://developer.sportradar.com/images-and-editorials/reference); [Images FAQ](https://developer.sportradar.com/images-and-editorials/reference/images-faqs); [Tagboard](https://support.tagboard.com/knowledge-base/advanced-elements-sportradar)
- Sportradar "Logos for Attribution" covers only Sportradar's own mark (royalty-free licence to display Sportradar branding) — [Logos for Attribution](https://developer.sportradar.com/logos-for-attribution)
- SportsDataIO headshots: NFL/MLB/NBA/NHL headshots "through a partnership with USA Today," and action-photo headshots via Imagn for big-four plus golf, with/without background; quote via sales — [Player Headshots](https://sportsdata.io/developers/sports-player-headshots-api)
- SportsDataIO team logos: `WikipediaLogoUrl` field links to Wikipedia-hosted files; no rights grant described — [WNBA data dictionary](https://sportsdata.io/developers/data-dictionary/download/wnba)
- API-Sports: logos "provided solely for identification and descriptive purposes"; "We does not own any of these visual assets"; "you are fully responsible" for compliance; "not affiliated with… any sports league" — [API-Football terms](https://www.api-football.com/terms); [API-Sports terms](https://api-sports.io/terms)
- Sportmonks: logos "belong to their legal owners"; you must "arrange your own proof of intellectual property" before display; recommends written permission from teams/leagues or a variation of the logo — [Sportmonks ToS](https://www.sportmonks.com/terms-of-service/)
- live-score-api.com (a comparable vendor) bars commercializing team logos without explicit permission — [live-score-api terms](https://live-score-api.com/index/terms)
- Imagn (Gannett/USA Today Sports Images): per-photo or subscription (sports-only / news / combined), flat-fee unlimited editorial subscription for high-volume or API customers; no public price — [Poynter](https://www.poynter.org/tech-tools/2019/gannett-just-launched-its-own-image-licensing-and-wire-service/); [api.imagn.com](https://api.imagn.com)
- Getty: API access "governed by the same licensing and pricing models as direct purchases"; editorial sports plans via sales **(third-party description)** — [apispine (third-party)](https://apispine.com/getty-images/pricing)
- NCAA marks are bundled with official data only for Authorized Gaming Licensees (sportsbooks) — [LSR](https://www.legalsportsreport.com/231676/ncaa-grants-sportsbooks-first-time-access-to-official-data-logos/)

### Inferences
- No lawful logo sublicense is available to Nosebleed as currently configured: Sportradar excludes betting clients, SportsDataIO only papers headshots (not team marks), and everyone else disclaims. The honest options are (a) text/abbreviation + team-color chips with no marks, (b) nominative fair-use display of marks for identification with counsel sign-off and no sponsor adjacency, or (c) drop the offshore sponsor and apply to Sportradar Images under the media terms.
- Headshots via SportsDataIO/Imagn are the one image class that can be bought cleanly today, but at quote-only pricing that will likely exceed the $250/mo envelope on its own (inference from the $16k/yr Vendr median for SportsDataIO overall).

### Gaps
- No published price for Sportradar Images, SportsDataIO headshots, Imagn or Getty editorial API tiers.
- Goalserve's and balldontlie's logo terms could not be found.

---

## KQ6. Smaller leagues that license directly and cheaply (UFL, PLL, LIV, NWSL, MLS NEXT, OTE, TGL): any published developer/media programs?

### Takeaway
None of these leagues publishes a self-serve developer or media data program; where data exists it is already routed through Sportradar (UFL, NWSL, MLS via IMG Arena) or Genius/Champion Data (PLL), and LIV Golf is in Chapter 11, which makes it a poor counterparty for any new licence.

### Cited Findings
- UFL: Sportradar is the official data provider; a Sportradar UFL API (schedules, rosters, standings, stats, real-time scoring) launched Feb 2024 with trial and production tiers; keys must stay server-side — [Sportradar UFL changelog](https://developer.sportradar.com/sportradar-updates/changelog/ufl-api); [UFL IG overview](https://developer.sportradar.com/football/docs/ufl-ig-overview)
- PLL: Genius Sports named official data and integrity partner for betting (May 2020); Champion Data named Official Stats Provider (2022); no public API found — [SBC Americas](https://sbcamericas.com/2020/05/12/genius-sports-appointed-official-sports-betting-partner-for-pll/); [PLL](https://premierlacrosseleague.com/articles/champion-data-named-the-official-stats-provider-of-the-premier-lacrosse-league)
- NWSL: Sportradar official partner for global data and streaming distribution — [Sportradar on X](https://x.com/Sportradar/status/2032474406589522173)
- MLS: in the IMG Arena portfolio Sportradar acquired — [Insider Sport](https://insidersport.com/2025/11/03/the-new-king-of-sports-data-inside-sportradars-img-arena-acquisition/)
- USL (adjacent): exclusive long-term Sportradar partnership — [USL](https://www.uslsoccer.com/news_article/show/1302969)
- LIV Golf: filed Chapter 11 in New Jersey (Sept 2026) and entered a restructuring support agreement; no official data API found; only third-party odds feeds (SportsGameOdds) cover it — [Sports Media Watch](https://www.sportsmediawatch.com/2026/09/liv-golf-bankruptcy-netflix-andres-cantor-pwhl-media-rights-u-s/); [SportsGameOdds LIV](https://sportsgameodds.com/leagues/liv-tour-odds-api)
- TGL: ESPN holds exclusive multi-year US rights; no data program found — [Sports Media Watch](https://www.sportsmediawatch.com/2025/01/tgl-golf-preview-technology-what-to-expect/)
- MLS NEXT, Overtime Elite: nothing found.

### Inferences
- "Go small and license directly" does not work: the small leagues outsourced data distribution to the same two companies that control the majors, so the gating (and the betting-client scrutiny) is identical.

### Gaps
- No pricing or application process for the Sportradar UFL API production tier was surfaced.
- MLS NEXT and Overtime Elite data programs: no results.

---

## Position memo (exec summary for the council)

1. **The market will sell Nosebleed scores and odds today, lawfully, at indie prices — but only from the secondary tier, and without marks.** The Odds API (in use) explicitly carries BetUS and disclaims operator status; API-Sports and balldontlie cover the whole list for ~$150–300/mo; Goalserve and SportsGameOdds are credible fallbacks. None of them will license a logo. ([The Odds API bookmakers](https://the-odds-api.com/sports-odds-data/bookmaker-apis.html); [API-Football pricing](https://www.api-football.com/pricing); [balldontlie](https://www.balldontlie.io/))
2. **The official tier is structurally closed while BetUS is on the surface.** Sportradar's developer terms give it discretion over any gambling-connected use and ban betting clients from Images; Genius distributes only to licensed operators; both are under acute public pressure (Muddy Waters/Callisto, April 2026; Altenar antitrust complaints) to be seen policing unlicensed books. The denial Nosebleed received is the expected outcome, not an anomaly. ([Sportradar T&Cs](https://developer.sportradar.com/sportradar-updates/page/terms-and-conditions); [Front Office Sports](https://frontofficesports.com/article/sportradar-refutes-claims-that-it-works-with-illegal-gambling-companies/))
3. **The current stack has two ToS-violating legs (flagged):** ESPN's undocumented site API (Disney ToU bans automated extraction) and any use of MLB/NHL/NBA public endpoints in a sponsored commercial app. Replace them with licensed secondary feeds; keep The Odds API; treat Polymarket/Kalshi public APIs as a separate question for the legal persona. ([Disney ToU](https://disneytermsofuse.com/english/); [NBA ToU](https://www.nba.com/termsofuse); [NHL ToS](https://www.nhl.com/info/terms-of-service))
4. **Marks are the real blocker, not data.** The only lawful logo path at any price requires not being a betting client (Sportradar Images) or buying headshots only (SportsDataIO/Imagn). Ship with text/colour identifiers or get counsel to sign off a nominative-use design with no sponsor adjacency. ([Sportradar Images](https://developer.sportradar.com/images-and-editorials/reference); [SportsDataIO headshots](https://sportsdata.io/developers/sports-player-headshots-api))
5. **If the council wants official data later, the sequence is: drop offshore promotion → reposition as editorial media → reapply under Sportradar's non-betting master terms with the Official Media Data Addendum in mind → budget enterprise money (third-party estimates start at ~€1,300/mo).** No documented precedent of such a re-approval was found; treat it as plausible, not proven. ([Master Terms for Non-Betting Services](https://developer.sportradar.com/sportradar-updates/page/master-terms-and-conditions-for-non-betting-services); [Official Media Data Addendum](https://developer.sportradar.com/sportradar-updates/page/official-media-data-addendum); [Sportmonks estimate](https://www.sportmonks.com/football-api/alternatives/sportradar/))
