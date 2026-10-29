#!/bin/zsh

set -u

export PATH="/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin"
# Resolve the deployed app beside this script. Launch agents can always read the
# /private/tmp runtime copy, while macOS may deny background access to Desktop.
APP_DIRECTORY="${0:A:h:h}"

while true; do
  cd "${APP_DIRECTORY}" || exit 1
  /bin/zsh "${APP_DIRECTORY}/scripts/start-oci-tunnel.sh" </dev/null
  sleep 2
done
