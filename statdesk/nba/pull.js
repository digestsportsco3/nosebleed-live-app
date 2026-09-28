#!/usr/bin/env node
// NBA pull from stats.nba.com, the league's official record.
//
// Reachable from Nick's machine (residential IP); datacenter IPs are
// routinely stalled by this site, so this runs on the self-hosted runner.
//
// What it saves, compactly, into statdesk/data/nba/ (committed — this is the
// league's own public record, small enough to keep, and keeping it lets the
// fact rules be iterated on without re-pulling):
//   seasons/<YYYY-YY>-<rs|po>.json   every player's season totals
//   players.json                     every player ever (id, name, from, to)
//   mj/career.json                   Jordan's season totals, ranks, career
//   mj/games-<YYYY-YY>-<rs|po>.json  Jordan's every game
//
// leagueleaders returns every player who appeared in a season. It is empty
// for the earliest BAA/NBA seasons; for those, each active player's
// playercareerstats is pulled instead and the season rebuilt from it, and
// the file records which method produced it.
//
//   node statdesk/nba/pull.js all [--commit]
//   node statdesk/nba/pull.js seasons 1946 2025
//   node statdesk/nba/pull.js mj
"use strict";
const fs = require("fs");
const path = require("path");

const BASE = "https://stats.nba.com/stats";
const HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
  Accept: "application/json, text/plain, */*", Referer: "https://www.nba.com/", Origin: "https://www.nba.com",
  "x-nba-stats-origin": "stats", "x-nba-stats-token": "true",
};
const OUT = path.join(__dirname, "..", "data", "nba");
const GAP_MS = 650; // the site throttles bursts; there is no rush
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let last = 0;

async function get(endpoint, params, label) {
  const url = `${BASE}/${endpoint}?${new URLSearchParams(params).toString()}`;
  for (let i = 1; i <= 5; i += 1) {
    const wait = GAP_MS - (Date.now() - last); if (wait > 0) await sleep(wait); last = Date.now();
    const ctl = new AbortController(); const to = setTimeout(() => ctl.abort(), 30000);
    try {
      const res = await fetch(url, { headers: HEADERS, signal: ctl.signal });
      if (res.status === 429 || res.status >= 500) { await sleep(2000 * i); continue; }
      if (!res.ok) throw new Error(`HTTP ${res.status} for ${label}`);
      return await res.json();
    } catch (e) { if (i === 5) throw new Error(`${label}: ${e.message}`); await sleep(1500 * i); }
    finally { clearTimeout(to); }
  }
}
// resultSet -> array of objects keyed by header
function rows(json, name) {
  const sets = json.resultSets || (json.resultSet ? [json.resultSet] : []);
  const rs = name ? sets.find((s) => s.name === name) : sets[0];
  if (!rs) return [];
  return rs.rowSet.map((r) => Object.fromEntries(rs.headers.map((h, i) => [h, r[i]])));
}
const seasonStr = (y) => `${y}-${String((y + 1) % 100).padStart(2, "0")}`;
const write = (rel, data) => { const f = path.join(OUT, rel); fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, JSON.stringify(data)); };

// Compact season row. null means "not recorded that season" (steals and
// blocks began in 1973-74, rebounds in 1950-51, minutes in 1951-52, threes
// in 1979-80) — it must never be read as zero.
const KEEP = ["GP", "MIN", "FGM", "FGA", "FG3M", "FG3A", "FTM", "FTA", "OREB", "DREB", "REB", "AST", "STL", "BLK", "TOV", "PF", "PTS"];
function compact(r, idKey = "PLAYER_ID", nameKey = "PLAYER", teamKey = "TEAM") {
  const o = { id: r[idKey], name: r[nameKey], team: r[teamKey] || r.TEAM_ABBREVIATION || null };
  for (const k of KEEP) o[k] = r[k] === undefined ? null : r[k];
  if (r.PLAYER_AGE !== undefined) o.age = r.PLAYER_AGE;
  if (r.GS !== undefined) o.GS = r.GS;
  return o;
}

async function players() {
  const j = await get("commonallplayers", { LeagueID: "00", IsOnlyCurrentSeason: "0", Season: seasonStr(new Date().getUTCFullYear() - 1) }, "commonallplayers");
  const list = rows(j).map((r) => ({ id: r.PERSON_ID, name: r.DISPLAY_FIRST_LAST, from: Number(r.FROM_YEAR), to: Number(r.TO_YEAR), played: r.GAMES_PLAYED_FLAG === "Y" }));
  write("players.json", { pulledAt: new Date().toISOString(), source: `${BASE}/commonallplayers`, count: list.length, players: list });
  console.log(`players: ${list.length}`);
  return list;
}

const careerCache = new Map();
async function career(id) {
  if (careerCache.has(id)) return careerCache.get(id);
  const j = await get("playercareerstats", { PlayerID: String(id), PerMode: "Totals", LeagueID: "00" }, `career ${id}`);
  careerCache.set(id, j); return j;
}

async function season(y, type, roster) {
  const s = seasonStr(y); const st = type === "po" ? "Playoffs" : "Regular Season";
  const j = await get("leagueleaders", { LeagueID: "00", PerMode: "Totals", Scope: "S", Season: s, SeasonType: st, StatCategory: "PTS", ActiveFlag: "" }, `leagueleaders ${s} ${type}`);
  let list = rows(j).map((r) => compact(r)); let method = "leagueleaders";
  if (!list.length && roster) {
    // Rebuild from each player's career line.
    const active = roster.filter((p) => p.from <= y && p.to >= y);
    const setName = type === "po" ? "SeasonTotalsPostSeason" : "SeasonTotalsRegularSeason";
    list = [];
    for (const p of active) {
      const c = await career(p.id);
      const seasonRows = rows(c, setName).filter((r) => r.SEASON_ID === s);
      if (!seasonRows.length) continue;
      // A traded player has one row per team plus a "TOT" row; keep TOT when present.
      const tot = seasonRows.find((r) => r.TEAM_ABBREVIATION === "TOT") || (seasonRows.length === 1 ? seasonRows[0] : null);
      if (tot) list.push({ ...compact(tot, "PLAYER_ID", "_", "TEAM_ABBREVIATION"), name: p.name, team: seasonRows.length > 1 ? "TOT" : tot.TEAM_ABBREVIATION });
      else { // no TOT row: sum the stints
        const sum = compact(seasonRows[0], "PLAYER_ID", "_", "TEAM_ABBREVIATION"); sum.name = p.name; sum.team = "TOT";
        for (const r of seasonRows.slice(1)) for (const k of KEEP) sum[k] = sum[k] == null || r[k] == null ? (sum[k] ?? r[k] ?? null) : sum[k] + r[k];
        list.push(sum);
      }
    }
    method = `playercareerstats rebuild (${active.length} roster candidates)`;
  }
  write(`seasons/${s}-${type}.json`, { season: s, type, method, pulledAt: new Date().toISOString(), count: list.length, rows: list });
  console.log(`${s} ${type}: ${list.length} players (${method})`);
  return list.length;
}

// Any player: node statdesk/nba/pull.js player <PERSON_ID> <slug>
// writes players/<slug>/{info,career,games-*}.json (same shapes as mj/).
async function mj(id = 893, dir = "mj", tag = "MJ") {
  // Birthdate, so ages can be exact to the game date. The career feed's
  // PLAYER_AGE is a season label (he is "22" for all of 1984-85, though he
  // turned 22 that February), and "age 39 when he scored 51" would be wrong.
  const info = rows(await get("commonplayerinfo", { PlayerID: String(id), LeagueID: "00" }, `${tag} info`), "CommonPlayerInfo")[0] || {};
  write(`${dir}/info.json`, { pulledAt: new Date().toISOString(), birthdate: info.BIRTHDATE, height: info.HEIGHT, school: info.SCHOOL, draftYear: info.DRAFT_YEAR, draftRound: info.DRAFT_ROUND, draftNumber: info.DRAFT_NUMBER, raw: info });
  const c = await career(id);
  const sets = {};
  for (const rs of c.resultSets) sets[rs.name] = rows(c, rs.name);
  write(`${dir}/career.json`, { pulledAt: new Date().toISOString(), source: `${BASE}/playercareerstats?PlayerID=${id}`, sets });
  const seasons = [...new Set(sets.SeasonTotalsRegularSeason.map((r) => r.SEASON_ID))];
  const po = new Set(sets.SeasonTotalsPostSeason.map((r) => r.SEASON_ID));
  let n = 0;
  for (const s of seasons) {
    for (const [type, st] of [["rs", "Regular Season"], ["po", "Playoffs"]]) {
      if (type === "po" && !po.has(s)) continue;
      const g = rows(await get("playergamelog", { PlayerID: String(id), Season: s, SeasonType: st, LeagueID: "00" }, `${tag} games ${s} ${type}`));
      write(`${dir}/games-${s}-${type}.json`, { season: s, type, count: g.length, games: g });
      n += g.length; console.log(`${tag} ${s} ${type}: ${g.length} games`);
    }
  }
  console.log(`${tag} total games: ${n}`);
}

// leagueleaders silently omits some players (Kevin Porter, traded in 1977-78,
// is missing entirely), which can turn an "only" line false. fill() checks
// every roster candidate absent from a season file against his official
// career record and adds each season he actually played.
async function fill(from, to) {
  const roster = JSON.parse(fs.readFileSync(path.join(OUT, "players.json"), "utf8")).players.filter((p) => p.played);
  const report = [];
  for (let y = from; y <= to; y += 1) {
    const s = seasonStr(y);
    for (const type of ["rs", "po"]) {
      const f = path.join(OUT, "seasons", `${s}-${type}.json`); if (!fs.existsSync(f)) continue;
      const doc = JSON.parse(fs.readFileSync(f, "utf8")); const ids = new Set(doc.rows.map((r) => r.id));
      const setName = type === "po" ? "SeasonTotalsPostSeason" : "SeasonTotalsRegularSeason";
      const added = [];
      for (const p of roster.filter((q) => q.from <= y && q.to >= y && !ids.has(q.id))) {
        const c = await career(p.id);
        const seasonRows = rows(c, setName).filter((r) => r.SEASON_ID === s);
        if (!seasonRows.length) continue;
        const tot = seasonRows.find((r) => r.TEAM_ABBREVIATION === "TOT") || (seasonRows.length === 1 ? seasonRows[0] : null);
        let row;
        if (tot) row = { ...compact(tot, "PLAYER_ID", "_", "TEAM_ABBREVIATION"), name: p.name, team: seasonRows.length > 1 ? "TOT" : tot.TEAM_ABBREVIATION };
        else { row = compact(seasonRows[0], "PLAYER_ID", "_", "TEAM_ABBREVIATION"); row.name = p.name; row.team = "TOT";
          for (const r of seasonRows.slice(1)) for (const k of KEEP) row[k] = row[k] == null || r[k] == null ? (row[k] ?? r[k] ?? null) : row[k] + r[k]; }
        doc.rows.push(row); added.push(p.name);
      }
      if (added.length) {
        doc.method = `${String(doc.method).replace(/ \+ career fill.*$/, "")} + career fill (${added.length} added)`; doc.filled = [...(doc.filled || []), ...added]; doc.count = doc.rows.length;
        fs.writeFileSync(f, JSON.stringify(doc));
      }
      report.push(`${s} ${type}: +${added.length}${added.length ? ` (${added.slice(0, 6).join(", ")}${added.length > 6 ? ", ..." : ""})` : ""}`);
      console.log(report[report.length - 1]);
    }
  }
  write("fill-report.json", { at: new Date().toISOString(), report });
}

async function main() {
  const [cmd = "all", a, b] = process.argv.slice(2).filter((x) => !x.startsWith("--"));
  const lastSeason = new Date().getUTCMonth() >= 9 ? new Date().getUTCFullYear() : new Date().getUTCFullYear() - 1; // 2025 -> 2025-26
  const from = (cmd === "player" || cmd === "fill" ? 0 : Number(a)) || 1946; const to = (cmd === "player" ? 0 : Number(b)) || lastSeason;
  if (cmd === "mj" || cmd === "all") await mj();
  if (cmd === "fill") await fill(Number(a) || 1946, Number(b) || lastSeason);
  if (cmd === "player") { if (!Number(a) || !b) throw new Error("usage: player <PERSON_ID> <slug>"); await mj(Number(a), `players/${b}`, b); }
  if (cmd === "seasons" || cmd === "all") {
    const roster = await players();
    for (let y = from; y <= to; y += 1) { await season(y, "rs", roster); await season(y, "po", roster); }
  }
  if (!process.argv.includes("--commit")) return;
  const { spawnSync } = require("child_process");
  const repo = path.join(__dirname, "..", "..");
  const git = (...x) => { const r = spawnSync("git", x, { cwd: repo, encoding: "utf8" }); return { code: r.status, out: (r.stdout || "") + (r.stderr || "") }; };
  git("config", "user.name", "statdesk-bot"); git("config", "user.email", "noreply@anthropic.com");
  git("add", "statdesk/data/nba");
  if (git("diff", "--cached", "--quiet").code === 0) { console.log("[nba] nothing to commit"); return; }
  git("commit", "-m", `Stat Desk NBA: official pull (${cmd})`);
  const branch = process.env.GITHUB_REF_NAME || "main";
  for (let i = 1; i <= 5; i += 1) {
    if (git("pull", "--rebase", "origin", branch).code === 0 && git("push", "origin", `HEAD:${branch}`).code === 0) { console.log(`[nba] pushed ${git("rev-parse", "--short", "HEAD").out.trim()}`); return; }
    await sleep(i * 4000);
  }
  console.error("[nba] could not push"); process.exitCode = 1;
}
main().catch((e) => { console.error(e.stack || e.message); process.exit(1); });
