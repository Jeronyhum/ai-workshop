"""Part 2 explainers (v4): steps on the floor and in rooms, motion on and reduced. Run from archive/:  python3 tools/test_explainers.py"""
import sys
from _testkit import serve, browser, page, settle, Results

X = ["paradigm", "context", "harness", "loop", "graph"]
R = Results()
with serve() as url, browser() as b:
    for mode in ("no-preference", "reduce"):
        pg = page(b, url, motion=mode); ev = pg.evaluate; tag = f"[{mode}]"
        steps = ev("Object.fromEntries([...document.querySelectorAll('.pc figure.xs')].map(f=>[f.dataset.x,+f.dataset.step]))")
        want = {k: v["floor"] for k, v in ev("AR.explain").items()}
        if mode == "reduce": R.ok(f"{tag} every floor figure rests on its last frame", steps == want, str(steps))
        R.ok(f"{tag} five explainers on the floor", sorted(steps) == sorted(X))
        R.ok(f"{tag} delivered images registered inside the SVGs", ev("[...document.querySelectorAll('.pc image.xs-img')].map(i=>i.dataset.slot).sort().join()") == "dots2-graph-constellation,dots2-harness-frame,muse2-context-aperture,muse2-core-seed,muse2-loop-orbit")
        pg.keyboard.press("Digit2"); pg.wait_for_timeout(600)
        s0 = ev("+document.querySelector('#pc-paradigm figure.xs').dataset.step")
        if mode == "no-preference":
            R.ok(f"{tag} 2 starts the nest from step 1", s0 <= 2, f"step {s0}")
            pg.wait_for_timeout(9500)
            R.ok(f"{tag} the nest builds to its last frame", ev("+document.querySelector('#pc-paradigm figure.xs').dataset.step") == 6)
            # v6: the zone view draws the figure too small for its runner (runners play only above 220 px); the piece view does not
            ev("ARchive.setCurrent('paradigm',{glide:false})"); settle(pg); pg.wait_for_timeout(300)
            a = ev("document.querySelector('#pc-paradigm .run').getAttribute('cx')"); pg.wait_for_timeout(500)
            R.ok(f"{tag} its runner moves at piece level", a != ev("document.querySelector('#pc-paradigm .run').getAttribute('cx')"))
        else:
            R.ok(f"{tag} the nest shows its last frame at once", s0 == 6, f"step {s0}")
            R.ok(f"{tag} nothing plays", ev("document.querySelectorAll('.xs.play').length") == 0)
        ev("ARchive.setCurrent('harness',{glide:false})"); pg.wait_for_timeout(300)
        pg.keyboard.press("Period"); pg.wait_for_timeout(200); s1 = ev("+document.querySelector('#pc-harness figure.xs').dataset.step")
        pg.keyboard.press("Comma"); pg.wait_for_timeout(200); s2 = ev("+document.querySelector('#pc-harness figure.xs').dataset.step")
        R.ok(f"{tag} . and , step the current floor figure", s2 == s1 - 1, f"{s1} then {s2}")
        for pid in X:
            ev(f"ARchive.openRoom('{pid}')"); pg.wait_for_timeout(300); settle(pg)
            n = ev("document.querySelectorAll('#room #room-title').length"); s = ev("+document.querySelector('#room .xr figure.xs').dataset.step")
            pg.keyboard.press("Period"); pg.wait_for_timeout(900); s2 = ev("+document.querySelector('#room .xr figure.xs').dataset.step")
            last = ev(f"AR.explain['{pid}'].steps.length")
            ev(f"document.querySelector('#room .xr-card[data-k=\"{last}\"]').scrollIntoView({{block:'center'}})"); pg.wait_for_timeout(300); settle(pg)
            s3 = ev("+document.querySelector('#room .xr figure.xs').dataset.step")
            R.ok(f"{tag} room {pid}: title, step 1, . to 2, scroll to last", n == 1 and s == 1 and s2 == 2 and s3 == last, f"{n} {s} {s2} {s3}/{last}")
            pg.keyboard.press("Escape"); pg.wait_for_timeout(300); settle(pg)
        R.ok(f"{tag} no horizontal overflow", ev("document.documentElement.scrollWidth<=document.documentElement.clientWidth"))
        R.ok(f"{tag} no console errors or warnings, no failed requests", not pg.errs, "; ".join(pg.errs[:3]))
        pg.context.close()
sys.exit(0 if R.report() else 1)
