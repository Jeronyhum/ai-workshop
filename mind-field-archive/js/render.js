/* Renderers, v2: hierarchy instead of lists.
   tier 1  work   one picture or one number at scale; each work has its own visual form
   tier 2  plate  one figure or one image on top, a serif title, one line
   tier 3  note   a fragment of text; corrections show the struck original and the fix
   Contracts kept from MIND FIELD: every piece carries a status (shape + word) and its source file, quietly;
   a pair renders both sides or refuses; derived pictures say how they were derived. */
(function () {
  const A = window.AR;
  const R = (window.ARR = {});

  const raw = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  /* display text: straight quotes become typographic ones; attribute values use raw() */
  const esc = (s) => raw(String(s ?? "").replace(/"([^"]*)"/g, "“$1”").replace(/(^|[\s(\[「])'([^']*)'/g, "$1‘$2’"));
  R.esc = esc; R.raw = raw;
  const base = (f) => String(f).split("/").pop();
  const num = (v) => (typeof v === "number" ? v.toLocaleString("en-US") : esc(v));
  const tierOf = (p) => (A.layout[p.id] || {}).tier || 2;
  R.tier = tierOf;

  R.st = (st, small) => {
    const s = A.status[st];
    return `<span class="st${small ? " st-s" : ""}" data-st="${st}" title="${raw(s.note)}"><span class="sr-only">${s.mark} </span>${s.word}</span>`;
  };
  R.ref = (s) => (s ? [base(s.f), s.s, s.l ? ":" + s.l : "", s.by && !s.l && !s.s ? s.by : ""].filter(Boolean).join(" ") : "");
  const refFull = (s) => {
    const path = /^(refs|archive)\//.test(s.f) ? s.f : "refs/drive/" + s.f;
    return [path, s.s, s.l ? ":" + s.l : "", s.by && !s.l ? `(${s.by})` : ""].filter(Boolean).join(" ");
  };
  R.refFull = refFull;
  const zoneName = (z) => A.zones[z].name;
  const where = (p) => p.zone === "p2" ? (p.id === "paradigm" ? "고리의 중심" : A.rings.bands.find((b) => b.key === p.ring)?.name ?? "고리 바깥") : p.cluster ?? A.zones[p.zone].title;
  R.where = where;

  /* quiet provenance: shape + word + file, low contrast */
  const quiet = (p) => `<p class="q">${R.st(p.st, true)}<span class="q-ref">${esc(R.ref(p.src[0]))}</span></p>`;

  /* digits roll in the room (Jakubantalik MOTION.CSS: 500ms, overshoot, 70ms apart); a Korean qualifier stays small */
  const digits = (v) => {
    const m = String(v).match(/^([가-힣]+)\s*(.*)$/);
    const pre = m ? `<span class="pre">${esc(m[1])}</span>` : "";
    const body = m ? m[2] : String(v);
    return pre + [...body].map((c, i) => `<span class="dg" style="--i:${i}">${esc(c)}</span>`).join("");
  };
  const figure = (f, cls = "") => f ? `<p class="fig ${cls}"><b>${digits(f.v)}</b>${f.u ? `<small>${esc(f.u)}</small>` : ""}</p>` : "";

  /* ── derived pictures ───────────────────────────── */
  function cveRiver(p) {
    const v = A.viz.cve, rows = p.chart.rows, per = 12, pitch = 20, r = 7.2, colW = per * pitch, gap = 46;
    const counts = rows.map((x) => Math.round(x.v / v.unit));
    const hMax = Math.ceil(Math.max(...counts) / per) * pitch;
    const W = rows.length * (colW + gap) - gap, Hh = hMax + 70;
    let dots = "";
    counts.forEach((n, c) => {
      const x0 = c * (colW + gap), last = c === counts.length - 1;
      for (let k = 0; k < n; k++) {
        const row = Math.floor(k / per), col = k % per;
        dots += `<circle class="${last ? "is-now" : ""}" cx="${(x0 + col * pitch + pitch / 2).toFixed(0)}" cy="${(hMax - row * pitch - pitch / 2).toFixed(0)}" r="${r}"/>`;
      }
    });
    const labels = rows.map((x, c) => `<text x="${c * (colW + gap) + colW / 2}" y="${hMax + 44}" text-anchor="middle">${esc(x.k)}</text>`).join("");
    const sr = rows.map((x, i) => `${x.k} ${num(x.v)}건(점 ${counts[i]}개)`).join(", ");
    return `<svg class="river" viewBox="0 0 ${W} ${Hh}" role="img" aria-label="${raw(v.legend)}. ${raw(sr)}">${dots}${labels}</svg>`;
  }
  function laborField(p) {
    const theo = 90, obs = 34.3, pitch = 100, r = 38;
    let out = `<defs><clipPath id="part-${p.id}"><rect x="0" y="0" width="${(obs % 1) * 2 * r}" height="${2 * r}"/></clipPath></defs>`;
    for (let k = 0; k < 100; k++) {
      const cx = (k % 10) * pitch + pitch / 2, cy = Math.floor(k / 10) * pitch + pitch / 2;
      const cls = k < Math.floor(obs) ? "is-obs" : k < theo ? "is-theo" : "is-out";
      out += `<circle class="${cls}" cx="${cx}" cy="${cy}" r="${r}"/>`;
      if (k === Math.floor(obs)) out += `<g transform="translate(${cx - r} ${cy - r})"><circle class="is-obs" cx="${r}" cy="${r}" r="${r}" clip-path="url(#part-${p.id})"/></g>`;
    }
    return `<svg class="field" viewBox="0 0 1000 1000" role="img" aria-label="${raw(A.viz.labor.legend)}">${out}</svg>`;
  }
  function bokField() {
    const v = A.viz.bok, n = Math.round(v.total / v.unit), m = Math.round(v.part / v.unit), per = 19, pitch = 20;
    let out = "";
    for (let k = 0; k < n; k++) out += `<circle class="${k < m ? "is-obs" : "is-rest"}" cx="${(k % per) * pitch + 10}" cy="${Math.floor(k / per) * pitch + 10}" r="7.4"/>`;
    return `<svg class="field field-bok" viewBox="0 0 ${per * pitch} ${Math.ceil(n / per) * pitch}" role="img" aria-label="${raw(v.legend)}">${out}</svg>`;
  }
  function loopRing(p) {
    const n = p.steps.length, R0 = 300, c = 400;
    const pts = p.steps.map((s, i) => { const t = -Math.PI / 2 + (i * 2 * Math.PI) / n; return [c + R0 * Math.cos(t), c + R0 * Math.sin(t), s]; });
    const arcs = pts.map((a, i) => { const b = pts[(i + 1) % n]; return `<path d="M${a[0]} ${a[1]} A${R0} ${R0} 0 0 1 ${b[0]} ${b[1]}" pathLength="1" style="--i:${i}"/>`; }).join("");
    const nodes = pts.map((a, i) => `<g class="ln" style="--i:${i}"><circle cx="${a[0]}" cy="${a[1]}" r="18"/><text x="${a[0]}" y="${a[1] + (a[1] < c ? -40 : a[1] > c ? 66 : 8)}" text-anchor="${a[0] > c + 10 ? "start" : a[0] < c - 10 ? "end" : "middle"}" dx="${a[0] > c + 10 ? 34 : a[0] < c - 10 ? -34 : 0}">${esc(a[2])}</text></g>`).join("");
    return `<svg class="loopring" viewBox="-60 -40 920 900" role="img" aria-label="${raw(p.steps.join(" → "))} → ${raw(p.steps[0])}">${arcs}${nodes}</svg>`;
  }
  function gapScale(p) {
    const d = A.viz.paradigm.days, max = Math.sqrt(Math.max(...Object.values(d)));
    return `<ol class="gaps">${p.ladder.map((r) => `<li style="--s:${(Math.sqrt(d[r.k]) / max).toFixed(3)}"><b>${esc(r.name)}</b><span class="gap">${esc(r.gap)}</span><span class="ask">${esc(r.ask)}</span></li>`).join("")}</ol>`;
  }

  /* ── shared parts ───────────────────────────────── */
  function pairHTML(pair, room) {
    if (!pair || !pair.claim || !pair.counter) return `<div class="refusal" role="note"><b>짝 없음</b><p>조건 쌍의 한쪽만으로는 싣지 않습니다. 감사 B-2가 쌍 제시를 요구합니다.</p></div>`;
    const side = (d, cls) => `
      <div class="dip-side ${cls}">
        <p class="dip-num"><b>${digits(d.v)}</b><small>${esc(d.u)}</small></p>
        <p class="dip-who">${esc(d.who)}</p>
        <p class="dip-what">${esc(d.what)}</p>
        ${room ? `<p class="dip-vs">${esc(d.vs)}</p>${d.conds ? `<ul class="dip-conds">${d.conds.map((c) => `<li>${esc(c)}</li>`).join("")}</ul>` : ""}<p class="q">${R.st(d.st, true)}<span class="q-ref">${esc(R.ref(d.s))}${d.s.g ? ` · ${esc(d.s.g)}` : ""}</span></p>` : `<p class="q">${R.st(d.st, true)}</p>`}
      </div>`;
    return `<div class="dip">${side(pair.claim, "is-claim")}<div class="dip-mid" aria-hidden="true"><span>쌍으로만</span></div>${side(pair.counter, "is-counter")}</div>`;
  }
  function corrHTML(c, big) {
    return `<div class="cx${big ? " is-big" : ""}"><p class="cx-from"><s>${esc(c.from)}</s></p><p class="cx-to">${esc(c.to)}</p>${big ? `<p class="cx-why">${esc(c.why)}</p>` : ""}</div>`;
  }
  function voicesHTML(v, big) {
    if (!v || v.length < 2) return `<div class="refusal" role="note"><b>한쪽 목소리</b><p>양측을 함께 실을 때만 확정입니다.</p></div>`;
    return `<div class="voices${big ? " is-big" : ""}">${v.map((s) => `<blockquote><p class="vc-who">${esc(s.who)}</p>${big ? `<p class="vc-t">${esc(s.t)}</p><p class="q"><span class="q-ref">${esc(R.ref(s.s))}</span></p>` : ""}</blockquote>`).join("")}</div>`;
  }
  function chartHTML(c, big) {
    if (c.type === "bars") {
      return `<figure class="ch ch-bars" role="img" aria-label="${raw(c.unit)}: ${c.rows.map((r) => `${r.k} ${num(r.v)}`).join(", ")}">
        ${c.rows.map((r, i) => `<div class="ch-row" style="--v:${(r.v / c.max) * 100}%;--i:${i}"><span>${esc(r.k)}</span><i></i><b>${num(r.v)}${c.max <= 100 ? "%" : ""}</b></div>`).join("")}
        <figcaption>${esc(c.unit)}${big ? ` <span class="q-ref">${esc(R.ref(c.s))}</span>` : ""}</figcaption></figure>`;
    }
    if (c.type === "line") {
      const w = 300, h = 160, pad = 28;
      const pts = c.rows.map((r, i) => [pad + (i * (w - 2 * pad)) / (c.rows.length - 1), h - pad - (r.v / c.max) * (h - 2 * pad)]);
      return `<figure class="ch ch-line" role="img" aria-label="${raw(c.unit)}: ${c.rows.map((r) => `${r.k} ${r.approx ? "약 " : ""}${r.v}%`).join(", ")}">
        <svg viewBox="0 0 ${w} ${h}" aria-hidden="true">
          <line class="ch-ceil" x1="${pad}" x2="${w - pad}" y1="${pad}" y2="${pad}"/>
          <polyline points="${pts.map((p) => p.join(",")).join(" ")}" pathLength="1"/>
          ${pts.map((p, i) => `<circle cx="${p[0]}" cy="${p[1]}" r="5"/><text x="${p[0]}" y="${p[1] - 12}" text-anchor="middle">${c.rows[i].approx ? "약 " : ""}${c.rows[i].v}</text><text class="ch-k" x="${p[0]}" y="${h - 6}" text-anchor="middle">${esc(c.rows[i].k)}</text>`).join("")}
        </svg><figcaption>${esc(c.unit)}${big ? ` <span class="q-ref">${esc(R.ref(c.s))}</span>` : ""}</figcaption></figure>`;
    }
    if (c.type === "price") {
      const max = Math.max(...c.rows.map((r) => r.v));
      return `<figure class="ch ch-price" role="img" aria-label="${raw(c.unit)}: ${c.rows.map((r) => `${r.k} ${r.m} $${r.v}`).join(", ")}">
        ${c.rows.map((r, i) => `<div class="ch-row${r.hi ? " is-hi" : ""}" style="--v:${(r.v / max) * 100}%;--i:${i}"><span>${big ? `${esc(r.k)} ` : ""}${esc(r.m)}</span><i></i><b>$${r.v}${big ? ` / $${r.o}` : ""}</b></div>`).join("")}
        <figcaption>${esc(c.unit)}${big ? " / 출력" : ""}${big ? ` <span class="q-ref">${esc(R.ref(c.s))}</span>` : ""}</figcaption></figure>`;
    }
    return "";
  }
  const mediaSrc = (m) => (m.type === "video" ? m.poster : m.src);
  function screen(m, { ambient = false, controls = false } = {}) {
    if (!m) return "";
    if (m.type === "video") {
      return `<div class="scr is-video"><video ${ambient ? 'class="amb" muted loop' : "controls"} playsinline preload="none" poster="${raw(m.poster)}" src="${raw(m.src)}" aria-label="${raw(m.by ? m.by.label + " 게시 영상" : "영상")}"></video>${ambient ? `<span class="scr-play" aria-hidden="true"></span>` : ""}</div>`;
    }
    return `<div class="scr${m.gen ? " is-gen" : ""}"><img src="${raw(m.src)}" alt="${raw(m.gen ? "생성 이미지, 디자인 에셋" : (m.by ? m.by.label + " 게시 이미지. " : "") + m.cap)}" loading="lazy" decoding="async"></div>`;
  }
  R.screen = screen;
  function credit(m) {
    const by = m.by ? `<a class="cr-by" href="${raw(m.by.url)}" target="_blank" rel="noopener noreferrer">${esc(m.by.kind)} ${esc(m.by.label)}</a>` : "";
    const tag = m.gen ? `<span class="gen-tag">${esc(m.cap)}</span>` : R.st("unverified", true);
    return `<figcaption class="cr">${tag}${m.gen ? "" : `<span class="cr-cap">${esc(m.cap)}</span>`}${by}${m.capSrc ? `<span class="q-ref">문구 출처 ${esc(m.capSrc)}</span>` : ""}${m.loc ? `<span class="q-ref">원본 위치 ${esc(m.loc)}</span>` : ""}</figcaption>`;
  }
  const emphasize = (text, em) => {
    const t = esc(text); if (!em) return t;
    const e = esc(em); return t.includes(e) ? t.replace(e, `<em>${e}</em>`) : t;
  };

  /* ── tier 1: works ─────────────────────────────── */
  function work(p, room) {
    if (!room && R.xFloor && A.explain && A.explain[p.id]) return R.xFloor(p);  /* v4: Part 2 explainers (js/explain.js) */
    const t = `<h3 class="w-title"${room ? "" : ` id="t-${p.id}"`}>${esc(p.title)}</h3>`;
    const lede = p.lede ? `<p class="w-lede">${esc(p.lede)}</p>` : "";
    switch (p.id) {
      case "claudia": case "graph":
        return `<div class="w w-screen">${screen(p.media[0], { ambient: !room })}<div class="w-text">${t}${lede}</div></div>`;
      case "accounting":
        return `<div class="w w-dip">${t}<div class="dip-wrap">${pairHTML(p.pair, room)}${room ? "" : `<div class="w-collage">${screen(p.media[0])}</div>`}</div>${lede}</div>`;
      case "labor":
        return `<div class="w w-dots"><div class="dots-vis">${laborField(p)}</div>${room ? "" : `<div class="w-collage">${screen(p.media.find((m) => m.src.endsWith("anthropic-lab.jpg")))}</div>`}
          <div class="dots-key"><p class="fig is-obs"><b>${digits("34.3")}</b><small>%</small></p><p class="cap">실제 관측 커버리지</p>
          <p class="fig is-theo"><b>${digits("약 90")}</b><small>%</small></p><p class="cap">이론적 커버리지 (사무·행정 직군)</p></div>
          <div class="w-text">${t}${lede}<p class="legend">${esc(A.viz.labor.legend)}</p></div></div>`;
      case "cve":
        return `<div class="w w-river"><div class="river-head"><p class="fig"><b>${digits("72,812")}</b></p><p class="cap">2026 Q1–Q3 발표된 CVE 레코드. Q4 미집계</p></div>
          ${cveRiver(p)}<div class="w-text">${t}<p class="w-lede">${esc(p.lede)}</p><p class="legend">${esc(A.viz.cve.legend)}</p></div></div>`;
      case "paradigm":
        return `<div class="w w-gaps">${t}${gapScale(p)}<p class="w-lede">${esc(p.lede)}</p><p class="legend">${esc(A.viz.paradigm.legend)}</p></div>`;
      case "harness":
        return `<div class="w w-eq"><p class="eq" lang="en"><span>Agent</span><i>=</i><span>Model</span><i>+</i><span class="is-h">Harness</span></p>${t}${lede}
          <div class="eq-strip">${p.media.map((m) => `<img src="${raw(m.src)}" alt="" loading="lazy">`).join("")}</div></div>`;
      case "loop":
        return `<div class="w w-loop"><div class="loop-vis">${loopRing(p)}</div><div class="w-text">${t}${lede}</div></div>`;
      default:
        if (p.zone === "br") return `<div class="w w-bridge"><p class="w-kicker"${room ? "" : ` id="t-${p.id}"`}>${esc(p.title)}</p><blockquote class="bq"><p>${emphasize(p.quote, p.em)}</p></blockquote></div>`;
        return plate(p, room);
    }
  }

  /* ── tier 2: plates ────────────────────────────── */
  function plateVis(p) {
    if (p.id === "promptdead" && R.xGlyph) return R.xGlyph();
    if (p.id === "bok") return `<div class="pl-dots">${bokField()}</div>${figure(p.fig)}`;
    if (p.id === "glossary") return `<p class="cloud">${p.terms.map((t, i) => `<span style="--k:${[3, 1, 2, 1, 2, 3, 1, 2, 1, 2, 2, 1, 1, 3, 3, 2, 1][i]}">${esc(t[0])}</span>`).join(" ")}</p>`;
    switch (p.kind) {
      case "pair": return `<div class="pl-pair">${["claim", "counter"].map((k) => `<p class="fig is-${k}"><b>${digits(p.pair[k].v)}</b><small>${esc(p.pair[k].u)}</small></p>`).join(`<span class="pl-vs" aria-hidden="true"></span>`)}</div>`;
      case "chart": return (p.fig ? figure(p.fig) : "") + chartHTML(p.chart, false);
      case "stat": return figure(p.fig);
      case "media": return (p.fig ? figure(p.fig) : "") + screen(p.media[0], { ambient: ["motionso", "astra3d", "motionprompts", "approval"].includes(p.id) });
      default:
        if (p.media) return screen(p.media[0]);
        return `<p class="pull">${esc(p.lede)}</p>`;
    }
  }
  function plate(p) {
    const vis = plateVis(p);
    const showLede = p.lede && !/class="pull"/.test(vis);
    return `<div class="pl"><div class="pl-vis">${vis}</div><h3 class="pl-title" id="t-${p.id}">${esc(p.title)}</h3>${showLede ? `<p class="pl-lede">${esc(p.lede)}</p>` : ""}</div>`;
  }

  /* ── tier 3: notes ─────────────────────────────── */
  function note(p) {
    if (p.corr) return `<div class="nt">${corrHTML(p.corr, false)}<span class="sr-only" id="t-${p.id}">${esc(p.title)}</span></div>`;
    return `<div class="nt"><p class="nt-t" id="t-${p.id}">${esc(p.title)}</p>${p.lede ? `<p class="nt-l">${esc(p.lede)}</p>` : ""}</div>`;
  }

  R.piece = (p) => {
    const t = tierOf(p);
    return (t === 1 ? work(p, false) : t === 2 ? plate(p) : note(p)) + quiet(p);
  };

  /* thumbnail for neighbour tiles and the HUD */
  R.thumb = (p) => {
    if (R.xThumb && A.explain && A.explain[p.id]) return R.xThumb(p);
    if (p.media && p.media[0]) return `<span class="th-img"><img src="${raw(mediaSrc(p.media[0]))}" alt="" loading="lazy"></span>`;
    if (p.fig) return `<span class="th-fig">${esc(p.fig.v)}<small>${esc(p.fig.u)}</small></span>`;
    if (p.pair) return `<span class="th-fig">${esc(p.pair.claim.v)}<small>${esc(p.pair.claim.u)}</small> <i>/</i> ${esc(p.pair.counter.v)}<small>${esc(p.pair.counter.u)}</small></span>`;
    if (p.corr) return `<span class="th-corr"><s>${esc(p.corr.from)}</s></span>`;
    if (p.id === "cve") return `<span class="th-fig">72,812</span>`;
    return `<span class="th-word">${esc(p.title)}</span>`;
  };

  /* ── room: hero → title and one line → condition → facts → images → quiet sources → neighbours ── */
  function hero(p) {
    const t = tierOf(p);
    if (t === 1 && p.zone !== "br") return work(p, true) + (["claudia", "graph"].includes(p.id) ? credit(p.media[0]) : "");
    switch (p.kind) {
      case "quote": return `<blockquote class="bq is-room"><p>${emphasize(p.quote, p.em)}</p></blockquote>`;
      case "pair": return pairHTML(p.pair, true);
      case "correction": return corrHTML(p.corr, true) + (p.quote ? `<blockquote class="en-quote" lang="en"><p>${esc(p.quote)}</p></blockquote>` : "");
      case "voices": return voicesHTML(p.voices, true);
      case "chart": return `<div class="hero-split">${figure(p.fig, "is-hero")}${chartHTML(p.chart, true)}</div>`;
      case "stat": return p.id === "bok" ? `<div class="hero-split">${figure(p.fig, "is-hero")}<div class="pl-dots">${bokField()}</div></div>` : figure(p.fig, "is-hero") + (p.corr ? corrHTML(p.corr, true) : "");
      case "glossary": return `<dl class="gloss">${p.terms.map((t) => `<div><dt>${esc(t[0])}</dt><dd>${esc(t[1])} <span class="q-ref">:${t[2]}</span></dd></div>`).join("")}</dl>`;
      case "gap": return `<div class="gap-frame"><span>감사 (a) 1-41: 누락</span></div>`;
      case "media": return `<div class="hero-media">${p.fig ? figure(p.fig, "is-hero") : ""}${screen(p.media[0], { controls: true })}${credit(p.media[0])}</div>`;
      default: return p.media ? `<div class="hero-media">${screen(p.media[0], { controls: true })}${credit(p.media[0])}</div>` : `<p class="pull is-hero">${esc(p.lede)}</p>`;
    }
  }
  R.room = (p, near) => {
    const s = A.status[p.st], t = tierOf(p);
    const xr = R.xRoom && A.explain && A.explain[p.id];  /* v4: the explainer is the hero; text waits behind "원문" */
    const heroMedia = !xr && (t === 1 && ["claudia", "graph"].includes(p.id)) || ["media"].includes(p.kind) || (!["pair", "chart", "stat", "correction", "voices", "glossary", "gap", "quote"].includes(p.kind) && t !== 1 && p.media);
    const restMedia = (p.media || []).slice(heroMedia ? 1 : 0);
    const ledeInHero = t === 1 || (!p.media && ["sheet", "drawing"].includes(p.kind));
    const rows = (p.rows || []).map((r, i) => `
      <li class="fact" style="--i:${i}">${R.st(r.st, true)}<p class="fact-t">${r.st === "excluded" ? `<s>${esc(r.t)}</s>` : esc(r.t)}</p><p class="q-ref">${esc(R.ref(r.s))}${r.s.g ? ` · ${esc(r.s.g)}` : ""}</p></li>`).join("");
    const timeline = p.timeline && !xr ? `<section class="rm-tl" aria-label="종합 타임라인"><h3>날짜가 있는 사건만</h3><ol>${p.timeline.map((x, i) => `<li style="--i:${i}"><time>${esc(x[0])}</time><span>${esc(x[1])}</span></li>`).join("")}</ol><p class="q-ref">${esc(refFull({ f: "package_1105/P2_엔지니어링패러다임.md", s: "§9", l: 200 }))}</p></section>` : "";
    const groups = {};
    (p.links || []).forEach((l) => (groups[l.kind] ||= []).push(l));
    const order = ["공식", "논문", "기사", "YouTube", "X 원본", "X 게시물"];
    const links = Object.keys(groups).sort((a, b) => order.indexOf(a) - order.indexOf(b)).map((k) => `
      <div class="lk"><h4>${esc(k)}</h4><ul>${groups[k].map((l) => `<li><a href="${raw(l.url)}" target="_blank" rel="noopener noreferrer" data-kind="${raw(k)}">${esc(l.label)}</a></li>`).join("")}</ul></div>`).join("");
    const nearHTML = near.map((n) => `
      <li><button type="button" class="near" data-go="${n.id}" data-zone="${n.p.zone}">
        <span class="near-vis">${R.thumb(n.p)}</span>
        <span class="near-why">${esc(n.why)}</span>
        <span class="near-t">${esc(n.p.title)}</span>
        <span class="near-z">${esc(zoneName(n.p.zone))} ${esc(where(n.p))}</span>
      </button></li>`).join("");
    return `
      <header class="rm-top">
        <p class="rm-where"><span class="zone-tag" data-zone="${p.zone}">${esc(zoneName(p.zone))}</span><span>${esc(where(p))}</span></p>
        <button type="button" class="btn btn-quiet room-x" data-close>바닥으로 <kbd>Esc</kbd></button>
      </header>
      ${xr ? R.xRoom(p) + R.xExtras(p) : `<section class="rm-hero" data-tier="${t}" data-kind="${p.kind}">${hero(p)}</section>`}
      ${xr ? `<details class="rm-raw"><summary>원문과 사실 <b>${(p.rows || []).length + (p.lede ? 1 : 0)}</b></summary>
        ${p.lede ? `<p class="rm-take">${esc(p.lede)}</p>` : ""}
        ${p.cond ? `<p class="rm-cond">${esc(p.cond)}</p>` : ""}
        ${rows ? `<ul class="facts">${rows}</ul>` : ""}</details>` : `
      <div class="rm-lead">
        <h2 id="room-title">${esc(p.title)}</h2>
        ${p.lede && !ledeInHero ? `<p class="rm-take">${esc(p.lede)}</p>` : ""}
        ${p.cond ? `<p class="rm-cond">${esc(p.cond)}</p>` : ""}
      </div>
      ${rows ? `<ul class="facts">${rows}</ul>` : ""}`}
      ${restMedia.length ? `<section class="rm-media" aria-label="자료 이미지와 영상">${restMedia.map((m) => `<figure class="mi">${screen(m, { controls: true })}${credit(m)}</figure>`).join("")}</section>` : ""}
      ${timeline}
      <footer class="rm-src">
        <p class="rm-st">${R.st(p.st, true)}<span>${esc(s.note)}</span></p>
        <div class="rm-src-cols">
          <section aria-label="출처"><h3>출처</h3><ul>${p.src.map((x) => `<li><span class="q-ref">${esc(refFull(x))}</span>${x.g ? ` <span class="gate">${esc(x.g)}</span>` : ""}</li>`).join("")}</ul></section>
          ${links ? `<section aria-label="연결 자료"><h3>연결 자료</h3>${links}</section>` : ""}
        </div>
      </footer>
      <nav class="rm-near" aria-label="이웃 조각">
        <h3>이웃 조각 <span><kbd>←</kbd> 돌아가기 <kbd>→</kbd> 다음 이웃</span></h3>
        <ol>${nearHTML}</ol>
      </nav>`;
  };

  R.row = (p) => `
    <li class="ix-row" data-zone="${p.zone}" data-tier="${tierOf(p)}"><button type="button" data-open="${p.id}">
      ${R.st(p.st, true)}<span class="ix-t">${esc(p.title)}</span><span class="ix-ref q-ref">${esc(R.ref(p.src[0]))}</span>
    </button></li>`;
})();
