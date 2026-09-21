// Builds real Stathead Season Finder / Span Finder URLs from a structured spec,
// so the discovery queries can run without a person clicking through the form.
// Param shape copied from the URLs the browser sessions actually produced
// (see statdesk/data/browser/2026-09-15/Q001,Q007,Q009).
"use strict";

const BASE = "https://www.sports-reference.com/stathead/baseball";

// Stathead's internal stat names, split by group. They are NOT shared: a
// pitcher's strikeouts are p_so and a batter's are b_so, so a single lookup
// table silently filtered a pitching query on the batting column.
const BAT = {
  HR: "b_hr", BA: "b_batting_avg", PA: "b_pa", AB: "b_ab", H: "b_h", R: "b_r",
  RBI: "b_rbi", SB: "b_sb", BB: "b_bb", SO: "b_so", OBP: "b_onbase_perc",
  SLG: "b_slugging_perc", OPS: "b_onbase_plus_slugging", "2B": "b_doubles",
  "3B": "b_triples", G: "b_games", OPSplus: "b_onbase_plus_slugging_plus",
};
const PITCH = {
  ERA: "p_earned_run_avg", IP: "p_ip", SO: "p_so", BB: "p_bb", W: "p_w",
  L: "p_l", SV: "p_sv", GS: "p_gs", G: "p_g", WHIP: "p_whip",
  SO9: "p_strikeouts_per_nine", BB9: "p_bases_on_balls_per_nine",
  H: "p_h", HR: "p_hr", ERAplus: "p_earned_run_avg_plus",
};
const STAT = BAT; // kept for callers that import it

function statName(k, group) {
  const table = group === "pitching" ? PITCH : BAT;
  if (table[k]) return table[k];
  throw new Error(`Unknown Stathead stat "${k}" for ${group}. Add it to ${group === "pitching" ? "PITCH" : "BAT"} in statdesk/lib/finder.js rather than guessing a column.`);
}

// spec: { group:'batting'|'pitching', season, filters:[[stat,'gte'|'lte',value]],
//         ageMin, ageMax, sort:[stat,'asc'|'desc'], qualifiers }
function seasonFinder(spec) {
  const group = spec.group === "pitching" ? "pitching" : "batting";
  const p = new URLSearchParams();
  p.set("request", "1");
  p.set("match", "player_season");
  p.set("year_min", String(spec.seasonMin ?? spec.season));
  p.set("year_max", String(spec.seasonMax ?? spec.season));
  p.set("comp_type", "reg");
  if (spec.qualifiers) p.set("qualifiers", spec.qualifiers);
  if (spec.ageMin != null) p.set("age_min", String(spec.ageMin));
  if (spec.ageMax != null) p.set("age_max", String(spec.ageMax));
  if (spec.sort) {
    p.set("order_by", statName(spec.sort[0], group));
    p.set("order_by_asc", spec.sort[1] === "asc" ? "1" : "0");
  }
  let i = 0;
  for (const [stat, cmp, value] of spec.filters || []) {
    i += 1;
    p.set(`ccomp[${i}]`, cmp === "lte" ? "lt" : "gt"); // Stathead's gt/lt are inclusive
    p.set(`cval[${i}]`, fmtVal(value));
    p.set(`cstat[${i}]`, statName(stat, group));
  }
  // URLSearchParams escapes the brackets; Stathead accepts either, but the
  // saved provenance URLs keep them literal, so match that for comparability.
  return `${BASE}/player-${group}-season-finder.cgi?${p.toString().replace(/%5B/g, "[").replace(/%5D/g, "]")}`;
}

// The 16 discovery rules as runnable specs. Same thresholds as the prose
// versions in sports/mlb/rules.js — change them in one place only.
const DISCOVERY = (season) => [
  { key: "hr_low_avg", label: "Discovery [hr_low_avg] power with no average", spec: { group: "batting", season, filters: [["HR", "gte", 25], ["BA", "lte", 0.22], ["PA", "gte", 350]], sort: ["BA", "asc"] } },
  { key: "avg_no_walks", label: "Discovery [avg_no_walks] high average, no walks", spec: { group: "batting", season, filters: [["BA", "gte", 0.295], ["PA", "gte", 400]], sort: ["BB", "asc"] } },
  { key: "sb_low_obp", label: "Discovery [sb_low_obp] steals without getting on", spec: { group: "batting", season, filters: [["SB", "gte", 25], ["OBP", "lte", 0.3], ["PA", "gte", 350]], sort: ["OBP", "asc"] } },
  { key: "era_low_k", label: "Discovery [era_low_k] low ERA, low strikeouts", spec: { group: "pitching", season, qualifiers: "nomin", filters: [["ERA", "lte", 3.1], ["SO9", "lte", 6.5], ["IP", "gte", 100], ["GS", "gte", 15]], sort: ["SO9", "asc"] } },
  { key: "rbi_low_ops", label: "Discovery [rbi_low_ops] RBI on a bad bat", spec: { group: "batting", season, filters: [["RBI", "gte", 80], ["OPS", "lte", 0.7], ["PA", "gte", 400]], sort: ["OPS", "asc"] } },
  { key: "hits_few_runs", label: "Discovery [hits_few_runs] hits without runs", spec: { group: "batting", season, filters: [["H", "gte", 150], ["R", "lte", 60]], sort: ["R", "asc"] } },
  { key: "young_power", label: "Discovery [young_power] power at 22 or under", spec: { group: "batting", season, ageMax: 22, filters: [["HR", "gte", 25]], sort: ["HR", "desc"] } },
  { key: "old_bat", label: "Discovery [old_bat] elite bat at 36 or older", spec: { group: "batting", season, ageMin: 36, filters: [["OPS", "gte", 0.85], ["PA", "gte", 350]], sort: ["OPS", "desc"] } },
  { key: "old_arm", label: "Discovery [old_arm] elite arm at 37 or older", spec: { group: "pitching", season, qualifiers: "nomin", ageMin: 37, filters: [["ERA", "lte", 3.25], ["IP", "gte", 100]], sort: ["ERA", "asc"] } },
  { key: "k_no_wins", label: "Discovery [k_no_wins] strikeouts, no wins", spec: { group: "pitching", season, qualifiers: "nomin", filters: [["SO", "gte", 190], ["W", "lte", 8], ["GS", "gte", 20]], sort: ["W", "asc"] } },
  { key: "saves_bad_era", label: "Discovery [saves_bad_era] saves with a bad ERA", spec: { group: "pitching", season, qualifiers: "nomin", filters: [["SV", "gte", 28], ["ERA", "gte", 4.5]], sort: ["ERA", "desc"] } },
  { key: "hr_no_doubles", label: "Discovery [hr_no_doubles] homers but no doubles", spec: { group: "batting", season, filters: [["HR", "gte", 28], ["2B", "lte", 14], ["PA", "gte", 400]], sort: ["2B", "asc"] } },
  { key: "workhorse_low_k", label: "Discovery [workhorse_low_k] innings without strikeouts", spec: { group: "pitching", season, qualifiers: "nomin", filters: [["IP", "gte", 170], ["SO", "lte", 120], ["GS", "gte", 20]], sort: ["SO", "asc"] } },
  { key: "obp_no_power", label: "Discovery [obp_no_power] on base with no power", spec: { group: "batting", season, filters: [["OBP", "gte", 0.38], ["HR", "lte", 5], ["PA", "gte", 400]], sort: ["OBP", "desc"] } },
];

// Rate stats go to three decimals the way the form submits them (.220, not .22).
function fmtVal(v) {
  if (typeof v === "number" && !Number.isInteger(v) && Math.abs(v) < 1) return v.toFixed(3);
  return String(v);
}

// A player's Baseball Reference page, for confirming career totals.
function playerPage(brId) {
  if (!/^[a-z]+\d{2}$/.test(brId)) throw new Error(`Bad Baseball Reference id "${brId}"`);
  return `https://www.baseball-reference.com/players/${brId[0]}/${brId}.shtml`;
}

module.exports = { seasonFinder, playerPage, DISCOVERY, STAT, BAT, PITCH };
