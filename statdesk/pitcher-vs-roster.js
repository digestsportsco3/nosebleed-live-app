#!/usr/bin/env node
// One pitcher vs every hitter on an opponent's ACTIVE roster on a given date, exact to
// the plate appearance. MLB Stats API, Nick's machine only.
//   - opponent active roster on --date (position players)
//   - each hitter's vsPlayerTotal (career, regular season) and vsPlayer (by season)
//   - every game the pitcher has appeared in (regular season + postseason, all seasons),
//     play-by-play: each PA against him by any of those hitters, with the team the
//     hitter played for at the time, so "as a Ray" can be split from other clubs
//   node statdesk/pitcher-vs-roster.js <pitcherId> <TEAM_ABBR> [--date YYYY-MM-DD] [--commit]
"use strict";
const fs = require("fs");
const path = require("path");

const API = "https://statsapi.mlb.com/api/v1";
const argv = process.argv.slice(2);
const val = (k, d) => { const i = argv.indexOf(k); return i >= 0 ? argv[i + 1] : d; };
const [PID, ABBR] = argv.filter((a, i) => !a.startsWith("--") && !(i > 0 && argv[i - 1] === "--date"));
const DATE = val("--date", new Date().toISOString().slice(0, 10));
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
const splits = (b) => ((b && b.stats) || []).flatMap((x) => x.splits || []);

async function main() {
  if (!PID || !ABBR) { console.error("usage: pitcher-vs-roster.js <pitcherId> <TEAM_ABBR> [--date YYYY-MM-DD]"); process.exit(2); }
  const teams = await get(`${API}/teams?sportId=1&season=${DATE.slice(0, 4)}`);
  const team = ((teams && teams.teams) || []).find((t) => t.abbreviation === ABBR);
  if (!team) throw new Error(`no team ${ABBR}`);
  const who = await get(`${API}/people/${PID}`);
  const pitcher = who && who.people && who.people[0];
  const ros = await get(`${API}/teams/${team.id}/roster?rosterType=active&date=${DATE}`);
  const hitters = ((ros && ros.roster) || []).filter((r) => r.position && r.position.type !== "Pitcher");
  console.log(`${pitcher && pitcher.fullName} vs ${team.name} active roster ${DATE}: ${hitters.length} position players`);
  const ids = new Set(hitters.map((h) => h.person.id));

  const out = { pitcher, team: { id: team.id, name: team.name, abbreviation: team.abbreviation }, date: DATE, roster: hitters.map((h) => ({ id: h.person.id, name: h.person.fullName, pos: h.position.abbreviation })), hitters: [], games: [], pas: [] };
  for (const h of hitters) {
    const id = h.person.id;
    const tot = await get(`${API}/people/${id}/stats?stats=vsPlayerTotal&group=hitting&opposingPlayerId=${PID}&sportId=1`);
    const by = await get(`${API}/people/${id}/stats?stats=vsPlayer&group=hitting&opposingPlayerId=${PID}&sportId=1`);
    out.hitters.push({ id, name: h.person.fullName, pos: h.position.abbreviation, vsPlayerTotal: (splits(tot)[0] || {}).stat || null, vsPlayer: splits(by).map((s) => ({ season: s.season, team: s.team && s.team.name, stat: s.stat })) });
  }

  const yby = await get(`${API}/people/${PID}/stats?stats=yearByYear&group=pitching&sportId=1`);
  const seasons = [...new Set(splits(yby).map((s) => s.season))];
  for (const season of seasons) {
    for (const gt of ["R", "F", "D", "L", "W"]) {
      const gl = await get(`${API}/people/${PID}/stats?stats=gameLog&group=pitching&season=${season}&gameType=${gt}&sportId=1`);
      for (const s of splits(gl)) out.games.push({ season, gameType: gt, date: s.date, pk: s.game && s.game.gamePk, opponent: s.opponent && s.opponent.name, team: s.team && s.team.name, ip: s.stat.inningsPitched });
    }
  }
  console.log(`games pitched: ${out.games.length} across ${seasons.join(", ")}`);
  for (const g of out.games) {
    const pbp = await get(`${API}/game/${g.pk}/playByPlay`);
    const box = await get(`${API}/game/${g.pk}/boxscore`);
    const side = (bid) => {
      if (!box) return null;
      for (const k of ["home", "away"]) if (box.teams[k].players[`ID${bid}`]) return box.teams[k].team.name;
      return null;
    };
    for (const p of ((pbp && pbp.allPlays) || [])) {
      if (!p.matchup || p.matchup.pitcher.id !== Number(PID) || !ids.has(p.matchup.batter.id)) continue;
      out.pas.push({ date: g.date, pk: g.pk, gameType: g.gameType, opponent: g.opponent, batter: p.matchup.batter.fullName, batterId: p.matchup.batter.id, batterTeam: side(p.matchup.batter.id), inning: p.about.inning, half: p.about.halfInning, event: p.result.event, eventType: p.result.eventType, rbi: p.result.rbi, desc: p.result.description, count: p.count });
    }
    await sleep(60);
  }
  const dir = path.join(__dirname, "data", "mlb", "pvr", DATE);
  fs.mkdirSync(dir, { recursive: true });
  const file = path.join(dir, `${PID}-vs-${ABBR}.json`);
  fs.writeFileSync(file, JSON.stringify({ ...out, calls, at: new Date().toISOString() }, null, 1));
  console.log(`[pvr] ${out.pas.length} PAs, ${calls} calls -> ${path.relative(path.join(__dirname, ".."), file)}`);
  if (!argv.includes("--commit")) return;
  const { spawnSync } = require("child_process");
  const repo = path.join(__dirname, "..");
  const git = (...x) => spawnSync("git", x, { cwd: repo, encoding: "utf8" }).status;
  git("config", "user.name", "statdesk-bot"); git("config", "user.email", "noreply@anthropic.com");
  git("add", "statdesk/data/mlb/pvr");
  if (git("diff", "--cached", "--quiet") === 0) return;
  git("commit", "-m", `Stat Desk MLB: pitcher ${PID} vs ${ABBR} active roster ${DATE}`);
  const branch = process.env.GITHUB_REF_NAME || "main";
  for (let i = 1; i <= 5; i += 1) {
    if (git("pull", "--rebase", "origin", branch) === 0 && git("push", "origin", `HEAD:${branch}`) === 0) { console.log("[pvr] pushed"); return; }
    await sleep(i * 4000);
  }
  process.exitCode = 1;
}
main().catch((e) => { console.error(e.stack || e.message); process.exit(1); });
