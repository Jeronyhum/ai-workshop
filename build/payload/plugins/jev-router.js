// jev-router — framework-level dynamic routing for the SSU workshop harness.
//
// TypeSafe Jev (served by the SSU gateway as `jev-latest` on POST /decisions/)
// is a System One judgment model: it does not generate text, it returns typed
// verdicts. This plugin puts that judgment in the harness itself: every Task
// (subagent) call is judged BEFORE it runs — difficulty, cost efficiency and
// prompt-cache reuse considered — and the tier may be re-assigned. Decisions
// are appended to routing-log.jsonl next to the config for later review.
//
// Hard rule: FAIL OPEN. Any error (no key, network, odd response) leaves the
// original call untouched. A classroom install must never break because a
// routing nicety failed. Advisor calls are deliberate (stuck-point packages)
// and are never downgraded.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const GATEWAY = (process.env.SSU_GATEWAY_BASE || "https://factchat-cloud.mindlogic.ai/v1/gateway").replace(/\/$/, "");
const TIERS = { flash: "w-flash", haiku: "w-haiku", luna: "w-luna", gemma: "w-gemma", advisor: "advisor" };
const OURS = new Set(Object.values(TIERS));

function configRoot() {
  // This file lives in <config>/plugins/, so the config root is one level up.
  return path.dirname(path.dirname(fileURLToPath(import.meta.url)));
}

function apiKey(root) {
  if (process.env.SSU_API_KEY) return process.env.SSU_API_KEY.trim();
  try {
    const m = fs.readFileSync(path.join(root, ".env"), "utf8").match(/SSU_API_KEY\s*=\s*(.+)/);
    if (m) return m[1].trim().replace(/^["']|["']$/g, "");
  } catch {}
  return "";
}

function tierToken(v) {
  if (typeof v === "string") {
    const t = v.toLowerCase().trim();
    return TIERS[t] ? TIERS[t] : null;
  }
  if (v && typeof v === "object") {
    // Jev choice answers look like {type: "choice", choice: "flash", ...} —
    // prefer the explicit verdict fields before scanning other values.
    for (const k of ["choice", "answer", "value", "result"]) {
      if (k in v) {
        const r = tierToken(v[k]);
        if (r) return r;
      }
    }
    for (const val of Object.values(v)) {
      const r = tierToken(val);
      if (r) return r;
    }
  }
  return null;
}

function findTier(data) {
  // Jev answers are typed JSON, but the exact envelope is the gateway's; walk
  // the structure for a `tier` field instead of assuming one shape.
  const seen = new Set();
  const walk = (v) => {
    if (!v || typeof v !== "object" || seen.has(v)) return null;
    seen.add(v);
    for (const [k, val] of Object.entries(v)) {
      if (k.toLowerCase() === "tier") {
        const r = tierToken(val);
        if (r) return r;
      }
      const r = walk(val);
      if (r) return r;
    }
    return null;
  };
  return walk(data);
}

export default async () => {
  return {
    "tool.execute.before": async (input, output) => {
      try {
        if (input?.tool !== "task") return;
        const args = output?.args;
        if (!args || typeof args !== "object") return;
        const current = typeof args.subagent_type === "string" ? args.subagent_type : "";
        if (current === "advisor") return; // deliberate escalation — never touch
        if (current && !OURS.has(current)) return; // built-in/other agents: not ours to route

        const root = configRoot();
        const key = apiKey(root);
        if (!key) return;

        const taskText = [args.description || "", args.prompt || ""].join("\n").slice(0, 2000);
        if (!taskText.trim()) return;

        const res = await fetch(GATEWAY + "/decisions/", {
          method: "POST",
          headers: { Authorization: "Bearer " + key, "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "jev-latest",
            state:
              "Subagent task for a vibe-coding workshop harness.\n" +
              "Currently assigned tier: " + (current || "(none)") + "\n\n" +
              taskText,
            questions: {
              tier: {
                // Gateway-verified shape (2026-11-04, jev-1.13.0): type must be
                // "choice" and criteria an option -> description object.
                type: "choice",
                instructions:
                  "Pick the cheapest agent tier that can reliably complete this subtask. " +
                  "Consider difficulty, cost efficiency, and prompt-cache reuse: if the task " +
                  "re-reads a large shared context a previous step already processed, keeping " +
                  "the current tier preserves cache reads.",
                criteria: {
                  flash: "Mechanical, bulk or repetitive work. Cheapest and fastest.",
                  gemma: "Long reading, large-context scanning, first-pass organization.",
                  haiku: "Light judgment: summaries, classification, small edits.",
                  luna: "General mid-tier implementation and analysis.",
                  advisor: "ONLY a stuck local problem that has already failed twice.",
                },
              },
            },
          }),
          signal: AbortSignal.timeout(6000),
        });
        if (!res.ok) return;
        const verdict = findTier(await res.json());
        if (!verdict) return;

        const entry = {
          at: new Date().toISOString(),
          from: current || null,
          to: verdict,
          task: (args.description || "").slice(0, 120),
        };
        try {
          fs.appendFileSync(path.join(root, "routing-log.jsonl"), JSON.stringify(entry) + "\n", "utf8");
        } catch {}
        if (verdict !== current) output.args.subagent_type = verdict;
      } catch {
        // fail open — routing is an optimization, never a gate
      }
    },
  };
}
