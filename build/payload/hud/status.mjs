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
    for (const prov of Object.values(cfg.provider || cfg.providers || {})) {
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
  } catch (e) {
    // Read-only is a hard rule here (see header): never fall back to a writable open,
    // and never let a DB problem kill the whole status line — credits must still print.
    return { ok: false, error: "db open failed: " + String(e?.message || e) };
  }
  let session;
  let msg;
  try {
    session = db
      .prepare(
        "select id, title, model, cost, time_updated from session where time_archived is null order by time_updated desc limit 1",
      )
      .get();
    if (!session) return { ok: false, error: "no session yet" };
    msg = db
      .prepare(
        "select data from message where session_id = ? and json_extract(data,'$.tokens.input') > 0 order by time_updated desc limit 1",
      )
      .get(session.id);
  } catch (e) {
    return { ok: false, error: "db query failed: " + String(e?.message || e) };
  }

  let model = {};
  try {
    model = JSON.parse(session.model || "{}");
  } catch {}

  let input = 0;
  let cached = 0;
  let used = 0;
  if (msg) {
    try {
      const d = JSON.parse(msg.data);
      const t = d?.tokens || {};
      input = Number(t.input || 0);
      cached = Number(t.cache?.read || 0);
      // The window holds the whole last step, not just its prompt: count output,
      // reasoning and cache writes too, or the bar always reads low.
      used =
        Number(t.total || 0) ||
        input +
          Number(t.output || 0) +
          Number(t.reasoning || 0) +
          cached +
          Number(t.cache?.write || 0);
    } catch {}
  }
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

// All-time token usage + prompt-cache hit ratio, aggregated from the local
// session DB. cacheRatio = cache.read / (input + cache.read): input in
// opencode's accounting is the uncached part of the prompt, so the ratio is
// the share of prompt tokens served from cache.
function usageInfo() {
  if (!fs.existsSync(DB)) return { ok: false, error: "opencode.db not found" };
  if (!DatabaseSync) return { ok: false, error: "node:sqlite unavailable (need Node 22.5+)" };
  let db;
  try {
    db = new DatabaseSync(DB, { readOnly: true });
  } catch (e) {
    return { ok: false, error: "db open failed: " + String(e?.message || e) };
  }
  try {
    const m = db
      .prepare(
        `select count(*) as steps,
           coalesce(sum(json_extract(data,'$.tokens.input')),0) as inp,
           coalesce(sum(json_extract(data,'$.tokens.output')),0) as outp,
           coalesce(sum(json_extract(data,'$.tokens.reasoning')),0) as rea,
           coalesce(sum(json_extract(data,'$.tokens.cache.read')),0) as cr,
           coalesce(sum(json_extract(data,'$.tokens.cache.write')),0) as cw
         from message
         where json_extract(data,'$.tokens.input') is not null`,
      )
      .get();
    const s = db.prepare("select coalesce(sum(cost),0) as cost, count(*) as sessions from session").get();
    const prompt = m.inp + m.cr;
    return {
      ok: true,
      steps: m.steps,
      sessions: s.sessions,
      input: m.inp,
      output: m.outp,
      reasoning: m.rea,
      cacheRead: m.cr,
      cacheWrite: m.cw,
      total: m.inp + m.outp + m.rea + m.cr + m.cw,
      cacheRatio: prompt > 0 ? Math.round((m.cr / prompt) * 1000) / 10 : 0,
      cost: s.cost,
    };
  } catch (e) {
    return { ok: false, error: "db query failed: " + String(e?.message || e) };
  }
}

const key = apiKey();
const [cred, ctx] = await Promise.all([credits(key), Promise.resolve().then(contextInfo)]);
const usage = await Promise.resolve().then(usageInfo).catch((e) => ({ ok: false, error: String(e?.message || e) }));
console.log(JSON.stringify({ ok: true, credits: cred, context: ctx, usage, at: Date.now() }));
