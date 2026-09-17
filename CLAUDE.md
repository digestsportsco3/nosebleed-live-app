# nosebleed-live-app — rules for every Claude session

## Nothing stays on one computer

A commit that is not pushed does not exist to the next session. Sessions get
archived, computers go to sleep, and the next session (local or cloud) only
sees what is on GitHub.

- After EVERY commit, push it: `git push -u origin <current-branch>`.
  Never end a turn with unpushed commits. If the push fails, say so in the
  reply and retry before doing anything else.
- Before a session closes, restarts, or switches mode (for example restarting
  with `claude --chrome`), write the handoff (below) and push it. Do this
  without being asked.

## Stat Desk handoff

The stats pipeline lives in `statdesk/`. Its running handoff is
`statdesk/HANDOFF.md`. Every Stat Desk session:

1. Reads `statdesk/HANDOFF.md` first, then `statdesk/STATDESK.md`.
2. Before ending, updates the "Current state" section of `statdesk/HANDOFF.md`
   (what was verified, what is still open, last commit, anything broken),
   then runs `./statdesk/handoff.sh` (Mac/Linux) or `statdesk\handoff.cmd`
   (Windows), which commits and pushes everything.
3. Reports the pushed commit hash in the final reply, so the user can confirm
   it reached GitHub.
