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

The profile goes in `C:\statdesk-chrome`, not in your user folder: the runner
service runs as a limited account that cannot read anything under
`C:\Users\<you>\`. The workflow points at that same path, so no administrator
rights and no system settings are involved.

In a normal PowerShell window:

    cd C:\Users\Administrator\nosebleed-live-app
    $env:STATHEAD_PROFILE="C:\statdesk-chrome"
    node statdesk/login.js

A Chrome window opens on the Stathead login page. Sign in the way you normally
would, clear a CAPTCHA if one appears, then press Enter in the terminal. The
script runs a test query and tells you how many rows it got.

Your password is never read, typed or stored by any code here. You type it into
a real browser. The saved session lives in a Chrome profile on your machine and
nowhere else.

## Step 3 — register the runner and start it at logon (once)

1. Open: `github.com/digestsportsco3/nosebleed-live-app` -> **Settings** ->
   **Actions** -> **Runners** -> **New self-hosted runner** -> **Windows**.
2. GitHub shows a short list of commands with a token baked in. Copy and run
   them in PowerShell. They create a folder (the default is
   `C:\Users\<you>\actions-runner`), download the runner, and run
   `.\config.cmd`. Press Enter through every question.
3. When it asks **"Would you like to run the runner as service?"** answer
   **N**. Then make it start at logon instead:

       schtasks /create /tn "Stat Desk Runner" /tr "C:\Users\Administrator\actions-runner\run.cmd" /sc onlogon

   Start it now without rebooting:

       Start-Process -FilePath "C:\Users\Administrator\actions-runner\run.cmd" -WindowStyle Minimized

### Why a logon task and NOT a Windows service

A service runs in session 0, which has no desktop. The Stathead step drives a
VISIBLE Chrome window, because Sports Reference refuses the headless one even
with a valid session. A service could not display that window, so installing
one would break the half of the pipeline that needs it. The logon task runs in
the real desktop session, where the browser can appear.

The practical consequence: the machine has to be logged in, not merely powered
on. If it is a machine that reboots to a lock screen, log in after a reboot.

Confirm it worked: the Runners page shows the machine as **Idle**, green.

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
  awake AND logged in, and that the runner is up: run
  `Get-Process Runner.Listener` in PowerShell. To start it by hand, run
  `.\run.cmd` in `C:\Users\Administrator\actions-runner`.
- **Need an answer while the machine is off** → Claude re-runs with
  `runner=github`. The MLB and ESPN halves still work; only the history queries
  are skipped, and the brief says so rather than guessing.

## The one rule that does not change

Nothing is ever estimated. If a source cannot be reached, the brief says
STOPPED and names what failed. A claim that was not checked is never written as
though it was.
