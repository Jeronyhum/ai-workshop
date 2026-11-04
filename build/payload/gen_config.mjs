// Builds opencode.jsonc from the live SSU (BAZE) gateway catalog.
// Usage: node gen_config.mjs <api-key> <config-dir> [serenaPath] [headroomPath]
//   serenaPath / headroomPath: absolute path to the executable, or "" to skip.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const key = process.argv[2];
const dir = process.argv[3] || path.join(os.homedir(), ".config", "opencode");
const serenaPath = (process.argv[4] || "").trim();
const headroomPath = (process.argv[5] || "").trim();

const BASE = "https://factchat-cloud.mindlogic.ai/v1/gateway";
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
    const cost = { input: p.input, output: p.output };
    const cache = {};
    if (p.cache_read != null) cache.read = p.cache_read;
    if (p.cache_write != null) cache.write = p.cache_write;
    if (Object.keys(cache).length) cost.cache = cache;
    m.cost = cost;
  }

  const caps = {};
  if (isVision(id)) caps.input = ["text", "image"];
  const efforts = NO_THINKING.has(id)
    ? null
    : lane === "claude"
      ? ["low", "medium", "high", "xhigh", "max"]
      : ["low", "medium", "high"];
  if (efforts) caps.reasoning = { supported: true, effort: efforts };
  if (Object.keys(caps).length) m.capabilities = caps;

  if (efforts) {
    if (lane === "claude") {
      m.variants = efforts.map((e) => ({
        id: e,
        body: { thinking: { type: "adaptive" }, output_config: { effort: e } },
      }));
    } else if (lane === "openai") {
      m.variants = efforts.map((e) => ({ id: e, body: { reasoning: { effort: e } } }));
    } else {
      m.reasoningField = "reasoning_content";
      m.variants = efforts.map((e) => ({ id: e, body: { reasoning_effort: e } }));
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

const providers = {};
if (Object.keys(claude).length) {
  providers["factchat-claude"] = {
    name: "BAZE (Claude)",
    package: "@ai-sdk/anthropic",
    settings: { baseURL: BASE + "/claude/v1", apiKey: "{env:SSU_API_KEY}" },
    models: claude,
  };
}
if (Object.keys(openai).length) {
  providers["factchat-openai"] = {
    name: "BAZE (GPT)",
    package: "@ai-sdk/openai",
    settings: { baseURL: BASE, apiKey: "{env:SSU_API_KEY}" },
    models: openai,
  };
}
if (Object.keys(compat).length) {
  providers.factchat = {
    name: "BAZE",
    package: "@ai-sdk/openai-compatible",
    settings: { baseURL: BASE, apiKey: "{env:SSU_API_KEY}" },
    models: compat,
  };
}

// ---------- MCP ----------
const servers = {};

try {
  const suites = (await get("/mcp/")).data || [];
  for (const s of suites) {
    if (!s?.slug || !s?.url) continue;
    servers[s.slug] = {
      type: "remote",
      url: "https://factchat-cloud.mindlogic.ai" + s.url,
      headers: { Authorization: "Bearer {env:SSU_API_KEY}" },
    };
  }
} catch (e) {
  console.error("warning: gateway MCP suites unavailable (" + e.message + ")");
}

servers["ssu-bridge"] = {
  type: "local",
  command: ["node", path.join(dir, "mcp", "ssu-bridge.mjs")],
  enabled: true,
};

if (serenaPath) {
  servers.serena = {
    type: "local",
    command: [serenaPath, "start-mcp-server", "--context", "ide", "--project-from-cwd"],
    enabled: true,
  };
}

if (headroomPath) {
  servers.headroom = {
    type: "local",
    command: [headroomPath, "mcp", "serve"],
    enabled: true,
  };
}

const cfg = {
  $schema: "https://opencode.ai/config.json",
  providers,
  mcp: { servers },
};

const target = path.join(dir, "opencode.jsonc");
fs.mkdirSync(dir, { recursive: true });

// opencode reads opencode.jsonc before opencode.json; having both is a known footgun.
const jsonTwin = path.join(dir, "opencode.json");
if (fs.existsSync(jsonTwin)) {
  fs.renameSync(jsonTwin, jsonTwin + ".bak-" + Date.now());
  console.error("note: opencode.json renamed to .bak (jsonc takes precedence)");
}

fs.writeFileSync(target, JSON.stringify(cfg, null, 2), "utf8");

const total = Object.keys(claude).length + Object.keys(openai).length + Object.keys(compat).length;
console.log(`models: claude ${Object.keys(claude).length} / gpt ${Object.keys(openai).length} / compat ${Object.keys(compat).length} = ${total}`);
console.log(`mcp: gateway ${Object.keys(servers).length - 1 - (serenaPath ? 1 : 0) - (headroomPath ? 1 : 0)} + bridge${serenaPath ? " + serena" : ""}${headroomPath ? " + headroom" : ""}`);
if (failures.length) console.error(`warning: ${failures.length} model detail(s) failed, kept with default limits: ${failures.slice(0, 5).join(", ")}`);
