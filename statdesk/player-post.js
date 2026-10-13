#!/usr/bin/env node
// One player's postseason career from the MLB Stats API, round by round.
// `stats=career&gameType=F,D,L,W` returns only the first type, so each round
// (F Wild Card, D Division Series, L LCS, W World Series) is requested on its
// own, with year-by-year rows to cross-check the totals. Nick's machine only.
//
//   node statdesk/player-post.js "George Springer" [hitting|pitching] [--commit]
"use strict";
const fs = require("fs");
const path = require("path");

const API = "https://statsapi.mlb.com/api/v1";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const args = process.argv.slice(2).filter((a) => !a.startsWith("--"));
const who = args.filter((a) => !/^(hitting|pitching|both)$/.test(a)).join(" ");
const groupArg = args.find((a) => /^(hitting|pitching|both)$/.test(a)) || "hitting";
const groups = groupArg === "both" ? ["hitting", "pitching"] : [groupArg];
const OUT = path.join(__dirname, "data", "mlb", "players");

async function get(url) {
  for (let i = 1; i <= 4; i += 1) {
    try { const r = await fetch(url, { headers: { "User-Agent": "Stat Desk (Nosebleed Sports)" } }); if (r.ok) return await r.json(); }
    catch (e) { /* retry */ }
    await sleep(800 * i);
  }
  return null;
}

async function main() {
  if (!who) throw new Error("usage: player-post.js \"Player Name\" [hitting|pitching]");
  const rec = { query: who, at: new Date().toISOString(), candidates: [], rounds: {} };
  let id = /^\d+$/.test(who) ? Number(who) : null;
  if (!id) {
    const u = `${API}/people/search?names=${encodeURIComponent(who)}&sportIds=1`;
    const s = await get(u); rec.search = { url: u };
    rec.candidates = ((s && s.people) || []).map((p) => ({ id: p.id, fullName: p.fullName, birthDate: p.birthDate, mlbDebutDate: p.mlbDebutDate, active: p.active }));
    const exact = rec.candidates.filter((p) => p.fullName.toLowerCase() === who.toLowerCase() && p.mlbDebutDate);
    if (exact.length !== 1) { console.log("ambiguous or not found:", JSON.stringify(rec.candidates)); }
    id = (exact[0] || rec.candidates[0] || {}).id;
  }
  if (!id) throw new Error(`no player found for ${who}`);
  const pu = `${API}/people/${id}`; rec.person = { url: pu, body: await get(pu) };
  const season = new Date().getFullYear();
  for (const group of groups) {
    const out = { ...rec, group, rounds: {} };
    for (const t of ["F", "D", "L", "W"]) {
      const cu = `${API}/people/${id}/stats?stats=career&group=${group}&gameType=${t}&sportId=1`;
      const yu = `${API}/people/${id}/stats?stats=yearByYear&group=${group}&gameType=${t}&sportId=1`;
      out.rounds[t] = { career: { url: cu, body: await get(cu) }, yearByYear: { url: yu, body: await get(yu) } };
      await sleep(150);
    }
    // This October game by game, every postseason round.
    const lu = `${API}/people/${id}/stats?stats=gameLog&group=${group}&season=${season}&gameType=F,D,L,W&sportId=1`;
    out.postGameLog = { url: lu, body: await get(lu) };
    out.postGameLogByRound = {};
    for (const t of ["F", "D", "L", "W"]) { const u = `${API}/people/${id}/stats?stats=gameLog&group=${group}&season=${season}&gameType=${t}&sportId=1`; out.postGameLogByRound[t] = { url: u, body: await get(u) }; }
    const ru = `${API}/people/${id}/stats?stats=career&group=${group}&gameType=R&sportId=1`;
    out.regularCareer = { url: ru, body: await get(ru) };
    const su = `${API}/people/${id}/stats?stats=season&group=${group}&season=${season}&gameType=R&sportId=1`;
    out.regularSeason = { url: su, body: await get(su) };
    fs.mkdirSync(OUT, { recursive: true });
    const name = `${id}-post-${group}.json`;
    fs.writeFileSync(path.join(OUT, name), JSON.stringify(out));
    console.log(`[player-post] ${who} -> ${id}, saved ${name}`);
  }
  if (!process.argv.includes("--commit")) return;
  const { spawnSync } = require("child_process");
  const repo = path.join(__dirname, "..");
  const git = (...x) => spawnSync("git", x, { cwd: repo, encoding: "utf8" }).status;
  git("config", "user.name", "statdesk-bot"); git("config", "user.email", "noreply@anthropic.com");
  git("add", "statdesk/data/mlb/players");
  if (git("diff", "--cached", "--quiet") === 0) return;
  git("commit", "-m", `Stat Desk MLB: postseason career pull for ${who}`);
  const branch = process.env.GITHUB_REF_NAME || "main";
  for (let i = 1; i <= 5; i += 1) {
    if (git("pull", "--rebase", "origin", branch) === 0 && git("push", "origin", `HEAD:${branch}`) === 0) { console.log("[player-post] pushed"); return; }
    await sleep(i * 4000);
  }
  process.exitCode = 1;
}
main().catch((e) => { console.error(e.stack || e.message); process.exit(1); });
