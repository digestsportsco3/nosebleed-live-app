// Multi-season Stathead queries: the "how rare is this" half of a brief.
//
// WHY THIS IS SEPARATE FROM DISCOVERY: the 14 rules in finder.js DISCOVERY are
// all single-season oddity hunts — they find who is weird THIS year. They
// cannot answer "how often has anyone done this", which is the framing that
// turns a milestone into a post. On 2026-09-25 Pete Crow-Armstrong went 40-40
// and the brief could only say "the only one this season", because nothing here
// asked the historical question. This file asks it.
//
// Runs on the self-hosted machine only — Sports Reference blocks datacenter IPs.
//
//   node statdesk/history.js 2026-09-25            # all queries
//   node statdesk/history.js 2026-09-25 hr40_sb40  # one
"use strict";
const path = require("path");
const { StatheadBrowser } = require("./lib/stathead-browser");
const { seasonFinder } = require("./lib/finder");

// Baseball Reference's season data starts in 1871, but the modern-era
// convention most writing uses is 1901. Queries state which they use so a
// claim can be worded honestly ("in the modern era" vs "ever").
const MODERN = 1901;

const QUERIES = (season) => [
  {
    key: "hr40_sb40",
    label: "History [hr40_sb40] every 40-homer, 40-steal season",
    era: `${MODERN}-${season}`,
    spec: { group: "batting", seasonMin: MODERN, seasonMax: season,
            filters: [["HR", "gte", 40], ["SB", "gte", 40]], sort: ["HR", "desc"] },
  },
  {
    key: "hr30_sb30",
    label: "History [hr30_sb30] every 30-homer, 30-steal season",
    era: `${MODERN}-${season}`,
    spec: { group: "batting", seasonMin: MODERN, seasonMax: season,
            filters: [["HR", "gte", 30], ["SB", "gte", 30]], sort: ["HR", "desc"] },
  },
  {
    key: "hr40_sb30_age24",
    label: "History [hr40_sb30_age24] 40 HR and 30 SB at 24 or younger",
    era: `${MODERN}-${season}`,
    spec: { group: "batting", seasonMin: MODERN, seasonMax: season, ageMax: 24,
            filters: [["HR", "gte", 40], ["SB", "gte", 30]], sort: ["HR", "desc"] },
  },
];

// Same resolution ci.js uses, so both halves of a run write to one dated
// folder. A blank RUN_DATE from the workflow means "today, US Eastern".
function easternToday() {
  return new Date().toLocaleDateString("en-CA", { timeZone: "America/New_York" });
}

async function main() {
  const args = process.argv.slice(2).filter((a) => a !== "");
  const date = (args[0] && /^\d{4}-\d{2}-\d{2}$/.test(args[0]))
    ? args.shift()
    : (process.env.RUN_DATE || easternToday());
  const only = args[0];
  const season = Number(date.slice(0, 4));
  console.log(`History queries for ${date} (season ${season}).`);
  const dataDir = path.join(__dirname, "data", "browser");
  // "H" so these records cannot collide with the discovery pass, which writes
  // Q001.. into this same folder. Without it the later run overwrites these.
  const sh = new StatheadBrowser({ dataDir, runDate: date, idPrefix: "H" });

  let queries = QUERIES(season);
  if (only) {
    queries = queries.filter((q) => q.key === only);
    if (!queries.length) {
      console.error(`No history query named "${only}". Known: ${QUERIES(season).map((q) => q.key).join(", ")}`);
      process.exit(2);
    }
  }

  let failed = 0;
  try {
    for (const q of queries) {
      const url = seasonFinder(q.spec);
      try {
        const rec = await sh.query(url, {
          label: q.label,
          note: `Multi-season query over ${q.era}. A count from this is only as complete as the page says; a CAPPED result cannot support an "only ever" claim.`,
        });
        console.log(`\n${q.key}: ${rec.rowCount} row(s)${rec.reported != null ? ` (page reports ${rec.reported})` : ""}${rec.capped ? " CAPPED" : ""}`);
        for (const r of rec.rows) {
          const name = r.name_display || r.player || "?";
          const yr = r.year_id || r.year_ID || "?";
          console.log(`   ${yr}  ${name}  ${r.b_hr ?? "?"} HR / ${r.b_sb ?? "?"} SB`);
        }
        if (rec.capped) {
          console.log("   CAPPED — the page truncated the list. Do not assert a total from this.");
          failed++;
        }
      } catch (e) {
        // One failed query must not silently become "there were none".
        console.error(`\n${q.key}: FAILED — ${e.message}`);
        failed++;
      }
    }
  } finally {
    await sh.close();
  }

  if (failed) {
    console.error(`\n${failed} quer(y/ies) did not return a usable complete set. No historical claim may be`);
    console.error(`written from those. This is a stop, not a zero.`);
    process.exit(1);
  }
  console.log(`\nAll ${queries.length} history quer(y/ies) returned complete sets. Provenance in statdesk/data/browser/${date}/.`);
}

main().catch((e) => { console.error(e.message); process.exit(1); });
