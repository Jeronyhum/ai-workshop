# 작업 계약서 — /start 프레임워크 · Open Design · AA 라우팅 (002)

- 작성: 2026-11-04, 소유자 요구사항 전수 반영 (이 세션의 지시 누적분)
- 대상 저장소: Jeronyhum/ai-workshop (SSU x OpenCode 원클릭 설치기)
- 상위 문서: `specs/001-oneclick-installer/spec.md` (설치기 본체), 이 문서는
  그 위에 얹는 프레임워크·디자인·라우팅 계약이다.
- 판정 원칙: 각 조항은 **실측 증거**로만 충족 판정한다. UI 라벨·추정 금지.

## 1. 요구 조항

| ID | 요구 (소유자 지시) | 수락 기준 | 상태 |
|---|---|---|---|
| C-01 | 완전 초보가 파일 하나로 OpenCode Desktop + SSU 게이트웨이 전 모델 사용 | 001 스펙 SC-001~005 | 충족 (001) |
| C-02 | 언급된 오픈소스 자동 설치: Serena·graphify·spec-kit·pstack | 설치 후 각 도구 실행 확인 | 충족 |
| C-03 | 레거시 코드의 이상·버그 수정, 실측 기반 | HANDOFF §9 결함 목록 전건 수정·검증 | 충족 |
| C-04 | macOS에서도 동작 | Darwin 경로 코드 검증 + URL 실재 확인 (실기계는 잔여) | 부분 |
| C-05 | GitHub push — 클론하면 최신본 | main 커밋에 전 변경 반영 | 충족 (지속) |
| C-06 | `/start`: 아이디어 → 자율 에이전트 작업 프레임워크 가동 (Harness² 참고) | command/start.md 6단계 + WORKFRAME 산출 | 충족 |
| C-07 | 티어 서브에이전트 (중국 오픈웨이트 flash·haiku·luna·gemma4)를 게이트웨이로 호출 | gen_config가 실카탈로그에서 이름·가격으로 자동 선택해 agent 등록 | 충족 (실측: qwen3.8-flash 등) |
| C-08 | 막히면 advisor가 **국소 부위만** 도움 | start.md 막힘 프로토콜 (실패 패키지만 전달, 2회 실패 시) | 충족 |
| C-09 | Jev 동적 라우팅 — 난이도·비용효율성·대규모 캐시 리드 고려 | decide 도구 + jev-router 훅, 실응답 검증 | 충족 (실측: flash 1.0 / advisor 0.6) |
| C-10 | TypeSafe Jev 스킬을 훅으로 프레임워크 단위 제어 | plugins/jev-router.js가 Task 호출마다 판정·재배정·로깅, fail-open | 충족 |
| C-11 | 3겹 구조: OpenCode 하네스 ⊃ 바이브코더 하네스(pstack·speckit·Serena·graphify·탐정) ⊃ /start | AGENTS.md 3겹 구조 명시 + start.md 정본 | 충족 |
| C-12 | pstack은 cursor/plugins의 그것. README 읽고 역할 재편 | poteto-mode 플레이북 = 규율 레이어로 AGENTS.md 재편 | 충족 |
| C-13 | 실키 E2E (보안창 수령) | 실카탈로그 61모델·MCP 34, Jev 실호출, 실모델 호출 스모크 | 부분 — 카탈로그·Jev·이미지 실호출·채팅 스트리밍(개시 3.8초) 실측 완료. `opencode run`은 이 VM에서 시작 단계 타임아웃 2회(150·240초) — 원시 스트리밍 정상이라 VM 환경 잔여로 분리, 실기계(G-2)에서 최종 확인 |
| C-14 | open-design 오픈소스(nexu-io/open-design)도 자동 설치. 디자인·프론트엔드 디자인 필요 시 CLI 또는 사용자가 직접 조작 가능한 형태로 띄울 것 | 설치기에 OD 설치 단계 (Win setup.exe / Mac dmg·cask, Linux는 프리빌드 없음 안내), `od mcp install opencode` 연결 시도, AGENTS.md에 실행 규칙 | 부분 — 코드 통합·정적 검증(6/6 PRESENT) 완료. od 연결은 gen_config 뒤 순서, macOS /usr/bin/od 회피, Win 절대경로 후보 탐색까지 확인. 실기계 설치 확인은 G-2·G-3 |
| C-15 | 이미지 생성 모델과 디자인 작업 모델도 SSU API로 연결 | 이미지: bridge `image` 도구 (기본 모델 = AA Image Arena 1위 gpt-image-2.5-sunburst). 디자인: OpenCode·Open Design이 게이트웨이 OpenAI 호환 엔드포인트 경유 | 충족 — G-1 해소(엔드포인트 `/images/generate/`), bridge 실호출로 PNG(1024×1024) 수신 확인. gpt-image 계열은 b64를 data URI로 돌려줘 도구에서 파일 저장 처리 |
| C-16 | advisor 선정은 벤치마크 성적 = **AA Index** 기준 (가격 아님). 이미지 모델도 AA 기준 | gen_config에 AA 순서표 내장 (2026-11-04 스냅샷), 목 카탈로그로 검증 | 충족 (아래 §2) |

## 2. AA Index 근거 (2026-11-04, artificialanalysis.ai)

LLM Intelligence Index — 게이트웨이 카탈로그 내 모델만:
Gemini 4 Carbon 60 (카탈로그에 없음) > **Claude Opus 5.5 59** > GPT-6 Astra 57 >
GPT-6.1 Sol 55 = Claude Sonnet 5.5 55 > Gemini 4 Argon 50 = Claude Fable 5.1 50.
가격 규칙의 반증: gpt-5.4-pro는 입력 $30(최고가)이지만 이 표에 없음 → 구 규칙
(최고가=advisor)이 틀렸음이 실측됨.

참고 (티어 검증): Claude Haiku 5.5 36, DeepSeek V4.1 Flash 33, GPT-6 Luna 28,
GLM-5.3-Flash 28 — flash 티어의 실력 하한이 확보됨.

Image Arena (text-to-image Elo): GPT Image 2.5 Sunburst 1222 (1위) >
Flare 1207 > GPT Image 2 1186 > Nano Banana 2.1 (gemini-nano-banana-2.1) 1176 >
Nano Banana 2 (gemini-3.1-flash-image) 1140. → 이미지 기본값 = sunburst,
가성비 대안 = nano-banana-2.1.

## 3. 미결 사항 (게이트)

- **G-1 이미지 생성 엔드포인트 (해소, 2026-11-04)**: 대시보드 개발자
  문서에서 확정 — `POST /v1/gateway/images/generate/` (본문 model·prompt·
  size·output_format·quality·n; 응답 data[].b64_json 또는 data URI/URL).
  bridge 상수 교체 + 실호출로 PNG 수신까지 확인했다. 기각 기록:
  `/images/generations` 404, chat/completions 경유 404.
- **G-2 Windows 실기계**: .cmd 배치 래퍼와 OD setup.exe 무인 설치(/S)는
  소유자 피시방 실측(2026-11-04 밤)으로 확정한다.
- **G-3 macOS 실기계**: OD dmg/cask와 설치기 Darwin 경로는 실기계 1회로 확정.

## 4. 작업 조직

- 감독관 1: 계약 대조 통합·정합성 (설치기 섹션 번호, 문서 상호참조, 명명).
- 워커: W1 Open Design 설치 통합 / W2 bridge 이미지 도구 + 디자인 안내 /
  W3 README·패키징.
- 검증관 1: 계약 §1 수락 기준을 자동 검사 스크립트로 판정 (목 카탈로그
  gen_config 단언, 플러그인 하네스, 드라이런, zip 내용물).
- 외부 피드백: dots (Agent Workroom) — 계약과 미결 G-1에 대한 의견 수렴.
