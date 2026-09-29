#!/usr/bin/env node
// Official NHL season stats, every season since 1917-18, from the NHL's own
// stats API (api.nhle.com/stats/rest). Runs on Nick's machine: the cloud
// container cannot reach the NHL's hosts.
//
// Per season and game type (rs = regular season, po = playoffs):
//   statdesk/data/nhl/seasons/<YYYY-YY>-<rs|po>-skaters.json
//   statdesk/data/nhl/seasons/<YYYY-YY>-<rs|po>-goalies.json
//   statdesk/data/nhl/seasons/<YYYY-YY>-<rs|po>-teams.json
//   statdesk/data/nhl/seasons/<YYYY-YY>-rs-bios.json   (birth date, country)
// plus data/nhl/probe.json: one raw row per report, so field names are seen.
// Only the fields the fact engine uses are kept; nothing is estimated.
//
//   node statdesk/nhl/pull.js [fromYear toYear] [--commit]
"use strict";
const fs = require("fs");
const path = require("path");

const OUT = path.join(__dirname, "..", "data", "nhl");
const BASE = "https://api.nhle.com/stats/rest/en";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const label = (y) => `${y}-${String((y + 1) % 100).padStart(2, "0")}`;
const sid = (y) => `${y}${y + 1}`;
const KEEP = {
  skater: ["playerId", "skaterFullName", "seasonId", "teamAbbrevs", "positionCode", "shootsCatches", "gamesPlayed", "goals", "assists", "points", "plusMinus",
    "penaltyMinutes", "ppGoals", "ppPoints", "shGoals", "shPoints", "evGoals", "evPoints", "gameWinningGoals", "otGoals", "shots", "shootingPct", "timeOnIcePerGame", "faceoffWinPct"],
  goalie: ["playerId", "goalieFullName", "seasonId", "teamAbbrevs", "shootsCatches", "gamesPlayed", "gamesStarted", "wins", "losses", "ties", "otLosses", "shotsAgainst",
    "saves", "goalsAgainst", "savePct", "goalsAgainstAverage", "shutouts", "timeOnIce", "goals", "assists", "points", "penaltyMinutes"],
  team: ["teamId", "teamFullName", "seasonId", "gamesPlayed", "wins", "losses", "ties", "otLosses", "points", "pointPct", "goalsFor", "goalsAgainst", "goalsForPerGame",
    "goalsAgainstPerGame", "powerPlayPct", "penaltyKillPct", "shotsForPerGame", "shotsAgainstPerGame", "winsInShootout", "regulationAndOtWins"],
  bios: ["playerId", "skaterFullName", "birthDate", "birthCountryCode", "nationalityCode", "positionCode", "height", "weight", "draftYear", "draftRound", "draftOverall", "isInHallOfFameYn"],
};
const probe = {};
let requests = 0;

async function getJSON(url, label2) {
  for (let i = 1; i <= 5; i += 1) {
    try {
      requests += 1;
      const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0 (Stat Desk; Nosebleed Sports)", Accept: "application/json" } });
      if (res.ok) return await res.json();
      console.log(`  ${label2}: HTTP ${res.status} (try ${i})`);
    } catch (e) { console.log(`  ${label2}: ${e.message} (try ${i})`); }
    await sleep(1500 * i);
  }
  throw new Error(`${label2}: failed after 5 tries`);
}

// One report for one season, every page. The API returns {data, total}.
async function report(kind, y, gameType) {
  const endpoint = kind === "bios" ? "skater/bios" : kind === "team" ? "team/summary" : `${kind}/summary`;
  const sortKey = kind === "team" ? "teamId" : "playerId";
  const sort = encodeURIComponent(JSON.stringify([{ property: sortKey, direction: "ASC" }]));
  const exp = encodeURIComponent(`seasonId=${sid(y)} and gameTypeId=${gameType}`);
  const rows = []; let total = null;
  for (let start = 0; start < 20000; start += 100) {
    const j = await getJSON(`${BASE}/${endpoint}?isAggregate=false&isGame=false&sort=${sort}&start=${start}&limit=100&cayenneExp=${exp}`, `${kind} ${label(y)} ${gameType} @${start}`);
    total = j.total ?? total; const data = j.data || [];
    if (data.length && !probe[kind]) probe[kind] = data[0];
    for (const r of data) { const o = {}; for (const k of KEEP[kind]) if (r[k] !== undefined && r[k] !== null) o[k] = r[k]; rows.push(o); }
    await sleep(250);
    if (data.length < 100 || (total != null && rows.length >= total)) break;
  }
  return { rows, total };
}

function write(rel, data) { const f = path.join(OUT, rel); fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, JSON.stringify(data)); }

async function main() {
  const nums = process.argv.slice(2).filter((a) => /^\d{4}$/.test(a)).map(Number);
  const now = new Date(); const last = now.getUTCMonth() >= 9 ? now.getUTCFullYear() - 1 : now.getUTCFullYear() - 1; // latest completed season start
  const from = nums[0] || 1917, to = nums[1] || last;
  const summary = [];
  for (let y = from; y <= to; y += 1) {
    if (y === 2004) { summary.push(`${label(y)}: no season (lockout)`); continue; }
    for (const [gt, tag] of [[2, "rs"], [3, "po"]]) {
      for (const kind of ["skater", "goalie", "team"]) {
        const { rows, total } = await report(kind, y, gt);
        const pulledAt = new Date().toISOString();
        write(`seasons/${label(y)}-${tag}-${kind}s.json`, { season: label(y), type: tag, kind, source: `${BASE}/${kind === "team" ? "team" : kind}/summary seasonId=${sid(y)} gameTypeId=${gt}`, total, count: rows.length, pulledAt, rows });
        summary.push(`${label(y)} ${tag} ${kind}s: ${rows.length}${total != null && total !== rows.length ? ` (API total ${total})` : ""}`);
      }
    }
    const bios = await report("bios", y, 2);
    write(`seasons/${label(y)}-rs-bios.json`, { season: label(y), kind: "bios", total: bios.total, count: bios.rows.length, pulledAt: new Date().toISOString(), rows: bios.rows });
    console.log(summary.slice(-6).join(" | ") + ` | bios ${bios.rows.length}`);
  }
  write("probe.json", { pulledAt: new Date().toISOString(), requests, probe });
  write("pull-report.json", { at: new Date().toISOString(), requests, summary });
  console.log(`[nhl] ${requests} requests`);
  if (!process.argv.includes("--commit")) return;
  const { spawnSync } = require("child_process");
  const repo = path.join(__dirname, "..", "..");
  const git = (...x) => { const r = spawnSync("git", x, { cwd: repo, encoding: "utf8" }); return { code: r.status, out: (r.stdout || "") + (r.stderr || "") }; };
  git("config", "user.name", "statdesk-bot"); git("config", "user.email", "noreply@anthropic.com");
  git("add", "statdesk/data/nhl");
  if (git("diff", "--cached", "--quiet").code === 0) { console.log("[nhl] nothing to commit"); return; }
  git("commit", "-m", "Stat Desk NHL: official season pull");
  const branch = process.env.GITHUB_REF_NAME || "main";
  for (let i = 1; i <= 5; i += 1) {
    if (git("pull", "--rebase", "origin", branch).code === 0 && git("push", "origin", `HEAD:${branch}`).code === 0) { console.log("[nhl] pushed"); return; }
    await sleep(i * 4000);
  }
  console.error("[nhl] could not push"); process.exitCode = 1;
}
main().catch((e) => { console.error(e.stack || e.message); process.exit(1); });
