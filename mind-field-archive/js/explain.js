/* MIND FIELD archive v4: Part 2 explainers.
   Each scene is one SVG built from AR.explain, whose strings are all copied from the cited source lines.
   Elements carry their step as data attributes, and setStep() turns them into classes:
     data-s="k"   appears at step k              data-e="k"   leaves at step k
     data-h="k …" is the lit one at those steps  data-m="k"   moves to its second place from step k
     data-x="k"   takes the accent from step k   data-dim="k" recedes from step k
   CSS does the motion: strokes draw themselves (ShowCreation), shapes fade and travel. Reduced motion
   removes every transition, so a step becomes a cut and the floor shows each figure's last frame.
   Dots that travel along a path (state, orbit) run on requestAnimationFrame, only while their figure is
   playing: on screen, large enough, motion allowed, no dialog over it. */
(function () {
  const A = window.AR, R = window.ARR;
  const X = (window.ARX = {});
  if (!A.explain) return;
  const esc = R.esc;
  const root = document.documentElement;
  const osReduced = matchMedia("(prefers-reduced-motion: reduce)");
  const reduced = () => (root.dataset.motion ? root.dataset.motion === "reduced" : osReduced.matches);

  /* ── geometry ─────────────────────────────────── */
  const r1 = (v) => Math.round(v * 10) / 10;
  const rad = (d) => (d * Math.PI) / 180;
  const pol = (cx, cy, r, d) => [r1(cx + r * Math.cos(rad(d))), r1(cy + r * Math.sin(rad(d)))];
  const head = (x, y, d, s = 15) => {
    const p = (t) => `${r1(x + s * Math.cos(rad(d) + t))} ${r1(y + s * Math.sin(rad(d) + t))}`;
    return `M${p(2.6)} L${r1(x)} ${r1(y)} L${p(-2.6)}`;
  };
  const arc = (cx, cy, r, a0, a1) => {
    const [x0, y0] = pol(cx, cy, r, a0), [x1, y1] = pol(cx, cy, r, a1);
    return `M${x0} ${y0} A${r} ${r} 0 ${a1 - a0 > 180 ? 1 : 0} 1 ${x1} ${y1}`;
  };
  /* a full circle as a path, clockwise from 9 o'clock, so it can draw itself and carry a runner */
  const circ = (cx, cy, r) => `M${r1(cx - r)} ${cy} A${r} ${r} 0 1 1 ${r1(cx + r)} ${cy} A${r} ${r} 0 1 1 ${r1(cx - r)} ${cy}`;
  const rr = (x, y, w, h, r) => `M${x + r} ${y} H${x + w - r} Q${x + w} ${y} ${x + w} ${y + r} V${y + h - r} Q${x + w} ${y + h} ${x + w - r} ${y + h} H${x + r} Q${x} ${y + h} ${x} ${y + h - r} V${y + r} Q${x} ${y} ${x + r} ${y} Z`;
  const brace = (x0, x1, y, d = 24) => {
    const m = (x0 + x1) / 2, q = d / 2;
    return `M${x0} ${y} Q${x0} ${y + q} ${x0 + q} ${y + q} H${m - q} Q${m} ${y + q} ${m} ${y + d} Q${m} ${y + q} ${m + q} ${y + q} H${x1 - q} Q${x1} ${y + q} ${x1} ${y}`;
  };
  const toward = (P, x, y, r) => { const a = Math.atan2(y - P.y, x - P.x); return [r1(P.x + r * Math.cos(a)), r1(P.y + r * Math.sin(a))]; };
  /* a bent edge from circle P to circle Q, ending in an arrowhead */
  function edge(P, Q, bend = 0, hs = 15) {
    const dx = Q.x - P.x, dy = Q.y - P.y, d = Math.hypot(dx, dy) || 1, ux = dx / d, uy = dy / d;
    const mx = (P.x + Q.x) / 2 - uy * bend, my = (P.y + Q.y) / 2 + ux * bend;
    const s = toward(P, mx, my, P.r + 8), e = toward(Q, mx, my, Q.r + 10);
    const ang = (Math.atan2(e[1] - my, e[0] - mx) * 180) / Math.PI;
    return { d: `M${s[0]} ${s[1]} Q${r1(mx)} ${r1(my)} ${e[0]} ${e[1]}`, head: head(e[0], e[1], ang, hs), c: [r1(mx), r1(my)],
      mid: [r1(0.25 * s[0] + 0.5 * mx + 0.25 * e[0]), r1(0.25 * s[1] + 0.5 * my + 0.25 * e[1])], route: `M${P.x} ${P.y} Q${r1(mx)} ${r1(my)} ${Q.x} ${Q.y}` };
  }
  const at = (o = {}) => ["s", "e", "h", "m", "x", "dim"].map((k) => (o[k] != null ? ` data-${k}="${o[k]}"` : "")).join("");
  /* a stroke with its halo underneath: two copies, the wide faint one first */
  const ln = (d, cls, o, glow = true) => {
    const pl = /\bdr\b/.test(cls) && !/\bdash\b/.test(cls) ? ' pathLength="1"' : "";  /* only strokes that draw themselves are measured in 0..1 */
    return (glow ? `<path class="gl ${cls}" d="${d}"${pl}${at(o)}/>` : "") + `<path class="${cls}" d="${d}"${pl}${at(o)}/>`;
  };
  const tx = (x, y, t, cls, o, anchor = "middle", extra = "") => `<text class="${cls}" x="${x}" y="${y}" text-anchor="${anchor}"${at(o)}${extra}>${esc(t)}</text>`;
  const N = (ex) => Object.fromEntries(ex.steps.map((s, i) => [s.k, i + 1]));

  /* ── delivered images, registered to the drawing (js/anchors.js, measured by tools/anchors.py) ──
     A ready image goes inside the SVG, in viewBox units, so it stays on its drawing at any size or letterbox:
     its measured anchor a lands on the drawing's point T, and the image distance p–q becomes the drawing distance P–Q. */
  const AN = A.assetAnchors || {};
  const ready = (slot) => A.assetsReady.includes(slot) && AN[slot] && AN[slot].pts && AN[slot].file === A.assetSlots[slot].file;
  let maskN = 0;
  function reg(slot, a, T, [p, q], [P, Q], cls = "") {
    const m = AN[slot], [W, H] = m.size, pt = (k) => [m.pts[k][0] * W, m.pts[k][1] * H];
    const d = (u, v) => Math.hypot(u[0] - v[0], u[1] - v[1]);
    const s = d(P, Q) / d(pt(p), pt(q)), [ax, ay] = pt(a), id = `xsm${++maskN}`;
    return `<defs><radialGradient id="${id}g"><stop offset=".62" stop-color="#fff"/><stop offset="1" stop-color="#000"/></radialGradient>
      <mask id="${id}" maskContentUnits="objectBoundingBox"><rect width="1" height="1" fill="url(#${id}g)"/></mask></defs>
      <image class="xs-img ${cls}" href="${A.lodImg(A.assetSlots[slot].file).src}"${A.lodImg(A.assetSlots[slot].file).attrs} x="${r1(T[0] - ax * s)}" y="${r1(T[1] - ay * s)}" width="${r1(W * s)}" height="${r1(H * s)}" preserveAspectRatio="none" mask="url(#${id})" data-slot="${slot}" onerror="this.remove()"/>`;
  }

  /* the graph explainer follows the constellation Dots drew: its eight nodes, its ten edges, its one acid edge.
     These defaults are that image's measurement on 2026-11-04; a re-delivery re-measures and the drawing follows. */
  const GDEF = { pts: { n1: [.392, .207], n2: [.845, .199], n3: [.639, .313], n4: [.309, .473], n5: [.539, .549], n6: [.739, .549], n7: [.870, .738], n8: [.506, .791] },
    edges: { "n1-n2": [.618, .042], "n1-n4": [.317, .29], "n2-n7": [.971, .438], "n4-n5": [.393, .585], "n4-n8": [.34, .73], "n5-n3": [.537, .407], "n3-n6": [.716, .348], "n6-n5": [.649, .647], "n6-n7": [.831, .585], "n8-n7": [.675, .864] },
    acid: "n6-n5", r: .016 };
  function graphGeo() {
    const g = ready("dots2-graph-constellation") ? AN["dots2-graph-constellation"] : null, vb = (f) => [r1(f[0] * 1600), r1(f[1] * 900)];
    const P = {}, C = {};
    Object.keys(GDEF.pts).forEach((k) => (P[k] = vb(g && g.pts[k] ? g.pts[k] : GDEF.pts[k])));
    Object.keys(GDEF.edges).forEach((k) => (C[k] = vb(g && g.edges && g.edges[k] ? g.edges[k].c : GDEF.edges[k])));
    const acid = (g && g.edges && Object.keys(g.edges).find((k) => g.edges[k].acid)) || GDEF.acid;
    return { P, C, acid, r: Math.max(24, (g ? g.ring_r : GDEF.r) * 1600 + 3), live: !!g };
  }
  const REG = {
    nest: () => ready("muse2-core-seed") ? reg("muse2-core-seed", "c", [500, 420], ["c", "r4"], [[500, 420], [850, 420]], "is-nest") : "",
    loop: () => ready("muse2-loop-orbit") ? reg("muse2-loop-orbit", "c", [550, 500], ["c", "e"], [[550, 500], [830, 500]], "is-loop") : "",
    context: () => ready("muse2-context-aperture") ? reg("muse2-context-aperture", "c", [1272, 496], ["c", "e"], [[1272, 496], [1498, 496]], "is-context") : "",
    harness: () => ready("dots2-harness-frame") ? reg("dots2-harness-frame", "c", [800, 540], ["c", "e"], [[800, 540], [898, 540]], "is-harness") : "",  /* the sphere on the Model, its rim on the outer halo */
    graph: () => { const G = graphGeo(); return G.live ? reg("dots2-graph-constellation", "n1", G.P.n1, ["n1", "n7"], [G.P.n1, G.P.n7], "is-graph") : ""; },
  };
  const pick = (ex, k) => ex.steps.find((s) => s.k === k);

  /* ── scene: prompt ⊂ context ⊂ harness ⊂ loop ⊂ graph ─────────────── */
  function sNest(ex) {
    const n = N(ex), cx = 500, cy = 420, o = [];
    /* graph: four more units around the loop, joined by directed edges, one cycle among them */
    const main = { x: cx, y: cy, r: 350 }, sats = [[96, 116], [904, 116], [904, 726], [96, 726]].map(([x, y]) => ({ x, y, r: 36 }));
    [[main, sats[1], -60], [sats[1], sats[2], -70], [sats[2], main, -40], [main, sats[0], 50], [sats[0], sats[3], 70]].forEach(([P, Q, b], i) => {
      const e = edge(P, Q, b);
      o.push(ln(e.d, "b dr gs", { s: n.graph, h: n.graph }) + `<path class="b ah gs" d="${e.head}"${at({ s: n.graph, h: n.graph })} style="--d:${300 + i * 80}ms"/>`);
    });
    sats.forEach((S, i) => o.push(`<g class="gs"${at({ s: n.graph, h: n.graph })} style="--d:${i * 90}ms">${ln(circ(S.x, S.y, S.r), "k")}<path class="b thin" d="${circ(S.x, S.y, 16)}"/><circle class="dot" cx="${S.x}" cy="${S.y - 16}" r="5"/></g>`));
    /* loop: a circle around the harness, with its direction and a runner */
    o.push(ln(circ(cx, cy, 350), "k dr gi", { s: n.loop, h: n.loop }));
    [-38, 142].forEach((a) => { const [x, y] = pol(cx, cy, 350, a); o.push(`<path class="k ah gi" d="${head(x, y, a + 90, 18)}"${at({ s: n.loop, h: n.loop })}/>`); });
    o.push(`<path class="route" data-rid="orbit" d="${circ(cx, cy, 350)}"/><circle class="run" r="11" data-route="orbit" data-dur="7000" data-rest="0.2"${at({ s: n.loop })}/>`);
    const math = pick(ex, "loop").math;
    if (math) o.push(tx(cx, 40, math.t, "tl t-math", { s: n.loop, h: n.loop }));
    /* harness: a double frame with four ports */
    o.push(ln(rr(236, 236, 528, 368, 26), "k dr gi", { s: n.harness, h: n.harness }) + ln(rr(247, 247, 506, 346, 18), "k dr thin gi", { s: n.harness, h: n.harness }, false));
    [[500, 236], [764, 420], [500, 604], [236, 420]].forEach(([x, y], i) => o.push(`<circle class="port gi" cx="${x}" cy="${y}" r="8"${at({ s: n.harness, h: n.harness })} style="--d:${500 + i * 70}ms"/>`));
    /* context: a window of tokens around the instruction */
    o.push(ln(rr(290, 294, 420, 252, 14), "b dr gm", { s: n.context, h: n.context }));
    for (let j = 0; j < 9; j++) for (let i = 0; i < 16; i++) {
      const x = 314 + i * 24, y = 318 + j * 24;
      if (x + 12 > 428 && x < 572 && y + 12 > 400 && y < 440) continue;
      o.push(`<rect class="tok gm" x="${x}" y="${y}" width="12" height="12" rx="2"${at({ s: n.context, h: n.context })} style="--d:${(i + j) * 16}ms"/>`);
    }
    /* prompt: one instruction */
    o.push(`<g class="gm"${at({ s: n.prompt, h: n.prompt })}>${ln(rr(436, 407, 128, 26, 13), "k cap")}${[[452, 474], [482, 506], [514, 530], [538, 550]].map(([a, b]) => `<path class="k" d="M${a} 420 H${b}"/>`).join("")}</g>`);
    /* the chain, read left to right as inclusion; braces group it into Feng et al.'s three layers */
    const xs = [118, 309, 500, 691, 882], keys = ["prompt", "context", "harness", "loop", "graph"], grp = { prompt: "gm", context: "gm", harness: "gi", loop: "gi", graph: "gs" };
    keys.forEach((k, i) => {
      const s = pick(ex, k);
      o.push(tx(xs[i], 882, s.label, `tk chain ${grp[k]}`, { s: n[k], h: n[k] }) + tx(xs[i], 920, s.sub, "tl t-sub", { s: n[k] }));
      if (i) o.push(tx((xs[i - 1] + xs[i]) / 2, 878, "⊂", "tl t-sub t-op", { s: n[k] }));
    });
    const L = pick(ex, "layers");
    if (L) L.braces.forEach((b, i) => {
      const ix = b.over.map((k) => keys.indexOf(k)), half = [72, 72, 54, 36, 54];
      const x0 = xs[ix[0]] - half[ix[0]] - 6, x1 = xs[ix[ix.length - 1]] + half[ix[ix.length - 1]] + 6;
      o.push(`<g class="br br-${i}"${at({ s: n.layers })}>${ln(brace(x0, x1, 944), "k dr", { s: n.layers }, false)}${tx((x0 + x1) / 2, 1004, b.t, "tl t-brace")}</g>`);
    });
    return { vb: "0 -12 1000 1044", body: o.join("") };
  }

  /* ── scene: the agent loop ─────────────────────── */
  function sLoop(ex) {
    const n = N(ex), cx = 550, cy = 500, R0 = 280, o = [];
    const nodes = [["Goal", -90], ["Action", 0], ["Observation", 90], ["Adjustment", 180]];
    /* the person who used to prompt by hand, and the agent at the centre */
    o.push(`<g${at({ s: n.you, h: n.you, dim: n.adjust })} class="you">${ln(rr(64, 64, 76, 76, 6), "k")}${tx(102, 182, pick(ex, "you").label, "tk t-node")}</g>`);
    o.push(ln(`M150 150 L${cx - 40} ${cy - 40}`, "k dr", { s: n.you, e: n.done, h: n.you, dim: n.adjust }) + `<path class="k ah" d="${head(cx - 36, cy - 36, 45)}"${at({ s: n.you, e: n.done, dim: n.adjust })}/>`);
    o.push(`<circle class="core" cx="${cx}" cy="${cy}" r="24"/>`);
    /* goal and its "done" */
    const [gx, gy] = pol(cx, cy, R0, -90);
    o.push(`<g${at({ s: n.goal, h: n.goal })}>${ln(circ(gx, gy, 38), "a dash", {}, false)}${ln(circ(gx, gy, 52), "a dash thin", {}, false)}</g>`);
    o.push(`<g class="done"${at({ s: n.goal, h: n.done })}>${ln(circ(960, 866, 30), "k dash", {}, false)}${ln(circ(960, 866, 42), "k thin", {}, false)}<circle class="done-fill" cx="960" cy="866" r="22"${at({ x: n.done })}/>${tx(960, 942, "done", "tl t-node")}</g>`);
    /* the four arcs; Action and Observation come with the scorekeeper, Adjustment closes the loop */
    nodes.forEach(([, a], i) => {
      const a0 = a + 8, a1 = a + 82, s = i < 2 ? n.act : n.adjust, [hx, hy] = pol(cx, cy, R0, a1);
      o.push(ln(arc(cx, cy, R0, a0, a1), "k dr", { s, h: s }) + `<path class="k ah" d="${head(hx, hy, a1 + 90, 17)}"${at({ s, h: s })}/>`);
    });
    nodes.forEach(([t, a], i) => {
      const [x, y] = pol(cx, cy, R0, a), s = [n.goal, n.act, n.act, n.adjust][i];
      const lab = [[x, y - 70, "middle"], [x + 46, y + 14, "start"], [x, y + 82, "middle"], [x - 46, y + 14, "end"]][i];
      o.push(`<g${at({ s, h: s })}><circle class="node" cx="${x}" cy="${y}" r="22"/>${tx(lab[0], lab[1], t, "tl t-step", {}, lab[2])}</g>`);
    });
    /* the scorekeeper beside Observation: fails until the last step, then passes */
    o.push(`<g${at({ s: n.act, h: n.act })}>${ln("M696 752 V808 M736 752 V808 M690 770 H742", "k", {}, false)}${tx(716, 842, "점수지기", "tk t-small")}</g>`);
    o.push(`<path class="k fail" d="M704 714 L728 738 M728 714 L704 738"${at({ s: n.act, e: n.done })}/><path class="a pass" d="M700 726 L712 738 L734 712"${at({ s: n.done, h: n.done })}/>`);
    /* the runner goes round until done; then the exit draws */
    o.push(`<path class="route" data-rid="lap" d="${arc(cx, cy, R0, -90, 269.9)}"/><circle class="run" r="12" data-route="lap" data-dur="4200" data-rest="0.3"${at({ s: n.adjust, e: n.done })}/>`);
    o.push(ln(`M${cx + 18} ${cy + R0 + 18} Q760 900 920 874`, "a dr", { s: n.done, h: n.done }) + `<path class="a ah" d="${head(922, 873, -8)}"${at({ s: n.done, h: n.done })}/>`);
    /* at the end, the person designs the goal instead of prompting */
    o.push(ln(`M146 102 Q${gx - 150} 40 ${gx - 56} ${gy - 12}`, "k dr dash", { s: n.done, h: n.done }, false) + tx(318, 62, "설계", "tk t-small", { s: n.done }));
    return { vb: "0 0 1100 1000", body: o.join("") };
  }

  /* ── scene: assembling a harness ───────────────── */
  function sHarness(ex) {
    const n = N(ex), o = [], M = [800, 540];
    const eq = ex.eq.t.split(" ");  /* Agent = Model + Harness */
    o.push(`<text class="tl t-eq" x="800" y="96" text-anchor="middle"><tspan${at({ h: `${n.harness} ${n.rank}` })} class="eq-a">${esc(eq[0])}</tspan><tspan class="eq-op"> ${esc(eq[1])} </tspan><tspan${at({ h: n.model })}>${esc(eq[2])}</tspan><tspan class="eq-op"> ${esc(eq[3])} </tspan><tspan${at({ s: n.harness, h: `${n.harness} ${n.rank}` })}>${esc(eq[4])}</tspan></text>`);
    /* model: a black box kept as it is */
    o.push(`<circle class="halo" cx="${M[0]}" cy="${M[1]}" r="98"/><circle class="halo" cx="${M[0]}" cy="${M[1]}" r="80"/><circle class="sph" cx="${M[0]}" cy="${M[1]}" r="62"${at({ h: n.model })}/>${tx(M[0], M[1] + 11, "Model", "tl t-model")}`);
    /* harness: the frame around it */
    o.push(ln(rr(536, 356, 528, 368, 32), "k dr", { s: n.harness, h: `${n.harness} ${n.rank}` }) + ln(rr(548, 368, 504, 344, 24), "k dr thin", { s: n.harness, h: `${n.harness} ${n.rank}` }, false));
    o.push(tx(540, 336, "Harness", "tl t-step", { s: n.harness, e: n.layers, h: n.harness }, "start"));
    /* flow: input, tool calls, result */
    const F = { s: n.flow, e: n.layers, h: n.flow };
    o.push(ln("M170 540 H522", "b dr", F) + `<path class="b ah" d="${head(526, 540, 0)}"${at(F)}/>` + tx(190, 520, "입력", "tk t-small", F, "start"));
    o.push(ln("M1072 540 H1414", "b dr", F) + `<path class="b ah" d="${head(1418, 540, 0)}"${at(F)}/>` + tx(1414, 520, "결과", "tk t-small", F, "end"));
    [680, 800, 920].forEach((x, i) => o.push(`<g${at(F)} style="--d:${200 + i * 120}ms">${ln(rr(x - 22, 212, 44, 44, 9), "b", {}, false)}<path class="b" d="M${x} 264 V346"/><path class="b ah" d="${head(x, 262, -90, 11)}"/><path class="b ah" d="${head(x, 348, 90, 11)}"/></g>`));
    o.push(tx(952, 242, pick(ex, "flow").label, "tk t-small", F, "start"));
    /* guides before the action, sensors after it */
    const G = { s: n.control, e: n.layers, h: n.control };
    o.push(ln("M246 300 C420 300 440 470 522 470", "b dr", G) + `<path class="b ah" d="${head(526, 470, 0)}"${at(G)}/>` + tx(236, 262, "guides", "tl t-step", G, "start") + tx(238, 290, "행동 전", "tk t-small", G, "start"));
    o.push(ln("M1250 552 C1250 860 360 860 360 660 Q360 640 380 640 H522", "b dr", G) + `<path class="b ah" d="${head(526, 640, 0)}"${at(G)}/>` + tx(800, 846, "sensors", "tl t-step", G) + tx(800, 876, "행동 후", "tk t-small", G));
    /* inner and outer harness */
    const Ly = { s: n.layers, e: n.parts, h: n.layers };
    o.push(ln(rr(456, 296, 688, 528, 42), "k dr dash", Ly, false) + tx(456, 280, "outer harness", "tl t-step", Ly, "start") + tx(1144, 280, "사용자가 조립", "tk t-small", Ly, "end"));
    o.push(tx(566, 404, "inner harness", "tl t-small", Ly, "start") + tx(566, 430, "모델 제공자가 내장", "tk t-small", Ly, "start"));
    ["AGENTS.md", "MCP", "스킬"].forEach((t, i) => { const x = 640 + i * 160; o.push(`<g${at(Ly)} style="--d:${300 + i * 120}ms">${ln(rr(x - 74, 804, 148, 40, 20), "b chip", {}, false)}${tx(x, 831, t, "tm")}</g>`); });
    /* six parts of the harness tuple, as ports on the frame */
    const P = pick(ex, "parts"), ko = P.ko.t, en = P.line.replace(/^H = \(|\)$/g, "").split(", ");
    const ports = [[676, 368, 656, 318, "end"], [924, 368, 944, 318, "start"], [1052, 470, 1080, 466, "start"], [1052, 610, 1080, 606, "start"], [800, 712, 800, 760, "middle"], [548, 540, 520, 536, "end"]];
    const Pt = { s: n.parts, h: n.parts };
    ports.forEach(([x, y, lx, ly, an], i) => o.push(`<g${at(Pt)} style="--d:${i * 110}ms"><circle class="port" cx="${x}" cy="${y}" r="11"/>${tx(lx, ly, ko[i], "tk t-port", {}, an)}${tx(lx, ly + 28, en[i], "tl t-en", {}, an)}</g>`));
    o.push(tx(800, 952, P.line, "tl t-tuple", { s: n.parts }));
    /* same model, another harness: from outside the top 30 to 5th */
    const Rk = { s: n.rank, h: n.rank }, yR = (r) => r1(250 + ((r - 1) / 29) * 500);
    o.push(`<g${at(Rk)}>${ln(`M1440 ${yR(1)} V${yR(30)}`, "k thin", {}, false)}${[1, 5, 10, 20, 30].map((r) => `<path class="k thin" d="M1430 ${yR(r)} H1450"/>${tx(1420, yR(r) + 8, String(r), "tn", {}, "end")}`).join("")}
      <path class="k thin" d="M1424 776 h72 v84 h-72 Z"/>${[0, 1, 2, 3, 4, 5].map((i) => `<path class="k hair" d="M${1424 + i * 14} 860 l${Math.min(72 - i * 14, 84)} ${-Math.min(72 - i * 14, 84)}"/>`).join("")}
      ${tx(1460, 890, "30위권 밖", "tk t-small")}${tx(1440, 196, "Terminal-Bench 2.0", "tl t-small")}${tx(1440, 224, "2026.3", "tn")}</g>`);
    o.push(ln(`M1472 820 V${yR(5) + 18}`, "a dr", Rk) + `<path class="a ah" d="${head(1472, yR(5) + 14, -90)}"${at(Rk)}/><circle class="a-dot" cx="1472" cy="${yR(5)}" r="10"${at(Rk)}/>` + tx(1494, 560, "하네스만", "tk t-small", Rk, "start") + tx(1494, 588, "바꿔", "tk t-small", Rk, "start"));
    o.push(tx(800, 424, "모델은 그대로", "tk t-small", Rk));
    return { vb: "0 0 1600 1000", body: o.join("") };
  }

  /* ── scene: what the model is shown ────────────── */
  function sContext(ex) {
    const n = N(ex), o = [];
    const kinds = pick(ex, "sources").kinds;
    /* where each kind of token sits before anything is chosen: [x, y, cols, rows] */
    const spots = [[90, 150, 6, 2], [400, 150, 5, 3], [90, 420, 7, 3], [400, 420, 6, 4], [90, 710, 11, 3], [740, 420, 4, 2], [740, 150, 3, 2]];
    const P = 34, S = 22, slots = [];
    for (let j = 0; j < 16; j++) for (let i = 0; i < 13; i++) slots.push([1066 + i * 32, 258 + j * 31]);
    const toks = [];
    kinds.forEach((name, c) => {
      const [x0, y0, cols, rows] = spots[c];
      o.push(tx(x0, y0 - 24, name, "tk t-kind", { s: n.sources }, "start"));
      for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
        const idx = j * cols + i, sel = (idx + c) % 3 === 0;
        toks.push({ x: x0 + i * P, y: y0 + j * P, d: c * 40 + idx * 12, sel, sig: sel && (idx + c) % 9 === 0 });
      }
    });
    /* the chosen ones land spread over the window, in reading order */
    const chosen = toks.filter((t) => t.sel), used = new Set();
    chosen.forEach((t, k) => { const i = (k * 37 + 11) % slots.length; used.add(i); [t.tx, t.ty] = slots[i]; t.k = k; });  /* 37 is coprime to 208: a fixed scatter */
    toks.forEach((t) => {
      if (!t.sel) return o.push(`<rect class="tok" x="${t.x}" y="${t.y}" width="${S}" height="${S}" rx="3"${at({ s: n.sources })} style="--d:${t.d}ms"/>`);
      o.push(`<rect class="tok sel${t.sig ? " sig" : ""}" x="${t.x}" y="${t.y}" width="${S}" height="${S}" rx="3"${at({ s: n.sources, m: n.window, x: t.sig ? n.signal : null, dim: t.sig ? n.rot : n.signal })} style="--d:${t.d}ms;--tx:${t.tx - t.x}px;--ty:${t.ty - t.y}px;--md:${t.k * 22}ms"/>`);
    });
    /* context rot: the window fills; what mattered gets harder to find */
    slots.forEach(([x, y], i) => { if (!used.has(i) && (i * 7) % 3) o.push(`<rect class="tok fill" x="${x}" y="${y}" width="${S}" height="${S}" rx="3"${at({ s: n.rot })} style="--d:${(i * 37) % 900}ms"/>`); });
    o.push(ln(rr(1046, 238, 452, 516, 18), "b dr", { s: n.window, h: n.window }) + tx(1046, 218, "컨텍스트 창", "tk t-kind", { s: n.window }, "start"));
    o.push(tx(1272, 800, pick(ex, "signal").label, "tl t-step", { s: n.signal, e: n.rot, h: n.signal }) + tx(1272, 800, pick(ex, "rot").label, "tl t-step", { s: n.rot, h: n.rot }));
    o.push(tx(110, 960, "그림 속 토큰의 개수와 위치에는 의미가 없습니다", "tk t-legend", {}, "start"));
    return { vb: "0 0 1600 1000", body: o.join("") };
  }

  /* ── scene: nodes, edges, state (laid on the constellation) ── */
  function sGraph(ex) {
    const n = N(ex), o = [], G = graphGeo(), P = G.P, r = G.r;
    const unit = (a, b) => { const dx = b[0] - a[0], dy = b[1] - a[1], d = Math.hypot(dx, dy) || 1; return [dx / d, dy / d]; };
    const routes = {};
    Object.keys(G.C).forEach((k, i) => {
      const [a, b] = k.split("-"), A0 = P[a], B0 = P[b], C0 = G.C[k], ua = unit(A0, C0), ub = unit(B0, C0);
      const s0 = [r1(A0[0] + ua[0] * (r + 6)), r1(A0[1] + ua[1] * (r + 6))], e0 = [r1(B0[0] + ub[0] * (r + 8)), r1(B0[1] + ub[1] * (r + 8))];
      const d = `M${s0[0]} ${s0[1]} Q${C0[0]} ${C0[1]} ${e0[0]} ${e0[1]}`, hd = head(e0[0], e0[1], (Math.atan2(-ub[1], -ub[0]) * 180) / Math.PI);
      routes[k] = `M${A0[0]} ${A0[1]} Q${C0[0]} ${C0[1]} ${B0[0]} ${B0[1]}`;
      if (k === G.acid) {  /* the cycle: retrying goes back along its own edge */
        const m = [0.25 * A0[0] + 0.5 * C0[0] + 0.25 * B0[0], 0.25 * A0[1] + 0.5 * C0[1] + 0.25 * B0[1]];
        o.push(ln(d, "a dr", { s: n.cycle, h: n.cycle }) + `<path class="a ah" d="${hd}"${at({ s: n.cycle, h: n.cycle })}/>` + tx(r1(m[0]), r1(m[1] + 46), pick(ex, "cycle").edge.t, "tk t-small", { s: n.cycle, h: n.cycle }));
      } else o.push(ln(d, "k dr", { s: n.edges, h: n.edges }) + `<path class="k ah" d="${hd}"${at({ s: n.edges, h: n.edges })} style="--d:${i * 80}ms"/>`);
    });
    /* state: one token walks from the source to the sink, taking the cycle once */
    const walk = ["n1-n4", "n4-n5", "n5-n3", "n3-n6", G.acid, "n5-n3", "n3-n6", "n6-n7"].filter((k) => routes[k]);
    o.push(`<path class="route" data-rid="state" d="${walk.map((k, i) => (i ? routes[k].replace(/^M[^Q]+/, "") : routes[k])).join(" ").replace(/Q/g, " Q")}"/>`);
    /* human in the loop: an approval point is a node type */
    const [hx, hy] = P.n8;
    o.push(`<g${at({ s: n.human, h: n.human })}><path class="gate" d="M${hx} ${hy - r - 22} L${hx + r + 22} ${hy} L${hx} ${hy + r + 22} L${hx - r - 22} ${hy} Z"/>${tx(hx, r1(hy + r + 62), pick(ex, "human").gate.t, "tk t-small")}</g>`);
    Object.entries(P).forEach(([k, [x, y]], i) => {
      o.push(`<g${at({ s: n.nodes, h: n.nodes })} style="--d:${i * 70}ms"><circle class="node big" cx="${x}" cy="${y}" r="${r1(r)}"/><circle class="pulse" cx="${x}" cy="${y}" r="${r1(r)}" style="--pd:${i * 0.37}s"/></g>`);
      o.push(`<g${at({ s: n.loops, h: n.loops })}>${ln(circ(x, y, r1(r + 18)), "b dash thin", {}, false)}<g class="spin" style="transform-origin:${x}px ${y}px;--sd:${2.6 + i * 0.35}s"><circle class="dot" cx="${x}" cy="${r1(y - r - 18)}" r="6"/></g></g>`);
    });
    o.push(`<circle class="run big" r="13" data-route="state" data-dur="11000" data-rest="0.08"${at({ s: n.state })}/>`);
    /* three words point at what they name, from the quiet left of the picture */
    const note = (x, y, to, t, s) => `<g${at({ s, h: s })}>${ln(`M${x + 14} ${y - 12} L${r1(to[0])} ${r1(to[1])}`, "k hair", {}, false)}${tx(x, y, t, "tl t-step", {}, "end")}</g>`;
    const e12 = G.C["n1-n2"], mid12 = [0.25 * P.n1[0] + 0.5 * e12[0] + 0.25 * P.n2[0], 0.25 * P.n1[1] + 0.5 * e12[1] + 0.25 * P.n2[1]];
    o.push(note(P.n1[0] - 150, P.n1[1] - 40, [P.n1[0] - r - 6, P.n1[1] - 6], "Nodes", n.nodes)
      + note(P.n1[0] - 30, Math.max(60, mid12[1] - 10), [mid12[0] - 40, mid12[1]], "Edges", n.edges)
      + note(P.n4[0] - 150, P.n4[1] + 70, [P.n4[0] - r - 6, P.n4[1] + 8], "State", n.state));
    return { vb: "0 0 1600 900", body: o.join("") };
  }

  const SCENES = { nest: sNest, loop: sLoop, harness: sHarness, context: sContext, graph: sGraph };

  /* ── figures ───────────────────────────────────── */
  const bg = (ex, cls = "xs-bg") => (ex.slot && A.asset(ex.slot) ? A.assetImg(ex.slot, cls) : "");
  function figure(p, { cap = true, label = true } = {}) {
    const ex = A.explain[p.id], sc = SCENES[ex.scene](ex), im = REG[ex.scene] ? REG[ex.scene]() : "";
    const sum = ex.steps.map((s) => `${s.label}: ${s.line}`).join(". ");
    return `<figure class="xs xs-${ex.scene}" data-x="${p.id}" data-step="${ex.floor}">${im ? "" : bg(ex)}
      <svg viewBox="${sc.vb}" ${label ? `role="img" aria-label="${R.raw(sum)}"` : 'aria-hidden="true"'} focusable="false">${im}${sc.body}</svg>
      ${cap ? `<figcaption class="xs-cap" aria-hidden="true"></figcaption>` : ""}</figure>`;
  }

  /* the naming gaps as towers of days: one dot per day, thirty to a row */
  function gaps(p, big) {
    const d = A.viz.paradigm.days, cols = 30, pitch = 7.2, cw = cols * pitch, gap = 40;
    const rows = Math.ceil(Math.max(...Object.values(d)) / cols), top = 8, base = top + rows * pitch;
    let dots = "", labels = "";
    p.ladder.forEach((row, i) => {
      const x0 = i * (cw + gap), nd = d[row.k], cls = row.k === "graph" ? "gd hollow" : "gd";
      for (let j = 0; j < nd; j++) { const c = j % cols, r = Math.floor(j / cols); dots += `<circle class="${cls}" cx="${r1(x0 + c * pitch + pitch / 2)}" cy="${r1(base - r * pitch - pitch / 2)}" r="2.5"/>`; }
      const parts = row.gap.length > 8 ? [row.gap.replace(/ 1개월 간격$/, ""), "1개월 간격"] : [row.gap];
      labels += tx(x0, base + 42, row.name, "tk t-gname", {}, "start") + parts.map((t, k) => tx(x0, base + 96 + k * 34, t, parts.length > 1 ? "tk t-gsmall" : "tk t-gap", {}, "start")).join("");
    });
    const W = 5 * cw + 4 * gap, H = base + (big ? 150 : 140);
    const sr = p.ladder.map((r) => `${r.name} ${r.gap}: 점 ${d[r.k].toLocaleString("en-US")}개`).join(", ");
    return `<svg class="xs-gaps" viewBox="-4 0 ${W + 8} ${H}" role="img" aria-label="${R.raw(A.viz.paradigm.legend + ". " + sr)}">${dots}${labels}</svg>`;
  }

  /* ── floor works ───────────────────────────────── */
  const lede = (p) => (p.lede ? `<p class="w-lede xs-lede">${esc(p.lede)}</p>` : "");
  R.xFloor = (p) => {
    const t = `<h3 class="w-title" id="t-${p.id}">${esc(p.title)}</h3>`;
    const fig = figure(p, { label: false });
    if (p.id === "paradigm") return `<div class="w w-x w-x-nest">${t}${fig}${lede(p)}</div>`;  /* v5: the naming-gap towers live in the room (명명 간격); the floor keeps the picture */
    if (p.id === "graph") return `<div class="w w-x w-x-graph">${fig}<div class="w-x-row"><div class="xs-scr">${A.asset("muse2-swarm-streams") ? A.assetImg("muse2-swarm-streams", "xs-scr-bg") : ""}${R.screen(p.media[0], { ambient: true })}</div><div class="w-text">${t}${lede(p)}</div></div></div>`;
    return `<div class="w w-x w-x-${A.explain[p.id].scene}">${fig}<div class="w-text">${t}${lede(p)}</div></div>`;
  };
  R.xThumb = (p) => `<span class="th-x">${figure(p, { cap: false, label: false })}</span>`;

  /* a glyph for the prompt plate: one instruction, then the four layers that took it in */
  R.xGlyph = () => `<svg class="xs xs-glyph" viewBox="0 0 600 300" aria-hidden="true">
      ${[182, 158, 133, 108].map((r, i) => `<path class="${i % 2 ? "b" : "k"} thin" d="${circ(300, 150, r)}" style="opacity:${0.22 + i * 0.16}"/>`).join("")}
      <path class="a" d="${rr(244, 136, 112, 28, 14)}"/>${[[258, 278], [286, 306], [314, 328], [336, 344]].map(([a, b]) => `<path class="a" d="M${a} 150 H${b}"/>`).join("")}</svg>`;

  /* ── rooms: the figure stays, the steps scroll past it ── */
  const ref = () => "";  /* v6 (t1195u): no research-file credits in public view; each room lists its public sources */
  const quote = (st) => {
    const qs = st.q ? [].concat(st.q) : [st.line];
    return `<details class="xr-q"><summary>원문</summary><blockquote>${qs.map((q) => `<p>${esc(q)}</p>`).join("")}</blockquote>${ref(st.s)}</details>`;
  };
  /* v6: one plain sentence per concept, from the shared glossary (js/glossary.js) */
  const PLAIN = { context: "context", harness: "harness", loop: "loop", graph: "graph", paradigm: "agent" };
  R.xRoom = (p) => {
    const ex = A.explain[p.id], n = ex.steps.length;
    const cards = ex.steps.map((st, i) => `
      <li class="xr-card" data-k="${i + 1}">
        <p class="xr-n"><b>${i + 1}</b> / ${n}</p>
        <h3>${esc(st.label)}</h3>
        ${st.sub ? `<p class="xr-sub">${esc(st.sub)}</p>` : ""}
        <p class="xr-line">${esc(st.line)}</p>
        ${quote(st)}
      </li>`).join("");
    const dots = ex.steps.map((st, i) => `<li><button type="button" data-xgo="${i + 1}" aria-label="${i + 1}단계: ${R.raw(st.label)}"><span>${i + 1}</span></button></li>`).join("");
    return `
      <section class="rm-hero xr" data-tier="1" data-kind="explain" aria-label="${R.raw(p.title)}: 단계 도식">
        <div class="xr-stage">
          ${figure(p, { cap: false })}
          <nav class="xr-ctl" aria-label="도식 단계">
            <button type="button" class="xr-prev" data-xgo="-1" aria-label="이전 단계"><kbd>,</kbd></button>
            <ol>${dots}</ol>
            <button type="button" class="xr-next" data-xgo="+1" aria-label="다음 단계"><kbd>.</kbd></button>
          </nav>
        </div>
        <ol class="xr-steps">
          <li class="xr-card xr-intro" data-k="0">
            <p class="rm-st-line">${R.st(p.st, true)}</p>
            <h2 id="room-title">${esc(p.title)}</h2>
            ${PLAIN[p.id] && A.glossary ? `<p class="xr-plain"><b>쉽게 말하면</b> ${esc(A.glossary.find((g) => g.id === PLAIN[p.id]).plain)}</p>` : ""}
            <p class="xr-hint">스크롤하거나 <kbd>.</kbd> <kbd>,</kbd> 키로 한 단계씩 넘기세요</p>
          </li>${cards}
        </ol>
      </section>`;
  };

  /* infographics that follow the scene in a room */
  function timeline(ex) {
    const T = ex.timeline, lanes = ["프롬프트", "컨텍스트", "하네스", "루프", "그래프", "에이전트", "기타"];
    const lane = (st) => { const i = lanes.findIndex((l) => st.includes(l)); return i < 0 ? 6 : i; };
    const when = (s) => { const m = s.match(/^(\d{4})-(\d{2})(?:-(\d{2}))?/); return +m[1] + (+m[2] - 1) / 12 + ((m[3] ? +m[3] : 15) - 1) / 365; };
    const x0 = 160, x1 = 1560;
    const panel = (y0, a, b, label, lh = 30) => {
      const X_ = (t) => r1(x0 + ((t - a) / (b - a)) * (x1 - x0));
      let s = lanes.map((l, i) => `<path class="k hair" d="M${x0} ${y0 + i * lh} H${x1}"/>${tx(x0 - 16, y0 + i * lh + 7, l, "tk t-lane", {}, "end")}`).join("");
      const ticks = [];
      for (let y = Math.ceil(a * 4) / 4; y <= b; y += b - a > 3 ? 1 : 0.25) ticks.push(y);
      s += ticks.map((t) => `<path class="k hair" d="M${X_(t)} ${y0 - 14} V${y0 + 6 * lh + 14}"/>${tx(X_(t), y0 + 6 * lh + 40, b - a > 3 ? String(t) : `${Math.floor(t)}.${String(Math.round((t % 1) * 12) + 1).padStart(2, "0")}`, "tn t-tick")}`).join("");
      T.rows.filter((r) => when(r[0]) >= a && when(r[0]) <= b).forEach((r, i) => {
        const x = X_(when(r[0])), y = y0 + lane(r[2]) * lh;
        s += `<g class="ev" data-lane="${lane(r[2])}"><circle cx="${x}" cy="${y}" r="7"/><title>${esc(r[0])} ${esc(r[1])} (${esc(r[2])})</title></g>`;
        if (label) s += tx(x, i % 2 ? y + 30 : y - 14, r[0], "tm t-date", {}, "middle");
      });
      return s;
    };
    const za = 2025 + 4 / 12, zb = 2026 + 9 / 12, top = 40, low = 400;
    const zx0 = r1(x0 + ((za - 2020) / 7) * (x1 - x0)), zx1 = r1(x0 + ((zb - 2020) / 7) * (x1 - x0));
    const sr = T.rows.map((r) => `${r[0]} ${r[1]}`).join(", ");
    return `<svg class="xs xs-tl" viewBox="0 0 1600 720" role="img" aria-label="${R.raw("§9 종합 타임라인. " + sr)}">
      ${panel(top, 2020, 2027, false)}
      <path class="a thin" d="M${zx0} ${top - 22} V${top + 6 * 30 + 22} H${zx1} V${top - 22} Z"/>
      <path class="a hair" d="M${zx0} ${top + 6 * 30 + 22} L${x0} ${low - 26} M${zx1} ${top + 6 * 30 + 22} L${x1} ${low - 26}"/>
      ${panel(low, za, zb, true, 40)}</svg>`;
  }
  function loopKinds(ex) {
    const K = ex.kinds, w = 400;
    const panel = (k, i) => {
      const cx = i * w + 200, cy = 200, r = 92;
      let s = ln(circ(cx, cy, r), "k thin", {}, false) + `<path class="k ah" d="${head(...pol(cx, cy, r, 30), 120, 13)}"/>` + `<g class="spin" style="transform-origin:${cx}px ${cy}px;--sd:${[5, 3.2, 4, 4.6][i]}s"><circle class="a-dot" cx="${cx}" cy="${cy - r}" r="9"/></g>`;
      if (k.k === "turn") s += ln(rr(cx - 160, 52, 52, 52, 5), "k", {}, false) + ln(`M${cx - 104} 92 Q${cx - 70} 104 ${cx - 40} ${cy - r + 16}`, "a", {}, false) + `<path class="a ah" d="${head(cx - 40, cy - r + 16, 50, 12)}"/>`;
      if (k.k === "goal") s += `<path class="k" d="M${cx + 118} ${cy + 46} V${cy + 96} M${cx + 152} ${cy + 46} V${cy + 96} M${cx + 112} ${cy + 60} H${cx + 158}"/><path class="a" d="M${cx + 120} ${cy + 22} l10 10 l18 -20"/>`;
      if (k.k === "time") s += Array.from({ length: 12 }, (_, j) => { const [a, b] = pol(cx, cy, r + 14, j * 30), [c, d] = pol(cx, cy, r + 26, j * 30); return `<path class="b" d="M${a} ${b} L${c} ${d}"/>`; }).join("");
      if (k.k === "proactive") s += `<path class="a" d="M${cx + 150} 40 L${cx + 120} 92 L${cx + 140} 92 L${cx + 108} 146"/><path class="a ah" d="${head(cx + 108, 146, 120, 12)}"/>`;
      const [en, ko] = [k.t.split(/[ (]/)[0], (k.t.match(/\((.*)\)$/) || [, ""])[1]];
      return s + tx(cx, 352, en, "tl t-step") + tx(cx, 386, ko, "tk t-small");
    };
    return `<svg class="xs xs-kinds" viewBox="0 0 1600 410" role="img" aria-label="${R.raw(K.label + ": " + K.rows.map((r) => r.t).join(", "))}">${K.rows.map(panel).join("")}</svg>`;
  }
  function moves(ex) {
    const M = ex.moves, w = 400, tok = (x, y, cls = "tok", st = "") => `<rect class="${cls}" x="${x}" y="${y}" width="22" height="22" rx="4"${st ? ` style="${st}"` : ""}/>`;
    const win = (x, y, wd = 170, h = 170) => ln(rr(x, y, wd, h, 12), "b", {}, false);
    const panel = (k, i) => {
      const x = i * w + 40, y = 60;
      let s = win(x + 60, y) + [0, 1, 2, 3, 4, 5].map((j) => tok(x + 84 + (j % 3) * 44, y + 30 + Math.floor(j / 3) * 44, "tok on")).join("");
      if (k === "write") s += ln(rr(x + 270, y + 54, 64, 64, 8), "k", {}, false) + tok(x + 172, y + 118, "tok a mv-write");
      if (k === "select") s += [0, 1, 2].map((j) => tok(x + 6, y + 200 + j * 0, "tok on")).join("") + tok(x + 6, y + 200, "tok a mv-select");
      if (k === "compress") s += [0, 1, 2].map((j) => tok(x + 84 + j * 44, y + 118, "tok on mv-squeeze", `--j:${j}`)).join("");
      if (k === "isolate") s += ln(rr(x + 250, y + 120, 110, 110, 10), "a", {}, false) + tok(x + 128, y + 74, "tok a mv-isolate");
      return s + tx(x + 145, 330, k, "tl t-step");
    };
    return `<svg class="xs xs-moves xm" viewBox="0 0 1600 360" role="img" aria-label="${R.raw(M.label + ": " + M.rows.join(" / ") + ". " + M.who)}">${M.rows.map(panel).join("")}</svg>`;
  }
  function openai(ex) {
    const O = ex.openai;
    let dots = "";
    for (let i = 0; i < 100; i++) dots += `<circle class="gd" cx="${r1(980 + (i % 10) * 26)}" cy="${r1(70 + Math.floor(i / 10) * 26)}" r="9"/>`;
    return `<svg class="xs xs-openai" viewBox="0 0 1600 420" role="img" aria-label="${R.raw(O.t.join(". ") + ". " + O.who)}">
      <path class="k thin" d="${rr(300, 57, 260, 260, 6)}"/>${tx(430, 236, "0", "tn t-huge")}
      ${tx(430, 372, "수동으로 작성한 코드", "tk t-small")}
      ${dots}${tx(1097, 372, "약 100만 줄", "tk t-small")}${tx(1097, 404, "점 1개 = 1만 줄로 환산", "tk t-legend")}
      ${tx(770, 200, "vs", "tl t-step")}</svg>`;
  }
  R.xExtras = (p) => {
    const ex = A.explain[p.id], out = [];
    const sec = (cls, h, body, foot) => `<section class="xr-x ${cls}"><h3>${h}</h3>${body}${foot ? `<div class="xr-foot">${foot}</div>` : ""}</section>`;
    if (p.id === "paradigm") {
      out.push(sec("xr-gaps", "명명 간격", gaps(p, true) + bgSlot("dots2-gap-arches"), `<p class="legend">${esc(A.viz.paradigm.legend)}</p>`));
      out.push(sec("xr-tl", "날짜가 있는 사건만", timeline(ex), `<p class="legend">줄은 표의 ‘단계’ 칸에 있는 낱말로 나눴습니다. 날짜가 월까지만 있으면 그달 15일에, 기간이면 첫날에 표시했습니다. 아래는 2025년 5월~2026년 9월을 확대한 것입니다.</p><details class="xr-q"><summary>사건 목록</summary><ol class="xr-tl-list">${ex.timeline.rows.map((r) => `<li><time>${esc(r[0])}</time> ${esc(r[1])} <span>${esc(r[2])}</span></li>`).join("")}</ol>${ref(ex.timeline.s)}</details>`));
    }
    if (p.id === "loop") out.push(sec("xr-kinds xm-wrap", esc(ex.kinds.label), loopKinds(ex), `<details class="xr-q"><summary>원문</summary><blockquote>${ex.kinds.rows.map((r) => `<p>${esc(r.t)}</p>`).join("")}</blockquote>${ref(ex.kinds.s)}</details>`));
    if (p.id === "context") out.push(sec("xr-moves xm-wrap", `${esc(ex.moves.label)} <small>${esc(ex.moves.who)}</small>`, moves(ex), `<p class="legend">움직임만 보여 주는 그림입니다. 기법마다 자세한 내용은 원문에 있습니다.</p>${ref(ex.moves.s)}`));
    if (p.id === "harness") out.push(sec("xr-openai", `${esc(ex.openai.who)}`, openai(ex), `<p class="xr-big-q" lang="en">${esc(ex.openai.t[3])}</p><p class="legend">${esc(ex.openai.t[0])} · ${esc(ex.openai.t[2])}</p>${ref(ex.openai.s)}`));
    return out.join("");
  };
  const bgSlot = (slot) => (A.asset(slot) ? A.assetImg(slot, "xr-bg") : "");

  /* ── stepping ──────────────────────────────────── */
  function setStep(fig, k, cut) {
    const ex = A.explain[fig.dataset.x]; if (!ex) return;
    const n = ex.steps.length;
    k = Math.max(1, Math.min(n, k | 0));
    if (cut) fig.classList.add("xs-cut");
    fig.dataset.step = k; fig.dataset.key = ex.steps[k - 1].k;
    fig.querySelectorAll("[data-s],[data-e],[data-h],[data-m],[data-x],[data-dim]").forEach((el) => {
      const d = el.dataset, s = +(d.s || 0), e = +(d.e || 99);
      el.classList.toggle("on", k >= s && k < e);
      if (d.h) el.classList.toggle("hi", d.h.split(" ").includes(String(k)));
      if (d.m) el.classList.toggle("go", k >= +d.m);
      if (d.x) el.classList.toggle("x", k >= +d.x);
      if (d.dim) el.classList.toggle("dim", k >= +d.dim);
    });
    const st = ex.steps[k - 1], line = `<i>${k} / ${n}</i><b>${esc(st.label)}</b><span>${esc(st.line)}</span>`;
    const cap = fig.querySelector(".xs-cap");
    if (cap) cap.innerHTML = line;
    if (fig.closest(".pc[aria-current]")) { const h = document.getElementById("hud-x"); if (h) h.innerHTML = line + `<em><kbd>,</kbd><kbd>.</kbd></em>`; }
    if (!playing.has(fig)) runners(fig, null);
    if (cut) { void fig.getBoundingClientRect(); fig.classList.remove("xs-cut"); }
  }
  X.setStep = setStep;

  /* runners: dots that travel along a route path while their figure plays */
  const playing = new Set();
  let raf = 0;
  const t0 = performance.now();
  function runners(fig, now) {
    fig.querySelectorAll(".run").forEach((c) => {
      const p = fig.querySelector(`[data-rid="${c.dataset.route}"]`); if (!p) return;
      const L = p.__len || (p.__len = p.getTotalLength()); if (!L) return;
      const f = now == null ? +(c.dataset.rest || 0) : (((now - t0) / (+c.dataset.dur || 5000)) % 1 + 1) % 1;
      const pt = p.getPointAtLength(f * L);
      c.setAttribute("cx", r1(pt.x)); c.setAttribute("cy", r1(pt.y));
    });
  }
  function tick(now) { playing.forEach((f) => runners(f, now)); raf = playing.size ? requestAnimationFrame(tick) : 0; }
  function setPlaying(fig, on) {
    on = !!on && !reduced();
    if (on === playing.has(fig)) return;
    fig.classList.toggle("play", on);
    if (on) playing.add(fig); else { playing.delete(fig); if (fig.dataset.x) runners(fig, null); }
    if (playing.size && !raf) raf = requestAnimationFrame(tick);
  }
  X.setPlaying = setPlaying;

  /* the floor: every figure rests on its last frame; the current one builds itself once */
  let auto = null, docent = false;
  const floorFig = (id) => document.querySelector(`#pc-${CSS.escape(id)} figure.xs`);
  X.initFloor = (world) => world.querySelectorAll(".pc figure.xs").forEach((f) => setStep(f, A.explain[f.dataset.x].floor, true));
  X.onCurrent = (id, prev) => {
    const hx = document.getElementById("hud-x"); if (hx) hx.innerHTML = "";
    if (auto) { clearTimeout(auto.t); const f = floorFig(auto.id); if (f && auto.id !== id) setStep(f, A.explain[auto.id].floor); auto = null; }
    if (prev && prev !== id && A.explain[prev]) { const f = floorFig(prev); if (f && +f.dataset.step !== A.explain[prev].floor) setStep(f, A.explain[prev].floor); }
    const fig = floorFig(id); if (!fig) return;
    const ex = A.explain[id];
    if (docent) return setStep(fig, 1, true);
    if (reduced()) return setStep(fig, ex.floor, true);
    let k = 1; setStep(fig, 1, true);
    const next = () => { if (++k <= ex.floor) { setStep(fig, k); auto = { id, t: setTimeout(next, 1700) }; } else auto = null; };
    auto = { id, t: setTimeout(next, 1200) };
  };
  X.setDocent = (on, id) => { docent = on; if (id && A.explain[id]) X.onCurrent(id); };
  X.stepFloor = (id, d) => {
    const fig = floorFig(id); if (!fig) return false;
    if (auto) { clearTimeout(auto.t); auto = null; }
    setStep(fig, +fig.dataset.step + d);
    const ex = A.explain[id], st = ex.steps[+fig.dataset.step - 1], live = document.getElementById("live");
    if (live) live.textContent = `${fig.dataset.step} / ${ex.steps.length}. ${st.label}: ${st.line}`;
    return true;
  };

  /* rooms: scrolling the step cards past the middle of the screen moves the figure; buttons and , . do the same */
  let io = null, roomFig = null, roomEl = null;
  const cardsOf = () => [...roomEl.querySelectorAll(".xr-card[data-k]:not([data-k='0'])")];
  function markCard(k) {
    roomEl.querySelectorAll(".xr-card").forEach((c) => c.toggleAttribute("data-now", +c.dataset.k === k));
    roomEl.querySelectorAll("[data-xgo]").forEach((b) => { if (!/^[+-]/.test(b.dataset.xgo)) b.toggleAttribute("aria-current", +b.dataset.xgo === k); });
  }
  function go(k) {
    if (!roomFig) return;
    const n = A.explain[roomFig.dataset.x].steps.length;
    k = Math.max(1, Math.min(n, k));
    const card = cardsOf()[k - 1];
    setStep(roomFig, k); markCard(k);
    if (card) card.scrollIntoView({ block: "center", behavior: reduced() ? "auto" : "smooth" });
  }
  X.mountRoom = (el) => {
    X.unmountRoom();
    roomEl = el;
    el.querySelectorAll("[data-full]").forEach((im) => { im.setAttribute(im.tagName === "image" ? "href" : im.tagName === "VIDEO" ? "poster" : "src", im.dataset.full); im.removeAttribute("data-full"); });
    el.querySelectorAll("figure.xs").forEach((f) => { if (!f.closest(".xr")) setStep(f, A.explain[f.dataset.x].floor, true); });
    el.querySelectorAll(".xm, .xm-wrap svg").forEach((f) => f.classList.toggle("play", !reduced()));
    const xr = el.querySelector(".xr"); if (!xr) return;
    roomFig = xr.querySelector("figure.xs");
    setStep(roomFig, 1, true); markCard(1); setPlaying(roomFig, true);
    io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { const k = +e.target.dataset.k; if (k) { setStep(roomFig, k); markCard(k); } } }),
      { root: el.closest("dialog"), rootMargin: "-46% 0px -46% 0px" });
    cardsOf().forEach((c) => io.observe(c));
    xr.addEventListener("click", (e) => {
      const b = e.target.closest("[data-xgo]"); if (!b) return;
      const v = b.dataset.xgo;
      go(/^[+-]/.test(v) ? +roomFig.dataset.step + +v : +v);
    });
  };
  X.unmountRoom = () => {
    if (io) io.disconnect(); io = null;
    if (roomFig) setPlaying(roomFig, false);
    roomFig = null; roomEl = null;
  };
  X.stepRoom = (d) => { if (!roomFig) return false; go(+roomFig.dataset.step + d); return true; };
  X.motion = () => {
    if (reduced()) [...playing].forEach((f) => setPlaying(f, false));
    else if (roomFig) setPlaying(roomFig, true);
    document.querySelectorAll(".xm, .xm-wrap svg").forEach((f) => f.classList.toggle("play", !reduced()));
  };
})();
