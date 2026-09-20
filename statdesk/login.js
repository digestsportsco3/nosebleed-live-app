#!/usr/bin/env node
// Sign in to Stathead once, by hand, into the profile the automation reuses.
//
// Run this on the machine that hosts the runner:   node statdesk/login.js
// A Chrome window opens on the Stathead login page. Sign in normally, clear any
// CAPTCHA, then come back to the terminal and press Enter. The session is saved
// to the profile directory and every future automated run reuses it.
//
// This script never reads, types or stores a password. You type it into a real
// browser, exactly as you would any other day.
"use strict";
const fs = require("fs");
const path = require("path");
const readline = require("readline");

const PROFILE = process.env.STATHEAD_PROFILE
  || path.join(process.env.HOME || process.env.USERPROFILE || ".", ".statdesk-chrome");

(async () => {
  let chromium;
  try { ({ chromium } = require("playwright")); }
  catch (e) {
    console.error("playwright is missing. Run:\n  npm i playwright\n  npx playwright install chromium");
    process.exit(1);
  }
  fs.mkdirSync(PROFILE, { recursive: true });
  console.log(`Profile: ${PROFILE}`);
  const ctx = await chromium.launchPersistentContext(PROFILE, { headless: false, viewport: { width: 1400, height: 950 } });
  const page = ctx.pages()[0] || (await ctx.newPage());
  await page.goto("https://stathead.com/users/login.cgi", { waitUntil: "domcontentloaded" });

  console.log("\nA browser window is open. Sign in to Stathead there.");
  console.log("When you can see you are logged in, press Enter here.\n");
  await new Promise((r) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    rl.question("", () => { rl.close(); r(); });
  });

  // Prove the session actually works before declaring success.
  const probe = "https://www.sports-reference.com/stathead/baseball/player-batting-season-finder.cgi"
    + "?request=1&match=player_season&year_min=2026&year_max=2026&comp_type=reg"
    + "&order_by=b_hr&order_by_asc=0&ccomp[1]=gt&cval[1]=45&cstat[1]=b_hr";
  await page.goto(probe, { waitUntil: "domcontentloaded" });
  const html = await page.content();
  const gated = /Log in for full results|Already a paid subscriber/i.test(html);
  const rows = await page.evaluate(() => {
    const t = document.querySelector("table#stats");
    return t ? t.querySelectorAll("tbody tr[class=''], tbody tr:not(.thead)").length : 0;
  }).catch(() => 0);

  await ctx.close();

  if (gated) {
    console.error("\nNOT SAVED: that page still says you need to log in. Run this again and complete the sign-in.");
    process.exit(2);
  }
  console.log(`\nSession saved. A test query returned ${rows} row(s) with no paywall.`);
  console.log("Automated runs on this machine will now use it. Re-run this only if the login expires.");
})().catch((e) => { console.error("login failed:", e.message); process.exit(1); });
