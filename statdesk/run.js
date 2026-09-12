#!/usr/bin/env node
// Stat Desk orchestrator: PULL → DETECT → DRAFT → RANK → write brief → STOP.
// Usage: node statdesk/run.js [--sport mlb] [--date YYYY-MM-DD] [--season 2026]
"use strict";
const path = require("path");
const { CallLog } = require("./lib/http");
const { scanAnomalies, scanMilestones, scanHeat, rank } = require("./lib/scanner");
const { writeBrief, writeFailureBrief } = require("./lib/brief");

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
  const findings = [...scanAnomalies(data.players, anomalies), ...scanMilestones(data.players, milestones), ...scanHeat(data.players, heat)];
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
