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

function Ask-Intent {
    if ($DryRun) { return @{ label = "dry-run"; note = "테스트" } }
    Say ""
    Say "이번 워크숍에서 무엇을 만들고 싶나요? 번호를 고르거나 직접 적어주세요."
    Say "  1) 업무 자동화 (엑셀·메일·보고서 반복 작업 줄이기)"
    Say "  2) 정보 수집 도구 (뉴스·공고·논문·부동산을 모아 요약)"
    Say "  3) 개인용 웹앱 (가계부·할일·습관·기록)"
    Say "  4) 글쓰기 도우미 (초안·요약·번역·교정)"
    Say "  5) 데이터 분석 (CSV·공공데이터로 표와 그래프)"
    Say "  6) 아직 모르겠음 (같이 정하기)"
    $pick = Read-Host "선택"
    if (-not $pick) { $pick = "6" }
    $map = @{
        "1" = "업무 자동화"
        "2" = "정보 수집 도구"
        "3" = "개인용 웹앱"
        "4" = "글쓰기 도우미"
        "5" = "데이터 분석"
        "6" = "아직 모르겠음"
    }
    $label = $map[$pick.Trim()]
    if (-not $label) { $label = if ($pick.Trim()) { $pick.Trim() } else { "아직 모르겠음" } }
    Say ""
    Say "한 문장으로 더 적어주세요. 예: '매일 아침 공지사항을 요약해서 메일로 받고 싶다'"
    $note = Read-Host "만들고 싶은 것"
    if (-not $note) { $note = "(아직 구체화되지 않음)" }
    return @{ label = $label; note = $note }
}

# =====================================================================
Head "SSU x OpenCode 원클릭 설치"
Say "  대상 폴더: $Root"
if ($DryRun) { Warn "연습 모드입니다. 실제 파일을 쓰지 않습니다." }

# ---------------- 1. 기반 프로그램 ----------------
Head "1/7 기반 프로그램 확인"

if ($SkipApps) {
    Warn "앱 설치를 건너뜁니다 (-SkipApps)"
}
else {
    if (-not (Have winget)) {
        Fail "winget이 없습니다. Microsoft Store에서 'App Installer'를 설치한 뒤 다시 실행하세요."
        Fail "Windows 10 1809 미만이면 https://opencode.ai/download 에서 설치 파일을 직접 받으세요."
        exit 1
    }
    Ok "winget 준비됨"

    if (Have node) {
        $nv = (node --version) -replace "^v", ""
        Ok "Node v$nv"
        $major = [int]($nv.Split(".")[0])
        $minor = [int]($nv.Split(".")[1])
        if ($major -lt 22 -or ($major -eq 22 -and $minor -lt 5)) {
            Warn "Node 22.5 이상이 필요합니다 (HUD가 SQLite를 읽습니다). LTS로 업그레이드합니다."
            Ensure-WingetPackage "OpenJS.NodeJS.LTS" "Node.js LTS"
        }
    }
    else {
        Step "Node.js 설치 중 (1~3분)"
        Ensure-WingetPackage "OpenJS.NodeJS.LTS" "Node.js LTS"
    }

    if (Have git) { Ok ((git --version) -replace "git version ", "Git ") }
    else { Step "Git 설치 중"; Ensure-WingetPackage "Git.Git" "Git" }

    if (Have uv) { Ok ((uv --version) -replace "uv ", "uv ") }
    else { Step "uv 설치 중"; Ensure-WingetPackage "astral-sh.uv" "uv" }

    # Journey rule: if the app is already there, skip the install entirely.
    $ocDesktop = @(
        (Join-Path $env:LOCALAPPDATA "Programs\OpenCode\OpenCode.exe"),
        (Join-Path $env:LOCALAPPDATA "OpenCode\OpenCode.exe")
    ) | Where-Object { Test-Path $_ } | Select-Object -First 1
    if ($ocDesktop) { Ok "OpenCode Desktop 이미 설치됨" }
    else {
        Step "OpenCode Desktop 설치 중"
        Ensure-WingetPackage "SST.OpenCodeDesktop" "OpenCode Desktop"
    }
    if (Have opencode) { Ok "OpenCode CLI 이미 설치됨" }
    else {
        Step "OpenCode CLI 설치 중"
        Ensure-WingetPackage "SST.opencode" "OpenCode CLI"
    }

    Refresh-Path
}

if (-not (Have node)) {
    Fail "Node.js를 찾지 못했습니다. https://nodejs.org 에서 LTS를 설치한 뒤 다시 실행하세요."
    exit 1
}

# ---------------- 2. 키 ----------------
Head "2/7 SSU API 키"
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
Head "3/7 설정 파일 배치"
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
Head "4/7 모델 설정 생성 (61개 모델 + 게이트웨이 MCP)"
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
Head "5/7 코드 도구 (Serena + graphify)"
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

# ---------------- 6. 스킬 팩 (pstack / spec-kit) ----------------
Head "6/7 워크플로 스킬 (pstack, spec-kit)"
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

# ---------------- 7. 의도 + HUD ----------------
Head "7/7 시작 설정"
$intent = Ask-Intent
if (-not $DryRun) {
    $intentPath = Join-Path $Root "PROJECT_INTENT.md"
    $body = @(
        "# 이번 워크숍에서 만들 것",
        "",
        "- 분류: $($intent.label)",
        "- 한 문장: $($intent.note)",
        "",
        "## 첫 대화에서 할 일",
        "",
        "1. 위 한 문장을 확인하고, 빠진 것만 3개 이하로 묻는다.",
        "2. 유사 제품 3개와 차별점을 정리한다.",
        "3. Must / Should / Won't 로 범위를 자른다.",
        "4. 스택과 예상 API 비용을 제시한다.",
        "5. 첫 30분 작업 하나를 정하고 시작한다."
    )
    [IO.File]::WriteAllLines($intentPath, $body, (New-Object Text.UTF8Encoding($false)))
    Ok "의도 저장: $intentPath"

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
}

# ---------------- 끝 ----------------
Say ""
Say "설치가 끝났습니다." -ForegroundColor Green
Say ""
Say "  1) OpenCode Desktop을 실행하세요."
Say "  2) 모델을 고르세요. 목록의 'BAZE (Claude)' 또는 'BAZE' 아래 모델이 전부 SSU 게이트웨이입니다."
Say "  3) 첫 대화에 이렇게 입력하세요:"
$seed = if ($intent.note -and $intent.note -notlike "(아직*") { $intent.note } else { $intent.label }
Say "       `"$seed`" 로 시작하고 싶어. 뭐부터 하면 돼?"
Say "     코치 스킬이 먼저 질문부터 합니다. 코드를 바로 쓰지 않습니다."
Say ""
Say "  HUD(크레딧/컨텍스트): 화면 우측 상단 막대. 안 보이면:"
Say "     powershell -NoProfile -ExecutionPolicy Bypass -File `"$Root\hud\hud.ps1`""
Say ""
Say "  명령: /credits  /usage  /websearch  /decide"
Say "  스펙 주도 개발: 프로젝트 폴더에서 /speckit.specify -> /speckit.plan -> /speckit.tasks"
if ($script:projectDir) { Say "  이번 프로젝트 폴더: $script:projectDir" }
Say ""
