#!/usr/bin/env node
// Season game logs for every regular player, for streak hunting (hit / on-base
// streaks, scoreless runs, post-trade splits). MLB Stats API, Nick's machine only.
//   - league season stats: hitters with >= --pa PA, pitchers with >= --ip IP
//   - each player's regular-season game log (compact), with team per game
//   node statdesk/streaks.js [--season 2026] [--pa 200] [--ip 30] [--commit]
"use strict";
const fs = require("fs");
const path = require("path");

const API = "https://statsapi.mlb.com/api/v1";
const argv = process.argv.slice(2);
const opt = (k, d) => { const i = argv.indexOf(k); return i >= 0 ? Number(argv[i + 1]) : d; };
const SEASON = opt("--season", new Date().getFullYear()), MINPA = opt("--pa", 200), MINIP = opt("--ip", 30);
const OUT = path.join(__dirname, "data", "mlb", "streaks", String(SEASON));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let calls = 0;
async function get(url) {
  for (let i = 1; i <= 4; i += 1) {
    try { calls += 1; const r = await fetch(url, { headers: { "User-Agent": "Stat Desk (Nosebleed Sports)" } }); if (r.ok) return await r.json(); if (r.status === 404) return null; }
    catch (e) { /* retry */ }
    await sleep(800 * i);
  }
  return null;
}
const ip = (s) => { const [a, b] = String(s || "0").split("."); return Number(a) + (Number(b) || 0) / 3; };
const HK = ["plateAppearances", "atBats", "hits", "doubles", "triples", "homeRuns", "rbi", "runs", "baseOnBalls", "intentionalWalks", "hitByPitch", "strikeOuts", "stolenBases", "caughtStealing", "sacFlies", "totalBases"];
const PK = ["gamesStarted", "inningsPitched", "hits", "runs", "earnedRuns", "baseOnBalls", "strikeOuts", "homeRuns", "battersFaced", "numberOfPitches", "wins", "losses", "saves", "holds", "blownSaves", "hitBatsmen"];

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  const out = { season: SEASON, minPA: MINPA, minIP: MINIP, at: new Date().toISOString() };
  for (const [group, keys, keep] of [["hitting", HK, (s) => Number(s.plateAppearances) >= MINPA], ["pitching", PK, (s) => ip(s.inningsPitched) >= MINIP]]) {
    const u = `${API}/stats?stats=season&group=${group}&season=${SEASON}&gameType=R&sportId=1&playerPool=ALL&limit=3000`;
    const b = await get(u);
    const splits = ((b && b.stats) || []).flatMap((x) => x.splits || []).filter((s) => keep(s.stat));
    console.log(`${group}: ${splits.length} players`);
    const players = [];
    for (const s of splits) {
      const id = s.player.id;
      const g = await get(`${API}/people/${id}/stats?stats=gameLog&group=${group}&season=${SEASON}&gameType=R&sportId=1`);
      const games = ((g && g.stats) || []).flatMap((x) => x.splits || []).map((x) => {
        const row = { d: x.date, t: x.team && x.team.abbreviation || x.team && x.team.name, tid: x.team && x.team.id, o: x.opponent && x.opponent.name, oid: x.opponent && x.opponent.id, h: x.isHome ? 1 : 0, pk: x.game && x.game.gamePk };
        for (const k of keys) row[k] = x.stat[k];
        return row;
      });
      players.push({ id, name: s.player.fullName, team: s.team && s.team.name, teamId: s.team && s.team.id, season: Object.fromEntries(keys.concat(["avg", "obp", "slg", "ops", "era", "whip"]).filter((k) => s.stat[k] !== undefined).map((k) => [k, s.stat[k]])), games });
      await sleep(60);
    }
    fs.writeFileSync(path.join(OUT, `${group}.json`), JSON.stringify({ ...out, group, url: u, players }));
  }
  fs.writeFileSync(path.join(OUT, "summary.json"), JSON.stringify({ ...out, calls }));
  console.log(`[streaks] ${calls} calls`);
  if (!argv.includes("--commit")) return;
  const { spawnSync } = require("child_process");
  const repo = path.join(__dirname, "..");
  const git = (...x) => spawnSync("git", x, { cwd: repo, encoding: "utf8" }).status;
  git("config", "user.name", "statdesk-bot"); git("config", "user.email", "noreply@anthropic.com");
  git("add", "statdesk/data/mlb/streaks");
  if (git("diff", "--cached", "--quiet") === 0) return;
  git("commit", "-m", `Stat Desk MLB: ${SEASON} season game logs for streaks`);
  const branch = process.env.GITHUB_REF_NAME || "main";
  for (let i = 1; i <= 5; i += 1) {
    if (git("pull", "--rebase", "origin", branch) === 0 && git("push", "origin", `HEAD:${branch}`) === 0) { console.log("[streaks] pushed"); return; }
    await sleep(i * 4000);
  }
  process.exitCode = 1;
}
main().catch((e) => { console.error(e.stack || e.message); process.exit(1); });
