#!/usr/bin/env node
// Matchup and career data for today's games — the raw material for items a
// box score cannot give: a starter's career against today's opponent, every
// opposing hitter's career line against that starter, postseason careers, and
// each hitter's career against the opponent. MLB Stats API, run on Nick's
// machine (the cloud container cannot reach statsapi.mlb.com).
//
//   statdesk/data/mlb/matchups/<date>/games.json          today's games + probables
//   statdesk/data/mlb/matchups/<date>/p-<id>.json          starter: vs team, playoffs, log
//   statdesk/data/mlb/matchups/<date>/h-<id>-vs-<pid>.json hitter vs today's starter (career)
//   statdesk/data/mlb/matchups/<date>/h-<id>.json          hitter: playoffs career, vs team
//
//   node statdesk/matchups.js [YYYY-MM-DD] [--commit]
"use strict";
const fs = require("fs");
const path = require("path");

const API = "https://statsapi.mlb.com/api/v1";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const today = new Date().toLocaleDateString("en-CA", { timeZone: "America/New_York" });
const date = process.argv.slice(2).find((a) => /^\d{4}-\d{2}-\d{2}$/.test(a)) || today;
const OUT = path.join(__dirname, "data", "mlb", "matchups", date);
let calls = 0;

async function get(url) {
  for (let i = 1; i <= 4; i += 1) {
    try { calls += 1; const r = await fetch(url, { headers: { "User-Agent": "Stat Desk (Nosebleed Sports)" } }); if (r.ok) return await r.json(); if (r.status === 404) return null; }
    catch (e) { /* retry */ }
    await sleep(800 * i);
  }
  return null;
}
function save(name, obj) { fs.mkdirSync(OUT, { recursive: true }); fs.writeFileSync(path.join(OUT, name), JSON.stringify(obj)); }
async function stats(id, q) { const u = `${API}/people/${id}/stats?${q}`; const b = await get(u); await sleep(120); return { url: u, body: b }; }

async function main() {
  // Today's games, plus yesterday's (their starters' careers vs the opponent
  // are just as much the story the morning after).
  const prev = new Date(`${date}T12:00:00Z`); prev.setUTCDate(prev.getUTCDate() - 1); const yday = prev.toISOString().slice(0, 10);
  const games = [];
  for (const [d, tag] of [[date, "today"], [yday, "yesterday"]]) {
    const sched = `${API}/schedule?sportId=1&date=${d}&hydrate=probablePitcher,team,seriesStatus,decisions`;
    const s = await get(sched); save(`games-${tag}.json`, { url: sched, body: s });
    for (const g of (s && s.dates || []).flatMap((x) => x.games || [])) if (g.gameType !== "R" || tag === "today") games.push({ ...g, _when: tag });
  }
  console.log(`${date}: ${games.length} games`);
  for (const g of games) {
    const sides = [["away", "home"], ["home", "away"]];
    for (const [me, them] of sides) {
      const P = g.teams[me].probablePitcher; const opp = g.teams[them].team;
      if (!P) { console.log(`  ${g.teams[me].team.name}: no probable pitcher listed`); continue; }
      const rec = { pitcher: P, team: g.teams[me].team, opponent: opp, gamePk: g.gamePk, series: g.seriesDescription, when: g._when, gameDate: g.officialDate };
      rec.vsTeamTotal = await stats(P.id, `stats=vsTeamTotal&group=pitching&opposingTeamId=${opp.id}&sportId=1`);
      rec.vsTeam = await stats(P.id, `stats=vsTeam&group=pitching&opposingTeamId=${opp.id}&sportId=1`);
      rec.careerPlayoffs = await stats(P.id, `stats=careerPlayoffs&group=pitching&sportId=1`);
      rec.yearByYearPlayoffs = await stats(P.id, `stats=yearByYearPlayoffs&group=pitching&sportId=1`);
      rec.career = await stats(P.id, `stats=career&group=pitching&sportId=1`);
      rec.gameLog = await stats(P.id, `stats=gameLog&group=pitching&season=${date.slice(0, 4)}&sportId=1`);
      save(`p-${P.id}.json`, rec);
      // Every active hitter on the other side: career vs this pitcher, postseason career, career vs this team.
      const ros = await get(`${API}/teams/${opp.id}/roster?rosterType=active&date=${date}`);
      const hitters = ((ros && ros.roster) || []).filter((r) => r.position && r.position.type !== "Pitcher");
      for (const h of hitters) {
        const id = h.person.id;
        save(`h-${id}-vs-${P.id}.json`, { hitter: h.person, team: opp, pitcher: P, vsPlayerTotal: await stats(id, `stats=vsPlayerTotal&group=hitting&opposingPlayerId=${P.id}&sportId=1`) });
        const f = path.join(OUT, `h-${id}.json`);
        if (!fs.existsSync(f)) save(`h-${id}.json`, { hitter: h.person, team: opp, facing: g.teams[me].team,
          careerPlayoffs: await stats(id, `stats=careerPlayoffs&group=hitting&sportId=1`),
          vsTeamTotal: await stats(id, `stats=vsTeamTotal&group=hitting&opposingTeamId=${g.teams[me].team.id}&sportId=1`) });
      }
      console.log(`  ${P.fullName} (${g.teams[me].team.name}) vs ${opp.name}: ${hitters.length} hitters`);
    }
  }
  save("summary.json", { date, games: games.length, calls, at: new Date().toISOString() });
  console.log(`[matchups] ${calls} calls`);
  if (!process.argv.includes("--commit")) return;
  const { spawnSync } = require("child_process");
  const repo = path.join(__dirname, "..");
  const git = (...x) => { const r = spawnSync("git", x, { cwd: repo, encoding: "utf8" }); return { code: r.status }; };
  git("config", "user.name", "statdesk-bot"); git("config", "user.email", "noreply@anthropic.com");
  git("add", "statdesk/data/mlb/matchups");
  if (git("diff", "--cached", "--quiet").code === 0) return;
  git("commit", "-m", `Stat Desk MLB: matchup and career pull ${date}`);
  const branch = process.env.GITHUB_REF_NAME || "main";
  for (let i = 1; i <= 5; i += 1) {
    if (git("pull", "--rebase", "origin", branch).code === 0 && git("push", "origin", `HEAD:${branch}`).code === 0) { console.log("[matchups] pushed"); return; }
    await sleep(i * 4000);
  }
  process.exitCode = 1;
}
main().catch((e) => { console.error(e.stack || e.message); process.exit(1); });
