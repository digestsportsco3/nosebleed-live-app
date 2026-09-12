@echo off
REM One command to run the Stat Desk on demand (Windows).
cd /d "%~dp0\.."
set NODE_USE_ENV_PROXY=1
node statdesk\run.js %*
