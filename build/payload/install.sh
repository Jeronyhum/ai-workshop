#!/usr/bin/env bash
# SSU x OpenCode installer for macOS / Linux.
# Windows users: double-click the .cmd file instead.
# NOTE: this file must never start with a UTF-8 BOM — it breaks the shebang.
set -uo pipefail

ROOT="${SSU_CONFIG_DIR:-$HOME/.config/opencode}"
BASE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
if [ -f "$BASE/gen_config.mjs" ]; then DEF_PAYLOAD="$BASE"; else DEF_PAYLOAD="$BASE/payload"; fi
PAYLOAD="${SSU_PAYLOAD:-$DEF_PAYLOAD}"
DRY=0
[ "${SSU_DRY_RUN:-0}" = "1" ] && DRY=1

# Defaults up front: the final message uses these even when a step was skipped
# (an unset variable here used to crash the dry run under `set -u`).
LABEL="아직 모르겠음"
NOTE="(아직 구체화되지 않음)"
KEY=""

say()  { printf '%s\n' "$*"; }
head_() { printf '\n== %s\n' "$*"; }
ok()   { printf '  [OK] %s\n' "$*"; }
warn() { printf '  [!] %s\n' "$*"; }
err()  { printf '  [X] %s\n' "$*" >&2; }

have() { command -v "$1" >/dev/null 2>&1; }

OS="$(uname -s)"
ARCH="$(uname -m)"
say "SSU x OpenCode 설치"
say "  OS: $OS $ARCH"
say "  대상 폴더: $ROOT"
[ "$DRY" = "1" ] && warn "연습 모드입니다. 실제로 아무것도 설치하거나 쓰지 않습니다."

# ---------------- 1. prerequisites ----------------
head_ "1/6 기반 프로그램"

install_pkg() {
  # Only used for git (and as a last-resort node fallback): package names are not
  # uniform — Debian's `node` package is NOT Node.js, so node never goes through here
  # as a first choice.
  if [ "$OS" = "Darwin" ]; then
    have brew || { err "Homebrew가 없습니다. https://brew.sh 를 먼저 설치하세요."; return 1; }
    brew install "$1" >/dev/null 2>&1 || brew install --cask "$1" >/dev/null 2>&1
  elif have apt-get; then
    sudo apt-get update -qq && sudo apt-get install -y "$1" >/dev/null 2>&1
  elif have dnf; then
    sudo dnf install -y "$1" >/dev/null 2>&1
  else
    return 1
  fi
}

node_major() {
  have node || { echo 0; return; }
  node -p 'process.versions.node.split(".")[0]' 2>/dev/null || echo 0
}

install_node_tarball() {
  # Official Node.js 22 LTS tarball into ~/.local — no sudo. OS-aware: the
  # tarball name differs (linux/darwin) and darwin ships .tar.gz, not .tar.xz.
  local ver tarch osname ext xflag url dest
  ver="$(curl -fsSL https://nodejs.org/dist/index.json 2>/dev/null | grep -o '"version":"v22\.[0-9.]*"' | head -1 | cut -d'"' -f4)"
  [ -n "$ver" ] || return 1
  case "$ARCH" in
    x86_64) tarch="x64" ;; aarch64|arm64) tarch="arm64" ;; *) return 1 ;;
  esac
  if [ "$OS" = "Darwin" ]; then osname="darwin"; ext="tar.gz"; xflag="z"
  else osname="linux"; ext="tar.xz"; xflag="J"; fi
  url="https://nodejs.org/dist/${ver}/node-${ver}-${osname}-${tarch}.${ext}"
  dest="$HOME/.local/opt/node-${ver}"
  mkdir -p "$HOME/.local/opt" "$HOME/.local/bin"
  curl -fsSL "$url" | tar -x${xflag} -C "$HOME/.local/opt" 2>/dev/null || return 1
  ln -sf "$dest/bin/node" "$HOME/.local/bin/node"
  ln -sf "$dest/bin/npm" "$HOME/.local/bin/npm"
  ln -sf "$dest/bin/npx" "$HOME/.local/bin/npx"
  export PATH="$HOME/.local/bin:$PATH"
  have node
}

if [ "$DRY" = "1" ]; then
  have node && ok "Node $(node --version)" || warn "(연습 모드) Node 없음 — 실제 설치에서는 자동으로 설치합니다"
  have git && ok "$(git --version)" || warn "(연습 모드) Git 없음 — 실제 설치에서는 설치를 시도합니다"
  have uv && ok "$(uv --version)" || warn "(연습 모드) uv 없음 — 실제 설치에서는 자동으로 설치합니다"
  warn "(연습 모드) OpenCode 설치를 건너뜁니다"
else
  if [ "$(node_major)" -ge 22 ]; then ok "Node $(node --version)"; else
    say "  Node.js 22 설치 중"
    if [ "$OS" = "Darwin" ]; then
      install_pkg node@22 >/dev/null 2>&1 || install_pkg node >/dev/null 2>&1 || true
      export PATH="/opt/homebrew/opt/node@22/bin:/usr/local/opt/node@22/bin:$PATH"
    fi
    have node && [ "$(node_major)" -ge 22 ] || install_node_tarball || true
    if have node; then ok "Node $(node --version)"; else
      err "Node.js를 설치하지 못했습니다. https://nodejs.org 에서 설치 후 다시 실행하세요."; exit 1
    fi
    # HUD의 컨텍스트 그래프는 node:sqlite가 필요합니다 (Node 22.5+).
    [ "$(node_major)" -ge 22 ] || warn "Node 22 미만이라 HUD의 컨텍스트 그래프가 동작하지 않을 수 있습니다"
  fi
  if have git; then ok "$(git --version)"; else
    say "  Git 설치 중"; install_pkg git || warn "Git 설치 실패 (스킬 팩을 건너뜁니다)"
  fi
  if have uv; then ok "$(uv --version)"; else
    say "  uv 설치 중"
    curl -LsSf https://astral.sh/uv/install.sh | sh >/dev/null 2>&1 || warn "uv 설치 실패"
    export PATH="$HOME/.local/bin:$PATH"
  fi

  # OpenCode: students use the Desktop app (the CLI comes along for terminal use).
  if have opencode; then ok "OpenCode CLI 이미 설치됨"
  else
    say "  OpenCode CLI 설치 중"
    curl -fsSL https://opencode.ai/v2/install | bash >/dev/null 2>&1 && ok "OpenCode CLI 설치" || warn "CLI 설치 실패: https://opencode.ai/download"
  fi
  export PATH="$HOME/.opencode/bin:$HOME/.local/bin:$PATH"

  if [ "$OS" = "Darwin" ]; then
    if [ -d "/Applications/OpenCode.app" ]; then ok "OpenCode Desktop 이미 설치됨"
    elif have brew; then
      say "  OpenCode Desktop 설치 중"
      brew install --cask opencode-desktop >/dev/null 2>&1 && ok "OpenCode Desktop 설치" || warn "자동 설치 실패: https://opencode.ai/download"
    else warn "Homebrew 없음: https://opencode.ai/download 에서 받으세요"
    fi
  else
    install_desktop_linux() {
      # Official desktop builds ship on the anomalyco/opencode GitHub releases.
      local rel="https://github.com/anomalyco/opencode/releases/latest/download"
      local deb appimg
      case "$ARCH" in
        x86_64) deb="opencode-desktop-linux-amd64.deb"; appimg="opencode-desktop-linux-x86_64.AppImage" ;;
        aarch64|arm64) deb="opencode-desktop-linux-arm64.deb"; appimg="opencode-desktop-linux-arm64.AppImage" ;;
        *) return 1 ;;
      esac
      if have dpkg && curl -fsSL "$rel/$deb" -o "/tmp/$deb" 2>/dev/null; then
        # plain dpkg cannot resolve dependencies (libnotify etc. on minimal
        # systems) — repair with apt-get -f before judging success.
        if sudo dpkg -i "/tmp/$deb" >/dev/null 2>&1 || { have apt-get && sudo apt-get install -f -y >/dev/null 2>&1 && sudo dpkg -i "/tmp/$deb" >/dev/null 2>&1; }; then
          rm -f "/tmp/$deb"; return 0
        fi
        rm -f "/tmp/$deb"
      fi
      # Fallback: AppImage in ~/.local (no sudo needed).
      mkdir -p "$HOME/.local/opt" "$HOME/.local/bin"
      if curl -fsSL "$rel/$appimg" -o "$HOME/.local/opt/opencode-desktop.AppImage" 2>/dev/null; then
        chmod +x "$HOME/.local/opt/opencode-desktop.AppImage"
        ln -sf "$HOME/.local/opt/opencode-desktop.AppImage" "$HOME/.local/bin/opencode-desktop"
        mkdir -p "$HOME/.local/share/applications"
        cat > "$HOME/.local/share/applications/opencode-desktop.desktop" <<EOF
[Desktop Entry]
Type=Application
Name=OpenCode
Exec=$HOME/.local/opt/opencode-desktop.AppImage
Terminal=false
Categories=Development;
EOF
        return 0
      fi
      return 1
    }
    if have opencode-desktop || [ -e /usr/bin/opencode-desktop ] || ls /usr/share/applications/*pencode* >/dev/null 2>&1; then
      ok "OpenCode Desktop 이미 설치됨"
    else
      say "  OpenCode Desktop 설치 중 (Linux)"
      install_desktop_linux && ok "OpenCode Desktop 설치" || warn "데스크톱 자동 설치 실패: https://opencode.ai/download 에서 받아 설치하세요"
    fi
  fi
fi

export PATH="$HOME/.opencode/bin:$HOME/.local/bin:$PATH"

# ---------------- 2. key ----------------
head_ "2/6 SSU API 키"
if [ "$DRY" = "1" ]; then
  KEY="${SSU_API_KEY:-dry-run-key}"
  ok "키 입력·검증 생략 (연습 모드)"
else
  if [ -n "${SSU_API_KEY:-}" ]; then
    KEY="$SSU_API_KEY"
  else
    say ""
    say "SSU 대시보드에서 API 키를 발급받아 붙여넣으세요."
    say "  https://ssu.factchat.bot/dashboard/developers  ->  Keys  ->  Create key"
    # Open the dashboard for them — creating the key is the one manual step.
    if [ "$OS" = "Darwin" ]; then open "https://ssu.factchat.bot/dashboard/developers" >/dev/null 2>&1 || true
    else xdg-open "https://ssu.factchat.bot/dashboard/developers" >/dev/null 2>&1 || true; fi
    printf 'API 키: '
    read -rs KEY
    printf '\n'
  fi
  [ -n "$KEY" ] || { err "키가 비어 있습니다."; exit 1; }

  check_key() {
    curl -s -o /dev/null -w '%{http_code}' -H "Authorization: Bearer $KEY" \
      "https://factchat-cloud.mindlogic.ai/v1/gateway/credits/"
  }
  CODE="$(check_key)"
  if [ "$CODE" = "200" ]; then
    ok "키 검증 완료"
  else
    warn "키 확인 실패 (HTTP $CODE). 계속 진행할 수 있습니다."
    printf '계속할까요? (y/N) '
    read -r GO
    [ "$GO" = "y" ] || [ "$GO" = "Y" ] || exit 1
  fi
fi

# ---------------- 3. files ----------------
head_ "3/6 설정 파일 배치"
if [ "$DRY" = "1" ]; then
  warn "(연습 모드) 파일을 쓰지 않습니다"
else
  mkdir -p "$ROOT"
  # Payload folders are singular (skill/command); opencode's documented layout is
  # plural (skills/commands). Singular still loads in 1.19.x, plural is the safe form.
  copy_fail=0
  for pair in "hud:hud" "mcp:mcp" "skill:skills" "command:commands" "plugins:plugins"; do
    src="${pair%%:*}"; dst="${pair##*:}"
    if [ -d "$PAYLOAD/$src" ]; then
      mkdir -p "$ROOT/$dst"
      cp -R "$PAYLOAD/$src/." "$ROOT/$dst/" || { err "복사 실패: $src -> $dst"; copy_fail=1; }
    fi
  done
  for f in gen_config.mjs normalize_skills.mjs AGENTS.md; do
    if [ -f "$PAYLOAD/$f" ]; then
      if [ "$f" = "AGENTS.md" ] && [ -f "$ROOT/$f" ]; then
        cp "$ROOT/$f" "$ROOT/$f.bak-$(date +%Y%m%d-%H%M%S)"
        warn "기존 AGENTS.md 백업 후 교체"
      fi
      cp "$PAYLOAD/$f" "$ROOT/$f" || { err "복사 실패: $f"; copy_fail=1; }
    fi
  done
  [ "$copy_fail" = "0" ] || { err "파일 복사가 일부 실패했습니다. 디스크 공간·권한을 확인하고 다시 실행하세요."; exit 1; }
  # Verify the pieces the first session depends on actually landed.
  for must in "hud/status.mjs" "mcp/ssu-bridge.mjs" "skills/vibe-coach/SKILL.md" "commands/credits.md" "commands/start.md" "plugins/jev-router.js" "gen_config.mjs"; do
    [ -f "$ROOT/$must" ] || { err "설치 확인 실패: $must 가 없습니다"; exit 1; }
  done
  ok "HUD·MCP 브리지·스킬·명령 복사 + 확인"

  umask 077
  printf '# SSU 게이트웨이 키. 이 파일을 남에게 보내지 마세요.\nSSU_API_KEY=%s\n' "$KEY" > "$ROOT/.env"
  chmod 600 "$ROOT/.env" 2>/dev/null || true
  ok "키를 $ROOT/.env 에 저장 (소유자만 읽기)"
fi

# ---------------- 4. config ----------------
head_ "4/6 모델 설정 생성"
if [ "$DRY" = "1" ]; then
  warn "(연습 모드) 설정 생성을 건너뜁니다"
else
  [ -f "$ROOT/opencode.jsonc" ] && cp "$ROOT/opencode.jsonc" "$ROOT/opencode.jsonc.bak-$(date +%Y%m%d-%H%M%S)" && warn "기존 설정 백업"
  SERENA_EXE="$(command -v serena || true)"
  if ! node "$ROOT/gen_config.mjs" "$KEY" "$ROOT" "$SERENA_EXE"; then
    err "모델 설정 생성 실패"; exit 1
  fi
  ok "opencode.jsonc 생성"
fi

# ---------------- 5. token layer + skills ----------------
head_ "5/6 코드 도구 (Serena·graphify) + 워크플로 스킬"
if [ "$DRY" = "1" ]; then
  warn "(연습 모드) 설치를 건너뜁니다"
else
  if have uv; then
    say "  Serena 설치 중"
    uv tool install -p 3.13 serena-agent >/dev/null 2>&1 && ok "Serena" || warn "Serena 설치 실패"
    export PATH="$HOME/.local/bin:$PATH"

    SERENA_EXE="$(command -v serena || true)"
    if [ -n "$SERENA_EXE" ]; then
      # The re-run writes serena into the config. Its result decides whether
      # "MCP 등록" may be claimed — never discard the output or the exit code.
      if GEN_OUT="$(node "$ROOT/gen_config.mjs" "$KEY" "$ROOT" "$SERENA_EXE" 2>&1)"; then
        ok "Serena MCP 등록"
      else
        warn "MCP 등록을 위한 설정 재생성 실패 (모델 설정은 그대로입니다):"
        printf '%s\n' "$GEN_OUT" | tail -3 | sed 's/^/    /'
      fi
    fi

    say "  graphify 설치 중 (프로젝트 구조 지도)"
    if uv tool install graphifyy >/dev/null 2>&1; then
      # Drops the graphify skill + hook into the opencode config dir.
      if graphify install --platform opencode >/dev/null 2>&1; then ok "graphify (스킬 등록 포함)"
      else warn "graphify 스킬 등록 실패 — 세션에서 graphify install --platform opencode 를 실행하세요"; fi
    else warn "graphify 설치 실패"; fi
  else
    warn "uv가 없어 Serena를 건너뜁니다"
  fi

  if have git; then
    VENDOR="$ROOT/vendor/cursor-plugins"
    if [ ! -d "$VENDOR/pstack/skills" ]; then
      say "  pstack 내려받는 중 (cursor/plugins)"
      mkdir -p "$ROOT/vendor"
      git clone --depth 1 https://github.com/cursor/plugins.git "$VENDOR" >/dev/null 2>&1
    fi
    if [ -d "$VENDOR/pstack/skills" ]; then
      if node "$ROOT/normalize_skills.mjs" "$VENDOR/pstack/skills" "$ROOT/skills"; then
        ok "pstack 스킬 등록. opencode 명령: /poteto"
      else
        warn "pstack 스킬 일부가 건너뛰어졌습니다 (위 skip 줄 확인). 나머지는 등록됐습니다"
      fi
    else
      warn "pstack 복제 실패"
    fi
  fi

  if have uv; then
    say "  spec-kit 설치 중"
    uv tool install specify-cli >/dev/null 2>&1 && ok "specify-cli" || warn "specify-cli 설치 실패"
    export PATH="$HOME/.local/bin:$PATH"
    if have specify; then
      PROJ="$HOME/ssu-workshop/project-$(date +%m%d-%H%M)"
      mkdir -p "$PROJ"
      ( cd "$PROJ" && specify init --here --force --non-interactive --integration opencode >/dev/null 2>&1 ) \
        && ok "프로젝트 초기화: $PROJ" || warn "specify init 실패"
    fi
  fi
fi

# --- Open Design (선택 구성요소: 실패해도 전체 설치를 막지 않는다) ---
open_design_present() {
  [ -d "/Applications/OpenDesign.app" ] || [ -d "/Applications/Open Design.app" ] \
    || [ -d "$HOME/Applications/OpenDesign.app" ] || [ -d "$HOME/Applications/Open Design.app" ]
}

wire_open_design_mcp() {
  # OpenCode에 Open Design MCP 연결 (best-effort).
  # macOS의 /usr/bin/od는 시스템 유틸리티(octal dump)라 Open Design CLI로 취급하지 않는다.
  local od="" cand
  cand="$(command -v od || true)"
  if [ -n "$cand" ] && [ "$cand" != "/usr/bin/od" ]; then od="$cand"; fi
  if [ -z "$od" ]; then
    for cand in \
      "/Applications/OpenDesign.app/Contents/Resources/od" \
      "/Applications/Open Design.app/Contents/Resources/od" \
      "$HOME/.local/bin/od"; do
      if [ -x "$cand" ]; then od="$cand"; break; fi
    done
  fi
  if [ -n "$od" ]; then
    if "$od" mcp install opencode >/dev/null 2>&1; then ok "Open Design MCP를 OpenCode에 연결"
    else warn "Open Design MCP 연결 실패 — 직접 실행: od mcp install opencode"; fi
  else
    warn "od CLI를 찾지 못해 MCP 연결을 건너뜁니다. Open Design을 한 번 실행한 뒤 다시 시도하거나 직접 실행하세요: od mcp install opencode"
  fi
}

install_open_design_darwin() {
  if open_design_present; then ok "Open Design 이미 설치됨"; return 0; fi
  if have brew; then
    say "  Open Design 설치 중 (Homebrew cask)"
    if brew install --cask open-design >/dev/null 2>&1; then ok "Open Design 설치"; return 0; fi
    warn "brew cask 설치 실패 — dmg 다운로드로 다시 시도합니다"
  fi
  local suffix json url dmg mnt app base
  case "$ARCH" in
    arm64) suffix="arm64" ;;
    x86_64) suffix="x64" ;;
    *) warn "Open Design: 지원하지 않는 아키텍처입니다 ($ARCH)"; return 1 ;;
  esac
  json="$(curl -fsSL https://api.github.com/repos/nexu-io/open-design/releases/latest 2>/dev/null)" \
    || { warn "Open Design 릴리스 조회 실패"; return 1; }
  url="$(printf '%s' "$json" | grep -o "https://[^\"]*mac-${suffix}\.dmg" | head -1)"
  [ -n "$url" ] || { warn "Open Design dmg를 찾지 못했습니다. 직접 설치: https://github.com/nexu-io/open-design/releases"; return 1; }
  say "  Open Design dmg 내려받는 중 (약 450MB)"
  dmg="/tmp/open-design-${suffix}.dmg"
  curl -fsSL "$url" -o "$dmg" || { warn "Open Design 다운로드 실패"; return 1; }
  mnt="/tmp/open-design-mnt"
  mkdir -p "$mnt"
  if ! hdiutil attach "$dmg" -nobrowse -readonly -mountpoint "$mnt" >/dev/null 2>&1; then
    warn "Open Design dmg 마운트 실패"; rm -f "$dmg"; return 1
  fi
  app="$(ls -d "$mnt"/*.app 2>/dev/null | head -1)"
  if [ -z "$app" ]; then
    warn "Open Design dmg 안에서 앱을 찾지 못했습니다"
    hdiutil detach "$mnt" >/dev/null 2>&1 || true
    rm -f "$dmg"
    return 1
  fi
  base="$(basename "$app")"
  if cp -R "$app" /Applications/ 2>/dev/null || sudo cp -R "$app" /Applications/ 2>/dev/null; then
    ok "Open Design 설치 ($base)"
    hdiutil detach "$mnt" >/dev/null 2>&1 || true
    rm -f "$dmg"
    return 0
  fi
  warn "Open Design을 /Applications로 복사하지 못했습니다. dmg를 열어 직접 설치하세요: $dmg"
  hdiutil detach "$mnt" >/dev/null 2>&1 || true
  return 1
}

if [ "$DRY" = "1" ]; then
  say "  (연습 모드) Open Design 설치 계획만 표시합니다 — macOS: brew cask 또는 최신 dmg, Linux: 프리빌드가 없어 안내만"
elif [ "$OS" = "Darwin" ]; then
  if install_open_design_darwin; then wire_open_design_mcp; fi
else
  warn "Open Design은 Linux 공식 프리빌드가 없어 건너뜁니다"
  say "    소스 실행: Node 24 + pnpm 필요 — https://github.com/nexu-io/open-design"
fi

# ---------------- 6. intent + hud ----------------
head_ "6/6 시작 설정"
if [ "$DRY" = "1" ]; then
  warn "(연습 모드) 의도 입력 생략"
else
  say ""
  say "이번 워크숍에서 무엇을 만들고 싶나요? 번호를 고르거나 직접 적어주세요."
  say "  1) 업무 자동화   2) 정보 수집 도구   3) 개인용 웹앱"
  say "  4) 글쓰기 도우미  5) 데이터 분석      6) 아직 모르겠음"
  printf '선택: '
  read -r PICK
  case "$PICK" in
    1) LABEL="업무 자동화" ;; 2) LABEL="정보 수집 도구" ;; 3) LABEL="개인용 웹앱" ;;
    4) LABEL="글쓰기 도우미" ;; 5) LABEL="데이터 분석" ;; ""|6) LABEL="아직 모르겠음" ;;
    *) LABEL="$PICK" ;;
  esac
  say ""
  say "한 문장으로 더 적어주세요. 예: '매일 아침 공지사항을 요약해서 메일로 받고 싶다'"
  printf '만들고 싶은 것: '
  read -r NOTE
  [ -n "$NOTE" ] || NOTE="(아직 구체화되지 않음)"

  {
    printf '# 이번 워크숍에서 만들 것\n\n'
    printf -- '- 분류: %s\n' "$LABEL"
    printf -- '- 한 문장: %s\n\n' "$NOTE"
    printf '## 첫 대화에서 할 일\n\n1. 위 한 문장을 확인하고, 빠진 것만 3개 이하로 묻는다.\n'
    printf '2. 유사 제품 3개와 차별점을 정리한다.\n3. Must / Should / Won'"'"'t 로 범위를 자른다.\n'
    printf '4. 스택과 예상 API 비용을 제시한다.\n5. 첫 30분 작업 하나를 정하고 시작한다.\n'
  } > "$ROOT/PROJECT_INTENT.md"
  ok "의도 저장: $ROOT/PROJECT_INTENT.md"

  chmod +x "$ROOT/hud/hud.sh" 2>/dev/null || true
  if [ "$OS" = "Linux" ] && [ -d "$HOME/.config/autostart" ]; then
    cat > "$HOME/.config/autostart/ssu-hud.desktop" <<EOF
[Desktop Entry]
Type=Application
Name=SSU HUD
Exec=bash $ROOT/hud/hud.sh
X-GNOME-Autostart-enabled=true
EOF
    ok "HUD 자동 시작 등록 (~/.config/autostart)"
  else
    warn "HUD는 직접 실행하세요: bash $ROOT/hud/hud.sh"
  fi
fi

# Seed line: an untouched placeholder note would read as the student's own words,
# so fall back to the chosen category label (same rule as install.ps1).
SEED="$NOTE"
case "$NOTE" in "(아직"*) SEED="$LABEL" ;; esac

say ""
say "설치가 끝났습니다."
say ""
say "  1) OpenCode를 실행하세요."
say "  2) 모델 목록에서 'BAZE' 계열을 고르세요."
say "  3) 첫 대화: \"$SEED\" 로 시작하고 싶어. 뭐부터 하면 돼?"
say ""
say "  HUD: bash $ROOT/hud/hud.sh    (브라우저에 크레딧/컨텍스트 표시)"
say "  명령: /credits /usage /websearch /decide"
say "  스펙 주도 개발: /speckit.specify -> /speckit.plan -> /speckit.tasks"
say ""
