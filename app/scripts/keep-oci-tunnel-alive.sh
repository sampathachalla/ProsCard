#!/bin/zsh

set -u

export PATH="/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin"
APP_DIRECTORY="/Users/sampath/Desktop/MindPros/ProsCard/app"

while true; do
  cd "${APP_DIRECTORY}" || exit 1
  /bin/zsh "${APP_DIRECTORY}/scripts/start-oci-tunnel.sh" </dev/null
  sleep 2
done
