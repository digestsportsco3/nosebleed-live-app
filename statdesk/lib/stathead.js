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
// Stathead serves the results table with an empty body and this line when the
// request is not authenticated. It is the difference between "no rows matched"
// and "we were not logged in", so it must never be read as an empty result.
// ONLY these two phrases mean the results were withheld. "Subscribe to
// Stathead" was in this list and is a generic nav link present on every page
// INCLUDING when signed in, so it rejected perfectly good pages: a verified
// capture showed "Welcome Nicholas", real result rows, and neither real
// paywall phrase. Do not widen this again without a captured page proving it.
const PAYWALL = /Log in for full results|Already a paid subscriber/i;

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

  // Follows redirects by hand so cookies set on each hop land in the jar.
  // node's fetch drops Set-Cookie visibility across automatic redirects.
  async hop(url, { method = "GET", body = null, referer = null, max = 6 } = {}) {
    let current = url;
    let res = null;
    const trail = [];
    for (let i = 0; i <= max; i += 1) {
      await this.throttle();
      const headers = { "User-Agent": UA, Accept: "text/html,application/xhtml+xml" };
      if (this.jar.size) headers.Cookie = this.cookieHeader();
      if (referer) headers.Referer = referer;
      if (body && i === 0) headers["Content-Type"] = "application/x-www-form-urlencoded";
      res = await fetch(current, { method: i === 0 ? method : "GET", body: i === 0 ? body : undefined, redirect: "manual", headers });
      this.absorb(res);
      trail.push(`${res.status} ${current}`);
      const loc = res.headers.get("location");
      if (res.status >= 300 && res.status < 400 && loc) {
        current = new URL(loc, current).toString();
        continue;
      }
      break;
    }
    const text = await res.text().catch(() => "");
    return { status: res.status, ok: res.status >= 200 && res.status < 300, url: current, text, trail };
  }

  // True only when a finder page renders results rather than the paywall.
  // Checking "my account" looked logged in while every query came back gated,
  // so the probe is now the real thing the pipeline depends on.
  async verify() {
    const probe = "https://www.sports-reference.com/stathead/baseball/player-batting-season-finder.cgi"
      + "?request=1&match=player_season&year_min=2026&year_max=2026&comp_type=reg"
      + "&order_by=b_hr&order_by_asc=0&ccomp[1]=gt&cval[1]=45&cstat[1]=b_hr";
    const r = await this.hop(probe);
    if (PAYWALL.test(r.text)) return false;
    return /data-stat=/.test(r.text);
  }

  async login() {
    if (this.loggedIn) return;
    if (!this.user || !this.pass) {
      throw new Error("STATHEAD_USER and STATHEAD_PASS are not set. Nothing was queried.");
    }
    const endpoints = [
      "https://stathead.com/users/login.cgi",
      "https://www.sports-reference.com/users/login.cgi",
      "https://www.baseball-reference.com/users/login.cgi",
    ];
    const tried = [];
    for (const url of endpoints) {
      try {
        await this.attempt(url);
        this.loggedIn = true;
        return;
      } catch (e) {
        tried.push(`  ${url}\n    ${String(e.message || e).replace(/\n/g, "\n    ")}`);
      }
    }
    throw new Error(`Stathead login failed on every endpoint. Nothing was queried.\n${tried.join("\n")}`);
  }

  async attempt(loginUrl) {
    // Load the form and carry every hidden field, not just a guessed token name.
    const form = await this.hop(loginUrl);
    if (form.status !== 200) throw new Error(`login page returned ${form.status} (${form.trail.join(" -> ")})`);
    const body = new URLSearchParams();
    for (const m of form.text.matchAll(/<input[^>]*type=["']hidden["'][^>]*>/gi)) {
      const tag = m[0];
      const name = (tag.match(/name=["']([^"']+)["']/i) || [])[1];
      const value = (tag.match(/value=["']([^"']*)["']/i) || [])[1] || "";
      if (name) body.set(name, value);
    }
    // Field names differ across their login forms; send the common spellings.
    for (const k of ["username", "email", "user"]) body.set(k, this.user);
    for (const k of ["password", "pass"]) body.set(k, this.pass);
    body.set("remember", "1");

    // Post to the URL the form actually resolved to. Posting to a address that
    // 301s means the redirect is followed as a GET and the credentials are
    // silently dropped, which is exactly what was happening.
    const target = form.url;
    const res = await this.hop(target, { method: "POST", body, referer: target });
    const snippet = res.text.slice(0, 600).replace(/\s+/g, " ");
    if (/incorrect|invalid|not match|try again/i.test(res.text.slice(0, 5000))) {
      throw new Error(`credentials rejected (${res.trail.join(" -> ")})`);
    }
    if (/captcha|recaptcha|hcaptcha|cf-turnstile/i.test(res.text)) {
      throw new Error(`a CAPTCHA is in the way; sign in once in a real browser, then retry (${res.trail.join(" -> ")})`);
    }
    if (!(await this.verify())) {
      throw new Error(`no session after POST. hops: ${res.trail.join(" -> ")}; cookies: ${[...this.jar.keys()].join(",") || "none"}; page began: ${snippet}`);
    }
  }

  // Runs one finder URL and returns { id, rows, headers, rowCount, url, html }.
  async query(url, { label = "", note = "" } = {}) {
    await this.login();
    const res = await this.hop(url, { referer: "https://stathead.com/" });
    const html = res.text;
    if (res.status === 403 || /cf-browser-verification|Just a moment/i.test(html.slice(0, 2000))) {
      throw new Error(`Blocked by Cloudflare on ${url}. Stop and run this query in Nick's browser instead; do not retry in a loop.`);
    }
    if (!res.ok) throw new Error(`HTTP ${res.status} for ${url} (hops: ${res.trail.join(" -> ")})`);
    if (PAYWALL.test(html)) {
      this.loggedIn = false;
      throw new Error(`Stathead withheld results for ${url}: the page carries "Log in for full results", so the session is not authenticated. This is NOT an empty result and must never be reported as one.`);
    }
    const { headers, rows, capped, reported } = parseTable(html);
    this.n += 1;
    const id = `Q${String(this.n).padStart(3, "0")}`;
    // Keep the raw page whenever the parse looks wrong, so a failure can be
    // diagnosed from the artifact instead of guessed at across runs.
    if (this.dir && rows.length < 2) {
      try { fs.writeFileSync(path.join(this.dir, `${id}.raw.html`), html); } catch (e) { /* diagnostics only */ }
    }
    const rec = { id, ts: new Date().toISOString(), url, label, headers, rows, rowCount: rows.length, capped, reported, note };
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
