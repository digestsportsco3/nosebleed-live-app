// Headless Stathead / Baseball Reference client.
//
// WHY THIS EXISTS: the original design drove Nick's signed-in Chrome, which
// means the pipeline only ran when Nick opened a terminal. This module logs in
// with his subscription directly so any session, cloud or local, can run the
// same queries and save the same provenance records.
//
// It uses his own paid Stathead account. The republishing rule from
// STATDESK.md still stands and is not a technicality: read numbers for
// verification, never mirror their tables and never build a database from
// them. Rate limiting below is deliberate, not decorative.
//
// Credentials come from the environment, never from the repo:
//   STATHEAD_USER, STATHEAD_PASS
"use strict";
const fs = require("fs");
const path = require("path");
const { sleep } = require("./http");

const LOGIN_URL = "https://stathead.com/users/login.cgi";
const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Safari/537.36";
const MIN_GAP_MS = 4000; // one query per 4s, floor. Do not lower.

class Stathead {
  constructor({ user = process.env.STATHEAD_USER, pass = process.env.STATHEAD_PASS, dataDir, runDate } = {}) {
    this.user = user;
    this.pass = pass;
    this.jar = new Map();
    this.loggedIn = false;
    this.lastCall = 0;
    this.runDate = runDate;
    this.dir = dataDir ? path.join(dataDir, runDate) : null;
    if (this.dir) fs.mkdirSync(this.dir, { recursive: true });
    this.logPath = dataDir ? path.join(dataDir, "queries.log") : null;
    this.n = 0;
  }

  cookieHeader() {
    return [...this.jar.entries()].map(([k, v]) => `${k}=${v}`).join("; ");
  }
  absorb(res) {
    const raw = typeof res.headers.getSetCookie === "function" ? res.headers.getSetCookie() : [];
    for (const c of raw) {
      const [pair] = c.split(";");
      const i = pair.indexOf("=");
      if (i > 0) this.jar.set(pair.slice(0, i).trim(), pair.slice(i + 1).trim());
    }
  }
  async throttle() {
    const wait = MIN_GAP_MS - (Date.now() - this.lastCall);
    if (wait > 0) await sleep(wait);
    this.lastCall = Date.now();
  }

  async login() {
    if (this.loggedIn) return;
    if (!this.user || !this.pass) {
      throw new Error("STATHEAD_USER and STATHEAD_PASS are not set. Add them to the cloud environment's variables (or export them locally). Nothing was queried.");
    }
    await this.throttle();
    // Prime cookies from the login page first; the form posts a hidden token.
    const page = await fetch(LOGIN_URL, { headers: { "User-Agent": UA } });
    this.absorb(page);
    const html = await page.text();
    const token = (html.match(/name=["']csrf_token["'][^>]*value=["']([^"']+)["']/i) || [])[1];

    const body = new URLSearchParams({ username: this.user, password: this.pass, remember: "1" });
    if (token) body.set("csrf_token", token);

    await this.throttle();
    const res = await fetch(LOGIN_URL, {
      method: "POST",
      redirect: "manual",
      headers: { "User-Agent": UA, "Content-Type": "application/x-www-form-urlencoded", Cookie: this.cookieHeader(), Referer: LOGIN_URL },
      body,
    });
    this.absorb(res);
    const after = await res.text().catch(() => "");
    const ok = this.jar.size > 0 && (res.status === 302 || res.status === 303 || /logout|my account/i.test(after));
    if (!ok || /invalid|incorrect|try again/i.test(after.slice(0, 4000))) {
      throw new Error(`Stathead login failed (HTTP ${res.status}). Check STATHEAD_USER/STATHEAD_PASS, or the account may need a CAPTCHA solved in a real browser. Nothing was queried.`);
    }
    this.loggedIn = true;
  }

  // Runs one finder URL and returns { id, rows, headers, rowCount, url, html }.
  async query(url, { label = "", note = "" } = {}) {
    await this.login();
    await this.throttle();
    const res = await fetch(url, { headers: { "User-Agent": UA, Cookie: this.cookieHeader(), Referer: "https://stathead.com/" } });
    this.absorb(res);
    const html = await res.text();
    if (res.status === 403 || /cf-browser-verification|Just a moment/i.test(html.slice(0, 2000))) {
      throw new Error(`Blocked by Cloudflare on ${url}. Stop and run this query in Nick's browser instead; do not retry in a loop.`);
    }
    if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
    if (/log ?in|subscribe/i.test(html) && !/data-stat=/.test(html)) {
      this.loggedIn = false;
      throw new Error(`Stathead returned a login/paywall page for ${url}. The session expired. Nothing was read.`);
    }
    const { headers, rows, capped } = parseTable(html);
    this.n += 1;
    const id = `Q${String(this.n).padStart(3, "0")}`;
    const rec = { id, ts: new Date().toISOString(), url, label, headers, rows, rowCount: rows.length, capped, note };
    if (this.dir) this.save(rec);
    return rec;
  }

  // Provenance record, same shape the browser sessions wrote by hand.
  save(rec) {
    const md = [
      `# ${rec.id} — ${rec.label}`,
      ``,
      `- Source: Stathead / Baseball Reference, queried headlessly with Nick's subscription`,
      `- Page URL: ${rec.url}`,
      `- Timestamp: ${rec.ts}`,
      `- Row count reported by the page: ${rec.rowCount}${rec.capped ? " (PAGE IS CAPPED — tighten the filter before any complete-set claim)" : ""}`,
      rec.note ? `- Note: ${rec.note}` : null,
      ``,
      `## Result table (read from the page)`,
      ``,
      "```",
      rec.headers.join(" | "),
      ...rec.rows.map((r) => rec.headers.map((h) => r[h] ?? "").join(" | ")),
      "```",
      ``,
      `## Claim check`,
      ``,
      rec.capped
        ? `- INCOMPLETE. The page capped the results, so no "only/first/most" claim may be made from this query. Tighten the filter and re-run.`
        : `- All ${rec.rowCount} rows were read. Any superlative must be checked against every row above before it is written as a statement.`,
      ``,
    ].filter((x) => x !== null).join("\n");
    fs.writeFileSync(path.join(this.dir, `${rec.id}.md`), md);
    if (this.logPath) {
      fs.appendFileSync(this.logPath, `${rec.ts}\t${rec.id}\tstathead\t${rec.label}\trows=${rec.rowCount}${rec.capped ? "\tCAPPED" : ""}\n`);
    }
  }
}

// Sports Reference tags every cell with data-stat, which makes this stable
// without an HTML parser dependency. Some of their tables ship inside an HTML
// comment, so uncomment first.
function parseTable(htmlRaw) {
  const html = htmlRaw.replace(/<!--/g, "").replace(/-->/g, "");
  const rowRe = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
  const cellRe = /<(t[hd])[^>]*data-stat=["']([^"']+)["'][^>]*>([\s\S]*?)<\/\1>/gi;
  const headers = [];
  const rows = [];
  let m;
  while ((m = rowRe.exec(html))) {
    const tr = m[1];
    if (/class=["'][^"']*thead/.test(m[0])) continue;
    const cells = {};
    let c;
    cellRe.lastIndex = 0;
    while ((c = cellRe.exec(tr))) {
      const key = c[2];
      const val = stripTags(c[3]);
      cells[key] = val;
      if (!headers.includes(key)) headers.push(key);
    }
    const keys = Object.keys(cells);
    if (keys.length < 2) continue;
    if (keys.every((k) => cells[k] === "" || cells[k] === k)) continue;
    rows.push(cells);
  }
  // "Showing 20 of 413" means the page truncated; "Showing 2 of 2" does not.
  let capped = /limited to the first/i.test(html);
  const shown = html.match(/Showing\s+([\d,]+)\s+of\s+([\d,]+)/i);
  if (shown) {
    const n = (x) => Number(x.replace(/,/g, ""));
    if (n(shown[1]) < n(shown[2])) capped = true;
  }
  return { headers, rows, capped, reported: shown ? Number(shown[2].replace(/,/g, "")) : null };
}

function stripTags(s) {
  return s
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#(\d+);/g, (_, d) => String.fromCharCode(+d))
    .trim();
}

module.exports = { Stathead, parseTable };
