#!/usr/bin/env node
// Breakout / bright-spot hunting: every 2026 player season from Stathead, plus the same
// players' 2015-2025 seasons, so a "career year" is measured against the player's own past.
// Season finders (signed-in browser, >= 4 s per page), regular season only:
//   batting 2026 (PA >= --pa), pitching 2026 (IP >= --ip), and the same finders for
//   --from..2025 at the lower floors --pa-prior / --ip-prior.
// Paging uses explicit offsets (the "next" link has repeated pages before); rows are
// de-duplicated by player id + season + team, and each set records whether it ended
// on a short page (complete) or hit the page cap (incomplete - no "only/most" claims).
//   node statdesk/breakouts.js [--season 2026] [--from 2015] [--pa 150] [--ip 40] [--pa-prior 50] [--ip-prior 20] [--commit]
"use strict";
const fs = require("fs");
const path = require("path");
const { StatheadBrowser } = require("./lib/stathead-browser");

const argv = process.argv.slice(2);
const opt = (k, d) => { const i = argv.indexOf(k); return i >= 0 ? Number(argv[i + 1]) : d; };
const SEASON = opt("--season", 2026), FROM = opt("--from", 2015);
const PA = opt("--pa", 150), IP = opt("--ip", 40), PAP = opt("--pa-prior", 50), IPP = opt("--ip-prior", 20);
const BASE = "https://www.sports-reference.com/stathead/baseball";
const PER = 200, MAXP = 60;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function finder(sh, grp, y0, y1, stat, min, label) {
  const order = grp === "batting" ? "b_war" : "p_war";
  const url0 = `${BASE}/player-${grp}-season-finder.cgi?request=1&match=player_season&year_min=${y0}&year_max=${y1}&comp_type=reg&order_by=${order}&order_by_asc=0&ccomp[1]=gt&cval[1]=${min}&cstat[1]=${stat}`;
  const seen = new Map(); let headers = null; let complete = false; let pages = 0;
  for (let p = 0; p < MAXP; p += 1) {
    const url = p ? `${url0}&offset=${p * PER}` : url0;
    let rec = null;
    for (let t = 1; t <= 3 && !rec; t += 1) {
      try { rec = await sh.query(url, { label: `${label} page ${p + 1}` }); }
      catch (e) { if (/withheld|not authenticated/i.test(e.message)) throw e; console.log(`retry ${t}: ${e.message}`); await sleep(5000 * t); }
    }
    if (!rec) { console.log(`${label}: page ${p + 1} failed`); break; }
    pages += 1; headers = headers || rec.headers;
    let fresh = 0;
    for (const r of rec.rows) {
      const k = `${r._id || r.name_display}|${r.year_id}|${r.teams_played_for}`;
      if (!seen.has(k)) { seen.set(k, r); fresh += 1; }
    }
    console.log(`${label}: page ${p + 1} ${rec.rows.length} rows, ${fresh} new (${seen.size} total)`);
    if (rec.rows.length < PER || fresh === 0) { complete = rec.rows.length < PER; break; }
  }
  return { url: url0, headers, rows: [...seen.values()], pages, complete };
}

async function main() {
  const runDate = new Date().toLocaleDateString("en-CA", { timeZone: "America/New_York" });
  const sh = new StatheadBrowser({ runDate, idPrefix: "BK" });
  const out = { season: SEASON, from: FROM, floors: { PA, IP, PAP, IPP }, at: new Date().toISOString(), sets: {} };
  try {
    out.sets.bat = await finder(sh, "batting", SEASON, SEASON, "b_pa", PA - 1, `batting ${SEASON} PA>=${PA}`);
    out.sets.pit = await finder(sh, "pitching", SEASON, SEASON, "p_ip", IP - 0.1, `pitching ${SEASON} IP>=${IP}`);
    out.sets.batPrior = await finder(sh, "batting", FROM, SEASON - 1, "b_pa", PAP - 1, `batting ${FROM}-${SEASON - 1} PA>=${PAP}`);
    out.sets.pitPrior = await finder(sh, "pitching", FROM, SEASON - 1, "p_ip", IPP - 0.1, `pitching ${FROM}-${SEASON - 1} IP>=${IPP}`);
  } finally { await sh.close(); }
  for (const [k, v] of Object.entries(out.sets)) console.log(`${k}: ${v.rows.length} rows, ${v.pages} pages, complete ${v.complete}`);
  const dir = path.join(__dirname, "data", "mlb", "breakouts", runDate);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, `stathead-seasons-${SEASON}.json`), JSON.stringify(out));
  if (!argv.includes("--commit")) return;
  const { spawnSync } = require("child_process");
  const repo = path.join(__dirname, "..");
  const git = (...x) => spawnSync("git", x, { cwd: repo, encoding: "utf8" }).status;
  git("config", "user.name", "statdesk-bot"); git("config", "user.email", "noreply@anthropic.com");
  git("add", "statdesk/data/mlb/breakouts");
  if (git("diff", "--cached", "--quiet") === 0) return;
  git("commit", "-m", `Stat Desk MLB: Stathead season sets for breakouts ${runDate}`);
  const branch = process.env.GITHUB_REF_NAME || "main";
  for (let i = 1; i <= 5; i += 1) {
    if (git("pull", "--rebase", "origin", branch) === 0 && git("push", "origin", `HEAD:${branch}`) === 0) { console.log("[breakouts] pushed"); return; }
    await sleep(i * 4000);
  }
  process.exitCode = 1;
}
main().catch((e) => { console.error(e.stack || e.message); process.exit(1); });
