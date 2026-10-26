#!/usr/bin/env node
// One pitcher with one club from a date on (e.g. since a trade), regular season AND
// postseason, from two independent sources so every line is cross-checked:
//   1. Stathead pitching game finder (signed-in browser, >= 4 s per query): every
//      start and relief outing by the club's pitchers in the season, regular season
//      and postseason, filtered to this pitcher.
//   2. MLB Stats API game logs for each game type (R, F, D, L, W), filtered to the club.
// Stathead runs about a day behind; the newest game may only be in the MLB API.
//   node statdesk/pitcher-span.js <mlbId> <MLB_ABBR> <STATHEAD_TEAM> --since YYYY-MM-DD [--name "Last"] [--commit]
"use strict";
const fs = require("fs");
const path = require("path");

const argv = process.argv.slice(2);
const opt = (k, d) => { const i = argv.indexOf(k); return i >= 0 ? argv[i + 1] : d; };
const [PID, ABBR, SHT] = argv.filter((a, i) => !a.startsWith("--") && !["--since", "--name"].includes(argv[i - 1]));
const SINCE = opt("--since", "1900-01-01"), SEASON = SINCE.slice(0, 4);
const API = "https://statsapi.mlb.com/api/v1";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function get(url) {
  for (let i = 1; i <= 4; i += 1) {
    try { const r = await fetch(url, { headers: { "User-Agent": "Stat Desk (Nosebleed Sports)" } }); if (r.ok) return await r.json(); if (r.status === 404) return null; }
    catch (e) { /* retry */ }
    await sleep(800 * i);
  }
  return null;
}
const splits = (b) => ((b && b.stats) || []).flatMap((x) => x.splits || []);

async function main() {
  if (!PID || !ABBR || !SHT) throw new Error("usage: pitcher-span.js <mlbId> <MLB_ABBR> <STATHEAD_TEAM> --since YYYY-MM-DD");
  const runDate = new Date().toLocaleDateString("en-CA", { timeZone: "America/New_York" });
  const who = ((await get(`${API}/people/${PID}`)) || {}).people?.[0];
  const last = opt("--name", who ? who.lastName : "");
  const out = { pitcher: who && { id: who.id, name: who.fullName }, team: ABBR, statheadTeam: SHT, since: SINCE, mlb: [], stathead: {}, at: new Date().toISOString() };
  for (const gt of ["R", "F", "D", "L", "W"]) {
    const gl = await get(`${API}/people/${PID}/stats?stats=gameLog&group=pitching&season=${SEASON}&gameType=${gt}&sportId=1`);
    for (const s of splits(gl)) {
      if (s.date < SINCE || !s.team || s.team.abbreviation !== ABBR) continue;
      out.mlb.push({ gameType: gt, date: s.date, pk: s.game && s.game.gamePk, opp: s.opponent && s.opponent.name, home: s.isHome, stat: s.stat });
    }
  }
  console.log(`MLB API: ${out.mlb.length} games for ${who && who.fullName} with ${ABBR} since ${SINCE}`);
  try {
    const { StatheadBrowser } = require("./lib/stathead-browser");
    const sh = new StatheadBrowser({ dataDir: path.join(__dirname, "data", "browser"), runDate, idPrefix: "PS" });
    const BASE = "https://www.sports-reference.com/stathead/baseball/player-pitching-game-finder.cgi";
    try {
      for (const comp of ["reg", "post"]) for (const role of ["GS", "RP"]) {
        const url = `${BASE}?request=1&match=player_game&year_min=${SEASON}&year_max=${SEASON}&comp_type=${comp}&team_id=${SHT}&role=${role}&order_by=date&order_by_asc=0`;
        let res = null;
        for (let t = 1; t <= 3 && !res; t += 1) { try { res = await sh.queryAll(url, { label: `${SHT} ${SEASON} ${comp} ${role} pitching games`, maxPages: 4 }); } catch (e) { if (/withheld/i.test(e.message)) throw e; console.log(`retry ${t}: ${e.message}`); await sleep(5000 * t); } }
        if (!res) { out.stathead[`${comp}-${role}`] = { error: "failed" }; continue; }
        const mine = res.rows.filter((r) => Object.values(r).some((v) => typeof v === "string" && v.includes(last)));
        out.stathead[`${comp}-${role}`] = { url, rowsTotal: res.rowCount, complete: res.complete, headers: res.headers, rows: mine };
        console.log(`Stathead ${comp} ${role}: ${res.rowCount} club rows (complete ${res.complete}), ${mine.length} for ${last}`);
      }
    } finally { await sh.close(); }
  } catch (e) { console.log(`STATHEAD FAILED: ${e.message}`); out.statheadError = e.message; }
  const dir = path.join(__dirname, "data", "mlb", "span", runDate);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, `${PID}-${ABBR}-since-${SINCE}.json`), JSON.stringify(out, null, 1));
  if (!argv.includes("--commit")) return;
  const { spawnSync } = require("child_process");
  const repo = path.join(__dirname, "..");
  const git = (...x) => spawnSync("git", x, { cwd: repo, encoding: "utf8" }).status;
  git("config", "user.name", "statdesk-bot"); git("config", "user.email", "noreply@anthropic.com");
  git("add", "statdesk/data/mlb/span", "statdesk/data/browser");
  if (git("diff", "--cached", "--quiet") === 0) return;
  git("commit", "-m", `Stat Desk MLB: ${who && who.fullName} with ${ABBR} since ${SINCE}`);
  const branch = process.env.GITHUB_REF_NAME || "main";
  for (let i = 1; i <= 5; i += 1) {
    if (git("pull", "--rebase", "origin", branch) === 0 && git("push", "origin", `HEAD:${branch}`) === 0) { console.log("[span] pushed"); return; }
    await sleep(i * 4000);
  }
  process.exitCode = 1;
}
main().catch((e) => { console.error(e.stack || e.message); process.exit(1); });
