#!/usr/bin/env node
// SessionStart hook: prints the Stat Desk standing rules, the HANDOFF "Current
// state" block, the latest dated handoff entries and recent commits, so a new
// session (or one resumed after compaction) starts with the full context.
// Whatever this prints on stdout is added to Claude's context.
"use strict";
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const root = path.join(__dirname, "..", "..");
const read = (p) => { try { return fs.readFileSync(path.join(root, p), "utf8"); } catch (e) { return ""; } };
const out = [];

out.push(read("statdesk/SESSION-START.md").trim());

const h = read("statdesk/HANDOFF.md");
if (h) {
  const cs = h.indexOf("## Current state");
  if (cs >= 0) {
    const rest = h.slice(cs);
    const end = rest.indexOf("\n### ", 1);
    out.push("## HANDOFF: current state\n" + rest.slice(rest.indexOf("\n") + 1, end > 0 ? end : 1500).trim());
  }
  // The newest dated entries ("### Oct 18: ...") — newest are written first.
  const entries = h.split(/\n(?=### (?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) \d)/).slice(1, 5);
  if (entries.length) out.push("## HANDOFF: latest entries\n" + entries.map((e) => e.trim().slice(0, 1600)).join("\n\n"));
}

try {
  const log = execSync("git log --oneline -8", { cwd: root, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
  const branch = execSync("git branch --show-current", { cwd: root, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
  out.push(`## Git\nBranch: ${branch} (Stat Desk work goes to main)\n${log}`);
} catch (e) { /* not a git checkout */ }

out.push("Full history: statdesk/HANDOFF.md. Delivered items: statdesk/posted.json. Read STATDESK.md for pipeline details when needed.");
process.stdout.write(out.join("\n\n") + "\n");
