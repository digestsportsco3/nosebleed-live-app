#!/usr/bin/env node
// Mines the matchup pull (statdesk/matchups.js) for non-box-score angles and
// prints candidates, strongest first. Nothing is invented: every number is a
// field in a saved API response, and each candidate names its file.
//
//   node statdesk/angles.js [YYYY-MM-DD]
"use strict";
const fs = require("fs");
const path = require("path");
const date = process.argv[2] || new Date().toLocaleDateString("en-CA", { timeZone: "America/New_York" });
const DIR = path.join(__dirname, "data", "mlb", "matchups", date);
const splits = (x) => ((x && x.body && x.body.stats) || []).flatMap((s) => s.splits || []);
const first = (x) => (splits(x)[0] || {}).stat || null;
const n = (v) => (v == null || v === "" ? null : Number(v));
const out = [];
const add = (score, text, file) => out.push({ score, text, file });

const files = fs.readdirSync(DIR);
// --- starters
for (const f of files.filter((x) => /^p-\d+\.json$/.test(x))) {
  const r = JSON.parse(fs.readFileSync(path.join(DIR, f), "utf8")); const P = r.pitcher.fullName; const opp = r.opponent.name; const when = r.when === "yesterday" ? "(pitched yesterday)" : "(starts today)";
  const vt = first(r.vsTeamTotal); const car = first(r.career); const po = first(r.careerPlayoffs);
  if (vt && n(vt.inningsPitched) > 0) {
    const era = n(vt.era), cera = car ? n(car.era) : null;
    add(Math.abs((cera ?? era) - era) * 2 + Math.min(3, n(vt.inningsPitched) / 10),
      `${P} ${when} career vs ${opp}: ${vt.gamesPlayed} G, ${vt.inningsPitched} IP, ${vt.wins}-${vt.losses}, ${vt.era} ERA, ${vt.strikeOuts} K, ${vt.baseOnBalls} BB, ${vt.homeRuns} HR, opp AVG ${vt.avg} (career ERA ${car ? car.era : "?"})`, f);
    const byYear = splits(r.vsTeam).map((s) => `${s.season}: ${s.stat.inningsPitched} IP ${s.stat.era} ERA ${s.stat.strikeOuts} K`);
    if (byYear.length) add(1, `   ${P} vs ${opp} by season — ${byYear.join(" | ")}`, f);
  } else add(2, `${P} ${when} has never faced ${opp} (no career line)`, f);
  if (po && n(po.inningsPitched) > 0) add(2 + Math.min(3, n(po.inningsPitched) / 10), `${P} postseason career: ${po.gamesPlayed} G, ${po.inningsPitched} IP, ${po.wins}-${po.losses}, ${po.era} ERA, ${po.strikeOuts} K`, f);
  else add(3, `${P} ${when}: no postseason innings before this October`, f);
}
// --- hitters vs today's starters
for (const f of files.filter((x) => /^h-\d+-vs-\d+\.json$/.test(x))) {
  const r = JSON.parse(fs.readFileSync(path.join(DIR, f), "utf8")); const s = first(r.vsPlayerTotal); if (!s) continue;
  const pa = n(s.plateAppearances), ab = n(s.atBats), h = n(s.hits), hr = n(s.homeRuns), so = n(s.strikeOuts), ops = n(s.ops);
  if (pa >= 8) {
    const score = (ops != null ? Math.abs(ops - 0.72) * 6 : 0) + (hr >= 2 ? hr : 0) + (h === 0 && ab >= 8 ? 4 : 0) + Math.min(2, pa / 15);
    add(score, `${r.hitter.fullName} (${r.team.name}) career vs ${r.pitcher.fullName}: ${h}-for-${ab}, ${hr} HR, ${s.rbi} RBI, ${s.baseOnBalls} BB, ${so} K, ${s.avg}/${s.obp}/${s.slg} in ${pa} PA`, f);
  }
}
// --- hitters: postseason careers and career vs the opponent
for (const f of files.filter((x) => /^h-\d+\.json$/.test(x))) {
  const r = JSON.parse(fs.readFileSync(path.join(DIR, f), "utf8")); const po = first(r.careerPlayoffs); const vt = first(r.vsTeamTotal);
  if (po && n(po.plateAppearances) >= 25) {
    const hr = n(po.homeRuns);
    add((hr === 0 ? 5 : 0) + Math.abs(n(po.ops) - 0.72) * 4 + Math.min(2, n(po.plateAppearances) / 40),
      `${r.hitter.fullName} (${r.team.name}) postseason career: ${po.gamesPlayed} G, ${po.plateAppearances} PA, ${po.avg}/${po.obp}/${po.slg}, ${hr} HR, ${po.rbi} RBI, ${po.strikeOuts} K`, f);
  }
  if (vt && n(vt.plateAppearances) >= 60) add(Math.abs(n(vt.ops) - 0.72) * 5 + Math.min(3, n(vt.homeRuns) / 4),
    `${r.hitter.fullName} (${r.team.name}) career vs ${r.facing.name}: ${vt.gamesPlayed} G, ${vt.avg}/${vt.obp}/${vt.slg}, ${vt.homeRuns} HR, ${vt.rbi} RBI in ${vt.plateAppearances} PA`, f);
}
out.sort((a, b) => b.score - a.score);
for (const o of out.slice(0, Number(process.argv[3]) || 80)) console.log(`${o.score.toFixed(1).padStart(5)}  ${o.text}   [${o.file}]`);
