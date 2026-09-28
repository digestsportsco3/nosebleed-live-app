#!/usr/bin/env node
// Decade leaders, computed from complete season pulls — never from memory.
//
// WHY THIS EXISTS: Nick asked for "100 stats from the 1990s, 100 from the
// 1980s ..." and for every one to be true. The daily pipeline earns that trust
// by computing every claim across a COMPLETE pull rather than sampling or
// recalling. This module extends the same discipline backwards: for every
// season in a decade it pulls every hitter and every pitcher from the MLB
// Stats API (the official record, which carries season data back to 1876),
// then computes the league leader in each category mechanically. Ten seasons
// times ten categories is the hundred facts per decade, and each traces to a
// row in a saved pull.
//
// WHAT IS COMMITTED: only the compact per-decade summary (leaders plus the top
// five behind each leader as provenance). The raw pulls are ~2 MB per season
// and go to a gitignored folder. A hundred seasons of raw JSON does not belong
// in a repository; the summary is enough to re-derive any claim.
//
// QUALIFICATION: batting-average style rates need 3.1 plate appearances per
// team game and ERA style rates need one inning per team game — the modern
// rule, applied to every era with that season's own team-game count taken
// from the standings, so a 154-game 1927 or a strike-shortened 1981 gets the
// right bar. The rule used is written into the summary for every season.
//
// Usage:
//   node statdesk/decades.js 1990 1980            # summaries only
//   node statdesk/decades.js --commit 1920 1930   # and commit + push
//   DECADES=1990,2000 node statdesk/decades.js --commit
"use strict";
const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const BASE = "https://statsapi.mlb.com/api/v1";
const repo = path.join(__dirname, "..");
const outDir = path.join(__dirname, "data", "decades");
const rawDir = path.join(outDir, "raw"); // gitignored
fs.mkdirSync(rawDir, { recursive: true });

// ---------------------------------------------------------------- helpers --
const num = (x) => { if (x === undefined || x === null || x === "") return null; const n = Number(x); return Number.isFinite(n) ? n : null; };
// "312.2" is 312 and two thirds. Compare innings as outs, never as decimals.
const outs = (ipStr) => { const n = num(ipStr); if (n == null) return null; const w = Math.floor(n); const f = Math.round((n - w) * 10); return w * 3 + f; };
const ipStrFromOuts = (o) => `${Math.floor(o / 3)}.${o % 3}`;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function getJson(url, label, tries = 4) {
  let last;
  for (let i = 1; i <= tries; i += 1) {
    try {
      const res = await fetch(url, { headers: { "User-Agent": "nosebleed-statdesk/0.1", Accept: "application/json" } });
      if (!res.ok) { last = new Error(`HTTP ${res.status} for ${label}`); if (res.status >= 500) { await sleep(600 * 2 ** i); continue; } throw last; }
      return await res.json();
    } catch (e) { last = e; await sleep(600 * 2 ** i); }
  }
  throw last;
}

function splits(json) { const o = []; for (const b of (json && json.stats) || []) for (const s of b.splits || []) o.push(s); return o; }

// The season endpoint gives one row per player per team. A traded player has
// several rows; the one with the most playing time is his combined line when
// the API supplies one, otherwise his biggest stint. Either way we keep one
// row per player id — the daily pipeline learned the hard way that names are
// not unique, so everything here keys on id.
function onePerPlayer(rows, sizeKey) {
  const best = new Map();
  for (const sp of rows) {
    const id = sp.player && sp.player.id; if (!id) continue;
    const size = sizeKey === "outs" ? outs(sp.stat.inningsPitched) || 0 : num(sp.stat.plateAppearances) || 0;
    const cur = best.get(id);
    if (!cur || size > cur.size) best.set(id, { sp, size, teams: cur ? cur.teams + 1 : 1 });
    else cur.teams += 1;
  }
  return [...best.values()];
}

// A few historical rows carry no fullName at all; one crashed the 1932 pull.
const pname = (sp) => (sp.player && (sp.player.fullName || sp.player.name)) || `player #${sp.player && sp.player.id}`;
const lg = (sp) => (sp.league && sp.league.name) || "unknown";

function who(entry) {
  const sp = entry.sp;
  const team = sp.team && sp.team.name ? sp.team.name : (entry.teams > 1 ? "multiple teams" : "unknown team");
  return { id: sp.player.id, name: pname(sp), team, league: lg(sp), teams: entry.teams };
}

// ------------------------------------------------------------ categories --
// value(): numeric for ranking. show(): the printed form. q: needs qualification.
const HIT = {
  HR:  { label: "Home runs",        value: (s) => num(s.homeRuns),        show: (v) => String(v) },
  AVG: { label: "Batting average",  value: (s) => num(s.avg),             show: (v) => v.toFixed(3).replace(/^0/, ""), q: true },
  RBI: { label: "Runs batted in",   value: (s) => num(s.rbi),             show: (v) => String(v) },
  H:   { label: "Hits",             value: (s) => num(s.hits),            show: (v) => String(v) },
  SB:  { label: "Stolen bases",     value: (s) => num(s.stolenBases),     show: (v) => String(v) },
  R:   { label: "Runs",             value: (s) => num(s.runs),            show: (v) => String(v) },
  "2B":{ label: "Doubles",          value: (s) => num(s.doubles),         show: (v) => String(v) },
  "3B":{ label: "Triples",          value: (s) => num(s.triples),         show: (v) => String(v) },
  BB:  { label: "Walks",            value: (s) => num(s.baseOnBalls),     show: (v) => String(v) },
  OPS: { label: "OPS",              value: (s) => num(s.ops),             show: (v) => v.toFixed(3).replace(/^0/, ""), q: true },
  OBP: { label: "On-base pct",      value: (s) => num(s.obp),             show: (v) => v.toFixed(3).replace(/^0/, ""), q: true },
  SLG: { label: "Slugging",         value: (s) => num(s.slg),             show: (v) => v.toFixed(3).replace(/^0/, ""), q: true },
  TB:  { label: "Total bases",      value: (s) => num(s.totalBases),      show: (v) => String(v) },
};
const PIT = {
  W:   { label: "Wins",             value: (s) => num(s.wins),            show: (v) => String(v) },
  ERA: { label: "ERA",              value: (s) => num(s.era),             show: (v) => v.toFixed(2), q: true, low: true },
  SO:  { label: "Strikeouts",       value: (s) => num(s.strikeOuts),      show: (v) => String(v) },
  IP:  { label: "Innings pitched",  value: (s) => outs(s.inningsPitched), show: (v) => ipStrFromOuts(v) },
  SV:  { label: "Saves",            value: (s) => num(s.saves),           show: (v) => String(v) },
  SHO: { label: "Shutouts",         value: (s) => num(s.shutouts),        show: (v) => String(v) },
  CG:  { label: "Complete games",   value: (s) => num(s.completeGames),   show: (v) => String(v) },
  WHIP:{ label: "WHIP",             value: (s) => num(s.whip),            show: (v) => v.toFixed(2), q: true, low: true },
  L:   { label: "Losses",           value: (s) => num(s.losses),          show: (v) => String(v) },
};

function leaders(entries, cat, qualifies) {
  const rows = [];
  for (const e of entries) {
    const v = cat.value(e.sp.stat);
    if (v == null) continue;
    if (cat.q && !qualifies(e.sp.stat, lg(e.sp))) continue;
    rows.push({ ...who(e), value: v, shown: cat.show(v) });
  }
  rows.sort((a, b) => (cat.low ? a.value - b.value : b.value - a.value) || String(a.name).localeCompare(String(b.name)));
  if (!rows.length) return { leaders: [], top5: [], considered: 0 };
  const top = rows[0].value;
  return { leaders: rows.filter((r) => r.value === top), top5: rows.slice(0, 5), considered: rows.length };
}

// ------------------------------------------------------------ one season --
async function pullSeason(season) {
  const hitUrl = `${BASE}/stats?stats=season&group=hitting&season=${season}&sportId=1&playerPool=All&limit=5000`;
  const pitUrl = `${BASE}/stats?stats=season&group=pitching&season=${season}&sportId=1&playerPool=All&limit=5000`;
  const stUrl  = `${BASE}/standings?leagueId=103,104&season=${season}&standingsTypes=regularSeason`;
  const ts = new Date().toISOString();
  const [hit, pit] = await Promise.all([getJson(hitUrl, `${season} hitting`), getJson(pitUrl, `${season} pitching`)]);
  let standings = null;
  try { standings = await getJson(stUrl, `${season} standings`); } catch (e) { standings = { error: String(e.message) }; }
  for (const [name, body] of [["hit", hit], ["pit", pit], ["standings", standings]]) {
    fs.writeFileSync(path.join(rawDir, `${season}-${name}.json`), JSON.stringify({ ts, season, body }));
  }

  const majorsOnly = process.argv.includes("--al-nl-only") || process.env.AL_NL_ONLY === "true";
  const keep = (sp) => !majorsOnly || lg(sp) === "AL" || lg(sp) === "NL" || lg(sp) === "American League" || lg(sp) === "National League";
  const hitters = onePerPlayer(splits(hit).filter(keep), "pa");
  const pitchers = onePerPlayer(splits(pit).filter(keep), "outs");

  // Qualification is PER LEAGUE, on that league's own schedule. The official
  // record has included Negro League seasons since 2024, and those clubs
  // played sixty to ninety games: a single 154-game bar would silently
  // disqualify every one of their hitters, and the record's own 1943 batting
  // leader (Josh Gibson, .466) with them. This is how MLB's leaderboards do
  // it. AL/NL team games come from the standings, capped at the scheduled
  // length so replayed ties do not push the bar above 154 or 162; any other
  // league uses the most games any of its hitters played.
  // AL went to 162 games in 1961, the NL in 1962.
  const nlScheduled = season < 1962 ? 154 : 162;
  const alScheduled = season < 1961 ? 154 : 162;
  const recs = { AL: [], NL: [] };
  // The league id sits on each division record, not on the team rows.
  for (const d of (standings && standings.records) || []) {
    const lid = d.league && d.league.id;
    const league = lid === 103 ? "AL" : lid === 104 ? "NL" : null;
    for (const t of d.teamRecords || []) {
      const g = num(t.gamesPlayed);
      if (g && league) recs[league].push(g);
      else if (g) { recs.AL.push(g); recs.NL.push(g); }
    }
  }
  const leagueGames = {}; const basis = {};
  const hitterMaxByLeague = {};
  for (const e of hitters) { const L = lg(e.sp); hitterMaxByLeague[L] = Math.max(hitterMaxByLeague[L] || 0, num(e.sp.stat.gamesPlayed) || 0); }
  for (const L of new Set([...Object.keys(hitterMaxByLeague), ...pitchers.map((e) => lg(e.sp))])) {
    if ((L === "AL" || L === "NL") && recs[L].length) {
      const sched = L === "AL" ? alScheduled : nlScheduled;
      leagueGames[L] = Math.min(Math.max(...recs[L]), sched); basis[L] = `standings, capped at the ${sched}-game schedule`;
    } else { leagueGames[L] = hitterMaxByLeague[L] || Math.max(...Object.values(hitterMaxByLeague)); basis[L] = "most games played by any hitter in the league"; }
  }
  const teamGames = leagueGames.AL || leagueGames.NL || Math.max(...Object.values(leagueGames));
  const teamGamesBasis = Object.entries(basis).map(([L, b]) => `${L}: ${leagueGames[L]} (${b})`).join("; ");
  const qHit = (s, L) => (num(s.plateAppearances) || 0) >= Math.ceil(3.1 * leagueGames[L]);
  const qPit = (s, L) => (outs(s.inningsPitched) || 0) >= leagueGames[L] * 3;

  const leagues = new Set();
  for (const e of [...hitters, ...pitchers]) if (e.sp.league && e.sp.league.name) leagues.add(e.sp.league.name);

  const out = { season, pulledAt: ts, sources: { hitting: hitUrl, pitching: pitUrl, standings: stUrl },
    counts: { hitters: hitters.length, pitchers: pitchers.length },
    teamGames, teamGamesBasis, leagueGames,
    qualification: { rule: "per league: PA >= 3.1 x that league's team games; IP >= 1 x that league's team games",
                     hitting: Object.entries(leagueGames).map(([L, g]) => `${L}: PA >= ${Math.ceil(3.1 * g)}`).join("; "),
                     pitching: Object.entries(leagueGames).map(([L, g]) => `${L}: IP >= ${g}`).join("; ") },
    leagues: [...leagues].sort(), hitting: {}, pitching: {} };
  for (const [k, cat] of Object.entries(HIT)) out.hitting[k] = leaders(hitters, cat, qHit);
  for (const [k, cat] of Object.entries(PIT)) out.pitching[k] = leaders(pitchers, cat, qPit);
  // Per-player rows for the decade: totals, streaks, and the fact rules all
  // read these. Kept in memory for the decade and dropped before the summary
  // is written; the facts file stores the rows that back each fact.
  const H = (e) => { const s = e.sp.stat; return {
    id: e.sp.player.id, name: pname(e.sp), team: who(e).team, teamId: e.sp.team && e.sp.team.id, league: lg(e.sp), teams: Math.max(e.teams, num(e.sp.numTeams) || 1), age: num(s.age),
    G: num(s.gamesPlayed) || 0, PA: num(s.plateAppearances) || 0, AB: num(s.atBats) || 0, H: num(s.hits) || 0, "2B": num(s.doubles) || 0, "3B": num(s.triples) || 0,
    HR: num(s.homeRuns) || 0, R: num(s.runs) || 0, RBI: num(s.rbi) || 0, SB: num(s.stolenBases) || 0, CS: num(s.caughtStealing), BB: num(s.baseOnBalls) || 0,
    IBB: num(s.intentionalWalks) || 0, SO: num(s.strikeOuts) || 0, HBP: num(s.hitByPitch) || 0, SF: num(s.sacFlies) || 0, GIDP: num(s.groundIntoDoublePlay) || 0,
    AVG: num(s.avg) || 0, OBP: num(s.obp) || 0, SLG: num(s.slg) || 0, OPS: num(s.ops) || 0, TB: num(s.totalBases) || 0 }; };
  const P = (e) => { const s = e.sp.stat; const o = outs(s.inningsPitched) || 0; return {
    id: e.sp.player.id, name: pname(e.sp), team: who(e).team, teamId: e.sp.team && e.sp.team.id, league: lg(e.sp), teams: Math.max(e.teams, num(e.sp.numTeams) || 1), age: num(s.age),
    G: num(s.gamesPlayed) || 0, GS: num(s.gamesStarted) || 0, CG: num(s.completeGames) || 0, SHO: num(s.shutouts) || 0, W: num(s.wins) || 0, L: num(s.losses) || 0,
    SV: num(s.saves) || 0, OUTS: o, H: num(s.hits) || 0, ER: num(s.earnedRuns) || 0, R: num(s.runs) || 0, HRA: num(s.homeRuns), BB: num(s.baseOnBalls) || 0,
    IBB: num(s.intentionalWalks) || 0, SO: num(s.strikeOuts) || 0, HBP: num(s.hitBatsmen) || 0, WP: num(s.wildPitches) || 0,
    ERA: num(s.era), WHIP: num(s.whip), K9: o ? (num(s.strikeOuts) || 0) * 27 / o : 0, BF: num(s.battersFaced) || 0 }; };
  out._players = { hitting: hitters.map(H), pitching: pitchers.map(P) };
  // Team rows from the standings, for club-level facts.
  out._standings = [];
  for (const d of (standings && standings.records) || []) for (const t of d.teamRecords || []) {
    out._standings.push({ id: t.team && t.team.id, name: t.team && t.team.name, wins: num(t.wins), losses: num(t.losses),
      runsScored: num(t.runsScored), runsAllowed: num(t.runsAllowed), runDifferential: num(t.runDifferential), leagueRank: num(t.leagueRank) });
  }
  return out;
}

// ------------------------------------------------------------- a decade --
function decadeTotals(seasons) {
  const sumBy = (group, keys) => {
    const acc = new Map();
    for (const s of seasons) for (const p of s._players[group]) {
      const a = acc.get(p.id) || { id: p.id, name: p.name, teams: new Set(), seasons: 0 };
      for (const k of keys) a[k] = (a[k] || 0) + (p[k] || 0);
      a.teams.add(p.team); a.seasons += 1; acc.set(p.id, a);
    }
    return [...acc.values()].map((a) => ({ ...a, teams: [...a.teams] }));
  };
  const hit = sumBy("hitting", ["HR", "H", "RBI", "SB", "R", "BB", "2B", "3B", "PA"]);
  const pit = sumBy("pitching", ["W", "L", "SO", "SV", "SHO", "CG", "OUTS", "ER"]);
  const top = (arr, k, n = 10, low = false) => arr.filter((a) => a[k] != null).sort((a, b) => (low ? a[k] - b[k] : b[k] - a[k]) || String(a.name).localeCompare(String(b.name))).slice(0, n).map((a) => ({ id: a.id, name: a.name, teams: a.teams, seasons: a.seasons, value: a[k] }));
  const totals = { hitting: {}, pitching: {} };
  for (const k of ["HR", "H", "RBI", "SB", "R", "BB", "2B", "3B"]) totals.hitting[k] = top(hit, k);
  for (const k of ["W", "L", "SO", "SV", "SHO", "CG", "OUTS"]) totals.pitching[k] = top(pit, k);
  // Decade ERA over a meaningful workload: at least 1000 innings in the decade.
  const eraRows = pit.filter((a) => a.OUTS >= 3000).map((a) => ({ id: a.id, name: a.name, teams: a.teams, seasons: a.seasons, value: Math.round((a.ER * 27 / a.OUTS) * 100) / 100, innings: ipStrFromOuts(a.OUTS) }));
  totals.pitching.ERA_1000IP = eraRows.sort((a, b) => a.value - b.value).slice(0, 10);
  return totals;
}

async function runDecade(start) {
  const seasons = [];
  for (let y = start; y < start + 10; y += 1) {
    process.stdout.write(`  ${y} ... `);
    const s = await pullSeason(y);
    console.log(`${s.counts.hitters} hitters, ${s.counts.pitchers} pitchers, ${s.teamGames} team games${s.leagues.length > 2 ? ` [leagues: ${s.leagues.join(", ")}]` : ""}`);
    seasons.push(s);
    await sleep(300); // be polite; there is no rush
  }
  const totals = decadeTotals(seasons);

  // The post-ready facts: the whole point of the exercise. Built while the
  // full rows are still in memory, written to their own file with the rows
  // that back every line.
  const { buildFacts } = require("./facts");
  const factsOut = buildFacts({ decade: start, seasons: seasons.map((s) => ({ season: s.season, hitters: s._players.hitting, pitchers: s._players.pitching, standings: s._standings })) });
  factsOut.generatedAt = new Date().toISOString();
  factsOut.sources = seasons.map((s) => ({ season: s.season, ...s.sources, pulledAt: s.pulledAt }));
  fs.writeFileSync(path.join(outDir, `${start}s-facts.json`), JSON.stringify(factsOut, null, 1));
  console.log(`  facts: ${factsOut.facts.length} selected from ${factsOut.candidates} candidates`);

  for (const s of seasons) { delete s._players; delete s._standings; }
  const summary = {
    decade: `${start}s`, generatedAt: new Date().toISOString(),
    method: [
      "Every hitter and every pitcher for every season was pulled from the MLB Stats API (statsapi.mlb.com), the official record; leaders were computed across the complete pull, never sampled or recalled.",
      "Rate categories (AVG, OBP, SLG, OPS, ERA, WHIP) use the modern qualification rule applied to each season's own team-game count: 3.1 PA per team game for hitters, one inning per team game for pitchers.",
      "Ties for a lead are all listed. A traded player's line is the API's combined row where supplied, otherwise his largest single stint, and is marked 'multiple teams'.",
      "Saves before 1969 are retroactively computed by the record keepers, not an official statistic of the time. Shutouts are shown for those decades instead.",
      "Qualification is applied per league on that league's own schedule, which is how MLB's leaderboards handle the Negro League seasons (1920-1948) the official record has included since 2024. Seasons with such play are flagged, and their leaders appear as MLB now lists them" + (process.argv.includes("--al-nl-only") || process.env.AL_NL_ONLY === "true" ? " — EXCEPT that this file was built with --al-nl-only, which restricts every season to AL and NL rows." : "."),
    ],
    seasons, totals,
  };
  const file = path.join(outDir, `${start}s.json`);
  fs.writeFileSync(file, JSON.stringify(summary, null, 1));
  return file;
}

// ------------------------------------------------------------------ main --
async function main() {
  const argv = process.argv.slice(2);
  const commit = argv.includes("--commit");
  let decades = argv.filter((a) => /^\d{4}$/.test(a)).map(Number);
  if (!decades.length && process.env.DECADES) decades = process.env.DECADES.split(/[,\s]+/).filter(Boolean).map(Number);
  if (!decades.length) { console.error("Usage: node statdesk/decades.js [--commit] 1990 1980 ...   (or DECADES=1990,1980)"); process.exit(2); }

  const written = [];
  for (const d of decades) {
    console.log(`\n${d}s`);
    written.push(await runDecade(d));
  }
  console.log(`\nWrote ${written.length} summar${written.length === 1 ? "y" : "ies"}:\n  ${written.map((f) => path.relative(repo, f)).join("\n  ")}`);

  if (!commit) return;
  const git = (...a) => { const r = spawnSync("git", a, { cwd: repo, encoding: "utf8" }); return { code: r.status, out: (r.stdout || "") + (r.stderr || "") }; };
  git("config", "user.name", "statdesk-bot"); git("config", "user.email", "noreply@anthropic.com");
  git("add", "statdesk/data/decades");
  if (git("diff", "--cached", "--quiet").code === 0) { console.log("[decades] nothing to commit"); return; }
  console.log(git("commit", "-m", `Stat Desk decades: ${decades.map((d) => d + "s").join(", ")}`).out.trim());
  const branch = process.env.GITHUB_REF_NAME || "main";
  for (let i = 1; i <= 3; i += 1) {
    const pull = git("pull", "--rebase", "origin", branch);
    if (pull.code !== 0) { console.log(`[decades] pull ${i} failed:\n${pull.out}`); await sleep(i * 5000); continue; }
    const push = git("push", "origin", `HEAD:${branch}`);
    if (push.code === 0) { console.log(`[decades] pushed ${git("rev-parse", "--short", "HEAD").out.trim()}`); return; }
    console.log(`[decades] push ${i} failed:\n${push.out}`); await sleep(i * 5000);
  }
  console.error("[decades] could not push after 3 attempts"); process.exitCode = 1;
}

main().catch((e) => { console.error(e.stack || e.message); process.exit(1); });
