/* v6: 출구 (the exit). The exhibition ends on a decision: "오늘 뭘 만들고 싶은가?".
   Floor: a wall at the end of the world with the question, five starting paths, the six-step working loop and the words.
   Dialog (#exit, key 5, or T for the words): pick a path → the words it needs (each opens its definition) → the setup steps.
   Data: js/exit-data.js (the installer repo, verbatim where quoted) and js/glossary.js (shared with the term popovers). */
(function () {
  const A = window.AR, R = window.ARR, E = A.exit, Gl = A.glossary;
  if (!E || !Gl) return;
  const $ = (s, el = document) => el.querySelector(s);
  const esc = R.esc, raw = R.raw;
  const term = (id) => Gl.find((g) => g.id === id);
  const dlg = $("#exit"), body = $("#exit-in");

  /* glyphs: one small drawing per path and per core word, 48×48, stroke only, so they read as a set */
  const G = {
    club: '<circle cx="16" cy="18" r="6"/><circle cx="32" cy="18" r="6"/><path d="M6 38c1-7 5-10 10-10s9 3 10 10M22 38c1-7 5-10 10-10s9 3 10 10"/>',
    folio: '<rect x="7" y="9" width="34" height="30" rx="2"/><path d="M7 32l10-9 8 7 6-5 10 8"/><circle cx="31" cy="18" r="3"/>',
    auto: '<path d="M38 24a14 14 0 1 1-4-9.9"/><path d="M38 9v6h-6"/><path d="M24 16v8l6 4"/>',
    info: '<circle cx="21" cy="21" r="11"/><path d="M29 29l11 11M16 18h10M16 23h7"/>',
    unsure: '<circle cx="24" cy="24" r="16"/><path d="M19 19a5 5 0 1 1 7 4.6c-1.4.6-2 1.6-2 3.4"/><circle cx="24" cy="32.5" r="1.2"/>',
    vibe: '<path d="M5 28c4-8 8-8 12 0s8 8 12 0 8-8 12 0"/><path d="M5 20c4-8 8-8 12 0s8 8 12 0 8-8 12 0" opacity=".45"/>',
    prompt: '<path d="M8 10h32v20H22l-8 7v-7H8z"/><path d="M14 17h20M14 23h12"/>',
    context: '<rect x="7" y="9" width="34" height="30" rx="3"/><path d="M13 16h4M21 16h4M29 16h6M13 23h8M25 23h4M13 30h4M21 30h10"/>',
    token: '<rect x="5" y="19" width="8" height="10" rx="1"/><rect x="15" y="19" width="8" height="10" rx="1"/><rect x="25" y="19" width="8" height="10" rx="1"/><rect x="35" y="19" width="8" height="10" rx="1"/>',
    agent: '<circle cx="24" cy="24" r="6"/><path d="M38 24a14 14 0 1 1-4-9.9"/><path d="M38 10v5h-5"/>',
    harness: '<rect x="10" y="10" width="28" height="28" rx="4"/><circle cx="24" cy="24" r="5"/><path d="M24 4v6M24 38v6M4 24h6M38 24h6"/>',
    loop: '<path d="M34 14a13 13 0 1 0 3 12"/><path d="M28 13l6 1-1 6"/><circle cx="24" cy="24" r="2"/>',
    tool: '<path d="M14 34l12-12"/><circle cx="31" cy="17" r="7"/><path d="M10 38l6-6"/>',
    mcp: '<path d="M16 6v10M32 6v10"/><rect x="11" y="16" width="26" height="12" rx="3"/><path d="M24 28v8a6 6 0 0 0 6 6h6"/>',
    api: '<rect x="5" y="14" width="14" height="20" rx="2"/><rect x="29" y="14" width="14" height="20" rx="2"/><path d="M19 20h10M25 16l4 4-4 4M29 28H19M23 24l-4 4 4 4"/>',
    apikey: '<circle cx="15" cy="24" r="8"/><path d="M23 24h20M37 24v6M42 24v5"/>',
    repo: '<path d="M6 14h13l4 5h19v19H6z"/><path d="M6 19h36"/>',
    github: '<circle cx="14" cy="10" r="4"/><circle cx="14" cy="38" r="4"/><circle cx="34" cy="18" r="4"/><path d="M14 14v20M34 22c0 8-10 7-18 13"/>',
    terminal: '<rect x="5" y="9" width="38" height="30" rx="3"/><path d="M12 19l6 5-6 5M22 30h12"/>',
    deploy: '<path d="M24 34V10M15 19l9-9 9 9"/><path d="M8 38h32"/>',
    spec: '<path d="M11 6h18l8 8v28H11z"/><path d="M29 6v8h8M16 22h16M16 28h16M16 34h10"/>',
    diff: '<rect x="6" y="9" width="36" height="13" rx="2"/><rect x="6" y="26" width="36" height="13" rx="2"/><path d="M11 15.5h6M14 12.5v6M11 32.5h6"/>',
    skill: '<rect x="12" y="6" width="26" height="32" rx="2"/><path d="M8 12v30h24"/><path d="M18 14h14M18 20h14M18 26h9"/>',
    agentsmd: '<path d="M11 6h18l8 8v28H11z"/><path d="M29 6v8h8"/><path d="M17 34l5-14 5 14M19 29h6"/>',
  };
  const glyph = (k, cls = "ex-glyph") => (G[k] ? `<svg class="${cls}" viewBox="0 0 48 48" aria-hidden="true" focusable="false">${G[k]}</svg>` : "");
  const credit = (g) => (g.s ? (/^ai-workshop\//.test(g.s.f) ? "근거: 워크숍 설치기 저장소" : `근거: ${R.srcLabel(g.s)}`) : "일반 설명 (자료에 정의 없음)");
  const chip = (id, focusable = true) => { const g = term(id); return g ? (focusable ? `<button type="button" class="term chip" data-term="${id}" aria-describedby="term-tip">${glyph(id, "chip-g")}${esc(g.term)}</button>` : `<span class="chip">${glyph(id, "chip-g")}${esc(g.term)}</span>`) : ""; };
  const stepById = (id) => E.install.steps.find((s) => s.id === id) || E.flow.find((f) => f.id === id);

  /* ── floor: the wall at the end ──────────────────── */
  function buildWall() {
    const z = A.zones.exit, world = $("#world");
    if (!z || !world) return;
    const wall = document.createElement("div");
    wall.className = "exit-wall";
    wall.style.cssText = `left:${z.x + 140}px;top:240px;width:${z.w - 280}px`;
    const loop = E.flow, R0 = 190, cx = 230, cy = 230;
    const nodes = loop.map((f, i) => { const a = -Math.PI / 2 + (i * 2 * Math.PI) / loop.length; return [cx + R0 * Math.cos(a), cy + R0 * Math.sin(a), f]; });
    const ring = `<svg class="ex-loop" viewBox="0 0 460 460" aria-hidden="true">
      <circle cx="${cx}" cy="${cy}" r="${R0}" class="ex-ring"/>
      ${nodes.map(([x, y, f], i) => `<g class="ex-node" style="--i:${i}"><circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="34"/><text x="${x.toFixed(1)}" y="${(y + 7).toFixed(1)}" text-anchor="middle">${esc(f.k)}</text></g>`).join("")}
      <text x="${cx}" y="${cy - 6}" text-anchor="middle" class="ex-loop-t">한 바퀴</text><text x="${cx}" y="${cy + 26}" text-anchor="middle" class="ex-loop-s">AGENTS.md</text></svg>`;
    wall.innerHTML = `
      <p class="ex-kicker">출구</p>
      <h2 class="ex-q">${esc(E.question)}</h2>
      <p class="ex-lead">${esc(E.lead)}</p>
      <div class="ex-paths">${E.paths.map((p) => `<span class="ex-path" data-exit="path-${p.id}">${glyph(p.glyph)}<b>${esc(p.name)}</b><small>${esc(p.sub)}</small></span>`).join("")}</div>
      <div class="ex-row">
        <div class="ex-words" data-exit="terms"><h3>먼저 알아 둘 낱말</h3><p>${Gl.filter((g) => g.core).sort((a, b) => a.core - b.core).map((g) => `<span>${esc(g.term.replace(/ \(.*\)$/, ""))}</span>`).join("")}</p></div>
        <div class="ex-setup" data-exit="setup"><h3>원클릭 설치기</h3>${ring}</div>
      </div>
      <button type="button" class="exit-open" data-exit="">출구로 들어가기 <kbd>5</kbd></button>`;
    world.appendChild(wall);
  }

  /* ── dialog ────────────────────────────────────── */
  function pathPanel(p) {
    const steps = p.steps.map(stepById).filter(Boolean);
    return `<div class="ex-panel" id="ex-panel-${p.id}" role="region" aria-label="${raw(p.name)}: 필요한 낱말과 순서">
      <div class="ex-panel-col"><h4>필요한 낱말</h4><p class="ex-chips">${p.terms.map((id) => chip(id)).join("")}</p>
        <h4>설치할 때 고를 분류</h4><p class="ex-pick"><b>${esc(p.pick)}</b> <span>설치기 마지막 단계에서 고르는 분류입니다</span></p>
        ${p.example ? `<h4>첫 대화에 쓸 한 문장 ${p.exampleSrc ? "(설치기 예시)" : "(예시)"}</h4><p class="ex-say">“${esc(p.example)}”</p>` : ""}
        ${p.coach ? `<h4>그럼 이렇게 시작해요</h4><p class="ex-say">코치 스킬이 먼저 질문합니다. AGENTS.md: “${esc(p.coach.t)}”</p>` : ""}</div>
      <div class="ex-panel-col"><h4>따라 할 순서</h4><ol class="ex-steps">${steps.map((s) => `<li><a href="#ex-${s.id}" data-jump-ex="ex-${s.id}"><b>${esc(s.k ? `${s.k} · ${s.tool}` : s.t)}</b><span>${esc(s.plain)}</span></a></li>`).join("")}</ol></div>
    </div>`;
  }
  function build() {
    const core = Gl.filter((g) => g.core).sort((a, b) => a.core - b.core);
    const I = E.install;
    const loop = E.flow;
    const n = loop.length, R0 = 210, c = 260;
    const pts = loop.map((f, i) => { const a = -Math.PI / 2 + (i * 2 * Math.PI) / n; return [c + R0 * Math.cos(a), c + R0 * Math.sin(a), f]; });
    const arcs = pts.map((p, i) => { const q = pts[(i + 1) % n]; return `<path d="M${p[0].toFixed(1)} ${p[1].toFixed(1)} A${R0} ${R0} 0 0 1 ${q[0].toFixed(1)} ${q[1].toFixed(1)}" pathLength="1" style="--i:${i}"/>`; }).join("");
    body.innerHTML = `
      <header class="ex-head">
        <p class="ex-top"><span class="zone-tag" data-zone="exit">출구</span><button type="button" class="btn ex-x" data-close>바닥으로 <kbd>Esc</kbd></button></p>
        <h2 id="exit-title">${esc(E.question)}</h2>
        <p class="ex-lead">${esc(E.lead)}</p>
        <div class="ex-choose" role="group" aria-label="시작할 길 고르기">${E.paths.map((p, i) => `<button type="button" class="ex-card" data-path="${p.id}" aria-pressed="${i === 0}" aria-controls="ex-panel-${p.id}">${glyph(p.glyph)}<b>${esc(p.name)}</b><small>${esc(p.sub)}</small></button>`).join("")}</div>
        ${E.paths.map((p, i) => pathPanel(p).replace('class="ex-panel"', `class="ex-panel"${i ? " hidden" : ""}`)).join("")}
      </header>
      <section class="ex-sec" id="ex-terms" aria-labelledby="ex-terms-h">
        <h3 id="ex-terms-h">먼저 알아 둘 낱말 <small>${core.length}개. 사이트 어디서든 점선 밑줄 낱말에 마우스를 올리거나 Tab으로 가면 같은 설명이 뜹니다</small></h3>
        <ul class="ex-terms">${core.map((g) => `<li class="ex-term" id="term-${g.id}">${glyph(g.id)}<h4>${esc(g.term)}</h4><p>${esc(g.plain)}</p>${g.voice ? `<p class="ex-voice">민성: “${esc((R.said || ((t) => t))(g.voice.t))}”</p>` : ""}<small>${esc(credit(g))}</small></li>`).join("")}</ul>
      </section>
      <section class="ex-sec" id="ex-setup" aria-labelledby="ex-setup-h">
        <h3 id="ex-setup-h">원클릭 설치기 <small>OpenCode · 워크숍 저장소 <code>build/</code></small></h3>
        <div class="ex-run">${I.run.map((r) => `<div><b>${esc(r.os)}</b><span>${esc(r.os === "Windows" ? "ssu-opencode-setup.cmd를 더블클릭" : "터미널에서")}</span>${r.cmd ? `<code>${esc(r.cmd)}</code>` : ""}</div>`).join("")}</div>
        <h4 class="ex-h4">깔리는 것</h4>
        <ol class="ex-what">${I.what.map((w, i) => `<li><i>${i + 1}</i><b>${esc(w.plain)}</b><small>${esc(w.t)}</small></li>`).join("")}</ol>
        <h4 class="ex-h4">설치 여섯 단계</h4>
        <ol class="ex-six">${I.steps.map((s) => `<li id="ex-${s.id}"><b>${esc(s.t)}</b><span>${esc(s.plain)}</span></li>`).join("")}</ol>
        <h4 class="ex-h4">설치가 끝나면</h4>
        <ol class="ex-after">${I.after.map((a) => `<li>${a.lead ? `${esc(a.lead)} ${esc(a.t)}` : esc(a.t)}</li>`).join("")}</ol>
        <aside class="ex-key">${glyph("apikey")}<div><b>API 키는 화면에만</b><p>${esc(I.key.plain)}</p><small>AGENTS.md: “${esc(I.key.t)}”</small></div></aside>
      </section>
      <section class="ex-sec" id="ex-flow" aria-labelledby="ex-flow-h">
        <h3 id="ex-flow-h">AI와 일하는 한 바퀴 <small>설치기가 넣어 두는 AGENTS.md의 “${esc(E.flowName.t)}”</small></h3>
        ${E.why ? `<blockquote class="ex-why"><p>“${esc((R.said || ((t) => t))(E.why.t))}”</p><footer>민성의 테제, 1부 여는 이야기의 끝 <button type="button" class="btn btn-quiet" data-piece-go="${E.why.piece}">바닥에서 보기</button></footer></blockquote>` : ""}
        <div class="ex-flow">
          <svg class="ex-wheel" viewBox="0 0 520 520" aria-hidden="true">${arcs}${pts.map(([x, y, f], i) => `<g style="--i:${i}"><circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="44"/><text x="${x.toFixed(1)}" y="${(y + 2).toFixed(1)}" text-anchor="middle">${esc(f.k)}</text><text class="w-tool" x="${x.toFixed(1)}" y="${(y + 24).toFixed(1)}" text-anchor="middle">${esc(f.tool)}</text></g>`).join("")}<text class="w-c" x="${c}" y="${c + 8}" text-anchor="middle">한 바퀴</text></svg>
          <ol class="ex-flow-list">${loop.map((f, i) => `<li id="ex-${f.id}"><i>${i + 1}</i><div><b>${esc(f.k)} <span>${esc(f.tool)}</span></b><p>${esc(f.plain)}</p><small>AGENTS.md: “${esc(f.t)}”</small></div></li>`).join("")}</ol>
        </div>
      </section>
      <section class="ex-sec ex-files" aria-labelledby="ex-files-h">
        <h3 id="ex-files-h">설치기 파일</h3>
        <ul>${E.links.map((l) => `<li><a href="${raw(l.rel)}"><b>${esc(l.label)}</b><code>${esc(l.rel)}</code></a></li>`).join("")}</ul>
        <p class="ex-gh"><a href="${raw(E.github)}" target="_blank" rel="noopener noreferrer">GitHub에서 보기: Jeronyhum/ai-workshop · build/</a></p>
        <p class="ex-note">상대 링크는 공개 저장소 안에서(mind-field-archive/ 옆의 build/) 열립니다. 이 사이트에는 키나 비밀값을 하나도 담지 않았습니다.</p>
      </section>`;
    built = true;
  }
  let built = false, opener = null;
  function choose(id) {
    body.querySelectorAll(".ex-card").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.path === id)));
    body.querySelectorAll(".ex-panel").forEach((p) => (p.hidden = p.id !== "ex-panel-" + id));
  }
  function open(target) {
    if (!built) build();
    opener = document.activeElement;
    if (!dlg.open) dlg.showModal();
    window.ARchive && window.ARchive.pauseFloor && window.ARchive.pauseFloor();
    const smooth = window.ARchive && !window.ARchive.reduced() ? "smooth" : "auto";
    if (target && target.startsWith("path-")) { const id = target.slice(5); choose(id); dlg.scrollTop = 0; body.querySelector(`.ex-card[data-path="${id}"]`)?.focus({ preventScroll: true }); }
    else if (target) { const el = $("#ex-" + target, body); dlg.scrollTop = 0; el && requestAnimationFrame(() => el.scrollIntoView({ block: "start", behavior: smooth === "smooth" ? "auto" : "auto" })); el && el.querySelector("button, a")?.focus({ preventScroll: true }); }
    else { dlg.scrollTop = 0; $(".ex-card", body)?.focus({ preventScroll: true }); }
    history.replaceState(null, "", "#exit");
  }
  dlg.addEventListener("close", () => {
    history.replaceState(null, "", location.pathname + location.search);
    window.ARchive && window.ARchive.resumeFloor && window.ARchive.resumeFloor();
    if (opener && document.contains(opener)) opener.focus({ preventScroll: true });
  });
  dlg.addEventListener("click", (e) => {
    const card = e.target.closest(".ex-card");
    if (card) return choose(card.dataset.path);
    const j = e.target.closest("[data-jump-ex]");
    if (j) { e.preventDefault(); const el = $("#" + j.dataset.jumpEx, body); el && el.scrollIntoView({ block: "center", behavior: window.ARchive && !window.ARchive.reduced() ? "smooth" : "auto" }); el && el.classList.add("is-hit"); setTimeout(() => el && el.classList.remove("is-hit"), 1600); return; }
    const pg = e.target.closest("[data-piece-go]");  /* v6: back to the piece on the floor (the story's last piece) */
    if (pg) { dlg.close(); if (window.ARchive) window.ARchive.setCurrent(pg.dataset.pieceGo, { glide: true }); return; }
    if (e.target.closest("[data-close]")) dlg.close();
  });
  window.ARE = { open, close() { if (dlg.open) dlg.close(); }, get isOpen() { return dlg.open; } };
  buildWall();
  if (location.hash === "#exit") requestAnimationFrame(() => open());
})();
