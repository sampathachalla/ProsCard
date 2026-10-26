#!/bin/zsh

set -euo pipefail

export PATH="/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin"

SCRIPT_DIRECTORY="${0:A:h}"
APP_DIRECTORY="${SCRIPT_DIRECTORY:h}"

cd "${APP_DIRECTORY}"

# SDK 58 shows a runtime chooser whenever expo-dev-client is installed. On iOS that chooser can
# open the older VC Pros binary instead of Expo Go, producing missing-native-module and LAN URL
# errors. Disable only the chooser; --go still explicitly selects the Expo Go runtime.
EXPO_NO_REDIRECT_PAGE=1 \
EXPO_PUBLIC_BACKEND_TARGET=tunnel \
  npx expo start --go --tunnel --clear
