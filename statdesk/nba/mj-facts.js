#!/usr/bin/env node
// 100 Michael Jordan facts, computed from the official record.
//
// Sources, all from stats.nba.com via nba/pull.js:
//   mj/games-*.json   every regular-season and playoff game he played
//   mj/career.json    season totals, college, All-Star, rankings
//   seasons/*.json    every NBA player-season ever, for comparisons
//
// Nothing is typed in from memory — not even which seasons he won titles.
// A playoff run can only end in a series loss or a Finals win, so a run whose
// last game is a win ended with a championship, and the last series of that
// run was the Finals. Series are consecutive playoff games against one
// opponent; the last game of a series decides it.
//
//   node statdesk/nba/mj-facts.js
"use strict";
const fs = require("fs");
const path = require("path");
const { label, enrich } = require("./facts");

const DATA = path.join(__dirname, "..", "data", "nba");
const MJ = path.join(DATA, "mj");
const d1 = (v) => (v == null ? "—" : v.toFixed(1));
const p3 = (v) => (v == null ? "—" : v.toFixed(3).replace(/^0/, ""));
const fmtDate = (d) => d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function loadGames() {
  const games = [];
  for (const f of fs.readdirSync(MJ).filter((x) => /^games-\d{4}-\d{2}-(rs|po)\.json$/.test(x))) {
    const j = JSON.parse(fs.readFileSync(path.join(MJ, f), "utf8"));
    for (const g of j.games) {
      const date = new Date(`${g.GAME_DATE} 12:00:00 UTC`);
      const m = String(g.MATCHUP || "");
      games.push({ ...g, season: j.season, type: j.type, date, opp: m.split(/\s+(?:@|vs\.)\s+/)[1] || "?", team: m.split(/\s+/)[0],
        home: /vs\./.test(m), W: g.WL === "W" });
    }
  }
  return games.sort((a, b) => a.date - b.date);
}

function main() {
  const career = JSON.parse(fs.readFileSync(path.join(MJ, "career.json"), "utf8")).sets;
  const games = loadGames();
  const RS = games.filter((g) => g.type === "rs"); const PO = games.filter((g) => g.type === "po");
  const facts = [];
  const add = (kind, text, evidence, score = 5) => facts.push({ kind, text, evidence: evidence == null ? [] : [].concat(evidence).slice(0, 12), score });
  const gEv = (g) => ({ date: g.GAME_DATE, season: g.season, type: g.type, matchup: g.MATCHUP, WL: g.WL, PTS: g.PTS, REB: g.REB, AST: g.AST, STL: g.STL, BLK: g.BLK, FGM: g.FGM, FGA: g.FGA, FTM: g.FTM, FTA: g.FTA, FG3M: g.FG3M, MIN: g.MIN, game: g.Game_ID });
  const on = (g) => `${fmtDate(g.date)} ${g.home ? "vs." : "at"} ${g.opp}`;
  const cnt = (arr, f) => arr.filter(f).length;
  const rec = (arr) => `${cnt(arr, (g) => g.W)}-${cnt(arr, (g) => !g.W)}`;

  // ---------------------------------------------------------- volume --
  add("career", `Jordan played ${RS.length.toLocaleString()} regular-season games and ${PO.length} playoff games, scoring ${RS.reduce((a, g) => a + g.PTS, 0).toLocaleString()} and ${PO.reduce((a, g) => a + g.PTS, 0).toLocaleString()} points.`, null, 9);
  for (const [lab, arr] of [["regular-season", RS], ["playoff", PO]]) {
    for (const bar of [30, 40, 50]) {
      const m = arr.filter((g) => g.PTS >= bar);
      add("games", `Jordan scored ${bar}+ points in ${m.length} ${lab} games${m.length ? ` — ${Math.round(100 * m.length / arr.length)}% of all his ${lab} games` : ""}.`, m.map(gEv), bar === 50 ? 9 : 7);
    }
    const hi = [...arr].sort((a, b) => b.PTS - a.PTS)[0];
    add("games", `His ${lab} career high: ${hi.PTS} points, ${on(hi)} (${hi.FGM}-${hi.FGA} FG, ${hi.FTM}-${hi.FTA} FT, ${hi.WL}).`, gEv(hi), 9);
    const sixty = arr.filter((g) => g.PTS >= 60);
    if (sixty.length) add("games", `${sixty.length === 1 ? "One" : sixty.length} ${lab} game${sixty.length === 1 ? "" : "s"} of 60+ points: ${sixty.map((g) => `${g.PTS} ${on(g)}`).join("; ")}.`, sixty.map(gEv), 8);
  }

  // ---------------------------------------------------------- streaks --
  const runs = (arr, f) => { let best = { n: 0 }, cur = 0, start = null;
    arr.forEach((g, i) => { if (f(g)) { if (!cur) start = i; cur += 1; if (cur > best.n) best = { n: cur, from: arr[start], to: g }; } else cur = 0; }); return best; };
  for (const [bar, lab] of [[10, "double figures"], [20, "20+ points"], [30, "30+ points"], [40, "40+ points"]]) {
    const r = runs(RS, (g) => g.PTS >= bar);
    add("streak", `Longest run of consecutive regular-season games with ${lab}: ${r.n}, from ${fmtDate(r.from.date)} to ${fmtDate(r.to.date)}.`, [gEv(r.from), gEv(r.to)], bar === 10 ? 10 : 7);
  }
  // The game that ended the longest double-figures run is the one right after
  // its last game, not the first single-digit game of his career.
  const r10 = runs(RS, (g) => g.PTS >= 10);
  const brk = RS[RS.indexOf(r10.to) + 1];
  if (brk) add("streak", `The ${r10.n}-game double-figures streak ended ${on(brk)}, when he scored ${brk.PTS}.`, gEv(brk), 7);
  else add("streak", `His double-figures streak was still alive when his career ended: ${r10.n} straight games.`, gEv(r10.to), 7);
  const po30 = runs(PO, (g) => g.PTS >= 30);
  add("streak", `Longest run of consecutive playoff games with 30+ points: ${po30.n} (${fmtDate(po30.from.date)} to ${fmtDate(po30.to.date)}).`, [gEv(po30.from), gEv(po30.to)], 7);
  const po20 = runs(PO, (g) => g.PTS >= 20);
  add("streak", `Jordan scored 20 or more in ${po20.n} consecutive playoff games, from ${fmtDate(po20.from.date)} to ${fmtDate(po20.to.date)}.`, [gEv(po20.from), gEv(po20.to)], 7);
  const po10 = PO.filter((g) => g.PTS < 20);
  add("playoffs", `He was held under 20 points in just ${po10.length} of his ${PO.length} playoff games${po10.length ? ` — the lowest was ${Math.min(...po10.map((g) => g.PTS))}` : ""}.`, po10.map(gEv), 8);

  // ---------------------------------------------------- all-around games --
  const td = (g) => [g.PTS, g.REB, g.AST, g.STL, g.BLK].filter((v) => v >= 10).length >= 3;
  const tdR = RS.filter(td), tdP = PO.filter(td);
  add("games", `Triple-doubles: ${tdR.length} in the regular season, ${tdP.length} in the playoffs.`, [...tdR, ...tdP].map(gEv), 7);
  const tdRun = runs(RS, td);
  if (tdRun.n >= 2) add("streak", `Jordan recorded triple-doubles in ${tdRun.n} straight games, ${fmtDate(tdRun.from.date)} to ${fmtDate(tdRun.to.date)}.`, [gEv(tdRun.from), gEv(tdRun.to)], 8);
  const tdSeason = {}; for (const g of tdR) tdSeason[g.season] = (tdSeason[g.season] || 0) + 1;
  const tdBest = Object.entries(tdSeason).sort((a, b) => b[1] - a[1])[0];
  if (tdBest) add("season", `His most triple-doubles in a season: ${tdBest[1]}, in ${tdBest[0]}.`, tdR.filter((g) => g.season === tdBest[0]).map(gEv), 7);
  const s5 = RS.filter((g) => g.STL >= 5), b5 = RS.filter((g) => g.BLK >= 5);
  add("games", `He had 5+ steals in ${s5.length} regular-season games and 5+ blocks in ${b5.length}.`, [...s5.slice(0, 6), ...b5.slice(0, 6)].map(gEv), 6);
  const hiStl = [...games].sort((a, b) => b.STL - a.STL)[0]; const hiBlk = [...games].sort((a, b) => b.BLK - a.BLK)[0];
  add("games", `Career-high steals in a game: ${hiStl.STL}, ${on(hiStl)}. Career-high blocks: ${hiBlk.BLK}, ${on(hiBlk)}.`, [gEv(hiStl), gEv(hiBlk)], 6);
  const hiAst = [...games].sort((a, b) => b.AST - a.AST)[0]; const hiReb = [...games].sort((a, b) => b.REB - a.REB)[0];
  add("games", `Career-high assists in a game: ${hiAst.AST}, ${on(hiAst)}. Career-high rebounds: ${hiReb.REB}, ${on(hiReb)}.`, [gEv(hiAst), gEv(hiReb)], 6);
  const both = games.filter((g) => g.PTS >= 40 && g.AST >= 10);
  add("games", `Games with 40 points and 10 assists: ${both.length}${both.length ? ` — the biggest was ${[...both].sort((a, b) => b.PTS - a.PTS)[0].PTS} and ${[...both].sort((a, b) => b.PTS - a.PTS)[0].AST}, ${on([...both].sort((a, b) => b.PTS - a.PTS)[0])}` : ""}.`, both.map(gEv), 7);
  const fiftyTen = games.filter((g) => g.PTS >= 50 && g.REB >= 10);
  if (fiftyTen.length) add("games", `Jordan had ${fiftyTen.length} games with 50 points and 10 rebounds.`, fiftyTen.map(gEv), 6);
  const stlBlk = games.filter((g) => g.STL >= 4 && g.BLK >= 4);
  add("games", `Games with at least four steals and four blocks: ${stlBlk.length}.`, stlBlk.map(gEv), 6);

  // --------------------------------------------------------- shooting --
  const bestFg = [...games].filter((g) => g.FGA >= 20).sort((a, b) => b.FGM / b.FGA - a.FGM / a.FGA)[0];
  add("games", `Best shooting night on 20+ attempts: ${bestFg.FGM}-${bestFg.FGA} (${p3(bestFg.FGM / bestFg.FGA)}), ${on(bestFg)}, for ${bestFg.PTS} points.`, gEv(bestFg), 7);
  const mostFga = [...games].sort((a, b) => b.FGA - a.FGA)[0];
  add("games", `Most shots in a game: ${mostFga.FGA} field-goal attempts, ${on(mostFga)} (${mostFga.FGM} made, ${mostFga.PTS} points).`, gEv(mostFga), 6);
  const mostFtm = [...games].sort((a, b) => b.FTM - a.FTM || b.FTA - a.FTA)[0];
  add("games", `Most free throws made in a game: ${mostFtm.FTM} of ${mostFtm.FTA}, ${on(mostFtm)}.`, gEv(mostFtm), 6);
  const perfFt = [...games].filter((g) => g.FTA > 0 && g.FTM === g.FTA).sort((a, b) => b.FTA - a.FTA)[0];
  if (perfFt) add("games", `Most free throws without a miss: ${perfFt.FTM}-for-${perfFt.FTA}, ${on(perfFt)}.`, gEv(perfFt), 6);
  const hi3 = [...games].sort((a, b) => (b.FG3M || 0) - (a.FG3M || 0))[0];
  add("games", `Most threes in a game: ${hi3.FG3M}, ${on(hi3)} (${hi3.type === "po" ? "playoffs" : "regular season"}).`, gEv(hi3), 7);
  const no3 = RS.filter((g) => g.PTS >= 50 && (g.FG3M || 0) === 0);
  add("games", `${no3.length} of his regular-season 50-point games came without a single made three.`, no3.map(gEv), 6);
  const ftHeavy = games.filter((g) => g.FTA >= 20);
  add("games", `He attempted 20+ free throws in ${ftHeavy.length} games.`, ftHeavy.map(gEv), 5);

  // ----------------------------------------------------- winning & losing --
  for (const bar of [40, 50]) {
    const m = RS.filter((g) => g.PTS >= bar);
    add("games", `His teams' record in his ${bar}-point regular-season games: ${rec(m)}.`, m.filter((g) => !g.W).map(gEv), 7);
  }
  const lost50 = games.filter((g) => g.PTS >= 50 && !g.W);
  add("games", `He scored 50 or more and still lost ${lost50.length} times${lost50.length ? ` — the most in a defeat was ${Math.max(...lost50.map((g) => g.PTS))}` : ""}.`, lost50.map(gEv), 7);
  const lowWin = [...RS].filter((g) => g.W && g.MIN >= 30).sort((a, b) => a.PTS - b.PTS)[0];
  if (lowWin) add("games", `His quietest win in 30+ minutes: ${lowWin.PTS} points, ${on(lowWin)}.`, gEv(lowWin), 4);
  if (RS.some((g) => g.PLUS_MINUS != null)) {
    const pm = RS.filter((g) => g.PLUS_MINUS != null);
    const best = [...pm].sort((a, b) => b.PLUS_MINUS - a.PLUS_MINUS)[0];
    add("games", `Best plus-minus in a game (tracked from ${pm[0].season}): +${best.PLUS_MINUS}, ${on(best)}.`, gEv(best), 4);
  }

  // ------------------------------------------------------------ opponents --
  const byOpp = {};
  for (const g of RS) (byOpp[g.opp] = byOpp[g.opp] || []).push(g);
  const oppRows = Object.entries(byOpp).map(([o, gs]) => ({ o, n: gs.length, pts: gs.reduce((a, g) => a + g.PTS, 0), ppg: gs.reduce((a, g) => a + g.PTS, 0) / gs.length, fifty: gs.filter((g) => g.PTS >= 50).length, rec: rec(gs) }));
  const mostPts = [...oppRows].sort((a, b) => b.pts - a.pts)[0];
  add("opponents", `The team he scored the most regular-season points against: ${mostPts.o}, ${mostPts.pts.toLocaleString()} in ${mostPts.n} games.`, mostPts, 6);
  const hiAvg = [...oppRows].filter((r) => r.n >= 15).sort((a, b) => b.ppg - a.ppg)[0];
  add("opponents", `His highest scoring average against any opponent (15+ games): ${d1(hiAvg.ppg)} against ${hiAvg.o}.`, hiAvg, 7);
  const loAvg = [...oppRows].filter((r) => r.n >= 15).sort((a, b) => a.ppg - b.ppg)[0];
  add("opponents", `His lowest scoring average against any opponent (15+ games): ${d1(loAvg.ppg)} against ${loAvg.o} — still ${loAvg.ppg >= 25 ? "25-plus" : "respectable"}.`, loAvg, 7);
  const fiftyOpp = [...oppRows].filter((r) => r.fifty > 0).sort((a, b) => b.fifty - a.fifty);
  add("opponents", `He scored 50 against ${fiftyOpp.length} different franchises; the most 50-point games against one team was ${fiftyOpp[0].fifty}, against ${fiftyOpp[0].o}.`, fiftyOpp.slice(0, 6), 7);
  const bestRec = [...oppRows].filter((r) => r.n >= 20).sort((a, b) => Number(b.rec.split("-")[0]) / b.n - Number(a.rec.split("-")[0]) / a.n)[0];
  add("opponents", `His best team record against one opponent (20+ games): ${bestRec.rec} against ${bestRec.o}.`, bestRec, 5);
  const poOpp = {}; for (const g of PO) (poOpp[g.opp] = poOpp[g.opp] || []).push(g);
  const poMost = Object.entries(poOpp).sort((a, b) => b[1].length - a[1].length)[0];
  add("opponents", `His most frequent playoff opponent: ${poMost[0]}, ${poMost[1].length} games, ${rec(poMost[1])}, ${d1(poMost[1].reduce((a, g) => a + g.PTS, 0) / poMost[1].length)} points a game.`, poMost[1].map(gEv), 7);

  // --------------------------------------------------------- when & where --
  const split = (arr, f) => { const o = {}; for (const g of arr) { const k = f(g); (o[k] = o[k] || []).push(g); } return Object.entries(o).map(([k, gs]) => ({ k, n: gs.length, ppg: gs.reduce((a, g) => a + g.PTS, 0) / gs.length })); };
  const hm = split(RS, (g) => (g.home ? "home" : "road"));
  add("splits", `Home vs road: ${d1(hm.find((x) => x.k === "home").ppg)} points a game at home, ${d1(hm.find((x) => x.k === "road").ppg)} on the road.`, hm, 6);
  const mo = split(RS, (g) => MONTHS[g.date.getUTCMonth()]).filter((x) => x.n >= 50).sort((a, b) => b.ppg - a.ppg);
  add("splits", `His best month: ${mo[0].k}, ${d1(mo[0].ppg)} points a game over ${mo[0].n} games. His "worst": ${mo[mo.length - 1].k}, ${d1(mo[mo.length - 1].ppg)}.`, mo, 5);
  const dw = split(RS, (g) => DAYS[g.date.getUTCDay()]).filter((x) => x.n >= 50).sort((a, b) => b.ppg - a.ppg);
  add("splits", `By day of the week he was best on ${dw[0].k}s (${d1(dw[0].ppg)} ppg) and lowest on ${dw[dw.length - 1].k}s (${d1(dw[dw.length - 1].ppg)}).`, dw, 4);
  const b2b = RS.filter((g, i) => i > 0 && (g.date - RS[i - 1].date) / 86400000 === 1 && g.season === RS[i - 1].season);
  add("splits", `On the second night of back-to-backs he averaged ${d1(b2b.reduce((a, g) => a + g.PTS, 0) / b2b.length)} points over ${b2b.length} games.`, b2b.slice(0, 6).map(gEv), 6);
  const ot = games.filter((g) => g.MIN >= 50);
  if (ot.length) { const top = [...ot].sort((a, b) => b.MIN - a.MIN)[0]; add("games", `Most minutes in a game: ${top.MIN}, ${on(top)} — he scored ${top.PTS}.`, gEv(top), 5); }

  // ------------------------------------------------------------ playoffs --
  const series = [];
  for (const g of PO) { const s = series[series.length - 1]; if (s && s.season === g.season && s.opp === g.opp) s.games.push(g); else series.push({ season: g.season, opp: g.opp, games: [g] }); }
  for (const s of series) { s.won = s.games[s.games.length - 1].W; s.pts = s.games.reduce((a, g) => a + g.PTS, 0); s.ppg = s.pts / s.games.length; }
  const bySeason = {}; for (const s of series) (bySeason[s.season] = bySeason[s.season] || []).push(s);
  const finals = Object.values(bySeason).map((ss) => ss[ss.length - 1]).filter((s) => s.won);
  add("finals", `Jordan reached the Finals ${finals.length} times and won all ${finals.length}: ${finals.map((s) => `${s.season} vs. ${s.opp}`).join(", ")}.`, finals.map((s) => ({ season: s.season, opp: s.opp, games: s.games.length, pts: s.pts })), 10);
  const fg = finals.flatMap((s) => s.games);
  add("finals", `In ${fg.length} Finals games he averaged ${d1(fg.reduce((a, g) => a + g.PTS, 0) / fg.length)} points; he scored 30+ in ${cnt(fg, (g) => g.PTS >= 30)} of them and 40+ in ${cnt(fg, (g) => g.PTS >= 40)}.`, fg.filter((g) => g.PTS >= 40).map(gEv), 9);
  const fHi = [...fg].sort((a, b) => b.PTS - a.PTS)[0];
  add("finals", `His Finals high: ${fHi.PTS}, ${on(fHi)}.`, gEv(fHi), 8);
  const fLo = [...fg].sort((a, b) => a.PTS - b.PTS)[0];
  add("finals", `His lowest Finals game: ${fLo.PTS} points, ${on(fLo)}.`, gEv(fLo), 6);
  const fBest = [...finals].sort((a, b) => b.ppg - a.ppg)[0];
  add("finals", `His best Finals series: ${d1(fBest.ppg)} points a game against ${fBest.opp} in ${fBest.season}.`, fBest.games.map(gEv), 8);
  const clinch = finals.map((s) => s.games[s.games.length - 1]);
  add("finals", `In the ${clinch.length} title-clinching games he averaged ${d1(clinch.reduce((a, g) => a + g.PTS, 0) / clinch.length)} points (${clinch.map((g) => g.PTS).join(", ")}).`, clinch.map(gEv), 8);
  const fGames = finals.map((s) => s.games.length); const fRec = `${cnt(fg, (g) => g.W)}-${cnt(fg, (g) => !g.W)}`;
  const sevens = fGames.filter((n) => n === 7).length;
  add("finals", `His teams went ${fRec} in his Finals games; ${sevens ? `${sevens} of the ${finals.length} series went seven` : `none of the ${finals.length} series went seven`} (${fGames.join(", ")} games).`, finals.map((s) => ({ season: s.season, games: s.games.length })), 7);
  const won = series.filter((s) => s.won).length, lost = series.length - won;
  add("playoffs", `Playoff series: ${won} won, ${lost} lost. After ${[...series].reverse().find((s) => !s.won) ? `the loss to ${[...series].reverse().find((s) => !s.won).opp} in ${[...series].reverse().find((s) => !s.won).season}` : "his first loss"}, he never lost another series.`, series.map((s) => ({ season: s.season, opp: s.opp, won: s.won, games: s.games.length })), 8);
  const sweeps = series.filter((s) => s.won && s.games.every((g) => g.W));
  add("playoffs", `His teams swept ${sweeps.length} playoff series.`, sweeps.map((s) => ({ season: s.season, opp: s.opp, games: s.games.length })), 6);
  const g7 = series.filter((s) => s.games.length === 7).map((s) => s.games[6]);
  if (g7.length) add("playoffs", `In Game 7s he was ${rec(g7)}, averaging ${d1(g7.reduce((a, g) => a + g.PTS, 0) / g7.length)} points.`, g7.map(gEv), 7);
  const elim = series.filter((s) => !s.won).map((s) => s.games[s.games.length - 1]);
  add("playoffs", `In the ${elim.length} games in which his team was eliminated he averaged ${d1(elim.reduce((a, g) => a + g.PTS, 0) / elim.length)} points.`, elim.map(gEv), 6);
  const bestSeries = [...series].sort((a, b) => b.ppg - a.ppg)[0];
  add("playoffs", `His highest-scoring playoff series: ${d1(bestSeries.ppg)} points a game against ${bestSeries.opp} in ${bestSeries.season} (${bestSeries.won ? "won" : "lost"} in ${bestSeries.games.length}).`, bestSeries.games.map(gEv), 8);
  const sweptBy = series.filter((s) => !s.won && s.games.every((g) => !g.W));
  if (sweptBy.length) add("playoffs", `His teams were swept ${sweptBy.length} time${sweptBy.length > 1 ? "s" : ""}: ${sweptBy.map((s) => `${s.season} by ${s.opp}`).join(", ")}.`, sweptBy.map((s) => ({ season: s.season, opp: s.opp })), 6);
  const firstRound = Object.values(bySeason).map((ss) => ss[0]);
  add("playoffs", `First-round record: ${firstRound.filter((s) => s.won).length}-${firstRound.filter((s) => !s.won).length} in series.`, firstRound.map((s) => ({ season: s.season, opp: s.opp, won: s.won })), 5);
  const poSeas = career.SeasonTotalsPostSeason || [];
  const poBestSeason = [...poSeas].sort((a, b) => b.PTS / b.GP - a.PTS / a.GP)[0];
  if (poBestSeason) add("playoffs", `His best playoff scoring average in one postseason: ${d1(poBestSeason.PTS / poBestSeason.GP)} over ${poBestSeason.GP} games in ${poBestSeason.SEASON_ID}.`, poBestSeason, 8);

  // -------------------------------------------------------------- seasons --
  const seas = (career.SeasonTotalsRegularSeason || []).filter((r) => r.TEAM_ABBREVIATION !== "TOT");
  const ppg = (r) => r.PTS / r.GP;
  const s30 = seas.filter((r) => r.GP >= 50 && ppg(r) >= 30);
  add("season", `He averaged 30+ points in ${s30.length} seasons: ${s30.map((r) => `${r.SEASON_ID} (${d1(ppg(r))})`).join(", ")}.`, s30, 9);
  const top = [...seas].sort((a, b) => ppg(b) - ppg(a))[0];
  add("season", `His best scoring season: ${d1(ppg(top))} points a game in ${top.SEASON_ID} — ${top.PTS.toLocaleString()} points in ${top.GP} games.`, top, 9);
  const rookie = seas[0];
  add("season", `As a rookie in ${rookie.SEASON_ID} he averaged ${d1(ppg(rookie))} points, ${d1(rookie.REB / rookie.GP)} rebounds and ${d1(rookie.AST / rookie.GP)} assists, playing all ${rookie.GP} games.`, rookie, 8);
  const short = [...seas].sort((a, b) => a.GP - b.GP)[0];
  add("season", `His shortest full season: ${short.GP} games in ${short.SEASON_ID}, averaging ${d1(ppg(short))}.`, short, 6);
  const last = seas[seas.length - 1];
  add("season", `In his final season, ${last.SEASON_ID}, at age ${last.PLAYER_AGE}, he played ${last.GP} games and averaged ${d1(ppg(last))} points.`, last, 8);
  const old = seas.filter((r) => r.PLAYER_AGE >= 38);
  const oldGames = RS.filter((g) => old.some((r) => r.SEASON_ID === g.season));
  add("season", `At 38 and older he scored 40+ ${cnt(oldGames, (g) => g.PTS >= 40)} times and 30+ ${cnt(oldGames, (g) => g.PTS >= 30)} times in ${oldGames.length} games.`, oldGames.filter((g) => g.PTS >= 40).map(gEv), 8);
  const old50 = oldGames.filter((g) => g.PTS >= 50);
  if (old50.length) add("season", `His last 50-point game came ${on(old50[old50.length - 1])} in ${old50[old50.length - 1].season}, age ${old.find((r) => r.SEASON_ID === old50[old50.length - 1].season).PLAYER_AGE} that season: ${old50[old50.length - 1].PTS} points.`, old50.map(gEv), 9);
  const stlSeason = [...seas].sort((a, b) => b.STL - a.STL)[0];
  add("season", `His best steals season: ${stlSeason.STL} in ${stlSeason.SEASON_ID} (${d1(stlSeason.STL / stlSeason.GP)} a game).`, stlSeason, 6);
  const blkSeason = [...seas].sort((a, b) => b.BLK - a.BLK)[0];
  add("season", `His best shot-blocking season: ${blkSeason.BLK} blocks in ${blkSeason.SEASON_ID}, as a guard.`, blkSeason, 7);
  const fgBest = [...seas].filter((r) => r.GP >= 50).sort((a, b) => b.FGM / b.FGA - a.FGM / a.FGA)[0];
  add("season", `His most efficient season from the field: ${p3(fgBest.FGM / fgBest.FGA)} in ${fgBest.SEASON_ID}, while averaging ${d1(ppg(fgBest))}.`, fgBest, 6);
  const tp = [...seas].filter((r) => r.FG3A >= 100).sort((a, b) => b.FG3M / b.FG3A - a.FG3M / a.FG3A)[0];
  if (tp) add("season", `His best three-point season: ${p3(tp.FG3M / tp.FG3A)} on ${tp.FG3A} attempts in ${tp.SEASON_ID}.`, tp, 6);
  const allGp = seas.filter((r) => r.GP >= 82);
  add("season", `He played all 82 games in ${allGp.length} seasons.`, allGp, 6);
  const mins = [...seas].sort((a, b) => b.MIN - a.MIN)[0];
  add("season", `His heaviest workload: ${mins.MIN.toLocaleString()} minutes in ${mins.SEASON_ID}, ${d1(mins.MIN / mins.GP)} a game.`, mins, 5);
  const tov = [...seas].filter((r) => r.GP >= 50).sort((a, b) => a.TOV / a.GP - b.TOV / b.GP)[0];
  if (tov) add("season", `His most careful season: ${d1(tov.TOV / tov.GP)} turnovers a game in ${tov.SEASON_ID}.`, tov, 4);

  // ------------------------------------------------- against the league --
  // Every NBA player-season ever, from the official season pulls.
  const league = []; const po = [];
  for (const f of fs.readdirSync(path.join(DATA, "seasons"))) {
    const m = f.match(/^(\d{4})-\d{2}-(rs|po)\.json$/); if (!m) continue;
    const j = JSON.parse(fs.readFileSync(path.join(DATA, "seasons", f), "utf8"));
    const y = Number(m[1]); const maxGP = Math.max(0, ...j.rows.map((r) => r.GP || 0));
    for (const r of j.rows) (m[2] === "rs" ? league : po).push(enrich(r, y, maxGP));
  }
  const MJID = 893;
  // Scoring and steals titles under the era's rule: 70 games or 1,400
  // points (steals: 70 games or 125 steals), per-game leader.
  const titles = { pts: [], stl: [] };
  const years = [...new Set(league.filter((r) => r.id === MJID).map((r) => r.season))];
  for (const y of years) {
    const ys = league.filter((r) => r.season === y);
    const qp = ys.filter((r) => r.GP >= 70 || r.PTS >= 1400).sort((a, b) => b.PPG - a.PPG);
    const qs = ys.filter((r) => has(r.STL) && (r.GP >= 70 || r.STL >= 125)).sort((a, b) => b.SPG - a.SPG);
    if (qp[0] && qp[0].id === MJID) titles.pts.push({ season: label(y), ppg: +qp[0].PPG.toFixed(1), next: qp[1] && qp[1].name, nextPpg: qp[1] && +qp[1].PPG.toFixed(1) });
    if (qs[0] && qs[0].id === MJID) titles.stl.push({ season: label(y), spg: +qs[0].SPG.toFixed(2) });
  }
  add("league", `He led the league in scoring ${titles.pts.length} times (70 games or 1,400 points to qualify): ${titles.pts.map((t) => t.season).join(", ")}.`, titles.pts, 10);
  const titleRun = (() => { let b = 0, c = 0, prev = null; for (const t of titles.pts) { const y = Number(t.season.slice(0, 4)); c = prev != null && y === prev + 1 ? c + 1 : 1; b = Math.max(b, c); prev = y; } return b; })();
  add("league", `His longest run of consecutive scoring titles: ${titleRun}.`, titles.pts, 8);
  const widest = [...titles.pts].sort((a, b) => (b.ppg - b.nextPpg) - (a.ppg - a.nextPpg))[0];
  add("league", `His widest scoring-title margin: ${d1(widest.ppg - widest.nextPpg)} points a game over ${widest.next} in ${widest.season} (${d1(widest.ppg)} to ${d1(widest.nextPpg)}).`, widest, 8);
  add("league", `He led the league in steals per game ${titles.stl.length} times: ${titles.stl.map((t) => `${t.season} (${t.spg})`).join(", ")}.`, titles.stl, 8);
  const both2 = titles.pts.filter((t) => titles.stl.some((s) => s.season === t.season));
  if (both2.length) add("league", `He led the league in both scoring and steals in ${both2.map((t) => t.season).join(" and ")}.`, both2, 8);
  // Career per-game, all players (400 games / 10,000 points, the league's rule).
  const car = new Map();
  for (const r of league) { const a = car.get(r.id) || { id: r.id, name: r.name, GP: 0, PTS: 0 }; a.GP += r.GP || 0; a.PTS += r.PTS || 0; a.name = r.name; car.set(r.id, a); }
  const carQ = [...car.values()].filter((a) => a.GP >= 400 || a.PTS >= 10000).map((a) => ({ ...a, ppg: a.PTS / a.GP })).sort((a, b) => b.ppg - a.ppg);
  const mjRank = carQ.findIndex((a) => a.id === MJID) + 1;
  add("league", `Career scoring average: ${d1(carQ.find((a) => a.id === MJID).ppg)}, ${mjRank === 1 ? "the highest" : `No. ${mjRank}`} in NBA history among ${carQ.length.toLocaleString()} qualified players (400 games or 10,000 points)${mjRank === 1 ? `, ahead of ${carQ[1].name} (${d1(carQ[1].ppg)})` : ""}.`, carQ.slice(0, 5), 10);
  const pcar = new Map();
  for (const r of po) { const a = pcar.get(r.id) || { id: r.id, name: r.name, GP: 0, PTS: 0 }; a.GP += r.GP || 0; a.PTS += r.PTS || 0; a.name = r.name; pcar.set(r.id, a); }
  const pQ = [...pcar.values()].filter((a) => a.GP >= 25).map((a) => ({ ...a, ppg: a.PTS / a.GP })).sort((a, b) => b.ppg - a.ppg);
  const pRank = pQ.findIndex((a) => a.id === MJID) + 1;
  add("league", `Career playoff scoring average: ${d1(pQ.find((a) => a.id === MJID).ppg)}, ${pRank === 1 ? "the highest" : `No. ${pRank}`} in NBA history (25+ playoff games)${pRank === 1 ? `; next is ${pQ[1].name} at ${d1(pQ[1].ppg)}` : ""}.`, pQ.slice(0, 5), 10);
  const thirty = new Map();
  for (const r of league) if (r.q && r.PPG >= 30) thirty.set(r.id, { name: r.name, n: ((thirty.get(r.id) || {}).n || 0) + 1 });
  const t30 = [...thirty.entries()].sort((a, b) => b[1].n - a[1].n);
  add("league", `Most 30-point-average seasons in NBA history: ${t30[0][1].name}, ${t30[0][1].n}${t30[0][0] === MJID ? `; next best ${t30[1][1].name}, ${t30[1][1].n}` : ""}.`, t30.slice(0, 5).map(([id, v]) => ({ id, ...v })), 9);
  const k3 = league.filter((r) => r.PTS >= 3000);
  add("league", `Only ${new Set(k3.map((r) => r.id)).size} players have scored 3,000 points in a season: ${[...new Set(k3.map((r) => r.name))].join(" and ")} (${k3.map((r) => `${label(r.season)}: ${r.PTS.toLocaleString()}`).join("; ")}).`, k3, 9);
  const sb = league.filter((r) => r.STL >= 200 && r.BLK >= 100);
  add("league", `Seasons with 200 steals and 100 blocks: ${sb.length}, by ${new Set(sb.map((r) => r.id)).size} players — ${sb.filter((r) => r.id === MJID).length} of them Jordan's.`, sb, 8);
  const g30 = league.filter((r) => r.q && r.PPG >= 30 && r.SPG >= 3);
  add("league", `Seasons averaging 30 points and 3 steals: ${g30.length} — ${g30.map((r) => `${r.name} ${label(r.season)}`).join(", ")}.`, g30, 9);
  const g35 = league.filter((r) => r.q && r.PPG >= 35 && has(r.FG) && r.FG >= 0.48);
  add("league", `Seasons averaging 35 points on 48%+ shooting: ${g35.length} — ${g35.map((r) => `${r.name} ${label(r.season)}`).join(", ")}.`, g35, 7);
  const ro = league.filter((r) => r.q && r.PPG >= 28 && league.every((x) => x.id !== r.id || x.season >= r.season));
  const roTop = [...ro].sort((a, b) => b.PPG - a.PPG);
  add("league", `Rookies to average 28 points: ${roTop.length}${roTop.length ? ` — ${roTop.map((r) => `${r.name} ${d1(r.PPG)} (${label(r.season)})`).join(", ")}` : ""}.`, roTop, 7);
  const oldQ = league.filter((r) => r.id === MJID && r.season >= 2001);
  for (const r of oldQ) {
    const ys = league.filter((x) => x.season === r.season && x.q).sort((a, b) => b.PPG - a.PPG);
    add("league", `At ${seas.find((s) => s.SEASON_ID === label(r.season)).PLAYER_AGE} in ${label(r.season)} he ranked No. ${ys.findIndex((x) => x.id === MJID) + 1} in the league in scoring (${d1(r.PPG)}).`, ys.slice(0, 5).map((x) => ({ name: x.name, PPG: +x.PPG.toFixed(1) })), 7);
  }

  // -------------------------------------------------------- college & All-Star --
  const col = career.SeasonTotalsCollegeSeason || [];
  if (col.length) {
    const cT = col.reduce((a, r) => ({ GP: a.GP + r.GP, PTS: a.PTS + r.PTS }), { GP: 0, PTS: 0 });
    add("college", `At North Carolina: ${cT.PTS.toLocaleString()} points in ${cT.GP} games over ${col.length} seasons (${d1(cT.PTS / cT.GP)} a game): ${col.map((r) => `${r.SEASON_ID} ${d1(r.PTS / r.GP)}`).join(", ")}.`, col, 7);
    const cBest = [...col].sort((a, b) => b.FGM / b.FGA - a.FGM / a.FGA)[0];
    add("college", `His best college shooting season: ${p3(cBest.FGM / cBest.FGA)} in ${cBest.SEASON_ID}.`, cBest, 5);
  }
  const as = career.SeasonTotalsAllStarSeason || [];
  if (as.length) {
    const aT = as.reduce((a, r) => ({ GP: a.GP + r.GP, PTS: a.PTS + r.PTS, STL: a.STL + (r.STL || 0) }), { GP: 0, PTS: 0, STL: 0 });
    add("allstar", `All-Star Games: ${aT.GP}, ${aT.PTS} points (${d1(aT.PTS / aT.GP)} a game), ${aT.STL} steals.`, as, 7);
    const aHi = [...as].sort((a, b) => b.PTS - a.PTS)[0];
    add("allstar", `His best All-Star Game: ${aHi.PTS} points in ${aHi.SEASON_ID}.`, aHi, 6);
  }

  // Select and number. Order by kind so the page reads in sections.
  const ORDER = ["career", "league", "season", "games", "streak", "finals", "playoffs", "opponents", "splits", "college", "allstar"];
  const chosen = facts.sort((a, b) => b.score - a.score).slice(0, 100)
    .sort((a, b) => ORDER.indexOf(a.kind) - ORDER.indexOf(b.kind) || b.score - a.score)
    .map((f, i) => ({ n: i + 1, ...f }));
  const out = { subject: "Michael Jordan", playerId: MJID, generatedAt: new Date().toISOString(), candidates: facts.length, facts: chosen,
    counts: { regularSeasonGames: RS.length, playoffGames: PO.length, leaguePlayerSeasons: league.length },
    method: [
      "Every regular-season and playoff game Jordan played, his season, college and All-Star totals, and every NBA player-season ever, all from stats.nba.com. Nothing typed in from memory.",
      "Title seasons and Finals series are derived from the game logs: a playoff run that ends on a win ended with a championship.",
      "Scoring and steals titles use the era's qualification (70 games or 1,400 points; 70 games or 125 steals). Career averages use the league's 400-game / 10,000-point bar; playoff averages 25 games.",
    ] };
  fs.mkdirSync(path.join(DATA, "facts"), { recursive: true });
  fs.writeFileSync(path.join(DATA, "facts", "mj-facts.json"), JSON.stringify(out, null, 1));
  console.log(`MJ: ${chosen.length}/100 from ${facts.length} candidates (${RS.length} RS + ${PO.length} PO games)`);
}
const has = (v) => v !== null && v !== undefined;
if (require.main === module) main();
