// MLB detection rules. Each anomaly rule = two numbers that shouldn't coexist,
// plus the exact Stathead query that tests how rare it is. Weights are a
// subjective distinctiveness ranking (higher = better post), not a stat.
"use strict";
const f3 = (x) => (x == null ? "?" : x.toFixed(3).replace(/^0/, ""));
const f2 = (x) => (x == null ? "?" : x.toFixed(2));
const pct = (n, d) => (n != null && d ? Math.round((n / d) * 1000) / 10 : null);
const ipStr = (p) => p.season.IP_raw;

const anomalies = [
  {
    key: "hr_low_avg", title: "Power with no average", group: "hitting", weight: 40,
    qualify: (p) => p.season.PA >= 350, test: (p) => p.season.HR >= 25 && p.season.AVG <= 0.220,
    describe: (p) => `${p.season.HR} HR, ${f3(p.season.AVG)} AVG, ${p.season.PA} PA, ${p.seasonYear} in progress`,
    why: () => `A 25-homer bat hitting under .220 is the classic power-without-contact shape.`,
    stathead: (p) => `Season Finder → Batting → filters: HR >= ${p.season.HR} AND BA <= ${f3(p.season.AVG)} → all seasons since 1871 → sort BA ascending. If the list is under 25 rows, this is a post. How many rows, and is ${p.name} the lowest average among them?`,
    kicker: (p) => `DRAFT: ${p.name} has ${p.season.HR} homers and a ${f3(p.season.AVG)} average.`,
  },
  {
    key: "avg_no_walks", title: "High average, no walks", group: "hitting", weight: 38,
    qualify: (p) => p.season.PA >= 400, test: (p) => p.season.AVG >= 0.295 && pct(p.season.BB, p.season.PA) <= 4.5,
    describe: (p) => `${f3(p.season.AVG)} AVG, ${p.season.BB} BB in ${p.season.PA} PA (${pct(p.season.BB, p.season.PA)}% walk rate), ${p.seasonYear} in progress`,
    why: () => `Hitting near .300 while almost never walking: a swing-at-everything profile.`,
    stathead: (p) => `Season Finder → Batting → filters: BA >= ${f3(p.season.AVG)} AND BB <= ${p.season.BB} AND PA >= ${p.season.PA} → all seasons → sort BB ascending. Who else is on the list, and how many rows since 2000?`,
    kicker: (p) => `DRAFT: ${p.name} is hitting ${f3(p.season.AVG)} with ${p.season.BB} walks.`,
  },
  {
    key: "sb_low_obp", title: "Steals without getting on base", group: "hitting", weight: 36,
    qualify: (p) => p.season.PA >= 350, test: (p) => p.season.SB >= 25 && p.season.OBP <= 0.300,
    describe: (p) => `${p.season.SB} SB, ${f3(p.season.OBP)} OBP, ${p.season.PA} PA, ${p.seasonYear} in progress`,
    why: () => `Reaching base under 30% of the time and still piling up steals.`,
    stathead: (p) => `Season Finder → Batting → filters: SB >= ${p.season.SB} AND OBP <= ${f3(p.season.OBP)} AND PA >= 350 → all seasons → sort OBP ascending. How many rows since 1990?`,
    kicker: (p) => `DRAFT: ${p.name} has ${p.season.SB} steals on a ${f3(p.season.OBP)} on-base percentage.`,
  },
  {
    key: "era_low_k", title: "Elite ERA, few strikeouts", group: "pitching", weight: 42,
    qualify: (p) => p.season.IP >= 100 && p.season.GS >= 15, test: (p) => p.season.ERA <= 3.10 && p.season.K9 <= 6.5,
    describe: (p) => `${f2(p.season.ERA)} ERA, ${p.season.K9} K/9, ${p.season.SO} K in ${ipStr(p)} IP, ${p.seasonYear} in progress`,
    why: () => `A sub-3.10 ERA with a strikeout rate this low is the anti-modern pitcher.`,
    stathead: (p) => `Season Finder → Pitching → filters: ERA <= ${f2(p.season.ERA)} AND SO/9 <= ${p.season.K9} AND IP >= ${Math.floor(p.season.IP)} → seasons since 2010 → sort SO/9 ascending. How many qualified starters have done this since 2010?`,
    kicker: (p) => `DRAFT: ${p.name} has a ${f2(p.season.ERA)} ERA and strikes out ${p.season.K9} per nine.`,
  },
  {
    key: "rbi_low_ops", title: "RBI pile with a weak OPS", group: "hitting", weight: 34,
    qualify: (p) => p.season.PA >= 400, test: (p) => p.season.RBI >= 80 && p.season.OPS <= 0.700,
    describe: (p) => `${p.season.RBI} RBI, ${f3(p.season.OPS)} OPS, ${p.season.PA} PA, ${p.seasonYear} in progress`,
    why: () => `Run production without hitting production: lineup spot and opportunity doing the work.`,
    stathead: (p) => `Season Finder → Batting → filters: RBI >= ${p.season.RBI} AND OPS <= ${f3(p.season.OPS)} → all seasons → sort OPS ascending. How many rows, and how many since 2000?`,
    kicker: (p) => `DRAFT: ${p.name} has driven in ${p.season.RBI} with a ${f3(p.season.OPS)} OPS.`,
  },
  {
    key: "hits_few_runs", title: "Lots of hits, few runs", group: "hitting", weight: 30,
    qualify: (p) => p.season.PA >= 450, test: (p) => p.season.H >= 150 && p.season.R <= 60,
    describe: (p) => `${p.season.H} H, ${p.season.R} R, ${p.season.PA} PA, ${p.seasonYear} in progress`,
    why: () => `Hits are supposed to turn into runs; here they aren't.`,
    stathead: (p) => `Season Finder → Batting → filters: H >= ${p.season.H} AND R <= ${p.season.R} → all seasons → sort R ascending. How many rows since 1961?`,
    kicker: (p) => `DRAFT: ${p.name} has ${p.season.H} hits and ${p.season.R} runs scored.`,
  },
  {
    key: "young_power", title: "Power at an unusual age", group: "hitting", weight: 44,
    qualify: (p) => p.age != null && p.season.PA >= 300, test: (p) => p.age <= 22 && p.season.HR >= 25,
    describe: (p) => `${p.season.HR} HR at age ${p.age} (${p.season.PA} PA), ${p.seasonYear} in progress`,
    why: () => `How many players have hit 25 homers before age 23?`,
    stathead: (p) => `Season Finder → Batting → filters: HR >= ${p.season.HR} AND Age <= ${p.age} → all seasons → sort HR descending. List every row; which Hall of Famers sit directly above and below ${p.name}?`,
    kicker: (p) => `DRAFT: ${p.name}, age ${p.age}, has ${p.season.HR} homers.`,
  },
  {
    key: "old_bat", title: "Elite bat at an advanced age", group: "hitting", weight: 44,
    qualify: (p) => p.age != null && p.season.PA >= 350, test: (p) => p.age >= 36 && p.season.OPS >= 0.850,
    describe: (p) => `${f3(p.season.OPS)} OPS at age ${p.age} (${p.season.PA} PA), ${p.seasonYear} in progress`,
    why: () => `How many players have posted an .850 OPS at 36 or older?`,
    stathead: (p) => `Season Finder → Batting → filters: OPS >= ${f3(p.season.OPS)} AND Age >= ${p.age} AND PA >= 350 → all seasons → sort OPS descending. Who are the names above and below ${p.name}, and how many rows since 2010?`,
    kicker: (p) => `DRAFT: ${p.name}, age ${p.age}, has a ${f3(p.season.OPS)} OPS.`,
  },
  {
    key: "old_arm", title: "Elite ERA at an advanced age", group: "pitching", weight: 42,
    qualify: (p) => p.age != null && p.season.IP >= 100, test: (p) => p.age >= 37 && p.season.ERA <= 3.25,
    describe: (p) => `${f2(p.season.ERA)} ERA at age ${p.age} in ${ipStr(p)} IP, ${p.seasonYear} in progress`,
    why: () => `How many pitchers have a sub-3.25 ERA over 100 innings at 37 or older?`,
    stathead: (p) => `Season Finder → Pitching → filters: ERA <= ${f2(p.season.ERA)} AND Age >= ${p.age} AND IP >= 100 → all seasons → sort Age descending. How many rows since 1990, and who is the oldest?`,
    kicker: (p) => `DRAFT: ${p.name}, age ${p.age}, has a ${f2(p.season.ERA)} ERA.`,
  },
  {
    key: "power_bad_team", title: "Slugging on a losing team", group: "hitting", weight: 32,
    qualify: (p) => p.teamContext && p.teamContext.gamesPlayed >= 100 && p.season.PA >= 400, test: (p) => p.season.HR >= 32 && p.teamContext.winPct <= 0.420,
    describe: (p) => `${p.season.HR} HR for a team at ${p.teamContext.wins}-${p.teamContext.losses} (${f3(p.teamContext.winPct)}), ${p.seasonYear} in progress`,
    why: () => `Star production on a team going nowhere.`,
    stathead: (p) => `Season Finder → Batting → filters: HR >= ${p.season.HR} AND Team W-L% <= .420 → all seasons → sort HR descending. How many rows since 2000?`,
    kicker: (p) => `DRAFT: ${p.name} has ${p.season.HR} homers for a ${p.teamContext.wins}-${p.teamContext.losses} team.`,
  },
  {
    key: "k_no_wins", title: "Strikeouts without wins", group: "pitching", weight: 36,
    qualify: (p) => p.season.GS >= 20, test: (p) => p.season.SO >= 190 && p.season.W <= 8,
    describe: (p) => `${p.season.SO} K, ${p.season.W}-${p.season.L} W-L, ${ipStr(p)} IP, ${p.seasonYear} in progress`,
    why: () => `Piling up strikeouts with a losing win-loss mark: the "wins are a team stat" post.`,
    stathead: (p) => `Season Finder → Pitching → filters: SO >= ${p.season.SO} AND W <= ${p.season.W} → all seasons → sort W ascending. How many rows, and who else is on it?`,
    kicker: (p) => `DRAFT: ${p.name} has ${p.season.SO} strikeouts and ${p.season.W} wins.`,
  },
  {
    key: "saves_bad_era", title: "Saves piling up with a bad ERA", group: "pitching", weight: 33,
    qualify: (p) => p.season.G >= 40, test: (p) => p.season.SV >= 28 && p.season.ERA >= 4.50,
    describe: (p) => `${p.season.SV} SV, ${f2(p.season.ERA)} ERA in ${ipStr(p)} IP, ${p.seasonYear} in progress`,
    why: () => `Closer keeps the job while giving up runs at a starter-getting-demoted rate.`,
    stathead: (p) => `Season Finder → Pitching → filters: SV >= ${p.season.SV} AND ERA >= ${f2(p.season.ERA)} → all seasons → sort ERA descending. How many rows since 1990?`,
    kicker: (p) => `DRAFT: ${p.name} has ${p.season.SV} saves and a ${f2(p.season.ERA)} ERA.`,
  },
  {
    key: "hr_no_doubles", title: "Homers but no doubles", group: "hitting", weight: 35,
    qualify: (p) => p.season.PA >= 400, test: (p) => p.season.HR >= 28 && p.season["2B"] <= 14,
    describe: (p) => `${p.season.HR} HR, ${p.season["2B"]} 2B, ${p.season.PA} PA, ${p.seasonYear} in progress`,
    why: () => `Twice as many homers as doubles: every ball that leaves the bat hard leaves the park or dies.`,
    stathead: (p) => `Season Finder → Batting → filters: HR >= ${p.season.HR} AND 2B <= ${p.season["2B"]} → all seasons → sort 2B ascending. How many rows, all-time?`,
    kicker: (p) => `DRAFT: ${p.name} has ${p.season.HR} home runs and ${p.season["2B"]} doubles.`,
  },
  {
    key: "workhorse_low_k", title: "Innings eater, low strikeouts", group: "pitching", weight: 30,
    qualify: (p) => p.season.GS >= 20, test: (p) => p.season.IP >= 170 && p.season.SO <= 120,
    describe: (p) => `${ipStr(p)} IP, ${p.season.SO} K, ${f2(p.season.ERA)} ERA, ${p.seasonYear} in progress`,
    why: () => `How often does a modern starter throw 170 innings with only 120 strikeouts?`,
    stathead: (p) => `Season Finder → Pitching → filters: IP >= ${Math.floor(p.season.IP)} AND SO <= ${p.season.SO} → seasons since 2015 → sort SO ascending. How many rows since 2015?`,
    kicker: (p) => `DRAFT: ${p.name} has thrown ${ipStr(p)} innings with ${p.season.SO} strikeouts.`,
  },
  {
    key: "obp_no_power", title: "On-base machine with no power", group: "hitting", weight: 33,
    qualify: (p) => p.season.PA >= 400, test: (p) => p.season.OBP >= 0.380 && p.season.HR <= 5,
    describe: (p) => `${f3(p.season.OBP)} OBP, ${p.season.HR} HR, ${p.season.PA} PA, ${p.seasonYear} in progress`,
    why: () => `How rare is a .380 OBP with almost no home-run power today?`,
    stathead: (p) => `Season Finder → Batting → filters: OBP >= ${f3(p.season.OBP)} AND HR <= ${p.season.HR} AND PA >= 400 → seasons since 2000 → sort OBP descending. How many rows?`,
    kicker: (p) => `DRAFT: ${p.name} has a ${f3(p.season.OBP)} OBP and ${p.season.HR} home runs.`,
  },
];

// Milestones: thresholds from Nick's brief. "Round number" defined by `step`.
const milestones = [
  { stat: "HR", label: "HR", group: "hitting", step: 50, minValue: 50, within: 10, weight: (next, need) => (next % 100 === 0 ? 30 : 15) + (10 - need) },
  { stat: "RBI", label: "RBI", group: "hitting", step: 100, minValue: 100, within: 25, weight: (next, need) => (next % 500 === 0 ? 30 : 12) + (25 - need) / 2.5 },
  { stat: "R", label: "runs", group: "hitting", step: 100, minValue: 100, within: 25, weight: (next, need) => (next % 500 === 0 ? 30 : 12) + (25 - need) / 2.5 },
  { stat: "SB", label: "SB", group: "hitting", step: 50, minValue: 50, within: 5, weight: (next, need) => (next % 100 === 0 ? 30 : 14) + (5 - need) * 2 },
  { stat: "H", label: "hits", group: "hitting", step: 500, minValue: 500, within: 50, weight: (next, need) => (next >= 2000 ? 35 : 18) + (50 - need) / 5 },
  { stat: "SO", label: "strikeouts", group: "pitching", step: 500, minValue: 500, within: 50, weight: (next, need) => (next >= 2000 ? 35 : 18) + (50 - need) / 5 },
  { stat: "IP", label: "innings", group: "pitching", step: 500, minValue: 500, within: 50, weight: (next, need) => (next >= 2000 ? 30 : 14) + (50 - need) / 5 },
  { stat: "W", label: "wins", group: "pitching", step: 50, minValue: 50, within: 5, weight: (next, need) => (next % 100 === 0 ? 34 : 16) + (5 - need) * 2 },
];

// Heat checks on the league-wide calendar windows. Finalists get exact game-log windows afterward.
const heat = [
  { key: "hot_bat_15", title: "Hot bat", group: "hitting", window: "last15d", weight: 8,
    qualify: (p, w) => w.PA >= 45, test: (p, w) => w.OPS >= 1.150 || w.HR >= 7,
    describe: (p, w) => `${w.label}: ${f3(w.AVG)}/${f3(w.OBP)}/${f3(w.SLG)}, ${w.HR} HR, ${w.RBI} RBI in ${w.G} games (source ${w.source})`,
    why: () => `Two weeks of production that changes a season line.`, stathead: null,
    kicker: (p, w) => `DRAFT: ${p.name} over ${w.label}: ${w.HR} homers, ${f3(w.OPS)} OPS.` },
  { key: "hot_bat_30", title: "Month-long heater", group: "hitting", window: "last30d", weight: 6,
    qualify: (p, w) => w.PA >= 90, test: (p, w) => w.OPS >= 1.050 || w.HR >= 12,
    describe: (p, w) => `${w.label}: ${f3(w.AVG)}/${f3(w.OBP)}/${f3(w.SLG)}, ${w.HR} HR, ${w.RBI} RBI in ${w.G} games (source ${w.source})`,
    why: () => `Where does this month rank on the monthly leaderboard?`,
    stathead: (p, w) => `Span Finder → Batting → span ${w.start} to ${w.end} → sort OPS descending. Where does ${p.name} rank in MLB for the window, and what is the last comparable 30-day stretch by any player?`,
    kicker: (p, w) => `DRAFT: ${p.name} over ${w.label}: ${w.HR} homers, ${f3(w.OPS)} OPS.` },
  { key: "cold_bat_30", title: "Deep slump", group: "hitting", window: "last30d", weight: 5,
    qualify: (p, w) => w.PA >= 90 && p.season.PA >= 400, test: (p, w) => w.OPS <= 0.500,
    describe: (p, w) => `${w.label}: ${f3(w.AVG)}/${f3(w.OBP)}/${f3(w.SLG)}, ${w.HR} HR in ${w.G} games; season OPS ${f3(p.season.OPS)} (source ${w.source})`,
    why: () => `A regular running a sub-.500 OPS for a month.`, stathead: null,
    kicker: (p, w) => `DRAFT: ${p.name} over ${w.label}: a ${f3(w.OPS)} OPS.` },
  { key: "hot_arm_30", title: "Dominant month on the mound", group: "pitching", window: "last30d", weight: 7,
    qualify: (p, w) => w.IP >= 25 && w.GS >= 4, test: (p, w) => w.ERA <= 1.50 || (w.BF && w.SO / w.BF >= 0.36),
    describe: (p, w) => `${w.label}: ${f2(w.ERA)} ERA, ${w.SO} K in ${w.IP_raw} IP over ${w.GS} starts (source ${w.source})`,
    why: () => `A month of starts at this level.`, stathead: null,
    kicker: (p, w) => `DRAFT: ${p.name} over ${w.label}: ${f2(w.ERA)} ERA, ${w.SO} strikeouts.` },
];

module.exports = { anomalies, milestones, heat };

// Preset Stathead DISCOVERY queries (current season only). Printed by
// `node statdesk/run.js --stathead-list`; the local session runs them in Nick's browser.
const discovery = (season) => [
  { key: "hr_low_avg", query: `Season Finder → Batting → Season = ${season} → filters: HR >= 25 AND BA <= .220 AND PA >= 350 → sort BA ascending` },
  { key: "avg_no_walks", query: `Season Finder → Batting → Season = ${season} → filters: BA >= .295 AND PA >= 400 → sort BB ascending → keep rows with BB/PA <= 4.5%` },
  { key: "sb_low_obp", query: `Season Finder → Batting → Season = ${season} → filters: SB >= 25 AND OBP <= .300 AND PA >= 350 → sort OBP ascending` },
  { key: "era_low_k", query: `Season Finder → Pitching → Season = ${season} → filters: ERA <= 3.10 AND SO/9 <= 6.5 AND IP >= 100 AND GS >= 15 → sort SO/9 ascending` },
  { key: "rbi_low_ops", query: `Season Finder → Batting → Season = ${season} → filters: RBI >= 80 AND OPS <= .700 AND PA >= 400 → sort OPS ascending` },
  { key: "hits_few_runs", query: `Season Finder → Batting → Season = ${season} → filters: H >= 150 AND R <= 60 → sort R ascending` },
  { key: "young_power", query: `Season Finder → Batting → Season = ${season} → filters: HR >= 25 AND Age <= 22 → sort HR descending` },
  { key: "old_bat", query: `Season Finder → Batting → Season = ${season} → filters: OPS >= .850 AND Age >= 36 AND PA >= 350 → sort OPS descending` },
  { key: "old_arm", query: `Season Finder → Pitching → Season = ${season} → filters: ERA <= 3.25 AND Age >= 37 AND IP >= 100 → sort ERA ascending` },
  { key: "k_no_wins", query: `Season Finder → Pitching → Season = ${season} → filters: SO >= 190 AND W <= 8 AND GS >= 20 → sort W ascending` },
  { key: "saves_bad_era", query: `Season Finder → Pitching → Season = ${season} → filters: SV >= 28 AND ERA >= 4.50 → sort ERA descending` },
  { key: "hr_no_doubles", query: `Season Finder → Batting → Season = ${season} → filters: HR >= 28 AND 2B <= 14 AND PA >= 400 → sort 2B ascending` },
  { key: "workhorse_low_k", query: `Season Finder → Pitching → Season = ${season} → filters: IP >= 170 AND SO <= 120 AND GS >= 20 → sort SO ascending` },
  { key: "obp_no_power", query: `Season Finder → Batting → Season = ${season} → filters: OBP >= .380 AND HR <= 5 AND PA >= 400 → sort OBP descending` },
  { key: "milestones", query: `Player pages (Baseball Reference) for any name surfaced above: career HR / RBI / R / SB / H (hitters), SO / IP / W (pitchers); flag within 10 HR, 25 RBI or R, 5 SB or W, 50 K, 50 IP, 50 H of a round number` },
  { key: "heat", query: `Span Finder → Batting → last 15 and last 30 days ending yesterday → sort OPS descending, then HR descending; Span Finder → Pitching → last 30 days → sort ERA ascending. State the exact dates of every window.` },
];
module.exports.discovery = discovery;
