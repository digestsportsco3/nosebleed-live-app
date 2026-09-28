#!/usr/bin/env node
// Renders fact files (any sport, decade pages or a single subject) into one
// landscape page each, four height-balanced columns, plus a closing method
// page. Pages with fewer than 100 lines say so plainly rather than padding.
//
//   node statdesk/render-facts.js --out out.html --fonts fonts.css --sport NBA \
//        --title "NBA by Decade" statdesk/data/nba/facts/1940s-facts.json ...
"use strict";
const fs = require("fs");
const path = require("path");

const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
const outFile = opt("--out"); const fontsFile = opt("--fonts"); const sport = opt("--sport", ""); const docTitle = opt("--title", "Stat Desk");
const files = args.filter((a, i) => a.endsWith(".json") && !["--out", "--fonts", "--sport", "--title"].includes(args[i - 1]));
if (!outFile || !files.length) { console.error("Usage: node statdesk/render-facts.js --out out.html [--fonts f.css] [--sport NBA] [--title T] facts.json ..."); process.exit(2); }
const docs = files.map((f) => ({ file: f, ...JSON.parse(fs.readFileSync(f, "utf8")) }));

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const KIND = { only: "only", pair: "two", few: "few", extreme: "most", streak: "streak", teammates: "team-mates", total: "decade", nearmiss: "near miss",
  team: "club", list: "count", season: "season", age: "age", career: "career", league: "all-time", games: "games", finals: "finals",
  playoffs: "playoffs", opponents: "opponents", splits: "splits", college: "college", allstar: "all-star" };
const RED = new Set(["only", "pair", "league", "finals"]);
function fmt(text) { const t = esc(text); const i = t.indexOf(": "); return i > 0 && i < t.length - 2 ? `${t.slice(0, i + 2)}<b>${t.slice(i + 2)}</b>` : t; }
const rel = (f) => path.relative(path.join(__dirname, ".."), path.resolve(f)).replace(/\\/g, "/");

function page(d) {
  const facts = (d.facts || []).slice(0, 100);
  const kinds = {}; for (const f of facts) kinds[f.kind] = (kinds[f.kind] || 0) + 1;
  const mix = Object.entries(kinds).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${v} ${KIND[k] || k}`).join(" · ");
  const title = d.subject ? `${esc(d.subject)}: ${facts.length} Things You Can Post` : `The ${esc(d.decade)}${sport ? ` ${esc(sport)}` : ""}: ${facts.length} Things You Can Post`;
  const c = d.counts || {};
  const volume = d.subject
    ? `${(c.regularSeasonGames || 0).toLocaleString()} regular-season + ${(c.playoffGames || 0).toLocaleString()} playoff games`
    : Object.entries(c).map(([k, v]) => `${Number(v).toLocaleString()} ${k.replace(/([A-Z])/g, " $1").toLowerCase()}`).join(", ");
  const short = facts.length < 100 ? `<div class="short"><b>${facts.length} lines, not 100.</b> ${esc(d.shortNote || "That is everything the record supports for these seasons: the categories that would produce more lines were not yet being kept. Nothing was padded.")}</div>` : "";
  return `
<section class="page">
  <div class="mast">
    <div><div class="brand">Nosebleed Sports &nbsp;·&nbsp; Stat Desk</div><h1>${title}</h1></div>
    <div class="meta"><div><b>${facts.length} verified</b> · ${esc(volume)}</div><div>${esc(mix)}</div></div>
  </div>
  ${short}
  <ol class="cols">${facts.map((f) => `<li class="${RED.has(f.kind) ? "red" : ""}"><span class="tag">${KIND[f.kind] || f.kind}</span>${fmt(f.text)}</li>`).join("")}</ol>
  <div class="foot"><b>Verified</b> — every line computed from complete official pulls; the rows behind each line are stored in <span class="mono">${esc(rel(d.file))}</span>. Full method on the last page.</div>
</section>`;
}

const method = [...new Set(docs.flatMap((d) => d.method || []))];
const methodPage = `
<section class="page method">
  <div class="mast"><div><div class="brand">Nosebleed Sports &nbsp;·&nbsp; Stat Desk</div><h1>How Every Line Was Verified</h1></div></div>
  <div class="mtext">
    ${method.map((m) => `<p>${esc(m)}</p>`).join("")}
    <p>"Only", "two" and "few" are exact counts of players across the complete pull — a player who did it twice is still the only player who did it, and is described that way. "Most" lines are the extreme among every season clearing the stated base. Where a line states a floor ("60% of games", "400+ FTA"), the floor is part of the claim.</p>
    <p>Pages with fewer than 100 lines are short because the record is: early seasons did not track the categories that produce more lines. Nothing was padded to reach a round number, and nothing was recalled from memory.</p>
  </div>
</section>`;

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
  .short{ font-size:7pt; color:var(--muted); margin:0 0 5px; padding:3px 6px; border-left:3px solid var(--red); }
  .short b{ color:var(--ink); }
  ol.cols{ column-count:4; column-gap:10px; column-fill:balance; flex:1 1 auto; min-height:0; margin:0; padding:0 0 0 12px; font-size:5.8pt; line-height:1.18; }
  li{ margin:0 0 2px; padding-right:2px; break-inside:avoid; }
  li::marker{ font-family:Oswald,sans-serif; font-weight:600; color:var(--red); font-size:6pt; }
  li b{ font-weight:600; }
  .tag{ display:inline-block; font-family:Oswald,sans-serif; font-size:5pt; letter-spacing:.1em; text-transform:uppercase; color:var(--muted); border:0.5px solid var(--rule); border-radius:2px; padding:0 2px; margin-right:3px; vertical-align:1px; }
  li.red .tag{ color:var(--red); border-color:var(--red); }
  .foot{ margin-top:4px; padding-top:3px; border-top:2px solid var(--ink); font-size:5.9pt; color:var(--muted); line-height:1.3; }
  .foot b{ font-family:Oswald,sans-serif; font-weight:600; letter-spacing:.1em; text-transform:uppercase; font-size:6pt; color:var(--ink); }
  .mono{ font-family:ui-monospace,Menlo,monospace; font-size:5.9pt; }
  .method .mtext{ font-size:9pt; line-height:1.45; columns:2; column-gap:28px; margin-top:10px; }
  .method .mtext p{ margin:0 0 8px; break-inside:avoid; }
`;
fs.writeFileSync(outFile, `<!doctype html>\n<html lang="en"><head><meta charset="utf-8"><title>${esc(docTitle)}</title>\n<style>${fonts}</style><style>${css}</style></head>\n<body>${docs.map(page).join("\n")}${methodPage}</body></html>`);
console.log(`Rendered ${docs.length} page(s) + method -> ${outFile}`);
