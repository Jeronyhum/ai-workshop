---
description: 판정 모델로 분류·채점합니다 (입력 토큰만 과금)
---

`ssu-bridge` MCP 서버의 `decide` 도구를 호출한다.

사용자 입력: $ARGUMENTS

- `state`: 위 입력 전체가 판정할 내용이다. 입력이 비어 있으면 판정할 내용을 먼저 물어본다 — 지어내지 않는다.
- `questions`: 입력에 판정 기준이 함께 적혀 있으면 그걸 질문으로 변환한다. 기준이 없으면 내용에 맞는 기준을 제안해 사용자 확인을 받고 호출한다. `model=jev` 이면 객체 `{이름: {type, instructions, criteria}}`, `model=luna` 이면 배열 `[{name, type, instructions, choices|levels}]`
- `model`: 기본 `jev`. `jev`가 502를 돌려주면 `luna`로 재시도하고, 재시도 사실을 사용자에게 알린다.

결과 JSON은 그대로 보여주고, 각 판정에 대해 왜 그렇게 나왔는지 criteria와 대조해 한 줄씩 설명한다.
도구가 실패하면 에러 본문을 그대로 인용한다. 판정을 지어내지 않는다.
