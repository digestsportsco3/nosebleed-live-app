#!/usr/bin/env node
// Stathead cross-check for vs-relievers.js: every postseason relief appearance
// by one team's pitchers (default CLE, 2022 on), read from the pitching game
// finder in the signed-in browser. Used to verify usage claims ("pitched in 14
// of the last 15 games") independently of the MLB API play-by-play. Stathead
// runs about a day behind, so the newest game may be missing; say so.
//
//   node statdesk/relievers-stathead.js [CLE] [--from 2022] [--commit]
"use strict";
const path = require("path");
const { StatheadBrowser } = require("./lib/stathead-browser");

const argv = process.argv.slice(2);
const fi = argv.indexOf("--from");
const from = fi >= 0 ? Number(argv[fi + 1]) : 2022;
const team = argv.find((a, i) => !a.startsWith("--") && argv[i - 1] !== "--from") || "CLE";
const BASE = "https://www.sports-reference.com/stathead/baseball";

async function main() {
  const runDate = new Date().toLocaleDateString("en-CA", { timeZone: "America/New_York" });
  const sh = new StatheadBrowser({ dataDir: path.join(__dirname, "data", "browser"), runDate, idPrefix: "RV" });
  try {
    for (const role of ["RP", "GS"]) {
      const url = `${BASE}/player-pitching-game-finder.cgi?request=1&match=player_game&year_min=${from}&year_max=2026&comp_type=post&team_id=${team}&role=${role}&order_by=date&order_by_asc=0`;
      try {
        const r = await sh.queryAll(url, { label: `${team} postseason ${role === "RP" ? "relief" : "starting"} appearances ${from}-2026`, maxPages: 6 });
        const teams = [...new Set(r.rows.map((x) => x.team_name_abbr || x.team_ID || x.team).filter(Boolean))];
        console.log(`${role}: ${r.rowCount} rows${r.complete ? "" : " (MORE PAGES)"}; team column values: ${teams.join(",")}`);
      } catch (e) { console.log(`${role}: FAILED ${e.message}`); }
    }
  } finally { await sh.close(); }
  if (!argv.includes("--commit")) return;
  const { spawnSync } = require("child_process");
  const repo = path.join(__dirname, "..");
  const git = (...x) => spawnSync("git", x, { cwd: repo, encoding: "utf8" }).status;
  git("config", "user.name", "statdesk-bot"); git("config", "user.email", "noreply@anthropic.com");
  git("add", "statdesk/data/browser");
  if (git("diff", "--cached", "--quiet") === 0) return;
  git("commit", "-m", `Stat Desk MLB: Stathead ${team} postseason pitching appearances`);
  const branch = process.env.GITHUB_REF_NAME || "main";
  for (let i = 1; i <= 5; i += 1) {
    if (git("pull", "--rebase", "origin", branch) === 0 && git("push", "origin", `HEAD:${branch}`) === 0) { console.log("[relievers-stathead] pushed"); return; }
    await new Promise((r) => setTimeout(r, i * 4000));
  }
  process.exitCode = 1;
}
main().catch((e) => { console.error(e.stack || e.message); process.exit(1); });
