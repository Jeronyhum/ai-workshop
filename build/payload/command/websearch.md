---
description: SSU gateway Exa web search, page text extraction, and sourced answers (credits deducted per call)
---

When the user wants a web search, recent information, a page's full text, or an answer with sources, use the Exa tools of the `ssu-bridge` MCP server.
Use this route first instead of answering from model knowledge.

Search topic: $ARGUMENTS

If the topic is empty, ask what to look for first. If only a URL is given, fetch its text with `exa_contents` instead of searching.

## Search → `exa_search`

- `query` (required), `num_results` default 10 (results beyond 10 cost extra)
- Deep search: `type: "deep"` (costs more); fast search: `type: "fast"`
- `summary: true` costs extra per page

## Extract text → `exa_contents`

- `urls` up to 100, `max_characters` default 4000
- Pass `summary_query` to have it summarized against that query

## Sourced answer → `exa_answer`

- `query` required; use `system_prompt` to set how the answer is written

## Rules

- Every Exa call is paid. If a result includes a `차감 크레딧` line, report it to the user as well.
- The org limit is 5 requests per second. On a 429, retry after 1 second.
- Report results with the original titles, URLs, and relevant passages verbatim. Never fill gaps with summary content that isn't there.
- If the search results are empty, say "검색 결과 없음". Never fill in with guesses.
