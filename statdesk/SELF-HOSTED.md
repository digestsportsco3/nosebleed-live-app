# The one-time setup that ends the homework

After this, the whole thing is automatic. Nick asks from any device, Claude runs
it, Stathead and ESPN get cross-checked, and a verified brief comes back. No
terminal, no browser, no PowerShell, ever again.

This takes about ten minutes, once.

## Why it has to run on your machine

Sports Reference blocks datacenter IPs. A GitHub cloud runner gets a 403 at the
login page, every time, no matter how the request is built. That is deliberate
on their side and there is no way around it from the cloud.

Your machine is not blocked. It has a residential IP and a browser that is
already a paying subscriber. So the job runs there instead. The difference from
before is that **you are not the one running it** — a background service is, and
it takes its orders from GitHub, which takes them from Claude, which takes them
from you on any device.

Your computer needs to be on and awake. That is the only ongoing requirement.

## Step 1 — install Node and the browser (once)

In PowerShell, in the repo folder:

    cd C:\Users\Administrator\nosebleed-live-app
    git pull origin main
    npm install playwright
    npx playwright install chromium

## Step 2 — sign in to Stathead once, by hand

    node statdesk/login.js

A Chrome window opens on the Stathead login page. Sign in the way you normally
would, clear a CAPTCHA if one appears, then press Enter in the terminal. The
script runs a test query and tells you how many rows it got.

Your password is never read, typed or stored by any code here. You type it into
a real browser. The saved session lives in a Chrome profile on your machine and
nowhere else.

## Step 3 — install the runner service (once)

This is the piece that lets Claude start jobs on your machine without you.

1. Open: `github.com/digestsportsco3/nosebleed-live-app` → **Settings** →
   **Actions** → **Runners** → **New self-hosted runner** → **Windows**.
2. GitHub shows a short list of commands with a token baked in. Copy and run
   them exactly, in PowerShell, from a folder like `C:\actions-runner`.
3. When `.\config.cmd` asks **"Would you like to run the runner as service?"**
   answer **Y**. That is the step that makes it start with Windows and keep
   running with no window open. Accept the defaults for every other question by
   pressing Enter, and let it run as NT AUTHORITY\SYSTEM.

   (`svc.sh` is the macOS and Linux equivalent. On Windows the service is
   installed by answering Y above; you do not run svc.sh.)

Confirm it worked: the Runners page shows your machine as **Idle**, green.

## That is the whole setup

From now on, in any Claude chat on any device: "give me today's 10". Claude
dispatches the job to your machine, it pulls the MLB API, cross-checks ESPN,
runs the Stathead history queries in your signed-in browser, saves the
provenance, commits, and Claude reads it back and hands you the brief.

## What each source is for

- **MLB Stats API** — every current-season number, and league-wide ranks
  computed over the complete pull. Primary.
- **ESPN** — independent second read on current-season numbers. A figure that
  matches in both is safe to publish. A disagreement is reported, never
  averaged or quietly picked.
- **Stathead / Baseball Reference** — history only. "Only player ever", "first
  since 1974", the things the other two cannot answer. Runs in your browser.

## If something breaks

- **"The saved Stathead session is not logged in any more"** → run
  `node statdesk/login.js` again. Sessions expire every few months.
- **Job queued and never starts** → the runner is offline. Check the machine is
  awake and the service is running: open **Services** in Windows and look for
  one named `actions.runner.*`, or run `.\run.cmd` in the runner folder to see
  it connect live.
- **Need an answer while the machine is off** → Claude re-runs with
  `runner=github`. The MLB and ESPN halves still work; only the history queries
  are skipped, and the brief says so rather than guessing.

## The one rule that does not change

Nothing is ever estimated. If a source cannot be reached, the brief says
STOPPED and names what failed. A claim that was not checked is never written as
though it was.
