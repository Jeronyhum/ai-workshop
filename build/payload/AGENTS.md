# SSU Workshop Global Instructions

This file applies to every OpenCode session on this machine.
The structure has three layers: the **OpenCode harness**, inside it the
**vibe-coder harness** (the workflow below), and inside that `/start`
running an **autonomous work framework**. Do not use the tools piecemeal.

## /start — Autonomous Work Framework (the practical entry point)

When the user brings an idea, start with `/start`. `/start` fixes intent
via Detective, assembles a work frame (Harness²'s 8 components: system
prompt · guardrails · memory · tool guidance · subagents · skills ·
scripts · plugins), then runs autonomously through spec → decomposition →
routing → execution → verification → retrospective. `commands/start.md`
is the canonical definition of the phases.

### Subagent Tiers (dynamic routing)

Assign each subtask to a tier by difficulty, cost efficiency, and prompt
cache reuse. The assignment decision is made by Jev (the `decide` tool),
and the `jev-router` plugin re-decides on every Task call and logs to
`routing-log.jsonl`.

- `w-flash` — fastest, cheapest worker. Bulk, simple, repetitive work; draft generation.
- `w-gemma` — long-text reading, sweeping large contexts, rough first-pass organization.
- `w-haiku` — light judgment: summaries, classification, small edits.
- `w-luna` — mid-difficulty work: general implementation and analysis.
- `advisor` — top-tier model. Use it **only on a stuck local spot**: when
  the same task fails twice, send only the failure package (goal, raw
  error, list of attempts) — not the whole task — take the advice, and
  let the original tier resume.

Cache rules (confirmed by measurement, 2026-11-04): the prompt cache hits
only when the prefix (the leading part) is identical on the same model.
Measured: on repeated calls with an identical prompt, 92~99% of input was
served from cache, and the cache price is 1/5 of the input price.
- For tasks that repeatedly process the same long context, **do not
  switch models.** Switching discards all cache reads.
- **Keep the effort level (variant) too.** Changing it can split the cache.
- Put **stable content first, changing content last**. Keep shared
  instructions and context byte-identical, and append per-round
  differences at the end (if the prefix wobbles, everything after it is a
  cache miss).
- Every call carries a **5-credit base fee** (measured). Do not split work
  into many small calls; bundle tasks that share a context into one worker.

Effort-level operation (measured 2026-11-04 + operating policy): flash-class
models gain a lot at max — for genuinely hard work (difficulty L), use max
even on flash. But measurement also confirmed that at max, reasoning does
not stop short on its own: deepseek flash burned an entire 16,000-token
output cap on reasoning alone for one mid-difficulty problem, and glm
flash reasoned for over 180 seconds without starting its answer. So a max
call has three preconditions.
- Set an **output budget** sized to the task (room for reasoning + answer).
  This class allows 130K–380K output tokens, so there is headroom, but
  leaving it unbounded costs that much time and credit.
- Avoid open-ended instructions like "show every step without omission" —
  the main cause of reasoning blowups.
- Take max calls **via streaming, with a generous output-token cap.** A
  long non-streaming call can lose its connection before the response
  arrives (measured), and a small cap lets reasoning eat the whole cap so
  no answer comes out. Measured reference: on a mid-difficulty counting
  problem, deepseek flash's natural max reasoning was about 37,000 tokens
  / 3.6 minutes, and given that much room it produced the correct answer —
  a model that solved the same problem lightly got it wrong. Size caps
  against this scale.
- **Per-effort output budgets (from vendor docs, applied uniformly)**:
  low 8K · medium 16K · **high 64K · xhigh 96K · max 128K**.
  Basis: DeepSeek's official defaults are 64K in thinking mode and 128K
  at max; Qwen's thinking-budget presets converge to low 4K · medium 16K ·
  high-and-above uncapped (default ceiling about 128K); GLM's max output
  is 128K. Raise the budget together with the level — raising the level
  while keeping the budget lets reasoning eat the budget and end with no
  answer.
- Note: the GLM-5.3 family officially has only low·high·max (xhigh does
  not exist, so it returns 400). When you need xhigh on GLM, use max.
- If a call ends finish=length with no answer, before lowering the effort
  level, retry with a **larger budget or a narrower prompt**.
For easy/repetitive work (S·M), high or below is enough, and matches the cost.

## Vibe-Coder Harness — The Full Loop (one round)

1. **Intent** — fix "what, and why" with vibe-coach. Never start from a guess.
2. **Spec** — for a new feature/product, use spec-kit (`/speckit.*`) to produce spec → plan → task list first.
3. **Map** — use graphify to see the project's overall structure and impact scope.
4. **Precision work** — use serena for symbol-level search and edits.
5. **Discipline** — use pstack skills to set the working method (routing below).
6. **Verification** — confirm with execution results. When done, update the graphify map.

Small fixes (typos, one-line changes) may skip steps 2–3. New features may not.

## Tool Ownership

### vibe-coach (intent)

- Owns session start and intent fixing. Follows the "first conversation rules" below.

### spec-kit (spec)

- New feature/product: `/speckit.specify` (spec) → `/speckit.clarify` (questions on ambiguities) →
  `/speckit.plan` (plan) → `/speckit.tasks` (task list) → `/speckit.implement` (implementation), in order.
- Do not write large code without a spec. If implementation diverges from
  the spec, tell the user and update the spec before changing the code.

### graphify (structure map)

- Structure questions — "How is this project structured?", "If I change
  this, what is affected?", "How are A and B connected?" — belong to graphify.
- If the project has `graphify-out/graph.json`, answer structure questions
  first with `graphify query "<question>"` / `graphify path "A" "B"` /
  `graphify explain "X"`.
- If there is no map and the question is one-shot ("Where is X defined?"),
  grep·serena are cheaper. Build the map with `/graphify` on large projects
  you will query repeatedly.
- After changing code, update the map with `graphify update <path>` (no LLM needed, fast).

### serena (symbol-level hands)

- Actual code reading/editing uses serena tools: symbol overview → read
  only the needed symbols → symbol-level replace/insert → trace references.
- graphify gets the structural feel; serena reads and edits exact bodies.
- Reading whole files is the last resort.

### pstack (discipline layer — poteto's playbooks)

pstack is poteto's engineering skill collection from Cursor (cursor/plugins).
Its philosophy is not "fast and much" but "dig deep, do less, keep it
verifiable" and "parallel execution without fear". Its role in this harness
is the **discipline layer**:

- The entry point is `poteto-mode`. Pick the **playbook** matching the work
  type (feature / bug-fix / research / autonomous-run / orchestrate …),
  open its steps as todos, and apply skills at each step.
- Step skill examples: start with `how`·`sharpen`, root-cause with
  `why`·`interrogate`, impact scope with `blast-radius`, implementation
  with `tdd`, correctness with `correct`, verification with
  `verify-lever`·`benchmark-checklist`, wrap-up with `reflect`·
  `show-me-your-work`.
- The `principle-*` skills are always-on principles. When poteto-mode calls
  them, load them together.
- poteto-mode's concept of picking an effort per subagent is implemented in
  this harness as the **tier routing (Jev decisions)** above.

### Open Design (design work)

- When design, frontend design, a prototype, or a presentation deck is
  needed, do not write code right away — **launch Open Design first**: run
  the desktop app and proceed in a form where the user watches the screen
  and refines directly. (In environments where the CLI `od` resolves to
  Open Design's, terminal launch is also possible — the name collides with
  macOS's system `od`, so launching the app is the default.)
- Open Design's model connection can use the SSU gateway as an
  OpenAI-compatible endpoint (`https://factchat-cloud.mindlogic.ai/v1/gateway`)
  (BYOK style). Use gateway-catalog models as-is, and have the user enter
  their own key only in the settings screen — never make them paste a key
  into chat.
- When image assets are needed, use ssu-bridge's `image` tool. The default
  model is `gpt-image-2.5-sunburst` (Artificial Analysis Image Arena #1);
  if cost matters more, `gemini-nano-banana-2.1`.

## First Conversation Rules

On receiving the first user message of a new session, move only in this order.

1. If the project's `PROJECT_INTENT.md` exists, read it.
2. Load the `vibe-coach` skill.
3. Greet only, and start with **at most 3 questions**. Do not write code.

If `PROJECT_INTENT.md` records what the user wants to build, use it as the starting point for the first questions. Do not re-ask from scratch.

## Common Rules

- Reply in Korean at all times.
- When a technical term first appears, attach a one-line explanation. Example: "MCP(모델이 외부 도구를 부르는 표준 규격)".
- When web evidence is needed, use `exa_search` / `exa_answer`. Do not assert current information from model knowledge.
- For credits use the `credits` tool; for usage history, `usage`. Do not guess figures.
- Do not say "done" without verification. Speak from execution results or output.

## Keys and Secrets

- Never print the `SSU_API_KEY` value on screen. Do not use commands that dump whole file contents.
- If a key ends up in a log, commit, or screenshot, report it immediately.
