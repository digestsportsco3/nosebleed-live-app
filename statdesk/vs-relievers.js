#!/usr/bin/env node
// Relievers vs a lineup, from the MLB Stats API. matchups.js only covers the
// probable starters; this covers the bullpen arms named in the args.
//   - each pitcher: regular-season career and 2026, postseason by round and
//     year, 2026 game log, career vs the opposing team (batting against)
//   - every active hitter on the opposing team vs each pitcher: career
//     (vsPlayerTotal, regular season only) and by season (vsPlayer)
//   - every postseason plate appearance those pitchers threw for the
//     pitchers' team since --from (default 2022), from play-by-play, with the
//     pitches; plus who pitched in each of those games (for usage claims)
// Nick's machine only (the cloud container cannot reach statsapi.mlb.com).
//
//   node statdesk/vs-relievers.js CLE TB "Hunter Gaddis" "Cade Smith" [--from 2022] [--date YYYY-MM-DD] [--commit]
"use strict";
const fs = require("fs");
const path = require("path");

const API = "https://statsapi.mlb.com/api/v1";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const argv = process.argv.slice(2);
const opt = (k) => { const i = argv.indexOf(k); return i >= 0 ? argv[i + 1] : null; };
const date = opt("--date") || new Date().toLocaleDateString("en-CA", { timeZone: "America/New_York" });
const season = Number(date.slice(0, 4));
const from = Number(opt("--from") || 2022);
const pos = argv.filter((a, i) => !a.startsWith("--") && !["--date", "--from"].includes(argv[i - 1]));
const [pitTeamQ, batTeamQ, ...pitcherNames] = pos;
const OUT = path.join(__dirname, "data", "mlb", "relievers", date);
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
const fold = (s) => String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();

async function main() {
  if (!pitTeamQ || !batTeamQ || !pitcherNames.length) throw new Error('usage: vs-relievers.js CLE TB "Pitcher One" "Pitcher Two" ...');
  const teams = ((await get(`${API}/teams?sportId=1&season=${season}`)) || {}).teams || [];
  const find = (q) => {
    const t = teams.find((x) => [x.name, x.teamName, x.clubName, x.abbreviation, x.shortName].some((n) => n && fold(n) === fold(q)));
    if (!t) throw new Error(`team not found: ${q}`); return t;
  };
  const P = find(pitTeamQ), B = find(batTeamQ);
  const pRos = ((await get(`${API}/teams/${P.id}/roster?rosterType=40Man&date=${date}`)) || {}).roster || [];
  const bRos = ((await get(`${API}/teams/${B.id}/roster?rosterType=active&date=${date}`)) || {}).roster || [];
  const hitters = bRos.filter((r) => r.position && r.position.type !== "Pitcher").map((r) => r.person);
  const pitchers = [];
  for (const n of pitcherNames) {
    let r = pRos.find((x) => fold(x.person.fullName) === fold(n));
    if (!r) { const s = await get(`${API}/people/search?names=${encodeURIComponent(n)}&sportIds=1`); const p = ((s && s.people) || []).find((x) => fold(x.fullName) === fold(n)); if (p) r = { person: p }; }
    if (!r) { console.log(`pitcher not found: ${n}`); continue; }
    pitchers.push(r.person);
  }
  console.log(`${P.abbreviation} pitchers: ${pitchers.map((p) => p.fullName).join(", ")} | ${B.abbreviation} hitters: ${hitters.length}`);

  for (const p of pitchers) {
    const id = p.id;
    const rec = { pitcher: p, team: P, opponent: B, date };
    rec.person = await grab(`${API}/people/${id}`);
    rec.career = await grab(`${API}/people/${id}/stats?stats=career&group=pitching&gameType=R&sportId=1`);
    rec.season = await grab(`${API}/people/${id}/stats?stats=season&group=pitching&season=${season}&gameType=R&sportId=1`);
    rec.yearByYear = await grab(`${API}/people/${id}/stats?stats=yearByYear&group=pitching&gameType=R&sportId=1`);
    rec.gameLog = await grab(`${API}/people/${id}/stats?stats=gameLog&group=pitching&season=${season}&gameType=R&sportId=1`);
    rec.vsTeamTotal = await grab(`${API}/people/${id}/stats?stats=vsTeamTotal&group=pitching&opposingTeamId=${B.id}&sportId=1`);
    rec.postRounds = {}; rec.postYearByYear = {};
    for (const t of ["F", "D", "L", "W"]) {
      rec.postRounds[t] = await grab(`${API}/people/${id}/stats?stats=career&group=pitching&gameType=${t}&sportId=1`);
      rec.postYearByYear[t] = await grab(`${API}/people/${id}/stats?stats=yearByYear&group=pitching&gameType=${t}&sportId=1`);
    }
    rec.vsHitters = [];
    for (const h of hitters) {
      const tot = await grab(`${API}/people/${h.id}/stats?stats=vsPlayerTotal&group=hitting&opposingPlayerId=${id}&sportId=1`);
      const by = await grab(`${API}/people/${h.id}/stats?stats=vsPlayer&group=hitting&opposingPlayerId=${id}&sportId=1`);
      rec.vsHitters.push({ hitter: h, total: tot, bySeason: by });
    }
    save(`p-${id}.json`, rec);
    console.log(`  ${p.fullName}: career, postseason rounds, ${hitters.length} hitters`);
  }

  // Every postseason game the pitchers' team played since `from`, play by play.
  const ids = new Set(pitchers.map((p) => p.id));
  const games = []; const pas = [];
  for (let y = from; y <= season; y += 1) {
    const s = await get(`${API}/schedule?sportId=1&season=${y}&gameTypes=F,D,L,W&teamId=${P.id}`);
    for (const g of ((s && s.dates) || []).flatMap((d) => d.games || [])) {
      if (!g.status || g.status.abstractGameState !== "Final") continue;
      if (games.some((x) => x.gamePk === g.gamePk)) continue;
      const box = await get(`${API}/game/${g.gamePk}/boxscore`);
      const side = box && (box.teams.home.team.id === P.id ? "home" : "away");
      const staff = side ? box.teams[side].pitchers.map((pid) => ({ id: pid, name: (box.teams[side].players[`ID${pid}`] || {}).person && box.teams[side].players[`ID${pid}`].person.fullName, ip: ((box.teams[side].players[`ID${pid}`] || {}).stats || {}).pitching && box.teams[side].players[`ID${pid}`].stats.pitching.inningsPitched })) : [];
      games.push({ gamePk: g.gamePk, officialDate: g.officialDate, gameType: g.gameType, series: g.seriesDescription, game: g.seriesGameNumber,
        away: g.teams.away.team.name, awayScore: g.teams.away.score, home: g.teams.home.team.name, homeScore: g.teams.home.score, staff });
      if (!staff.some((x) => ids.has(x.id))) continue;
      const pbp = await get(`${API}/game/${g.gamePk}/playByPlay`);
      for (const pl of ((pbp && pbp.allPlays) || [])) {
        if (!pl.matchup || !ids.has(pl.matchup.pitcher.id) || !pl.result || !pl.result.eventType) continue;
        pas.push({ gamePk: g.gamePk, officialDate: g.officialDate, series: g.seriesDescription, game: g.seriesGameNumber,
          opponent: side === "home" ? g.teams.away.team.name : g.teams.home.team.name,
          inning: pl.about.inning, half: pl.about.halfInning, pitcher: pl.matchup.pitcher.fullName, pitcherId: pl.matchup.pitcher.id,
          batter: pl.matchup.batter.fullName, batterId: pl.matchup.batter.id, batSide: pl.matchup.batSide && pl.matchup.batSide.code,
          event: pl.result.event, eventType: pl.result.eventType, rbi: pl.result.rbi, description: pl.result.description,
          count: pl.count, outsAfter: pl.count && pl.count.outs,
          pitches: (pl.playEvents || []).filter((e) => e.isPitch).map((e) => ({ type: e.details && e.details.type && e.details.type.code, speed: e.pitchData && e.pitchData.startSpeed, call: e.details && e.details.description })) });
      }
      await sleep(150);
    }
  }
  save("postseason-games.json", { team: P, from, games });
  save("postseason-pas.json", { team: P, pitchers, from, pas });
  save("summary.json", { date, pitchingTeam: P.name, battingTeam: B.name, pitchers, hitters: hitters.length, games: games.length, pas: pas.length, calls, at: new Date().toISOString() });
  console.log(`[relievers] ${games.length} postseason games, ${pas.length} PAs, ${calls} calls`);
  if (!argv.includes("--commit")) return;
  const { spawnSync } = require("child_process");
  const repo = path.join(__dirname, "..");
  const git = (...x) => spawnSync("git", x, { cwd: repo, encoding: "utf8" }).status;
  git("config", "user.name", "statdesk-bot"); git("config", "user.email", "noreply@anthropic.com");
  git("add", "statdesk/data/mlb/relievers");
  if (git("diff", "--cached", "--quiet") === 0) return;
  git("commit", "-m", `Stat Desk MLB: relievers vs lineup pull ${date}`);
  const branch = process.env.GITHUB_REF_NAME || "main";
  for (let i = 1; i <= 5; i += 1) {
    if (git("pull", "--rebase", "origin", branch) === 0 && git("push", "origin", `HEAD:${branch}`) === 0) { console.log("[relievers] pushed"); return; }
    await sleep(i * 4000);
  }
  process.exitCode = 1;
}
main().catch((e) => { console.error(e.stack || e.message); process.exit(1); });
