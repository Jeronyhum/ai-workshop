"""v6 fixes, the exit zone and the term popovers. Run from archive/:  python3 tools/test_v6.py   (desktop 1440×900)
Each check names the review item it answers (blind = blind-review.md, persona = persona-synthesis.md, muse/dots = their reviews)."""
import json, pathlib, shutil, subprocess, sys, tempfile
from _testkit import serve, browser, page, settle, Results, ARC

R = Results()
LEGIBLE = 9  # px: smallest rendered font size allowed for visible floor text at a default framing (blind P1 #2)

TEXT_SIZES = r"""() => {
  const floor = document.getElementById('floor'), fr = floor.getBoundingClientRect(), z = ARchive.cam.z;
  const vis = (el) => { for (let e = el; e && e !== document.body; e = e.parentElement) { const s = getComputedStyle(e); if (s.display === 'none' || s.visibility === 'hidden' || +s.opacity < 0.15) return false; } return true; };
  const small = [];
  const tw = document.createTreeWalker(document.getElementById('world'), NodeFilter.SHOW_TEXT);
  for (let t = tw.nextNode(); t; t = tw.nextNode()) {
    if (!t.textContent.trim()) continue;
    const el = t.parentElement; if (!el || el.closest('.sr-only') || !vis(el)) continue;
    const rg = document.createRange(); rg.selectNodeContents(t); const r = rg.getBoundingClientRect();
    if (r.right < fr.left || r.left > fr.right || r.bottom < fr.top + 56 || r.top > fr.bottom || r.width < 1) continue;
    let px;
    if (el.closest('svg')) { const svg = el.closest('svg'), m = svg.getScreenCTM(); px = parseFloat(getComputedStyle(el).fontSize) * (m ? Math.hypot(m.a, m.b) : 1); }
    else px = parseFloat(getComputedStyle(el).fontSize) * z * (el.closest('.thl') ? 1 / z : 1);
    if (px < %d) small.push(`${(el.closest('.pc') || el.closest('[class]')).id || el.closest('[class]').className.baseVal || el.closest('[class]').className} › ${t.textContent.trim().slice(0, 18)} (${px.toFixed(1)}px)`);
  }
  return small;
}""" % LEGIBLE

with serve() as url, browser() as b:
    pg = page(b, url, motion="reduce"); ev = pg.evaluate

    # ── cold start (muse #5, blind P1 #10, persona P0) ──
    R.ok("cold start: the entrance card shows on load", ev("getComputedStyle(document.getElementById('entry')).display") != "none")
    R.ok("cold start: it points to the exit", "출구" in ev("document.getElementById('entry').textContent") and ev("!!document.querySelector('[data-intro=exit]')"))
    R.ok("cold start: the HUD is not shown empty", ev("getComputedStyle(document.getElementById('hud')).display") == "none")

    # ── 사례관 and key 4 open the gallery (persona P0, checked) ──
    pg.keyboard.press("Digit4"); pg.wait_for_timeout(900)
    R.ok("key 4 opens the gallery", ev("ARG.isOpen"))
    pg.keyboard.press("Escape"); pg.wait_for_timeout(500)
    pg.click(".bar-zones button[data-jump=gal]"); pg.wait_for_timeout(900)
    R.ok("the top-bar 사례관 button opens the gallery", ev("ARG.isOpen"))
    # ── M reaches the gallery and other dialogs (dots #4, #5) ──
    before = ev("document.documentElement.dataset.motion")
    pg.keyboard.press("KeyM"); pg.wait_for_timeout(200)
    R.ok("M toggles motion inside the gallery", ev("document.documentElement.dataset.motion") != before)
    pg.keyboard.press("KeyM"); pg.wait_for_timeout(200)
    # ── Esc in the gallery cleans up media (dots #1) ──
    ev("document.querySelector('#gallery .gl-play').click()"); pg.wait_for_timeout(500)
    ev("document.querySelector('#gallery .gl-yt') && document.querySelector('#gallery .gl-yt').click()"); pg.wait_for_timeout(300)
    had = ev("({v: document.querySelectorAll('#gallery video').length, f: document.querySelectorAll('#gallery iframe').length})")
    ev("document.querySelector('#gallery .gl-x').focus()")  # a key pressed inside the YouTube frame goes to YouTube, not to this page
    pg.keyboard.press("Escape"); pg.wait_for_timeout(500)
    left = ev("({open: ARG.isOpen, playing: [...document.querySelectorAll('#gallery video')].filter(v => !v.paused).length, src: [...document.querySelectorAll('#gallery video')].filter(v => v.getAttribute('src')).length, f: document.querySelectorAll('#gallery iframe').length})")
    R.ok("Esc closes the gallery and stops its media", had["v"] >= 1 and had["f"] >= 1 and not left["open"] and left["playing"] == 0 and left["src"] == 0 and left["f"] == 0, f"{had} → {left}")

    # ── 출구 (exit zone) ──
    pg.keyboard.press("Digit5"); pg.wait_for_timeout(900)
    R.ok("exit: key 5 opens the exit", ev("ARE.isOpen"))
    R.ok("exit: five starting paths", ev("document.querySelectorAll('#exit .ex-card').length") == 5)
    ev("document.querySelector('#exit .ex-card[data-path=folio]').click()"); pg.wait_for_timeout(300)
    R.ok("exit: choosing a path shows its words and steps", ev("!document.getElementById('ex-panel-folio').hidden && document.getElementById('ex-panel-club').hidden && document.querySelectorAll('#ex-panel-folio .term.chip').length >= 4 && document.querySelectorAll('#ex-panel-folio .ex-steps li').length >= 4"))
    core = ev("AR.glossary.filter(g => g.core).length")
    R.ok("exit: the terms section draws every core word from the shared glossary", ev("document.querySelectorAll('#ex-terms .ex-term').length") == core and core >= 15, str(core))
    need = ["프롬프트", "컨텍스트", "에이전트", "하네스", "루프", "리포지토리", "터미널", "API 키", "배포", "MCP", "스펙"]
    txt = ev("document.getElementById('ex-terms').textContent")
    R.ok("exit: the terms the brief lists are all explained", all(n in txt for n in need), str([n for n in need if n not in txt]))
    R.ok("exit: the installer's six steps and the six-step AGENTS.md loop", ev("document.querySelectorAll('#ex-setup .ex-six li').length") == 6 and ev("document.querySelectorAll('#ex-flow .ex-flow-list li').length") == 6)
    flow = ev("[...document.querySelectorAll('#ex-flow .ex-flow-list b')].map(b => b.firstChild.textContent.trim())")
    R.ok("exit: the loop runs 의도 → 명세 → 지도 → 정밀 작업 → 규율 → 검증", flow == ["의도", "명세", "지도", "정밀 작업", "규율", "검증"], str(flow))
    hrefs = ev("[...document.querySelectorAll('#exit a')].map(a => a.getAttribute('href'))")
    R.ok("exit: relative links into build/ and the GitHub URL", "../build/ssu-opencode-setup.cmd" in hrefs and "../build/payload/AGENTS.md" in hrefs and "https://github.com/Jeronyhum/ai-workshop/tree/main/build" in hrefs)
    R.ok("exit: no key or token in the page", not ev(r"/sk-[A-Za-z0-9]{8,}|ghp_[A-Za-z0-9]{8,}/.test(document.getElementById('exit').innerHTML)"))
    pg.keyboard.press("KeyM"); pg.wait_for_timeout(200); R.ok("M toggles motion inside the exit", ev("document.documentElement.dataset.motion") == "full"); pg.keyboard.press("KeyM")
    pg.keyboard.press("Escape"); pg.wait_for_timeout(500)
    ev("ARchive.jump('exit', {open: false})"); pg.wait_for_timeout(700)
    R.ok("exit: the floor wall is in view at the end of the exhibition", ev("(() => { const r = document.querySelector('.exit-wall .ex-q').getBoundingClientRect(); return r.top > 56 && r.bottom < innerHeight && r.left >= 0 && r.right <= innerWidth; })()"))
    pg.click(".exit-wall .ex-path[data-exit=path-auto]", force=True); pg.wait_for_timeout(700)
    R.ok("exit: a path on the floor opens the exit at that path", ev("ARE.isOpen && document.querySelector('#exit .ex-card[data-path=auto]').getAttribute('aria-pressed') === 'true'"))
    pg.keyboard.press("Escape"); pg.wait_for_timeout(500)

    # ── term popovers ──
    ev("ARchive.openRoom('harness')"); pg.wait_for_timeout(900)
    t = ev("(() => { const b = document.querySelector('#room button.term'); b.focus(); return {id: b.dataset.term, desc: b.getAttribute('aria-describedby')}; })()"); pg.wait_for_timeout(250)
    tip = ev("({open: document.getElementById('term-tip').matches(':popover-open'), role: document.getElementById('term-tip').getAttribute('role'), text: document.getElementById('term-tip').textContent})")
    plain = ev(f"AR.glossary.find(g => g.id === '{t['id']}').plain")
    R.ok("popover: keyboard focus on a word shows its plain definition", tip["open"] and plain in tip["text"] and tip["role"] == "tooltip" and t["desc"] == "term-tip", str(t))
    R.ok("popover: it shows over the open room (top layer, in the viewport)", ev("(() => { const t = document.getElementById('term-tip'), r = t.getBoundingClientRect(); return t.matches(':popover-open') && t.checkVisibility() && r.top >= 0 && r.bottom <= innerHeight && r.width > 120; })()"))
    pg.keyboard.press("Escape"); pg.wait_for_timeout(300)
    R.ok("popover: Esc closes the definition and only the definition", not ev("document.getElementById('term-tip').matches(':popover-open')") and ev("room.open"))
    ev("document.activeElement.blur()")
    pg.hover("#room .term >> nth=1"); pg.wait_for_timeout(300)
    R.ok("popover: hover shows it too", ev("document.getElementById('term-tip').matches(':popover-open')"))
    pg.mouse.move(5, 880); pg.wait_for_timeout(400)
    R.ok("popover: moving away hides it", not ev("document.getElementById('term-tip').matches(':popover-open')"))
    R.ok("popover: words in a room come from the one glossary", ev("[...document.querySelectorAll('#room .term')].every(b => AR.glossary.some(g => g.id === b.dataset.term))"))
    pg.keyboard.press("Escape"); pg.wait_for_timeout(500)
    R.ok("popover: floor words never take focus (docent keys stay free)", ev("document.querySelectorAll('#world .term').length > 0 && [...document.querySelectorAll('#world .term')].every(t => t.tagName === 'SPAN' && t.tabIndex < 0)"))
    pg.keyboard.press("Digit2"); pg.wait_for_timeout(700)
    pg.hover("#world .pc[data-zone=p2] .term >> nth=0"); pg.wait_for_timeout(300)
    R.ok("popover: hovering a floor word shows its definition", ev("document.getElementById('term-tip').matches(':popover-open')"))
    pg.mouse.move(700, 880); pg.wait_for_timeout(300)

    # ── 도슨트 click → Tab walks (persona P1, checked) ──
    pg.keyboard.press("Digit1"); pg.wait_for_timeout(700)
    cur = ev("ARchive.current")
    pg.click("#docent-btn"); pg.wait_for_timeout(700)
    pg.keyboard.press("Tab"); pg.wait_for_timeout(500)
    R.ok("after clicking 도슨트, Tab walks to a neighbouring piece", ev("document.activeElement.classList.contains('pc')") and ev("ARchive.current") in ev(f"ARchive.near('{cur}').map(n => n.id)"), ev("ARchive.current"))
    # ── HUD never clips (muse #2) ──
    clipped = ev("ARchive.pieces.map(p => p.id).filter(id => { ARchive.setCurrent(id, {glide: false}); const h = document.getElementById('hud'); return h.scrollHeight > h.clientHeight + 1; })")
    R.ok(f"docent HUD shows every neighbour without clipping, for all {ev('ARchive.pieces.length')} pieces", not clipped, str(clipped[:5]))
    pg.click("#docent-btn"); pg.wait_for_timeout(500)

    # ── room after arrow browsing (blind P1 #5) and a close that stays in view (blind P1 #6) ──
    pg.keyboard.press("Digit1"); pg.wait_for_timeout(700)
    ev("document.getElementById('pc-accounting').focus()"); pg.keyboard.press("Enter"); pg.wait_for_timeout(900)
    for _ in range(3): pg.keyboard.press("ArrowRight"); pg.wait_for_timeout(700)
    last = ev("room.dataset.id")
    ev("room.scrollTop = room.scrollHeight"); pg.wait_for_timeout(300)
    R.ok("the room's way out stays in view at the bottom of a long room", ev("(() => { const r = document.querySelector('#room .room-x').getBoundingClientRect(); return r.top >= 0 && r.bottom <= innerHeight; })()"))
    pg.keyboard.press("Escape"); pg.wait_for_timeout(600)
    R.ok("closing after arrow browsing keeps the last room's piece", ev("ARchive.current") == last and ev("document.activeElement.dataset.id") == last, f"{last} vs {ev('ARchive.current')}")
    R.ok("the room is not closed by a click on its scrollbar edge", "e.target === room" not in (ARC / "js/app.js").read_text())

    # ── framed pieces stay clear of the chrome (blind P1 #3) ──
    bad = ev("""ARchive.pieces.map(p => p.id).filter(id => {
      ARchive.setCurrent(id, {glide: false});
      const r = document.getElementById('pc-' + id).getBoundingClientRect(), bar = document.querySelector('.topbar').getBoundingClientRect(), h = document.getElementById('hud').getBoundingClientRect();
      const hit = (a) => a.width && Math.min(r.right, a.right) - Math.max(r.left, a.left) > 2 && Math.min(r.bottom, a.bottom) - Math.max(r.top, a.top) > 2;
      return hit(bar) || hit(h) || r.right > innerWidth + 2 || r.bottom > innerHeight + 2;
    })""")
    R.ok(f"every framed piece is clear of the top bar and the HUD, for all {ev('ARchive.pieces.length')}", not bad, str(bad[:6]))

    # ── legibility at the default framings (blind P1 #2) ──
    for k, label in (("p1", "1부"), ("br", "다리"), ("p2", "2부"), ("gal", "사례관"), ("exit", "출구")):
        ev(f"ARchive.jump('{k}', {{open: false}})"); pg.wait_for_timeout(600)
        small = ev(TEXT_SIZES)
        R.ok(f"legible: no visible floor text under {LEGIBLE}px at the {label} framing", not small, f"{len(small)}: {small[:4]}")

    # ── internal paths are hidden from visitors (blind P1 #11, persona P1) ──
    ev("ARchive.openRoom('accounting')"); pg.wait_for_timeout(800)
    shown = ev("(() => { const out = []; const tw = document.createTreeWalker(document.getElementById('room-in'), NodeFilter.SHOW_TEXT); for (let t = tw.nextNode(); t; t = tw.nextNode()) { const e = t.parentElement; if (/refs\\/|\\.md\\b|:\\d{2,}|감사 B-/.test(t.textContent)) out.push(t.textContent.trim().slice(0, 40)); } return out; })()")
    R.ok("rooms show no file paths, line numbers or audit codes, open or folded", not shown, str(shown[:4]))
    R.ok("…and no '출처 상세' panel of research files: a room's sources are its public links", not ev("document.querySelector('#room details.rm-srcfull')") and ev("[...document.querySelectorAll('#room .rm-src h3')].map(h => h.textContent).includes('출처')"))
    pg.keyboard.press("Escape"); pg.wait_for_timeout(500)
    R.ok("the HUD and the list show no file names or research credits", not ev("/\\.md\\b|조사 ·|용어집|감수/.test(document.getElementById('hud').textContent + document.getElementById('index-list').textContent)"))
    # ── DCinside (muse #4, dots #2) ──
    for pid, post in (("kostat", "1509631"), ("bok", "1499916")):
        ev(f"ARchive.openRoom('{pid}')"); pg.wait_for_timeout(600)
        R.ok(f"{pid}: links its DCinside post", ev(f"!!document.querySelector('#room a[href*=\"thesingularity/{post}\"]')"))
        pg.keyboard.press("Escape"); pg.wait_for_timeout(400)
    ev("ARchive.openRoom('kostat')"); pg.wait_for_timeout(600)
    R.ok("kostat: the 'IMF' in the post title is called the poster's metaphor, not a comparison", "글쓴이의 비유" in ev("document.getElementById('room-in').textContent"))
    pg.keyboard.press("Escape"); pg.wait_for_timeout(400)
    R.ok("no console errors or warnings, no failed requests (session 1)", not pg.errs, "; ".join(pg.errs[:4]))
    pg.context.close()

    # ── first load (muse #3) ──
    pg = page(b, url, wait=0)
    sizes = []
    pg.on("response", lambda r: sizes.append((r.url, int(r.headers.get("content-length") or 0))))
    pg.reload(); pg.wait_for_timeout(5000)
    total = sum(s for _, s in sizes); ttf = [u for u, _ in sizes if u.endswith(".ttf")]
    R.ok(f"first load under 3 MB (was 6.25 MB): {total / 1e6:.2f} MB in {len(sizes)} requests", total < 3e6)
    R.ok("no unsubset TTF fonts on load", not ttf, str(ttf))
    full = [u for u, _ in sizes if "/lod/" not in u and ("/assets/" in u or "/media/" in u) and u.endswith(".jpg") and "/usecases/" not in u]
    R.ok("the overview loads small copies, not full images (muse2-context-aperture full file not loaded)", not any(u.endswith("/assets/muse2-context-aperture.jpg") for u in full) and len(full) <= 3, str(full[:5]))
    R.ok("no console errors or warnings, no failed requests (session 2)", not pg.errs, "; ".join(pg.errs[:4]))
    pg.context.close()

    # ── Dots browser review (627a0744): calmer entrance, quieter floor, gallery groups of one; perf of rooms ──
    pg = page(b, url); ev = pg.evaluate
    st = ev("""(() => { const f = document.getElementById('floor'), h = document.querySelector('.pc[data-hero]'), o = document.querySelector('.pc:not([data-hero])');
      return { first: f.classList.contains('is-first'), hero: h && h.dataset.id, ho: +getComputedStyle(h).opacity, oo: +getComputedStyle(o).opacity,
               tag: +getComputedStyle(document.querySelector('.hero-tag')).opacity, start: document.querySelector('[data-intro=p1]').textContent }; })()""")
    R.ok("entrance: one piece is lit and tagged, the rest wait at low light", st["first"] and st["hero"] == "s-vibe" and st["ho"] > .95 and st["oo"] < .5 and st["tag"] > .95, str(st))
    pg.keyboard.press("Digit1"); settle(pg)
    R.ok("entrance: the first move (이야기부터 보기 / 1) lifts the dimming and lands on the lit piece", not ev("document.getElementById('floor').classList.contains('is-first')") and ev("ARchive.current") == "s-vibe")
    R.ok("zone view: the map and zoom sit on a scrim, not on bare pieces", ev("getComputedStyle(document.getElementById('floor'), '::after').opacity") == "1")
    tex = ev("[+getComputedStyle(document.querySelector('.zone-p1 .zone-tex')).opacity, +getComputedStyle(document.querySelector('.zone-p2 .zone-tex.is-base')).opacity]")
    R.ok("floor textures sit back behind the diagrams (opacity at most .1)", all(t <= .1 for t in tex), str(tex))
    t0 = ev("document.querySelector('.world').style.transform"); ev("ARchive.openRoom('context')"); pg.wait_for_timeout(120)
    R.ok("a room opens without moving the camera behind it", ev("document.querySelector('.world').style.transform") == t0)
    settle(pg); pg.wait_for_timeout(1000)
    R.ok("…and the floor stops painting under the open room", ev("document.body.classList.contains('floor-off')"))
    pg.keyboard.press("Escape"); settle(pg)
    R.ok("closing it shows the floor framed on that piece", ev("(() => { const r = document.getElementById('pc-context').getBoundingClientRect(), b = ARchive.box(); const cx = r.left + r.width / 2, cy = r.top + r.height / 2; return cx > b.x && cx < b.x + b.w && cy > b.y && cy < b.y + b.h; })()"))
    R.ok("the world is not a promoted layer at rest (no will-change)", ev("getComputedStyle(document.querySelector('.world')).willChange") == "auto")
    pg.keyboard.press("Digit4"); pg.wait_for_timeout(1500)
    g = ev("""(() => { const G = document.getElementById('gallery');
      return { singles: [...G.querySelectorAll('#gl-showcase .gl-grid')].filter(o => o.children.length === 1).length,
               more: G.querySelectorAll('[data-fam=more] .gl-item').length, kicks: G.querySelectorAll('[data-fam=more] .gl-kick').length,
               solo: [...G.querySelectorAll('.gl-grid.is-solo')].map(o => o.children.length), segs: G.querySelectorAll('nav.gl-bar a.gl-seg').length,
               nav: G.querySelectorAll('.gl-nav').length }; })()""")
    R.ok("gallery: no showcase group of one stands alone in an empty row", g["singles"] == 0 and g["more"] >= 2 and g["kicks"] == g["more"], str(g))
    R.ok("gallery: a lone tile elsewhere spans its row (picture beside text)", all(n == 1 for n in g["solo"]), str(g["solo"]))
    R.ok("gallery: the share bar is the jump menu; the counts are not repeated", g["segs"] == 3 and g["nav"] == 0, str(g))
    pg.click("nav.gl-bar a[data-sec=office]"); pg.wait_for_timeout(600); settle(pg); pg.wait_for_timeout(600)
    j = ev("[document.getElementById('gl-office').getBoundingClientRect().top, document.querySelector('nav.gl-bar').getBoundingClientRect().bottom]")
    R.ok("gallery: a bar segment jumps to its section, heading clear of the sticky bar", j[1] - 2 <= j[0] < j[1] + 200, str(j))
    pg.keyboard.press("Escape"); pg.wait_for_timeout(400)
    R.ok("no console errors or warnings, no failed requests (session 3)", not pg.errs, "; ".join(pg.errs[:4]))
    pg.context.close()

# ── transcript addendum (민성 t1191u): his story opens Part 1, in block order, under the fact gate ──
BANNED = [r"Mythos|미토스|GLM[\s-]*5\.3", r"API\s*환산|1,?100\s*달러|등가\s*추산", r"GPT[\s-]?5[^.\n]{0,60}(IMO|금메달)|(IMO|금메달)[^.\n]{0,60}GPT[\s-]?5",
          r"IBK|7개\s*은행", r"(회계|CPA)[^\n]{0,40}\b33\s*%", r"(HLE|Humanity's Last Exam)[^\n]{0,80}\b(60|70)\s*(%|~)"]
with serve() as url, browser() as b:
    pg = page(b, url); ev = pg.evaluate
    order = ev("ARchive.pieces.filter(p => p.kind === 'story').map(p => +(p.src[0].s.match(/C-(\\d+)/) || [0, 0])[1])")
    R.ok("story: 15 pieces open Part 1 in 민성's block order (역사 → 에이전트의 등장 → 활용)", len(order) == 15 and order == sorted(order), str(order))
    acts = ev("[...document.querySelectorAll('.act b')].map(e => e.textContent)")
    R.ok("story: the three acts head the band in his order", acts == ["역사", "에이전트의 등장", "활용"], str(acts))
    xs = ev("ARchive.pieces.filter(p => p.kind === 'story').map(p => p.x)") ; ox = ev("Math.min(...ARchive.pieces.filter(p => p.kind !== 'story' && p.zone === 'p1').map(p => p.x - p.w / 2))")
    R.ok("story: the band stands before the rest of Part 1", max(xs) < ox, f"story right {max(xs)}, Part 1 left {ox}")
    met = ev("Object.fromEntries(['tide','harness','anatomy','guardrail'].map(m => [m, document.querySelectorAll('#world [data-metaphor=\"' + m + '\"]').length]))")
    R.ok("metaphors: 썰물, 하네스, 머리+손발, 가드레일 have exactly one picture each on the floor", met == {"tide": 1, "harness": 1, "anatomy": 1, "guardrail": 1}, str(met))
    R.ok("metaphors: no other picture claims a metaphor", ev("document.querySelectorAll('#world [data-metaphor]').length") == 4)
    R.ok("metaphors: each picture is a drawn image with a text alternative", ev("[...document.querySelectorAll('#world [data-metaphor] svg[role=img]')].every(s => s.getAttribute('aria-label').length > 30)") and ev("document.querySelectorAll('#world [data-metaphor] svg[role=img]').length") == 4)
    ev("ARchive.openRoom('s-harness')"); pg.wait_for_timeout(300); settle(pg)
    R.ok("metaphors: the room shows the same one picture, not a second one", ev("document.querySelectorAll('#room [data-metaphor=harness]').length") == 1 and ev("document.querySelectorAll('#room [data-metaphor]').length") == 1)
    pg.keyboard.press("Escape"); settle(pg)
    # verbatim: what the floor shows of his definition, harness and thesis is the source line (speech-recognition LMM read as LLM)
    import pathlib as _p
    src = (ARC / "materials/transcript/보완_전사본_근본내용_블록.md").read_text(encoding="utf-8").replace("LMM", "LLM")
    shown = ev("[document.querySelector('#pc-s-define .st-def').textContent, document.querySelector('#pc-s-harness .st-voice p').textContent, document.querySelector('#pc-s-intent .st-thesis').textContent]")
    R.ok("verbatim: C-09 definition, C-10 harness and C-20 thesis on the floor are his words exactly", all(t.strip("“”") in src for t in shown), str([t[:30] for t in shown]))
    # the fact gate in what a visitor can read (each text node on its own)
    texts = ev("(() => { const out = []; for (const root of [document.getElementById('world'), document.getElementById('index-list'), document.getElementById('entry')]) { const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT); for (let t = w.nextNode(); t; t = w.nextNode()) if (t.textContent.trim()) out.push(t.textContent); } return out; })()")
    import re as _re
    hits = [t[:60] for t in texts for rx in BANNED if _re.search(rx, t)]
    R.ok("fact gate: no banned claim anywhere on the floor, the list or the entrance", not hits, str(hits[:3]))
    floor_text = " ".join(texts)
    R.ok("fact gate: replaced values are the ones shown (2025.02.02, 2018, 2025.02.24 / 2025.05.22, BNK부산은행, 54.8%)", all(k in floor_text for k in ("2025.02.02", "2018", "2025.02.24", "2025.05.22", "54.8")) and "BNK부산은행" in ev("JSON.stringify(AR.pieces.find(p => p.id === 's-security'))"))
    deeper = ev("JSON.stringify(AR.pieces.find(p => p.id === 's-deeper').rows)")
    R.ok("fact gate: 수능 30번 is told reversed (GPT-4 failed, o1 프로 solved) and IMO gold is an experimental model", "GPT-4는 풀지 못했고" in deeper and "o1 프로" in deeper and "실험용 추론 모델" in deeper)
    R.ok("fact gate: accounting stays a condition pair (100% with 37% and 56.4%)", ev("(() => { const p = AR.pieces.find(p => p.id === 'accounting'); return p.pair.claim.v === '100' && /37%/.test(p.pair.claim.vs) && p.pair.counter.v === '56.4'; })()"))
    # glossary and exit ties
    ev("ARchive.openRoom('s-define')"); pg.wait_for_timeout(300); settle(pg)
    t = pg.locator("#room .st-voices button.term[data-term=agent]").first  # 에이전트 carries his definition (C-09)
    if t.count(): t.focus(); pg.wait_for_timeout(300)
    R.ok("glossary: 에이전트 in his story opens a popover that carries his own definition", t.count() > 0 and ev("document.getElementById('term-tip').matches(':popover-open') && /목적을 가지고 루프를/.test(document.querySelector('#term-tip .tip-v')?.textContent || '')"))
    pg.keyboard.press("Escape"); pg.keyboard.press("Escape"); settle(pg)
    ev("ARchive.openRoom('s-intent')"); pg.wait_for_timeout(300); settle(pg)
    pg.click("#room [data-exit=flow]"); pg.wait_for_timeout(900)
    R.ok("exit: the thesis room hands over to the exit's loop, which opens on his 의도 line", ev("ARE.isOpen") and "의도를 챙겨주는 것" in ev("document.querySelector('#exit .ex-why').textContent"))
    pg.keyboard.press("Escape"); pg.wait_for_timeout(400)
    R.ok("no console errors or warnings, no failed requests (session 4)", not pg.errs, "; ".join(pg.errs[:4]))
    pg.context.close()

# ── public text (민성 t1195u): no internal wording anywhere a visitor can reach, rendered ──
INTERNAL = r"민성|나레이션|전사본|소유자|transcript|사실\s?검증|fact[\s-]?gate|감수|감독관|감사\s?(?:[A-Z(]|범위|판정|이후)|(?<![\w-])[ABCEOU]-\d{1,2}(?![\w-])|\bMuse\b|\bDots\b|muse2?-|dots2?-|package_1105|refs/|archive/|materials/|\.md :|[12]부 조사|워크숍 조사 자료|이 아카이브의 기록|기획자의 원문|\bTODO\b"
GRAB = """(root) => { const out = []; const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  for (let t = w.nextNode(); t; t = w.nextNode()) { const p = t.parentElement; if (p && !p.closest('script,style') && t.textContent.trim()) out.push(t.textContent.trim()); }
  root.querySelectorAll('[aria-label],[alt],[title]').forEach(e => ['aria-label','alt','title'].forEach(a => e.getAttribute(a) && out.push(e.getAttribute(a)))); return out; }"""
with serve() as url, browser() as b:
    pg = page(b, url); ev = pg.evaluate
    ev("(() => { window.__grab = " + GRAB + "; })()")
    seen = set(ev("__grab(document.body)"))
    for pid in ev("ARchive.pieces.map(p => p.id)"):
        ev(f"ARchive.setCurrent('{pid}', {{glide: false}})"); seen.update(ev("__grab(document.getElementById('hud'))"))
        ev(f"ARchive.openRoom('{pid}')"); pg.wait_for_timeout(60); seen.update(ev("__grab(document.getElementById('room'))"))
    pg.keyboard.press("Escape"); settle(pg)
    ev("ARG.open()"); pg.wait_for_timeout(500); seen.update(ev("__grab(document.getElementById('gallery'))")); pg.keyboard.press("Escape"); pg.wait_for_timeout(300)
    for t in ("terms", "setup", "flow", "path-auto"):
        ev(f"ARE.open('{t}')"); pg.wait_for_timeout(250); seen.update(ev("__grab(document.getElementById('exit'))"))
    ev("ARE.close()"); ev("ARchive.openRoom('harness')"); pg.wait_for_timeout(300)
    for tid in ev("AR.glossary.map(g => g.id)"):
        ev(f"(() => {{ const b = document.createElement('button'); b.className = 'term'; b.dataset.term = '{tid}'; b.textContent = 'x'; document.querySelector('#room .rm-hero, #room .xr').append(b); b.focus(); }})()")
        pg.wait_for_timeout(40); seen.update(ev("__grab(document.getElementById('term-tip'))"))
    pg.keyboard.press("Escape"); seen.update(ev("__grab(document.getElementById('index'))")); seen.update(ev("__grab(document.getElementById('keys'))"))
    import re as _re
    bad = sorted({t[:70] for t in seen if _re.search(INTERNAL, t)})
    R.ok(f"public text: none of {len(seen)} rendered strings (floor, 63 rooms, HUD, gallery, exit, popovers, list) has internal wording", not bad, str(bad[:4]))
    R.ok("public text: quotes are attributed as part of the talk, not to a narrator", ev("[...document.querySelectorAll('#world .st-voice footer')].every(f => f.textContent === '워크숍 발표에서')") and ev("document.querySelectorAll('#world .st-voice footer').length") > 5)
    R.ok("no console errors or warnings, no failed requests (session 5)", not pg.errs, "; ".join(pg.errs[:4]))
    pg.context.close()

# ── check.py on a clean checkout (dots #3) ──
tmp = pathlib.Path(tempfile.mkdtemp())
dst = tmp / "repo/mind-field-archive"
shutil.copytree(ARC, dst, ignore=shutil.ignore_patterns("media", "shots", "fonts-src"))
(dst / "media").symlink_to(ARC / "media")
r = subprocess.run([sys.executable, "tools/check.py"], cwd=dst, capture_output=True, text=True)
R.ok("check.py on a clean checkout reports NOT_RUN and exits 0", r.returncode == 0 and "NOT_RUN" in r.stdout, r.stdout[-300:])
bad = tmp / "repo2/mind-field-archive"
shutil.copytree(ARC, bad, ignore=shutil.ignore_patterns("media", "shots", "fonts-src", "lod", "assets"))
(bad / "js/data.js").write_text((bad / "js/data.js").read_text(encoding="utf-8") + "\n/* GPT-5가 IMO 금메달 */\n", encoding="utf-8")
r2 = subprocess.run([sys.executable, "tools/check.py"], cwd=bad, capture_output=True, text=True)
R.ok("fact gate: putting \"GPT-5 IMO 금메달\" back makes check.py fail", r2.returncode == 1 and "fact gate: 'GPT-5 IMO gold'" in r2.stdout, r2.stdout[-200:])
pub = tmp / "repo3/mind-field-archive"
shutil.copytree(ARC, pub, ignore=shutil.ignore_patterns("media", "shots", "fonts-src", "lod", "assets"))
(pub / "js/story.js").write_text((pub / "js/story.js").read_text(encoding="utf-8").replace("<footer>워크숍 발표에서</footer>", "<footer>민성의 나레이션</footer>"), encoding="utf-8")
r3 = subprocess.run([sys.executable, "tools/check.py"], cwd=pub, capture_output=True, text=True)
R.ok("public text: putting '민성의 나레이션' back makes check.py fail", r3.returncode == 1 and "public text: internal wording in js/story.js" in r3.stdout, r3.stdout[-200:])
shutil.rmtree(tmp, ignore_errors=True)
sys.exit(0 if R.report() else 1)

