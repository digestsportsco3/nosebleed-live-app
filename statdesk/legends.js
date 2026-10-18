#!/usr/bin/env node
// Franchise legends, for "add ONE player in his prime" polls. Two sources:
//   1. Stathead (signed-in browser): each franchise's best regular-season
//      seasons by WAR, batting and pitching (up to 600 rows each), with the
//      Baseball Reference player id on every row.
//   2. MLB Stats API: for the top candidates per franchise (by best five
//      straight seasons of WAR in those rows), the official year-by-year
//      hitting and pitching lines, to cross-check every number we print.
// Nick's machine only (Stathead session + statsapi.mlb.com).
//
//   node statdesk/legends.js [NYY BOS ...] [--pages 3] [--top 12] [--commit]
"use strict";
const fs = require("fs");
const path = require("path");
const { StatheadBrowser } = require("./lib/stathead-browser");

const FR = ["ARI", "ATL", "BAL", "BOS", "CHC", "CHW", "CIN", "CLE", "COL", "DET", "HOU", "KCR", "LAA", "LAD", "MIA",
  "MIL", "MIN", "NYM", "NYY", "ATH", "PHI", "PIT", "SDP", "SEA", "SFG", "STL", "TBR", "TEX", "TOR", "WSN"];
const argv = process.argv.slice(2);
const opt = (k, d) => { const i = argv.indexOf(k); return i >= 0 ? Number(argv[i + 1]) : d; };
const PAGES = opt("--pages", 3), TOP = opt("--top", 12);
const pick = argv.filter((a, i) => /^[A-Z]{3}$/.test(a) && !["--pages", "--top"].includes(argv[i - 1]));
const franchises = pick.length ? pick : FR;
const BASE = "https://www.sports-reference.com/stathead/baseball";
const API = "https://statsapi.mlb.com/api/v1";
const runDate = new Date().toLocaleDateString("en-CA", { timeZone: "America/New_York" });
const OUT = path.join(__dirname, "data", "mlb", "legends", runDate);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const save = (n, o) => { fs.mkdirSync(OUT, { recursive: true }); fs.writeFileSync(path.join(OUT, n), JSON.stringify(o)); };
const num = (x) => { const v = parseFloat(String(x || "").replace(/,/g, "")); return Number.isFinite(v) ? v : null; };
const fold = (s) => String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z ]/gi, "").toLowerCase().trim();

async function get(url) {
  for (let i = 1; i <= 4; i += 1) {
    try { const r = await fetch(url, { headers: { "User-Agent": "Stat Desk (Nosebleed Sports)" } }); if (r.ok) return await r.json(); if (r.status === 404) return null; }
    catch (e) { /* retry */ }
    await sleep(800 * i);
  }
  return null;
}

// Best run of `n` consecutive seasons (by year) using only seasons present.
function bestRun(seasons, n) {
  const ys = [...new Set(seasons.map((s) => s.year))].sort((a, b) => a - b);
  let best = null;
  for (let i = 0; i < ys.length; i += 1) {
    const span = []; for (let y = ys[i]; y < ys[i] + n; y += 1) span.push(y);
    const rows = span.map((y) => seasons.filter((s) => s.year === y));
    if (rows.some((r) => !r.length)) continue;
    const war = rows.flat().reduce((a, s) => a + (s.war || 0), 0);
    if (!best || war > best.war) best = { from: span[0], to: span[n - 1], war: Math.round(war * 10) / 10 };
  }
  return best;
}

// Page through a finder result with retries; a page that keeps failing ends
// the walk but keeps the rows already read (marked incomplete).
async function pages(sh, url, label) {
  const rows = []; let next = url; let first = null; let n = 0; let complete = false; let lastErr = null;
  while (next && n < PAGES) {
    let rec = null;
    for (let t = 1; t <= 3 && !rec; t += 1) {
      try { rec = await sh.query(next, { label: n ? `${label} (page ${n + 1})` : label }); }
      catch (e) { lastErr = e; if (/withheld|not authenticated/i.test(e.message)) throw e; await sleep(5000 * t); }
    }
    if (!rec) break;
    if (!first) first = rec;
    rows.push(...rec.rows); n += 1; next = rec.next;
    if (!next) complete = true;
  }
  if (!first) throw lastErr || new Error("no page read");
  return { ...first, rows, rowCount: rows.length, pages: n, complete };
}

async function main() {
  const sh = new StatheadBrowser({ dataDir: path.join(__dirname, "data", "browser"), runDate, idPrefix: "LG" });
  const index = {};
  try {
    for (const fr of franchises) {
      const rec = { franchise: fr, batting: null, pitching: null };
      for (const [grp, key] of [["batting", "b_war"], ["pitching", "p_war"]]) {
        const url = `${BASE}/player-${grp}-season-finder.cgi?request=1&match=player_season&year_min=1871&year_max=2026&comp_type=reg&team_id=${fr}&order_by=${key}&order_by_asc=0`;
        try {
          const r = await pages(sh, url, `${fr} top ${grp} seasons by WAR`);
          const warCol = (r.headers.find((h) => /war/i.test(h.key)) || {}).key || key;
          const rows = r.rows.map((x) => ({ ...x, _war: num(x[warCol]) }));
          const sorted = rows.every((x, i) => i === 0 || (x._war ?? -99) <= (rows[i - 1]._war ?? 99) + 1e-9);
          rec[grp] = { url, warCol, headers: r.headers, rows, rowCount: rows.length, complete: r.complete, sortedByWar: sorted,
            teams: [...new Set(rows.map((x) => x.teams_played_for || x.team_name_abbr).filter(Boolean))] };
          console.log(`${fr} ${grp}: ${rows.length} rows, WAR col ${warCol}, sorted ${sorted}, teams ${rec[grp].teams.join(",")}`);
        } catch (e) { rec[grp] = { url, error: e.message }; console.log(`${fr} ${grp}: FAILED ${e.message}`); }
      }
      // Candidates: best five straight seasons of WAR within these rows.
      const cands = [];
      for (const grp of ["batting", "pitching"]) {
        const rows = (rec[grp] && rec[grp].rows) || [];
        const by = {};
        for (const x of rows) {
          const id = x._id || x.name_display; const year = num(x.year_id || x.year || x.season);
          if (!id || !year) continue;
          (by[id] = by[id] || { brId: x._id || null, name: x.name_display || x.player, group: grp, seasons: [] }).seasons.push({ year, war: x._war, row: x });
        }
        for (const p of Object.values(by)) {
          p.best5 = bestRun(p.seasons, 5); p.best3 = bestRun(p.seasons, 3);
          p.peak = p.seasons.reduce((a, s) => (!a || (s.war || 0) > (a.war || 0) ? s : a), null);
          p.score = (p.best5 && p.best5.war) || (p.best3 && p.best3.war) || (p.peak && p.peak.war) || 0;
          cands.push(p);
        }
      }
      const top = [...cands.filter((c) => c.group === "batting").sort((a, b) => b.score - a.score).slice(0, TOP),
        ...cands.filter((c) => c.group === "pitching").sort((a, b) => b.score - a.score).slice(0, Math.ceil(TOP / 2))];
      rec.candidates = top.map(({ seasons, ...c }) => ({ ...c, seasonYears: seasons.map((s) => s.year).sort() }));
      save(`${fr}-stathead.json`, rec);
      index[fr] = rec.candidates.map((c) => `${c.name} (${c.group}, ${c.score})`);
    }
  } finally { await sh.close(); }

  // MLB Stats API: official year-by-year lines for each candidate.
  const teams = ((await get(`${API}/teams?sportId=1`)) || {}).teams || [];
  for (const fr of franchises) {
    const f = path.join(OUT, `${fr}-stathead.json`); if (!fs.existsSync(f)) continue;
    const rec = JSON.parse(fs.readFileSync(f, "utf8")); const out = [];
    for (const c of rec.candidates || []) {
      const s = await get(`${API}/people/search?names=${encodeURIComponent(c.name)}&sportIds=1`);
      const people = ((s && s.people) || []).filter((p) => fold(p.fullName) === fold(c.name) || fold(`${p.useName || p.firstName} ${p.lastName}`) === fold(c.name));
      const tried = [];
      for (const p of people.slice(0, 4)) {
        const grp = c.group === "pitching" ? "pitching" : "hitting";
        const y = await get(`${API}/people/${p.id}/stats?stats=yearByYear&group=${grp}&gameType=R&sportId=1`);
        const yrs = ((y && y.stats) || []).flatMap((x) => x.splits || []);
        const overlap = yrs.filter((r) => c.seasonYears.includes(Number(r.season))).length;
        tried.push({ id: p.id, fullName: p.fullName, birthDate: p.birthDate, mlbDebutDate: p.mlbDebutDate, lastPlayedDate: p.lastPlayedDate, overlap, group: grp, yearByYear: yrs });
        await sleep(120);
      }
      tried.sort((a, b) => b.overlap - a.overlap);
      out.push({ name: c.name, brId: c.brId, group: c.group, matched: tried[0] && tried[0].overlap ? tried[0] : null, others: tried.slice(1).map(({ yearByYear, ...t }) => t) });
    }
    save(`${fr}-mlbapi.json`, { franchise: fr, teams: teams.map((t) => ({ id: t.id, name: t.name, abbreviation: t.abbreviation })), players: out });
    console.log(`${fr}: MLB API lines for ${out.filter((x) => x.matched).length}/${out.length} candidates`);
  }
  save("summary.json", { runDate, franchises, index, at: new Date().toISOString() });

  if (!argv.includes("--commit")) return;
  const { spawnSync } = require("child_process");
  const repo = path.join(__dirname, "..");
  const git = (...x) => spawnSync("git", x, { cwd: repo, encoding: "utf8" }).status;
  git("config", "user.name", "statdesk-bot"); git("config", "user.email", "noreply@anthropic.com");
  git("add", "statdesk/data/mlb/legends", "statdesk/data/browser");
  if (git("diff", "--cached", "--quiet") === 0) return;
  git("commit", "-m", `Stat Desk MLB: franchise legends pull ${runDate}`);
  const branch = process.env.GITHUB_REF_NAME || "main";
  for (let i = 1; i <= 5; i += 1) {
    if (git("pull", "--rebase", "origin", branch) === 0 && git("push", "origin", `HEAD:${branch}`) === 0) { console.log("[legends] pushed"); return; }
    await sleep(i * 4000);
  }
  process.exitCode = 1;
}
main().catch((e) => { console.error(e.stack || e.message); process.exit(1); });
