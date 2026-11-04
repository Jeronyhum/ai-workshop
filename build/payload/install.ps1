param(
    [string]$Key = $(if ($env:SSU_API_KEY) { $env:SSU_API_KEY } elseif ($env:SSU_KEY) { $env:SSU_KEY } else { "" }),
    [string]$Root = $(if ($env:SSU_CONFIG_DIR) { $env:SSU_CONFIG_DIR } elseif ($env:SSU_ROOT) { $env:SSU_ROOT } else { Join-Path $env:USERPROFILE ".config\opencode" }),
    [switch]$DryRun,
    [switch]$SkipApps,
    [switch]$SkipTools
)

if ($env:SSU_DRY_RUN -eq "1") { $DryRun = $true }
if ($env:SSU_SKIP_APPS -eq "1") { $SkipApps = $true }
if ($env:SSU_SKIP_TOOLS -eq "1") { $SkipTools = $true }

$ErrorActionPreference = "Stop"
try { [Console]::OutputEncoding = [Text.Encoding]::UTF8 } catch { }
$ProgressPreference = "SilentlyContinue"

function Say($m) { Write-Host $m }
function Head($m) { Write-Host ""; Write-Host "== $m" -ForegroundColor Cyan }
function Ok($m) { Write-Host "  [OK] $m" -ForegroundColor Green }
function Warn($m) { Write-Host "  [!] $m" -ForegroundColor Yellow }
function Fail($m) { Write-Host "  [X] $m" -ForegroundColor Red }
function Step($m) { Write-Host "  ... $m" -ForegroundColor DarkGray }

function Have($cmd) { return [bool](Get-Command $cmd -ErrorAction SilentlyContinue) }

# Native tools (uv, git, specify) write progress to stderr. With ErrorActionPreference=Stop,
# PowerShell 5.1 turns that into a terminating error, so native calls run with Continue.
function Invoke-Native {
    param([string]$Exe, [string[]]$Argv)
    $prev = $ErrorActionPreference
    $ErrorActionPreference = "Continue"
    try {
        $lines = & $Exe @Argv 2>&1
        $code = $LASTEXITCODE
        return @{ code = $code; out = (($lines | Out-String).Trim()) }
    }
    catch {
        return @{ code = 1; out = $_.Exception.Message }
    }
    finally { $ErrorActionPreference = $prev }
}

function Tail($text, $n) {
    if (-not $text) { return "" }
    $all = $text -split "`r?`n" | Where-Object { $_.Trim() }
    return (($all | Select-Object -Last $n) -join " / ")
}

function Refresh-Path {
    $m = [Environment]::GetEnvironmentVariable("Path", "Machine")
    $u = [Environment]::GetEnvironmentVariable("Path", "User")
    $env:Path = "$m;$u"
}

function Ensure-WingetPackage($id, $label) {
    if ($DryRun) { Step "(dry-run) winget install $id"; return }
    $p = Start-Process winget -ArgumentList @("install", "--id", $id, "-e", "--silent", "--accept-package-agreements", "--accept-source-agreements") -Wait -PassThru -NoNewWindow
    # 0 = installed, -1978335189 (0x8A15002B) = already up to date
    if ($p.ExitCode -eq 0) { Ok "$label 설치"; return }
    if ($p.ExitCode -eq -1978335189) { Ok "$label 이미 설치됨"; return }
    Warn "$label 설치 실패 (code $($p.ExitCode)). 직접 실행: winget install --id $id -e"
}

# ---- Direct-download installs (no winget) --------------------------------
# winget needs Windows 10 1809+ and the Store App Installer; older or
# locked-down machines have neither. Every base app also ships an official
# standalone installer, so the fallback downloads and runs those silently
# instead of asking the student to fetch files by hand.

function Get-GithubLatestAsset($repo, $pattern) {
    try {
        $rel = Invoke-RestMethod -Uri "https://api.github.com/repos/$repo/releases/latest" -TimeoutSec 60 -Headers @{ "User-Agent" = "ssu-installer" }
        $asset = $rel.assets | Where-Object { $_.name -match $pattern } | Select-Object -First 1
        if ($asset) { return $asset.browser_download_url }
    } catch {}
    return $null
}

function Save-Url($url, $name) {
    $dst = Join-Path $env:TEMP $name
    Invoke-WebRequest -Uri $url -OutFile $dst -UseBasicParsing -TimeoutSec 1200
    return $dst
}

function Install-NodeDirect {
    Step "Node.js 직접 다운로드 설치 중"
    $ver = $null
    try {
        $idx = Invoke-RestMethod -Uri "https://nodejs.org/dist/index.json" -TimeoutSec 60
        $hit = $idx | Where-Object { $_.version -like "v22.*" -and $_.lts } | Select-Object -First 1
        if ($hit) { $ver = $hit.version }
    } catch {}
    if (-not $ver) { $ver = "v22.11.0" }
    try {
        $msi = Save-Url "https://nodejs.org/dist/$ver/node-$ver-x64.msi" "node-$ver-x64.msi"
        $p = Start-Process msiexec.exe -ArgumentList @("/i", $msi, "/quiet", "/norestart") -Verb RunAs -Wait -PassThru
        if ($p.ExitCode -eq 0 -or $p.ExitCode -eq 3010) { Ok "Node.js $ver 설치" }
        else { Warn "Node.js 설치 실패 (code $($p.ExitCode))" }
    } catch { Warn "Node.js 직접 설치 실패: $($_.Exception.Message)" }
}

function Install-GitDirect {
    $url = Get-GithubLatestAsset "git-for-windows/git" "^Git-.*-64-bit\.exe$"
    if (-not $url) { Warn "Git 다운로드 주소를 찾지 못했습니다"; return }
    Step "Git 직접 다운로드 설치 중"
    try {
        $exe = Save-Url $url "git-installer.exe"
        $p = Start-Process $exe -ArgumentList @("/VERYSILENT", "/NORESTART") -Verb RunAs -Wait -PassThru
        if ($p.ExitCode -eq 0) { Ok "Git 설치" } else { Warn "Git 설치 실패 (code $($p.ExitCode))" }
    } catch { Warn "Git 직접 설치 실패: $($_.Exception.Message)" }
}

function Install-UvDirect {
    Step "uv 직접 설치 중 (공식 설치 스크립트)"
    try {
        Invoke-Expression (Invoke-RestMethod -Uri "https://astral.sh/uv/install.ps1" -TimeoutSec 60)
        $uvbin = Join-Path $env:USERPROFILE ".local\bin"
        if (Test-Path $uvbin) { $env:Path = "$uvbin;$env:Path" }
    } catch { Warn "uv 직접 설치 실패: $($_.Exception.Message)" }
}

function Install-DesktopDirect {
    $url = Get-GithubLatestAsset "anomalyco/opencode" "^opencode-desktop-win-x64\.exe$"
    if (-not $url) { Warn "OpenCode Desktop 다운로드 주소를 찾지 못했습니다"; return }
    Step "OpenCode Desktop 직접 다운로드 설치 중"
    try {
        $exe = Save-Url $url "opencode-desktop-win-x64.exe"
        $p = Start-Process $exe -ArgumentList @("/S") -Verb RunAs -Wait -PassThru
        if ($p.ExitCode -eq 0) { Ok "OpenCode Desktop 설치" } else { Warn "OpenCode Desktop 설치 실패 (code $($p.ExitCode))" }
    } catch { Warn "OpenCode Desktop 직접 설치 실패: $($_.Exception.Message)" }
}

function Install-CliDirect {
    # npm on Windows is a .cmd shim; Start-Process "npm" can resolve the
    # extensionless Unix shim instead and die with "%1 is not a valid Win32
    # application" (seen on a real machine, 2026-11-04). Call npm.cmd by its
    # full path, and never let a failure here abort the installer — the ZIP
    # route is the fallback, and even total CLI failure is non-fatal.
    $npmCmd = (Get-Command npm.cmd -ErrorAction SilentlyContinue).Source
    if ($npmCmd) {
        Step "OpenCode CLI 설치 중 (npm)"
        try {
            & $npmCmd install -g opencode-ai 2>&1 | Out-Null
            if ($LASTEXITCODE -eq 0) { Ok "OpenCode CLI 설치 (npm)"; return }
            Warn "npm 설치 실패 (code $LASTEXITCODE) — ZIP으로 재시도합니다"
        } catch { Warn "npm 실행 실패 — ZIP으로 재시도합니다" }
    }
    $url = Get-GithubLatestAsset "anomalyco/opencode" "^opencode-windows-x64\.zip$"
    if (-not $url) { Warn "OpenCode CLI 다운로드 주소를 찾지 못했습니다"; return }
    Step "OpenCode CLI 직접 다운로드 설치 중"
    try {
        $zip = Save-Url $url "opencode-windows-x64.zip"
        $dest = Join-Path $env:LOCALAPPDATA "Programs\OpenCodeCLI"
        New-Item -ItemType Directory -Path $dest -Force | Out-Null
        Expand-Archive -Path $zip -DestinationPath $dest -Force
        $exeDir = $null
        if (Test-Path (Join-Path $dest "opencode.exe")) { $exeDir = $dest }
        else {
            $found = Get-ChildItem $dest -Recurse -Filter "opencode.exe" | Select-Object -First 1
            if ($found) { $exeDir = $found.DirectoryName }
        }
        if ($exeDir) {
            $userPath = [Environment]::GetEnvironmentVariable("Path", "User")
            if ($userPath -notlike "*$exeDir*") { [Environment]::SetEnvironmentVariable("Path", "$userPath;$exeDir", "User") }
            $env:Path = "$exeDir;$env:Path"
            Ok "OpenCode CLI 설치 (ZIP)"
        }
        else { Warn "OpenCode CLI 압축 해제 후 실행 파일을 찾지 못했습니다" }
    } catch { Warn "OpenCode CLI 직접 설치 실패: $($_.Exception.Message)" }
}

function Ensure-NodeInstall {
    if ($DryRun) { Step "(dry-run) Node.js LTS 설치"; return }
    if (Have winget) { Ensure-WingetPackage "OpenJS.NodeJS.LTS" "Node.js LTS"; Refresh-Path }
    if (-not (Have node)) { Install-NodeDirect; Refresh-Path }
}

function Ensure-GitInstall {
    if ($DryRun) { Step "(dry-run) Git 설치"; return }
    if (Have winget) { Ensure-WingetPackage "Git.Git" "Git"; Refresh-Path }
    if (-not (Have git)) { Install-GitDirect; Refresh-Path }
}

function Ensure-UvInstall {
    if ($DryRun) { Step "(dry-run) uv 설치"; return }
    if (Have winget) { Ensure-WingetPackage "astral-sh.uv" "uv"; Refresh-Path }
    if (-not (Have uv)) { Install-UvDirect; Refresh-Path }
}

function Read-KeyInteractive($prompt) {
    $sec = Read-Host $prompt -AsSecureString
    $ptr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($sec)
    try { return [Runtime.InteropServices.Marshal]::PtrToStringBSTR($ptr) }
    finally { [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($ptr) }
}

function Ask-Key {
    if ($Key) { return $Key }
    if ($DryRun) { return "sk-dry-run" }
    Say ""
    Say "SSU 대시보드에서 API 키를 발급받아 붙여넣으세요."
    Say "  https://ssu.factchat.bot/dashboard/developers  ->  Keys  ->  Create key"
    Say "  입력한 키는 화면에 보이지 않습니다."
    # Open the dashboard for them — creating the key is the one manual step.
    try { Start-Process "https://ssu.factchat.bot/dashboard/developers" } catch {}
    return Read-KeyInteractive "API 키"
}

function Test-Key($k) {
    if ($DryRun) { return @{ ok = $true; remaining = 5000; quota = 5000 } }
    try {
        $c = Invoke-RestMethod -Uri "https://factchat-cloud.mindlogic.ai/v1/gateway/credits/" -Headers @{ Authorization = "Bearer $k" } -TimeoutSec 30
        return @{ ok = $true; remaining = $c.total.remaining; quota = $c.total.quota }
    }
    catch {
        $code = 0
        if ($_.Exception.Response) { $code = [int]$_.Exception.Response.StatusCode }
        return @{ ok = $false; code = $code }
    }
}

# =====================================================================
Head "SSU x OpenCode 원클릭 설치"
Say "  대상 폴더: $Root"
if ($DryRun) { Warn "연습 모드입니다. 실제 파일을 쓰지 않습니다." }

# ---------------- 1. 기반 프로그램 ----------------
Head "1/6 기반 프로그램 확인"

if ($SkipApps) {
    Warn "앱 설치를 건너뜁니다 (-SkipApps)"
}
else {
    if (Have winget) { Ok "winget 준비됨" }
    else { Warn "winget이 없어 공식 설치 파일로 직접 설치합니다 (자동 진행)" }

    if (Have node) {
        $nv = (node --version) -replace "^v", ""
        Ok "Node v$nv"
        $major = [int]($nv.Split(".")[0])
        $minor = [int]($nv.Split(".")[1])
        if ($major -lt 22 -or ($major -eq 22 -and $minor -lt 5)) {
            Warn "Node 22.5 이상이 필요합니다 (HUD가 SQLite를 읽습니다). LTS로 업그레이드합니다."
            Ensure-NodeInstall
        }
    }
    else {
        Step "Node.js 설치 중 (1~3분)"
        Ensure-NodeInstall
    }

    if (Have git) { Ok ((git --version) -replace "git version ", "Git ") }
    else { Step "Git 설치 중"; Ensure-GitInstall }

    if (Have uv) { Ok ((uv --version) -replace "uv ", "uv ") }
    else { Step "uv 설치 중"; Ensure-UvInstall }

    # Journey rule: if the app is already there, skip the install entirely.
    $ocDesktop = @(
        (Join-Path $env:LOCALAPPDATA "Programs\OpenCode\OpenCode.exe"),
        (Join-Path $env:LOCALAPPDATA "OpenCode\OpenCode.exe")
    ) | Where-Object { Test-Path $_ } | Select-Object -First 1
    if ($ocDesktop) { Ok "OpenCode Desktop 이미 설치됨" }
    else {
        Step "OpenCode Desktop 설치 중"
        if ($DryRun) { Step "(dry-run) OpenCode Desktop 설치" }
        else {
            if (Have winget) { Ensure-WingetPackage "SST.OpenCodeDesktop" "OpenCode Desktop" }
            $ocDesktop = @(
                (Join-Path $env:LOCALAPPDATA "Programs\OpenCode\OpenCode.exe"),
                (Join-Path $env:LOCALAPPDATA "OpenCode\OpenCode.exe")
            ) | Where-Object { Test-Path $_ } | Select-Object -First 1
            if (-not $ocDesktop) { Install-DesktopDirect }
        }
    }
    if (Have opencode) { Ok "OpenCode CLI 이미 설치됨" }
    else {
        Step "OpenCode CLI 설치 중"
        if ($DryRun) { Step "(dry-run) OpenCode CLI 설치" }
        else {
            if (Have winget) { Ensure-WingetPackage "SST.opencode" "OpenCode CLI"; Refresh-Path }
            if (-not (Have opencode)) { Install-CliDirect; Refresh-Path }
        }
    }

    Refresh-Path
}

if (-not (Have node)) {
    Fail "Node.js를 찾지 못했습니다. https://nodejs.org 에서 LTS를 설치한 뒤 다시 실행하세요."
    exit 1
}

# ---------------- 2. 키 ----------------
Head "2/6 SSU API 키"
$apiKey = Ask-Key
if (-not $apiKey) { Fail "키가 비어 있습니다."; exit 1 }
$check = Test-Key $apiKey
$tries = 1
while (-not $check.ok -and $tries -lt 3) {
    if ($check.code -eq 401 -or $check.code -eq 403) {
        Fail "키가 거부되었습니다 (HTTP $($check.code)). 대시보드에서 새 키를 발급받으세요."
    }
    else {
        Fail "키 확인 실패 (HTTP $($check.code)). 네트워크 또는 게이트웨이 상태를 확인하세요."
    }
    # Always ask for a FRESH key here. Ask-Key would return the same $Key that just
    # failed (when it came from -Key/env) and burn all retries on an identical check.
    if ($DryRun) { break }
    $apiKey = Read-KeyInteractive "새 API 키"
    if (-not $apiKey) { exit 1 }
    $check = Test-Key $apiKey
    $tries++
}
if (-not $check.ok) {
    Warn "키 검증에 실패했지만 계속 진행할 수 있습니다. 나중에 $Root\.env 를 고치면 됩니다."
    $go = Read-Host "계속할까요? (y/N)"
    if ($go -ne "y" -and $go -ne "Y") { exit 1 }
}
else {
    Ok ("키 검증 완료: {0:N1} / {1:N0} 크레딧" -f [double]$check.remaining, [double]$check.quota)
}

# ---------------- 3. 파일 ----------------
Head "3/6 설정 파일 배치"
$payload = Join-Path $PSScriptRoot "payload"
if (-not (Test-Path $payload)) { $payload = $PSScriptRoot }
if (-not (Test-Path (Join-Path $payload "gen_config.mjs"))) {
    Fail "설치 파일이 손상되었습니다. gen_config.mjs를 찾지 못했습니다."
    exit 1
}

if ($DryRun) {
    Step "(dry-run) $Root 에 파일을 쓰지 않습니다"
}
else {
    New-Item -ItemType Directory -Path $Root -Force | Out-Null
    # Payload folders are singular (skill/command); opencode's documented layout is
    # plural (skills/commands). Singular still loads in 1.19.x, plural is the safe form.
    foreach ($pair in @(@("hud", "hud"), @("mcp", "mcp"), @("skill", "skills"), @("command", "commands"), @("plugins", "plugins"))) {
        $src = Join-Path $payload $pair[0]
        if (Test-Path $src) {
            New-Item -ItemType Directory -Path (Join-Path $Root $pair[1]) -Force | Out-Null
            Copy-Item (Join-Path $src "*") (Join-Path $Root $pair[1]) -Recurse -Force
        }
    }
    foreach ($f in @("gen_config.mjs", "normalize_skills.mjs", "AGENTS.md")) {
        $src = Join-Path $payload $f
        if (Test-Path $src) {
            $dst = Join-Path $Root $f
            if (($f -eq "AGENTS.md") -and (Test-Path $dst)) {
                Copy-Item $dst "$dst.bak-$(Get-Date -Format 'yyyyMMdd-HHmmss')" -Force
                Warn "기존 AGENTS.md 백업 후 교체"
            }
            Copy-Item $src $dst -Force
        }
    }
    Ok "HUD·MCP 브리지·스킬·명령 복사"
}

$envPath = Join-Path $Root ".env"
if ($DryRun) { Step "(dry-run) .env 생략" }
else {
    $lines = @("# SSU 게이트웨이 키. 이 파일을 남에게 보내지 마세요.", "SSU_API_KEY=$apiKey")
    [IO.File]::WriteAllLines($envPath, $lines, (New-Object Text.UTF8Encoding($false)))
    try {
        icacls $envPath /inheritance:r /grant:r "$($env:USERNAME):(R,W)" | Out-Null
        Ok "키를 $envPath 에 저장 (본인 계정만 읽기)"
    }
    catch { Ok "키를 $envPath 에 저장" }
}

# ---------------- 4. 모델 설정 ----------------
Head "4/6 모델 설정 생성 (61개 모델 + 게이트웨이 MCP)"
$cfgPath = Join-Path $Root "opencode.jsonc"
if ($DryRun) {
    Step "(dry-run) gen_config.mjs 생략"
}
else {
    if (Test-Path $cfgPath) {
        $bak = "$cfgPath.bak-" + (Get-Date -Format "yyyyMMdd-HHmmss")
        Copy-Item $cfgPath $bak -Force
        Warn "기존 설정 백업: $(Split-Path $bak -Leaf)"
    }
    $gen = Join-Path $Root "gen_config.mjs"
    $serenaExe = ""
    if (Have serena) { $serenaExe = (Get-Command serena).Source }
    Step "게이트웨이에서 모델 목록을 받는 중 (10초 이내)"
    $r = Invoke-Native "node" @($gen, $apiKey, $Root, $serenaExe)
    if ($r.out) { $r.out -split "`r?`n" | ForEach-Object { Say "    $_" } }
    if ($r.code -ne 0) {
        Fail "모델 설정 생성 실패. 키와 네트워크를 확인하세요."
        exit 1
    }
    Ok "opencode.jsonc 생성"
}

# ---------------- 5. 코드 도구 ----------------
Head "5/6 코드 도구 (Serena + graphify)"
if ($SkipTools) {
    Warn "건너뜁니다 (-SkipTools)"
}
elseif ($DryRun) {
    Step "(dry-run) uv tool install 생략"
}
elseif (-not (Have uv)) {
    Warn "uv가 없어 건너뜁니다. 설치 후 다시 실행하거나 직접 실행하세요."
    Say "    uv tool install -p 3.13 serena-agent"
}
else {
    Step "Serena 설치 중 (심볼 단위 코드 탐색, 1~2분)"
    $r = Invoke-Native "uv" @("tool", "install", "-p", "3.13", "serena-agent")
    if ($r.code -eq 0) { Ok "Serena 설치" }
    else { Warn "Serena 설치 실패 (code $($r.code)): $(Tail $r.out 2)" }

    Refresh-Path
    $serenaExe = ""
    if (Have serena) { $serenaExe = (Get-Command serena).Source }
    else {
        $guess = Join-Path $env:USERPROFILE ".local\bin\serena.exe"
        if (Test-Path $guess) { $serenaExe = $guess }
    }

    if ($serenaExe) {
        Step "설정에 MCP 서버 등록"
        # The re-run result decides whether "MCP 등록" may be claimed. Discarding its
        # output/exit code (the old `2>&1 | Out-Null`) printed [OK] for registrations
        # that never landed — and under EAP=Stop a warning-only run could kill the
        # installer before sections 6-7. Invoke-Native avoids both.
        $r = Invoke-Native "node" @($gen, $apiKey, $Root, $serenaExe)
        if ($r.code -eq 0) { Ok "Serena MCP 등록" }
        else {
            Warn "MCP 등록을 위한 설정 재생성 실패 (모델 설정은 그대로입니다): $(Tail $r.out 2)"
        }
    }
    else { Warn "Serena 실행 파일을 찾지 못했습니다" }

    Step "graphify 설치 중 (프로젝트 구조 지도)"
    $r = Invoke-Native "uv" @("tool", "install", "graphifyy")
    if ($r.code -eq 0) {
        Refresh-Path
        # Drops the graphify skill + hook into the opencode config dir.
        $r2 = Invoke-Native "graphify" @("install", "--platform", "opencode")
        if ($r2.code -eq 0) { Ok "graphify 설치 (스킬 등록 포함)" }
        else { Warn "graphify 스킬 등록 실패. 세션에서 graphify install --platform opencode 를 실행하세요" }
    }
    else { Warn "graphify 설치 실패 (code $($r.code)): $(Tail $r.out 2)" }
}

function Find-OdCli {
    if (Have od) { return (Get-Command od).Source }
    $cands = @(
        (Join-Path $env:LOCALAPPDATA "Programs\OpenDesign\od.exe"),
        (Join-Path $env:LOCALAPPDATA "Programs\Open Design\od.exe"),
        (Join-Path $env:LOCALAPPDATA "Programs\OpenDesign\resources\od.exe"),
        (Join-Path $env:LOCALAPPDATA "Programs\Open Design\resources\od.exe"),
        (Join-Path $env:ProgramFiles "OpenDesign\od.exe")
    )
    $hit = $cands | Where-Object { Test-Path $_ } | Select-Object -First 1
    if ($hit) { return $hit }
    # The real install layout differs from the guessed paths on some builds
    # (seen on a real machine, 2026-11-04: app installed, od.exe elsewhere).
    # Search the actual install roots instead of giving up.
    foreach ($rootDir in @((Join-Path $env:LOCALAPPDATA "Programs"), $env:ProgramFiles, ${env:ProgramFiles(x86)})) {
        if (-not $rootDir -or -not (Test-Path $rootDir)) { continue }
        $foundFile = Get-ChildItem $rootDir -Recurse -Filter "od.exe" -ErrorAction SilentlyContinue | Select-Object -First 1
        if ($foundFile) { return $foundFile.FullName }
    }
    return $null
}

# Open Design (선택 구성요소): 로컬 퍼스트 AI 디자인 데스크톱 앱 (nexu-io/open-design).
# 실패해도 전체 설치를 중단하지 않고 Warn으로 끝낸다.
function Install-OpenDesign {
    if ($DryRun) { Step "(dry-run) Open Design: 최신 릴리스의 Windows 설치 파일로 설치 예정"; return }
    $appDirs = @(
        (Join-Path $env:LOCALAPPDATA "Programs\OpenDesign"),
        (Join-Path $env:LOCALAPPDATA "Programs\Open Design"),
        (Join-Path $env:ProgramFiles "OpenDesign"),
        (Join-Path $env:ProgramFiles "Open Design")
    )
    $pf86 = ${env:ProgramFiles(x86)}
    if ($pf86) {
        $appDirs += (Join-Path $pf86 "OpenDesign")
        $appDirs += (Join-Path $pf86 "Open Design")
    }
    $found = $appDirs | Where-Object { Test-Path $_ } | Select-Object -First 1
    if (-not $found) { $preOd = Find-OdCli; if ($preOd) { $found = Split-Path $preOd } }
    if ($found) {
        Ok "Open Design 이미 설치됨"
    }
    else {
        Step "Open Design 설치 중 (디자인 도구, 약 465MB 내려받음)"
        try {
            $rel = Invoke-RestMethod -Uri "https://api.github.com/repos/nexu-io/open-design/releases/latest" -TimeoutSec 60
            $asset = $rel.assets | Where-Object { $_.name -like "open-design-*-win-x64-setup.exe" } | Select-Object -First 1
            if (-not $asset) { throw "최신 릴리스에서 Windows 설치 파일(open-design-*-win-x64-setup.exe)을 찾지 못했습니다" }
            $exe = Join-Path $env:TEMP $asset.name
            Invoke-WebRequest -Uri $asset.browser_download_url -OutFile $exe -TimeoutSec 1800
            # electron-builder NSIS 설치 파일: /S 무인 설치를 시도한다.
            $p = Start-Process $exe -ArgumentList "/S" -Wait -PassThru
            if ($p.ExitCode -eq 0) { Ok "Open Design 설치 ($($rel.tag_name))" }
            else { Warn "Open Design 무인 설치 실패 (code $($p.ExitCode)) — 아래에서 설치 창 방식으로 재시도합니다" }
            $script:odSetupExe = $exe
        }
        catch {
            Warn "Open Design 설치를 건너뜁니다: $($_.Exception.Message)"
            Warn "직접 설치: https://github.com/nexu-io/open-design/releases"
            return
        }
    }

    # OpenCode에 Open Design MCP 연결 (best-effort). od가 없으면 건너뛴다.
    Refresh-Path
    $od = Find-OdCli
    # 무인 설치 직후에는 파일이 늦게 나타날 수 있어 잠시 기다리며 다시 찾는다.
    for ($i = 0; -not $od -and $i -lt 12; $i++) { Start-Sleep -Seconds 5; $od = Find-OdCli }
    if (-not $od -and $script:odSetupExe -and (Test-Path $script:odSetupExe)) {
        # 최후의 자동 수단: 설치 창을 직접 띄운다 (학생은 안내대로 설치만 마르면 된다).
        Warn "자동 설치로 CLI를 찾지 못해 설치 창을 띄웁니다. 설치를 마쳐주세요."
        try {
            Start-Process $script:odSetupExe -Wait
            $od = Find-OdCli
        } catch {}
    }
    if ($od) {
        $r = Invoke-Native $od @("mcp", "install", "opencode")
        if ($r.code -eq 0) { Ok "Open Design MCP를 OpenCode에 연결" }
        else { Warn "Open Design MCP 연결 실패 (code $($r.code)). 직접 실행: od mcp install opencode" }
    }
    else {
        Warn "od CLI를 찾지 못해 MCP 연결을 건너뜁니다. Open Design을 한 번 실행한 뒤 다시 시도하거나 직접 실행하세요: od mcp install opencode"
    }
}

if ($SkipTools) {
    Warn "Open Design 건너뜁니다 (-SkipTools)"
}
else {
    Install-OpenDesign
}

# ---------------- 6. 스킬 팩 (pstack / spec-kit) ----------------
Head "6/6 워크플로 스킬 (pstack, spec-kit)"
$workDir = Join-Path $env:USERPROFILE "ssu-workshop"
if ($DryRun) {
    Step "(dry-run) pstack 복제와 spec-kit 초기화 생략"
}
else {
    New-Item -ItemType Directory -Path $workDir -Force | Out-Null

    if ((Have git) -and (Have node)) {
        $vendor = Join-Path $Root "vendor\cursor-plugins"
        if (-not (Test-Path (Join-Path $vendor "pstack\skills"))) {
            Step "pstack 내려받는 중 (cursor/plugins, 약 18MB)"
            New-Item -ItemType Directory -Path (Split-Path $vendor -Parent) -Force | Out-Null
            $r = Invoke-Native "git" @("clone", "--depth", "1", "https://github.com/cursor/plugins.git", $vendor)
            if ($r.code -ne 0) { Warn "git clone 실패: $(Tail $r.out 2)" }
        }
        $skillsSrc = Join-Path $vendor "pstack\skills"
        if (Test-Path $skillsSrc) {
            $norm = Join-Path $Root "normalize_skills.mjs"
            $r = Invoke-Native "node" @($norm, $skillsSrc, (Join-Path $Root "skills"))
            if ($r.out) { $r.out -split "`r?`n" | ForEach-Object { Say "    $_" } }
            if ($r.code -eq 0) {
                $ver = "?"
                try { $ver = (Get-Content -Raw (Join-Path $vendor "pstack\plugin.json") | ConvertFrom-Json).version } catch { }
                Ok "pstack 스킬 등록 (v$ver). opencode 명령: /poteto"
            }
            else { Warn "pstack 스킬 일부가 건너뛰어졌습니다 (위 skip 줄 확인). 나머지는 등록됐습니다" }
        }
        else { Warn "pstack 복제 실패 - 스킬을 건너뜁니다" }
    }
    else { Warn "git 또는 node가 없어 pstack을 건너뜁니다" }

    if (Have uv) {
        Step "spec-kit 설치 중"
        $r = Invoke-Native "uv" @("tool", "install", "specify-cli")
        if ($r.code -ne 0) { Warn "specify-cli 설치 실패: $(Tail $r.out 2)" }
        Refresh-Path
        if (Have specify) {
            Ok "specify-cli 설치"
            $projName = "project-" + (Get-Date -Format "MMdd-HHmm")
            $projDir = Join-Path $workDir $projName
            New-Item -ItemType Directory -Path $projDir -Force | Out-Null
            Push-Location $projDir
            try {
                $r = Invoke-Native "specify" @("init", "--here", "--force", "--non-interactive", "--integration", "opencode")
                if ($r.code -eq 0) {
                    Ok "프로젝트 초기화: $projDir (/speckit.* 명령 사용 가능)"
                    $script:projectDir = $projDir
                }
                else { Warn "specify init 실패 (code $($r.code)): $(Tail $r.out 2)" }
            }
            finally { Pop-Location }
        }
        else { Warn "specify-cli 설치 실패 - 나중에: uv tool install specify-cli" }
    }
    else { Warn "uv가 없어 spec-kit을 건너뜁니다" }
}

# ---------------- 마무리: HUD + OpenCode 바로 실행 ----------------
# 의도 입력(구 7단계)은 설치기에서 받지 않는다. OpenCode가 바로 열리고,
# /start가 앱 안에서 탐정 단계로 의도를 파악하는 것이 정식 흐름이다.
Head "마무리"
if (-not $DryRun) {
    # HUD 시작프로그램 등록
    $hud = Join-Path $Root "hud\hud.ps1"
    if (Test-Path $hud) {
        try {
            $startup = [Environment]::GetFolderPath("Startup")
            $lnk = Join-Path $startup "SSU HUD.lnk"
            $ws = New-Object -ComObject WScript.Shell
            $sc = $ws.CreateShortcut($lnk)
            $sc.TargetPath = "powershell.exe"
            $sc.Arguments = "-NoProfile -WindowStyle Hidden -ExecutionPolicy Bypass -File `"$hud`""
            $sc.WorkingDirectory = Join-Path $Root "hud"
            $sc.Save()
            Ok "크레딧/컨텍스트 HUD를 시작프로그램에 등록"
            Start-Process powershell -ArgumentList @("-NoProfile", "-WindowStyle", "Hidden", "-ExecutionPolicy", "Bypass", "-File", $hud)
        }
        catch { Warn "HUD 등록 실패: $($_.Exception.Message)" }
    }

    # /start를 클립보드에 넣어 둔다: 학생은 새 세션 입력칸에 붙여넣기만 하면 된다.
    try { Set-Clipboard "/start" } catch {}

    # OpenCode Desktop 바로 실행 — 프로젝트 폴더 고르는 화면이 첫 화면이 된다.
    $ocExe = @(
        (Join-Path $env:LOCALAPPDATA "Programs\OpenCode\OpenCode.exe"),
        (Join-Path $env:LOCALAPPDATA "OpenCode\OpenCode.exe")
    ) | Where-Object { Test-Path $_ } | Select-Object -First 1
    if ($ocExe) {
        Start-Process $ocExe
        Ok "OpenCode Desktop 실행 중"
    }
    else { Warn "OpenCode Desktop 실행 파일을 찾지 못했습니다. 시작 메뉴에서 OpenCode를 실행하세요." }
}

# ---------------- 끝 ----------------
Say ""
Say "설치가 끝났습니다. OpenCode가 바로 열립니다." -ForegroundColor Green
Say ""
Say "  1) 열린 OpenCode에서 프로젝트 폴더를 고르세요. (처음이면 새 폴더를 만들어 선택)"
Say "  2) 새 세션 입력칸에 붙여넣기(Ctrl+V) 하세요. '/start'가 클립보드에 들어 있습니다."
Say "  3) Enter — /start가 만들고 싶은 것부터 질문으로 파악합니다."
Say ""
Say "  모델은 목록의 'BAZE' 계열이 전부 SSU 게이트웨이입니다."
Say "  HUD(크레딧/컨텍스트): 화면 우측 상단 막대. 끄려면 막대 우측 위 ✕, 우클릭 메뉴, 또는 Esc."
Say "  명령: /credits  /usage  /websearch  /decide"
Say "  스펙 주도 개발: 프로젝트 폴더에서 /speckit.specify -> /speckit.plan -> /speckit.tasks"
Say ""
