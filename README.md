# Nosebleed Live

Single-page sports app prototype for Nosebleed Sports. It combines live scores, gamecast updates, box scores, odds, picks tracking, news, watchlists, and mobile-first navigation.

## Run

For mocked data only, open `index.html` directly in a browser.

For live odds, run the local proxy server so the API key stays out of the browser:

```powershell
$env:ODDS_API_KEY="your_odds_api_key_here"
& "C:\Users\Administrator\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe" .\server.js
```

## Data Hooks

The scoreboard and game center now attempt to load provider scores through `server.js`, merge them with live odds, and fall back to mocks if the proxy is unavailable. News, picks, play-by-play, and player box scores still use prototype data until those systems are connected.

The integration seam is `API_CONFIG` near the top of `app.js`:

```js
const API_CONFIG = {
  scores: "/api/scores?sport=All",
  odds: "/api/odds?sport=All",
  picks: "/api/picks",
  news: "/api/news",
};
```

Implemented local proxy endpoints:

- `GET /api/health` checks whether the odds key is configured.
- `GET /api/odds?sport=MLB` returns normalized The Odds API prices for moneyline, spread, and total markets.
- `GET /api/scores?sport=MLB` returns normalized score/game status data from The Odds API.
- `GET /api/boxscore?league=MLB&awayTeam=Chicago%20White%20Sox&homeTeam=Baltimore%20Orioles&commenceTime=...` returns normalized player box-score groups from ESPN's undocumented JSON summary endpoint for MVP testing.
- `GET /api/polymarket?league=MLB&awayTeam=Pittsburgh%20Pirates&homeTeam=Philadelphia%20Phillies&commenceTime=...` returns a matching Polymarket moneyline-style prediction market from the public Gamma API.

Score sync behavior:

- The frontend calls `GET /api/scores?sport=All&daysFrom=1` and `GET /api/odds?sport=All`.
- Synced games are sorted live first, upcoming second, recent finals last.
- The app refreshes provider score/odds data every 30 seconds while open.
- The Odds API score feed provides team scores/status, not full ESPN-style player box scores, clock detail, or play-by-play.

Box-score behavior:

- The Box Score tab requests player stats on demand for provider-synced games.
- The local proxy maps the selected league/teams/start time to an ESPN event ID, then normalizes the ESPN summary box score.
- This is an MVP/testing adapter, not the recommended production data source.
- For launch, use a licensed provider such as SportsDataIO or Sportradar for player box scores, IDs, usage rights, support, and uptime.

Polymarket behavior:

- The selected game's Odds tab fetches Polymarket on demand.
- The app shows DraftKings-first sportsbook lines and Polymarket moneyline probabilities side by side.
- Polymarket prices are probability-style outcome prices from 0 to 1, not American sportsbook odds.
- Matching is based on league, teams, and game start time, so edge cases should be reviewed before production use.

Recommended future production endpoints:

- `GET /api/scores?sport=MLB` returns live and scheduled games, status, clock, line score, win probability, venue, and leaders.
- `GET /api/games/:id/boxscore` returns team totals, player rows, period/inning scoring, injuries, and officials.
- `GET /api/games/:id/events` returns play-by-play updates with time, team, text, and win probability impact.
- `GET /api/odds?gameId=:id` returns spread, total, moneyline, book prices, movement, and timestamp.
- `GET /api/picks?gameId=:id` returns expert/model picks, confidence, price, result, and public/private visibility.
- `GET /api/news?sport=NBA` returns editorial posts, live notebooks, tags, authors, thumbnails, and canonical article URLs.

## Product Notes

- Keep scores and gamecast on a low-latency websocket or server-sent event stream.
- Cache news and finished box scores aggressively.
- Treat odds as timestamped snapshots so the picks tracker can grade against the price users actually took.
- Use the same game ID across odds, picks, scores, news, and box score systems.
- Never ship provider keys in frontend JavaScript; keep them in server environment variables or a secret manager.

## Licensed Data Spike — SportsDataIO vs Sportradar

Nosebleed Live currently uses The Odds API for scores/odds, Polymarket for public prediction-market prices, and ESPN public/undocumented endpoints as an MVP-only box-score fallback. That is acceptable for a private showcase, but it is not a production data-rights strategy.

Decision criteria for the first licensed provider:

- Budget target: less than $250/month for the first production MVP.
- Coverage: NFL, MLB, NBA, NHL, soccer, golf, tennis, F1, NCAA basketball, and NCAA football.
- Required data: schedules, live scores, finals, team/player box scores, standings, injuries when available, and stable game/team/player IDs.
- Integration shape: keep provider adapters server-side so the frontend continues to consume normalized Nosebleed data.

SportsDataIO is the likely first spike because it is usually more accessible for startups and can be adopted league by league. It should be tested first for NFL/NBA/MLB/NHL/NCAA coverage, box-score depth, update speed, and monthly cost at the target usage level.

Sportradar is the enterprise-grade path for deeper rights, richer feeds, and stronger commercial reliability, but it is likely above the early MVP budget. Treat Sportradar as the later partner/investor-ready option unless pricing comes in under the current budget.

MVP rule: do not build UI directly against ESPN, SportsDataIO, Sportradar, The Odds API, or Polymarket response shapes. All providers should normalize through server adapters, with stale-data and provider-failure fallbacks that do not crash the app.
