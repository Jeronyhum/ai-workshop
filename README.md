# ai-workshop: SSU x OpenCode 원클릭 설치기

워크숍 참가자가 클릭 한 번으로 받는 단일 설치 파일세트.

## 납품물 (참가자에게 배포할 파일, 딱 이것 하나)

- `build/ssu-opencode-setup.cmd` — Windows 더블클릭. macOS/Linux는 터미널에서 `bash ssu-opencode-setup.cmd`.

이 파일 하나가 배치 헤더 → 임베드된 ZIP → bash 부트스트랩으로 이어지는 polyglot이라,
같은 파일이 두 OS에서 동작한다.

## 설치되는 것

1. OpenCode Desktop (+ Node/Git/uv 자동 설치)
2. SSU BAZE API 키 입력 (https://ssu.factchat.bot/dashboard/developers 에서 발급, 화면에서만 입력)
3. 게이트웨이 전 모델(61개) + MCP(35+) 설정을 라이브 카탈로그에서 생성
4. 크레딧/컨텍스트 HUD (Windows WPF 바 / 그 외 브라우저 대시보드)
5. 코드 도구: Serena (MCP 등록, 심볼 단위 탐색·편집) + graphify (구조 지도 스킬)
6. 워크플로: pstack 58 스킬 (cursor/plugins 기준) + spec-kit
7. vibe-coach 코치 스킬 — 첫 대화에서 의도·유사제품·API 비용을 먼저 묻는다

## 저장소 구조

| 경로 | 내용 |
|---|---|
| `build/ssu-opencode-setup.cmd` | 최종 배포 파일 (빌드 산출물) |
| `build/build.ps1` | 페이로드를 ZIP→base64→.cmd로 패킹하는 빌더 |
| `build/HANDOFF.md` | 작업 인계 문서 (결정 이력, 잔여 작업, 테스트 명령) |
| `build/payload/` | 설치기 소스 (install.ps1/sh, gen_config.mjs, normalize_skills.mjs) |
| `build/payload/hud/` | HUD (status.mjs, WPF 바, 브라우저 대시보드) |
| `build/payload/mcp/ssu-bridge.mjs` | 크레딧/사용량 브리지 MCP |
| `build/payload/command/` | opencode 슬래시 명령 (/credits, /usage, /decide, /poteto ...) |
| `build/payload/skill/vibe-coach/` | 코치 스킬 |

## 재빌드

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File build/build.ps1
```

## 드라이런 테스트

```
SSU_DRY_RUN=1 SSU_SKIP_APPS=1 SSU_SKIP_TOOLS=1 SSU_ROOT=<임시폴더> SSU_ARGS=test cmd /c build\ssu-opencode-setup.cmd
```

API 키는 파일·로그에 평문 기록 금지. `.env`(SSU_API_KEY)와 환경변수로만 흘린다.
