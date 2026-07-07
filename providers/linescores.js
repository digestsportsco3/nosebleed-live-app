const ESPN_SITE_API_BASE = "https://site.api.espn.com/apis/site/v2/sports";
const CACHE_TTL_MS = Number(process.env.LINESCORES_CACHE_TTL_MS || 45000);

// ESPN scoreboards carry what The Odds API scores feed lacks: period-by-period
// line scores, the live game clock ("Bot 7th", "4:12 - 3rd"), team records,
// and venues. Tennis/MMA/boxing/CFL have no usable scoreboard here.
const SCOREBOARD_SOURCES = [
  { league: "MLB", path: "baseball/mlb" },
  { league: "NBA", path: "basketball/nba" },
  { league: "NFL", path: "football/nfl" },
  { league: "NHL", path: "hockey/nhl" },
  { league: "WNBA", path: "basketball/wnba" },
  { league: "NCAAF", path: "football/college-football" },
  { league: "NCAAB", path: "basketball/mens-college-basketball" },
  { league: "WNCAAB", path: "basketball/womens-college-basketball" },
  { league: "SOCCER", path: "soccer/eng.1" },
  { league: "SOCCER", path: "soccer/usa.1" },
  { league: "SOCCER", path: "soccer/esp.1" },
  { league: "SOCCER", path: "soccer/ger.1" },
  { league: "SOCCER", path: "soccer/ita.1" },
  { league: "SOCCER", path: "soccer/fra.1" },
  { league: "SOCCER", path: "soccer/uefa.champions" },
  { league: "SOCCER", path: "soccer/fifa.world" },
];

let cache = null;

async function getLineScores() {
  if (cache && Date.now() - cache.createdAt < CACHE_TTL_MS) {
    return cache.payload;
  }

  const games = [];
  const errors = [];

  const dates = dateRange();
  await Promise.all(
    SCOREBOARD_SOURCES.map(async (source) => {
      try {
        const url = `${ESPN_SITE_API_BASE}/${source.path}/scoreboard?limit=300&dates=${dates}`;
        const upstream = await fetch(url, { headers: { accept: "application/json" } });
        if (!upstream.ok) {
          errors.push({ league: source.league, path: source.path, status: upstream.status });
          return;
        }

        const data = await upstream.json();
        for (const event of Array.isArray(data.events) ? data.events : []) {
          const game = normalizeEvent(event, source.league);
          if (game) games.push(game);
        }
      } catch (error) {
        errors.push({ league: source.league, path: source.path, message: error.message });
      }
    }),
  );

  if (!games.length && cache) {
    return { ...cache.payload, meta: { ...cache.payload.meta, stale: true, errors } };
  }

  const payload = {
    games,
    meta: {
      provider: "ESPN public scoreboards",
      fetchedAt: new Date().toISOString(),
      count: games.length,
      errors,
    },
  };

  cache = { createdAt: Date.now(), payload };
  return payload;
}

// Yesterday through two days out (UTC), so recent finals keep their line
// scores and late-night games that cross the UTC date line still match.
function dateRange() {
  const format = (date) => date.toISOString().slice(0, 10).replace(/-/g, "");
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const ahead = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);
  return `${format(yesterday)}-${format(ahead)}`;
}

function normalizeEvent(event, league) {
  const competition = event.competitions?.[0];
  const competitors = competition?.competitors || [];
  const away = competitors.find((item) => item.homeAway === "away");
  const home = competitors.find((item) => item.homeAway === "home");
  if (!away?.team?.displayName || !home?.team?.displayName) return null;

  const status = competition?.status || event.status || {};
  return {
    espnId: event.id,
    league,
    awayTeam: away.team.displayName,
    homeTeam: home.team.displayName,
    awayScore: away.score ?? null,
    homeScore: home.score ?? null,
    awayLine: normalizeLine(away.linescores),
    homeLine: normalizeLine(home.linescores),
    awayRecord: teamRecord(away),
    homeRecord: teamRecord(home),
    state: status.type?.state || "",
    detail: status.type?.shortDetail || status.type?.detail || "",
    completed: Boolean(status.type?.completed),
    venue: competition?.venue?.fullName || "",
    startTime: event.date || null,
  };
}

function normalizeLine(linescores) {
  return (Array.isArray(linescores) ? linescores : []).map((entry) => {
    const value = entry.displayValue ?? entry.value;
    return value === undefined || value === null ? "-" : String(value);
  });
}

function teamRecord(competitor) {
  const records = Array.isArray(competitor.records) ? competitor.records : [];
  const overall = records.find((record) => record.type === "total" || record.name === "overall") || records[0];
  return overall?.summary || "";
}

module.exports = { getLineScores };
