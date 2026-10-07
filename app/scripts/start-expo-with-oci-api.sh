#!/bin/zsh
# Runs Expo through its supported ngrok transport while the API stays on OCI.
# Expo owns the manifest and WebSocket URLs in this mode, which keeps Fast
# Refresh working on physical devices connected through Wi-Fi or cellular.

set -euo pipefail

export PATH="/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin"

SCRIPT_DIRECTORY="${0:A:h}"
APP_DIRECTORY="${SCRIPT_DIRECTORY:h}"
OCI_HOST="${OCI_HOST:-150.136.12.178}"
API_URL="https://${OCI_HOST}.nip.io"

if ! curl -fsS -m 8 "${API_URL}/health" >/dev/null 2>&1; then
  print -u2 "The API at ${API_URL} is not available. Check the OCI deployment before starting Expo."
  exit 1
fi

print ""
print "  API:   ${API_URL}"
print "  Metro: Expo managed tunnel (Fast Refresh enabled)"
print ""

cd "${APP_DIRECTORY}"
EXPO_PUBLIC_TUNNEL_API_URL="${API_URL}" \
  npx -y node@22 ./node_modules/expo/bin/cli start --go --tunnel --clear
