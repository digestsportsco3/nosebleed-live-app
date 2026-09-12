// MLB adapter: pulls from statsapi.mlb.com (official, free, no key) and
// normalizes into the sport-agnostic player-line shape the scanner expects.
// Every call goes through fetchJson so it is logged and cached.
"use strict";
const { fetchJson } = require("../../lib/http");

const BASE = "https://statsapi.mlb.com/api/v1";
const HITTER_MIN_PA_FOR_CAREER = 200;   // only pull career totals for players with a real season
const PITCHER_MIN_IP_FOR_CAREER = 40;

function num(x) { if (x === undefined || x === null || x === "") return null; const n = Number(x); return isFinite(n) ? n : null; }
function ip(x) { // "123.1" means 123 and 1/3 innings
  if (x === undefined || x === null) return null;
  const s = String(x); const [w, f] = s.split("."); const whole = Number(w); const frac = f ? Number(f) : 0;
  return isFinite(whole) ? whole + frac / 3 : null;
}
function fmtDate(d) { return d.toISOString().slice(0, 10); }
function addDays(d, n) { const x = new Date(d); x.setUTCDate(x.getUTCDate() + n); return x; }
function pretty(dateStr) { const [y, m, d] = dateStr.split("-").map(Number); return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" }); }

function normHitting(s) {
  return {
    G: num(s.gamesPlayed), PA: num(s.plateAppearances), AB: num(s.atBats), R: num(s.runs), H: num(s.hits), "2B": num(s.doubles), "3B": num(s.triples),
    HR: num(s.homeRuns), RBI: num(s.rbi), BB: num(s.baseOnBalls), IBB: num(s.intentionalWalks), SO: num(s.strikeOuts), SB: num(s.stolenBases), CS: num(s.caughtStealing),
    HBP: num(s.hitByPitch), AVG: num(s.avg), OBP: num(s.obp), SLG: num(s.slg), OPS: num(s.ops), TB: num(s.totalBases), GIDP: num(s.groundIntoDoublePlay),
  };
}
function normPitching(s) {
  return {
    G: num(s.gamesPlayed), GS: num(s.gamesStarted), W: num(s.wins), L: num(s.losses), ERA: num(s.era), IP: ip(s.inningsPitched), IP_raw: s.inningsPitched,
    SO: num(s.strikeOuts), BB: num(s.baseOnBalls), H: num(s.hits), HR: num(s.homeRuns), SV: num(s.saves), BS: num(s.blownSaves), HLD: num(s.holds), WHIP: num(s.whip),
    K9: num(s.strikeoutsPer9Inn), BB9: num(s.walksPer9Inn), BF: num(s.battersFaced), CG: num(s.completeGames), SHO: num(s.shutouts), ER: num(s.earnedRuns),
  };
}

async function pull({ log, runDate, season, summary }) {
  const asOf = new Date(`${runDate}T12:00:00Z`);
  const endDate = fmtDate(addDays(asOf, -1)); // last completed day of games
  const players = new Map(); // id -> line

  // 1. Season leaderboards for every player (one call each group)
  const hit = await fetchJson(log, `${BASE}/stats?stats=season&group=hitting&season=${season}&sportId=1&playerPool=All&limit=5000`, { label: "season hitting, all players" });
  const pit = await fetchJson(log, `${BASE}/stats?stats=season&group=pitching&season=${season}&sportId=1&playerPool=All&limit=5000`, { label: "season pitching, all players" });
  const hitSplits = splits(hit.json); const pitSplits = splits(pit.json);
  if (!hitSplits.length || !pitSplits.length) throw new Error(`Season stats came back empty (hitting ${hitSplits.length}, pitching ${pitSplits.length}). Stopping.`);
  summary.push(`Season hitting rows: ${hitSplits.length} (${hit.id}); season pitching rows: ${pitSplits.length} (${pit.id})`);

  for (const sp of hitSplits) upsert(players, sp, "hitting", normHitting(sp.stat), hit.id);
  for (const sp of pitSplits) upsert(players, sp, "pitching", normPitching(sp.stat), pit.id);

  // 2. Standings → team context and games remaining
  const st = await fetchJson(log, `${BASE}/standings?leagueId=103,104&season=${season}&standingsTypes=regularSeason`, { label: "standings" });
  const teams = new Map();
  for (const rec of st.json.records || []) for (const tr of rec.teamRecords || []) {
    const gp = num(tr.gamesPlayed); teams.set(tr.team.id, { name: tr.team.name, wins: num(tr.wins), losses: num(tr.losses), gamesPlayed: gp, winPct: num(tr.winningPercentage), gamesRemaining: gp == null ? null : 162 - gp });
  }
  if (!teams.size) throw new Error("Standings came back empty. Stopping.");
  summary.push(`Teams in standings: ${teams.size} (${st.id})`);
  for (const p of players.values()) { p.teamContext = teams.get(p.teamId) || null; p.sources.push(st.id); }

  // 3. Ages + career totals, batched, for players with a real season
  const needCareer = [...players.values()].filter((p) => (p.group === "hitting" && (p.season.PA || 0) >= HITTER_MIN_PA_FOR_CAREER) || (p.group === "pitching" && (p.season.IP || 0) >= PITCHER_MIN_IP_FOR_CAREER));
  const ids = [...new Set(needCareer.map((p) => p.id))];
  for (let i = 0; i < ids.length; i += 50) {
    const batch = ids.slice(i, i + 50);
    const r = await fetchJson(log, `${BASE}/people?personIds=${batch.join(",")}&hydrate=stats(group=[hitting,pitching],type=[career])`, { label: `people+career batch ${i / 50 + 1}` });
    for (const person of r.json.people || []) {
      for (const key of [`${person.id}:hitting`, `${person.id}:pitching`]) {
        const p = players.get(key); if (!p) continue;
        p.age = num(person.currentAge); p.birthDate = person.birthDate || null; p.pos = person.primaryPosition ? person.primaryPosition.abbreviation : p.pos;
        for (const block of person.stats || []) {
          const g = block.group && block.group.displayName; const t = block.type && block.type.displayName;
          if (t !== "career" || g !== p.group) continue;
          const s = (block.splits && block.splits[0] && block.splits[0].stat) || null; if (!s) continue;
          p.career = g === "hitting" ? normHitting(s) : normPitching(s);
        }
        p.sources.push(r.id);
      }
    }
  }
  summary.push(`Career/age batches pulled for ${ids.length} players`);

  // 4. Calendar-window heat scan, league-wide (one call per window per group)
  const windows = {};
  for (const days of [10, 15, 30]) {
    const start = fmtDate(addDays(new Date(`${endDate}T12:00:00Z`), -(days - 1)));
    windows[`last${days}d`] = { start, end: endDate, label: `${pretty(start)} – ${pretty(endDate)} (${days} calendar days)` };
    for (const group of ["hitting", "pitching"]) {
      const r = await fetchJson(log, `${BASE}/stats?stats=byDateRange&group=${group}&startDate=${start}&endDate=${endDate}&season=${season}&sportId=1&playerPool=All&limit=5000`, { label: `${group} ${start}..${endDate}` });
      for (const sp of splits(r.json)) {
        const p = players.get(`${sp.player.id}:${group}`); if (!p) continue;
        p.windows[`last${days}d`] = { ...(group === "hitting" ? normHitting(sp.stat) : normPitching(sp.stat)), start, end: endDate, label: windows[`last${days}d`].label, kind: "calendar", source: r.id };
        p.sources.push(r.id);
      }
    }
  }
  summary.push(`Heat windows: ${Object.values(windows).map((w) => w.label).join("; ")}`);

  // 5. Schedule for today (context only)
  const sched = await fetchJson(log, `${BASE}/schedule?sportId=1&date=${runDate}`, { label: "today's schedule" });
  const gamesToday = ((sched.json.dates || [])[0] || {}).totalGames || 0;
  summary.push(`Games scheduled ${runDate}: ${gamesToday} (${sched.id})`);

  for (const p of players.values()) { p.sources = [...new Set(p.sources)]; p.seasonYear = season; }
  return { players: [...players.values()], teams, windows, endDate };
}

// Exact last-N-games lines from game logs, pulled only for finalists (keeps call count small).
async function gameLogLines({ log, season, player, lastN }) {
  const r = await fetchJson(log, `${BASE}/people/${player.id}/stats?stats=gameLog&group=${player.group}&season=${season}`, { label: `game log ${player.name}` });
  const sp = splits(r.json).filter((s) => s.date).sort((a, b) => a.date.localeCompare(b.date));
  const rows = player.group === "pitching" ? sp.filter((s) => num(s.stat.gamesStarted) === 1) : sp;
  const out = {};
  for (const n of lastN) {
    const slice = rows.slice(-n); if (slice.length < n) continue;
    out[`last${n}g`] = { ...sum(slice.map((s) => s.stat), player.group), games: slice.length, start: slice[0].date, end: slice[slice.length - 1].date, label: `last ${n} ${player.group === "pitching" ? "starts" : "games"}, ${pretty(slice[0].date)} – ${pretty(slice[slice.length - 1].date)}`, kind: "games", source: r.id };
  }
  player.sources.push(r.id);
  return out;
}

function sum(stats, group) {
  const acc = {};
  const add = (k, v) => { if (v == null) return; acc[k] = (acc[k] || 0) + v; };
  for (const s of stats) {
    if (group === "hitting") { const h = normHitting(s); for (const k of ["G", "PA", "AB", "R", "H", "2B", "3B", "HR", "RBI", "BB", "SO", "SB", "HBP", "TB"]) add(k, h[k]); const sf = num(s.sacFlies); add("SF", sf); }
    else { const p = normPitching(s); for (const k of ["G", "GS", "W", "L", "IP", "SO", "BB", "H", "HR", "ER", "BF"]) add(k, p[k]); }
  }
  if (group === "hitting") {
    acc.AVG = acc.AB ? r3(acc.H / acc.AB) : null;
    const obpDen = (acc.AB || 0) + (acc.BB || 0) + (acc.HBP || 0) + (acc.SF || 0);
    acc.OBP = obpDen ? r3(((acc.H || 0) + (acc.BB || 0) + (acc.HBP || 0)) / obpDen) : null;
    acc.SLG = acc.AB ? r3((acc.TB || 0) / acc.AB) : null;
    acc.OPS = acc.OBP != null && acc.SLG != null ? r3(acc.OBP + acc.SLG) : null;
    acc.derived = "AVG/OBP/SLG/OPS computed from summed game-log counting stats (H, AB, BB, HBP, SF, TB)";
  } else {
    acc.ERA = acc.IP ? Math.round((acc.ER * 9 / acc.IP) * 100) / 100 : null;
    acc.K9 = acc.IP ? Math.round((acc.SO * 9 / acc.IP) * 10) / 10 : null;
    acc.KPct = acc.BF ? Math.round((acc.SO / acc.BF) * 1000) / 10 : null;
    acc.derived = "ERA/K9/K% computed from summed game-log ER, IP, SO, BF";
  }
  return acc;
}
function r3(x) { return Math.round(x * 1000) / 1000; }

function splits(json) { const out = []; for (const b of (json && json.stats) || []) for (const s of b.splits || []) out.push(s); return out; }
function upsert(players, sp, group, stats, callId) {
  if (!sp.player) return;
  const key = `${sp.player.id}:${group}`;
  players.set(key, { id: sp.player.id, key, name: sp.player.fullName, team: sp.team ? sp.team.name : null, teamId: sp.team ? sp.team.id : null,
    teamAbbr: sp.team ? teamAbbr(sp.team.name) : null, pos: sp.position ? sp.position.abbreviation : null, age: null, group, season: stats, career: null, windows: {}, sources: [callId] });
}
const ABBR = { "Arizona Diamondbacks": "ARI", "Atlanta Braves": "ATL", "Baltimore Orioles": "BAL", "Boston Red Sox": "BOS", "Chicago Cubs": "CHC", "Chicago White Sox": "CWS", "Cincinnati Reds": "CIN", "Cleveland Guardians": "CLE", "Colorado Rockies": "COL", "Detroit Tigers": "DET", "Houston Astros": "HOU", "Kansas City Royals": "KC", "Los Angeles Angels": "LAA", "Los Angeles Dodgers": "LAD", "Miami Marlins": "MIA", "Milwaukee Brewers": "MIL", "Minnesota Twins": "MIN", "New York Mets": "NYM", "New York Yankees": "NYY", "Athletics": "ATH", "Oakland Athletics": "OAK", "Philadelphia Phillies": "PHI", "Pittsburgh Pirates": "PIT", "San Diego Padres": "SD", "San Francisco Giants": "SF", "Seattle Mariners": "SEA", "St. Louis Cardinals": "STL", "Tampa Bay Rays": "TB", "Texas Rangers": "TEX", "Toronto Blue Jays": "TOR", "Washington Nationals": "WSH" };
function teamAbbr(name) { return ABBR[name] || name; }

module.exports = { sport: "MLB", pull, gameLogLines, rules: require("./rules") };
