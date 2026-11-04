/* v6 (전사본): the pictures of Part 1's opening, 민성's story in block order (js/data.js, kind "story").
   Every label with a date or number comes from the piece's data (vis), each with its source line, which tools/check.py
   checks; this file only draws. The four metaphors (썰물, 하네스, 머리+손발, 가드레일) get exactly one picture each,
   marked data-metaphor (tests/test_v6.py counts them). Motion is CSS only and stops under reduced motion and the M toggle. */
(function () {
  const A = window.AR, R = window.ARR;
  if (!A || !R) return;
  const esc = R.esc;
  /* the transcript is read with the fact check's speech-recognition table (보완_전사본_사실검증.md (e)): LMM is LLM.
     " · " joins verbatim fragments of one line; on screen the gap is an ellipsis. */
  const said = (t) => t.replace(/LMM/g, "LLM").replace(/컨테스트/g, "컨텍스트").split(" · ").join(" … ");
  const voice = (v, cls = "") => `<blockquote class="st-voice ${cls}"><p>${esc(said(v.t))}</p><footer>워크숍 발표에서</footer></blockquote>`;
  const T = (x, y, t, cls = "", anchor = "middle") => `<text x="${x}" y="${y}" class="${cls}" text-anchor="${anchor}">${esc(t)}</text>`;
  const svg = (vb, body, label, cls = "") => `<svg class="st-svg ${cls}" viewBox="${vb}" role="img" aria-label="${R.raw(label)}">${body}</svg>`;

  /* ── 1. date: the day the word was coined ── */
  const date = (v) => `<div class="st-date"><p class="st-d">${esc(v.d)}</p><p class="st-en" lang="en">${esc(v.en)}</p><p class="st-ko"><span>우리말로</span><b>${esc(v.ko)}</b></p></div>`;

  /* ── 2. model: the model inside its chat environment, and three dates ── */
  function model(v) {
    const xs = [70, 300, 530];
    return svg("0 0 600 400", `
      <rect class="st-frame" x="60" y="26" width="480" height="190" rx="26"/>
      ${T(84, 58, "ChatGPT · 말을 걸 수 있게 씌운 환경", "st-cap", "start")}
      <rect class="st-core" x="210" y="86" width="180" height="96" rx="14"/>
      ${T(300, 132, "GPT", "st-big")}${T(300, 162, "모델", "st-cap")}
      <path class="st-axis" d="M40 300 H560"/>
      ${v.line.map((m, i) => `<circle class="st-dot" cx="${xs[i]}" cy="300" r="9"/>${T(xs[i], 278, m.d, "st-num")}${T(xs[i], 336, m.t, "st-lab")}`).join("")}`,
      "모델 GPT를 대화 환경 ChatGPT가 감싸는 그림. " + v.line.map((m) => `${m.d} ${m.t}`).join(", "));
  }

  /* ── 3. tide (metaphor 1): channels the sea fills unevenly; one is left for the visitor's own field ── */
  function tide(v) {
    const W = 1100, H = 640, base = 560, n = 6, gap = 26, cw = (W - 120 - gap * (n - 1)) / n;
    const lv = [0.78, 0.44, 0.64, 0.3, 0.55, 0.2];
    const wave = (x0, y, w, k) => { let d = `M${x0 - 40} ${y}`; for (let x = x0 - 40; x < x0 + w + 80; x += 20) d += ` Q${x + 10} ${y + (k ? -9 : 9)} ${x + 20} ${y}`; return d; };
    const ch = lv.map((l, i) => {
      const x = 60 + i * (cw + gap), top = base - l * 440, blank = i === n - 1;
      return `<g class="st-ch${blank ? " is-blank" : ""}" style="--i:${i}">
        <clipPath id="tc${i}"><rect x="${x}" y="40" width="${cw}" height="${base - 40}"/></clipPath>
        <rect class="st-ch-wall" x="${x}" y="40" width="${cw}" height="${base - 40}"/>
        <g clip-path="url(#tc${i})"><g class="st-water">
          <rect class="st-sea" x="${x - 60}" y="${top}" width="${cw + 120}" height="${base - top}"/>
          <path class="st-crest" d="${wave(x, top, cw, i % 2)}"/>
          <path class="st-crest is-2" d="${wave(x, top + 24, cw, (i + 1) % 2)}"/>
          <path class="st-crest is-3" d="${wave(x, top + 52, cw, i % 2)}"/>
        </g></g>
        ${blank ? T(x + cw / 2, base + 46, v.blank, "st-blank") : ""}</g>`;
    }).join("");
    return svg(`0 0 ${W} ${H}`, `<path class="st-ground" d="M30 ${base} H${W - 30}"/>${ch}`,
      "썰물 비유: 여섯 갈래의 물길에 물이 서로 다른 높이로 차오른다. 마지막 물길에는 '내 전공은?'이라고 적혀 있다.", "is-metaphor");
  }

  /* ── 4. deeper: bigger flattens, thinking climbs ── */
  function deeper(v) {
    const xs = [250, 335, 430, 520], ys = [210, 168, 118, 80];
    return svg("0 0 600 360", `
      <path class="st-axis" d="M40 300 H570 M40 300 V30"/>
      <path class="st-flat" d="M40 290 C120 200 170 168 230 160 S420 152 570 150"/>
      ${T(560, 140, "크게만: 스케일링의 벽", "st-lab", "end")}
      <path class="st-rise" d="M220 250 C300 230 380 150 560 52"/>
      ${T(560, 40, "추론: 더 깊게", "st-lab is-acc", "end")}
      ${v.marks.map((m, i) => `<circle class="st-dot is-acc" cx="${xs[i]}" cy="${ys[i] + 22}" r="8"/>${T(xs[i] - 6, ys[i] + 56 + (i % 2) * 26, m.d + " " + m.t, "st-tiny", "middle")}`).join("")}`,
      "그림: 크기만 키우는 곡선은 평평해지고, 추론 곡선은 가파르게 오른다. " + v.marks.map((m) => `${m.d} ${m.t}`).join(", "));
  }

  /* ── 5. fork: the LLM line splits; the agent branch carries the tools ── */
  function fork(v) {
    const mx = [300, 400, 500];
    return svg("0 0 620 380", `
      <path class="st-axis" d="M30 280 H600"/>${T(40, 312, "LLM의 발전", "st-lab", "start")}
      <path class="st-rise" d="M230 280 C300 280 320 150 600 140"/>${T(596, 120, "에이전트의 발전", "st-lab is-acc", "end")}
      ${v.tools.map((t, i) => `<g class="st-plug" style="--i:${i}"><path d="M${120 + i * 70} 230 V200"/><rect x="${92 + i * 70}" y="170" width="56" height="30" rx="8"/>${T(120 + i * 70, 191, t, "st-tag")}</g>`).join("")}
      ${T(230, 158, "도구를 붙인다", "st-cap")}
      ${v.marks.map((m, i) => `<circle class="st-dot is-acc" cx="${mx[i]}" cy="${[196, 166, 150][i]}" r="7"/>`).join("")}
      ${v.marks.map((m, i) => T(mx[i] - 40 + i * 40, 345 + (i % 2) * 22, m.d + " " + m.t, "st-tiny")).join("")}`,
      "LLM의 발전 선에서 에이전트의 발전이 갈라진다. 도구: " + v.tools.join(", ") + ". " + v.marks.map((m) => `${m.d} ${m.t}`).join(", "));
  }

  /* ── 6. define: the definition, set large; a loop runs round it ── */
  const define = (p) => `<div class="st-define"><p class="st-pre">${esc(p.vis.pre.t)},</p>
      <p class="st-def">${esc(said(p.voice[0].t)).replace("목적", "<b>목적</b>").replace("루프", "<b>루프</b>")}</p>
      <svg class="st-orbit" viewBox="0 0 200 200" aria-hidden="true"><circle cx="100" cy="100" r="86"/><path d="M186 100 l-10 -12 M186 100 l10 -12"/><circle class="st-runner" cx="100" cy="14" r="7"/></svg>
      <p class="st-post">${esc(said(p.voice[1].t))}</p><p class="st-by">이 워크숍의 정의</p></div>`;

  /* ── 7. harness (metaphor 2): the bridle on a horse's head, the reins, and the one lane ahead ── */
  function harness() {
    return svg("0 0 1100 680", `
      <g class="st-horse">
        <path class="st-h-neck" d="M300 618 L326 470 C330 450 336 438 350 450 M120 618 C150 480 180 330 212 230"/>
        <path class="st-h-mane" d="M244 132 C214 200 190 300 168 420 C160 470 150 540 138 618 M232 150 C206 240 186 330 172 410"/>
        <path class="st-h-out" d="M250 120 L268 28 L300 108 C330 120 350 140 368 160 C430 240 520 350 568 410 C590 438 596 470 582 492 C570 508 548 510 528 502 C522 516 508 530 488 530 C460 530 440 516 424 500 C400 480 370 470 350 450 C336 438 330 450 326 470 L300 618 L120 618 C150 480 180 330 212 230 C224 190 236 150 250 120 Z"/>
        <path class="st-h-in" d="M424 500 C382 470 354 420 362 360 C370 318 404 300 436 312 M540 446 C548 452 556 452 562 446 M528 502 C540 494 552 490 566 488"/>
        <circle class="st-h-eye" cx="372" cy="226" r="9"/>
      </g>
      <g class="st-bridle">
        <path d="M262 134 C292 152 322 160 354 152"/>
        <path d="M274 118 C312 230 400 380 512 488"/>
        <path d="M504 326 C482 384 462 446 450 506"/>
        <path class="is-thin" d="M262 144 C280 262 302 360 338 444"/>
        <circle class="st-bit" cx="514" cy="490" r="15"/>
      </g>
      <path class="st-rein" d="M512 498 C452 600 320 610 206 566"/>
      <path class="st-rail" d="M630 400 H1060 M630 560 H1060"/>
      <path class="st-lane" d="M606 480 H1036"/><path class="st-lane-head" d="M1040 480 l-28 -17 v34 Z"/>
      ${T(318, 92, "견장 = 하네스", "st-lab is-acc", "start")}
      ${T(254, 600, "고삐 · 방향타", "st-lab", "middle")}
      ${T(845, 386, "그 방향으로만", "st-lab", "middle")}
      ${T(232, 470, "모델", "st-big", "middle")}`,
      "하네스 비유: 말 머리에 견장이 물려 있고, 고삐가 방향을 잡으며, 앞쪽에는 두 줄의 난간 사이로 한 방향만 열려 있다.", "is-metaphor");
  }

  /* ── 8. anatomy (metaphor 3): a head that only thinks, given hands and feet; the hook keeps it moving ── */
  function anatomy(v) {
    const ends = [[230, 330], [870, 330], [360, 590], [740, 590]];
    const joints = [[440, 300], [660, 300], [500, 470], [600, 470]];
    return svg("0 0 1100 720", `
      <path class="st-turn" d="M220 370 a330 260 0 1 0 660 0 a330 260 0 1 0 -660 0"/>
      <circle class="st-runner is-turn" r="8"/>
      <circle class="st-head" cx="550" cy="200" r="100"/>
      <path class="st-brain" d="M492 176 C500 136 540 128 556 156 C570 128 618 138 612 182 C640 198 618 236 590 228 C578 250 522 252 514 226 C482 232 468 198 492 176 Z"/>
      ${T(550, 276, v.head + " · 머리", "st-lab")}
      <path class="st-body" d="M550 300 V470"/>
      ${ends.map(([x, y], i) => `<path class="st-limb" style="--i:${i}" d="M550 ${i < 2 ? 330 : 470} L${joints[i][0]} ${joints[i][1]} L${x} ${y}"/>
        <g class="st-hand" style="--i:${i}"><rect x="${x - 66}" y="${y - 24}" width="132" height="48" rx="12"/>${T(x, y + 7, v.hands[i], "st-tag")}</g>`).join("")}
      ${T(230, 288, "손", "st-cap")}${T(870, 288, "손", "st-cap")}${T(360, 644, "발", "st-cap")}${T(740, 644, "발", "st-cap")}
      <g class="st-note"><rect x="436" y="384" width="228" height="58" rx="6"/>${T(550, 408, v.rules, "st-tiny")}${T(550, 430, "규칙 = 하네스", "st-tiny")}</g>
      ${T(550, 78, v.prompt, "st-lab")}
      <path class="st-hook" d="M700 110 C820 50 960 110 940 220"/><path class="st-hook-tip" d="M940 220 l-16 -4 M940 220 l8 -14"/>
      ${T(980, 120, v.hook, "st-lab is-hook", "start")}
      ${T(550, 700, "턴: " + v.turn.join(" → "), "st-lab is-turn")}`,
      "머리와 손발 비유: 머리(" + v.head + ")에 손과 발로 도구 " + v.hands.join(", ") + "가 붙고, " + v.prompt + "와 " + v.rules + "가 규칙을 주며, " + v.hook + "가 멈추지 않게 다음 턴으로 민다. 턴: " + v.turn.join(", "), "is-metaphor");
  }

  /* ── 9. climb: one exam, four results, drawn to scale (0–100%) ── */
  function climb(v) {
    const x0 = 70, x1 = 590, y0 = 300, h = 250, bw = 74, step = (x1 - x0) / v.pts.length;
    return svg("0 0 620 380", `
      <path class="st-axis" d="M${x0 - 20} ${y0} H${x1 + 10}"/>
      <path class="st-grid" d="M${x0 - 20} ${y0 - h} H${x1 + 10} M${x0 - 20} ${y0 - h / 2} H${x1 + 10}"/>
      ${T(x0 - 26, y0 - h + 5, "100%", "st-tiny", "end")}${T(x0 - 26, y0 - h / 2 + 5, "50%", "st-tiny", "end")}
      ${v.pts.map((p, i) => { const x = x0 + i * step + (step - bw) / 2, bh = (p.v / 100) * h, last = i === v.pts.length - 1;
        return `<rect class="st-bar${last ? " is-acc" : ""}" style="--i:${i}" x="${x}" y="${y0 - bh}" width="${bw}" height="${bh}"/>
          ${T(x + bw / 2, y0 - bh - 12, p.v + v.unit, "st-num" + (last ? " is-acc" : ""))}${T(x + bw / 2, y0 + 30, p.t, "st-lab")}${T(x + bw / 2, y0 + 56, p.d, "st-tiny")}`; }).join("")}`,
      "HLE 점수 막대 그림: " + v.pts.map((p) => `${p.t} ${p.v}% (${p.d})`).join(", "));
  }

  /* ── 10. guardrail (metaphor 4): a lit circuit from question to answer, synapses cut, the signal goes astray ── */
  function guardrail() {
    const N = [[150, 340], [300, 220], [300, 460], [450, 160], [460, 340], [450, 520], [620, 230], [640, 420], [800, 300], [960, 300], [790, 560]];
    const E = [[0, 1], [0, 2], [1, 3], [1, 4], [2, 4], [2, 5], [3, 6], [4, 6], [4, 7], [5, 7], [6, 8], [7, 8], [8, 9], [7, 10], [5, 10]];
    const lit = new Set(["0-1", "1-4", "4-6", "6-8", "8-9", "0-2", "2-5", "5-10"]);
    const cut = new Set(["6-8"]);
    return svg("0 0 1100 680", `
      <path class="st-skull" d="M120 360 C110 170 300 70 520 80 C760 90 930 170 960 330 C990 470 900 610 700 620 C560 628 420 640 300 600 C180 560 126 470 120 360 Z"/>
      ${E.map(([a, b]) => { const k = `${a}-${b}`, [x1, y1] = N[a], [x2, y2] = N[b];
        if (cut.has(k)) { const mx = (x1 + x2) / 2, my = (y1 + y2) / 2, dx = (x2 - x1) * 0.1, dy = (y2 - y1) * 0.1;
          return `<path class="st-syn is-lit" d="M${x1} ${y1} L${mx - dx} ${my - dy}"/><path class="st-syn is-lit is-dead" d="M${mx + dx} ${my + dy} L${x2} ${y2}"/>
            <path class="st-cut" d="M${mx - 26} ${my - 30} L${mx + 26} ${my + 30} M${mx + 26} ${my - 30} L${mx - 26} ${my + 30}"/>`; }
        const cls = k === "0-2" || k === "2-5" || k === "5-10" ? " is-astray" : lit.has(k) ? " is-lit" : "";
        return `<path class="st-syn${cls}" d="M${x1} ${y1} L${x2} ${y2}"/>`; }).join("")}
      ${N.map(([x, y], i) => `<circle class="st-node${i === 9 ? " is-dead" : i === 10 ? " is-astray" : [0, 1, 4, 6, 8].includes(i) ? " is-lit" : ""}" cx="${x}" cy="${y}" r="${i === 9 || i === 10 || i === 0 ? 20 : 13}"/>`).join("")}
      <circle class="st-pulse" r="9"><animateMotion dur="3.2s" repeatCount="indefinite" path="M150 340 L300 220 L460 340 L620 230 L700 262"/></circle>
      <circle class="st-pulse is-astray" r="9"><animateMotion dur="3.2s" begin="1.6s" repeatCount="indefinite" path="M150 340 L300 460 L450 520 L790 560"/></circle>
      ${T(150, 396, "질문", "st-lab")}${T(380, 140, "빛나는 회로", "st-lab is-acc")}${T(712, 210, "잘린 시냅스", "st-lab is-cut")}
      ${T(960, 356, "답", "st-lab is-dim")}${T(790, 616, "환각", "st-big is-astray")}`,
      "가드레일 비유: 뇌 속 회로에서 질문부터 답까지 빛나던 길 가운데 시냅스가 잘려, 신호가 다른 길로 돌아가 '환각'에 닿는다.", "is-metaphor");
  }

  /* ── 11. rules: three things a beginner does before shipping ── */
  const rules = (v) => `<ol class="st-rules">${v.items.map((t, i) => `<li><i>${i + 1}</i><span>${esc(t)}</span></li>`).join("")}</ol>`;

  /* ── 12. intent: goal, done-condition, and the why at the centre ── */
  const intent = (p) => `<div class="st-intent">
      <div class="st-layers" aria-hidden="true">${p.vis.layers.map((l, i) => `<span class="st-layer" style="--i:${i}">${esc(l)}</span>`).join("")}<b>왜?</b></div>
      <p class="st-thesis">${esc(said(p.voice[0].t))}</p><p class="st-by">이 워크숍의 결론</p></div>`;

  const VIS = { date: (p) => date(p.vis), model: (p) => model(p.vis), tide: (p) => tide(p.vis), deeper: (p) => deeper(p.vis), fork: (p) => fork(p.vis),
    define, harness: () => harness(), anatomy: (p) => anatomy(p.vis), climb: (p) => climb(p.vis), guardrail: () => guardrail(), rules: (p) => rules(p.vis), intent };
  const vis = (p) => (p.vis && VIS[p.vis.type] ? `<div class="st-vis" data-vis="${p.vis.type}"${p.metaphor ? ` data-metaphor="${p.metaphor}"` : ""}>${VIS[p.vis.type](p)}</div>` : "");
  const ownsVoice = (p) => p.vis && ["define", "intent"].includes(p.vis.type);  /* the definition and the thesis are their own picture */
  /* a piece without a line of his (s-now: his figure for this exam is the one the fact check corrects) shows its lede */
  const first = (p, cls) => (p.voice && p.voice.length ? voice(p.voice[0], cls) : p.lede ? `<p class="st-lede">${esc(p.lede)}</p>` : "");

  /* floor: tier 1 = the picture at scale with its title and one line of his; tier 2 = a plate; tier 3 = a note */
  R.storyWork = (p, room) => `<div class="w w-story" data-vis="${p.vis ? p.vis.type : ""}">${vis(p)}
      <div class="w-text"><h3 class="w-title"${room ? "" : ` id="t-${p.id}"`}>${esc(p.title)}</h3>${ownsVoice(p) ? "" : first(p, "is-big")}</div></div>`;
  R.storyPlate = (p) => `<div class="pl pl-story">${p.vis ? `<div class="pl-vis">${vis(p)}</div>` : ""}<h3 class="pl-title" id="t-${p.id}">${esc(p.title)}</h3>${first(p)}</div>`;
  R.storyNote = (p) => `<div class="nt nt-story"><p class="nt-t" id="t-${p.id}">${esc(p.title)}</p>${first(p)}</div>`;
  /* room: the picture, then every line of his on this block; the facts follow in the usual list */
  /* the room opens on the title (and its one line or condition), then the picture, then every line of the talk */
  R.storyHero = (p) => `<div class="rm-lead st-lead"><h2 id="room-title">${esc(p.title)}</h2>${p.lede ? `<p class="rm-take">${esc(p.lede)}</p>` : ""}${p.cond ? `<p class="rm-cond">${esc(p.cond)}</p>` : ""}</div>
      ${vis(p)}<div class="st-voices">${(p.voice || []).filter((v, i) => !(ownsVoice(p) && i === 0 && p.vis.type === "intent")).map((v) => voice(v)).join("")}</div>
      ${p.id === "s-intent" ? `<p class="st-go"><button type="button" class="btn btn-acid" data-exit="flow">출구에서 시작하기: 의도 → 명세 → 검증</button></p>` : ""}
      ${p.id === "s-security" ? `<p class="st-go"><button type="button" class="btn" data-exit="setup">출구: 설치와 API 키 다루기</button></p>` : ""}`;
  R.said = said;
})();
