// Stathead through a real browser with a saved login, driven headlessly.
//
// WHY THIS AND NOT THE HTTP CLIENT: Sports Reference serves datacenter IPs a
// 403, and their login form defeats a plain POST. Both problems disappear when
// the request comes from Nick's own machine in a real browser that is already
// signed in. This module drives that browser with no person present, so the
// pipeline is fully automatic and the subscription is used the way a
// subscriber uses it.
//
// The session lives in a persistent Chrome profile on disk. Nick signs in ONCE,
// by hand, into that profile (see statdesk/SELF-HOSTED.md). Every run after
// that reuses the cookies. No password is ever stored by this code, and no
// credentials are typed by it.
//
// Requires: npm i playwright   (and `npx playwright install chromium` once)
"use strict";
const fs = require("fs");
const path = require("path");

// ONLY these two phrases mean the results were withheld. "Subscribe to
// Stathead" was in this list and is a generic nav link present on every page
// INCLUDING when signed in, so it rejected perfectly good pages: a verified
// capture showed "Welcome Nicholas", real result rows, and neither real
// paywall phrase. Do not widen this again without a captured page proving it.
const PAYWALL = /Log in for full results|Already a paid subscriber/i;
const MIN_GAP_MS = 4000; // one query per 4s, floor. Do not lower.

class StatheadBrowser {
  // headless defaults ON, but Sports Reference appears to serve the paywall to
  // headless Chrome even with a valid session: the identical probe passes in a
  // headed browser (login.js) and fails headless. Set STATHEAD_HEADLESS=false
  // to run visibly, which is what the self-hosted runner does.
  // idPrefix namespaces the saved records. Two callers writing into the same
  // dated folder both numbered from Q001, so the discovery pass silently
  // overwrote every history record on 2026-09-25 — the queries ran, returned,
  // and their results were destroyed seconds later. The append-only
  // queries.log was the only surviving evidence. Any new caller must pass its
  // own prefix.
  constructor({ profileDir, dataDir, runDate, headless, idPrefix } = {}) {
    this.idPrefix = idPrefix || "Q";
    this.profileDir = profileDir || process.env.STATHEAD_PROFILE
      || path.join(process.env.HOME || process.env.USERPROFILE || ".", ".statdesk-chrome");
    this.headless = headless !== undefined ? headless
      : String(process.env.STATHEAD_HEADLESS || "true") !== "false";
    this.runDate = runDate;
    this.dir = dataDir ? path.join(dataDir, runDate) : null;
    if (this.dir) fs.mkdirSync(this.dir, { recursive: true });
    this.logPath = dataDir ? path.join(dataDir, "queries.log") : null;
    this.ctx = null;
    this.page = null;
    this.lastCall = 0;
    this.n = 0;
  }

  async open() {
    if (this.ctx) return;
    let chromium;
    try { ({ chromium } = require("playwright")); }
    catch (e) {
      throw new Error("playwright is not installed. Run `npm i playwright && npx playwright install chromium` in the repo. Nothing was queried.");
    }
    if (!fs.existsSync(this.profileDir)) {
      throw new Error(`No browser profile at ${this.profileDir}. Follow statdesk/SELF-HOSTED.md to sign in once. Nothing was queried.`);
    }
    this.ctx = await chromium.launchPersistentContext(this.profileDir, {
      headless: this.headless,
      viewport: { width: 1440, height: 1000 },
      args: ["--disable-blink-features=AutomationControlled"],
    });
    this.page = this.ctx.pages()[0] || (await this.ctx.newPage());
    // Confirm the saved session still works before running anything.
    const ok = await this.verify();
    if (!ok) {
      // Keep the page that failed, so "not logged in" can be told apart from
      // "served the paywall because we look like a bot".
      if (this.dir) {
        try { fs.writeFileSync(path.join(this.dir, "verify-failed.html"), await this.page.content()); } catch (e) { /* diagnostics only */ }
      }
      const mode = this.headless ? "headless" : "headed";
      await this.close();
      throw new Error(`Stathead did not serve results to the saved session (${mode} browser, profile ${this.profileDir}). Either the login expired, in which case run \`node statdesk/login.js\` on this machine, or the page was withheld from an automated browser. The failing page was saved as verify-failed.html. Nothing was queried and no result was guessed.`);
    }
  }

  async close() {
    if (this.ctx) { await this.ctx.close().catch(() => {}); this.ctx = null; this.page = null; }
  }

  async throttle() {
    const wait = MIN_GAP_MS - (Date.now() - this.lastCall);
    if (wait > 0) await new Promise((r) => setTimeout(r, wait));
    this.lastCall = Date.now();
  }

  async verify() {
    const probe = "https://www.sports-reference.com/stathead/baseball/player-batting-season-finder.cgi"
      + "?request=1&match=player_season&year_min=2026&year_max=2026&comp_type=reg"
      + "&order_by=b_hr&order_by_asc=0&ccomp[1]=gt&cval[1]=45&cstat[1]=b_hr";
    await this.throttle();
    await this.page.goto(probe, { waitUntil: "domcontentloaded", timeout: 45000 });
    const html = await this.page.content();
    return !PAYWALL.test(html);
  }

  // Run one finder URL. Returns rows read from the rendered page.
  async query(url, { label = "", note = "" } = {}) {
    await this.open();
    await this.throttle();
    const res = await this.page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });
    const status = res ? res.status() : 0;
    const html = await this.page.content();
    if (PAYWALL.test(html)) {
      throw new Error(`Stathead withheld results for ${url}. The session is not authenticated. This is NOT an empty result.`);
    }
    if (status >= 400) throw new Error(`HTTP ${status} for ${url}`);

    // Read the rendered table via the DOM rather than regex over HTML.
    const data = await this.page.evaluate(() => {
      const body = document.body.innerText || "";
      // A finder page that simply matched nothing still carries the search
      // form and usually says so in words.
      const isFinderPage = /Finder/i.test(document.title || "")
        && (/no (?:results|matching|players|matches)|0 results|did not match|criteria/i.test(body)
            || !!document.querySelector("form#finder, form[action*='finder'], #results, .search_results"));
      const t = document.querySelector("table#stats") || document.querySelector("table.stats_table");
      if (!t) return { headers: [], rows: [], missing: true, isFinderPage };
      const headers = [...t.querySelectorAll("thead th[data-stat]")]
        .map((th) => ({ key: th.getAttribute("data-stat"), label: (th.getAttribute("aria-label") || th.textContent || "").trim() }));
      const rows = [];
      for (const tr of t.querySelectorAll("tbody tr")) {
        if (tr.classList.contains("thead") || tr.classList.contains("spacer")) continue;
        const cells = {};
        for (const c of tr.querySelectorAll("th[data-stat],td[data-stat]")) {
          cells[c.getAttribute("data-stat")] = (c.textContent || "").trim();
        }
        if (Object.keys(cells).length >= 2) rows.push(cells);
      }
      const m = body.match(/Showing\s+([\d,]+)\s+of\s+([\d,]+)/i);
      const n = (x) => Number(String(x).replace(/,/g, ""));
      return { headers, rows, missing: false, isFinderPage: true,
               reported: m ? n(m[2]) : null,
               capped: m ? n(m[1]) < n(m[2]) : /limited to the first/i.test(body) };
    });
    // Stathead renders no table at all when nothing matches, which is a real
    // answer, not a breakage. Only treat it as an error if the page does not
    // look like a finder result page at all.
    if (data.missing) {
      if (!data.isFinderPage) {
        if (this.dir) {
          try { fs.writeFileSync(path.join(this.dir, `${this.n + 1}-no-table.html`), html); } catch (e) { /* diagnostics only */ }
        }
        throw new Error(`No results table on ${url} and the page does not look like a finder result. The page shape may have changed; stopping rather than reporting zero rows. The page was saved for inspection.`);
      }
      data.rows = [];
      data.headers = [];
      data.emptyResult = true;
    }

    this.n += 1;
    const id = `${this.idPrefix}${String(this.n).padStart(3, "0")}`;
    const rec = { id, ts: new Date().toISOString(), url, label, note, emptyResult: !!data.emptyResult,
                  headers: data.headers, rows: data.rows, rowCount: data.rows.length,
                  reported: data.reported, capped: data.capped };
    if (this.dir) this.save(rec);
    return rec;
  }

  save(rec) {
    const cols = rec.headers.map((h) => h.key);
    const md = [
      `# ${rec.id} — ${rec.label}`, ``,
      `- Source: Stathead / Baseball Reference, read from the rendered page in a signed-in browser`,
      `- Page URL: ${rec.url}`,
      `- Timestamp: ${rec.ts}`,
      `- Rows read: ${rec.rowCount}${rec.reported != null ? ` (page reports ${rec.reported} total)` : ""}`,
      rec.capped ? `- CAPPED: the page truncated the result set. No complete-set claim may be made from this query.` : null,
      rec.note ? `- Note: ${rec.note}` : null,
      ``, `## Result table`, ``, "```",
      cols.join(" | "),
      ...rec.rows.map((r) => cols.map((c) => r[c] ?? "").join(" | ")),
      "```", ``, `## Claim check`, ``,
      rec.capped
        ? `- INCOMPLETE. Tighten the filter and re-run before any "only" or "first" claim.`
        : rec.rowCount === 0
          ? `- ZERO MATCHES. Stathead returned no rows for these filters, which is a real answer: nobody qualifies. Safe to say the rule found nobody; not safe to infer anything else.`
          : `- Complete set: all ${rec.rowCount} rows read. A superlative may be asserted only if it holds across every row above.`,
      ``,
    ].filter((x) => x !== null).join("\n");
    fs.writeFileSync(path.join(this.dir, `${rec.id}.md`), md);
    if (this.logPath) {
      fs.appendFileSync(this.logPath,
        `${rec.ts}\t${rec.id}\tstathead-browser\t${rec.label}\trows=${rec.rowCount}${rec.capped ? "\tCAPPED" : ""}\n`);
    }
  }
}

module.exports = { StatheadBrowser, PAYWALL };
