#!/usr/bin/env node
// Postseason history from Stathead (Baseball Reference), for "first / only /
// Nth ever" framing on postseason items. Signed-in browser on Nick's machine.
// Stathead runs about a day behind, so yesterday's games may not be in these
// tables yet: the counts are "before this postseason" unless the row is there.
//
//   node statdesk/post-history.js [--commit]
"use strict";
const path = require("path");
const { StatheadBrowser } = require("./lib/stathead-browser");

const BASE = "https://www.sports-reference.com/stathead/baseball";
const game = (group, filters, extra = "") => `${BASE}/player-${group}-game-finder.cgi?request=1&match=player_game&year_min=1903&year_max=2026&comp_type=post${extra}&` +
  filters.map(([k, c, v], i) => `ccomp[${i + 1}]=${c}&cval[${i + 1}]=${v}&cstat[${i + 1}]=${k}`).join("&");
const Q = [
  ["post_6rbi_2hr", "Postseason games with 2+ HR and 6+ RBI (all time)", game("batting", [["b_hr", "gt", 2], ["b_rbi", "gt", 6]])],
  ["post_4h_2hr_6rbi", "Postseason games with 4+ H, 2+ HR, 6+ RBI", game("batting", [["b_h", "gt", 4], ["b_hr", "gt", 2], ["b_rbi", "gt", 6]])],
  ["post_10k_0er", "Postseason starts with 10+ K and 0 ER", game("pitching", [["p_so", "gt", 10], ["p_er", "lt", 0]], "&role=GS")],
  ["post_7ip_1h_0er", "Postseason starts of 7+ IP, 1 or fewer H, 0 ER", game("pitching", [["p_ip", "gt", 7], ["p_h", "lt", 1], ["p_er", "lt", 0]], "&role=GS")],
  ["post_3h_age21", "Postseason games with 3+ hits at age 21 or younger", game("batting", [["b_h", "gt", 3]], "&age_max=21")],
  ["post_3ip_0r_relief_age22", "Postseason relief outings of 3+ IP, 0 R, age 22 or younger", game("pitching", [["p_ip", "gt", 3], ["p_r", "lt", 0]], "&role=RP&age_max=22")],
];

async function main() {
  const runDate = new Date().toLocaleDateString("en-CA", { timeZone: "America/New_York" });
  const sh = new StatheadBrowser({ dataDir: path.join(__dirname, "data", "browser"), runDate, idPrefix: "PH" });
  try {
    for (const [key, label, url] of Q) {
      try { const r = await sh.queryAll(url, { label: `${key}: ${label}`, maxPages: 3 }); console.log(`${key}: ${r.rowCount} rows${r.complete ? "" : " (MORE PAGES)"}`); }
      catch (e) { console.log(`${key}: FAILED ${e.message}`); }
    }
  } finally { await sh.close(); }
  if (!process.argv.includes("--commit")) return;
  const { spawnSync } = require("child_process");
  const repo = path.join(__dirname, "..");
  const git = (...x) => { const r = spawnSync("git", x, { cwd: repo, encoding: "utf8" }); return { code: r.status }; };
  git("config", "user.name", "statdesk-bot"); git("config", "user.email", "noreply@anthropic.com");
  git("add", "statdesk/data/browser");
  if (git("diff", "--cached", "--quiet").code === 0) return;
  git("commit", "-m", "Stat Desk MLB: Stathead postseason history");
  const branch = process.env.GITHUB_REF_NAME || "main";
  for (let i = 1; i <= 5; i += 1) {
    if (git("pull", "--rebase", "origin", branch).code === 0 && git("push", "origin", `HEAD:${branch}`).code === 0) { console.log("[post-history] pushed"); return; }
    await new Promise((r) => setTimeout(r, i * 4000));
  }
  process.exitCode = 1;
}
main().catch((e) => { console.error(e.stack || e.message); process.exit(1); });
