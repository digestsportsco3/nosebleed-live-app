// Text tidying for rule-generated lines: rates always show one decimal
// ("6.0 ypc", "62.0%"), so a whole-number rate never looks rounded or wrong.
"use strict";
function tidy(text, rule = "") {
  let t = text
    .replace(/\boutscore opponents\b/g, "outscored opponents").replace(/\bproduce (\d)/g, "produced $1")
    .replace(/kicked and punt return yards/g, "kick and punt return yards")
    .replace(/(^|[:;(] )_ ([A-Z][\w'.-]+)/g, "$1$2 (first name not recorded)")
    .replace(/(?<![\d.,])(\d+)(?=(?: ypc| per catch| Y\/A| rating| avg on| per game| on \d+ returns))/g, "$1.0")
    .replace(/(?<![\d.,])(\d+)%(?= on | \()/g, "$1.0%");
  if (/x_(ypc|ypr|rate|punt)$/.test(rule)) t = t.replace(/ — (\d+)\.$/, " — $1.0.");
  if (/x_(cmp_low|fgp|ftp)$/.test(rule)) t = t.replace(/ — (\d+)%\.$/, " — $1.0%.");
  return t;
}
module.exports = { tidy };
