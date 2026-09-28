#!/usr/bin/env node
// NFL decade facts, 2000s onward, from nflverse player-season files.
//
// nflverse aggregates the NFL's own play-by-play (GSIS) data; every player's
// regular-season and playoff totals for every season from 1999 are pulled in
// full (nfl/fetch.sh). Same discipline as the MLB and NBA pages: every line is
// a rule over every player-season of the decade, rows stored, "only / two /
// few" count players. Decades before 2000 come from Stathead queries instead
// (nfl/stathead-facts.js) so no decade is stitched from two sources.
//
// Team-mate lines are omitted: a season file carries only the player's most
// recent team, so a traded player's season would be credited to one club.
//
//   node statdesk/nfl/facts.js [2000 2010 2020]
"use strict";
const fs = require("fs");
const path = require("path");
const core = require("../lib/factcore");

const DATA = path.join(__dirname, "..", "data", "nfl");
const RAW = path.join(DATA, "nflverse");
const OUT = path.join(DATA, "facts");

// Minimal RFC-4180 CSV parser (quoted fields may contain commas and quotes).
function parseCSV(text) {
  const rows = []; let row = [], f = "", q = false;
  for (let i = 0; i < text.length; i += 1) {
    const c = text[i];
    if (q) { if (c === '"') { if (text[i + 1] === '"') { f += '"'; i += 1; } else q = false; } else f += c; }
    else if (c === '"') q = true;
    else if (c === ",") { row.push(f); f = ""; }
    else if (c === "\n" || c === "\r") { if (c === "\r" && text[i + 1] === "\n") i += 1; row.push(f); rows.push(row); row = []; f = ""; }
    else f += c;
  }
  if (f.length || row.length) { row.push(f); rows.push(row); }
  const [h, ...body] = rows;
  return body.filter((r) => r.length === h.length).map((r) => Object.fromEntries(h.map((k, i) => [k, r[i]])));
}
const num = (v) => (v === "" || v == null || v === "NA" ? 0 : Number(v));

function load(y, type) {
  const f = path.join(RAW, `stats_player_${type}_${y}.csv`);
  if (!fs.existsSync(f)) return null;
  return parseCSV(fs.readFileSync(f, "utf8")).filter((r) => r.player_id && (r.player_display_name || r.player_name)).map((r) => {
    const o = { id: r.player_id, name: r.player_display_name || r.player_name, pos: r.position, team: r.recent_team, season: y, G: num(r.games),
      CMP: num(r.completions), ATT: num(r.attempts), PY: num(r.passing_yards), PTD: num(r.passing_tds), INT: num(r.passing_interceptions), SK: num(r.sacks_suffered),
      CAR: num(r.carries), RY: num(r.rushing_yards), RTD: num(r.rushing_tds),
      REC: num(r.receptions), TGT: num(r.targets), RECY: num(r.receiving_yards), RECTD: num(r.receiving_tds),
      DSK: num(r.def_sacks), DINT: num(r.def_interceptions), TKL: num(r.def_tackles_solo) + num(r.def_tackle_assists), DTD: num(r.def_tds), FF: num(r.def_fumbles_forced),
      PD: num(r.def_pass_defended), SAF: num(r.def_safeties),
      FGM: num(r.fg_made), FGA: num(r.fg_att), FGL: num(r.fg_long), FG50: num(r.fg_made_50_59) + num(r.fg_made_60_), FG60: num(r.fg_made_60_),
      PR: num(r.punt_returns), PRY: num(r.punt_return_yards), KR: num(r.kickoff_returns), KRY: num(r.kickoff_return_yards), STTD: num(r.special_teams_tds),
      FUM: num(r.fumbles_total), FUML: num(r.fumbles_lost_total) };
    o.SCRIM = o.RY + o.RECY; o.TD = o.RTD + o.RECTD; o.APY = o.SCRIM + o.PRY + o.KRY;
    o.CPCT = o.ATT ? o.CMP / o.ATT : null; o.YPA = o.ATT ? o.PY / o.ATT : null; o.YPC = o.CAR ? o.RY / o.CAR : null; o.YPR = o.REC ? o.RECY / o.REC : null;
    // Passer rating, the NFL's formula, each component clamped to [0, 2.375].
    if (o.ATT) { const cl = (v) => Math.max(0, Math.min(2.375, v)); o.RATE = ((cl((o.CMP / o.ATT - 0.3) * 5) + cl((o.PY / o.ATT - 3) * 0.25) + cl((o.PTD / o.ATT) * 20) + cl(2.375 - (o.INT / o.ATT) * 25)) / 6) * 100; }
    return o;
  });
}

const c = (v) => Number(v).toLocaleString("en-US");
const p1 = (v) => (100 * v).toFixed(1);
const d1 = (v) => v.toFixed(1);

function rules() {
  const R = [];
  const add = (o) => R.push({ group: "P", ...o });
  // --- passing ---
  add({ key: "td40", head: "throw 40 touchdown passes", f: (r) => r.PTD >= 40, mag: (r) => r.PTD, say: (r) => `${r.PTD} TD, ${r.INT} INT` });
  add({ key: "yds5000", head: "throw for 5,000 yards", f: (r) => r.PY >= 5000, mag: (r) => r.PY / 100, say: (r) => `${c(r.PY)} yds` });
  add({ key: "td30_int20", head: "throw 30 touchdown passes and 20 interceptions", f: (r) => r.PTD >= 30 && r.INT >= 20, mag: (r) => r.PTD + r.INT, say: (r) => `${r.PTD} TD, ${r.INT} INT` });
  add({ key: "yds4000_lowtd", head: "throw for 4,000 yards with fewer than 20 touchdowns", f: (r) => r.PY >= 4000 && r.PTD < 20, mag: (r) => r.PY / 100 - r.PTD, say: (r) => `${c(r.PY)} yds, ${r.PTD} TD` });
  add({ key: "int_over_td", head: "throw more interceptions than touchdowns", floor: "350+ attempts", f: (r) => r.ATT >= 350 && r.INT > r.PTD, mag: (r) => r.INT - r.PTD, say: (r) => `${r.PTD} TD, ${r.INT} INT` });
  add({ key: "cmp70", head: "complete 70% of their passes", floor: "350+ attempts", f: (r) => r.ATT >= 350 && r.CPCT >= 0.7, mag: (r) => 100 * r.CPCT, say: (r) => `${p1(r.CPCT)}%, ${r.ATT} att` });
  add({ key: "few_int", head: "throw 500 passes with 5 or fewer interceptions", f: (r) => r.ATT >= 500 && r.INT <= 5, mag: (r) => r.ATT / 50 - r.INT, say: (r) => `${r.ATT} att, ${r.INT} INT` });
  add({ key: "sacked60", head: "get sacked 60 times", f: (r) => r.SK >= 60, mag: (r) => r.SK, say: (r) => `sacked ${r.SK} times` });
  add({ key: "rate115", head: "post a passer rating of 115", floor: "350+ attempts", f: (r) => r.ATT >= 350 && r.RATE >= 115, mag: (r) => r.RATE / 5, say: (r) => `${d1(r.RATE)} rating` });
  add({ key: "ypa9", head: "average 9 yards a pass attempt", floor: "300+ attempts", f: (r) => r.ATT >= 300 && r.YPA >= 9, mag: (r) => r.YPA * 3, say: (r) => `${d1(r.YPA)} Y/A on ${r.ATT} att` });
  add({ key: "qb_rush1000", head: "rush for 1,000 yards as a quarterback", f: (r) => r.pos === "QB" && r.RY >= 1000, mag: (r) => r.RY / 50, say: (r) => `${c(r.RY)} rush yds` });
  add({ key: "qb_rushtd10", head: "run for 10 touchdowns as a quarterback", f: (r) => r.pos === "QB" && r.RTD >= 10, mag: (r) => r.RTD, say: (r) => `${r.RTD} rush TD` });
  add({ key: "dual4000_500", head: "throw for 4,000 yards and run for 500", f: (r) => r.PY >= 4000 && r.RY >= 500, mag: (r) => r.PY / 100 + r.RY / 50, say: (r) => `${c(r.PY)} pass, ${r.RY} rush` });
  // --- rushing ---
  add({ key: "rush2000", head: "rush for 2,000 yards", f: (r) => r.RY >= 2000, mag: (r) => r.RY / 50, say: (r) => `${c(r.RY)} yds` });
  add({ key: "rush1000_slow", head: "rush for 1,000 yards at under 3.8 a carry", f: (r) => r.RY >= 1000 && r.YPC < 3.8, mag: (r) => r.CAR / 20 - r.YPC, say: (r) => `${c(r.RY)} yds, ${r.YPC.toFixed(2)} ypc` });
  add({ key: "ypc6", head: "average 6 yards a carry", floor: "150+ carries", f: (r) => r.CAR >= 150 && r.YPC >= 6, mag: (r) => r.YPC * 3, say: (r) => `${d1(r.YPC)} ypc on ${r.CAR} carries` });
  add({ key: "rtd20", head: "run for 20 touchdowns", f: (r) => r.RTD >= 20, mag: (r) => r.RTD, say: (r) => `${r.RTD} rush TD` });
  add({ key: "car370", head: "carry the ball 370 times", f: (r) => r.CAR >= 370, mag: (r) => r.CAR / 10, say: (r) => `${r.CAR} carries` });
  add({ key: "rush1000_rec1000", head: "rush for 1,000 yards and gain 1,000 receiving", f: (r) => r.RY >= 1000 && r.RECY >= 1000, mag: (r) => r.SCRIM / 100, say: (r) => `${c(r.RY)} rush, ${c(r.RECY)} rec` });
  add({ key: "rb_rec100", head: "catch 100 passes as a running back", f: (r) => r.pos === "RB" && r.REC >= 100, mag: (r) => r.REC, say: (r) => `${r.REC} rec, ${c(r.RECY)} yds` });
  add({ key: "scrim2000", head: "gain 2,000 yards from scrimmage", f: (r) => r.SCRIM >= 2000, mag: (r) => r.SCRIM / 100, say: (r) => `${c(r.SCRIM)} scrimmage yds` });
  add({ key: "td25", head: "score 25 rushing and receiving touchdowns", f: (r) => r.TD >= 25, mag: (r) => r.TD, say: (r) => `${r.TD} TD` });
  // --- receiving ---
  add({ key: "recy1700", head: "gain 1,700 receiving yards", f: (r) => r.RECY >= 1700, mag: (r) => r.RECY / 100, say: (r) => `${c(r.RECY)} yds` });
  add({ key: "rec130", head: "catch 130 passes", f: (r) => r.REC >= 130, mag: (r) => r.REC, say: (r) => `${r.REC} rec` });
  add({ key: "rectd17", head: "catch 17 touchdown passes", f: (r) => r.RECTD >= 17, mag: (r) => r.RECTD, say: (r) => `${r.RECTD} rec TD` });
  add({ key: "rec100_short", head: "catch 100 passes for under 1,000 yards", f: (r) => r.REC >= 100 && r.RECY < 1000, mag: (r) => r.REC - r.RECY / 100, say: (r) => `${r.REC} rec, ${r.RECY} yds` });
  add({ key: "yds1000_fewrec", head: "gain 1,000 receiving yards on fewer than 55 catches", f: (r) => r.RECY >= 1000 && r.REC < 55, mag: (r) => r.YPR, say: (r) => `${c(r.RECY)} yds on ${r.REC} rec` });
  add({ key: "ypr20", head: "average 20 yards a catch", floor: "40+ catches", f: (r) => r.REC >= 40 && r.YPR >= 20, mag: (r) => r.YPR, say: (r) => `${d1(r.YPR)} per catch, ${r.REC} rec` });
  add({ key: "te1200", head: "gain 1,200 receiving yards as a tight end", f: (r) => r.pos === "TE" && r.RECY >= 1200, mag: (r) => r.RECY / 100, say: (r) => `${c(r.RECY)} yds, ${r.REC} rec` });
  add({ key: "td10_fewrec", head: "catch 10 touchdowns on fewer than 45 receptions", f: (r) => r.RECTD >= 10 && r.REC < 45, mag: (r) => r.RECTD - r.REC / 10, say: (r) => `${r.RECTD} TD on ${r.REC} rec` });
  add({ key: "tgt180", head: "draw 180 targets", f: (r) => r.TGT >= 180, mag: (r) => r.TGT / 10, say: (r) => `${r.TGT} targets` });
  // --- defense ---
  add({ key: "sack18", head: "record 18 sacks", f: (r) => r.DSK >= 18, mag: (r) => r.DSK, say: (r) => `${r.DSK} sacks` });
  add({ key: "int9", head: "intercept 9 passes", f: (r) => r.DINT >= 9, mag: (r) => r.DINT, say: (r) => `${r.DINT} INT` });
  add({ key: "dtd3", head: "score 3 defensive touchdowns", f: (r) => r.DTD >= 3, mag: (r) => r.DTD, say: (r) => `${r.DTD} def TD` });
  add({ key: "ff7", head: "force 7 fumbles", f: (r) => r.FF >= 7, mag: (r) => r.FF, say: (r) => `${r.FF} forced fumbles` });
  add({ key: "tkl170", head: "make 170 tackles", f: (r) => r.TKL >= 170, mag: (r) => r.TKL / 10, say: (r) => `${r.TKL} tackles` });
  add({ key: "sack5_int5", head: "record 5 sacks and 5 interceptions", f: (r) => r.DSK >= 5 && r.DINT >= 5, mag: (r) => r.DSK + r.DINT, say: (r) => `${r.DSK} sacks, ${r.DINT} INT` });
  add({ key: "pd25", head: "defend 25 passes", f: (r) => r.PD >= 25, mag: (r) => r.PD, say: (r) => `${r.PD} passes defended` });
  add({ key: "saf2", head: "record 2 safeties", f: (r) => r.SAF >= 2, mag: (r) => r.SAF, say: (r) => `${r.SAF} safeties` });
  // --- kicking & returns ---
  add({ key: "fg40", head: "make 40 field goals", f: (r) => r.FGM >= 40, mag: (r) => r.FGM, say: (r) => `${r.FGM}-${r.FGA} FG` });
  add({ key: "fg_perfect", head: "go a season without missing a field goal", floor: "20+ attempts", f: (r) => r.FGA >= 20 && r.FGM === r.FGA, mag: (r) => r.FGA, say: (r) => `${r.FGM}-for-${r.FGA}` });
  add({ key: "fg50x8", head: "make 8 field goals of 50+ yards", f: (r) => r.FG50 >= 8, mag: (r) => r.FG50, say: (r) => `${r.FG50} from 50+` });
  add({ key: "fg60", head: "make a 60-yard field goal", f: (r) => r.FG60 >= 1, mag: (r) => r.FGL, say: (r) => `long ${r.FGL}` });
  add({ key: "st_td3", head: "return 3 kicks or punts for touchdowns", f: (r) => r.STTD >= 3, mag: (r) => r.STTD, say: (r) => `${r.STTD} return TD` });
  add({ key: "apy2500", head: "gain 2,500 all-purpose yards", f: (r) => r.APY >= 2500, mag: (r) => r.APY / 100, say: (r) => `${c(r.APY)} all-purpose yds` });
  add({ key: "rush1500", head: "rush for 1,700 yards", f: (r) => r.RY >= 1700, mag: (r) => r.RY / 60, say: (r) => `${c(r.RY)} yds` });
  add({ key: "rtd15_slow", head: "run for 15 touchdowns while averaging under 4 yards a carry", f: (r) => r.RTD >= 15 && r.YPC < 4, mag: (r) => r.RTD - r.YPC, say: (r) => `${r.RTD} TD, ${r.YPC.toFixed(2)} ypc` });
  add({ key: "ypc5_workhorse", head: "average 5 yards a carry on 300+ carries", f: (r) => r.CAR >= 300 && r.YPC >= 5, mag: (r) => r.YPC * 3 + r.CAR / 100, say: (r) => `${r.YPC.toFixed(2)} ypc on ${r.CAR}` });
  add({ key: "int25", head: "throw 25 interceptions", f: (r) => r.INT >= 25, mag: (r) => r.INT, say: (r) => `${r.INT} INT, ${r.PTD} TD` });
  add({ key: "te_td12", head: "catch 12 touchdowns as a tight end", f: (r) => r.pos === "TE" && r.RECTD >= 12, mag: (r) => r.RECTD, say: (r) => `${r.RECTD} rec TD` });
  add({ key: "rb_recy800", head: "gain 800 receiving yards as a running back", f: (r) => r.pos === "RB" && r.RECY >= 800, mag: (r) => r.RECY / 50, say: (r) => `${c(r.RECY)} rec yds` });
  add({ key: "wr_rush150", head: "rush for 150 yards as a wide receiver", f: (r) => r.pos === "WR" && r.RY >= 150, mag: (r) => r.RY / 20, say: (r) => `${r.RY} rush yds, ${c(r.RECY)} rec yds` });
  add({ key: "kr1500", head: "gain 1,500 kickoff return yards", f: (r) => r.KRY >= 1500, mag: (r) => r.KRY / 100, say: (r) => `${c(r.KRY)} KR yds` });
  add({ key: "tkl_sack", head: "make 120 tackles and record 7 sacks", f: (r) => r.TKL >= 120 && r.DSK >= 7, mag: (r) => r.TKL / 10 + r.DSK, say: (r) => `${r.TKL} tackles, ${r.DSK} sacks` });
  add({ key: "fg_miss10", head: "miss 10 field goals", f: (r) => r.FGA - r.FGM >= 10, mag: (r) => r.FGA - r.FGM, say: (r) => `${r.FGM}-${r.FGA}` });
  add({ key: "fum12", head: "fumble 12 times", f: (r) => r.FUM >= 12, mag: (r) => r.FUM, say: (r) => `${r.FUM} fumbles` });
  return R;
}

const EXTREMES = [
  { key: "x_py", base: (r) => r.ATT > 0, pick: (r) => r.PY, text: (r, s, d) => `Most passing yards in a season in the ${d}: ${r.name}, ${s} — ${c(r.PY)}.` },
  { key: "x_ptd", base: (r) => r.ATT > 0, pick: (r) => r.PTD, text: (r, s, d) => `Most touchdown passes in a season in the ${d}: ${r.name}, ${s} — ${r.PTD}.` },
  { key: "x_int", base: (r) => r.ATT > 0, pick: (r) => r.INT, text: (r, s, d) => `Most interceptions thrown in a season in the ${d}: ${r.name}, ${s} — ${r.INT}.` },
  { key: "x_ry", base: (r) => r.CAR > 0, pick: (r) => r.RY, text: (r, s, d) => `Most rushing yards in a season in the ${d}: ${r.name}, ${s} — ${c(r.RY)}.` },
  { key: "x_recy", base: (r) => r.REC > 0, pick: (r) => r.RECY, text: (r, s, d) => `Most receiving yards in a season in the ${d}: ${r.name}, ${s} — ${c(r.RECY)}.` },
  { key: "x_rec", base: (r) => r.REC > 0, pick: (r) => r.REC, text: (r, s, d) => `Most catches in a season in the ${d}: ${r.name}, ${s} — ${r.REC}.` },
  { key: "x_dsk", base: (r) => r.DSK > 0, pick: (r) => r.DSK, text: (r, s, d) => `Most sacks in a season in the ${d}: ${r.name}, ${s} — ${r.DSK}.` },
  { key: "x_dint", base: (r) => r.DINT > 0, pick: (r) => r.DINT, text: (r, s, d) => `Most interceptions in a season in the ${d}: ${r.name}, ${s} — ${r.DINT}.` },
  { key: "x_cpct_low", base: (r) => r.PY >= 3000, pick: (r) => -r.CPCT, text: (r, s, d) => `Lowest completion percentage by a 3,000-yard passer in the ${d}: ${r.name}, ${s} — ${p1(r.CPCT)}%.` },
  { key: "x_ypc_1000", base: (r) => r.RY >= 1000, pick: (r) => r.YPC, text: (r, s, d) => `Best yards per carry by a 1,000-yard rusher in the ${d}: ${r.name}, ${s} — ${d1(r.YPC)} on ${r.CAR} carries.` },
  { key: "x_sk", base: (r) => r.ATT > 0, pick: (r) => r.SK, text: (r, s, d) => `Most times sacked in a season in the ${d}: ${r.name}, ${s} — ${r.SK}.` },
  { key: "x_te_rec", base: (r) => r.pos === "TE", pick: (r) => r.RECY, text: (r, s, d) => `Most receiving yards by a tight end in a season in the ${d}: ${r.name}, ${s} — ${c(r.RECY)} on ${r.REC} catches.` },
  { key: "x_fgl", base: (r) => r.FGM > 0, pick: (r) => r.FGL, text: (r, s, d) => `Longest field goal of the ${d}: ${r.FGL} yards, ${r.name}, ${s}.` },
  { key: "x_scrim", base: (r) => r.SCRIM > 0, pick: (r) => r.SCRIM, text: (r, s, d) => `Most yards from scrimmage in a season in the ${d}: ${r.name}, ${s} — ${c(r.SCRIM)}.` },
  { key: "x_rate", base: (r) => r.ATT >= 350, pick: (r) => r.RATE, text: (r, s, d) => `Highest passer rating in a season (350+ attempts) in the ${d}: ${r.name}, ${s} — ${d1(r.RATE)}.` },
  { key: "x_int_rate_low", base: (r) => r.ATT >= 400, pick: (r) => -r.INT / r.ATT, text: (r, s, d) => `Lowest interception rate in a season (400+ attempts) in the ${d}: ${r.name}, ${s} — ${r.INT} in ${r.ATT} attempts.` },
  { key: "x_rb_rec", base: (r) => r.pos === "RB", pick: (r) => r.REC, text: (r, s, d) => `Most catches by a running back in a season in the ${d}: ${r.name}, ${s} — ${r.REC}.` },
  { key: "x_qb_ry", base: (r) => r.pos === "QB", pick: (r) => r.RY, text: (r, s, d) => `Most rushing yards by a quarterback in a season in the ${d}: ${r.name}, ${s} — ${c(r.RY)}.` },
  { key: "x_fum", base: (r) => r.FUM > 0, pick: (r) => r.FUM, text: (r, s, d) => `Most fumbles in a season in the ${d}: ${r.name}, ${s} — ${r.FUM}.` },
  { key: "x_wr_ry", base: (r) => r.pos === "WR", pick: (r) => r.RY, text: (r, s, d) => `Most rushing yards by a wide receiver in a season in the ${d}: ${r.name}, ${s} — ${r.RY}.` },
  { key: "x_rb_recy", base: (r) => r.pos === "RB", pick: (r) => r.RECY, text: (r, s, d) => `Most receiving yards by a running back in a season in the ${d}: ${r.name}, ${s} — ${c(r.RECY)}.` },
  { key: "x_ptd_lowcmp", base: (r) => r.ATT >= 350 && r.CPCT < 0.6, pick: (r) => r.PTD, text: (r, s, d) => `Most touchdown passes by a sub-60% passer in the ${d}: ${r.name}, ${s} — ${r.PTD} TD at ${p1(r.CPCT)}%.` },
  { key: "x_kry", base: (r) => r.KR > 0, pick: (r) => r.KRY, text: (r, s, d) => `Most kickoff return yards in a season in the ${d}: ${r.name}, ${s} — ${c(r.KRY)}.` },
  { key: "x_tkl", base: (r) => r.TKL > 0, pick: (r) => r.TKL, text: (r, s, d) => `Most tackles in a season in the ${d}: ${r.name}, ${s} — ${r.TKL}.` },
];
const NEAR = [
  { key: "py3999", f: (r) => r.PY >= 3990 && r.PY <= 3999, what: "between 3,990 and 3,999 passing yards", one: "just shy of 4,000" },
  { key: "ry999", f: (r) => r.RY >= 990 && r.RY <= 999, what: "between 990 and 999 rushing yards", one: "just shy of 1,000" },
  { key: "recy999", f: (r) => r.RECY >= 990 && r.RECY <= 999, what: "between 990 and 999 receiving yards", one: "just shy of 1,000" },
  { key: "rec99", f: (r) => r.REC === 99, what: "exactly 99 catches", one: "one short of 100" },
  { key: "ptd29", f: (r) => r.PTD === 29, what: "exactly 29 touchdown passes", one: "one short of 30" },
  { key: "py4999", f: (r) => r.PY >= 4950 && r.PY <= 4999, what: "between 4,950 and 4,999 passing yards", one: "just shy of 5,000" },
  { key: "ry1999", f: (r) => r.RY >= 1950 && r.RY <= 1999, what: "between 1,950 and 1,999 rushing yards", one: "just shy of 2,000" },
  { key: "sk95", f: (r) => r.DSK === 9.5, what: "9.5 sacks", one: "half a sack short of 10" },
  { key: "fg_perfect_miss1", f: (r) => r.FGA >= 25 && r.FGA - r.FGM === 1, what: "exactly one missed field goal (25+ attempts)", one: "one kick from perfect" },
];
const STREAKS = [
  { key: "s_py4000", f: (r) => r.PY >= 4000, what: "threw for 4,000 yards" },
  { key: "s_ptd30", f: (r) => r.PTD >= 30, what: "threw 30 touchdown passes" },
  { key: "s_ry1000", f: (r) => r.RY >= 1000, what: "ran for 1,000 yards" },
  { key: "s_recy1000", f: (r) => r.RECY >= 1000, what: "gained 1,000 receiving yards" },
  { key: "s_rec90", f: (r) => r.REC >= 90, what: "caught 90 passes" },
  { key: "s_dsk10", f: (r) => r.DSK >= 10, what: "recorded 10 sacks" },
  { key: "s_fg25", f: (r) => r.FGM >= 25, what: "made 25 field goals" },
];
const TOTALS = [
  { key: "t_py", val: (r) => r.PY, text: (a, d, b) => `Most passing yards of the ${d}: ${a.name}, ${c(a.v)}${b ? ` — ${c(a.v - b.v)} ahead of ${b.name}` : ""}.` },
  { key: "t_ptd", val: (r) => r.PTD, text: (a, d) => `Most touchdown passes of the ${d}: ${a.name}, ${a.v}.` },
  { key: "t_ry", val: (r) => r.RY, text: (a, d) => `Most rushing yards of the ${d}: ${a.name}, ${c(a.v)}.` },
  { key: "t_recy", val: (r) => r.RECY, text: (a, d) => `Most receiving yards of the ${d}: ${a.name}, ${c(a.v)}.` },
  { key: "t_rec", val: (r) => r.REC, text: (a, d) => `Most catches of the ${d}: ${a.name}, ${c(a.v)}.` },
  { key: "t_td", val: (r) => r.TD, text: (a, d) => `Most rushing and receiving touchdowns of the ${d}: ${a.name}, ${a.v}.` },
  { key: "t_dsk", val: (r) => r.DSK, text: (a, d) => `Most sacks of the ${d}: ${a.name}, ${a.v}.` },
  { key: "t_dint", val: (r) => r.DINT, text: (a, d) => `Most interceptions of the ${d}: ${a.name}, ${a.v}.` },
  { key: "t_fgm", val: (r) => r.FGM, text: (a, d) => `Most field goals of the ${d}: ${a.name}, ${a.v}.` },
  { key: "t_int", val: (r) => r.INT, text: (a, d) => `Most interceptions thrown in the ${d}: ${a.name}, ${a.v}.` },
];
const COUNTS = [
  { key: "c_py4000", f: (r) => r.PY >= 4000, what: "4,000-yard passers" },
  { key: "c_ry1000", f: (r) => r.RY >= 1000, what: "1,000-yard rushers" },
  { key: "c_recy1000", f: (r) => r.RECY >= 1000, what: "1,000-yard receivers" },
  { key: "c_dsk10", f: (r) => r.DSK >= 10, what: "10-sack players" },
  { key: "c_ptd30", f: (r) => r.PTD >= 30, what: "30-touchdown passers" },
  { key: "c_rectd10", f: (r) => r.RECTD >= 10, what: "10-touchdown receivers" },
  { key: "c_rec100", f: (r) => r.REC >= 100, what: "100-catch players" },
];
const PO_RULES = [
  { key: "po_py", head: "throw for 1,000 yards in one postseason", f: (r) => r.PY >= 1000, mag: (r) => r.PY / 100, say: (r) => `${c(r.PY)} yds, ${r.PTD} TD in ${r.G} games` },
  { key: "po_ptd", head: "throw 10 touchdown passes in one postseason", f: (r) => r.PTD >= 10, mag: (r) => r.PTD, say: (r) => `${r.PTD} TD, ${r.INT} INT in ${r.G} games` },
  { key: "po_ry", head: "rush for 400 yards in one postseason", f: (r) => r.RY >= 400, mag: (r) => r.RY / 20, say: (r) => `${r.RY} yds in ${r.G} games` },
  { key: "po_recy", head: "gain 400 receiving yards in one postseason", f: (r) => r.RECY >= 400, mag: (r) => r.RECY / 20, say: (r) => `${r.RECY} yds in ${r.G} games` },
  { key: "po_dsk", head: "record 5 sacks in one postseason", f: (r) => r.DSK >= 5, mag: (r) => r.DSK, say: (r) => `${r.DSK} sacks in ${r.G} games` },
];

function build(decade) {
  const rows = [], po = [], seasons = [];
  for (let y = Math.max(decade, 1999); y < decade + 10; y += 1) {
    const rs = load(y, "reg"); if (!rs) continue; seasons.push(y); rows.push(...rs);
    const ps = load(y, "post"); if (ps) po.push(...ps);
  }
  if (!seasons.length) return null;
  const decadeLabel = `${decade}s`;
  const ev = (r) => ({ id: r.id, name: r.name, pos: r.pos, team: r.team, season: r.season, G: r.G, CMP: r.CMP, ATT: r.ATT, PY: r.PY, PTD: r.PTD, INT: r.INT,
    CAR: r.CAR, RY: r.RY, RTD: r.RTD, REC: r.REC, RECY: r.RECY, RECTD: r.RECTD, DSK: r.DSK, DINT: r.DINT, TKL: r.TKL, FGM: r.FGM, FGA: r.FGA, FGL: r.FGL });
  const ctx = { decadeLabel, label: String, ev, seasons, who: "player", size: (r) => r.ATT + r.CAR + r.REC };
  const cands = [
    ...core.ruleFacts(rows, rules(), ctx),
    ...core.ruleFacts(po, PO_RULES.map((r) => ({ ...r, group: "PO" })), ctx),
    ...core.extremeFacts(rows, EXTREMES, ctx),
    ...core.nearMissFacts(rows, NEAR, ctx),
    ...core.streakFacts(rows, STREAKS, ctx),
    ...core.totalFacts(rows, TOTALS, ctx),
    ...core.seasonCountFacts(rows, COUNTS, ctx),
  ];
  const facts = core.select(cands, 100);
  return { sport: "NFL", decade: decadeLabel, seasons, candidates: cands.length, facts,
    counts: { playerSeasons: rows.length, playoffPlayerSeasons: po.length },
    method: [
      "NFL 2000s onward: every player's regular-season and playoff totals for every season, from nflverse, which aggregates the NFL's own play-by-play (GSIS) data. Nothing recalled or estimated; the rows behind each line are stored with it.",
      "Passer rating is computed with the NFL's formula. Attempt and catch floors are stated in the line. Positions are nflverse's listed position.",
      "Team-mate lines are omitted: a season file credits a traded player's season to his most recent club.",
    ] };
}

function main() {
  const args = process.argv.slice(2).filter((a) => /^\d{4}$/.test(a)).map(Number);
  const decades = args.length ? args : [2000, 2010, 2020];
  fs.mkdirSync(OUT, { recursive: true });
  for (const d of decades) {
    const r = build(d); if (!r) { console.log(`${d}s: no data`); continue; }
    fs.writeFileSync(path.join(OUT, `${d}s-facts.json`), JSON.stringify(r, null, 1));
    console.log(`NFL ${d}s: ${r.facts.length}/100 from ${r.candidates} candidates, ${r.counts.playerSeasons} player-seasons over ${r.seasons.length} seasons`);
  }
}
if (require.main === module) main();
module.exports = { build, load, parseCSV };
