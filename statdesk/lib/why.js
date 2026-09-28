// "Why post" notes for rule-generated facts: the kind of line (a club of
// one, a two-name debate, a near miss...) plus the angle its rule captures.
// Editorial only: a note never adds a number that is not in the line.
"use strict";

const ANGLE = {
  // football, passing
  td_hi: "Touchdown-pass seasons are the quarterback currency every fan base argues over.",
  yds_hi: "Passing volume invites then-vs-now arguments about how the game changed.",
  int_hi: "Turnover-heavy seasons are the most shared kind of chaos stat.",
  int_low: "Ball security at volume is the quiet case for an underrated passer.",
  td_int: "The boom-or-bust gunslinger season: fans split on whether it was great or reckless.",
  yds_lowtd: "Lots of yards, few scores: a debate starter about empty production.",
  cmp_hi: "Accuracy stats let older passers be compared with modern ones.",
  rate_hi: "Efficiency is the stat analytics-minded fans quote most.",
  ypa_hi: "Yards per attempt is the deep-ball efficiency number fans love.",
  sacked: "Sacks taken shows who got hit, a sympathy and blame angle at once.",
  qb_rush: "Dual-threat quarterbacks are an evergreen debate.",
  qb_rtd: "Quarterbacks scoring with their legs always gets a reaction.",
  games_td: "Big numbers in few games make a what-if post.",
  qb_w: "Wins as a starter feeds the \"QB wins\" argument, for and against.",
  comebacks: "Comebacks are the clutch stat fans quote in arguments.",
  int_pct: "Interception rate exposes a turnover problem better than raw totals.",
  td_pct: "Touchdown rate rewards efficiency over volume.",
  pypg: "Per-game passing volume invites comparisons across eras.",
  old_py: "Longevity at quarterback is rare and always shared.",
  yng_td: "A young quarterback producing right away is prodigy content.",
  fr_td: "Freshman quarterback production is recruiting-class bragging material.",
  // football, rushing and receiving
  ry_hi: "Workhorse-back seasons are nostalgia content for a position that changed.",
  rtd_hi: "Goal-line dominance is easy to picture and easy to share.",
  car_hi: "Carries show a workload that barely exists anymore.",
  ypc_hi: "Big-play running efficiency starts debates about who was really best.",
  ry_slow: "A thousand yards the hard way; debate bait about volume vs. efficiency.",
  rb_rec: "Pass-catching backs were ahead of their time; fans love the forerunners.",
  scrim_hi: "Scrimmage yards credit the do-everything back.",
  alltd_hi: "Touchdown totals are the simplest scoring stat to share.",
  rec_hi: "Catch totals put possession receivers in the spotlight.",
  recy_hi: "Receiving yardage seasons anchor every receiver ranking.",
  rectd_hi: "Touchdown catches are the red-zone threat stat.",
  ypr_hi: "Yards per catch marks the true deep threats.",
  rec_short: "Lots of catches, few yards: a possession-receiver oddity.",
  recy_few: "Big yardage on few catches is the definition of a big-play receiver.",
  te_1000: "Tight end production stands out when the position is compared across eras.",
  rypg: "Per-game rushing puts short seasons on equal footing.",
  recypg: "Per-game receiving puts short seasons on equal footing.",
  games_ry: "A big season in few games makes a what-if post.",
  old_ry: "Running backs age fast; one producing late is rare and shareable.",
  old_rec: "Late-career production is longevity content that travels.",
  yng_ry: "A young back producing right away is prodigy content.",
  yng_recy: "A young receiver producing right away is prodigy content.",
  fr_ry: "Freshman production is recruiting-class bragging material.",
  fr_recy: "Freshman production is recruiting-class bragging material.",
  rtd_rec: "Scoring volume plus efficiency is the complete-back case.",
  tot_hi: "Total offense crowns the do-it-all college quarterback.",
  apy_hi: "All-purpose yards credit the players who did everything.",
  ret_yds: "Return yards give special teams players rare credit.",
  // football, defense and special teams
  dint_hi: "Ball-hawk seasons are the defensive-back debate starter.",
  old_dint: "A veteran defensive back still producing is longevity content.",
  fr_int: "A freshman ball-hawk is recruiting bragging material.",
  int_td: "Pick-sixes are the most exciting defensive play; totals get shared.",
  int_yds: "Interception return yards show the playmakers, not just the catchers.",
  sacks_hi: "Pass-rush seasons are what defensive fans quote first.",
  yng_sacks: "A young pass rusher producing right away is prodigy content.",
  tkl_hi: "Tackle totals put linebackers in the spotlight.",
  tfl_hi: "Tackles for loss show disruption behind the line.",
  ff_hi: "Forced fumbles are the turnover-creating stat defenses brag about.",
  fumrec_hi: "Fumble recoveries reward being around the ball.",
  fumbles_hi: "Ball-security failures are the stats fan bases never forget.",
  safety: "Safeties are the rarest score; multiple in a season is trivia gold.",
  fgm_hi: "Kicker content is underserved and gets outsized engagement.",
  fg_perfect: "Perfection is the easiest thing in sports to share.",
  xpm_hi: "Extra-point totals show how often an offense scored.",
  pts_hi: "Scoring totals are universal; no explanation needed.",
  kr_td: "Return touchdowns are highlight-reel plays; multiples in a year are rare.",
  pr_td: "Return touchdowns are highlight-reel plays; multiples in a year are rare.",
  kr_avg: "Return average shows the players who flipped field position.",
  pr_avg: "Return average shows the players who flipped field position.",
  punt_avg: "Punter content gets surprising engagement; fans love a big leg.",
  // football, team seasons
  perfect: "Perfect seasons are the ultimate bragging right for a program.",
  unbeaten_tie: "Unbeaten but tied: an old-era oddity modern fans find strange.",
  unscored: "A season without allowing a point sounds impossible; that is the post.",
  stingy: "Defensive dominance measured the simplest way possible.",
  diff_hi: "Margin of victory is the cleanest measure of dominance.",
  winless: "Futility stats are among the most shared in sports.",
  pts_low: "Futility stats are among the most shared in sports.",
  diff_low: "Blowout futility makes rival fan bases pile on.",
  opp_hi: "Porous defenses make for rival-fan dunking.",
  ties: "Ties are a vanished part of the sport; old-era oddities intrigue modern fans.",
  wins10: "Win totals are the first thing fans cite for a program's golden age.",
  wins_hi: "Win totals are the first thing fans cite for a program's golden age.",
  loss_hi: "Losing seasons are what rival fans remember best.",
  rush_hi: "Team rushing yardage recalls the option and power-run eras.",
  pass_hi: "Team passing yardage recalls the air-raid revolution.",
  to_opp: "Takeaways are the stat defenses brag about.",
  to_low: "Ball security as a team shows a disciplined program.",
  // basketball
  ppg_hi: "Scoring averages are the most-quoted stat in the sport.",
  ppg30: "Thirty a game is the scorer's magic number.",
  rpg_hi: "Rebounding numbers from past eras astonish modern fans.",
  rpg25: "Rebounding numbers from past eras astonish modern fans.",
  dbl_big: "Big double-double seasons define the dominant big man.",
  ft_hi: "Free-throw volume shows who lived at the line.",
  fta_hi: "Free-throw volume shows who lived at the line.",
  ftp_hi: "Free-throw accuracy is the shooter's purest stat.",
  fgp_hi: "Field-goal accuracy at volume is efficiency fans respect.",
  fga_hi: "Shot volume invites the gunner debate.",
  trb_hi: "Rebounding totals from past eras astonish modern fans.",
  apg_hi: "Assist averages crown the true point guards.",
  ast_hi: "Assist totals crown the true point guards.",
  spg_hi: "Steals are the defensive highlight stat.",
  stl_hi: "Steals are the defensive highlight stat.",
  bpg_hi: "Shot-blocking seasons are rim-protector content fans love.",
  blk_hi: "Shot-blocking seasons are rim-protector content fans love.",
  fg3_hi: "Three-point volume is the modern game's signature.",
  fg3p_hi: "Three-point accuracy at volume is the shooter's badge.",
  fr_fg3: "A freshman shooter producing right away is prodigy content.",
  no3: "Scoring without threes is old-school content modern fans find wild.",
  triple: "Do-everything stat lines get shared across fan bases.",
  blk_ast: "An unusual pairing of stats makes a unicorn post.",
  stl_blk: "Two-way defensive production makes a unicorn post.",
  fr_ppg: "Freshman scoring is recruiting-class bragging material.",
  fr_rpg: "Freshman production is recruiting-class bragging material.",
  one_loss: "So close to perfect is its own kind of story.",
  fg3_team: "Three-point volume as a team shows how the game changed.",
  pen_hi: "Penalty-yard totals are rival-fan dunking material.",
  rush_def: "Run defense that stout is old-school dominance fans love to cite.",
  no_pass: "Winning while barely throwing is an option-era oddity modern fans find wild.",
  team_tot: "Total offense crowns the era's juggernaut offenses.",
  ast_tov: "Assists without turnovers is the pure point guard stat.",
  adv: "Advanced-stat seasons win over the analytics crowd.",
  dom: "Near-perfect seasons define a program's golden era.",
  games40: "Forty games means a deep tournament run; a volume-of-winning stat.",
};

// Kind framing. Two variants each, chosen by line number, so a page does not
// repeat itself.
const KIND = {
  only: [(f) => `A club of one in the ${f.decade}; "name another" posts draw replies.`, (f) => `Nobody else in the ${f.decade} did it, and exclusivity is what gets a post shared.`],
  pair: [() => `Two names invite the "whose season was better?" argument.`, () => `A two-player club is a ready-made debate.`],
  few: [() => `A short list fans can recite; each name brings its own fan base.`, () => `Few enough to name them all, so readers tag the ones they remember.`],
  list: [(f) => `Shows how high the bar was across the ${f.decade}; the extreme case is the hook.`, () => `Leads with the most extreme case, which carries the post.`],
  extreme: [(f) => `The high-water mark of the ${f.decade}: a clean "who did it best" answer.`, () => `The most extreme season of the decade; fans compare it with today's numbers.`],
  total: [() => `Rewards sustained excellence over one big year and surfaces names fans forget.`, () => `A decade-long view that settles consistency debates.`],
  nearmiss: [() => `So-close stats get shared: fans love a round number missed by a hair.`, () => `A near miss is a story; fans wonder what one more game would have done.`],
  age: [() => `Age angles (longevity or prodigy) travel beyond one fan base.`, () => `Oldest and youngest lines give a fresh angle on a familiar stat.`],
  team: [(f) => `School-pride bait: ${(f.players && f.players[0] && f.players[0].name) || "that school"}'s fans will share it.`, () => `Program bragging rights; alumni and rivals both engage.`],
};

// "Most in a season" and decade-total keys, to the rule whose angle they share.
const ALIAS = { py: "yds_hi", ptd: "td_hi", int: "int_hi", ry: "ry_hi", rec: "rec_hi", recy: "recy_hi", dint: "dint_hi", sacks: "sacks_hi", pts: "pts_hi",
  alltd: "alltd_hi", ypc: "ypc_hi", ypr: "ypr_hi", cmp_low: "cmp_hi", rate: "rate_hi", apy: "apy_hi", fgm: "fgm_hi", punt: "punt_avg", car: "car_hi",
  rtd: "rtd_hi", rectd: "rectd_hi", scrim: "scrim_hi", ff: "ff_hi", tot: "tot_hi", ppg: "ppg_hi", rpg: "rpg_hi", ft: "ft_hi", fgp: "fgp_hi", ftp: "ftp_hi",
  apg: "apg_hi", bpg: "bpg_hi", spg: "spg_hi", fg3: "fg3_hi", trb: "trb_hi", ast: "ast_hi", blk: "blk_hi", stl: "stl_hi", win: "wins_hi", loss: "loss_hi",
  opp: "stingy", diff: "diff_hi", worst: "diff_low", rush: "rush_hi", pass: "pass_hi",
  pg_rush_yds_per_g: "rypg", pg_rec_yds_per_g: "recypg", pg_pass_yds_per_g: "pypg", few_int: "int_low", grind: "ry_slow", rec_td_combo: "rectd_hi",
  alltd20: "alltd_hi", fumrec: "fumrec_hi", touches: "car_hi", fg_acc: "fg_perfect", pd_hi: "dint_hi", solo_hi: "tkl_hi", fr_sacks: "yng_sacks",
  ff_hi2: "ff_hi", sack_int: "stl_blk", pts550: "pts_hi", wins13: "wins_hi", opp_low: "stingy", sacks_team: "sacks_hi", td_team: "pts_hi",
  eff_scorer: "fgp_hi", ft250: "ft_hi", pts800: "ppg_hi", trb400: "trb_hi", ts_hi: "fgp_hi", fg3a_hi: "fg3_hi", fg3_eff: "fg3p_hi", blk_pts: "blk_hi",
  ast250: "ast_hi", stl100: "stl_hi", fr_pts: "fr_ppg", fr_blk: "fr_rpg", fr_ast: "fr_ppg", orb_hi: "rpg_hi", per_hi: "adv", usg_hi: "adv", ws_hi: "adv", bpm_hi: "adv",
  ftp_team: "ftp_hi", rpg_team: "rpg_hi", apg_team: "apg_hi", bpg_team: "bpg_hi", spg_team: "spg_hi", fg3p_team: "fg3p_hi",
  teamtot: "team_tot", pen: "pen_hi", to: "to_opp", rdef: "rush_def" };
// Families by pattern, for rule names that carry their threshold (rec130, fg40...).
const FAMILY = [[/_slow$/, "ry_slow"], [/^(c_|s_)?py|^yds\d|^x_py/, "yds_hi"], [/^(c_|s_)?ptd|^td\d|^x_ptd/, "td_hi"], [/^td30_int|^int_over_td/, "td_int"], [/^int\d|^x_int$/, "int_hi"],
  [/^few_int|^x_int_rate_low/, "int_low"], [/^cmp|^x_cpct/, "cmp_hi"], [/^rate|^x_rate/, "rate_hi"], [/^ypa/, "ypa_hi"], [/^sacked|^sk\d|^x_sk$/, "sacked"],
  [/^qb_rush\d|^x_qb_ry|^dual/, "qb_rush"], [/^qb_rushtd/, "qb_rtd"], [/^(c_|s_)?ry|^rush\d|^x_ry$/, "ry_hi"], [/^rush\d+_slow|^rtd\d+_slow/, "ry_slow"],
  [/^rtd/, "rtd_hi"], [/^car/, "car_hi"], [/^ypc|^x_ypc/, "ypc_hi"], [/^rb_rec|^x_rb_rec/, "rb_rec"], [/^scrim|^x_scrim|^rush1000_rec1000/, "scrim_hi"],
  [/^(c_|s_)?rec\d+_short|^rec100_short/, "rec_short"], [/^(c_|s_)?rec\d|^x_rec$|^tgt/, "rec_hi"], [/^(c_|s_)?recy|^x_recy/, "recy_hi"], [/^(c_)?rectd|^td10_fewrec/, "rectd_hi"],
  [/^ypr/, "ypr_hi"], [/^yds1000_fewrec/, "recy_few"], [/^te|^x_te/, "te_1000"], [/^wr_rush|^x_wr_ry/, "rtd_rec"], [/^x_dint|^pd/, "dint_hi"], [/^dtd/, "int_td"],
  [/^(c_|s_)?dsk|^sack\d|^x_dsk/, "sacks_hi"], [/^tkl|^x_tkl/, "tkl_hi"], [/^ff/, "ff_hi"], [/^fum|^x_fum/, "fumbles_hi"], [/^saf/, "safety"],
  [/^fg_perfect/, "fg_perfect"], [/^(s_)?fg|^x_fgl/, "fgm_hi"], [/^kr|^x_kry/, "kr_avg"], [/^st_td/, "kr_td"], [/^apy/, "apy_hi"], [/^sack5_int5/, "stl_blk"]];
function ruleKey(f) { const k = rawKey(f); if (ANGLE[k]) return k; if (ALIAS[k]) return ALIAS[k];
  const raw = String(f.rule || ""); for (const [re, key] of FAMILY) if (re.test(raw)) return key; return k; }
function rawKey(f) { return String(f.rule || "").replace(/^[a-z]+:/, "").replace(/:(most|school|old|young)\d*$/, "").replace(/^x_/, "").replace(/^tx_/, "").replace(/^t_/, "").replace(/^n_/, ""); }

const PO = { po_dsk: "Playoff pass rush is what legacies are built on.", po_ptd: "Postseason touchdown passes are where quarterback legacies are argued.",
  po_py: "Playoff passing volume feeds the big-game debate.", po_recy: "Playoff receiving production is highlight-reel nostalgia.", po_ry: "A playoff rushing run is the stuff of January legend." };
const STL_BLK_FB = "Sacks and interceptions from one defender make a rare two-way unicorn.";
function whyFor(f, i = 0) {
  if (PO[f.rule]) return `${KIND[f.kind] ? KIND[f.kind][i % KIND[f.kind].length](f) : ""} ${PO[f.rule]}`.trim();
  if (f.rule === "sack5_int5") return `${KIND[f.kind][i % KIND[f.kind].length](f)} ${STL_BLK_FB}`;
  const k = KIND[f.kind] || KIND.list;
  const frame = k[i % k.length](f);
  if (f.kind === "nearmiss" || f.kind === "age") return frame;
  if (/_most$/.test(f.rule || "")) return `Rewards staying power: the most such seasons in the ${f.decade}. ${ANGLE[ruleKey(f)] || ""}`.trim();
  if (/_least$/.test(f.rule || "")) return `A surprising gap in a great career; fans love a "wait, really?" stat.`;
  if (/:most/.test(f.rule || "")) return `A decade of consistency in one number; names the most reliable producer of the ${f.decade}.`;
  const angle = ANGLE[ruleKey(f)];
  return angle ? `${frame} ${angle}` : frame;
}

// Fill `why` on every fact that lacks one; returns the count filled.
function annotate(doc) { let n = 0; (doc.facts || []).forEach((f, i) => { if (!f.why) { f.why = whyFor(f, i); n += 1; } }); return n; }

module.exports = { whyFor, annotate, ANGLE };
