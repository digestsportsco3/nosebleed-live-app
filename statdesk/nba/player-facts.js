#!/usr/bin/env node
// 100 facts about one player, each with a "why post" note, from the official
// record (stats.nba.com via nba/pull.js player <id> <slug>):
//   players/<slug>/games-*.json, career.json, info.json   the player
//   seasons/*.json                                        every NBA player-season
//   mj/                                                   Jordan, for comparisons
// Titles and Finals are derived from game logs (a run whose last game is a win
// ended in a title; its last series was the Finals). Nothing typed from memory.
//
//   node statdesk/nba/player-facts.js kobe ["Kobe Bryant"]
"use strict";
const fs = require("fs");
const path = require("path");
const { label, enrich } = require("./facts");

const DATA = path.join(__dirname, "..", "data", "nba");
const slug = process.argv[2] || "kobe";
const DIR = slug === "mj" ? path.join(DATA, "mj") : path.join(DATA, "players", slug);
const d1 = (v) => (v == null ? "—" : v.toFixed(1));
const c = (v) => Number(v).toLocaleString("en-US");
const fmtDate = (d) => d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
const ordinal = (n) => `${c(n)}${n % 100 >= 11 && n % 100 <= 13 ? "th" : ["th", "st", "nd", "rd"][n % 10] || "th"}`;
const andList = (a) => (a.length <= 1 ? a.join("") : a.length === 2 ? `${a[0]} and ${a[1]}` : `${a.slice(0, -1).join(", ")} and ${a[a.length - 1]}`);
const CITY = { ATL: "Atlanta", BOS: "Boston", BKN: "Brooklyn", CHH: "Charlotte", CHA: "Charlotte", CHI: "Chicago", CLE: "Cleveland", DAL: "Dallas", DEN: "Denver",
  DET: "Detroit", GSW: "Golden State", GOS: "Golden State", HOU: "Houston", IND: "Indiana", LAC: "the Clippers", LAL: "the Lakers", MEM: "Memphis", MIA: "Miami",
  MIL: "Milwaukee", MIN: "Minnesota", NJN: "New Jersey", NOH: "New Orleans", NOP: "New Orleans", NOK: "New Orleans/Oklahoma City", NYK: "New York", OKC: "Oklahoma City",
  ORL: "Orlando", PHI: "Philadelphia", PHL: "Philadelphia", PHX: "Phoenix", POR: "Portland", SAC: "Sacramento", SAS: "San Antonio", SAN: "San Antonio", SEA: "Seattle",
  TOR: "Toronto", UTA: "Utah", UTH: "Utah", VAN: "Vancouver", WAS: "Washington", KCK: "Kansas City" };
const city = (x) => CITY[x] || x;

function loadGames(dir) {
  const games = [];
  for (const f of fs.readdirSync(dir).filter((x) => /^games-\d{4}-\d{2}-(rs|po)\.json$/.test(x))) {
    const j = JSON.parse(fs.readFileSync(path.join(dir, f), "utf8"));
    for (const g of j.games) { const m = String(g.MATCHUP || "");
      games.push({ ...g, season: j.season, y: Number(j.season.slice(0, 4)), type: j.type, date: new Date(`${g.GAME_DATE} 12:00:00 UTC`),
        opp: m.split(/\s+(?:@|vs\.)\s+/)[1] || "?", team: m.split(/\s+/)[0], home: /vs\./.test(m), W: g.WL === "W" }); }
  }
  return games.sort((a, b) => a.date - b.date);
}
function season(y, type) {
  const f = path.join(DATA, "seasons", `${label(y)}-${type}.json`); if (!fs.existsSync(f)) return [];
  const rows = JSON.parse(fs.readFileSync(f, "utf8")).rows.filter((r) => r.name); const maxGP = Math.max(...rows.map((r) => r.GP || 0));
  return rows.map((r) => enrich(r, y, maxGP));
}
function totals(type, from, to) {
  const m = new Map();
  for (let y = from; y <= to; y += 1) for (const r of season(y, type)) {
    const t = m.get(r.id) || { id: r.id, name: r.name, GP: 0, PTS: 0, FGM: 0, FGA: 0, FTM: 0, FG3M: 0, AST: 0, REB: 0, STL: 0, MIN: 0 };
    for (const k of ["GP", "PTS", "FGM", "FGA", "FTM", "FG3M", "AST", "REB", "STL", "MIN"]) t[k] += r[k] || 0; m.set(r.id, t);
  }
  return [...m.values()];
}
const runs = (arr, f) => { let best = { n: 0 }, cur = 0, st = 0; arr.forEach((g, i) => { if (f(g)) { if (!cur) st = i; cur += 1; if (cur > best.n) best = { n: cur, from: arr[st], to: g, i0: st, i1: i }; } else cur = 0; }); return best; };
const series = (PO) => { const s = []; for (const g of PO) { const l = s[s.length - 1]; if (l && l.opp === g.opp && l.y === g.y) l.g.push(g); else s.push({ opp: g.opp, y: g.y, g: [g] }); } return s; };

function main() {
  if (!fs.existsSync(DIR)) { console.error(`No data at ${DIR}; run: node statdesk/nba/pull.js player <id> ${slug}`); process.exit(2); }
  const info = fs.existsSync(path.join(DIR, "info.json")) ? JSON.parse(fs.readFileSync(path.join(DIR, "info.json"), "utf8")) : {};
  const career = JSON.parse(fs.readFileSync(path.join(DIR, "career.json"), "utf8")).sets;
  const ID = career.SeasonTotalsRegularSeason[0].PLAYER_ID;
  const FULL = process.argv[3] || (info.raw && info.raw.DISPLAY_FIRST_LAST) || slug; const LAST = FULL.split(" ").slice(-1)[0];
  const games = loadGames(DIR); const RS = games.filter((g) => g.type === "rs"); const PO = games.filter((g) => g.type === "po");
  const Y0 = RS[0].y, Y1 = RS[RS.length - 1].y; const SPAN = `from ${label(Y0)} through ${label(Y1)}`;
  const birth = info.birthdate ? new Date(`${info.birthdate.slice(0, 10)}T12:00:00Z`) : null;
  const ageOn = (d) => { if (!birth) return null; let y = d.getUTCFullYear() - birth.getUTCFullYear(); const bd = new Date(Date.UTC(d.getUTCFullYear(), birth.getUTCMonth(), birth.getUTCDate(), 12)); if (d < bd) y -= 1;
    const last = new Date(Date.UTC(birth.getUTCFullYear() + y, birth.getUTCMonth(), birth.getUTCDate(), 12)); return `${y} years, ${Math.round((d - last) / 86400000)} days old`; };
  const facts = [];
  const add = (kind, text, why, ev, score = 6) => facts.push({ kind, text, why, evidence: [].concat(ev || []).slice(0, 12), score });
  const on = (g) => `${fmtDate(g.date)} ${g.home ? "vs." : "at"} ${city(g.opp)}`;
  const gEv = (g) => ({ date: g.GAME_DATE, type: g.type, matchup: g.MATCHUP, WL: g.WL, PTS: g.PTS, REB: g.REB, AST: g.AST, FGM: g.FGM, FGA: g.FGA, FG3M: g.FG3M, FTM: g.FTM, FTA: g.FTA, MIN: g.MIN, game: g.Game_ID });
  const sum = (a, k = "PTS") => a.reduce((s, g) => s + (g[k] || 0), 0); const avg = (a, k = "PTS") => sum(a, k) / a.length;
  const rec = (a) => `${a.filter((g) => g.W).length}-${a.filter((g) => !g.W).length}`;
  const box = (g) => `${g.FGM}-${g.FGA} FG${g.FG3M ? `, ${g.FG3M} threes` : ""}, ${g.FTM}-${g.FTA} FT`;

  // ============================================================ career ==
  add("career", `${LAST} played ${c(RS.length)} regular-season and ${PO.length} playoff games, scoring ${c(sum(RS))} and ${c(sum(PO))} points — ${c(sum(RS) + sum(PO))} in all.`, `The career in one line; the combined total is the number fans rarely see.`, null, 9);
  const first = RS[0], last = RS[RS.length - 1];
  add("career", `First NBA game: ${first.PTS} point${first.PTS === 1 ? "" : "s"}, ${on(first)}${ageOn(first.date) ? `, at ${ageOn(first.date)}` : ""}.`, `Origin-story content; the age on the debut is the hook.`, gEv(first), 8);
  add("career", `Last NBA game: ${last.PTS} points, ${on(last)} (${box(last)}, ${last.WL})${ageOn(last.date) ? `, at ${ageOn(last.date)}` : ""}.`, last.PTS >= 50 ? `The greatest farewell box score there is; post it on the anniversary.` : `Farewell content; nostalgia posts perform.`, gEv(last), last.PTS >= 50 ? 10 : 7);
  const teams = [...new Set(RS.map((g) => g.team))];
  add("career", `${LAST} played all ${c(RS.length)} of his regular-season games for ${andList(teams.map(city))}${teams.length === 1 ? ` — ${Y1 - Y0 + 1} seasons with one franchise` : ""}.`, teams.length === 1 ? `One-franchise loyalty is rare and a point of pride for that fan base.` : `Career path in one line.`, null, teams.length === 1 ? 8 : 4);
  add("career", `His teams went ${rec(RS)} in his regular-season games and ${rec(PO)} in the playoffs.`, `Winning context for the scoring numbers.`, null, 6);
  // ============================================================= games ==
  for (const [lab, arr] of [["regular-season", RS], ["playoff", PO]]) {
    for (const bar of lab === "playoff" ? [30, 40, 50] : [30, 40, 50, 60]) {
      const m = arr.filter((g) => g.PTS >= bar); if (!m.length) continue;
      add("games", `${bar}-point ${lab} games: ${m.length}${m.length <= 6 ? ` — ${m.map((g) => `${g.PTS} ${on(g)}`).join("; ")}` : ` (${Math.round((100 * m.length) / arr.length)}% of his ${lab} games)`}.`,
        bar >= 50 ? `Fifty-point games are the scorer's trophy case; the count is instantly comparable.` : `A volume count fans compare against any other star.`, m.map(gEv), bar >= 50 ? 8 : 6);
    }
    const hi = [...arr].sort((a, b) => b.PTS - a.PTS)[0];
    add("games", `${lab[0].toUpperCase() + lab.slice(1)} career high: ${hi.PTS} points, ${on(hi)} (${box(hi)}, ${hi.WL}).`, hi.PTS >= 80 ? `One of the most famous box scores in the sport; every detail gets shared.` : `The ceiling game; the box score details are the post.`, gEv(hi), 10);
  }
  // Streaks.
  for (const bar of [20, 30, 40, 50]) {
    const r = runs(RS, (g) => g.PTS >= bar); if (r.n < 2) continue;
    add("streak", `Longest run of consecutive regular-season games with ${bar}+ points: ${r.n} (${fmtDate(r.from.date)} to ${fmtDate(r.to.date)}).`, bar >= 40 ? `Hot-streak content is the most shareable kind of scoring stat.` : `Consistency in one number.`, [gEv(r.from), gEv(r.to)], bar >= 40 ? 9 : 6);
  }
  const r50 = runs(RS, (g) => g.PTS >= 50);
  if (r50.n >= 2) add("streak", `During his ${r50.n}-game 50-point streak he scored ${RS.slice(r50.i0, r50.i1 + 1).map((g) => g.PTS).join(", ")}.`, `The individual numbers make the streak feel real.`, RS.slice(r50.i0, r50.i1 + 1).map(gEv), 8);
  const po30 = runs(PO, (g) => g.PTS >= 30); if (po30.n >= 3) add("streak", `Longest run of consecutive playoff games with 30+: ${po30.n} (${fmtDate(po30.from.date)} to ${fmtDate(po30.to.date)}).`, `Playoff scoring streaks feed the big-game argument.`, [gEv(po30.from), gEv(po30.to)], 7);
  const r10 = runs(RS, (g) => g.PTS >= 10); add("streak", `Longest run of consecutive regular-season games in double figures: ${c(r10.n)}.`, `Reliability over years, not weeks.`, [gEv(r10.from), gEv(r10.to)], 6);
  // Box oddities.
  const most = (k, lab2, why) => { const g = [...RS].sort((a, b) => b[k] - a[k] || b.PTS - a.PTS)[0]; add("games", `Most ${lab2} in a regular-season game: ${g[k]}, ${on(g)} (${g.PTS} points).`, why, gEv(g), 6); return g; };
  most("FG3M", "threes", `A shooting outburst fans can compare with modern three-point records.`);
  most("FTM", "free throws made", `Living at the line in one number.`);
  most("FGA", "field-goal attempts", `The volume-shooting debate in its most extreme form.`);
  most("AST", "assists", `The playmaking side of a scorer.`);
  most("REB", "rebounds", `A rebounding night fans do not expect from a guard.`);
  const perfFT = [...RS].filter((g) => g.FTA > 0 && g.FTM === g.FTA).sort((a, b) => b.FTA - a.FTA)[0];
  if (perfFT) add("games", `Most free throws without a miss in a regular-season game: ${perfFT.FTM}-for-${perfFT.FTA}, ${on(perfFT)}.`, `Perfection is easy to share.`, gEv(perfFT), 6);
  const td = RS.filter((g) => g.PTS >= 10 && g.REB >= 10 && g.AST >= 10); add("games", `Regular-season triple-doubles: ${td.length}${PO.filter((g) => g.PTS >= 10 && g.REB >= 10 && g.AST >= 10).length ? `, plus ${PO.filter((g) => g.PTS >= 10 && g.REB >= 10 && g.AST >= 10).length} in the playoffs` : ""}.`, `An all-around number fans guess wrong.`, td.map(gEv), 5);
  const f40l = RS.filter((g) => g.PTS >= 40); add("games", `His teams' record when he scored 40+ in the regular season: ${rec(f40l)}.`, `Winning when he scored big answers the "ball hog" critique.`, [], 7);
  const f50 = RS.filter((g) => g.PTS >= 50); add("games", `His teams' record in his 50-point regular-season games: ${rec(f50)}; the most he scored in a loss was ${Math.max(...f50.filter((g) => !g.W).map((g) => g.PTS), 0) || "—"}.`, `Even the big nights are not always wins; a nuanced post that gets replies.`, [], 6);
  const f30 = RS.filter((g) => g.PTS >= 30); add("games", `His teams' record when he scored 30+ in the regular season: ${rec(f30)}.`, `Winning context for a volume scorer.`, [], 5);
  const u10 = RS.filter((g) => g.PTS < 10); add("games", `Single-digit regular-season games: ${u10.length} of ${c(RS.length)}.`, `How rare an off night was.`, [], 5);
  const ot = RS.filter((g) => g.MIN > 48); if (ot.length >= 5) { const hi = [...ot].sort((a, b) => b.PTS - a.PTS)[0];
    add("games", `Games in which he played more than 48 minutes (only possible in overtime): ${ot.length}, ${d1(avg(ot))} points a game, ${rec(ot)}; high ${hi.PTS}, ${on(hi)}.`, `Clutch framing without a subjective clutch stat.`, [gEv(hi)], 6); }
  const eff = RS.filter((g) => g.FGA >= 20 && g.FGM / g.FGA >= 0.6); add("games", `Games shooting 60% or better on 20+ shots: ${eff.length} in the regular season.`, `Efficiency on volume, which the analytics crowd prizes.`, [], 5);
  const bestEff = [...RS].filter((g) => g.FGA >= 20).sort((a, b) => b.FGM / b.FGA - a.FGM / a.FGA)[0];
  add("games", `Best regular-season shooting night on 20+ attempts: ${bestEff.FGM}-${bestEff.FGA}, ${on(bestEff)}, for ${bestEff.PTS} points.`, `An efficiency outlier for a player often called a volume shooter.`, gEv(bestEff), 6);
  const zeroTO = RS.filter((g) => g.TOV === 0 && g.PTS >= 30); add("games", `30-point games without a turnover: ${zeroTO.length}.`, `Ball security at high usage surprises people.`, zeroTO.slice(0, 12).map(gEv), 5);
  // Milestones.
  let cum = 0; let mi = 0; const marks = [10000, 15000, 20000, 25000, 30000, 33000];
  RS.forEach((g, i) => { cum += g.PTS; while (mi < marks.length && cum >= marks[mi]) {
    add("milestone", `${LAST} reached ${c(marks[mi])} regular-season points in his ${ordinal(i + 1)} game, ${on(g)}${ageOn(g.date) ? `, at ${ageOn(g.date).replace(/, \d+ days old/, "")}` : ""}.`,
      marks[mi] >= 30000 ? `The 30K club is tiny; the date and game count make it trivia.` : `Games-to-milestone lines are easy to compare against any player fans bring up.`, gEv(g), marks[mi] >= 25000 ? 7 : 5); mi += 1; } });
  for (const bar of [30, 40, 50, 60]) { const i = RS.findIndex((g) => g.PTS >= bar); if (i < 0) continue; const g = RS[i];
    add("milestone", `His first ${bar}-point game came in his ${ordinal(i + 1)} NBA game: ${g.PTS}, ${on(g)}${ageOn(g.date) ? ` (${ageOn(g.date).replace(/, \d+ days old/, "")})` : ""}.`, `How long it took to arrive is a strong development story.`, gEv(g), 5); }
  // Calendar.
  const xmas = RS.filter((g) => g.date.getUTCMonth() === 11 && g.date.getUTCDate() === 25);
  if (xmas.length) add("games", `Christmas Day: ${xmas.length} games, ${d1(avg(xmas))} points a game, ${rec(xmas)}; high ${Math.max(...xmas.map((g) => g.PTS))}.`, `Post it on Christmas, the league's showcase day.`, xmas.map(gEv), 7);
  const openers = [...new Set(RS.map((g) => g.season))].map((s) => RS.find((g) => g.season === s));
  add("games", `In his first game of each of his ${openers.length} seasons he averaged ${d1(avg(openers))} points (${rec(openers)}).`, `Opening-week hook.`, [], 5);
  const MON = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const bm = MON.map((m, i) => ({ m, g: RS.filter((g) => g.date.getUTCMonth() === i) })).filter((x) => x.g.length >= 50).sort((a, b) => avg(b.g) - avg(a.g));
  add("games", `His best month: ${bm[0].m}, ${d1(avg(bm[0].g))} points a game; his lowest: ${bm[bm.length - 1].m}, ${d1(avg(bm[bm.length - 1].g))} (months with 50+ games).`, `Calendar content to post as that month begins.`, [], 4);
  const home = RS.filter((g) => g.home), road = RS.filter((g) => !g.home);
  add("games", `Home ${d1(avg(home))} points a game, road ${d1(avg(road))}.`, `Home/road splits settle "big-stage" arguments.`, [], 4);
  // Opponents.
  const byOpp = {}; for (const g of RS) (byOpp[g.opp] = byOpp[g.opp] || []).push(g);
  const oppList = Object.entries(byOpp).filter(([, a]) => a.length >= 20).map(([o, a]) => ({ o, a, v: avg(a), t: sum(a) }));
  const bestO = [...oppList].sort((a, b) => b.v - a.v)[0], worstO = [...oppList].sort((a, b) => a.v - b.v)[0], mostO = [...oppList].sort((a, b) => b.t - a.t)[0];
  add("opponents", `Highest scoring average against one opponent (20+ games): ${d1(bestO.v)} vs. ${city(bestO.o)} over ${bestO.a.length} games.`, `That fan base's nightmare; they engage.`, [], 6);
  add("opponents", `Lowest scoring average against one opponent (20+ games): ${d1(worstO.v)} vs. ${city(worstO.o)} over ${worstO.a.length} games.`, `The team that slowed him down gets to brag.`, [], 5);
  add("opponents", `Most regular-season points against one team: ${c(mostO.t)} vs. ${city(mostO.o)} in ${mostO.a.length} games.`, `A career-long rivalry measured in points.`, [], 5);
  const fifty = RS.filter((g) => g.PTS >= 50); const f50opp = [...new Set(fifty.map((g) => g.opp))];
  if (fifty.length) add("opponents", `He scored 50 against ${f50opp.length} different opponents.`, `Spread across the league, the 50-point games touch many fan bases.`, [], 5);
  // ========================================================== playoffs ==
  const S = series(PO); const years = [...new Set(PO.map((g) => g.y))];
  const titles = years.filter((y) => { const r = PO.filter((g) => g.y === y); return r[r.length - 1].W; });
  const finals = [];
  for (const y of years) { const ss = S.filter((s) => s.y === y); const lastS = ss[ss.length - 1]; if (titles.includes(y)) finals.push({ y, s: lastS, won: true }); }
  // A lost Finals is the last series of a run whose earlier rounds were won three times (four-round era).
  for (const y of years) { if (titles.includes(y)) continue; const ss = S.filter((s) => s.y === y); if (ss.length === 4 && ss.slice(0, 3).every((s) => s.g[s.g.length - 1].W)) finals.push({ y, s: ss[3], won: false }); }
  finals.sort((a, b) => a.y - b.y);
  add("finals", `${LAST} won ${titles.length} championship${titles.length === 1 ? "" : "s"}: ${titles.map((y) => label(y)).join(", ")}.`, `Rings are the first thing every GOAT debate cites.`, [], 9);
  if (finals.length) {
    const fg = finals.flatMap((f) => f.s.g);
    add("finals", `Finals appearances: ${finals.length} (${finals.filter((f) => f.won).length}-${finals.filter((f) => !f.won).length}) — ${finals.map((f) => `${label(f.y)} vs. ${city(f.s.opp)} (${f.won ? "won" : "lost"})`).join("; ")}.`, `A complete Finals résumé in one line; both the wins and losses spark replies.`, [], 8);
    add("finals", `In ${fg.length} Finals games he averaged ${d1(avg(fg))} points; he scored 30+ in ${fg.filter((g) => g.PTS >= 30).length} of them and 40+ in ${fg.filter((g) => g.PTS >= 40).length}.`, `Finals-only numbers are what legacy arguments turn on.`, [], 8);
    const fhi = [...fg].sort((a, b) => b.PTS - a.PTS)[0]; add("finals", `His Finals high: ${fhi.PTS} points, ${on(fhi)} (${fhi.WL}).`, `The biggest night on the biggest stage.`, gEv(fhi), 7);
    const clinchers = finals.filter((f) => f.won).map((f) => f.s.g[f.s.g.length - 1]);
    add("finals", `In his ${clinchers.length} title-clinching games he scored ${clinchers.map((g) => g.PTS).join(", ")}.`, `Closer content: what he did when the ring was on the line.`, clinchers.map(gEv), 7);
    const g7 = S.filter((s) => s.g.length === 7).map((s) => s.g[6]);
    if (g7.length) add("playoffs", `Game 7s: ${rec(g7)}, averaging ${d1(avg(g7))} points (${g7.map((g) => `${g.PTS} vs. ${city(g.opp)} ${g.y + 1}`).join("; ")}).`, `Game 7 résumés decide legacies in fans' minds.`, g7.map(gEv), 7);
  }
  const won = S.filter((s) => s.g[s.g.length - 1].W).length; add("playoffs", `Playoff series: ${won} won, ${S.length - won} lost.`, `The full postseason ledger.`, [], 6);
  const bestRun = years.map((y) => ({ y, g: PO.filter((g) => g.y === y) })).filter((x) => x.g.length >= 10).sort((a, b) => avg(b.g) - avg(a.g))[0];
  if (bestRun) add("playoffs", `His highest-scoring postseason (10+ games): ${d1(avg(bestRun.g))} points a game over ${bestRun.g.length} games in ${label(bestRun.y)}.`, `A peak run fans can compare with any star's best.`, [], 7);
  const po40 = PO.filter((g) => g.PTS >= 40); add("playoffs", `His teams went ${rec(po40)} in his 40-point playoff games.`, `Big playoff nights and results side by side.`, [], 5);
  const elim = S.filter((s) => !s.g[s.g.length - 1].W).map((s) => s.g[s.g.length - 1]);
  if (elim.length) add("playoffs", `In the ${elim.length} games that ended his seasons he averaged ${d1(avg(elim))} points.`, `How he played with his back to the wall.`, elim.map(gEv), 5);
  const swept = S.filter((s) => s.g.length >= 3 && s.g.every((g) => g.W)).length; add("playoffs", `His teams swept ${swept} playoff series (won every game of the series).`, `Dominance at the series level.`, [], 5);
  // ============================================================ seasons ==
  const CS = career.SeasonTotalsRegularSeason.filter((r) => r.TEAM_ABBREVIATION !== "TOT");
  const sv = CS.map((r) => ({ s: r.SEASON_ID, y: Number(r.SEASON_ID.slice(0, 4)), GP: r.GP, PTS: r.PTS, PPG: r.PTS / r.GP, RPG: r.REB / r.GP, APG: r.AST / r.GP, FG: r.FG_PCT, FG3M: r.FG3M, FTM: r.FTM }));
  const bestS = [...sv].sort((a, b) => b.PPG - a.PPG)[0]; add("season", `His best scoring season: ${d1(bestS.PPG)} points a game in ${bestS.s} — ${c(bestS.PTS)} points in ${bestS.GP} games.`, `The peak season; fans rank it against other all-time scoring years.`, [], 8);
  const s30 = sv.filter((x) => x.PPG >= 30); if (s30.length) add("season", `Seasons averaging 30: ${s30.length} — ${s30.map((x) => `${x.s} (${d1(x.PPG)})`).join(", ")}.`, `The 30-point club is the scorer's badge.`, [], 7);
  const s25 = sv.filter((x) => x.PPG >= 25); add("season", `Seasons averaging 25+: ${s25.length}.`, `Sustained elite scoring in one number.`, [], 6);
  const threes = [...sv].sort((a, b) => b.FG3M - a.FG3M)[0]; add("season", `His most threes in a season: ${threes.FG3M}, in ${threes.s}.`, `Then-vs-now three-point contrast.`, [], 4);
  const full = sv.filter((x) => x.GP >= 82).length; add("season", `Seasons playing all 82 games: ${full}.`, `Durability angle for load-management debates.`, [], 5);
  const lastS = sv[sv.length - 1]; add("season", `Final season, ${lastS.s}: ${d1(lastS.PPG)} points a game in ${lastS.GP} games.`, `Farewell-tour numbers; pairs with the last-game line.`, [], 5);
  const po1 = CS[0]; add("season", `Rookie season, ${po1.SEASON_ID}: ${d1(po1.PTS / po1.GP)} points in ${po1.GP} games${po1.GS != null ? ` (${po1.GS} starts)` : ""}.`, `Humble-beginnings contrast with what came later.`, [], 6);
  // League ranks each season (scoring titles; 70 games or 1,400 points through 2012-13, 58 games after).
  const titleRule = (y, r) => (y >= 2013 ? r.GP >= 58 : r.GP >= 70 || r.PTS >= 1400);
  const won2 = []; const top3 = [];
  for (const x of sv) { const q = season(x.y, "rs").filter((r) => titleRule(x.y, r)).sort((a, b) => b.PPG - a.PPG); const i = q.findIndex((r) => r.id === ID);
    if (i === 0) won2.push({ x, next: q[1] }); else if (i > 0 && i <= 2) top3.push({ x, i, lead: q[0] }); }
  if (won2.length) add("league", `Scoring titles: ${won2.length} — ${won2.map((w) => `${w.x.s} (${d1(w.x.PPG)}; runner-up ${w.next.name} ${d1(w.next.PPG)})`).join("; ")}.`, `Scoring crowns with the runner-up named; both fan bases engage.`, [], 8);
  if (top3.length) add("league", `Seasons finishing 2nd or 3rd in scoring: ${top3.length} — ${top3.map((t) => `${t.x.s} (${t.i + 1}${t.i === 1 ? "nd" : "rd"}, behind ${t.lead.name})`).join("; ")}.`, `Near-misses show how long he stayed at the top.`, [], 5);
  // All-time rank at retirement and now.
  const all = totals("rs", 1946, Y1).sort((a, b) => b.PTS - a.PTS); const ri = all.findIndex((r) => r.id === ID);
  add("league", `When he retired after ${label(Y1)}, ${ri === 0 ? "no one" : `only ${andList(all.slice(0, ri).map((r) => r.name))}`} had scored more regular-season points (${c(all[ri].PTS)}).`, `All-time rank at retirement is the legacy stat.`, all.slice(0, ri + 2), 9);
  const now = totals("rs", 1946, 2025).sort((a, b) => b.PTS - a.PTS); const ni = now.findIndex((r) => r.id === ID);
  if (ni !== ri) add("league", `Through 2025-26 he ranks ${ordinal(ni + 1)} in career regular-season points, passed since retiring by ${andList(now.slice(0, ni).filter((r) => !all.slice(0, ri).some((a) => a.id === r.id)).map((r) => r.name))}.`, `Where he stands today; the name that passed him starts the debate.`, now.slice(0, ni + 1), 7);
  // Era leaderboards over his career span.
  const T = totals("rs", Y0, Y1), TP = totals("po", Y0, Y1);
  for (const [arr, lab, k, nm] of [[T, "regular-season", "PTS", "points"], [T, "regular-season", "FGM", "field goals"], [T, "regular-season", "FTM", "free throws made"], [T, "regular-season", "MIN", "minutes"], [TP, "playoff", "PTS", "points"], [TP, "playoff", "FGM", "field goals"]]) {
    const l = [...arr].sort((a, b) => b[k] - a[k]); const i = l.findIndex((r) => r.id === ID); if (i < 0 || i > 2) continue;
    add("era", `${lab[0].toUpperCase() + lab.slice(1)} ${nm} ${SPAN}: ${i === 0 ? `${LAST} led the league with ${c(l[0][k])}; next ${l[1].name}, ${c(l[1][k])}` : `${LAST} ranked ${ordinal(i + 1)} with ${c(l[i][k])}, behind ${andList(l.slice(0, i).map((r) => `${r.name} (${c(r[k])})`))}`}.`,
      `Who owned his era, measured the simplest way.`, l.slice(0, 5), i === 0 ? 8 : 6);
  }
  // Teammates: 20-point seasons alongside him.
  const mates = {};
  for (const x of sv) { const rows = season(x.y, "rs"); const me = rows.find((r) => r.id === ID); if (!me || me.PPG < 20) continue;
    for (const r of rows) if (r.id !== ID && r.team === me.team && r.q && r.PPG >= 20) (mates[r.name] = mates[r.name] || []).push({ s: x.s, a: d1(me.PPG), b: d1(r.PPG) }); }
  for (const [nm, arr] of Object.entries(mates).sort((a, b) => b[1].length - a[1].length).slice(0, 2))
    add("teammates", `Seasons in which ${LAST} and ${nm} both averaged 20: ${arr.length} — ${arr.map((x) => `${x.s} (${x.a} and ${x.b})`).join(", ")}.`, `Duo content always travels; each season invites comparisons with today's pairs.`, [], 7);
  // Him vs. everyone else across his career span.
  const allRS = [], allPO = []; for (let y = Y0; y <= Y1; y += 1) { allRS.push(...season(y, "rs")); allPO.push(...season(y, "po")); }
  const vsField = (rows, f, what, why, score = 7) => { const m = rows.filter(f); const me = m.filter((r) => r.id === ID); const ot = m.filter((r) => r.id !== ID); if (!me.length) return;
    const names = [...new Set(ot.map((r) => r.name))];
    add("era", `${what} ${SPAN}: ${LAST} ${me.length} (${me.map((r) => label(r.season)).join(", ")}); everyone else combined ${ot.length}${ot.length && names.length <= 4 ? ` (${andList(names)})` : ""}.`, why, m.slice(0, 12), score); };
  vsField(allRS, (r) => r.q && r.PPG >= 30, "Seasons averaging 30", `"Him vs. the league" framing; the count against the field is the post.`, 8);
  vsField(allRS, (r) => r.PTS >= 2400, "2,400-point seasons", `Raw scoring volume across two decades of rivals.`, 7);
  vsField(allRS, (r) => r.q && r.PPG >= 35, "Seasons averaging 35", `The rarest scoring air of his era.`, 8);
  vsField(allPO, (r) => r.GP >= 10 && r.PPG >= 30, "Postseasons of 10+ games averaging 30", `Big-game scoring against his era's best.`, 7);
  vsField(allPO, (r) => r.PTS >= 600, "600-point postseasons", `Deep playoff runs with heavy scoring.`, 7);
  // More game-log angles.
  const bySeason40 = {}; for (const g of RS.filter((g) => g.PTS >= 40)) bySeason40[g.season] = (bySeason40[g.season] || 0) + 1;
  const b40 = Object.entries(bySeason40).sort((a, b) => b[1] - a[1]);
  if (b40.length) add("season", `Most 40-point games in a season: ${b40[0][1]}, in ${b40[0][0]}.`, `A single-season scoring binge fans can compare with anyone's.`, [], 7);
  const mkey = (g) => `${g.date.getUTCFullYear()}-${g.date.getUTCMonth()}`; const months = {}; for (const g of RS) (months[mkey(g)] = months[mkey(g)] || []).push(g);
  const mm = Object.values(months).filter((a) => a.length >= 8).sort((a, b) => avg(b) - avg(a))[0];
  add("season", `His hottest calendar month: ${MON[mm[0].date.getUTCMonth()]} ${mm[0].date.getUTCFullYear()}, ${d1(avg(mm))} points a game over ${mm.length} games.`, `A specific hot stretch fans remember; post it when that month comes around.`, mm.map(gEv), 7);
  const bestSeries = S.filter((x) => x.g.length >= 4).sort((a, b) => avg(b.g) - avg(a.g))[0];
  add("playoffs", `His highest-scoring playoff series: ${d1(avg(bestSeries.g))} points a game against ${city(bestSeries.opp)} in ${label(bestSeries.y)} (${bestSeries.g[bestSeries.g.length - 1].W ? "won" : "lost"} in ${bestSeries.g.length}).`, `A peak series against a named opponent draws that fan base in.`, bestSeries.g.map(gEv), 7);
  const pOpp = {}; for (const x of S) (pOpp[x.opp] = pOpp[x.opp] || []).push(x);
  const freq = Object.entries(pOpp).sort((a, b) => b[1].flatMap((x) => x.g).length - a[1].flatMap((x) => x.g).length)[0];
  const fg2 = freq[1].flatMap((x) => x.g); add("opponents", `Most frequent playoff opponent: ${city(freq[0])}, ${freq[1].length} series (${freq[1].filter((x) => x.g[x.g.length - 1].W).length} won), ${fg2.length} games, ${d1(avg(fg2))} points a game.`, `The defining playoff rivalry of his career, in numbers.`, [], 7);
  const b2b = RS.filter((g, i) => i > 0 && (g.date - RS[i - 1].date) / 86400000 === 1);
  add("games", `On the second night of back-to-backs he averaged ${d1(avg(b2b))} points over ${b2b.length} games.`, `A durability number for the load-management era.`, [], 5);
  const hh = [...home].sort((a, b) => b.PTS - a.PTS)[0], rh = [...road].sort((a, b) => b.PTS - a.PTS)[0];
  add("games", `Road career high: ${rh.PTS}, ${on(rh)}.`, `The best road show of his career; that home crowd remembers.`, gEv(rh), 6);
  const dd = RS.filter((g) => [g.PTS, g.REB, g.AST].filter((v) => v >= 10).length >= 2); add("games", `Regular-season double-doubles: ${dd.length}.`, `A quiz number fans usually guess wrong.`, [], 4);
  const s2000 = sv.filter((x) => x.PTS >= 2000); add("season", `2,000-point seasons: ${s2000.length}.`, `Round-number seasons are easy to compare.`, [], 5);
  const pa = [...PO].sort((a, b) => b.AST - a.AST)[0]; add("playoffs", `Playoff career high in assists: ${pa.AST}, ${on(pa)}.`, `The playmaker side on the biggest stage.`, gEv(pa), 4);
  const loss40 = RS.filter((g) => g.PTS >= 40 && !g.W); add("games", `40-point games in losses: ${loss40.length}.`, `Carrying a team that still lost; sympathy and debate in one.`, [], 5);
  // ====================================================== vs. Jordan ==
  if (slug !== "mj" && fs.existsSync(path.join(DATA, "mj"))) {
    const MG = loadGames(path.join(DATA, "mj")); const MRS = MG.filter((g) => g.type === "rs"), MPO = MG.filter((g) => g.type === "po");
    const pair = (lab, a, b, why, score = 8) => add("vs-mj", `${lab}: ${LAST} ${a}, Jordan ${b}.`, why, [], score);
    pair("40-point regular-season games", RS.filter((g) => g.PTS >= 40).length, MRS.filter((g) => g.PTS >= 40).length, `The comparison fans argue about most, settled with a count.`, 9);
    pair("50-point regular-season games", RS.filter((g) => g.PTS >= 50).length, MRS.filter((g) => g.PTS >= 50).length, `Fifty-point games, head to head; guaranteed replies from both camps.`, 9);
    pair("60-point regular-season games", RS.filter((g) => g.PTS >= 60).length, MRS.filter((g) => g.PTS >= 60).length, `The rarest scoring nights, compared directly.`, 8);
    pair("Career high", `${Math.max(...RS.map((g) => g.PTS))}`, `${Math.max(...MRS.map((g) => g.PTS))}`, `Ceiling vs. ceiling.`, 7);
    pair("Regular-season scoring average", d1(avg(RS)), d1(avg(MRS)), `The headline number in every Kobe-vs-MJ debate.`, 8);
    pair("Playoff scoring average", d1(avg(PO)), d1(avg(MPO)), `Playoff scoring is where the debate is decided for many fans.`, 8);
    pair("Playoff games", PO.length, MPO.length, `Longevity in the postseason, a point for the Kobe side.`, 6);
    pair("Titles (derived from playoff results)", titles.length, [...new Set(MPO.map((g) => g.y))].filter((y) => { const r = MPO.filter((g) => g.y === y); return r[r.length - 1].W; }).length, `Rings, the first argument in any GOAT thread.`, 8);
    pair("Regular-season points", c(sum(RS)), c(sum(MRS)), `Raw career volume, a point for longevity.`, 7);
    pair("Double-figure games in a row", c(r10.n), c(runs(MRS, (g) => g.PTS >= 10).n), `Consistency head to head.`, 6);
    const kIdx = (arr, n) => { let s = 0; for (let i = 0; i < arr.length; i += 1) { s += arr[i].PTS; if (s >= n) return i + 1; } return null; };
    const k25 = kIdx(RS, 25000), m25 = kIdx(MRS, 25000); if (k25 && m25) pair("Games to 25,000 points", c(k25), c(m25), `Pace to a milestone, the fairest way to compare scorers.`, 7);
    const kFg = RS.filter((g) => g.FGA >= 20 && g.FGM / g.FGA >= 0.6).length, mFg = MRS.filter((g) => g.FGA >= 20 && g.FGM / g.FGA >= 0.6).length;
    pair("Games shooting 60%+ on 20+ shots", kFg, mFg, `Efficiency head to head, where the debate gets heated.`, 7);
  }
  facts.sort((a, b) => b.score - a.score);
  const out = facts.slice(0, 100).map((f, i) => ({ n: i + 1, ...f }));
  const doc = { subject: FULL, facts: out, candidates: facts.length, counts: { regularSeasonGames: RS.length, playoffGames: PO.length },
    method: [`${FULL}: every line is computed from stats.nba.com — his career feed, every game he played, and every NBA player-season for league comparisons. Titles and Finals are derived from his playoff game logs. Nothing typed in from memory.`,
      "Scoring titles use the rule of each season (70 games or 1,400 points through 2012-13; 58 games after). 'Why' notes are editorial: why the line should work as a post."],
    generatedAt: new Date().toISOString() };
  fs.writeFileSync(path.join(DATA, "facts", slug === "mj" ? "mj-player-test.json" : `${slug}-facts.json`), JSON.stringify(doc, null, 1)); // never overwrite the hand-built mj-facts.json
  console.log(`${FULL}: ${out.length}/100 from ${facts.length} candidates`);
}
main();
