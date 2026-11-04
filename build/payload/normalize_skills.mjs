// Normalizes third-party SKILL.md files for opencode.
// opencode documents only `name` and `description` in skill frontmatter, so every other key is
// dropped (including multi-line block scalars). Everything after the frontmatter is copied verbatim.
//
// Usage: node normalize_skills.mjs <srcSkillsDir> <destSkillRoot> [--dry]
import fs from "node:fs";
import path from "node:path";

const src = process.argv[2];
const dest = process.argv[3];
const dry = process.argv.includes("--dry");

if (!src || !dest) {
  console.error("usage: node normalize_skills.mjs <srcSkillsDir> <destSkillRoot> [--dry]");
  process.exit(2);
}
if (!fs.existsSync(src)) {
  console.error("source not found: " + src);
  process.exit(3);
}

const KEEP = new Set(["name", "description"]);

function splitFrontmatter(text) {
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!m) return { fm: "", body: text, has: false };
  return { fm: m[1], body: text.slice(m[0].length), has: true };
}

function filterFrontmatter(fm) {
  const lines = fm.split(/\r?\n/);
  const out = [];
  let current = null;
  let keepCurrent = false;
  for (const line of lines) {
    const key = line.match(/^([A-Za-z0-9_-]+)\s*:/);
    if (key) {
      current = key[1];
      keepCurrent = KEEP.has(current);
      if (keepCurrent) out.push(line);
      continue;
    }
    if (/^\s+\S/.test(line) || line.trim() === "") {
      if (keepCurrent && current) out.push(line);
      continue;
    }
    current = null;
    keepCurrent = false;
  }
  return out.join("\n").trim();
}

function copyDir(from, to) {
  fs.mkdirSync(to, { recursive: true });
  for (const entry of fs.readdirSync(from, { withFileTypes: true })) {
    const s = path.join(from, entry.name);
    const d = path.join(to, entry.name);
    if (entry.isDirectory()) copyDir(s, d);
    else if (entry.isFile()) fs.copyFileSync(s, d);
  }
}

const results = [];
const seen = new Map();
// opencode only loads skills whose name matches this pattern (max 64 chars);
// anything else is dropped silently by opencode, so it must be dropped loudly here.
const NAME_OK = /^[a-z0-9]+(-[a-z0-9]+)*$/;
for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
  if (!entry.isDirectory()) continue;
  const skillFile = path.join(src, entry.name, "SKILL.md");
  if (!fs.existsSync(skillFile)) continue;

  const raw = fs.readFileSync(skillFile, "utf8");
  const { fm, body, has } = splitFrontmatter(raw);
  if (!has) {
    results.push({ name: entry.name, skipped: "no frontmatter" });
    continue;
  }
  const clean = filterFrontmatter(fm);
  const withName = /^name\s*:/m.test(clean) ? clean : "name: " + entry.name + "\n" + clean;
  const nameMatch = withName.match(/^name\s*:\s*(.+)$/m);
  const name = (nameMatch ? nameMatch[1].trim().replace(/^["']|["']$/g, "") : entry.name) || entry.name;

  if (!NAME_OK.test(name) || name.length > 64) {
    results.push({ name: entry.name, skipped: `invalid skill name "${name}" (opencode would not load it)` });
    continue;
  }
  if (seen.has(name)) {
    results.push({ name: entry.name, skipped: `duplicate skill name "${name}" (already from ${seen.get(name)})` });
    continue;
  }
  seen.set(name, entry.name);

  const outDir = path.join(dest, name);
  const text = "---\n" + withName + "\n---\n\n" + body.replace(/^\n+/, "");
  if (!dry) {
    fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(path.join(outDir, "SKILL.md"), text, "utf8");
    for (const e of fs.readdirSync(path.join(src, entry.name), { withFileTypes: true })) {
      if (e.name === "SKILL.md") continue;
      const s = path.join(src, entry.name, e.name);
      const d = path.join(outDir, e.name);
      if (e.isDirectory()) copyDir(s, d);
      else fs.copyFileSync(s, d);
    }
  }
  results.push({ name, dropped: fm !== clean });
}

const ok = results.filter((r) => !r.skipped).length;
const dropped = results.filter((r) => r.dropped).length;
const skipped = results.filter((r) => r.skipped);
for (const r of skipped) console.log(`  skip ${r.name}: ${r.skipped}`);
console.log(`skills: ${ok} installed, ${dropped} normalized${dry ? " (dry run)" : ""}`);
// A partial install must be visible to the caller: installers warn on this exit code
// instead of printing an unconditional [OK] for skills that never landed.
if (skipped.length) process.exitCode = 1;
