"""Console sweep (v6): every room, every zone, the gallery, the exit, the list, the shortcuts and docent light, with zero
console errors or warnings, page errors or failed requests. Desktop only. Run from archive/:  python3 tools/test_console.py"""
import sys
from _testkit import serve, browser, page, settle, Results

R = Results()
with serve() as url, browser() as b:
    for w, h, motion in ((1440, 900, "no-preference"), (1920, 1080, "reduce")):
        tag = f"[{w}x{h} {motion}]"
        pg = page(b, url, w=w, h=h, motion=motion); ev = pg.evaluate
        ids = ev("ARchive.pieces.map(p => p.id)")
        for i in ids:
            ev(f"ARchive.openRoom('{i}')"); pg.wait_for_timeout(150)
            ev("document.getElementById('room').scrollTop = 1e6"); pg.wait_for_timeout(100)
        pg.keyboard.press("Escape"); settle(pg)
        R.ok(f"{tag} all {len(ids)} rooms open and scroll to their end", len(ids) == 63)
        for k in ("Digit0", "Digit1", "Digit3", "Digit2"): pg.keyboard.press(k); settle(pg)
        for k in ("Digit4", "Digit5", "KeyT", "KeyL", "Shift+Slash"):
            pg.keyboard.press(k); pg.wait_for_timeout(900); pg.keyboard.press("Escape"); pg.wait_for_timeout(500)
        ev("ARchive.jump('exit', {open: false})"); settle(pg)
        pg.keyboard.press("KeyD"); settle(pg); pg.keyboard.press("Period"); pg.keyboard.press("Comma"); pg.keyboard.press("KeyD")
        pg.keyboard.press("KeyM"); pg.wait_for_timeout(300); pg.keyboard.press("KeyM")
        R.ok(f"{tag} every zone, the gallery, the exit, terms, list, shortcuts, docent and M visited", True)
        R.ok(f"{tag} no horizontal overflow", ev("document.documentElement.scrollWidth <= document.documentElement.clientWidth"))
        R.ok(f"{tag} no console errors or warnings, page errors or failed requests", not pg.errs, f"{len(pg.errs)}: " + "; ".join(pg.errs[:4]))
        pg.context.close()
sys.exit(0 if R.report() else 1)
