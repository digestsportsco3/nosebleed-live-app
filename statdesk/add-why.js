#!/usr/bin/env node
// Adds "why post" notes to fact files that lack them.
//   node statdesk/add-why.js statdesk/data/cfb/facts/*.json
"use strict";
const fs = require("fs");
const { annotate } = require("./lib/why");
for (const f of process.argv.slice(2)) {
  const doc = JSON.parse(fs.readFileSync(f, "utf8"));
  const n = annotate(doc);
  fs.writeFileSync(f, JSON.stringify(doc, null, 1));
  console.log(`${f}: ${n} notes added`);
}
