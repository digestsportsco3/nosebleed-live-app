#!/usr/bin/env node
// NHL decade facts from the league's official season stats (nhl/pull.js):
// every skater, goalie and team season since 1917-18, regular season and
// playoffs. Same discipline as the NBA and MLB pages: each line is a rule
// over every player-season of the decade; "only / two / few" count players;
// the rows behind each line are stored with it; nothing is recalled.
//
// A stat the league had not started keeping (shots, plus-minus, power-play
// goals, time on ice, save percentage) can arrive as zero instead of blank.
// Each season is tested for whether a stat was genuinely recorded before any
// rule may use it, so an untracked zero can never become a "fewest" line.
//
//   node statdesk/nhl/facts.js [1920 1930 ...]
"use strict";
const fs = require("fs");
const path = require("path");
const core = require("../lib/factcore");
const { annotate } = require("../lib/why");

const DATA = path.join(__dirname, "..", "data", "nhl");
const OUT = path.join(DATA, "facts");
const label = (y) => `${y}-${String((y + 1) % 100).padStart(2, "0")}`;
const has = (v) => v !== null && v !== undefined && Number.isFinite(v);
const d1 = (v) => (has(v) ? v.toFixed(1) : "—");
const d2 = (v) => (has(v) ? v.toFixed(2) : "—");
const p3 = (v) => (has(v) ? v.toFixed(3).replace(/^0/, "") : "—");
const c = (v) => Number(v).toLocaleString("en-US");
const sgn = (v) => (v > 0 ? `+${v}` : `${v}`);

function load(y, type, kind) {
  const f = path.join(DATA, "seasons", `${label(y)}-${type}-${kind}.json`);
  return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, "utf8")).rows : null;
}

// Birth dates and first NHL seasons, from every season pulled.
let BIRTH = null, FIRST = null;
function registry() {
  if (BIRTH) return;
  BIRTH = new Map(); FIRST = new Map();
  const dir = path.join(DATA, "seasons");
  for (const f of fs.readdirSync(dir).sort()) {
    const m = f.match(/^(\d{4})-\d{2}-rs-(skaters|goalies|bios)\.json$/); if (!m) continue;
    const y = Number(m[1]); const rows = JSON.parse(fs.readFileSync(path.join(dir, f), "utf8")).rows;
    for (const r of rows) {
      if (m[2] === "bios") { if (r.birthDate && !BIRTH.has(r.playerId)) BIRTH.set(r.playerId, { birth: r.birthDate, country: r.birthCountryCode || null }); continue; }
      if (!FIRST.has(r.playerId) || FIRST.get(r.playerId) > y) FIRST.set(r.playerId, y);
    }
  }
}
// Age as of Feb. 1 of the season (the convention Hockey-Reference uses).
function ageIn(id, y) { const b = BIRTH.get(id); if (!b) return null; const d = new Date(`${b.birth}T12:00:00Z`); if (isNaN(d)) return null;
  let a = y + 1 - d.getUTCFullYear(); if (d.getUTCMonth() > 1 || (d.getUTCMonth() === 1 && d.getUTCDate() > 1)) a -= 1; return a; }

// Was a stat genuinely recorded this season? (Untracked stats arrive as 0.)
function recorded(rows, key, minShare = 0.4, minGP = 20) {
  const pool = rows.filter((r) => (r.gamesPlayed || 0) >= minGP); if (pool.length < 10) return false;
  return pool.filter((r) => has(r[key]) && r[key] !== 0).length / pool.length >= minShare;
}

function era(y) { return y < 1942 ? 1 : y < 1967 ? 2 : y < 1993 ? 3 : y < 2005 ? 4 : y < 2017 ? 5 : 6; }
const BAR = {
  1: { g: 30, p: 45, a: 25, pim: 100, dg: 10, dp: 25, so: 12, gaa: 1.5, w: 25, sv: null, tp: 0.8 },
  2: { g: 40, p: 80, a: 50, pim: 150, dg: 15, dp: 45, so: 10, gaa: 2.0, w: 40, sv: null, tp: 0.75 },
  3: { g: 60, p: 130, a: 90, pim: 300, dg: 25, dp: 90, so: 8, gaa: 2.5, w: 45, sv: 0.910, tp: 0.75 },
  4: { g: 55, p: 110, a: 80, pim: 250, dg: 20, dp: 70, so: 10, gaa: 2.0, w: 42, sv: 0.930, tp: 0.7 },
  5: { g: 50, p: 100, a: 70, pim: 200, dg: 20, dp: 70, so: 9, gaa: 2.0, w: 45, sv: 0.930, tp: 0.7 },
  6: { g: 50, p: 110, a: 80, pim: 150, dg: 20, dp: 80, so: 8, gaa: 2.1, w: 42, sv: 0.925, tp: 0.7 },
};

function skater(r, y, maxGP, rec) {
  const GP = r.gamesPlayed || 0;
  const x = { id: r.playerId, name: r.skaterFullName, season: y, team: r.teamAbbrevs, pos: r.positionCode, GP, G: r.goals ?? 0, A: r.assists ?? 0, P: r.points ?? 0,
    PIM: r.penaltyMinutes ?? null, PM: rec.pm ? r.plusMinus ?? null : null, PPG: rec.pp ? r.ppGoals ?? null : null, SHG: rec.pp ? r.shGoals ?? null : null,
    GWG: rec.gwg ? r.gameWinningGoals ?? null : null, OTG: rec.ot ? r.otGoals ?? null : null, S: rec.shots ? r.shots ?? null : null,
    TOI: rec.toi && has(r.timeOnIcePerGame) ? r.timeOnIcePerGame / 60 : null, maxGP };
  x.SPCT = has(x.S) && x.S > 0 ? (100 * x.G) / x.S : null;
  x.GPG = GP ? x.G / GP : null; x.PTSPG = GP ? x.P / GP : null;
  x.q = GP >= Math.ceil(0.6 * maxGP); x.D = x.pos === "D";
  x.age = ageIn(x.id, y); x.first = FIRST.get(x.id) === y && y > 1917;
  x.born = (BIRTH.get(x.id) || {}).country || null;
  return x;
}
function goalie(r, y, maxGP, rec) {
  const GP = r.gamesPlayed || 0;
  const x = { id: r.playerId, name: r.goalieFullName, season: y, team: r.teamAbbrevs, GP, W: r.wins ?? null, L: r.losses ?? null, T: rec.ties ? r.ties ?? null : null,
    OTL: r.otLosses ?? null, GA: r.goalsAgainst ?? null, SO: r.shutouts ?? 0, GAA: r.goalsAgainstAverage ?? null,
    SA: rec.sa ? r.shotsAgainst ?? null : null, SV: rec.sa ? r.saves ?? null : null, SVP: rec.sa ? r.savePct ?? null : null, A: r.assists ?? 0, PIM: r.penaltyMinutes ?? null, maxGP };
  x.q = GP >= Math.ceil(0.4 * maxGP); x.age = ageIn(x.id, y); x.first = FIRST.get(x.id) === y && y > 1917;
  return x;
}

// ---------------------------------------------------------------- rules --
function skaterRules(e, b) {
  const R = []; const r = (key, head, f, mag, say, floor = null) => R.push({ key, head, f, mag, say, floor });
  const gp = (x) => `${x.GP} GP`;
  r("h_g", `score ${b.g} goals`, (x) => x.G >= b.g, (x) => x.G, (x) => `${x.G} goals in ${x.GP} games`);
  r("h_p", `record ${b.p} points`, (x) => x.P >= b.p, (x) => x.P / 2, (x) => `${x.P} points (${x.G}G, ${x.A}A)`);
  r("h_a", `record ${b.a} assists`, (x) => x.A >= b.a, (x) => x.A, (x) => `${x.A} assists`);
  r("h_gpg", "score a goal a game", (x) => x.GP >= (e === 1 ? 15 : 40) && x.G >= x.GP, (x) => 50 * x.GPG, (x) => `${x.G} goals in ${x.GP} games`, `${e === 1 ? 15 : 40}+ games`);
  r("h_2ppg", `average ${e === 1 ? 1.5 : 2} points a game`, (x) => x.GP >= (e === 1 ? 15 : 40) && x.PTSPG >= (e === 1 ? 1.5 : 2), (x) => 30 * x.PTSPG, (x) => `${x.P} points in ${x.GP} games (${d2(x.PTSPG)})`, `${e === 1 ? 15 : 40}+ games`);
  r("h_sniper", `score ${Math.round(b.g * 0.7)} goals with more goals than assists`, (x) => x.G >= Math.round(b.g * 0.7) && x.G > x.A, (x) => x.G, (x) => `${x.G}G, ${x.A}A`);
  r("h_setup", `record ${Math.round(b.a * 0.8)} assists with twice as many assists as goals`, (x) => x.A >= Math.round(b.a * 0.8) && x.A >= 2 * x.G, (x) => x.A, (x) => `${x.A}A, ${x.G}G`);
  r("h_pim", `rack up ${b.pim} penalty minutes`, (x) => has(x.PIM) && x.PIM >= b.pim, (x) => x.PIM / 10, (x) => `${x.PIM} PIM`);
  r("h_tough", `record ${Math.round(b.p * 0.6)} points and ${Math.round(b.pim * 0.6)} penalty minutes`, (x) => x.P >= Math.round(b.p * 0.6) && has(x.PIM) && x.PIM >= Math.round(b.pim * 0.6), (x) => x.P, (x) => `${x.P} pts, ${x.PIM} PIM`);
  r("h_dg", `score ${b.dg} goals as a defenseman`, (x) => x.D && x.G >= b.dg, (x) => x.G, (x) => `${x.G} goals`);
  r("h_dp", `record ${b.dp} points as a defenseman`, (x) => x.D && x.P >= b.dp, (x) => x.P, (x) => `${x.P} points (${x.G}G, ${x.A}A)`);
  r("h_clean", `record ${Math.round(b.p * 0.6)} points with 10 or fewer penalty minutes`, (x) => x.P >= Math.round(b.p * 0.6) && has(x.PIM) && x.PIM <= 10 && x.q, (x) => x.P, (x) => `${x.P} pts, ${x.PIM} PIM`);
  r("h_ppg", `score ${e >= 3 ? 25 : 15} power-play goals`, (x) => has(x.PPG) && x.PPG >= (e >= 3 ? 25 : 15), (x) => x.PPG, (x) => `${x.PPG} PPG`);
  r("h_shg", `score ${e === 3 ? 8 : 6} shorthanded goals`, (x) => has(x.SHG) && x.SHG >= (e === 3 ? 8 : 6), (x) => x.SHG, (x) => `${x.SHG} SHG`);
  r("h_gwg", `score ${e === 3 ? 12 : 10} game-winning goals`, (x) => has(x.GWG) && x.GWG >= (e === 3 ? 12 : 10), (x) => x.GWG, (x) => `${x.GWG} GWG`);
  r("h_otg", "score 4 overtime goals", (x) => has(x.OTG) && x.OTG >= 4, (x) => x.OTG, (x) => `${x.OTG} OT goals`);
  const pmHi = { 1: 99, 2: 50, 3: 70, 4: 50, 5: 40, 6: 45 }[e], pmLo = { 1: -99, 2: -30, 3: -45, 4: -35, 5: -35, 6: -35 }[e];
  r("h_pm_hi", `finish ${sgn(pmHi)} or better`, (x) => has(x.PM) && x.PM >= pmHi, (x) => x.PM, (x) => `${sgn(x.PM)}`);
  r("h_pm_lo", `finish ${pmLo} or worse`, (x) => has(x.PM) && x.PM <= pmLo, (x) => -x.PM, (x) => `${sgn(x.PM)}`);
  r("h_spct", "shoot 25% on 150+ shots", (x) => has(x.S) && x.S >= 150 && x.SPCT >= 25, (x) => x.SPCT, (x) => `${d1(x.SPCT)}% (${x.G} on ${x.S} shots)`);
  r("h_shots", "fire 350 shots", (x) => has(x.S) && x.S >= 350, (x) => x.S / 10, (x) => `${x.S} shots`);
  r("h_eff", `score ${Math.round(b.g * 0.6)} goals on fewer than 150 shots`, (x) => has(x.S) && x.S > 0 && x.S < 150 && x.G >= Math.round(b.g * 0.6), (x) => x.SPCT, (x) => `${x.G} goals on ${x.S} shots`);
  r("h_volume_miss", `fire 300 shots and score ${Math.round(b.g * 0.4)} or fewer`, (x) => has(x.S) && x.S >= 300 && x.G <= Math.round(b.g * 0.4), (x) => x.S / 10, (x) => `${x.G} goals on ${x.S} shots`);
  r("h_toi", "average 28 minutes a game", (x) => has(x.TOI) && x.q && x.TOI >= 28, (x) => x.TOI, (x) => `${d1(x.TOI)} min/game`);
  r("h_first_g", `score ${e === 1 ? 20 : e === 2 ? 30 : 40} goals in their first NHL season`, (x) => x.first && x.G >= (e === 1 ? 20 : e === 2 ? 30 : 40), (x) => x.G, (x) => `${x.G} goals`);
  r("h_first_p", `record ${e === 1 ? 30 : e === 2 ? 55 : 80} points in their first NHL season`, (x) => x.first && x.P >= (e === 1 ? 30 : e === 2 ? 55 : 80), (x) => x.P, (x) => `${x.P} points`);
  r("h_old_g", `score ${Math.round(b.g * 0.5)} goals at age 36 or older`, (x) => has(x.age) && x.age >= 36 && x.G >= Math.round(b.g * 0.5), (x) => x.G, (x) => `${x.G} goals at ${x.age}`);
  r("h_old_p", `record ${Math.round(b.p * 0.6)} points at age 36 or older`, (x) => has(x.age) && x.age >= 36 && x.P >= Math.round(b.p * 0.6), (x) => x.P, (x) => `${x.P} points at ${x.age}`);
  r("h_young_g", `score ${Math.round(b.g * 0.6)} goals at age 20 or younger`, (x) => has(x.age) && x.age <= 20 && x.G >= Math.round(b.g * 0.6), (x) => x.G, (x) => `${x.G} goals at ${x.age}`);
  r("h_young_p", `record ${Math.round(b.p * 0.65)} points at age 20 or younger`, (x) => has(x.age) && x.age <= 20 && x.P >= Math.round(b.p * 0.65), (x) => x.P, (x) => `${x.P} points at ${x.age}`);
  if (e >= 3) r("h_euro", `score ${Math.round(b.g * 0.8)} goals, born outside North America`, (x) => x.born && !["CAN", "USA"].includes(x.born) && x.G >= Math.round(b.g * 0.8), (x) => x.G, (x) => `${x.G} goals (born ${x.born})`);
  r("h_usa", `score ${Math.round(b.g * 0.8)} goals, born in the United States`, (x) => x.born === "USA" && x.G >= Math.round(b.g * 0.8), (x) => x.G, (x) => `${x.G} goals`);
  r("h_d_pim", `record ${Math.round(b.dp * 0.6)} points and ${Math.round(b.pim * 0.5)} penalty minutes as a defenseman`, (x) => x.D && x.P >= Math.round(b.dp * 0.6) && has(x.PIM) && x.PIM >= Math.round(b.pim * 0.5), (x) => x.P, (x) => `${x.P} pts, ${x.PIM} PIM`);
  r("h_pts_no_ppg", `record ${Math.round(b.p * 0.6)} points with no power-play goals`, (x) => has(x.PPG) && x.PPG === 0 && x.P >= Math.round(b.p * 0.6), (x) => x.P, (x) => `${x.P} pts, 0 PPG`);
  return R;
}
function goalieRules(e, b) {
  const R = []; const r = (key, head, f, mag, say, floor = null) => R.push({ key, head, f, mag, say, floor, who: "goalie" });
  r("g_so", `record ${b.so} shutouts`, (x) => x.SO >= b.so, (x) => x.SO, (x) => `${x.SO} shutouts in ${x.GP} games`);
  r("g_gaa", `post a goals-against average under ${b.gaa.toFixed(2)}`, (x) => x.q && has(x.GAA) && x.GAA < b.gaa, (x) => 10 / x.GAA, (x) => `${d2(x.GAA)} GAA in ${x.GP} games`, "40% of games");
  if (b.sv) r("g_sv", `post a ${p3(b.sv)} save percentage`, (x) => x.q && has(x.SVP) && x.SVP >= b.sv, (x) => 1000 * x.SVP - 850, (x) => `${p3(x.SVP)} in ${x.GP} games`, "40% of games");
  r("g_w", `win ${b.w} games`, (x) => has(x.W) && x.W >= b.w, (x) => x.W, (x) => `${x.W}-${x.L}${has(x.T) ? `-${x.T}` : ""}${has(x.OTL) && x.OTL ? `-${x.OTL}` : ""}`);
  r("g_l", `lose ${e <= 1 ? 25 : e === 2 ? 38 : 40} games`, (x) => has(x.L) && x.L >= (e <= 1 ? 25 : e === 2 ? 38 : 40), (x) => x.L, (x) => `${x.W}-${x.L}${has(x.T) ? `-${x.T}` : ""}`);
  if (e >= 3) r("g_gp", "play 72 games", (x) => x.GP >= 72, (x) => x.GP, (x) => `${x.GP} GP`);
  if (e >= 2 && e <= 4) r("g_t", "tie 15 games", (x) => has(x.T) && x.T >= 15, (x) => x.T, (x) => `${x.T} ties`);
  r("g_sv2000", "make 2,000 saves", (x) => has(x.SV) && x.SV >= 2000, (x) => x.SV / 100, (x) => `${c(x.SV)} saves`);
  r("g_pts", "record 8 points as a goalie", (x) => x.A >= 8, (x) => x.A, (x) => `${x.A} assists`);
  r("g_first_so", `record ${Math.max(5, b.so - 4)} shutouts in their first NHL season`, (x) => x.first && x.SO >= Math.max(5, b.so - 4), (x) => x.SO, (x) => `${x.SO} shutouts`);
  r("g_old_w", "win 30 games at age 38 or older", (x) => has(x.age) && x.age >= 38 && has(x.W) && x.W >= 30, (x) => x.W, (x) => `${x.W} wins at ${x.age}`);
  return R;
}
function teamRules(e) {
  const R = []; const r = (key, head, f, mag, say, floor = null) => R.push({ key, head, f, mag, say, floor, who: "team" });
  const rec = (x) => `${x.W}-${x.L}${has(x.T) && x.T ? `-${x.T}` : ""}${has(x.OTL) && x.OTL ? `-${x.OTL}` : ""}`;
  r("t_pct800", "finish with a .800 points percentage", (x) => x.PCT >= 0.8, (x) => 100 * x.PCT, (x) => `${rec(x)}, ${p3(x.PCT)}`);
  r("t_pct300", "finish with a points percentage under .300", (x) => x.PCT < 0.3, (x) => 100 - 100 * x.PCT, (x) => `${rec(x)}, ${p3(x.PCT)}`);
  r("t_gdiff", `outscore opponents by ${e === 3 ? 150 : e === 1 ? 50 : 100}`, (x) => x.GF - x.GA >= (e === 3 ? 150 : e === 1 ? 50 : 100), (x) => (x.GF - x.GA) / 5, (x) => `${x.GF}-${x.GA}`);
  r("t_gdiff_neg", `get outscored by ${e === 3 ? 150 : e === 1 ? 50 : 100}`, (x) => x.GA - x.GF >= (e === 3 ? 150 : e === 1 ? 50 : 100), (x) => (x.GA - x.GF) / 5, (x) => `${x.GF}-${x.GA}`);
  r("t_gpg", `score ${e === 3 ? 4.5 : e === 1 ? 3.5 : 3.8} goals a game`, (x) => x.GFPG >= (e === 3 ? 4.5 : e === 1 ? 3.5 : 3.8), (x) => 10 * x.GFPG, (x) => `${d2(x.GFPG)} per game`);
  r("t_gapg", `allow fewer than ${e === 3 ? 2.6 : e === 1 ? 1.5 : 2.2} goals a game`, (x) => x.GAPG < (e === 3 ? 2.6 : e === 1 ? 1.5 : 2.2), (x) => 10 / x.GAPG, (x) => `${d2(x.GAPG)} per game`);
  if (e >= 2 && e <= 4) r("t_ties", "tie 20 games", (x) => has(x.T) && x.T >= 20, (x) => x.T, (x) => rec(x));
  r("t_pp", "convert 27% of power plays", (x) => has(x.PP) && x.PP >= 27, (x) => x.PP, (x) => `${d1(x.PP)}% PP`);
  r("t_pk", "kill 88% of penalties", (x) => has(x.PK) && x.PK >= 88, (x) => x.PK, (x) => `${d1(x.PK)}% PK`);
  return R;
}
function extremes(e) {
  const X = []; const x = (key, base, pick, text) => X.push({ key, base, pick, text });
  x("x_g", (r) => true, (r) => r.G, (r, s, d) => `Most goals in a season in the ${d}: ${r.name}, ${s} — ${r.G} in ${r.GP} games.`);
  x("x_p", (r) => true, (r) => r.P, (r, s, d) => `Most points in a season in the ${d}: ${r.name}, ${s} — ${r.P} (${r.G}G, ${r.A}A).`);
  x("x_a", (r) => true, (r) => r.A, (r, s, d) => `Most assists in a season in the ${d}: ${r.name}, ${s} — ${r.A}.`);
  x("x_pim", (r) => has(r.PIM), (r) => r.PIM, (r, s, d) => `Most penalty minutes in a season in the ${d}: ${r.name}, ${s} — ${r.PIM}.`);
  x("x_ppg", (r) => has(r.PPG), (r) => r.PPG, (r, s, d) => `Most power-play goals in a season in the ${d}: ${r.name}, ${s} — ${r.PPG}.`);
  x("x_shg", (r) => has(r.SHG), (r) => r.SHG, (r, s, d) => `Most shorthanded goals in a season in the ${d}: ${r.name}, ${s} — ${r.SHG}.`);
  x("x_gwg", (r) => has(r.GWG), (r) => r.GWG, (r, s, d) => `Most game-winning goals in a season in the ${d}: ${r.name}, ${s} — ${r.GWG}.`);
  x("x_pm", (r) => has(r.PM), (r) => r.PM, (r, s, d) => `Best plus-minus in a season in the ${d}: ${r.name}, ${s} — ${sgn(r.PM)}.`);
  x("x_pm_lo", (r) => has(r.PM), (r) => -r.PM, (r, s, d) => `Worst plus-minus in a season in the ${d}: ${r.name}, ${s} — ${sgn(r.PM)}.`);
  x("x_s", (r) => has(r.S), (r) => r.S, (r, s, d) => `Most shots in a season in the ${d}: ${r.name}, ${s} — ${r.S}.`);
  x("x_spct", (r) => has(r.S) && r.S >= 150, (r) => r.SPCT, (r, s, d) => `Best shooting percentage in a season (150+ shots) in the ${d}: ${r.name}, ${s} — ${d1(r.SPCT)}%.`);
  x("x_dp", (r) => r.D, (r) => r.P, (r, s, d) => `Most points by a defenseman in a season in the ${d}: ${r.name}, ${s} — ${r.P}.`);
  x("x_dg", (r) => r.D, (r) => r.G, (r, s, d) => `Most goals by a defenseman in a season in the ${d}: ${r.name}, ${s} — ${r.G}.`);
  x("x_ptspg", (r) => r.q, (r) => r.PTSPG, (r, s, d) => `Most points per game in a season (60% of games) in the ${d}: ${r.name}, ${s} — ${d2(r.PTSPG)}.`);
  x("x_gpg", (r) => r.q, (r) => r.GPG, (r, s, d) => `Most goals per game in a season (60% of games) in the ${d}: ${r.name}, ${s} — ${d2(r.GPG)}.`);
  x("x_first_g", (r) => r.first, (r) => r.G, (r, s, d) => `Most goals in a first NHL season in the ${d}: ${r.name}, ${s} — ${r.G}.`);
  x("x_first_p", (r) => r.first, (r) => r.P, (r, s, d) => `Most points in a first NHL season in the ${d}: ${r.name}, ${s} — ${r.P}.`);
  x("x_toi", (r) => has(r.TOI) && r.q, (r) => r.TOI, (r, s, d) => `Most ice time per game in a season in the ${d}: ${r.name}, ${s} — ${d1(r.TOI)} minutes.`);
  return X;
}
function goalieExtremes() {
  const X = []; const x = (key, base, pick, text) => X.push({ key, base, pick, text });
  x("gx_w", (r) => has(r.W), (r) => r.W, (r, s, d) => `Most wins by a goalie in a season in the ${d}: ${r.name}, ${s} — ${r.W}.`);
  x("gx_so", (r) => true, (r) => r.SO, (r, s, d) => `Most shutouts in a season in the ${d}: ${r.name}, ${s} — ${r.SO}.`);
  x("gx_gaa", (r) => r.q && has(r.GAA), (r) => -r.GAA, (r, s, d) => `Best goals-against average in a season (40% of games) in the ${d}: ${r.name}, ${s} — ${d2(r.GAA)}.`);
  x("gx_sv", (r) => r.q && has(r.SVP), (r) => r.SVP, (r, s, d) => `Best save percentage in a season (40% of games) in the ${d}: ${r.name}, ${s} — ${p3(r.SVP)}.`);
  x("gx_saves", (r) => has(r.SV), (r) => r.SV, (r, s, d) => `Most saves in a season in the ${d}: ${r.name}, ${s} — ${c(r.SV)}.`);
  x("gx_gp", (r) => true, (r) => r.GP, (r, s, d) => `Most games by a goalie in a season in the ${d}: ${r.name}, ${s} — ${r.GP}.`);
  x("gx_l", (r) => has(r.L), (r) => r.L, (r, s, d) => `Most losses by a goalie in a season in the ${d}: ${r.name}, ${s} — ${r.L}.`);
  return X;
}
function teamExtremes() {
  const X = []; const x = (key, base, pick, text) => X.push({ key, base, pick, text });
  const rec = (x2) => `${x2.W}-${x2.L}${has(x2.T) && x2.T ? `-${x2.T}` : ""}${has(x2.OTL) && x2.OTL ? `-${x2.OTL}` : ""}`;
  x("tx_pct", () => true, (r) => r.PCT, (r, s, d) => `Best points percentage in a season in the ${d}: ${r.name}, ${s} — ${p3(r.PCT)} (${rec(r)}).`);
  x("tx_pct_lo", () => true, (r) => -r.PCT, (r, s, d) => `Worst points percentage in a season in the ${d}: ${r.name}, ${s} — ${p3(r.PCT)} (${rec(r)}).`);
  x("tx_gf", () => true, (r) => r.GFPG, (r, s, d) => `Most goals per game by a team in the ${d}: ${r.name}, ${s} — ${d2(r.GFPG)} (${r.GF} in ${r.GP}).`);
  x("tx_ga", () => true, (r) => -r.GAPG, (r, s, d) => `Fewest goals allowed per game in the ${d}: ${r.name}, ${s} — ${d2(r.GAPG)} (${r.GA} in ${r.GP}).`);
  x("tx_gd", () => true, (r) => r.GF - r.GA, (r, s, d) => `Best goal differential in a season in the ${d}: ${r.name}, ${s} — ${sgn(r.GF - r.GA)}.`);
  x("tx_pp", (r) => has(r.PP), (r) => r.PP, (r, s, d) => `Best power play in a season in the ${d}: ${r.name}, ${s} — ${d1(r.PP)}%.`);
  x("tx_pk", (r) => has(r.PK), (r) => r.PK, (r, s, d) => `Best penalty kill in a season in the ${d}: ${r.name}, ${s} — ${d1(r.PK)}%.`);
  return X;
}
const NEAR = (e) => e >= 3 ? [
  { key: "n_g49", f: (r) => r.G === 49, what: "exactly 49 goals", one: "one short of 50" },
  { key: "n_p99", f: (r) => r.P === 99, what: "exactly 99 points", one: "one short of 100" },
] : [{ key: "n_g29", f: (r) => r.G === 29, what: "exactly 29 goals", one: "one short of 30" }];
function streaks(e, b) {
  return [
    { key: "st_g", f: (r) => r.G >= Math.round(b.g * 0.7), what: `scored ${Math.round(b.g * 0.7)}+ goals`, min: 3 },
    { key: "st_p", f: (r) => r.P >= Math.round(b.p * 0.75), what: `recorded ${Math.round(b.p * 0.75)}+ points`, min: 3 },
    { key: "st_pim", f: (r) => has(r.PIM) && r.PIM >= Math.round(b.pim * 0.7), what: `racked up ${Math.round(b.pim * 0.7)}+ penalty minutes`, min: 3 },
    { key: "st_ppg", f: (r) => r.q && r.PTSPG >= 1, what: "averaged a point a game (60% of games)", min: 4 },
  ];
}
function totals(e) {
  const T = []; const t = (key, val, text, min) => T.push({ key, val, text, min });
  const lead = (a, n) => (n && n.v === a.v ? null : a);
  t("tt_g", (r) => r.G, (a, d, n) => `Most goals of the ${d}: ${a.name}, ${c(a.v)}${n ? ` (next: ${n.name}, ${c(n.v)})` : ""}.`);
  t("tt_p", (r) => r.P, (a, d, n) => `Most points of the ${d}: ${a.name}, ${c(a.v)}${n ? ` (next: ${n.name}, ${c(n.v)})` : ""}.`);
  t("tt_a", (r) => r.A, (a, d, n) => `Most assists of the ${d}: ${a.name}, ${c(a.v)}.`);
  t("tt_pim", (r) => r.PIM, (a, d) => `Most penalty minutes of the ${d}: ${a.name}, ${c(a.v)}.`);
  t("tt_gwg", (r) => r.GWG, (a, d) => `Most game-winning goals of the ${d}: ${a.name}, ${a.v}.`);
  t("tt_ppg", (r) => r.PPG, (a, d) => `Most power-play goals of the ${d}: ${a.name}, ${a.v}.`);
  t("tt_pm", (r) => r.PM, (a, d) => `Best combined plus-minus of the ${d}: ${a.name}, ${sgn(a.v)}.`);
  t("tt_gp", (r) => r.GP, (a, d) => `Most games played in the ${d}: ${a.name}, ${c(a.v)}.`);
  t("tt_dp", (r) => (r.D ? r.P : null), (a, d) => `Most points by a defenseman in the ${d}: ${a.name}, ${c(a.v)}.`);
  const bigG = { 1: 20, 2: 30, 3: 50, 4: 40, 5: 40, 6: 40 }[e], bigP = { 1: 30, 2: 60, 3: 100, 4: 90, 5: 90, 6: 100 }[e];
  t("tt_bigg", (r) => (r.G >= bigG ? 1 : null), (a, d) => `Most ${bigG}-goal seasons in the ${d}: ${a.name}, ${a.v}.`);
  t("tt_bigp", (r) => (r.P >= bigP ? 1 : null), (a, d) => `Most ${bigP}-point seasons in the ${d}: ${a.name}, ${a.v}.`);
  return T.map((s) => ({ ...s, text0: s.text }));
}
function goalieTotals() {
  return [
    { key: "gt_w", val: (r) => r.W, text: (a, d) => `Most goalie wins of the ${d}: ${a.name}, ${c(a.v)}.` },
    { key: "gt_so", val: (r) => r.SO, text: (a, d) => `Most shutouts of the ${d}: ${a.name}, ${a.v}.` },
    { key: "gt_gp", val: (r) => r.GP, text: (a, d) => `Most games in goal in the ${d}: ${a.name}, ${c(a.v)}.` },
  ];
}
function seasonCounts(e, b) {
  const C = [];
  const g = { 1: 20, 2: 30, 3: 50, 4: 40, 5: 40, 6: 40 }[e], p = { 1: 30, 2: 60, 3: 100, 4: 90, 5: 90, 6: 100 }[e];
  C.push({ key: "c_g", f: (r) => r.G >= g, what: `${g}-goal scorers` }, { key: "c_p", f: (r) => r.P >= p, what: `${p}-point players` },
    { key: "c_ppg1", f: (r) => r.q && r.PTSPG >= 1, what: "point-a-game players (60% of games)" }, { key: "c_dg", f: (r) => r.D && r.G >= Math.round(b.dg * 0.75), what: `defensemen with ${Math.round(b.dg * 0.75)}+ goals` });
  return C;
}
const PO_RULES = (e) => [
  { key: "po_p", head: `record ${e === 3 ? 30 : e === 1 ? 8 : e === 2 ? 15 : 25} points in one postseason`, f: (r) => r.P >= (e === 3 ? 30 : e === 1 ? 8 : e === 2 ? 15 : 25), mag: (r) => r.P, say: (r) => `${r.P} points in ${r.GP} games` },
  { key: "po_g", head: `score ${e === 3 ? 15 : e === 1 ? 5 : e === 2 ? 10 : 13} goals in one postseason`, f: (r) => r.G >= (e === 3 ? 15 : e === 1 ? 5 : e === 2 ? 10 : 13), mag: (r) => r.G, say: (r) => `${r.G} goals in ${r.GP} games` },
  { key: "po_dp", head: `record ${e === 3 ? 25 : e <= 2 ? 8 : 20} points as a defenseman in one postseason`, f: (r) => r.D && r.P >= (e === 3 ? 25 : e <= 2 ? 8 : 20), mag: (r) => r.P, say: (r) => `${r.P} points in ${r.GP} games` },
  { key: "po_gwg", head: "score 5 game-winning goals in one postseason", f: (r) => has(r.GWG) && r.GWG >= 5, mag: (r) => r.GWG, say: (r) => `${r.GWG} GWG` },
];
const PO_GOALIE = [
  { key: "pog_so", head: "record 4 shutouts in one postseason", f: (r) => r.SO >= 4, mag: (r) => r.SO, say: (r) => `${r.SO} shutouts in ${r.GP} games`, who: "goalie" },
  { key: "pog_gaa", head: "post a goals-against average under 1.60 in one postseason", floor: "10+ games", f: (r) => r.GP >= 10 && has(r.GAA) && r.GAA < 1.6, mag: (r) => 10 / r.GAA, say: (r) => `${d2(r.GAA)} GAA in ${r.GP} games`, who: "goalie" },
];

const PO_X = [
  { key: "pox_p", base: () => true, pick: (r) => r.P, text: (r, s, d) => `Most points in a single postseason in the ${d}: ${r.name}, ${s} — ${r.P} in ${r.GP} games.` },
  { key: "pox_g", base: () => true, pick: (r) => r.G, text: (r, s, d) => `Most goals in a single postseason in the ${d}: ${r.name}, ${s} — ${r.G} in ${r.GP} games.` },
];
const POG_X = [{ key: "pogx_so", base: () => true, pick: (r) => r.SO, text: (r, s, d) => `Most shutouts in a single postseason in the ${d}: ${r.name}, ${s} — ${r.SO}.` }];

function build(decade) {
  registry();
  const S = [], G = [], T = [], PS = [], PG = []; const seasons = [];
  for (let y = Math.max(decade, 1917); y < decade + 10; y += 1) {
    const sk = load(y, "rs", "skaters"); if (!sk || !sk.length) continue;
    const gl = load(y, "rs", "goalies") || []; const tm = load(y, "rs", "teams") || [];
    const maxGP = Math.max(0, ...tm.map((t) => t.gamesPlayed || 0)) || Math.max(...sk.map((r) => r.gamesPlayed || 0));
    const rec = { pm: recorded(sk, "plusMinus", 0.5), pp: recorded(sk.filter((r) => (r.goals || 0) >= 10), "ppGoals", 0.5, 20), gwg: recorded(sk.filter((r) => (r.goals || 0) >= 10), "gameWinningGoals", 0.5, 20),
      ot: y >= 1983 && recorded(sk.filter((r) => (r.goals || 0) >= 20), "otGoals", 0.2, 40), shots: recorded(sk, "shots", 0.8), toi: recorded(sk, "timeOnIcePerGame", 0.8),
      sa: recorded(gl, "shotsAgainst", 0.8, 10), ties: y < 2005 };
    seasons.push(y);
    for (const r of sk) S.push(skater(r, y, maxGP, rec));
    for (const r of gl) G.push(goalie(r, y, maxGP, rec));
    for (const t of tm) { const GP = t.gamesPlayed || 0; const pts = has(t.points) ? t.points : 2 * (t.wins || 0) + (t.ties || 0) + (t.otLosses || 0);
      T.push({ id: t.teamFullName, name: t.teamFullName, season: y, GP, W: t.wins ?? 0, L: t.losses ?? 0, T: y < 2005 ? t.ties ?? null : null, OTL: t.otLosses ?? null, GF: t.goalsFor ?? 0, GA: t.goalsAgainst ?? 0,
        PCT: has(t.pointPct) ? t.pointPct : GP ? pts / (2 * GP) : null, GFPG: GP ? (t.goalsFor || 0) / GP : null, GAPG: GP ? (t.goalsAgainst || 0) / GP : null,
        PP: has(t.powerPlayPct) && t.powerPlayPct > 0 ? 100 * t.powerPlayPct : null, PK: has(t.penaltyKillPct) && t.penaltyKillPct > 0 ? 100 * t.penaltyKillPct : null }); }
    const psk = load(y, "po", "skaters") || []; const pgl = load(y, "po", "goalies") || [];
    const poMax = Math.max(0, ...psk.map((r) => r.gamesPlayed || 0));
    for (const r of psk) PS.push(skater(r, y, poMax, rec));
    for (const r of pgl) PG.push(goalie(r, y, poMax, rec));
  }
  if (!seasons.length) return null;
  const e = era(seasons[Math.floor(seasons.length / 2)]); const b = BAR[e]; const decadeLabel = `${decade}s`;
  const ev = (r) => { const o = {}; for (const k of ["id", "name", "season", "team", "pos", "GP", "G", "A", "P", "PIM", "PM", "PPG", "SHG", "GWG", "S", "TOI", "age", "W", "L", "T", "OTL", "SO", "GAA", "SVP", "SV", "GF", "GA", "PCT"]) if (r[k] !== undefined && r[k] !== null) o[k] = r[k]; return o; };
  const ctx = { decadeLabel, label, ev, seasons, who: "player", size: (r) => r.GP };
  const gctx = { ...ctx, who: "goalie" }; const tctx = { ...ctx, who: "team", pron: "it" };
  const cands = [];
  cands.push(...core.ruleFacts(S, skaterRules(e, b), ctx));
  cands.push(...core.ruleFacts(G, goalieRules(e, b), gctx));
  cands.push(...core.ruleFacts(T, teamRules(e), tctx));
  cands.push(...core.ruleFacts(PS, PO_RULES(e).map((x) => ({ ...x, group: "PO" })), ctx));
  cands.push(...core.ruleFacts(PG, PO_GOALIE.map((x) => ({ ...x, group: "PO" })), gctx));
  cands.push(...core.extremeFacts(S, extremes(e), ctx));
  cands.push(...core.extremeFacts(G, goalieExtremes(), gctx));
  cands.push(...core.extremeFacts(T, teamExtremes(), tctx));
  cands.push(...core.extremeFacts(PS, PO_X, ctx));
  cands.push(...core.extremeFacts(PG, POG_X, gctx));
  cands.push(...core.nearMissFacts(S, NEAR(e), ctx));
  cands.push(...core.streakFacts(S, streaks(e, b), ctx));
  cands.push(...core.streakFacts(G, [{ key: "gst_w", f: (r) => has(r.W) && r.W >= Math.round(b.w * 0.75), what: `won ${Math.round(b.w * 0.75)}+ games in goal`, min: 3 }], gctx));
  // Decade totals: only with a clear leader.
  const tot = [...core.totalFacts(S, totals(e), ctx), ...core.totalFacts(G, goalieTotals(), gctx)];
  for (const f of tot) { const ev0 = f.evidence; if (ev0[1] && ev0[1].total === ev0[0].total) continue; if (!ev0[0].total) continue; cands.push(f); }
  cands.push(...core.seasonCountFacts(S, seasonCounts(e, b), ctx));
  // Extremes that are ties are not "most": drop them (the evidence holds only
  // the winner, so re-check against the full set here).
  const all = { S, G, T, PS, PG };
  const clean = cands.filter((f) => {
    if (f.kind !== "extreme") return true;
    const specs = [...extremes(e), ...goalieExtremes(), ...teamExtremes(), ...PO_X, ...POG_X];
    const spec = specs.find((x) => x.key === f.rule); if (!spec) return true;
    const pool = /^gx_/.test(f.rule) ? all.G : /^tx_/.test(f.rule) ? all.T : /^pogx_/.test(f.rule) ? all.PG : /^pox_/.test(f.rule) ? all.PS : all.S;
    const vals = pool.filter((r) => { try { return spec.base(r); } catch (err) { return false; } }).map((r) => spec.pick(r)).filter(Number.isFinite).sort((a, b2) => b2 - a);
    return vals.length < 2 || vals[0] !== vals[1];
  });
  // Season counts with a tie at the top or bottom are not "the most/fewest".
  const clean2 = clean.filter((f) => {
    if (f.kind !== "season" || !Array.isArray(f.evidence)) return true;
    const ns = f.evidence.map((x) => x.count); const target = /_most$/.test(f.rule) ? Math.max(...ns) : Math.min(...ns);
    return ns.filter((n) => n === target).length === 1;
  });
  const facts = core.select(clean2, 100);
  annotate({ facts, decade: decadeLabel }, "nhl");
  return { sport: "NHL", decade: decadeLabel, era: e, seasons: seasons.map(label), candidates: clean2.length, facts,
    counts: { skaterSeasons: S.length, goalieSeasons: G.length, teamSeasons: T.length },
    method: [
      "NHL: every skater, goalie and team season of the decade, regular season and playoffs, from the NHL's official stats (api.nhle.com), pulled on Nick's machine. Nothing is recalled or estimated; the rows behind each line are stored with it.",
      "A stat is used only in seasons where the league genuinely recorded it (shots, plus-minus, power-play and game-winning goals, time on ice and save percentage arrive later and untracked seasons can report zeros); qualification is 60% of the season's games for skaters and 40% for goalies. Ages are as of Feb. 1 of the season. 'First NHL season' means a player's first season in the NHL's records, so a player arriving from another league counts. Ties in a 'most' or 'fewest' line are dropped, never broken.",
    ], generatedAt: new Date().toISOString() };
}

function main() {
  const nums = process.argv.slice(2).filter((a) => /^\d{4}$/.test(a)).map(Number);
  const decades = nums.length ? nums : [1910, 1920, 1930, 1940, 1950, 1960, 1970, 1980, 1990, 2000, 2010, 2020];
  fs.mkdirSync(OUT, { recursive: true });
  for (const d of decades) {
    const r = build(d); if (!r) { console.log(`${d}s: no data`); continue; }
    fs.writeFileSync(path.join(OUT, `${d}s-facts.json`), JSON.stringify(r, null, 1));
    console.log(`${d}s: ${r.facts.length}/100 from ${r.candidates} candidates over ${r.seasons.length} seasons`);
  }
}
if (require.main === module) main();
module.exports = { build };
