#!/usr/bin/env node
// Second discovery pass on the signed-in browser:
//   1. find the real college football / college basketball finder links
//      (the guessed /stathead/cfb/ and /stathead/cbb/ paths were 404s);
//   2. one football sample per stat family, so every column key is seen;
//   3. how a results page states its total, and whether player cells carry
//      a stable id (data-append-csv), which only/two/few counting needs.
// Reads pages; saves structured findings only, never raw HTML.
//
//   node statdesk/stathead-discover2.js [--commit]
"use strict";
const fs = require("fs");
const path = require("path");
const { StatheadBrowser } = require("./lib/stathead-browser");

const INDEXES = ["https://www.sports-reference.com/stathead/", "https://www.sports-reference.com/stathead/basketball/",
  "https://www.sports-reference.com/stathead/football/", "https://www.sports-reference.com/cfb/", "https://www.sports-reference.com/cbb/"];
const FB = "https://www.sports-reference.com/stathead/football/player-season-finder.cgi?request=1&match=player_season&year_min=1985&year_max=1985&comp_type=reg";
const SAMPLES = ["pass_yds", "rush_yds", "rec_yds", "def_int", "sacks", "punt_ret_yds", "fgm", "scoring_pts"].map((k) => [`football:${k}`, `${FB}&order_by=${k}`]);

async function main() {
  const runDate = new Date().toLocaleDateString("en-CA", { timeZone: "America/New_York" });
  const sh = new StatheadBrowser({ runDate });
  await sh.open();
  const out = { runDate, links: {}, samples: {} };
  try {
    for (const url of INDEXES) {
      await sh.throttle();
      try {
        const res = await sh.page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });
        out.links[url] = { status: res && res.status(), finders: await sh.page.evaluate(() => [...new Set([...document.querySelectorAll("a[href]")]
          .map((a) => [a.href, (a.textContent || "").trim().slice(0, 60)]).filter(([h]) => /finder|stathead/i.test(h)).map((x) => JSON.stringify(x)))].map((x) => JSON.parse(x)).slice(0, 200)) };
      } catch (e) { out.links[url] = { error: e.message }; }
      console.log(`${url}: ${out.links[url].error || `${out.links[url].finders.length} finder links`}`);
    }
    for (const [key, url] of SAMPLES) {
      await sh.throttle();
      try {
        await sh.page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });
        out.samples[key] = await sh.page.evaluate(() => {
          const t = document.querySelector("table#stats") || document.querySelector("table.stats_table");
          const body = document.body.innerText || "";
          const countText = (body.match(/[^\n]{0,80}(match|result|showing|of \d)[^\n]{0,80}/ig) || []).slice(0, 8);
          if (!t) return { error: "no table", countText };
          const headers = [...t.querySelectorAll("thead tr:last-child th[data-stat]")].map((th) => [th.getAttribute("data-stat"), (th.getAttribute("aria-label") || th.getAttribute("data-tip") || th.textContent || "").trim()]);
          const bodyRows = [...t.querySelectorAll("tbody tr")].filter((tr) => !tr.classList.contains("thead"));
          const first = bodyRows[0]; const nameCell = first && first.querySelector("[data-stat='name_display']");
          return { headers, bodyRows: bodyRows.length, countText,
            nameCellAttrs: nameCell ? [...nameCell.attributes].map((a) => [a.name, a.value.slice(0, 40)]) : null,
            nameLink: nameCell && nameCell.querySelector("a") ? nameCell.querySelector("a").getAttribute("href") : null,
            nextLink: (document.querySelector("a.button2.next, a[href*='offset=']") || {}).href || null };
        });
        out.samples[key].url = url;
      } catch (e) { out.samples[key] = { error: e.message, url }; }
      const s = out.samples[key];
      console.log(`${key}: ${s.error || `${s.headers.length} cols, ${s.bodyRows} rows, id attr: ${JSON.stringify(s.nameCellAttrs)}, next: ${s.nextLink ? "yes" : "no"}`}`);
    }
  } finally { await sh.close(); }
  const dir = path.join(__dirname, "data", "stathead-forms"); fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "discover2.json"), JSON.stringify(out, null, 1));
  if (!process.argv.includes("--commit")) return;
  const { spawnSync } = require("child_process");
  const repo = path.join(__dirname, "..");
  const git = (...x) => { const r = spawnSync("git", x, { cwd: repo, encoding: "utf8" }); return { code: r.status, out: (r.stdout || "") + (r.stderr || "") }; };
  git("config", "user.name", "statdesk-bot"); git("config", "user.email", "noreply@anthropic.com");
  git("add", "statdesk/data/stathead-forms");
  if (git("diff", "--cached", "--quiet").code === 0) return;
  git("commit", "-m", "Stat Desk: Stathead discovery pass 2 (college links, football samples)");
  const branch = process.env.GITHUB_REF_NAME || "main";
  for (let i = 1; i <= 5; i += 1) {
    if (git("pull", "--rebase", "origin", branch).code === 0 && git("push", "origin", `HEAD:${branch}`).code === 0) { console.log("[discover2] pushed"); return; }
    await new Promise((r) => setTimeout(r, i * 4000));
  }
}
main().catch((e) => { console.error(e.stack || e.message); process.exit(1); });
