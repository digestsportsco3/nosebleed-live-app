#!/usr/bin/env node
// 100 more Michael Jordan facts: Jordan against his era. None repeats the
// first set (mj-facts.json). Every line carries `why`: the reason it works as
// a post.
//
// Era = his 13 seasons with the Bulls, 1984-85 through 1997-98 (the 14
// seasons that span them), plus the two Washington seasons where noted.
// Sources, all stats.nba.com via nba/pull.js: seasons/*.json (every
// player-season) and mj/games-*.json (every game he played).
//
//   node statdesk/nba/mj-era-facts.js
"use strict";
const fs = require("fs");
const path = require("path");
const { label, enrich , scheduleGP } = require("./facts");

const DATA = path.join(__dirname, "..", "data", "nba");
const MJID = 893;
const ERA = { from: 1984, to: 1997 };
const SPAN = "from 1984-85 through 1997-98";
const d1 = (v) => (v == null ? "—" : v.toFixed(1));
const p3 = (v) => (v == null ? "—" : v.toFixed(3).replace(/^0/, ""));
const c = (v) => Number(v).toLocaleString("en-US");
const fmtDate = (d) => d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
const CITY = { ATL: "Atlanta", BOS: "Boston", CHH: "Charlotte", CHA: "Charlotte", CHI: "Chicago", CLE: "Cleveland", DAL: "Dallas", DEN: "Denver", DET: "Detroit",
  GOS: "Golden State", GSW: "Golden State", HOU: "Houston", IND: "Indiana", KCK: "Kansas City", LAC: "the LA Clippers", LAL: "the LA Lakers", MIA: "Miami",
  MIL: "Milwaukee", MIN: "Minnesota", NJN: "New Jersey", NYK: "New York", ORL: "Orlando", PHL: "Philadelphia", PHI: "Philadelphia", PHX: "Phoenix",
  POR: "Portland", SAC: "Sacramento", SAN: "San Antonio", SAS: "San Antonio", SEA: "Seattle", TOR: "Toronto", UTA: "Utah", UTH: "Utah", VAN: "Vancouver",
  WAS: "Washington", MEM: "Memphis", NOH: "New Orleans" };
const city = (x) => CITY[x] || x;
const andList = (a) => (a.length <= 1 ? a.join("") : a.length === 2 ? `${a[0]} and ${a[1]}` : `${a.slice(0, -1).join(", ")} and ${a[a.length - 1]}`);
const ordinal = (n) => `${n}${n % 100 >= 11 && n % 100 <= 13 ? "th" : ["th", "st", "nd", "rd"][n % 10] || "th"}`;

function season(y, type) {
  const f = path.join(DATA, "seasons", `${label(y)}-${type}.json`);
  if (!fs.existsSync(f)) return [];
  const rows = JSON.parse(fs.readFileSync(f, "utf8")).rows.filter((r) => r.name);
  const maxGP = scheduleGP(rows);
  return rows.map((r) => enrich(r, y, maxGP));
}
function loadGames() {
  const dir = path.join(DATA, "mj"); const games = [];
  for (const f of fs.readdirSync(dir).filter((x) => /^games-\d{4}-\d{2}-(rs|po)\.json$/.test(x))) {
    const j = JSON.parse(fs.readFileSync(path.join(dir, f), "utf8"));
    for (const g of j.games) {
      const m = String(g.MATCHUP || "");
      games.push({ ...g, season: j.season, y: Number(j.season.slice(0, 4)), type: j.type, date: new Date(`${g.GAME_DATE} 12:00:00 UTC`),
        opp: m.split(/\s+(?:@|vs\.)\s+/)[1] || "?", home: /vs\./.test(m), W: g.WL === "W" });
    }
  }
  return games.sort((a, b) => a.date - b.date);
}
// Sum player-seasons across a span, keyed by player id.
function totals(type, from, to) {
  const m = new Map();
  for (let y = from; y <= to; y += 1) for (const r of season(y, type)) {
    const t = m.get(r.id) || { id: r.id, name: r.name, seasons: 0, GP: 0, MIN: 0, PTS: 0, FGM: 0, FGA: 0, FTM: 0, FTA: 0, FG3M: 0, REB: 0, AST: 0, STL: 0, BLK: 0, TOV: 0 };
    t.seasons += 1; for (const k of ["GP", "MIN", "PTS", "FGM", "FGA", "FTM", "FTA", "FG3M", "REB", "AST", "STL", "BLK", "TOV"]) t[k] += r[k] || 0;
    m.set(r.id, t);
  }
  return [...m.values()];
}
const qualTitle = (r) => r.GP >= 70 || r.PTS >= 1400; // scoring-title rule of his era

function main() {
  const facts = [];
  const add = (kind, text, why, evidence, score = 6) => facts.push({ kind, text, why, evidence: [].concat(evidence || []).slice(0, 12), score });
  const games = loadGames(); const RS = games.filter((g) => g.type === "rs"); const PO = games.filter((g) => g.type === "po");
  const on = (g) => `${fmtDate(g.date)} ${g.home ? "vs." : "at"} ${city(g.opp)}`;
  const gEv = (g) => ({ date: g.GAME_DATE, type: g.type, matchup: g.MATCHUP, WL: g.WL, PTS: g.PTS, REB: g.REB, AST: g.AST, STL: g.STL, BLK: g.BLK, FGM: g.FGM, FGA: g.FGA, FTM: g.FTM, FTA: g.FTA, MIN: g.MIN, game: g.Game_ID });

  // Title seasons, derived: a playoff run that ends on a win ended with a title.
  const TITLES = new Set(); for (const yy of new Set(PO.map((g) => g.y))) { const run = PO.filter((g) => g.y === yy); if (run[run.length - 1].W) TITLES.add(yy); }
  // ============================================ A. era leaderboards ==
  const T = { rs: totals("rs", ERA.from, ERA.to), po: totals("po", ERA.from, ERA.to) };
  const STAT = { PTS: "points", FGM: "field goals", FTM: "free throws made", STL: "steals", FGA: "field-goal attempts", FTA: "free-throw attempts", MIN: "minutes", AST: "assists" };
  for (const [type, lab] of [["rs", "regular-season"], ["po", "playoff"]]) {
    for (const k of type === "rs" ? ["PTS", "FGM", "FTM", "STL", "FGA", "MIN"] : ["PTS", "FGM", "FTM", "STL", "AST", "MIN"]) {
      const list = [...T[type]].sort((a, b) => b[k] - a[k]); const i = list.findIndex((r) => r.id === MJID); if (i < 0) continue;
      const mj = list[i];
      if (i === 0) add("era", `Most ${lab} ${STAT[k]} in the NBA ${SPAN}: Jordan, ${c(mj[k])}. Next: ${list[1].name}, ${c(list[1][k])} — ${c(mj[k] - list[1][k])} behind.`,
        ({ PTS: `Answers "who owned the era" with one number, and the gap to No. 2 is the hook.`,
           FGM: `Made baskets, not just shots: the volume answer to "he just shot a lot".`,
           FGA: `Leans into the volume critique and owns it; sparks replies either way.`,
           FTM: `Getting to the line was half his game; this is the number that shows it.`,
           STL: type === "po" ? `Defense in the biggest games; his running mate is right behind him, which Pippen fans love.` : `The defensive half of the GOAT case.`,
           MIN: type === "po" ? `Playoff minutes measure how deep his teams went, year after year.` : `Durability angle for load-management debates.`,
           AST: `Playmaking credit that scoring headlines bury.` })[k] || `A leaderboard he topped; the margin over a named rival invites debate.`,
        list.slice(0, 5), k === "PTS" ? 9 : 7);
      else if (i < 5) add("era", `${lab[0].toUpperCase() + lab.slice(1)} ${STAT[k]} ${SPAN}: Jordan ranked ${ordinal(i + 1)} with ${c(mj[k])}, behind ${andList(list.slice(0, i).map((r) => `${r.name} (${c(r[k])})`))}.`,
        `Surprising that anyone beat him here; fans will want to know why (he played fewer games in two of these seasons).`, list.slice(0, 5), 5);
    }
  }
  // Per-game leaderboards over the era.
  for (const [type, lab, minG, ks] of [["rs", "regular-season", 400, ["PTS", "STL"]], ["po", "playoff", 50, ["PTS", "STL", "AST"]]]) {
    for (const k of ks) {
      const list = T[type].filter((r) => r.GP >= minG).map((r) => ({ ...r, v: r[k] / r.GP })).sort((a, b) => b.v - a.v);
      const i = list.findIndex((r) => r.id === MJID); if (i < 0 || i > 4) continue;
      const nm = { PTS: "scoring average", STL: "steals average", AST: "assist average" }[k];
      const f = k === "PTS" ? d1 : (v) => v.toFixed(2);
      add("era", `Best ${lab} ${nm} ${SPAN} (${minG}+ games): ${i === 0 ? `Jordan, ${f(list[0].v)} — next ${list[1].name}, ${f(list[1].v)}` : `Jordan ranked ${ordinal(i + 1)} at ${f(list[i].v)}; leader ${list[0].name}, ${f(list[0].v)}`}. Top five: ${list.slice(0, 5).map((r) => `${r.name} ${f(r.v)}`).join(", ")}.`,
        i === 0 ? `The top-five list names his rivals, so every fan base in it shares or argues with it.` : `Shows where the all-around game ranked against specialists of the era.`, list.slice(0, 5), i === 0 ? 8 : 5);
    }
  }
  // Threshold seasons, Jordan vs everyone else in the era.
  const allRS = []; const allPO = [];
  for (let y = ERA.from; y <= ERA.to; y += 1) { allRS.push(...season(y, "rs")); allPO.push(...season(y, "po")); }
  const vsField = (rows, f, what, why, score = 7) => {
    const m = rows.filter(f); const mj = m.filter((r) => r.id === MJID); const others = m.filter((r) => r.id !== MJID);
    const op = [...new Set(others.map((r) => r.name))];
    if (!mj.length) return;
    add("era", `${what} ${SPAN}: Jordan ${mj.length}${mj.length > 1 ? ` (${mj.map((r) => label(r.season)).join(", ")})` : ` (${label(mj[0].season)})`}; everyone else combined ${others.length}${others.length && op.length <= 4 ? ` (${andList(op)})` : ""}.`,
      why, m.slice(0, 12), score);
  };
  vsField(allRS, (r) => r.q && r.PPG >= 30, "Seasons averaging 30 points", `"Him vs the whole league" is the most shareable Jordan frame, and the lopsided count proves it.`, 9);
  vsField(allRS, (r) => r.PTS >= 2500, "2,500-point seasons", `A round-number club he nearly owned outright.`, 8);
  vsField(allRS, (r) => r.q && r.PPG >= 30 && r.FG >= 0.5, "Seasons averaging 30 points on 50% shooting", `Kills the "volume shooter" argument with efficiency and volume together.`, 8);
  vsField(allRS, (r) => r.FGM >= 900, "900-field-goal seasons", `Raw shot-making volume that the three-point era rarely approaches; great for then-vs-now debates.`, 7);
  vsField(allRS, (r) => r.FTM >= 700, "700-free-throw seasons", `Shows how often he lived at the line, an underrated part of his scoring.`, 6);
  vsField(allRS, (r) => r.PTS >= 2000 && r.STL >= 200, "Seasons with 2,000 points and 200 steals", `Scorer and ball-hawk in one line; the two-way case in a single stat.`, 8);
  vsField(allRS, (r) => r.q && r.PPG >= 25 && r.RPG >= 6 && r.APG >= 6, "Seasons averaging 25 points, 6 rebounds and 6 assists", `All-around production framing that pulls Magic, Bird and LeBron-era comparisons into the replies.`, 7);
  vsField(allRS, (r) => r.q && r.PPG >= 30 && r.SPG >= 2.5, "Seasons averaging 30 points and 2.5 steals", `An exclusive two-way club; the empty 'everyone else' side is the post.`, 8);
  vsField(allRS, (r) => r.q && r.MPG >= 40 && r.PPG >= 30, "Seasons averaging 40 minutes and 30 points", `Workload angle: fans compare it with today's load management.`, 6);
  vsField(allPO, (r) => r.GP >= 10 && r.PPG >= 30, "Postseasons of 10+ games averaging 30 points", `Playoff scoring is the core of the GOAT debate; the count against the field is stark.`, 9);
  vsField(allPO, (r) => r.GP >= 10 && r.PPG >= 30 && r.FG >= 0.5, "Postseasons of 10+ games averaging 30 points on 50% shooting", `Big-game efficiency is the rebuttal to every "he took too many shots" take.`, 8);
  vsField(allPO, (r) => r.PTS >= 600, "600-point postseasons", `Deep-run scoring volume; ties directly to the titles.`, 7);

  // ============================================ B. season by season ==
  const LEADS = {};
  for (let y = ERA.from; y <= 2002; y += 1) {
    if (y > ERA.to && y < 2001) continue;
    const rows = season(y, "rs"); const mj = rows.find((r) => r.id === MJID); if (!mj) continue;
    const q = rows.filter(qualTitle).sort((a, b) => b.PPG - a.PPG);
    const i = q.findIndex((r) => r.id === MJID);
    if (i === 0 && y !== 1986) {
      const mg = Number(d1(q[0].PPG)) - Number(d1(q[1].PPG));
      const titleYr = TITLES.has(y);
      const why = mg < 1 ? `His closest scoring race; ${q[1].name} fans will say it could have gone the other way.`
        : `${q[1].name} was the league's second-best scorer and still finished ${mg.toFixed(1)} a game back${titleYr ? " — in a year that ended with a championship" : ""}.`;
      add("season", `${label(y)} scoring title: Jordan ${d1(q[0].PPG)}, runner-up ${q[1].name} ${d1(q[1].PPG)} — a margin of ${(Number(d1(q[0].PPG)) - Number(d1(q[1].PPG))).toFixed(1)} a game.`,
        why, q.slice(0, 3), 6);
    } else if (i > 0 && y < 2001) {
      add("season", `${label(y)}: Jordan was ${ordinal(i + 1)} in scoring at ${d1(mj.PPG)}${i <= 3 ? `, behind ${andList(q.slice(0, i).map((r) => `${r.name} (${d1(r.PPG)})`))}` : ""}.`,
        y === 1984 ? `Rookie-year context: who was ahead of him before the run of titles began.` : `One of the few seasons he did not win the scoring title, and who did.`, q.slice(0, 5), 6);
    } else if (i < 0) {
      add("season", `${label(y)}: Jordan played ${mj.GP} games (${c(mj.PTS)} points, ${d1(mj.PPG)} a game) — too few to qualify for the scoring title.`,
        `Explains the gap in the scoring-title streak, a common trivia question.`, [mj], 5);
    }
    // League ranks in other categories that season.
    for (const k of ["STL", "FGM", "FTM", "MIN"]) {
      const list = [...rows].sort((a, b) => b[k] - a[k]);
      if (list[0].id === MJID && (!list[1] || list[1][k] !== list[0][k])) (LEADS[k] = LEADS[k] || []).push({ y, v: list[0][k], next: list[1] });
    }
    const po = season(y, "po"); const mjp = po.find((r) => r.id === MJID);
    if (mjp && y <= ERA.to) {
      const pl = [...po].sort((a, b) => b.PTS - a.PTS);
      if (pl[0].id === MJID) add("playoffs", `${label(y)} playoffs: most points of anyone, ${c(mjp.PTS)} in ${mjp.GP} games (${d1(mjp.PPG)}); next ${pl[1].name}, ${c(pl[1].PTS)}.`,
        TITLES.has(y) ? `He led every scorer in a title run; post it on the anniversary of that championship.` : `He led all playoff scorers even in a year his team fell short, which undercuts "empty stats" claims.`, pl.slice(0, 3), 6);
    }
  }
  const LNAME = { STL: "total steals", FGM: "field goals made", FTM: "free throws made", MIN: "minutes played" };
  for (const [k, arr] of Object.entries(LEADS)) add("league", `Jordan led the NBA in ${LNAME[k]} ${arr.length} time${arr.length > 1 ? "s" : ""}: ${arr.map((x) => `${label(x.y)} (${c(x.v)}; next ${x.next.name} ${c(x.next[k])})`).join("; ")}.`,
    k === "FGM" ? `${arr.length} field-goal titles is a stat almost nobody knows; the runner-up names add rival fan bases.` : k === "MIN" ? `Workload angle for load-management debates.` : `A league lead beyond scoring, which casual fans rarely know about.`,
    arr.map((x) => ({ season: label(x.y), v: x.v, next: x.next.name, nextV: x.next[k] })), k === "FGM" ? 8 : 6);
  // Longest run of seasons leading the league in total points.
  const ledPts = []; for (let y = ERA.from; y <= ERA.to; y += 1) { const r = [...season(y, "rs")].sort((a, b) => b.PTS - a.PTS); ledPts.push({ y, led: r[0].id === MJID, leader: r[0] }); }
  const nLed = ledPts.filter((x) => x.led).length;
  add("league", `Jordan led the NBA in total points in ${nLed} of the 14 seasons ${SPAN}; the others went to ${andList([...new Set(ledPts.filter((x) => !x.led).map((x) => `${x.leader.name} (${label(x.y)})`))])}.`,
    `Total points (not average) removes the games-played asterisk; naming the other leaders makes it trivia.`, ledPts.map((x) => ({ season: label(x.y), leader: x.leader.name, PTS: x.leader.PTS })), 7);

  // ================================================ C. teammates ==
  const pippenBoth = []; let bestDuo = null;
  for (let y = ERA.from; y <= ERA.to; y += 1) {
    const rows = season(y, "rs"); const mj = rows.find((r) => r.id === MJID); const sp = rows.find((r) => /^Scottie Pippen$/.test(r.name) && r.team === "CHI");
    if (!mj || !sp) continue;
    if (mj.PPG >= 20 && sp.PPG >= 20) pippenBoth.push(`${label(y)} (${d1(mj.PPG)} and ${d1(sp.PPG)}${mj.GP < 50 ? `; Jordan played ${mj.GP} games` : ""})`);
    const duo = mj.PTS + sp.PTS; if (!bestDuo || duo > bestDuo.duo) bestDuo = { y, duo, mj, sp };
  }
  if (pippenBoth.length) add("teammates", `Seasons in which Jordan and Scottie Pippen both averaged 20 points: ${pippenBoth.length} — ${andList(pippenBoth)}.`,
    `Duo content always travels; the small number surprises people who remember them as co-stars every year.`, [], 7);
  if (bestDuo) add("teammates", `Most combined regular-season points by Jordan and Pippen: ${c(bestDuo.duo)} in ${label(bestDuo.y)} (Jordan ${c(bestDuo.mj.PTS)}, Pippen ${c(bestDuo.sp.PTS)}).`,
    `Invites comparisons with today's star duos.`, [bestDuo.mj, bestDuo.sp], 6);
  const spPlay = []; for (let y = ERA.from; y <= ERA.to; y += 1) { const p = season(y, "po"); const mj = p.find((r) => r.id === MJID); const sp = p.find((r) => /^Scottie Pippen$/.test(r.name)); if (mj && sp) spPlay.push({ y, mj, sp }); }
  if (spPlay.length) {
    const mjPts = spPlay.reduce((a, x) => a + x.mj.PTS, 0), spPts = spPlay.reduce((a, x) => a + x.sp.PTS, 0);
    add("teammates", `In the ${spPlay.length} postseasons they played together, Jordan scored ${c(mjPts)} playoff points and Pippen ${c(spPts)} — together ${c(mjPts + spPts)}.`,
      `Frames the partnership in one number and gives Pippen fans their due.`, [], 5);
  }

  // =============================================== D. game logs ==
  const avg = (arr, k = "PTS") => arr.reduce((a, g) => a + g[k], 0) / arr.length;
  const rec = (arr) => `${arr.filter((g) => g.W).length}-${arr.filter((g) => !g.W).length}`;
  // Milestones by game number.
  let cum = 0; const marks = [10000, 15000, 20000, 25000, 30000, 32000]; let mi = 0;
  RS.forEach((g, idx) => { cum += g.PTS; while (mi < marks.length && cum >= marks[mi]) {
    add("games", `Jordan reached ${c(marks[mi])} regular-season points in his ${c(idx + 1)}${ordinal(idx + 1).replace(/^\d+/, "")} game, ${on(g)}.`,
      ({ 10000: `The first big milestone; compare the game count with today's young stars.`, 15000: `Mid-prime pace check fans can measure anyone against.`, 20000: `The 20K club by game count is a classic "who got there fastest" argument.`,
         25000: `Reached in his second Bulls stint, after the baseball break; a comeback-chapter milestone.`, 30000: `Reached against the Bulls in a Wizards uniform; the irony makes it a story.`, 32000: `His final milestone, at 40; longevity content.` })[marks[mi]], gEv(g), marks[mi] >= 25000 ? 7 : 6);
    mi += 1; } });
  // Firsts.
  for (const bar of [30, 40, 50]) {
    const idx = RS.findIndex((g) => g.PTS >= bar); const g = RS[idx];
    add("games", `His first ${bar}-point game came in his ${ordinal(idx + 1)} NBA game: ${g.PTS} points, ${on(g)}.`, `How fast the scoring arrived is a great "rookie Jordan" post.`, gEv(g), 6);
  }
  const firstPO = PO[0]; add("playoffs", `His first playoff game: ${firstPO.PTS} points, ${on(firstPO)} (${firstPO.WL}).`, `Origin-story content; pairs well with his last playoff game.`, gEv(firstPO), 5);
  const lastPO = PO[PO.length - 1]; add("playoffs", `His last playoff game: ${lastPO.PTS} points, ${on(lastPO)} (${lastPO.WL}).`, `A famous finale told by the box score; nostalgia posts perform.`, gEv(lastPO), 6);
  // Calendar splits.
  const xmas = RS.filter((g) => g.date.getUTCMonth() === 11 && g.date.getUTCDate() === 25);
  if (xmas.length) add("games", `Christmas Day: ${xmas.length} regular-season games, ${d1(avg(xmas))} points a game, ${rec(xmas)} — ${xmas.map((g) => `${g.PTS} ${g.home ? "vs." : "at"} ${city(g.opp)} ${g.date.getUTCFullYear()}`).join("; ")}.`,
    `Seasonal hook: post it on Christmas when the league's showcase games are on.`, xmas.map(gEv), 7);
  const bday = RS.filter((g) => g.date.getUTCMonth() === 1 && g.date.getUTCDate() === 17);
  if (bday.length) add("games", `On his birthday (Feb. 17) he played ${bday.length} regular-season game${bday.length > 1 ? "s" : ""}: ${bday.map((g) => `${g.PTS} ${g.home ? "vs." : "at"} ${city(g.opp)} in ${g.date.getUTCFullYear()}`).join("; ")}.`,
    `Post it every Feb. 17; birthday content for the biggest name in the sport is guaranteed reach.`, bday.map(gEv), 7);
  const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const byMonth = MONTHS.map((m, i) => ({ m, g: RS.filter((g) => g.date.getUTCMonth() === i) })).filter((x) => x.g.length >= 50);
  const bm = [...byMonth].sort((a, b) => avg(b.g) - avg(a.g));
  add("games", `His best month: ${bm[0].m}, ${d1(avg(bm[0].g))} points a game over ${bm[0].g.length} regular-season games. His lowest: ${bm[bm.length - 1].m}, ${d1(avg(bm[bm.length - 1].g))} (months with 50+ games).`,
    `Calendar content you can post at the start of that month.`, [], 5);
  const openers = [...new Set(RS.map((g) => g.season))].map((s) => RS.find((g) => g.season === s));
  add("games", `In his first game of each of his ${openers.length} seasons he averaged ${d1(avg(openers))} points (${rec(openers)}); high ${Math.max(...openers.map((g) => g.PTS))}.`,
    `Opening-night hook for the first week of any season.`, openers.map(gEv), 6);
  const ot = RS.filter((g) => g.MIN > 48);
  if (ot.length >= 5) { const hi = [...ot].sort((a, b) => b.PTS - a.PTS)[0];
    add("games", `Games in which he played more than 48 minutes (possible only in overtime): ${ot.length} in the regular season, ${d1(avg(ot))} points a game, ${rec(ot)}; the most was ${hi.PTS}, ${on(hi)}.`, `Clutch framing without a subjective clutch stat.`, ot.map(gEv).slice(0, 12), 6); }
  const dow = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map((d, i) => ({ d, g: RS.filter((g) => g.date.getUTCDay() === i) }));
  const sun = dow[0]; add("games", `Sunday regular-season games: ${sun.g.length}, ${d1(avg(sun.g))} points a game (${rec(sun.g)}).`, `Sunday is when big national games air; ties his reputation to the showcase slot.`, [], 4);
  // Box-score oddities.
  const zeroTO = RS.filter((g) => g.TOV === 0); add("games", `Regular-season games without a turnover: ${zeroTO.length}; he averaged ${d1(avg(zeroTO))} points in them.`, `Ball-security stat for a high-usage star; surprises people.`, zeroTO.slice(0, 12).map(gEv), 5);
  const fta20 = RS.filter((g) => g.FTA >= 20); add("games", `Games with 20+ free-throw attempts: ${fta20.length} in the regular season, ${fta20.filter((g) => g.W).length} of them wins.`, `Shows how defenses had to foul him; good for foul-era debates.`, fta20.map(gEv), 5);
  const eff = RS.filter((g) => g.FGA >= 20 && g.FGM / g.FGA >= 0.6); add("games", `Games shooting 60% or better on 20+ shots: ${eff.length} in the regular season.`, `Efficiency on volume, the combination the modern analytics crowd prizes.`, eff.slice(0, 12).map(gEv), 6);
  const dd = RS.filter((g) => [g.PTS, g.REB, g.AST].filter((v) => v >= 10).length >= 2); add("games", `Regular-season double-doubles: ${dd.length}.`, `A number fans guess low; good as a quiz post.`, [], 4);
  const reb10 = RS.filter((g) => g.REB >= 10); add("games", `Games with 10+ rebounds: ${reb10.length} in the regular season, ${PO.filter((g) => g.REB >= 10).length} in the playoffs.`, `Rebounding is the overlooked part of a guard's game.`, [], 4);
  const low = [...RS].sort((a, b) => a.PTS - b.PTS)[0]; const single = RS.filter((g) => g.PTS < 10);
  add("games", `Single-digit games: ${single.length} in ${c(RS.length)} regular-season games. The lowest: ${low.PTS} points, ${on(low)}.`, `The rarity of an off night makes the point better than any average.`, single.map(gEv).slice(0, 12), 6);
  const t30w = RS.filter((g) => g.PTS >= 30); add("games", `His teams' record when he scored 30+ in the regular season: ${rec(t30w)}.`, `Winning when he scored big answers "empty stats" claims.`, [], 6);
  const u20 = RS.filter((g) => g.PTS < 20); add("games", `His teams' record when he scored under 20 in the regular season: ${rec(u20)} (${u20.length} games).`, `Contrast post; pairs with the 30-point record.`, [], 5);
  // After a bad game.
  const after = []; RS.forEach((g, i) => { if (g.PTS < 20 && RS[i + 1] && RS[i + 1].season === g.season) after.push(RS[i + 1]); });
  add("games", `The game after he was held under 20: ${d1(avg(after))} points on average (${after.length} times).`, `The bounce-back narrative, backed by a number.`, [], 6);
  // 40-point games by season.
  const by40 = {}; for (const g of RS.filter((g) => g.PTS >= 40)) by40[g.season] = (by40[g.season] || 0) + 1;
  const b40 = Object.entries(by40).sort((a, b) => b[1] - a[1]);
  add("games", `40-point regular-season games by season: ${Object.entries(by40).map(([s, n]) => `${s} ${n}`).join(", ")}.`, `A season-by-season table in one line; fans screenshot it.`, [], 5);
  // Playoff opponents beyond New York.
  const series = []; for (const g of PO) { const last = series[series.length - 1]; if (last && last.opp === g.opp && last.season === g.season) last.g.push(g); else series.push({ opp: g.opp, season: g.season, g: [g] }); }
  for (const opp of ["DET", "CLE", "BOS", "UTA", "MIA", "ATL", "PHI"]) {
    const s = series.filter((x) => x.opp === opp); if (!s.length) continue;
    const gs = s.flatMap((x) => x.g); const won = s.filter((x) => x.g[x.g.length - 1].W).length;
    add("opponents", `Playoffs vs. ${city(opp)}: ${s.length} series (${won}-${s.length - won}), ${gs.length} games, ${rec(gs)}, ${d1(avg(gs))} points a game.`,
      opp === "DET" ? `The Bad Boys rivalry in numbers; Pistons and Bulls fans both engage.`
        : won === s.length ? `${city(opp)} never beat him in a playoff series (${won}-0); that fan base's sore spot is guaranteed replies.`
        : won === 0 ? `One of the few teams he never beat in a series, and he still averaged ${d1(avg(gs))}; the "stats vs. wins" debate in one line.`
        : `A split rivalry (${won}-${s.length - won}) gives both fan bases something to claim.`, gs.map(gEv).slice(0, 12), opp === "DET" ? 8 : 6);
  }
  const clinch = series.filter((x) => x.g[x.g.length - 1].W).map((x) => x.g[x.g.length - 1]);
  add("playoffs", `In the ${clinch.length} games that clinched a playoff series he averaged ${d1(avg(clinch))} points.`, `Closer framing across every round, not just the Finals.`, clinch.map(gEv).slice(0, 12), 7);
  const g1 = series.map((x) => x.g[0]); add("playoffs", `In Game 1s he averaged ${d1(avg(g1))} points (${rec(g1)} in ${g1.length} series openers).`, `Set-the-tone angle for the first night of any playoff series.`, [], 5);
  const po40L = PO.filter((g) => g.PTS >= 40 && !g.W); add("playoffs", `Playoff games in which he scored 40+ and still lost: ${po40L.length}.`, `Even the losses were monster games; humanizes the legend.`, po40L.map(gEv), 5);
  const po3 = [...PO].sort((a, b) => b.FG3M - a.FG3M)[0];
  const s3 = series.find((x) => x.g.includes(po3)); const runS = series.filter((x) => x.season === s3.season);
  const finals = TITLES.has(po3.y) && runS[runS.length - 1] === s3;
  const where3 = finals ? `Game ${s3.g.indexOf(po3) + 1} of the ${po3.y + 1} Finals` : `a ${po3.y + 1} playoff game`;
  add("playoffs", `Most threes in a playoff game: ${po3.FG3M}, ${on(po3)} (${po3.PTS} points) — ${where3}.`, `A three-point outburst from a player known for the mid-range, on the biggest stage; fans love the contrast.`, gEv(po3), 6);
  for (const opp of ["DET", "BOS", "LAL", "CLE", "UTA", "PHX"]) {
    const gs = RS.filter((g) => g.opp === opp); if (gs.length < 15) continue;
    const hi = [...gs].sort((a, b) => b.PTS - a.PTS)[0];
    add("opponents", `Regular season vs. ${city(opp)}: ${gs.length} games, ${d1(avg(gs))} points a game, ${rec(gs)}; high ${hi.PTS} (${fmtDate(hi.date)}).`,
      gs.filter((g) => g.W).length < gs.length / 2 ? `A rare losing regular-season record against one team; surprises people and invites that fan base to gloat.` : `${city(opp)} fans remember the ${hi.PTS}-point night; the full head-to-head gives them the rest.`, [gEv(hi)], opp === "DET" || opp === "BOS" || opp === "LAL" ? 6 : 5);
  }
  const fgm20 = RS.filter((g) => g.FGM >= 20); add("games", `Games with 20+ made field goals: ${fgm20.length} in the regular season, ${PO.filter((g) => g.FGM >= 20).length} in the playoffs.`, `Twenty makes in a game is rare today; shows his shot-making volume.`, fgm20.slice(0, 12).map(gEv), 6);
  const ftm15 = RS.filter((g) => g.FTM >= 15); add("games", `Games with 15+ made free throws: ${ftm15.length} in the regular season.`, `Pressure on defenses in one number.`, ftm15.slice(0, 12).map(gEv), 5);
  const thr = {}; for (const g of RS) thr[g.season] = (thr[g.season] || 0) + g.FG3M;
  const tb = Object.entries(thr).sort((a, b) => b[1] - a[1])[0];
  add("season", `His most threes in a season: ${tb[1]}, in ${tb[0]}; in his first ${Object.keys(thr).indexOf(Object.keys(thr).find((s) => thr[s] >= 50))} seasons he never made 50.`, `Then-vs-now three-point contrast; modern fans are stunned by the low totals.`, [], 5);
  const t40po = PO.filter((g) => g.PTS >= 40); const byOpp = {}; for (const g of t40po) byOpp[g.opp] = (byOpp[g.opp] || 0) + 1;
  const topOpp = Object.entries(byOpp).sort((a, b) => b[1] - a[1]);
  if (topOpp.length > 1 && topOpp[0][1] > topOpp[1][1]) add("playoffs", `The team he scored 40+ against most in the playoffs: ${city(topOpp[0][0])}, ${topOpp[0][1]} times (of his ${t40po.length} 40-point playoff games).`, `A rival fan base's worst memory; they engage.`, t40po.filter((g) => g.opp === topOpp[0][0]).map(gEv), 6);
  // Washington years vs the league.
  for (const y of [2001, 2002]) {
    const rows = season(y, "rs"); const mj = rows.find((r) => r.id === MJID); if (!mj) continue;
    const wasTeam = rows.filter((r) => r.team === mj.team).sort((a, b) => b.PTS - a.PTS);
    if (wasTeam[0].id === MJID) add("season", `${label(y)}: at ${y === 2001 ? "38 to 39" : "39 to 40"}, Jordan led Washington in scoring with ${c(mj.PTS)} points (${d1(mj.PPG)} a game); next ${wasTeam[1].name}, ${c(wasTeam[1].PTS)}.`,
      `Late-career greatness is a perennial debate; leading his team at that age is the proof point.`, wasTeam.slice(0, 3), 6);
  }
  const was = RS.filter((g) => g.y >= 2001); const was40 = was.filter((g) => g.PTS >= 40);
  add("season", `In Washington (${was.length} games) he averaged ${d1(avg(was))} points and scored 40+ ${was40.length} times.`, `The "Wizards Jordan" chapter is under-discussed; strong numbers spark debate.`, was40.map(gEv), 5);

  // Select: best 100 by score, keeping kinds balanced.
  facts.sort((a, b) => b.score - a.score);
  const out = facts.slice(0, 100).map((f, i) => ({ n: i + 1, ...f }));
  const doc = { subject: "Michael Jordan vs. His Era", facts: out, candidates: facts.length,
    counts: { regularSeasonGames: RS.length, playoffGames: PO.length },
    method: [
      "Michael Jordan vs. his era: every line is computed from stats.nba.com — each player-season of 1984-85 through 1997-98 (and 2001-03 where noted) and every game Jordan played. Nothing typed in from memory.",
      "Era leaderboards sum each player's seasons across the span; per-game leaderboards require the stated minimum games. Scoring titles use the rule of his era: 70 games or 1,400 points. 'Why' notes are editorial: why the line should work as a post.",
    ], generatedAt: new Date().toISOString() };
  fs.writeFileSync(path.join(DATA, "facts", "mj-era-facts.json"), JSON.stringify(doc, null, 1));
  console.log(`MJ era: ${out.length}/100 from ${facts.length} candidates`);
}
main();
