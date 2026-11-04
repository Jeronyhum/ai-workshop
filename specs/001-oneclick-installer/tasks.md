# 작업 목록: SSU x OpenCode 원클릭 설치기 (재검증·수정)

**입력**: [spec.md](./spec.md), [plan.md](./plan.md) | **기준일**: 2026-11-04

## 1단계: 실측으로 결함 확정

- [x] T001 OpenCode 1.19.5 설치 후 생성 스키마 A/B 실측 (`opencode models`, `opencode debug config`)
- [x] T002 모델 항목 필드 생존 테스트 (cost/capabilities/variants/reasoningField)
- [x] T003 로컬 목 서버로 키 치환 방식 실측 (설정 폴더 .env 미해석 확인)
- [x] T004 단수/복수 폴더 로드 여부 실측 (둘 다 로드됨, 복수형 채택 근거)
- [x] T005 오픈소스 설치 검증 (uv/Serena/pstack 정규화 58개)

## 2단계: 생성기 수정 (gen_config.mjs)

- [x] T006 `providers`→`provider`, `package`→`npm`, `settings`→`options`, `mcp.servers`→flat 맵
- [x] T007 키를 `{env:...}`에서 실키 내장으로 교체, 설정 파일 0600
- [x] T008 variants 배열→객체 맵, cost 캐시 키 평탄화, capabilities→modalities/reasoning/attachment
- [x] T009 MCP 타임아웃 명시 (bridge·원격 120s, serena·headroom 60s), 죽은 키(enabled) 제거
- [x] T010 SSU_GATEWAY_BASE 오버라이드 (테스트용)

## 3단계: 설치 스크립트 수정

- [x] T011 install.sh BOM 제거 + 빌더에서 BOM 검출 시 실패 처리
- [x] T012 install.sh 드라이런 정상화 (설치 시도 금지, 종료 크래시 수정, 기본값 선행 선언)
- [x] T013 install.sh Linux Desktop 설치 (.deb → AppImage 폴백), Node 타볼 설치 경로 (apt `node` 오패키지 회피)
- [x] T014 install.sh 복사 실패 검사 + 핵심 파일 존재 확인, 재생성 결과 검사 후에만 [OK]
- [x] T015 install.sh 시딩 문구 라벨 폴백 (HANDOFF 잔여 작업 1 해소)
- [x] T016 install.ps1 환경변수 이름 통일 (SSU_API_KEY, SSU_CONFIG_DIR 우선)
- [x] T017 install.ps1 키 재시도 루프 수정 (실패한 키 재검증 금지, 새 키 입력)
- [x] T018 install.ps1 재생성을 Invoke-Native로 교체하고 결과 검사
- [x] T019 양쪽 설치기 공히 skills/·commands/ 복수형 배치, normalize 부분 실패 경고

## 4단계: 주변 구성요소 수정

- [x] T020 ssu-bridge 게이트웨이 호출 타임아웃 90초
- [x] T021 status.mjs provider 키 양형 지원, DB 조회 실패 격리, 읽기 전용 폴백 제거, 컨텍스트 합산 교정
- [x] T022 server.mjs `--port` 공백형 파싱, `--open` 구현, EADDRINUSE 안내
- [x] T023 hud.sh 고정 sleep을 준비 대기 루프로 교체
- [x] T024 hud.ps1 상태 조회를 백그라운드 잡으로 (UI 프리징 해소), 실패 진단 문구 교정
- [x] T025 명령 템플릿에 `$ARGUMENTS` 연결 (decide/websearch/usage), poteto 경로 복수형
- [x] T026 normalize_skills 이름 규칙 검증·중복 검출·부분 실패 종료 코드

## 5단계: 빌드

- [x] T027 build.ps1 하드코딩 경로 제거 ($PSScriptRoot), 래퍼 종료 의미 교정 (install.ps1을 -File 자식 프로세스로)
- [x] T028 build.mjs 신설 (교차 플랫폼 정본 빌더, 순수 Node ZIP)
- [x] T029 유닉스 부트스트랩 추출 실패 검사 + GNU base64 CR 제거
- [x] T030 재빌드 후 .cmd 유닉스 경로 드라이런 exit 0 확인

## 6단계: 남은 검증 (키 필요)

- [ ] T031 실키로 전체 설치 후 SC-001/SC-002 확인 (모델 전수 나열 + 실제 호출 응답)
  — 정적 절반은 목 게이트웨이로 대체 검증 완료: 생성 설정이 `opencode models`에
  전 모델을 나열하고, `opencode run` 요청에 Authorization 헤더가 실려 응답까지
  돌아옴. 남은 것은 실 게이트웨이 상대 확인뿐.
- [ ] T032 Windows 실기계에서 새 .cmd 실행 확인 (배치 래퍼·install.ps1 -File 경로)
- [x] T033 headroom 무게 측정 — base 패키지(0.42.0)와 `headroom mcp serve`는
  실설치 확인. `[all]`은 173개 패키지 해소까지 확인했으나 transformers·onnx·
  torch 계열 대용량 다운로드가 이어지는 무거운 구성이라, 학생 PC에서는 수 분+
  수 GB를 각오해야 한다. 설치 안내에 소요를 명시할 것.
- [x] T034 Headroom 제거 (2026-11-04 소유자 결정) — MCP 등록만으로는 자동
  압축이 일어나지 않고(에이전트가 도구를 스스로 불러야 함) AGENTS.md 운용
  지침도 없었으며, [all] 설치가 수 GB로 무거웠던 것이 사유. gen_config·양쪽
  설치기·README·명세에서 배선과 언급을 제거하고 재빌드함. Serena는 AGENTS.md에
  운용 규칙이 이미 있어 유지.
- [x] T035 graphify 배선 (2026-11-04 소유자 지시) — PyPI 패키지명은
  `graphifyy`(0.9.102, 실행 파일 graphify·graphify-mcp). 양쪽 설치기가
  `uv tool install graphifyy` 후 `graphify install --platform opencode`로
  스킬+훅을 설정 폴더에 등록. MCP 등록은 하지 않음(스킬+CLI가 정식 경로,
  graphify-mcp는 별도 extras 필요). 실설치로 스킬 배치 확인.
- [x] T036 AGENTS.md 재구성 — vibe-coach·spec-kit·graphify·Serena·pstack을
  단일 워크플로(의도 → 명세 → 지도 → 정밀 작업 → 규율 → 검증)로 라우팅.
  기존 규칙(첫 대화·한국어·키 비밀·exa/credits·검증)은 유지.
- [x] T037 여정 정합 (2026-11-04 소유자 서술) — OpenCode 데스크톱·CLI가
  있으면 설치 생략(Windows 경로 확인 추가, sh CLI 확인 추가), 키 입력
  단계에서 대시보드를 브라우저로 자동 열기(양쪽).
- [x] T038 토큰·캐시 측정 — status.mjs에 usage 집계(누적 input/output/
  reasoning/cache read·write, 비용 합, 캐시 적중률 = read/(input+read))를
  추가하고 HUD(HTML·WPF 양쪽)에 표시. 합성 DB로 계산 검증(적중률 85%).
- [x] T039 /start 자율 프레임워크 (2026-11-04 소유자 지시) —
  command/start.md: 탐정(경쟁 가설→최저가 판별자→갱신, 원문/해석 라벨) →
  메타인지·WORKFRAME(Harness² 8요소 조립) → speckit → 분해·라우팅 →
  실행 → advisor 국소 개입 → 검증·회고(교훈 축적).
- [x] T040 티어 서브에이전트 — gen_config가 라이브 카탈로그에서 이름·
  가격으로 flash(최저가)/haiku/luna/gemma(4 우선)/advisor(프론티어 최고가)
  를 골라 agent로 등록. 목 카탈로그 9모델로 선택 결과와 debug config
  로딩까지 검증.
- [x] T041 Jev 라우팅 레이어 — 판단 기준은 난이도·비용효율성·캐시
  재사용. 1차는 /start가 decide 도구로, 2차는 plugins/jev-router.js가
  Task 호출마다 /decisions/(jev-latest)로 판정·재배정·로깅. fail-open을
  스텁 서버와 무응답 서버로 각각 검증 (advisor 호출은 재배정 제외).
  **실측 정정 (2026-11-04 밤, 실키)**: 질문 형식은 type "choice" +
  criteria를 선택지→설명 객체로 줘야 한다 ("categorical"·문자열 criteria는
  400). 응답은 answers.tier.choice. 실호출 검증: 기계적 반복 작업→flash
  (신뢰도 1.0), 2회 실패한 디버깅→advisor (0.6). 플러그인 파서도 실응답
  봉투로 재검증함.
- [x] T043 실키 E2E 1차 (2026-11-04 밤) — 보안창으로 받은 실키로 실제
  카탈로그 확인: chat 61개 (claude 12·gpt 16·compat 33), MCP 스위트 34개.
  티어 선택 실측: w-flash=qwen3.8-flash(flash 중 최저가, 중국 오픈웨이트),
  w-haiku=claude-haiku-5-5, w-luna=gpt-6-luna, w-gemma=gemma-4-31B,
  advisor=gpt-5.4-pro(프론티어 중 입력 단가 최고). 크레딧 잔액 2,478/5,000
  (월 할당 3,000 중 522 사용).
- [x] T042 pstack 역할 재편 — README(cursor/plugins, poteto) 기준으로
  poteto-mode 플레이북 + 단계 스킬 + principle을 규율 레이어로 재정의하고
  AGENTS.md에 반영. poteto-mode의 서브에이전트 effort 개념은 티어
  라우팅으로 대응시킴.
