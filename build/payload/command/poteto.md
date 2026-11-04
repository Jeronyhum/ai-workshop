---
description: Run pstack's poteto-mode in opencode (strict engineering workflow)
---

The pstack skills are installed at `~/.config/opencode/skills/<name>/SKILL.md`. Proceed with Cursor-specific notation converted to opencode notation.

## How to run

1. Load `poteto-mode` with the `skill` tool and follow its instructions exactly as written.
2. If `poteto-mode` calls other skills (`how`, `why`, `architect`, `tdd`, `unslop`, `principle-*`, etc.), load them the same way with the `skill` tool. Never read the files directly.
3. If `poteto-mode` refers to a relative path `../<name>/SKILL.md`, that is a sibling folder under the same skill root. The real path is `~/.config/opencode/skills/<name>/SKILL.md`.

## Notation conversion (Cursor → opencode)

| pstack original | In opencode |
|---|---|
| `Task` tool | `task` tool (runs subagents) |
| `subagent_type: poteto-agent` | `subagent_type: general` |
| `subagent_type: comment-sicko` | `subagent_type: general`, with "읽기 전용, 코멘트 리뷰만" stated in the prompt |
| `readonly: true` | `subagent_type: explore` |
| `readonly: false` | `subagent_type: general` |
| `AskQuestion` | Just ask in plain text |
| Todo list | Use the `todowrite` tool if available; otherwise keep the list inside the reply |
| `Grep`/`Glob` | `grep`/`glob` tools |
| Model spec (`claude-opus-5-5-xhigh`, `grok-*`, etc.) | Ignore it and use the session model. Note in one line that it was ignored |
| `environment: "cloud"` | Ignore. Work locally |
| Cursor Automations, Bugbot, cloud agents | Skip them, and write only one line: `opencode에서는 건너뜀: <단계>` |

## Never do

- Never imitate fields or values that exist only in Cursor. Drop anything not in the schema, and say in one line that it was dropped.
- Never summarize poteto-mode's original rules to shorten them. Follow them as written.
