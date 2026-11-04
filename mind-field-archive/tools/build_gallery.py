"""Build the frontier use-case gallery: media + js/gallery-data.js. Run from archive/:  python3 tools/build_gallery.py

Sources (nothing else):
  refs/drive/usecases/<user>_<id>_<n>.(jpg|mp4)   Drive files; the X link is built from the filename
  refs/old-claude-design-brief.md                  the first line of each Drive post (the caption), with its line number
  refs/x-frontier-cases/cases.json                 Paper Scout cases: group, author, text, likes, date, URL, media
Media go to media/usecases/: videos re-encoded (H.264, long side <= 1280, CRF 28, faststart, no audio unless the post
says it is music), a .jpg poster per video, images resized to <= 1400px. Videos longer than 120 s keep the first 120 s.
A video still above 1.6 Mbps after that is re-encoded at long side 960, CRF 31.
Each post also gets a 320px thumbnail in media/usecases/thumbs/ for the floor wall.
Cases whose video is only remote get a poster pulled with ffmpeg from the remote URL when reachable; the video itself is
never copied or hotlinked. Idempotent: existing outputs are kept. Writes tools/gallery-log.json (provenance and sizes).
Curation: only posts listed in tools/curation.json are built; files in media/usecases/ that no kept post uses are deleted.
refs/web-office-cases/cases.json (6 ranked office cases) is added: thumbnails copied, YouTube ids kept for nocookie embeds."""
import concurrent.futures as cf, json, pathlib, re, subprocess

ARC = pathlib.Path(__file__).resolve().parent.parent
REFS = ARC.parent / "refs"
OUT = ARC / "media/usecases"; OUT.mkdir(parents=True, exist_ok=True)
CAP_S, LONG, CRF = 120, 1280, 28
MUSIC = re.compile(r"music|\bMV\b|song|Suno|뮤직", re.I)

def probe(p):
    j = json.loads(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration:stream=codec_type,width,height", "-of", "json", str(p)], capture_output=True, text=True).stdout or "{}")
    v = next((s for s in j.get("streams", []) if s.get("codec_type") == "video"), {})
    return float(j.get("format", {}).get("duration", 0) or 0), v.get("width"), v.get("height"), any(s.get("codec_type") == "audio" for s in j.get("streams", []))

def video(src, dst, keep_audio):
    dur, w, h, has_a = probe(src)
    if not dst.exists():
        scale = f"scale='if(gte(iw,ih),min({LONG},iw),-2)':'if(gte(iw,ih),-2,min({LONG},ih))':flags=lanczos,fps=30"
        cmd = ["ffmpeg", "-v", "error", "-y", "-i", str(src), "-t", str(CAP_S), "-vf", scale, "-c:v", "libx264", "-preset", "faster", "-crf", str(CRF), "-pix_fmt", "yuv420p", "-movflags", "+faststart"]
        cmd += ["-c:a", "aac", "-b:a", "96k"] if (keep_audio and has_a) else ["-an"]
        subprocess.run(cmd + [str(dst)], check=True)
        if dst.stat().st_size * 8 / max(probe(dst)[0], 1) > 1.6e6:  # still heavy: long side 960, CRF 31
            cmd[cmd.index(scale)] = scale.replace(str(LONG), "960"); cmd[cmd.index(str(CRF))] = "31"
            subprocess.run(cmd + [str(dst)], check=True)
    poster = dst.with_suffix(".jpg")
    if not poster.exists():
        d2 = probe(dst)[0]
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", f"{min(d2 * 0.3, 8):.2f}", "-i", str(dst), "-frames:v", "1", "-vf", "scale='min(900,iw)':-2", "-q:v", "5", "-pix_fmt", "yuvj420p", str(poster)], check=True)
    d2, w2, h2, a2 = probe(dst)
    return {"src": str(src.relative_to(ARC.parent)), "out": str(dst.relative_to(ARC)), "poster": str(poster.relative_to(ARC)), "w": w2, "h": h2,
            "dur": round(d2, 1), "srcDur": round(dur, 1), "excerpt": dur > CAP_S + 0.5, "audio": a2, "bytes": dst.stat().st_size + poster.stat().st_size}

def image(src, dst):
    from PIL import Image
    if not dst.exists():
        im = Image.open(src).convert("RGB")
        if im.width > 1400: im = im.resize((1400, round(im.height * 1400 / im.width)), Image.LANCZOS)
        im.save(dst, quality=82, optimize=True, progressive=True)
    from PIL import Image as I2
    im = I2.open(dst)
    return {"src": str(src.relative_to(ARC.parent)), "out": str(dst.relative_to(ARC)), "w": im.width, "h": im.height, "bytes": dst.stat().st_size}

def remote_poster(url, dst):
    if dst.exists(): return {"poster": str(dst.relative_to(ARC)), "remote": url, "bytes": dst.stat().st_size, "pulled": True}
    r = subprocess.run(["timeout", "40", "ffmpeg", "-v", "error", "-y", "-ss", "2", "-i", url, "-frames:v", "1", "-vf", "scale='min(900,iw)':-2", "-q:v", "5", "-pix_fmt", "yuvj420p", str(dst)], capture_output=True, text=True)
    if r.returncode == 0 and dst.exists() and dst.stat().st_size > 0:
        return {"poster": str(dst.relative_to(ARC)), "remote": url, "bytes": dst.stat().st_size, "pulled": True}
    if dst.exists(): dst.unlink()
    return {"poster": None, "remote": url, "bytes": 0, "pulled": False, "error": (r.stderr or "").strip()[-200:]}

# ── Drive items: captions from the old brief (first line of each post), line-numbered ──
brief = (REFS / "old-claude-design-brief.md").read_text(encoding="utf-8").splitlines()
def brief_line(user, pid):
    for i, line in enumerate(brief, 1):
        m = re.match(rf"- \[@{re.escape(user)}\]\(https://x\.com/{re.escape(user)}/status/{pid}\) — ([\d,]+) likes — (.*)$", line)
        if m: return i, int(m.group(1).replace(",", "")), m.group(2).strip()
    return None, None, None

LAB_ACCOUNTS = {"OpenAI": ("openai", "@OpenAI 공식 계정"), "claudeai": ("anthropic", "@claudeai 공식 계정"), "GoogleCloudTech": ("google", "@GoogleCloudTech 공식 계정"),
                "SakanaAILabs": ("labs", "@SakanaAILabs 공식 계정"), "PrimeIntellect": ("labs", "@PrimeIntellect 공식 계정")}
def drive_group(user, caption):
    """Lab accounts → that lab. Otherwise the model named in the post's first line. Otherwise 'no model named'."""
    if user in LAB_ACCOUNTS: return LAB_ACCOUNTS[user]
    c = caption or ""
    named = [m for m, k in (("Opus 5.5", "anthropic"), ("GPT-6 Astra", "openai"), ("Gemini", "google"), ("Grok", "grok")) if m.lower() in c.lower()]
    if len(named) >= 2 or re.search(r"\bvs\b|\bbeats\b", c) and named: return ("compare", "Comparison: Opus 5.5 vs GPT-6 Astra (+others)")
    if named:
        k = dict((("Opus 5.5", "anthropic"), ("GPT-6 Astra", "openai"), ("Gemini", "google"), ("Grok", "grok")))[named[0]]
        return (k, {"anthropic": "Claude Opus 5.5", "openai": "GPT-6 Astra", "google": "Gemini (4 Argon / 3.8 Flash)", "grok": "Grok (4.7 / Imagine)"}[k])
    return ("none", "게시물 첫 줄에 모델 이름 없음")

CUR = json.loads((ARC / "tools/curation.json").read_text(encoding="utf-8"))
KEEP = CUR["keep"]
items, log, jobs = [], {}, []
pool = cf.ThreadPoolExecutor(max_workers=4)
drive = sorted((REFS / "drive/usecases").iterdir())
posts = {}
for f in drive:
    m = re.match(r"(.+)_(\d{15,})_(\d+)\.(jpg|mp4)$", f.name)
    if not m: continue
    user, pid, n, ext = m.groups()
    posts.setdefault((user, pid), []).append((int(n), f, ext))
for (user, pid), files in posts.items():
    if f"d-{user}-{pid}" not in KEEP: continue
    ln, likes, cap = brief_line(user, pid)
    fam, sub = drive_group(user, cap)
    media = []
    for n, f, ext in sorted(files):
        dst = OUT / f.name
        if ext == "mp4": media.append(("video", pool.submit(video, f, dst, bool(cap and MUSIC.search(cap)))))
        else: media.append(("img", pool.submit(image, f, dst.with_suffix(".jpg"))))
    items.append({"key": f"d-{user}-{pid}", "origin": "drive", "family": fam, "group": sub, "author": user, "likes": likes, "date": None,
                  "text": cap, "textSrc": {"f": "refs/old-claude-design-brief.md", "l": ln} if ln else None,
                  "url": f"https://x.com/{user}/status/{pid}", "linkKind": "X 원본", "_media": media,
                  "src": f"refs/drive/usecases/{user}_{pid}_*"})

cases = json.loads((REFS / "x-frontier-cases/cases.json").read_text(encoding="utf-8"))
# Single-model group labels map to their family; labels that name several models (vs, /, +, "16 models") are comparisons.
SINGLE = {"Claude Opus 5.5": "anthropic", "Claude (Max, Opus)": "anthropic", "GPT-6 Astra": "openai", "Gemini (4 Argon / 3.8 Flash)": "google", "Grok (4.7 / Imagine)": "grok"}
FAM = lambda g: SINGLE.get(g, "compare")
for c in cases:
    if f"x-{c['n']}" not in KEEP: continue
    media, local = [], {pathlib.Path(p).name for p in c["local_media"]}
    for j, u in enumerate(c["media_urls"], 1):
        stem = f"x{c['n']:02d}_{c['author']}_{j}"
        loc = next((p for p in local if p.startswith(f"{c['n']:02d}_{c['author']}_{j}.")), None)
        if loc and loc.endswith(".mp4"): media.append(("video", pool.submit(video, REFS / "x-frontier-cases/media" / loc, OUT / f"{stem}.mp4", bool(MUSIC.search(c["text"])))))
        elif loc: media.append(("img", pool.submit(image, REFS / "x-frontier-cases/media" / loc, OUT / f"{stem}.jpg")))
        elif ".mp4" in u: media.append(("remote", pool.submit(remote_poster, u, OUT / f"{stem}-poster.jpg")))
    items.append({"key": f"x-{c['n']}", "origin": "scout", "n": c["n"], "family": FAM(c["group"]), "group": c["group"], "category": c.get("category"), "made": c.get("what_made"), "author": c["author"], "name": c["name"],
                  "likes": c["likes"], "date": c["date_kst"], "text": c["text"], "textSrc": {"f": "refs/x-frontier-cases/cases.json", "n": c["n"]},
                  "claim": c["model_claimed"], "url": c["post_url"], "linkKind": "X 게시물", "_media": media, "src": f"refs/x-frontier-cases/cases.json #{c['n']}"})

(OUT / "web").mkdir(exist_ok=True)
WEB = json.loads((REFS / "web-office-cases/cases.json").read_text(encoding="utf-8"))
YT = re.compile(r"(?:youtube(?:-nocookie)?\.com/(?:embed/|watch\?v=)|youtu\.be/)([\w-]{11})")
for c in WEB:
    key = f"w-{c['rank']}"
    if key not in KEEP: continue
    yid = next((m.group(1) for u in (c.get("embed_url") or "", c["post_url"]) for m in [YT.search(u)] if m), None)
    media = []
    for lm in c["local_media"]:
        src = REFS / "web-office-cases" / lm
        media.append(("img", pool.submit(image, src, OUT / "web" / (pathlib.Path(lm).stem + ".jpg"))))
    official = c["verification"].startswith("verified")
    items.append({"key": key, "origin": "web", "rank": c["rank"], "family": "office-web", "group": c["group"], "author": c["author"], "name": c["name"],
                  "likes": None, "date": None, "text": c["text"], "made": c["what_made"], "textSrc": {"f": "refs/web-office-cases/cases.json", "rank": c["rank"]},
                  "claim": c["model_claimed"], "verification": c["verification"], "verified": official, "why": c["why_selected"],
                  "url": c["post_url"], "linkKind": "YouTube" if yid else "공식 페이지" if official else "원문", "youtube": yid,
                  "_media": media, "src": f"refs/web-office-cases/cases.json #{c['rank']}"})
for it in items:
    k = KEEP[it["key"]]
    it["category"] = k["category"]; it["reason"] = k["reason"]
    if k.get("computer_use"): it["computerUse"] = True

total = 0
for it in items:
    out = []
    for kind, fut in it.pop("_media"):
        r = fut.result(); total += r.get("bytes", 0)
        log[r.get("out") or r.get("poster") or r["remote"]] = r
        if kind == "video": out.append({"type": "video", "src": r["out"], "poster": r["poster"], "w": r["w"], "h": r["h"], "dur": r["dur"], "excerpt": r["excerpt"], "srcDur": r["srcDur"], "audio": r["audio"]})
        elif kind == "img": out.append({"type": "img", "src": r["out"], "w": r["w"], "h": r["h"]})
        else: out.append({"type": "remote", "poster": r["poster"], "remote": r["remote"]})
    it["media"] = out
    # a small thumbnail for the floor wall (tiles are tiny there); the room uses the full poster
    first = next((m.get("poster") if m["type"] != "img" else m["src"] for m in out if (m.get("poster") or m.get("src"))), None)
    if first:
        from PIL import Image
        th = OUT / "thumbs" / (pathlib.Path(first).stem + ".jpg"); th.parent.mkdir(exist_ok=True)
        if not th.exists():
            im = Image.open(ARC / first).convert("RGB"); im.thumbnail((320, 320)); im.save(th, quality=68, optimize=True, progressive=True)
        it["thumb"] = str(th.relative_to(ARC)); total += th.stat().st_size

used = set()
for it in items:
    for m in it["media"]:
        for k2 in ("src", "poster"):
            if m.get(k2): used.add(str(ARC / m[k2]))
    if it.get("thumb"): used.add(str(ARC / it["thumb"]))
removed = []
for f in sorted(OUT.rglob("*")):
    if f.is_file() and str(f) not in used:
        removed.append((str(f.relative_to(ARC)), f.stat().st_size)); f.unlink()
log = {k: v for k, v in log.items() if str(ARC / (v.get("out") or v.get("poster") or "")) in used or "remote" in v}

FAMILIES = [("anthropic", "Anthropic", "Claude"), ("openai", "OpenAI", "GPT"), ("google", "Google", "Gemini"), ("grok", "Grok", ""),
            ("compare", "비교", "모델끼리 맞붙인 게시물"), ("labs", "그 밖의 랩", "랩 공식 계정"), ("none", "모델 표기 없음", "게시물 첫 줄에 모델 이름이 없는 것")]
SECTIONS = [("showcase", "쇼케이스", "모델별로 묶은 결과물"), ("office", "오피스", "문서, 덱, 스프레드시트, 업무 흐름"), ("blender", "Blender", "Blender를 코드로 다룬 3D 결과물")]
data = {"families": [{"key": k, "name": n, "sub": s} for k, n, s in FAMILIES], "sections": [{"key": k, "name": n, "sub": s} for k, n, s in SECTIONS], "items": items,
        "note": "모델 표기와 게시물의 주장은 모두 게시물 글에 적힌 것이며 확인되지 않았습니다."}
(ARC / "js/gallery-data.js").write_text("/* Generated by tools/build_gallery.py. Do not edit by hand. */\nwindow.AR = window.AR || {};\nwindow.AR.gallery = "
                                        + json.dumps(data, ensure_ascii=False, indent=1) + ";\n", encoding="utf-8")
(ARC / "tools/gallery-log.json").write_text(json.dumps({"bytes_total": sum(pathlib.Path(p).stat().st_size for p in used if pathlib.Path(p).exists()), "files": log, "removed": removed}, ensure_ascii=False, indent=1), encoding="utf-8")
total = sum(pathlib.Path(p).stat().st_size for p in used if pathlib.Path(p).exists())
print(f"{len(items)} posts kept, media now {total / 1e6:.1f} MB; removed {len(removed)} files, {sum(b for _, b in removed) / 1e6:.1f} MB")
print("remote:", [(k, v.get("pulled")) for k, v in log.items() if "remote" in v])
print("audio kept:", [k for k, v in log.items() if v.get("audio")])
print("excerpts:", [k for k, v in log.items() if v.get("excerpt")])
print("drive without caption:", [it["key"] for it in items if it["origin"] == "drive" and not it["text"]])
