---
description: Show BAZE gateway credit balance and today's usage
---

Call the `credits` tool of the `ssu-bridge` MCP server, then call the `usage` tool with `by=model`, `scope=key`.

Then produce a report in Korean in the format below. Use only the values the tools returned. Never invent new figures or round numbers into different ones.

```
BAZE 크레딧
  잔액:      {remaining} / {quota}  ({pct}% 남음)
  월 할당:   {monthly_allocated.quota} (사용 {monthly_allocated.used})
  구매분:    {purchased.quota} (사용 {purchased.used})
  갱신일:    {monthly_allocated.renewal_date}

오늘 사용: {total.credits} 크레딧 / {total.call_count}회
  - {model}: {credits} cr ({call_count}회)
```

If a tool call fails, state the reason in one line and never fabricate figures.
