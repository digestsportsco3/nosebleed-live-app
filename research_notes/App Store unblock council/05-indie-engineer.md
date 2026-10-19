# Indie Sports App Engineer — position memo (App Store unblock, provider stack, build effort)

Persona: indie sports-app engineer. Scope: what apps this size actually ship with, which providers to wire into the existing `server.js` adapter seam, and person-day effort. Codebase was read read-only at `/home/user/nosebleed-live-app` (commit `dee4b4c`, 2026-10-19). Nothing was modified or committed.

Research caveats up front: the sandbox egress proxy denied direct connections to every provider host (the-odds-api.com, sportsdata.io, api-sports.io, sportmonks.com, goalserve.com, developer.sportradar.com, balldontlie.io, mysportsfeeds.com, opticodds.com, revenuecat.com, docs.whop.com, capacitorjs.com, disneytermsofuse.com, gdx.mlb.com, teamcolorcodes.com all returned 403 CONNECT), and the shared web-search budget ran out before every follow-up could be made. Pricing below is therefore sourced from search snippets of official pages where available and from third-party comparison sites otherwise, and each is labeled. Anything I could not source is in the Gaps lists, not invented. All effort figures are my estimates.

Blended rate assumption used throughout: **US-remote senior contractor at $100/h, 8 h/day = $800/person-day** (assumption, not a quote).

---

## Key question 1 — Which code paths serve logos/headshots/favicons, what a names+colors-only mode takes, and where team colors come from

### Takeaway
Every third-party image in the app flows through exactly six places (three server providers, three client helpers), all of which already have a no-image fallback path, so a "names, abbreviations, colors only" build is roughly 1.5–2 person-days of code plus a day of palette data entry. Team colors today are not from any league source at all — they are a string-hash into HSL — so the colored-circle fallback is already license-free; the question is only whether to replace the hash with a curated per-team palette.

### Cited Findings
Codebase (read directly; paths repo-relative):
- Team logos are fetched server-side from ESPN's undocumented team directories (`site.api.espn.com/apis/site/v2/sports/{path}/teams`) for 16 league paths and cached 24 h; each team record is `{ l: logoHref, a: abbreviation }` — [providers/logos.js](providers/logos.js) `TEAM_SOURCES`, `getLogos()`.
- Athlete headshots (tennis, UFC) are built from ESPN scoreboard athlete IDs into `https://a.espncdn.com/i/headshots/{sport}/players/full/{id}.png`, with an ESPN-hosted country-flag URL as fallback, cached 6 h — [providers/headshots.js](providers/headshots.js).
- The history adapter also emits an ESPN `logo` href per competitor (`normalizeCompetitor` → `logo: team.logos[0].href`) — [providers/history.js](providers/history.js).
- The server exposes these at `/api/logos` and `/api/headshots` with `cache-control: public, max-age=3600` — [server.js](server.js) lines ~1161–1186.
- League shields are hard-coded ESPN CDN URLs (`https://a.espncdn.com/i/teamlogos/leagues/500/nfl.png`, `.../mlb.png`, `.../nba.png`, `.../nhl.png`, `.../wnba.png`, `.../ufc.png`, `.../fifa.png`, and `misc_logos/500/ncaa.png`) in `LEAGUE_LOGOS`; tennis/golf/boxing/CFL/EuroLeague already use in-house SVG glyphs (`SPORT_GLYPHS`) — [app.js](app.js) ~lines 630–660. `leagueIconHtml()` and `marketChipHtml()` render them with `onerror="this.remove()"`.
- Team marks: `teamMarkImg(team)` returns `""` when `team.logo` is falsy, and `scoreRow()` renders `<span class="team-mark" style="--team-color:${team.color}">${team.abbr}${teamMarkImg(team)}</span>` — so the abbreviation-on-color chip is the default and the image is an overlay — [app.js](app.js) ~lines 873–890; the same pattern is used at ~810 (hero mark) and ~922 (`team-logo`).
- `scoreGameToUiGame()` sets `logo: teamLogoEntry(...)?.l || headshotEntry(...)?.img || null`, `flag: headshotEntry(...)?.flag || null`, and `color: colorForTeam(name)` — [app.js](app.js) ~lines 1968–1998.
- `colorForTeam(teamName)` is a hash: `hsl(${hash} 66% 28%)` where hash is a char-code sum mod 360 — [app.js](app.js) ~line 2267. There is no ESPN `color`/`alternateColor` usage anywhere in the repo (grep for `alternateColor`/`teamColor` returned nothing).
- Sportsbook chips pull `https://www.google.com/s2/favicons?domain=${domain}&sz=64` inside `brandChipHtml()`; the chip already carries a text mark (`DK`, `FD`, `MGM`...) and a brand color from `BOOK_BRANDS` — [app.js](app.js) ~lines 1251–1300.
- CSS fallback: `.team-mark { background: var(--team-color, #201e19); color:#fff; ... }` — [styles.css](styles.css) line 640.
- The service worker never caches `/api/*` and only precaches first-party assets — [sw.js](sw.js).
- There is no iOS project, Capacitor config, or Xcode directory in the repo; the only iOS-specific artifacts are `apple-mobile-web-app-*` meta tags and a 180 px touch icon — [index.html](index.html) lines 13–17, [manifest.json](manifest.json).

External:
- ESPN's undocumented teams endpoint returns `color` and `alternateColor` as hex without `#`, plus default and dark logo URLs (documented by the cfbfastR wrapper for the college-football path; other leagues follow the same shape) — [cfbfastR espn_cfb_teams docs](https://rdrr.io/cran/cfbfastR/man/espn_cfb_teams.html); third-party scrapers list the same fields — [Apify ESPN scraper](https://apify.com/aurenic/espn-scraper.md).
- A community-maintained ESPN endpoint catalog states the APIs are "not officially supported and may change without notice", that "Public" describes reachability "not permission to collect, reuse, or redistribute data", and logs 2026 breakage (Site v3 NFL scoreboard 404 on 2026-09-30; MLB/NFL Site v2 scoreboards returning HTTP 400 for date ranges, workaround one day per request; NFL calendar 404; some Core `$ref` URLs on a non-public `.pvt` domain) — [pseudo-r/Public-ESPN-API](https://github.com/pseudo-r/Public-ESPN-API).
- `jimniels/teamcolors` holds NBA, NFL, MLB, NHL, MLS and EPL colors in `src/teams.json` with HEX/RGB/CMYK/Pantone; it says "All NBA colors are official" while MLS and EPL colors "are currently approximations"; the page shows no license statement and the `LICENSE` file path returned 404 on both `main` and `master` — [jimniels/teamcolors](https://github.com/jimniels/teamcolors).
- teamcolorcodes.com's disclaimer says "many of the color codes on this sites are estimations and approximations and not the 'official' team colors" and "use of the color codes included in this site are at your own discretion"; its footer says it is not affiliated with any team or league — [teamcolorcodes.com disclaimer](https://teamcolorcodes.com/disclaimer/). I could not retrieve a Terms of Use page (host blocked; search did not surface one).
- Google's `s2/favicons` endpoint is undocumented: "not publicly documented anywhere by the service providers", "no official usage guidelines or rate limits" — [Jim Nielsen, 2021](https://blog.jim-nielsen.com/2021/displaying-favicons-for-any-domain/); a competing vendor calls it "unsupported and unmaintained" with "no guaranteed uptime" — [logo.dev](https://docs.logo.dev/google-favicon-api) (vendor page, interested party).
- Apple's guideline 5.2.1: "Don't use protected third-party material such as trademarks, copyrighted works, or patented ideas in your app without permission... Apps should be submitted by the person or legal entity that owns or has licensed the intellectual property" — [App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/) (page "Last Updated: October 16, 2026").
- Developer-forum pattern: reviewers have told sports apps that a club name like "Seattle Sounders FC" would need to become just "Seattle" with team colors, and apps that removed logos but kept league-identifying terms were still rejected in some cases; one reply notes a data provider's licence "doesn't necessarily cover logo use" — [Apple Developer Forums thread 130430](https://developer.apple.com/forums/thread/130430), [thread 718427](https://developer.apple.com/forums/thread/718427), [thread 96612](https://developer.apple.com/forums/thread/96612) (community threads, reported experiences).

### Inferences
- "Names/abbreviations/colors-only mode" change list (my effort estimates):
  1. Server: add `IMAGE_MODE=none` env; `/api/logos` returns `{ leagues: {}, meta: {mode:"none"} }`, `/api/headshots` returns `{ athletes: [] }`, and `history.js` drops the `logo` field. Keep the ESPN abbreviation (`a`) — abbreviations are plain text — by having `logos.js` still fetch the directory but strip `l` (or, safer, move abbreviations into a static `data/teams.json` so no ESPN call is needed at all). **0.5 day.**
  2. Client: replace the 10 ESPN CDN entries in `LEAGUE_LOGOS` with `SPORT_GLYPHS` (in-house SVG, already exists for 5 leagues; draw 7 more generic ball/field glyphs). Do not reproduce league wordmarks or shield shapes. **0.5 day.**
  3. Client: `brandChipHtml()` drop the Google favicon `<img>`; keep the text mark + `BOOK_BRANDS` color. **0.1 day.**
  4. Client: `teamMarkImg()` short-circuit on `IMAGE_MODE` (defensive, so a stale cached `/api/logos` payload cannot leak an image). **0.1 day.**
  5. Colors: replace `colorForTeam()` hash with lookup in a new `data/teamcolors.json` (normalized team name → `{primary, secondary}`), falling back to the hash for colleges and unknown teams. ~200 rows for NFL 32 + NBA 30 + MLB 30 + NHL 32 + WNBA 13 + EPL 20 + La Liga 20 + Serie A 20. **1 day data entry + 0.3 day wiring**, if the color source is cleared by the legal persona (see Gaps).
  6. QA on phone widths, dark mode, and the hero/box-score chips. **0.5 day.**
  Total ≈ **2.5–3 person-days (~$2–2.4K)**.
- Hex color values are not "logos", and the app already ships colors without any league source; the open issue is provenance. Three options, in rising legal comfort: (a) copy `color`/`alternateColor` from ESPN's teams endpoint once into the repo (same undocumented-API exposure as the logos, and reviewers asked about "permission" not "copyright", so I would not route the fix through ESPN); (b) import from `jimniels/teamcolors` (no license found — needs the maintainer's confirmation or treat as unusable); (c) author our own palette per team (one primary + one accent, chosen to be "in the family" rather than Pantone-exact). I recommend (c) as the shipping default and keep the hash as fallback; it is one day of work and removes the provenance question entirely. Whether "close to official" colors plus city name create a trade-dress problem is for the legal persona.
- Because `scoreRow()` already renders abbreviation-on-color, the visual regression of removing images is small; the biggest UX loss is tennis/UFC headshots, which can be replaced by initials-on-flag-colored chips (no ESPN flag image).

### Gaps
- License of `jimniels/teamcolors` (LICENSE file not found at `main` or `master`; README shows none).
- teamcolorcodes.com Terms of Use text (host blocked for this session; only the disclaimer was reachable via search).
- Whether Apple's rejection text objected to team names/abbreviations as well as logos (not in the brief; drives whether abbreviations are safe).

---

## Key question 2 — Purchase-path options for the iOS build

### Takeaway
The code has exactly one purchase surface (the "Members Only" locked-picks card linking to `https://nosebleedsport.com/#offers`), so all three options are small code changes; the real cost is the native wrapper and entitlement bridge. Apple's current guideline text (updated Oct 16 2026) says external links/buttons are permitted on the **United States storefront** without an entitlement, so the fastest compliant route is "US-only storefront + link-out" or "hide the CTA", while StoreKit IAP via Capacitor + RevenueCat is the sustainable route if the app is to sell outside the US.

### Cited Findings
Codebase:
- The only purchase CTA is the locked-picks card: `<a class="pick-card pick-locked" href="https://nosebleedsport.com/#offers" target="_blank" rel="noopener">… Unlock the Warroom →</a>` — [app.js](app.js) ~lines 1724–1740. No Whop SDK, StoreKit, or entitlement code exists in the repo (grep for `whop|storekit|capacitor|cordova` returned nothing).
- Picks are served from `/api/picks` and `/api/model-picks` with free vs locked arrays decided server-side (`card.freePick`, `card.locked`) — [server.js](server.js) lines ~1130–1160, [providers/modelpicks.js](providers/modelpicks.js).

Apple (primary):
- 3.1.1: "If you want to unlock features or functionality within your app... you must use in-app purchase. Apps may not use their own mechanisms to unlock content or functionality, such as license keys..." — [App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/).
- 3.1.1(a): "Developers may apply for entitlements to provide a link in their app to a permitted destination in order to purchase digital content or services. These entitlements are not required for developers to include buttons, external links, or other calls to action in their United States storefront apps." And: "In all other storefronts, except for the United States storefront, where this prohibition does not apply, apps and their metadata may not include buttons, external links, or other calls to action that direct customers to purchasing mechanisms other than in-app purchase." — same page.
- 3.1.3(b) Multiplatform Services: "Apps that operate across multiple platforms may allow users to access content, subscriptions, or features they have acquired in your app on other platforms or your web site... provided those items are also available as in-app purchases within the app." — same page.
- 3.1.3(a) Reader apps are limited to "magazines, newspapers, books, audio, music, and video" — same page. (A picks subscription is not in that list.)
- 5.3.4: "Apps that offer real money gaming (such as sports betting...) must have necessary licensing and permissions... must be geo-restricted... and must be free on the App Store." — same page.
- Apple's US Developer Support entitlement page could not be read (landing page only), and the StoreKit External Purchase documentation page returned no body text in this session — [developer.apple.com/support/storekit-external-entitlement-us](https://developer.apple.com/support/storekit-external-entitlement-us/), [External Purchase docs](https://developer.apple.com/documentation/storekit/external-purchase).
- Litigation context (secondary): after the April 2025 contempt ruling Apple revised 3.1.1, 3.1.3 and 3.1.3(a) to carve out the US storefront — [Shibolet summary](https://www.shibolet.com/?p=20521); the Ninth Circuit "affirmed the lower court's decisions regarding message screens and dynamic links but held that the total bans on commissions and link restrictions are overbroad" and remanded the commission question — [Fenwick](https://www.fenwick.com/insights/publications/ninth-circuit-largely-upholds-ruling-in-epic-v-apple); Apple had earlier demanded a 27% commission on linked-out purchases — [Engadget](https://www.engadget.com/epic-accuses-apple-of-flouting-court-order-by-charging-for-external-links-on-ios-apps-070036198.html).

Vendors:
- Whop ships an iOS `WhopCheckout` SDK: an API key limited to `iap:read` "is meant for client-side use"; membership status is checked in-app with `isSubscribed` / `hasAccess(to:)`; "all standard Whop webhooks are sent for purchases made through the SDK, including membership.went_valid and membership.went_invalid"; "For StoreKit purchases outside the US, the membership value is nil initially" so the docs say to rely on `isSubscribed` — [Whop iOS checkout overview](https://docs.whop.com/developer/guides/ios/checkout/overview), [setup](https://docs.whop.com/developer/guides/ios/checkout/setup), [checkout reference](https://docs.whop.com/developer/guides/ios/checkout-reference). An older "WhopIAP" page says the SDK is "coming soon" and describes a backend-issued `iap:client` token — [Whop IAP overview](https://docs.whop.com/developer/guides/ios/iap/overview) (the two generations conflict on fees: 2.7% + $0.30 vs 2.9% + $0.30).
- RevenueCat pricing: "charges nothing until monthly tracked revenue (MTR) passes $2.5K, then takes 1%"; MTR counts all purchases and renewals — [RevenueCat pricing](https://www.revenuecat.com/pricing/), [account management docs](https://www.revenuecat.com/docs/welcome/set-up-revenuecat/account-management.md). RevenueCat markets "a unified backend for in-app purchases and web billing across iOS, Android, and the web" — [freetier.co listing](https://freetier.co/directory/products/revenuecat) (secondary).
- Paddle: hosted checkout for iOS "opens in Safari and redirects users back to the app after purchase", "requires additional approval to use on live accounts"; a custom external-purchase route is "currently described as available to users in the United States, following recent App Store legislation"; Paddle's May 2025 changelog pairs hosted checkouts with "RevenueCat for fulfillment" — [Paddle link-out hosted checkout](https://developer.paddle.com/build/mobile-apps/link-out-mobile-app-hosted-checkout-app), [custom workflow](https://developer.paddle.com/build/mobile-apps/link-out-mobile-app-custom-workflow), [changelog](https://development-docs.paddle.dev/changelog/2025/add-mobile-hosted-checkouts-ios-apps).

### Inferences
- Why the current build was rejected is consistent with the text: the app links to an external checkout and is (presumably) available in non-US storefronts, where 3.1.1 prohibits any call-to-action to outside purchase; and even in the US, the locked card implies features unlocked by an external mechanism with no IAP alternative (3.1.1 "license keys" language; 3.1.3(b) requires the item to also be available as IAP).
- Option 1 — StoreKit 2 via Capacitor + RevenueCat + Whop bridge. Pieces: `@revenuecat/purchases-capacitor` with one auto-renewing product ("Betting Pass"); app-side login (email/magic link) producing a stable App User ID; server webhook receiver for RevenueCat and Whop (`membership.went_valid/invalid`) writing a single `entitlements` table; `/api/picks` reads entitlement from the bearer token and returns the full card to entitled users (today locked picks never leave the server, which is the right shape). Effort: **8–12 person-days** (Capacitor shell 2–3, IAP + paywall screen 2–3, auth + entitlement service + webhooks 3–4, App Store Connect products/sandbox/review notes 1–2) ≈ $6.4–9.6K. Ongoing: RevenueCat free under $2.5K MTR, Apple 15–30% on IAP (standard terms; not re-verified this session), plus Whop fees on web.
- Option 2 — US external-purchase link. Per the current 3.1.1(a) wording the entitlement is "not required" in the US storefront, but the app must then be **US-storefront-only** or must hide the CTA when `Storefront.current.countryCode != "US"` (needs a tiny native plugin or `@capacitor-community` StoreKit shim). The disclosure sheet, link format, and reporting duties come from the entitlement program, which I could not read this session (Gaps); the Whop docs' remark that non-US purchases go through StoreKit suggests Whop itself treats external checkout as US-only. Effort: **4–6 person-days** (Capacitor shell 2–3, storefront gate + link handling 1, review notes/legal copy 1), but with litigation risk that Apple's commission terms on linked-out sales change on remand.
- Option 3 — remove the CTA in iOS ("reader-style" without claiming reader status). Hide `pick-locked` when running in the wrapper (`Capacitor.isNativePlatform()` or a `?platform=ios` build flag), show "Full card available to members" with no link, and let Whop subscribers log in (3.1.3(b) does *not* strictly permit this without an IAP equivalent, so safest is: no login-gated content at all in v1, or login that only unlocks content that is also sold via IAP later). Effort: **2–3 person-days** on top of the shell. This is the fastest unblock; it forfeits iOS conversions.
- Recommendation: ship Option 3 for the resubmission (or Option 2 if business insists on a US link-out and accepts US-only distribution), then build Option 1 behind it, because 3.1.3(b) lets web-purchased Whop members use the app only once the same item exists as IAP.
- 5.3.4 watch-out: the app deep-links to 13 sportsbooks (`BOOK_LINKS`) and names a "Betting Pass"; it does not take wagers, but the Apple-policy persona should pre-empt a 5.3.4 query in the review notes.

### Gaps
- The exact US External Purchase Link entitlement requirements (disclosure sheet copy, link limits, Info.plist keys, monthly reporting, current commission) — Apple pages returned no body text and search budget was exhausted; the Ninth Circuit remand outcome as of Oct 2026 is unknown.
- Whop's server-side membership validation endpoint (not found in search results; Whop docs host blocked).
- RevenueCat Web Billing → iOS entitlement sync mechanics (docs host blocked); known only from marketing copy.

---

## Key question 3 — Wrapper reality: Capacitor vs no-code wrapper, and what reviewers expect under 4.2

### Takeaway
A sports-scores PWA in a bare WKWebView is the canonical 4.2 rejection profile; Capacitor is the practical choice because it is the same WebView with a native plugin layer (push, local notifications, haptics, share, StoreKit) that lets the app demonstrate "app-like" features, and the free no-code path (PWABuilder iOS) was archived in Sept 2025.

### Cited Findings
- 4.2: "Your app should include features, content, and UI that elevate it beyond a repackaged website. If your app is not particularly useful, unique, or 'app-like,' it doesn't belong on the App Store." 4.2.2: "Other than catalogs, apps shouldn't primarily be marketing materials, advertisements, web clippings, content aggregators, or a collection of links." — [App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/).
- Reviewer template language reported by developers: iOS features such as push notifications, Core Location, and sharing "do not provide a robust enough experience" on their own; one developer with eight native features still received a generic 4.2.2 rejection — [Apple Developer Forums thread 835821](https://origin-devforums.apple.com/forums/thread/835821), [thread 806726](https://developer.apple.com/forums/thread/806726) (community reports).
- Median/GoNative's own guidance: webview apps "are allowed on the App Store, but they must meet Apple's 'Minimum Functionality' guidelines" and should add "iOS integration, offline capabilities, or other functionality beyond a standard web browser" — [GoNative blog](https://GoNative.Io/blog/will-apple-approve-my-webview-app) (vendor). Ionic forum thread asks whether a webview-only app "is always to be rejected" — [Ionic forum](https://forum.ionicframework.com/t/app-only-functioning-webview-is-always-to-be-rejected-on-ios-appstore/179828).
- PWABuilder's iOS platform "generates an iOS app that loads your PWA in a WKWebView"; "This repository was archived by the owner on Sep 11, 2025" and "there will not be devs from the PWABuilder team maintaining and building out iOS functionality" — [pwa-builder/pwabuilder-ios](https://github.com/pwa-builder/pwabuilder-ios).
- Capacitor: "lets you run web apps natively on iOS, Android, Web, and more with a single codebase and cross-platform APIs"; MIT licensed; plugins "can be written inside Capacitor apps or packaged into an npm dependency" — [ionic-team/capacitor](https://github.com/ionic-team/capacitor).
- Capacitor push setup (third-party guides, official docs host blocked): `npm install @capacitor/push-notifications`, enable Push Notifications (and Background Modes) in Xcode Signing & Capabilities, create an APNs auth key in the developer portal, then `requestPermissions()` / `register()` / `addListener('registration')` — [Capawesome push guide](https://capawesome.io/blog/the-push-notifications-guide-for-capacitor), [Capgo skill guide](https://skills.cat/skills/cap-go/capgo-skills/capacitor-push-notifications), [DZone walkthrough](https://dzone.com/articles/setting-up-push-notifications-in-ionic-capacitor-f).
- Codebase: the PWA already has an installable manifest and a network-first service worker with offline shell fallback — [manifest.json](manifest.json), [sw.js](sw.js); the client re-polls five endpoints every 30 s via `syncProviderData()` on a `setInterval(..., 30000)` — [app.js](app.js) ~lines 2522–2535 and ~2600–2608.

### Inferences
- Minimum native feature set I would put in front of a reviewer for a scores app (all deliverable with Capacitor community/official plugins): (1) push notifications for followed games (the app already has a `Follow` button and `state.following`; needs a server-side APNs sender keyed on `/api/scores` transitions to final/score change), (2) local notification 15 min before a followed game, (3) native share sheet on a game card, (4) haptics on score change, (5) iOS widget showing followed games (WidgetKit requires a small Swift target; defer to v2), (6) offline last-known scoreboard (service worker already does the shell; add an API snapshot in `localStorage`). Items 1–4 and 6: **4–6 person-days**; widget: **3–4 days** extra.
- No-code wrappers (Median) are a paid service with the same WKWebView core; they do not change what the reviewer sees and add vendor lock-in; PWABuilder iOS is unmaintained. Capacitor is a `npm i @capacitor/core @capacitor/ios && npx cap add ios` over the existing static files, with `server.url` pointed at the deployed origin (or bundled assets + remote API). Note that pointing the wrapper at a remote URL means the app is literally a remote website — bundle `index.html/app.js/styles.css` locally and call the API over HTTPS to look less like 4.2.2.
- Apple's reviewer also sees the ESPN-hosted images loading over the network; bundling first-party glyphs makes the "names/colors" mode and the 4.2 story consistent.

### Gaps
- No documented case of a Median/GoNative or PWABuilder sports-scores app passing or failing 4.2 (only generic threads were found).
- Official Capacitor iOS docs (Xcode/iOS minimums for the current major) were unreachable; version not verified.

---

## Key question 4 — Provider-by-provider assessment (ToS status, coverage, effort against the adapter seam)

### Takeaway
The existing normalized seam (`/api/scores`, `/api/odds`, `/api/linescores`, `/api/boxscore`, `/api/history`) makes each provider swap a 1–3 day adapter job, but no single affordable provider covers all 14 sports with live scores, and the two "free" sources (ESPN undocumented JSON, official league endpoints) are explicitly not licensed for commercial use. Soccer is cheap and well served (Sportmonks Starter / API-Football); golf, tennis, F1 and UFC are the expensive tail.

### Cited Findings
Codebase (what each adapter needs today):
- The Odds API is the only source for `/api/scores` and `/api/odds`; sports keys are enumerated from the free `/v4/sports` catalog ("only returns in-season sports, so it doubles as an 'is this league active right now' filter"); tennis and golf are prefix-enumerated (`tennis_*`, `golf_*`), golf is outrights-only and skipped for scores; **there is no F1 key in `LEAGUE_SPORTS`** — [server.js](server.js) lines 28–57, 113–165, 270–345.
- ESPN undocumented JSON feeds `/api/linescores` (16 scoreboard paths every 45 s, not season-gated), `/api/boxscore` (scoreboard lookup across 3 dates + summary), `/api/history` (11 paths incl. `golf/pga`, `tennis/atp`, `racing/f1`, cached 15 min), logos, headshots, and the dormant `providers/news.js` — [providers/linescores.js](providers/linescores.js), [server.js](server.js) ~640–700, [providers/history.js](providers/history.js), [providers/news.js](providers/news.js).
- Polymarket Gamma and Kalshi are on-demand per selected game — [server.js](server.js) ~1214–1237, [providers/kalshi.js](providers/kalshi.js).
- The README already records the intended policy: "Production launch should replace the ESPN fallback with a licensed provider"; "do not build UI directly against ESPN, SportsDataIO, Sportradar, The Odds API, or Polymarket response shapes" — [README.md](README.md).

The Odds API:
- Free "Starter" plan is "500 credits per month, not 500 requests"; "cost of a live odds call as markets multiplied by regions, and historical calls as 10 times that" — [OddsPapi blog](https://oddspapi.io/blog/?p=2967) (competitor; interested party). Sports and events endpoints are free — [OddsPapi blog](https://oddspapi.io/blog/wp-json/wp/v2/posts/3128) (competitor).
- Scores: `daysFrom` "must be an integer greater than or equal to 1, and less the maximum specified in the docs" — [The Odds API error codes](https://the-odds-api.com/liveapi/guides/v4/api-error-codes.html); scores "update approximately every 30 seconds" — [Metorial integration page](https://metorial.com/integrations/the-odds-api) (secondary).
- Paid tier prices, the scores endpoint's credit cost, and which sports lack scores: **not sourced** (official host blocked; search budget exhausted). See Gaps.

SportsDataIO:
- Free trial is "scrambled but structurally identical data", values "randomly adjusted up or down between 5% and 20%"; "scores and game stats are scrambled, while schedules, teams, and players are not"; Replay "is free to use forever and plays back real API output"; production keys are sales-led ("our sales team can provide a production key"); the Dev Key is "provided only for integration testing toward a commercial agreement" — [SportsDataIO getting started](https://sportsdata.io/developers/getting-started), [scrambled data help](https://sportsdata.io/help/scrambled-data), [free trial](https://sportsdata.io/free-trial?sport=mlb). Its free tier "is not licensed for commercial redistribution"; commercial licences are "quoted per client based on leagues and competitions required, feeds require, and the use case" — [SportsDataIO data rights](https://sportsdata.io/help/data-rights-and-licensing-questions).
- Third-party review lists a "Discovery Lab" tier at "$99 to $149/month ($599 to $899/year). Real data with next-day delays, covering 8 sports" — [sportsapis.dev review](https://sportsapis.dev/apis/sportsdata-io) (unverified, and next-day data is useless for live scores).

API-Sports (API-Football family):
- RapidAPI listings: API-Basketball Free 100 req/day, Pro $10/mo 7,500/day, Ultra $15 75,000/day, Mega $20 150,000/day; API-NBA Free 100/day, Pro $15 5,000/day, Ultra $25 20,000/day, Mega $35 50,000/day; API-American-Football Free 100/day, Pro $15 7,500/day, Ultra $25 75,000/day, Mega $35 150,000/day — [RapidAPI api-basketball](https://rapidapi.com/it/api-sports/api/api-basketball/pricing), [api-nba](https://rapidapi.com/de/api-sports/api/api-nba/pricing), [api-american-football](https://rapidapi.com/it/api-sports/api/api-american-football/pricing). Direct api-sports.io pricing, F1/MMA coverage, and ToS on betting use: not sourced (host blocked).

Sportmonks:
- Current league-based tiers: Starter €29/mo (€24 yearly) for 5 leagues; Growth €99/mo (€79) for 30; Pro €249/mo (€199) for 120; Enterprise custom for 2,300+ — [Sportmonks plans](https://www.sportmonks.com/football-api/plans-pricing); a March-2026 third-party comparison repeats the same figures — [thestatsapi](https://thestatsapi.com/blog/thestatsapi-vs-sportmonks). Older European (€39) / Worldwide (€129) plans appear on an older page — [Sportmonks developers page](https://www.sportmonks.com/football-apis-for-developers/). Add-ons (odds, xG, extra calls) priced separately per the comparison site. F1 product and logo rights: not sourced.

Goalserve:
- NFL/NCAA live plan $300/month ($1,500/6 mo, $1,200/12 mo on sale); NBA/NCAA live plan $250/month ($900/6 mo, $1,500/12 mo); Basketball live-score tier $150/month — [Goalserve NFL prices](https://www.goalserve.com/sport-data-feeds/nfl-api/prices), [NBA prices](https://www.goalserve.com/sport-data-feeds/nba-api/prices). 30-day free trial on request via support@goalserve.com with "unrestricted access to the full feed" — [Goalserve blog](https://goalserve.com/en/blog/back-of-the-net-score-with-the-game-changing-goalserve-soccer-api). Soccer covers "400+ leagues" with pregame and in-play odds; a Spanish pricing page shows "$1500" tied to "full package subscription" with no period stated — [Goalserve soccer prices (es)](https://goalserve.com/es/sport-data-feeds/soccer-api/prices).

Sportradar:
- Trial keys: "30 days, 1,000 total calls, and 1 query per second"; "each trial key is specific to a single sport"; trial data is not throttled; push feeds, Statcast and Probabilities are sales-only — [Sportradar blog](https://sportradar.com/content-hub/blog/best-practices-for-integrating-sportradars-sports-data-apis/), [golf FAQ](https://developer.sportradar.com/golf/v2/docs/faqs), [tennis FAQ](https://developer.sportradar.com/tennis/v2/docs/faqs). Production pricing is not public.

OpticOdds:
- "Optic Odds does not publish pricing"; "pricing starts at approximately $5,000 per month" per community reports; push via WebSocket/SSE — [SharpAPI comparison](https://sharpapi.io/compare/live-odds-data-feed), [SportsGameOdds comparison](https://sportsgameodds.com/blog/optic-odds-vs-sports-game-odds) (competitors; unverified).

balldontlie:
- ALL-STAR $9.99/mo, 60 req/min; GOAT $39.99/mo, 600 req/min; box scores, lineups, standings, odds, props, play-by-play require GOAT; tiers are **per sport** ("NBA and NCAAB at the GOAT level would cost $79.98 per month"); All-Access price conflicts across sources ($159.99 / $299.99 / $499.99) — [StackOne guide](https://docs.stackone.com/connectors/balldontlie/guides/link-account/api-key), [Highlightly review](https://highlightly.net/blogs/best-nba-apis-in-2026), [SportIntel doc](https://glama.ai/mcp/servers/@roizenlabs/sportintel-mcp/blob/f8a45ddbbee2feb94796eb7a42efcac559a0b05b/docs/deployment/CONFIGURE_API_KEY.md) (last is a personal setup note).

MySportsFeeds: "has not published pricing information" — [Datarade](https://datarade.ai/data-providers/mysportsfeeds/profile).

Tank01 (RapidAPI): used via the `tank01-nfl-live-in-game-real-time-statistics-nfl` host by an open-source project that caches weekly "to manage API cost" — [wzinkann/NFL_data](https://github.com/wzinkann/NFL_data); pricing tiers not found.

Official league endpoints:
- MLB Stats API notice (quoted second-hand): "Only individual, non-commercial, non-bulk use of the Materials is permitted and any other use of the Materials is prohibited without prior written authorization from MLBAM" — [Hacker News quote](https://home5.southeastasia.cloudapp.azure.com/item?id=675864), [gameday_api gem docs](https://www.rubydoc.info/gems/gameday_api/0.5.3); python-mlb-statsapi: "This is an educational project - Not for commercial use" — [python-mlb-statsapi wiki](https://github.com/zero-sum-seattle/python-mlb-statsapi/wiki).
- NHL `api-web.nhle.com`: "the undocumented public JSON service behind NHL.com", "no stability guarantee", wrappers "not affiliated with or endorsed by the National Hockey League" — [Apify NHL listing](https://apify.com/retrainmap/nhl-stats), [nhl.api on NuGet](https://www.nuget.org/packages/nhl.api). Terms text not found.
- NBA `stats.nba.com`: nba_api is MIT for the client only and "NBA.com has a Terms of Use regarding the use of the NBA's digital platforms"; "NBA.com does not provide information regarding new, changed, or removed endpoints" — [nba_api on PyPI](https://pypi.org/project/nba_api). Terms text not found.

ESPN:
- "ESPN's unofficial, public, unauthenticated data API"; "ESPN doesn't publish API docs"; "ESPN doesn't publish a hard limit" — [Apify ESPN API scraper](https://apify.com/rl1987/espn-api-scraper), [Apify ESPN scraper](https://apify.com/aurenic/espn-scraper); "no guarantee of long-term stability or support" — [Zuplo guide](https://zuplo.com/blog/2024/10/01/espn-hidden-api-guide); ESPN closed its official public API in 2014 — [App Developer Magazine](https://appdevelopermagazine.com/The%20World%20Wide%20Leader%20in%20Sports%20Leaves%20Developers%20in%20a%20World%20of%20Hurt%20as%20ESPN%20Closes%20Public%20API/). 2026 breakage log (v3 404s, v2 date-range 400s, `.pvt` refs) — [Public-ESPN-API](https://github.com/pseudo-r/Public-ESPN-API). The Disney/ESPN Terms of Use page was unreachable this session.

### Inferences
- Integration effort per provider against the current seam (my estimates, person-days): The Odds API: 0 (in place). Sportmonks football (scores, line events, fixtures) → `/api/scores|linescores|boxscore` for SOCCER: **2–3**. API-Football: **2–3** (same shape of work). balldontlie per sport (NBA/NFL/MLB/NHL/EPL) → scores + box scores: **3–4** for all five, because it is one API style. Goalserve XML/JSON per sport: **2 per sport** (different schemas per sport). SportsDataIO: **3–5** for the big-4 + NCAA once a contract exists (consistent schema family, good docs). Sportradar: **4–6** (per-sport APIs, trial-only until contract). Official MLB/NHL/NBA endpoints: **1–2 each** but not usable commercially without written permission (MLB notice is explicit). ESPN: already built; the compliance fix is removal, not integration.
- Recommended mapping:
  - **LEAN (near-zero cost, "tolerated-risk" tier, not fully ToS-clean):** NFL/NBA/MLB/NHL/NCAAF/NCAAB/WNBA/EPL/La Liga/Serie A/UFC/WTA scores+odds → The Odds API (lowest paid tier that fits the volume in Q5; the free 500-credit plan cannot sustain live polling); clocks/line scores/box scores → ESPN undocumented, server-side only, season-gated, ≥60 s TTL, with a per-league circuit breaker; PGA → The Odds API outrights for odds only, no leaderboard; F1 → no live source (ESPN `racing/f1` exists in `history.js` only). ToS flag: the ESPN leg is unlicensed and the README itself says so; treat it as a dated bridge with an exit date.
  - **MID (paid unofficial feeds, ~$150–450/mo order of magnitude at published prices, with the big-4 as the swing item):** soccer (EPL/La Liga/Serie A + 2 spare leagues) → Sportmonks Starter €29/mo or API-Football; NBA/NFL/MLB/NHL/EPL box scores → balldontlie GOAT at $39.99 per sport (four sports ≈ $160/mo) or an All-Access plan (price unverified), or Goalserve per-sport plans ($250–300/mo each, more expensive); NCAAF/NCAAB/WNBA → stay on The Odds API + ESPN until SportsDataIO or Goalserve quotes come back; odds → The Odds API (OpticOdds is ~10x too expensive); PGA/WTA/F1/UFC → Sportradar single-sport trials to validate the adapters, then a quote, because no self-serve provider with published pricing for those four was confirmed this session.
  - **Direct small-league deals:** not an engineering question, but note that each league's own API (MLB Stats API, NHL api-web, NBA stats) is the best data at zero marginal cost *if* written permission exists — the adapters are 1–2 days each.
- Hard rule for all scenarios: keep every provider behind `server.js`, keep the normalized `games[]`/`events[]` shapes, and never expose provider keys (already true).

### Gaps
- The Odds API paid tiers, the scores endpoint's credit cost, max `daysFrom`, and the list of sports with scores (official docs unreachable; the only sourced number is the free tier's 500 credits/month from a competitor).
- API-Sports direct pricing, Formula-1 and MMA coverage, and the ToS clause on betting/odds use.
- Sportmonks F1 product, logo/image licensing terms, and add-on prices.
- Goalserve soccer and all-sports bundle monthly prices.
- Sportradar, SportsDataIO, MySportsFeeds, OpticOdds production pricing (all sales-led).
- Tank01 RapidAPI tiers.
- Text of ESPN/Disney, NBA.com and NHL.com terms (hosts blocked; only second-hand characterizations found).

---

## Key question 5 — Request-volume model and push/websocket costs

### Takeaway
Because the server caches per URL for 60 s and the client polls every 30 s, upstream volume is a function of in-season sport keys and TTL only, not users: at the current 60 s TTL the naive fan-out is ~0.9M calls/≈1.8M credits per month to The Odds API on average and ~2.5M credits in a peak month (Oct–Nov), plus ~0.9M ESPN scoreboard calls per month — and simple gating (scores only while games are live, odds every 5 min, h2h-only in the list) cuts the peak month to ~0.26–0.52M credits.

### Cited Findings
Codebase:
- Client polls `/api/scores?sport=All&daysFrom=3`, `/api/odds?sport=All`, `/api/news`, `/api/linescores`, `/api/model-picks` every 30 s — [app.js](app.js) `API_CONFIG` lines 1–14, `syncProviderData()` ~2522, `setInterval(..., 30000)` ~2600.
- Server cache: `CACHE_TTL_MS = ODDS_CACHE_TTL_MS || 60000`, keyed by full URL, used for scores/odds/boxscore/polymarket — [server.js](server.js) lines 26, 167–183. `sport=All` fans out to every league in `LEAGUE_SPORTS` filtered by the hourly-cached `/v4/sports` catalog; odds requests `markets=h2h,spreads,totals`, `regions=us` (outrights for golf); scores request `daysFrom=3` — [server.js](server.js) 113–165, 190–270, 270–345.
- ESPN line scores: 16 scoreboard paths, 45 s TTL, **not** filtered by season — [providers/linescores.js](providers/linescores.js). History: 11 paths, 15 min TTL — [providers/history.js](providers/history.js). Logos: 16 paths / 24 h; headshots: 3 paths / 6 h.
- The Odds API usage headers `x-requests-remaining` / `x-requests-used` are already captured into `meta.usage` on every call — [server.js](server.js) ~221–226, 308–313.

External:
- Odds call cost = markets × regions; scores update ~every 30 s; `/sports` is free — [OddsPapi](https://oddspapi.io/blog/?p=2967) (competitor), [Metorial](https://metorial.com/integrations/the-odds-api), [OddsPapi](https://oddspapi.io/blog/wp-json/wp/v2/posts/3128).
- Sportradar push feeds are sales-only; OpticOdds push ≈ $5K/mo reported — see Q4 citations.

### Inferences
Model (30-day month; all season lengths and live-hours are my estimates; "credits" assumes 1 credit per scores call and 3 per odds call (3 markets × 1 region); if scores with `daysFrom` cost 2 credits, double the scores lines):

Season assumptions (months in season → concurrent Odds API keys): NFL 5, NBA 8, MLB 7, NHL 8, EPL 10, La Liga 10, Serie A 10, UFC 12, WTA ~3 concurrent tournament keys × 11, NCAAF 5, NCAAB 6, WNBA 5; golf 1–2 outright keys × 9 (odds only); F1 none (no key). Sum = 119 key-months → **~10 concurrent keys on average, ~14 in a peak month**.

| Cache TTL | Calls per key-month | Credits per key-month (scores 1 + odds 3) | Avg month calls / credits (10 keys + golf) | Peak month calls / credits (14 keys + golf) |
|---|---|---|---|---|
| 10 s | 259,200 | 1,036,800 | 5.40M / 10.5M | 7.52M / 14.8M |
| 30 s | 86,400 | 345,600 | 1.80M / 3.51M | 2.51M / 4.92M |
| 60 s (current) | 43,200 | 172,800 | 0.90M / 1.76M | 1.25M / 2.46M |

Live-gated model, peak month (scores at 60 s only while any game in that key is in progress; odds every 5 min; live-hours/day estimates NFL 2.3, NBA 5, MLB 8, NHL 5, each soccer league 3, UFC 1, WTA 10 per key × 3, NCAAF 2.5, NCAAB 8, WNBA 4):
- Scores ≈ **135K credits** (≈270K if scores cost 2).
- Odds, all 3 markets every 5 min, 15 keys ≈ **389K**; h2h-only in the list view with spreads/totals fetched on game selection ≈ **130K**.
- Peak-month total ≈ **525K (full odds) / 265K (h2h list + on-demand)** versus 2.46M naive. Both are built with ~2 days of scheduler work in `server.js` (a per-key "next poll at" map driven by `commence_time` and `completed` flags already present in the normalized payload).

ESPN (free but unlicensed): current 16 paths / 45 s ≈ **921,600 calls/month** regardless of season; season-gating to ~8 paths at 60 s ≈ 345,600; live-gating ≈ 135K. The unfiltered 45 s hammering is the single most likely thing to earn a block from ESPN's CDN and should be fixed even in LEAN.

Mapping to tiers: only the free tier (500 credits/month) is sourced, and it is ~3 orders of magnitude short of any live-polling design; the paid plan that fits must be read off the-odds-api.com (Gaps). For balldontlie, GOAT's 600 req/min (36K/hour) comfortably covers the live-gated model for one sport; ALL-STAR's 60/min does not cover a 14-game NBA night with per-game box-score polling. API-Sports Pro tiers (5,000–7,500/day) cover a 60 s live-gated single sport (NBA peak ~5 h × 60 = 300 scoreboard calls/day plus per-game detail) but not the naive 1,440/day/key × markets pattern if odds are taken from them.

Push/websocket:
- Client side: replacing the 30 s poll with Server-Sent Events from `server.js` (one broadcast per cache refresh) is **2–3 person-days** and does not change upstream volume; it removes 5 HTTP round-trips per client per 30 s and lets the mobile app show "live" updates within a second of the cache refresh. A single Node process on a $20–50/month VPS (estimate) handles thousands of idle SSE connections; horizontal scale needs Redis pub/sub (+2 days).
- Upstream side: true push requires a provider push feed. Sportradar push is sales-only (price unknown), OpticOdds is reported ≈$5K/mo; neither fits the budget, so upstream stays polled. The 30 s score cadence of The Odds API means a 60 s cache is already within 2x of source latency.

### Gaps
- The Odds API paid-tier quotas/prices and exact scores credit cost (needed to put a dollar figure on the table above).
- Whether The Odds API has scores for every key we use (soccer/tennis/MMA scores coverage is asserted by the catalog's `has_outrights` flags only).
- Real games-per-day and live-hour distributions (used estimates; the server's `meta.usage` headers can replace them with observed numbers after one week in production).

---

## Key question 6 — Build cost per scenario

### Takeaway
Scenario A (unblock) is roughly two person-weeks including the Capacitor shell; Scenario B adds about three person-weeks of adapters and billing; Scenario C adds another two to three weeks of refactoring for provider-agnostic IDs, entitlements and push, for ~$30K at the stated contractor rate.

### Cited Findings
- All effort inputs are derived from the code paths cited in Q1–Q5 (single purchase CTA; six image code paths; one cache map; per-provider adapters in `providers/*.js`; no native project) — [server.js](server.js), [app.js](app.js), [providers/](providers/logos.js), [README.md](README.md).
- Pricing anchors used for run-rate lines: Sportmonks Starter €29/mo — [Sportmonks](https://www.sportmonks.com/football-api/plans-pricing); balldontlie GOAT $39.99/sport — [StackOne](https://docs.stackone.com/connectors/balldontlie/guides/link-account/api-key); Goalserve NFL $300 / NBA $250 per month — [Goalserve](https://www.goalserve.com/sport-data-feeds/nfl-api/prices); RevenueCat 1% above $2.5K MTR — [RevenueCat](https://www.revenuecat.com/pricing/); Sportradar trial limits — [Sportradar](https://sportradar.com/content-hub/blog/best-practices-for-integrating-sportradars-sports-data-apis/).

### Inferences
Rate assumption: $800/person-day (US-remote senior contractor, $100/h). All figures are estimates.

**Scenario A — LEAN unblock (names/colors UI + keep current feeds, compliant on the Apple side, ESPN leg tolerated with an exit date):**
| Item | Person-days |
|---|---|
| Image-free mode (server flags, glyphs, favicon removal, headshot removal, history `logo` strip) | 1.5 |
| Own team-color palette (`data/teamcolors.json`, ~200 teams) + wiring | 1.3 |
| Purchase CTA: hide in iOS build (Option 3) or US-storefront gate (Option 2) | 1–2 |
| Capacitor iOS shell, bundled assets, icons/splash, privacy manifest, ATT answers | 2–3 |
| Push notifications for followed games (APNs key, plugin, server sender on score/final transitions) + local pre-game reminder + share/haptics | 4–6 |
| Season-gate and 60 s TTL on ESPN line scores; live-gated scheduler for Odds API | 2 |
| App Store Connect metadata, review notes (logos removed, no gambling, external-link position), TestFlight, resubmission | 1 |
| QA on devices, regression on web PWA | 1.5 |
| **Total** | **14.5–18.5 days ≈ $11.6–14.8K** |
Run-rate: The Odds API paid tier (unknown price), hosting ~$20–50/mo.

**Scenario B — MID (paid feeds + logo add-ons where lawful + direct small-league deals), on top of A:**
| Item | Person-days |
|---|---|
| Sportmonks or API-Football adapter (soccer scores, clocks, line events, box data) | 2–3 |
| balldontlie adapters for NBA/NFL/MLB/NHL (+EPL optional) scores/box scores/standings | 3–4 |
| Goalserve or SportsDataIO adapter for NCAAF/NCAAB/WNBA once quoted | 2–3 per provider |
| Sportradar single-sport trial adapters for PGA, WTA, F1, UFC (validate, then quote) | 4–6 |
| Logo add-on plumbing (only if a provider's licence covers in-app display): re-enable `teamMarkImg` from a licensed CDN with per-league allowlist | 1 |
| IAP: Capacitor + RevenueCat + paywall + server entitlement + Whop webhook bridge (Option 1) | 8–12 |
| Provider failover/circuit breaker per league and `meta.usage`-driven throttling dashboard in `admin.html` | 2 |
| **Total** | **22–31 days ≈ $17.6–24.8K** (cumulative with A: ~$29–40K) |
Run-rate at published prices: Sportmonks €29 + balldontlie 4 × $39.99 ≈ $160 + The Odds API tier + any Goalserve ($250–300/sport) or SportsDataIO quote; tennis/golf/F1/UFC feeds unpriced.

**Scenario C — B + restructuring for "official later":**
| Item | Person-days |
|---|---|
| Canonical game/team/player ID layer (internal IDs with provider ID maps) so a league-official feed can be swapped in without UI changes; today matching is by team name + start time (`findEspnEventId`, `eventMatchesTeams`, `normalizeTeamKey`) | 4–5 |
| Persistent store (SQLite/Postgres) for snapshots, entitlements, device tokens, picks grading (today `lib/snapshots` is file/memory) | 3–4 |
| SSE live channel to clients; Redis pub/sub if multi-instance | 2–4 |
| Asset pipeline for licensed marks (per-league feature flags, CDN, cache-busting) | 1–2 |
| Compliance toggles per storefront (image mode, purchase mode, book links) driven by remote config | 1–2 |
| WidgetKit followed-games widget (Swift target) | 3–4 |
| **Total** | **14–21 days ≈ $11.2–16.8K** (cumulative A+B+C: ~$40–57K) |

Sequencing I would actually run: A in week 1–2 (resubmit at the end of week 2), the live-gated scheduler and SSE in week 3 (cuts cost before paid feeds land), then B's soccer + balldontlie adapters in weeks 3–5 while sales quotes come back, IAP in weeks 5–7, C opportunistically after.

### Gaps
- Rates and effort are estimates with no external benchmark sourced; Apple IAP commission (15% vs 30%) and Whop/RevenueCat net effect on margin were not re-verified this session.
- Whether any paid provider's licence covers *in-app display of team logos* (Sportmonks/SportsDataIO image terms unread) — this decides whether "logo add-ons where lawful" in B is a real line item.
