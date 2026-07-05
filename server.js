const fs = require("node:fs");
const path = require("node:path");
const http = require("node:http");
const { URL } = require("node:url");
const grade = require("./lib/grade");
const snapshots = require("./lib/snapshots");
const picks = require("./providers/picks");

const ROOT = __dirname;
const PORT = Number(process.env.PORT || 4173);
const ODDS_API_KEY = process.env.ODDS_API_KEY;
const ODDS_API_BASE = "https://api.the-odds-api.com/v4";
const ESPN_SITE_API_BASE = "https://site.api.espn.com/apis/site/v2/sports";
const ESPN_WEB_API_BASE = "https://site.web.api.espn.com/apis/site/v2/sports";
const POLYMARKET_GAMMA_BASE = "https://gamma-api.polymarket.com";
const CACHE_TTL_MS = Number(process.env.ODDS_CACHE_TTL_MS || 60000);
const LEAGUES_FILE = path.join(ROOT, "data", "leagues.json");

const SPORT_KEYS = {
  MLB: "baseball_mlb",
  NBA: "basketball_nba",
  NFL: "americanfootball_nfl",
  NHL: "icehockey_nhl",
  WNBA: "basketball_wnba",
};

const ESPN_SPORT_PATHS = {
  MLB: "baseball/mlb",
  NBA: "basketball/nba",
  NFL: "football/nfl",
  NHL: "hockey/nhl",
  WNBA: "basketball/wnba",
};

const MIME_TYPES = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".md": "text/markdown; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
};

const responseCache = new Map();

function sendJson(res, status, payload, extraHeaders = {}) {
  res.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
    ...extraHeaders,
  });
  res.end(JSON.stringify(payload));
}

function getSportsFromQuery(searchParams) {
  const sport = (searchParams.get("sport") || "All").toUpperCase();
  if (sport === "ALL") {
    return Object.entries(SPORT_KEYS).map(([league, key]) => ({ league, key }));
  }

  const key = SPORT_KEYS[sport];
  return key ? [{ league: sport, key }] : [];
}

function cacheKey(url) {
  return `${url.pathname}?${url.searchParams.toString()}`;
}

function readCache(key) {
  const cached = responseCache.get(key);
  if (!cached) return null;
  if (Date.now() - cached.createdAt > CACHE_TTL_MS) {
    responseCache.delete(key);
    return null;
  }
  return cached.payload;
}

function writeCache(key, payload) {
  responseCache.set(key, { createdAt: Date.now(), payload });
}

async function proxyOdds(url, res) {
  if (!ODDS_API_KEY) {
    sendJson(res, 503, {
      error: "ODDS_API_KEY is not configured on the server.",
      events: [],
    });
    return;
  }

  const sports = getSportsFromQuery(url.searchParams);
  if (!sports.length) {
    sendJson(res, 400, { error: "Unsupported sport.", events: [] });
    return;
  }

  const key = cacheKey(url);
  const cached = readCache(key);
  if (cached) {
    sendJson(res, 200, attachOddsMovement(cached, false), { "x-cache": "HIT" });
    return;
  }

  const regions = url.searchParams.get("regions") || "us";
  const markets = url.searchParams.get("markets") || "h2h,spreads,totals";
  const events = [];
  const errors = [];
  const usage = [];

  await Promise.all(
    sports.map(async (sport) => {
      const endpoint = new URL(`${ODDS_API_BASE}/sports/${sport.key}/odds`);
      endpoint.searchParams.set("apiKey", ODDS_API_KEY);
      endpoint.searchParams.set("regions", regions);
      endpoint.searchParams.set("markets", markets);
      endpoint.searchParams.set("oddsFormat", "american");
      endpoint.searchParams.set("dateFormat", "iso");

      try {
        const upstream = await fetch(endpoint, { headers: { accept: "application/json" } });
        usage.push({
          league: sport.league,
          remaining: upstream.headers.get("x-requests-remaining"),
          used: upstream.headers.get("x-requests-used"),
        });

        if (!upstream.ok) {
          errors.push({
            league: sport.league,
            status: upstream.status,
            message: await upstream.text(),
          });
          return;
        }

        const data = await upstream.json();
        events.push(...data.map((event) => normalizeOddsEvent(event, sport.league)));
      } catch (error) {
        errors.push({ league: sport.league, message: error.message });
      }
    }),
  );

  const payload = {
    events: events
      .filter(Boolean)
      .sort((a, b) => new Date(a.commenceTime).getTime() - new Date(b.commenceTime).getTime()),
    meta: {
      provider: "The Odds API",
      source: "live",
      fetchedAt: new Date().toISOString(),
      regions,
      markets,
      usage,
      errors,
    },
  };

  const response = attachOddsMovement(payload, true);
  writeCache(key, response);
  sendJson(res, 200, response, { "x-cache": "MISS" });
}

async function proxyScores(url, res) {
  if (!ODDS_API_KEY) {
    sendJson(res, 503, {
      error: "ODDS_API_KEY is not configured on the server.",
      games: [],
    });
    return;
  }

  const sports = getSportsFromQuery(url.searchParams);
  if (!sports.length) {
    sendJson(res, 400, { error: "Unsupported sport.", games: [] });
    return;
  }

  const key = cacheKey(url);
  const cached = readCache(key);
  if (cached) {
    gradeScoreFinals(cached.games);
    sendJson(res, 200, cached, { "x-cache": "HIT" });
    return;
  }

  const games = [];
  const errors = [];
  const usage = [];

  await Promise.all(
    sports.map(async (sport) => {
      const endpoint = new URL(`${ODDS_API_BASE}/sports/${sport.key}/scores`);
      endpoint.searchParams.set("apiKey", ODDS_API_KEY);
      endpoint.searchParams.set("daysFrom", url.searchParams.get("daysFrom") || "1");
      endpoint.searchParams.set("dateFormat", "iso");

      try {
        const upstream = await fetch(endpoint, { headers: { accept: "application/json" } });
        usage.push({
          league: sport.league,
          remaining: upstream.headers.get("x-requests-remaining"),
          used: upstream.headers.get("x-requests-used"),
        });

        if (!upstream.ok) {
          errors.push({
            league: sport.league,
            status: upstream.status,
            message: await upstream.text(),
          });
          return;
        }

        const data = await upstream.json();
        games.push(...data.map((game) => normalizeScoreGame(game, sport.league)));
      } catch (error) {
        errors.push({ league: sport.league, message: error.message });
      }
    }),
  );

  const payload = {
    games: games.sort((a, b) => new Date(a.commenceTime).getTime() - new Date(b.commenceTime).getTime()),
    meta: {
      provider: "The Odds API",
      fetchedAt: new Date().toISOString(),
      usage,
      errors,
    },
  };

  gradeScoreFinals(payload.games);
  writeCache(key, payload);
  sendJson(res, 200, payload, { "x-cache": "MISS" });
}

function gradeScoreFinals(games) {
  try {
    if ((Array.isArray(games) ? games : []).some((game) => game.completed || game.status === "final")) {
      grade.gradeFinals(picks.getPicks(), games);
    }
  } catch (error) {
    console.warn("[grade] gradeFinals failed:", error.message);
  }
}

function attachOddsMovement(payload, shouldRecord) {
  const markets = flattenOddsMarkets(payload.events || []);

  try {
    if (shouldRecord && payload.meta?.source === "live") {
      snapshots.record(markets);
    }
  } catch (error) {
    console.warn("[snapshots] record failed:", error.message);
  }

  return {
    ...payload,
    markets,
    movement: snapshots.movementMap(markets.map((market) => market.id)),
  };
}

function flattenOddsMarkets(events) {
  return (Array.isArray(events) ? events : []).flatMap((event) =>
    (event.markets || []).map((market) => ({
      ...market,
      eventId: event.id,
      league: event.league,
      matchup: `${event.awayTeam} at ${event.homeTeam}`,
    })),
  );
}

function readLeagues() {
  try {
    const parsed = JSON.parse(fs.readFileSync(LEAGUES_FILE, "utf8"));
    return (Array.isArray(parsed) ? parsed : [])
      .slice()
      .sort((a, b) => Number(a.priority || 999) - Number(b.priority || 999))
      .map(({ key, label, accent }) => ({ key, label, accent }));
  } catch (error) {
    console.warn("[leagues] unable to load leagues:", error.message);
    return [
      { key: "All", label: "Top Events", accent: "#b11226" },
      { key: "MLB", label: "MLB", accent: "#0a5c93" },
      { key: "NBA", label: "NBA", accent: "#c85a13" },
      { key: "NFL", label: "NFL", accent: "#0b2347" },
      { key: "NHL", label: "NHL", accent: "#163b75" },
      { key: "WNBA", label: "WNBA", accent: "#c75b12" },
    ];
  }
}

async function proxyBoxscore(url, res) {
  const league = (url.searchParams.get("league") || "").toUpperCase();
  const sportPath = ESPN_SPORT_PATHS[league];

  if (!sportPath) {
    sendJson(res, 400, { error: "Unsupported league for ESPN box scores.", boxscore: null });
    return;
  }

  const key = cacheKey(url);
  const cached = readCache(key);
  if (cached) {
    sendJson(res, 200, cached, { "x-cache": "HIT" });
    return;
  }

  const eventId =
    url.searchParams.get("eventId") ||
    (await findEspnEventId({
      sportPath,
      homeTeam: url.searchParams.get("homeTeam"),
      awayTeam: url.searchParams.get("awayTeam"),
      commenceTime: url.searchParams.get("commenceTime"),
    }));

  if (!eventId) {
    sendJson(res, 404, {
      error: "Matching ESPN event was not found.",
      boxscore: null,
    });
    return;
  }

  const endpoint = new URL(`${ESPN_WEB_API_BASE}/${sportPath}/summary`);
  endpoint.searchParams.set("event", eventId);

  try {
    const upstream = await fetch(endpoint, { headers: { accept: "application/json" } });
    if (!upstream.ok) {
      sendJson(res, upstream.status, {
        error: await upstream.text(),
        boxscore: null,
      });
      return;
    }

    const summary = await upstream.json();
    const payload = {
      boxscore: normalizeEspnSummary(summary, league, eventId),
      meta: {
        provider: "ESPN undocumented JSON",
        fetchedAt: new Date().toISOString(),
        eventId,
      },
    };

    writeCache(key, payload);
    sendJson(res, 200, payload, { "x-cache": "MISS" });
  } catch (error) {
    sendJson(res, 502, {
      error: error.message,
      boxscore: null,
    });
  }
}

async function proxyPolymarket(url, res) {
  const league = (url.searchParams.get("league") || "").toUpperCase();
  const homeTeam = url.searchParams.get("homeTeam") || "";
  const awayTeam = url.searchParams.get("awayTeam") || "";
  const commenceTime = url.searchParams.get("commenceTime") || "";

  if (!homeTeam || !awayTeam) {
    sendJson(res, 400, { error: "homeTeam and awayTeam are required.", market: null });
    return;
  }

  const key = cacheKey(url);
  const cached = readCache(key);
  if (cached) {
    sendJson(res, 200, cached, { "x-cache": "HIT" });
    return;
  }

  const search = new URL(`${POLYMARKET_GAMMA_BASE}/public-search`);
  search.searchParams.set("q", `${awayTeam} ${homeTeam}`);

  try {
    const upstream = await fetch(search, { headers: { accept: "application/json" } });
    if (!upstream.ok) {
      sendJson(res, upstream.status, { error: await upstream.text(), market: null });
      return;
    }

    const payload = await upstream.json();
    const candidates = normalizePolymarketCandidates(payload, {
      league,
      homeTeam,
      awayTeam,
      commenceTime,
    });
    const market = candidates[0] || null;
    const response = {
      market,
      candidates: candidates.slice(0, 3),
      meta: {
        provider: "Polymarket Gamma API",
        fetchedAt: new Date().toISOString(),
        query: `${awayTeam} ${homeTeam}`,
      },
    };

    writeCache(key, response);
    sendJson(res, 200, response, { "x-cache": "MISS" });
  } catch (error) {
    sendJson(res, 502, { error: error.message, market: null });
  }
}

function normalizePolymarketCandidates(payload, context) {
  const events = Array.isArray(payload.events) ? payload.events : [];
  const candidates = [];

  for (const event of events) {
    const markets = Array.isArray(event.markets) ? event.markets : [];
    for (const market of markets) {
      if (!isPolymarketGameMatch(event, market, context)) continue;
      candidates.push(normalizePolymarketMarket(event, market, context));
    }
  }

  return candidates
    .filter(Boolean)
    .sort((a, b) => {
      const aActive = a.active && !a.closed ? 0 : 1;
      const bActive = b.active && !b.closed ? 0 : 1;
      if (aActive !== bActive) return aActive - bActive;
      return a.timeDistanceMs - b.timeDistanceMs;
    });
}

function isPolymarketGameMatch(event, market, { league, homeTeam, awayTeam, commenceTime }) {
  const text = `${event.title || ""} ${market.question || ""} ${market.description || ""}`;
  if (!includesTeamName([text], homeTeam) || !includesTeamName([text], awayTeam)) return false;
  if (league && market.sportsMarketType && market.sportsMarketType !== "moneyline") return false;

  const marketTime = parsePolymarketGameTime(market);
  if (!marketTime || !commenceTime) return true;

  const targetTime = new Date(commenceTime).getTime();
  if (Number.isNaN(targetTime)) return true;

  return Math.abs(marketTime.getTime() - targetTime) <= 36 * 60 * 60 * 1000;
}

function normalizePolymarketMarket(event, market, context) {
  const outcomes = parseJsonArray(market.outcomes);
  const prices = parseJsonArray(market.outcomePrices).map((value) => Number(value));
  if (!outcomes.length || outcomes.length !== prices.length) return null;

  const marketTime = parsePolymarketGameTime(market);
  const targetTime = context.commenceTime ? new Date(context.commenceTime).getTime() : NaN;
  const timeDistanceMs = marketTime && !Number.isNaN(targetTime) ? Math.abs(marketTime.getTime() - targetTime) : 0;

  return {
    id: market.id,
    eventId: event.id,
    slug: market.slug || event.slug,
    title: event.title || market.question,
    question: market.question,
    active: Boolean(market.active),
    closed: Boolean(market.closed),
    acceptingOrders: Boolean(market.acceptingOrders),
    sportsMarketType: market.sportsMarketType || "moneyline",
    gameStartTime: market.gameStartTime || null,
    updatedAt: market.updatedAt || event.updatedAt || null,
    volume: Number(market.volumeNum ?? market.volume ?? event.volume ?? 0),
    liquidity: Number(market.liquidityNum ?? market.liquidity ?? 0),
    outcomes: outcomes.map((name, index) => ({
      name,
      price: Number.isFinite(prices[index]) ? prices[index] : null,
      percent: Number.isFinite(prices[index]) ? Math.round(prices[index] * 1000) / 10 : null,
    })),
    url: `https://polymarket.com/event/${event.slug || market.slug}`,
    timeDistanceMs,
  };
}

function parsePolymarketGameTime(market) {
  const value = market.gameStartTime || market.endDate || market.endDateIso;
  if (!value) return null;
  const date = new Date(String(value).replace(" ", "T"));
  return Number.isNaN(date.getTime()) ? null : date;
}

function parseJsonArray(value) {
  if (Array.isArray(value)) return value;
  if (typeof value !== "string") return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function findEspnEventId({ sportPath, homeTeam, awayTeam, commenceTime }) {
  if (!homeTeam || !awayTeam) return null;

  for (const date of espnCandidateDates(commenceTime)) {
    const endpoint = new URL(`${ESPN_SITE_API_BASE}/${sportPath}/scoreboard`);
    endpoint.searchParams.set("dates", date);
    endpoint.searchParams.set("limit", "300");

    try {
      const upstream = await fetch(endpoint, { headers: { accept: "application/json" } });
      if (!upstream.ok) continue;

      const scoreboard = await upstream.json();
      const event = (scoreboard.events || []).find((item) => eventMatchesTeams(item, homeTeam, awayTeam));
      if (event?.id) return event.id;
    } catch {
      continue;
    }
  }

  return null;
}

function espnCandidateDates(commenceTime) {
  const base = commenceTime ? new Date(commenceTime) : new Date();
  if (Number.isNaN(base.getTime())) return [formatEspnDate(new Date())];

  return [-1, 0, 1].map((offset) => {
    const date = new Date(base);
    date.setUTCDate(date.getUTCDate() + offset);
    return formatEspnDate(date);
  });
}

function formatEspnDate(date) {
  return date.toISOString().slice(0, 10).replace(/-/g, "");
}

function eventMatchesTeams(event, homeTeam, awayTeam) {
  const competitors = event.competitions?.[0]?.competitors || [];
  const names = competitors.flatMap((competitor) => [
    competitor.team?.displayName,
    competitor.team?.name,
    competitor.team?.shortDisplayName,
    competitor.team?.abbreviation,
  ]);

  return includesTeamName(names, homeTeam) && includesTeamName(names, awayTeam);
}

function includesTeamName(names, requestedName) {
  const normalizedRequest = normalizeTeamName(requestedName);
  return names.filter(Boolean).some((name) => {
    const normalized = normalizeTeamName(name);
    return normalized === normalizedRequest || normalizedRequest.includes(normalized) || normalized.includes(normalizedRequest);
  });
}

function normalizeTeamName(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

function normalizeEspnSummary(summary, league, eventId) {
  const boxscore = summary.boxscore || {};
  const event = summary.header?.competitions?.[0] || summary.header || {};

  return {
    eventId,
    league,
    name: summary.header?.name || summary.header?.shortName || "",
    status: event.status?.type?.description || summary.header?.competitions?.[0]?.status?.type?.description || "",
    source: "ESPN undocumented JSON",
    teams: (boxscore.players || []).map((teamEntry) => ({
      team: teamEntry.team?.displayName || teamEntry.team?.name || "Team",
      abbreviation: teamEntry.team?.abbreviation || "",
      groups: (teamEntry.statistics || [])
        .filter((group) => Array.isArray(group.athletes) && group.athletes.length)
        .map((group, index) => normalizeEspnStatGroup(group, league, index)),
    })),
  };
}

function normalizeEspnStatGroup(group, league, index) {
  const labels = group.labels || [];
  return {
    name: group.name || group.displayName || inferEspnStatGroupName(league, labels, index),
    labels,
    rows: group.athletes.map((entry) => ({
      player: entry.athlete?.displayName || entry.displayName || "Player",
      shortName: entry.athlete?.shortName || "",
      position: entry.athlete?.position?.abbreviation || "",
      stats: entry.stats || [],
    })),
  };
}

function inferEspnStatGroupName(league, labels, index) {
  if (league === "MLB") return labels.includes("IP") ? "Pitching" : "Batting";
  if (league === "NFL") return ["Passing", "Rushing", "Receiving", "Defense", "Kicking"][index] || "Player Stats";
  if (league === "NHL") return labels.includes("TOI") ? "Skaters" : "Goalies";
  return index === 0 ? "Player Stats" : `Player Stats ${index + 1}`;
}

function normalizeOddsEvent(event, league) {
  const bookmaker = pickBookmaker(event.bookmakers || []);
  const h2h = findMarket(bookmaker, "h2h");
  const spreads = findMarket(bookmaker, "spreads");
  const totals = findMarket(bookmaker, "totals");
  const awayH2h = findOutcome(h2h, event.away_team);
  const homeH2h = findOutcome(h2h, event.home_team);
  const awaySpread = findOutcome(spreads, event.away_team);
  const totalOver = findOutcome(totals, "Over");

  return {
    id: event.id,
    league,
    sportKey: event.sport_key,
    commenceTime: event.commence_time,
    homeTeam: event.home_team,
    awayTeam: event.away_team,
    bookmaker: bookmaker?.title || "Market",
    bookmakerCount: event.bookmakers?.length || 0,
    updatedAt: bookmaker?.last_update || null,
    display: {
      spread: awaySpread ? `${formatPoint(awaySpread.point)} (${formatPrice(awaySpread.price)})` : "Spread N/A",
      total: totalOver ? `O ${totalOver.point} (${formatPrice(totalOver.price)})` : "Total N/A",
      moneyline:
        awayH2h && homeH2h
          ? `ML ${formatPrice(awayH2h.price)} / ${formatPrice(homeH2h.price)}`
          : "ML N/A",
    },
    markets: [
      marketSnapshot(event.id, "spread", event.away_team, awaySpread),
      marketSnapshot(event.id, "total", "Over", totalOver),
      marketSnapshot(event.id, "moneyline", event.away_team, awayH2h),
      marketSnapshot(event.id, "moneyline", event.home_team, homeH2h),
    ].filter(Boolean),
  };
}

function marketSnapshot(eventId, market, name, outcome) {
  if (!outcome) return null;
  const value = Number(outcome.price ?? outcome.point);
  if (!Number.isFinite(value)) return null;
  return {
    id: `${eventId}:${market}:${name}`,
    market,
    name,
    label: `${name} ${market}`,
    value,
    point: typeof outcome.point === "number" ? outcome.point : null,
    price: typeof outcome.price === "number" ? outcome.price : null,
  };
}

function normalizeScoreGame(game, league) {
  return {
    id: game.id,
    league,
    sportKey: game.sport_key,
    commenceTime: game.commence_time,
    completed: Boolean(game.completed),
    homeTeam: game.home_team,
    awayTeam: game.away_team,
    lastUpdate: game.last_update || null,
    scores: game.scores || [],
  };
}

function pickBookmaker(bookmakers) {
  const preferred = ["draftkings", "fanduel", "betmgm", "caesars", "espnbet", "betrivers", "fanatics"];
  return preferred.map((key) => bookmakers.find((book) => book.key === key)).find(Boolean) || bookmakers[0] || null;
}

function findMarket(bookmaker, key) {
  return bookmaker?.markets?.find((market) => market.key === key) || null;
}

function findOutcome(market, name) {
  return market?.outcomes?.find((outcome) => outcome.name === name) || null;
}

function formatPoint(value) {
  if (typeof value !== "number") return "PK";
  return value > 0 ? `+${value}` : `${value}`;
}

function formatPrice(value) {
  if (typeof value !== "number") return "N/A";
  return value > 0 ? `+${value}` : `${value}`;
}

function serveStatic(reqUrl, res) {
  const requestedPath = decodeURIComponent(reqUrl.pathname === "/" ? "/index.html" : reqUrl.pathname);
  const absolutePath = path.normalize(path.join(ROOT, requestedPath));

  if (!absolutePath.startsWith(ROOT)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  fs.stat(absolutePath, (statError, stat) => {
    if (statError || !stat.isFile()) {
      res.writeHead(404);
      res.end("Not found");
      return;
    }

    const contentType = MIME_TYPES[path.extname(absolutePath).toLowerCase()] || "application/octet-stream";
    res.writeHead(200, {
      "content-type": contentType,
      "cache-control": "no-cache",
    });
    fs.createReadStream(absolutePath).pipe(res);
  });
}

const server = http.createServer(async (req, res) => {
  const reqUrl = new URL(req.url, `http://${req.headers.host || "localhost"}`);

  if (req.method !== "GET") {
    sendJson(res, 405, { error: "Method not allowed." });
    return;
  }

  if (reqUrl.pathname === "/api/health") {
    sendJson(res, 200, {
      ok: true,
      oddsConfigured: Boolean(ODDS_API_KEY),
      provider: "The Odds API",
      cacheTtlMs: CACHE_TTL_MS,
    });
    return;
  }

  if (reqUrl.pathname === "/api/leagues") {
    sendJson(res, 200, {
      leagues: readLeagues(),
      meta: {
        provider: "Nosebleed league config",
        fetchedAt: new Date().toISOString(),
      },
    });
    return;
  }

  if (reqUrl.pathname === "/api/picks/record") {
    sendJson(res, 200, {
      record: grade.record(picks.getPicks()),
      meta: {
        provider: "Nosebleed picks tracker",
        fetchedAt: new Date().toISOString(),
      },
    });
    return;
  }

  if (reqUrl.pathname === "/api/picks") {
    sendJson(res, 200, {
      picks: picks.getPicks(),
      meta: {
        provider: "Nosebleed picks tracker",
        fetchedAt: new Date().toISOString(),
      },
    });
    return;
  }

  if (reqUrl.pathname === "/api/odds") {
    await proxyOdds(reqUrl, res);
    return;
  }

  if (reqUrl.pathname === "/api/scores") {
    await proxyScores(reqUrl, res);
    return;
  }

  if (reqUrl.pathname === "/api/boxscore") {
    await proxyBoxscore(reqUrl, res);
    return;
  }

  if (reqUrl.pathname === "/api/polymarket") {
    await proxyPolymarket(reqUrl, res);
    return;
  }

  if (reqUrl.pathname.startsWith("/api/")) {
    sendJson(res, 404, { error: "Unknown API route." });
    return;
  }

  serveStatic(reqUrl, res);
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Nosebleed Live running at http://0.0.0.0:${PORT}/`);
});
