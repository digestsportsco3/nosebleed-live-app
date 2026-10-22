# Set up the Stat Desk on your main computer (one time, about 10 minutes)

Why local: Stathead lives behind your login in your Chrome. Only a Claude Code
session running on your computer can drive that browser. Running locally also
means no cloud network settings and no blocked hosts.

## 1. Install Claude Code

Mac: open Terminal and paste
    curl -fsSL https://claude.ai/install.sh | bash
Windows: open PowerShell and paste
    irm https://claude.ai/install.ps1 | iex
Then run `claude`, and log in with your Claude account when it asks.
(Windows only: also install Git for Windows from git-scm.com/downloads/win.)

## 2. Install the Chrome extension

Chrome Web Store → "Claude in Chrome" (by Anthropic). You have used it from the
chat app already; the same extension serves Claude Code.

## 3. Get the pipeline onto the computer

In Terminal (Mac) or PowerShell (Windows):
    git clone https://github.com/digestsportsco3/nosebleed-live-app.git
    cd nosebleed-live-app

That clones `main`, which is where all Stat Desk work lives. (An older version of
this file named a `stats-research-pipeline` branch; it no longer exists.)

## 4. Start the hub session

    claude --chrome

Press Enter on the one-time Chrome dialog. Then paste this as your first message:

    Read statdesk/HANDOFF.md, then statdesk/STATDESK.md, and follow them.
    Install Node.js if it is missing. Run the morning formula now and show me
    today's 10. Push after every commit.

Approve the "Claude in Chrome wants to..." prompt for stathead.com the first
time, choosing "allow all actions on this site for the session."

## 5. Schedule 7:00 AM Eastern

Ask the session: "install the 7 AM scheduler." It runs
`statdesk/scheduler/install-mac-linux.sh` or `install-windows.ps1`, which
schedule the API pull and brief. Caveat: the computer must be on at 7:00 AM.
The Stathead discovery and verification steps need a running Claude session
with Chrome, so those happen when you open the hub session in the morning.

## 6. Before you close a session (every time)

Say: "hand off". The session updates `statdesk/HANDOFF.md`, runs
`statdesk/handoff.sh` (or `handoff.cmd`), and tells you the pushed commit.
If you see "HANDOFF NOT PUSHED", do not close the terminal until it is fixed.
If the session has no browser tools, this is also the first step before
restarting with `claude --chrome`.

## 7. Mac mini as the main machine (from 2026-10-22)

The Windows desktop kept freezing and crashing, so the Mac mini is now the
primary Claude machine. Its Desktop/Documents/Downloads were already backed up
from the Windows box to Google Drive (nick@nosebleedsportsmedia.com) under
"My Computer"; Pictures/Videos/Music were deliberately not included.

A Mac session set up here has what a cloud session does not: the real
filesystem, the attached external drive, and Chrome with the Stathead login.

### Checking the external drive, first session on the Mac

Attached volumes mount under `/Volumes/`. Before trusting the drive with
anything, the session should check and report:

    ls -la /Volumes/
    diskutil list
    diskutil info /Volumes/<NAME>          # filesystem type and mount point
    df -h /Volumes/<NAME>                  # capacity and free space
    mount | grep /Volumes/<NAME>           # read-only vs read-write

What to look for:

- **Filesystem.** If it reads `ntfs`, macOS mounts it READ-ONLY and nothing can
  be written to it without third-party software. This is the likely state if the
  drive came off the Windows desktop. Options: reformat to APFS or exFAT (erases
  the drive, so copy the contents off first), or use exFAT if the drive must
  work on both machines. APFS is correct for a Mac-only drive.
- **Mount flags.** `read-only` in the `mount` output confirms the above.
- **Health.** `diskutil verifyVolume /Volumes/<NAME>`, and
  `smartctl -a /dev/diskN` if smartmontools is installed.

Do not reformat or erase anything without Nick saying so explicitly in that
session. Report what the drive is and what the options are; let him choose.

### Where things should live

- The repo stays on the internal drive (`~/nosebleed-live-app`). Git operations
  on an external drive that can be unplugged mid-write cause corruption.
- `statdesk/data/` pulls stay in the repo and go to GitHub, as they do now.
- The external drive is for bulk and archive: video, raw footage, old project
  folders, the Windows-machine restore copy. Not for live working files.
