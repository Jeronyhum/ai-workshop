# Assembles the single-file installer: ssu-opencode-setup.cmd
# Layout: polyglot header -> batch bootstrap -> base64 zip -> unix bootstrap
# Paths are relative to this script (an earlier version hardcoded the original
# author's C:\Users\sonar temp dir, so the build only worked on his machine).
# NOTE: build.mjs is the canonical builder (runs anywhere Node runs). Keep the
# header/tail text below in sync with it.
$ErrorActionPreference = "Stop"

$build = $PSScriptRoot
$stage = Join-Path $build "stage"
$out = Join-Path $build "ssu-opencode-setup.cmd"
$zip = Join-Path $build "payload.zip"

# ---------- stage ----------
if (Test-Path $stage) { Remove-Item -Recurse -Force $stage }
New-Item -ItemType Directory -Path $stage -Force | Out-Null
New-Item -ItemType Directory -Path (Join-Path $stage "payload") -Force | Out-Null

Copy-Item (Join-Path $build "payload\*") (Join-Path $stage "payload") -Recurse -Force

# installers live at the archive root
Copy-Item (Join-Path $build "payload\install.ps1") (Join-Path $stage "install.ps1") -Force
Copy-Item (Join-Path $build "payload\install.sh") (Join-Path $stage "install.sh") -Force
Remove-Item (Join-Path $stage "payload\install.ps1") -Force
Remove-Item (Join-Path $stage "payload\install.sh") -Force

# ---------- verify required files ----------
$required = @(
    "install.ps1", "install.sh",
    "payload\gen_config.mjs", "payload\AGENTS.md", "payload\normalize_skills.mjs",
    "payload\mcp\ssu-bridge.mjs",
    "payload\hud\status.mjs", "payload\hud\hud.ps1", "payload\hud\hud.html",
    "payload\hud\server.mjs", "payload\hud\hud.sh",
    "payload\skill\vibe-coach\SKILL.md",
    "payload\command\credits.md", "payload\command\usage.md",
    "payload\command\websearch.md", "payload\command\decide.md",
    "payload\command\poteto.md", "payload\command\start.md",
    "payload\plugins\jev-router.js"
)
$missing = @()
foreach ($f in $required) {
    if (-not (Test-Path (Join-Path $stage $f))) { $missing += $f }
}
if ($missing.Count -gt 0) {
    Write-Host "MISSING:" -ForegroundColor Red
    $missing | ForEach-Object { Write-Host "  $_" }
    exit 1
}
Write-Host "staged $($required.Count) required files"

# ---------- BOM for every .ps1 (Windows PowerShell 5.1 reads UTF-8 as ANSI without it) ----------
$ps1s = Get-ChildItem $stage -Recurse -Filter "*.ps1"
$bomAdded = 0
foreach ($f in $ps1s) {
    $rawBytes = [IO.File]::ReadAllBytes($f.FullName)
    if ($rawBytes.Length -ge 3 -and $rawBytes[0] -eq 0xEF -and $rawBytes[1] -eq 0xBB -and $rawBytes[2] -eq 0xBF) { continue }
    $withBom = New-Object byte[] ($rawBytes.Length + 3)
    $withBom[0] = 0xEF; $withBom[1] = 0xBB; $withBom[2] = 0xBF
    [Array]::Copy($rawBytes, 0, $withBom, 3, $rawBytes.Length)
    [IO.File]::WriteAllBytes($f.FullName, $withBom)
    $bomAdded++
}
Write-Host "ps1 files: $($ps1s.Count), BOM added to $bomAdded"

# install.sh must NOT carry a BOM: it breaks the shebang (kernel cannot find the
# interpreter). Fail the build instead of shipping a broken unix installer.
$shStage = Join-Path $stage "install.sh"
$shBytes = [IO.File]::ReadAllBytes($shStage)
if ($shBytes.Length -ge 3 -and $shBytes[0] -eq 0xEF -and $shBytes[1] -eq 0xBB -and $shBytes[2] -eq 0xBF) {
    Write-Host "install.sh starts with a UTF-8 BOM - remove it before building" -ForegroundColor Red
    exit 1
}

# ---------- zip ----------
if (Test-Path $zip) { Remove-Item $zip -Force }
Add-Type -AssemblyName System.IO.Compression.FileSystem
[IO.Compression.ZipFile]::CreateFromDirectory($stage, $zip, [IO.Compression.CompressionLevel]::Optimal, $false)

$bytes = [IO.File]::ReadAllBytes($zip)
$b64 = [Convert]::ToBase64String($bytes)
$sb = New-Object Text.StringBuilder
for ($i = 0; $i -lt $b64.Length; $i += 120) {
    $len = [Math]::Min(120, $b64.Length - $i)
    [void]$sb.AppendLine($b64.Substring($i, $len))
}
$b64Block = $sb.ToString().TrimEnd()

# ---------- compose ----------
$header = @'
: SSU x OpenCode setup. Windows: double-click this file. macOS/Linux: bash this file
:; if [ -z "$SSU_SELF" ]; then SSU_SELF="$0" exec bash -c "$(sed -n '/^#!UNIX/,$p' "$0" | tr -d '\r')"; fi #
@echo off
setlocal EnableExtensions
chcp 65001 >nul 2>&1
set "SSU_SELF=%~f0"
echo.
echo   SSU x OpenCode setup
echo   Keep this window open until it finishes.
echo.
set "SSU_DIR_FILE=%TEMP%\ssu-setup-dir.txt"
if exist "%SSU_DIR_FILE%" del "%SSU_DIR_FILE%" >nul 2>&1
powershell -NoProfile -ExecutionPolicy Bypass -Command "$s=$env:SSU_SELF; $t=[IO.File]::ReadAllText($s); $m=[regex]::Match($t,'(?s)===PAYLOAD-BEGIN===[ \t\r]*\n(.*?)\n===PAYLOAD-END==='); if(-not $m.Success){Write-Host '  [X] Installer is corrupted (no payload)' -ForegroundColor Red; exit 1}; $z=Join-Path $env:TEMP ('ssu-setup-'+[guid]::NewGuid().ToString('N')); New-Item -ItemType Directory -Path $z -Force | Out-Null; [IO.File]::WriteAllBytes((Join-Path $z 'p.zip'),[Convert]::FromBase64String($m.Groups[1].Value)); Expand-Archive -Path (Join-Path $z 'p.zip') -DestinationPath $z -Force; [IO.File]::WriteAllText($env:SSU_DIR_FILE,$z)"
if not exist "%SSU_DIR_FILE%" goto ssu_fail
set /p SSU_DIR=<"%SSU_DIR_FILE%"
powershell -NoProfile -ExecutionPolicy Bypass -File "%SSU_DIR%\install.ps1"
set "RC=%ERRORLEVEL%"
if not defined SSU_KEEP rmdir /s /q "%SSU_DIR%" >nul 2>&1
del "%SSU_DIR_FILE%" >nul 2>&1
echo.
if "%RC%"=="0" (echo   Done. You can close this window.) else (echo   Something failed (code %RC%). Read the messages above.)
echo.
if not defined SSU_ARGS pause
endlocal
exit /b %RC%
:ssu_fail
echo   [X] Extraction failed. The file may be corrupted - download it again.
echo.
if not defined SSU_ARGS pause
endlocal
exit /b 1
===PAYLOAD-BEGIN===
'@

$tail = @'
===PAYLOAD-END===
#!UNIX
#!/usr/bin/env bash
# macOS / Linux bootstrap: extract the zip that is embedded above, then run install.sh.
set -uo pipefail

SELF="${SSU_SELF:-$0}"
TMPDIR_SSU="$(mktemp -d 2>/dev/null || mktemp -d -t ssu)"
trap 'rm -rf "$TMPDIR_SSU"' EXIT

fail() { echo "설치 파일을 풀지 못했습니다. 파일이 손상됐을 수 있으니 다시 받아주세요. ($1)" >&2; exit 1; }

if command -v base64 >/dev/null 2>&1; then
  # tr -d '\r' first: the payload lines end in CRLF and GNU base64 rejects CRs
  # (the BSD/macOS decoder tolerates them, which is how this used to pass unnoticed).
  sed -n '/^===PAYLOAD-BEGIN===/,/^===PAYLOAD-END===/p' "$SELF" | sed '1d;$d' | tr -d '\r' | base64 --decode > "$TMPDIR_SSU/p.zip" 2>/dev/null \
    || sed -n '/^===PAYLOAD-BEGIN===/,/^===PAYLOAD-END===/p' "$SELF" | sed '1d;$d' | tr -d '\r' | base64 -D > "$TMPDIR_SSU/p.zip" \
    || fail "base64 decode"
else
  echo "base64 명령이 없습니다." >&2
  exit 1
fi
[ -s "$TMPDIR_SSU/p.zip" ] || fail "empty payload"

if command -v unzip >/dev/null 2>&1; then
  unzip -q "$TMPDIR_SSU/p.zip" -d "$TMPDIR_SSU/x" || fail "unzip"
else
  python3 -c "import zipfile,sys; zipfile.ZipFile(sys.argv[1]).extractall(sys.argv[2])" "$TMPDIR_SSU/p.zip" "$TMPDIR_SSU/x" || fail "python zipfile"
fi
[ -f "$TMPDIR_SSU/x/install.sh" ] || fail "install.sh missing after extract"

SSU_PAYLOAD="$TMPDIR_SSU/x/payload" bash "$TMPDIR_SSU/x/install.sh"
'@

$text = $header + "`r`n" + $b64Block + "`r`n" + $tail
# cmd.exe + batch labels are only reliable with CRLF; bash strips the CR back out.
$text = $text -replace "(?<!`r)`n", "`r`n"
[IO.File]::WriteAllText($out, $text, (New-Object Text.UTF8Encoding($false)))

$size = (Get-Item $out).Length
Write-Host ("wrote {0} ({1:N0} bytes, zip {2:N0} bytes)" -f $out, $size, $bytes.Length)
