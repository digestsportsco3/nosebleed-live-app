const fs = require("node:fs");
const path = require("node:path");

const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, "..", "data");
const SNAPSHOTS_FILE = path.join(DATA_DIR, "snapshots.json");
const MAX_POINTS = 24;
const MIN_WRITE_INTERVAL_MS = 4 * 60 * 1000;
const MAX_MARKETS = 500;

function emptyStore() {
  return { markets: {}, updatedAt: null };
}

function loadStore() {
  try {
    if (!fs.existsSync(SNAPSHOTS_FILE)) return emptyStore();
    const parsed = JSON.parse(fs.readFileSync(SNAPSHOTS_FILE, "utf8"));
    return {
      markets: parsed && typeof parsed.markets === "object" && parsed.markets ? parsed.markets : {},
      updatedAt: parsed?.updatedAt || null,
    };
  } catch (error) {
    console.warn("[snapshots] unable to load snapshots:", error.message);
    return emptyStore();
  }
}

function saveStore(store) {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(SNAPSHOTS_FILE, `${JSON.stringify(store, null, 2)}\n`);
  } catch (error) {
    console.warn("[snapshots] unable to persist snapshots:", error.message);
  }
}

function record(markets) {
  const now = Date.now();
  const store = loadStore();
  let changed = false;

  for (const market of Array.isArray(markets) ? markets : []) {
    const normalized = normalizeMarket(market);
    if (!normalized) continue;

    const points = Array.isArray(store.markets[normalized.id]) ? store.markets[normalized.id] : [];
    const last = points[points.length - 1];
    if (last && now - Date.parse(last.at) < MIN_WRITE_INTERVAL_MS) continue;

    points.push({
      at: new Date(now).toISOString(),
      value: normalized.value,
      label: normalized.label,
    });
    store.markets[normalized.id] = points.slice(-MAX_POINTS);
    changed = true;
  }

  if (changed) {
    pruneMarkets(store);
    store.updatedAt = new Date(now).toISOString();
    saveStore(store);
  }

  return store;
}

function movement(id) {
  const store = loadStore();
  const points = store.markets[id] || [];
  if (points.length < 2) return { dir: "flat", delta: 0 };

  const previous = points[points.length - 2];
  const current = points[points.length - 1];
  const delta = Number(current.value) - Number(previous.value);
  if (!Number.isFinite(delta) || Math.abs(delta) < 0.0001) return { dir: "flat", delta: 0 };

  return {
    dir: delta > 0 ? "up" : "down",
    delta: Math.round(delta * 1000) / 1000,
    previous: previous.value,
    current: current.value,
    updatedAt: current.at,
  };
}

function movementMap(ids) {
  return (Array.isArray(ids) ? ids : []).reduce((memo, id) => {
    memo[id] = movement(id);
    return memo;
  }, {});
}

function normalizeMarket(market) {
  if (!market?.id) return null;
  const value = Number(market.value ?? market.price ?? market.point);
  if (!Number.isFinite(value)) return null;
  return {
    id: String(market.id),
    value,
    label: market.label || market.name || market.market || "",
  };
}

function pruneMarkets(store) {
  const entries = Object.entries(store.markets)
    .map(([id, points]) => [id, Array.isArray(points) ? points : []])
    .sort((a, b) => Date.parse(b[1][b[1].length - 1]?.at || 0) - Date.parse(a[1][a[1].length - 1]?.at || 0))
    .slice(0, MAX_MARKETS);

  store.markets = Object.fromEntries(entries);
}

module.exports = { record, movement, movementMap };
