// Sport-agnostic scanner. It knows nothing about baseball. A sport adapter hands
// it normalized player lines plus a rule set; it returns findings.
//
// Normalized player line:
//   { id, name, team, teamAbbr, age, pos, group, season:{...numbers}, career:{...numbers},
//     teamContext:{wins,losses,gamesPlayed,winPct,gamesRemaining}, windows:{label:{...numbers, start,end,games}} }
//
// Rule set (per sport):
//   anomalies: [{ key, title, weight, group, qualify(p), test(p), describe(p), stathead(p), kicker(p) }]
//   milestones: [{ stat, label, group, step, minValue, within }]
//   heat: [{ key, group, window, qualify(p, w), test(p, w), describe(p, w), weight }]
"use strict";

function scanAnomalies(players, rules) {
  const out = [];
  for (const rule of rules) {
    for (const p of players) {
      if (rule.group && p.group !== rule.group) continue;
      try {
        if (!rule.qualify(p)) continue;
        if (!rule.test(p)) continue;
        out.push({ kind: "anomaly", ruleKey: rule.key, title: rule.title, weight: rule.weight, player: p,
          numbers: rule.describe(p), why: rule.why(p), stathead: rule.stathead(p), kicker: rule.kicker(p), sources: p.sources });
      } catch (e) { /* a rule that throws on one line must not kill the scan */ }
    }
  }
  return out;
}

function scanMilestones(players, milestones) {
  const out = [];
  for (const m of milestones) {
    for (const p of players) {
      if (m.group && p.group !== m.group) continue;
      const cur = p.career && p.career[m.stat];
      if (typeof cur !== "number" || !isFinite(cur)) continue;
      if (cur < m.minValue) continue;
      const next = Math.ceil((cur + 1e-9) / m.step) * m.step;
      const need = round1(next - cur);
      if (need <= 0 || need > m.within) continue;
      const gr = p.teamContext ? p.teamContext.gamesRemaining : null;
      out.push({ kind: "milestone", ruleKey: `milestone_${m.stat}`, title: `${m.label} milestone watch`, weight: m.weight(next, need),
        player: p, next, need, current: cur, gamesRemaining: gr, seasonPace: p.season ? p.season[m.stat] : null,
        numbers: `${p.name}: ${cur} career ${m.label}; needs ${need} for ${next}; team has ${gr == null ? "?" : gr} games left`,
        why: `Round number in reach before season's end.`, stathead: null, kicker: `DRAFT: ${p.name} is ${need} ${m.label} from ${next}.`, sources: p.sources });
    }
  }
  return out;
}

function scanHeat(players, heatRules) {
  const out = [];
  for (const h of heatRules) {
    for (const p of players) {
      if (h.group && p.group !== h.group) continue;
      const w = p.windows && p.windows[h.window];
      if (!w) continue;
      try {
        if (!h.qualify(p, w)) continue;
        if (!h.test(p, w)) continue;
        out.push({ kind: "heat", ruleKey: h.key, title: h.title, weight: h.weight, player: p, window: w,
          numbers: h.describe(p, w), why: h.why(p, w), stathead: h.stathead ? h.stathead(p, w) : null, kicker: h.kicker(p, w), sources: p.sources });
      } catch (e) { /* ignore */ }
    }
  }
  return out;
}

function round1(x) { return Math.round(x * 10) / 10; }

// Rank: anomalies with a historical hook first, milestones next, generic heat last.
function rank(findings, topN = 10) {
  const kindBase = { anomaly: 100, milestone: 50, heat: 10 };
  const scored = findings.map((f) => ({ ...f, score: kindBase[f.kind] + (f.weight || 0) }));
  scored.sort((a, b) => b.score - a.score);
  // one idea per player per kind, and no more than 2 ideas per player overall
  const seen = new Map();
  const picked = [];
  for (const f of scored) {
    const k = `${f.player.id}`;
    const c = seen.get(k) || 0;
    if (c >= 2) continue;
    if (picked.some((x) => x.player.id === f.player.id && x.kind === f.kind)) continue;
    seen.set(k, c + 1);
    picked.push(f);
    if (picked.length >= topN) break;
  }
  return { picked, all: scored };
}

module.exports = { scanAnomalies, scanMilestones, scanHeat, rank };
