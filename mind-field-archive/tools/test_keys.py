"""Keyboard walk (docent keys). Run from archive/:  python3 tools/test_keys.py   (desktop 1440×900)"""
import sys
from _testkit import serve, browser, page, Results

R = Results()
with serve() as url, browser() as b:
    pg = page(b, url)
    act = lambda: pg.evaluate("(()=>{const a=document.activeElement;return {cls:String(a.className), pid:a.dataset?a.dataset.id:null}})()")
    n = 0
    while n < 24:
        pg.keyboard.press("Tab"); n += 1
        if "pc" in (act()["cls"] or "").split(): break
    start = pg.evaluate("AR.zones.p1.anchor")  # v6 (전사본): the floor starts on the first piece of 민성's story
    R.ok("Tab from page start reaches the floor at the story's first piece", act()["pid"] == start == "s-vibe", f"{n} presses, on {act()['pid']}")
    near = pg.evaluate(f"ARchive.near('{start}').map(n=>n.id)")
    pg.keyboard.press("Tab"); pg.wait_for_timeout(400); first = act()["pid"]
    R.ok("Tab on the floor walks to a threaded neighbour", first in near, first)
    pg.keyboard.press("Tab"); pg.wait_for_timeout(400); a2 = act()["pid"]
    R.ok("Tab again keeps walking", a2 != start and a2 in pg.evaluate(f"ARchive.near('{first}').map(n=>n.id)"), a2)
    pg.keyboard.press("Shift+Tab"); pg.wait_for_timeout(400); R.ok("Shift+Tab steps back", act()["pid"] == first)
    x0 = pg.evaluate(f"ARchive.byId.get('{first}').x"); pg.keyboard.press("ArrowRight"); pg.wait_for_timeout(400); cur = act()["pid"]
    R.ok("ArrowRight moves to a piece further right", pg.evaluate(f"ARchive.byId.get('{cur}').x") > x0, cur)
    pg.keyboard.press("Enter"); pg.wait_for_timeout(1000)
    R.ok("Enter opens the room", pg.evaluate("room.open && room.dataset.id") == cur)
    R.ok("focus moves into the room", pg.evaluate("room.contains(document.activeElement)"))
    pg.keyboard.press("ArrowRight"); pg.wait_for_timeout(900); r2 = pg.evaluate("room.dataset.id")
    R.ok("ArrowRight in a room walks to a neighbour room", r2 in pg.evaluate(f"ARchive.near('{cur}').map(n=>n.id)"), f"{cur} -> {r2}")
    pg.keyboard.press("ArrowLeft"); pg.wait_for_timeout(900); R.ok("ArrowLeft in a room returns", pg.evaluate("room.dataset.id") == cur)
    pg.keyboard.press("Escape"); pg.wait_for_timeout(700)
    R.ok("Esc closes the room and keeps the piece", not pg.evaluate("room.open") and act()["pid"] == cur, act()["pid"])
    for _ in range(3): pg.keyboard.press("Escape"); pg.wait_for_timeout(900)
    R.ok("Esc ladder ends at the top bar", pg.evaluate("document.activeElement.closest('.topbar')!==null"))
    for k, want in (("Digit2", "paradigm"), ("Digit1", "s-vibe"), ("Digit3", "bridgeA")):
        pg.keyboard.press(k); pg.wait_for_timeout(1000)
        R.ok(f"{k} jumps to its anchor", pg.evaluate("document.querySelector('.pc[aria-current]').dataset.id") == want)
    pg.keyboard.press("KeyD"); pg.wait_for_timeout(900)
    lit = pg.evaluate("document.querySelectorAll('.pc[data-lit]').length")
    R.ok("D turns on the docent spotlight", pg.evaluate("document.body.classList.contains('is-docent')"))
    R.ok("the spotlight lights the current piece's threads", pg.evaluate("document.querySelectorAll('.th.hot').length") == lit - 1)
    pg.keyboard.press("KeyD"); pg.wait_for_timeout(300); R.ok("D again turns it off", not pg.evaluate("document.body.classList.contains('is-docent')"))
    pg.keyboard.press("Digit0"); pg.wait_for_timeout(1000); R.ok("0 shows the whole floor", pg.evaluate("ARchive.cam.z") < 0.2)
    pg.keyboard.press("KeyL"); pg.wait_for_timeout(400); R.ok("L opens the list", pg.evaluate("document.getElementById('index').open"))
    pg.keyboard.press("Escape"); pg.wait_for_timeout(300); R.ok("Esc closes the list", not pg.evaluate("document.getElementById('index').open"))
    pg.keyboard.press("Shift+Slash"); pg.wait_for_timeout(300); R.ok("? opens the shortcut dialog", pg.evaluate("document.getElementById('keys').open"))
    R.ok("the shortcut dialog fits the screen with its title", pg.evaluate("(()=>{const k=document.getElementById('keys'),h=k.querySelector('h2').getBoundingClientRect();return h.top>=0&&k.getBoundingClientRect().bottom<=innerHeight})()"))
    pg.keyboard.press("Escape"); pg.wait_for_timeout(300)
    pg.keyboard.press("KeyM"); pg.wait_for_timeout(200); R.ok("M switches motion to reduced", pg.evaluate("document.documentElement.dataset.motion") == "reduced")
    R.ok("no console errors or warnings, no failed requests", not pg.errs, "; ".join(pg.errs[:3]))
sys.exit(0 if R.report() else 1)
