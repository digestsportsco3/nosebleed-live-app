# Make this computer the Stat Desk main device

After this, Claude runs on this computer, pulls MLB/ESPN data directly, and opens
Stathead in a visible Chrome window that is already signed in. The old Windows runner
is no longer needed.

## 1. Install the tools (once)
- Google Chrome: https://www.google.com/chrome
- Node.js LTS: https://nodejs.org (the green "LTS" button)
- Git: Mac, run `xcode-select --install` in Terminal. Windows: https://git-scm.com/download/win
- Claude Code:
  - Mac (Terminal): `curl -fsSL https://claude.ai/install.sh | bash`
  - Windows (PowerShell): `irm https://claude.ai/install.ps1 | iex`

Close and reopen the terminal after installing.

## 2. Get the repo
```
git clone https://github.com/digestsportsco3/nosebleed-live-app.git
cd nosebleed-live-app
npm install
npx playwright install chromium
```
If git asks you to sign in, sign in with the GitHub account that owns digestsportsco3.

## 3. Sign in to Stathead (once)
```
node statdesk/login.js
```
A Chrome window opens on the Stathead login page. Sign in, clear any CAPTCHA, then go back
to the terminal and press Enter. The script checks the login worked. Every later Stathead
pull reuses this signed-in window. It never sees or stores your password.

## 4. Start Claude here
To watch Stathead open on screen (instead of a hidden window), set this first:
- Mac: `export STATHEAD_HEADLESS=false`
- Windows PowerShell: `$env:STATHEAD_HEADLESS="false"`

Then:
```
claude --chrome
```
Sign in with the same Claude account. `--chrome` lets Claude use your Chrome too (install the
"Claude" extension from the Chrome Web Store when it prompts). The Stat Desk rules and handoff
load automatically. First message: `Continue the Stat Desk from the handoff.`

From then on, each time: open a terminal, `cd nosebleed-live-app`, `git pull`, set STATHEAD_HEADLESS as above, `claude --chrome`.

## 5. Retire the old Windows runner (optional)
GitHub -> nosebleed-live-app -> Settings -> Actions -> Runners -> remove DESKTOP-F00L87B.
