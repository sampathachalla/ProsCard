#!/bin/zsh
# Serves the local Docker API and Metro through the OCI instance's fixed HTTPS hostnames.
#
#   phone ──https──> Caddy on OCI (150.136.12.178.nip.io / metro.…) ──reverse SSH──> this Mac (:8050 / :8081)
#
# The hostnames never change, so the Expo URL / QR code stays the same between runs.
# Prerequisites: the API is running locally (cd api && npm run docker:up) and SSH works
# to the instance. Override the defaults with OCI_HOST, OCI_USER and OCI_SSH_KEY.

set -euo pipefail

export PATH="/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin"

SCRIPT_DIRECTORY="${0:A:h}"
APP_DIRECTORY="${SCRIPT_DIRECTORY:h}"
OCI_HOST="${OCI_HOST:-150.136.12.178}"
OCI_USER="${OCI_USER:-ubuntu}"
OCI_SSH_KEY="${OCI_SSH_KEY:-${HOME}/.ssh/id_rsa}"
API_PORT=8050
METRO_PORT=8081
API_URL="https://${OCI_HOST}.nip.io"
METRO_URL="https://metro.${OCI_HOST}.nip.io"
EXPO_URL="exp://metro.${OCI_HOST}.nip.io"
RUNTIME_DIRECTORY="/tmp/proscard-oci-tunnel"
TUNNEL_LOG="${RUNTIME_DIRECTORY}/tunnel.log"

mkdir -p "${RUNTIME_DIRECTORY}"
: >"${TUNNEL_LOG}"

SSH_OPTIONS=(
  -i "${OCI_SSH_KEY}"
  -o BatchMode=yes
  -o ConnectTimeout=15
  -o ServerAliveInterval=15
  -o ServerAliveCountMax=3
  -o StrictHostKeyChecking=accept-new
)

if ! curl -fsS -m 5 "http://127.0.0.1:${API_PORT}/health" >/dev/null 2>&1; then
  print -u2 "The API is not running on localhost:${API_PORT}. Start it first: cd ../api && npm run docker:up"
  exit 1
fi

if curl -fsS -m 2 "http://127.0.0.1:${METRO_PORT}/status" >/dev/null 2>&1; then
  print -u2 "Something is already serving port ${METRO_PORT} (another Metro or start-cellular-tunnels.sh). Stop it first."
  exit 1
fi

if ! ssh "${SSH_OPTIONS[@]}" "${OCI_USER}@${OCI_HOST}" true 2>/dev/null; then
  print -u2 "Cannot SSH to ${OCI_USER}@${OCI_HOST} with ${OCI_SSH_KEY}. Set OCI_USER / OCI_SSH_KEY."
  exit 1
fi

# The instance's sshd does not detect dropped clients, so a session lost to a network change can keep
# holding the ports. Free them before every connect so the new tunnel can bind.
free_remote_ports() {
  ssh "${SSH_OPTIONS[@]}" "${OCI_USER}@${OCI_HOST}" \
    "sudo -n fuser -k ${API_PORT}/tcp ${METRO_PORT}/tcp >/dev/null 2>&1 || true" >>"${TUNNEL_LOG}" 2>&1 || true
}

# Keeps the reverse tunnel up: reconnects whenever ssh exits (network change, sleep, server restart).
tunnel_loop() {
  while true; do
    free_remote_ports
    print "[$(date +%T)] connecting tunnel" >>"${TUNNEL_LOG}"
    ssh "${SSH_OPTIONS[@]}" -N \
      -o ExitOnForwardFailure=yes \
      -R "127.0.0.1:${API_PORT}:127.0.0.1:${API_PORT}" \
      -R "127.0.0.1:${METRO_PORT}:127.0.0.1:${METRO_PORT}" \
      "${OCI_USER}@${OCI_HOST}" >>"${TUNNEL_LOG}" 2>&1 || true
    print "[$(date +%T)] tunnel closed; reconnecting in 3s" >>"${TUNNEL_LOG}"
    sleep 3
  done
}

# If the public API stops answering while it is healthy locally, drop the ssh session so the loop reconnects.
watchdog_loop() {
  local failures=0
  while true; do
    sleep 30
    if curl -fsS -m 10 "${API_URL}/health" >/dev/null 2>&1; then
      failures=0
    elif curl -fsS -m 5 "http://127.0.0.1:${API_PORT}/health" >/dev/null 2>&1; then
      failures=$((failures + 1))
      if (( failures >= 2 )); then
        print "[$(date +%T)] public API unreachable; restarting tunnel" >>"${TUNNEL_LOG}"
        pkill -f -- "-R 127.0.0.1:${API_PORT}:127.0.0.1:${API_PORT}" 2>/dev/null || true
        failures=0
      fi
    fi
  done
}

tunnel_loop &
TUNNEL_LOOP_PID=$!
watchdog_loop &
WATCHDOG_PID=$!

cleanup() {
  kill "${WATCHDOG_PID}" "${TUNNEL_LOOP_PID}" 2>/dev/null || true
  pkill -f -- "-R 127.0.0.1:${API_PORT}:127.0.0.1:${API_PORT}" 2>/dev/null || true
}
trap cleanup EXIT INT TERM

for attempt in {1..30}; do
  curl -fsS -m 5 "${API_URL}/health" >/dev/null 2>&1 && break
  sleep 1
done
if ! curl -fsS -m 5 "${API_URL}/health" >/dev/null 2>&1; then
  print -u2 "The tunnel did not come up. See ${TUNNEL_LOG}."
  exit 1
fi

print ""
print "  API:   ${API_URL}"
print "  Metro: ${METRO_URL}"
print "  Expo:  ${EXPO_URL}   (fixed — scan once, reuse every run)"
print "  Logs:  ${TUNNEL_LOG}"
print ""
npx -y qrcode --small "${EXPO_URL}" 2>/dev/null || true

cd "${APP_DIRECTORY}"
# Runs in the foreground so Expo's keys (r = reload, j = debugger) keep working. Ctrl+C stops everything.
EXPO_PUBLIC_TUNNEL_API_URL="${API_URL}" \
EXPO_PACKAGER_PROXY_URL="${METRO_URL}" \
  npx -y node@22 ./node_modules/expo/bin/cli start --lan --clear
