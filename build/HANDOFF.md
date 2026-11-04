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

**2026-11-04 수거본 — 프로젝트 전체를 관통한 before 프롬프트 원문 (순서대로):**

> context도 500k에서 압축되도록 구성해줘.

> https://ssu.factchat.bot/dashboard/developers?tab=models
> 해당 모델 카탈로그에서 전 모델을 추가해주고, 사고수준 프로필도 조회해서 추가해줘.
> 단, 직접 모델 호출은 하지 말고, 정적 테스트로만 확인해.
> 또한 api 크레딧이 얼만큼 감소하는지, 현재 몇 퍼센트 남았는지 보여주게 이 우측 상단 동그란 그래프에서 보여줄 수 있도록 opencode 세팅을 수정해줘

> 대시보드 확인: 전체 127 = 채팅 61 + 이미지 22 + 영상 21 + 오디오 9 + 임베딩 6 + 리랭크 1 + 의사결정 3 + 실시간 4. opencode 설정에는 채팅 61개가 대상입니다 (나머지는 채팅 엔드포인트가 아니라 등록 불가). 프로브 실행 중에 생성기와 크레딧 스크립트를 준비합니다.
> -> 개발자 문서에서 확인해서 각 종류 엔드포인트를 추가로 연결할 수 있도록 settings을 수정할 것

> 먼저 개발자 문서의 내용들을 정리하고, 그에 맞게 settings 변경 계획을 세워라. SSU 게이트웨이가 제공하는 모든 기능들을 다 써먹을 수 있도록 opencode를 수정한다.

> 이제 이 세팅을 워크숍에서 써먹을 수 있게 전달할 건데, https://opencode.ai/download 이 사이트에서 사용자의 OS 환경에 맞게 데스크톱 앱을 설치하고, 데스크톱 앱 설치에 필수적인 기반 프로그램들을 확인해서 같이 자동으로 설치해주며, https://ssu.factchat.bot/dashboard/developers -> 여기서 api 키만 발급받아서 입력창에 입력하면 알아서 모든 api 게이트웨이의 기능을 이용할 수 있도록 해줘.

> 또한 opencode의 바에서 제공하지 않는 자동 크레딧 체크 및 컨텍스트 체크 툴바를 만들어줘.
> 또한 깃허브에서 serena나 headroom을 추가해서 토큰을 절감할 수 있는 토큰 절감레이어를 구성해주고, pstack, speckit를 깃허브에서 설치해서, 스킬을 등록하고 각 오픈소스들의 readme에서부터 워크플로우를 추출해서 어떻게 작업해야 하는지도 체크해줘.

> 또한 이들이 바이브코딩을 주로 한다는 점을 생각해서 네 지식선에서 바이브코딩 초보자들을 위해서, 이들이 뭘 만들고 싶어하는지, 뭘 의도하고 있는지, 그 유사 제품으로는 뭘 생각하고 있는지, 예상되는 api와 비용을, 스택 구성에 대해서 친절하게 설명하며, 사용자의 의도를 적극적으로 파악해서 진행하는 스킬을 구성하고 테스트까지 마쳐줘.

> 그리고 위 모든 내용을 하나의 파일로, 클릭만 하면 어느 OS에서도 원클릭으로 설치되고, SSU api 키 입력까지 받게 만들어주고, 첫 랜딩으로 어떤 프로덕션을 만들지 물어보게 만들어줘.

**2026-11-01 이후 세션 원문:**

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
