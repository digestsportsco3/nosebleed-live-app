#!/usr/bin/env node
// Post-process decade fact files: one-decimal rates, why-post notes, and the
// NFL's unofficial-era notes. Idempotent.
//   node statdesk/tidy-facts.js statdesk/data/nfl/facts/*.json
"use strict";
const fs = require("fs");
const { tidy } = require("./lib/tidy");
const { annotate } = require("./lib/why");
const NFL_NOTES = {
  "1920s": "Every figure on this page is unofficial: the NFL kept no official statistics until 1932, and these are Pro Football Reference's totals researched from game accounts.",
  "1930s": "Figures from 1930 and 1931 are unofficial (official NFL statistics begin in 1932), as are punting figures before 1939.",
  "1940s": "Kick and punt return figures before 1941 are unofficial; everything else here was officially kept.",
};
const REWHY = process.argv.includes("--rewhy");
for (const f of process.argv.slice(2).filter((a) => !a.startsWith("--"))) {
  const doc = JSON.parse(fs.readFileSync(f, "utf8"));
  for (const x of doc.facts || []) x.text = tidy(x.text, x.rule);
  if (REWHY) for (const x of doc.facts || []) delete x.why;
  const n = annotate(doc);
  if (/\/nfl\//.test(f) && NFL_NOTES[doc.decade]) doc.shortNote = NFL_NOTES[doc.decade] + (doc.facts.length < 100 ? " Fewer than 100 lines because the record for these seasons is thin; nothing was padded." : "");
  fs.writeFileSync(f, JSON.stringify(doc, null, 1));
  console.log(`${f}: tidied, ${n} why notes`);
}
