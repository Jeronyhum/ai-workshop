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

  const efforts = NO_THINKING.has(id)
    ? null
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
if (failures.length) console.error(`warning: ${failures.length} model detail(s) failed, kept with default limits: ${failures.slice(0, 5).join(", ")}`);
