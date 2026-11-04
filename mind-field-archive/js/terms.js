/* v6: every technical word explains itself. Data: js/glossary.js (one source, shared with the exit zone).
   Rooms, the gallery, the exit and the list: the first use of a word in a block becomes a <button class="term"> that shows
   the definition on hover and on keyboard focus (aria-describedby → the one role="tooltip"). Enter pins it, Esc closes it
   without closing the dialog under it. On the floor the words are plain <span>s that answer to hover only, so Tab,
   arrows, Enter and Esc keep walking the exhibition (docent keys). The popover lives in the top layer (popover="manual"),
   so it shows above open dialogs. */
(function () {
  const A = window.AR, Gl = A.glossary, R = window.ARR;
  if (!Gl || !R) return;
  const tip = document.getElementById("term-tip");
  if (!tip) return;
  const esc = R.esc;

  /* one pattern, longest words first */
  const alts = [];
  Gl.forEach((g) => g.match.forEach((m) => alts.push([m, g])));
  alts.sort((a, b) => b[0].length - a[0].length);
  const byWord = new Map(alts);
  const reEsc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const re = new RegExp(alts.map(([m]) => (/^[A-Za-z]/.test(m) ? `(?<![A-Za-z])${reEsc(m)}(?![A-Za-z])` : reEsc(m))).join("|"), "g");

  const SKIP = "a, button, kbd, code, .term, svg, script, style, summary, .q-src, .q-ref, time, h2#room-title, .gl-meta";
  const ZONE_OF = (el) => (el.closest("[data-zone]") || {}).dataset?.zone || (el.closest("#exit") ? "exit" : el.closest("#gallery") ? "gal" : "");

  function annotate(root, sel, focusable) {
    root.querySelectorAll(sel).forEach((blk) => {
      if (blk.dataset.termed) return;
      blk.dataset.termed = "1";
      const zone = ZONE_OF(blk), seen = new Set();
      const tw = document.createTreeWalker(blk, NodeFilter.SHOW_TEXT);
      const nodes = [];
      for (let t = tw.nextNode(); t; t = tw.nextNode()) if (t.parentElement && !t.parentElement.closest(SKIP)) nodes.push(t);
      nodes.forEach((t) => {
        const text = t.textContent; re.lastIndex = 0;
        let m, last = 0, frag = null;
        while ((m = re.exec(text))) {
          const g = byWord.get(m[0]);
          if (!g || seen.has(g.id) || (g.zones && !g.zones.includes(zone))) continue;
          seen.add(g.id);
          frag ||= document.createDocumentFragment();
          frag.append(text.slice(last, m.index));
          const el = document.createElement(focusable ? "button" : "span");
          el.className = "term"; el.dataset.term = g.id; el.textContent = m[0];
          if (focusable) { el.type = "button"; el.setAttribute("aria-describedby", "term-tip"); }
          frag.append(el); last = m.index + m[0].length;
        }
        if (frag) { frag.append(text.slice(last)); t.replaceWith(frag); }
      });
    });
  }

  /* where words get annotated */
  const FLOOR = ".pc .w-title, .pc .pl-title, .pc .nt-t, .pc .pull, .pc .w-lede, .pc .pl-lede, .pc .nt-l, .pc .cloud, .pc .cx-to, .pc .st-voice p, .pc .st-lede";
  const ROOM = ".rm-take, .rm-cond, .fact-t, .xr-line, .xr-plain, .xr-q blockquote p, .gloss dd, .dip-what, .vc-t, .rm-tl li span, .cr-cap, .pull.is-hero, .bq.is-room p, .en-quote p, .near-why, .rm-hero .st-voice p, .rm-hero .st-post";
  const GAL = ".gl-text, .gl-made, .gl-why, .gl-full p, .gl-subnote, .gl-note";
  const EXIT = ".ex-lead, .ex-term p, .ex-what b, .ex-six span, .ex-flow-list p, .ex-say, .ex-key p, .ex-pick span";
  let busy = false;
  const run = (fn) => { if (busy) return; busy = true; try { fn(); } finally { busy = false; } };
  const world = document.getElementById("world");
  const watch = (el, sel, focusable) => {
    if (!el) return;
    new MutationObserver(() => run(() => annotate(el, sel, focusable))).observe(el, { childList: true, subtree: true });
    run(() => annotate(el, sel, focusable));
  };
  watch(world, FLOOR, false);
  watch(document.getElementById("room-in"), ROOM, true);
  watch(document.getElementById("gallery-in"), GAL, true);
  watch(document.getElementById("exit-in"), EXIT, true);

  /* the popover */
  let curEl = null, pinned = false, hideT = 0;
  function place(el) {
    const r = el.getBoundingClientRect(), tw = tip.offsetWidth, th = tip.offsetHeight, m = 10;
    let x = Math.min(Math.max(8, r.left + r.width / 2 - tw / 2), innerWidth - tw - 8);
    let y = r.bottom + m;
    if (y + th > innerHeight - 8) y = Math.max(8, r.top - th - m);
    tip.style.left = x + "px"; tip.style.top = y + "px";
    tip.dataset.side = y < r.top ? "above" : "below";
  }
  function show(el) {
    clearTimeout(hideT);
    const g = Gl.find((x) => x.id === el.dataset.term); if (!g) return;
    const credit = g.s ? (/^ai-workshop\//.test(g.s.f) ? "근거: 워크숍 설치기 저장소" : `근거: ${R.srcLabel(g.s)}`) : "일반 설명";
    const said = R.said || ((t) => t);
    tip.innerHTML = `<b class="tip-t">${esc(g.term)}</b><span class="tip-d">${esc(g.plain)}</span>${g.voice ? `<span class="tip-v">민성: “${esc(said(g.voice.t))}”</span>` : ""}<small class="tip-s">${esc(credit)}</small>`;
    if (!tip.matches(":popover-open")) tip.showPopover();
    curEl && curEl.removeAttribute("data-open");
    curEl = el; el.setAttribute("data-open", "");
    place(el);
  }
  function hide(now) {
    clearTimeout(hideT);
    const go = () => { if (tip.matches(":popover-open")) tip.hidePopover(); curEl && curEl.removeAttribute("data-open"); curEl = null; pinned = false; };
    if (now) go(); else hideT = setTimeout(go, 140);
  }
  document.addEventListener("pointerover", (e) => {
    const t = e.target.closest && e.target.closest(".term");
    if (t) { if (!pinned || t !== curEl) { pinned = false; show(t); } return; }
    if (curEl && !pinned && !e.target.closest("#term-tip")) hide();
  });
  document.addEventListener("focusin", (e) => { const t = e.target.closest && e.target.closest(".term"); if (t) show(t); else if (curEl && !pinned) hide(true); });
  document.addEventListener("focusout", (e) => { if (e.target.closest && e.target.closest(".term") && !pinned) hide(); });
  document.addEventListener("click", (e) => {
    const t = e.target.closest && e.target.closest("button.term");
    if (!t) return;
    e.stopPropagation(); e.preventDefault();
    if (pinned && curEl === t) hide(true); else { show(t); pinned = true; }
  }, true);
  /* Esc closes the definition first, and only the definition */
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && tip.matches(":popover-open")) { e.preventDefault(); e.stopImmediatePropagation(); hide(true); }
  }, true);
  addEventListener("scroll", () => { if (curEl) place(curEl); }, true);
  window.ART = { show, hide: () => hide(true), annotate };
})();
