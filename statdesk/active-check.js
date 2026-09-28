// Is every player in the brief actually still playing?
//
// WHY THIS EXISTS: on 2026-09-25 the brief led an item with Rafael Devers at a
// 1.360 OPS "over the last month" — the highest in baseball, correctly computed
// across the complete pull, and completely wrong to publish. He had not taken a
// plate appearance in fourteen days. The 30-day window was carrying a hot
// stretch that ended before it closed, and Nick caught it, which is exactly the
// homework this pipeline exists to abolish.
//
// A trailing-window stat is silently a HISTORICAL stat for an injured player.
// Verifying the number is true is not enough; the player has to still be on the
// field. Run every name in a brief through this before it goes out.
//
//   node statdesk/active-check.js 2026-09-25 "Nolan Arenado" "Elly De La Cruz"
//
// Exit code is 1 if any name looks inactive, so it can gate a build.
"use strict";
const fs = require("fs");
const path = require("path");

// Thresholds are ROLE-AWARE, because one number cannot fit both. A first pass
// used a flat 3 games and flagged Gavin Williams, who had thrown 7 shutout
// innings with 9 strikeouts four days earlier: a starter on normal rest makes
// one or two appearances in ten days, and treating that as inactive would have
// pulled a healthy pitcher out of the brief. Everyday players and relievers
// genuinely should appear most days.
const MIN_GAMES_EVERYDAY = 3; // hitters and relievers
const MIN_GAMES_STARTER = 1;  // a rotation turn every ~5 days

function norm(s) {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
}

function splitsFrom(file) {
  const body = JSON.parse(fs.readFileSync(file, "utf8")).body || {};
  const out = [];
  for (const block of body.stats || []) out.push(...(block.splits || []));
  return out;
}

function main() {
  const [date, ...names] = process.argv.slice(2);
  if (!date || !names.length) {
    console.error('Usage: node statdesk/active-check.js <YYYY-MM-DD> "Player Name" ...');
    process.exit(2);
  }
  const dir = path.join(__dirname, "data", "mlb", date);
  // C019/C020 are the trailing ten-day hitting/pitching windows.
  // C001/C002 are the full-season pulls, used only to work out each player's
  // role so the right threshold is applied.
  const windows = ["C019", "C020"].map((c) => path.join(dir, `${date}-${c}.json`));
  const season = ["C001", "C002"].map((c) => path.join(dir, `${date}-${c}.json`));
  const missing = [...windows, ...season].filter((f) => !fs.existsSync(f));
  if (missing.length) {
    console.error(`Missing trailing-window pull(s): ${missing.join(", ")}`);
    console.error("Cannot confirm anyone is active. Not reporting a pass on data that is not there.");
    process.exit(2);
  }

  // Names are NOT unique. There are two Max Muncys in the league right now
  // (Dodgers, 29 HR; Athletics, 9 HR), and a day-over-day diff keyed on name
  // alone reported one of them gaining twenty home runs overnight. Nothing was
  // wrong with the data — the comparison was.
  //
  // Taking the max across same-named players would be the dangerous choice
  // HERE: asked about an injured player, this check would find his healthy
  // namesake and wave him through. That is a false pass in the one guard whose
  // whole job is to catch a player who has stopped appearing. So collect every
  // match and report an ambiguity rather than guessing.
  const recent = new Map();
  for (const f of windows) {
    for (const s of splitsFrom(f)) {
      const key = norm(s.player.fullName);
      const g = s.stat.gamesPlayed ?? s.stat.gamesPitched ?? 0;
      if (!recent.has(key)) recent.set(key, []);
      recent.get(key).push({ id: s.player.id, games: g, team: (s.team || {}).name || "?" });
    }
  }

  // A pitcher who mostly starts gets the rotation threshold. Everyone else,
  // including relievers, is expected to be available most days.
  const starters = new Set();
  for (const f of season) {
    for (const s of splitsFrom(f)) {
      const gs = s.stat.gamesStarted || 0;
      const gp = s.stat.gamesPitched || 0;
      if (gp > 0 && gs >= gp / 2) starters.add(norm(s.player.fullName));
      // NOTE: with a shared name this set is approximate, which is safe only
      // because an ambiguous name is rejected above before the role is used.
    }
  }

  let bad = 0;
  for (const name of names) {
    const key = norm(name);
    const hits = recent.get(key);
    // Two players share this name. Which one is meant cannot be guessed, and
    // guessing wrong is exactly the failure this check exists to prevent.
    if (hits && hits.length > 1) {
      const who = hits.map((h) => `${h.team} id=${h.id}, ${h.games}G`).join(" | ");
      console.log(`  AMBIGUOUS ${name} — ${hits.length} players share this name: ${who}`);
      console.log(`            Resolve by player id before publishing anything about him.`);
      bad++;
      continue;
    }
    const g = hits ? hits[0].games : undefined;
    const isStarter = starters.has(key);
    const floor = isStarter ? MIN_GAMES_STARTER : MIN_GAMES_EVERYDAY;
    const role = isStarter ? "starter" : "everyday";
    if (g === undefined) {
      console.log(`  INACTIVE  ${name} — no appearance at all in the last 10 days`);
      bad++;
    } else if (g < floor) {
      console.log(`  THIN      ${name} — only ${g} game(s) in the last 10 days (${role}, expected ${floor}+)`);
      bad++;
    } else {
      console.log(`  ok        ${name} — ${g} games in the last 10 days (${role})`);
    }
  }
  if (bad) {
    console.log(`\n${bad} name(s) failed. Do NOT publish a "right now" claim about them; a`);
    console.log(`trailing-window number for an inactive player describes the past, not today.`);
    process.exit(1);
  }
  console.log(`\nAll ${names.length} active.`);
}

main();
