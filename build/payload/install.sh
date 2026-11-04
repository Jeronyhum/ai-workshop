#!/usr/bin/env bash
# SSU x OpenCode installer for macOS / Linux.
# Windows users: double-click the .cmd file instead.
set -uo pipefail

ROOT="${SSU_CONFIG_DIR:-$HOME/.config/opencode}"
BASE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
if [ -f "$BASE/gen_config.mjs" ]; then DEF_PAYLOAD="$BASE"; else DEF_PAYLOAD="$BASE/payload"; fi
PAYLOAD="${SSU_PAYLOAD:-$DEF_PAYLOAD}"
DRY=0
[ "${SSU_DRY_RUN:-0}" = "1" ] && DRY=1

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
[ "$DRY" = "1" ] && warn "연습 모드입니다. 실제 파일을 쓰지 않습니다."

# ---------------- 1. prerequisites ----------------
head_ "1/6 기반 프로그램"

install_pkg() {
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

if have node; then ok "Node $(node --version)"; else
  say "  Node.js 설치 중"; install_pkg node || { err "Node.js를 설치하지 못했습니다. https://nodejs.org"; exit 1; }
fi
if have git; then ok "$(git --version)"; else
  say "  Git 설치 중"; install_pkg git || warn "Git 설치 실패 (스킬 팩을 건너뜁니다)"
fi
if have uv; then ok "$(uv --version)"; else
  say "  uv 설치 중"
  curl -LsSf https://astral.sh/uv/install.sh | sh >/dev/null 2>&1 || warn "uv 설치 실패"
  export PATH="$HOME/.local/bin:$PATH"
fi

if [ "$OS" = "Darwin" ]; then
  if [ -d "/Applications/OpenCode.app" ]; then ok "OpenCode Desktop 이미 설치됨"
  elif have brew; then
    say "  OpenCode Desktop 설치 중"
    brew install --cask opencode-desktop >/dev/null 2>&1 && ok "OpenCode Desktop 설치" || warn "자동 설치 실패: https://opencode.ai/download"
  else warn "Homebrew 없음: https://opencode.ai/download 에서 받으세요"
  fi
else
  say "  OpenCode CLI 설치 중"
  curl -fsSL https://opencode.ai/v2/install | bash >/dev/null 2>&1 && ok "OpenCode CLI 설치" || warn "CLI 설치 실패: https://opencode.ai/download"
fi

export PATH="$HOME/.local/bin:$PATH"

# ---------------- 2. key ----------------
head_ "2/6 SSU API 키"
if [ -n "${SSU_API_KEY:-}" ]; then
  KEY="$SSU_API_KEY"
else
  say ""
  say "SSU 대시보드에서 API 키를 발급받아 붙여넣으세요."
  say "  https://ssu.factchat.bot/dashboard/developers  ->  Keys  ->  Create key"
  printf 'API 키: '
  read -rs KEY
  printf '\n'
fi
[ -n "$KEY" ] || { err "키가 비어 있습니다."; exit 1; }

check_key() {
  curl -s -o /dev/null -w '%{http_code}' -H "Authorization: Bearer $KEY" \
    "https://factchat-cloud.mindlogic.ai/v1/gateway/credits/"
}
if [ "$DRY" = "1" ]; then ok "키 검증 생략 (연습 모드)"; else
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
  for d in hud mcp skill command; do
    [ -d "$PAYLOAD/$d" ] && cp -R "$PAYLOAD/$d/." "$ROOT/$d/" 2>/dev/null || true
  done
  for f in gen_config.mjs normalize_skills.mjs AGENTS.md; do
    if [ -f "$PAYLOAD/$f" ]; then
      if [ "$f" = "AGENTS.md" ] && [ -f "$ROOT/$f" ]; then
        cp "$ROOT/$f" "$ROOT/$f.bak-$(date +%Y%m%d-%H%M%S)"
        warn "기존 AGENTS.md 백업 후 교체"
      fi
      cp "$PAYLOAD/$f" "$ROOT/$f"
    fi
  done
  ok "HUD·MCP 브리지·스킬·명령 복사"

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
  HEADROOM_EXE="$(command -v headroom || true)"
  if ! node "$ROOT/gen_config.mjs" "$KEY" "$ROOT" "$SERENA_EXE" "$HEADROOM_EXE"; then
    err "모델 설정 생성 실패"; exit 1
  fi
  ok "opencode.jsonc 생성"
fi

# ---------------- 5. token layer + skills ----------------
head_ "5/6 토큰 절감 레이어 + 워크플로 스킬"
if [ "$DRY" = "1" ]; then
  warn "(연습 모드) 설치를 건너뜁니다"
else
  if have uv; then
    say "  Serena 설치 중"
    uv tool install -p 3.13 serena-agent >/dev/null 2>&1 && ok "Serena" || warn "Serena 설치 실패"
    say "  Headroom 설치 중"
    uv tool install --python 3.13 "headroom-ai[all]" >/dev/null 2>&1 && ok "Headroom" || warn "Headroom 설치 실패"
    export PATH="$HOME/.local/bin:$PATH"

    SERENA_EXE="$(command -v serena || true)"
    HEADROOM_EXE="$(command -v headroom || true)"
    if [ -n "$SERENA_EXE" ] || [ -n "$HEADROOM_EXE" ]; then
      node "$ROOT/gen_config.mjs" "$KEY" "$ROOT" "$SERENA_EXE" "$HEADROOM_EXE" >/dev/null
      [ -n "$SERENA_EXE" ] && ok "Serena MCP 등록" || warn "Serena 실행 파일 없음"
      [ -n "$HEADROOM_EXE" ] && ok "Headroom MCP 등록" || warn "Headroom 실행 파일 없음"
    fi
  else
    warn "uv가 없어 Serena/Headroom을 건너뜁니다"
  fi

  if have git; then
    VENDOR="$ROOT/vendor/cursor-plugins"
    if [ ! -d "$VENDOR/pstack/skills" ]; then
      say "  pstack 내려받는 중 (cursor/plugins, 약 18MB)"
      mkdir -p "$ROOT/vendor"
      git clone --depth 1 https://github.com/cursor/plugins.git "$VENDOR" >/dev/null 2>&1
    fi
    if [ -d "$VENDOR/pstack/skills" ]; then
      node "$ROOT/normalize_skills.mjs" "$VENDOR/pstack/skills" "$ROOT/skill" \
        && ok "pstack 스킬 등록. opencode 명령: /poteto" || warn "pstack 스킬 정규화 실패"
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

say ""
say "설치가 끝났습니다."
say ""
say "  1) OpenCode를 실행하세요."
say "  2) 모델 목록에서 'BAZE' 계열을 고르세요."
say "  3) 첫 대화: \"$NOTE\" 로 시작하고 싶어. 뭐부터 하면 돼?"
say ""
say "  HUD: bash $ROOT/hud/hud.sh    (브라우저에 크레딧/컨텍스트 표시)"
say "  명령: /credits /usage /websearch /decide"
say "  스펙 주도 개발: /speckit.specify -> /speckit.plan -> /speckit.tasks"
say ""
