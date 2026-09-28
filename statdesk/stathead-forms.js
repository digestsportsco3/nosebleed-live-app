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
          const f = document.querySelector("form#finder") || document.querySelector("form[action*='finder']") || document.querySelector("form");
          if (!f) return { error: "no form" };
          const fields = {};
          for (const el of f.querySelectorAll("select, input")) {
            const name = el.getAttribute("name"); if (!name) continue;
            if (el.tagName === "SELECT") {
              const opts = [...el.options].map((o) => [o.value, (o.textContent || "").trim()]);
              if (!fields[name] || opts.length > fields[name].options.length) fields[name] = { type: "select", options: opts };
            } else if (!fields[name]) fields[name] = { type: el.type, value: el.value, placeholder: el.placeholder || undefined };
          }
          return { title: document.title, action: f.getAttribute("action"), fields };
        });
        rec.status = res ? res.status() : 0;
      } catch (e) { rec = { error: e.message }; }
      out[`${sport}/${form}`] = { url, ...rec };
      const cstat = rec.fields && Object.entries(rec.fields).find(([k]) => /^cstat/.test(k));
      console.log(`${sport}/${form}: ${rec.error || `${Object.keys(rec.fields || {}).length} fields, ${cstat ? cstat[1].options.length : 0} stat options`}`);
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
