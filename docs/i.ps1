# SSU x OpenCode workshop — one-line installer bootstrap (Windows)
# Students run:  irm jeronyhum.github.io/ai-workshop/i.ps1 | iex
$ErrorActionPreference = 'Stop'
# Cache-bust the download: raw branch-tip files sit in a CDN cache for
# minutes, and a stale copy once re-delivered an already-fixed installer.
$stamp = [DateTimeOffset]::UtcNow.ToUnixTimeSeconds()
$url = "https://raw.githubusercontent.com/Jeronyhum/ai-workshop/main/build/ssu-opencode-setup.cmd?r=$stamp"
$dst = Join-Path $env:TEMP 'ssu-opencode-setup.cmd'
Write-Host ''
Write-Host '  SSU x OpenCode workshop installer' -ForegroundColor Cyan
Write-Host '  Downloading the installer...' -ForegroundColor DarkGray
Invoke-WebRequest -Uri $url -OutFile $dst -UseBasicParsing
Unblock-File -Path $dst -ErrorAction SilentlyContinue
Write-Host '  Starting setup — follow the prompts (you will paste your SSU API key once).' -ForegroundColor DarkGray
Write-Host ''
& $dst
