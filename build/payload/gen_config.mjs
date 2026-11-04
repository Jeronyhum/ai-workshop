// Builds opencode.jsonc from the live SSU (BAZE) gateway catalog.
// Usage: node gen_config.mjs <api-key> <config-dir> [serenaPath]
//   serenaPath: absolute path to the executable, or "" to skip.
//   (Headroom was removed 2026-11-04 by owner decision: registered as MCP only it
//   never compressed anything automatically, and the [all] install weighs gigabytes.)
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const key = process.argv[2];
const dir = process.argv[3] || path.join(os.homedir(), ".config", "opencode");
const serenaPath = (process.argv[4] || "").trim();

const BASE = process.env.SSU_GATEWAY_BASE || "https://factchat-cloud.mindlogic.ai/v1/gateway";
const ORIGIN = new URL(BASE).origin;
const CONTEXT_CAP = 500000;
const DEFAULT_OUTPUT = 32768;

if (!key || !key.trim()) {
  console.error("usage: node gen_config.mjs <api-key> <config-dir>");
  process.exit(2);
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function get(p, tries = 4) {
  let last;
  for (let i = 0; i < tries; i++) {
    try {
      const res = await fetch(BASE + p, {
        headers: { Authorization: "Bearer " + key, Accept: "application/json" },
      });
      if (res.status === 401 || res.status === 403) {
        throw Object.assign(new Error("unauthorized"), { fatal: true });
      }
      if (!res.ok) throw new Error(`GET ${p} -> ${res.status}`);
      return await res.json();
    } catch (e) {
      if (e.fatal) throw e;
      last = e;
      await sleep(400 * (i + 1));
    }
  }
  throw last;
}

async function pool(items, limit, fn) {
  const out = new Array(items.length);
  let next = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (true) {
      const i = next++;
      if (i >= items.length) return;
      out[i] = await fn(items[i], i);
    }
  });
  await Promise.all(workers);
  return out;
}

// ---------- catalog ----------
const list = await get("/models/?type=llm");
const ids = (list.data || []).map((m) => m.id).filter(Boolean);
if (!ids.length) {
  console.error("no models returned by the gateway");
  process.exit(3);
}

let failures = [];
const details = {};
await pool(ids, 6, async (id) => {
  try {
    details[id] = await get(`/models/${id}/`);
  } catch (e) {
    failures.push(id);
  }
});

// Second pass for the stragglers: one at a time with a longer backoff. The gateway
// throttles bursts, so serial retries recover almost all of them.
if (failures.length) {
  const retry = failures;
  failures = [];
  for (const id of retry) {
    await sleep(600);
    try {
      details[id] = await get(`/models/${id}/`, 6);
    } catch (e) {
      failures.push(id);
    }
  }
}

// ---------- classification ----------
const NO_THINKING = new Set([
  "gpt-audio-1.5",
  "grok-4.7",
  "sonar-pro",
  "sonar-reasoning-pro",
  "google/gemma-4-31B-it",
  "google/gemma-3-27b-it",
]);

const isVision = (id) =>
  !id.startsWith("gpt-audio") &&
  (id.startsWith("claude-") ||
    id.startsWith("gpt-") ||
    id.startsWith("gemini-") ||
    id.startsWith("grok-4") ||
    id.startsWith("google/gemma-"));

function entry(id, lane) {
  const d = details[id] || {};
  const ctx = Math.min(Number(d.context_limit || CONTEXT_CAP), CONTEXT_CAP);
  const out = Number(d.max_output_tokens || DEFAULT_OUTPUT);
  const m = { name: id, limit: { context: ctx, output: out } };

  const p = d.pricing || {};
  if (p.input != null && p.output != null) {
    // opencode schema: flat cache_read / cache_write (a nested `cache` object is stripped).
    const cost = { input: p.input, output: p.output };
    if (p.cache_read != null) cost.cache_read = p.cache_read;
    if (p.cache_write != null) cost.cache_write = p.cache_write;
    m.cost = cost;
  }

  // Reasoning-effort ladders measured live on the gateway (2026-11-04,
  // reasoning_effort on the chat lane, 2026+ models):
  // - xhigh+max accepted: deepseek v4 flash/pro, qwen3.8-max, glm-5.2, all claude
  // - xhigh only (max = HTTP 400): the gpt-5.4/5.5/5.6/6/6.1 chat models below
  // - max only (xhigh = HTTP 400): glm-5.3, glm-5.3-flash
  // - xhigh/max rejected, low/medium/high fine: gemini family (default ladder)
  // Untested models keep the conservative default ladder for their lane.
  const EFFORT_FULL = new Set(["deepseek-v4.1-flash", "deepseek-v4-pro", "qwen3.8-max", "glm-5.2"]);
  const EFFORT_XHIGH = new Set(["gpt-6.1-sol", "gpt-6.1-terra", "gpt-6-sol", "gpt-6-luna", "gpt-6-astra", "gpt-5.6-sol", "gpt-5.6-terra", "gpt-5.6-luna", "gpt-5.5", "gpt-5.4"]);
  const EFFORT_MAX_ONLY = new Set(["glm-5.3", "glm-5.3-flash"]);
  const efforts = NO_THINKING.has(id)
    ? null
    : EFFORT_MAX_ONLY.has(id)
      ? ["low", "medium", "high", "max"]
      : EFFORT_FULL.has(id) || EFFORT_XHIGH.has(id)
        ? EFFORT_FULL.has(id)
          ? ["low", "medium", "high", "xhigh", "max"]
          : ["low", "medium", "high", "xhigh"]
        : lane === "claude"
          ? ["low", "medium", "high", "xhigh", "max"]
          : ["low", "medium", "high"];
  // opencode model fields are `modalities` / `reasoning` / `attachment` — there is no
  // `capabilities` block (it is stripped silently) and no model-level `reasoningField`.
  if (isVision(id)) {
    m.modalities = { input: ["text", "image"], output: ["text"] };
    m.attachment = true;
  }
  if (efforts) m.reasoning = true;

  if (efforts) {
    // opencode variants are an object map {name: options}; an array is a hard config error.
    const variant = (make) => Object.fromEntries(efforts.map((e) => [e, make(e)]));
    if (lane === "claude") {
      m.variants = variant((e) => ({ thinking: { type: "adaptive" }, output_config: { effort: e } }));
    } else if (lane === "openai") {
      m.variants = variant((e) => ({ reasoning: { effort: e } }));
    } else {
      m.variants = variant((e) => ({ reasoning_effort: e }));
    }
  }
  return m;
}

const claude = {};
const openai = {};
const compat = {};
// Iterate the catalog, not the fetched details: a model whose detail call still failed
// keeps default limits and lands in the compatible lane instead of vanishing from the picker.
for (const id of ids) {
  const d = details[id] || {};
  const eps = d.endpoints || [];
  if (eps.includes("/v1/gateway/claude/v1/messages/")) claude[id] = entry(id, "claude");
  else if (eps.includes("/v1/gateway/responses/")) openai[id] = entry(id, "openai");
  else compat[id] = entry(id, "compat");
}

// opencode 1.19.x ground truth (verified with `opencode debug config` / `opencode run`):
// the top-level key is `provider` (singular) — `providers` is ignored with no error, so
// every model silently vanishes. The package key is `npm` and the settings key is
// `options`; `package`/`settings` are stripped, leaving a provider that cannot call out.
// The API key is embedded literally: `{env:SSU_API_KEY}` is NOT resolved from the config
// dir's .env file (measured: requests went out with no Authorization header), while the
// key in the process environment works. The installers keep a 0600 .env next to this
// file for ssu-bridge/HUD, which read it themselves; this file gets mode 0600 too.
const providers = {};
if (Object.keys(claude).length) {
  providers["factchat-claude"] = {
    name: "BAZE (Claude)",
    npm: "@ai-sdk/anthropic",
    options: { baseURL: BASE + "/claude/v1", apiKey: key },
    models: claude,
  };
}
if (Object.keys(openai).length) {
  providers["factchat-openai"] = {
    name: "BAZE (GPT)",
    npm: "@ai-sdk/openai",
    options: { baseURL: BASE, apiKey: key },
    models: openai,
  };
}
if (Object.keys(compat).length) {
  providers.factchat = {
    name: "BAZE",
    npm: "@ai-sdk/openai-compatible",
    options: { baseURL: BASE, apiKey: key },
    models: compat,
  };
}

// ---------- Subagent tiers (dynamic routing pool) ----------
// /start routes subtasks to tier agents by difficulty, cost efficiency and
// prompt-cache reuse. Tiers are picked from the LIVE catalog by name; a tier
// whose family is absent from the catalog is simply not emitted (the /start
// playbook falls back to its rules table in that case).
const allChat = [];
for (const [prov, p] of Object.entries(providers)) {
  for (const [id, m] of Object.entries(p.models || {})) {
    allChat.push({ prov, id, costIn: Number(m?.cost?.input || 0) });
  }
}
const byCostAsc = (a, b) => a.costIn - b.costIn;
function pickTier(re, { exclude = null, cheapest = true, prefer = null } = {}) {
  let c = allChat.filter((m) => re.test(m.id) && !(exclude && exclude.test(m.id)));
  if (prefer) {
    const p = c.filter((m) => prefer.test(m.id));
    if (p.length) c = p;
  }
  if (!c.length) return null;
  c.sort(cheapest ? byCostAsc : (a, b) => b.costIn - a.costIn);
  return c[0];
}
const NOT_FRONTIER = /mini|nano|flash|haiku|luna|gemma|decision/i;
// Advisor = highest Artificial Analysis Intelligence Index available in the
// catalog. Owner rule (2026-11-04): benchmark standing decides, not price —
// on this gateway price is a poor proxy (gpt-5.4-pro input $30 scored below
// every model on this list; claude-opus-5-5 input $4 tops it).
// AA Index snapshot 2026-11-04 (artificialanalysis.ai/leaderboards/models):
// Gemini 4 Carbon 60 (not in catalog), Claude Opus 5.5 59, GPT-6 Astra 57,
// GPT-6.1 Sol 55, Claude Sonnet 5.5 55, Gemini 4 Argon 50, Claude Fable 5.1 50.
const AA_ADVISOR_ORDER = [
  "gemini-4-carbon", "claude-opus-5-5", "gpt-6-astra", "gpt-6.1-sol",
  "claude-sonnet-5-5", "gemini-4-argon", "claude-fable-5-1",
];
const aaPick = AA_ADVISOR_ORDER
  .map((p) => allChat.find((m) => m.id === p || m.id.startsWith(p)))
  .find(Boolean) || null;
const tierModels = {
  "w-flash": pickTier(/flash/i),
  "w-haiku": pickTier(/haiku/i),
  "w-luna": pickTier(/luna/i, { exclude: /decision/i }),
  "w-gemma": pickTier(/gemma/i, { prefer: /gemma[-_ ]?4|gemma4/i }),
  advisor: aaPick ||
    pickTier(/opus/i, { cheapest: false }) ||
    pickTier(/gpt-6|gpt-5/i, { exclude: NOT_FRONTIER, prefer: /pro/i, cheapest: false }) ||
    pickTier(/./, { cheapest: false }),
};
const AGENT_DEFS = {
  "w-flash": {
    description: "가장 빠르고 싼 워커 (중국 오픈웨이트 flash 계열). 대량·단순·반복 작업, 초안 생성, 목록 처리에 쓴다.",
    prompt:
      "You are a fast, cheap worker agent. Do exactly the assigned subtask, keep output compact, and report blockers verbatim instead of guessing. Do not expand scope.",
  },
  "w-haiku": {
    description: "가볍고 빠른 균형 워커. 요약·분류·작은 코드 수정·문서 정리에 쓴다.",
    prompt:
      "You are a light, fast worker agent. Do exactly the assigned subtask, keep output compact, and report blockers verbatim instead of guessing. Do not expand scope.",
  },
  "w-luna": {
    description: "중간 난이도 워커. 일반적인 구현·분석·리서치 종합에 쓴다.",
    prompt:
      "You are a mid-tier worker agent. Do exactly the assigned subtask with care, verify your own output once, and report blockers verbatim. Do not expand scope.",
  },
  "w-gemma": {
    description: "오픈웨이트 워커 (Gemma 계열). 긴 글 읽기·대규모 컨텍스트 훑기·초벌 정리에 쓴다.",
    prompt:
      "You are an open-weight worker agent for long-context reading and first-pass organization. Do exactly the assigned subtask and report blockers verbatim. Do not expand scope.",
  },
  advisor: {
    description: "최상위 어드바이저. 작업이 막힌 국소 부위에만 짧게 개입해 방향과 해법을 제시한다. 직접 전체를 다시 하지 않는다.",
    prompt:
      "You are a senior advisor. You receive a small stuck-point package (goal, failing spot, exact error, attempts). Give a diagnosis and concrete next steps for that local problem only. Do not redo the whole task.",
  },
};
const agents = {};
for (const [name, def] of Object.entries(AGENT_DEFS)) {
  const t = tierModels[name];
  if (!t) continue;
  agents[name] = {
    description: def.description,
    mode: "subagent",
    model: `${t.prov}/${t.id}`,
    prompt: def.prompt,
  };
}

// ---------- MCP ----------
// opencode's `mcp` is a flat map of server names (no `servers` wrapper — that only
// worked through an undocumented tolerance). `timeout` matters: opencode's default
// MCP request timeout is 5000ms, and Exa deep search / answers routinely exceed it,
// which would cut the call after the gateway already charged credits.
const servers = {};

try {
  const suites = (await get("/mcp/")).data || [];
  for (const s of suites) {
    if (!s?.slug || !s?.url) continue;
    servers[s.slug] = {
      type: "remote",
      url: ORIGIN + s.url,
      headers: { Authorization: "Bearer " + key },
      timeout: 120000,
    };
  }
} catch (e) {
  console.error("warning: gateway MCP suites unavailable (" + e.message + ")");
}

servers["ssu-bridge"] = {
  type: "local",
  command: ["node", path.join(dir, "mcp", "ssu-bridge.mjs")],
  timeout: 120000,
};

if (serenaPath) {
  servers.serena = {
    type: "local",
    command: [serenaPath, "start-mcp-server", "--context", "ide", "--project-from-cwd"],
    timeout: 60000,
  };
}

const cfg = {
  $schema: "https://opencode.ai/config.json",
  provider: providers,
  mcp: servers,
};
if (Object.keys(agents).length) cfg.agent = agents;

const target = path.join(dir, "opencode.jsonc");
fs.mkdirSync(dir, { recursive: true });

// opencode reads opencode.jsonc before opencode.json; having both is a known footgun.
const jsonTwin = path.join(dir, "opencode.json");
if (fs.existsSync(jsonTwin)) {
  fs.renameSync(jsonTwin, jsonTwin + ".bak-" + Date.now());
  console.error("note: opencode.json renamed to .bak (jsonc takes precedence)");
}

fs.writeFileSync(target, JSON.stringify(cfg, null, 2), { encoding: "utf8", mode: 0o600 });
try {
  fs.chmodSync(target, 0o600); // tightens a pre-existing file too; the config embeds the key
} catch {}

const total = Object.keys(claude).length + Object.keys(openai).length + Object.keys(compat).length;
console.log(`models: claude ${Object.keys(claude).length} / gpt ${Object.keys(openai).length} / compat ${Object.keys(compat).length} = ${total}`);
console.log(`mcp: gateway ${Object.keys(servers).length - 1 - (serenaPath ? 1 : 0)} + bridge${serenaPath ? " + serena" : ""}`);
console.log(`agents: ${Object.entries(agents).map(([n, a]) => `${n}=${a.model}`).join(", ") || "(티어 모델을 카탈로그에서 찾지 못함)"}`);
if (failures.length) console.error(`warning: ${failures.length} model detail(s) failed, kept with default limits: ${failures.slice(0, 5).join(", ")}`);
