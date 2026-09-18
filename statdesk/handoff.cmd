@echo off
REM Commit everything and push the current branch. Run before any session closes.
REM Usage: statdesk\handoff.cmd ["message"]
cd /d "%~dp0\.."
for /f "delims=" %%b in ('git branch --show-current') do set BRANCH=%%b
set MSG=%~1
if "%MSG%"=="" set MSG=Stat Desk handoff %DATE%
git add -A
git diff --cached --quiet || git commit -m "%MSG%"
git push -u origin %BRANCH% && (
  for /f "delims=" %%h in ('git rev-parse --short HEAD') do echo HANDOFF PUSHED: %%h on %BRANCH%
) || (
  echo HANDOFF NOT PUSHED. Fix the network/login and run this again.
  exit /b 1
)
