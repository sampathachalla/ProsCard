#!/bin/zsh
# Serves Metro (and optionally the local API) through the OCI instance's fixed HTTPS hostnames.
#
#   phone ──https──> Caddy on OCI metro.150.136.12.178.nip.io ──reverse SSH──> this Mac (:8081)
#
# The API now runs on the OCI instance itself (deploy/oci), so by default only Metro is tunnelled.
# TUNNEL_API=1 also forwards this Mac's API on :8050 — only useful if Caddy is pointed back at 8050.
# The hostnames never change, so the Expo URL / QR code stays the same between runs.
# Override the defaults with OCI_HOST, OCI_USER and OCI_SSH_KEY.

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
TUNNEL_API="${TUNNEL_API:-0}"
RUNTIME_DIRECTORY="/tmp/proscard-oci-tunnel"
TUNNEL_LOG="${RUNTIME_DIRECTORY}/tunnel.log"
SSH_KEEPALIVE_SECONDS="${SSH_KEEPALIVE_SECONDS:-5}"
SSH_KEEPALIVE_FAILURES="${SSH_KEEPALIVE_FAILURES:-3}"
TUNNEL_RECONNECT_DELAY_SECONDS="${TUNNEL_RECONNECT_DELAY_SECONDS:-1}"
TUNNEL_WATCHDOG_INTERVAL_SECONDS="${TUNNEL_WATCHDOG_INTERVAL_SECONDS:-10}"

mkdir -p "${RUNTIME_DIRECTORY}"
: >"${TUNNEL_LOG}"

SSH_OPTIONS=(
  -i "${OCI_SSH_KEY}"
  -o BatchMode=yes
  -o ConnectTimeout=15
  -o ServerAliveInterval="${SSH_KEEPALIVE_SECONDS}"
  -o ServerAliveCountMax="${SSH_KEEPALIVE_FAILURES}"
  -o TCPKeepAlive=yes
  -o StrictHostKeyChecking=accept-new
)

if [[ "${TUNNEL_API}" == 1 ]] && ! curl -fsS -m 5 "http://127.0.0.1:${API_PORT}/health" >/dev/null 2>&1; then
  print -u2 "The API is not running on localhost:${API_PORT}. Start it first: cd ../api && npm run docker:up"
  exit 1
fi

# Ports forwarded to this Mac: always Metro; the API only with TUNNEL_API=1.
FORWARDS=(-R "127.0.0.1:${METRO_PORT}:127.0.0.1:${METRO_PORT}")
REMOTE_PORTS="${METRO_PORT}/tcp"
if [[ "${TUNNEL_API}" == 1 ]]; then
  FORWARDS+=(-R "127.0.0.1:${API_PORT}:127.0.0.1:${API_PORT}")
  REMOTE_PORTS="${REMOTE_PORTS} ${API_PORT}/tcp"
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
    "sudo -n fuser -k ${REMOTE_PORTS} >/dev/null 2>&1 || true" >>"${TUNNEL_LOG}" 2>&1 || true
}

# Keeps the reverse tunnel up: reconnects whenever ssh exits (network change, sleep, server restart).
tunnel_loop() {
  while true; do
    free_remote_ports
    print "[$(date +%T)] connecting tunnel" >>"${TUNNEL_LOG}"
    ssh "${SSH_OPTIONS[@]}" -N \
      -o ExitOnForwardFailure=yes \
      "${FORWARDS[@]}" \
      "${OCI_USER}@${OCI_HOST}" >>"${TUNNEL_LOG}" 2>&1 || true
    print "[$(date +%T)] tunnel closed; reconnecting in ${TUNNEL_RECONNECT_DELAY_SECONDS}s" >>"${TUNNEL_LOG}"
    sleep "${TUNNEL_RECONNECT_DELAY_SECONDS}"
  done
}

# If the tunnelled service stops answering publicly while it is healthy locally, drop the ssh session so
# the loop reconnects. It watches Metro, or the API when that is tunnelled too.
watchdog_loop() {
  local failures=0
  local public_check="${METRO_URL}/status" local_check="http://127.0.0.1:${METRO_PORT}/status"
  if [[ "${TUNNEL_API}" == 1 ]]; then
    public_check="${API_URL}/health" local_check="http://127.0.0.1:${API_PORT}/health"
  fi
  while true; do
    sleep "${TUNNEL_WATCHDOG_INTERVAL_SECONDS}"
    if curl -fsS -m 10 "${public_check}" >/dev/null 2>&1; then
      failures=0
    elif curl -fsS -m 5 "${local_check}" >/dev/null 2>&1; then
      failures=$((failures + 1))
      if (( failures >= 2 )); then
        print "[$(date +%T)] tunnel unreachable publicly; restarting it" >>"${TUNNEL_LOG}"
        pkill -f -- "-R 127.0.0.1:${METRO_PORT}:127.0.0.1:${METRO_PORT}" 2>/dev/null || true
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
  pkill -f -- "-R 127.0.0.1:${METRO_PORT}:127.0.0.1:${METRO_PORT}" 2>/dev/null || true
}
trap cleanup EXIT INT TERM

# The API must answer publicly: from this Mac when tunnelled, otherwise from the OCI instance.
for attempt in {1..30}; do
  curl -fsS -m 5 "${API_URL}/health" >/dev/null 2>&1 && break
  sleep 1
done
if ! curl -fsS -m 5 "${API_URL}/health" >/dev/null 2>&1; then
  print -u2 "The API at ${API_URL} is not answering. See ${TUNNEL_LOG}, or check the OCI containers."
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
  npx -y node@22 ./node_modules/expo/bin/cli start --go --lan --clear
