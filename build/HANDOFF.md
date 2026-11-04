# HANDOFF: SSU x OpenCode 원클릭 설치기

작성일: 2026-11-04
상태: 실기계 검증 통과, 잔여 작업 2건
인수자가 참조할 최우선 파일: `build\ssu-opencode-setup.cmd` (납품물 한 개 파일)

---

## 1. 목표 (사용자 의도)

워크숍 참가자가 **클릭 한 번**으로 받는 단일 설치 파일. 이 파일이:
1. OS에 맞는 OpenCode Desktop + 의존 도구 설치
2. SSU BAZE API 키 수집 (화면에서 직접 입력, 파일·로그에 평문 출력 금지)
3. 게이트웨이 전 기능 설정 (모델·MCP)
4. 크레딧/컨텍스트 HUD
5. 토큰 절감 레이어 (Serena, Headroom) + 워크플로 (pstack, spec-kit)
6. 첫 랜딩에서 "뭘 만들고 싶은지"를 먼저 묻는 vibe-coach 코치 스킬

## 2. 사용자 프롬프트 원문 (수거)

세션 전체가 아닌 인계 지점부터의 원문만 보존된다. 그 이전 지시는 요약본으로 존재하며
원문 복구 불가 — 납품 판단에는 요약본 내용으로 충분하다.

**원문 보존된 것:**

> pstack은 https://github.com/cursor/plugins/tree/main/pstack 이거야

(ordering correction: pstack 소스를 cursor/plugins로 확정 — 반영 완료)

> handoff 하라. 프롬프트 원문을 수거하며 묶어라.

(ordering correction: 이 문서 자체가 그 산출물이다)

**요약 기반 (원문 아님, 요약본 §Requirements에서):**
- 키 발급처: https://ssu.factchat.bot/dashboard/developers
- 설치 앱: https://opencode.ai/download
- 첫 랜딩이 반드시 만들고 싶은 제품을 물을 것
- HUD toolbar는 크레딧+컨텍스트 둘 다 (OpenCode 기본 바는 없음)
- Serena/headroom: GitHub 원본
- 코치 스킬은 적극적으로 의도·유사제품·API/비용·스택을 끌어낼 것

## 3. 이미 결정된 것 (재논의 금지)

- **pstack = cursor/plugins 저장소** (v0.15.36, 스킬 58개). 정규화기
  `payload/normalize_skills.mjs`로 opencode frontmatter(name+description만) 변환.
  58개 전부 설치 — 스킬 목록 약 4,300토큰, 500k 창의 0.9%.
- opcode 공식 어댑터 없음 → `/poteto` 명령에 Cursor→opencode 매핑표 포함.
- Serena/Headroom은 `headroom wrap opencode` 아닌 **MCP 등록** 방식
  (사용자 설정을 덮어쓰지 않기 위해).
- 설정 생성은 `gen_config.mjs`가 게이트웨이 카탈로그에서 라이브 생성.
  라이브 참조(61모델/35MCP)와 0-diff 검증완료.
- 납품물: **polyglot .cmd** — 배치 헤더 → base64 ZIP → `#!UNIX` bash 부트스트랩.

## 4. 검증 상태

| 항목 | 상태 |
|---|---|
| 드라이런 (`SSU_DRY_RUN=1` 등) | 통과, exit 0 |
| 실실행 (테스트 폴더) | 7단계 전부 [OK], exit 0 |
| 모델수 | generated == live == 61 (12/16/33) |
| MCP수 | generated 37 (live 35 + serena + headroom) |
| 스킬 | 59 (pstack 58 + vibe-coach 1) |
| Serena/Headroom 설치 | Windows 실설치 [OK] |
| spec-kit init | 실실행 [OK] |

마지막 실실행 로그: 세션 summaries 중 "models: claude 12 / gpt 16 / compat 33 = 61" 있는 케이스.

## 5. 잔여 작업 (인수자가 할 것)

1. **install.sh 마지막 시딩 수정 반영 확인** — install.ps1에는 `"$($intent.note)"`가
   `(아직 구체화되지 않음)`일 때 라벨로 대체하는 수정이 들어갔으나
   install.sh의 `say "  3) 첫 대화: \"$NOTE\" 로 시작하고 싶어..."`에는 아직 미반영.
   위 `RESUME` 블록바로 위 코드 참조.
   → 다음 빌드·실실행이 필요하다.
2. 인계 문서에 명시한 비-코드 결정들(§3)이 이후 세션에서 재논의되지 않도록
   AGENTS.md 나 팀 위키로 요약 반영 — 필요시.

## 6. 테스트 명령 (그대로 복사)

```bash
# 드라이런
SSU_DRY_RUN=1 SSU_SKIP_APPS=1 SSU_SKIP_TOOLS=1 \
SSU_ROOT=<tmp-folder> SSU_ARGS=test \
cmd /c ssu-opencode-setup.cmd

# 실실행 (Windows, qq 반드시 SSU_KEY는 .env에서 로드할 것 — 대화에 평문 금지)
SSU_SKIP_APPS=1 SSU_ARGS=test cmd /c ssu-opencode-setup.cmd
```

## 7. 트랩/주의 (인수자가 알아야 함)

- PowerShell 5.1은 `.ps1`에 UTF-8 BOM이 없으면 한국어가 깨짐 — 빌더가 자동 부착.
- `Invoke-Native` 헬퍼 필수: `$ErrorActionPreference="Stop"` 상태에서
  uv/git의 stderr 진행메시지가 종료 에러로 승격됨.
- 배치파일은 CRLF 강제, ASCII-only 헤더 필수.
- AGENTS.md 규칙 §A: 외부 도구 주장 인용 시 코드 grep 검증, hedge 표현 금지.
- 크레딧 절약 (§F): 분석시 LLM 정독 대신 코드 실행 권장.

## 8. 인계 지점 이전 요약본 링크

이 문서 위 컨텍스트는 요약본(conversation summary)에서 정리했다. 요약본이 세션에
보존되어 있다면 함께 참조할 것.
