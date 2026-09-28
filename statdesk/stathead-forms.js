#!/usr/bin/env node
// Discover the exact Stathead finder parameters for each sport.
//
// The baseball finder's parameter names were copied from URLs real browser
// sessions produced. For football, basketball, college football and college
// basketball there are no such URLs yet, and guessing a column name would
// silently filter on the wrong stat — the baseball pipeline once filtered a
// pitching query on the batting strikeout column exactly that way. So this
// loads each finder form in the signed-in browser and records every field,
// every stat option (value + label), the sort options, and the year range the
// form allows. Nothing is queried; only the form is read.
//
//   node statdesk/stathead-forms.js [--commit]
"use strict";
const fs = require("fs");
const path = require("path");
const { StatheadBrowser } = require("./lib/stathead-browser");

const FORMS = [
  ["football", "player-season-finder"], ["football", "player-game-finder"], ["football", "team-season-finder"],
  ["basketball", "player-season-finder"], ["basketball", "player-game-finder"], ["basketball", "team-season-finder"],
  ["cfb", "player-season-finder"], ["cfb", "team-season-finder"], ["cfb", "team-game-finder"],
  ["cbb", "player-season-finder"], ["cbb", "team-season-finder"], ["cbb", "team-game-finder"],
];

async function main() {
  const runDate = new Date().toLocaleDateString("en-CA", { timeZone: "America/New_York" });
  const sh = new StatheadBrowser({ runDate });
  await sh.open();
  const out = {};
  try {
    for (const [sport, form] of FORMS) {
      const url = `https://www.sports-reference.com/stathead/${sport}/${form}.cgi`;
      await sh.throttle();
      let rec;
      try {
        const res = await sh.page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });
        rec = await sh.page.evaluate(() => {
          // Defensive read: every named select/input on the page (not only in a
          // form), every datalist, and any picker items carrying data-value.
          const fields = {};
          for (const el of document.querySelectorAll("select[name], input[name], textarea[name]")) {
            const name = el.getAttribute("name");
            const entry = el.tagName === "SELECT" ? { type: "select", options: [...el.options].map((o) => [o.value, (o.textContent || "").trim()]).slice(0, 800) }
              : { type: el.type || el.tagName.toLowerCase(), value: el.value || undefined, list: el.getAttribute("list") || undefined };
            const prev = fields[name];
            if (!prev || (entry.options && (!prev.options || entry.options.length > prev.options.length))) fields[name] = entry;
          }
          const datalists = {};
          for (const dl of document.querySelectorAll("datalist")) datalists[dl.id || `dl${Object.keys(datalists).length}`] = [...dl.querySelectorAll("option")].map((o) => [o.value, o.label || o.textContent.trim()]).slice(0, 800);
          const picks = [...document.querySelectorAll("[data-value]")].slice(0, 1500).map((e) => [e.getAttribute("data-value"), (e.textContent || "").trim().slice(0, 60)]);
          return { title: document.title, fields, datalists, picks };
        });        rec.status = res ? res.status() : 0;
      } catch (e) { rec = { error: e.message }; }
      // The column keys of a results table are the finder's stat keys (the
      // baseball keys b_hr etc. match exactly this way). One small unfiltered
      // sample query per finder records them with their labels.
      if (!rec.error) {
        const match = /team-game/.test(form) ? "team_game" : /team/.test(form) ? "team_season" : /game/.test(form) ? "player_game" : "player_season";
        const y = sport === "basketball" || sport === "cbb" ? 2024 : 2023;
        const sample = `${url}?request=1&match=${match}&year_min=${y}&year_max=${y}`;
        try {
          await sh.throttle();
          await sh.page.goto(sample, { waitUntil: "domcontentloaded", timeout: 60000 });
          rec.sample = await sh.page.evaluate(() => {
            const t = document.querySelector("table#stats") || document.querySelector("table.stats_table");
            if (!t) return { error: "no results table", title: document.title };
            const headers = [...t.querySelectorAll("thead th[data-stat]")].map((th) => [th.getAttribute("data-stat"), (th.getAttribute("aria-label") || th.getAttribute("data-tip") || th.textContent || "").trim()]);
            const body = document.body.innerText || ""; const m = body.match(/Showing\s+([\d,]+)\s+of\s+([\d,]+)/i);
            return { headers, rows: t.querySelectorAll("tbody tr").length, reported: m ? m[2] : null };
          });
          rec.sample.url = sample;
        } catch (e) { rec.sample = { error: e.message, url: sample }; }
      }
      out[`${sport}/${form}`] = { url, ...rec };
      const cst = rec.fields && Object.entries(rec.fields).find(([k, v]) => /^cstat/.test(k) && v.options);
      console.log(`${sport}/${form}: ${rec.error || `${Object.keys(rec.fields || {}).length} fields, ${cst ? cst[1].options.length : 0} stat dropdown options, ${rec.datalists ? Object.keys(rec.datalists).length : 0} datalists, ${rec.picks ? rec.picks.length : 0} picker items; sample columns: ${rec.sample && rec.sample.headers ? rec.sample.headers.length : (rec.sample && rec.sample.error) || 0}`}`);
    }
  } finally { await sh.close(); }
  const dir = path.join(__dirname, "data", "stathead-forms"); fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "forms.json"), JSON.stringify({ runDate, forms: out }, null, 1));
  if (!process.argv.includes("--commit")) return;
  const { spawnSync } = require("child_process");
  const repo = path.join(__dirname, "..");
  const git = (...x) => { const r = spawnSync("git", x, { cwd: repo, encoding: "utf8" }); return { code: r.status, out: (r.stdout || "") + (r.stderr || "") }; };
  git("config", "user.name", "statdesk-bot"); git("config", "user.email", "noreply@anthropic.com");
  git("add", "statdesk/data/stathead-forms");
  if (git("diff", "--cached", "--quiet").code === 0) return;
  git("commit", "-m", "Stat Desk: Stathead finder form discovery");
  const branch = process.env.GITHUB_REF_NAME || "main";
  for (let i = 1; i <= 5; i += 1) {
    if (git("pull", "--rebase", "origin", branch).code === 0 && git("push", "origin", `HEAD:${branch}`).code === 0) { console.log("[forms] pushed"); return; }
    await new Promise((r) => setTimeout(r, i * 4000));
  }
}
main().catch((e) => { console.error(e.stack || e.message); process.exit(1); });
