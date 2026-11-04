"""Shared helpers for the browser tests (tools/test_*.py). Desktop only (1440×900, 1920×1080), per the v6 brief.
serve(): archive/ on a free local port. launch(): Chrome via Playwright. Chrome is started with SwiftShader WebGL so the
ambient field (js/field.js) renders headless without the GPU driver's "ReadPixels" performance warnings.
Every page records console errors and warnings, page errors and failed requests in page.errs."""
import contextlib, functools, http.server, pathlib, socketserver, threading
from playwright.sync_api import sync_playwright

ARC = pathlib.Path(__file__).resolve().parent.parent
CHROME = "/usr/bin/google-chrome"
FLAGS = ["--no-sandbox", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"]

@contextlib.contextmanager
def serve():
    class Quiet(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a): pass
    class Server(socketserver.ThreadingTCPServer):
        daemon_threads = True
        def handle_error(self, request, client_address): pass  # a browser that drops a request mid-file is not a failure
    with Server(("127.0.0.1", 0), functools.partial(Quiet, directory=str(ARC))) as httpd:
        threading.Thread(target=httpd.serve_forever, daemon=True).start()
        try: yield f"http://127.0.0.1:{httpd.server_address[1]}/"
        finally: httpd.shutdown()

@contextlib.contextmanager
def browser():
    with sync_playwright() as p:
        b = p.chromium.launch(executable_path=CHROME, args=FLAGS)
        try: yield b
        finally: b.close()

def page(b, url, w=1440, h=900, motion="no-preference", wait=4800, block_external=True):
    ctx = b.new_context(viewport={"width": w, "height": h}, reduced_motion=motion)
    pg = ctx.new_page(); pg.errs = []
    if block_external:  # the tests never reach the network (YouTube, X); local files only
        pg.route("**/*", lambda r: r.continue_() if r.request.url.startswith(url) or r.request.url.startswith("data:") else r.abort())
    pg.on("console", lambda m: pg.errs.append(f"console.{m.type}: {m.text}") if m.type in ("error", "warning") else None)
    pg.on("pageerror", lambda e: pg.errs.append(f"pageerror: {e}"))
    pg.on("response", lambda r: pg.errs.append(f"http {r.status}: {r.url}") if r.status >= 400 else None)
    pg.goto(url); pg.wait_for_timeout(wait)
    return pg

# settle(): wait until frames flow again (400 ms with no frame gap over 100 ms), at most `ms`. Headless Chrome draws with a
# software GPU (SwiftShader), where repainting the whole floor after a full-screen dialog closes can take seconds;
# fixed timeouts would then test the renderer's speed instead of the page's behaviour.
SETTLE = """(ms) => new Promise(res => { const t0 = performance.now(); let last = t0, calm = 0;
  const f = (t) => { calm = t - last < 100 ? calm + (t - last) : 0; last = t; if (calm >= 400 || t - t0 > ms) res(Math.round(t - t0)); else requestAnimationFrame(f); };
  requestAnimationFrame(f); })"""
def settle(pg, ms=8000): return pg.evaluate(SETTLE, ms)

class Results:
    def __init__(self): self.rows = []
    def ok(self, name, cond, detail=""):
        self.rows.append(("PASS" if cond else "FAIL") + f"  {name}" + (f"  ({detail})" if detail and not cond else ""))
    def report(self):
        print("\n".join(self.rows)); n = sum(r.startswith("PASS") for r in self.rows)
        print(f"{n} / {len(self.rows)}"); return n == len(self.rows)
