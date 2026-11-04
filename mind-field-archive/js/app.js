/* MIND FIELD archive: the floor.
   World coordinates are px at zoom 1. The camera is { x, y, z }: screen = cam.x + world * cam.z.
   Keys use KeyboardEvent.code and ignore IME composition, so they work with the Korean IME on. */
(function () {
  const A = window.AR, R = window.ARR;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const root = document.documentElement;
  const W = A.world.w, H = A.world.h;
  const floor = $("#floor"), world = $("#world");
  let spot;
  const room = $("#room"), roomIn = $("#room-in"), index = $("#index"), keys = $("#keys");
  const live = $("#live");

  /* ── motion preference ─────────────────────────── */
  const osReduced = matchMedia("(prefers-reduced-motion: reduce)");
  const reduced = () => root.dataset.motion ? root.dataset.motion === "reduced" : osReduced.matches;
  function setMotionLabel() {
    const b = $("#motion-btn");
    b.setAttribute("aria-pressed", String(reduced()));
    $("b", b).textContent = reduced() ? "줄임" : "기본";

  }

  /* ── layout ─────────────────────────────────────── */
  const pieces = A.pieces, byId = new Map(pieces.map((p) => [p.id, p]));
  const rand = (i, k) => { const s = Math.sin((i + 1) * 12.9898 + k * 78.233) * 43758.5453; return s - Math.floor(s) - 0.5; };
  const order = { 1: 0, 2: 0, 3: 0 };
  pieces.forEach((p, i) => {
    const L = A.layout[p.id];
    [p.x, p.y] = L.at; p.w = L.w; p.tier = L.tier; p.k = order[L.tier]++;
    p.rot = p.tier === 3 ? rand(i, 3) * 3 : 0;
  });

  /* neighbours, in thread order */
  const near = new Map(pieces.map((p) => [p.id, []]));
  A.threads.forEach(([a, b, why], i) => { near.get(a).push({ id: b, why, i }); near.get(b).push({ id: a, why, i }); });
  const nearOf = (id) => near.get(id).map((n) => ({ ...n, p: byId.get(n.id) }));

  const mat = (p) => p.tier === 3 ? "note" : p.zone === "br" ? "ember" : p.zone === "p2" ? "draw" : p.id === "accounting" ? "paper" : "field";
  const tone = (a, b) => (a.zone === b.zone && a.zone !== "br" ? a.zone : "x");

  /* ── build the world ───────────────────────────── */
  /* v4: a delivered image whose measured anchor (js/anchors.js) must land on a floor point: the smallest scale that still
     covers the box, with the anchor on the target. Returns an inline style, or "" (the CSS default) when not measured. */
  const AN = A.assetAnchors || {};
  const measured = (slot) => A.assetsReady.includes(slot) && AN[slot] && AN[slot].file === A.assetSlots[slot].file ? AN[slot] : null;
  function coverAt(slot, key, tx, ty, bw, bh) {
    const m = measured(slot); if (!m) return "";
    const [iw, ih] = m.size, [fx, fy] = m.pts[key];
    const s = Math.max(tx / (fx * iw), (bw - tx) / ((1 - fx) * iw), ty / (fy * ih), (bh - ty) / ((1 - fy) * ih));
    return `left:${(tx - fx * iw * s).toFixed(0)}px;top:${(ty - fy * ih * s).toFixed(0)}px;width:${(iw * s).toFixed(0)}px;height:${(ih * s).toFixed(0)}px;right:auto;bottom:auto;object-fit:fill`;
  }
  const withStyle = (html, st) => (st ? html.replace("<img ", `<img style="${st}" `) : html);
  function buildWorld() {
    world.style.width = W + "px"; world.style.height = H + "px";
    const z = A.zones;
    /* the well of the field manifold sits on the centre of the rings */
    const placeTex = (a, k) => a.slot === "muse2-field-manifold" ? coverAt(a.slot, "c", A.rings.cx - z[k].x, A.rings.cy, z[k].w, H) : "";
    const zoneHTML = Object.entries(z).map(([k, d]) => `
      <div class="zone zone-${k}" style="left:${d.x}px;width:${d.w}px" aria-hidden="true">
        ${A.assets.filter((a) => a.zone === k && !a.seam).map((a) => withStyle(A.assetImg(a.slot, "zone-tex" + (a.cls ? " " + a.cls : "")), placeTex(a, k))).join("")}
        ${k === "br" ? "" : `<span class="zone-num">${d.name.replace("부", "")}</span>`}
        <span class="zone-title"><b>${d.name}</b><span>${d.title}</span></span>
      </div>`).join("");
    /* the seam: paper turns into lattice exactly on the line between the bridge and Part 2 */
    const sm = measured("dots2-seam-ember-to-lattice"), sw = 600;
    const seam = sm ? `<div class="seam" style="left:${z.p2.x - sw / 2}px;width:${sw}px;height:${H}px" aria-hidden="true">${withStyle(A.assetImg("dots2-seam-ember-to-lattice", "seam-img"),
      `height:${H}px;width:${((sm.size[0] / sm.size[1]) * H).toFixed(0)}px;left:${(sw / 2 - sm.pts.t[0] * (sm.size[0] / sm.size[1]) * H).toFixed(0)}px`)}</div>` : "";
    const spark = `<span class="spark" style="left:${A.plaque.x}px;top:${A.plaque.y - 90}px" aria-hidden="true"></span>`;
    /* one caption per zone, listing the files actually shown there (a slot with no file and no fallback shows nothing) */
    const assetCaps = Object.keys(z).map((k) => {
      const shown = A.assets.filter((a) => a.zone === k && A.asset(a.slot));
      return shown.length ? `<span class="asset-cap" style="left:${z[k].x + 28}px;top:${H - 80}px">${shown[0].cap}</span>` : "";  /* v6 (t1195u): no file names in public view */
    }).join("");
    const clusters = A.clusters.map((c) => `<span class="cluster" style="left:${c.x}px;top:${c.y}px" aria-hidden="true">${c.name}</span>`).join("")
      /* v6 (전사본): the three acts of 민성's story head their columns, numbered in his order */
      + (A.acts || []).map((a, i) => `<span class="act" style="left:${a.x}px;top:900px" aria-hidden="true"><i>${i + 1}</i><b>${a.name}</b><em>${a.sub}</em></span>`).join("")
      + (z.p1.open ? `<span class="act-rule" style="left:${z.p1.open - 40}px;height:${H}px" aria-hidden="true"></span>` : "");
    const ringSvg = `<svg class="floor-rings" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" aria-hidden="true">
      <defs><clipPath id="p2clip"><rect x="${z.p2.x}" y="0" width="${z.p2.w}" height="${H}"/></clipPath></defs>
      <g clip-path="url(#p2clip)">
        ${A.rings.bands.slice().reverse().map((b) => `<circle class="fr fr-${b.key}" cx="${A.rings.cx}" cy="${A.rings.cy}" r="${b.r}"/>`).join("")}
        <circle class="fr fr-core" cx="${A.rings.cx}" cy="${A.rings.cy}" r="${A.rings.core}"/>
        <line class="fr-axis" x1="${A.rings.cx}" y1="0" x2="${A.rings.cx}" y2="${H}"/>
        <line class="fr-axis" x1="${A.zones.p2.x}" y1="${A.rings.cy}" x2="${W}" y2="${A.rings.cy}"/>
      </g>
    </svg>`;
    const ringLabels = A.rings.bands.map((b, i) => {
      return `<span class="fr-label" style="left:${A.rings.cx + 22}px;top:${A.rings.cy - b.r + 14}px" aria-hidden="true"><b>${b.name}</b> <i>${b.axis}</i></span>`;
    }).join("");
    /* v6 (민성 t1195u): the planner's original brief no longer hangs on the bridge; the site is public and the brief was
       an instruction to the people and tools that built it. The spark of the first screen keeps its spot. */
    const plaque = "";
    const threadSvg = `<svg class="threads" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" aria-hidden="true"></svg>`;
    const pcs = pieces.map((p) => `
      <div class="pc${mat(p) === "paper" ? " on-paper" : ""}" role="button" id="pc-${p.id}" data-id="${p.id}" data-kind="${p.kind}" data-zone="${p.zone}" data-mat="${mat(p)}" data-tier="${p.tier}"${p.kind === "story" ? ` data-act="${(A.acts || []).findIndex((a) => a.name === p.cluster) + 1}"` : ""} tabindex="-1"
        aria-labelledby="t-${p.id}" aria-describedby="floor-help"
        style="left:${p.x}px;top:${p.y}px;width:${p.w}px;--rot:${p.rot.toFixed(2)}deg;--i:${p.k}">${R.piece(p)}</div>`).join("");
    world.innerHTML = zoneHTML + seam + clusters + ringSvg + ringLabels + assetCaps + `<div class="dim" aria-hidden="true" style="width:${W}px;height:${H}px"></div>` + threadSvg + `<div class="tlabels" aria-hidden="true"></div>` + plaque + spark + pcs;
  }

  /* threads are drawn after pieces are measured, from edge to edge */
  function edge(p, tx, ty) {
    const dx = tx - p.x, dy = ty - p.y, hw = p.w / 2 + 6, hh = p.h / 2 + 6;
    const k = Math.min(Math.abs(dx) > 0 ? hw / Math.abs(dx) : Infinity, Math.abs(dy) > 0 ? hh / Math.abs(dy) : Infinity, 1);
    return [p.x + dx * k, p.y + dy * k];
  }
  function drawThreads() {
    pieces.forEach((p) => { const el = $("#pc-" + p.id); p.h = el.offsetHeight; p.w = el.offsetWidth; });
    const svg = $(".threads", world), labels = $(".tlabels", world);
    const midX = A.zones.br.x + A.zones.br.w / 2;
    let paths = "", tl = "";
    A.threads.forEach(([a, b, why], i) => {
      const P = byId.get(a), Q = byId.get(b);
      const [x1, y1] = edge(P, Q.x, Q.y), [x2, y2] = edge(Q, P.x, P.y);
      const dx = x2 - x1, dy = y2 - y1, d = Math.hypot(dx, dy) || 1;
      const bend = (i % 2 ? 1 : -1) * Math.min(260, d * 0.16);
      const cx = (x1 + x2) / 2 - (dy / d) * bend, cy = (y1 + y2) / 2 + (dx / d) * bend;
      /* v6: slide the label along its thread until it sits clear of every piece (sized for the near view, z ≈ 0.6) */
      const lw = (why.length * 14 + 28) / 0.6, lh = 30 / 0.6;
      const at = (t) => [(1 - t) * (1 - t) * x1 + 2 * (1 - t) * t * cx + t * t * x2, (1 - t) * (1 - t) * y1 + 2 * (1 - t) * t * cy + t * t * y2];
      const hit = ([x, y]) => pieces.reduce((s, q) => s + Math.max(0, Math.min(x + lw / 2, q.x + q.w / 2 + 16) - Math.max(x - lw / 2, q.x - q.w / 2 - 16)) * Math.max(0, Math.min(y + lh / 2, q.y + q.h / 2 + 16) - Math.max(y - lh / 2, q.y - q.h / 2 - 16)), 0);
      const nx = -(y2 - y1) / d, ny = (x2 - x1) / d, cands = [];
      [0.5, 0.42, 0.58, 0.34, 0.66, 0.26, 0.74].forEach((t) => [0, 1, -1, 2, -2].forEach((k) => { const [px, py] = at(t); cands.push([px + nx * k * lh * 1.4, py + ny * k * lh * 1.4, Math.abs(k) * 0.01 + Math.abs(t - 0.5) * 0.01]); }));
      const [lx, ly] = cands.map((c) => [c[0], c[1], hit(c) + c[2]]).sort((a, b) => a[2] - b[2])[0];
      const delay = Math.min(1.5, Math.abs((P.x + Q.x) / 2 - midX) / 2600);
      paths += `<path class="th" data-tone="${tone(P, Q)}" data-a="${a}" data-b="${b}" d="M${x1.toFixed(1)} ${y1.toFixed(1)} Q${cx.toFixed(1)} ${cy.toFixed(1)} ${x2.toFixed(1)} ${y2.toFixed(1)}" pathLength="1" style="--d:${delay.toFixed(2)}s"/>`
             + `<circle class="th-end" data-tone="${tone(P, Q)}" data-a="${a}" data-b="${b}" cx="${x1.toFixed(1)}" cy="${y1.toFixed(1)}"/><circle class="th-end" data-tone="${tone(P, Q)}" data-a="${a}" data-b="${b}" cx="${x2.toFixed(1)}" cy="${y2.toFixed(1)}"/>`;
      tl += `<span class="thl" data-tone="${tone(P, Q)}" data-a="${a}" data-b="${b}" style="left:${lx.toFixed(1)}px;top:${ly.toFixed(1)}px">${R.esc(why)}</span>`;
    });
    svg.innerHTML = paths; labels.innerHTML = tl;
  }

  /* ── camera ─────────────────────────────────────── */
  const cam = { x: 0, y: 0, z: 0.2 };
  const vp = () => ({ w: floor.clientWidth, h: floor.clientHeight });
  const zMin = () => Math.min(vp().w / W, vp().h / H) * 0.9;
  const zMax = 2.4;
  let level = "all";
  /* v6: the level decides the chrome. piece: the HUD panel on the left, no map. zone/free: the map, no HUD. all: the
     entrance card. Framing then fits into whatever the chrome leaves free (box), so nothing lands under it. */
  function setLevel(l) { level = l; root.dataset.level = l; if (l !== "all") floor.classList.remove("is-first"); }
  const BAR = 56, GAP = 24;
  function box() {
    const v = vp(), piece = level === "piece" || docent;
    const hud = $("#hud"), hw = piece && hud ? Math.max(hud.offsetWidth, 300) + GAP * 2 : GAP;
    const mapH = level === "zone" || level === "free" ? ($("#map").offsetHeight || 120) + GAP * 2 : level === "all" ? ($("#entry")?.offsetHeight || 0) + GAP * 2 : GAP;
    return { x: hw, y: BAR + GAP, w: Math.max(200, v.w - hw - GAP), h: Math.max(200, v.h - BAR - GAP - mapH) };
  }
  let glideUntil = 0;
  /* v6 performance: the world is not a promoted layer (no will-change, a 2D transform). Promoted, even only while the
     camera moved, it repainted far more than needed whenever anything inside it animated: 1 to 4 frames a second at piece
     level with a software GPU, 30 without. A glide is still composited while its transition runs, and the text redraws
     sharp at the new scale when it ends. */
  function apply(glide) {
    world.classList.toggle("glide", !!glide && !reduced());
    if (glide && !reduced()) glideUntil = performance.now() + 650;
    world.style.transform = `translate(${cam.x.toFixed(2)}px, ${cam.y.toFixed(2)}px) scale(${cam.z.toFixed(4)})`;
    world.style.setProperty("--z", cam.z.toFixed(4));
    floor.style.setProperty("--z", cam.z.toFixed(4));
    floor.dataset.scale = cam.z < 0.3 ? "far" : cam.z < 0.62 ? "mid" : "near";
    floor.toggleAttribute("data-whole", cam.z <= zMin() * 1.2);
    paintMap(); placeSpot(); markZone(); queueVideos();
    if (window.ARF) ARF.camera(cam, floor.dataset.scale);
  }

  /* ambient video: muted loops play only while on screen and large enough to see; never in reduced motion */
  let vq, floorPaused = false;
  function queueVideos() { clearTimeout(vq); vq = setTimeout(updateVideos, glideMs() + 60); }
  const glideMs = () => (world.classList.contains("glide") ? 900 : 0);
  /* v6: floor images start as small copies (lod/, tools/lod_images.py); one that is near the screen and drawn wider than
     its copy gets the next one up (a 1280-px middle copy, then the full file). The overview never needs one, so the first
     load stays light, and a close view does not decode 2560-px files it draws at 600. */
  function upgradeImages() {
    const fr = floor.getBoundingClientRect(), dpr = Math.min(devicePixelRatio || 1, 2), mx = fr.width * 0.25, my = fr.height * 0.25;
    $$("[data-full]", world).forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.right < fr.left - mx || r.left > fr.right + mx || r.bottom < fr.top - my || r.top > fr.bottom + my) return;
      const need = r.width * dpr;
      if (need <= (+el.dataset.w || 480) * 1.15) return;
      if (+getComputedStyle(el).opacity < 0.3) return;  /* a texture at 4–10% opacity never needs more than its small copy */
      const mid = el.dataset.mid && need <= +el.dataset.mw * 1.15;
      el.setAttribute(el.tagName === "image" ? "href" : el.tagName === "VIDEO" ? "poster" : "src", mid ? el.dataset.mid : el.dataset.full);
      if (mid) el.dataset.w = el.dataset.mw; else el.removeAttribute("data-full");
      el.removeAttribute("data-mid"); el.removeAttribute("data-mw");
    });
  }
  function updateVideos() {
    upgradeImages();
    const fr = floor.getBoundingClientRect();
    $$("video.amb, .pc figure.xs", world).forEach((v) => {
      const r = v.getBoundingClientRect();
      const seen = r.right > fr.left && r.left < fr.right && r.bottom > fr.top && r.top < fr.bottom && r.width > 220;
      const go = seen && !reduced() && !room.open && !index.open && !floorPaused;
      if (v.tagName !== "VIDEO") { if (window.ARX) ARX.setPlaying(v, go); return; }
      if (go) { if (v.paused) v.play().catch(() => {}); }
      else if (!v.paused) v.pause();
    });
  }
  function fit(r, glide, maxZ = 1.1, pad = 0.07) {
    const b = box();
    cam.z = Math.max(zMin(), Math.min(maxZ, (b.w * (1 - 2 * pad)) / r.w, (b.h * (1 - 2 * pad)) / r.h));
    cam.x = b.x + b.w / 2 - (r.x + r.w / 2) * cam.z;
    cam.y = b.y + b.h / 2 - (r.y + r.h / 2) * cam.z;
    apply(glide);
  }
  const zoneRect = (k) => {
    if (k === "all") return { x: 0, y: 0, w: W, h: H };
    const b = box();
    if (k === "p1" && A.zones.p1.open) { const w = A.zones.p1.open, h = (w * b.h) / b.w; return { x: 0, y: Math.max(0, Math.min(H - h, 820)), w, h }; }  /* v6: 1 opens on the story */
    if (k === "gal") { const z = A.zones[k]; return { x: z.x, y: 0, w: z.w, h: Math.min(H, (z.w * b.h) / b.w) }; }
    if (k === "exit") { const z = A.zones[k], wl = $(".exit-wall", world); return { x: z.x, y: wl ? wl.offsetTop - 120 : 0, w: z.w, h: (z.w * b.h) / b.w }; }
    const a = byId.get(A.zones[k].anchor);
    const w = k === "br" ? A.zones.br.w + 700 : A.zones[k].w, h = (w * b.h) / b.w;
    return { x: k === "br" ? A.zones.br.x - 350 : A.zones[k].x, y: a.y < h * 0.8 ? 0 : Math.max(0, Math.min(H - h, a.y - h / 2)), w, h };  /* a zone whose anchor sits high starts at its title */
  };
  function zoomAt(f, sx, sy, glide) {
    const z = Math.max(zMin(), Math.min(zMax, cam.z * f));
    const wx = (sx - cam.x) / cam.z, wy = (sy - cam.y) / cam.z;
    cam.z = z; cam.x = sx - wx * z; cam.y = sy - wy * z;
    setLevel("free"); apply(glide);
  }
  function framePiece(p, glide) {
    setLevel("piece");
    if (docent) {
      const ids = [p.id, ...near.get(p.id).map((n) => n.id)];
      const xs = ids.map((id) => byId.get(id)), pad = 80;
      const x0 = Math.min(...xs.map((q) => q.x - q.w / 2)) - pad, x1 = Math.max(...xs.map((q) => q.x + q.w / 2)) + pad;
      const y0 = Math.min(...xs.map((q) => q.y - q.h / 2)) - pad, y1 = Math.max(...xs.map((q) => q.y + q.h / 2)) + pad;
      fit({ x: x0, y: y0, w: x1 - x0, h: y1 - y0 }, glide, 0.95, 0.05);
      const b = box(), need = Math.min((b.h * 0.6) / p.h, (b.w * 0.4) / p.w);
      if (cam.z < need * 0.62) { cam.z = Math.min(0.95, need * 0.62); cam.x = b.x + b.w / 2 - p.x * cam.z; cam.y = b.y + b.h / 2 - p.y * cam.z; apply(glide); }
    } else {
      const b = box(), f = { 1: [0.9, 0.9, 0.9], 2: [0.5, 0.8, 1.15], 3: [0.36, 0.5, 1.4] }[p.tier];
      cam.z = Math.max(0.2, Math.min(f[2], (b.h * f[1]) / p.h, (b.w * f[0]) / p.w));
      cam.x = b.x + b.w / 2 - p.x * cam.z; cam.y = b.y + b.h / 2 - p.y * cam.z;
      apply(glide);
    }
  }

  /* ── current piece, docent, hud ─────────────────── */
  let cur = null, docent = false;
  const trail = [];
  function setCurrent(id, { glide = true, frame = true, announce = true, push = true } = {}) {
    const p = byId.get(id); if (!p) return;
    floor.classList.remove("is-first");
    if (push && cur && cur !== id) { trail.push(cur); if (trail.length > 40) trail.shift(); }
    const prev = cur;
    cur = id;
    $$(".pc", world).forEach((el) => { el.tabIndex = -1; el.removeAttribute("aria-current"); el.removeAttribute("data-lit"); });
    const el = $("#pc-" + id); el.tabIndex = 0; el.setAttribute("aria-current", "true"); el.dataset.lit = "self";
    near.get(id).forEach((n) => ($("#pc-" + n.id).dataset.lit = "near"));
    if (window.ARX && prev !== id) ARX.onCurrent(id, prev);  /* v4: the current explainer builds itself (or waits for , . in docent mode) */
    let k = 0;
    $$(".th, .th-end, .thl", world).forEach((t) => {
      const on = t.dataset.a === id || t.dataset.b === id;
      t.classList.toggle("hot", on);
      t.classList.remove("draw");
      if (on && t.classList.contains("th")) t.style.setProperty("--k", k++);
    });
    if (!reduced()) { void world.offsetWidth; $$(".th.hot", world).forEach((t) => t.classList.add("draw")); }
    if (document.activeElement !== el && !room.open && !index.open && !keys.open) el.focus({ preventScroll: true });
    paintHud(p);
    if (frame) framePiece(p, glide); else placeSpot();
    if (announce) live.textContent = `${A.zones[p.zone].name} ${p.title}. ${A.status[p.st].word}. 이웃 ${near.get(id).length}개.`;
  }
  function paintHud(p) {
    $("#hud-now").innerHTML = `<p class="hud-where">${A.zones[p.zone].name}</p><p class="hud-t">${R.esc(p.title)}</p><p class="hud-src">${R.st(p.st, true)}</p>`;
    const next = nextNeighbour(p.id);
    $("#hud-now").insertAdjacentHTML("beforeend", next ? `<p class="hud-tab"><kbd>Tab</kbd> ${R.esc(byId.get(next).title)}</p>` : "");
    $("#hud-next").innerHTML = nearOf(p.id).map((n) => `<li${n.id === next ? ' class="is-next"' : ""}><button type="button" data-go="${n.id}" data-zone="${n.p.zone}"><span>${R.esc(n.p.title)}</span><small>${R.esc(n.why)}</small></button></li>`).join("");
    $("#hud").dataset.zone = p.zone;
  }
  function setDocent(on) {
    docent = on;
    document.body.classList.toggle("is-docent", on);
    if (window.ARX) ARX.setDocent(on, room.open ? null : cur);
    $("#docent-btn").setAttribute("aria-pressed", String(on));
    if (on && !cur) setCurrent(closestToCenter(), { glide: true });
    else if (cur && !room.open) framePiece(byId.get(cur), true);
    placeSpot();
    live.textContent = on ? "도슨트 조명 켬" : "도슨트 조명 끔";
  }
  function placeSpot() {
    if (!cur) return;
    const p = byId.get(cur);
    spot ||= $(".dim", world);
    spot.style.setProperty("--sx", p.x.toFixed(0) + "px");
    spot.style.setProperty("--sy", p.y.toFixed(0) + "px");
    spot.style.setProperty("--sr", (Math.max(p.w || 400, p.h || 400) * 0.6 + 60).toFixed(0) + "px");
  }
  function closestToCenter() {
    const v = vp(), cx = (v.w / 2 - cam.x) / cam.z, cy = (v.h / 2 - cam.y) / cam.z;
    return pieces.reduce((best, p) => (Math.hypot(p.x - cx, p.y - cy) < Math.hypot(best.x - cx, best.y - cy) ? p : best), pieces[0]).id;
  }

  /* ── wandering ─────────────────────────────────── */
  function nextNeighbour(id) {
    const ns = near.get(id).map((n) => n.id);
    const recent = trail.slice(-6);
    return ns.find((n) => !recent.includes(n)) ?? ns[0];
  }
  function stepBack() { const prev = trail.pop(); if (prev) setCurrent(prev, { push: false }); }
  function spatial(dir) {
    if (!cur) return setCurrent(closestToCenter());
    const p = byId.get(cur);
    const [ux, uy] = { ArrowRight: [1, 0], ArrowLeft: [-1, 0], ArrowDown: [0, 1], ArrowUp: [0, -1] }[dir];
    let best = null, bestS = Infinity;
    pieces.forEach((q) => {
      if (q.id === p.id) return;
      const dx = q.x - p.x, dy = q.y - p.y, along = dx * ux + dy * uy, across = Math.abs(dx * uy - dy * ux);
      if (along <= 20) return;
      const s = along + across * 2.2;
      if (s < bestS) { bestS = s; best = q; }
    });
    if (best) setCurrent(best.id);
  }
  function jump(k, { open = true } = {}) {
    setLevel(k === "all" ? "all" : "zone");
    fit(zoneRect(k), true, k === "all" ? 1 : 0.62, k === "all" ? 0.03 : 0);
    if (k === "gal") { $(".gal-open", world)?.focus({ preventScroll: true }); if (open && window.ARG) window.ARG.open(); }
    else if (k === "exit") { $(".exit-open", world)?.focus({ preventScroll: true }); if (open && window.ARE) window.ARE.open(); }
    else if (k !== "all") setCurrent(A.zones[k].anchor, { frame: docent, glide: true });
    else if (docent && cur) placeSpot();
  }
  function markZone() {
    const v = vp(), cx = (v.w / 2 - cam.x) / cam.z;
    const inView = cam.z <= zMin() * 1.15 ? "all" : cx < A.zones.br.x ? "p1" : cx < A.zones.p2.x ? "br" : cx < A.zones.gal.x ? "p2" : cx < A.zones.exit.x ? "gal" : "exit";
    $$(".bar-zones button").forEach((b) => b.toggleAttribute("aria-current", b.dataset.jump === inView));
  }

  /* ── minimap ───────────────────────────────────── */
  const map = $("#map");
  function buildMap() {
    const z = A.zones;
    map.innerHTML = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="전시장 지도. 누르면 그 자리로 이동합니다">
      ${Object.entries(z).map(([k, d]) => `<rect class="mz mz-${k}" x="${d.x}" y="0" width="${d.w}" height="${H}"/>`).join("")}
      ${A.rings.bands.map((b) => `<circle class="mr" cx="${A.rings.cx}" cy="${A.rings.cy}" r="${b.r}"/>`).join("")}
      ${pieces.map((p) => `<circle class="mp" data-id="${p.id}" data-zone="${p.zone}" data-tier="${p.tier}" cx="${p.x}" cy="${p.y}" r="${p.tier === 1 ? 210 : p.tier === 2 ? 90 : 50}"/>`).join("")}
      <rect class="mv" x="0" y="0" width="10" height="10"/>
    </svg><span class="map-note">지도</span>`;
    map.addEventListener("click", (e) => {
      const r = map.querySelector("svg").getBoundingClientRect();
      const wx = ((e.clientX - r.left) / r.width) * W, wy = ((e.clientY - r.top) / r.height) * H, v = vp();
      cam.z = Math.max(cam.z, 0.35); cam.x = v.w / 2 - wx * cam.z; cam.y = v.h / 2 - wy * cam.z; setLevel("free"); apply(true);
    });
  }
  function paintMap() {
    const mv = map.querySelector(".mv"); if (!mv) return;
    const v = vp();
    mv.setAttribute("x", (-cam.x / cam.z).toFixed(0)); mv.setAttribute("y", (-cam.y / cam.z).toFixed(0));
    mv.setAttribute("width", (v.w / cam.z).toFixed(0)); mv.setAttribute("height", (v.h / cam.z).toFixed(0));
    $$(".mp", map).forEach((c) => c.classList.toggle("is-cur", c.dataset.id === cur));
  }

  /* ── rooms ─────────────────────────────────────── */
  const roomTrail = [];
  function openRoom(id, { mode = "new" } = {}) {
    const p = byId.get(id); if (!p) return;
    if (mode === "forward" && room.open && room.dataset.id) roomTrail.push(room.dataset.id);
    if (mode === "new") roomTrail.length = 0;
    /* the camera does not glide behind the opening room: it frames the piece once the floor has stopped painting
       (floorOff), so closing the room lands on the piece last shown, and the reveal draws over a still floor */
    setCurrent(id, { frame: false, announce: false, push: mode !== "back" });
    if (document.body.classList.contains("floor-off")) framePiece(p, false); else frameLater = () => framePiece(p, false);
    const el = $("#pc-" + id), r = el.getBoundingClientRect();
    room.style.setProperty("--ox", (r.left + r.width / 2).toFixed(0) + "px");
    room.style.setProperty("--oy", (r.top + r.height / 2).toFixed(0) + "px");
    roomIn.innerHTML = R.room(p, nearOf(id));
    $$("[data-full]", roomIn).forEach((el) => { el.setAttribute(el.tagName === "image" ? "href" : el.tagName === "VIDEO" ? "poster" : "src", el.dataset.full); el.removeAttribute("data-full"); });
    if (window.ARX) ARX.mountRoom(roomIn);
    room.dataset.zone = p.zone; room.dataset.id = id; room.dataset.kind = p.kind;
    const nx = nextNeighbour(id);
    $$(".near", roomIn).forEach((b) => b.toggleAttribute("data-next", b.dataset.go === nx));
    if (!room.open) room.showModal();
    updateVideos();
    room.scrollTop = 0;
    $(".room-x", roomIn).focus({ preventScroll: true });
    history.replaceState(null, "", "#" + id);
    live.textContent = `${p.title} 열림. ${A.status[p.st].word}.`;
  }
  /* exits faster than it enters (animate-ui): a 200ms fade, then close */
  /* v6 performance: rooms, the gallery, the exit and the list are opaque full-screen dialogs. Once one has finished opening,
     the floor (and its WebGL field) stops painting behind it; it comes back the moment a dialog starts to close.
     Measured in headless Chrome: a room over a live floor drew 1.5 frames a second, over a hidden floor 60. */
  const fullDialogs = () => [room, index, $("#gallery"), $("#exit")].filter(Boolean);
  let offT = 0, frameLater = null;
  function floorOff(on) {
    clearTimeout(offT);
    if (on) offT = setTimeout(() => { document.body.classList.add("floor-off"); if (frameLater) frameLater(); frameLater = null; }, reduced() ? 0 : 950);
    else { frameLater = null; document.body.classList.remove("floor-off"); if (window.ARF) ARF.kick(); }
  }
  const watchOpen = new MutationObserver(() => floorOff(fullDialogs().some((d) => d.open)));
  fullDialogs().forEach((d) => watchOpen.observe(d, { attributes: true, attributeFilter: ["open"] }));
  /* the dialog hands focus back to whatever opened it first; while it does, the floor must not follow that focus */
  function closeRoom(then) {
    if (!room.open || room.classList.contains("is-closing")) return;
    const done = () => { restoring = true; room.close(); restoring = false; if (then) then(); };
    floorOff(false);
    if (reduced()) return done();
    room.classList.add("is-closing");
    setTimeout(() => { room.classList.remove("is-closing"); done(); }, 200);
  }
  room.addEventListener("cancel", (e) => { e.preventDefault(); closeRoom(); });
  let restoring = false;
  room.addEventListener("close", () => {
    restoring = false;
    $$("video", roomIn).forEach((v) => v.pause());
    if (window.ARX) ARX.unmountRoom();
    history.replaceState(null, "", location.pathname + location.search);
    if (cur) { const el = $("#pc-" + cur); requestAnimationFrame(() => el.focus({ preventScroll: true })); live.textContent = `바닥으로 돌아옴: ${byId.get(cur).title}`; }
    updateVideos();
  });
  room.addEventListener("click", (e) => {
    const exitBtn = e.target.closest("[data-exit]");  /* v6: the story's last rooms hand over to the exit */
    if (exitBtn) return closeRoom(() => window.ARE && window.ARE.open(exitBtn.dataset.exit));
    const go = e.target.closest("[data-go]");
    if (go) return openRoom(go.dataset.go, { mode: "forward" });
    if (e.target.closest("[data-home]")) return closeRoom(() => jump("all"));
    if (e.target.closest("[data-close]")) closeRoom();
  });

  /* ── index (list view) ─────────────────────────── */
  function buildIndex() {
    const groups = [];
    ["p1", "br", "p2"].forEach((z) => {
      const ps = pieces.filter((p) => p.zone === z);
      const keysIn = z === "p1" ? [...(A.acts || []).map((a) => a.name), ...A.clusters.map((c) => c.name)] : z === "p2" ? [...A.rings.bands.map((b) => b.key), undefined] : [undefined];
      const sec = keysIn.map((k) => {
        const list = ps.filter((p) => (z === "p1" ? p.cluster === k : z === "p2" ? p.ring === k : true));
        if (!list.length) return "";
        const name = z === "p1" ? k : z === "p2" ? (k ? A.rings.bands.find((b) => b.key === k).name : "고리의 중심과 바깥") : "다리";
        return `<section class="ix-group"><h4>${name}</h4><ul>${list.map(R.row).join("")}</ul></section>`;
      }).join("");
      groups.push(`<section class="ix-zone" data-zone="${z}"><h3><b>${A.zones[z].name}</b> ${A.zones[z].title}</h3>${sec}</section>`);
    });
    $("#index-list").innerHTML = groups.join("");
  }
  index.addEventListener("click", (e) => {
    const o = e.target.closest("[data-open]");
    if (o) { index.close(); openRoom(o.dataset.open); return; }
    if (e.target.closest("[data-close]")) index.close();
  });
  keys.addEventListener("click", (e) => { if (e.target.closest("[data-close]") || e.target === keys) keys.close(); });

  /* ── pointer: drag, wheel, pinch, click ────────── */
  const ptrs = new Map();
  let drag = null, pinch = null, suppressClick = false;
  floor.addEventListener("pointerdown", (e) => {
    if (e.button !== 0 && e.pointerType === "mouse") return;
    ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (ptrs.size === 1) { drag = { x: e.clientX, y: e.clientY, cx: cam.x, cy: cam.y, moved: false, id: e.pointerId }; suppressClick = false; }
    if (ptrs.size === 2) {
      const [a, b] = [...ptrs.values()];
      pinch = { d: Math.hypot(a.x - b.x, a.y - b.y), z: cam.z, mx: (a.x + b.x) / 2, my: (a.y + b.y) / 2 };
    }
  });
  floor.addEventListener("pointermove", (e) => {
    if (!ptrs.has(e.pointerId)) return;
    ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const fr = floor.getBoundingClientRect();
    if (pinch && ptrs.size === 2) {
      const [a, b] = [...ptrs.values()], d = Math.hypot(a.x - b.x, a.y - b.y);
      zoomAt((pinch.z * (d / pinch.d)) / cam.z, pinch.mx - fr.left, pinch.my - fr.top, false);
      suppressClick = true; return;
    }
    if (!drag) return;
    const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
    if (!drag.moved && Math.hypot(dx, dy) > 5) { drag.moved = true; floor.setPointerCapture(e.pointerId); floor.classList.add("is-dragging"); }
    if (drag.moved) { cam.x = drag.cx + dx; cam.y = drag.cy + dy; setLevel("free"); apply(false); suppressClick = true; }
  });
  const endPtr = (e) => {
    ptrs.delete(e.pointerId);
    if (ptrs.size < 2) pinch = null;
    if (ptrs.size === 0) { drag = null; floor.classList.remove("is-dragging"); }
  };
  floor.addEventListener("pointerup", endPtr); floor.addEventListener("pointercancel", endPtr);
  floor.addEventListener("click", (e) => {
    if (suppressClick) { suppressClick = false; return; }
    if (performance.now() < glideUntil && !e.target.closest("button")) return;
    const gt = e.target.closest("[data-gal]");
    if (gt && window.ARG) return window.ARG.open(gt.dataset.gal);
    const ex = e.target.closest("[data-exit]");
    if (ex && window.ARE) return window.ARE.open(ex.dataset.exit);
    const pc = e.target.closest(".pc");
    if (pc) openRoom(pc.dataset.id);
  });
  floor.addEventListener("wheel", (e) => {
    e.preventDefault();
    const fr = floor.getBoundingClientRect();
    if (e.ctrlKey || e.metaKey) zoomAt(Math.exp(-e.deltaY * 0.0022), e.clientX - fr.left, e.clientY - fr.top, false);
    else { cam.x -= e.deltaX; cam.y -= e.deltaY; setLevel("free"); apply(false); }
  }, { passive: false });
  floor.addEventListener("scroll", () => { floor.scrollTop = 0; floor.scrollLeft = 0; });
  floor.addEventListener("focusin", (e) => {
    if (restoring || room.open) return;
    const pc = e.target.closest(".pc");
    if (pc && pc.dataset.id !== cur) setCurrent(pc.dataset.id, { frame: true });
  });

  /* hover: lift the hovered piece's threads */
  world.addEventListener("pointerover", (e) => {
    const pc = e.target.closest(".pc"); if (!pc) return;
    const id = pc.dataset.id;
    $$(".th, .th-end, .thl", world).forEach((t) => t.classList.toggle("hover", t.dataset.a === id || t.dataset.b === id));
  });
  world.addEventListener("pointerleave", () => $$(".hover", world).forEach((t) => t.classList.remove("hover")));

  /* hud and bar */
  $("#hud").addEventListener("click", (e) => { const g = e.target.closest("[data-go]"); if (g) setCurrent(g.dataset.go); });
  $$("[data-jump]").forEach((b) => b.addEventListener("click", (e) => { e.preventDefault(); jump(b.dataset.jump); }));
  $("#docent-btn").addEventListener("click", () => { setDocent(!docent); if (cur && !room.open) $("#pc-" + cur).focus({ preventScroll: true }); });
  $("#skip-list").addEventListener("click", () => { index.showModal(); $("[data-open]", index)?.focus(); });
  $("#terms-btn")?.addEventListener("click", () => window.ARE && window.ARE.open("terms"));
  $$("[data-intro]").forEach((b) => b.addEventListener("click", () => { const k = b.dataset.intro; if (k === "exit") jump("exit"); else { jump(k, { open: false }); } }));
  $("#index-open").addEventListener("click", (e) => { e.preventDefault(); index.showModal(); $("[data-open]", index)?.focus(); });
  $("#keys-btn").addEventListener("click", () => keys.showModal());
  $("#zoom-in").addEventListener("click", () => { const v = vp(); zoomAt(1.3, v.w / 2, v.h / 2, true); });
  $("#zoom-out").addEventListener("click", () => { const v = vp(); zoomAt(1 / 1.3, v.w / 2, v.h / 2, true); });
  $("#motion-btn").addEventListener("click", toggleMotion);
  function toggleMotion() {
    root.dataset.motion = reduced() ? "full" : "reduced"; setMotionLabel(); if (window.ARX) ARX.motion(); updateVideos();
    if (window.ARF) ARF.motion(); live.textContent = reduced() ? "움직임 줄임" : "움직임 기본";
  }

  /* ── keyboard ──────────────────────────────────── */
  document.addEventListener("keydown", (e) => {
    if (e.isComposing || e.keyCode === 229) return;
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    const c = e.code;
    if (c === "KeyM" && !e.repeat && (room.open || keys.open || index.open || (window.ARG && window.ARG.isOpen) || (window.ARE && window.ARE.isOpen))) { toggleMotion(); return; }
    if (keys.open || index.open || (window.ARG && window.ARG.isOpen) || (window.ARE && window.ARE.isOpen)) return; /* native dialogs handle Esc and Tab */
    if (room.open) {
      if (e.target.closest && e.target.closest("video")) return;
      if (c === "ArrowRight") { e.preventDefault(); openRoom(nextNeighbour(room.dataset.id), { mode: "forward" }); }
      else if (c === "ArrowLeft") { e.preventDefault(); const prev = roomTrail.pop(); if (prev) openRoom(prev, { mode: "back" }); }
      else if (c === "KeyD") setDocent(!docent);
      else if ((c === "Period" || c === "Comma") && window.ARX && ARX.stepRoom(c === "Period" ? 1 : -1)) e.preventDefault();
      return;
    }
    const onFloor = floor.contains(document.activeElement);
    switch (c) {
      case "Digit0": case "Numpad0": return jump("all");
      case "Digit1": case "Numpad1": return jump("p1");
      case "Digit2": case "Numpad2": return jump("p2");
      case "Digit3": case "Numpad3": return jump("br");
      case "Digit4": case "Numpad4": return jump("gal");
      case "Digit5": case "Numpad5": return jump("exit");
      case "KeyT": e.preventDefault(); return window.ARE && window.ARE.open("terms");
      case "KeyG": e.preventDefault(); return window.ARG && window.ARG.open();
      case "KeyD": return setDocent(!docent);
      case "KeyL": e.preventDefault(); index.showModal(); $("[data-open]", index)?.focus(); return;
      case "KeyM": return toggleMotion();
      case "Period": case "Comma": if (cur && window.ARX && ARX.stepFloor(cur, c === "Period" ? 1 : -1)) e.preventDefault(); return;
      case "Slash": if (e.shiftKey) { e.preventDefault(); keys.showModal(); } return;
      case "Equal": case "NumpadAdd": { const v = vp(); return zoomAt(1.3, v.w / 2, v.h / 2, true); }
      case "Minus": case "NumpadSubtract": { const v = vp(); return zoomAt(1 / 1.3, v.w / 2, v.h / 2, true); }
    }
    if (c.startsWith("Arrow")) {
      if (e.target.closest && e.target.closest(".topbar, .hud, .map, .zoom") && !onFloor) return;
      e.preventDefault(); spatial(c); return;
    }
    if (!onFloor) return;
    if ((c === "Tab" || c === "Enter" || c === "Space") && !document.activeElement.closest(".pc")) return; /* real buttons on the floor (사례관 열기) keep their native keys */
    if (c === "Tab") {
      e.preventDefault();
      if (e.shiftKey) stepBack(); else setCurrent(nextNeighbour(cur));
    } else if (c === "Enter" || c === "Space") {
      e.preventDefault(); if (cur) openRoom(cur);
    } else if (c === "Escape") {
      e.preventDefault();
      if (level === "piece" || level === "free") { const z = byId.get(cur)?.zone ?? "all"; setLevel("zone"); fit(zoneRect(z), true, 0.62, 0); }
      else if (level === "zone") jump("all");
      else $(".bar-zones button").focus();
    }
  });

  /* keep the floor framed on resize */
  let rz;
  addEventListener("resize", () => { clearTimeout(rz); rz = setTimeout(() => { if (cur && level === "piece") framePiece(byId.get(cur), false); else fit(zoneRect("all"), false, 1, 0.03); }, 120); });

  /* ── start ─────────────────────────────────────── */
  if (!root.dataset.motion && osReduced.matches) root.dataset.motion = "reduced";
  setLevel("all");
  setMotionLabel();
  A.applyAssetVars();
  buildWorld();
  if (window.ARX) ARX.initFloor(world);
  buildMap();
  buildIndex();
  const start = () => {
    drawThreads();
    fit(zoneRect("all"), false, 1, 0.03);
    if (!reduced()) {
      /* spark 0–480, build 480–1700, twist 1700–2700, lock 2700–3500, hold (seeconvm's arc, refs/x-opus-motion-prompts.md) */
      world.classList.add("intro");
      setTimeout(() => world.classList.add("twist"), 1700);
      setTimeout(() => world.classList.add("lock"), 2700);
      setTimeout(() => { world.classList.remove("intro", "twist", "lock"); updateVideos(); }, 4200);
    } else updateVideos();
    $("#pc-" + A.zones.p1.anchor).tabIndex = 0;
    /* v6 (Dots browser review 1): the first screen lights one piece, the one "1부부터 보기" opens, and dims the rest
       until the visitor moves (any zoom, jump or chosen piece ends it) */
    const hero = $("#pc-" + A.zones.p1.anchor), hr = hero.getBoundingClientRect(), wr = world.getBoundingClientRect();
    hero.dataset.hero = "";
    world.insertAdjacentHTML("beforeend", `<span class="hero-tag" aria-hidden="true" style="left:${((hr.left - wr.left) / cam.z).toFixed(0)}px;top:${((hr.bottom - wr.top) / cam.z).toFixed(0)}px">여기서 시작</span>`);  /* under the piece: the zone title sits above it */
    floor.classList.add("is-first");
    const hash = decodeURIComponent(location.hash.slice(1));
    if (byId.has(hash)) openRoom(hash);
    document.body.classList.add("is-ready");
  };
  (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(() => requestAnimationFrame(start));
  addEventListener("hashchange", () => {
    const id = decodeURIComponent(location.hash.slice(1));
    if (byId.has(id) && room.dataset.id !== id) openRoom(id);
  });

  window.ARchive = { cam, fit, setCurrent, openRoom, jump, setDocent, pieces, byId, near: nearOf, reduced, box, get level() { return level; }, get current() { return cur; },
    pauseFloor() { floorPaused = true; $$("video.amb", world).forEach((v) => v.pause()); },
    resumeFloor() { floorPaused = false; updateVideos(); } };
})();
