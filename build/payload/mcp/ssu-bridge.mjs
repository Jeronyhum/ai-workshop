#!/usr/bin/env node
// SSU gateway bridge for opencode (local MCP server, stdio, newline-delimited JSON-RPC).
// Exposes gateway features opencode has no native provider for: Exa web search, decisions, usage.
import { createInterface } from "node:readline";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const CONFIG_DIR = process.env.SSU_CONFIG_DIR || path.resolve(HERE, "..");
const BASE = "https://factchat-cloud.mindlogic.ai/v1/gateway";
// 이미지 생성 경로 — 확정 (2026-11-04, 대시보드 개발자 문서 실측):
// POST /v1/gateway/images/generate/ 가 정본이다.
// (기각된 후보: /images/generations 404, chat/completions에 이미지 모델 지정 404)
const IMAGE_PATH = "/images/generate/";
const ENV_CANDIDATES = [
  process.env.SSU_ENV_FILE,
  path.join(CONFIG_DIR, ".env"),
  path.join(os.homedir(), ".config", "opencode", ".env"),
  path.join(process.cwd(), ".env"),
].filter(Boolean);
const SERVER = { name: "ssu-bridge", version: "1.0.0" };
const SUPPORTED = ["2025-06-18", "2025-03-26", "2024-11-05"];

function apiKey() {
  if (process.env.SSU_API_KEY) return process.env.SSU_API_KEY.trim();
  for (const file of ENV_CANDIDATES) {
    try {
      const m = fs.readFileSync(file, "utf8").match(/SSU_API_KEY\s*=\s*(.+)/);
      if (m) return m[1].trim().replace(/^["']|["']$/g, "");
    } catch {}
  }
  throw new Error("SSU_API_KEY not found (looked in: " + ENV_CANDIDATES.join(", ") + ")");
}

async function gw(path, { method = "POST", body } = {}) {
  const init = {
    method,
    headers: { Authorization: "Bearer " + apiKey() },
    // Fail inside the MCP timeout (opencode allows 120s for this server) instead of
    // hanging until opencode cuts the call after credits were charged.
    signal: AbortSignal.timeout(90000),
  };
  if (body !== undefined) {
    init.headers["Content-Type"] = "application/json";
    init.body = JSON.stringify(body);
  }
  const res = await fetch(BASE + path, init);
  const raw = await res.text();
  let data;
  try {
    data = JSON.parse(raw);
  } catch {
    data = raw;
  }
  if (!res.ok) {
    const msg = typeof data === "string" ? data : JSON.stringify(data);
    throw new Error("HTTP " + res.status + ": " + msg.slice(0, 700));
  }
  return {
    data,
    charged: res.headers.get("x-credits-charged") || null,
    billing: res.headers.get("x-billing") || null,
  };
}

const asText = (value) => ({ content: [{ type: "text", text: value }] });
const asError = (message) => ({ content: [{ type: "text", text: message }], isError: true });

// Binary gateway call for the speech endpoint: it answers with raw audio
// bytes, not JSON, so gw() (text + JSON.parse) cannot be used for it.
async function gwBinary(path, body) {
  const res = await fetch(BASE + path, {
    method: "POST",
    headers: { Authorization: "Bearer " + apiKey(), "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(90000),
  });
  const buf = Buffer.from(await res.arrayBuffer());
  if (!res.ok) throw new Error("HTTP " + res.status + ": " + buf.toString("utf8").slice(0, 700));
  return {
    buf,
    contentType: res.headers.get("content-type") || "",
    charged: res.headers.get("x-credits-charged") || null,
  };
}

// Wrap raw PCM (the speech endpoint always returns L16 PCM — measured
// 2026-11-04: response_format mp3/wav are ignored, content-type stays
// audio/pcm) in a WAV container so the file plays anywhere.
// Gemini TTS PCM is 24kHz, 16-bit, mono.
function wavWrap(pcm, { sampleRate = 24000, channels = 1, bits = 16 } = {}) {
  const header = Buffer.alloc(44);
  const byteRate = (sampleRate * channels * bits) / 8;
  const blockAlign = (channels * bits) / 8;
  header.write("RIFF", 0);
  header.writeUInt32LE(36 + pcm.length, 4);
  header.write("WAVE", 8);
  header.write("fmt ", 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20); // PCM
  header.writeUInt16LE(channels, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(byteRate, 28);
  header.writeUInt16LE(blockAlign, 32);
  header.writeUInt16LE(bits, 34);
  header.write("data", 36);
  header.writeUInt32LE(pcm.length, 40);
  return Buffer.concat([header, pcm]);
}

function trim(s, n) {
  const t = String(s ?? "").replace(/\s+/g, " ").trim();
  return t.length > n ? t.slice(0, n) + "..." : t;
}

function billingLine(charged) {
  if (!charged) return "";
  return "\n\nCredits charged: " + charged;
}

const tools = [
  {
    name: "exa_search",
    description:
      "Exa web search. Returns titles, URLs, and relevant excerpts. Paid (~$0.007 in credits per search). Use when you need current information or web sources.",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Search query" },
        num_results: { type: "integer", minimum: 1, maximum: 100, description: "Number of results (default 10; results beyond 10 cost extra)" },
        type: {
          type: "string",
          enum: ["auto", "fast", "instant", "deep-lite", "deep", "deep-reasoning"],
          description: "Search type. Default auto. Deeper searches cost more",
        },
        highlights: { type: "boolean", description: "Include relevant excerpts (default true)" },
        summary: { type: "boolean", description: "Include page summaries (extra charge per page)" },
      },
      required: ["query"],
      additionalProperties: false,
    },
  },
  {
    name: "exa_contents",
    description: "Fetch body text, excerpts, and summaries for known URLs. Up to 100 URLs. Paid (per page, by content type).",
    inputSchema: {
      type: "object",
      properties: {
        urls: { type: "array", items: { type: "string" }, minItems: 1, maxItems: 100 },
        text: { type: "boolean", description: "Include body text (default true)" },
        highlights: { type: "boolean" },
        summary_query: { type: "string", description: "Question to summarize against. If given, a summary is included" },
        max_characters: { type: "integer", description: "Max body characters (default 4000)" },
      },
      required: ["urls"],
      additionalProperties: false,
    },
  },
  {
    name: "exa_answer",
    description: "Build a cited answer grounded in search results. Paid (per answer). Use for questions that need citations.",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Question" },
        system_prompt: { type: "string", description: "Instructions for how to answer" },
      },
      required: ["query"],
      additionalProperties: false,
    },
  },
  {
    name: "decide",
    description:
      "Classify or score with a judgment model. Charged on input tokens only. jev mode: questions is an object {name:{type,instructions,criteria}}; luna mode: an array [{name,type,instructions,choices|levels}].",
    inputSchema: {
      type: "object",
      properties: {
        state: { type: "string", description: "Content to judge (text or a JSON string)" },
        questions: { description: "jev: object / luna: array. A JSON string is also accepted" },
        model: { type: "string", enum: ["jev", "luna"], description: "Default jev" },
      },
      required: ["state", "questions"],
      additionalProperties: false,
    },
  },
  {
    name: "usage",
    description: "Credit usage history for this key. Free. by=model|key|day, scope=key|member, up to 92 days.",
    inputSchema: {
      type: "object",
      properties: {
        by: { type: "string", enum: ["model", "key", "day"] },
        scope: { type: "string", enum: ["key", "member"] },
        start_date: { type: "string", description: "YYYY-MM-DD" },
        end_date: { type: "string", description: "YYYY-MM-DD" },
      },
      additionalProperties: false,
    },
  },
  {
    name: "credits",
    description: "Remaining credit balance, plus monthly allocation and purchased-credit breakdown. Free.",
    inputSchema: { type: "object", properties: {}, additionalProperties: false },
  },
  {
    name: "image",
    description:
      "Generate an image. Paid (charged per image). Default model is gpt-image-2.5-sunburst (Artificial Analysis Image Arena #1, Elo 1222). If the response is b64, saves a png file in the current working folder and returns its path; if it is a url, returns the url.",
    inputSchema: {
      type: "object",
      properties: {
        prompt: { type: "string", description: "Description of the image to create" },
        model: { type: "string", description: "Image model (default gpt-image-2.5-sunburst). For value, gemini-nano-banana-2.1" },
        size: { type: "string", description: "Size (default 1024x1024, e.g. 1536x1024)" },
      },
      required: ["prompt"],
      additionalProperties: false,
    },
  },
  {
    name: "speak",
    description:
      "Synthesize speech (TTS) from text, save it as a wav file in the current working folder, and return its path. Paid (charged per call). Use for narration, voice guidance, or reading presentation scripts aloud. Default model gemini-3.8-flash-tts.",
    inputSchema: {
      type: "object",
      properties: {
        text: { type: "string", description: "Text to read aloud" },
        model: { type: "string", description: "TTS model (default gemini-3.8-flash-tts). Alternatives: gemini-2.5-pro-preview-tts (high quality), gemini-2.5-flash-preview-tts" },
        voice: { type: "string", description: "Voice name (per-model preset, e.g. Kore). Empty means the model default" },
      },
      required: ["text"],
      additionalProperties: false,
    },
  },
];

async function callTool(name, args) {
  switch (name) {
    case "exa_search": {
      const body = {
        query: args.query,
        numResults: args.num_results ?? 10,
      };
      if (args.type && args.type !== "auto") body.type = args.type;
      const contents = {};
      if (args.highlights !== false) contents.highlights = { maxCharacters: 400 };
      if (args.summary) contents.summary = { query: args.query };
      if (Object.keys(contents).length) body.contents = contents;
      const { data, charged } = await gw("/exa/search/", { body });
      const lines = (data.results || []).map((r, i) => {
        const parts = ["[" + (i + 1) + "] " + (r.title || "") + "\n    " + (r.url || "")];
        for (const h of r.highlights || []) parts.push("    > " + trim(h, 300));
        if (r.summary) parts.push("    Summary: " + trim(r.summary, 400));
        return parts.join("\n");
      });
      return asText(lines.join("\n\n") + billingLine(charged));
    }
    case "exa_contents": {
      const body = { urls: args.urls };
      if (args.text !== false) body.text = { maxCharacters: args.max_characters ?? 4000 };
      if (args.highlights) body.highlights = { maxCharacters: 400 };
      if (args.summary_query) body.summary = { query: args.summary_query };
      const { data, charged } = await gw("/exa/contents/", { body });
      const lines = (data.results || []).map((r) => {
        const parts = ["[" + (r.title || "") + "] " + (r.url || "")];
        if (r.text) parts.push(trim(r.text, 1200));
        for (const h of r.highlights || []) parts.push("> " + trim(h, 300));
        if (r.summary) parts.push("Summary: " + trim(r.summary, 400));
        return parts.join("\n    ");
      });
      return asText(lines.join("\n\n") + billingLine(charged));
    }
    case "exa_answer": {
      const body = { query: args.query };
      if (args.system_prompt) body.systemPrompt = args.system_prompt;
      const { data, charged } = await gw("/exa/answer/", { body });
      const cites = (data.citations || [])
        .map((c) => (typeof c === "string" ? c : c.url || ""))
        .filter(Boolean);
      return asText(
        String(data.answer ?? JSON.stringify(data)) +
          (cites.length ? "\n\nSources:\n" + cites.map((c) => "- " + c).join("\n") : "") +
          billingLine(charged),
      );
    }
    case "decide": {
      const luna = (args.model || "jev") === "luna";
      let questions = args.questions;
      if (typeof questions === "string") questions = JSON.parse(questions);
      const body = luna
        ? { model: "gpt-6-luna-decisions", input: args.state, questions }
        : { model: "jev-latest", state: args.state, questions };
      const { data } = await gw("/decisions/", { body });
      return asText(JSON.stringify(data, null, 2));
    }
    case "usage": {
      const qs = new URLSearchParams();
      qs.set("by", args.by || "model");
      qs.set("scope", args.scope || "key");
      if (args.start_date) qs.set("start_date", args.start_date);
      if (args.end_date) qs.set("end_date", args.end_date);
      const { data } = await gw("/usage/?" + qs.toString(), { method: "GET" });
      return asText(JSON.stringify(data, null, 2));
    }
    case "credits": {
      const { data } = await gw("/credits/", { method: "GET" });
      return asText(JSON.stringify(data, null, 2));
    }
    case "image": {
      const body = {
        model: args.model || "gpt-image-2.5-sunburst",
        prompt: args.prompt,
        n: 1,
        size: args.size || "1024x1024",
      };
      const { data, charged } = await gw(IMAGE_PATH, { body });
      const items = Array.isArray(data?.data) ? data.data : [];
      const lines = [];
      const saveB64 = (b64, i) => {
        const suffix = items.length > 1 ? "-" + (i + 1) : "";
        const file = path.join(process.cwd(), "ssu-image-" + Date.now() + suffix + ".png");
        fs.writeFileSync(file, Buffer.from(b64, "base64"));
        return "Saved: " + file;
      };
      items.forEach((item, i) => {
        if (item?.b64_json) {
          lines.push(saveB64(item.b64_json, i));
        } else if (typeof item?.url === "string" && item.url.startsWith("data:image/")) {
          // 실측 (2026-11-04): gpt-image 계열은 b64_json 대신 data URI를 url에 담아
          // 돌려준다. 그대로 출력하면 거대한 문자열이 되므로 파일로 저장한다.
          lines.push(saveB64(item.url.split(",", 2)[1] || "", i));
        } else if (item?.url) {
          lines.push(item.url);
        }
      });
      // 예상과 다른 응답 형식이면 추측으로 버리지 않고 원문을 그대로 돌려준다.
      if (!lines.length) return asText(JSON.stringify(data, null, 2) + billingLine(charged));
      return asText(lines.join("\n") + billingLine(charged));
    }
    case "speak": {
      const body = {
        model: args.model || "gemini-3.8-flash-tts",
        input: args.text,
      };
      if (args.voice) body.voice = args.voice;
      const { buf, contentType, charged } = await gwBinary("/audio/speech/", body);
      // JSON이 돌아오면 (에러 형식이거나 b64 인코딩인 경우) 원문을 그대로 보여준다.
      if (contentType.includes("json")) return asText(buf.toString("utf8").slice(0, 2000) + billingLine(charged));
      const wav = contentType.includes("wav") ? buf : wavWrap(buf);
      const file = path.join(process.cwd(), "ssu-tts-" + Date.now() + ".wav");
      fs.writeFileSync(file, wav);
      const seconds = (buf.length / (24000 * 2)).toFixed(1);
      return asText("Saved: " + file + " (approx. " + seconds + " seconds)" + billingLine(charged));
    }
    default:
      return asError("unknown tool: " + name);
  }
}

const send = (msg) => process.stdout.write(JSON.stringify(msg) + "\n");

async function handle(msg) {
  const { id, method, params } = msg;
  const isNotification = id === undefined || id === null;

  if (method === "initialize") {
    const asked = params?.protocolVersion;
    send({
      jsonrpc: "2.0",
      id,
      result: {
        protocolVersion: SUPPORTED.includes(asked) ? asked : SUPPORTED[0],
        capabilities: { tools: { listChanged: false } },
        serverInfo: SERVER,
      },
    });
    return;
  }
  if (method === "notifications/initialized" || method === "notifications/cancelled") return;
  if (method === "ping") {
    send({ jsonrpc: "2.0", id, result: {} });
    return;
  }
  if (method === "tools/list") {
    send({ jsonrpc: "2.0", id, result: { tools } });
    return;
  }
  if (method === "tools/call") {
    try {
      const result = await callTool(params?.name, params?.arguments || {});
      send({ jsonrpc: "2.0", id, result });
    } catch (e) {
      send({
        jsonrpc: "2.0",
        id,
        result: asError(String(e?.message || e)),
      });
    }
    return;
  }
  if (isNotification) return;
  send({ jsonrpc: "2.0", id, error: { code: -32601, message: "method not found: " + method } });
}

const rl = createInterface({ input: process.stdin, terminal: false });
rl.on("line", (line) => {
  const s = line.trim();
  if (!s) return;
  let msg;
  try {
    msg = JSON.parse(s);
  } catch (e) {
    send({ jsonrpc: "2.0", id: null, error: { code: -32700, message: "parse error" } });
    return;
  }
  handle(msg).catch((e) => {
    process.stderr.write("ssu-bridge error: " + (e?.stack || e) + "\n");
  });
});
process.stderr.write("ssu-bridge ready\n");
