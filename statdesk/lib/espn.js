// ESPN cross-check. Second independent source for current-season numbers.
//
// Why it exists: the MLB Stats API is the primary, but a number that appears in
// two independent places is a number you can publish. ESPN's site API is public
// JSON, no key, and it is NOT IP-blocked the way Sports Reference is, so this
// runs anywhere, including a cloud runner.
//
// What it does NOT do: history. ESPN has no season finder. All-time claims come
// from Stathead, which needs the browser path in stathead-browser.js.
"use strict";

const BASE = "https://site.api.espn.com/apis/site/v2/sports/baseball/mlb";
const CORE = "https://sports.core.api.espn.com/v2/sports/baseball/leagues/mlb";

// Pull ESPN's season leaders for the categories we make claims about, so a
// claim can be checked against a source that is not the MLB API.
async function leaders(log, season) {
  const out = {};
  const cats = [
    ["homeRuns", "batting"], ["battingAverage", "batting"], ["stolenBases", "batting"],
    ["OPS", "batting"], ["walks", "batting"], ["strikeouts", "batting"],
    ["ERA", "pitching"], ["strikeouts", "pitching"], ["WHIP", "pitching"], ["wins", "pitching"],
  ];
  const { fetchJson } = require("./http");
  const r = await fetchJson(log, `${CORE}/seasons/${season}/types/2/leaders?limit=100`, { label: "espn leaders" });
  const cat = (r.json && r.json.categories) || [];
  for (const c of cat) {
    const name = c.name || c.abbreviation;
    if (!name) continue;
    out[name] = (c.leaders || []).slice(0, 25).map((l) => ({
      value: l.value,
      displayValue: l.displayValue,
      athleteRef: l.athlete && l.athlete.$ref,
    }));
  }
  return { id: r.id, categories: Object.keys(out), leaders: out, cats };
}

// Resolve one player's ESPN season line by name, for spot-checking a claim.
async function playerSeason(log, season, name) {
  const { fetchJson } = require("./http");
  const s = await fetchJson(log, `${BASE}/athletes?limit=2000`, { label: `espn athlete index` });
  const list = (s.json && s.json.items) || (s.json && s.json.athletes) || [];
  const want = norm(name);
  const hit = list.find((a) => norm(a.displayName || a.fullName || "") === want);
  if (!hit) return { found: false, name, sourceId: s.id };
  return { found: true, name, espnId: hit.id, sourceId: s.id };
}

function norm(s) {
  return String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
}

// Compare one stat between the MLB API value and ESPN's, and say plainly
// whether they agree. Disagreement is reported, never silently reconciled.
function crossCheck({ player, stat, mlbValue, espnValue, tolerance = 0 }) {
  if (espnValue === undefined || espnValue === null) {
    return { player, stat, mlbValue, espnValue: null, agree: null,
             note: "ESPN did not return this stat; single-sourced to the MLB API." };
  }
  const a = Number(mlbValue), b = Number(espnValue);
  const agree = Number.isFinite(a) && Number.isFinite(b)
    ? Math.abs(a - b) <= tolerance
    : String(mlbValue) === String(espnValue);
  return { player, stat, mlbValue, espnValue, agree,
           note: agree ? "MLB API and ESPN agree."
                       : `DISAGREEMENT: MLB API says ${mlbValue}, ESPN says ${espnValue}. Do not publish until resolved.` };
}

module.exports = { leaders, playerSeason, crossCheck, norm };
