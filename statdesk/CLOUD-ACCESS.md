# Let the cloud chat run the pull (one time, about a minute)

The goal: Nick asks "give me today's 10" in a claude.ai chat and gets them back
in the chat. No PowerShell, no terminal, no local session.

The only thing blocking that is one setting. Cloud sessions run behind a network
allowlist, and `statsapi.mlb.com` is not on the default list, so the pull fails
with a 403 on the CONNECT tunnel every time. It is not an outage and not a bug
in this pipeline; the same code runs fine on Nick's machine.

## The fix

1. Go to claude.ai/code.
2. In the row just above the message box, click the cloud icon showing the
   environment name (probably "Default"). There is no settings URL for this;
   it only opens from that button.
3. Hover the environment in the list and click the gear icon on its right.
4. Set **Network access** to **Custom**.
5. In **Allowed domains**, one per line:

       statsapi.mlb.com
       *.mlb.com

6. Tick **Also include default list of common package managers**, or the
   session loses npm, GitHub and everything else it needs.
7. Save. New sessions pick it up; an already-running session needs a new one.

## What this does and does not buy

WORKS from the cloud chat afterwards — the whole API half:
- The full 25-call pull, all cached and logged exactly as it is locally.
- The generated brief with the ranked 10 (`YYYY-MM-DD-statdesk.md`), every
  anomaly rule, every milestone watch, every heat window.
- The Stathead query written out per idea, ready to run.
- Commit and push, so the local machine and the chat never diverge.

STILL NEEDS Nick's computer — the browser half:
- Stathead and Baseball Reference sit behind Nick's login in Nick's Chrome.
  A cloud session has no access to that browser and never will. Anthropic's
  network does not carry his session cookies, and it should not.
- So: historical hooks stay QUESTIONS in a cloud-run brief, exactly as
  STATDESK.md already requires. Verification runs on picks only, locally.

That split is the existing design, not a downgrade. The morning formula says
pull, discover, draft, rank, STOP, and Nick picks. Steps 1, 3 and 4 are the
API. A cloud chat can do those daily. Step 2 (Stathead discovery) makes the 10
richer but is not required to produce them; step 5 verification was always
local and always on picks only.

## Honest limits

- The cloud brief will lean on API numbers, so more lines carry "not yet
  confirmed on Baseball Reference" than a local run's would.
- Stathead runs about a game behind the API. A cloud-only brief cannot see
  that gap, so any number published off it should be re-read on the page.
- If the pull ever fails from the cloud again, the brief says STOPPED and
  lists the attempted call. It never guesses.
