#!/usr/bin/env node
// Decade facts from targeted Stathead queries, for the decades no free,
// complete, official feed covers: the NFL before 2000, and college football
// and basketball.
//
// Each rule is ONE filtered Season Finder query over the decade's year range,
// sorted by the stat that matters, in Nick's signed-in browser. The rows that
// come back carry stable player ids and go through the same fact logic as
// every other sport (factcore): "only / two / few" count players, the rows are
// saved as provenance. This is Stathead used as its subscribers use it — a
// question per fact — not a bulk download of Sports Reference tables.
//
// A rule whose result set was truncated (more pages than we read) can never
// claim "only" or an exact count; it is reported as "more than N".
// Filters on a stat the decade did not record (sacks before 1982) return
// nothing and the rule silently does not fire.
//
//   node statdesk/sport-facts.js nfl 1920 1930 ... [--commit]
"use strict";
const fs = require("fs");
const path = require("path");
const core = require("./lib/factcore");
const { annotate } = require("./lib/why");
const { StatheadBrowser } = require("./lib/stathead-browser");

const SH = "https://www.sports-reference.com/stathead";
const num = (v) => { if (v == null || v === "") return null; const n = Number(String(v).replace(/[,%+]/g, "")); return Number.isFinite(n) ? n : null; };
const c = (v) => (v == null ? "—" : Number(v).toLocaleString("en-US"));
const d1 = (v) => (v == null ? "—" : Number(v).toFixed(1));

// Re-check every filter on the returned rows: if the site ever ignored a
// criterion, the unfiltered rows must not turn into a false "only" line.
function passes(r, filters, pos) {
  for (const [stat, cmp, val] of filters) { const v = r[stat];
    if (cmp === "re") { if (!new RegExp(val, "i").test(String(v || ""))) return false; continue; }
    if (typeof v !== "number") return false; if (cmp === "lte" ? v > val : v < val) return false; }
  if (pos && !new RegExp(`\\b${pos}\\b`, "i").test(String(r.pos || ""))) return false;
  return true;
}

function finderUrl(base, { match = "player_season", yMin, yMax, filters = [], sort, asc = false, pos, extra = {} }) {
  const p = new URLSearchParams({ request: "1", match, year_min: String(yMin), year_max: String(yMax), ...extra });
  if (sort) { p.set("order_by", sort); p.set("order_by_asc", asc ? "1" : "0"); }
  filters.forEach(([stat, cmp, val], i) => { p.set(`ccomp[${i + 1}]`, cmp === "lte" ? "lt" : "gt"); p.set(`cval[${i + 1}]`, String(val)); p.set(`cstat[${i + 1}]`, stat); });
  let q = p.toString().replace(/%5B/g, "[").replace(/%5D/g, "]");
  if (pos) q += `&positions[]=${encodeURIComponent(pos)}`;
  return `${base}?${q}`;
}

// ------------------------------------------------------------------ NFL --
// Era bars. Passing, rushing and receiving are official from 1932;
// interceptions from 1940; sacks from 1982; tackles only from the 1990s.
function nflEra(d) { return d < 1946 ? 1 : d < 1960 ? 2 : d < 1978 ? 3 : d < 1990 ? 4 : 5; }
const NT = {
  1: { td: 15, yds: 1500, int: 20, ry: 1000, rtd: 10, car: 200, rec: 50, recy: 900, rectd: 12, dint: 10, fgm: 10, pts: 90, alltd: 12, scrim: 1300, apy: 1600 },
  2: { td: 25, yds: 3000, int: 28, ry: 1300, rtd: 14, car: 250, rec: 70, recy: 1300, rectd: 15, dint: 11, fgm: 22, pts: 120, alltd: 16, scrim: 1700, apy: 2000 },
  3: { td: 30, yds: 3500, int: 30, ry: 1500, rtd: 16, car: 300, rec: 80, recy: 1400, rectd: 15, dint: 10, fgm: 28, pts: 140, alltd: 18, scrim: 2000, apy: 2300 },
  4: { td: 33, yds: 4300, int: 28, ry: 1800, rtd: 18, car: 370, rec: 100, recy: 1500, rectd: 15, dint: 9, fgm: 32, pts: 150, alltd: 20, scrim: 2200, apy: 2500 },
  5: { td: 35, yds: 4400, int: 25, ry: 1800, rtd: 18, car: 370, rec: 110, recy: 1600, rectd: 16, dint: 9, fgm: 35, pts: 150, alltd: 22, scrim: 2200, apy: 2500 },
};
const d0 = () => true; // interceptions: 1920s/30s queries simply return nothing
function nflRules(e) {
  const t = NT[e]; const R = [];
  const r = (key, head, filters, sort, say, extra = {}) => R.push({ key, head, filters, sort, say, ...extra });
  r("td_hi", `throw ${t.td} touchdown passes`, [["pass_td", "gte", t.td]], "pass_td", (x) => `${x.pass_td} TD, ${x.pass_int ?? "?"} INT`);
  r("yds_hi", `throw for ${c(t.yds)} yards`, [["pass_yds", "gte", t.yds]], "pass_yds", (x) => `${c(x.pass_yds)} yds`);
  r("int_hi", `throw ${t.int} interceptions`, [["pass_int", "gte", t.int]], "pass_int", (x) => `${x.pass_int} INT, ${x.pass_td} TD`);
  r("td_int", `throw ${t.td - 5} touchdown passes and ${Math.max(20, t.int - 5)} interceptions`, [["pass_td", "gte", t.td - 5], ["pass_int", "gte", Math.max(20, t.int - 5)]], "pass_int", (x) => `${x.pass_td} TD, ${x.pass_int} INT`);
  r("yds_lowtd", `throw for ${c(t.yds - 700)} yards with ${Math.round(t.td / 2)} or fewer touchdowns`, [["pass_yds", "gte", t.yds - 700], ["pass_td", "lte", Math.round(t.td / 2)]], "pass_yds", (x) => `${c(x.pass_yds)} yds, ${x.pass_td} TD`);
  if (e >= 2) r("cmp_hi", `complete ${60 + 2 * (e - 2)}% of their passes`, [["pass_att", "gte", 250], ["pass_cmp_pct", "gte", 60 + 2 * (e - 2)]], "pass_cmp_pct", (x) => `${x.pass_cmp_pct}% on ${x.pass_att} att`, { floor: "250+ attempts" });
  if (e >= 2) r("rate_hi", `post a passer rating of ${e >= 5 ? 110 : 100}`, [["pass_att", "gte", 250], ["pass_rating", "gte", e >= 5 ? 110 : 100]], "pass_rating", (x) => `${x.pass_rating} rating`, { floor: "250+ attempts" });
  if (e >= 2) r("ypa_hi", "average 8.5 yards a pass attempt", [["pass_att", "gte", 200], ["pass_yds_per_att", "gte", 8.5]], "pass_yds_per_att", (x) => `${x.pass_yds_per_att} Y/A on ${x.pass_att} att`, { floor: "200+ attempts" });
  if (e >= 4) r("sacked", "get sacked 55 times", [["pass_sacked", "gte", 55]], "pass_sacked", (x) => `sacked ${x.pass_sacked} times`);
  if (e >= 3) r("qb_rush", "rush for 600 yards as a quarterback", [["rush_yds", "gte", 600]], "rush_yds", (x) => `${c(x.rush_yds)} rush yds`, { pos: "qb" });
  if (e >= 3) r("qb_rtd", "run for 8 touchdowns as a quarterback", [["rush_td", "gte", 8]], "rush_td", (x) => `${x.rush_td} rush TD`, { pos: "qb" });
  r("ry_hi", `rush for ${c(t.ry)} yards`, [["rush_yds", "gte", t.ry]], "rush_yds", (x) => `${c(x.rush_yds)} yds`);
  r("rtd_hi", `run for ${t.rtd} touchdowns`, [["rush_td", "gte", t.rtd]], "rush_td", (x) => `${x.rush_td} rush TD`);
  r("car_hi", `carry the ball ${t.car} times`, [["rush_att", "gte", t.car]], "rush_att", (x) => `${x.rush_att} carries`);
  r("ypc_hi", "average 5.5 yards a carry", [["rush_att", "gte", 150], ["rush_yds_per_att", "gte", 5.5]], "rush_yds_per_att", (x) => `${x.rush_yds_per_att} ypc on ${x.rush_att}`, { floor: "150+ carries" });
  if (e >= 3) r("ry_slow", "rush for 1,000 yards at 3.8 a carry or worse", [["rush_yds", "gte", 1000], ["rush_yds_per_att", "lte", 3.8]], "rush_att", (x) => `${c(x.rush_yds)} yds, ${x.rush_yds_per_att} ypc`);
  if (e >= 3) r("rb_rec", `catch ${e >= 5 ? 80 : e >= 4 ? 70 : 55} passes as a running back`, [["rec", "gte", e >= 5 ? 80 : e >= 4 ? 70 : 55]], "rec", (x) => `${x.rec} rec, ${c(x.rec_yds)} yds`, { pos: "rb" });
  r("scrim_hi", `gain ${c(t.scrim)} yards from scrimmage`, [["yds_from_scrimmage", "gte", t.scrim]], "yds_from_scrimmage", (x) => `${c(x.yds_from_scrimmage)} scrimmage yds`);
  r("alltd_hi", `score ${t.alltd} touchdowns`, [["all_td", "gte", t.alltd]], "all_td", (x) => `${x.all_td} TD`);
  r("rec_hi", `catch ${t.rec} passes`, [["rec", "gte", t.rec]], "rec", (x) => `${x.rec} rec`);
  r("recy_hi", `gain ${c(t.recy)} receiving yards`, [["rec_yds", "gte", t.recy]], "rec_yds", (x) => `${c(x.rec_yds)} yds`);
  r("rectd_hi", `catch ${t.rectd} touchdown passes`, [["rec_td", "gte", t.rectd]], "rec_td", (x) => `${x.rec_td} rec TD`);
  r("ypr_hi", "average 22 yards a catch", [["rec", "gte", 30], ["rec_yds_per_rec", "gte", 22]], "rec_yds_per_rec", (x) => `${x.rec_yds_per_rec} per catch, ${x.rec} rec`, { floor: "30+ catches" });
  if (e >= 4) r("rec_short", "catch 90 passes for under 1,000 yards", [["rec", "gte", 90], ["rec_yds", "lte", 999]], "rec", (x) => `${x.rec} rec, ${x.rec_yds} yds`);
  r("recy_few", "gain 1,000 receiving yards on 50 or fewer catches", [["rec_yds", "gte", 1000], ["rec", "lte", 50]], "rec_yds_per_rec", (x) => `${c(x.rec_yds)} yds on ${x.rec} rec`);
  if (e >= 3) r("te_1000", "gain 1,000 receiving yards as a tight end", [["rec_yds", "gte", 1000]], "rec_yds", (x) => `${c(x.rec_yds)} yds, ${x.rec} rec`, { pos: "te" });
  if (d0(e)) r("dint_hi", `intercept ${t.dint} passes`, [["def_int", "gte", t.dint]], "def_int", (x) => `${x.def_int} INT`);
  r("int_td", "return 3 interceptions for touchdowns", [["def_int_td", "gte", 3]], "def_int_td", (x) => `${x.def_int_td} pick-sixes`);
  if (e >= 4) r("sacks_hi", `record ${e >= 5 ? 16 : 18} sacks`, [["sacks", "gte", e >= 5 ? 16 : 18]], "sacks", (x) => `${x.sacks} sacks`);
  if (e >= 5) r("tkl_hi", "make 170 tackles", [["tackles_combined", "gte", 170]], "tackles_combined", (x) => `${x.tackles_combined} tackles`);
  if (e >= 5) r("ff_hi", "force 6 fumbles", [["fumbles_forced", "gte", 6]], "fumbles_forced", (x) => `${x.fumbles_forced} forced`);
  r("fumrec_hi", "recover 6 fumbles", [["fumbles_rec", "gte", 6]], "fumbles_rec", (x) => `${x.fumbles_rec} recoveries`);
  if (e >= 2) r("fgm_hi", `make ${t.fgm} field goals`, [["fgm", "gte", t.fgm]], "fgm", (x) => `${x.fgm}-${x.fga} FG`);
  if (e >= 3) r("fg_perfect", "go a season without missing a field goal", [["fga", "gte", 15], ["fg_pct", "gte", 100]], "fga", (x) => `${x.fgm}-for-${x.fga}`, { floor: "15+ attempts" });
  r("pts_hi", `score ${t.pts} points`, [["scoring", "gte", t.pts]], "scoring", (x) => `${x.scoring} pts`);
  r("kr_td", "return 3 kickoffs for touchdowns", [["kick_ret_td", "gte", 3]], "kick_ret_td", (x) => `${x.kick_ret_td} KR TD`);
  r("pr_td", "return 3 punts for touchdowns", [["punt_ret_td", "gte", 3]], "punt_ret_td", (x) => `${x.punt_ret_td} PR TD`);
  if (e >= 2) r("apy_hi", `gain ${c(t.apy)} all-purpose yards`, [["all_purpose_yds", "gte", t.apy]], "all_purpose_yds", (x) => `${c(x.all_purpose_yds)} all-purpose yds`);
  r("punt_avg", "average 46 yards a punt", [["punt", "gte", 40], ["punt_yds_per_punt", "gte", 46]], "punt_yds_per_punt", (x) => `${x.punt_yds_per_punt} avg on ${x.punt}`, { floor: "40+ punts" });
  if (e >= 3) r("fumbles_hi", "fumble 14 times", [["fumbles", "gte", 14]], "fumbles", (x) => `${x.fumbles} fumbles`);
  // Age (Pro Football Reference's season age) and games-played angles.
  const old = (key, head, stat, v, a, say) => r(key, `${head} at age ${a} or older`, [[stat, "gte", v]], stat, say, { params: { age_min: a }, local: [["age", "gte", a]] });
  const young = (key, head, stat, v, a, say) => r(key, `${head} at age ${a} or younger`, [[stat, "gte", v]], stat, say, { params: { age_max: a }, local: [["age", "lte", a]] });
  if (e >= 2) old("old_py", `throw for ${c(e >= 4 ? 3000 : 2500)} yards`, "pass_yds", e >= 4 ? 3000 : 2500, 36, (x) => `${c(x.pass_yds)} yds at ${x.age}`);
  old("old_ry", `rush for ${c(e >= 3 ? 1000 : 700)} yards`, "rush_yds", e >= 3 ? 1000 : 700, 31, (x) => `${c(x.rush_yds)} yds at ${x.age}`);
  if (e >= 2) old("old_rec", `catch ${e >= 4 ? 60 : 45} passes`, "rec", e >= 4 ? 60 : 45, 34, (x) => `${x.rec} rec at ${x.age}`);
  if (e >= 2) old("old_dint", "intercept 7 passes", "def_int", 7, 33, (x) => `${x.def_int} INT at ${x.age}`);
  young("yng_ry", `rush for ${c(e >= 3 ? 1200 : 800)} yards`, "rush_yds", e >= 3 ? 1200 : 800, 22, (x) => `${c(x.rush_yds)} yds at ${x.age}`);
  if (e >= 2) young("yng_td", `throw ${e >= 3 ? 20 : 15} touchdown passes`, "pass_td", e >= 3 ? 20 : 15, 23, (x) => `${x.pass_td} TD at ${x.age}`);
  if (e >= 2) young("yng_recy", `gain ${c(e >= 3 ? 1000 : 800)} receiving yards`, "rec_yds", e >= 3 ? 1000 : 800, 22, (x) => `${c(x.rec_yds)} yds at ${x.age}`);
  if (e >= 4) young("yng_sacks", "record 12 sacks", "sacks", 12, 23, (x) => `${x.sacks} sacks at ${x.age}`);
  if (e >= 3) r("games_ry", "rush for 1,000 yards in 12 or fewer games", [["rush_yds", "gte", 1000], ["games", "lte", 12]], "rush_yds", (x) => `${c(x.rush_yds)} yds in ${x.games} games`);
  if (e >= 3) r("games_td", "throw 20 touchdown passes in 10 or fewer games", [["pass_td", "gte", 20], ["games", "lte", 10]], "pass_td", (x) => `${x.pass_td} TD in ${x.games} games`);
  if (e >= 3) r("qb_w", `win ${e >= 4 ? 14 : 12} games as a starting quarterback`, [["qb_w", "gte", e >= 4 ? 14 : 12]], "qb_w", (x) => `${x.qb_w}-${x.qb_l}${x.qb_t ? `-${x.qb_t}` : ""}`);
  if (e >= 3) r("comebacks", "lead 5 fourth-quarter comebacks", [["comebacks", "gte", 5]], "comebacks", (x) => `${x.comebacks} comebacks`);
  if (e >= 2) r("int_pct", "throw an interception on 7% of their passes", [["pass_att", "gte", 250], ["pass_int_pct", "gte", 7]], "pass_int_pct", (x) => `${x.pass_int_pct}% (${x.pass_int} INT)`, { floor: "250+ attempts" });
  if (e >= 2) r("td_pct", "throw a touchdown on 8% of their passes", [["pass_att", "gte", 250], ["pass_td_pct", "gte", 8]], "pass_td_pct", (x) => `${x.pass_td_pct}% (${x.pass_td} TD)`, { floor: "250+ attempts" });
  if (e >= 2) r("rypg", `average ${e >= 3 ? 110 : 90} rushing yards a game`, [["games", "gte", 8], ["rush_yds_per_g", "gte", e >= 3 ? 110 : 90]], "rush_yds_per_g", (x) => `${x.rush_yds_per_g} per game`, { floor: "8+ games" });
  if (e >= 3) r("recypg", "average 100 receiving yards a game", [["games", "gte", 8], ["rec_yds_per_g", "gte", 100]], "rec_yds_per_g", (x) => `${x.rec_yds_per_g} per game`, { floor: "8+ games" });
  if (e >= 4) r("pypg", "average 300 passing yards a game", [["games", "gte", 8], ["pass_yds_per_g", "gte", 300]], "pass_yds_per_g", (x) => `${x.pass_yds_per_g} per game`, { floor: "8+ games" });
  if (e >= 2) r("xpm_hi", `make ${e >= 3 ? 60 : 50} extra points`, [["xpm", "gte", e >= 3 ? 60 : 50]], "xpm", (x) => `${x.xpm}-${x.xpa} XP`);
  r("safety", "record 2 safeties", [["safety_md", "gte", 2]], "safety_md", (x) => `${x.safety_md} safeties`);
  if (e >= 2) r("pr_avg", "average 14 yards a punt return", [["punt_ret", "gte", 20], ["punt_ret_yds_per_ret", "gte", 14]], "punt_ret_yds_per_ret", (x) => `${x.punt_ret_yds_per_ret} on ${x.punt_ret} returns`, { floor: "20+ returns" });
  if (e >= 2) r("kr_avg", "average 30 yards a kickoff return", [["kick_ret", "gte", 20], ["kick_ret_yds_per_ret", "gte", 30]], "kick_ret_yds_per_ret", (x) => `${x.kick_ret_yds_per_ret} on ${x.kick_ret} returns`, { floor: "20+ returns" });
  if (e >= 2) r("int_yds", "return interceptions for 200 yards", [["def_int_yds", "gte", 200]], "def_int_yds", (x) => `${x.def_int_yds} return yds, ${x.def_int} INT`);
  return R;
}
function nflExtremes(e) {
  const t = NT[e]; const X = [];
  const x = (key, sort, filters, text, asc = false) => X.push({ key, sort, filters, text, asc });
  x("x_py", "pass_yds", [["pass_yds", "gte", 1]], (r, s, d) => `Most passing yards in a season in the ${d}: ${r.name}, ${s} — ${c(r.pass_yds)}.`);
  x("x_ptd", "pass_td", [["pass_td", "gte", 1]], (r, s, d) => `Most touchdown passes in a season in the ${d}: ${r.name}, ${s} — ${r.pass_td}.`);
  x("x_int", "pass_int", [["pass_int", "gte", 1]], (r, s, d) => `Most interceptions thrown in a season in the ${d}: ${r.name}, ${s} — ${r.pass_int}.`);
  x("x_ry", "rush_yds", [["rush_yds", "gte", 1]], (r, s, d) => `Most rushing yards in a season in the ${d}: ${r.name}, ${s} — ${c(r.rush_yds)}.`);
  x("x_rec", "rec", [["rec", "gte", 1]], (r, s, d) => `Most catches in a season in the ${d}: ${r.name}, ${s} — ${r.rec}.`);
  x("x_recy", "rec_yds", [["rec_yds", "gte", 1]], (r, s, d) => `Most receiving yards in a season in the ${d}: ${r.name}, ${s} — ${c(r.rec_yds)}.`);
  x("x_dint", "def_int", [["def_int", "gte", 1]], (r, s, d) => `Most interceptions in a season in the ${d}: ${r.name}, ${s} — ${r.def_int}.`);
  if (e >= 4) x("x_sacks", "sacks", [["sacks", "gte", 1]], (r, s, d) => `Most sacks in a season in the ${d}: ${r.name}, ${s} — ${r.sacks}.`);
  x("x_pts", "scoring", [["scoring", "gte", 1]], (r, s, d) => `Most points scored in a season in the ${d}: ${r.name}, ${s} — ${r.scoring}.`);
  x("x_alltd", "all_td", [["all_td", "gte", 1]], (r, s, d) => `Most touchdowns in a season in the ${d}: ${r.name}, ${s} — ${r.all_td}.`);
  x("x_ypc", "rush_yds_per_att", [["rush_att", "gte", 150]], (r, s, d) => `Best yards per carry in a season (150+ carries) in the ${d}: ${r.name}, ${s} — ${r.rush_yds_per_att}.`);
  x("x_ypr", "rec_yds_per_rec", [["rec", "gte", 40]], (r, s, d) => `Best yards per catch in a season (40+ catches) in the ${d}: ${r.name}, ${s} — ${r.rec_yds_per_rec}.`);
  if (e >= 2) x("x_cmp_low", "pass_cmp_pct", [["pass_yds", "gte", Math.round(t.yds * 0.7 / 500) * 500]], (r, s, d) => `Lowest completion percentage by a ${c(Math.round(t.yds * 0.7 / 500) * 500)}-yard passer in the ${d}: ${r.name}, ${s} — ${r.pass_cmp_pct}%.`, true);
  if (e >= 2) x("x_rate", "pass_rating", [["pass_att", "gte", 250]], (r, s, d) => `Highest passer rating in a season (250+ attempts) in the ${d}: ${r.name}, ${s} — ${r.pass_rating}.`);
  x("x_apy", "all_purpose_yds", [["all_purpose_yds", "gte", 1]], (r, s, d) => `Most all-purpose yards in a season in the ${d}: ${r.name}, ${s} — ${c(r.all_purpose_yds)}.`);
  if (e >= 2) x("x_fgm", "fgm", [["fgm", "gte", 1]], (r, s, d) => `Most field goals in a season in the ${d}: ${r.name}, ${s} — ${r.fgm} of ${r.fga}.`);
  x("x_car", "rush_att", [["rush_att", "gte", 1]], (r, s, d) => `Most carries in a season in the ${d}: ${r.name}, ${s} — ${r.rush_att}.`);
  x("x_rtd", "rush_td", [["rush_td", "gte", 1]], (r, s, d) => `Most rushing touchdowns in a season in the ${d}: ${r.name}, ${s} — ${r.rush_td}.`);
  x("x_rectd", "rec_td", [["rec_td", "gte", 1]], (r, s, d) => `Most touchdown catches in a season in the ${d}: ${r.name}, ${s} — ${r.rec_td}.`);
  x("x_scrim", "yds_from_scrimmage", [["yds_from_scrimmage", "gte", 1]], (r, s, d) => `Most yards from scrimmage in a season in the ${d}: ${r.name}, ${s} — ${c(r.yds_from_scrimmage)}.`);
  if (e >= 5) x("x_ff", "fumbles_forced", [["fumbles_forced", "gte", 1]], (r, s, d) => `Most forced fumbles in a season in the ${d}: ${r.name}, ${s} — ${r.fumbles_forced}.`);
  x("x_punt", "punt_yds_per_punt", [["punt", "gte", 40]], (r, s, d) => `Best punting average in a season (40+ punts) in the ${d}: ${r.name}, ${s} — ${r.punt_yds_per_punt}.`);
  return X;
}
function nflTotals(e) {
  const T = [];
  const tt = (key, sort, text) => T.push({ key, sort, text });
  tt("t_py", "pass_yds", (r, d) => `Most passing yards of the ${d}: ${r.name}, ${c(r.pass_yds)}.`);
  tt("t_ptd", "pass_td", (r, d) => `Most touchdown passes of the ${d}: ${r.name}, ${r.pass_td}.`);
  tt("t_ry", "rush_yds", (r, d) => `Most rushing yards of the ${d}: ${r.name}, ${c(r.rush_yds)}.`);
  tt("t_rec", "rec", (r, d) => `Most catches of the ${d}: ${r.name}, ${c(r.rec)}.`);
  tt("t_recy", "rec_yds", (r, d) => `Most receiving yards of the ${d}: ${r.name}, ${c(r.rec_yds)}.`);
  tt("t_dint", "def_int", (r, d) => `Most interceptions of the ${d}: ${r.name}, ${r.def_int}.`);
  if (e >= 4) tt("t_sacks", "sacks", (r, d) => `Most sacks of the ${d}: ${r.name}, ${r.sacks}.`);
  tt("t_pts", "scoring", (r, d) => `Most points scored in the ${d}: ${r.name}, ${c(r.scoring)}.`);
  tt("t_alltd", "all_td", (r, d) => `Most touchdowns of the ${d}: ${r.name}, ${r.all_td}.`);
  if (e >= 2) tt("t_fgm", "fgm", (r, d) => `Most field goals of the ${d}: ${r.name}, ${r.fgm}.`);
  tt("t_int", "pass_int", (r, d) => `Most interceptions thrown in the ${d}: ${r.name}, ${r.pass_int}.`);
  return T;
}
function nflNear(e) {
  const N = [];
  N.push({ key: "n_ry", filters: [["rush_yds", "gte", 990], ["rush_yds", "lte", 999]], sort: "rush_yds", what: "between 990 and 999 rushing yards", one: "just shy of 1,000" });
  N.push({ key: "n_recy", filters: [["rec_yds", "gte", 990], ["rec_yds", "lte", 999]], sort: "rec_yds", what: "between 990 and 999 receiving yards", one: "just shy of 1,000" });
  if (e >= 3) N.push({ key: "n_py", filters: [["pass_yds", "gte", 2990], ["pass_yds", "lte", 2999]], sort: "pass_yds", what: "between 2,990 and 2,999 passing yards", one: "just shy of 3,000" });
  if (e >= 4) N.push({ key: "n_py4", filters: [["pass_yds", "gte", 3990], ["pass_yds", "lte", 3999]], sort: "pass_yds", what: "between 3,990 and 3,999 passing yards", one: "just shy of 4,000" });
  if (e >= 4) N.push({ key: "n_rec", filters: [["rec", "gte", 99], ["rec", "lte", 99]], sort: "rec", what: "exactly 99 catches", one: "one short of 100" });
  return N;
}

// ------------------------------------------------------ college football --
// Sports Reference's college football database: player seasons from 1956,
// team seasons from 1869, major-college (today's FBS) programs.
function cfbEra(d) { return d < 1970 ? 1 : d < 1990 ? 2 : d < 2010 ? 3 : 4; }
const CT = {
  1: { td: 20, yds: 2500, int: 20, ry: 1300, rtd: 15, car: 250, rec: 70, recy: 1000, rectd: 12, dint: 10, alltd: 18, pts: 110, tot: 2500, apy: 2000, fgm: 15, rate: 150, cmp: 60 },
  2: { td: 30, yds: 3500, int: 22, ry: 1800, rtd: 22, car: 330, rec: 90, recy: 1400, rectd: 15, dint: 11, alltd: 25, pts: 150, tot: 3800, apy: 2500, fgm: 25, rate: 165, cmp: 65 },
  3: { td: 40, yds: 4500, int: 20, ry: 2000, rtd: 25, car: 350, rec: 110, recy: 1700, rectd: 18, dint: 10, alltd: 28, pts: 170, tot: 4800, apy: 2800, fgm: 28, rate: 175, cmp: 68 },
  4: { td: 45, yds: 5000, int: 18, ry: 2000, rtd: 28, car: 330, rec: 120, recy: 1700, rectd: 20, dint: 9, alltd: 32, pts: 190, tot: 5500, apy: 2900, fgm: 28, rate: 190, cmp: 72 },
};
function cfbRules(e) {
  const t = CT[e]; const R = [];
  const r = (key, head, filters, sort, say, extra = {}) => R.push({ key, head, filters, sort, say, ...extra });
  r("td_hi", `throw ${t.td} touchdown passes`, [["pass_td", "gte", t.td]], "pass_td", (x) => `${x.pass_td} TD, ${x.pass_int} INT`);
  r("yds_hi", `throw for ${c(t.yds)} yards`, [["pass_yds", "gte", t.yds]], "pass_yds", (x) => `${c(x.pass_yds)} yds`);
  r("int_hi", `throw ${t.int} interceptions`, [["pass_int", "gte", t.int]], "pass_int", (x) => `${x.pass_int} INT, ${x.pass_td} TD`);
  r("int_low", `throw for ${c(Math.round(t.yds * 0.7))} yards with 3 or fewer interceptions`, [["pass_yds", "gte", Math.round(t.yds * 0.7)], ["pass_int", "lte", 3]], "pass_yds", (x) => `${c(x.pass_yds)} yds, ${x.pass_int} INT`);
  r("cmp_hi", `complete ${t.cmp + 5}% of their passes`, [["pass_att", "gte", 250], ["pass_cmp_pct", "gte", t.cmp + 5]], "pass_cmp_pct", (x) => `${x.pass_cmp_pct}% on ${x.pass_att} att`, { floor: "250+ attempts" });
  r("rate_hi", `post a passer rating of ${t.rate}`, [["pass_att", "gte", 200], ["pass_rating", "gte", t.rate]], "pass_rating", (x) => `${x.pass_rating} rating`, { floor: "200+ attempts" });
  r("ypa_hi", "average 10 yards a pass attempt", [["pass_att", "gte", 200], ["pass_yds_per_att", "gte", 10]], "pass_yds_per_att", (x) => `${x.pass_yds_per_att} Y/A on ${x.pass_att} att`, { floor: "200+ attempts" });
  r("ry_hi", `rush for ${c(t.ry)} yards`, [["rush_yds", "gte", t.ry]], "rush_yds", (x) => `${c(x.rush_yds)} yds`);
  r("rtd_hi", `run for ${t.rtd} touchdowns`, [["rush_td", "gte", t.rtd]], "rush_td", (x) => `${x.rush_td} rush TD`);
  r("car_hi", `carry the ball ${t.car} times`, [["rush_att", "gte", t.car]], "rush_att", (x) => `${x.rush_att} carries`);
  r("ypc_hi", "average 7 yards a carry", [["rush_att", "gte", 150], ["rush_yds_per_att", "gte", 7]], "rush_yds_per_att", (x) => `${x.rush_yds_per_att} ypc on ${x.rush_att}`, { floor: "150+ carries" });
  r("qb_rush", "rush for 1,000 yards as a quarterback", [["rush_yds", "gte", 1000]], "rush_yds", (x) => `${c(x.rush_yds)} rush yds`, { pos: "qb" });
  r("rec_hi", `catch ${t.rec} passes`, [["rec", "gte", t.rec]], "rec", (x) => `${x.rec} rec`);
  r("recy_hi", `gain ${c(t.recy)} receiving yards`, [["rec_yds", "gte", t.recy]], "rec_yds", (x) => `${c(x.rec_yds)} yds`);
  r("rectd_hi", `catch ${t.rectd} touchdown passes`, [["rec_td", "gte", t.rectd]], "rec_td", (x) => `${x.rec_td} rec TD`);
  r("ypr_hi", "average 24 yards a catch", [["rec", "gte", 30], ["rec_yds_per_rec", "gte", 24]], "rec_yds_per_rec", (x) => `${x.rec_yds_per_rec} per catch, ${x.rec} rec`, { floor: "30+ catches" });
  r("recy_few", "gain 1,000 receiving yards on 45 or fewer catches", [["rec_yds", "gte", 1000], ["rec", "lte", 45]], "rec_yds_per_rec", (x) => `${c(x.rec_yds)} yds on ${x.rec} rec`);
  r("dint_hi", `intercept ${t.dint} passes`, [["def_int", "gte", t.dint]], "def_int", (x) => `${x.def_int} INT`);
  r("int_td", "return 3 interceptions for touchdowns", [["def_int_td", "gte", 3]], "def_int_td", (x) => `${x.def_int_td} pick-sixes`);
  if (e >= 3) r("sacks_hi", "record 16 sacks", [["sacks", "gte", 16]], "sacks", (x) => `${x.sacks} sacks`);
  if (e >= 3) r("tkl_hi", "make 170 tackles", [["tackles_combined", "gte", 170]], "tackles_combined", (x) => `${x.tackles_combined} tackles`);
  if (e >= 3) r("tfl_hi", "make 30 tackles for loss", [["tackles_loss", "gte", 30]], "tackles_loss", (x) => `${x.tackles_loss} TFL`);
  if (e >= 3) r("ff_hi", "force 7 fumbles", [["fumbles_forced", "gte", 7]], "fumbles_forced", (x) => `${x.fumbles_forced} forced`);
  r("alltd_hi", `score ${t.alltd} touchdowns`, [["all_td", "gte", t.alltd]], "all_td", (x) => `${x.all_td} TD`);
  r("pts_hi", `score ${t.pts} points`, [["scoring", "gte", t.pts]], "scoring", (x) => `${x.scoring} pts`);
  r("tot_hi", `produce ${c(t.tot)} yards of total offense`, [["total_offense", "gte", t.tot]], "total_offense", (x) => `${c(x.total_offense)} total yds`);
  r("apy_hi", `gain ${c(t.apy)} all-purpose yards`, [["all_purpose_yds", "gte", t.apy]], "all_purpose_yds", (x) => `${c(x.all_purpose_yds)} all-purpose yds`);
  r("fgm_hi", `make ${t.fgm} field goals`, [["fgm", "gte", t.fgm]], "fgm", (x) => `${x.fgm}-${x.fga} FG`);
  r("fg_perfect", "go a season without missing a field goal", [["fga", "gte", 12], ["fg_pct", "gte", 100]], "fga", (x) => `${x.fgm}-for-${x.fga}`, { floor: "12+ attempts" });
  r("kr_td", "return 3 kickoffs for touchdowns", [["kick_ret_td", "gte", 3]], "kick_ret_td", (x) => `${x.kick_ret_td} KR TD`);
  r("pr_td", "return 3 punts for touchdowns", [["punt_ret_td", "gte", 3]], "punt_ret_td", (x) => `${x.punt_ret_td} PR TD`);
  r("punt_avg", "average 47 yards a punt", [["punt", "gte", 40], ["punt_yds_per_punt", "gte", 47]], "punt_yds_per_punt", (x) => `${x.punt_yds_per_punt} avg on ${x.punt}`, { floor: "40+ punts" });
  const fr = { params: { "class[]": "fr" }, local: [["class", "re", "^fr"]] };
  if (e >= 2) {
    r("fr_ry", "rush for 1,300 yards as a freshman", [["rush_yds", "gte", 1300]], "rush_yds", (x) => `${c(x.rush_yds)} yds`, fr);
    r("fr_recy", "gain 1,000 receiving yards as a freshman", [["rec_yds", "gte", 1000]], "rec_yds", (x) => `${c(x.rec_yds)} yds`, fr);
    r("fr_td", `throw ${e >= 3 ? 30 : 20} touchdown passes as a freshman`, [["pass_td", "gte", e >= 3 ? 30 : 20]], "pass_td", (x) => `${x.pass_td} TD`, fr);
    r("fr_int", "intercept 7 passes as a freshman", [["def_int", "gte", 7]], "def_int", (x) => `${x.def_int} INT`, fr);
  }
  r("rtd_rec", "run for 15 touchdowns while averaging 6 yards a carry", [["rush_td", "gte", 15], ["rush_yds_per_att", "gte", 6]], "rush_td", (x) => `${x.rush_td} TD, ${x.rush_yds_per_att} ypc`);
  r("ret_yds", "gain 1,000 kick and punt return yards", [["ret_yds", "gte", 1000]], "ret_yds", (x) => `${c(x.ret_yds)} return yds`);
  return R;
}
function cfbExtremes() {
  const X = []; const x = (key, sort, filters, text, asc = false) => X.push({ key, sort, filters, text, asc });
  x("x_py", "pass_yds", [["pass_yds", "gte", 1]], (r, s, d) => `Most passing yards in a season in the ${d}: ${r.name}, ${r.team}, ${s} — ${c(r.pass_yds)}.`);
  x("x_ptd", "pass_td", [["pass_td", "gte", 1]], (r, s, d) => `Most touchdown passes in a season in the ${d}: ${r.name}, ${r.team}, ${s} — ${r.pass_td}.`);
  x("x_ry", "rush_yds", [["rush_yds", "gte", 1]], (r, s, d) => `Most rushing yards in a season in the ${d}: ${r.name}, ${r.team}, ${s} — ${c(r.rush_yds)}.`);
  x("x_rtd", "rush_td", [["rush_td", "gte", 1]], (r, s, d) => `Most rushing touchdowns in a season in the ${d}: ${r.name}, ${r.team}, ${s} — ${r.rush_td}.`);
  x("x_rec", "rec", [["rec", "gte", 1]], (r, s, d) => `Most catches in a season in the ${d}: ${r.name}, ${r.team}, ${s} — ${r.rec}.`);
  x("x_recy", "rec_yds", [["rec_yds", "gte", 1]], (r, s, d) => `Most receiving yards in a season in the ${d}: ${r.name}, ${r.team}, ${s} — ${c(r.rec_yds)}.`);
  x("x_dint", "def_int", [["def_int", "gte", 1]], (r, s, d) => `Most interceptions in a season in the ${d}: ${r.name}, ${r.team}, ${s} — ${r.def_int}.`);
  x("x_pts", "scoring", [["scoring", "gte", 1]], (r, s, d) => `Most points scored in a season in the ${d}: ${r.name}, ${r.team}, ${s} — ${r.scoring}.`);
  x("x_tot", "total_offense", [["total_offense", "gte", 1]], (r, s, d) => `Most total offense in a season in the ${d}: ${r.name}, ${r.team}, ${s} — ${c(r.total_offense)} yards.`);
  x("x_apy", "all_purpose_yds", [["all_purpose_yds", "gte", 1]], (r, s, d) => `Most all-purpose yards in a season in the ${d}: ${r.name}, ${r.team}, ${s} — ${c(r.all_purpose_yds)}.`);
  x("x_ypc", "rush_yds_per_att", [["rush_att", "gte", 150]], (r, s, d) => `Best yards per carry in a season (150+ carries) in the ${d}: ${r.name}, ${r.team}, ${s} — ${r.rush_yds_per_att}.`);
  x("x_rate", "pass_rating", [["pass_att", "gte", 200]], (r, s, d) => `Highest passer rating in a season (200+ attempts) in the ${d}: ${r.name}, ${r.team}, ${s} — ${r.pass_rating}.`);
  x("x_sacks", "sacks", [["sacks", "gte", 1]], (r, s, d) => `Most sacks in a season in the ${d}: ${r.name}, ${r.team}, ${s} — ${r.sacks}.`);
  x("x_fgm", "fgm", [["fgm", "gte", 1]], (r, s, d) => `Most field goals in a season in the ${d}: ${r.name}, ${r.team}, ${s} — ${r.fgm} of ${r.fga}.`);
  return X;
}
function cfbTotals() {
  const T = []; const tt = (key, sort, text) => T.push({ key, sort, text });
  tt("t_py", "pass_yds", (r, d) => `Most passing yards of the ${d}: ${r.name}, ${c(r.pass_yds)}.`);
  tt("t_ptd", "pass_td", (r, d) => `Most touchdown passes of the ${d}: ${r.name}, ${r.pass_td}.`);
  tt("t_ry", "rush_yds", (r, d) => `Most rushing yards of the ${d}: ${r.name}, ${c(r.rush_yds)}.`);
  tt("t_rtd", "rush_td", (r, d) => `Most rushing touchdowns of the ${d}: ${r.name}, ${r.rush_td}.`);
  tt("t_rec", "rec", (r, d) => `Most catches of the ${d}: ${r.name}, ${c(r.rec)}.`);
  tt("t_recy", "rec_yds", (r, d) => `Most receiving yards of the ${d}: ${r.name}, ${c(r.rec_yds)}.`);
  tt("t_dint", "def_int", (r, d) => `Most interceptions of the ${d}: ${r.name}, ${r.def_int}.`);
  tt("t_alltd", "all_td", (r, d) => `Most touchdowns of the ${d}: ${r.name}, ${r.all_td}.`);
  tt("t_tot", "total_offense", (r, d) => `Most total offense of the ${d}: ${r.name}, ${c(r.total_offense)} yards.`);
  return T;
}
function cfbNear(e) {
  const N = [
    { key: "n_ry", filters: [["rush_yds", "gte", 990], ["rush_yds", "lte", 999]], sort: "rush_yds", what: "between 990 and 999 rushing yards", one: "just shy of 1,000" },
    { key: "n_recy", filters: [["rec_yds", "gte", 990], ["rec_yds", "lte", 999]], sort: "rec_yds", what: "between 990 and 999 receiving yards", one: "just shy of 1,000" },
  ];
  if (e >= 3) N.push({ key: "n_py4", filters: [["pass_yds", "gte", 3990], ["pass_yds", "lte", 3999]], sort: "pass_yds", what: "between 3,990 and 3,999 passing yards", one: "just shy of 4,000" });
  return N;
}
// Team seasons, 1869 on. Scoring bars move with the era.
function cfbTeamRules(d) {
  const early = d < 1920; const pts = d < 1930 ? 400 : d < 1960 ? 380 : d < 1990 ? 450 : 600; const diff = d < 1930 ? 350 : d < 1960 ? 300 : d < 1990 ? 350 : 450;
  const R = []; const r = (key, head, filters, sort, say, extra = {}) => R.push({ key, head, filters, sort, say, ...extra });
  const rec = (x) => `${x.wins}-${x.losses}${x.ties ? `-${x.ties}` : ""}`;
  r("perfect", "go unbeaten and untied", [["games", "gte", early ? 5 : 8], ["losses", "lte", 0], ["ties", "lte", 0]], "wins", (x) => `${rec(x)}, ${x.points}-${x.points_opp} on the season`,
    { floor: `${early ? 5 : 8}+ games`, most: (n, k, dl) => `${n} had ${k} perfect seasons in the ${dl}, more than any other program.` });
  r("unscored", "go a whole season without allowing a point", [["games", "gte", 4], ["points_opp", "lte", 0]], "games", (x) => `${rec(x)}, ${x.points}-0`, { floor: "4+ games" });
  r("stingy", "allow 20 or fewer points all season", [["games", "gte", 8], ["points_opp", "lte", 20]], "points_opp", (x) => `${x.points_opp} allowed in ${x.games} games`, { floor: "8+ games", asc: true });
  r("pts_hi", `score ${pts} points`, [["points", "gte", pts]], "points", (x) => `${x.points} points, ${rec(x)}`);
  r("diff_hi", `outscore opponents by ${diff}`, [["points_diff", "gte", diff]], "points_diff", (x) => `${x.points}-${x.points_opp}`);
  r("winless", "lose every game", [["games", "gte", 7], ["wins", "lte", 0], ["ties", "lte", 0]], "losses", (x) => `0-${x.losses}, outscored ${x.points_opp}-${x.points}`, { floor: "7+ games" });
  r("ties", "tie 3 games", [["ties", "gte", 3]], "ties", (x) => `${rec(x)}`);
  r("unbeaten_tie", "go unbeaten but not untied", [["games", "gte", 6], ["losses", "lte", 0], ["ties", "gte", 1]], "wins", (x) => rec(x), { floor: "6+ games" });
  r("pts_low", "score 20 or fewer points all season", [["games", "gte", 7], ["points", "lte", 20]], "points", (x) => `${x.points} points in ${x.games} games, ${rec(x)}`, { floor: "7+ games", asc: true });
  r("diff_low", "get outscored by 300 points", [["points_diff", "lte", -300]], "points_diff", (x) => `${x.points}-${x.points_opp}, ${rec(x)}`, { asc: true });
  r("opp_hi", `allow ${d < 1960 ? 350 : 450} points`, [["points_opp", "gte", d < 1960 ? 350 : 450]], "points_opp", (x) => `${x.points_opp} allowed, ${rec(x)}`);
  if (d < 1970) r("wins10", "win 10 games", [["wins", "gte", 10]], "wins", (x) => rec(x));
  r("loss_hi", "lose 11 games", [["losses", "gte", 11]], "losses", (x) => rec(x));
  if (d >= 1970) r("wins_hi", `win ${d >= 2000 ? 14 : 12} games`, [["wins", "gte", d >= 2000 ? 14 : 12]], "wins", (x) => rec(x));
  if (d >= 1950) r("rush_hi", "rush for 4,500 yards", [["rush_yds", "gte", 4500]], "rush_yds", (x) => `${c(x.rush_yds)} rush yds`);
  if (d >= 1980) r("pass_hi", "throw for 5,500 yards", [["pass_yds", "gte", 5500]], "pass_yds", (x) => `${c(x.pass_yds)} pass yds`);
  if (d >= 1960) r("to_opp", "force 50 turnovers", [["turnovers_opp", "gte", 50]], "turnovers_opp", (x) => `${x.turnovers_opp} takeaways`);
  if (d >= 1960) r("to_low", "commit 8 or fewer turnovers", [["games", "gte", 10], ["turnovers", "lte", 8]], "turnovers", (x) => `${x.turnovers} giveaways, ${rec(x)}`, { floor: "10+ games" });
  return R;
}
function cfbTeamExtremes(d) {
  const X = []; const x = (key, sort, filters, text, asc = false) => X.push({ key, sort, filters, text, asc });
  const rec = (r) => `${r.wins}-${r.losses}${r.ties ? `-${r.ties}` : ""}`;
  x("tx_pts", "points", [["points", "gte", 1]], (r, s, dl) => `Most points by a team in a season in the ${dl}: ${r.name}, ${s} — ${r.points} (${rec(r)}).`);
  x("tx_opp", "points_opp", [["games", "gte", 8]], (r, s, dl) => `Fewest points allowed in a season (8+ games) in the ${dl}: ${r.name}, ${s} — ${r.points_opp}.`, true);
  x("tx_diff", "points_diff", [["games", "gte", 1]], (r, s, dl) => `Biggest scoring margin in a season in the ${dl}: ${r.name}, ${s} — ${r.points}-${r.points_opp}.`);
  x("tx_win", "wins", [["wins", "gte", 1]], (r, s, dl) => `Most wins in a season in the ${dl}: ${r.name}, ${s} — ${rec(r)}.`);
  x("tx_loss", "losses", [["losses", "gte", 1]], (r, s, dl) => `Most losses in a season in the ${dl}: ${r.name}, ${s} — ${rec(r)}.`);
  x("tx_worst", "points_diff", [["games", "gte", 5]], (r, s, dl) => `Worst scoring margin in a season in the ${dl}: ${r.name}, ${s} — outscored ${r.points_opp}-${r.points}.`, true);
  if (d >= 1950) x("tx_rush", "rush_yds", [["rush_yds", "gte", 1]], (r, s, dl) => `Most team rushing yards in a season in the ${dl}: ${r.name}, ${s} — ${c(r.rush_yds)}.`);
  if (d >= 1950) x("tx_pass", "pass_yds", [["pass_yds", "gte", 1]], (r, s, dl) => `Most team passing yards in a season in the ${dl}: ${r.name}, ${s} — ${c(r.pass_yds)}.`);
  return X;
}

// ---------------------------------------------------- college basketball --
// Men's (comp_id NCAAM). Seasons are labeled 1969-70; a decade is the ten
// seasons starting in its years. Rebounds, assists, steals, blocks and the
// three-pointer (1986-87) arrive at different times; rules on a stat a
// season lacks return nothing.
function cbbEra(d) { return d < 1970 ? 1 : d < 1980 ? 2 : d < 2000 ? 3 : 4; }
function cbbRules(e) {
  const R = []; const r = (key, head, filters, sort, say, extra = {}) => R.push({ key, head, filters, sort, say, ...extra });
  const ppg = [0, 35, 32, 30, 28][e]; const rpg = [0, 20, 17, 14, 14][e];
  r("ppg_hi", `average ${ppg} points a game`, [["games", "gte", 15], ["pts_per_g", "gte", ppg]], "pts_per_g", (x) => `${d1(x.pts_per_g)} ppg`, { floor: "15+ games" });
  r("pts_hi", `score ${e >= 3 ? 1000 : 900} points`, [["pts", "gte", e >= 3 ? 1000 : 900]], "pts", (x) => `${c(x.pts)} pts in ${x.games} games`);
  r("rpg_hi", `average ${rpg} rebounds a game`, [["games", "gte", 15], ["trb_per_g", "gte", rpg]], "trb_per_g", (x) => `${d1(x.trb_per_g)} rpg`, { floor: "15+ games" });
  r("dbl_big", `average ${e <= 2 ? 25 : 20} points and ${e <= 2 ? 15 : 12} rebounds`, [["games", "gte", 15], ["pts_per_g", "gte", e <= 2 ? 25 : 20], ["trb_per_g", "gte", e <= 2 ? 15 : 12]], "pts_per_g", (x) => `${d1(x.pts_per_g)} ppg, ${d1(x.trb_per_g)} rpg`, { floor: "15+ games" });
  r("ft_hi", "make 300 free throws", [["ft", "gte", 300]], "ft", (x) => `${x.ft}-${x.fta} FT`);
  r("ftp_hi", "shoot 92% from the line", [["fta", "gte", 100], ["ft_pct", "gte", 92]], "ft_pct", (x) => `${x.ft_pct}% on ${x.fta} FTA`, { floor: "100+ attempts" });
  r("fgp_hi", `shoot ${e <= 2 ? 65 : 70}% from the field`, [["fga", "gte", 200], ["fg_pct", "gte", e <= 2 ? 65 : 70]], "fg_pct", (x) => `${x.fg_pct}% on ${x.fga} FGA`, { floor: "200+ attempts" });
  if (e >= 3) r("apg_hi", "average 10 assists a game", [["games", "gte", 15], ["ast_per_g", "gte", 10]], "ast_per_g", (x) => `${d1(x.ast_per_g)} apg`, { floor: "15+ games" });
  if (e >= 3) r("spg_hi", "average 4 steals a game", [["games", "gte", 15], ["stl_per_g", "gte", 4]], "stl_per_g", (x) => `${d1(x.stl_per_g)} spg`, { floor: "15+ games" });
  if (e >= 3) r("bpg_hi", "average 5 blocks a game", [["games", "gte", 15], ["blk_per_g", "gte", 5]], "blk_per_g", (x) => `${d1(x.blk_per_g)} bpg`, { floor: "15+ games" });
  if (e >= 3) r("blk_hi", "block 160 shots", [["blk", "gte", 160]], "blk", (x) => `${x.blk} blocks`);
  if (e >= 3) r("ast_hi", "dish out 300 assists", [["ast", "gte", 300]], "ast", (x) => `${x.ast} assists`);
  if (e >= 3) r("stl_hi", "record 130 steals", [["stl", "gte", 130]], "stl", (x) => `${x.stl} steals`);
  if (e >= 3) r("fg3_hi", `make ${e >= 4 ? 150 : 130} threes`, [["fg3", "gte", e >= 4 ? 150 : 130]], "fg3", (x) => `${x.fg3} threes`);
  if (e >= 3) r("fg3p_hi", "shoot 50% from three", [["fg3a", "gte", 100], ["fg3_pct", "gte", 50]], "fg3_pct", (x) => `${x.fg3_pct}% on ${x.fg3a} 3PA`, { floor: "100+ attempts" });
  if (e >= 3) r("no3", "score 800 points without making a three", [["pts", "gte", 800], ["fg3", "lte", 0]], "pts", (x) => `${c(x.pts)} pts, 0 threes`);
  if (e >= 3) r("triple", "average 20 points, 7 rebounds and 7 assists", [["games", "gte", 15], ["pts_per_g", "gte", 20], ["trb_per_g", "gte", 7], ["ast_per_g", "gte", 7]], "pts_per_g", (x) => `${d1(x.pts_per_g)}/${d1(x.trb_per_g)}/${d1(x.ast_per_g)}`, { floor: "15+ games" });
  if (e >= 3) r("blk_ast", "record 100 blocks and 100 assists", [["blk", "gte", 100], ["ast", "gte", 100]], "blk", (x) => `${x.blk} blk, ${x.ast} ast`);
  if (e <= 2) r("ppg30", "average 30 points a game", [["games", "gte", 15], ["pts_per_g", "gte", 30]], "pts_per_g", (x) => `${d1(x.pts_per_g)} ppg`, { floor: "15+ games" });
  if (e <= 2) r("rpg25", "average 22 rebounds a game", [["games", "gte", 15], ["trb_per_g", "gte", 22]], "trb_per_g", (x) => `${d1(x.trb_per_g)} rpg`, { floor: "15+ games" });
  if (e <= 2) r("fta_hi", "attempt 350 free throws", [["fta", "gte", 350]], "fta", (x) => `${x.ft}-${x.fta} FT`);
  if (e <= 2) r("fga_hi", "attempt 800 field goals", [["fga", "gte", 800]], "fga", (x) => `${x.fg}-${x.fga} FG`);
  if (e <= 2) r("trb_hi", "grab 500 rebounds", [["trb", "gte", 500]], "trb", (x) => `${x.trb} rebounds`);
  const fr = { params: { "class[]": "fr" }, local: [["class", "re", "^fr"]] };
  if (e >= 2) {
    r("fr_ppg", "average 25 points a game as a freshman", [["games", "gte", 15], ["pts_per_g", "gte", 25]], "pts_per_g", (x) => `${d1(x.pts_per_g)} ppg`, { ...fr, floor: "15+ games" });
    r("fr_rpg", "average 12 rebounds a game as a freshman", [["games", "gte", 15], ["trb_per_g", "gte", 12]], "trb_per_g", (x) => `${d1(x.trb_per_g)} rpg`, { ...fr, floor: "15+ games" });
  }
  if (e >= 3) r("fr_fg3", "make 100 threes as a freshman", [["fg3", "gte", 100]], "fg3", (x) => `${x.fg3} threes`, fr);
  if (e >= 3) r("stl_blk", "record 80 steals and 80 blocks", [["stl", "gte", 80], ["blk", "gte", 80]], "stl", (x) => `${x.stl} stl, ${x.blk} blk`);
  return R;
}
function cbbExtremes(e) {
  const X = []; const x = (key, sort, filters, text, asc = false) => X.push({ key, sort, filters, text, asc });
  x("x_ppg", "pts_per_g", [["games", "gte", 15]], (r, s, d) => `Highest scoring average in a season in the ${d}: ${r.name}, ${r.team}, ${s} — ${d1(r.pts_per_g)} ppg.`);
  x("x_pts", "pts", [["pts", "gte", 1]], (r, s, d) => `Most points in a season in the ${d}: ${r.name}, ${r.team}, ${s} — ${c(r.pts)}.`);
  x("x_rpg", "trb_per_g", [["games", "gte", 15]], (r, s, d) => `Highest rebounding average in a season in the ${d}: ${r.name}, ${r.team}, ${s} — ${d1(r.trb_per_g)} rpg.`);
  x("x_ft", "ft", [["ft", "gte", 1]], (r, s, d) => `Most free throws made in a season in the ${d}: ${r.name}, ${r.team}, ${s} — ${r.ft}.`);
  x("x_fgp", "fg_pct", [["fga", "gte", 200]], (r, s, d) => `Best field-goal percentage in a season (200+ attempts) in the ${d}: ${r.name}, ${r.team}, ${s} — ${r.fg_pct}%.`);
  x("x_ftp", "ft_pct", [["fta", "gte", 100]], (r, s, d) => `Best free-throw percentage in a season (100+ attempts) in the ${d}: ${r.name}, ${r.team}, ${s} — ${r.ft_pct}%.`);
  if (e >= 3) {
    x("x_apg", "ast_per_g", [["games", "gte", 15]], (r, s, d) => `Highest assist average in a season in the ${d}: ${r.name}, ${r.team}, ${s} — ${d1(r.ast_per_g)} apg.`);
    x("x_bpg", "blk_per_g", [["games", "gte", 15]], (r, s, d) => `Highest blocks average in a season in the ${d}: ${r.name}, ${r.team}, ${s} — ${d1(r.blk_per_g)} bpg.`);
    x("x_spg", "stl_per_g", [["games", "gte", 15]], (r, s, d) => `Highest steals average in a season in the ${d}: ${r.name}, ${r.team}, ${s} — ${d1(r.stl_per_g)} spg.`);
    x("x_fg3", "fg3", [["fg3", "gte", 1]], (r, s, d) => `Most threes in a season in the ${d}: ${r.name}, ${r.team}, ${s} — ${r.fg3}.`);
  }
  return X;
}
function cbbTotals(e) {
  const T = []; const tt = (key, sort, text) => T.push({ key, sort, text });
  tt("t_pts", "pts", (r, d) => `Most points of the ${d}: ${r.name}, ${c(r.pts)}.`);
  tt("t_trb", "trb", (r, d) => `Most rebounds of the ${d}: ${r.name}, ${c(r.trb)}.`);
  tt("t_ft", "ft", (r, d) => `Most free throws made in the ${d}: ${r.name}, ${c(r.ft)}.`);
  if (e >= 3) { tt("t_ast", "ast", (r, d) => `Most assists of the ${d}: ${r.name}, ${c(r.ast)}.`); tt("t_fg3", "fg3", (r, d) => `Most threes of the ${d}: ${r.name}, ${c(r.fg3)}.`);
    tt("t_blk", "blk", (r, d) => `Most blocks of the ${d}: ${r.name}, ${c(r.blk)}.`); tt("t_stl", "stl", (r, d) => `Most steals of the ${d}: ${r.name}, ${c(r.stl)}.`); }
  return T;
}
function cbbNear() {
  return [{ key: "n_pts", filters: [["pts", "gte", 990], ["pts", "lte", 999]], sort: "pts", what: "between 990 and 999 points", one: "just shy of 1,000" }];
}
function cbbTeamRules(d) {
  const R = []; const r = (key, head, filters, sort, say, extra = {}) => R.push({ key, head, filters, sort, say, ...extra });
  const rec = (x) => `${x.wins}-${x.losses}`;
  r("perfect", "go unbeaten", [["games", "gte", 20], ["losses", "lte", 0]], "wins", (x) => rec(x), { floor: "20+ games" });
  r("one_loss", "lose just once", [["games", "gte", 20], ["losses", "lte", 1], ["losses", "gte", 1]], "wins", (x) => rec(x), { floor: "20+ games" });
  r("winless", "lose every game", [["games", "gte", 15], ["wins", "lte", 0]], "losses", (x) => rec(x), { floor: "15+ games" });
  r("ppg_hi", `average ${d < 1970 ? 95 : d < 2000 ? 100 : 90} points a game`, [["games", "gte", 15], ["pts_per_g", "gte", d < 1970 ? 95 : d < 2000 ? 100 : 90]], "pts_per_g", (x) => `${d1(x.pts_per_g)} ppg, ${rec(x)}`, { floor: "15+ games" });
  r("wins_hi", `win ${d < 1970 ? 30 : 35} games`, [["wins", "gte", d < 1970 ? 30 : 35]], "wins", (x) => rec(x));
  r("loss_hi", `lose ${d < 1980 ? 22 : 27} games`, [["losses", "gte", d < 1980 ? 22 : 27]], "losses", (x) => rec(x));
  r("fgp_hi", "shoot 53% from the field as a team", [["games", "gte", 15], ["fg_pct", "gte", 53]], "fg_pct", (x) => `${x.fg_pct}%, ${rec(x)}`, { floor: "15+ games" });
  if (d >= 1980) r("fg3_hi", `make ${d >= 2000 ? 400 : 330} threes as a team`, [["fg3", "gte", d >= 2000 ? 400 : 330]], "fg3", (x) => `${x.fg3} threes`);
  return R;
}
function cbbTeamExtremes(d) {
  const X = []; const x = (key, sort, filters, text, asc = false) => X.push({ key, sort, filters, text, asc });
  const rec = (r) => `${r.wins}-${r.losses}`;
  x("tx_ppg", "pts_per_g", [["games", "gte", 15]], (r, s, dl) => `Highest team scoring average in a season in the ${dl}: ${r.name}, ${s} — ${d1(r.pts_per_g)} ppg (${rec(r)}).`);
  x("tx_win", "wins", [["wins", "gte", 1]], (r, s, dl) => `Most wins in a season in the ${dl}: ${r.name}, ${s} — ${rec(r)}.`);
  x("tx_loss", "losses", [["losses", "gte", 1]], (r, s, dl) => `Most losses in a season in the ${dl}: ${r.name}, ${s} — ${rec(r)}.`);
  x("tx_fgp", "fg_pct", [["games", "gte", 15]], (r, s, dl) => `Best team field-goal percentage in a season in the ${dl}: ${r.name}, ${s} — ${r.fg_pct}%.`);
  if (d >= 1980) x("tx_fg3", "fg3", [["fg3", "gte", 1]], (r, s, dl) => `Most team threes in a season in the ${dl}: ${r.name}, ${s} — ${r.fg3}.`);
  return X;
}

// Threshold counts derived from each "most in a season" query's rows (top
// 200 of the decade). Used only when those rows provably include every
// season at or above the bar: the set was not cut off, or its lowest row is
// already below the bar.
function withCounts(X, spec) { for (const x of X) if (spec[x.key]) x.counts = [].concat(spec[x.key]); return X; }
const an = (w) => (/^(8|1[18](?!\d))/.test(w) ? `an ${w}` : `a ${w}`);
const cnt = (v, what, what1) => ({ v, what, what1: what1 && what1.replace(/^an? /, "").replace(/^(.*)$/, (m) => an(m)) });
function nflCounts(e) {
  const k = (n) => c(n);
  return {
    x_py: cnt(e >= 3 ? 3000 : e >= 2 ? 2000 : 1000, `${k(e >= 3 ? 3000 : e >= 2 ? 2000 : 1000)}-yard passing seasons`, `a ${k(e >= 3 ? 3000 : e >= 2 ? 2000 : 1000)}-yard passing season`),
    x_ptd: cnt(e >= 3 ? 20 : e >= 2 ? 15 : 10, `${e >= 3 ? 20 : e >= 2 ? 15 : 10}-touchdown-pass seasons`, `a ${e >= 3 ? 20 : e >= 2 ? 15 : 10}-touchdown-pass season`),
    x_ry: cnt(e >= 2 ? 1000 : 500, `${k(e >= 2 ? 1000 : 500)}-yard rushing seasons`, `a ${k(e >= 2 ? 1000 : 500)}-yard rushing season`),
    x_rec: cnt([0, 30, 50, 60, 80, 90][e], `${[0, 30, 50, 60, 80, 90][e]}-catch seasons`, `a ${[0, 30, 50, 60, 80, 90][e]}-catch season`),
    x_recy: cnt(e >= 2 ? 1000 : 600, `${k(e >= 2 ? 1000 : 600)}-yard receiving seasons`, `a ${k(e >= 2 ? 1000 : 600)}-yard receiving season`),
    x_dint: cnt(8, "8-interception seasons", "an 8-interception season"),
    x_sacks: cnt(10, "double-digit sack seasons", "a double-digit sack season"),
    x_pts: cnt(e >= 2 ? 100 : 60, `${e >= 2 ? 100 : 60}-point seasons`, `a ${e >= 2 ? 100 : 60}-point season`),
    x_alltd: cnt(e >= 2 ? 12 : 8, `${e >= 2 ? 12 : 8}-touchdown seasons`, `a ${e >= 2 ? 12 : 8}-touchdown season`),
    x_rtd: cnt(10, "double-digit rushing touchdown seasons", "a double-digit rushing touchdown season"),
    x_rectd: cnt(e >= 2 ? 10 : 6, `${e >= 2 ? "double-digit" : "6-plus"} touchdown-catch seasons`, `a ${e >= 2 ? "double-digit" : "6-plus"} touchdown-catch season`),
    x_scrim: cnt(e >= 3 ? 1500 : 1000, `${k(e >= 3 ? 1500 : 1000)}-yard scrimmage seasons`, `a ${k(e >= 3 ? 1500 : 1000)}-yard scrimmage season`),
    x_fgm: cnt(e >= 3 ? 25 : 15, `${e >= 3 ? 25 : 15}-field-goal seasons`, `a ${e >= 3 ? 25 : 15}-field-goal season`),
    x_int: cnt(20, "20-interception seasons as a passer", "a 20-interception season as a passer"),
    x_car: cnt(300, "300-carry seasons", "a 300-carry season"),
    x_apy: cnt(2000, "2,000-yard all-purpose seasons", "a 2,000-yard all-purpose season"),
    x_ff: cnt(5, "5-forced-fumble seasons", "a 5-forced-fumble season"),
  };
}
function cfbCounts(e) {
  return {
    x_py: cnt(e >= 3 ? 3000 : 2000, `${c(e >= 3 ? 3000 : 2000)}-yard passing seasons`), x_ptd: cnt(e >= 3 ? 25 : 15, `${e >= 3 ? 25 : 15}-touchdown-pass seasons`),
    x_ry: cnt(1000, "1,000-yard rushing seasons"), x_rtd: cnt(15, "15-rushing-touchdown seasons"), x_rec: cnt(e >= 3 ? 80 : 50, `${e >= 3 ? 80 : 50}-catch seasons`),
    x_recy: cnt(1000, "1,000-yard receiving seasons"), x_dint: cnt(7, "7-interception seasons"), x_pts: cnt(100, "100-point seasons"),
    x_tot: cnt(e >= 3 ? 3000 : 2000, `${c(e >= 3 ? 3000 : 2000)}-yard total-offense seasons`), x_apy: cnt(2000, "2,000-yard all-purpose seasons"),
    x_sacks: cnt(10, "double-digit sack seasons"), x_fgm: cnt(20, "20-field-goal seasons"),
  };
}
function cbbCounts(e) {
  return {
    x_pts: cnt(e >= 3 ? 800 : 700, `${e >= 3 ? 800 : 700}-point seasons`), x_ppg: cnt(25, "25-point-per-game seasons (15+ games)"), x_rpg: cnt(12, "12-rebound-per-game seasons (15+ games)"),
    x_ft: cnt(200, "200-free-throw seasons"), x_apg: cnt(7, "7-assist-per-game seasons (15+ games)"), x_bpg: cnt(3, "3-block-per-game seasons (15+ games)"),
    x_spg: cnt(3, "3-steal-per-game seasons (15+ games)"), x_fg3: cnt(100, "100-three seasons"),
  };
}
const TEAMCOUNTS = {
  cfb: (d) => ({ tx_win: cnt(d < 1950 ? 8 : 10, `${d < 1950 ? 8 : 10}-win seasons`), tx_loss: cnt(8, "8-loss seasons"), tx_pts: cnt(d < 1990 ? 300 : 450, `${d < 1990 ? 300 : 450}-point seasons`) }),
  cbb: (d) => ({ tx_win: cnt(d < 1970 ? 20 : 25, `${d < 1970 ? 20 : 25}-win seasons`), tx_loss: cnt(20, "20-loss seasons"), tx_ppg: cnt(90, "90-point-per-game seasons (15+ games)") }),
};

const yearLabel = (s) => String(s);
const cbbLabel = (s) => `${s}-${String(s + 1).slice(2)}`;
const LAST_CFB = 2025; // 2026 season in progress
const SPORTS = {
  nfl: {
    name: "NFL",
    units: (d) => [{ key: "p", base: `${SH}/football/player-season-finder.cgi`, who: "player",
      // Official NFL records count the AFL's 1960-69 seasons but not the AAFC's;
      // the 1960s are queried across all leagues, every other decade NFL only.
      extra: { comp_type: "reg", ...(d === 1960 ? {} : { comp_id: "NFL" }) }, yMin: d, yMax: d + 9, label: yearLabel,
      rules: nflRules(nflEra(d)), extremes: withCounts(nflExtremes(nflEra(d)), nflCounts(nflEra(d))), ages: true, statFrom: { sacks: 1982 }, totals: nflTotals(nflEra(d)), near: nflNear(nflEra(d)) }],
    method: [
      "NFL before 2000: each line is one Stathead (Pro Football Reference) Season Finder query over the decade, run in a signed-in subscriber session; the result rows, with Pro Football Reference's stable player ids, are stored as provenance. Nothing recalled or estimated.",
      "Passing, rushing and receiving are official from 1932, interceptions from 1940, sacks from 1982 (Pro Football Reference's unofficial earlier sack counts are excluded); rules on a category a decade did not record simply return nothing. The 1960s include AFL seasons, which NFL records count; the 1940s exclude the AAFC, which they do not.",
    ],
  },
  cfb: {
    name: "College Football",
    units: (d) => {
      const yMax = Math.min(d + 9, LAST_CFB); const U = [];
      if (d + 9 >= 1956) U.push({ key: "p", base: `${SH}/football/cfb/player-season-finder.cgi`, who: "major-college player", extra: {}, yMin: Math.max(d, 1956), yMax, label: yearLabel,
        rules: cfbRules(cfbEra(d)), extremes: withCounts(cfbExtremes(), cfbCounts(cfbEra(d))), schools: true, totals: cfbTotals(), near: cfbNear(cfbEra(d)) });
      U.push({ key: "t", team: true, base: `${SH}/football/cfb/team-season-finder.cgi`, match: "team_season", who: "major-college team", pron: "it", extra: {}, yMin: Math.max(d, 1869), yMax, label: yearLabel,
        rules: cfbTeamRules(d), extremes: withCounts(cfbTeamExtremes(d), TEAMCOUNTS.cfb(d)), totals: [], near: [] });
      return U;
    },
    shortNote: (d) => (d < 1950 ? "Player statistics in the college record begin in 1956; every line here is from team seasons, the only complete record for these years. Nothing was padded." : null),
    method: [
      "College football: each line is one Stathead (Sports Reference college football) Season Finder query over the decade, run in a signed-in subscriber session; result rows and stable ids are stored as provenance. Counts cover the database's major-college (today's FBS) programs, the scope of Sports Reference's college records.",
      "Player statistics begin in 1956; decades before that are built from team seasons (record, points for and against), which run back to 1869. The 2026 season is in progress and excluded. Defensive stats such as sacks and tackles appear only in recent decades, and rules on them return nothing earlier.",
    ],
  },
  cbb: {
    name: "College Basketball",
    // year params are the season's END year (1948 = 1947-48)
    units: (d) => {
      const U = []; if (d + 9 < 1947) return U; const yMin = Math.max(d, 1947) + 1; const yMax = Math.min(d + 10, 2026);
      U.push({ key: "p", base: `${SH}/basketball/cbb/player-season-finder.cgi`, who: "major-college player", extra: { comp_id: "NCAAM", display_type: "totals" }, yMin, yMax, label: cbbLabel,
        rules: cbbRules(cbbEra(d)), extremes: withCounts(cbbExtremes(cbbEra(d)), cbbCounts(cbbEra(d))), schools: true, totals: cbbTotals(cbbEra(d)), near: cbbNear() });
      U.push({ key: "t", team: true, base: `${SH}/basketball/cbb/team-season-finder.cgi`, match: "team_season", who: "major-college team", pron: "it", extra: { comp_id: "NCAAM", display_type: "team_totals" }, yMin, yMax, label: cbbLabel,
        rules: cbbTeamRules(d), extremes: withCounts(cbbTeamExtremes(d), TEAMCOUNTS.cbb(d)), totals: [], near: [] });
      return U;
    },
    seasonFromParam: (y) => y - 1,
    method: [
      "College basketball (men's): each line is one Stathead (Sports Reference college basketball) Season Finder query over the decade's ten seasons (a decade is the seasons starting in its years: the 1970s run 1970-71 to 1979-80), run in a signed-in subscriber session; result rows and stable ids are stored as provenance.",
      "Sports Reference's season finders begin with 1947-48, so the 1940s page covers two seasons and earlier decades are not in the record. Rebounds, assists, steals, blocks and the three-pointer (1986-87) arrive at different times; rules on a stat a season lacks return nothing. Per-game figures are totals divided by games.",
    ],
  },
};

// Rows -> the shape factcore expects. Per-game values are derived from totals
// when the totals view does not show them (same arithmetic as the site).
function makeRow(x, unit) {
  const name = unit.team ? x.team_name_abbr : x.name_display;
  const o = { id: unit.team ? name : (x._id || name), name, season: parseInt(String(x.year_id || "").slice(0, 4), 10), team: x.teams_played_for || name, pos: x.pos, age: num(x.age), year_raw: x.year_id };
  for (const [k, v] of Object.entries(x)) if (!(k in o) && k !== "_id") { const n = num(v); o[k] = n == null ? v : n; }
  // Stats shown for seasons before they were officially kept are dropped.
  for (const [k, y] of Object.entries(unit.statFrom || {})) if (o.season < y) o[k] = null;
  const g = typeof o.games === "number" && o.games > 0 ? o.games : null;
  for (const k of ["pts", "trb", "ast", "stl", "blk", "fg3"]) if (g && typeof o[k] === "number" && typeof o[`${k}_per_g`] !== "number") o[`${k}_per_g`] = o[k] / g;
  return o;
}

function countFacts(rows, res, x, cs, u, dl, url) {
  const min = rows[rows.length - 1][x.sort];
  if (res.capped && !(min < cs.v)) return []; // cannot prove every qualifying season is here
  const q = rows.filter((r) => r[x.sort] >= cs.v); if (q.length < 2) return [];
  const out = []; const base = { group: "P", decade: dl, finder: { url } };
  const leader = (groups, what) => {
    const ranked = [...groups.values()].sort((a, b) => b.length - a.length);
    if (ranked[0].length < 2 || (ranked[1] && ranked[1].length === ranked[0].length)) return null;
    return ranked[0];
  };
  const by = (f) => { const m = new Map(); for (const r of q) { const k = f(r); if (!k) continue; m.set(k, [...(m.get(k) || []), r]); } return m; };
  const top = leader(by((r) => r.id));
  if (top) out.push({ ...base, kind: "total", rule: `${u.key}:${x.key}:most${cs.v}`, score: 6.5, players: [{ id: top[0].id, name: top[0].name }], seasons: top.map((r) => r.season), evidence: top,
    text: `Most ${cs.what} in the ${dl}: ${top[0].name}, ${top.length}${top.length <= 5 ? ` (${top.map((r) => u.label(r.season)).sort().join(", ")})` : ""}.` });
  if (u.schools) {
    const sc = leader(by((r) => (/^\d+TM$|,/.test(String(r.team)) ? null : r.team)));
    if (sc && sc.length >= 3) out.push({ ...base, kind: "team", rule: `${u.key}:${x.key}:school${cs.v}`, score: 6, players: [{ id: `school:${sc[0].team}`, name: sc[0].team }], seasons: sc.map((r) => r.season), evidence: sc,
      text: `Most ${cs.what} by one school's players in the ${dl}: ${sc[0].team}, ${sc.length} (${[...new Set(sc.map((r) => r.name))].slice(0, 4).join(", ")}${new Set(sc.map((r) => r.name)).size > 4 ? ", …" : ""}).` });
  }
  if (u.ages && cs.what1 && q.every((r) => typeof r.age === "number")) {
    const byAge = [...q].sort((a, b) => b.age - a.age);
    const o = byAge[0], y = byAge[byAge.length - 1];
    if (byAge[1].age !== o.age) out.push({ ...base, kind: "age", rule: `${u.key}:${x.key}:old${cs.v}`, score: 6, players: [{ id: o.id, name: o.name }], seasons: [o.season], evidence: byAge.slice(0, 3),
      text: `Oldest player with ${cs.what1} in the ${dl}: ${o.name}, age ${o.age} in ${u.label(o.season)} (${c(o[x.sort])}).` });
    if (byAge[byAge.length - 2].age !== y.age) out.push({ ...base, kind: "age", rule: `${u.key}:${x.key}:young${cs.v}`, score: 6, players: [{ id: y.id, name: y.name }], seasons: [y.season], evidence: byAge.slice(-3),
      text: `Youngest player with ${cs.what1} in the ${dl}: ${y.name}, age ${y.age} in ${u.label(y.season)} (${c(y[x.sort])}).` });
  }
  return out;
}

async function runSport(key, decades) {
  const S = SPORTS[key]; if (!S) throw new Error(`Unknown sport ${key}`);
  const runDate = new Date().toLocaleDateString("en-CA", { timeZone: "America/New_York" });
  const sh = new StatheadBrowser({ dataDir: path.join(__dirname, "data", "browser"), runDate, idPrefix: `S${key.toUpperCase()}` });
  const outDir = path.join(__dirname, "data", key, "facts"); fs.mkdirSync(outDir, { recursive: true });
  // The "combined seasons" option's value is read off the form, not guessed.
  const matchCache = {};
  async function combinedMatch(base) {
    if (base in matchCache) return matchCache[base];
    let v = null;
    try {
      if (!sh.page) await sh.open();
      await sh.throttle(); await sh.page.goto(base, { waitUntil: "domcontentloaded", timeout: 60000 });
      const opts = await sh.page.evaluate(() => [...document.querySelectorAll("input[name='match']")].map((i) => {
        const lab = (i.id && document.querySelector(`label[for='${i.id}']`)) || i.closest("label") || i.parentElement;
        return [i.value, ((lab && lab.textContent) || "").trim()]; }));
      console.log(`  match options at ${base}: ${JSON.stringify(opts)}`);
      const hit = opts.find(([val, lab]) => /combin/i.test(lab) || /combin/i.test(val)); v = hit ? hit[0] : null;
    } catch (e) { console.log(`  match discovery failed: ${e.message}`); }
    matchCache[base] = v; return v;
  }
  const seasonMin = (u) => (S.seasonFromParam ? S.seasonFromParam(u.yMin) : u.yMin);
  const seasonMax = (u) => (S.seasonFromParam ? S.seasonFromParam(u.yMax) : u.yMax);
  try {
    for (const d of decades) {
      const decadeLabel = `${d}s`; const cands = []; let queries = 0; const units = S.units(d);
      if (!units.length) { console.log(`${S.name} ${decadeLabel}: not in the record`); continue; }
      for (const u of units) {
        const ctx = { decadeLabel, label: u.label, ev: (r) => r, who: u.who, pron: u.pron || "he" };
        const lo = seasonMin(u), hi = seasonMax(u); const inDecade = (r) => r.season >= lo && r.season <= hi;
        const q = (opts) => finderUrl(u.base, { match: u.match || "player_season", yMin: u.yMin, yMax: u.yMax, extra: u.extra, ...opts });
        for (const rule of u.rules) {
          const url = q({ filters: rule.filters, sort: rule.sort, asc: !!rule.asc, pos: rule.pos, extra: { ...u.extra, ...(rule.params || {}) } });
          let res; try { res = await sh.queryAll(url, { label: `${S.name} ${decadeLabel} ${u.key}:${rule.key}`, maxPages: 2 }); queries += res.pages; } catch (err) { console.log(`  ${rule.key}: FAILED ${err.message}`); continue; }
          const rows = res.rows.map((x) => makeRow(x, u)).filter((r) => inDecade(r) && passes(r, rule.filters, rule.pos) && passes(r, rule.local || []));
          if (res.rows.length && rows.length < res.rows.length) console.log(`  ${u.key}:${rule.key}: ${res.rows.length - rows.length} returned rows failed the local re-check (dropped)`);
          if (!rows.length) continue;
          const sgn = rule.asc ? -1 : 1;
          const spec = { key: `${u.key}:${rule.key}`, head: rule.head, floor: rule.floor, f: () => true, mag: (r) => sgn * (Number(r[rule.sort]) || 0), say: rule.say, finder: { url } };
          let facts = core.ruleFacts(rows, [spec], ctx);
          if (!res.complete) facts = facts.map((f) => ({ ...f, kind: "list", score: 3,
            text: `More than ${rows.length} ${u.who}-seasons of the ${decadeLabel} ${core.verb(rule.head)}${rule.floor ? ` (${rule.floor})` : ""}. The most extreme: ${rows[0].name}, ${u.label(rows[0].season)} — ${rule.say(rows[0])}.` }));
          cands.push(...facts);
          // "Most seasons doing it" — only from a complete set, and only with a clear leader.
          if (rule.most && res.complete) {
            const per = new Map(); for (const r of rows) per.set(r.id, [...(per.get(r.id) || []), r]);
            const ranked = [...per.values()].sort((a, b) => b.length - a.length);
            if (ranked[0].length >= 2 && (!ranked[1] || ranked[0].length > ranked[1].length))
              cands.push({ kind: "total", rule: `${u.key}:${rule.key}:most`, group: "P", decade: decadeLabel, score: 7, players: [{ id: ranked[0][0].id, name: ranked[0][0].name }],
                seasons: ranked[0].map((r) => r.season), finder: { url }, evidence: ranked[0],
                text: `${rule.most(ranked[0][0].name, ranked[0].length, decadeLabel)} (${ranked[0].map((r) => u.label(r.season)).sort().join(", ")})` });
          }
        }
        for (const x of u.extremes) {
          const url = q({ filters: x.filters, sort: x.sort, asc: x.asc });
          let res; try { res = await sh.query(url, { label: `${S.name} ${decadeLabel} ${u.key}:${x.key}` }); queries += 1; } catch (err) { continue; }
          const rows = res.rows.map((y) => makeRow(y, u)).filter((r) => inDecade(r) && typeof r[x.sort] === "number" && passes(r, x.filters))
            .sort((a, b) => (x.asc ? a[x.sort] - b[x.sort] : b[x.sort] - a[x.sort]));
          if (rows.length < 3) continue;
          for (const cs of x.asc ? [] : x.counts || []) cands.push(...countFacts(rows, res, x, cs, u, decadeLabel, url));
          const r = rows[0];
          if (rows[1] && rows[1][x.sort] === r[x.sort]) continue; // a tie is not "most"
          cands.push({ kind: "extreme", rule: `${u.key}:${x.key}`, group: "P", decade: decadeLabel, score: 6, players: [{ id: r.id, name: r.name }], seasons: [r.season], finder: { url }, evidence: rows.slice(0, 5), text: x.text(r, u.label(r.season), decadeLabel) });
        }
        const comb = u.totals.length ? await combinedMatch(u.base) : null;
        for (const t of comb ? u.totals : []) {
          const url = q({ match: comb, filters: [[t.sort, "gte", 1]], sort: t.sort });
          let res; try { res = await sh.query(url, { label: `${S.name} ${decadeLabel} ${u.key}:${t.key}` }); queries += 1; } catch (err) { continue; }
          // A combined query must come back as multi-season rows; if the site
          // answered with single seasons, a "most of the decade" line would be false.
          if (res.rows.some((y) => /^\d{4}(-\d{2})?$/.test(String(y.year_id || "").trim()))) { console.log(`  ${u.key}:${t.key}: combined query returned single seasons; skipped`); continue; }
          const rows = res.rows.map((y) => makeRow(y, u)).filter((r) => typeof r[t.sort] === "number").sort((a, b) => b[t.sort] - a[t.sort]);
          if (rows.length < 2 || rows[0][t.sort] === rows[1][t.sort]) continue;
          const r = rows[0];
          cands.push({ kind: "total", rule: `${u.key}:${t.key}`, group: "P", decade: decadeLabel, score: 5, players: [{ id: r.id, name: r.name }], seasons: [], finder: { url }, evidence: rows.slice(0, 5), text: t.text(r, decadeLabel) });
        }
        for (const n of u.near) {
          const url = q({ filters: n.filters, sort: n.sort });
          let res; try { res = await sh.query(url, { label: `${S.name} ${decadeLabel} ${u.key}:${n.key}` }); queries += 1; } catch (err) { continue; }
          const rows = res.rows.map((y) => makeRow(y, u)).filter((r) => inDecade(r) && passes(r, n.filters));
          if (!rows.length || res.capped) continue;
          cands.push(...core.nearMissFacts(rows, [{ key: `${u.key}:${n.key}`, f: () => true, what: n.what, one: n.one }], { ...ctx, size: (r) => Number(r[n.sort]) || 0 }).map((f) => ({ ...f, finder: { url } })));
        }
      }
      const facts = core.select(cands, 100);
      const out0 = { facts, decade: decadeLabel }; annotate(out0);
      const out = { sport: S.name, decade: decadeLabel, source: "Stathead", queries, candidates: cands.length, facts,
        counts: { stathead_queries: queries }, shortNote: S.shortNote ? S.shortNote(d) : null, method: S.method, generatedAt: new Date().toISOString() };
      fs.writeFileSync(path.join(outDir, `${d}s-facts.json`), JSON.stringify(out, null, 1));
      console.log(`${S.name} ${decadeLabel}: ${facts.length}/100 from ${cands.length} candidates, ${queries} queries`);
    }
  } finally { await sh.close(); }
}

async function main() {
  const args = process.argv.slice(2).filter((a) => !a.startsWith("--"));
  const sports = args.filter((a) => SPORTS[a]); const decades = args.filter((a) => /^\d{4}$/.test(a)).map(Number);
  const DEF = { nfl: [1920, 1930, 1940, 1950, 1960, 1970, 1980, 1990], cfb: Array.from({ length: 17 }, (_, i) => 1860 + 10 * i), cbb: [1940, 1950, 1960, 1970, 1980, 1990, 2000, 2010, 2020] };
  for (const sport of sports) {
    await runSport(sport, decades.length ? decades : DEF[sport]);
    if (process.argv.includes("--commit")) await commit(sport);
  }
}
async function commit(sport) {
  const { spawnSync } = require("child_process");
  const repo = path.join(__dirname, "..");
  const git = (...x) => { const r = spawnSync("git", x, { cwd: repo, encoding: "utf8" }); return { code: r.status, out: (r.stdout || "") + (r.stderr || "") }; };
  git("config", "user.name", "statdesk-bot"); git("config", "user.email", "noreply@anthropic.com");
  git("add", `statdesk/data/${sport}`, "statdesk/data/browser");
  if (git("diff", "--cached", "--quiet").code === 0) return;
  git("commit", "-m", `Stat Desk ${sport.toUpperCase()}: Stathead decade facts`);
  const branch = process.env.GITHUB_REF_NAME || "main";
  for (let i = 1; i <= 5; i += 1) {
    if (git("pull", "--rebase", "origin", branch).code === 0 && git("push", "origin", `HEAD:${branch}`).code === 0) { console.log(`[sport-facts] ${sport} pushed`); return; }
    await new Promise((r) => setTimeout(r, i * 4000));
  }
  console.error(`[sport-facts] ${sport}: could not push`); process.exitCode = 1;
}
module.exports = { finderUrl, SPORTS, runSport };
if (require.main === module) main().catch((e) => { console.error(e.stack || e.message); process.exit(1); });
