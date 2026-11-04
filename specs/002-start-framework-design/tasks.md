# Tasks — 002 /start 프레임워크 · Open Design · AA 라우팅

- [x] T001 작업 계약서 작성 (spec.md, 요구 16조항 + AA 근거 + 게이트 3건)
- [x] T002 AA advisor 규칙 — gen_config에 AA 순서표 내장, 목 카탈로그 검증
      (gpt-5.4-pro가 최고가인 카탈로그에서도 advisor=claude-opus-5-5)
- [x] T003 (W1) Open Design 설치 통합 — install.ps1: 최신 릴리스 setup.exe
      다운로드·실행(무인 /S 시도, 실패 시 안내), 존재 시 생략.
      install.sh: macOS brew cask → dmg 폴백, Linux는 안내 후 생략.
      양쪽 다 `od mcp install opencode` best-effort + 실패해도 전체 설치
      중단 금지 (선택 구성요소).
- [x] T004 (W2) bridge `image` 도구 — ssu-bridge.mjs에 이미지 생성 도구 추가.
      기본 모델 gpt-image-2.5-sunburst (AA 1위), 모델 인자 교체 가능.
      엔드포인트는 파일 상단 상수 1곳 (G-1 확정 시 그곳만 교체).
      응답에서 이미지 URL/base64를 꺼내 파일로 저장하고 경로를 반환.
- [x] T005 (W2) 디자인 안내 — AGENTS.md와 start.md에: 디자인·프론트엔드
      디자인 작업이면 Open Design을 띄우는 규칙 (앱 실행 / od CLI),
      SSU 게이트웨이를 OpenAI 호환 엔드포인트로 물리는 법 (BYOK),
      이미지 기본 모델 (AA 근거) 명시.
- [x] T006 (W3) README 구성 갱신 (Open Design, /start, 이미지) + .cmd 재빌드
      + 페이로드 무결성 점검 (REQUIRED 19파일, zip 내용물, 드라이런 exit 0)
- [x] T007 (검증관) 수락 검사 스크립트 작성·실행 — 목 카탈로그 단언
      (티어 5종 + AA advisor), 플러그인 하네스 (실 Jev 봉투), 드라이런,
      OD 단계 문구 존재 확인. 전건 PASS/FAIL 표로 보고.
- [x] T008 (감독관) 통합 리뷰 — 설치기 섹션 정합, 문서 상호참조, 계약 §1
      상태표 갱신안, 잔여 게이트 목록 확정.
- [ ] T009 dots 피드백 수렴 (Workroom) — 계약·G-1·OD 설치 방식에 대한
      의견을 받아 반영 여부를 감독관이 판정.
- [ ] T010 통합본 push (GitHub API 경유, non-force)
- [ ] T011 (잔여, 소유자) 실모델 호출 스모크 재확인, Windows 피시방 실측
      (G-2), macOS 실기계 (G-3)
