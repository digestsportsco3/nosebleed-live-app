const ESPN_SITE_API_BASE = "https://site.api.espn.com/apis/site/v2/sports";
const CACHE_TTL_MS = Number(process.env.HEADSHOTS_CACHE_TTL_MS || 6 * 60 * 60 * 1000);

// Individual sports have athletes, not teams. ESPN scoreboards expose athlete
// ids, which map to headshot images at a stable CDN path. Country flags come
// along as a fallback for players without a headshot on file.
const SOURCES = [
  { league: "TENNIS", path: "tennis/atp", headshotSport: "tennis" },
  { league: "TENNIS", path: "tennis/wta", headshotSport: "tennis" },
  // Fight cards are announced weeks out; widen the window to cover them.
  { league: "MMA", path: "mma/ufc", headshotSport: "mma", daysAhead: 90 },
];

function dateRange(daysAhead) {
  const format = (date) => date.toISOString().slice(0, 10).replace(/-/g, "");
  return `${format(new Date(Date.now() - 24 * 60 * 60 * 1000))}-${format(new Date(Date.now() + daysAhead * 24 * 60 * 60 * 1000))}`;
}

let cache = null;

async function getHeadshots() {
  if (cache && Date.now() - cache.createdAt < CACHE_TTL_MS) {
    return cache.payload;
  }

  const athletes = [];
  const errors = [];

  await Promise.all(
    SOURCES.map(async (source) => {
      try {
        const url = `${ESPN_SITE_API_BASE}/${source.path}/scoreboard${source.daysAhead ? `?dates=${dateRange(source.daysAhead)}` : ""}`;
        const upstream = await fetch(url, { headers: { accept: "application/json" } });
        if (!upstream.ok) {
          errors.push({ league: source.league, path: source.path, status: upstream.status });
          return;
        }

        const data = await upstream.json();
        for (const event of Array.isArray(data.events) ? data.events : []) {
          const competitions = [
            ...(event.competitions || []),
            ...(event.groupings || []).flatMap((group) => group.competitions || []),
          ];
          for (const competition of competitions) {
            for (const competitor of competition.competitors || []) {
              const athlete = competitor.athlete;
              if (!athlete?.displayName || !competitor.id) continue;
              athletes.push({
                league: source.league,
                name: athlete.displayName,
                img: `https://a.espncdn.com/i/headshots/${source.headshotSport}/players/full/${competitor.id}.png`,
                flag: athlete.flag?.href || "",
              });
            }
          }
        }
      } catch (error) {
        errors.push({ league: source.league, path: source.path, message: error.message });
      }
    }),
  );

  if (!athletes.length && cache) {
    return { ...cache.payload, meta: { ...cache.payload.meta, stale: true, errors } };
  }

  const payload = {
    athletes,
    meta: {
      provider: "ESPN public scoreboards",
      fetchedAt: new Date().toISOString(),
      count: athletes.length,
      errors,
    },
  };

  cache = { createdAt: Date.now(), payload };
  return payload;
}

module.exports = { getHeadshots };
