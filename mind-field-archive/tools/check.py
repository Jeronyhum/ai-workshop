"""Check archive/js/data.js against its sources. Run from archive/:  python3 tools/check.py

1. Links: every URL is in urls-ok.txt or x-from-drive.txt; "X 원본" only for x-from-drive.txt.
2. Sources: every cited file exists and has the cited line.
3. Numbers: every number shown on a piece appears within ±4 lines of the line it cites.
4. Gates: a status that cites 감독관_감사.md agrees with the audit section of that line
   (B-0 :101-111 정정, B-1 :113-136 확정, B-2 :138-167 단서, B-3 :169-180 제외).
5. Media: every media file and poster exists.
v6: the research packages (refs/) and the installer repo are private fixtures. On a clean checkout without them, every
check that needs them reports NOT_RUN instead of failing; everything that can run still runs.
Exits 1 if any check fails."""
import json, pathlib, re, subprocess, sys

ARC = pathlib.Path(__file__).resolve().parent.parent
REFS = ARC.parent / "refs"
data = json.loads(subprocess.run(["node", "-e", "global.window={};global.document={baseURI:'file:///'};for(const f of process.argv.slice(1))require(f);const A=window.AR;console.log(JSON.stringify({...A,assetsReadyList:A.assetsReady}))",
                                  str(ARC / "js/data.js"), str(ARC / "js/assets.js"), str(ARC / "js/anchors.js"), str(ARC / "js/gallery-data.js"), str(ARC / "js/glossary.js"), str(ARC / "js/exit-data.js")], capture_output=True, text=True, check=True).stdout)

ok = {l.strip() for l in (ARC / "urls-ok.txt").read_text().splitlines() if l.strip()}
drive = {l.strip() for l in (ARC / "x-from-drive.txt").read_text().splitlines() if l.strip()}
fails, notes = [], []
notrun = {}
PRIVATE = (REFS / "drive").exists()
import os
def aiw_root():
    for c in [os.environ.get("AIW_ROOT"), ARC.parent, ARC.parent.parent / "aiw-push"]:
        if c and (pathlib.Path(c) / "build/payload/AGENTS.md").exists(): return pathlib.Path(c)
    return None
AIW = aiw_root()

def path_of(f):
    if f.startswith("ai-workshop/"): return (AIW / f[len("ai-workshop/"):]) if AIW else pathlib.Path("/nonexistent") / f
    if f.startswith("refs/"): return ARC.parent / f
    if f.startswith("archive/"): return ARC / f[len("archive/"):]  # the archive's own files, whatever its folder is called
    return REFS / "drive" / f

cache = {}
def lines(f):
    if f not in cache:
        p = path_of(f)
        cache[f] = p.read_text(encoding="utf-8").splitlines() if p.exists() and p.suffix in (".md", ".txt", ".csv") else None
    return cache[f]

AUDIT = "package_1105/감독관_감사.md"
def section(line):
    for lo, hi, st in ((101, 111, "corrected"), (113, 136, "verified"), (138, 167, "conditional"), (169, 180, "excluded")):
        if lo <= line <= hi: return st
    return None

NUM = re.compile(r"\d[\d,]*(?:\.\d+)?")
def nums(t):
    out = []
    for m in NUM.findall(str(t)):
        v = m.rstrip(",")
        if len(v.replace(",", "").replace(".", "")) < 2 and "." not in v: continue  # single digits are ordinals and counts in prose
        out.append(v)
    return out

def check_src(s, where):
    f = s.get("f")
    if not f: fails.append(f"{where}: source without file"); return None
    p = path_of(f)
    if not p.exists():
        if f.startswith("ai-workshop/") and not AIW: notrun["installer-repo quotes (exit zone, glossary)"] = "the installer repo (build/, specs/) is not next to this archive"; return None
        if not f.startswith(("archive/", "ai-workshop/")) and not PRIVATE: notrun["sources, numbers, audit gates, explainer and glossary quotes"] = "the private research packages (refs/) are not in this checkout"; return None
        fails.append(f"{where}: missing file {f}"); return None
    L = lines(f)
    if s.get("l") and L is not None and s["l"] > len(L): fails.append(f"{where}: {f} has {len(L)} lines, cites :{s['l']}")
    return L

def check_nums(text, s, where, span=4):
    L = check_src(s, where)
    if not L or not s.get("l"): return
    lo, hi = max(0, s["l"] - 1 - span), min(len(L), s["l"] + span)
    window = "\n".join(L[lo:hi])
    for n in nums(text):
        if n not in window and n.replace(",", "") not in window.replace(",", ""):
            fails.append(f"{where}: number {n} not within ±{span} lines of {s['f']}:{s['l']}")

def check_gate(st, s, where):
    if s.get("f") == AUDIT and s.get("l"):
        want = section(s["l"])
        if want and st != want and not (st == "corrected" and want == "verified"):
            fails.append(f"{where}: status {st} but {AUDIT}:{s['l']} is in the {want} section")

status = set(data["status"])
ids = {p["id"] for p in data["pieces"]}
for p in data["pieces"]:
    pid = p["id"]
    if p["st"] not in status: fails.append(f"{pid}: unknown status {p['st']}")
    if not p.get("src"): fails.append(f"{pid}: no source")
    for s in p.get("src", []): check_src(s, pid)
    for i, r in enumerate(p.get("rows", [])):
        if r["st"] not in status: fails.append(f"{pid} row {i}: unknown status")
        check_nums(r["t"], r["s"], f"{pid} row {i}")
        check_gate(r["st"], r["s"], f"{pid} row {i}")
    for side in ("claim", "counter"):
        d = (p.get("pair") or {}).get(side)
        if p["kind"] == "pair" and not d: fails.append(f"{pid}: pair missing {side}")
        if d: check_nums(" ".join([d["v"], d["what"], d["vs"]]), d["s"], f"{pid} {side}", span=6)
    for v in p.get("voices", []): check_nums(v["t"], v["s"], f"{pid} voice")
    if p.get("chart"):
        c = p["chart"]
        for r in c["rows"]:
            check_nums(r["v"] if isinstance(r["v"], str) else f"{r['v']:,}" if r["v"] >= 1000 else str(r["v"]), c["s"], f"{pid} chart {r['k']}", span=10)
    if p.get("fig"):
        src = p["src"][0]
        texts = [str(p["fig"]["v"])] + [r["t"] for r in p.get("rows", [])] + [json.dumps(p.get("pair", ""), ensure_ascii=False)]
        allrows = " ".join(texts[1:]) + " " + " ".join(f"{r.get('v','')}" for r in (p.get("chart") or {}).get("rows", []))
        if lines(src["f"]) is None and not path_of(src["f"]).exists(): check_src(src, pid); continue
        for n in nums(p["fig"]["v"]):
            if n not in allrows and n not in "\n".join(lines(src["f"]) or []):
                fails.append(f"{pid}: figure number {n} not found in its rows or its source file")
    for m in p.get("media", []):
        for k in ("src", "poster"):
            if m.get(k) and not (ARC / m[k]).exists(): fails.append(f"{pid}: missing media {m[k]}")
        if m.get("by"):
            u = m["by"]["url"]
            if u not in drive and u not in ok: fails.append(f"{pid}: media credit URL not allowed {u}")
            if m["by"]["kind"] == "X 원본" and u not in drive: fails.append(f"{pid}: 'X 원본' must come from x-from-drive.txt: {u}")
    for l in p.get("links", []):
        u = l["url"]
        if u not in ok and u not in drive: fails.append(f"{pid}: link not in allowed lists: {u}")
        if l["kind"] == "X 원본" and u not in drive: fails.append(f"{pid}: 'X 원본' must come from x-from-drive.txt: {u}")
        if l["kind"] == "YouTube" and "youtu" not in u: fails.append(f"{pid}: YouTube label on non-YouTube URL {u}")
        if re.search(r"localhost|127\.0\.0\.1|w3\.org", u): fails.append(f"{pid}: junk URL {u}")

for a, b, why in data["threads"]:
    if a not in ids or b not in ids: fails.append(f"thread {a}–{b}: unknown piece")
    if not why: fails.append(f"thread {a}–{b}: no reason")
deg = {i: 0 for i in ids}
for a, b, _ in data["threads"]: deg[a] += 1; deg[b] += 1
for i, d in deg.items():
    if d == 0: fails.append(f"{i}: no threads (a piece with no neighbours cannot be wandered to)")
slots = data.get("assetSlots", {})
for a in data["assets"]:
    if a["slot"] not in slots: fails.append(f"floor texture uses unknown slot {a['slot']}")
    if a["cap"] != "AI로 만든 배경 그림 · 근거 자료 아님": fails.append(f"asset {a['slot']}: wrong caption (generated images must say they are not evidence)")
for k, sl in slots.items():
    if sl.get("fallback") and not (ARC / sl["fallback"]).exists(): fails.append(f"slot {k}: missing fallback {sl['fallback']}")
    if k in data.get("assetsReadyList", []) and not (ARC / sl["file"]).exists(): fails.append(f"slot {k}: marked ready but {sl['file']} is missing")
    if not re.match(r"assets/(dots|muse)2?-[a-z-]+\.jpg$", sl["file"]): fails.append(f"slot {k}: file name must be assets/dots-*.jpg, muse-*.jpg, dots2-*.jpg or muse2-*.jpg")
    if sl.get("fallback") and not re.match(r"assets/gen2?-[a-z-]+\.jpg$", sl["fallback"]): fails.append(f"slot {k}: a fallback must be a generated image (assets/gen-*.jpg or gen2-*.jpg)")

# v4: every delivered second-batch image has been measured (js/anchors.js), and measured as it is now
import hashlib
anch = data.get("assetAnchors") or {}
for k in data.get("assetsReadyList", []):
    if not re.match(r"(muse2|dots2)-", k): continue
    m = anch.get(k)
    if not m: fails.append(f"slot {k}: ready but not measured; run python3 tools/anchors.py"); continue
    f = ARC / slots[k]["file"]
    if f.exists() and hashlib.sha256(f.read_bytes()).hexdigest() != m.get("sha256"): fails.append(f"slot {k}: the file changed since it was measured; run python3 tools/anchors.py")

# v4 explainers: every label, line, quote and term is copied from the line it cites (markdown marks removed;
# " · " joins fragments, each of which must be there). Timeline cells must be on their own table line.
def norm(t): return re.sub(r"\*+|`", "", t)
def check_text(t, s, where, span=4):
    L = check_src(s, where)
    if L is None or not s.get("l"): return
    window = norm("\n".join(L[max(0, s["l"] - 1 - span):min(len(L), s["l"] + span)]))
    for frag in (x.strip() for x in str(t).split(" · ")):
        if frag and frag not in window: fails.append(f"{where}: \"{frag[:50]}\" is not within ±{span} lines of {s['f']}:{s['l']}")
def walk(o, s, where):
    if isinstance(o, dict):
        s = o.get("s", s)
        for k, v in o.items():
            if k in ("s", "k", "scene", "slot", "floor", "over", "timeline"): continue
            if isinstance(v, str): check_text(v, s, f"{where}.{k}")
            elif isinstance(v, list) and all(isinstance(x, str) for x in v):
                for x in v: check_text(x, s, f"{where}.{k}")
            else: walk(v, s, f"{where}.{k}")
    elif isinstance(o, list):
        for i, x in enumerate(o): walk(x, s, f"{where}[{i}]")
for pid, ex in (data.get("explain") or {}).items():
    if pid not in ids: fails.append(f"explain {pid}: no such piece")
    if ex.get("slot") and ex["slot"] not in slots: fails.append(f"explain {pid}: unknown asset slot {ex['slot']}")
    if not ex.get("steps"): fails.append(f"explain {pid}: no steps")
    if not (1 <= ex.get("floor", 0) <= len(ex.get("steps", []))): fails.append(f"explain {pid}: floor step out of range")
    walk(ex, None, f"explain {pid}")
    tl = ex.get("timeline")
    if tl:
        for row in tl["rows"]:
            for cell in row[:3]: check_text(cell, {"f": tl["s"]["f"], "l": row[3]}, f"explain {pid} timeline {row[0]}", span=0)

# gallery: links built from filenames / taken from cases.json, captions verbatim, every local path present
gal = data.get("gallery")
if gal:
    HAVE = (REFS / "x-frontier-cases/cases.json").exists() and (REFS / "old-claude-design-brief.md").exists() and (REFS / "drive/usecases").exists() and (REFS / "web-office-cases/cases.json").exists()
    if not HAVE: notrun["gallery vs its private case files"] = "refs/x-frontier-cases, refs/web-office-cases, refs/drive/usecases are not in this checkout"
    cases = {c["n"]: c for c in json.loads((REFS / "x-frontier-cases/cases.json").read_text(encoding="utf-8"))} if HAVE else {}
    brief_lines = (REFS / "old-claude-design-brief.md").read_text(encoding="utf-8").splitlines() if HAVE else []
    drive_files = {f.name for f in (REFS / "drive/usecases").iterdir()} if HAVE else set()
    seen_cases = set()
    for it in gal["items"]:
        k = it["key"]
        if not HAVE: pass
        elif it["origin"] == "drive":
            _, user, pid = k.split("-", 2)
            if it["url"] != f"https://x.com/{user}/status/{pid}" or not any(f.startswith(f"{user}_{pid}_") for f in drive_files): fails.append(f"gallery {k}: URL not built from a Drive filename")
            if it["linkKind"] != "X 원본": fails.append(f"gallery {k}: Drive items are labelled X 원본")
            ln = (it.get("textSrc") or {}).get("l")
            if not ln or it["text"] not in brief_lines[ln - 1]: fails.append(f"gallery {k}: caption not found at refs/old-claude-design-brief.md:{ln}")
        elif it["origin"] == "scout":
            c = cases.get(it["n"]); seen_cases.add(it["n"])
            if not c or it["url"] != c["post_url"]: fails.append(f"gallery {k}: URL differs from cases.json")
            if c and (it["text"] != c["text"] or it["group"] != c["group"] or it["claim"] != c["model_claimed"]): fails.append(f"gallery {k}: text, group or claim differs from cases.json")
        if not it.get("group"): fails.append(f"gallery {k}: no model/lab group")
        if it.get("thumb") and not (ARC / it["thumb"]).exists(): fails.append(f"gallery {k}: missing thumbnail {it['thumb']}")
        for m in it["media"]:
            for key in ("src", "poster"):
                v = m.get(key)
                if v and not (ARC / v).exists(): fails.append(f"gallery {k}: missing {v}")
                if v and not v.startswith("media/usecases/"): fails.append(f"gallery {k}: media outside media/usecases/: {v}")
            if m["type"] == "remote" and "src" in m: fails.append(f"gallery {k}: remote video must not be hotlinked")
            if m["type"] == "video" and not m.get("poster"): fails.append(f"gallery {k}: video without poster")
    cur = json.loads((ARC / "tools/curation.json").read_text(encoding="utf-8"))
    keys = {it["key"] for it in gal["items"]}
    if keys != set(cur["keep"]): fails.append(f"gallery: shown posts differ from tools/curation.json keep list: {sorted(keys ^ set(cur['keep']))}")
    for it in gal["items"]:
        if it.get("category") not in ("showcase", "office", "blender"): fails.append(f"gallery {it['key']}: no showcase/office/blender category")
        if not it.get("reason"): fails.append(f"gallery {it['key']}: kept without a reason")
        if HAVE and it["origin"] == "scout" and it.get("category") != cases[it["n"]].get("category"): fails.append(f"gallery {it['key']}: category differs from cases.json")
    cu = [k for k, v in cur["keep"].items() if v.get("computer_use")]
    if len(cu) > 1: fails.append(f"gallery: more than one computer-use demo kept: {cu}")
    if len(cur["computer_use_cases"]) != 6: fails.append("gallery: the six computer-use office cases are not all identified")
    web = {c["rank"]: c for c in json.loads((REFS / "web-office-cases/cases.json").read_text(encoding="utf-8"))} if HAVE else {}
    for it in gal["items"]:
        if it["origin"] != "web" or not HAVE: continue
        c = web.get(it["rank"])
        if not c or it["url"] != c["post_url"] or it["verification"] != c["verification"]: fails.append(f"gallery {it['key']}: URL or verification differs from web-office-cases")
        if it["verified"] != c["verification"].startswith("verified"): fails.append(f"gallery {it['key']}: verified flag disagrees with the source")
        if it.get("youtube") and not re.fullmatch(r"[\w-]{11}", it["youtube"]): fails.append(f"gallery {it['key']}: bad YouTube id")
        if it.get("youtube") and it["youtube"] not in (c.get("embed_url") or "") + c["post_url"]: fails.append(f"gallery {it['key']}: YouTube id not from the source")
    if sum(1 for it in gal["items"] if it["origin"] == "web" and it["verified"]) != 5: fails.append("gallery: expected exactly five verified (official source) web cases")
    js = (ARC / "js/gallery.js").read_text(encoding="utf-8")
    if "youtube-nocookie.com/embed/" not in js or "youtube.com/embed" in js.replace("youtube-nocookie.com/embed", ""): fails.append("gallery: YouTube must embed via youtube-nocookie.com only")
    used = {str((ARC / m[k2]).resolve()) for it in gal["items"] for m in it["media"] for k2 in ("src", "poster") if m.get(k2)} | {str((ARC / it["thumb"]).resolve()) for it in gal["items"] if it.get("thumb")}
    stray = [str(f.relative_to(ARC)) for f in (ARC / "media/usecases").rglob("*") if f.is_file() and str(f.resolve()) not in used]
    if stray: fails.append(f"gallery: media of dropped posts still on disk: {stray[:5]}{' …' if len(stray) > 5 else ''}")

# v6: the glossary (term popovers, exit zone) and the exit's installer quotes are verbatim from their cited lines
gl = data.get("glossary") or []
gids = {g["id"] for g in gl}
if len(gids) != len(gl): fails.append("glossary: duplicate ids")
for g in gl:
    if not g.get("plain"): fails.append(f"glossary {g['id']}: no plain definition")
    if g.get("s") and g.get("q"): check_text(g["q"], g["s"], f"glossary {g['id']}")
    if g.get("s") and not g.get("q"): fails.append(f"glossary {g['id']}: a source without the quote it rests on")
ex = data.get("exit")
if ex:
    def walk_t(o, where):
        if isinstance(o, dict):
            s = o.get("s")
            if s and "t" in o:
                for t in (o["t"] if isinstance(o["t"], list) else [o["t"]]): check_text(t, s, where)
            if o.get("exampleSrc"): check_text(o["example"], o["exampleSrc"], where + ".example")
            for k, v in o.items():
                if k not in ("s", "exampleSrc"): walk_t(v, f"{where}.{k}")
        elif isinstance(o, list):
            for i, x in enumerate(o): walk_t(x, f"{where}[{i}]")
    walk_t(ex, "exit")
    steps = {s["id"] for s in ex["install"]["steps"]} | {f["id"] for f in ex["flow"]}
    for pth in ex["paths"]:
        for t in pth["terms"]:
            if t not in gids: fails.append(f"exit path {pth['id']}: unknown term {t}")
        for st in pth["steps"]:
            if st not in steps: fails.append(f"exit path {pth['id']}: unknown step {st}")
        if pth["pick"] not in ex["picks"]["t"]: fails.append(f"exit path {pth['id']}: {pth['pick']} is not one of the installer's categories")
    if ex.get("github") and ex["github"] not in ok: fails.append(f"exit: {ex['github']} is not in urls-ok.txt")

# v6: no key or token anywhere in the served text (the exit describes an installer that asks for an API key; it never shows one)
KEYLIKE = re.compile(r"sk-[A-Za-z0-9_-]{12,}|ghp_[A-Za-z0-9]{12,}|github_pat_[A-Za-z0-9_]{12,}|AIza[0-9A-Za-z_-]{20,}|(?i:api[_-]?key)\s*[:=]\s*['\"][A-Za-z0-9]{12,}")
for f in sorted([*ARC.glob("js/*.js"), ARC / "index.html", *ARC.glob("*.md")]):
    for i, ln in enumerate(f.read_text(encoding="utf-8").splitlines(), 1):
        if KEYLIKE.search(ln): fails.append(f"{f.relative_to(ARC)}:{i}: something that looks like a key or token")

# v6 (전사본): Part 1 opens with 민성's story. His lines are verbatim from the one line they cite (span 0); every date,
# number and label on the pictures is within ±4 lines of its source; the four metaphors have exactly one picture each;
# the story runs in his block order (C-01 … C-20).
DIG = re.compile(r"\d{2,}")
def check_digits(t, s, where, span=4):
    L = check_src(s, where)
    if L is None or not s.get("l"): return
    window = "\n".join(L[max(0, s["l"] - 1 - span):min(len(L), s["l"] + span)])
    for n in DIG.findall(str(t)):  # a month or day ("06") may be written "6월" at the source: compare those by value
        hit = n in window if len(n) > 2 else re.search(rf"(?<!\d)0?{int(n)}(?!\d)", window)
        if not hit: fails.append(f"{where}: \"{n}\" in \"{str(t)[:40]}\" is not within ±{span} lines of {s['f']}:{s['l']}")
story = [p for p in data["pieces"] if p["kind"] == "story"]
METAPHORS = ("tide", "harness", "anatomy", "guardrail")
for p in story:
    pid = p["id"]
    for i, v in enumerate(p.get("voice", [])): check_text(v["t"], v["s"], f"{pid} voice {i}", span=0)
    v = p.get("vis") or {}
    if v.get("s"):
        check_digits(v.get("d", ""), v["s"], f"{pid} picture date")
        for k in ("en", "blank"):
            if v.get(k): check_text(v[k].rstrip("?"), v["s"], f"{pid} picture {k}")
        for k in ("items", "layers", "hands", "turn"):
            for x in v.get(k, []): check_text(x, v["s"], f"{pid} picture {k}")
        for k in ("head", "prompt", "hook"):
            if v.get(k): check_text(v[k], v["s"], f"{pid} picture {k}")
        if v.get("rules"): check_text(v["rules"], v["s"], f"{pid} picture rules")
    if v.get("ko"): check_text(v["ko"], v["koSrc"], f"{pid} picture ko")
    if v.get("pre"): check_text(v["pre"]["t"], v["pre"]["s"], f"{pid} picture pre", span=0)
    for x in v.get("tools", []): check_text(x, v["toolsSrc"], f"{pid} picture tools")
    for k in ("line", "marks", "pts"):
        for m in v.get(k, []):
            check_digits(m.get("d", ""), m["s"], f"{pid} picture {k}")
            check_digits(m.get("t", ""), m["s"], f"{pid} picture {k}")
            if "v" in m: check_nums(str(m["v"]), m["s"], f"{pid} picture {k}")
    if p.get("metaphor") and not v: fails.append(f"{pid}: metaphor without a picture")
for m in METAPHORS:
    n = [p["id"] for p in story if p.get("metaphor") == m]
    if len(n) != 1: fails.append(f"metaphor {m}: {len(n)} pictures ({n}), must be exactly one")
extra = {p.get("metaphor") for p in story if p.get("metaphor")} - set(METAPHORS)
if extra: fails.append(f"unknown metaphors {extra}")
order = [int(re.search(r"C-(\d+)", p["src"][0].get("s", "")).group(1)) for p in story if re.search(r"C-(\d+)", p["src"][0].get("s", ""))]
if order != sorted(order) or len(order) != len(story): fails.append(f"story pieces are not in block order: {order}")
for k in ("vibe", "agent", "harness", "hook", "metaprompt", "intent"):
    g = next((x for x in gl if x["id"] == k), None)
    if g and g.get("voice"): check_text(g["voice"]["t"], g["voice"]["s"], f"glossary {k} voice", span=0)
if ex and ex.get("why"): check_text(ex["why"]["t"], ex["why"]["s"], "exit why", span=0)

# v6 (전사본) fact gate: what the transcript fact check (보완_전사본_사실검증.md) bans or replaces can never come back.
# Site files are strict; README lines that state a ban ("금지") or quote the narration ("나레이션") are allowed.
GATE = [
    ("plan-equivalence estimate (U-3)", r"API\s*환산|1,?100\s*달러|\$\s?1,?100(?![\d,])|등가\s*추산|요금제\s*등가", None),
    ("GLM 5.3 ≈ Mythos 5 / Mythos cluster (U-5, B-3)", r"Mythos|미토스|GLM[\s-]*5\.3", None),
    ("'GPT-5 IMO gold' (O-2)", r"GPT[\s-]?5[^.\n]{0,60}(IMO|금메달|국제수학)|(IMO|금메달|국제수학)[^.\n]{0,60}GPT[\s-]?5", None),
    ("accounting 33% (E-8)", r"(회계|CPA)[^\n]{0,40}\b33\s*%|\b33\s*%[^\n]{0,40}(회계|CPA)", None),
    ("bank names (E-11)", r"IBK|7개\s*은행|7가지의?\s*은행", None),
    ("HLE 60–70% (O-6)", r"(HLE|Humanity's Last Exam)[^\n]{0,80}\b(60|70)\s*(%|~|～|에서)", None),
    ("vibe coding year other than 2025 (E-1)", r"(바이브\s?코딩|vibe coding)[^\n]{0,40}\b20(1\d|2[0-46-9])\b|\b2024\b[^\n]{0,20}(바이브|vibe)", None),
    ("GPT-1 year other than 2018 (E-2)", r"GPT-1[^\n]{0,30}\b20(?!18)\d\d\b", None),
    ("Claude Code in September (E-5)", r"(Claude Code|클로드 코드)[^\n]{0,40}(9월|2025[.-]09|September)", None),
    ("수능 30번 credited to GPT-4 (E-6)", r"수능[^\n]*GPT-4|GPT-4[^\n]*수능", r"o1"),
    ("700 problems solved (O-3)", r"700\s*개[^\n]{0,20}(난제|문제)|(난제|문제)[^\n]{0,20}700\s*개", None),
    ("Goose as the first agent (O-1)", r"(Goose|구즈)[^\n]{0,30}최초", r"않"),
    ("'3일 · 80% · 딸깍' (O-4)", r"딸깍|3일[^\n]{0,30}80\s*%", None),
]
site = sorted(f for f in ARC.glob("js/*.js") if f.name not in ("lod.js", "anchors.js")) + [ARC / "index.html"]
docs = [ARC / "README.md", ARC / "CREDITS-libs.md"]
for f in site + docs:
    for i, ln in enumerate(f.read_text(encoding="utf-8").splitlines(), 1):
        if f in docs and ("금지" in ln or "나레이션" in ln): continue
        for name, rx, unless in GATE:
            if re.search(rx, ln) and not (unless and re.search(unless, ln)): fails.append(f"fact gate: {name} at {f.relative_to(ARC)}:{i}")
print(f"story: {len(story)} pieces in block order, metaphors {', '.join(f'{m} 1' for m in METAPHORS)}; fact gate: {len(GATE)} rules over {len(site + docs)} files")

# v6 (민성 t1193u): no serif, myeongjo, 궁서 or brush face. Every font-family stack and every shipped font file is sans or mono.
SERIFISH = re.compile(r"(?<!sans-)\bserif\b|Myeongjo|명조|Batang|바탕|Gungsuh|궁서|Brush|Nanum Pen|cursive|Instrument Serif|Noto Serif", re.I)
for f in sorted(ARC.glob("css/*.css")):
    for i, ln in enumerate(f.read_text(encoding="utf-8").splitlines(), 1):
        for decl in re.findall(r"(?:font-family|--f-[a-z-]+|--serif[a-z-]*)\s*:\s*([^;]+);", ln):
            if SERIFISH.search(decl): fails.append(f"font: a serif or brush face in {f.relative_to(ARC)}:{i}: {decl.strip()[:60]}")
        if re.search(r"var\(--serif", ln): fails.append(f"font: the removed serif stack is used at {f.relative_to(ARC)}:{i}")
for f in sorted((ARC / "fonts").glob("*.woff2")):
    if SERIFISH.search(f.stem): fails.append(f"font: serif or brush file shipped: fonts/{f.name}")

# v6 (민성 t1195u): the site is public. No internal or behind-the-scenes wording reaches a visitor: who drafted what
# (narration, transcript, owner, the agents that built it), audit and fact-check process words and codes, block ids,
# decision ids, research-file credits, internal paths, dev notes. Two scans: (1) every visitor-facing data field
# (source objects, ids, paths and slugs are skipped); (2) the UI code with comments stripped, every human string literal
# (one with a space or Hangul). tools/test_v6.py also scans the rendered pages.
INTERNAL = re.compile(r"민성|나레이션|전사본|소유자|(?i:\bowner\b|transcript)|사실\s?검증|fact[\s-]?gate|팩트\s?게이트|사실 게이트|감수|감독관"
    r"|감사\s?(?:[A-Z(]|범위|판정|커버리지|이후|가 )|(?<![\w-])[ABCEOU]-\d{1,2}(?![\w-])|\bMuse\b|\bDots\b|\bt1\d{3}u\b|package_1105|refs/"
    r"|mind-field-archive|\bTODO\b|FIXME|기획자의 원문|마스터프롬프트|[12]부 조사|워크숍 조사 자료|조사 파일|1차 조사|보완 조사|이 아카이브의 기록|원본 파일 위치"
    r"|(?:Grok|그록|Muse|Dots|Claude|클로드)\s?(?:이|가)?\s?(?:검토했|리뷰했|정리했|작성했|만들었|감수)")
VSKIP = {"s", "src", "f", "l", "g", "id", "url", "slot", "file", "fallback", "key", "zone", "kind", "type", "st", "cluster", "ring", "metaphor",
         "poster", "capSrc", "koSrc", "toolsSrc", "match", "at", "polar", "cell", "anchor", "piece", "exampleSrc", "rel", "where", "family", "group_key"}
def vwalk(o, where):
    if isinstance(o, str):
        if (" " in o or re.search(r"[가-힣]", o)) and INTERNAL.search(o): fails.append(f"public text: internal wording at {where}: {o[:70]}")
    elif isinstance(o, list):
        for i, x in enumerate(o): vwalk(x, f"{where}[{i}]")
    elif isinstance(o, dict):
        for k, v in o.items():
            if k not in VSKIP: vwalk(v, f"{where}.{k}")
for k in ("pieces", "zones", "clusters", "rings", "assets", "threads", "status", "viz", "explain", "glossary", "exit", "gallery", "acts"):
    vwalk(data.get(k), k)
UI = ["index.html"] + [f"js/{n}" for n in ("app.js", "render.js", "story.js", "explain.js", "gallery.js", "exit.js", "terms.js", "field.js")]
LIT = re.compile(r'"(?:[^"\\\n]|\\.)*"|\'(?:[^\'\\\n]|\\.)*\'|`(?:[^`\\]|\\.)*`', re.S)
for rel in UI:
    code = (ARC / rel).read_text(encoding="utf-8")
    code = re.sub(r"<!--.*?-->", "", code, flags=re.S) if rel.endswith(".html") else re.sub(r"/\*.*?\*/", "", code, flags=re.S)
    if not rel.endswith(".html"): code = re.sub(r"(?m)(^|[^:\"'`\\])//[^\n]*", r"\1", code)
    texts = [re.sub(r"\$\{[^}]*\}", " ", m.group(0)[1:-1]) for m in LIT.finditer(code)] if not rel.endswith(".html") else [re.sub(r"<script.*?</script>", "", code, flags=re.S)]
    for t in texts:
        if (" " in t or re.search(r"[가-힣]", t)) and INTERNAL.search(t):
            fails.append(f"public text: internal wording in {rel}: {INTERNAL.search(t).group(0)} … {t.strip()[:60]}")

links = sorted({l["url"] for p in data["pieces"] for l in p.get("links", [])} | {m["by"]["url"] for p in data["pieces"] for m in p.get("media", []) if m.get("by")})
print(f"{len(data['pieces'])} pieces, {len(data['threads'])} threads, {len(links)} distinct external links")
if gal: print(f"gallery: {len(gal['items'])} posts, {sum(len(i['media']) for i in gal['items'])} media items, all links from filenames or cases.json")
print(f"links: {sum(u in drive for u in links)} from x-from-drive.txt, {sum(u in ok and u not in drive for u in links)} from urls-ok.txt only")
print(f"glossary: {len(gl)} terms; exit: {len((ex or {}).get('paths', []))} paths, installer quotes {'checked' if AIW else 'NOT_RUN'}")
for k, why in notrun.items(): print(f"NOT_RUN  {k}: {why}")
if fails:
    print(f"\n{len(fails)} problem(s):"); print("\n".join("  " + f for f in fails)); sys.exit(1)
print("all checks that could run pass" if notrun else "all checks pass")
