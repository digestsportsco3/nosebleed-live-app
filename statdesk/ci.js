#!/usr/bin/env node
// The whole CI job in Node, so it behaves the same on a Windows self-hosted
// runner and an Ubuntu cloud runner.
//
// WHY: the workflow used to be bash. On Windows the default shell is
// PowerShell, and pinning `shell: bash` failed too because Git Bash is not on
// the runner's PATH. Node is present on every runner by definition, so the
// job is written here instead and the workflow is one line.
//
// Reads: RUN_DATE, WANT_STATHEAD, STATHEAD_PROFILE, GITHUB_REF_NAME,
//        GITHUB_STEP_SUMMARY
"use strict";
const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const repo = path.join(__dirname, "..");
const runDate = process.env.RUN_DATE || easternToday();
const wantStathead = String(process.env.WANT_STATHEAD || "true") !== "false";
const branch = process.env.GITHUB_REF_NAME || "main";
const summaryFile = process.env.GITHUB_STEP_SUMMARY;

function easternToday() {
  const d = new Date().toLocaleDateString("en-CA", { timeZone: "America/New_York" });
  return d; // en-CA gives YYYY-MM-DD
}
function sh(cmd, args, opts = {}) {
  const r = spawnSync(cmd, args, { cwd: repo, encoding: "utf8", shell: false, ...opts });
  return { code: r.status, out: (r.stdout || "") + (r.stderr || "") };
}
function git(...args) { return sh("git", args); }

// ---- 1. run the pipeline -------------------------------------------------
const args = ["statdesk/run.js", "--date", runDate];
if (wantStathead) args.push("--stathead");
console.log(`[ci] node ${args.join(" ")}`);
const run = spawnSync(process.execPath, args, { cwd: repo, encoding: "utf8" });
const log = (run.stdout || "") + (run.stderr || "");
process.stdout.write(log);
const runCode = run.status;
console.log(`[ci] pipeline exited ${runCode}`);

// ---- 2. commit and push whatever it produced -----------------------------
// Even a STOPPED brief gets committed: the record of a failed run matters.
git("config", "user.name", "statdesk-bot");
git("config", "user.email", "noreply@anthropic.com");
git("add", "-A");
const staged = git("diff", "--cached", "--quiet");
let pushed = null;
if (staged.code === 0) {
  console.log("[ci] nothing to commit");
} else {
  const c = git("commit", "-m", `Stat Desk ${runDate}: automated run`);
  console.log(c.out.trim());
  for (let i = 1; i <= 3; i += 1) {
    const pull = git("pull", "--rebase", "origin", branch);
    if (pull.code !== 0) { console.log(`[ci] pull attempt ${i} failed:\n${pull.out}`); sleep(i * 5); continue; }
    const push = git("push", "origin", `HEAD:${branch}`);
    if (push.code === 0) { pushed = git("rev-parse", "--short", "HEAD").out.trim(); break; }
    console.log(`[ci] push attempt ${i} failed:\n${push.out}`);
    sleep(i * 5);
  }
  if (!pushed) { console.error("[ci] could not push after 3 attempts"); process.exitCode = 1; }
  else console.log(`[ci] pushed ${pushed}`);
}

// ---- 3. step summary -----------------------------------------------------
const parts = [`## Stat Desk — ${runDate}`, ""];
if (pushed) parts.push(`Committed as \`${pushed}\` on \`${branch}\`.`, "");
for (const name of [`${runDate}-statdesk.md`, `${runDate}-fresh10.md`]) {
  const f = path.join(repo, "statdesk", "briefs", name);
  if (fs.existsSync(f)) parts.push(fs.readFileSync(f, "utf8"), "");
}
const prov = path.join(repo, "statdesk", "data", "browser", runDate);
if (fs.existsSync(prov)) {
  const n = fs.readdirSync(prov).filter((x) => x.endsWith(".md")).length;
  parts.push(`Stathead provenance records saved: ${n}`, "");
}
if (runCode !== 0) {
  parts.push(`### The run exited ${runCode}`, "", "```", log.split("\n").slice(-40).join("\n"), "```", "");
}
if (summaryFile) { try { fs.appendFileSync(summaryFile, parts.join("\n")); } catch (e) { /* summary is best effort */ } }

function sleep(sec) { spawnSync(process.execPath, ["-e", `setTimeout(()=>{},${sec * 1000})`]); }

// The job fails only if the push failed. A pipeline that stopped honestly
// still committed its STOPPED brief, and that is a successful job.
