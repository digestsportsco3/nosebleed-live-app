const ESPN_SITE_API_BASE = "https://site.api.espn.com/apis/site/v2/sports";
const CACHE_TTL_MS = Number(process.env.LOGOS_CACHE_TTL_MS || 24 * 60 * 60 * 1000);

// Leagues with real team logos in ESPN's public team directories.
// Tennis/MMA/boxing are individual athletes and CFL isn't covered — those
// leagues keep the lettered fallback marks in the UI.
const TEAM_SOURCES = [
  { league: "MLB", path: "baseball/mlb" },
  { league: "NBA", path: "basketball/nba" },
  { league: "NFL", path: "football/nfl" },
  { league: "NHL", path: "hockey/nhl" },
  { league: "WNBA", path: "basketball/wnba" },
  { league: "NCAAF", path: "football/college-football", limit: 1000 },
  { league: "NCAAB", path: "basketball/mens-college-basketball", limit: 1000 },
  { league: "WNCAAB", path: "basketball/womens-college-basketball", limit: 1000 },
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

function normalizeTeamKey(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

async function getLogos() {
  if (cache && Date.now() - cache.createdAt < CACHE_TTL_MS) {
    return cache.payload;
  }

  const leagues = {};
  const errors = [];

  await Promise.all(
    TEAM_SOURCES.map(async (source) => {
      try {
        const url = `${ESPN_SITE_API_BASE}/${source.path}/teams${source.limit ? `?limit=${source.limit}` : ""}`;
        const upstream = await fetch(url, { headers: { accept: "application/json" } });
        if (!upstream.ok) {
          errors.push({ league: source.league, path: source.path, status: upstream.status });
          return;
        }

        const data = await upstream.json();
        const teams = data.sports?.[0]?.leagues?.[0]?.teams || [];
        const table = (leagues[source.league] = leagues[source.league] || {});
        for (const entry of teams) {
          const team = entry.team || {};
          const logo = team.logos?.[0]?.href;
          if (!logo) continue;
          const value = { l: logo, a: team.abbreviation || team.shortDisplayName || "" };
          for (const variant of [team.displayName, team.shortDisplayName]) {
            const key = normalizeTeamKey(variant);
            if (key && !table[key]) table[key] = value;
          }
        }
      } catch (error) {
        errors.push({ league: source.league, path: source.path, message: error.message });
      }
    }),
  );

  const total = Object.values(leagues).reduce((sum, table) => sum + Object.keys(table).length, 0);
  if (!total && cache) {
    return { ...cache.payload, meta: { ...cache.payload.meta, stale: true, errors } };
  }

  const payload = {
    leagues,
    meta: {
      provider: "ESPN public team directories",
      fetchedAt: new Date().toISOString(),
      teams: total,
      errors,
    },
  };

  cache = { createdAt: Date.now(), payload };
  return payload;
}

module.exports = { getLogos };
