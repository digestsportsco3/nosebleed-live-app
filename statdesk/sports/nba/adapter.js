// NBA adapter placeholder. To plug in: implement pull() returning
// { players:[normalized lines], teams, windows, endDate } and a rules.js with
// { anomalies, milestones, heat } using the same shapes as sports/mlb.
// The scanner and brief writer need no changes.
"use strict";
module.exports = { sport: "NBA", async pull() { throw new Error("NBA adapter not implemented yet"); }, rules: { anomalies: [], milestones: [], heat: [] } };
