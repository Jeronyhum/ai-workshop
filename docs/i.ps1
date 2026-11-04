# SSU x OpenCode workshop — one-line installer bootstrap (Windows)
# Students run:  irm jeronyhum.github.io/ai-workshop/i.ps1 | iex
$ErrorActionPreference = 'Stop'
$url = 'https://raw.githubusercontent.com/Jeronyhum/ai-workshop/main/build/ssu-opencode-setup.cmd'
$dst = Join-Path $env:TEMP 'ssu-opencode-setup.cmd'
Write-Host ''
Write-Host '  SSU x OpenCode workshop installer' -ForegroundColor Cyan
Write-Host '  Downloading the installer...' -ForegroundColor DarkGray
Invoke-WebRequest -Uri $url -OutFile $dst -UseBasicParsing
Unblock-File -Path $dst -ErrorAction SilentlyContinue
Write-Host '  Starting setup — follow the prompts (you will paste your SSU API key once).' -ForegroundColor DarkGray
Write-Host ''
& $dst
