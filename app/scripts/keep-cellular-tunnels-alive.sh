#!/bin/zsh

set -u

export PATH="/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin"

SCRIPT_DIRECTORY="${0:A:h}"
SUPERVISOR_LOG="/tmp/proscard-cellular-launchd.log"

while true; do
  print "[$(date -u +%FT%TZ)] starting ProsCard cellular tunnels" >>"${SUPERVISOR_LOG}"
  EXPO_PUBLIC_TUNNEL_API_URL="" zsh "${SCRIPT_DIRECTORY}/start-cellular-tunnels.sh" >>"${SUPERVISOR_LOG}" 2>&1
  exit_code=$?
  print "[$(date -u +%FT%TZ)] tunnel supervisor exited (${exit_code}); restarting" >>"${SUPERVISOR_LOG}"
  sleep 3
done
