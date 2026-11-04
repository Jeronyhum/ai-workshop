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

function trim(s, n) {
  const t = String(s ?? "").replace(/\s+/g, " ").trim();
  return t.length > n ? t.slice(0, n) + "..." : t;
}

function billingLine(charged) {
  if (!charged) return "";
  return "\n\n차감 크레딧: " + charged;
}

const tools = [
  {
    name: "exa_search",
    description:
      "Exa 웹 검색. 결과 제목·URL·관련 구절을 돌려준다. 유료(검색 1건 약 $0.007 상당의 크레딧). 최신 정보나 웹 근거가 필요할 때 사용.",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "검색어" },
        num_results: { type: "integer", minimum: 1, maximum: 100, description: "결과 수 (기본 10, 10 초과분은 추가 과금)" },
        type: {
          type: "string",
          enum: ["auto", "fast", "instant", "deep-lite", "deep", "deep-reasoning"],
          description: "검색 종류. 기본 auto. 깊은 검색일수록 비싸다",
        },
        highlights: { type: "boolean", description: "관련 구절 포함 (기본 true)" },
        summary: { type: "boolean", description: "페이지 요약 포함 (페이지당 추가 과금)" },
      },
      required: ["query"],
      additionalProperties: false,
    },
  },
  {
    name: "exa_contents",
    description: "이미 아는 URL의 본문·관련 구절·요약을 가져온다. URL 최대 100개. 유료(내용 종류별 페이지당 과금).",
    inputSchema: {
      type: "object",
      properties: {
        urls: { type: "array", items: { type: "string" }, minItems: 1, maxItems: 100 },
        text: { type: "boolean", description: "본문 포함 (기본 true)" },
        highlights: { type: "boolean" },
        summary_query: { type: "string", description: "요약 기준 질문. 주면 요약 포함" },
        max_characters: { type: "integer", description: "본문 최대 글자 수 (기본 4000)" },
      },
      required: ["urls"],
      additionalProperties: false,
    },
  },
  {
    name: "exa_answer",
    description: "검색 결과를 근거로 출처가 달린 답변을 만든다. 유료(답변 1건). 인용이 필요한 질문에 사용.",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "질문" },
        system_prompt: { type: "string", description: "답변 방식 지시" },
      },
      required: ["query"],
      additionalProperties: false,
    },
  },
  {
    name: "decide",
    description:
      "판정 모델로 분류·채점한다. 입력 토큰만 과금. jev 모드는 questions가 객체 {이름:{type,instructions,criteria}}, luna 모드는 배열 [{name,type,instructions,choices|levels}].",
    inputSchema: {
      type: "object",
      properties: {
        state: { type: "string", description: "판정할 내용 (문장 또는 JSON 문자열)" },
        questions: { description: "jev: 객체 / luna: 배열. JSON 문자열도 허용" },
        model: { type: "string", enum: ["jev", "luna"], description: "기본 jev" },
      },
      required: ["state", "questions"],
      additionalProperties: false,
    },
  },
  {
    name: "usage",
    description: "이 키의 크레딧 사용 내역. 무료. by=model|key|day, scope=key|member, 최대 92일.",
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
    description: "남은 크레딧 잔액과 월 할당·구매분 내역. 무료.",
    inputSchema: { type: "object", properties: {}, additionalProperties: false },
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
        if (r.summary) parts.push("    요약: " + trim(r.summary, 400));
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
        if (r.summary) parts.push("요약: " + trim(r.summary, 400));
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
          (cites.length ? "\n\n출처:\n" + cites.map((c) => "- " + c).join("\n") : "") +
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
