#!/usr/bin/env node
// NBA decade facts from the official season pulls in statdesk/data/nba/seasons.
//
// Same discipline as the MLB decade pages: every line is a rule evaluated over
// every player-season of the decade, the rows behind it are stored, "only /
// two / few" count players. Categories the league did not record in a given
// season are null in the pull and every rule that needs them simply does not
// see that season — a 1962 player has no steals, not zero steals.
//
// Qualification: a player needs 60% of the most games anyone played that
// season (so the 50-game 1998-99 and 66-game 2011-12 seasons get the right
// bar). Rules with attempt floors state them in the line.
//
// Team-mate lines are deliberately absent: the league-leaders feed carries one
// row per player per season with a single team, so a traded player's full
// season would be credited to one club. The MLB pages shipped that bug once.
//
//   node statdesk/nba/facts.js [1980 1990 ...]
"use strict";
const fs = require("fs");
const path = require("path");
const core = require("../lib/factcore");

const DATA = path.join(__dirname, "..", "data", "nba");
const OUT = path.join(DATA, "facts");

const label = (y) => `${y}-${String((y + 1) % 100).padStart(2, "0")}`;
const d1 = (v) => (v == null ? "—" : v.toFixed(1));
const p3 = (v) => (v == null ? "—" : v.toFixed(3).replace(/^0/, ""));
const has = (v) => v !== null && v !== undefined;

function loadSeason(y, type) {
  const f = path.join(DATA, "seasons", `${label(y)}-${type}.json`);
  if (!fs.existsSync(f)) return null;
  return JSON.parse(fs.readFileSync(f, "utf8"));
}

// Derived per-game and rate fields; null whenever an input was not recorded.
function enrich(r, season, maxGP) {
  const g = r.GP || 0; const pg = (v) => (has(v) && g ? v / g : null);
  const pct = (m, a) => (has(m) && has(a) && a > 0 ? m / a : null);
  const x = { ...r, season, maxGP, PPG: pg(r.PTS), RPG: pg(r.REB), APG: pg(r.AST), SPG: pg(r.STL), BPG: pg(r.BLK), MPG: pg(r.MIN), TPG: pg(r.TOV), FPG: pg(r.PF),
    FG: pct(r.FGM, r.FGA), FT: pct(r.FTM, r.FTA), TP: pct(r.FG3M, r.FG3A),
    TWO: has(r.FG3M) && has(r.FGA) && r.FGA - (r.FG3A || 0) > 0 ? (r.FGM - r.FG3M) / (r.FGA - (r.FG3A || 0)) : null };
  x.q = g >= Math.ceil(0.6 * maxGP);
  return x;
}

// Era bars. e1 pre-shot-clock (to 1953-54), e2 the fast no-three era (to
// 1972-73), e3 steals/blocks but no three (to 1978-79), e4 early three-point
// era (to 1998-99), e5 (to 2012-13), e6 the three-point era.
function era(y) { return y < 1954 ? 1 : y < 1973 ? 2 : y < 1979 ? 3 : y < 1999 ? 4 : y < 2013 ? 5 : 6; }
const BAR = {
  1: { ppg: 20, ppgHi: 25, fgLow: 0.33, fgHi: 0.42, rpg: 12, apg: 6, pts: 1500 },
  2: { ppg: 25, ppgHi: 30, fgLow: 0.41, fgHi: 0.50, rpg: 15, apg: 8, pts: 2000 },
  3: { ppg: 25, ppgHi: 30, fgLow: 0.43, fgHi: 0.55, rpg: 13, apg: 8, pts: 2000 },
  4: { ppg: 25, ppgHi: 30, fgLow: 0.43, fgHi: 0.56, rpg: 12, apg: 10, pts: 2000 },
  5: { ppg: 25, ppgHi: 30, fgLow: 0.42, fgHi: 0.56, rpg: 12, apg: 9, pts: 2000 },
  6: { ppg: 27, ppgHi: 30, fgLow: 0.43, fgHi: 0.60, rpg: 12, apg: 9, pts: 2000 },
};

function rules(e, b) {
  const R = [];
  const add = (o) => R.push(o);
  // --- scoring shapes ---
  add({ key: "volume_bricks", head: `average ${b.ppg}+ points while shooting under ${p3(b.fgLow)} from the field`, floor: "60% of games",
    f: (r) => r.q && r.PPG >= b.ppg && has(r.FG) && r.FG < b.fgLow, mag: (r) => r.PPG - 100 * r.FG, say: (r) => `${d1(r.PPG)} ppg, ${p3(r.FG)} FG` });
  add({ key: "score_no_pass", head: `average ${b.ppg - 5}+ points with fewer than 2 assists a game`, floor: "60% of games",
    f: (r) => r.q && r.PPG >= b.ppg - 5 && has(r.APG) && r.APG < 2, mag: (r) => r.PPG - 5 * r.APG, say: (r) => `${d1(r.PPG)} ppg, ${d1(r.APG)} apg` });
  add({ key: "twenty_ten_no_pass", head: "average 20 points and 10 rebounds with under 1.5 assists", floor: "60% of games",
    f: (r) => r.q && r.PPG >= 20 && r.RPG >= 10 && has(r.APG) && r.APG < 1.5, mag: (r) => r.PPG + r.RPG - 10 * r.APG, say: (r) => `${d1(r.PPG)}/${d1(r.RPG)}/${d1(r.APG)}` });
  add({ key: "thirty_ppg", head: `average ${b.ppgHi} points a game`, floor: "60% of games",
    f: (r) => r.q && r.PPG >= b.ppgHi, mag: (r) => r.PPG, say: (r) => `${d1(r.PPG)} ppg` });
  add({ key: "thirty_inefficient", head: `average ${b.ppgHi} points on under ${p3(b.fgLow + 0.03)} shooting`, floor: "60% of games",
    f: (r) => r.q && r.PPG >= b.ppgHi && has(r.FG) && r.FG < b.fgLow + 0.03, mag: (r) => r.PPG - 50 * r.FG, say: (r) => `${d1(r.PPG)} ppg, ${p3(r.FG)} FG` });
  add({ key: "pts_total", head: `score ${b.pts.toLocaleString()} points in a season`, floor: null,
    f: (r) => r.PTS >= b.pts, mag: (r) => r.PTS / 20, say: (r) => `${r.PTS.toLocaleString()} pts` });
  add({ key: "pts_3000", head: "score 3,000 points in a season", floor: null,
    f: (r) => r.PTS >= 3000, mag: (r) => r.PTS / 20, say: (r) => `${r.PTS.toLocaleString()} pts` });
  // --- all-around ---
  add({ key: "twenty_ten_five", head: "average 20 points, 10 rebounds and 5 assists", floor: "60% of games",
    f: (r) => r.q && r.PPG >= 20 && r.RPG >= 10 && r.APG >= 5, mag: (r) => r.PPG + r.RPG + r.APG, say: (r) => `${d1(r.PPG)}/${d1(r.RPG)}/${d1(r.APG)}` });
  add({ key: "twentyfive_five_five", head: "average 25 points, 5 rebounds and 5 assists", floor: "60% of games",
    f: (r) => r.q && r.PPG >= 25 && r.RPG >= 5 && r.APG >= 5, mag: (r) => r.PPG + r.RPG + r.APG, say: (r) => `${d1(r.PPG)}/${d1(r.RPG)}/${d1(r.APG)}` });
  add({ key: "triple_double_avg", head: "average a triple-double for a season", floor: "60% of games",
    f: (r) => r.q && r.PPG >= 10 && r.RPG >= 10 && r.APG >= 10, mag: (r) => r.PPG + r.RPG + r.APG, say: (r) => `${d1(r.PPG)}/${d1(r.RPG)}/${d1(r.APG)}` });
  add({ key: "twenty_ten_ast", head: "average 20 points and 10 assists", floor: "60% of games",
    f: (r) => r.q && r.PPG >= 20 && r.APG >= 10, mag: (r) => r.PPG + r.APG, say: (r) => `${d1(r.PPG)} ppg, ${d1(r.APG)} apg` });
  add({ key: "reb_over_pts", head: "grab more rebounds than they scored points", floor: "60% of games, 500+ reb",
    f: (r) => r.q && has(r.REB) && r.REB >= 500 && r.REB > r.PTS, mag: (r) => (r.REB - r.PTS) / 10, say: (r) => `${r.REB} reb, ${r.PTS} pts` });
  add({ key: "ast_over_pts", head: "record more assists than points", floor: "60% of games, 300+ ast",
    f: (r) => r.q && r.AST >= 300 && r.AST > r.PTS, mag: (r) => (r.AST - r.PTS) / 10, say: (r) => `${r.AST} ast, ${r.PTS} pts` });
  add({ key: "big_reb", head: `average ${b.rpg}+ rebounds`, floor: "60% of games",
    f: (r) => r.q && has(r.RPG) && r.RPG >= b.rpg, mag: (r) => r.RPG * 3, say: (r) => `${d1(r.RPG)} rpg` });
  add({ key: "big_ast", head: `average ${b.apg}+ assists`, floor: "60% of games",
    f: (r) => r.q && r.APG >= b.apg, mag: (r) => r.APG * 3, say: (r) => `${d1(r.APG)} apg` });
  add({ key: "reb_1000", head: "grab 1,000 rebounds in a season", floor: null,
    f: (r) => has(r.REB) && r.REB >= 1000, mag: (r) => r.REB / 30, say: (r) => `${r.REB.toLocaleString()} reb` });
  add({ key: "ast_800", head: "dish out 800 assists in a season", floor: null,
    f: (r) => r.AST >= 800, mag: (r) => r.AST / 25, say: (r) => `${r.AST} ast` });
  // --- free throws ---
  add({ key: "ft_900", head: "shoot .900 from the line on 400+ attempts", floor: null,
    f: (r) => r.FTA >= 400 && r.FT >= 0.9, mag: (r) => 100 * r.FT + r.FTA / 50, say: (r) => `${p3(r.FT)} on ${r.FTA.toLocaleString()} FTA` });
  add({ key: "ft_bad", head: "shoot under .550 from the line on 300+ attempts", floor: null,
    f: (r) => r.FTA >= 300 && r.FT < 0.55, mag: (r) => r.FTA / 10 - 100 * r.FT, say: (r) => `${p3(r.FT)} on ${r.FTA.toLocaleString()} FTA` });
  add({ key: "fta_800", head: "attempt 800 free throws in a season", floor: null,
    f: (r) => r.FTA >= 800, mag: (r) => r.FTA / 30, say: (r) => `${r.FTA} FTA (${p3(r.FT)})` });
  // --- field goal shapes ---
  add({ key: "fg_600", head: "shoot .600 from the field on 800+ attempts", floor: null,
    f: (r) => r.FGA >= 800 && r.FG >= 0.6, mag: (r) => 100 * r.FG, say: (r) => `${p3(r.FG)} on ${r.FGA.toLocaleString()} FGA` });
  add({ key: "fg_hi", head: `shoot ${p3(b.fgHi)} or better while averaging 20 points`, floor: "60% of games",
    f: (r) => r.q && r.PPG >= 20 && has(r.FG) && r.FG >= b.fgHi, mag: (r) => 100 * r.FG + r.PPG, say: (r) => `${p3(r.FG)} FG, ${d1(r.PPG)} ppg` });
  add({ key: "fga_2000", head: "attempt 2,000 field goals in a season", floor: null,
    f: (r) => r.FGA >= 2000, mag: (r) => r.FGA / 60, say: (r) => `${r.FGA.toLocaleString()} FGA` });
  // --- minutes, fouls, turnovers ---
  add({ key: "mpg_42", head: "average 42+ minutes a game", floor: "60% of games",
    f: (r) => r.q && has(r.MPG) && r.MPG >= 42, mag: (r) => r.MPG, say: (r) => `${d1(r.MPG)} mpg` });
  add({ key: "min_3300", head: "log 3,300 minutes in a season", floor: null,
    f: (r) => has(r.MIN) && r.MIN >= 3300, mag: (r) => r.MIN / 100, say: (r) => `${r.MIN.toLocaleString()} min` });
  add({ key: "iron", head: "play every game while averaging 38+ minutes", floor: null,
    f: (r) => r.GP >= r.maxGP && has(r.MPG) && r.MPG >= 38, mag: (r) => r.MPG, say: (r) => `${r.GP} GP, ${d1(r.MPG)} mpg` });
  add({ key: "pf_300", head: "commit 300 personal fouls in a season", floor: null,
    f: (r) => has(r.PF) && r.PF >= 300, mag: (r) => r.PF / 10, say: (r) => `${r.PF} PF` });
  add({ key: "tov_300", head: "commit 300 turnovers in a season", floor: null,
    f: (r) => has(r.TOV) && r.TOV >= 300, mag: (r) => r.TOV / 10, say: (r) => `${r.TOV} TOV` });
  add({ key: "score_tiny_min", head: "average 20 points in under 30 minutes a game", floor: "60% of games",
    f: (r) => r.q && r.PPG >= 20 && has(r.MPG) && r.MPG < 30, mag: (r) => r.PPG - r.MPG / 2, say: (r) => `${d1(r.PPG)} ppg in ${d1(r.MPG)} mpg` });
  add({ key: "play_all", head: "play every game of the season", floor: null,
    f: (r) => r.GP >= r.maxGP && r.maxGP >= 60, mag: (r) => (r.MIN || r.PTS / 20) / 100, say: (r) => `${r.GP} games${has(r.MPG) ? `, ${d1(r.MPG)} mpg` : ""}` });
  add({ key: "foul_trouble", head: "average 4.5+ personal fouls a game", floor: "60% of games",
    f: (r) => r.q && has(r.FPG) && r.FPG >= 4.5, mag: (r) => r.FPG * 5, say: (r) => `${d1(r.FPG)} PF a game` });
  add({ key: "volume_misses", head: `shoot under ${p3(b.fgLow + 0.02)} on 1,200+ attempts`, floor: null,
    f: (r) => r.FGA >= 1200 && r.FG < b.fgLow + 0.02, mag: (r) => r.FGA / 50 - 100 * r.FG, say: (r) => `${p3(r.FG)} on ${r.FGA.toLocaleString()} FGA` });
  add({ key: "short_big", head: "score 1,000 points in fewer than 50 games", floor: null,
    f: (r) => r.GP < 50 && r.PTS >= 1000, mag: (r) => r.PTS / r.GP, say: (r) => `${r.PTS.toLocaleString()} pts in ${r.GP} games` });
  add({ key: "short_scorer", head: `average ${b.ppg} points while missing 40% of the season`, floor: "20+ games",
    f: (r) => !r.q && r.GP >= 20 && r.PPG >= b.ppg, mag: (r) => r.PPG, say: (r) => `${d1(r.PPG)} ppg in ${r.GP} games` });
  // Era-scaled free-throw excellence: .900 was rare before the 1970s.
  const ftBar = e <= 2 ? 0.85 : 0.9;
  if (e <= 2) add({ key: "ft_elite_old", head: "shoot .850 from the line on 400+ attempts", floor: null,
    f: (r) => r.FTA >= 400 && r.FT >= ftBar, mag: (r) => 100 * r.FT + r.FTA / 50, say: (r) => `${p3(r.FT)} on ${r.FTA.toLocaleString()} FTA` });
  add({ key: "thirty_ten", head: "average 30 points and 10 rebounds", floor: "60% of games",
    f: (r) => r.q && r.PPG >= 30 && has(r.RPG) && r.RPG >= 10, mag: (r) => r.PPG + r.RPG, say: (r) => `${d1(r.PPG)} ppg, ${d1(r.RPG)} rpg` });
  add({ key: "twentyfive_ten_ast", head: "average 25 points and 10 assists", floor: "60% of games",
    f: (r) => r.q && r.PPG >= 25 && r.APG >= 10, mag: (r) => r.PPG + r.APG, say: (r) => `${d1(r.PPG)} ppg, ${d1(r.APG)} apg` });
  add({ key: "reb_extreme", head: "average 20 rebounds a game", floor: "60% of games",
    f: (r) => r.q && has(r.RPG) && r.RPG >= 20, mag: (r) => r.RPG * 3, say: (r) => `${d1(r.RPG)} rpg` });
  add({ key: "thirty_twenty", head: "average 30 points and 20 rebounds", floor: "60% of games",
    f: (r) => r.q && r.PPG >= 30 && has(r.RPG) && r.RPG >= 20, mag: (r) => r.PPG + r.RPG, say: (r) => `${d1(r.PPG)} ppg, ${d1(r.RPG)} rpg` });
  add({ key: "reb_1500", head: "grab 1,500 rebounds in a season", floor: null,
    f: (r) => has(r.REB) && r.REB >= 1500, mag: (r) => r.REB / 40, say: (r) => `${r.REB.toLocaleString()} reb` });
  add({ key: "fta_1000", head: "attempt 1,000 free throws in a season", floor: null,
    f: (r) => r.FTA >= 1000, mag: (r) => r.FTA / 40, say: (r) => `${r.FTA.toLocaleString()} FTA (${p3(r.FT)})` });
  add({ key: "ftm_700", head: "make 700 free throws in a season", floor: null,
    f: (r) => r.FTM >= 700, mag: (r) => r.FTM / 30, say: (r) => `${r.FTM} FTM` });
  add({ key: "mpg_45", head: "average 45 minutes a game", floor: "60% of games",
    f: (r) => r.q && has(r.MPG) && r.MPG >= 45, mag: (r) => r.MPG, say: (r) => `${d1(r.MPG)} mpg` });
  add({ key: "apg_10", head: "average 10 assists a game", floor: "60% of games",
    f: (r) => r.q && r.APG >= 10, mag: (r) => r.APG * 3, say: (r) => `${d1(r.APG)} apg` });
  if (e <= 3) add({ key: "reb_ast_big", head: "average 15 rebounds and 5 assists", floor: "60% of games",
    f: (r) => r.q && has(r.RPG) && r.RPG >= 15 && r.APG >= 5, mag: (r) => r.RPG + r.APG, say: (r) => `${d1(r.RPG)} rpg, ${d1(r.APG)} apg` });
  if (e <= 2) add({ key: "fg_500_old", head: "shoot .500 on 800+ attempts", floor: null,
    f: (r) => r.FGA >= 800 && r.FG >= 0.5, mag: (r) => 100 * r.FG, say: (r) => `${p3(r.FG)} on ${r.FGA.toLocaleString()} FGA` });
  if (e >= 4) add({ key: "threes_good_volume", head: "make 150 threes at a .400 clip", floor: null,
    f: (r) => r.FG3M >= 150 && r.TP >= 0.4, mag: (r) => r.FG3M / 10 + 100 * r.TP, say: (r) => `${r.FG3M} 3PM, ${p3(r.TP)}` });
  if (e >= 3) {
    add({ key: "stocks", head: "average 2 steals and 2 blocks", floor: "60% of games",
      f: (r) => r.q && r.SPG >= 2 && r.BPG >= 2, mag: (r) => 10 * (r.SPG + r.BPG), say: (r) => `${d1(r.SPG)} spg, ${d1(r.BPG)} bpg` });
    add({ key: "bpg_3", head: "average 3 blocks a game", floor: "60% of games",
      f: (r) => r.q && r.BPG >= 3, mag: (r) => 10 * r.BPG, say: (r) => `${d1(r.BPG)} bpg` });
    add({ key: "stl_200", head: "record 200 steals in a season", floor: null,
      f: (r) => r.STL >= 200, mag: (r) => r.STL / 8, say: (r) => `${r.STL} stl` });
    add({ key: "blk_250", head: "block 250 shots in a season", floor: null,
      f: (r) => r.BLK >= 250, mag: (r) => r.BLK / 10, say: (r) => `${r.BLK} blk` });
    add({ key: "oreb_over_dreb", head: "grab more offensive rebounds than defensive", floor: "300+ reb",
      f: (r) => r.REB >= 300 && r.OREB > r.DREB, mag: (r) => (r.OREB - r.DREB) / 5, say: (r) => `${r.OREB} off, ${r.DREB} def` });
    add({ key: "reb_stl", head: "average 10 rebounds and 2 steals", floor: "60% of games",
      f: (r) => r.q && r.RPG >= 10 && r.SPG >= 2, mag: (r) => r.RPG + 5 * r.SPG, say: (r) => `${d1(r.RPG)} rpg, ${d1(r.SPG)} spg` });
    add({ key: "blk_over_ast", head: "block more shots than they assisted while averaging 20 points", floor: "60% of games",
      f: (r) => r.q && r.PPG >= 20 && r.BLK > r.AST, mag: (r) => (r.BLK - r.AST) / 10 + r.PPG, say: (r) => `${r.BLK} blk, ${r.AST} ast` });
    add({ key: "guard_stocks", head: "average 2.5 steals a game", floor: "60% of games",
      f: (r) => r.q && r.SPG >= 2.5, mag: (r) => 10 * r.SPG, say: (r) => `${d1(r.SPG)} spg` });
  }
  if (e >= 4) {
    add({ key: "threes_bad", head: "make 150+ threes while shooting under .340 from deep", floor: null,
      f: (r) => r.FG3M >= 150 && r.TP < 0.34, mag: (r) => r.FG3M / 10 - 100 * r.TP, say: (r) => `${r.FG3M} 3PM, ${p3(r.TP)}` });
    add({ key: "threes_great", head: "shoot .450 from three on 250+ attempts", floor: null,
      f: (r) => r.FG3A >= 250 && r.TP >= 0.45, mag: (r) => 100 * r.TP, say: (r) => `${p3(r.TP)} on ${r.FG3A} 3PA` });
    add({ key: "no_threes", head: "score 1,500 points without making a three", floor: null,
      f: (r) => r.PTS >= 1500 && r.FG3M === 0, mag: (r) => r.PTS / 50, say: (r) => `${r.PTS} pts, ${r.FG3A} 3PA` });
    add({ key: "fifty_forty_ninety", head: "shoot 50-40-90", floor: "min. 100 3PA, 125 FTA, 60% of games",
      f: (r) => r.q && r.FG >= 0.5 && r.FG3A >= 100 && r.TP >= 0.4 && r.FTA >= 125 && r.FT >= 0.9, mag: (r) => 100 * (r.FG + r.TP + r.FT), say: (r) => `${p3(r.FG)}/${p3(r.TP)}/${p3(r.FT)}` });
    add({ key: "three_better_than_two", head: "shoot better from three than from two", floor: "250+ 3PA, 300+ 2PA",
      f: (r) => r.FG3A >= 250 && (r.FGA - r.FG3A) >= 300 && r.TP > r.TWO, mag: (r) => 100 * (r.TP - r.TWO), say: (r) => `${p3(r.TP)} 3P, ${p3(r.TWO)} 2P` });
    add({ key: "threes_200", head: `make ${e >= 6 ? 300 : 200} threes in a season`, floor: null,
      f: (r) => r.FG3M >= (e >= 6 ? 300 : 200), mag: (r) => r.FG3M / 10, say: (r) => `${r.FG3M} 3PM` });
  }
  if (e >= 6) add({ key: "more_threes_than_twos", head: "make more threes than twos", floor: "400+ FGA",
    f: (r) => r.FGA >= 400 && r.FG3M > r.FGM - r.FG3M, mag: (r) => r.FG3M - (r.FGM - r.FG3M), say: (r) => `${r.FG3M} threes, ${r.FGM - r.FG3M} twos` });
  return R.map((r) => ({ group: "P", ...r }));
}

function extremes(e) {
  const X = [
    { key: "top_ppg", base: (r) => r.q, pick: (r) => r.PPG, text: (r, s, d) => `Highest scoring average of the ${d}: ${r.name}, ${s} — ${d1(r.PPG)} points a game.` },
    { key: "worst_fg_scorer", base: (r) => r.q && r.PPG >= 20 && has(r.FG), pick: (r) => -r.FG, text: (r, s, d) => `Lowest field-goal percentage by a 20-point scorer in the ${d}: ${r.name}, ${s} — ${p3(r.FG)} while averaging ${d1(r.PPG)}.` },
    { key: "best_fg_volume", base: (r) => r.FGA >= 1000, pick: (r) => r.FG, text: (r, s, d) => `Best field-goal percentage on 1,000+ attempts in the ${d}: ${r.name}, ${s} — ${p3(r.FG)} (${r.FGM.toLocaleString()}-${r.FGA.toLocaleString()}).` },
    { key: "best_ft_volume", base: (r) => r.FTA >= 500, pick: (r) => r.FT, text: (r, s, d) => `Best free-throw percentage on 500+ attempts in the ${d}: ${r.name}, ${s} — ${p3(r.FT)} (${r.FTM.toLocaleString()}-${r.FTA.toLocaleString()}).` },
    { key: "worst_ft_volume", base: (r) => r.FTA >= 400, pick: (r) => -r.FT, text: (r, s, d) => `Worst free-throw percentage on 400+ attempts in the ${d}: ${r.name}, ${s} — ${p3(r.FT)} (${r.FTM.toLocaleString()}-${r.FTA.toLocaleString()}).` },
    { key: "ast_low_pts", base: (r) => r.q && r.PPG < 10, pick: (r) => r.AST, text: (r, s, d) => `Most assists by a sub-10-point scorer in the ${d}: ${r.name}, ${s} — ${r.AST} assists while averaging ${d1(r.PPG)}.` },
    { key: "most_pf", base: (r) => has(r.PF), pick: (r) => r.PF, text: (r, s, d) => `Most personal fouls in a season in the ${d}: ${r.name}, ${s} — ${r.PF}.` },
    { key: "most_fga", base: (r) => has(r.FGA), pick: (r) => r.FGA, text: (r, s, d) => `Most shots attempted in a season in the ${d}: ${r.name}, ${s} — ${r.FGA.toLocaleString()} FGA, ${p3(r.FG)}.` },
    { key: "most_reb", base: (r) => has(r.REB), pick: (r) => r.REB, text: (r, s, d) => `Most rebounds in a season in the ${d}: ${r.name}, ${s} — ${r.REB.toLocaleString()} (${d1(r.RPG)} a game).` },
    { key: "most_ast", base: (r) => has(r.AST), pick: (r) => r.AST, text: (r, s, d) => `Most assists in a season in the ${d}: ${r.name}, ${s} — ${r.AST} (${d1(r.APG)} a game).` },
    { key: "most_min", base: (r) => has(r.MIN), pick: (r) => r.MIN, text: (r, s, d) => `Most minutes played in a season in the ${d}: ${r.name}, ${s} — ${r.MIN.toLocaleString()} (${d1(r.MPG)} a game).` },
    { key: "ppg_bench_size", base: (r) => r.q && has(r.MPG) && r.MPG > 0, pick: (r) => r.PPG / r.MPG, text: (r, s, d) => `Most points per minute by a qualified player in the ${d}: ${r.name}, ${s} — ${d1(r.PPG)} ppg in ${d1(r.MPG)} minutes.` },
  ];
  X.push(
    { key: "reb_low_pts", base: (r) => r.q && has(r.REB) && r.PPG < 10, pick: (r) => r.REB, text: (r, s, d) => `Most rebounds by a sub-10-point scorer in the ${d}: ${r.name}, ${s} — ${r.REB} rebounds while averaging ${d1(r.PPG)}.` },
    { key: "top_rpg", base: (r) => r.q && has(r.RPG), pick: (r) => r.RPG, text: (r, s, d) => `Highest rebounding average of the ${d}: ${r.name}, ${s} — ${d1(r.RPG)} a game.` },
    { key: "top_apg", base: (r) => r.q, pick: (r) => r.APG, text: (r, s, d) => `Highest assist average of the ${d}: ${r.name}, ${s} — ${d1(r.APG)} a game.` });
  X.push(
    { key: "short_pts", base: (r) => r.GP < 50 && r.GP >= 20, pick: (r) => r.PTS, text: (r, s, d) => `Most points by a player who appeared in fewer than 50 games in the ${d}: ${r.name}, ${s} — ${r.PTS.toLocaleString()} in ${r.GP}.` },
    { key: "best_ft_official", base: (r) => r.FTM >= 125, pick: (r) => r.FT, text: (r, s, d) => `Best free-throw percentage in a season (125+ made) in the ${d}: ${r.name}, ${s} — ${p3(r.FT)}.` },
    { key: "most_ftm", base: (r) => has(r.FTM), pick: (r) => r.FTM, text: (r, s, d) => `Most free throws made in a season in the ${d}: ${r.name}, ${s} — ${r.FTM} of ${r.FTA}.` });
  if (e >= 3) X.push(
    { key: "most_oreb", base: (r) => has(r.OREB), pick: (r) => r.OREB, text: (r, s, d) => `Most offensive rebounds in a season in the ${d}: ${r.name}, ${s} — ${r.OREB}.` });
  if (e >= 3) X.push(
    { key: "most_stl", base: (r) => has(r.STL), pick: (r) => r.STL, text: (r, s, d) => `Most steals in a season in the ${d}: ${r.name}, ${s} — ${r.STL}.` },
    { key: "most_blk", base: (r) => has(r.BLK), pick: (r) => r.BLK, text: (r, s, d) => `Most blocked shots in a season in the ${d}: ${r.name}, ${s} — ${r.BLK}.` });
  if (e >= 4) X.push(
    { key: "pts_no_three", base: (r) => r.FG3M === 0, pick: (r) => r.PTS, text: (r, s, d) => `Most points in a season without a single made three in the ${d}: ${r.name}, ${s} — ${r.PTS.toLocaleString()}.` },
    { key: "most_3pa_bad", base: (r) => r.FG3A >= 200 && r.TP < 0.33, pick: (r) => r.FG3A, text: (r, s, d) => `Most threes attempted while shooting under .330 from deep in the ${d}: ${r.name}, ${s} — ${r.FG3A} attempts at ${p3(r.TP)}.` },
    { key: "best_3p_volume", base: (r) => r.FG3A >= 300, pick: (r) => r.TP, text: (r, s, d) => `Best three-point percentage on 300+ attempts in the ${d}: ${r.name}, ${s} — ${p3(r.TP)} (${r.FG3M}-${r.FG3A}).` },
    { key: "most_3pm", base: (r) => has(r.FG3M), pick: (r) => r.FG3M, text: (r, s, d) => `Most threes made in a season in the ${d}: ${r.name}, ${s} — ${r.FG3M}.` });
  if (e >= 4) X.push({ key: "most_tov", base: (r) => has(r.TOV), pick: (r) => r.TOV, text: (r, s, d) => `Most turnovers in a season in the ${d}: ${r.name}, ${s} — ${r.TOV}.` });
  return X;
}

const NEAR = [
  { key: "pts1999", f: (r) => r.PTS === 1999, what: "exactly 1,999 points", one: "one short of 2,000" },
  { key: "ppg299", f: (r) => r.q && Math.round(r.PPG * 10) === 299, what: "a 29.9 scoring average", one: "a tenth short of 30" },
  { key: "ppg249", f: (r) => r.q && Math.round(r.PPG * 10) === 249, what: "a 24.9 scoring average", one: "a tenth short of 25" },
  { key: "rpg99", f: (r) => r.q && has(r.RPG) && Math.round(r.RPG * 10) === 99, what: "9.9 rebounds a game", one: "a tenth short of a double-digit average" },
  { key: "apg99", f: (r) => r.q && Math.round(r.APG * 10) === 99, what: "9.9 assists a game", one: "a tenth short of 10" },
  { key: "ft899", f: (r) => r.FTA >= 300 && Math.round(r.FT * 1000) === 899, what: "an .899 free-throw percentage (300+ FTA)", one: "one point short of .900" },
  { key: "fg499", f: (r) => r.FGA >= 800 && Math.round(r.FG * 1000) === 499, what: "a .499 field-goal percentage (800+ FGA)", one: "one point short of .500" },
  { key: "reb999", f: (r) => r.REB === 999, what: "exactly 999 rebounds", one: "one short of 1,000" },
  { key: "tp399", f: (r) => r.FG3A >= 200 && Math.round(r.TP * 1000) === 399, what: "a .399 three-point percentage (200+ 3PA)", one: "one point short of .400" },
];

function streaks(e) {
  const S = [
    { key: "s_25ppg", f: (r) => r.q && r.PPG >= 25, what: "averaged 25+ points" },
    { key: "s_10rpg", f: (r) => r.q && has(r.RPG) && r.RPG >= 10, what: "averaged a double-digit rebounding figure" },
    { key: "s_8apg", f: (r) => r.q && r.APG >= 8, what: "averaged 8+ assists" },
    { key: "s_2000", f: (r) => r.PTS >= 2000, what: "scored 2,000 points" },
    { key: "s_ft900", f: (r) => r.FTA >= 200 && r.FT >= 0.9, what: "shot .900 from the line (200+ FTA)" },
    { key: "s_gp", f: (r) => r.GP >= r.maxGP, what: "played every game" },
    { key: "s_20ppg", f: (r) => r.q && r.PPG >= 20, what: "averaged 20+ points" },
    { key: "s_fg500", f: (r) => r.FGA >= 800 && r.FG >= 0.5, what: "shot .500 from the field (800+ FGA)" },
  ];
  if (e >= 3) S.push({ key: "s_2spg", f: (r) => r.q && r.SPG >= 2, what: "averaged 2+ steals" }, { key: "s_2bpg", f: (r) => r.q && r.BPG >= 2.5, what: "averaged 2.5+ blocks" });
  if (e >= 4) S.push({ key: "s_150_3s", f: (r) => r.FG3M >= 150, what: "made 150+ threes" });
  return S;
}

function totals(e) {
  const T = [
    { key: "t_pts", val: (r) => r.PTS, text: (a, d, b) => `Most points of the ${d}: ${a.name}, ${a.v.toLocaleString()}${b ? ` — ${(a.v - b.v).toLocaleString()} ahead of ${b.name}` : ""}.` },
    { key: "t_reb", val: (r) => r.REB, text: (a, d) => `Most rebounds of the ${d}: ${a.name}, ${a.v.toLocaleString()}.` },
    { key: "t_ast", val: (r) => r.AST, text: (a, d) => `Most assists of the ${d}: ${a.name}, ${a.v.toLocaleString()}.` },
    { key: "t_ftm", val: (r) => r.FTM, text: (a, d) => `Most free throws made in the ${d}: ${a.name}, ${a.v.toLocaleString()}.` },
    { key: "t_gp", val: (r) => r.GP, text: (a, d) => `Most games played in the ${d}: ${a.name}, ${a.v}.` },
    { key: "t_pf", val: (r) => r.PF, text: (a, d) => `Most personal fouls committed in the ${d}: ${a.name}, ${a.v.toLocaleString()}.` },
    { key: "t_min", val: (r) => r.MIN, text: (a, d) => `Most minutes of the ${d}: ${a.name}, ${a.v.toLocaleString()}.` },
  ];
  if (e >= 3) T.push({ key: "t_stl", val: (r) => r.STL, text: (a, d) => `Most steals of the ${d}: ${a.name}, ${a.v.toLocaleString()}.` },
                    { key: "t_blk", val: (r) => r.BLK, text: (a, d) => `Most blocked shots of the ${d}: ${a.name}, ${a.v.toLocaleString()}.` });
  if (e >= 4) T.push({ key: "t_3pm", val: (r) => r.FG3M, text: (a, d) => `Most threes of the ${d}: ${a.name}, ${a.v.toLocaleString()}.` },
                    { key: "t_tov", val: (r) => r.TOV, text: (a, d) => `Most turnovers of the ${d}: ${a.name}, ${a.v.toLocaleString()}.` });
  return T;
}

function seasonCounts(e, b) {
  const C = [
    { key: "c_25", f: (r) => r.q && r.PPG >= 25, what: "25-point scorers" },
    { key: "c_20_10", f: (r) => r.q && r.PPG >= 20 && r.RPG >= 10, what: "20-and-10 players" },
    { key: "c_ft900", f: (r) => r.FTA >= 200 && r.FT >= 0.9, what: ".900 free-throw shooters (200+ FTA)" },
    { key: "c_10apg", f: (r) => r.q && r.APG >= 8, what: "8-assist players" },
    { key: "c_20", f: (r) => r.q && r.PPG >= 20, what: "20-point scorers" },
    { key: "c_all", f: (r) => r.GP >= r.maxGP, what: "players who appeared in every game" },
    { key: "c_10rpg", f: (r) => r.q && has(r.RPG) && r.RPG >= 10, what: "double-digit rebounders" },
    { key: "c_30", f: (r) => r.q && r.PPG >= 30, what: "30-point scorers" },
  ];
  if (e <= 2) C.push({ key: "c_20rpg", f: (r) => r.q && has(r.RPG) && r.RPG >= 20, what: "20-rebound players" });
  if (e >= 3) C.push({ key: "c_2spg", f: (r) => r.q && r.SPG >= 2, what: "2-steal players" }, { key: "c_2bpg", f: (r) => r.q && r.BPG >= 2, what: "2-block players" });
  if (e >= 4) C.push({ key: "c_150_3s", f: (r) => r.FG3M >= 150, what: "players with 150+ threes" });
  return C;
}

function build(decade) {
  const seasons = []; const rows = []; const po = [];
  const current = new Date().getUTCMonth() >= 9 ? new Date().getUTCFullYear() : new Date().getUTCFullYear() - 1;
  for (let y = Math.max(decade, 1946); y < decade + 10 && y <= current; y += 1) {
    const s = loadSeason(y, "rs"); if (!s || !s.rows.length) continue;
    const maxGP = Math.max(...s.rows.map((r) => r.GP || 0));
    seasons.push(y);
    for (const r of s.rows) rows.push(enrich(r, y, maxGP));
    const p = loadSeason(y, "po"); if (p) for (const r of p.rows) po.push(enrich(r, y, Math.max(...p.rows.map((x) => x.GP || 0))));
  }
  if (!seasons.length) return null;
  const e = era(seasons[Math.floor(seasons.length / 2)]); const b = BAR[e];
  const decadeLabel = `${decade}s`;
  const ev = (r) => ({ id: r.id, name: r.name, season: r.season, team: r.team, GP: r.GP, PTS: r.PTS, PPG: r.PPG && +r.PPG.toFixed(1), REB: r.REB, AST: r.AST, STL: r.STL, BLK: r.BLK,
    FGM: r.FGM, FGA: r.FGA, FG3M: r.FG3M, FG3A: r.FG3A, FTM: r.FTM, FTA: r.FTA, MIN: r.MIN, PF: r.PF, TOV: r.TOV });
  const ctx = { decadeLabel, label, ev, seasons, who: "player", size: (r) => r.MIN || r.GP };
  // Rules see each season's own era bars, so a decade straddling a change
  // (1979-80 brought the three) applies the right thresholds per season.
  const perEra = {};
  for (const r of rows) (perEra[era(r.season)] = perEra[era(r.season)] || []).push(r);
  let cands = [];
  // Rules are evaluated over the whole decade with the decade's dominant era
  // bars; three-point and steals rules only see seasons that recorded them.
  cands.push(...core.ruleFacts(rows, rules(e, b), ctx));
  // Playoff facts: the same shapes over playoff totals, lower floors.
  const poRules = [
    { key: "po_30", head: "average 30 points in a single postseason", floor: "8+ playoff games", f: (r) => r.GP >= 8 && r.PPG >= 30, mag: (r) => r.PPG, say: (r) => `${d1(r.PPG)} ppg in ${r.GP} games` },
    { key: "po_pts", head: "score 600 points in one postseason", floor: null, f: (r) => r.PTS >= 600, mag: (r) => r.PTS / 20, say: (r) => `${r.PTS} pts in ${r.GP} games` },
    { key: "po_triple", head: "average a triple-double in a single postseason", floor: "8+ playoff games", f: (r) => r.GP >= 8 && r.PPG >= 10 && r.RPG >= 10 && r.APG >= 10, mag: (r) => r.PPG + r.RPG + r.APG, say: (r) => `${d1(r.PPG)}/${d1(r.RPG)}/${d1(r.APG)}` },
    { key: "po_reb", head: "average 18 rebounds in a single postseason", floor: "8+ playoff games", f: (r) => r.GP >= 8 && has(r.RPG) && r.RPG >= 18, mag: (r) => r.RPG, say: (r) => `${d1(r.RPG)} rpg in ${r.GP} games` },
    { key: "po_ft", head: "shoot .950 from the line in a single postseason (60+ FTA)", floor: null, f: (r) => r.FTA >= 60 && r.FT >= 0.95, mag: (r) => 100 * r.FT, say: (r) => `${p3(r.FT)} on ${r.FTA} FTA` },
  ];
  cands.push(...core.ruleFacts(po, poRules.map((r) => ({ ...r, group: "PO" })), ctx));
  cands.push(...core.extremeFacts(po, [
    { key: "po_most_pts", base: (r) => has(r.PTS), pick: (r) => r.PTS, text: (r, s, d) => `Most points in a single postseason in the ${d}: ${r.name}, ${s} — ${r.PTS} in ${r.GP} games.` },
    { key: "po_best_fg", base: (r) => r.FGA >= 150, pick: (r) => r.FG, text: (r, s, d) => `Best field-goal percentage in a postseason (150+ FGA) in the ${d}: ${r.name}, ${s} — ${p3(r.FG)}.` },
    { key: "po_most_ast", base: (r) => has(r.AST), pick: (r) => r.AST, text: (r, s, d) => `Most assists in a single postseason in the ${d}: ${r.name}, ${s} — ${r.AST} in ${r.GP} games.` },
    { key: "po_most_reb", base: (r) => has(r.REB), pick: (r) => r.REB, text: (r, s, d) => `Most rebounds in a single postseason in the ${d}: ${r.name}, ${s} — ${r.REB} in ${r.GP} games.` },
  ], ctx));
  cands.push(...core.extremeFacts(rows, extremes(e), ctx));
  cands.push(...core.nearMissFacts(rows, NEAR, ctx));
  cands.push(...core.streakFacts(rows, streaks(e), ctx));
  cands.push(...core.totalFacts(rows, totals(e), ctx));
  cands.push(...core.seasonCountFacts(rows, seasonCounts(e, b), ctx));
  // Thousands separators on counts that precede a stat word; never touches a
  // year or a season label.
  const commas = (t) => t.replace(/\b(\d{4,})\b(?=\s(?:rebounds|FTA|FGA|FTM|FGM|reb|pts|points|min|assists|ast|stl|blk|minutes))/g, (m) => Number(m).toLocaleString("en-US"));
  for (const c of cands) c.text = commas(c.text);
  const facts = core.select(cands, 100);
  const hs = rows.length;
  return { sport: "NBA", decade: decadeLabel, era: e, bars: b, seasons: seasons.map(label), candidates: cands.length, facts,
    counts: { playerSeasons: hs, playoffPlayerSeasons: po.length },
    method: [
      "Every player's regular-season and playoff totals for every season in the decade, pulled from stats.nba.com, the league's official record. Nothing is recalled or estimated; the rows behind each line are stored with it.",
      "Qualification is 60% of the most games anyone played that season. Attempt floors are stated in the line.",
      "Categories not yet recorded (rebounds before 1950-51, minutes before 1951-52, steals and blocks before 1973-74, turnovers before 1977-78, threes before 1979-80) are treated as missing, never as zero.",
      "Team-mate lines are omitted: the feed credits a traded player's whole season to one club.",
    ] };
}

function main() {
  const args = process.argv.slice(2).filter((a) => /^\d{4}$/.test(a)).map(Number);
  const decades = args.length ? args : [1940, 1950, 1960, 1970, 1980, 1990, 2000, 2010, 2020];
  fs.mkdirSync(OUT, { recursive: true });
  for (const d of decades) {
    const r = build(d);
    if (!r) { console.log(`${d}s: no season data`); continue; }
    fs.writeFileSync(path.join(OUT, `${d}s-facts.json`), JSON.stringify(r, null, 1));
    console.log(`${d}s: ${r.facts.length}/100 from ${r.candidates} candidates over ${r.seasons.length} seasons, ${r.counts.playerSeasons} player-seasons`);
  }
}
if (require.main === module) main();
module.exports = { build, label, enrich, era };
