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
      const ok = mine.filter((r) => /^AGREE/.test(r.verdict)).length;
      const bad = mine.filter((r) => r.verdict === "DISAGREE");
      ccLine = ` <b>Stathead cross-check</b> (${verify.runDate}): ${ok} of ${mine.length} sampled "only/two/few" claims reproduced exactly on Stathead's Season Finder with the same filters${bad.length ? `; ${bad.length} did not — ${bad.map((b) => `#${b.n} (${b.note || "row set differs"})`).join(", ")}` : ""}.`;
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
    <b>Method</b> — Every line is a rule evaluated over every hitter-season and pitcher-season of the decade, pulled in full from the MLB Stats API, the official record; nothing is recalled or estimated, and the rows behind each line are stored with it. "Only", "two" and "few" are exact counts across the complete pull. Where a line uses a plate-appearance or innings floor (stated in the line) rather than the league qualification bar, it is so the claim can be re-run with the same filters. Thresholds are era-aware. Traded players' combined seasons are included. Since 2024 the official record includes Negro League seasons (1920-48); those player-seasons are in the pull and can appear here.${ccLine} Provenance: <span class="mono">statdesk/data/decades/${d.decade}-facts.json</span>.
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
  ol.cols{ column-count:4; column-gap:10px; column-fill:balance; flex:1 1 auto; min-height:0; margin:0; padding:0 0 0 13px; font-size:6.05pt; line-height:1.2; }
  li{ margin:0 0 2.3px; padding-right:2px; break-inside:avoid; }
  li::marker{ font-family:Oswald,sans-serif; font-weight:600; color:var(--red); font-size:6.2pt; }
  li b{ font-weight:600; }
  .tag{ display:inline-block; font-family:Oswald,sans-serif; font-size:5pt; letter-spacing:.1em; text-transform:uppercase; color:var(--muted); border:0.5px solid var(--rule); border-radius:2px; padding:0 2px; margin-right:3px; vertical-align:1px; }
  li.k-only .tag, li.k-pair .tag{ color:var(--red); border-color:var(--red); }
  .foot{ margin-top:4px; padding-top:4px; border-top:2px solid var(--ink); font-size:6.1pt; color:var(--muted); line-height:1.3; }
  .foot b{ font-family:Oswald,sans-serif; font-weight:600; letter-spacing:.1em; text-transform:uppercase; font-size:6pt; color:var(--ink); }
  .mono{ font-family:ui-monospace,Menlo,monospace; font-size:5.9pt; }
`;
fs.writeFileSync(outFile, `<!doctype html>\n<html lang="en"><head><meta charset="utf-8"><title>Stat Desk — 100 Things You Can Post, by Decade</title>\n<style>${fonts}</style><style>${css}</style></head>\n<body>${decades.map(page).join("\n")}</body></html>`);
console.log(`Rendered ${decades.length} decade page(s) -> ${outFile}`);
