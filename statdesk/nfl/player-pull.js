#!/usr/bin/env node
// One NFL player plus tonight's opponent, for prop/promo posts. Two sources:
//   1. ESPN (public JSON): the player's game logs and splits for every season
//      listed, every box score of his team's and the opponent's games this
//      season (passing lines allowed, targets), and the day's scoreboard.
//   2. Stathead (signed-in browser): every 300+ passing-yard game since
//      --from, regular season and postseason, so his big games can be counted
//      against the whole league and against the opponent.
// Nick's machine only (ESPN and Sports Reference block the cloud container).
//
//   node statdesk/nfl/player-pull.js "Brock Purdy" SF WSH [--from 2022] [--season 2026] [--yds 300] [--commit]
"use strict";
const fs = require("fs");
const path = require("path");

const argv = process.argv.slice(2);
const opt = (k, d) => { const i = argv.indexOf(k); return i >= 0 ? argv[i + 1] : d; };
const pos = argv.filter((a, i) => !a.startsWith("--") && !["--from", "--season", "--yds"].includes(argv[i - 1]));
const [who, teamAbbr, oppAbbr] = pos;
const FROM = Number(opt("--from", 2022)), SEASON = Number(opt("--season", new Date().getFullYear())), YDS = Number(opt("--yds", 300));
const runDate = new Date().toLocaleDateString("en-CA", { timeZone: "America/New_York" });
const slug = String(who || "player").toLowerCase().replace(/[^a-z]+/g, "-");
const OUT = path.join(__dirname, "..", "data", "nfl", "players", runDate, slug);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const save = (n, o) => { fs.mkdirSync(OUT, { recursive: true }); fs.writeFileSync(path.join(OUT, n), JSON.stringify(o)); };
const SITE = "https://site.api.espn.com/apis/site/v2/sports/football/nfl";
const WEB = "https://site.web.api.espn.com/apis/common/v3/sports/football/nfl";

async function get(url) {
  for (let i = 1; i <= 4; i += 1) {
    try { const r = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0 Stat Desk (Nosebleed Sports)" } }); if (r.ok) return await r.json(); if (r.status === 404) return null; }
    catch (e) { /* retry */ }
    await sleep(800 * i);
  }
  return null;
}

async function espn() {
  const log = { who, teamAbbr, oppAbbr, at: new Date().toISOString() };
  const teams = ((await get(`${SITE}/teams`)) || {}).sports?.[0]?.leagues?.[0]?.teams?.map((t) => t.team) || [];
  const team = teams.find((t) => t.abbreviation === teamAbbr), opp = teams.find((t) => t.abbreviation === oppAbbr);
  log.team = team && { id: team.id, name: team.displayName }; log.opp = opp && { id: opp.id, name: opp.displayName };
  // Find the athlete on his team's roster (no guessing ids).
  const ros = team ? await get(`${SITE}/teams/${team.id}/roster`) : null;
  const all = ((ros && ros.athletes) || []).flatMap((g) => g.items || []);
  const ath = all.find((a) => (a.fullName || a.displayName || "").toLowerCase() === String(who).toLowerCase());
  if (!ath) throw new Error(`${who} not found on ${teamAbbr} roster`);
  log.athlete = { id: ath.id, name: ath.fullName, position: ath.position && ath.position.abbreviation };
  console.log(`ESPN: ${ath.fullName} id ${ath.id}; ${log.team && log.team.name} vs ${log.opp && log.opp.name}`);
  save("espn-athlete.json", { log, athlete: ath, overview: await get(`${WEB}/athletes/${ath.id}/overview`), stats: await get(`${WEB}/athletes/${ath.id}/stats`) });
  for (let y = FROM; y <= SEASON; y += 1) {
    save(`espn-gamelog-${y}.json`, await get(`${WEB}/athletes/${ath.id}/gamelog?season=${y}`));
    save(`espn-splits-${y}.json`, await get(`${WEB}/athletes/${ath.id}/splits?season=${y}`));
    await sleep(200);
  }
  // Every completed game this season for both teams: full summaries.
  for (const t of [team, opp].filter(Boolean)) {
    const out = { team: { id: t.id, abbreviation: t.abbreviation, name: t.displayName }, games: [] };
    for (const st of [2, 3]) {
      const sch = await get(`${SITE}/teams/${t.id}/schedule?season=${SEASON}&seasontype=${st}`);
      for (const ev of (sch && sch.events) || []) {
        const done = ev.competitions && ev.competitions[0] && ev.competitions[0].status && ev.competitions[0].status.type && ev.competitions[0].status.type.completed;
        out.games.push({ id: ev.id, date: ev.date, name: ev.name, seasontype: st, week: ev.week && ev.week.number, completed: !!done,
          summary: done ? await get(`${SITE}/summary?event=${ev.id}`) : null });
        await sleep(150);
      }
    }
    save(`espn-${t.abbreviation}-${SEASON}-games.json`, out);
    console.log(`ESPN: ${t.abbreviation} ${out.games.filter((g) => g.completed).length} completed games`);
  }
  const d = runDate.replace(/-/g, "");
  save("espn-scoreboard-today.json", await get(`${SITE}/scoreboard?dates=${d}`));
  return log;
}

async function stathead() {
  const { StatheadBrowser } = require("../lib/stathead-browser");
  const sh = new StatheadBrowser({ dataDir: path.join(__dirname, "..", "data", "browser"), runDate, idPrefix: "NP" });
  const BASE = "https://www.sports-reference.com/stathead/football/player-game-finder.cgi";
  try {
    for (const comp of ["reg", "post"]) {
      const url = `${BASE}?request=1&match=player_game&year_min=${FROM}&year_max=${SEASON}&comp_type=${comp}&order_by=pass_yds&order_by_asc=0&ccomp[1]=gt&cval[1]=${YDS}&cstat[1]=pass_yds`;
      let next = url; let n = 0;
      while (next && n < 8) {
        let rec = null;
        for (let t = 1; t <= 3 && !rec; t += 1) { try { rec = await sh.query(next, { label: `${YDS}+ passing-yard games ${FROM}-${SEASON} (${comp})${n ? ` page ${n + 1}` : ""}` }); } catch (e) { if (/withheld/i.test(e.message)) throw e; await sleep(4000 * t); } }
        if (!rec) { console.log(`Stathead ${comp}: page ${n + 1} failed`); break; }
        console.log(`Stathead ${comp}: page ${n + 1}, ${rec.rowCount} rows`);
        next = rec.next; n += 1;
      }
    }
  } finally { await sh.close(); }
}

async function main() {
  if (!who || !teamAbbr || !oppAbbr) throw new Error('usage: player-pull.js "Brock Purdy" SF WSH');
  try { await espn(); } catch (e) { console.log(`ESPN FAILED: ${e.message}`); save("espn-error.json", { error: e.message }); }
  try { await stathead(); } catch (e) { console.log(`STATHEAD FAILED: ${e.message}`); }
  if (!argv.includes("--commit")) return;
  const { spawnSync } = require("child_process");
  const repo = path.join(__dirname, "..", "..");
  const git = (...x) => spawnSync("git", x, { cwd: repo, encoding: "utf8" }).status;
  git("config", "user.name", "statdesk-bot"); git("config", "user.email", "noreply@anthropic.com");
  git("add", "statdesk/data/nfl/players", "statdesk/data/browser");
  if (git("diff", "--cached", "--quiet") === 0) return;
  git("commit", "-m", `Stat Desk NFL: ${who} player pull ${runDate}`);
  const branch = process.env.GITHUB_REF_NAME || "main";
  for (let i = 1; i <= 5; i += 1) {
    if (git("pull", "--rebase", "origin", branch) === 0 && git("push", "origin", `HEAD:${branch}`) === 0) { console.log("[nfl-player] pushed"); return; }
    await sleep(i * 4000);
  }
  process.exitCode = 1;
}
main().catch((e) => { console.error(e.stack || e.message); process.exit(1); });
