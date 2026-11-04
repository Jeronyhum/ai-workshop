---
description: Look up credit usage by model and by day (free)
---

Call the `usage` tool of the `ssu-bridge` MCP server.

User input: $ARGUMENTS

If the input is empty, query with the defaults below. If a period is written in — e.g. "이번 달", "지난주", "10월" — convert it into `start_date`/`end_date`. If "일자별" is written in, use `by=day`.

- Default: `by=model`, `scope=key`
- By day: `by=day`
- Period: `start_date` / `end_date` (YYYY-MM-DD, max 92 days)

If the user names no period, use the tool's defaults. Present the results as a table, with the total and the call count included.
Point out the 3 most-used models, and if a comparison with the previous period is possible, add one line on the increase or decrease.
