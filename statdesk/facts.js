// Post-ready facts from a decade of complete season pulls.
//
// The daily brief's value is not leaderboards, it is the oddity: the 40-homer
// hitter batting .208, the 200-strikeout pitcher with seven wins, the only man
// of the decade to do two things at once. This is that rule library, sized for
// a decade. Every rule is a predicate over rows the pipeline pulled in full, so
// every fact it emits is computed, never recalled, and carries the rows that
// prove it.
//
// Kinds of fact, in rough order of how well they post:
//   only      exactly one player-season in the decade satisfies the rule
//   pair/few  two, or three to four, do — all named
//   extreme   the most extreme value among seasons satisfying a base filter
//   streak    consecutive seasons over a bar, longest of the decade
//   teammates two or three players on one team clearing a bar the same year
//   total     decade aggregates, including "most X without ever leading"
//   nearmiss  seasons that finished one short of a round number
//   team      standings facts (100-win clubs, run differentials)
//   list      five or more did it — reported as a count, led by the extreme
//
// Thresholds are era-aware. Strikeouts, walks, saves and home runs mean
// different things in 1925 and 1995; a rule that ignored that would emit
// nothing for one era and noise for the other.
//
// A rule whose filters are plain comparisons on single stats also carries a
// Stathead Season Finder spec, so the claim can be re-run on the subscription
// with the same filters and the same year range. Rules that compare two
// fields (walks > hits) cannot be expressed there and say so.
"use strict";

const ipStr = (o) => `${Math.floor(o / 3)}.${o % 3}`;
const avg3 = (v) => (v == null ? "—" : v.toFixed(3).replace(/^0/, ""));
const era2 = (v) => (v == null ? "—" : v.toFixed(2));
const n = (v) => (v == null ? 0 : v);
const yr = (r) => r.season;

// ------------------------------------------------------------- thresholds --
// old = 1920s-1950s, mid = 1960s-1980s, modern = 1990s on.
function era(start) { return start < 1960 ? "old" : start < 1990 ? "mid" : "modern"; }
const T = {
  old:    { hrBig: 25, hrHuge: 35, avgLow: 0.240, bbFew: 20, sbMany: 30, obpLow: 0.310, kFewHit: 15, kManyHit: 100, bbMany: 100,
            kMany: 150, kHuge: 200, wLow: 10, eraBad: 4.00, ipHuge: 900, kFewPit: 70, cgMany: 25, kPer9: 6.5, whip1: 1.05, sv: null, hbp: 12, kClose: null, hrTeam: 30, ageYoung: 22, ageOld: 36 },
  mid:    { hrBig: 30, hrHuge: 40, avgLow: 0.230, bbFew: 25, sbMany: 40, obpLow: 0.300, kFewHit: 25, kManyHit: 140, bbMany: 100,
            kMany: 200, kHuge: 250, wLow: 9,  eraBad: 4.25, ipHuge: 900, kFewPit: 90, cgMany: 18, kPer9: 8.5, whip1: 1.00, sv: 30,   hbp: 15, kClose: 100, hrTeam: 35, ageYoung: 22, ageOld: 37 },
  modern: { hrBig: 30, hrHuge: 40, avgLow: 0.220, bbFew: 25, sbMany: 40, obpLow: 0.300, kFewHit: 30, kManyHit: 180, bbMany: 100,
            kMany: 200, kHuge: 250, wLow: 8,  eraBad: 4.50, ipHuge: 750, kFewPit: 100, cgMany: 8, kPer9: 11,  whip1: 1.00, sv: 30,   hbp: 20, kClose: 100, hrTeam: 40, ageYoung: 22, ageOld: 37 },
};

// ------------------------------------------------------------------ rules --
// f: filter over a row. finder: Stathead spec (filters use finder.js keys) or
// null. say: phrase ONE row as the payload after a colon. floorPA/floorIP make
// the claim reproducible: "of hitters with 400 PA" rather than a league bar
// that differs by league and year.
function hitRules(t) {
  const PA = 400, PAF = 500;
  return [
    { key: "power_no_avg", group: "H", head: `hit ${t.hrBig}+ homers while batting under ${avg3(t.avgLow)}`, floor: `${PA}+ PA`,
      f: (r) => r.PA >= PA && r.HR >= t.hrBig && r.AVG < t.avgLow, mag: (r) => r.HR - 100 * r.AVG,
      say: (r) => `${r.HR} HR, ${avg3(r.AVG)}`, finder: { group: "batting", filters: [["PA", "gte", PA], ["HR", "gte", t.hrBig], ["BA", "lte", t.avgLow - 0.001]] } },
    { key: "avg_no_walks", group: "H", head: `bat .320 or better with ${t.bbFew} walks or fewer`, floor: `${PAF}+ PA`,
      f: (r) => r.PA >= PAF && r.AVG >= 0.320 && r.BB <= t.bbFew, mag: (r) => r.AVG * 100 - r.BB,
      say: (r) => `${avg3(r.AVG)}, ${r.BB} BB`, finder: { group: "batting", filters: [["PA", "gte", PAF], ["BA", "gte", 0.320], ["BB", "lte", t.bbFew]] } },
    { key: "sb_low_obp", group: "H", head: `steal ${t.sbMany}+ bases with an on-base under ${avg3(t.obpLow)}`, floor: `${PA}+ PA`,
      f: (r) => r.PA >= PA && r.SB >= t.sbMany && r.OBP < t.obpLow, mag: (r) => r.SB - 100 * r.OBP,
      say: (r) => `${r.SB} SB, ${avg3(r.OBP)} OBP`, finder: { group: "batting", filters: [["PA", "gte", PA], ["SB", "gte", t.sbMany], ["OBP", "lte", t.obpLow - 0.001]] } },
    { key: "rbi_low_ops", group: "H", head: "drive in 100 runs with an OPS under .700", floor: null,
      f: (r) => r.RBI >= 100 && r.OPS < 0.700, mag: (r) => r.RBI - 100 * r.OPS,
      say: (r) => `${r.RBI} RBI, ${avg3(r.OPS)} OPS`, finder: { group: "batting", filters: [["RBI", "gte", 100], ["OPS", "lte", 0.699]] } },
    { key: "hits_few_runs", group: "H", head: "collect 180 hits and score 65 runs or fewer", floor: null,
      f: (r) => r.H >= 180 && r.R <= 65, mag: (r) => r.H - r.R,
      say: (r) => `${r.H} H, ${r.R} R`, finder: { group: "batting", filters: [["H", "gte", 180], ["R", "lte", 65]] } },
    { key: "obp_no_power", group: "H", head: "post a .400 on-base with 5 homers or fewer", floor: `${PAF}+ PA`,
      f: (r) => r.PA >= PAF && r.OBP >= 0.400 && r.HR <= 5, mag: (r) => r.OBP * 100 - r.HR,
      say: (r) => `${avg3(r.OBP)} OBP, ${r.HR} HR`, finder: { group: "batting", filters: [["PA", "gte", PAF], ["OBP", "gte", 0.400], ["HR", "lte", 5]] } },
    { key: "hr_no_doubles", group: "H", head: `hit ${t.hrHuge - 5}+ homers with 15 doubles or fewer`, floor: null,
      f: (r) => r.HR >= t.hrHuge - 5 && r["2B"] <= 15, mag: (r) => r.HR - r["2B"],
      say: (r) => `${r.HR} HR, ${r["2B"]} 2B`, finder: { group: "batting", filters: [["HR", "gte", t.hrHuge - 5], ["2B", "lte", 15]] } },
    { key: "doubles_no_hr", group: "H", head: "hit 45 doubles and 5 homers or fewer", floor: null,
      f: (r) => r["2B"] >= 45 && r.HR <= 5, mag: (r) => r["2B"] - r.HR,
      say: (r) => `${r["2B"]} 2B, ${r.HR} HR`, finder: { group: "batting", filters: [["2B", "gte", 45], ["HR", "lte", 5]] } },
    { key: "walks_over_hits", group: "H", head: "draw more walks than hits", floor: `${PA}+ PA`,
      f: (r) => r.PA >= PA && r.BB > r.H, mag: (r) => r.BB - r.H,
      say: (r) => `${r.BB} BB, ${r.H} H`, finder: null },
    { key: "triples_over_hr", group: "H", head: "hit 12+ triples and more triples than homers", floor: null,
      f: (r) => r["3B"] >= 12 && r["3B"] > r.HR, mag: (r) => r["3B"] - r.HR,
      say: (r) => `${r["3B"]} 3B, ${r.HR} HR`, finder: null },
    { key: "zero_hr_full", group: "H", head: "play a full season without a single home run", floor: "600+ PA",
      f: (r) => r.PA >= 600 && r.HR === 0, mag: (r) => r.PA,
      say: (r) => `0 HR in ${r.PA} PA`, finder: { group: "batting", filters: [["PA", "gte", 600], ["HR", "lte", 0]] } },
    { key: "young_power", group: "H", head: `hit ${t.hrBig}+ homers at age ${t.ageYoung} or younger`, floor: null,
      f: (r) => r.age != null && r.age <= t.ageYoung && r.HR >= t.hrBig, mag: (r) => r.HR - r.age,
      say: (r) => `${r.HR} HR at ${r.age}`, finder: { group: "batting", ageMax: t.ageYoung, filters: [["HR", "gte", t.hrBig]] } },
    { key: "old_power", group: "H", head: `hit ${t.hrBig}+ homers at age ${t.ageOld} or older`, floor: null,
      f: (r) => r.age != null && r.age >= t.ageOld && r.HR >= t.hrBig, mag: (r) => r.HR + r.age,
      say: (r) => `${r.HR} HR at ${r.age}`, finder: { group: "batting", ageMin: t.ageOld, filters: [["HR", "gte", t.hrBig]] } },
    { key: "young_avg", group: "H", head: `bat .330 at age ${t.ageYoung} or younger`, floor: `${PAF}+ PA`,
      f: (r) => r.PA >= PAF && r.age != null && r.age <= t.ageYoung && r.AVG >= 0.330, mag: (r) => r.AVG * 100 - r.age,
      say: (r) => `${avg3(r.AVG)} at ${r.age}`, finder: { group: "batting", ageMax: t.ageYoung, filters: [["PA", "gte", PAF], ["BA", "gte", 0.330]] } },
    { key: "old_avg", group: "H", head: `bat .320 at age ${t.ageOld} or older`, floor: `${PAF}+ PA`,
      f: (r) => r.PA >= PAF && r.age != null && r.age >= t.ageOld && r.AVG >= 0.320, mag: (r) => r.AVG * 100 + r.age,
      say: (r) => `${avg3(r.AVG)} at ${r.age}`, finder: { group: "batting", ageMin: t.ageOld, filters: [["PA", "gte", PAF], ["BA", "gte", 0.320]] } },
    { key: "thirty_thirty", group: "H", head: "go 30-30", floor: null,
      f: (r) => r.HR >= 30 && r.SB >= 30, mag: (r) => r.HR + r.SB,
      say: (r) => `${r.HR} HR, ${r.SB} SB`, finder: { group: "batting", filters: [["HR", "gte", 30], ["SB", "gte", 30]] } },
    { key: "forty_forty", group: "H", head: "go 40-40", floor: null,
      f: (r) => r.HR >= 40 && r.SB >= 40, mag: (r) => r.HR + r.SB,
      say: (r) => `${r.HR} HR, ${r.SB} SB`, finder: { group: "batting", filters: [["HR", "gte", 40], ["SB", "gte", 40]] } },
    { key: "twenty_twenty_low_avg", group: "H", head: `go 20-20 while batting under ${avg3(t.avgLow + 0.01)}`, floor: null,
      f: (r) => r.HR >= 20 && r.SB >= 20 && r.AVG < t.avgLow + 0.01, mag: (r) => r.HR + r.SB - 100 * r.AVG,
      say: (r) => `${r.HR} HR, ${r.SB} SB, ${avg3(r.AVG)}`, finder: { group: "batting", filters: [["HR", "gte", 20], ["SB", "gte", 20], ["BA", "lte", t.avgLow + 0.009]] } },
    { key: "bb_and_k", group: "H", head: `draw ${t.bbMany} walks and strike out ${t.kManyHit} times`, floor: null,
      f: (r) => r.BB >= t.bbMany && r.SO >= t.kManyHit, mag: (r) => r.BB + r.SO,
      say: (r) => `${r.BB} BB, ${r.SO} K`, finder: { group: "batting", filters: [["BB", "gte", t.bbMany], ["SO", "gte", t.kManyHit]] } },
    { key: "low_k_full", group: "H", head: `strike out ${t.kFewHit} times or fewer in a full season`, floor: "600+ PA",
      f: (r) => r.PA >= 600 && r.SO <= t.kFewHit, mag: (r) => -r.SO,
      say: (r) => `${r.SO} K in ${r.PA} PA`, finder: { group: "batting", filters: [["PA", "gte", 600], ["SO", "lte", t.kFewHit]] } },
    { key: "hr_over_k", group: "H", head: `hit ${t.hrBig}+ homers with more homers than strikeouts`, floor: null,
      f: (r) => r.HR >= t.hrBig && r.HR > r.SO, mag: (r) => r.HR - r.SO,
      say: (r) => `${r.HR} HR, ${r.SO} K`, finder: null },
    { key: "hits_200_bb_100", group: "H", head: "get 200 hits and 100 walks", floor: null,
      f: (r) => r.H >= 200 && r.BB >= 100, mag: (r) => r.H + r.BB,
      say: (r) => `${r.H} H, ${r.BB} BB`, finder: { group: "batting", filters: [["H", "gte", 200], ["BB", "gte", 100]] } },
    { key: "five_tool", group: "H", head: "bat .300 with 30 homers, 100 RBI and 20 steals", floor: null,
      f: (r) => r.AVG >= 0.300 && r.HR >= 30 && r.RBI >= 100 && r.SB >= 20, mag: (r) => r.HR + r.SB,
      say: (r) => `${avg3(r.AVG)}, ${r.HR} HR, ${r.RBI} RBI, ${r.SB} SB`, finder: { group: "batting", filters: [["BA", "gte", 0.300], ["HR", "gte", 30], ["RBI", "gte", 100], ["SB", "gte", 20]] } },
    { key: "hbp_many", group: "H", head: `get hit by ${t.hbp}+ pitches`, floor: null,
      f: (r) => r.HBP >= t.hbp, mag: (r) => r.HBP,
      say: (r) => `${r.HBP} HBP`, finder: null },
    { key: "walk_machine", group: "H", head: "post an on-base 130+ points above the batting average", floor: `${PAF}+ PA`,
      f: (r) => r.PA >= PAF && r.OBP - r.AVG >= 0.130, mag: (r) => r.OBP - r.AVG,
      say: (r) => `${avg3(r.AVG)} AVG, ${avg3(r.OBP)} OBP`, finder: null },
    { key: "slap_hitter", group: "H", head: "bat .310 while slugging under .380", floor: `${PAF}+ PA`,
      f: (r) => r.PA >= PAF && r.AVG >= 0.310 && r.SLG < 0.380, mag: (r) => r.AVG - r.SLG,
      say: (r) => `${avg3(r.AVG)} AVG, ${avg3(r.SLG)} SLG`, finder: { group: "batting", filters: [["PA", "gte", PAF], ["BA", "gte", 0.310], ["SLG", "lte", 0.379]] } },
    { key: "rbi_no_hr", group: "H", head: "drive in 100 runs with 8 homers or fewer", floor: null,
      f: (r) => r.RBI >= 100 && r.HR <= 8, mag: (r) => r.RBI - r.HR,
      say: (r) => `${r.RBI} RBI, ${r.HR} HR`, finder: { group: "batting", filters: [["RBI", "gte", 100], ["HR", "lte", 8]] } },
    { key: "runs_no_rbi", group: "H", head: "score 120 runs with 50 RBI or fewer", floor: null,
      f: (r) => r.R >= 120 && r.RBI <= 50, mag: (r) => r.R - r.RBI,
      say: (r) => `${r.R} R, ${r.RBI} RBI`, finder: { group: "batting", filters: [["R", "gte", 120], ["RBI", "lte", 50]] } },
    { key: "gidp_many", group: "H", head: "ground into 28+ double plays", floor: null,
      f: (r) => r.GIDP >= 28, mag: (r) => r.GIDP,
      say: (r) => `${r.GIDP} GIDP`, finder: null },
    { key: "fifty_hr", group: "H", head: "hit 50 home runs", floor: null,
      f: (r) => r.HR >= 50, mag: (r) => r.HR,
      say: (r) => `${r.HR} HR`, finder: { group: "batting", filters: [["HR", "gte", 50]] } },
    { key: "four_hundred", group: "H", head: "bat .400", floor: `${PA}+ PA`,
      f: (r) => r.PA >= PA && r.AVG >= 0.400, mag: (r) => r.AVG,
      say: (r) => `${avg3(r.AVG)}`, finder: { group: "batting", filters: [["PA", "gte", PA], ["BA", "gte", 0.400]] } },
    { key: "two_thirty_hits", group: "H", head: "collect 230 hits", floor: null,
      f: (r) => r.H >= 230, mag: (r) => r.H,
      say: (r) => `${r.H} H`, finder: { group: "batting", filters: [["H", "gte", 230]] } },
    { key: "one_fifty_rbi", group: "H", head: "drive in 150 runs", floor: null,
      f: (r) => r.RBI >= 150, mag: (r) => r.RBI,
      say: (r) => `${r.RBI} RBI`, finder: { group: "batting", filters: [["RBI", "gte", 150]] } },
    { key: "seventy_sb", group: "H", head: "steal 70 bases", floor: null,
      f: (r) => r.SB >= 70, mag: (r) => r.SB,
      say: (r) => `${r.SB} SB`, finder: { group: "batting", filters: [["SB", "gte", 70]] } },
    { key: "sb_perfect", group: "H", head: "steal 30+ bases while getting caught 3 times or fewer", floor: null,
      f: (r) => r.SB >= 30 && r.CS != null && r.CS <= 3, mag: (r) => r.SB - 10 * r.CS,
      say: (r) => `${r.SB} SB, ${r.CS} CS`, finder: null },
  ];
}

function pitRules(t) {
  const GS = 25;
  return [
    { key: "k_no_wins", group: "P", head: `strike out ${t.kMany} and win ${t.wLow} games or fewer`, floor: null,
      f: (r) => r.SO >= t.kMany && r.W <= t.wLow, mag: (r) => r.SO - 10 * r.W,
      say: (r) => `${r.SO} K, ${r.W}-${r.L}`, finder: { group: "pitching", qualifiers: "nomin", filters: [["SO", "gte", t.kMany], ["W", "lte", t.wLow]] } },
    { key: "wins_bad_era", group: "P", head: `win 20 games with an ERA of ${era2(t.eraBad)} or worse`, floor: null,
      f: (r) => r.W >= 20 && r.ERA >= t.eraBad, mag: (r) => r.W + r.ERA,
      say: (r) => `${r.W}-${r.L}, ${era2(r.ERA)} ERA`, finder: { group: "pitching", qualifiers: "nomin", filters: [["W", "gte", 20], ["ERA", "gte", t.eraBad]] } },
    { key: "era_losing", group: "P", head: "post an ERA under 2.50 with a losing record", floor: `${GS}+ starts`,
      f: (r) => r.GS >= GS && r.ERA < 2.50 && r.L > r.W, mag: (r) => (r.L - r.W) - r.ERA,
      say: (r) => `${era2(r.ERA)} ERA, ${r.W}-${r.L}`, finder: null },
    ...(t.sv ? [{ key: "saves_bad_era", group: "P", head: `save ${t.sv} games with an ERA of ${era2(t.eraBad)} or worse`, floor: null,
      f: (r) => r.SV >= t.sv && r.ERA >= t.eraBad, mag: (r) => r.SV + r.ERA,
      say: (r) => `${r.SV} SV, ${era2(r.ERA)} ERA`, finder: { group: "pitching", qualifiers: "nomin", filters: [["SV", "gte", t.sv], ["ERA", "gte", t.eraBad]] } }] : []),
    { key: "workhorse_low_k", group: "P", head: `throw ${Math.floor(t.ipHuge / 3)} innings with ${t.kFewPit} strikeouts or fewer`, floor: null,
      f: (r) => r.OUTS >= t.ipHuge && r.SO <= t.kFewPit, mag: (r) => r.OUTS / 3 - r.SO,
      say: (r) => `${ipStr(r.OUTS)} IP, ${r.SO} K`, finder: { group: "pitching", qualifiers: "nomin", filters: [["IP", "gte", Math.floor(t.ipHuge / 3)], ["SO", "lte", t.kFewPit]] } },
    { key: "twenty_losses", group: "P", head: "lose 20 games", floor: null,
      f: (r) => r.L >= 20, mag: (r) => r.L,
      say: (r) => `${r.W}-${r.L}`, finder: { group: "pitching", qualifiers: "nomin", filters: [["L", "gte", 20]] } },
    { key: "twenty_twenty", group: "P", head: "win 20 and lose 15 in the same season", floor: null,
      f: (r) => r.W >= 20 && r.L >= 15, mag: (r) => r.W + r.L,
      say: (r) => `${r.W}-${r.L}`, finder: { group: "pitching", qualifiers: "nomin", filters: [["W", "gte", 20], ["L", "gte", 15]] } },
    { key: "cg_many", group: "P", head: `complete ${t.cgMany}+ games`, floor: null,
      f: (r) => r.CG >= t.cgMany, mag: (r) => r.CG,
      say: (r) => `${r.CG} CG`, finder: null },
    { key: "three_hundred_ip", group: "P", head: "throw 300 innings", floor: null,
      f: (r) => r.OUTS >= 900, mag: (r) => r.OUTS,
      say: (r) => `${ipStr(r.OUTS)} IP`, finder: { group: "pitching", qualifiers: "nomin", filters: [["IP", "gte", 300]] } },
    ...(t.kClose ? [{ key: "closer_100k", group: "P", head: `save 35 games and strike out ${t.kClose}`, floor: null,
      f: (r) => r.SV >= 35 && r.SO >= t.kClose, mag: (r) => r.SV + r.SO,
      say: (r) => `${r.SV} SV, ${r.SO} K in ${ipStr(r.OUTS)} IP`, finder: { group: "pitching", qualifiers: "nomin", filters: [["SV", "gte", 35], ["SO", "gte", t.kClose]] } }] : []),
    { key: "wins_over_walks", group: "P", head: "win 18 games with fewer walks than wins", floor: null,
      f: (r) => r.W >= 18 && r.BB < r.W, mag: (r) => r.W - r.BB,
      say: (r) => `${r.W} W, ${r.BB} BB`, finder: null },
    { key: "k300_no20", group: "P", head: "strike out 300 without winning 20", floor: null,
      f: (r) => r.SO >= 300 && r.W < 20, mag: (r) => r.SO - r.W,
      say: (r) => `${r.SO} K, ${r.W}-${r.L}`, finder: { group: "pitching", qualifiers: "nomin", filters: [["SO", "gte", 300], ["W", "lte", 19]] } },
    { key: "sub_two", group: "P", head: "post an ERA under 2.00", floor: "162+ IP",
      f: (r) => r.OUTS >= 486 && r.ERA < 2.00, mag: (r) => -r.ERA,
      say: (r) => `${era2(r.ERA)} ERA in ${ipStr(r.OUTS)} IP`, finder: { group: "pitching", qualifiers: "nomin", filters: [["IP", "gte", 162], ["ERA", "lte", 1.99]] } },
    { key: "shutouts", group: "P", head: "throw 8+ shutouts", floor: null,
      f: (r) => r.SHO >= 8, mag: (r) => r.SHO,
      say: (r) => `${r.SHO} SHO`, finder: null },
    { key: "hr_allowed_winner", group: "P", head: "allow 35+ homers and still win 15", floor: null,
      f: (r) => r.HRA >= 35 && r.W >= 15, mag: (r) => r.HRA + r.W,
      say: (r) => `${r.HRA} HR allowed, ${r.W}-${r.L}`, finder: null },
    { key: "walks_many", group: "P", head: "walk 130+ batters", floor: null,
      f: (r) => r.BB >= 130, mag: (r) => r.BB,
      say: (r) => `${r.BB} BB`, finder: { group: "pitching", qualifiers: "nomin", filters: [["BB", "gte", 130]] } },
    { key: "young_ace", group: "P", head: `win 18+ games at age ${t.ageYoung} or younger`, floor: null,
      f: (r) => r.age != null && r.age <= t.ageYoung && r.W >= 18, mag: (r) => r.W - r.age,
      say: (r) => `${r.W}-${r.L} at ${r.age}`, finder: { group: "pitching", qualifiers: "nomin", ageMax: t.ageYoung, filters: [["W", "gte", 18]] } },
    { key: "old_arm", group: "P", head: `win 15+ games at age ${t.ageOld + 1} or older`, floor: null,
      f: (r) => r.age != null && r.age >= t.ageOld + 1 && r.W >= 15, mag: (r) => r.W + r.age,
      say: (r) => `${r.W}-${r.L} at ${r.age}`, finder: { group: "pitching", qualifiers: "nomin", ageMin: t.ageOld + 1, filters: [["W", "gte", 15]] } },
    { key: "whip_under_1", group: "P", head: `post a WHIP of ${era2(t.whip1)} or lower`, floor: "162+ IP",
      f: (r) => r.OUTS >= 486 && r.WHIP <= t.whip1, mag: (r) => -r.WHIP,
      say: (r) => `${era2(r.WHIP)} WHIP in ${ipStr(r.OUTS)} IP`, finder: { group: "pitching", qualifiers: "nomin", filters: [["IP", "gte", 162], ["WHIP", "lte", t.whip1]] } },
    { key: "relief_wins", group: "P", head: "win 12+ games without a start", floor: null,
      f: (r) => r.GS === 0 && r.W >= 12, mag: (r) => r.W,
      say: (r) => `${r.W}-${r.L}, 0 GS`, finder: { group: "pitching", qualifiers: "nomin", filters: [["W", "gte", 12], ["GS", "lte", 0]] } },
    { key: "k_per_9", group: "P", head: `strike out ${t.kPer9}+ per nine innings`, floor: "162+ IP",
      f: (r) => r.OUTS >= 486 && r.K9 >= t.kPer9, mag: (r) => r.K9,
      say: (r) => `${r.K9.toFixed(1)} K/9, ${r.SO} K`, finder: { group: "pitching", qualifiers: "nomin", filters: [["IP", "gte", 162], ["SO9", "gte", t.kPer9]] } },
    ...(t.sv ? [{ key: "forty_saves", group: "P", head: "save 45 games", floor: null,
      f: (r) => r.SV >= 45, mag: (r) => r.SV,
      say: (r) => `${r.SV} SV`, finder: { group: "pitching", qualifiers: "nomin", filters: [["SV", "gte", 45]] } }] : []),
    { key: "twenty_five_wins", group: "P", head: "win 25 games", floor: null,
      f: (r) => r.W >= 25, mag: (r) => r.W,
      say: (r) => `${r.W}-${r.L}`, finder: { group: "pitching", qualifiers: "nomin", filters: [["W", "gte", 25]] } },
    { key: "no_walks_winner", group: "P", head: "win 15 games walking 30 batters or fewer", floor: null,
      f: (r) => r.W >= 15 && r.BB <= 30, mag: (r) => r.W - r.BB,
      say: (r) => `${r.W}-${r.L}, ${r.BB} BB`, finder: { group: "pitching", qualifiers: "nomin", filters: [["W", "gte", 15], ["BB", "lte", 30]] } },
    { key: "era_under_3_no_wins", group: "P", head: "post an ERA under 3.00 and win 7 or fewer", floor: "162+ IP",
      f: (r) => r.OUTS >= 486 && r.ERA < 3.00 && r.W <= 7, mag: (r) => -r.W - r.ERA,
      say: (r) => `${era2(r.ERA)} ERA, ${r.W}-${r.L}`, finder: { group: "pitching", qualifiers: "nomin", filters: [["IP", "gte", 162], ["ERA", "lte", 2.99], ["W", "lte", 7]] } },
  ];
}

// -------------------------------------------------------------- extremes --
// Most extreme single season among those clearing a base filter.
function extremes(t) {
  return [
    { key: "lowest_avg_100rbi", group: "H", text: (r) => `Lowest average by any 100-RBI hitter of the decade: ${r.name}, ${yr(r)} — ${avg3(r.AVG)} with ${r.RBI} RBI.`, base: (r) => r.RBI >= 100, pick: (r) => -r.AVG },
    { key: "most_k_300hitter", group: "H", text: (r) => `Most strikeouts by a .300 hitter of the decade: ${r.name}, ${yr(r)} — ${r.SO} K while batting ${avg3(r.AVG)}.`, base: (r) => r.AVG >= 0.300 && r.PA >= 500, pick: (r) => r.SO },
    { key: "most_sb_30hr", group: "H", text: (r) => `Most steals by a 30-homer hitter of the decade: ${r.name}, ${yr(r)} — ${r.SB} SB with ${r.HR} HR.`, base: (r) => r.HR >= 30, pick: (r) => r.SB },
    { key: "most_hr_low_rbi", group: "H", text: (r) => `Most home runs per RBI of the decade: ${r.name}, ${yr(r)} — ${r.HR} HR but only ${r.RBI} RBI.`, base: (r) => r.HR >= 25, pick: (r) => r.HR / Math.max(r.RBI, 1) },
    { key: "fewest_k_30hr", group: "H", text: (r) => `Fewest strikeouts by a ${t.hrBig}-homer hitter of the decade: ${r.name}, ${yr(r)} — ${r.SO} K with ${r.HR} HR.`, base: (r) => r.HR >= t.hrBig, pick: (r) => -r.SO },
    { key: "highest_avg_low_hr", group: "H", text: (r) => `Highest average by a hitter with 3 homers or fewer: ${r.name}, ${yr(r)} — ${avg3(r.AVG)} with ${r.HR} HR.`, base: (r) => r.PA >= 500 && r.HR <= 3, pick: (r) => r.AVG },
    { key: "most_bb_low_avg", group: "H", text: (r) => `Most walks by a sub-.240 hitter of the decade: ${r.name}, ${yr(r)} — ${r.BB} BB while batting ${avg3(r.AVG)}.`, base: (r) => r.PA >= 500 && r.AVG < 0.240, pick: (r) => r.BB },
    { key: "most_rbi_per_hr", group: "H", text: (r) => `Most RBI per home run among 100-RBI seasons: ${r.name}, ${yr(r)} — ${r.RBI} RBI on ${r.HR} HR.`, base: (r) => r.RBI >= 100 && r.HR > 0, pick: (r) => r.RBI / r.HR },
    { key: "most_wins_bad_era", group: "P", text: (r) => `Most wins by a pitcher with an ERA over 5.00: ${r.name}, ${yr(r)} — ${r.W}-${r.L} with a ${era2(r.ERA)} ERA.`, base: (r) => r.ERA > 5.00 && r.OUTS >= 300, pick: (r) => r.W },
    { key: "fewest_wins_low_era", group: "P", text: (r) => `Fewest wins by a qualified pitcher with an ERA under 3.00: ${r.name}, ${yr(r)} — ${r.W}-${r.L} despite a ${era2(r.ERA)} ERA.`, base: (r) => r.OUTS >= 486 && r.ERA < 3.00, pick: (r) => -r.W },
    { key: "most_k_losing", group: "P", text: (r) => `Most strikeouts by a pitcher with a losing record: ${r.name}, ${yr(r)} — ${r.SO} K, ${r.W}-${r.L}.`, base: (r) => r.L > r.W, pick: (r) => r.SO },
    { key: "most_losses_good_era", group: "P", text: (r) => `Most losses by a pitcher with an ERA under 3.50: ${r.name}, ${yr(r)} — ${r.W}-${r.L} with a ${era2(r.ERA)} ERA.`, base: (r) => r.ERA < 3.50 && r.OUTS >= 400, pick: (r) => r.L },
    { key: "fewest_k_20w", group: "P", text: (r) => `Fewest strikeouts by a 20-game winner of the decade: ${r.name}, ${yr(r)} — ${r.SO} K, ${r.W}-${r.L}.`, base: (r) => r.W >= 20, pick: (r) => -r.SO },
    { key: "most_ip_no_cg", group: "P", text: (r) => `Most innings in a season without a complete game: ${r.name}, ${yr(r)} — ${ipStr(r.OUTS)} IP, 0 CG.`, base: (r) => r.CG === 0, pick: (r) => r.OUTS },
    { key: "most_hra", group: "P", text: (r) => `Most home runs allowed in a season this decade: ${r.name}, ${yr(r)} — ${r.HRA} HR allowed, ${r.W}-${r.L}.`, base: (r) => r.HRA != null, pick: (r) => r.HRA },
    { key: "most_bb_winner", group: "P", text: (r) => `Most walks by a 15-game winner: ${r.name}, ${yr(r)} — ${r.BB} BB, ${r.W}-${r.L}.`, base: (r) => r.W >= 15, pick: (r) => r.BB },
  ];
}

// ------------------------------------------------------------- near-miss --
const NEAR = [
  { group: "H", key: "HR29", f: (r) => r.HR === 29, what: "exactly 29 home runs", one: "one short of 30" },
  { group: "H", key: "AVG299", f: (r) => r.PA >= 500 && Math.round(r.AVG * 1000) === 299, what: "a .299 average", one: "one point short of .300" },
  { group: "H", key: "RBI99", f: (r) => r.RBI === 99, what: "exactly 99 RBI", one: "one short of 100" },
  { group: "H", key: "H199", f: (r) => r.H === 199, what: "exactly 199 hits", one: "one short of 200" },
  { group: "H", key: "SB49", f: (r) => r.SB === 49, what: "exactly 49 steals", one: "one short of 50" },
  { group: "P", key: "W19", f: (r) => r.W === 19, what: "exactly 19 wins", one: "one short of 20" },
  { group: "P", key: "K199", f: (r) => r.SO === 199, what: "exactly 199 strikeouts", one: "one short of 200" },
  { group: "P", key: "SV39", f: (r) => r.SV === 39, what: "exactly 39 saves", one: "one short of 40" },
];

// --------------------------------------------------------------- streaks --
const STREAKS = [
  { group: "H", key: "HR30", bar: (t) => t.hrBig, val: (r) => r.HR, what: (b) => `hit ${b}+ home runs` },
  { group: "H", key: "H200", bar: () => 200, val: (r) => r.H, what: () => "collected 200+ hits" },
  { group: "H", key: "RBI100", bar: () => 100, val: (r) => r.RBI, what: () => "drove in 100+ runs" },
  { group: "H", key: "SB40", bar: (t) => t.sbMany, val: (r) => r.SB, what: (b) => `stole ${b}+ bases` },
  { group: "H", key: "BB100", bar: () => 100, val: (r) => r.BB, what: () => "drew 100+ walks" },
  { group: "H", key: "AVG300", bar: () => 0.300, val: (r) => (r.PA >= 500 ? r.AVG : 0), what: () => "batted .300 or better (500+ PA)" },
  { group: "P", key: "W20", bar: () => 20, val: (r) => r.W, what: () => "won 20 games" },
  { group: "P", key: "K200", bar: (t) => t.kMany, val: (r) => r.SO, what: (b) => `struck out ${b}+` },
  { group: "P", key: "IP250", bar: () => 750, val: (r) => r.OUTS, what: () => "threw 250+ innings" },
  { group: "P", key: "SV30", bar: (t) => t.sv || 999, val: (r) => r.SV, what: (b) => `saved ${b}+ games` },
];

// -------------------------------------------------------------- helpers --
const team = (r) => r.teams > 1 ? "2+ teams" : r.team;
function listNames(rows, say) { return rows.map((r) => `${r.name} (${yr(r)}, ${say(r)})`).join("; "); }

function ruleFacts(rows, rules, decade, t) {
  const out = [];
  for (const rule of rules) {
    const m = rows.filter(rule.f);
    if (!m.length) continue;
    const sorted = [...m].sort((a, b) => rule.mag(b) - rule.mag(a));
    // Count PLAYERS, not player-seasons. A man who did it twice is still the
    // only man who did it, and saying "only two ... Randy Johnson, Randy
    // Johnson" is both wrong and embarrassing.
    const byPlayer = new Map();
    for (const r of sorted) { if (!byPlayer.has(r.id)) byPlayer.set(r.id, []); byPlayer.get(r.id).push(r); }
    const players = [...byPlayer.values()]; // each: seasons sorted by magnitude
    const floor = rule.floor ? ` (${rule.floor})` : "";
    const who = rule.group === "H" ? "hitter" : "pitcher";
    const finder = rule.finder ? { ...rule.finder, seasonMin: decade, seasonMax: decade + 9 } : null;
    const line = (rs) => rs.length === 1
      ? `${rs[0].name} (${yr(rs[0])}: ${rule.say(rs[0])})`
      : `${rs[0].name} (${rs.length} times; ${rs.map((r) => `${yr(r)}: ${rule.say(r)}`).join(", ")})`;
    const base = { rule: rule.key, group: rule.group, decade, finder, evidence: sorted.slice(0, players.length <= 4 ? 12 : 6).map(ev), seasonsMatched: m.length };
    if (players.length === 1) {
      const rs = players[0]; const r = rs[0];
      out.push({ ...base, kind: "only", score: 10 + bonus(rule, r), players: [pid(r)], seasons: rs.map(yr),
        text: rs.length === 1
          ? `The only ${who} of the ${decade}s to ${rule.head}${floor}: ${r.name}, ${yr(r)} — ${rule.say(r)}.`
          : `The only ${who} of the ${decade}s to ${rule.head}${floor} was ${r.name} — and he did it ${rs.length === 2 ? "twice" : `${rs.length} times`} (${rs.map((x) => `${yr(x)}: ${rule.say(x)}`).join("; ")}).` });
    } else if (players.length === 2) {
      out.push({ ...base, kind: "pair", score: 8 + bonus(rule, sorted[0]), players: players.map((rs) => pid(rs[0])), seasons: sorted.map(yr),
        text: `Only two ${who}s of the ${decade}s ${verb(rule.head)}${floor}: ${players.map(line).join("; ")}.` });
    } else if (players.length <= 4) {
      out.push({ ...base, kind: "few", score: 6 + bonus(rule, sorted[0]), players: players.map((rs) => pid(rs[0])), seasons: sorted.map(yr),
        text: `Just ${["", "", "", "three", "four"][players.length]} ${who}s of the ${decade}s ${verb(rule.head)}${floor}: ${players.map(line).join("; ")}.` });
    } else {
      const r = sorted[0];
      out.push({ ...base, kind: "list", score: 3 + bonus(rule, r), players: [pid(r)], seasons: [yr(r)],
        text: `${players.length} ${who}s ${verb(rule.head)}${floor} in the ${decade}s${m.length > players.length ? ` (${m.length} seasons)` : ""}. The most extreme: ${r.name}, ${yr(r)} — ${rule.say(r)}.` });
    }
  }
  return out;
}
function verb(head) { return head.replace(/\b(hit|bat|steal|drive|collect|post|draw|play|go|get|strike|throw|win|lose|complete|save|allow|walk|ground|score|finish|reach)\b(?! (?:homers|runs|hits|games|bases|walks|innings|batters|saves|doubles|triples|pitches|steals|times|by))/g, (v) => PAST[v] || v); }
function bonus(rule, r) { const m = rule.mag(r); return Number.isFinite(m) ? Math.min(3, Math.abs(m) / 40) : 0; }
const pid = (r) => ({ id: r.id, name: r.name });
function ev(r) {
  const base = { season: r.season, id: r.id, name: r.name, team: team(r), age: r.age };
  return r.OUTS != null ? { ...base, W: r.W, L: r.L, ERA: r.ERA, IP: ipStr(r.OUTS), SO: r.SO, BB: r.BB, SV: r.SV, GS: r.GS, CG: r.CG, SHO: r.SHO, HRA: r.HRA, WHIP: r.WHIP }
                        : { ...base, PA: r.PA, AVG: r.AVG, OBP: r.OBP, SLG: r.SLG, OPS: r.OPS, HR: r.HR, RBI: r.RBI, R: r.R, H: r.H, "2B": r["2B"], "3B": r["3B"], SB: r.SB, CS: r.CS, BB: r.BB, SO: r.SO, HBP: r.HBP, GIDP: r.GIDP };
}

function extremeFacts(rows, exs, decade) {
  const out = [];
  for (const x of exs) {
    const m = rows.filter(x.base);
    if (m.length < 3) continue; // "most among three" is not a fact worth posting
    const r = [...m].sort((a, b) => x.pick(b) - x.pick(a))[0];
    out.push({ kind: "extreme", rule: x.key, group: x.group, decade, score: 6, players: [pid(r)], seasons: [yr(r)], finder: null,
      evidence: [ev(r)], among: m.length, text: x.text(r).replace(/of the decade/, `of the ${decade}s`) });
  }
  return out;
}

function nearMissFacts(hit, pit, decade) {
  const out = [];
  for (const nm of NEAR) {
    const rows = (nm.group === "H" ? hit : pit).filter(nm.f);
    if (!rows.length) continue;
    const who = nm.group === "H" ? "hitter" : "pitcher";
    const sorted = [...rows].sort((a, b) => (b.PA || b.OUTS || 0) - (a.PA || a.OUTS || 0));
    const named = sorted.slice(0, 3).map((r) => `${r.name} (${yr(r)})`).join(", ");
    const text = rows.length === 1
      ? `Exactly one ${who} of the ${decade}s finished a season with ${nm.what}, ${nm.one}: ${named}.`
      : `${rows.length} ${who}-seasons of the ${decade}s ended on ${nm.what}, ${nm.one} — among them ${named}.`;
    out.push({ kind: "nearmiss", rule: nm.key, group: nm.group, decade, score: 4 + Math.min(2, rows.length / 4), players: sorted.slice(0, 3).map(pid), seasons: sorted.slice(0, 3).map(yr), finder: null, evidence: sorted.slice(0, 6).map(ev), text });
  }
  return out;
}

function streakFacts(hit, pit, decade, t) {
  const out = [];
  for (const s of STREAKS) {
    const bar = s.bar(t); if (bar === 999) continue;
    const rows = s.group === "H" ? hit : pit;
    const byPlayer = new Map();
    for (const r of rows) { if (!byPlayer.has(r.id)) byPlayer.set(r.id, []); byPlayer.get(r.id).push(r); }
    let best = null;
    for (const [, seasons] of byPlayer) {
      const ok = new Set(seasons.filter((r) => s.val(r) >= bar).map(yr));
      let run = 0, runStart = null, bestRun = 0, bestStart = null;
      for (let y = decade; y < decade + 10; y += 1) {
        if (ok.has(y)) { if (!run) runStart = y; run += 1; if (run > bestRun) { bestRun = run; bestStart = runStart; } }
        else run = 0;
      }
      if (bestRun >= 4 && (!best || bestRun > best.run)) best = { run: bestRun, start: bestStart, rows: seasons.filter((r) => yr(r) >= bestStart && yr(r) < bestStart + bestRun).sort((a, b) => yr(a) - yr(b)) };
    }
    if (!best) continue;
    const r = best.rows[0];
    const what = s.what(bar);
    out.push({ kind: "streak", rule: s.key, group: s.group, decade, score: 5 + Math.min(4, best.run - 3), players: [pid(r)], seasons: best.rows.map(yr), finder: null, evidence: best.rows.map(ev),
      text: `${r.name} ${what} in ${best.run} straight seasons (${best.start}-${String(best.start + best.run - 1).slice(2)}), the longest run of the ${decade}s.` });
  }
  return out;
}

function teammateFacts(hit, pit, decade, t) {
  const out = [];
  const specs = [
    { group: "H", key: "hr_pair", rows: hit, val: (r) => r.HR, bar: t.hrTeam, need: 2, what: (b) => `${b}+ home runs` },
    { group: "H", key: "rbi_trio", rows: hit, val: (r) => r.RBI, bar: 100, need: 3, what: () => "100+ RBI" },
    { group: "H", key: "hits_pair", rows: hit, val: (r) => r.H, bar: 200, need: 2, what: () => "200+ hits" },
    { group: "H", key: "sb_pair", rows: hit, val: (r) => r.SB, bar: t.sbMany, need: 2, what: (b) => `${b}+ steals` },
    { group: "P", key: "w20_pair", rows: pit, val: (r) => r.W, bar: 20, need: 2, what: () => "20 wins" },
    { group: "P", key: "k200_pair", rows: pit, val: (r) => r.SO, bar: t.kMany, need: 2, what: (b) => `${b}+ strikeouts` },
  ];
  for (const s of specs) {
    const groups = new Map();
    for (const r of s.rows) { if (r.teams > 1 || !r.teamId || s.val(r) < s.bar) continue; const k = `${yr(r)}|${r.teamId}`; if (!groups.has(k)) groups.set(k, []); groups.get(k).push(r); }
    const hits = [...groups.values()].filter((g) => g.length >= s.need).map((g) => g.sort((a, b) => s.val(b) - s.val(a)));
    if (!hits.length) continue;
    hits.sort((a, b) => b.reduce((x, r) => x + s.val(r), 0) - a.reduce((x, r) => x + s.val(r), 0));
    const g = hits[0]; const r0 = g[0];
    const names = g.slice(0, 3).map((r) => `${r.name} ${s.val(r)}`).join(", ");
    const text = hits.length === 1
      ? `The ${yr(r0)} ${r0.team} are the only team of the ${decade}s with ${s.need === 3 ? "three" : "two"} players at ${s.what(s.bar)}: ${names}.`
      : `${hits.length} teams of the ${decade}s had ${s.need === 3 ? "three" : "two"} players at ${s.what(s.bar)}; the biggest pairing was the ${yr(r0)} ${r0.team} — ${names}.`;
    out.push({ kind: "teammates", rule: s.key, group: s.group, decade, score: hits.length === 1 ? 8 : 5, players: g.slice(0, 3).map(pid), seasons: [yr(r0)], finder: null, evidence: g.slice(0, 3).map(ev), text });
  }
  return out;
}

function totalFacts(hit, pit, seasons, decade, t) {
  const out = [];
  const sum = (rows, keys) => {
    const acc = new Map();
    for (const r of rows) { const a = acc.get(r.id) || { id: r.id, name: r.name, n: 0 }; for (const k of keys) a[k] = (a[k] || 0) + n(r[k]); a.n += 1; acc.set(r.id, a); }
    return [...acc.values()];
  };
  const H = sum(hit, ["HR", "H", "RBI", "SB", "R", "BB", "SO", "2B", "3B", "PA"]);
  const P = sum(pit, ["W", "L", "SO", "SV", "SHO", "CG", "OUTS", "BB"]);
  const top = (arr, k) => [...arr].sort((a, b) => b[k] - a[k]);
  // Who led the league in HR each season, to find the best total by someone who never did.
  const hrLeaders = new Set();
  for (const s of seasons) { const yrRows = hit.filter((r) => yr(r) === s.season); if (!yrRows.length) continue; const mx = Math.max(...yrRows.map((r) => r.HR)); for (const r of yrRows) if (r.HR === mx) hrLeaders.add(r.id); }
  const noLead = top(H.filter((a) => !hrLeaders.has(a.id)), "HR")[0];
  const push = (key, group, text, a) => out.push({ kind: "total", rule: key, group, decade, score: 5, players: [{ id: a.id, name: a.name }], seasons: [], finder: null, evidence: [a], text });
  const h1 = top(H, "HR")[0]; push("dec_hr", "H", `Most home runs of the ${decade}s: ${h1.name}, ${h1.HR} across ${h1.n} seasons.`, h1);
  if (noLead) push("dec_hr_nolead", "H", `Most home runs in the ${decade}s by a hitter who never led the majors in a season: ${noLead.name}, ${noLead.HR}.`, noLead);
  const h2 = top(H, "H")[0]; push("dec_hits", "H", `Most hits of the ${decade}s: ${h2.name}, ${h2.H}.`, h2);
  const h3 = top(H, "SB")[0]; push("dec_sb", "H", `Most stolen bases of the ${decade}s: ${h3.name}, ${h3.SB}.`, h3);
  const h4 = top(H, "SO")[0]; push("dec_k_hit", "H", `Most strikeouts by a hitter in the ${decade}s: ${h4.name}, ${h4.SO}.`, h4);
  const h5 = top(H, "BB")[0]; push("dec_bb", "H", `Most walks of the ${decade}s: ${h5.name}, ${h5.BB}.`, h5);
  const h6 = top(H, "3B")[0]; push("dec_3b", "H", `Most triples of the ${decade}s: ${h6.name}, ${h6["3B"]}.`, h6);
  const h7 = top(H, "RBI")[0]; push("dec_rbi", "H", `Most RBI of the ${decade}s: ${h7.name}, ${h7.RBI}.`, h7);
  const p1 = top(P, "W")[0]; push("dec_w", "P", `Most wins of the ${decade}s: ${p1.name}, ${p1.W}.`, p1);
  const p2 = top(P, "L")[0]; push("dec_l", "P", `Most losses of the ${decade}s: ${p2.name}, ${p2.L} — and ${p2.W} wins.`, p2);
  const p3 = top(P, "SO")[0]; push("dec_k", "P", `Most strikeouts of the ${decade}s: ${p3.name}, ${p3.SO}.`, p3);
  const p4 = top(P, "CG")[0]; if (p4.CG >= 20) push("dec_cg", "P", `Most complete games of the ${decade}s: ${p4.name}, ${p4.CG}.`, p4);
  if (t.sv) { const p5 = top(P, "SV")[0]; push("dec_sv", "P", `Most saves of the ${decade}s: ${p5.name}, ${p5.SV}.`, p5); }
  const p6 = top(P, "BB")[0]; push("dec_bb_pit", "P", `Most walks issued in the ${decade}s: ${p6.name}, ${p6.BB}.`, p6);
  const p7 = top(P, "OUTS")[0]; push("dec_ip", "P", `Most innings of the ${decade}s: ${p7.name}, ${Math.floor(p7.OUTS / 3)}.`, p7);
  return out;
}

// How many hitters/pitchers cleared a bar each season, and which season had
// the most and fewest. "1968 had four .300 hitters" is a post on its own.
function seasonCountFacts(hit, pit, seasons, decade, t) {
  const out = [];
  const specs = [
    { group: "H", key: "n_30hr", rows: hit, f: (r) => r.HR >= t.hrBig, what: `${t.hrBig}-homer hitters` },
    { group: "H", key: "n_300", rows: hit, f: (r) => r.PA >= 500 && r.AVG >= 0.300, what: ".300 hitters (500+ PA)" },
    { group: "H", key: "n_100rbi", rows: hit, f: (r) => r.RBI >= 100, what: "100-RBI hitters" },
    { group: "H", key: "n_sb", rows: hit, f: (r) => r.SB >= t.sbMany, what: `${t.sbMany}-steal players` },
    { group: "H", key: "n_200h", rows: hit, f: (r) => r.H >= 200, what: "200-hit seasons" },
    { group: "P", key: "n_20w", rows: pit, f: (r) => r.W >= 20, what: "20-game winners" },
    { group: "P", key: "n_k", rows: pit, f: (r) => r.SO >= t.kMany, what: `${t.kMany}-strikeout pitchers` },
    { group: "P", key: "n_sub3", rows: pit, f: (r) => r.OUTS >= 486 && r.ERA < 3.00, what: "qualified sub-3.00 ERAs" },
    ...(t.sv ? [{ group: "P", key: "n_sv", rows: pit, f: (r) => r.SV >= t.sv, what: `${t.sv}-save closers` }] : []),
  ];
  for (const sp of specs) {
    const counts = seasons.map((s) => ({ season: s.season, n: sp.rows.filter((r) => yr(r) === s.season && sp.f(r)).length }));
    const most = [...counts].sort((a, b) => b.n - a.n)[0]; const least = [...counts].sort((a, b) => a.n - b.n)[0];
    if (!most || most.n === least.n) continue;
    const ev = counts.map((c) => ({ season: c.season, count: c.n }));
    out.push({ kind: "season", rule: `${sp.key}_most`, group: sp.group, decade, score: 5, players: [], seasons: [most.season], finder: null, evidence: ev,
      text: `${most.season} had ${most.n} ${sp.what}, the most of any season in the ${decade}s.` });
    out.push({ kind: "season", rule: `${sp.key}_least`, group: sp.group, decade, score: 5, players: [], seasons: [least.season], finder: null, evidence: ev,
      text: least.n === 0 ? `${least.season} had no ${sp.what} at all — the only season of the ${decade}s without one.`.replace("the only season", counts.filter((c) => c.n === 0).length === 1 ? "the only season" : "one of the seasons")
                          : `${least.season} had just ${least.n} ${sp.what}, the fewest of any season in the ${decade}s.` });
  }
  return out;
}

// Youngest and oldest to clear a bar in the decade.
function ageFacts(hit, pit, decade, t) {
  const out = [];
  const specs = [
    { group: "H", key: "age_30hr", rows: hit, f: (r) => r.HR >= t.hrBig, say: (r) => `${r.HR} HR`, what: `hit ${t.hrBig} home runs` },
    { group: "H", key: "age_330", rows: hit, f: (r) => r.PA >= 500 && r.AVG >= 0.330, say: (r) => avg3(r.AVG), what: "bat .330 (500+ PA)" },
    { group: "H", key: "age_100rbi", rows: hit, f: (r) => r.RBI >= 100, say: (r) => `${r.RBI} RBI`, what: "drive in 100 runs" },
    { group: "H", key: "age_sb", rows: hit, f: (r) => r.SB >= t.sbMany, say: (r) => `${r.SB} SB`, what: `steal ${t.sbMany} bases` },
    { group: "P", key: "age_20w", rows: pit, f: (r) => r.W >= 20, say: (r) => `${r.W}-${r.L}`, what: "win 20 games" },
    { group: "P", key: "age_k", rows: pit, f: (r) => r.SO >= t.kMany, say: (r) => `${r.SO} K`, what: `strike out ${t.kMany}` },
    { group: "P", key: "age_era", rows: pit, f: (r) => r.OUTS >= 486 && r.ERA < 2.75, say: (r) => `${era2(r.ERA)} ERA`, what: "post a qualified ERA under 2.75" },
  ];
  for (const sp of specs) {
    const m = sp.rows.filter((r) => sp.f(r) && r.age != null);
    if (m.length < 3) continue;
    const young = [...m].sort((a, b) => a.age - b.age || yr(a) - yr(b))[0];
    const old = [...m].sort((a, b) => b.age - a.age || yr(a) - yr(b))[0];
    if (young.id === old.id) continue;
    out.push({ kind: "age", rule: `${sp.key}_young`, group: sp.group, decade, score: 5.5, players: [pid(young)], seasons: [yr(young)], finder: null, evidence: [ev(young)],
      text: `Youngest player of the ${decade}s to ${sp.what}: ${young.name}, age ${young.age} in ${yr(young)} — ${sp.say(young)}.` });
    out.push({ kind: "age", rule: `${sp.key}_old`, group: sp.group, decade, score: 5.5, players: [pid(old)], seasons: [yr(old)], finder: null, evidence: [ev(old)],
      text: `Oldest player of the ${decade}s to ${sp.what}: ${old.name}, age ${old.age} in ${yr(old)} — ${sp.say(old)}.` });
  }
  return out;
}

function teamFacts(seasons, decade) {
  const out = [];
  const all = [];
  for (const s of seasons) for (const tr of s.standings || []) all.push({ ...tr, season: s.season });
  if (!all.length) return out;
  const hundredW = all.filter((x) => x.wins >= 100).sort((a, b) => b.wins - a.wins);
  const hundredL = all.filter((x) => x.losses >= 100).sort((a, b) => b.losses - a.losses);
  const bestDiff = [...all].sort((a, b) => (b.runDifferential || 0) - (a.runDifferential || 0))[0];
  const worstDiff = [...all].sort((a, b) => (a.runDifferential || 0) - (b.runDifferential || 0))[0];
  const T = (x) => `${x.season} ${x.name}`;
  if (hundredW.length) out.push({ kind: "team", rule: "100w", group: "T", decade, score: 6, players: [], seasons: [hundredW[0].season], finder: null, evidence: hundredW.slice(0, 6),
    text: hundredW.length === 1 ? `Only one team of the ${decade}s won 100 games: the ${T(hundredW[0])}, ${hundredW[0].wins}-${hundredW[0].losses}.` : `${hundredW.length} teams of the ${decade}s won 100 games; the best record was the ${T(hundredW[0])} at ${hundredW[0].wins}-${hundredW[0].losses}.` });
  if (hundredL.length) out.push({ kind: "team", rule: "100l", group: "T", decade, score: 5, players: [], seasons: [hundredL[0].season], finder: null, evidence: hundredL.slice(0, 6),
    text: hundredL.length === 1 ? `Only one team of the ${decade}s lost 100 games: the ${T(hundredL[0])}, ${hundredL[0].wins}-${hundredL[0].losses}.` : `${hundredL.length} teams of the ${decade}s lost 100 games; the worst was the ${T(hundredL[0])} at ${hundredL[0].wins}-${hundredL[0].losses}.` });
  if (bestDiff && bestDiff.runDifferential != null) out.push({ kind: "team", rule: "best_diff", group: "T", decade, score: 5, players: [], seasons: [bestDiff.season], finder: null, evidence: [bestDiff],
    text: `Best run differential of the ${decade}s: the ${T(bestDiff)}, +${bestDiff.runDifferential} (${bestDiff.runsScored} scored, ${bestDiff.runsAllowed} allowed).` });
  if (worstDiff && worstDiff.runDifferential != null) out.push({ kind: "team", rule: "worst_diff", group: "T", decade, score: 4, players: [], seasons: [worstDiff.season], finder: null, evidence: [worstDiff],
    text: `Worst run differential of the ${decade}s: the ${T(worstDiff)}, ${worstDiff.runDifferential} (${worstDiff.runsScored} scored, ${worstDiff.runsAllowed} allowed).` });
  // A batting champion on a last-place team, or a 20-game winner on a 100-loss team, are reliable posts.
  return out;
}

// ------------------------------------------------------------- selection --
function select(cands, want) {
  const sorted = [...cands].sort((a, b) => b.score - a.score);
  const perPlayer = new Map(); const perRule = new Map(); const perKind = new Map();
  const out = [];
  const cap = { player: 3, rule: 3, list: 22, nearmiss: 8, total: 14, team: 4, season: 14, age: 14 };
  for (const f of sorted) {
    if (out.length >= want) break;
    if ((perRule.get(f.rule) || 0) >= cap.rule) continue;
    if (cap[f.kind] != null && (perKind.get(f.kind) || 0) >= cap[f.kind]) continue;
    if (f.players.some((p) => (perPlayer.get(p.id) || 0) >= cap.player)) continue;
    out.push(f);
    perRule.set(f.rule, (perRule.get(f.rule) || 0) + 1); perKind.set(f.kind, (perKind.get(f.kind) || 0) + 1);
    for (const p of f.players) perPlayer.set(p.id, (perPlayer.get(p.id) || 0) + 1);
  }
  // Order for the page: hitting and pitching interleaved by score, so the top
  // of the page is not all one thing.
  return out.sort((a, b) => b.score - a.score).map((f, i) => ({ n: i + 1, ...f }));
}

function buildFacts({ decade, seasons }) {
  const t = T[era(decade)];
  const hit = [], pit = [];
  for (const s of seasons) { for (const r of s.hitters) hit.push({ ...r, season: s.season }); for (const r of s.pitchers) pit.push({ ...r, season: s.season }); }
  const cands = [
    ...ruleFacts(hit, hitRules(t), decade, t),
    ...ruleFacts(pit, pitRules(t), decade, t),
    ...extremeFacts(hit, extremes(t).filter((x) => x.group === "H"), decade),
    ...extremeFacts(pit, extremes(t).filter((x) => x.group === "P"), decade),
    ...nearMissFacts(hit, pit, decade),
    ...streakFacts(hit, pit, decade, t),
    ...teammateFacts(hit, pit, decade, t),
    ...totalFacts(hit, pit, seasons, decade, t),
    ...seasonCountFacts(hit, pit, seasons, decade, t),
    ...ageFacts(hit, pit, decade, t),
    ...teamFacts(seasons, decade),
  ];
  const facts = select(cands, 100);
  return { decade: `${decade}s`, era: era(decade), thresholds: t, candidates: cands.length, facts,
    counts: { hitterSeasons: hit.length, pitcherSeasons: pit.length },
    method: [
      "Every fact is a predicate evaluated over every hitter-season and pitcher-season in the decade, pulled in full from the MLB Stats API (the official record). Nothing is recalled or estimated; the rows that satisfy each rule are stored with it.",
      "'Only', 'two' and 'three/four' claims are exact counts across the complete pull. Where a rule uses a plate-appearance or innings floor instead of a league qualification bar, the floor is stated in the fact so the claim is reproducible.",
      "Thresholds are era-aware (strikeouts, saves and home runs meant different things in 1925 and 1995) and are recorded in the file.",
      "Rules built from plain comparisons carry a Stathead Season Finder spec with the same filters and year range, for independent re-checking on the subscription.",
    ] };
}

module.exports = { buildFacts, T, era };
