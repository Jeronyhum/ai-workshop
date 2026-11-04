#!/usr/bin/env bash
# HUD launcher for macOS / Linux: start the local dashboard server, open it in a browser.
# Usage: ./hud.sh [--print]
set -euo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PORT="${SSU_HUD_PORT:-8788}"
# Node may live in ~/.local/bin (installer tarball); a fresh terminal does not
# have it on PATH yet, so resolve it ourselves instead of failing.
export PATH="$HOME/.local/bin:$HOME/.opencode/bin:$PATH"

if [ "${1:-}" = "--print" ]; then
  node --no-warnings "$HERE/status.mjs"
  exit 0
fi

URL="http://127.0.0.1:${PORT}/"
# Already running (autostart + a manual run is the common double): just open
# the tab and succeed, instead of dying on EADDRINUSE with a scary message.
if (command -v curl >/dev/null 2>&1 && curl -fsS -m 1 "$URL" >/dev/null 2>&1) || \
   (command -v wget >/dev/null 2>&1 && wget -q -T 1 -O /dev/null "$URL"); then
  echo "HUD가 이미 실행 중입니다: $URL"
  if command -v open >/dev/null 2>&1; then open "$URL"
  elif command -v xdg-open >/dev/null 2>&1; then xdg-open "$URL" >/dev/null 2>&1; fi
  exit 0
fi

node "$HERE/server.mjs" --port="$PORT" &
SERVER_PID=$!
trap 'kill "$SERVER_PID" 2>/dev/null || true' EXIT INT TERM

URL="http://127.0.0.1:${PORT}/"

# Wait until the server actually answers instead of guessing with a fixed sleep:
# a slow first start used to open the browser onto a connection-refused page.
ready=0
for _ in 1 2 3 4 5 6 7 8 9 10; do
  if ! kill -0 "$SERVER_PID" 2>/dev/null; then
    echo "HUD 서버가 시작되지 않았습니다. 위 메시지를 확인하세요." >&2
    exit 1
  fi
  if (command -v curl >/dev/null 2>&1 && curl -fsS -m 1 "$URL" >/dev/null 2>&1) || \
     (command -v wget >/dev/null 2>&1 && wget -q -T 1 -O /dev/null "$URL"); then
    ready=1; break
  fi
  sleep 0.5
done
[ "$ready" = "1" ] || echo "서버 응답이 느립니다. 잠시 뒤 여세요: $URL"

if command -v open >/dev/null 2>&1; then
  open "$URL"
elif command -v xdg-open >/dev/null 2>&1; then
  xdg-open "$URL" >/dev/null 2>&1
else
  echo "브라우저에서 여세요: $URL"
fi

echo "HUD 실행 중: $URL  (Ctrl+C 로 종료)"
wait "$SERVER_PID"
