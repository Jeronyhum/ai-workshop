---
description: Classify and score with a judgment model (billed on input tokens only)
---

Call the `decide` tool of the `ssu-bridge` MCP server.

User input: $ARGUMENTS

- `state`: the entire input above is the content to judge. If the input is empty, ask what to judge first — never invent content.
- `questions`: if judging criteria are written into the input, convert them into questions. If there are no criteria, propose criteria that fit the content, get the user's confirmation, then call. For `model=jev`, an object `{name: {type, instructions, criteria}}`; for `model=luna`, an array `[{name, type, instructions, choices|levels}]`
- `model`: default `jev`. If `jev` returns 502, retry with `luna` and tell the user about the retry.

Show the result JSON as-is, and for each judgment explain in one line why it came out that way, checked against the criteria.
If the tool fails, quote the error body verbatim. Never fabricate a judgment.
