# How Stat Desk runs — read SELF-HOSTED.md first

**The current answer is `statdesk/SELF-HOSTED.md`.** A self-hosted GitHub runner
on Nick's machine, with a signed-in Chrome profile. One ten-minute setup, then
the whole pipeline is automatic from any device with no homework: MLB API,
ESPN cross-check, and Stathead history, all unattended.

Everything below is kept as the record of what was tried and why it did not
work, so nobody spends another day rediscovering it.

## Dead end 1: run it in the cloud Claude session

Needs the environment's network allowlist opened through a settings dialog, and
stores the Stathead password where anyone using that environment can read it.
The dialog was hard to find and the password exposure was never acceptable.

## Dead end 2: run it on a GitHub-hosted runner

The MLB API half works perfectly here and still does; that is the `runner=github`
fallback. The Stathead half cannot work: Sports Reference serves datacenter IPs
a 403. Observed directly — the login page returned 200 from a GitHub runner
early on and 403 after a handful of runs in the same half hour. Before that, a
plain HTTP login failed for two further reasons worth recording: the login URL
301-redirects, so a POST to it is followed as a GET and the credentials are
silently dropped; and even with a session, finder pages come back carrying
"Log in for full results" with an empty table, which a naive parser reads as a
legitimate zero-row result. That last one is the dangerous failure, because it
turns "we were not logged in" into "no players matched".

`statdesk/lib/stathead.js` keeps that HTTP client, fixed, behind
`--stathead-http`. It is not the default and should not be.

## Guardrails that did not change

- Provenance is still written per query to `statdesk/data/browser/<date>/`,
  same format the browser sessions wrote by hand: URL, timestamp, filters, row
  count, the full table, and the row-by-row check.
- A truncated result page is detected and marked CAPPED, and no complete-set
  claim ("only", "first", "most") may be made from a capped query.
- Superlatives stay questions until checked against every row. The brief
  linter still enforces it.
- Queries are throttled to one per four seconds, and a Cloudflare block stops
  the run rather than retrying in a loop. Read numbers to verify them; never
  mirror Stathead's tables and never build a database from them. That is the
  line their terms draw and it has not moved.
- Any failure writes STOPPED and says why. Nothing is ever estimated.

## If it does not work

- `login failed` → check the two variables, and confirm the account does not
  need a CAPTCHA cleared by signing in once in a normal browser.
- `Blocked by Cloudflare` → Sports Reference refused a datacenter IP. Run that
  query locally instead; do not retry in a loop.
- `403 CONNECT tunnel` → a domain is missing from step 5.

---

# The simpler path: run it on GitHub, not in the chat sandbox

Everything above needs a settings dialog in claude.ai that proved hard to find,
and it stores the Stathead password as an environment variable visible to
anyone using that environment. There is a better route, and it is now the
recommended one.

`.github/workflows/statdesk.yml` runs the whole pipeline on a GitHub runner.
Runners have plain internet access, so nothing is blocked, and GitHub Secrets
are encrypted rather than displayed in a settings box. The run commits the
brief straight back to this repo, so any Claude session on any device reads it
with a git pull. Nick asks in chat, Claude dispatches the workflow and reports
back.

## Setup: two secrets, one page

1. Open:
   https://github.com/digestsportsco3/nosebleed-live-app/settings/secrets/actions
2. **New repository secret**. Name `STATHEAD_USER`, value the Stathead login
   email. Add.
3. **New repository secret** again. Name `STATHEAD_PASS`, value the password.
   Add.

That is all. Secrets are write-only once saved; nobody, Claude included, can
read them back. If the secrets are absent the MLB half still runs and the
Stathead half reports exactly why it stopped.

## Running it

- In chat: "run stat desk" or "give me today's 10". Claude dispatches the
  workflow, waits, pulls, and posts the list.
- By hand: the repo's Actions tab, "Stat Desk", **Run workflow**. Optional
  inputs are a date and whether to include the Stathead queries.
- The run summary on the Actions page prints the brief inline, so it is
  readable from a phone without opening the repo.

## Deliberately on demand only

The workflow has no `schedule:` trigger. It runs when a person or Claude asks,
never on its own. Turning it into a 7am daily job is a two-line addition
documented at the top of the workflow file, and it requires merging to the
default branch, because GitHub only runs cron from there. That is a decision
for Nick to make on purpose, not something to switch on quietly.
