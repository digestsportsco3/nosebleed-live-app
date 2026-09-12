#!/usr/bin/env bash
# Installs a cron entry that runs the Stat Desk every day at 7:00 AM Eastern.
# Caveat: cron only fires if the computer is on and awake at 7:00 AM.
set -euo pipefail
REPO="$(cd "$(dirname "$0")/../.." && pwd)"
LINE="CRON_TZ=America/New_York"
JOB="0 7 * * * cd $REPO && ./statdesk/run.sh >> $REPO/statdesk/data/scheduler.log 2>&1"
( crontab -l 2>/dev/null | grep -v 'statdesk/run.sh' | grep -v '^CRON_TZ=America/New_York$' ; echo "$LINE"; echo "$JOB" ) | crontab -
echo "Installed. Current crontab:"; crontab -l
echo "Note: if your cron does not support CRON_TZ (older macOS), set the hour to 7 AM in the machine's local zone instead."
