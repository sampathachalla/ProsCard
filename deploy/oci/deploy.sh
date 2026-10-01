#!/bin/zsh
# Deploys the ProsCard backend (Postgres + API + share page) to the OCI instance.
#
#   zsh deploy/oci/deploy.sh               # code changes: sync, rebuild, migrate, health check
#   zsh deploy/oci/deploy.sh --web         # also rebuild the public share page first (app → api/web)
#   zsh deploy/oci/deploy.sh --secrets     # also re-send api/.env and the credential files
#
# Data lives in the server's Docker volume and is never touched by this script.
# Excludes are anchored (/api/...): the share page's own assets/node_modules (icon fonts) must be sent.

set -euo pipefail

ROOT="${0:A:h:h:h}"
OCI_HOST="${OCI_HOST:-150.136.12.178}"
OCI_USER="${OCI_USER:-ubuntu}"
OCI_SSH_KEY="${OCI_SSH_KEY:-${HOME}/.ssh/id_rsa}"
REMOTE_DIR="proscard"
PUBLIC_URL="https://${OCI_HOST}.nip.io"
# Only the credential files the API reads (see the *_PATH settings in api/.env).
SECRET_FILES=(oci_private.pem pass-cert.pem pass-key.pem wwdr.pem google-wallet.json)
SSH=(ssh -o BatchMode=yes -i "${OCI_SSH_KEY}" "${OCI_USER}@${OCI_HOST}")
COMPOSE="docker compose --env-file api/.env -f deploy/oci/docker-compose.yml"

with_web=0 with_secrets=0
for arg in "$@"; do
  case "${arg}" in
    --web) with_web=1 ;;
    --secrets) with_secrets=1 ;;
    *) print -u2 "Unknown option ${arg}"; exit 1 ;;
  esac
done

cd "${ROOT}"

if (( with_web )); then
  print "→ Building the share page"
  (cd app && npm run build:share >/dev/null)
fi

print "→ Syncing code"
rsync -az --delete -e "ssh -o BatchMode=yes -i ${OCI_SSH_KEY}" \
  --exclude /api/node_modules --exclude /api/dist --exclude '.env' --exclude '.env.*' --include '.env.example' \
  --exclude /api/secrets --exclude /api/secrets_oci --exclude .DS_Store \
  Dockerfile .dockerignore deploy api "${OCI_USER}@${OCI_HOST}:${REMOTE_DIR}/"

if (( with_secrets )); then
  print "→ Sending api/.env and credentials"
  "${SSH[@]}" "mkdir -p ${REMOTE_DIR}/api/secrets && chmod 700 ${REMOTE_DIR}/api/secrets"
  scp -q -o BatchMode=yes -i "${OCI_SSH_KEY}" api/.env "${OCI_USER}@${OCI_HOST}:${REMOTE_DIR}/api/.env"
  scp -q -o BatchMode=yes -i "${OCI_SSH_KEY}" "${SECRET_FILES[@]/#/api/secrets/}" "${OCI_USER}@${OCI_HOST}:${REMOTE_DIR}/api/secrets/"
  "${SSH[@]}" "chmod 600 ${REMOTE_DIR}/api/.env ${REMOTE_DIR}/api/secrets/*"
fi

print "→ Rebuilding and restarting containers"
"${SSH[@]}" "cd ${REMOTE_DIR} && ${COMPOSE} up -d --build --remove-orphans >/tmp/proscard-deploy.log 2>&1 || { tail -20 /tmp/proscard-deploy.log; exit 1; }"

print "→ Waiting for the API"
"${SSH[@]}" 'for i in $(seq 1 40); do [ "$(docker inspect -f "{{.State.Health.Status}}" proscard-api 2>/dev/null)" = healthy ] && exit 0; sleep 3; done; docker logs --tail 30 proscard-api; exit 1'

print "→ Running migrations"
"${SSH[@]}" "cd ${REMOTE_DIR} && ${COMPOSE} exec -T api npm run db:migrate 2>&1 | tail -1"

print "→ Public health check"
curl -fsS -m 10 "${PUBLIC_URL}/ready" && print "\n✓ Deployed: ${PUBLIC_URL}"
