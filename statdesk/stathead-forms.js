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

// Pass 3: the college finders live under basketball/cbb and football/cfb.
// Each is read for its full stat menu (order_by lists every key with its
// label) and sampled across eras so coverage — how far back player stats
// actually go — is measured, not assumed.
const FORMS = [
  ["football/cfb", "player-season-finder"], ["football/cfb", "team-season-finder"],
  ["basketball/cbb", "player-season-finder"], ["basketball/cbb", "team-season-finder"],
];
const ERA_YEARS = [1900, 1930, 1950, 1965, 1980, 1995, 2010, 2024];

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
        const match = /team/.test(form) ? "team_season" : "player_season";
        rec.eras = {};
        for (const y of ERA_YEARS) {
          const sample = `${url}?request=1&match=${match}&year_min=${y}&year_max=${y}`;
          try {
            await sh.throttle();
            await sh.page.goto(sample, { waitUntil: "domcontentloaded", timeout: 60000 });
            rec.eras[y] = await sh.page.evaluate(() => {
              const t = document.querySelector("table#stats") || document.querySelector("table.stats_table");
              if (!t) return { rows: 0, note: (document.body.innerText.match(/[^\n]{0,90}(no results|did not|0 results|coverage)[^\n]{0,90}/i) || [""])[0] };
              const headers = [...t.querySelectorAll("thead tr:last-child th[data-stat]")].map((th) => th.getAttribute("data-stat"));
              const rows = [...t.querySelectorAll("tbody tr")].filter((tr) => !tr.classList.contains("thead"));
              const first = rows[0]; const cells = first ? Object.fromEntries([...first.querySelectorAll("[data-stat]")].map((c) => [c.getAttribute("data-stat"), (c.textContent || "").trim()])) : null;
              const nm = first && first.querySelector("[data-stat='name_display'], [data-stat='school_name'], [data-stat='team_name']");
              return { rows: rows.length, headers, first: cells, idAttr: nm ? nm.getAttribute("data-append-csv") : null, more: !!document.querySelector("a[href*='offset=']") };
            });
          } catch (e) { rec.eras[y] = { error: e.message }; }
        }
      }
      out[`${sport}/${form}`] = { url, ...rec };
      const ob = rec.fields && rec.fields.order_by && rec.fields.order_by.options;
      console.log(`${sport}/${form}: ${rec.error || `${ob ? ob.length : 0} sort keys; rows by era: ${Object.entries(rec.eras || {}).map(([y, v]) => `${y}:${v.rows ?? "err"}${v.more ? "+" : ""}`).join(" ")}`}`);
    }
  } finally { await sh.close(); }
  const dir = path.join(__dirname, "data", "stathead-forms"); fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "college.json"), JSON.stringify({ runDate, forms: out }, null, 1));
  if (!process.argv.includes("--commit")) return;
  const { spawnSync } = require("child_process");
  const repo = path.join(__dirname, "..");
  const git = (...x) => { const r = spawnSync("git", x, { cwd: repo, encoding: "utf8" }); return { code: r.status, out: (r.stdout || "") + (r.stderr || "") }; };
  git("config", "user.name", "statdesk-bot"); git("config", "user.email", "noreply@anthropic.com");
  git("add", "statdesk/data/stathead-forms");
  if (git("diff", "--cached", "--quiet").code === 0) return;
  git("commit", "-m", "Stat Desk: Stathead college finder discovery (stat menus, coverage by era)");
  const branch = process.env.GITHUB_REF_NAME || "main";
  for (let i = 1; i <= 5; i += 1) {
    if (git("pull", "--rebase", "origin", branch).code === 0 && git("push", "origin", `HEAD:${branch}`).code === 0) { console.log("[forms] pushed"); return; }
    await new Promise((r) => setTimeout(r, i * 4000));
  }
}
main().catch((e) => { console.error(e.stack || e.message); process.exit(1); });
