const { fetchThroughHandshake } = require("./newsletter");

const PICKS_URL = "https://nosebleedsportsmedia.com/api/picks-result";
const CACHE_TTL_MS = Number(process.env.MODEL_PICKS_CACHE_TTL_MS || 10 * 60 * 1000);

let cache = null;

// Product rule: exactly one model pick is free in the app; the rest of the
// card is membership content. The paid picks are stripped HERE, server-side,
// so they never reach the browser at all.
async function getModelCard() {
  if (cache && Date.now() - cache.createdAt < CACHE_TTL_MS) {
    return cache.payload;
  }

  const upstream = await fetchThroughHandshake(PICKS_URL);
  if (!upstream.ok) {
    if (cache) return { ...cache.payload, meta: { ...cache.payload.meta, stale: true } };
    throw new Error(`Picks feed returned ${upstream.status}`);
  }

  const data = await upstream.json();
  const record = data.record || null;
  const picks = Array.isArray(data.today?.picks) ? data.today.picks : [];

  // Free pick: the highest-confidence pick from the site's free-preview tier;
  // if none exists that day, the highest-confidence pick overall.
  const sorted = picks.slice().sort((a, b) => Number(b.confidence || 0) - Number(a.confidence || 0));
  const freePick = sorted.find((pick) => pick.tier === "picks") || sorted[0] || null;

  const locked = picks
    .filter((pick) => pick !== freePick)
    .map((pick) => ({ sport: pick.sport || "", game: pick.game || "" }));

  const payload = {
    record,
    date: data.today?.picks?.[0]?.date || record?.lastUpdated || null,
    freePick: freePick
      ? {
          id: freePick.id,
          sport: freePick.sport || "",
          game: freePick.game || "",
          pick: freePick.pick || "",
          odds: freePick.odds || "",
          units: freePick.units ?? null,
          confidence: freePick.confidence ?? null,
          edge: freePick.factorScores?.edge ?? null,
          analysis: freePick.analysis || freePick.teaser || "",
        }
      : null,
    locked,
    meta: {
      provider: "Nosebleed picks model",
      fetchedAt: new Date().toISOString(),
      totalToday: picks.length,
    },
  };

  cache = { createdAt: Date.now(), payload };
  return payload;
}

module.exports = { getModelCard };
