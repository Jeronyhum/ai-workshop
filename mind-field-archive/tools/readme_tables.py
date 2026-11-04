"""Regenerate the piece, thread, link and media tables in archive/README.md from js/data.js.
Run from archive/:  python3 tools/readme_tables.py
Only the text between <!-- gen:NAME --> and <!-- /gen:NAME --> is replaced."""
import json, pathlib, re, subprocess
ARC = pathlib.Path(__file__).resolve().parent.parent
A = json.loads(subprocess.run(["node", "-e", "global.window={};require(process.argv[1]);console.log(JSON.stringify(window.AR))", str(ARC / "js/data.js")], capture_output=True, text=True, check=True).stdout)
drive = {l.strip() for l in (ARC / "x-from-drive.txt").read_text().splitlines() if l.strip()}
log = json.loads((ARC / "tools/media-log.json").read_text())
by = {p["id"]: p for p in A["pieces"]}
ST = {k: f"{v['mark']} {v['word']}" for k, v in A["status"].items()}
ring = {b["key"]: b["name"] for b in A["rings"]["bands"]}
def where(p):
    if p["zone"] == "p2": return "2부 · " + ("고리의 중심" if p["id"] == "paradigm" else ring.get(p.get("ring"), "고리 바깥"))
    if p["zone"] == "br": return "다리"
    return "1부 · " + p["cluster"]
def ref(s): return " ".join(x for x in [s["f"], s.get("s"), f":{s['l']}" if s.get("l") else "", s.get("by") if not s.get("l") else ""] if x)
cell = lambda t: str(t).replace("|", "\\|")

out = {}
TIER = {1: "1 작품", 2: "2 플레이트", 3: "3 노트"}
rows = ["| id | 층 | 자리 | 제목 | 형식 | 상태 | 주 출처 (refs/drive/ 기준) | 감사 |", "|---|---|---|---|---|---|---|---|"]
for p in A["pieces"]:
    s = p["src"][0]
    rows.append(f"| `{p['id']}` | {TIER[A['layout'][p['id']]['tier']]} | {where(p)} | {cell(p['title'])} | {p['kind']} | {ST[p['st']]} | `{cell(ref(s))}` | {cell(s.get('g', ''))} |")
out["pieces"] = "\n".join(rows)

tone = lambda a, b: "1부 안 (빨강)" if a["zone"] == b["zone"] == "p1" else "2부 안 (산성 초록)" if a["zone"] == b["zone"] == "p2" else "건너는 실 (엠버)"
rows = ["| 조각 | 조각 | 실의 색 | 이어지는 이유 |", "|---|---|---|---|"]
for a, b, why in A["threads"]:
    rows.append(f"| {cell(by[a]['title'])} (`{a}`) | {cell(by[b]['title'])} (`{b}`) | {tone(by[a], by[b])} | {cell(why)} |")
out["threads"] = "\n".join(rows)

rows = ["| 조각 | 종류 | 표시 이름 | URL | 목록 |", "|---|---|---|---|---|"]
seen = set()
for p in A["pieces"]:
    for l in p.get("links", []):
        rows.append(f"| `{p['id']}` | {l['kind']} | {cell(l['label'])} | <{l['url']}> | {'x-from-drive.txt' if l['url'] in drive else 'urls-ok.txt'} |"); seen.add(l["url"])
    for m in p.get("media", []):
        if m.get("by") and m["by"]["url"] not in {l["url"] for l in p.get("links", [])}:
            rows.append(f"| `{p['id']}` | {m['by']['kind']} (자료 크레디트) | {cell(m['by']['label'])} | <{m['by']['url']}> | {'x-from-drive.txt' if m['by']['url'] in drive else 'urls-ok.txt'} |"); seen.add(m["by"]["url"])
out["links"] = f"서로 다른 URL {len(seen)}개.\n\n" + "\n".join(rows)

rows = ["| archive 파일 | 원본 (refs/drive/) | 처리 | 쓰인 조각 |", "|---|---|---|---|"]
used = {}
for p in A["pieces"]:
    for m in p.get("media", []):
        used.setdefault(m["src"].split("/")[-1], []).append(p["id"])
for name, info in sorted(log.items()):
    how = f"{info.get('excerpt', '')} 발췌, {info['note']}{', 소리 있음' if info.get('audio') else ', 소리 없음' if 'audio' in info else ''}" if name.endswith(".mp4") else info["note"]
    rows.append(f"| `media/{name}` | `{info['src'].replace('refs/drive/', '')}` | {how} | {', '.join(f'`{u}`' for u in used.get(name, [])) or '(쓰이지 않음)'} |")
out["media"] = "\n".join(rows) + "\n\n영상마다 같은 이름의 `.jpg` 포스터가 있습니다. 재인코딩한 영상의 40% 지점에서 뽑았습니다."

# gallery (사례관): every post, its group as given, its link and its local media
gtxt = (ARC / "js/gallery-data.js").read_text(encoding="utf-8")
G = json.loads(gtxt.split("window.AR.gallery = ", 1)[1].rstrip().rstrip(";"))
FN = {f["key"]: f["name"] for f in G["families"]}
SEC = {"showcase": "쇼케이스", "office": "오피스", "blender": "Blender"}
FN["office-web"] = "웹 오피스"
rows = ["| 구역 | 묶음 | 출처의 묶음 이름 / 모델 | 상태 | 게시물 | 링크 | 미디어 (media/usecases/) | 고른 이유 |", "|---|---|---|---|---|---|---|---|"]
def order(i): return (list(SEC).index(i["category"]), i.get("rank") or 99, 1 if i.get("computerUse") else 0, list(FN).index(i["family"]), i["group"], -(i["likes"] or 0))
for it in sorted(G["items"], key=order):
    med = ", ".join(("`" + pathlib.Path(m.get("src") or m.get("poster") or "").name + "`" if (m.get("src") or m.get("poster")) else "원격 영상, 포스터 없음") + (" (원격 영상의 포스터)" if m["type"] == "remote" else " (앞 2분 발췌)" if m.get("excerpt") else "") for m in it["media"])
    stt = "● 확인됨 (공식 출처)" if it.get("verified") else "○ 미확인"
    fam = ("컴퓨터 사용 데모" if it.get("computerUse") else FN[it["family"]]) + (f" {it['rank']}위" if it.get("rank") else "")
    who = f"{it['name']} ({it['author']})" if it["origin"] == "web" else f"@{it['author']}"
    rows.append(f"| {SEC[it['category']]} | {fam} | {cell(it['group'])} | {stt} | {cell(who)} `{it['key']}` | [{it['linkKind']}]({it['url']}) | {med or '없음 (링크만)'} | {cell(it['reason'])} |")
out["gallery"] = f"고른 사례 {len(G['items'])}건.\n\n" + "\n".join(rows)

readme = (ARC / "README.md").read_text(encoding="utf-8")
for k, v in out.items():
    readme, n = re.subn(rf"(<!-- gen:{k} -->\n).*?(<!-- /gen:{k} -->)", lambda m: m.group(1) + v + "\n" + m.group(2), readme, flags=re.S)
    if n != 1: print(f"NOT_RUN table {k}: README has no gen:{k} block")
(ARC / "README.md").write_text(readme, encoding="utf-8")
print("README tables regenerated")
