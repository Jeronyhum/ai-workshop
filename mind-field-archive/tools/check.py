"""Check archive/js/data.js against its sources. Run from archive/:  python3 tools/check.py

1. Links: every URL is in urls-ok.txt or x-from-drive.txt; "X 원본" only for x-from-drive.txt.
2. Sources: every cited file exists and has the cited line.
3. Numbers: every number shown on a piece appears within ±4 lines of the line it cites.
4. Gates: a status that cites 감독관_감사.md agrees with the audit section of that line
   (B-0 :101-111 정정, B-1 :113-136 확정, B-2 :138-167 단서, B-3 :169-180 제외).
5. Media: every media file and poster exists.
Exits 1 if any check fails."""
import json, pathlib, re, subprocess, sys

ARC = pathlib.Path(__file__).resolve().parent.parent
REFS = ARC.parent / "refs"
data = json.loads(subprocess.run(["node", "-e", "global.window={};global.document={baseURI:'file:///'};for(const f of process.argv.slice(1))require(f);const A=window.AR;console.log(JSON.stringify({...A,assetsReadyList:A.assetsReady}))",
                                  str(ARC / "js/data.js"), str(ARC / "js/assets.js"), str(ARC / "js/anchors.js"), str(ARC / "js/gallery-data.js")], capture_output=True, text=True, check=True).stdout)

ok = {l.strip() for l in (ARC / "urls-ok.txt").read_text().splitlines() if l.strip()}
drive = {l.strip() for l in (ARC / "x-from-drive.txt").read_text().splitlines() if l.strip()}
fails, notes = [], []

def path_of(f):
    if f.startswith("refs/"): return ARC.parent / f
    if f.startswith("archive/"): return ARC.parent / f
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
    if not p.exists(): fails.append(f"{where}: missing file {f}"); return None
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
    if a["cap"] != "생성 이미지 · 디자인 에셋": fails.append(f"asset {a['slot']}: wrong caption")
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
    cases = {c["n"]: c for c in json.loads((REFS / "x-frontier-cases/cases.json").read_text(encoding="utf-8"))}
    brief_lines = (REFS / "old-claude-design-brief.md").read_text(encoding="utf-8").splitlines()
    drive_files = {f.name for f in (REFS / "drive/usecases").iterdir()}
    seen_cases = set()
    for it in gal["items"]:
        k = it["key"]
        if it["origin"] == "drive":
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
        if it["origin"] == "scout" and it.get("category") != cases[it["n"]].get("category"): fails.append(f"gallery {it['key']}: category differs from cases.json")
    cu = [k for k, v in cur["keep"].items() if v.get("computer_use")]
    if len(cu) > 1: fails.append(f"gallery: more than one computer-use demo kept: {cu}")
    if len(cur["computer_use_cases"]) != 6: fails.append("gallery: the six computer-use office cases are not all identified")
    web = {c["rank"]: c for c in json.loads((REFS / "web-office-cases/cases.json").read_text(encoding="utf-8"))}
    for it in gal["items"]:
        if it["origin"] != "web": continue
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

links = sorted({l["url"] for p in data["pieces"] for l in p.get("links", [])} | {m["by"]["url"] for p in data["pieces"] for m in p.get("media", []) if m.get("by")})
print(f"{len(data['pieces'])} pieces, {len(data['threads'])} threads, {len(links)} distinct external links")
if gal: print(f"gallery: {len(gal['items'])} posts, {sum(len(i['media']) for i in gal['items'])} media items, all links from filenames or cases.json")
print(f"links: {sum(u in drive for u in links)} from x-from-drive.txt, {sum(u in ok and u not in drive for u in links)} from urls-ok.txt only")
if fails:
    print(f"\n{len(fails)} problem(s):"); print("\n".join("  " + f for f in fails)); sys.exit(1)
print("all checks pass")
