#!/usr/bin/env bash
# SSU x OpenCode workshop — one-line installer bootstrap (macOS / Linux)
# Students run:  curl -fsSL jeronyhum.github.io/ai-workshop/i.sh | bash
set -e
url='https://raw.githubusercontent.com/Jeronyhum/ai-workshop/main/build/ssu-opencode-setup.cmd'
tmp="$(mktemp -d)"
echo ''
echo '  SSU x OpenCode workshop installer'
echo '  Downloading the installer...'
curl -fsSL "$url" -o "$tmp/ssu-opencode-setup.cmd"
echo '  Starting setup — follow the prompts (you will paste your SSU API key once).'
echo ''
# stdin must be the terminal, not the (already consumed) pipe, so the
# installer's interactive key prompt can read from it.
bash "$tmp/ssu-opencode-setup.cmd" < /dev/tty
