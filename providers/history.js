const ESPN_SITE_API_BASE = "https://site.api.espn.com/apis/site/v2/sports";

const ESPN_SPORT_PATHS = {
  MLB: "baseball/mlb",
  NBA: "basketball/nba",
  NFL: "football/nfl",
  NHL: "hockey/nhl",
  WNBA: "basketball/wnba",
  NCAAF: "football/college-football",
  NCAAB: "basketball/mens-college-basketball",
  SOCCER: "soccer/eng.1",
  GOLF: "golf/pga",
  TENNIS: "tennis/atp",
  F1: "racing/f1",
};

const CACHE_TTL_MS = Number(process.env.HISTORY_CACHE_TTL_MS || 15 * 60 * 1000);
const cache = new Map();

async function getHistory(options = {}) {
  const league = String(options.league || "All").toUpperCase();
  const days = clampNumber(options.days, 1, 30, 10);
  const limit = clampNumber(options.limit, 1, 80, 24);
  const includeScheduled = Boolean(options.includeScheduled);
  const leagues = resolveLeagues(league);
  const key = `${league}:${days}:${limit}:${includeScheduled}`;
  const cached = readCache(key);
  if (cached) return cached;

  const range = dateRange(days);
  const errors = [];
  const games = [];
  const leaders = [];

  await Promise.all(
    leagues.map(async (item) => {
      try {
        const scoreboard = await fetchEspnScoreboard(item.path, range);
        const normalized = normalizeScoreboard(scoreboard, item.key, includeScheduled);
        games.push(...normalized.games);
        leaders.push(...normalized.leaders);
      } catch (error) {
        errors.push({ league: item.key, message: error.message });
      }
    }),
  );

  const sortedGames = games
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, limit);
  const gameIds = new Set(sortedGames.map((game) => game.id));

  const payload = {
    games: sortedGames,
    leaders: leaders
      .filter((leader) => gameIds.has(leader.gameId))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 18),
    sourcePolicy: sourcePolicy(),
    meta: {
      provider: "ESPN JSON scoreboard adapter",
      source: "mvp-fallback",
      fetchedAt: new Date().toISOString(),
      league,
      days,
      range,
      errors,
      stale: false,
    },
  };

  writeCache(key, payload);
  return payload;
}

function resolveLeagues(league) {
  if (league === "ALL") {
    return Object.entries(ESPN_SPORT_PATHS).map(([key, path]) => ({ key, path }));
  }

  const path = ESPN_SPORT_PATHS[league];
  return path ? [{ key: league, path }] : [];
}

async function fetchEspnScoreboard(sportPath, range) {
  const endpoint = new URL(`${ESPN_SITE_API_BASE}/${sportPath}/scoreboard`);
  endpoint.searchParams.set("dates", `${range.start}-${range.end}`);
  endpoint.searchParams.set("limit", "300");

  const upstream = await fetch(endpoint, {
    headers: {
      accept: "application/json",
      "user-agent": "NosebleedLiveMVP/1.0",
    },
  });

  if (!upstream.ok) {
    throw new Error(`ESPN scoreboard failed with ${upstream.status}`);
  }

  return upstream.json();
}

function normalizeScoreboard(scoreboard, league, includeScheduled) {
  const games = [];
  const leaders = [];

  for (const event of Array.isArray(scoreboard?.events) ? scoreboard.events : []) {
    const competition = event.competitions?.[0] || {};
    const status = competition.status || event.status || {};
    const completed = Boolean(status.type?.completed);
    const state = normalizeStatus(status);
    if (!includeScheduled && !completed) continue;

    const competitors = Array.isArray(competition.competitors) ? competition.competitors : [];
    const home = competitors.find((item) => item.homeAway === "home") || competitors[1] || {};
    const away = competitors.find((item) => item.homeAway === "away") || competitors[0] || {};
    const normalizedGame = {
      id: String(event.id || competition.id || `${league}-${event.date || event.name}`),
      league,
      name: event.name || event.shortName || matchupName(away, home),
      shortName: event.shortName || matchupName(away, home),
      date: event.date || competition.date || null,
      completed,
      status: status.type?.description || status.type?.name || "Unknown",
      statusType: state,
      venue: competition.venue?.fullName || competition.venue?.displayName || "",
      attendance: competition.attendance || null,
      neutralSite: Boolean(competition.neutralSite),
      source: "ESPN",
      away: normalizeCompetitor(away),
      home: normalizeCompetitor(home),
      links: normalizeLinks(event.links),
    };

    games.push(normalizedGame);
    leaders.push(...normalizeLeaders(away, normalizedGame));
    leaders.push(...normalizeLeaders(home, normalizedGame));
  }

  return { games, leaders };
}

function normalizeCompetitor(competitor) {
  const team = competitor?.team || {};
  return {
    id: team.id || competitor.id || "",
    name: team.displayName || team.name || competitor.displayName || "Team",
    shortName: team.shortDisplayName || team.name || "",
    abbreviation: team.abbreviation || "",
    score: competitor?.score ?? "-",
    winner: Boolean(competitor?.winner),
    record: competitor?.records?.[0]?.summary || "",
    logo: Array.isArray(team.logos) ? team.logos[0]?.href || "" : "",
  };
}

function normalizeLeaders(competitor, game) {
  const team = normalizeCompetitor(competitor);
  const groups = Array.isArray(competitor?.leaders) ? competitor.leaders : [];
  const rows = [];

  for (const group of groups) {
    const statName = group.displayName || group.name || group.abbreviation || "Leader";
    for (const leader of Array.isArray(group.leaders) ? group.leaders : []) {
      rows.push({
        gameId: game.id,
        league: game.league,
        date: game.date,
        team: team.abbreviation || team.shortName || team.name,
        player: leader.athlete?.displayName || leader.athlete?.shortName || "Player",
        stat: statName,
        value: leader.displayValue || leader.value || "",
      });
    }
  }

  return rows;
}

function normalizeStatus(status) {
  if (status?.type?.completed) return "final";
  const state = String(status?.type?.state || "").toLowerCase();
  if (state === "in") return "live";
  return "scheduled";
}

function matchupName(away, home) {
  return `${normalizeCompetitor(away).name} at ${normalizeCompetitor(home).name}`;
}

function normalizeLinks(links) {
  return (Array.isArray(links) ? links : [])
    .filter((link) => link.href)
    .slice(0, 3)
    .map((link) => ({
      text: link.text || link.shortText || "ESPN",
      href: link.href,
    }));
}

function sourcePolicy() {
  return [
    {
      source: "ESPN",
      status: "active-mvp-adapter",
      note: "Used server-side for recent scoreboards, finals, and leaders. Replace with licensed data before production launch.",
    },
    {
      source: "Sports Reference",
      status: "not-enabled-by-default",
      note: "Useful for historical stat tables only with attribution, low-rate daily caching, and terms-aware use.",
    },
    {
      source: "StatMuse",
      status: "blocked",
      note: "Do not scrape. Use only through an approved/licensed route.",
    },
  ];
}

function dateRange(days) {
  const end = new Date();
  const start = new Date(end);
  start.setUTCDate(start.getUTCDate() - (days - 1));
  return {
    start: formatEspnDate(start),
    end: formatEspnDate(end),
  };
}

function formatEspnDate(date) {
  return date.toISOString().slice(0, 10).replace(/-/g, "");
}

function clampNumber(value, min, max, fallback) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return fallback;
  return Math.max(min, Math.min(max, Math.round(numeric)));
}

function readCache(key) {
  const cached = cache.get(key);
  if (!cached) return null;
  if (Date.now() - cached.createdAt > CACHE_TTL_MS) {
    cache.delete(key);
    return null;
  }
  return {
    ...cached.payload,
    meta: {
      ...cached.payload.meta,
      stale: false,
      cache: "HIT",
    },
  };
}

function writeCache(key, payload) {
  cache.set(key, { createdAt: Date.now(), payload });
}

module.exports = {
  getHistory,
};
