---
description: BAZE 게이트웨이 크레딧 잔액과 오늘 사용량을 보여줍니다
---

`ssu-bridge` MCP 서버의 `credits` 도구를 호출하고, 이어서 `usage` 도구를 `by=model`, `scope=key`로 호출해.

그 다음 아래 형식으로 한국어 보고를 만든다. 숫자는 도구가 돌려준 값만 쓴다. 추측하거나 반올림해서 새 수치를 만들지 않는다.

```
BAZE 크레딧
  잔액:      {remaining} / {quota}  ({pct}% 남음)
  월 할당:   {monthly_allocated.quota} (사용 {monthly_allocated.used})
  구매분:    {purchased.quota} (사용 {purchased.used})
  갱신일:    {monthly_allocated.renewal_date}

오늘 사용: {total.credits} 크레딧 / {total.call_count}회
  - {model}: {credits} cr ({call_count}회)
```

도구 호출이 실패하면 실패 이유만 한 줄로 알리고 수치를 지어내지 않는다.
