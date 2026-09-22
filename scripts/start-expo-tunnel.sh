#!/bin/zsh

set -euo pipefail

export PATH="/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin"

SCRIPT_DIRECTORY="${0:A:h}"
APP_DIRECTORY="${SCRIPT_DIRECTORY:h}"
TUNNEL_HOST="idu1omw-sampath2001-8081.exp.direct"
TUNNEL_URL="https://${TUNNEL_HOST}"
EXPO_URL="exp://${TUNNEL_HOST}"
NGROK_BINARY="${APP_DIRECTORY}/node_modules/@expo/ngrok-bin-darwin-arm64/ngrok"
NGROK_LOG="/tmp/proscard-ngrok.log"

if [[ ! -x "${NGROK_BINARY}" ]]; then
  print -u2 "Expo's ngrok binary is missing. Run npm install first."
  exit 1
fi

"${NGROK_BINARY}" start --none --log=stdout --config="${HOME}/.expo/ngrok.yml" >"${NGROK_LOG}" 2>&1 &
NGROK_PROCESS_ID=$!

cleanup() {
  kill "${NGROK_PROCESS_ID}" 2>/dev/null || true
}

trap cleanup EXIT INT TERM

for attempt in {1..50}; do
  if curl -fsS http://127.0.0.1:4040/api/tunnels >/dev/null 2>&1; then
    break
  fi
  sleep 0.2
done

if ! curl -fsS http://127.0.0.1:4040/api/tunnels >/dev/null 2>&1; then
  print -u2 "ngrok did not start. See ${NGROK_LOG}."
  exit 1
fi

TUNNEL_RESPONSE=$(curl -fsS -X POST http://127.0.0.1:4040/api/tunnels \
  -H 'Content-Type: application/json' \
  --data "{\"name\":\"proscard\",\"addr\":\"http://127.0.0.1:8081\",\"proto\":\"http\",\"hostname\":\"${TUNNEL_HOST}\",\"bind_tls\":true}")

if [[ "${TUNNEL_RESPONSE}" != *"${TUNNEL_URL}"* ]]; then
  print -u2 "Unable to create the Expo tunnel: ${TUNNEL_RESPONSE}"
  exit 1
fi

print "\nProsCard Expo Go tunnel QR:\n"
npx -y qrcode --small "${EXPO_URL}"
print "Tunnel URL: ${EXPO_URL}\n"

cd "${APP_DIRECTORY}"
EXPO_PACKAGER_PROXY_URL="${TUNNEL_URL}" \
  npx -y node@22 ./node_modules/expo/bin/cli start --lan
