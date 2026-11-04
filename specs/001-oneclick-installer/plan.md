# 구현 계획: SSU x OpenCode 원클릭 설치기

**브랜치**: `001-oneclick-installer` | **작성일**: 2026-11-04 | **명세**: [spec.md](./spec.md)

## 요약

단일 폴리글롯 파일이 OS별 설치 스크립트와 페이로드를 품고, 실행 시 게이트웨이
카탈로그를 라이브 조회해 OpenCode 설정을 생성한다. 2026-11-04 재검증에서
기존 검증 방식("파일에 적힌 개수 대조")이 놓친 로더 실측 결함 3건(스키마 키,
variants 형태, 키 치환)이 확인돼, 생성 스키마와 검증 기준을 OpenCode 1.19.5
실측으로 교체한 것이 이 계획의 핵심 변경이다.

## 기술 컨텍스트

- **배포물**: `build/ssu-opencode-setup.cmd` (배치 헤더 + base64 ZIP + bash 테일)
- **설치 스크립트**: `build/payload/install.ps1` (Windows, PS 5.1 호환, UTF-8 BOM),
  `build/payload/install.sh` (macOS/Linux, BOM 금지)
- **설정 생성**: `build/payload/gen_config.mjs` (Node, 무의존성)
- **로컬 MCP**: `build/payload/mcp/ssu-bridge.mjs` (Exa/decide/usage/credits)
- **HUD**: `build/payload/hud/` (status.mjs + Windows WPF hud.ps1 / 웹 hud server)
- **빌드**: `build/build.mjs` (정본, Node) / `build/build.ps1` (Windows용 미러)
- **외부 구성요소**: Serena·specify-cli (uv tool), pstack (cursor/plugins
  git clone 후 normalize_skills.mjs 정규화), OpenCode Desktop/CLI (OS별 패키지)

## 구조 결정

1. **설정 스키마는 문서가 아니라 설치본 실측으로 확정한다.**
   `opencode debug config`에서 살아남는 키만 쓴다: `provider`(단수), `npm`,
   `options`, flat `mcp`, 모델의 `cost.cache_read/cache_write`, `modalities`,
   `reasoning`(불리언), variants 객체 맵. 문서용 JSON 스키마 파일은 레거시
   키까지 수용하는 것처럼 보여도 로더는 조용히 제거하므로 근거로 삼지 않는다.
2. **키는 생성 설정에 직접 넣는다.** `{env:SSU_API_KEY}`는 설정 폴더 .env로
   해석되지 않음을 로컬 목 서버 실측으로 확인했다(요청에 인증 헤더 없음).
   대안인 OS 환경변수 등록은 데스크톱 앱 실행 경로(탐색기/독)에서 보장되지
   않아 탈락. 설정 파일은 0600, .env는 bridge/HUD 전용으로 병행 유지.
3. **성공 표시는 실측 뒤에만.** 설정 재생성과 스킬 정규화는 종료 코드와 출력을
   검사한 뒤에만 [OK]를 찍는다. 부분 실패는 skip 사유를 그대로 보여준다.
4. **설치 폴더는 문서상의 복수형(commands/, skills/)**. 단수형도 1.19.x에서
   로드되지만 호환 동작이므로 의존하지 않는다.
5. **Linux 데스크톱은 공식 GitHub 릴리스에서 받는다.** .deb 우선, 실패 시
   AppImage를 ~/.local에 배치하고 .desktop 항목을 만든다.

## 검증 방식

- 정적: `opencode debug config` / `opencode models` / `opencode debug skill`로
  생성 설정의 로더 생존 확인.
- 동적(키 불필요): 로컬 목 서버를 baseURL로 지정하고 `opencode run` 요청의
  Authorization 헤더 유무를 확인 — 키 내장 방식의 회귀 방지 테스트.
- 설치기: SSU_DRY_RUN=1 전 경로 exit 0, .cmd 폴리글롯 유닉스 부트스트랩 실행.
- 실키 End-to-End(모델 호출, /credits 실측)는 키 소유자 수행 항목으로 분리.
