// Writes the daily ranked brief. Also lints generated text so a superlative can
// never appear as a statement — only inside a question for Nick to verify.
"use strict";
const fs = require("fs");
const path = require("path");

const SUPERLATIVES = /\b(first|only|most|fewest|never|no one else|nobody else|second|third|all[- ]time|record|ever)\b/i;

function lintStatement(text, where) {
  // Allow superlatives only in lines that are explicitly questions or Stathead instructions.
  const lines = String(text).split("\n");
  for (const line of lines) {
    if (!SUPERLATIVES.test(line)) continue;
    const isQuestion = /\?\s*$/.test(line.trim()) || /^(Q|QUESTION|Stathead|VERIFY)\b/i.test(line.trim()) || /\bif the list\b/i.test(line);
    if (!isQuestion) throw new Error(`Superlative used as a statement in ${where}: "${line.trim()}"`);
  }
}

function writeBrief({ briefsDir, runDate, sport, season, picked, allCount, calls, pullSummary, inProgress }) {
  fs.mkdirSync(briefsDir, { recursive: true });
  const file = path.join(briefsDir, `${runDate}-statdesk.md`);
  const L = [];
  L.push(`# Stat Desk — ${sport} — ${runDate}`);
  L.push("");
  L.push(`Run at ${new Date().toISOString()}. ${inProgress ? `${season} season in progress; every ${season} line below is not final.` : ""}`);
  L.push(`${allCount} raw findings scanned; top ${picked.length} below. Numbers are printed exactly as the source returned them.`);
  L.push(`Nothing here is verified yet. Every superlative is a question. Nick verifies in Stathead before anything is written as fact.`);
  L.push("");
  picked.forEach((f, i) => {
    const p = f.player;
    const srcIds = (f.sources || []).join(", ");
    const idea = [];
    idea.push(`## ${i + 1}. ${p.name} (${p.teamAbbr || p.team}) — ${f.title}`);
    idea.push(`- NUMBERS: ${f.numbers}`);
    idea.push(`- WHY: ${f.why}`);
    if (f.stathead) idea.push(`- STATHEAD: ${f.stathead}`);
    idea.push(`- KICKER (DRAFT — depends on verification): ${f.kicker}`);
    idea.push(`- SOURCE CALLS: ${srcIds}`);
    const text = idea.join("\n");
    lintStatement(text, `idea ${i + 1} (${p.name})`);
    L.push(text);
    L.push("");
  });
  L.push(`## Source calls (this run)`);
  L.push("");
  L.push(`| Call | Time (UTC) | URL | Status |`);
  L.push(`|---|---|---|---|`);
  for (const c of calls) L.push(`| ${c.id} | ${c.ts} | ${c.url} | ${c.ok ? "ok" : "FAILED: " + c.error} |`);
  L.push("");
  L.push(`## Pull summary`);
  L.push("");
  for (const s of pullSummary) L.push(`- ${s}`);
  fs.writeFileSync(file, L.join("\n") + "\n");
  return file;
}

function writeFailureBrief({ briefsDir, runDate, sport, error, calls }) {
  fs.mkdirSync(briefsDir, { recursive: true });
  const file = path.join(briefsDir, `${runDate}-statdesk.md`);
  const L = [];
  L.push(`# Stat Desk — ${sport} — ${runDate} — STOPPED: PULL FAILED`);
  L.push("");
  L.push(`No ideas today. The data pull did not complete, so there are no numbers to rank. Nothing was estimated or filled in.`);
  L.push("");
  L.push(`Error: ${error}`);
  L.push("");
  L.push(`## Calls attempted`);
  L.push("");
  L.push(`| Call | Time (UTC) | URL | Result |`);
  L.push(`|---|---|---|---|`);
  for (const c of calls) L.push(`| ${c.id} | ${c.ts} | ${c.url} | ${c.ok ? "ok" : "FAILED: " + c.error} |`);
  fs.writeFileSync(file, L.join("\n") + "\n");
  return file;
}

module.exports = { writeBrief, writeFailureBrief, lintStatement };
