#!/usr/bin/env node
// Independent cross-check of the decade summaries against Stathead.
//
// The summaries are computed from the MLB Stats API, the official record.
// This asks a second, independently maintained source — Stathead / Baseball
// Reference, in Nick's signed-in browser — for the same season's leader in the
// same category and reports whether the two agree. It is the same discipline
// the daily brief uses with ESPN: a disagreement is REPORTED, never quietly
// reconciled, because which source is right is a judgment for a person.
//
// Counting stats only (HR, RBI, H, SB, W, SO, SV). Rate stats carry
// qualification rules that differ between sources and would produce
// disagreements that mean nothing.
//
// Runs on the self-hosted machine only (Stathead blocks datacenter IPs).
//
//   node statdesk/verify-decades.js            # 4 checks per decade
//   node statdesk/verify-decades.js 1990 2000  # only these decades
//   SAMPLES=6 node statdesk/verify-decades.js  # more checks per decade
"use strict";
const fs = require("fs");
const path = require("path");
const { StatheadBrowser } = require("./lib/stathead-browser");
const { seasonFinder } = require("./lib/finder");

const dataDir = path.join(__dirname, "data", "decades");
const only = process.argv.slice(2).filter((a) => /^\d{4}$/.test(a));
const perDecade = Number(process.env.SAMPLES || 4);

// Category -> [group, finder stat key, summary key, Stathead column]
const CATS = [
  ["batting", "HR", "HR", "b_hr"], ["batting", "RBI", "RBI", "b_rbi"], ["batting", "H", "H", "b_h"], ["batting", "SB", "SB", "b_sb"],
  ["pitching", "W", "W", "p_w"], ["pitching", "SO", "SO", "p_so"], ["pitching", "SV", "SV", "p_sv"],
];
// The API writes "Nolan Ryan Jr."; Stathead writes "Nolan Ryan". Suffixes and
// accents are not disagreements about who led the league.
const norm = (s) => String(s || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
  .replace(/[^a-z ]/g, "").replace(/\b(jr|sr|ii|iii|iv)\b/g, "").replace(/\s+/g, " ").trim();

// Deterministic spread: season i*3 within the decade, alternating groups, so
// the same checks re-run identically and every decade is sampled across its
// span rather than at one end.
function picks(summary) {
  const out = [];
  for (let i = 0; i < perDecade; i += 1) {
    const season = summary.seasons[(i * 3) % summary.seasons.length];
    let cat = CATS[i % CATS.length];
    if (cat[2] === "SV" && season.season < 1969) cat = CATS[0]; // saves are not a period stat before 1969
    out.push({ season, cat });
  }
  return out;
}

async function main() {
  const files = fs.readdirSync(dataDir).filter((f) => /^\d{4}s\.json$/.test(f)).sort()
    .filter((f) => !only.length || only.includes(f.slice(0, 4)));
  if (!files.length) { console.error("No decade summaries to verify."); process.exit(2); }
  const runDate = new Date().toLocaleDateString("en-CA", { timeZone: "America/New_York" });
  const sh = new StatheadBrowser({ dataDir: path.join(__dirname, "data", "browser"), runDate, idPrefix: "V" });

  const results = [];
  try {
    for (const f of files) {
      const summary = JSON.parse(fs.readFileSync(path.join(dataDir, f), "utf8"));
      console.log(`\n${summary.decade}`);
      for (const { season, cat } of picks(summary)) {
        const [group, statKey, sumKey, col] = cat;
        const ours = (group === "batting" ? season.hitting : season.pitching)[sumKey];
        const url = seasonFinder({ group, season: season.season, qualifiers: "nomin", filters: [], sort: [statKey, "desc"] });
        let rec, verdict, theirs = null;
        try {
          rec = await sh.query(url, { label: `Verify [${summary.decade}] ${season.season} ${statKey} leader`, note: "Cross-check of the decade summary's computed leader against Stathead's sorted season finder." });
          const rows = rec.rows.filter((r) => r[col] !== undefined && r[col] !== "");
          if (!rows.length) verdict = "NO ROWS";
          else {
            const top = Number(String(rows[0][col]).replace(/,/g, ""));
            const tied = rows.filter((r) => Number(String(r[col]).replace(/,/g, "")) === top);
            theirs = tied.map((r) => ({ name: r.name_display || r.player || "?", value: top }));
            const ourNames = new Set(ours.leaders.map((l) => norm(l.name)));
            const theirNames = new Set(theirs.map((t) => norm(t.name)));
            const sameValue = ours.leaders.length && ours.leaders[0].value === top;
            const overlap = [...ourNames].some((n) => theirNames.has(n));
            verdict = sameValue && overlap && ourNames.size === theirNames.size ? "AGREE"
                    : sameValue && overlap ? "AGREE (tie list differs)"
                    : "DISAGREE";
          }
        } catch (e) { verdict = `QUERY FAILED: ${e.message}`; }
        const line = `  ${season.season} ${statKey.padEnd(3)} ours: ${ours.leaders.map((l) => `${l.name} ${l.shown}`).join(" / ") || "—"}  |  stathead: ${theirs ? theirs.map((t) => `${t.name} ${t.value}`).join(" / ") : "—"}  ->  ${verdict}`;
        console.log(line);
        results.push({ decade: summary.decade, season: season.season, stat: statKey, ours: ours.leaders, stathead: theirs, verdict, provenance: rec && rec.id, url });
      }
    }
  } finally { await sh.close(); }

  const report = { runDate, checks: results.length,
    agree: results.filter((r) => /^AGREE/.test(r.verdict)).length,
    disagree: results.filter((r) => r.verdict === "DISAGREE").length,
    failed: results.filter((r) => !/^AGREE|^DISAGREE/.test(r.verdict)).length,
    results };
  fs.writeFileSync(path.join(dataDir, `verify-${runDate}.json`), JSON.stringify(report, null, 1));
  console.log(`\n${report.checks} checks: ${report.agree} agree, ${report.disagree} disagree, ${report.failed} could not run.`);
  console.log(`Report: statdesk/data/decades/verify-${runDate}.json`);
  if (report.disagree || report.failed) process.exitCode = 1;

  if (process.argv.includes("--commit")) {
    const { spawnSync } = require("child_process");
    const repo = path.join(__dirname, "..");
    const git = (...a) => { const r = spawnSync("git", a, { cwd: repo, encoding: "utf8" }); return { code: r.status, out: (r.stdout || "") + (r.stderr || "") }; };
    git("config", "user.name", "statdesk-bot"); git("config", "user.email", "noreply@anthropic.com");
    git("add", "statdesk/data/decades", "statdesk/data/browser");
    if (git("diff", "--cached", "--quiet").code === 0) { console.log("[verify] nothing to commit"); return; }
    console.log(git("commit", "-m", `Stat Desk decades: Stathead cross-check ${runDate} (${report.agree}/${report.checks} agree)`).out.trim());
    const branch = process.env.GITHUB_REF_NAME || "main";
    for (let i = 1; i <= 3; i += 1) {
      if (git("pull", "--rebase", "origin", branch).code !== 0) { await new Promise((r) => setTimeout(r, i * 5000)); continue; }
      if (git("push", "origin", `HEAD:${branch}`).code === 0) { console.log(`[verify] pushed ${git("rev-parse", "--short", "HEAD").out.trim()}`); return; }
      await new Promise((r) => setTimeout(r, i * 5000));
    }
    console.error("[verify] could not push"); process.exitCode = 1;
  }
}

main().catch((e) => { console.error(e.stack || e.message); process.exit(1); });
