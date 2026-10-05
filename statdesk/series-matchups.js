#!/usr/bin/env node
// Series preview data for a postseason round, from the MLB Stats API: the raw
// material for matchup posts before probables are announced. For each pairing:
//   - this year's regular-season meetings (every game, both teams' schedules)
//   - every postseason meeting between the two franchises, 1903 to last year
//   - each side's starters (active roster, 8+ GS this year): career vs the
//     opponent, 2026 game log, and every active opposing hitter's career line
//     against them
//   - each active hitter: career vs the opponent and 2026 game log
// Nick's machine only (the cloud container cannot reach statsapi.mlb.com).
//
//   node statdesk/series-matchups.js "White Sox:Guardians" "Yankees:Rays" ... [--date YYYY-MM-DD] [--commit]
"use strict";
const fs = require("fs");
const path = require("path");

const API = "https://statsapi.mlb.com/api/v1";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const argv = process.argv.slice(2);
const di = argv.indexOf("--date");
const date = di >= 0 ? argv[di + 1] : new Date().toLocaleDateString("en-CA", { timeZone: "America/New_York" });
const season = Number(date.slice(0, 4));
const pairs = argv.filter((a, i) => a.includes(":") && argv[i - 1] !== "--date").map((a) => a.split(":").map((s) => s.trim()));
const OUT = path.join(__dirname, "data", "mlb", "series", date);
let calls = 0;

async function get(url) {
  for (let i = 1; i <= 4; i += 1) {
    try { calls += 1; const r = await fetch(url, { headers: { "User-Agent": "Stat Desk (Nosebleed Sports)" } }); if (r.ok) return await r.json(); if (r.status === 404) return null; }
    catch (e) { /* retry */ }
    await sleep(800 * i);
  }
  return null;
}
async function grab(url) { const body = await get(url); await sleep(100); return { url, body }; }
function save(name, obj) { fs.mkdirSync(OUT, { recursive: true }); fs.writeFileSync(path.join(OUT, name), JSON.stringify(obj)); }
const splits = (x) => ((x && x.body && x.body.stats) || []).flatMap((s) => s.splits || []);

async function main() {
  if (!pairs.length) throw new Error('usage: series-matchups.js "Team A:Team B" ...');
  const teams = ((await get(`${API}/teams?sportId=1&season=${season}`)) || {}).teams || [];
  const find = (q) => {
    const t = teams.find((x) => [x.name, x.teamName, x.clubName, x.abbreviation, x.shortName].some((n) => n && n.toLowerCase() === q.toLowerCase()));
    if (!t) throw new Error(`team not found: ${q}`); return t;
  };
  const index = [];
  for (const [qa, qb] of pairs) {
    const A = find(qa), B = find(qb);
    const key = `${A.abbreviation}-${B.abbreviation}`;
    console.log(`${key}: ${A.name} vs ${B.name}`);
    // This year's meetings.
    const sch = await grab(`${API}/schedule?sportId=1&season=${season}&gameType=R&teamId=${A.id}&hydrate=linescore,decisions,probablePitcher`);
    const games = ((sch.body && sch.body.dates) || []).flatMap((d) => d.games || []).filter((g) => [g.teams.away.team.id, g.teams.home.team.id].includes(B.id));
    save(`${key}-season-series.json`, { A, B, url: sch.url, games });
    // Every postseason meeting.
    const post = [];
    for (let y = 1903; y < season; y += 1) {
      const u = `${API}/schedule?sportId=1&season=${y}&gameTypes=F,D,L,W&teamId=${A.id}&hydrate=linescore,decisions`;
      const b = await get(u); await sleep(60);
      for (const g of ((b && b.dates) || []).flatMap((d) => d.games || [])) if ([g.teams.away.team.id, g.teams.home.team.id].includes(B.id)) post.push(g);
    }
    // Box scores of every past meeting, for "in the 2020 ALDS he ..." lines.
    const boxes = {};
    for (const g of post.filter((x) => x.status && x.status.detailedState === "Final")) boxes[g.gamePk] = await get(`${API}/game/${g.gamePk}/boxscore`);
    save(`${key}-postseason-history.json`, { A, B, games: post, boxes });
    console.log(`  ${games.length} meetings this year, ${post.length} postseason games all time`);
    for (const [me, them] of [[A, B], [B, A]]) {
      const ros = await get(`${API}/teams/${me.id}/roster?rosterType=active&date=${date}`);
      const roster = (ros && ros.roster) || [];
      const pitchers = [];
      for (const r of roster.filter((x) => x.position && x.position.type === "Pitcher")) {
        const s = await grab(`${API}/people/${r.person.id}/stats?stats=season&group=pitching&season=${season}&gameType=R&sportId=1`);
        const st = (splits(s)[0] || {}).stat || {};
        if (Number(st.gamesStarted) >= 8) pitchers.push({ person: r.person, season: s });
      }
      const oppRos = await get(`${API}/teams/${them.id}/roster?rosterType=active&date=${date}`);
      const hitters = ((oppRos && oppRos.roster) || []).filter((r) => r.position && r.position.type !== "Pitcher");
      for (const p of pitchers) {
        const id = p.person.id;
        const rec = { pitcher: p.person, team: me, opponent: them, season: p.season };
        rec.vsTeamTotal = await grab(`${API}/people/${id}/stats?stats=vsTeamTotal&group=pitching&opposingTeamId=${them.id}&sportId=1`);
        rec.career = await grab(`${API}/people/${id}/stats?stats=career&group=pitching&sportId=1`);
        rec.gameLog = await grab(`${API}/people/${id}/stats?stats=gameLog&group=pitching&season=${season}&gameType=R&sportId=1`);
        rec.vsHitters = [];
        for (const h of hitters) {
          const v = await grab(`${API}/people/${h.person.id}/stats?stats=vsPlayerTotal&group=hitting&opposingPlayerId=${id}&sportId=1`);
          rec.vsHitters.push({ hitter: h.person, url: v.url, stat: (splits(v)[0] || {}).stat || null });
        }
        save(`${key}-p-${id}.json`, rec);
        console.log(`  SP ${p.person.fullName} (${me.abbreviation}) vs ${hitters.length} ${them.abbreviation} hitters`);
      }
      // Hitters on this side: career vs the opponent, this year's game log.
      for (const h of roster.filter((r) => r.position && r.position.type !== "Pitcher")) {
        const id = h.person.id;
        save(`${key}-h-${id}.json`, { hitter: h.person, team: me, opponent: them,
          vsTeamTotal: await grab(`${API}/people/${id}/stats?stats=vsTeamTotal&group=hitting&opposingTeamId=${them.id}&sportId=1`),
          gameLog: await grab(`${API}/people/${id}/stats?stats=gameLog&group=hitting&season=${season}&gameType=R&sportId=1`) });
      }
    }
    index.push({ key, A: A.name, B: B.name });
  }
  save("summary.json", { date, pairs: index, calls, at: new Date().toISOString() });
  console.log(`[series] ${calls} calls`);
  if (!argv.includes("--commit")) return;
  const { spawnSync } = require("child_process");
  const repo = path.join(__dirname, "..");
  const git = (...x) => spawnSync("git", x, { cwd: repo, encoding: "utf8" }).status;
  git("config", "user.name", "statdesk-bot"); git("config", "user.email", "noreply@anthropic.com");
  git("add", "statdesk/data/mlb/series");
  if (git("diff", "--cached", "--quiet") === 0) return;
  git("commit", "-m", `Stat Desk MLB: series matchup pull ${date}`);
  const branch = process.env.GITHUB_REF_NAME || "main";
  for (let i = 1; i <= 5; i += 1) {
    if (git("pull", "--rebase", "origin", branch) === 0 && git("push", "origin", `HEAD:${branch}`) === 0) { console.log("[series] pushed"); return; }
    await sleep(i * 4000);
  }
  process.exitCode = 1;
}
main().catch((e) => { console.error(e.stack || e.message); process.exit(1); });
