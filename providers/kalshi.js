const KALSHI_BASE = "https://api.elections.kalshi.com/trade-api/v2";
const CACHE_TTL_MS = Number(process.env.KALSHI_CACHE_TTL_MS || 2 * 60 * 1000);

const SERIES = {
  MLB: ["KXMLBGAME"],
  NFL: ["KXNFLGAME"],
  NBA: ["KXNBAGAME"],
  NHL: ["KXNHLGAME"],
  WNBA: ["KXWNBAGAME"],
  NCAAF: ["KXNCAAFGAME"],
  MMA: ["KXUFCFIGHT"],
  TENNIS: ["KXATPMATCH", "KXWTAMATCH"],
  BOXING: ["KXBOXING"],
};

const seriesCache = new Map();

function normalizeKey(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

function keysOverlap(a, b) {
  return Boolean(a && b && a.length >= 4 && b.length >= 4 && (a.includes(b) || b.includes(a)));
}

async function getSeriesEvents(ticker) {
  const cached = seriesCache.get(ticker);
  if (cached && Date.now() - cached.createdAt < CACHE_TTL_MS) return cached.events;

  const url = `${KALSHI_BASE}/events?series_ticker=${ticker}&status=open&with_nested_markets=true&limit=200`;
  const upstream = await fetch(url, { headers: { accept: "application/json" } });
  if (!upstream.ok) throw new Error(`Kalshi returned ${upstream.status} for ${ticker}`);

  const data = await upstream.json();
  const events = Array.isArray(data.events) ? data.events : [];
  seriesCache.set(ticker, { createdAt: Date.now(), events });
  return events;
}

function eventMatches(event, awayKey, homeKey) {
  const title = `${event.title || ""} ${event.sub_title || ""}`;
  const sides = String(event.title || "").split(/\s+vs\.?\s+/i);
  if (sides.length === 2) {
    const [a, b] = sides.map(normalizeKey);
    const direct = (keysOverlap(a, awayKey) && keysOverlap(b, homeKey)) || (keysOverlap(a, homeKey) && keysOverlap(b, awayKey));
    if (direct) return true;
  }
  const titleKey = normalizeKey(title);
  return keysOverlap(titleKey, awayKey) || (titleKey.includes(awayKey.slice(0, 6)) && titleKey.includes(homeKey.slice(0, 6)));
}

function marketPercent(market) {
  const bid = Number(market.yes_bid_dollars);
  const ask = Number(market.yes_ask_dollars);
  const last = Number(market.last_price_dollars);
  let price = null;
  if (Number.isFinite(bid) && Number.isFinite(ask) && (bid > 0 || ask > 0)) price = (bid + ask) / 2;
  else if (Number.isFinite(last) && last > 0) price = last;
  if (price === null) return null;
  return Math.round(price * 1000) / 10;
}

async function findMarket({ league, homeTeam, awayTeam }) {
  const tickers = SERIES[league];
  if (!tickers) return { market: null, errors: [{ message: `No Kalshi series for ${league}.` }] };

  const awayKey = normalizeKey(awayTeam);
  const homeKey = normalizeKey(homeTeam);
  const errors = [];

  for (const ticker of tickers) {
    try {
      const events = await getSeriesEvents(ticker);
      const event = events.find((item) => eventMatches(item, awayKey, homeKey));
      if (!event) continue;

      const outcomes = (event.markets || [])
        .map((market) => ({
          name: market.yes_sub_title || market.title || "",
          percent: marketPercent(market),
        }))
        .filter((outcome) => outcome.name);

      if (!outcomes.length) continue;
      return {
        market: {
          title: event.title || "",
          subTitle: event.sub_title || "",
          eventTicker: event.event_ticker,
          outcomes,
          url: `https://kalshi.com/markets/${ticker.toLowerCase()}`,
        },
        errors,
      };
    } catch (error) {
      errors.push({ ticker, message: error.message });
    }
  }

  return { market: null, errors };
}

module.exports = { findMarket };
