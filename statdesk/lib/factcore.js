// Sport-agnostic fact machinery, lifted from the MLB decade engine.
//
// A sport supplies rows (one per player-season, keyed by a stable player id,
// with `season` a start year) and rule specs; this turns them into post-ready
// lines with the same guarantees as the baseball pages:
//   - "only / two / few" count PLAYERS, not player-seasons
//   - every line stores the rows that prove it
//   - selection keeps the page varied, then fills to the target
// Nothing here knows what a rebound or a touchdown is.
"use strict";

const PAST = { hit: "hit", bat: "batted", steal: "stole", drive: "drove", collect: "collected", post: "posted", draw: "drew",
  play: "played", go: "went", get: "got", strike: "struck", throw: "threw", win: "won", lose: "lost", complete: "completed",
  save: "saved", allow: "allowed", walk: "walked", ground: "grounded", score: "scored", finish: "finished", reach: "reached",
  average: "averaged", shoot: "shot", make: "made", grab: "grabbed", block: "blocked", record: "recorded", commit: "committed",
  rush: "rushed", catch: "caught", pass: "passed", run: "ran", lead: "led", attempt: "attempted", take: "took", start: "started",
  appear: "appeared", dish: "dished", turn: "turned", foul: "fouled", pull: "pulled",
  gain: "gained", force: "forced", defend: "defended", intercept: "intercepted", carry: "carried", return: "returned", fumble: "fumbled", kick: "kicked", tie: "tied", recover: "recovered", hold: "held", give: "gave", outscore: "outscored", produce: "produced", punt: "punted", allow2: "allowed" };
const VERB_RE = new RegExp(`\\b(${Object.keys(PAST).join("|")})\\b(?! (?:homers|runs|hits|games|bases|walks|innings|batters|saves|doubles|triples|pitches|steals|times|by|yards|passes|points|rebounds|assists|blocks|shots|attempts|threes|free))`, "g");
function verb(head) { return head.replace(VERB_RE, (v, _w, off, str) => (/(playoff|postseason|scoring|home|a|pass) $/.test(str.slice(Math.max(0, off - 11), off)) ? v : PAST[v] || v)); }

const yr = (r) => r.season;
const pid = (r) => ({ id: r.id, name: r.name });
function bonus(mag, r) { const m = mag(r); return Number.isFinite(m) ? Math.min(3, Math.abs(m) / 40) : 0; }

// label(season) turns a start year into how the sport names a season
// ("1986-87" for the NBA, "1986" for the NFL).
function ruleFacts(rows, rules, ctx) {
  const { decadeLabel, label = (s) => String(s), ev = (r) => r, who: defaultWho = "player", pron = "he" } = ctx;
  const out = [];
  for (const rule of rules) {
    const m = rows.filter((r) => { try { return rule.f(r); } catch (e) { return false; } });
    if (!m.length) continue;
    const sorted = [...m].sort((a, b) => rule.mag(b) - rule.mag(a));
    const byPlayer = new Map();
    for (const r of sorted) { if (!byPlayer.has(r.id)) byPlayer.set(r.id, []); byPlayer.get(r.id).push(r); }
    const players = [...byPlayer.values()];
    const floor = rule.floor ? ` (${rule.floor})` : "";
    const who = rule.who || defaultWho;
    const line = (rs) => rs.length === 1 ? `${rs[0].name} (${label(yr(rs[0]))}: ${rule.say(rs[0])})` : `${rs[0].name} (${rs.length}×, best ${label(yr(rs[0]))}: ${rule.say(rs[0])})`;
    const base = { rule: rule.key, group: rule.group || "P", decade: decadeLabel, finder: rule.finder || null,
      evidence: sorted.slice(0, players.length <= 4 ? 12 : 6).map(ev), seasonsMatched: m.length };
    if (players.length === 1) {
      const rs = players[0]; const r = rs[0];
      out.push({ ...base, kind: "only", score: 10 + bonus(rule.mag, r), players: [pid(r)], seasons: rs.map(yr),
        text: rs.length === 1
          ? `The only ${who} of the ${decadeLabel} to ${rule.head}${floor}: ${r.name}, ${label(yr(r))} — ${rule.say(r)}.`
          : `The only ${who} of the ${decadeLabel} to ${rule.head}${floor} was ${r.name} — and ${pron} did it ${rs.length === 2 ? "twice" : `${rs.length} times`} (${rs.slice(0, 3).map((x) => `${label(yr(x))}: ${rule.say(x)}`).join("; ")}${rs.length > 3 ? "; …" : ""}).` });
    } else if (players.length === 2) {
      out.push({ ...base, kind: "pair", score: 8 + bonus(rule.mag, sorted[0]), players: players.map((rs) => pid(rs[0])), seasons: sorted.map(yr),
        text: `Only two ${who}s of the ${decadeLabel} ${verb(rule.head)}${floor}: ${players.map(line).join("; ")}.` });
    } else if (players.length <= 4) {
      out.push({ ...base, kind: "few", score: 6 + bonus(rule.mag, sorted[0]), players: players.map((rs) => pid(rs[0])), seasons: sorted.map(yr),
        text: `Just ${["", "", "", "three", "four"][players.length]} ${who}s of the ${decadeLabel} ${verb(rule.head)}${floor}: ${players.map(line).join("; ")}.` });
    } else {
      const r = sorted[0];
      out.push({ ...base, kind: "list", score: 3 + bonus(rule.mag, r), players: [pid(r)], seasons: [yr(r)],
        text: `${players.length} ${who}s ${verb(rule.head)}${floor} in the ${decadeLabel}${m.length > players.length ? ` (${m.length} seasons)` : ""}. The most extreme: ${r.name}, ${label(yr(r))} — ${rule.say(r)}.` });
    }
  }
  return out;
}

function extremeFacts(rows, exs, ctx) {
  const { decadeLabel, label = (s) => String(s), ev = (r) => r } = ctx;
  const out = [];
  for (const x of exs) {
    const m = rows.filter((r) => { try { return x.base(r); } catch (e) { return false; } });
    if (m.length < 3) continue;
    const r = [...m].sort((a, b) => x.pick(b) - x.pick(a))[0];
    out.push({ kind: "extreme", rule: x.key, group: x.group || "P", decade: decadeLabel, score: 6, players: [pid(r)], seasons: [yr(r)],
      finder: null, evidence: [ev(r)], among: m.length, text: x.text(r, label(yr(r)), decadeLabel) });
  }
  return out;
}

function nearMissFacts(rows, specs, ctx) {
  const { decadeLabel, label = (s) => String(s), ev = (r) => r, who = "player", size = () => 0 } = ctx;
  const out = [];
  for (const nm of specs) {
    const m = rows.filter(nm.f);
    if (!m.length) continue;
    const sorted = [...m].sort((a, b) => size(b) - size(a));
    const named = sorted.slice(0, 3).map((r) => `${r.name} (${label(yr(r))})`).join(", ");
    const text = m.length === 1
      ? `Exactly one ${who} of the ${decadeLabel} finished a season with ${nm.what}, ${nm.one}: ${named}.`
      : `${m.length} ${who}-seasons of the ${decadeLabel} ended on ${nm.what}, ${nm.one} — among them ${named}.`;
    out.push({ kind: "nearmiss", rule: nm.key, group: nm.group || "P", decade: decadeLabel, score: 4 + Math.min(2, m.length / 4),
      players: sorted.slice(0, 3).map(pid), seasons: sorted.slice(0, 3).map(yr), finder: null, evidence: sorted.slice(0, 6).map(ev), text });
  }
  return out;
}

// Longest run of consecutive seasons over a bar, within the decade.
function streakFacts(rows, specs, ctx) {
  const { decadeLabel, label = (s) => String(s), ev = (r) => r, seasons } = ctx;
  const out = [];
  for (const s of specs) {
    const byPlayer = new Map();
    for (const r of rows) { if (!byPlayer.has(r.id)) byPlayer.set(r.id, []); byPlayer.get(r.id).push(r); }
    let best = null;
    for (const [, rs] of byPlayer) {
      const ok = new Set(rs.filter((r) => { try { return s.f(r); } catch (e) { return false; } }).map(yr));
      let run = 0, start = null, bRun = 0, bStart = null;
      for (const y of seasons) { if (ok.has(y)) { if (!run) start = y; run += 1; if (run > bRun) { bRun = run; bStart = start; } } else run = 0; }
      if (bRun >= (s.min || 4) && (!best || bRun > best.run)) best = { run: bRun, start: bStart, rows: rs.filter((r) => ok.has(yr(r)) && yr(r) >= bStart && yr(r) < bStart + bRun).sort((a, b) => yr(a) - yr(b)) };
    }
    if (!best) continue;
    const r = best.rows[0]; const endLabel = label(best.start + best.run - 1);
    out.push({ kind: "streak", rule: s.key, group: s.group || "P", decade: decadeLabel, score: 5 + Math.min(4, best.run - 3), players: [pid(r)],
      seasons: best.rows.map(yr), finder: null, evidence: best.rows.map(ev),
      text: `${r.name} ${s.what} in ${best.run} straight seasons (${label(best.start)} to ${endLabel}), the longest run of the ${decadeLabel}.` });
  }
  return out;
}

// Two or three players on one team clearing a bar in the same season.
function teammateFacts(rows, specs, ctx) {
  const { decadeLabel, label = (s) => String(s), ev = (r) => r, teamName = (r) => r.team, isTraded = () => false } = ctx;
  const out = [];
  for (const s of specs) {
    const groups = new Map();
    for (const r of rows) { if (isTraded(r) || !r.team) continue; let v; try { v = s.val(r); } catch (e) { continue; } if (v == null || v < s.bar) continue;
      const k = `${yr(r)}|${r.team}`; if (!groups.has(k)) groups.set(k, []); groups.get(k).push(r); }
    const hits = [...groups.values()].filter((g) => g.length >= s.need).map((g) => g.sort((a, b) => s.val(b) - s.val(a)));
    if (!hits.length) continue;
    hits.sort((a, b) => b.reduce((x, r) => x + s.val(r), 0) - a.reduce((x, r) => x + s.val(r), 0));
    const g = hits[0]; const r0 = g[0]; const names = g.slice(0, 3).map((r) => `${r.name} ${s.show ? s.show(r) : s.val(r)}`).join(", ");
    const n = s.need === 3 ? "three" : "two";
    const text = hits.length === 1
      ? `The ${label(yr(r0))} ${teamName(r0)} are the only team of the ${decadeLabel} with ${n} players at ${s.what}: ${names}.`
      : `${hits.length} teams of the ${decadeLabel} had ${n} players at ${s.what}; the biggest pairing was the ${label(yr(r0))} ${teamName(r0)} — ${names}.`;
    out.push({ kind: "teammates", rule: s.key, group: s.group || "P", decade: decadeLabel, score: hits.length === 1 ? 8 : 5,
      players: g.slice(0, 3).map(pid), seasons: [yr(r0)], finder: null, evidence: g.slice(0, 3).map(ev), text });
  }
  return out;
}

// Decade aggregates per player.
function totalFacts(rows, specs, ctx) {
  const { decadeLabel } = ctx;
  const out = [];
  for (const s of specs) {
    const acc = new Map();
    for (const r of rows) { let v; try { v = s.val(r); } catch (e) { v = null; } if (v == null) continue;
      const a = acc.get(r.id) || { id: r.id, name: r.name, v: 0, n: 0 }; a.v += v; a.n += 1; acc.set(r.id, a); }
    const arr = [...acc.values()].filter((a) => !s.min || a.n >= s.min).sort((a, b) => b.v - a.v);
    if (!arr.length) continue;
    const a = arr[0];
    out.push({ kind: "total", rule: s.key, group: s.group || "P", decade: decadeLabel, score: 5, players: [{ id: a.id, name: a.name }], seasons: [],
      finder: null, evidence: arr.slice(0, 5).map((x) => ({ id: x.id, name: x.name, total: x.v, seasons: x.n })),
      text: s.text(a, decadeLabel, arr[1]) });
  }
  return out;
}

// How many players cleared a bar each season; which season had the most / fewest.
function seasonCountFacts(rows, specs, ctx) {
  const { decadeLabel, label = (s) => String(s), seasons } = ctx;
  const out = [];
  for (const sp of specs) {
    const counts = seasons.map((y) => ({ season: y, n: rows.filter((r) => yr(r) === y && (() => { try { return sp.f(r); } catch (e) { return false; } })()).length }));
    if (counts.length < 3) continue;
    const most = [...counts].sort((a, b) => b.n - a.n)[0]; const least = [...counts].sort((a, b) => a.n - b.n)[0];
    if (most.n === least.n) continue;
    const ev = counts.map((c) => ({ season: c.season, count: c.n }));
    out.push({ kind: "season", rule: `${sp.key}_most`, group: sp.group || "P", decade: decadeLabel, score: 5, players: [], seasons: [most.season], finder: null, evidence: ev,
      text: most.n === 1 ? `${label(most.season)} had one ${sp.what1 || sp.what.replace(/(\w)s\b/, "$1")}, the most of any season in the ${decadeLabel}.` : `${label(most.season)} had ${most.n} ${sp.what}, the most of any season in the ${decadeLabel}.` });
    const zeros = counts.filter((c) => c.n === 0).length;
    // "just 1 20-point scorers" -> "just one 20-point scorer"
    const one = sp.what1 || sp.what.replace(/(\w)s\b/, "$1");
    out.push({ kind: "season", rule: `${sp.key}_least`, group: sp.group || "P", decade: decadeLabel, score: 5, players: [], seasons: [least.season], finder: null, evidence: ev,
      text: least.n === 0 ? `${label(least.season)} had no ${sp.what} at all — ${zeros === 1 ? "the only season" : "one of the seasons"} of the ${decadeLabel} without one.`
          : least.n === 1 ? `${label(least.season)} had just one ${one}, the fewest of any season in the ${decadeLabel}.`
                          : `${label(least.season)} had just ${least.n} ${sp.what}, the fewest of any season in the ${decadeLabel}.` });
  }
  return out;
}

function select(cands, want) {
  const sorted = [...cands].sort((a, b) => b.score - a.score);
  const perPlayer = new Map(); const perRule = new Map(); const perKind = new Map();
  const out = []; const taken = new Set();
  const pass = (cap) => {
    for (const f of sorted) {
      if (out.length >= want) break;
      if (taken.has(f)) continue;
      if ((perRule.get(f.rule) || 0) >= cap.rule) continue;
      if (cap[f.kind] != null && (perKind.get(f.kind) || 0) >= cap[f.kind]) continue;
      if (f.players.some((p) => (perPlayer.get(p.id) || 0) >= cap.player)) continue;
      out.push(f); taken.add(f);
      perRule.set(f.rule, (perRule.get(f.rule) || 0) + 1); perKind.set(f.kind, (perKind.get(f.kind) || 0) + 1);
      for (const p of f.players) perPlayer.set(p.id, (perPlayer.get(p.id) || 0) + 1);
    }
  };
  pass({ player: 3, rule: 3, list: 22, nearmiss: 8, total: 14, team: 4, season: 14, age: 14 });
  if (out.length < want) pass({ player: 6, rule: 5, list: 40, nearmiss: 8, total: 16, team: 4, season: 18, age: 14 });
  if (out.length < want) pass({ player: 99, rule: 99 });
  return out.sort((a, b) => b.score - a.score).map((f, i) => ({ n: i + 1, ...f }));
}

module.exports = { verb, ruleFacts, extremeFacts, nearMissFacts, streakFacts, teammateFacts, totalFacts, seasonCountFacts, select };
