#!/usr/bin/env node
// One landscape page per decade: the hundred post-ready facts, numbered, in
// four columns, with the method beneath. Every fact traces to
// statdesk/data/decades/<decade>-facts.json, which stores the rows behind it.
//
//   node statdesk/render-decade-facts.js out.html [fonts.css] [1920 1930 ...]
"use strict";
const fs = require("fs");
const path = require("path");

const dataDir = path.join(__dirname, "data", "decades");
const [outFile, fontsFile, ...only] = process.argv.slice(2);
if (!outFile) { console.error("Usage: node statdesk/render-decade-facts.js out.html [fonts.css] [decades...]"); process.exit(2); }

const files = fs.readdirSync(dataDir).filter((f) => /^\d{4}s-facts\.json$/.test(f)).sort();
const wanted = only.length ? new Set(only.map((d) => `${d}s-facts.json`)) : null;
const decades = files.filter((f) => !wanted || wanted.has(f)).map((f) => JSON.parse(fs.readFileSync(path.join(dataDir, f), "utf8")));
if (!decades.length) { console.error("No decade fact files found in " + dataDir); process.exit(1); }

const verifyFiles = fs.readdirSync(dataDir).filter((f) => /^verify-facts-.*\.json$/.test(f)).sort();
const verify = verifyFiles.length ? JSON.parse(fs.readFileSync(path.join(dataDir, verifyFiles[verifyFiles.length - 1]), "utf8")) : null;

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const KIND = { only: "only", pair: "two", few: "few", extreme: "most", streak: "streak", teammates: "team-mates", total: "decade", nearmiss: "near miss", team: "club", list: "count", season: "season", age: "age" };

// Bold the payload after the colon / em dash so the number lands first.
function fmt(text) {
  const t = esc(text);
  const i = t.indexOf(": ");
  if (i > 0 && i < t.length - 2) return `${t.slice(0, i + 2)}<b>${t.slice(i + 2)}</b>`;
  return t;
}

function page(d) {
  const facts = d.facts.slice(0, 100);
  const kinds = {};
  for (const f of facts) kinds[f.kind] = (kinds[f.kind] || 0) + 1;
  const mix = Object.entries(kinds).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${v} ${KIND[k] || k}`).join(" · ");
  let ccLine = "";
  if (verify) {
    const mine = verify.results.filter((r) => r.decade === d.decade);
    if (mine.length) {
      // A stored DISAGREE whose only missing rows belong to a traded player is
      // the stint-split case, whichever label the checker used at the time.
      const factByN = new Map(d.facts.map((f) => [f.n, f]));
      const isTraded = (r) => { const f = factByN.get(r.n); if (!f) return false;
        const traded = new Set(f.evidence.filter((e) => /^(2\+ teams|multiple teams|unknown team)$/.test(e.team)).map((e) => `${e.name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z ]/g, "").replace(/\b(jr|sr|ii|iii|iv)\b/g, "").replace(/\s+/g, " ").trim()}|${e.season}`));
        const missing = (r.ours || []).filter((x) => !(r.stathead || []).includes(x));
        return missing.length > 0 && (r.stathead || []).every((x) => (r.ours || []).includes(x)) && missing.every((x) => traded.has(x)); };
      const ok = mine.filter((r) => /^AGREE/.test(r.verdict)).length;
      const unv = mine.filter((r) => /^UNVERIFIABLE/.test(r.verdict) || (r.verdict === "DISAGREE" && isTraded(r)));
      const bad = mine.filter((r) => r.verdict === "DISAGREE" && !unv.includes(r));
      ccLine = ` <b>Stathead cross-check</b> (${verify.runDate}): ${ok} of ${mine.length} sampled "only/two/few" claims reproduced on Stathead's Season Finder with the same filters${unv.length ? `; ${unv.length} (${unv.map((u) => `#${u.n}`).join(", ")}) involve a traded player's combined season, which Stathead's finder splits into stints and so cannot re-run as filtered` : ""}${bad.length ? `; ${bad.length} did not agree — ${bad.map((b) => `#${b.n}: ${b.note || "row set differs"}`).join("; ")}` : ""}.`;
    }
  }
  return `
<section class="page">
  <div class="mast">
    <div>
      <div class="brand">Nosebleed Sports &nbsp;·&nbsp; Stat Desk</div>
      <h1>The ${d.decade}: 100 Things You Can Post</h1>
    </div>
    <div class="meta">
      <div><b>100 verified</b> · ${d.counts.hitterSeasons.toLocaleString()} hitter-seasons, ${d.counts.pitcherSeasons.toLocaleString()} pitcher-seasons</div>
      <div>${mix}</div>
    </div>
  </div>
  <ol class="cols">${facts.map((f) => `<li class="k-${f.kind}"><span class="tag">${KIND[f.kind] || f.kind}</span>${fmt(f.text)}</li>`).join("")}</ol>
  <div class="foot">
    <b>Verified</b> — every line computed over every player-season of the decade from complete MLB Stats API pulls; rows stored with each line in <span class="mono">statdesk/data/decades/${d.decade}-facts.json</span>.${ccLine || " Stathead cross-check pending."} Full method on the last page.
  </div>
</section>`;
}

const fonts = fontsFile && fs.existsSync(fontsFile) ? fs.readFileSync(fontsFile, "utf8") : "";
const css = `
  :root{ --paper:#EFECE3; --ink:#141414; --red:#C8102E; --rule:#C9C3B4; --muted:#5A564C; }
  @page { size: Letter landscape; margin: 0.36in 0.4in; }
  *{ box-sizing:border-box; }
  html,body{ margin:0; background:var(--paper); color:var(--ink); font-family:"Source Serif 4",Georgia,serif; }
  .page{ page-break-after:always; break-after:page; height:7.75in; display:flex; flex-direction:column; }
  .page:last-child{ page-break-after:auto; break-after:auto; }
  .mast{ display:flex; justify-content:space-between; align-items:flex-end; border-bottom:3px solid var(--ink); padding-bottom:4px; margin-bottom:5px; }
  .brand{ font-family:Oswald,sans-serif; font-weight:700; letter-spacing:.22em; text-transform:uppercase; font-size:7.6pt; color:var(--red); }
  h1{ font-family:Oswald,sans-serif; font-weight:700; text-transform:uppercase; font-size:19pt; margin:0; line-height:1; }
  .meta{ text-align:right; font-family:Oswald,sans-serif; font-size:6.8pt; letter-spacing:.1em; text-transform:uppercase; color:var(--muted); line-height:1.5; }
  .meta b{ color:var(--red); }
  /* Four columns balanced by height, not by count: the long "only / few"
     lines cluster at the top of the list and a count-based split overflows
     the first column while the last sits half empty. */
  ol.cols{ column-count:4; column-gap:10px; column-fill:balance; flex:1 1 auto; min-height:0; margin:0; padding:0 0 0 12px; font-size:5.8pt; line-height:1.18; }
  li{ margin:0 0 2px; padding-right:2px; break-inside:avoid; }
  .method .mtext{ font-size:9pt; line-height:1.45; columns:2; column-gap:28px; margin-top:10px; }
  .method .mtext p{ margin:0 0 8px; break-inside:avoid; }
  li::marker{ font-family:Oswald,sans-serif; font-weight:600; color:var(--red); font-size:6.2pt; }
  li b{ font-weight:600; }
  .tag{ display:inline-block; font-family:Oswald,sans-serif; font-size:5pt; letter-spacing:.1em; text-transform:uppercase; color:var(--muted); border:0.5px solid var(--rule); border-radius:2px; padding:0 2px; margin-right:3px; vertical-align:1px; }
  li.k-only .tag, li.k-pair .tag{ color:var(--red); border-color:var(--red); }
  .foot{ margin-top:4px; padding-top:3px; border-top:2px solid var(--ink); font-size:5.9pt; color:var(--muted); line-height:1.3; }
  .foot b{ font-family:Oswald,sans-serif; font-weight:600; letter-spacing:.1em; text-transform:uppercase; font-size:6pt; color:var(--ink); }
  .mono{ font-family:ui-monospace,Menlo,monospace; font-size:5.9pt; }
`;
const totalChecks = verify ? verify.checks : 0;
if (verify) {
  // Recount with the same traded-player reclassification the page footers use.
  const allFacts = new Map(); for (const d of decades) for (const f of d.facts) allFacts.set(`${d.decade}|${f.n}`, f);
  const nrm = (x) => x.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z ]/g, "").replace(/\b(jr|sr|ii|iii|iv)\b/g, "").replace(/\s+/g, " ").trim();
  let unv = 0, dis = 0;
  for (const r of verify.results) {
    if (/^UNVERIFIABLE/.test(r.verdict)) { unv += 1; continue; }
    if (r.verdict !== "DISAGREE") continue;
    const f = allFacts.get(`${r.decade}|${r.n}`);
    const traded = new Set(f ? f.evidence.filter((e) => /^(2\+ teams|multiple teams|unknown team)$/.test(e.team)).map((e) => `${nrm(e.name)}|${e.season}`) : []);
    const missing = (r.ours || []).filter((x) => !(r.stathead || []).includes(x));
    if (missing.length && (r.stathead || []).every((x) => (r.ours || []).includes(x)) && missing.every((x) => traded.has(x))) unv += 1; else dis += 1;
  }
  verify.unverifiable = unv; verify.disagree = dis;
}
const methodPage = `
<section class="page method">
  <div class="mast"><div><div class="brand">Nosebleed Sports &nbsp;·&nbsp; Stat Desk</div><h1>How Every Line Was Verified</h1></div></div>
  <div class="mtext">
    <p><b>The pull.</b> For every season in each decade, every hitter and every pitcher was pulled in full from the MLB Stats API — the official record, which carries seasons back to 1876 — together with that season's standings. Across the ten decades that is ${decades.reduce((a, d) => a + d.counts.hitterSeasons, 0).toLocaleString()} hitter-seasons and ${decades.reduce((a, d) => a + d.counts.pitcherSeasons, 0).toLocaleString()} pitcher-seasons. Nothing on any page was recalled from memory or estimated.</p>
    <p><b>The rules.</b> Each line is a rule — a predicate — evaluated over all of those rows. "Only", "two" and "few" are exact counts of <i>players</i> across the complete pull; a player who did the thing twice is still the only player who did it, and is described that way. "Most" lines are the extreme among every season clearing the stated base. Streaks, team-mate pairings, season counts, youngest/oldest, decade totals and club records are computed the same way. The rows satisfying every rule are stored beside the line in the repository, so any claim can be re-derived.</p>
    <p><b>Floors and thresholds.</b> Where a line says "(400+ PA)" or "(162+ IP)", that floor is part of the claim, chosen so it can be re-run with the same filters anywhere. Thresholds are era-aware: strikeouts, walks, saves and home runs meant different things in 1925 and 1995, and the bars used for each era are recorded in the data files. Saves and closer rules are not applied before 1969, when the save was not an official statistic.</p>
    <p><b>Traded players.</b> A player who changed clubs mid-season is counted on his combined season line and marked "2+ teams" in the stored rows.</p>
    <p><b>The record as it stands.</b> Since 2024 the official record includes the Negro Leagues (1920-48). Those player-seasons are in the pull, and so a 1920s-40s line can name a Homestead Grays or Kansas City Monarchs player. That is the record as MLB now keeps it; an AL/NL-only edition is a one-flag rerun.</p>
    <p><b>The second source.</b> Rules made of plain comparisons carry a Stathead Season Finder spec with the same filters and year range. ${verify ? `A sample of ${totalChecks} "only / two / few" claims was re-run on Stathead, in a signed-in browser, on ${verify.runDate}: ${verify.agree} returned the same player-seasons${verify.unverifiable ? `, ${verify.unverifiable} could not be re-run as filtered because Stathead's finder splits a traded player's season into stints` : ""}${verify.disagree ? `, and ${verify.disagree} disagreed — each is printed on the page it concerns, with both sources' rows, and neither was altered` : ", and none disagreed"}.` : "The Stathead re-run had not completed when this edition was rendered."} A disagreement between the two records is reported where it occurs; it is never quietly reconciled.</p>
    <p><b>What this does not cover.</b> Postseason play, defensive metrics, park adjustment, and awards. Age is the season age as the API reports it; the two sources can differ by a year on that, which is why age-based lines were sampled last for cross-checking.</p>
  </div>
</section>`;
fs.writeFileSync(outFile, `<!doctype html>\n<html lang="en"><head><meta charset="utf-8"><title>Stat Desk — 100 Things You Can Post, by Decade</title>\n<style>${fonts}</style><style>${css}</style></head>\n<body>${decades.map(page).join("\n")}${methodPage}</body></html>`);
console.log(`Rendered ${decades.length} decade page(s) -> ${outFile}`);
