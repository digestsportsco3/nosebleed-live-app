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
const { StatheadBrowser } = require("./lib/stathead-browser");

const SH = "https://www.sports-reference.com/stathead";
const num = (v) => { if (v == null || v === "") return null; const n = Number(String(v).replace(/[,%+]/g, "")); return Number.isFinite(n) ? n : null; };
const c = (v) => (v == null ? "—" : Number(v).toLocaleString("en-US"));
const d1 = (v) => (v == null ? "—" : Number(v).toFixed(1));

// Re-check every filter on the returned rows: if the site ever ignored a
// criterion, the unfiltered rows must not turn into a false "only" line.
function passes(r, filters, pos) {
  for (const [stat, cmp, val] of filters) { const v = r[stat]; if (typeof v !== "number") return false; if (cmp === "lte" ? v > val : v < val) return false; }
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
  if (e >= 4) r("ff_hi", "force 6 fumbles", [["fumbles_forced", "gte", 6]], "fumbles_forced", (x) => `${x.fumbles_forced} forced`);
  r("fumrec_hi", "recover 6 fumbles", [["fumbles_rec", "gte", 6]], "fumbles_rec", (x) => `${x.fumbles_rec} recoveries`);
  if (e >= 2) r("fgm_hi", `make ${t.fgm} field goals`, [["fgm", "gte", t.fgm]], "fgm", (x) => `${x.fgm}-${x.fga} FG`);
  if (e >= 3) r("fg_perfect", "go a season without missing a field goal", [["fga", "gte", 15], ["fg_pct", "gte", 100]], "fga", (x) => `${x.fgm}-for-${x.fga}`, { floor: "15+ attempts" });
  r("pts_hi", `score ${t.pts} points`, [["scoring", "gte", t.pts]], "scoring", (x) => `${x.scoring} pts`);
  r("kr_td", "return 3 kickoffs for touchdowns", [["kick_ret_td", "gte", 3]], "kick_ret_td", (x) => `${x.kick_ret_td} KR TD`);
  r("pr_td", "return 3 punts for touchdowns", [["punt_ret_td", "gte", 3]], "punt_ret_td", (x) => `${x.punt_ret_td} PR TD`);
  if (e >= 2) r("apy_hi", `gain ${c(t.apy)} all-purpose yards`, [["all_purpose_yds", "gte", t.apy]], "all_purpose_yds", (x) => `${c(x.all_purpose_yds)} all-purpose yds`);
  r("punt_avg", "average 46 yards a punt", [["punt", "gte", 40], ["punt_yds_per_punt", "gte", 46]], "punt_yds_per_punt", (x) => `${x.punt_yds_per_punt} avg on ${x.punt}`, { floor: "40+ punts" });
  if (e >= 3) r("fumbles_hi", "fumble 14 times", [["fumbles", "gte", 14]], "fumbles", (x) => `${x.fumbles} fumbles`);
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
  if (e >= 2) x("x_cmp_low", "pass_cmp_pct", [["pass_yds", "gte", Math.round(t.yds * 0.7)]], (r, s, d) => `Lowest completion percentage by a ${c(Math.round(t.yds * 0.7))}-yard passer in the ${d}: ${r.name}, ${s} — ${r.pass_cmp_pct}%.`, true);
  if (e >= 2) x("x_rate", "pass_rating", [["pass_att", "gte", 250]], (r, s, d) => `Highest passer rating in a season (250+ attempts) in the ${d}: ${r.name}, ${s} — ${r.pass_rating}.`);
  x("x_apy", "all_purpose_yds", [["all_purpose_yds", "gte", 1]], (r, s, d) => `Most all-purpose yards in a season in the ${d}: ${r.name}, ${s} — ${c(r.all_purpose_yds)}.`);
  if (e >= 2) x("x_fgm", "fgm", [["fgm", "gte", 1]], (r, s, d) => `Most field goals in a season in the ${d}: ${r.name}, ${s} — ${r.fgm} of ${r.fga}.`);
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

const SPORTS = {
  nfl: {
    name: "NFL", base: `${SH}/football/player-season-finder.cgi`,
    // Official NFL records count the AFL's 1960-69 seasons but not the AAFC's;
    // the 1960s are queried across all leagues, every other decade NFL only.
    extra: (d) => ({ comp_type: "reg", ...(d === 1960 ? {} : { comp_id: "NFL" }) }),
    era: nflEra, rules: nflRules, extremes: nflExtremes, totals: nflTotals, near: nflNear,
    method: [
      "NFL before 2000: each line is one Stathead (Pro Football Reference) Season Finder query over the decade, run in a signed-in subscriber session; the result rows, with Pro Football Reference's stable player ids, are stored as provenance. Nothing recalled or estimated.",
      "Passing, rushing and receiving are official from 1932, interceptions from 1940, sacks from 1982; rules on a category a decade did not record simply return nothing. The 1960s include AFL seasons, which NFL records count; the 1940s exclude the AAFC, which they do not.",
    ],
  },
};

async function runSport(key, decades) {
  const S = SPORTS[key]; if (!S) throw new Error(`Unknown sport ${key}`);
  const runDate = new Date().toLocaleDateString("en-CA", { timeZone: "America/New_York" });
  const sh = new StatheadBrowser({ dataDir: path.join(__dirname, "data", "browser"), runDate, idPrefix: `S${key.toUpperCase()}` });
  const outDir = path.join(__dirname, "data", key, "facts"); fs.mkdirSync(outDir, { recursive: true });
  const toRow = (x) => { const o = { id: x._id || x.name_display, name: x.name_display, season: num(x.year_id), team: x.teams_played_for, pos: x.pos, age: num(x.age) };
    for (const [k, v] of Object.entries(x)) if (!(k in o) && k !== "_id") { const n = num(v); o[k] = n == null ? v : n; } return o; };
  try {
    for (const d of decades) {
      const e = S.era(d); const decadeLabel = `${d}s`; const yMin = d, yMax = d + 9; const extra = S.extra(d);
      const cands = []; let queries = 0;
      const ctx = { decadeLabel, label: String, ev: (r) => r, who: "player" };
      for (const rule of S.rules(e)) {
        const url = finderUrl(S.base, { yMin, yMax, filters: rule.filters, sort: rule.sort, pos: rule.pos, extra });
        let res; try { res = await sh.queryAll(url, { label: `${S.name} ${decadeLabel} ${rule.key}`, maxPages: 2 }); queries += res.pages; } catch (err) { console.log(`  ${rule.key}: FAILED ${err.message}`); continue; }
        const rows = res.rows.map(toRow).filter((r) => r.season >= yMin && r.season <= yMax && passes(r, rule.filters, rule.pos));
        if (res.rows.length && rows.length < res.rows.length) console.log(`  ${rule.key}: ${res.rows.length - rows.length} returned rows failed the local re-check (dropped)`);
        if (!rows.length) continue;
        const spec = { key: rule.key, head: rule.head, floor: rule.floor, f: () => true, mag: (r) => Number(r[rule.sort]) || 0, say: rule.say, finder: { url } };
        let facts = core.ruleFacts(rows, [spec], ctx);
        if (!res.complete) facts = facts.map((f) => ({ ...f, kind: "list", score: 3,
          text: `More than ${rows.length} player-seasons of the ${decadeLabel} ${core.verb(rule.head)}${rule.floor ? ` (${rule.floor})` : ""}. The most extreme: ${rows[0].name}, ${rows[0].season} — ${rule.say(rows[0])}.` }));
        cands.push(...facts);
      }
      for (const x of S.extremes(e)) {
        const url = finderUrl(S.base, { yMin, yMax, filters: x.filters, sort: x.sort, asc: x.asc, extra });
        let res; try { res = await sh.query(url, { label: `${S.name} ${decadeLabel} ${x.key}` }); queries += 1; } catch (err) { continue; }
        const rows = res.rows.map(toRow).filter((r) => r.season >= yMin && r.season <= yMax && typeof r[x.sort] === "number" && passes(r, x.filters))
          .sort((a, b) => (x.asc ? a[x.sort] - b[x.sort] : b[x.sort] - a[x.sort]));
        if (rows.length < 3 || res.capped && x.asc) continue;
        const r = rows[0];
        cands.push({ kind: "extreme", rule: x.key, group: "P", decade: decadeLabel, score: 6, players: [{ id: r.id, name: r.name }], seasons: [r.season], finder: { url }, evidence: rows.slice(0, 5), text: x.text(r, r.season, decadeLabel) });
      }
      for (const t of S.totals(e)) {
        const url = finderUrl(S.base, { match: "combined", yMin, yMax, filters: [[t.sort, "gte", 1]], sort: t.sort, extra });
        let res; try { res = await sh.query(url, { label: `${S.name} ${decadeLabel} ${t.key}` }); queries += 1; } catch (err) { continue; }
        const rows = res.rows.map(toRow).filter((r) => typeof r[t.sort] === "number").sort((a, b) => b[t.sort] - a[t.sort]);
        if (!rows.length) continue;
        const r = rows[0];
        cands.push({ kind: "total", rule: t.key, group: "P", decade: decadeLabel, score: 5, players: [{ id: r.id, name: r.name }], seasons: [], finder: { url }, evidence: rows.slice(0, 5), text: t.text(r, decadeLabel) });
      }
      for (const n of S.near(e)) {
        const url = finderUrl(S.base, { yMin, yMax, filters: n.filters, sort: n.sort, extra });
        let res; try { res = await sh.query(url, { label: `${S.name} ${decadeLabel} ${n.key}` }); queries += 1; } catch (err) { continue; }
        const rows = res.rows.map(toRow).filter((r) => r.season >= yMin && r.season <= yMax && passes(r, n.filters));
        if (!rows.length || res.capped) continue;
        cands.push(...core.nearMissFacts(rows, [{ key: n.key, f: () => true, what: n.what, one: n.one }], { ...ctx, size: (r) => Number(r[n.sort]) || 0 }).map((f) => ({ ...f, finder: { url } })));
      }
      const facts = core.select(cands, 100);
      const out = { sport: S.name, decade: decadeLabel, era: e, source: "Stathead", queries, candidates: cands.length, facts,
        counts: { stathead_queries: queries }, method: S.method, generatedAt: new Date().toISOString() };
      fs.writeFileSync(path.join(outDir, `${d}s-facts.json`), JSON.stringify(out, null, 1));
      console.log(`${S.name} ${decadeLabel}: ${facts.length}/100 from ${cands.length} candidates, ${queries} queries`);
    }
  } finally { await sh.close(); }
}

async function main() {
  const [sport, ...rest] = process.argv.slice(2).filter((a) => !a.startsWith("--"));
  const decades = rest.filter((a) => /^\d{4}$/.test(a)).map(Number);
  await runSport(sport, decades.length ? decades : [1920, 1930, 1940, 1950, 1960, 1970, 1980, 1990]);
  if (!process.argv.includes("--commit")) return;
  const { spawnSync } = require("child_process");
  const repo = path.join(__dirname, "..");
  const git = (...x) => { const r = spawnSync("git", x, { cwd: repo, encoding: "utf8" }); return { code: r.status, out: (r.stdout || "") + (r.stderr || "") }; };
  git("config", "user.name", "statdesk-bot"); git("config", "user.email", "noreply@anthropic.com");
  git("add", `statdesk/data/${sport}`, "statdesk/data/browser");
  if (git("diff", "--cached", "--quiet").code === 0) return;
  git("commit", "-m", `Stat Desk ${sport.toUpperCase()}: Stathead decade facts`);
  const branch = process.env.GITHUB_REF_NAME || "main";
  for (let i = 1; i <= 5; i += 1) {
    if (git("pull", "--rebase", "origin", branch).code === 0 && git("push", "origin", `HEAD:${branch}`).code === 0) { console.log("[sport-facts] pushed"); return; }
    await new Promise((r) => setTimeout(r, i * 4000));
  }
  console.error("[sport-facts] could not push"); process.exitCode = 1;
}
module.exports = { finderUrl, SPORTS };
if (require.main === module) main().catch((e) => { console.error(e.stack || e.message); process.exit(1); });
