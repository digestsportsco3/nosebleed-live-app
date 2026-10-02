#!/usr/bin/env node
// Postseason + final-standings pull from the MLB Stats API, for briefs once
// the regular season is over. Runs on Nick's machine (the cloud container
// cannot reach statsapi.mlb.com). Saves every response with its URL.
//
//   statdesk/data/mlb/postseason/<date>/schedule.json     all postseason games so far
//   statdesk/data/mlb/postseason/<date>/box-<gamePk>.json  box score of every final game
//   statdesk/data/mlb/postseason/<date>/standings.json    final regular-season standings
//   statdesk/data/mlb/postseason/<date>/season-{hitting,pitching}.json  final season stats
//
//   node statdesk/postseason.js [YYYY-MM-DD] [--commit]
"use strict";
const fs = require("fs");
const path = require("path");

const API = "https://statsapi.mlb.com/api/v1";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const today = new Date().toLocaleDateString("en-CA", { timeZone: "America/New_York" });
const date = process.argv.slice(2).find((a) => /^\d{4}-\d{2}-\d{2}$/.test(a)) || today;
const season = Number(date.slice(0, 4));
const OUT = path.join(__dirname, "data", "mlb", "postseason", date);

async function get(url, label) {
  for (let i = 1; i <= 4; i += 1) {
    try {
      const res = await fetch(url, { headers: { "User-Agent": "Stat Desk (Nosebleed Sports)" } });
      if (res.ok) return await res.json();
      console.log(`  ${label}: HTTP ${res.status}`);
    } catch (e) { console.log(`  ${label}: ${e.message}`); }
    await sleep(1000 * i);
  }
  throw new Error(`${label} failed`);
}
function save(name, url, label, body) {
  fs.mkdirSync(OUT, { recursive: true });
  fs.writeFileSync(path.join(OUT, name), JSON.stringify({ ts: new Date().toISOString(), url, label, body }));
}

async function main() {
  const sched = `${API}/schedule?sportId=1&season=${season}&gameTypes=F,D,L,W&hydrate=linescore,decisions,team,seriesStatus`;
  const s = await get(sched, "postseason schedule"); save("schedule.json", sched, "postseason schedule", s);
  const games = (s.dates || []).flatMap((d) => d.games || []);
  const finals = games.filter((g) => g.status && /Final|Game Over|Completed/i.test(g.status.detailedState || g.status.abstractGameState));
  console.log(`postseason games: ${games.length}, final: ${finals.length}`);
  for (const g of finals) {
    const u = `${API}/game/${g.gamePk}/boxscore`;
    save(`box-${g.gamePk}.json`, u, `boxscore ${g.gamePk} ${g.teams.away.team.name} at ${g.teams.home.team.name} ${g.officialDate}`, await get(u, `box ${g.gamePk}`));
    await sleep(300);
  }
  const st = `${API}/standings?leagueId=103,104&season=${season}&standingsTypes=regularSeason&hydrate=team`;
  save("standings.json", st, "final regular-season standings", await get(st, "standings"));
  for (const group of ["hitting", "pitching"]) {
    const u = `${API}/stats?stats=season&group=${group}&season=${season}&sportId=1&playerPool=All&limit=5000&gameType=R`;
    save(`season-${group}.json`, u, `final regular season ${group}, all players`, await get(u, `season ${group}`));
  }
  fs.writeFileSync(path.join(OUT, "summary.json"), JSON.stringify({ date, games: games.length, finals: finals.map((g) => ({ gamePk: g.gamePk, date: g.officialDate, type: g.gameType, desc: g.seriesDescription,
    away: g.teams.away.team.name, awayScore: g.teams.away.score, home: g.teams.home.team.name, homeScore: g.teams.home.score, series: g.seriesStatus && g.seriesStatus.result })) }, null, 1));
  if (!process.argv.includes("--commit")) return;
  const { spawnSync } = require("child_process");
  const repo = path.join(__dirname, "..");
  const git = (...x) => { const r = spawnSync("git", x, { cwd: repo, encoding: "utf8" }); return { code: r.status }; };
  git("config", "user.name", "statdesk-bot"); git("config", "user.email", "noreply@anthropic.com");
  git("add", "statdesk/data/mlb/postseason");
  if (git("diff", "--cached", "--quiet").code === 0) return;
  git("commit", "-m", `Stat Desk MLB: postseason and final-standings pull ${date}`);
  const branch = process.env.GITHUB_REF_NAME || "main";
  for (let i = 1; i <= 5; i += 1) {
    if (git("pull", "--rebase", "origin", branch).code === 0 && git("push", "origin", `HEAD:${branch}`).code === 0) { console.log("[postseason] pushed"); return; }
    await sleep(i * 4000);
  }
  process.exitCode = 1;
}
main().catch((e) => { console.error(e.stack || e.message); process.exit(1); });
