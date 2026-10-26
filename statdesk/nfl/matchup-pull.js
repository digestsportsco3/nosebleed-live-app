#!/usr/bin/env node
// One NFL matchup, deep: history, prime time, betting lines, every rostered player.
//   1. Pro Football Reference (signed-in Stathead browser, >= 4 s per page):
//      both teams' season pages --from..season (schedule, results, kickoff time,
//      day) and _lines pages --lines-from..season (spread, total, ATS, O/U).
//      Only parsed rows are saved, never raw HTML.
//   2. ESPN (public JSON): today's scoreboard, both rosters, every rostered
//      player's game log for each season of his career (compacted, with kickoff
//      time, so prime-time and vs-opponent splits are exact), and both teams'
//      completed games this season (box summaries).
// Nick's machine only (ESPN and Sports Reference block the cloud container).
//
//   node statdesk/nfl/matchup-pull.js KC SEA [--season 2026] [--from 1976] [--lines-from 2010] [--commit]
"use strict";
const fs = require("fs");
const path = require("path");

const argv = process.argv.slice(2);
const opt = (k, d) => { const i = argv.indexOf(k); return i >= 0 ? argv[i + 1] : d; };
const pos = argv.filter((a, i) => !a.startsWith("--") && !["--season", "--from", "--lines-from"].includes(argv[i - 1]));
const [A, B] = pos;
const SEASON = Number(opt("--season", new Date().getFullYear()));
const FROM = Number(opt("--from", 1976)), LFROM = Number(opt("--lines-from", 2010));
const runDate = new Date().toLocaleDateString("en-CA", { timeZone: "America/New_York" });
const OUT = path.join(__dirname, "..", "data", "nfl", "matchups", runDate, `${A}-${B}`);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const save = (n, o) => { fs.mkdirSync(path.dirname(path.join(OUT, n)), { recursive: true }); fs.writeFileSync(path.join(OUT, n), JSON.stringify(o)); };
const SITE = "https://site.api.espn.com/apis/site/v2/sports/football/nfl";
const WEB = "https://site.web.api.espn.com/apis/common/v3/sports/football/nfl";
// ESPN abbreviation -> PFR franchise code and first season.
const PFR = { ARI: ["crd", 1920], ATL: ["atl", 1966], BAL: ["rav", 1996], BUF: ["buf", 1960], CAR: ["car", 1995], CHI: ["chi", 1920], CIN: ["cin", 1968], CLE: ["cle", 1946], DAL: ["dal", 1960], DEN: ["den", 1960], DET: ["det", 1930], GB: ["gnb", 1921], HOU: ["htx", 2002], IND: ["clt", 1953], JAX: ["jax", 1995], KC: ["kan", 1960], LV: ["rai", 1960], LAC: ["sdg", 1960], LAR: ["ram", 1937], MIA: ["mia", 1966], MIN: ["min", 1961], NE: ["nwe", 1960], NO: ["nor", 1967], NYG: ["nyg", 1925], NYJ: ["nyj", 1960], PHI: ["phi", 1933], PIT: ["pit", 1933], SF: ["sfo", 1950], SEA: ["sea", 1976], TB: ["tam", 1976], TEN: ["oti", 1960], WSH: ["was", 1932] };

async function get(url) {
  for (let i = 1; i <= 4; i += 1) {
    try { const r = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0 Stat Desk (Nosebleed Sports)" } }); if (r.ok) return await r.json(); if (r.status === 404) return null; }
    catch (e) { /* retry */ }
    await sleep(800 * i);
  }
  return null;
}

// ---------- Pro Football Reference ----------
async function pfr() {
  const { StatheadBrowser } = require("../lib/stathead-browser");
  const sh = new StatheadBrowser({ runDate, idPrefix: "NM" });
  const read = async (url, ids) => {
    for (let t = 1; t <= 3; t += 1) {
      try {
        await sh.open(); await sh.throttle();
        const res = await sh.page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });
        if (res && res.status() === 404) return null;
        return await sh.page.evaluate((want) => {
          // Some PFR tables ship inside HTML comments; parse those too.
          const docs = [document];
          const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_COMMENT);
          for (let c = walker.nextNode(); c; c = walker.nextNode()) if (c.nodeValue.includes("<table")) docs.push(new DOMParser().parseFromString(c.nodeValue, "text/html"));
          const out = {};
          for (const d of docs) for (const id of want) {
            const tb = d.querySelector(`table#${id}`); if (!tb || out[id]) continue;
            const rows = [];
            for (const tr of tb.querySelectorAll("tbody tr")) {
              if (tr.classList.contains("thead")) continue;
              const r = {};
              for (const c of tr.querySelectorAll("th[data-stat],td[data-stat]")) {
                r[c.getAttribute("data-stat")] = (c.textContent || "").trim();
                const a = c.querySelector("a"); if (a && c.getAttribute("data-stat") === "boxscore_word") r._box = a.getAttribute("href");
              }
              if (Object.keys(r).length > 1) rows.push(r);
            }
            out[id] = rows;
          }
          return { title: document.title, tables: out };
        }, ids);
      } catch (e) { console.log(`PFR retry ${t}: ${url} ${e.message}`); await sleep(5000 * t); }
    }
    return null;
  };
  try {
    for (const ab of [A, B]) {
      const [code, first] = PFR[ab];
      const seasons = [], lines = [];
      for (let y = Math.max(FROM, first); y <= SEASON; y += 1) {
        const r = await read(`https://www.pro-football-reference.com/teams/${code}/${y}.htm`, ["games"]);
        seasons.push({ season: y, ok: !!(r && r.tables.games), games: (r && r.tables.games) || [] });
        if (y % 10 === 0) console.log(`PFR ${ab} ${y}`);
      }
      for (let y = Math.max(LFROM, first); y <= SEASON; y += 1) {
        const r = await read(`https://www.pro-football-reference.com/teams/${code}/${y}_lines.htm`, ["vegas_lines"]);
        lines.push({ season: y, ok: !!(r && r.tables.vegas_lines), rows: (r && r.tables.vegas_lines) || [] });
      }
      save(`pfr-${ab}-seasons.json`, { team: ab, pfr: code, source: "pro-football-reference.com team season pages (games table)", seasons });
      save(`pfr-${ab}-lines.json`, { team: ab, pfr: code, source: "pro-football-reference.com _lines pages (vegas_lines table)", lines });
      const miss = seasons.filter((s) => !s.ok).map((s) => s.season).concat(lines.filter((s) => !s.ok).map((s) => `${s.season}L`));
      console.log(`PFR ${ab}: ${seasons.length} seasons, ${lines.length} line pages${miss.length ? `, MISSING ${miss.join(",")}` : ""}`);
    }
  } finally { await sh.close(); }
}

// ---------- ESPN ----------
function compactLog(j) {
  if (!j) return null;
  const labels = j.names || j.labels || [];
  const ev = j.events || {};
  const games = [];
  for (const st of j.seasonTypes || []) {
    for (const cat of st.categories || []) {
      for (const e of cat.events || []) {
        const m = ev[e.eventId] || {};
        games.push({ id: e.eventId, type: st.displayName, date: m.gameDate, wk: m.week, opp: m.opponent && m.opponent.abbreviation, atVs: m.atVs,
          res: m.gameResult, score: m.score, team: m.team && m.team.abbreviation, s: Object.fromEntries(labels.map((l, i) => [l, (e.stats || [])[i]])) });
      }
    }
  }
  return { labels, displayNames: j.displayNames, games };
}

async function espn() {
  const teams = ((await get(`${SITE}/teams`)) || {}).sports?.[0]?.leagues?.[0]?.teams?.map((t) => t.team) || [];
  const d = runDate.replace(/-/g, "");
  save("espn-scoreboard-today.json", await get(`${SITE}/scoreboard?dates=${d}`));
  for (const ab of [A, B]) {
    const t = teams.find((x) => x.abbreviation === ab);
    if (!t) { console.log(`ESPN: no team ${ab}`); continue; }
    const ros = await get(`${SITE}/teams/${t.id}/roster`);
    const players = ((ros && ros.athletes) || []).flatMap((g) => g.items || []);
    const out = { team: { id: t.id, abbreviation: ab, name: t.displayName }, players: [] };
    for (const p of players) {
      const yrs = (p.experience && Number(p.experience.years)) || 0;
      const rec = { id: p.id, name: p.fullName, pos: p.position && p.position.abbreviation, exp: yrs, status: p.status && p.status.name, seasons: {} };
      for (let y = SEASON - yrs; y <= SEASON; y += 1) {
        const c = compactLog(await get(`${WEB}/athletes/${p.id}/gamelog?season=${y}`));
        if (c && c.games.length) rec.seasons[y] = c;
        await sleep(120);
      }
      out.players.push(rec);
    }
    save(`espn-${ab}-players.json`, out);
    console.log(`ESPN ${ab}: ${out.players.length} players`);
    const games = [];
    for (const st of [2, 3]) {
      const sch = await get(`${SITE}/teams/${t.id}/schedule?season=${SEASON}&seasontype=${st}`);
      for (const ev of (sch && sch.events) || []) {
        const done = ev.competitions?.[0]?.status?.type?.completed;
        games.push({ id: ev.id, date: ev.date, name: ev.name, week: ev.week && ev.week.number, completed: !!done, summary: done ? await get(`${SITE}/summary?event=${ev.id}`) : null });
        await sleep(120);
      }
    }
    save(`espn-${ab}-${SEASON}-games.json`, { team: out.team, games });
  }
}

async function main() {
  if (!A || !B || !PFR[A] || !PFR[B]) throw new Error("usage: matchup-pull.js KC SEA");
  try { await espn(); } catch (e) { console.log(`ESPN FAILED: ${e.stack || e.message}`); save("espn-error.json", { error: e.message }); }
  try { await pfr(); } catch (e) { console.log(`PFR FAILED: ${e.stack || e.message}`); save("pfr-error.json", { error: e.message }); }
  if (!argv.includes("--commit")) return;
  const { spawnSync } = require("child_process");
  const repo = path.join(__dirname, "..", "..");
  const git = (...x) => spawnSync("git", x, { cwd: repo, encoding: "utf8" }).status;
  git("config", "user.name", "statdesk-bot"); git("config", "user.email", "noreply@anthropic.com");
  git("add", "statdesk/data/nfl/matchups");
  if (git("diff", "--cached", "--quiet") === 0) return;
  git("commit", "-m", `Stat Desk NFL: ${A}-${B} matchup pull ${runDate}`);
  const branch = process.env.GITHUB_REF_NAME || "main";
  for (let i = 1; i <= 5; i += 1) {
    if (git("pull", "--rebase", "origin", branch) === 0 && git("push", "origin", `HEAD:${branch}`) === 0) { console.log("[nfl-matchup] pushed"); return; }
    await sleep(i * 4000);
  }
  process.exitCode = 1;
}
main().catch((e) => { console.error(e.stack || e.message); process.exit(1); });
