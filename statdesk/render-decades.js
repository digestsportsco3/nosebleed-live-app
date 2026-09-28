#!/usr/bin/env node
// Renders the decade summaries into one landscape page per decade: a
// 10-season by 10-category grid of league leaders — the hundred facts — with
// a decade-leaders strip and the method beneath. Every cell traces to
// statdesk/data/decades/<decade>.json, which holds the top five behind it.
//
//   node statdesk/render-decades.js out.html [fonts.css] [1920 1930 ...]
"use strict";
const fs = require("fs");
const path = require("path");

const dataDir = path.join(__dirname, "data", "decades");
const [outFile, fontsFile, ...only] = process.argv.slice(2);
if (!outFile) { console.error("Usage: node statdesk/render-decades.js out.html [fonts.css] [decades...]"); process.exit(2); }

const files = fs.readdirSync(dataDir).filter((f) => /^\d{4}s\.json$/.test(f)).sort();
const wanted = only.length ? new Set(only.map((d) => `${d}s.json`)) : null;
const decades = files.filter((f) => !wanted || wanted.has(f)).map((f) => JSON.parse(fs.readFileSync(path.join(dataDir, f), "utf8")));
if (!decades.length) { console.error("No decade summaries found in " + dataDir); process.exit(1); }

// Team short names. Nicknames alone collide across the century (three
// different "Giants"), so a few are spelled out.
const SHORT = {
  "Boston Red Sox": "Red Sox", "Chicago White Sox": "White Sox", "Toronto Blue Jays": "Blue Jays",
  "New York Giants": "NY Giants", "San Francisco Giants": "SF Giants", "Chicago American Giants": "Chi. Am. Giants",
  "Bacharach Giants": "Bacharach Giants", "Cuban Giants": "Cuban Giants", "Lincoln Giants": "Lincoln Giants",
  "Brooklyn Royal Giants": "Bklyn Royal Giants", "Harrisburg Giants": "Harrisburg Giants",
  "Houston Colt .45s": "Colt .45s", "Los Angeles Angels": "Angels", "California Angels": "Cal. Angels",
  "Anaheim Angels": "Angels", "Los Angeles Angels of Anaheim": "Angels", "Tampa Bay Devil Rays": "Devil Rays",
  "Kansas City Athletics": "KC Athletics", "Philadelphia Athletics": "Phila. Athletics", "Oakland Athletics": "Athletics",
  "Washington Senators": "Senators", "St. Louis Browns": "Browns", "Boston Braves": "Bos. Braves", "Milwaukee Braves": "Mil. Braves",
  "Brooklyn Dodgers": "Bklyn Dodgers", "Brooklyn Robins": "Robins", "New York Yankees": "Yankees", "New York Mets": "Mets",
  "Montreal Expos": "Expos", "Florida Marlins": "Marlins", "Seattle Pilots": "Pilots", "Cleveland Indians": "Indians",
  "Cleveland Guardians": "Guardians", "Cincinnati Redlegs": "Redlegs", "Boston Bees": "Bees", "Philadelphia Blue Jays": "Phila. Blue Jays",
  "multiple teams": "2+ teams", "unknown team": "—",
};
function short(team) {
  if (SHORT[team]) return SHORT[team];
  const w = team.split(" ");
  return w[w.length - 1];
}
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function cell(entry, notes) {
  if (!entry || !entry.leaders.length) return `<td class="c empty"><div class="box">—</div></td>`;
  const L = entry.leaders;
  const v = esc(L[0].shown);
  // A two-way tie shares the name line, so a row never grows taller than a
  // fixed box; three or more go to a footnote. The box is height-capped, so
  // the ten-row grid always fits the page whatever the ties.
  if (L.length <= 2) {
    return `<td class="c"><div class="box"><div class="v">${v}</div>` +
           `<div class="n">${L.map((r) => esc(r.name)).join(" <i>/</i> ")}</div>` +
           `<div class="t">${L.map((r) => esc(short(r.team))).join(" / ")}</div></div></td>`;
  }
  const id = notes.length + 1;
  notes.push(`<b>[${id}]</b> ${L.length} tied at ${v}: ${L.map((r) => `${esc(r.name)} (${esc(short(r.team))})`).join(", ")}`);
  return `<td class="c"><div class="box"><div class="v">${v}</div><div class="n">${L.length} tied <sup>[${id}]</sup></div><div class="t">${esc(L[0].name)}, …</div></div></td>`;
}

// The latest Stathead cross-check report, if one exists. Genuine
// disagreements between the official record and Stathead are printed on the
// page they concern, so a reader sees them where the number is.
const verifyFiles = fs.readdirSync(dataDir).filter((f) => /^verify-.*\.json$/.test(f)).sort();
const verify = verifyFiles.length ? JSON.parse(fs.readFileSync(path.join(dataDir, verifyFiles[verifyFiles.length - 1]), "utf8")) : null;
function crossCheckNotes(decade) {
  if (!verify) return { line: "", notes: [] };
  const mine = verify.results.filter((r) => r.decade === decade);
  if (!mine.length) return { line: "", notes: [] };
  // Same value and same surname on both sides means the same man with his
  // name written differently ("Hank"/"Henry", a trailing "Sr."), not a finding.
  const surname = (n) => n.replace(/\b(Jr|Sr|II|III|IV)\.?$/i, "").trim().split(" ").pop().toLowerCase();
  const nameOnly = (r) => r.verdict === "DISAGREE" && r.stathead && r.ours.length && r.stathead.length
    && r.ours[0].value === r.stathead[0].value
    && r.ours.map((o) => surname(o.name)).some((l) => r.stathead.map((t) => surname(t.name)).includes(l));
  const real = mine.filter((r) => r.verdict === "DISAGREE" && !nameOnly(r));
  const agreed = mine.length - real.length;
  const notes = real.map((r) => `<b>Source disagreement, ${r.season} ${r.stat}:</b> the official MLB record has ${esc(r.ours.map((o) => `${o.name} ${o.shown}`).join(" / "))}; Stathead / Baseball Reference has ${esc(r.stathead.map((t) => `${t.name} ${t.value}`).join(" / "))}. Both are shown; neither is altered.`);
  const line = ` <b>Stathead cross-check</b> (${verify.runDate}): ${agreed} of ${mine.length} sampled leaders confirmed independently${real.length ? `; ${real.length} disagreement${real.length > 1 ? "s" : ""} noted above` : ""}.`;
  return { line, notes };
}

function decadePage(d) {
  const start = Number(d.decade.slice(0, 4));
  const modern = start >= 1970;
  const hitCols = ["HR", "AVG", "RBI", "H", "SB"];
  const pitCols = ["W", "ERA", "SO", "IP", modern ? "SV" : "SHO"];
  const notes = [];
  const cc = crossCheckNotes(d.decade);
  const flagged = d.seasons.filter((s) => s.leagues.some((l) => l !== "AL" && l !== "NL" && l !== "American League" && l !== "National League"));

  const head = `<tr><th class="y">Season</th>${hitCols.map((c) => `<th>${c}</th>`).join("")}${pitCols.map((c) => `<th class="p">${c}</th>`).join("")}</tr>`;
  const rows = d.seasons.map((s) => {
    const flag = flagged.includes(s) ? "<sup>†</sup>" : "";
    return `<tr><td class="y">${s.season}${flag}</td>${hitCols.map((c) => cell(s.hitting[c], notes)).join("")}${pitCols.map((c) => cell(s.pitching[c], notes)).join("")}</tr>`;
  }).join("");

  const T = d.totals;
  const top = (arr, fmt = (v) => v) => arr && arr[0] ? `${esc(arr[0].name)} <b>${fmt(arr[0].value)}</b>` : "—";
  const ipfmt = (o) => `${Math.floor(o / 3)}`;
  const strip = [
    ["HR", top(T.hitting.HR)], ["Hits", top(T.hitting.H)], ["RBI", top(T.hitting.RBI)], ["Steals", top(T.hitting.SB)], ["Runs", top(T.hitting.R)],
    ["Wins", top(T.pitching.W)], ["Strikeouts", top(T.pitching.SO)], [modern ? "Saves" : "Shutouts", top(modern ? T.pitching.SV : T.pitching.SHO)],
    ["Innings", top(T.pitching.OUTS, ipfmt)], ["ERA, 1000+ IP", top(T.pitching.ERA_1000IP, (v) => v.toFixed(2))],
  ].map(([k, v]) => `<span><em>${k}</em> ${v}</span>`).join("");

  // Team-game bars by league across the decade, for the footer.
  const bars = {};
  for (const s of d.seasons) for (const [L, g] of Object.entries(s.leagueGames || {})) { (bars[L] = bars[L] || new Set()).add(g); }
  const barText = Object.entries(bars).map(([L, set]) => `${L} ${[...set].sort((a, b) => a - b).join("/")}`).join(", ");
  const fallback = d.seasons.filter((s) => /most games played by any hitter/.test(s.teamGamesBasis) && !/AL:.*standings/.test(s.teamGamesBasis)).map((s) => s.season);

  return `
<section class="page">
  <div class="mast">
    <div>
      <div class="brand">Nosebleed Sports &nbsp;·&nbsp; Stat Desk</div>
      <h1>The ${d.decade}</h1>
    </div>
    <div class="meta">
      <div>League leaders, every season · <b>100 verified</b></div>
      <div>MLB Stats API, complete pulls · ${d.seasons.reduce((a, s) => a + s.counts.hitters, 0).toLocaleString()} hitter-seasons, ${d.seasons.reduce((a, s) => a + s.counts.pitchers, 0).toLocaleString()} pitcher-seasons</div>
    </div>
  </div>
  <table>
    <thead>${head}</thead>
    <tbody>${rows}</tbody>
  </table>
  <div class="strip"><em class="lab">Decade totals</em>${strip}</div>
  ${(notes.length || cc.notes.length) ? `<div class="notes">${[...notes, ...cc.notes].join(" &nbsp; ")}</div>` : ""}
  <div class="foot">
    <b>Method</b> — Every hitter and every pitcher in each season was pulled from the MLB Stats API, the official record, and the leader in each column computed across the complete pull; nothing is recalled or estimated. Rate stats qualify by the modern rule — 3.1 PA and 1 IP per team game — applied per league on that league's own schedule (team games this decade: ${barText}${fallback.length ? `; AL/NL standings unavailable for ${fallback.join(", ")}, so the bar there is the most games any hitter played` : ""}). Ties are all listed. Traded players show as 2+ teams.${modern ? "" : " Shutouts are shown in place of saves, which were not an official statistic before 1969."}${flagged.length ? ` <b>†</b> These seasons include Negro League play, which MLB has counted as major league since 2024; leaders appear as the official record now lists them.` : ""} Top-five provenance for every cell: <span class="mono">statdesk/data/decades/${d.decade}.json</span>.${cc.line}
  </div>
</section>`;
}

const fonts = fontsFile && fs.existsSync(fontsFile) ? fs.readFileSync(fontsFile, "utf8") : "";
const css = `
  :root{ --paper:#EFECE3; --ink:#141414; --red:#C8102E; --rule:#C9C3B4; --muted:#5A564C; }
  @page { size: Letter landscape; margin: 0.38in 0.42in; }
  *{ box-sizing:border-box; }
  html,body{ margin:0; background:var(--paper); color:var(--ink); font-family:"Source Serif 4",Georgia,serif; }
  .page{ page-break-after:always; break-after:page; height:7.7in; display:flex; flex-direction:column; }
  .page:last-child{ page-break-after:auto; break-after:auto; }
  .mast{ display:flex; justify-content:space-between; align-items:flex-end; border-bottom:3px solid var(--ink); padding-bottom:4px; margin-bottom:5px; }
  .brand{ font-family:Oswald,sans-serif; font-weight:700; letter-spacing:.22em; text-transform:uppercase; font-size:7.6pt; color:var(--red); }
  h1{ font-family:Oswald,sans-serif; font-weight:700; text-transform:uppercase; font-size:22pt; margin:0; line-height:1; }
  .meta{ text-align:right; font-family:Oswald,sans-serif; font-size:7pt; letter-spacing:.1em; text-transform:uppercase; color:var(--muted); line-height:1.5; }
  .meta b{ color:var(--red); }
  table{ width:100%; border-collapse:collapse; table-layout:fixed; font-variant-numeric:tabular-nums; }
  th{ font-family:Oswald,sans-serif; font-weight:600; font-size:7.6pt; letter-spacing:.12em; text-transform:uppercase; color:var(--muted); border-bottom:1.5px solid var(--ink); padding:2px 3px; text-align:left; }
  th.p{ color:var(--red); }
  th.y, td.y{ width:0.62in; }
  td{ border-bottom:1px solid var(--rule); padding:2px 3px; vertical-align:top; }
  .box{ height:0.5in; overflow:hidden; }
  td.y{ font-family:Oswald,sans-serif; font-weight:700; font-size:10.5pt; padding-top:4px; }
  td.y sup{ color:var(--red); font-size:7pt; }
  .v{ font-family:Oswald,sans-serif; font-weight:600; font-size:10pt; line-height:1.05; }
  .n{ font-size:6.9pt; line-height:1.12; margin-top:1px; }
  .n i{ color:var(--red); font-style:normal; }
  .t{ font-size:6.2pt; color:var(--muted); line-height:1.1; }
  td.empty{ color:var(--muted); text-align:center; }
  .strip{ margin-top:5px; padding:4px 6px; border-top:1.5px solid var(--ink); border-bottom:1px solid var(--rule); font-size:7pt; display:flex; flex-wrap:wrap; gap:3px 10px; line-height:1.3; }
  .strip .lab{ font-family:Oswald,sans-serif; font-style:normal; font-weight:600; letter-spacing:.14em; text-transform:uppercase; color:var(--red); font-size:6.8pt; margin-right:4px; }
  .strip em{ font-style:normal; color:var(--muted); font-family:Oswald,sans-serif; font-size:6.4pt; letter-spacing:.08em; text-transform:uppercase; }
  .notes{ margin-top:3px; font-size:6.4pt; color:var(--muted); line-height:1.3; }
  .foot{ margin-top:auto; padding-top:4px; border-top:2px solid var(--ink); font-size:6.5pt; color:var(--muted); line-height:1.3; }
  .foot b{ font-family:Oswald,sans-serif; font-weight:600; letter-spacing:.1em; text-transform:uppercase; font-size:6.4pt; color:var(--ink); }
  .mono{ font-family:ui-monospace,Menlo,monospace; font-size:6.2pt; }
`;
const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><title>Stat Desk — Decade Leaders</title>
<style>${fonts}</style><style>${css}</style></head>
<body>${decades.map(decadePage).join("\n")}</body></html>`;
fs.writeFileSync(outFile, html);
console.log(`Rendered ${decades.length} decade page(s) -> ${outFile}`);
