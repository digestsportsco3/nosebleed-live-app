# One setup, then Stat Desk works from any device. Do this once.

Goal: Nick opens a chat on his phone, laptop, anything, types "give me today's
10", and gets them back in the chat. No PowerShell. No local session. No
Chrome. Stathead included, because he pays for it.

Everything needed for that is now in this repo. The pipeline logs into Stathead
directly (`statdesk/lib/stathead.js`) and builds the Season Finder URLs itself
(`statdesk/lib/finder.js`), so no browser is involved anywhere.

There is exactly ONE thing Claude cannot do from inside a session, because it
is a setting on Nick's Claude account: opening the network and storing the
Stathead login. It takes about two minutes and never has to be done again.

## The two-minute setup

1. Go to claude.ai/code.
2. Click the cloud icon showing the environment name, in the row just above the
   message box. There is no settings URL; it only opens from that button.
3. Hover the environment, click the gear on its right.
4. **Network access** → **Custom**.
5. **Allowed domains**, one per line:

       statsapi.mlb.com
       stathead.com
       *.stathead.com
       www.sports-reference.com
       *.sports-reference.com
       www.baseball-reference.com
       *.baseball-reference.com

6. Tick **Also include default list of common package managers**. Without it
   the session loses GitHub and npm.
7. **Environment variables**, in .env format:

       STATHEAD_USER=<the Stathead login email>
       STATHEAD_PASS=<the Stathead password>

8. Save. New sessions pick this up; a session already running does not.

A note on step 7, so it is a real choice and not a surprise: environment
variables are visible to anyone who uses that environment, and to any session
running in it. If that is not acceptable, skip step 7 and the API half still
works from chat while the Stathead half stays local. Use a password unique to
Stathead either way.

## What runs after that

    node statdesk/run.js --stathead      # API pull + Stathead discovery + brief
    node statdesk/run.js --stathead-only # Stathead discovery alone
    ./statdesk/handoff.sh                # commit and push

All of it runs in a cloud session, so "give me today's 10" in any chat is
enough. The daily run can also be a Routine that fires at 7am and pushes, so
the brief is already waiting.

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
