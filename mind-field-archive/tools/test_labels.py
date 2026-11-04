"""Part 2 overview: no two visible labels overlap. Run from archive/:  python3 tools/test_labels.py
Needs Playwright for Python and Chrome (/usr/bin/google-chrome). Serves archive/ on a free local port, presses 2 (the Part 2
overview) at 1440×900 and 1920×1080 (desktop only, per the v6 brief), with motion full and reduced, and measures every visible line of text on the floor:
each line box of each HTML text node (Range.getClientRects) and each SVG <text>. A label counts when it is rendered (not
display:none, not visibility:hidden, effective opacity above 0.15) and lies inside the floor's visible area. Two labels
overlap when their boxes share more than 2px in both directions. Fixed UI (top bar, HUD, map, zoom) is not a label of the
floor and is left out. Exits 1 and lists the pairs if any overlap."""
import functools, http.server, pathlib, socketserver, sys, threading
from playwright.sync_api import sync_playwright

ARC = pathlib.Path(__file__).resolve().parent.parent

MEASURE = r"""() => {
  const floor = document.getElementById('floor'), fr = floor.getBoundingClientRect();
  const opac = (el) => { let o = 1; for (let e = el; e && e !== document.documentElement; e = e.parentElement) { const s = getComputedStyle(e); if (s.display === 'none' || s.visibility === 'hidden') return 0; o *= +s.opacity; } return o; };
  const name = (el) => { const pc = el.closest('.pc'); return (pc ? pc.id : (el.closest('[class]') || el).className.baseVal ?? (el.closest('[class]') || el).className) + ' › ' + (el.textContent || '').trim().slice(0, 24); };
  const boxes = [];
  const add = (r, el, owner) => { if (r.width < 1 || r.height < 3) return; const x0 = Math.max(r.left, fr.left), x1 = Math.min(r.right, fr.right), y0 = Math.max(r.top, fr.top), y1 = Math.min(r.bottom, fr.bottom); if (x1 - x0 < 2 || y1 - y0 < 2) return; boxes.push({ x0, x1, y0, y1, owner, label: name(el) }); };
  const world = document.getElementById('world');
  const tw = document.createTreeWalker(world, NodeFilter.SHOW_TEXT);
  let n = 0;
  for (let t = tw.nextNode(); t; t = tw.nextNode()) {
    if (!t.textContent.trim()) continue;
    const el = t.parentElement;
    if (!el || el.closest('svg') || el.closest('.sr-only')) continue;
    if (opac(el) < 0.15) continue;
    const rg = document.createRange(); rg.selectNodeContents(t);
    for (const r of rg.getClientRects()) add(r, el, n);
    n++;
  }
  world.querySelectorAll('svg text').forEach((el) => { if (opac(el) >= 0.15 && el.textContent.trim()) add(el.getBoundingClientRect(), el, n++); });
  const hits = [];
  for (let i = 0; i < boxes.length; i++) for (let j = i + 1; j < boxes.length; j++) {
    const a = boxes[i], b = boxes[j];
    if (a.owner === b.owner) continue;
    const w = Math.min(a.x1, b.x1) - Math.max(a.x0, b.x0), h = Math.min(a.y1, b.y1) - Math.max(a.y0, b.y0);
    if (w > 2 && h > 2) hits.push(`${a.label}  ×  ${b.label}  (${w.toFixed(0)}×${h.toFixed(0)}px)`);
  }
  return { labels: boxes.length, hits };
}"""

def main():
    class Quiet(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a): pass
    handler = functools.partial(Quiet, directory=str(ARC))
    with socketserver.TCPServer(("127.0.0.1", 0), handler) as httpd:
        threading.Thread(target=httpd.serve_forever, daemon=True).start()
        url = f"http://127.0.0.1:{httpd.server_address[1]}/"
        fails = 0
        with sync_playwright() as p:
            b = p.chromium.launch(executable_path="/usr/bin/google-chrome", args=["--no-sandbox", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"])
            for w, h in ((1440, 900), (1920, 1080)):
                for motion in ("no-preference", "reduce"):
                    pg = b.new_context(viewport={"width": w, "height": h}, reduced_motion=motion).new_page()
                    pg.goto(url); pg.wait_for_timeout(4800)
                    pg.keyboard.press("Digit2"); pg.wait_for_timeout(1800 if motion == "reduce" else 9000)
                    r = pg.evaluate(MEASURE)
                    ok = not r["hits"]; fails += not ok
                    print(f"{'PASS' if ok else 'FAIL'}  Part 2 overview {w}x{h} motion {motion}: {r['labels']} label boxes, {len(r['hits'])} overlaps")
                    for hit in r["hits"][:40]: print("      " + hit)
                    pg.context.close()
            b.close()
        httpd.shutdown()
    sys.exit(1 if fails else 0)

if __name__ == "__main__":
    main()
