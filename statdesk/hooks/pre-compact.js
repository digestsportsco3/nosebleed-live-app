#!/usr/bin/env node
// PreCompact hook: before the conversation is compacted, commit and push any
// Stat Desk work so nothing lives only in this session, and stamp HANDOFF.md
// with the time of the compaction. The SessionStart hook re-injects the
// handoff right after compaction (SessionStart fires with source "compact").
"use strict";
const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const root = path.join(__dirname, "..", "..");
const git = (...a) => spawnSync("git", a, { cwd: root, encoding: "utf8" });
const msgs = [];

try {
  const hp = path.join(root, "statdesk", "HANDOFF.md");
  let h = fs.readFileSync(hp, "utf8");
  const stamp = `Auto-saved before context compaction: ${new Date().toISOString()}`;
  h = /^Auto-saved before context compaction: .*$/m.test(h) ? h.replace(/^Auto-saved before context compaction: .*$/m, stamp)
    : h.replace("## Current state (update this block)\n", `## Current state (update this block)\n\n${stamp}\n`);
  fs.writeFileSync(hp, h);
} catch (e) { msgs.push(`could not stamp HANDOFF.md: ${e.message}`); }

git("add", "-A", "statdesk", ".claude", ".github", "CLAUDE.md");
if (git("diff", "--cached", "--quiet").status !== 0) {
  git("commit", "-m", "Stat Desk: auto-save before context compaction");
}
const branch = (git("branch", "--show-current").stdout || "").trim() || "main";
const target = "main";
let pushed = false;
for (let i = 0; i < 3 && !pushed; i += 1) {
  if (git("pull", "--rebase", "--autostash", "origin", target).status === 0 && git("push", "origin", `HEAD:${target}`).status === 0) pushed = true;
}
const head = (git("rev-parse", "--short", "HEAD").stdout || "").trim();
msgs.push(pushed ? `Stat Desk auto-saved and pushed ${head} to main before compaction.` : `Stat Desk auto-save: push FAILED (commit ${head} is local). Push it first thing after compaction.`);
process.stdout.write(JSON.stringify({ systemMessage: msgs.join(" ") }) + "\n");
