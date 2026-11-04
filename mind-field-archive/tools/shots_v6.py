"""v6 desktop screenshots (1440×900) to shots/v6-*.png. Run from archive/:  python3 tools/shots_v6.py [name ...]
With names, only those shots are taken (e.g. `python3 tools/shots_v6.py gallery exit-terms`)."""
import sys
from _testkit import ARC, serve, browser, page, settle

def shot(pg, name):
    settle(pg); pg.wait_for_timeout(400)
    pg.screenshot(path=str(ARC / f"shots/v6-{name}.png")); print("shots/v6-" + name + ".png")

def entrance(pg): pass                                              # the first screen: whole floor, entry card with the exit hint
def floor(pg): pg.keyboard.press("Digit1"); settle(pg); pg.keyboard.press("Digit0")
def part1(pg): pg.keyboard.press("Digit1"); settle(pg); pg.evaluate("ARchive.fit({x: AR.zones.p1.open, y: 0, w: AR.zones.p1.w - AR.zones.p1.open, h: 2250}, false, 1, 0.02)")  # the evidence after the story
def intro(pg): pg.keyboard.press("Digit1")                         # v6: Part 1 opens on the talk
def metaphor(pid): return lambda pg: pg.evaluate(f"ARchive.setCurrent('{pid}', {{glide: false}})")
def part2_step(pg):
    pg.evaluate("ARchive.setCurrent('harness',{glide:false})"); settle(pg)
    for _ in range(3): pg.keyboard.press("Period"); pg.wait_for_timeout(500)
def gallery(pg): pg.keyboard.press("Digit4"); pg.wait_for_timeout(1500)
def gallery_singles(pg): gallery(pg); pg.evaluate("document.querySelector('#gallery [data-fam=\"more\"]').scrollIntoView({block:'start'})")
def docent(pg): pg.evaluate("ARchive.setCurrent('accounting',{glide:false})"); settle(pg); pg.keyboard.press("KeyD")
def room(pg): pg.evaluate("ARchive.openRoom('context')"); pg.wait_for_timeout(1200)
def exit_zone(pg): pg.evaluate("ARchive.jump('exit',{open:false})")
def exit_terms(pg): pg.evaluate("ARE.open('terms')"); pg.wait_for_timeout(900)
def exit_opencode(pg): pg.evaluate("ARE.open('setup')"); pg.wait_for_timeout(900)
def popover(pg):
    pg.evaluate("ARchive.openRoom('harness')"); pg.wait_for_timeout(1200); settle(pg)
    t = pg.locator("#room button.term").first; t.scroll_into_view_if_needed(); settle(pg); t.focus(); pg.wait_for_timeout(500)
def reduced(pg): pg.keyboard.press("Digit2")

SHOTS = {"entrance": (entrance, "no-preference"), "floor": (floor, "no-preference"), "part1": (part1, "no-preference"),
         "part2-step": (part2_step, "no-preference"), "gallery": (gallery, "no-preference"), "gallery-singles": (gallery_singles, "no-preference"), "docent": (docent, "no-preference"),
         "room": (room, "no-preference"), "exit-zone": (exit_zone, "no-preference"), "exit-terms": (exit_terms, "no-preference"),
         "exit-opencode": (exit_opencode, "no-preference"), "popover": (popover, "no-preference"), "reduced-motion": (reduced, "reduce"),
         "intro": (intro, "no-preference"), "metaphor-tide": (metaphor("s-tide"), "no-preference"), "metaphor-harness": (metaphor("s-harness"), "no-preference"),
         "metaphor-anatomy": (metaphor("s-anatomy"), "no-preference"), "metaphor-guardrail": (metaphor("s-guard"), "no-preference")}
want = sys.argv[1:] or list(SHOTS)
errs = []
with serve() as url, browser() as b:
    for name in want:
        fn, motion = SHOTS[name]
        pg = page(b, url, motion=motion); fn(pg); shot(pg, name); errs += [f"{name}: {e}" for e in pg.errs]; pg.context.close()
print("console errors:", len(errs)); print("\n".join(errs[:10]))
