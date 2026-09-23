# Stat Desk — running handoff

Read this first, every session. Update the "Current state" section before any
session closes, then run `./statdesk/handoff.sh` (or `statdesk\handoff.cmd`)
so it is committed AND pushed. A commit that is not pushed is invisible to the
next session. That is how the 2026-09-13/14 work got stranded (see history).

## Current state (update this block)

Last updated: 2026-09-23. THE PIPELINE IS BUILT AND WORKING END TO END.

### How it runs now

Nick asks in any chat on any device. Claude dispatches the GitHub Actions
workflow `Stat Desk`, it runs on the self-hosted runner on his machine, pulls
the MLB API, runs all 14 Stathead discovery queries in a signed-in Chrome, saves
provenance, commits and pushes. Claude reads the repo back and writes the brief.
Setup is `statdesk/SELF-HOSTED.md` and is already done.

Dispatch it with the `statdesk.yml` workflow, inputs `runner: self-hosted` and
`stathead: true`. If the runner is offline the job sits queued: cancel it and
re-dispatch with `runner: github` for the API-only path, and say so in the brief.

### What Nick wants from a brief

- Ten ideas, each a claim that is ALREADY VERIFIED. Never "check before
  posting". If it cannot be verified it does not go in the brief.
- NO REPEATS. A player already sent does not come back unless their number
  actually moved. He said this explicitly. Prefer fresh names and new
  categories over re-serving the same leaderboard.
- A PDF in the Nosebleed brand, plus the table in chat.
- Every claim computed across the COMPLETE pull (all ~747 hitters, all
  pitchers), not a sample. State the check count.

### Posted and permanently excluded

Sale, Stewart, Nuñez, Detmers, Martinez, Murakami. Tracked in
`statdesk/posted.json`, which the pipeline filters on automatically. Add a name
the day it goes out.

### Sent but not yet confirmed posted

Crow-Armstrong, Misiorowski, Schwarber, Arraez, Alvarez, Caminero, Simpson,
Montgomery, Machado, Adell, Alonso, Jensen, and as of Sep 23 the fresh ten:
Burleson, Rice, Sánchez, Miller, Otto Lopez, Carroll, Reynolds, Herrera,
Fluharty. Treat these as used; do not re-serve without a real change.

### Live watch items

- Pete Crow-Armstrong: 45 HR, 39 SB. ONE steal from 40-40. Also leads MLB in
  runs with 119. Could land any night.
- Ben Rice: 39 HR, one from becoming the seventh player to reach 40.

### Known source behaviour

- Stathead runs about one game behind the MLB API. Publish a Stathead figure
  with the Stathead date.
- Sports Reference refuses headless Chrome and blocks datacenter IPs. Hence the
  visible browser on Nick's machine. Do not try to move it back to the cloud.

### Blocking Nick daily: the cloud chat cannot reach the MLB API

He does not want to open PowerShell every morning. The only thing stopping a
claude.ai chat from running the pull is the cloud environment's network
allowlist: `statsapi.mlb.com` is not on it, so every cloud pull 403s. Fix and
its exact limits: `statdesk/CLOUD-ACCESS.md`. Until that setting changes, a
cloud session can only write a STOPPED brief, and the run has to happen on his
machine.

## Session-architecture facts (so the restart problem does not repeat)

- Chrome tools only load when a session STARTS with `claude --chrome`. They
  cannot be added to a running session. If a session has no browser, the fix
  is: write this handoff, run `handoff.sh`, `/exit`, then
  `claude --chrome` in the repo folder.
- Restarting creates a new session and archives the old one. That is normal.
  Everything the new session needs must be in this file and on GitHub.
- The remote-control link (claude.ai/code/session_…) only works while the
  computer is awake and the session is running. It is not storage.
- The local memory plugin (claude-mem, localhost:37777) is per-computer. Do
  not rely on it for handoff; this file is the handoff.
- The MLB Stats API sometimes returns 502 or "request cancelled" from the
  cloud; run the pull locally. Stathead discovery works without the API.

## History

- 2026-09-11: first cloud run, API pull failed (blocked host). Decision: hub
  moves to Nick's computer with Chrome (730206b).
- 2026-09-13 AM: morning formula ran locally; Nick picked 5 (Nuñez, Detmers,
  Martinez, Stewart, Sale); deep API pull committed 7cc1751.
- 2026-09-13 PM: session had no Chrome tools (started without `--chrome`).
  Restarted as "desktop-f00l87b-binary-kurzweil" with `--chrome`; 12 Stathead
  searches verified the 5 picks; committed f8aaa41. Nick's rule recorded:
  "always hand off before closing a session".
- 2026-09-14: fresh 10 run; committed c82ddd9. Nothing pushed.
- 2026-09-15 PM: full morning formula ran locally with `--chrome`. Pushed the
  5 stranded commits first (c82ddd9..4f9b349), then pull (db7634a), 21
  provenance records (589c3f5), Fresh 10 (03b08c5). API reachable from Nick's
  machine; age fix verified against Stathead.
- 2026-09-15 AM: Nick's computer unreachable from remote control; cloud session
  could not see any of the above. This file, `handoff.sh`, and the push rule
  in `CLAUDE.md` added so it cannot happen again.
