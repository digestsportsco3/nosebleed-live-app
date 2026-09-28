#!/usr/bin/env node
// Re-runs a sample of the decade FACTS on Stathead with the same filters.
//
// An "only / two / few" fact is an exact count over the complete pull. Rules
// built from plain comparisons carry a Season Finder spec with those same
// filters and the same year range, so Stathead — a second, independently
// maintained record, in Nick's signed-in browser — should return the same set
// of player-seasons. Same set: AGREE. Anything else is reported with the
// extra or missing rows named, never reconciled.
//
// Age rules are sampled last: the two sources can age a season differently
// by a year, which is a formatting difference, not a disagreement about who
// did what.
//
//   node statdesk/verify-facts.js [--commit] [1990 2000 ...]     SAMPLES=6
"use strict";
const fs = require("fs");
const path = require("path");
const { StatheadBrowser } = require("./lib/stathead-browser");
const { seasonFinder } = require("./lib/finder");

const dataDir = path.join(__dirname, "data", "decades");
const only = process.argv.slice(2).filter((a) => /^\d{4}$/.test(a));
const perDecade = Number(process.env.SAMPLES || 5);
const norm = (s) => String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase()
  .replace(/[^a-z ]/g, "").replace(/\b(jr|sr|ii|iii|iv)\b/g, "").replace(/\s+/g, " ").trim();

function sample(d) {
  const eligible = d.facts.filter((f) => f.finder && ["only", "pair", "few"].includes(f.kind));
  const noAge = eligible.filter((f) => f.finder.ageMin == null && f.finder.ageMax == null);
  const withAge = eligible.filter((f) => !noAge.includes(f));
  // Spread across the list rather than taking the top five, which would all
  // be the same kind.
  const pick = (arr, k) => { const out = []; for (let i = 0; i < arr.length && out.length < k; i += Math.max(1, Math.floor(arr.length / k))) out.push(arr[i]); return out; };
  return [...pick(noAge, perDecade), ...pick(withAge, Math.max(0, perDecade - noAge.length))].slice(0, perDecade);
}

async function main() {
  const files = fs.readdirSync(dataDir).filter((f) => /^\d{4}s-facts\.json$/.test(f)).sort().filter((f) => !only.length || only.includes(f.slice(0, 4)));
  if (!files.length) { console.error("No decade fact files to verify."); process.exit(2); }
  const runDate = new Date().toLocaleDateString("en-CA", { timeZone: "America/New_York" });
  const sh = new StatheadBrowser({ dataDir: path.join(__dirname, "data", "browser"), runDate, idPrefix: "F" });
  const results = [];
  try {
    for (const f of files) {
      const d = JSON.parse(fs.readFileSync(path.join(dataDir, f), "utf8"));
      console.log(`\n${d.decade}`);
      for (const fact of sample(d)) {
        const url = seasonFinder(fact.finder);
        const ours = fact.evidence.map((e) => `${norm(e.name)}|${e.season}`);
        let rec = null, theirs = null, verdict, note = "";
        try {
          rec = await sh.query(url, { label: `Verify fact [${d.decade}] #${fact.n} ${fact.rule}`, note: `Same filters and year range as the fact. Expected ${ours.length} player-season(s).` });
          theirs = rec.rows.map((r) => `${norm(r.name_display || r.player)}|${r.year_id || r.year_ID || r.season || "?"}`);
          if (rec.capped) { verdict = "CAPPED"; note = "Stathead truncated the result set"; }
          else {
            const O = new Set(ours), Tt = new Set(theirs);
            let missing = [...O].filter((x) => !Tt.has(x)); let extra = [...Tt].filter((x) => !O.has(x));
            if (!missing.length && !extra.length) verdict = "AGREE";
            else {
              // "Hank Aaron|1973" and "Henry Aaron|1973", "Brian L Hunter" and
              // "Brian Hunter": same surname, same season, same row. Match the
              // leftovers on surname + year before calling it a disagreement.
              const sy = (x) => { const [nm, y] = x.split("|"); return `${nm.split(" ").pop()}|${y}`; };
              const M2 = new Set(missing.map(sy)), E2 = new Set(extra.map(sy));
              const nameOnly = missing.every((x) => E2.has(sy(x))) && extra.every((x) => M2.has(sy(x)));
              if (nameOnly) { verdict = "AGREE (name form differs)"; note = `${missing.join(", ")} = ${extra.join(", ")}`; }
              else {
                // A traded player's combined season is one row in the API and
                // two stints on Stathead's finder, so neither half clears the
                // filters. That is a presentation difference, not a finding,
                // and it is reported as its own verdict rather than folded
                // into either agree or disagree.
                // The API's combined row for a traded player carries no team, so
                // the stored label is "multiple teams"; older files say "2+ teams".
                const traded = new Set(fact.evidence.filter((e) => /^(2\+ teams|multiple teams)$/.test(e.team)).map((e) => `${norm(e.name)}|${e.season}`));
                if (!extra.length && missing.every((x) => traded.has(x))) { verdict = "UNVERIFIABLE (traded-player season; Stathead splits stints)"; note = missing.join(", "); }
                else { verdict = "DISAGREE"; note = `${missing.length ? `not on Stathead: ${missing.join(", ")}` : ""}${missing.length && extra.length ? "; " : ""}${extra.length ? `Stathead also has: ${extra.join(", ")}` : ""}`; }
              }
            }
          }
        } catch (e) { verdict = `QUERY FAILED`; note = e.message; }
        console.log(`  #${String(fact.n).padStart(3)} ${fact.kind.padEnd(4)} ${fact.rule.padEnd(20)} ours=${ours.length} stathead=${theirs ? theirs.length : "—"}  -> ${verdict}${note ? `  (${note})` : ""}`);
        results.push({ decade: d.decade, n: fact.n, kind: fact.kind, rule: fact.rule, text: fact.text, ours, stathead: theirs, verdict, note, provenance: rec && rec.id, url });
      }
    }
  } finally { await sh.close(); }
  const report = { runDate, checks: results.length, agree: results.filter((r) => /^AGREE/.test(r.verdict)).length,
    disagree: results.filter((r) => r.verdict === "DISAGREE").length, unverifiable: results.filter((r) => /^UNVERIFIABLE/.test(r.verdict)).length,
    other: results.filter((r) => /^CAPPED|^QUERY FAILED/.test(r.verdict)).length, results };
  fs.writeFileSync(path.join(dataDir, `verify-facts-${runDate}.json`), JSON.stringify(report, null, 1));
  console.log(`\n${report.checks} checks: ${report.agree} agree, ${report.disagree} disagree, ${report.unverifiable} unverifiable as filtered, ${report.other} could not run.`);
  if (report.disagree || report.other) process.exitCode = 1;

  if (process.argv.includes("--commit")) {
    const { spawnSync } = require("child_process");
    const repo = path.join(__dirname, "..");
    const git = (...a) => { const r = spawnSync("git", a, { cwd: repo, encoding: "utf8" }); return { code: r.status, out: (r.stdout || "") + (r.stderr || "") }; };
    git("config", "user.name", "statdesk-bot"); git("config", "user.email", "noreply@anthropic.com");
    git("add", "statdesk/data/decades", "statdesk/data/browser");
    if (git("diff", "--cached", "--quiet").code === 0) { console.log("[verify] nothing to commit"); return; }
    console.log(git("commit", "-m", `Stat Desk decades: Stathead fact check ${runDate} (${report.agree}/${report.checks} agree)`).out.trim());
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
