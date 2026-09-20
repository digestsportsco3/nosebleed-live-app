#!/usr/bin/env node
// Stat Desk orchestrator: PULL → DETECT → DRAFT → RANK → write brief → STOP.
// Usage: node statdesk/run.js [--sport mlb] [--date YYYY-MM-DD] [--season 2026]
//                             [--stathead] run discovery queries headlessly too
//                             [--stathead-only] discovery only, skip the API pull
//                             [--stathead-list] print the queries for a human
//                             [--stathead-http] force the HTTP client instead of the browser
"use strict";
const path = require("path");
const { CallLog } = require("./lib/http");
const { scanAnomalies, scanMilestones, scanHeat, rank } = require("./lib/scanner");
const { writeBrief, writeFailureBrief } = require("./lib/brief");
const { Stathead } = require("./lib/stathead");
const { StatheadBrowser } = require("./lib/stathead-browser");
const { seasonFinder, DISCOVERY } = require("./lib/finder");
const fs = require("fs");

// Players already posted. Dropped from every brief so the same name is never
// pitched twice. Edit statdesk/posted.json, or pass --include-posted to ignore it.
function postedNames() {
  const file = path.join(__dirname, "posted.json");
  if (!fs.existsSync(file)) return new Set();
  let raw;
  try { raw = JSON.parse(fs.readFileSync(file, "utf8")); }
  catch (e) { throw new Error(`statdesk/posted.json is not valid JSON: ${e.message}. Fix it rather than letting a posted player through.`); }
  return new Set((raw.posted || []).map((x) => norm(x.name)));
}
function norm(s) {
  return String(s || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}

const args = Object.fromEntries(process.argv.slice(2).map((a, i, arr) => (a.startsWith("--") ? [a.slice(2), arr[i + 1]] : null)).filter(Boolean));
const sportKey = (args.sport || "mlb").toLowerCase();
const nowET = new Date(new Date().toLocaleString("en-US", { timeZone: "America/New_York" }));
const runDate = args.date || `${nowET.getFullYear()}-${String(nowET.getMonth() + 1).padStart(2, "0")}-${String(nowET.getDate()).padStart(2, "0")}`;
const season = Number(args.season || runDate.slice(0, 4));
const root = __dirname;
const dataDir = path.join(root, "data", sportKey);
const briefsDir = path.join(root, "briefs");

(async () => {
  const adapter = require(`./sports/${sportKey}/adapter`);
  if ("stathead-list" in args) {
    const list = (adapter.rules.discovery || (() => []))(season);
    console.log(`Stathead discovery queries for ${season} (${list.length}). Run each in Nick's signed-in browser; save provenance per STATDESK.md.\n`);
    list.forEach((q, i) => console.log(`${String(i + 1).padStart(2)}. [${q.key}] ${q.query}`));
    return;
  }
  // --stathead: run the discovery queries headlessly with Nick's subscription
  // and save provenance, no browser needed. Runs on its own or after the pull.
  if ("stathead" in args || "stathead-only" in args) {
    // Prefer the real browser with a saved login: it is the only path Sports
    // Reference does not block, and it needs no password in this process.
    // Fall back to the HTTP client only when explicitly asked.
    const dataDir = path.join(root, "data", "browser");
    const useHttp = "stathead-http" in args;
    const sh = useHttp ? new Stathead({ dataDir, runDate })
                       : new StatheadBrowser({ dataDir, runDate });
    console.log(`[stathead] client: ${useHttp ? "http (blocked from datacenter IPs)" : "browser profile"}`);
    const rules = DISCOVERY(season);
    const results = [];
    let failed = 0;
    for (const r of rules) {
      const url = seasonFinder(r.spec);
      try {
        const rec = await sh.query(url, { label: r.label, note: `discovery rule ${r.key}` });
        results.push({ key: r.key, rows: rec.rowCount, capped: rec.capped, id: rec.id });
        console.log(`[stathead] ${rec.id} ${r.key}: ${rec.rowCount} rows${rec.capped ? " (CAPPED)" : ""}`);
      } catch (e) {
        failed += 1;
        results.push({ key: r.key, error: String(e.message || e) });
        console.error(`[stathead] ${r.key} FAILED: ${e.message}`);
        if (/login failed|not set|Cloudflare/i.test(String(e.message))) {
          console.error("[stathead] stopping: this failure affects every remaining query.");
          break;
        }
      }
    }
    if (sh.close) await sh.close();
    console.log(`[stathead] ${results.length - failed} of ${rules.length} queries ok; provenance in statdesk/data/browser/${runDate}/`);
    if (failed) process.exitCode = 3;
    if ("stathead-only" in args) return;
  }

  const log = new CallLog(dataDir, runDate);
  const summary = [];
  console.log(`[statdesk] ${adapter.sport} run for ${runDate} (season ${season}) started ${new Date().toISOString()}`);
  let data;
  try {
    data = await adapter.pull({ log, runDate, season, summary });
  } catch (e) {
    const msg = e && e.cause && e.cause.message ? `${e.message} (${e.cause.message})` : String(e.message || e);
    const file = writeFailureBrief({ briefsDir, runDate, sport: adapter.sport, error: msg, calls: log.calls });
    console.error(`[statdesk] STOP — pull failed: ${msg}`);
    console.error(`[statdesk] failure brief written: ${file}`);
    process.exit(2);
  }

  const { anomalies, milestones, heat } = adapter.rules;
  let findings = [...scanAnomalies(data.players, anomalies), ...scanMilestones(data.players, milestones), ...scanHeat(data.players, heat)];
  if (!("include-posted" in args)) {
    const skip = postedNames();
    const before = findings.length;
    findings = findings.filter((x) => !skip.has(norm(x.player && x.player.name)));
    const dropped = before - findings.length;
    if (dropped) summary.push(`Dropped ${dropped} finding(s) for ${skip.size} already-posted player(s) (statdesk/posted.json).`);
    console.log(`[statdesk] posted-filter: ${skip.size} names on the list, ${dropped} finding(s) dropped`);
  }
  const { picked } = rank(findings, 10);

  // Exact game-log windows for heat finalists only (small call count).
  if (adapter.gameLogLines) {
    for (const f of picked.filter((x) => x.kind === "heat")) {
      try {
        const lastN = f.player.group === "pitching" ? [5, 10] : [10, 15, 30];
        const exact = await adapter.gameLogLines({ log, season, player: f.player, lastN });
        const key = f.player.group === "pitching" ? "last5g" : "last15g";
        const w = exact[key];
        if (w) {
          f.numbers += f.player.group === "pitching"
            ? ` | EXACT ${w.label}: ${w.ERA} ERA, ${w.SO} K in ${Math.floor(w.IP)}.${Math.round((w.IP % 1) * 3)} IP (${w.derived}; source ${w.source})`
            : ` | EXACT ${w.label}: ${w.AVG}/${w.OBP}/${w.SLG}, ${w.HR} HR, ${w.RBI} RBI (${w.derived}; source ${w.source})`;
        }
        f.sources = [...new Set(f.player.sources)];
      } catch (e) { summary.push(`Game log pull failed for ${f.player.name}: ${e.message} — exact window omitted, calendar window kept.`); }
    }
  }

  const file = writeBrief({ briefsDir, runDate, sport: adapter.sport, season, picked, allCount: findings.length, calls: log.calls, pullSummary: summary, inProgress: true });
  console.log(`[statdesk] ${findings.length} findings; ${picked.length} picked; ${log.calls.length} API calls logged to ${path.join(dataDir, "calls.log")}`);
  console.log(`[statdesk] brief: ${file}`);
})().catch((e) => { console.error("[statdesk] fatal:", e); process.exit(1); });
