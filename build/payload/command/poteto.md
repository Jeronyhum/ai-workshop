---
description: pstack의 poteto-mode를 opencode에서 실행합니다 (엄격한 엔지니어링 워크플로)
---

pstack 스킬은 `~/.config/opencode/skill/<이름>/SKILL.md` 에 설치되어 있다. Cursor 전용 표기를 opencode 표기로 바꿔서 진행한다.

## 실행 방법

1. `skill` 도구로 `poteto-mode` 를 로드하고, 그 지시를 그대로 따른다.
2. `poteto-mode` 가 다른 스킬(`how`, `why`, `architect`, `tdd`, `unslop`, `principle-*` 등)을 부르면 같은 방식으로 `skill` 도구로 로드한다. 파일을 직접 읽지 않는다.
3. `poteto-mode` 가 상대 경로 `../<name>/SKILL.md` 를 언급하면, 그건 같은 스킬 루트의 형제 폴더다. 실제 경로는 `~/.config/opencode/skill/<name>/SKILL.md`.

## 표기 변환 (Cursor → opencode)

| pstack 원문 | opencode에서 |
|---|---|
| `Task` 도구 | `task` 도구 (서브에이전트 실행) |
| `subagent_type: poteto-agent` | `subagent_type: general` |
| `subagent_type: comment-sicko` | `subagent_type: general`, 프롬프트에 "읽기 전용, 코멘트 리뷰만" 명시 |
| `readonly: true` | `subagent_type: explore` |
| `readonly: false` | `subagent_type: general` |
| `AskQuestion` | 그냥 텍스트로 질문한다 |
| 할 일 목록 | `todowrite` 도구가 있으면 쓰고, 없으면 답변 안에 목록을 유지 |
| `Grep`/`Glob` | `grep`/`glob` 도구 |
| 모델 지정(`claude-opus-5-5-xhigh`, `grok-*` 등) | 무시하고 세션 모델을 쓴다. 무시했다고 한 줄 알린다 |
| `environment: "cloud"` | 무시. 로컬에서 한다 |
| Cursor Automations, Bugbot, 클라우드 에이전트 | 건너뛰고 `opencode에서는 건너뜀: <단계>` 한 줄만 쓴다 |

## 하지 않는 것

- Cursor에만 있는 필드나 값을 흉내내지 않는다. 스키마에 없는 건 버리고, 버렸다고 한 줄 말한다.
- `poteto-mode`의 원문 규칙을 요약해서 줄이지 않는다. 그대로 따른다.
