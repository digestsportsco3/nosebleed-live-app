// Logged, cached HTTP layer. Every fetch is written to disk with a timestamp so
// every number in a brief traces back to one call ID. Sport-agnostic.
"use strict";
const fs = require("fs");
const path = require("path");

class CallLog {
  constructor(dataDir, runDate) {
    this.dataDir = dataDir;
    this.runDate = runDate;
    this.runDir = path.join(dataDir, runDate);
    fs.mkdirSync(this.runDir, { recursive: true });
    this.logPath = path.join(dataDir, "calls.log");
    this.calls = [];
    this.n = 0;
  }
  nextId() {
    this.n += 1;
    return `${this.runDate}-C${String(this.n).padStart(3, "0")}`;
  }
  record(entry) {
    this.calls.push(entry);
    fs.appendFileSync(this.logPath, JSON.stringify(entry) + "\n");
  }
}

async function fetchJson(log, url, { label = "", retries = 3 } = {}) {
  const id = log.nextId();
  const started = new Date();
  let attempt = 0;
  let lastErr = null;
  while (attempt <= retries) {
    attempt += 1;
    const t0 = Date.now();
    try {
      const res = await fetch(url, { headers: { "User-Agent": "nosebleed-statdesk/0.1", Accept: "application/json" } });
      const text = await res.text();
      const ms = Date.now() - t0;
      if (!res.ok) {
        lastErr = new Error(`HTTP ${res.status} for ${url}`);
        if (res.status >= 500 && attempt <= retries) { await sleep(500 * 2 ** attempt); continue; }
        log.record({ id, ts: started.toISOString(), label, url, status: res.status, ms, ok: false, error: lastErr.message });
        throw lastErr;
      }
      let json;
      try { json = JSON.parse(text); } catch (e) {
        lastErr = new Error(`Malformed JSON from ${url}: ${e.message}`);
        log.record({ id, ts: started.toISOString(), label, url, status: res.status, ms, ok: false, error: lastErr.message });
        throw lastErr;
      }
      const file = path.join(log.runDir, `${id}.json`);
      fs.writeFileSync(file, JSON.stringify({ id, ts: started.toISOString(), url, label, body: json }));
      log.record({ id, ts: started.toISOString(), label, url, status: res.status, ms, bytes: text.length, ok: true, cacheFile: path.relative(log.dataDir, file) });
      return { id, json, ts: started.toISOString(), url };
    } catch (e) {
      lastErr = e;
      const transient = /fetch failed|ECONNRESET|ETIMEDOUT|EAI_AGAIN|socket hang up/i.test(String(e.message || e)) && !/HTTP \d{3}/.test(String(e.message));
      if (transient && attempt <= retries) { await sleep(500 * 2 ** attempt); continue; }
      if (!/HTTP \d{3}|Malformed JSON/.test(String(e.message))) {
        log.record({ id, ts: started.toISOString(), label, url, ok: false, error: String(e.cause && e.cause.message ? `${e.message}: ${e.cause.message}` : e.message) });
      }
      throw e;
    }
  }
  throw lastErr;
}

function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }

module.exports = { CallLog, fetchJson, sleep };
