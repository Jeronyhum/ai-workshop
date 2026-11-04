// Single source of truth for the HUD: credits + context window, as one JSON line.
// Usage: node status.mjs [--no-network]
// Read-only with respect to opencode. Only writes a small credits cache in TEMP.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const HOME = os.homedir();
const ROOT = process.env.SSU_CONFIG_DIR || path.join(HOME, ".config", "opencode");
const DB = process.env.SSU_DB || path.join(HOME, ".local", "share", "opencode", "opencode.db");
const ENV_FILE = process.env.SSU_ENV_FILE || path.join(ROOT, ".env");
const CACHE = path.join(os.tmpdir(), "ssu-hud-credits.json");
const CREDIT_TTL_MS = 60_000;
const NO_NET = process.argv.includes("--no-network");

function apiKey() {
  if (process.env.SSU_API_KEY) return process.env.SSU_API_KEY.trim();
  // First match wins: config dir, then the project you launched from.
  for (const file of [ENV_FILE, path.join(process.cwd(), ".env")]) {
    try {
      const m = fs.readFileSync(file, "utf8").match(/SSU_API_KEY\s*=\s*(.+)/);
      if (m) return m[1].trim().replace(/^["']|["']$/g, "");
    } catch {}
  }
  return "";
}

async function credits(key) {
  if (!key) return { ok: false, error: "no key" };
  if (NO_NET) return { ok: false, error: "offline" };
  try {
    const c = JSON.parse(fs.readFileSync(CACHE, "utf8"));
    if (Date.now() - c.at < CREDIT_TTL_MS) return c.value;
  } catch {}
  try {
    const ctl = new AbortController();
    const t = setTimeout(() => ctl.abort(), 8000);
    const res = await fetch("https://factchat-cloud.mindlogic.ai/v1/gateway/credits/", {
      headers: { Authorization: "Bearer " + key },
      signal: ctl.signal,
    });
    clearTimeout(t);
    if (!res.ok) throw new Error("HTTP " + res.status);
    const d = await res.json();
    const value = {
      ok: true,
      remaining: Number(d?.total?.remaining ?? 0),
      quota: Number(d?.total?.quota ?? 0),
    };
    value.pct = value.quota > 0 ? Math.round((value.remaining / value.quota) * 1000) / 10 : 0;
    try {
      fs.writeFileSync(CACHE, JSON.stringify({ at: Date.now(), value }), "utf8");
    } catch {}
    return value;
  } catch (e) {
    return { ok: false, error: String(e?.message || e) };
  }
}

function limits() {
  const map = {};
  try {
    const cfg = JSON.parse(fs.readFileSync(path.join(ROOT, "opencode.jsonc"), "utf8"));
    for (const prov of Object.values(cfg.providers || {})) {
      for (const [id, m] of Object.entries(prov.models || {})) {
        const ctx = m?.limit?.context;
        if (typeof ctx === "number") map[id] = ctx;
      }
    }
  } catch {}
  return map;
}

let DatabaseSync = null;
try {
  ({ DatabaseSync } = await import("node:sqlite"));
} catch {}

function contextInfo() {
  if (!fs.existsSync(DB)) return { ok: false, error: "opencode.db not found" };
  if (!DatabaseSync) return { ok: false, error: "node:sqlite unavailable (need Node 22.5+)" };
  let db;
  try {
    db = new DatabaseSync(DB, { readOnly: true });
  } catch {
    try {
      db = new DatabaseSync(DB);
    } catch (e) {
      return { ok: false, error: "db open failed: " + String(e?.message || e) };
    }
  }
  const session = db
    .prepare(
      "select id, title, model, cost, time_updated from session where time_archived is null order by time_updated desc limit 1",
    )
    .get();
  if (!session) return { ok: false, error: "no session yet" };

  let model = {};
  try {
    model = JSON.parse(session.model || "{}");
  } catch {}

  const msg = db
    .prepare(
      "select data from message where session_id = ? and json_extract(data,'$.tokens.input') > 0 order by time_updated desc limit 1",
    )
    .get(session.id);

  let input = 0;
  let cached = 0;
  if (msg) {
    try {
      const d = JSON.parse(msg.data);
      input = Number(d?.tokens?.input || 0);
      cached = Number(d?.tokens?.cache?.read || 0);
    } catch {}
  }
  const used = input + cached;
  const limit = limits()[model.id] || 0;
  return {
    ok: true,
    session: session.id,
    title: session.title,
    model: model.id || "unknown",
    provider: model.providerID || "",
    variant: model.variant || "",
    context: used,
    cached,
    limit,
    pct: limit > 0 ? Math.round((used / limit) * 1000) / 10 : 0,
    cost: session.cost || 0,
    updated: session.time_updated,
  };
}

const key = apiKey();
const [cred, ctx] = await Promise.all([credits(key), Promise.resolve().then(contextInfo)]);
console.log(JSON.stringify({ ok: true, credits: cred, context: ctx, at: Date.now() }));
