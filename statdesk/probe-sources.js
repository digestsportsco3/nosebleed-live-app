#!/usr/bin/env node
// Which data sources can this runner actually reach, and how far back do they go?
//
// Before building NBA / NFL / college decade facts, find out what exists.
// The MLB version rests on one free, complete, official record back to 1876.
// The other sports may not have one, and the answer decides what can be
// promised. This probes each candidate from the runner it executes on and
// records status, size, row counts and the shape of the first row. It pulls
// nothing into the pipeline and claims nothing; it only measures.
//
//   node statdesk/probe-sources.js            # writes statdesk/data/probe/<date>-<runner>.json
"use strict";
const fs = require("fs");
const path = require("path");

const NBA_HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
  Accept: "application/json, text/plain, */*",
  Referer: "https://www.nba.com/",
  Origin: "https://www.nba.com",
  "x-nba-stats-origin": "stats",
  "x-nba-stats-token": "true",
};
const UA = { "User-Agent": "Mozilla/5.0 (compatible; nosebleed-statdesk/0.1)", Accept: "application/json, text/csv, */*" };
const NBA = "https://stats.nba.com/stats";
const LL = (season) => `${NBA}/leagueleaders?LeagueID=00&PerMode=Totals&Scope=S&Season=${season}&SeasonType=Regular%20Season&StatCategory=PTS&ActiveFlag=`;
const ESPN_BY = (sport, league, season) => `https://site.web.api.espn.com/apis/common/v3/sports/${sport}/${league}/statistics/byathlete?region=us&lang=en&contentorigin=espn&isqualified=false&limit=50&season=${season}&seasontype=2`;

const PROBES = [
  // --- NBA: official stats site ---
  { sport: "NBA", label: "leagueleaders 1946-47 (first BAA season)", url: LL("1946-47"), headers: NBA_HEADERS },
  { sport: "NBA", label: "leagueleaders 1965-66", url: LL("1965-66"), headers: NBA_HEADERS },
  { sport: "NBA", label: "leagueleaders 1986-87", url: LL("1986-87"), headers: NBA_HEADERS },
  { sport: "NBA", label: "leagueleaders 2024-25", url: LL("2024-25"), headers: NBA_HEADERS },
  { sport: "NBA", label: "leaguedashplayerstats 1986-87", url: `${NBA}/leaguedashplayerstats?LeagueID=00&MeasureType=Base&PerMode=Totals&Season=1986-87&SeasonType=Regular%20Season&PlusMinus=N&PaceAdjust=N&Rank=N&LastNGames=0&Month=0&OpponentTeamID=0&Period=0&DateFrom=&DateTo=&GameScope=&GameSegment=&Location=&Outcome=&PlayerExperience=&PlayerPosition=&SeasonSegment=&StarterBench=&TeamID=0&VsConference=&VsDivision=`, headers: NBA_HEADERS },
  { sport: "NBA", label: "commonallplayers (every player ever)", url: `${NBA}/commonallplayers?LeagueID=00&IsOnlyCurrentSeason=0&Season=2024-25`, headers: NBA_HEADERS },
  { sport: "MJ", label: "playercareerstats Michael Jordan", url: `${NBA}/playercareerstats?PlayerID=893&PerMode=Totals&LeagueID=00`, headers: NBA_HEADERS },
  { sport: "MJ", label: "playergamelog Jordan 1986-87", url: `${NBA}/playergamelog?PlayerID=893&Season=1986-87&SeasonType=Regular%20Season&LeagueID=00`, headers: NBA_HEADERS },
  { sport: "MJ", label: "playergamelog Jordan 1984-85 (rookie)", url: `${NBA}/playergamelog?PlayerID=893&Season=1984-85&SeasonType=Regular%20Season&LeagueID=00`, headers: NBA_HEADERS },
  { sport: "MJ", label: "playergamelog Jordan 1990-91 playoffs", url: `${NBA}/playergamelog?PlayerID=893&Season=1990-91&SeasonType=Playoffs&LeagueID=00`, headers: NBA_HEADERS },
  // --- NFL ---
  { sport: "NFL", label: "nflverse releases: stats_player", url: "https://api.github.com/repos/nflverse/nflverse-data/releases/tags/stats_player", headers: UA },
  { sport: "NFL", label: "nflverse releases: player_stats", url: "https://api.github.com/repos/nflverse/nflverse-data/releases/tags/player_stats", headers: UA },
  { sport: "NFL", label: "ESPN byathlete NFL 1975", url: ESPN_BY("football", "nfl", 1975), headers: UA },
  { sport: "NFL", label: "ESPN byathlete NFL 1990", url: ESPN_BY("football", "nfl", 1990), headers: UA },
  { sport: "NFL", label: "ESPN byathlete NFL 2005", url: ESPN_BY("football", "nfl", 2005), headers: UA },
  { sport: "NFL", label: "ESPN core leaders NFL 1985", url: "https://sports.core.api.espn.com/v2/sports/football/leagues/nfl/seasons/1985/types/2/leaders", headers: UA },
  // --- College football ---
  { sport: "CFB", label: "CollegeFootballData player season 2010 (no key)", url: "https://api.collegefootballdata.com/stats/player/season?year=2010", headers: UA },
  { sport: "CFB", label: "ESPN byathlete CFB 1995", url: ESPN_BY("football", "college-football", 1995), headers: UA },
  { sport: "CFB", label: "ESPN byathlete CFB 2005", url: ESPN_BY("football", "college-football", 2005), headers: UA },
  { sport: "CFB", label: "ESPN byathlete CFB 2020", url: ESPN_BY("football", "college-football", 2020), headers: UA },
  // --- College basketball ---
  { sport: "CBB", label: "ESPN byathlete CBB 1995", url: ESPN_BY("basketball", "mens-college-basketball", 1995), headers: UA },
  { sport: "CBB", label: "ESPN byathlete CBB 2005", url: ESPN_BY("basketball", "mens-college-basketball", 2005), headers: UA },
  { sport: "CBB", label: "ESPN byathlete CBB 2020", url: ESPN_BY("basketball", "mens-college-basketball", 2020), headers: UA },
  { sport: "CBB", label: "barttorvik player stats 2010 (csv)", url: "https://barttorvik.com/getadvstats.php?year=2010&csv=1", headers: UA },
];

function shape(text, ctype) {
  const out = {};
  if (/json/.test(ctype) || /^[\[{]/.test(text.trim())) {
    let j; try { j = JSON.parse(text); } catch (e) { return { parse: "invalid json" }; }
    // stats.nba.com
    const rs = (j.resultSets || (j.resultSet ? [j.resultSet] : null));
    if (rs) {
      out.resultSets = rs.map((r) => ({ name: r.name, headers: (r.headers || []).slice(0, 30), rows: (r.rowSet || []).length, first: (r.rowSet || [])[0] }));
      return out;
    }
    // GitHub release: asset names
    if (Array.isArray(j.assets)) { out.assets = j.assets.map((a) => a.name); out.assetCount = j.assets.length; return out; }
    // ESPN byathlete
    if (Array.isArray(j.athletes)) {
      out.athletes = j.athletes.length; out.count = j.pagination && j.pagination.count;
      out.categories = (j.categories || []).map((c) => `${c.name}:${(c.labels || []).join("/")}`).slice(0, 8);
      const a = j.athletes[0]; if (a) out.firstAthlete = a.athlete && a.athlete.displayName;
      return out;
    }
    // generic: biggest array
    let best = null;
    (function walk(v, p) { if (Array.isArray(v)) { if (!best || v.length > best.n) best = { path: p, n: v.length, first: v[0] }; v.slice(0, 3).forEach((x, i) => walk(x, `${p}[${i}]`)); }
      else if (v && typeof v === "object") for (const k of Object.keys(v)) walk(v[k], `${p}.${k}`); })(j, "$");
    out.topKeys = Object.keys(j).slice(0, 15); if (best) { out.biggestArray = best.path; out.length = best.n; out.first = typeof best.first === "object" ? JSON.stringify(best.first).slice(0, 300) : best.first; }
    return out;
  }
  const lines = text.split(/\r?\n/).filter(Boolean);
  return { lines: lines.length, header: (lines[0] || "").slice(0, 300), sample: (lines[1] || "").slice(0, 300) };
}

async function probe(p) {
  const t0 = Date.now();
  const ctl = new AbortController(); const to = setTimeout(() => ctl.abort(), 25000);
  try {
    const res = await fetch(p.url, { headers: p.headers, signal: ctl.signal });
    const text = await res.text();
    const r = { ...p, headers: undefined, status: res.status, ms: Date.now() - t0, bytes: text.length, ctype: res.headers.get("content-type") };
    if (res.ok) r.shape = shape(text, r.ctype || ""); else r.body = text.slice(0, 200);
    return r;
  } catch (e) {
    return { ...p, headers: undefined, status: 0, ms: Date.now() - t0, error: e.name === "AbortError" ? "timeout after 25s" : String(e.message) };
  } finally { clearTimeout(to); }
}

async function main() {
  const runner = process.env.RUNNER_KIND || (process.platform === "win32" ? "self-hosted" : "cloud");
  const date = new Date().toISOString().slice(0, 10);
  const results = [];
  for (const p of PROBES) {
    const r = await probe(p);
    const sum = r.status === 200 ? JSON.stringify(r.shape).slice(0, 160) : (r.error || r.body || "");
    console.log(`${String(r.status).padStart(3)} ${String(r.ms).padStart(6)}ms  ${p.sport.padEnd(4)} ${p.label.padEnd(46)} ${sum}`);
    results.push(r);
    await new Promise((res) => setTimeout(res, 700)); // stats.nba.com throttles bursts
  }
  const dir = path.join(__dirname, "data", "probe"); fs.mkdirSync(dir, { recursive: true });
  const file = path.join(dir, `${date}-${runner}.json`);
  fs.writeFileSync(file, JSON.stringify({ runner, date, results }, null, 1));
  console.log(`\nWrote ${path.relative(path.join(__dirname, ".."), file)}`);
  if (!process.argv.includes("--commit")) return;
  const { spawnSync } = require("child_process");
  const repo = path.join(__dirname, "..");
  const git = (...a) => { const r = spawnSync("git", a, { cwd: repo, encoding: "utf8" }); return { code: r.status, out: (r.stdout || "") + (r.stderr || "") }; };
  git("config", "user.name", "statdesk-bot"); git("config", "user.email", "noreply@anthropic.com");
  git("add", "statdesk/data/probe");
  if (git("diff", "--cached", "--quiet").code === 0) { console.log("[probe] nothing to commit"); return; }
  git("commit", "-m", `Stat Desk: source probe from ${runner} runner ${date}`);
  const branch = process.env.GITHUB_REF_NAME || "main";
  for (let i = 1; i <= 5; i += 1) {
    if (git("pull", "--rebase", "origin", branch).code === 0 && git("push", "origin", `HEAD:${branch}`).code === 0) { console.log(`[probe] pushed ${git("rev-parse", "--short", "HEAD").out.trim()}`); return; }
    await new Promise((r) => setTimeout(r, i * 4000));
  }
  console.error("[probe] could not push"); process.exitCode = 1;
}
main().catch((e) => { console.error(e); process.exit(1); });
