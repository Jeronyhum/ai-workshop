#!/usr/bin/env bash
# HUD launcher for macOS / Linux: start the local dashboard server, open it in a browser.
# Usage: ./hud.sh [--print]
set -euo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PORT="${SSU_HUD_PORT:-8788}"

if [ "${1:-}" = "--print" ]; then
  node --no-warnings "$HERE/status.mjs"
  exit 0
fi

node "$HERE/server.mjs" --port="$PORT" &
SERVER_PID=$!
trap 'kill "$SERVER_PID" 2>/dev/null || true' EXIT INT TERM

URL="http://127.0.0.1:${PORT}/"
sleep 1

if command -v open >/dev/null 2>&1; then
  open "$URL"
elif command -v xdg-open >/dev/null 2>&1; then
  xdg-open "$URL" >/dev/null 2>&1
else
  echo "브라우저에서 여세요: $URL"
fi

echo "HUD 실행 중: $URL  (Ctrl+C 로 종료)"
wait "$SERVER_PID"
