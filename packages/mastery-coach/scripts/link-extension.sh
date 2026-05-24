#!/usr/bin/env bash
#
# link-extension.sh — Idempotently symlink the mastery-coach package into
# the Pi agent's extensions directory so Pi discovers it via jiti at runtime.
#
# Behaviour:
#   - Resolves the package directory from the script's own location, so the
#     script works correctly regardless of the caller's working directory.
#   - Honours the PI_AGENT_DIR environment variable (defaults to ~/.pi/agent).
#     NOTE: Pi internally reads PI_CODING_AGENT_DIR; this script honours
#     PI_AGENT_DIR per task spec. Users overriding PI_CODING_AGENT_DIR should
#     also set PI_AGENT_DIR.
#   - Creates ${PI_AGENT_DIR:-~/.pi/agent}/extensions/ if missing (mkdir -p).
#   - Uses `ln -sfn` so re-runs replace the symlink in place without error
#     and without producing duplicate entries.
#
# Usage:
#   bash packages/mastery-coach/scripts/link-extension.sh
#

set -euo pipefail

PACKAGE_DIR="$(cd "$(dirname "$0")/.." && pwd)"
EXTENSIONS_DIR="${PI_AGENT_DIR:-$HOME/.pi/agent}/extensions"

mkdir -p "$EXTENSIONS_DIR"
ln -sfn "$PACKAGE_DIR" "$EXTENSIONS_DIR/mastery-coach"

echo "Linked: $EXTENSIONS_DIR/mastery-coach -> $PACKAGE_DIR"