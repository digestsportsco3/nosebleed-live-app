// Season-count lines ("1987 had 28 30-homer hitters, the most of any season")
// must not crown one season when several tied. Two or three tied seasons are
// named together ("tied for the most"); four or more make no line at all.
"use strict";
const andList = (a) => (a.length <= 1 ? a.join("") : a.length === 2 ? `${a[0]} and ${a[1]}` : `${a.slice(0, -1).join(", ")} and ${a[a.length - 1]}`);

// which: "most" | "least"; labels: tied season labels in order; n: the count.
function countLine(which, labels, n, what, what1, decadeLabel, zeros = 0) {
  const one = what1 || what.replace(/(\w)s\b/, "$1");
  if (which === "least" && n === 0) {
    if (labels.length === 1) return `${labels[0]} had no ${what} at all — the only season of the ${decadeLabel} without one.`;
    return labels.length <= 3 ? `${andList(labels)} had no ${what} at all — the only seasons of the ${decadeLabel} without one.`
      : `${labels[0]} had no ${what} at all — one of ${labels.length} seasons of the ${decadeLabel} without one.`;
  }
  if (labels.length > 3) return null;
  const word = which === "most" ? "most" : "fewest"; const just = which === "least" ? "just " : "";
  const qty = n === 1 ? `${just}one ${one}` : `${just}${n} ${what}`;
  if (labels.length === 1) return `${labels[0]} had ${qty}, the ${word} of any season in the ${decadeLabel}.`;
  return `${andList(labels)} each had ${qty}, tied for the ${word} of any season in the ${decadeLabel}.`;
}

// Rewrite stored season-count lines from their evidence. Returns counts.
const RX = [
  /^(.+?) had (?:just )?(one|\d+) (.+), the (most|fewest) of any season in the (.+?)\.$/,
  /^(.+?) had no (.+) at all — (?:the only season|one of the seasons) of the (.+?) without one\.$/,
];
function fixDoc(doc) {
  let rewritten = 0, dropped = 0;
  const keep = [];
  for (const f of doc.facts || []) {
    const m = String(f.rule || "").match(/_(most|least)$/);
    if (!m || f.kind !== "season" || !Array.isArray(f.evidence) || !f.evidence.length || f.evidence[0].count === undefined) { keep.push(f); continue; }
    const counts = f.evidence.map((e) => ({ season: e.season, n: e.count }));
    const target = m[1] === "most" ? Math.max(...counts.map((c) => c.n)) : Math.min(...counts.map((c) => c.n));
    const tied = counts.filter((c) => c.n === target).map((c) => c.season);
    const a = f.text.match(RX[0]); const z = f.text.match(RX[1]);
    let labelOf, what, decadeLabel;
    if (a) { const lab = a[1]; labelOf = /^\d{4}-\d{2}$/.test(lab) ? (y) => `${y}-${String((y + 1) % 100).padStart(2, "0")}` : (y) => String(y); what = a[3]; decadeLabel = a[5]; }
    else if (z) { const lab = z[1]; labelOf = /^\d{4}-\d{2}$/.test(lab) ? (y) => `${y}-${String((y + 1) % 100).padStart(2, "0")}` : (y) => String(y); what = z[2]; decadeLabel = z[3]; }
    else { keep.push(f); continue; }
    // A singular "what" (from an n=1 line) is turned back into a plural for multi-season lines.
    const plural = a && a[2] === "one" ? what.replace(/^(\S+?)(?<!s)(\b.*)$/, (s0, w, rest) => `${w}s${rest}`) : what;
    const line = countLine(m[1], tied.map(labelOf), target, plural, a && a[2] === "one" ? what : null, decadeLabel);
    if (!line) { dropped += 1; continue; }
    if (line !== f.text) { f.text = line; f.seasons = tied; rewritten += 1; }
    keep.push(f);
  }
  if (dropped) { doc.facts = keep.map((f, i) => ({ ...f, n: i + 1 })); } else doc.facts = keep;
  return { rewritten, dropped };
}

module.exports = { countLine, fixDoc, andList };
