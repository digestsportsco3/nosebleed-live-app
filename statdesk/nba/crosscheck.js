#!/usr/bin/env node
// Independent cross-check of the NBA and Michael Jordan fact data.
// The facts were computed from stats.nba.com; this asks Stathead (Basketball
// Reference) the same questions in the signed-in browser and compares:
//   A. every decade's top five single seasons in PTS, REB, AST, STL, BLK, 3PM, FTM
//   B. every Michael Jordan regular-season and playoff season line
// Disagreements are written out, never smoothed over.
//
//   node statdesk/nba/crosscheck.js [--commit]
"use strict";
const fs = require("fs");
const path = require("path");
const { StatheadBrowser } = require("../lib/stathead-browser");

const ROOT = path.join(__dirname, "..");
const BASE = "https://www.sports-reference.com/stathead/basketball/player-season-finder.cgi";
const num = (v) => { const n = Number(String(v ?? "").replace(/[,%]/g, "")); return v === "" || v == null || !Number.isFinite(n) ? null : n; };
const norm = (s) => String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/\*/g, "").replace(/\b(jr|sr|ii|iii|iv)\b\.?/gi, "").replace(/[^a-z]/gi, "").toLowerCase();

// stat: [stathead key, nba.com key, first season start year it was kept]
const STATS = [["pts", "PTS", 1946], ["trb", "REB", 1950], ["ast", "AST", 1946], ["stl", "STL", 1973], ["blk", "BLK", 1973], ["fg3", "FG3M", 1979], ["ft", "FTM", 1946]];
const url = (p) => `${BASE}?${new URLSearchParams({ request: "1", match: "player_season", comp_id: "NBA", display_type: "totals", ...p }).toString().replace(/%5B/g, "[").replace(/%5D/g, "]")}`;

function ours(decade, key) {
  const rows = [];
  for (let y = Math.max(decade, 1946); y <= decade + 9; y += 1) {
    const f = path.join(ROOT, "data", "nba", "seasons", `${y}-${String(y + 1).slice(2)}-rs.json`);
    if (!fs.existsSync(f)) continue;
    for (const r of JSON.parse(fs.readFileSync(f, "utf8")).rows) if (typeof r[key] === "number") rows.push({ name: r.name, season: y, v: r[key] });
  }
  return rows.sort((a, b) => b.v - a.v);
}

async function main() {
  const runDate = new Date().toLocaleDateString("en-CA", { timeZone: "America/New_York" });
  const sh = new StatheadBrowser({ dataDir: path.join(ROOT, "data", "browser"), runDate, idPrefix: "XNBA" });
  const out = { runDate, decades: [], mj: { rs: [], po: [] }, summary: {} };
  try {
    // A. decade leaders
    for (let d = 1940; d <= 2020; d += 10) {
      for (const [sk, nk, from] of STATS) {
        if (d + 9 < from) continue;
        const yMin = Math.max(d, from, 1946) + 1; const yMax = Math.min(d + 10, 2026); // finder years are season END years
        const u = url({ year_min: String(yMin), year_max: String(yMax), comp_type: "reg", order_by: sk, order_by_asc: "0", "ccomp[1]": "gt", "cval[1]": "1", "cstat[1]": sk });
        let rec; try { rec = await sh.query(u, { label: `NBA ${d}s ${sk} top` }); } catch (e) { out.decades.push({ decade: d, stat: sk, error: e.message }); continue; }
        const theirs = rec.rows.map((r) => ({ name: r.name_display, season: parseInt(String(r.year_id).slice(0, 4), 10), v: num(r[sk]) }))
          .filter((r) => r.v != null && r.season >= yMin - 1 && r.season <= yMax - 1).slice(0, 5);
        const mine = ours(d, nk).filter((r) => r.season >= yMin - 1).slice(0, 5);
        const rows = [];
        for (let i = 0; i < Math.max(theirs.length, mine.length); i += 1) {
          const a = mine[i], b = theirs[i];
          const agree = !!(a && b && a.v === b.v && a.season === b.season && norm(a.name) === norm(b.name));
          // A tie can order two equal values differently; that is agreement.
          const tieOk = !agree && a && b && a.v === b.v && mine.some((m) => m.v === b.v && norm(m.name) === norm(b.name) && m.season === b.season);
          rows.push({ rank: i + 1, ours: a || null, stathead: b || null, agree: agree || !!tieOk });
        }
        out.decades.push({ decade: d, stat: sk, url: u, rows, agree: rows.every((r) => r.agree) });
        console.log(`${d}s ${sk}: ${rows.every((r) => r.agree) ? "AGREE" : "DIFFER"}`);
      }
    }
    // B. Michael Jordan, season by season
    const career = JSON.parse(fs.readFileSync(path.join(ROOT, "data", "nba", "mj", "career.json"), "utf8")).sets;
    for (const [type, set, ct] of [["rs", "SeasonTotalsRegularSeason", "reg"], ["po", "SeasonTotalsPostSeason", "post"]]) {
      const u = url({ player_id: "jordami01", comp_type: ct, order_by: "year_id", order_by_asc: "1" });
      let rec; try { rec = await sh.query(u, { label: `MJ ${type} seasons` }); } catch (e) { out.mj[type] = { error: e.message }; continue; }
      const theirs = rec.rows.filter((r) => /jordan/i.test(r.name_display || ""));
      if (theirs.length !== rec.rows.length) { out.mj[type] = { error: "player filter not applied; result included other players", url: u }; continue; }
      for (const m of career[set]) {
        const t = theirs.find((r) => String(r.year_id).slice(0, 4) === m.SEASON_ID.slice(0, 4));
        const pairs = { games: [m.GP, t && num(t.games)], pts: [m.PTS, t && num(t.pts)], trb: [m.REB, t && num(t.trb)], ast: [m.AST, t && num(t.ast)],
          stl: [m.STL, t && num(t.stl)], blk: [m.BLK, t && num(t.blk)], fg: [m.FGM, t && num(t.fg)], fga: [m.FGA, t && num(t.fga)], ft: [m.FTM, t && num(t.ft)], fta: [m.FTA, t && num(t.fta)] };
        const diffs = Object.entries(pairs).filter(([, [a, b]]) => a !== b).map(([k, [a, b]]) => `${k}: nba.com ${a} vs Stathead ${b}`);
        out.mj[type].push({ season: m.SEASON_ID, found: !!t, agree: !!t && !diffs.length, diffs });
        console.log(`MJ ${type} ${m.SEASON_ID}: ${!t ? "NOT FOUND" : diffs.length ? diffs.join("; ") : "AGREE"}`);
      }
    }
  } finally { await sh.close(); }
  const dec = out.decades.filter((x) => x.rows); const mjAll = [...(Array.isArray(out.mj.rs) ? out.mj.rs : []), ...(Array.isArray(out.mj.po) ? out.mj.po : [])];
  out.summary = { decadeChecks: dec.length, decadeAgree: dec.filter((x) => x.agree).length, mjSeasons: mjAll.length, mjAgree: mjAll.filter((x) => x.agree).length };
  console.log(JSON.stringify(out.summary));
  fs.writeFileSync(path.join(ROOT, "data", "nba", "crosscheck.json"), JSON.stringify(out, null, 1));
  if (!process.argv.includes("--commit")) return;
  const { spawnSync } = require("child_process");
  const git = (...x) => { const r = spawnSync("git", x, { cwd: path.join(ROOT, ".."), encoding: "utf8" }); return { code: r.status }; };
  git("config", "user.name", "statdesk-bot"); git("config", "user.email", "noreply@anthropic.com");
  git("add", "statdesk/data/nba/crosscheck.json", "statdesk/data/browser");
  if (git("diff", "--cached", "--quiet").code === 0) return;
  git("commit", "-m", "Stat Desk NBA: Stathead cross-check of decade leaders and Jordan seasons");
  const branch = process.env.GITHUB_REF_NAME || "main";
  for (let i = 1; i <= 5; i += 1) {
    if (git("pull", "--rebase", "origin", branch).code === 0 && git("push", "origin", `HEAD:${branch}`).code === 0) { console.log("[crosscheck] pushed"); return; }
    await new Promise((r) => setTimeout(r, i * 4000));
  }
  process.exitCode = 1;
}
main().catch((e) => { console.error(e.stack || e.message); process.exit(1); });
