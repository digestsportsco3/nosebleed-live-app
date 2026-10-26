# Mac mini as the Stat Desk main device: step by step

After this, Claude runs on the Mac mini, pulls MLB/ESPN data directly (no Windows
runner needed), and opens Stathead in a visible Chrome window that is already
signed in. Background on the move and the external drive: SETUP-LOCAL.md section 7.

Open **Terminal** (Cmd+Space, type Terminal, Enter) and paste each block.

## 1. Install the tools (once)
- Google Chrome: https://www.google.com/chrome (sign in to Stathead in it once, any time)
- Node.js: https://nodejs.org, click the green "LTS" download, run the installer.
- Git:
```
xcode-select --install
```
- Claude Code:
```
curl -fsSL https://claude.ai/install.sh | bash
```
Quit Terminal (Cmd+Q) and reopen it.

## 2. Get the repo (once)
```
cd ~
git clone https://github.com/digestsportsco3/nosebleed-live-app.git
cd nosebleed-live-app
npm install
npx playwright install chromium
```
If git asks you to sign in, use the GitHub account that has digestsportsco3.

## 3. Sign in to Stathead for the pulls (once)
```
node statdesk/login.js
```
A Chrome window opens on the Stathead login page. Sign in, clear any CAPTCHA, go back
to Terminal and press Enter. It confirms the login works. Every later Stathead pull
reuses that signed-in window. It never sees or stores your password.

## 4. Start Claude (every time)
```
cd ~/nosebleed-live-app
git pull
export STATHEAD_HEADLESS=false
claude --chrome
```
- `STATHEAD_HEADLESS=false` makes the Stathead window open on screen so you can watch.
- `--chrome` lets Claude use your own Chrome too. Install the "Claude" extension from the
  Chrome Web Store when prompted and sign in with the same Claude account.
- The Stat Desk rules and handoff load automatically. First message:
  `Continue the Stat Desk from the handoff.`

## 5. Retire the Windows runner (optional, once the Mac works)
GitHub -> nosebleed-live-app -> Settings -> Actions -> Runners -> remove DESKTOP-F00L87B.

## 6. Make the Mac the pull runner (so cloud chats can pull through it)

Every Stat Desk workflow now runs only on a self-hosted runner labelled `macOS`.
1. GitHub -> digestsportsco3/nosebleed-live-app -> Settings -> Actions -> Runners ->
   **New self-hosted runner** -> macOS, ARM64. Run the Download and Configure commands it
   shows in Terminal (accept the default name and labels; it adds `macOS` automatically).
2. Install it as a service so it starts on its own after a restart:
```
cd ~/actions-runner
./svc.sh install
./svc.sh start
./svc.sh status
```
3. Keep the Mac awake: System Settings -> Energy -> turn on "Prevent automatic sleeping when the
   display is off" and "Start up automatically after a power failure". Stay logged in (the
   Stathead window needs a logged-in desktop).
4. In the same Runners page, remove the old Windows runner DESKTOP-F00L87B.
