#!/usr/bin/env bash
# One command to run the Stat Desk on demand. Works on macOS and Linux.
set -euo pipefail
cd "$(dirname "$0")/.."
export NODE_USE_ENV_PROXY=1   # harmless when no proxy is configured
node statdesk/run.js "$@"
