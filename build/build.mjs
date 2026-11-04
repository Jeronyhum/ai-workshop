// Cross-platform builder for the single-file installer: ssu-opencode-setup.cmd
// Usage: node build/build.mjs [buildDir]   (default: this file's directory)
// Produces the exact same polyglot layout as build.ps1:
//   batch header -> base64 zip(payload) -> #!UNIX bash bootstrap
// build.ps1 remains for Windows-only maintainers; this file is canonical —
// when the header/tail text changes, change it here and mirror it there.
import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";
import { fileURLToPath } from "node:url";

const buildDir = process.argv[2] || path.dirname(fileURLToPath(import.meta.url));
const payloadDir = path.join(buildDir, "payload");
const out = path.join(buildDir, "ssu-opencode-setup.cmd");

const REQUIRED = [
  "install.ps1", "install.sh",
  "payload/gen_config.mjs", "payload/AGENTS.md", "payload/normalize_skills.mjs",
  "payload/mcp/ssu-bridge.mjs",
  "payload/hud/status.mjs", "payload/hud/hud.ps1", "payload/hud/hud.html",
  "payload/hud/server.mjs", "payload/hud/hud.sh",
  "payload/skill/vibe-coach/SKILL.md",
  "payload/command/credits.md", "payload/command/usage.md",
  "payload/command/websearch.md", "payload/command/decide.md",
  "payload/command/poteto.md", "payload/command/start.md",
  "payload/plugins/jev-router.js",
];

// ---------- stage (in memory: map of archive path -> Buffer) ----------
const files = new Map();
function walk(dir, prefix) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    const rel = prefix ? prefix + "/" + e.name : e.name;
    if (e.isDirectory()) walk(full, rel);
    else if (e.isFile()) files.set(rel, fs.readFileSync(full));
  }
}
walk(payloadDir, "payload");
// installers live at the archive root, not under payload/
files.set("install.ps1", files.get("payload/install.ps1"));
files.set("install.sh", files.get("payload/install.sh"));
files.delete("payload/install.ps1");
files.delete("payload/install.sh");

const missing = REQUIRED.filter((f) => !files.has(f));
if (missing.length) {
  console.error("MISSING:\n  " + missing.join("\n  "));
  process.exit(1);
}
console.log(`staged ${REQUIRED.length} required files`);

// ---------- encoding rules ----------
// .ps1: Windows PowerShell 5.1 reads UTF-8 as ANSI without a BOM -> ensure BOM.
// install.sh: a BOM breaks the shebang -> hard-fail the build if present.
let bomAdded = 0;
for (const [name, buf] of files) {
  if (name.endsWith(".ps1") && !(buf[0] === 0xef && buf[1] === 0xbb && buf[2] === 0xbf)) {
    files.set(name, Buffer.concat([Buffer.from([0xef, 0xbb, 0xbf]), buf]));
    bomAdded++;
  }
}
const sh = files.get("install.sh");
if (sh[0] === 0xef && sh[1] === 0xbb && sh[2] === 0xbf) {
  console.error("install.sh starts with a UTF-8 BOM — that breaks its shebang. Remove it.");
  process.exit(1);
}
console.log(`ps1 BOM added to ${bomAdded}`);

// ---------- zip (store/deflate, no external deps) ----------
const CRC_TABLE = (() => {
  const t = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c;
  }
  return t;
})();
function crc32(buf) {
  let c = -1;
  for (let i = 0; i < buf.length; i++) c = (c >>> 8) ^ CRC_TABLE[(c ^ buf[i]) & 0xff];
  return (c ^ -1) >>> 0;
}
function zip(entries) {
  const chunks = [];
  const central = [];
  let offset = 0;
  for (const [name, data] of entries) {
    const nameBuf = Buffer.from(name, "utf8");
    const comp = zlib.deflateRawSync(data, { level: 9 });
    const crc = crc32(data);
    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(20, 4);
    local.writeUInt16LE(0x0800, 6); // UTF-8 filename flag
    local.writeUInt16LE(8, 8); // deflate
    local.writeUInt32LE(crc, 14);
    local.writeUInt32LE(comp.length, 18);
    local.writeUInt32LE(data.length, 22);
    local.writeUInt16LE(nameBuf.length, 26);
    chunks.push(local, nameBuf, comp);
    const cen = Buffer.alloc(46);
    cen.writeUInt32LE(0x02014b50, 0);
    cen.writeUInt16LE(20, 4);
    cen.writeUInt16LE(20, 6);
    cen.writeUInt16LE(0x0800, 8);
    cen.writeUInt16LE(8, 10);
    cen.writeUInt32LE(crc, 16);
    cen.writeUInt32LE(comp.length, 20);
    cen.writeUInt32LE(data.length, 24);
    cen.writeUInt16LE(nameBuf.length, 28);
    cen.writeUInt32LE(offset, 42);
    central.push(cen, nameBuf);
    offset += 30 + nameBuf.length + comp.length;
  }
  const centralSize = central.reduce((n, b) => n + b.length, 0);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(entries.length, 8);
  end.writeUInt16LE(entries.length, 10);
  end.writeUInt32LE(centralSize, 12);
  end.writeUInt32LE(offset, 16);
  return Buffer.concat([...chunks, ...central, end]);
}

const zipBuf = zip([...files.entries()].sort((a, b) => (a[0] < b[0] ? -1 : 1)));
const b64 = zipBuf.toString("base64");
const b64Block = (b64.match(/.{1,120}/g) || []).join("\n");

// ---------- compose ----------
// The batch part runs install.ps1 as its OWN powershell -File process: `exit` inside
// install.ps1 used to kill the wrapper's host mid-line, skipping the exit-code report
// and temp cleanup exactly on failure. Extraction happens in a short -Command that
// only writes the temp dir path to a file the batch then reads.
const header = `: SSU x OpenCode setup. Windows: double-click this file. macOS/Linux: bash this file
:; if [ -z "$SSU_SELF" ]; then SSU_SELF="$0" exec bash -c "$(sed -n '/^#!UNIX/,$p' "$0" | tr -d '\\r')"; fi #
@echo off
setlocal EnableExtensions
chcp 65001 >nul 2>&1
set "SSU_SELF=%~f0"
echo.
echo   SSU x OpenCode setup
echo   Keep this window open until it finishes.
echo.
set "SSU_DIR_FILE=%TEMP%\\ssu-setup-dir.txt"
if exist "%SSU_DIR_FILE%" del "%SSU_DIR_FILE%" >nul 2>&1
powershell -NoProfile -ExecutionPolicy Bypass -Command "$s=$env:SSU_SELF; $t=[IO.File]::ReadAllText($s); $m=[regex]::Match($t,'(?s)===PAYLOAD-BEGIN===[ \\t\\r]*\\n(.*?)\\n===PAYLOAD-END==='); if(-not $m.Success){Write-Host '  [X] Installer is corrupted (no payload)' -ForegroundColor Red; exit 1}; $z=Join-Path $env:TEMP ('ssu-setup-'+[guid]::NewGuid().ToString('N')); New-Item -ItemType Directory -Path $z -Force | Out-Null; [IO.File]::WriteAllBytes((Join-Path $z 'p.zip'),[Convert]::FromBase64String($m.Groups[1].Value)); Expand-Archive -Path (Join-Path $z 'p.zip') -DestinationPath $z -Force; [IO.File]::WriteAllText($env:SSU_DIR_FILE,$z)"
if not exist "%SSU_DIR_FILE%" goto ssu_fail
set /p SSU_DIR=<"%SSU_DIR_FILE%"
powershell -NoProfile -ExecutionPolicy Bypass -File "%SSU_DIR%\\install.ps1"
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
===PAYLOAD-BEGIN===`;

const tail = `===PAYLOAD-END===
#!UNIX
#!/usr/bin/env bash
# macOS / Linux bootstrap: extract the zip that is embedded above, then run install.sh.
set -uo pipefail

SELF="\${SSU_SELF:-$0}"
TMPDIR_SSU="$(mktemp -d 2>/dev/null || mktemp -d -t ssu)"
trap 'rm -rf "$TMPDIR_SSU"' EXIT

fail() { echo "설치 파일을 풀지 못했습니다. 파일이 손상됐을 수 있으니 다시 받아주세요. ($1)" >&2; exit 1; }

if command -v base64 >/dev/null 2>&1; then
  # tr -d '\\r' first: the payload lines end in CRLF and GNU base64 rejects CRs
  # (the BSD/macOS decoder tolerates them, which is how this used to pass unnoticed).
  sed -n '/^===PAYLOAD-BEGIN===/,/^===PAYLOAD-END===/p' "$SELF" | sed '1d;$d' | tr -d '\\r' | base64 --decode > "$TMPDIR_SSU/p.zip" 2>/dev/null \\
    || sed -n '/^===PAYLOAD-BEGIN===/,/^===PAYLOAD-END===/p' "$SELF" | sed '1d;$d' | tr -d '\\r' | base64 -D > "$TMPDIR_SSU/p.zip" \\
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

SSU_PAYLOAD="$TMPDIR_SSU/x/payload" bash "$TMPDIR_SSU/x/install.sh"`;

let text = header + "\n" + b64Block + "\n" + tail + "\n";
// cmd.exe + batch labels are only reliable with CRLF; the unix bootstrap strips CR.
text = text.replace(/(?<!\r)\n/g, "\r\n");
fs.writeFileSync(out, text, "utf8");
console.log(`wrote ${out} (${fs.statSync(out).size.toLocaleString()} bytes, zip ${zipBuf.length.toLocaleString()} bytes)`);
