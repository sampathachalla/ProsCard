#!/bin/zsh

set -euo pipefail

export PATH="/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin"

SCRIPT_DIRECTORY="${0:A:h}"
APP_DIRECTORY="${SCRIPT_DIRECTORY:h}"
RUNTIME_DIRECTORY="/tmp/proscard-cellular"
API_LOG="${RUNTIME_DIRECTORY}/api-tunnel.log"
METRO_TUNNEL_LOG="${RUNTIME_DIRECTORY}/metro-tunnel.log"
METRO_LOG="${RUNTIME_DIRECTORY}/metro.log"
STATUS_FILE="${RUNTIME_DIRECTORY}/status.env"

mkdir -p "${RUNTIME_DIRECTORY}"
: >"${API_LOG}"
: >"${METRO_TUNNEL_LOG}"
: >"${METRO_LOG}"
: >"${STATUS_FILE}"

start_reverse_tunnel() {
  local port="$1"
  local log_file="$2"
  ssh -tt \
    -o StrictHostKeyChecking=no \
    -o ServerAliveInterval=30 \
    -o ServerAliveCountMax=3 \
    -o ExitOnForwardFailure=yes \
    -R "80:127.0.0.1:${port}" \
    nokey@localhost.run >"${log_file}" 2>&1 &
  REPLY=$!
}

wait_for_url() {
  local log_file="$1"
  local url=""
  for attempt in {1..60}; do
    url=$(grep -Eo 'https://[a-zA-Z0-9.-]+\.lhr\.life' "${log_file}" | head -1 || true)
    if [[ "${url}" == https://* ]]; then
      print -r -- "${url}"
      return 0
    fi
    sleep 0.5
  done
  return 1
}

API_URL="${EXPO_PUBLIC_TUNNEL_API_URL:-}"
API_TUNNEL_PID=""
if [[ -z "${API_URL}" ]]; then
  start_reverse_tunnel 8050 "${API_LOG}"
  API_TUNNEL_PID="${REPLY}"
  API_URL=$(wait_for_url "${API_LOG}") || {
    print -u2 "Backend tunnel failed to publish. See ${API_LOG}."
    exit 1
  }
fi

# Anonymous localhost.run sessions created in the same instant can be assigned the
# same hostname. Stagger them so Metro and the API always receive separate routes.
sleep 3
start_reverse_tunnel 8081 "${METRO_TUNNEL_LOG}"
METRO_TUNNEL_PID="${REPLY}"
METRO_HTTPS_URL=$(wait_for_url "${METRO_TUNNEL_LOG}") || {
  print -u2 "Metro tunnel failed to publish. See ${METRO_TUNNEL_LOG}."
  exit 1
}
if [[ "${METRO_HTTPS_URL}" == "${API_URL}" ]]; then
  print -u2 "Tunnel provider assigned the same URL to Metro and the API; retry startup."
  exit 1
fi
METRO_HOST="${METRO_HTTPS_URL#https://}"
EXPO_URL="exp://${METRO_HOST}"

cd "${APP_DIRECTORY}"
EXPO_PUBLIC_TUNNEL_API_URL="${API_URL}" \
EXPO_PACKAGER_PROXY_URL="${METRO_HTTPS_URL}" \
  npx -y node@22 ./node_modules/expo/bin/cli start --lan --clear >"${METRO_LOG}" 2>&1 &
METRO_PID=$!

cleanup() {
  kill "${METRO_PID}" "${METRO_TUNNEL_PID}" 2>/dev/null || true
  if [[ -n "${API_TUNNEL_PID}" ]]; then
    kill "${API_TUNNEL_PID}" 2>/dev/null || true
  fi
}
trap cleanup EXIT INT TERM

for attempt in {1..120}; do
  if curl -fsS http://127.0.0.1:8081/status >/dev/null 2>&1; then
    break
  fi
  sleep 0.5
done

if ! curl -fsS http://127.0.0.1:8081/status >/dev/null 2>&1; then
  print -u2 "Metro failed to start. See ${METRO_LOG}."
  exit 1
fi

{
  print -r -- "EXPO_URL=${EXPO_URL}"
  print -r -- "API_URL=${API_URL}"
  print -r -- "SUPERVISOR_PID=$$"
} >"${STATUS_FILE}"

print "Expo: ${EXPO_URL}"
print "API: ${API_URL}"
print "Logs: ${RUNTIME_DIRECTORY}"

wait
