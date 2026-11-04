# Blind design review: MIND FIELD 아카이브 (http://localhost:8767/)

Reviewed in Chrome via Playwright at 1440×900 and 390×844 (touch, mobile), with full motion and with `reduced_motion='reduce'`. Screenshots are in `/workspace/blind/shots/`. Source references are relative to `/workspace/blind/site/`.

## 1. Verdict

This is an ambitious and distinctive piece. It is a zoomable "exhibition floor" made of torn paper, data posters and diagram rooms, with a strong colour system: red for Part 1, acid green for Part 2, ember for the bridge. The rooms and step-by-step diagram explainers are genuinely beautiful. The floor that holds them does not work as well. Most floor text is too small to read at the framings the site picks. Fixed chrome (top bar, HUD, minimap, zoom buttons) sits on top of content. Internal source paths are shown as if they were content. On mobile the floor is close to unusable, and docent mode breaks completely. Strong art direction, roughly beta-quality execution.

## 2. Scores

| Criterion | Score | Justification | Evidence |
|---|---|---|---|
| a. Aesthetics | **3 / 5** | Bold, coherent palette and editorial Korean serif and condensed-numeral typography; rooms are excellent. The floor is overcrowded, chrome collides with content, labels overlap, and most text is illegible micro-type. | `desktop-07-room-open.png`, `desktop-09-room-next.png` (strong); `desktop-04-zone-p1.png`, `desktop-11-docent.png`, `desktop-20-after-drag.png` (collisions) |
| b. Currency | **4 / 5** | Current: infinite-canvas spatial navigation, scroll-driven step explainers, `animation-timeline: view()`, native `<dialog>`, `:has()`, `@property`, keyboard-first command hints, editorial brutalist type. Dated: sci-fi HUD corner brackets, a film-grain overlay, and "terminal" mono metadata, which were peak 2021–23 tropes. | `css/archive.css:676`, `css/archive.css:339`, `css/tokens.css:15`; `desktop-05-arrow-right-piece.png` (HUD brackets) |
| c. Motion, UI, components | **3 / 5** | Motion is purposeful (about 1.3 s build-in, glide-to-piece, steppable diagrams) and reduced motion is respected everywhere with zero console errors. However, there is a broken mobile docent, a lost close button in long rooms, a focus-restore state bug, a stale HUD, hijacked Tab, empty zoom buttons on mobile and wrapping nav labels. | `desktop-02-intro-*.png`, `desktop-22-floor-step.png`, `desktop-31-reduced-zone-jump.png`; `mobile-10-docent.png`, `desktop-08-room-scrolled.png` |

## 3. d. What the site is about

**Inference.** This is a Korean-language archive of materials from a **"vibe coding" workshop** for students, laid out as a walkable exhibition with no fixed viewing order. It has four parts:

- **Part 1 (1부), "AI 시대의 변화" (how the AI era is changing things):** benchmark claims ("AI가 회계사를 이겼다?" 100 % vs 56.4 %), cost collapse (−80 %), labour statistics, and security (CVE curve, 72,812).
- **The bridge (다리), "학생에게 어떤 의미인가" (what it means for students):** AI drafts confidently even when it is wrong, so the skill to learn is *verification*, not delegation.
- **Part 2 (2부), "에이전트와 만드는 법" (how to build with agents):** a nested model of prompt → context → harness → loop → graph, plus "model + harness = agent" and loop and self-verification diagrams.
- **The case gallery (사례관), "프런티어 모델 활용 사례" (frontier-model use cases):** 35 curated posts, mostly from X, showing what frontier models built (music videos, launch videos, Blender scenes, office documents).

Across all four parts runs an explicit **fact-checking posture.** Every item carries a status: 확정 (confirmed), 단서 (conditional), 미확인 (unverified), 정정 (corrected) or 제외 (excluded). The central message is "don't trust headlines or AI output; check the source and build the check into the loop."

**Confidence:** high, about 85 %.

**Based on:**
- `<title>` and meta description (`index.html:6-7`: "바이브코딩 워크숍 자료를 관람 순서 없는 전시장처럼 걷는 아카이브", "an archive of vibe-coding workshop materials you walk like an exhibition hall with no viewing order").
- The zone titles.
- The bridge quote (`desktop-04-zone-bridge.png`).
- The status legend in the index (`desktop-13-index.png`).
- The gallery header (`desktop-15-gallery.png`).

**Unsure about:**
- Who the audience is (high school, university or professional "students"), and who runs the workshop.
- Whether the visible source paths (`P1_사무직벤치마크.md §1.3 :59`, `refs/drive/...`) are meant for visitors or are leftover authoring scaffolding.
- Whether this is public or for internal use.
- The model names shown ("Claude Opus 5.5", "Claude Fable 5"). I cannot judge their accuracy blind.

## 4. e. Shortcomings and fixes

### P0: broken, or blocks understanding or use

1. **Docent mode is unreadable on mobile.**
   - **Location:** 390×844 after tapping 도슨트; `mobile-10-docent.png`; `css/archive.css:356`.
   - **Problem:** `.is-docent .hud { width: min(540px, calc(100vw - 290px)); }` gives a 100 px panel at 390 px wide. It also beats the mobile rule at `archive.css:374` on specificity. The Korean text wraps one syllable per line, runs under the top bar and covers a third of the screen. `archive.css:346` forces keyboard hints (`←→↑↓ Tab Enter Esc`) to show on a touch device.
   - **Fix:** Inside the `@media (max-width: 700px)` block, add `.is-docent .hud { width: calc(100vw - 24px); max-height: 45vh; overflow: auto; }` and `.is-docent .hud-keys { display: none !important; }`. Alternatively, render the docent panel as a bottom sheet on narrow screens.

### P1: clearly hurts quality

2. **Most floor text is illegible at the framings the site chooses.**
   - **Location:** `#world` text at any zone level, measured as on-screen font size = computed size × camera zoom.
     - Desktop zone 1: 96 of 155 visible text nodes are under 10 px, and 75 are under 7 px.
     - Desktop overview: 278 of 389 are under 7 px.
     - Mobile with a single piece focused: 66 of 112 are under 7 px.
     - Mobile zone 2: 64 of 68 are under 7 px.
   - **Evidence:** `desktop-04-zone-p1.png`, `mobile-02-zone-p1.png`, `mobile-01-landing.png`.
   - **Fix:**
     - Hide secondary text below a zoom threshold. `floor.dataset.scale` already computes far, mid and near at `js/app.js:139`, so use it to show only titles and numerals at far and mid.
     - Set a minimum rendered size, for example `font-size: max(1em, calc(11px / var(--z)))`, for captions you keep.
     - On mobile, frame one piece at a time instead of a whole zone.

3. **Fixed chrome sits on top of content at every zone framing.**
   - **Location:** `desktop-04-zone-p1.png`, `desktop-04-zone-bridge.png`, `desktop-06-tab-neighbour.png`, `desktop-20-after-drag.png`, `mobile-02-zone-p1.png`.
   - **Problem:**
     - The top bar is a transparent gradient (`css/archive.css:34`), so the giant "1부" title and "무엇을 보여줘야 하는가" run under the logo and nav.
     - The HUD (bottom left) covers card corners and the "AI beats CPAs" card.
     - The minimap (`archive.css:362`, and `:376` on mobile, top right) covers the 56.4 % card.
     - The zoom buttons cover the Tesla card.
   - **Fix:**
     - Make `fit()` and `framePiece()` (`js/app.js:158`, `:178`) inset the viewport by the chrome: top by `--bar-h`, bottom-left by the HUD height, right by the map width.
     - Give the top bar a solid backdrop (`background: rgb(11 11 12 / .85); backdrop-filter: blur(8px)`).
     - Let the minimap collapse to an icon on mobile.

4. **The HUD goes stale and covers the overview and the gallery.**
   - **Location:** `desktop-12-esc-all.png`, `desktop-04-zone-gallery-zone.png`, `mobile-12-zone-gallery.png`; `css/archive.css:339`.
   - **Problem:** The HUD shows whenever any piece is `aria-current`. After Esc back to the overview, or a jump to 사례관, it still shows a Part 2 piece ("다섯 단계는…") and hides the "쇼케이스 19" heading. The map and zoom hide at `data-whole` (`archive.css:360`), but the HUD does not.
   - **Fix:** Add `.floor[data-whole] ~ .hud { display: none }`. Clear `cur` (or hide the HUD) on `jump("all")` and `jump("gal")`.

5. **Closing a room after moving between rooms with the arrow keys resets the floor to the first room.**
   - **Location:** `js/app.js:339-344` with `js/app.js:421-424`. Reproduced with 1 → Enter → → → → ← → Esc: the room was `gdpval` but the floor's current piece became `accounting`. See `desktop-17-room-arrow2.png` and `desktop-18-after-room-close.png`.
   - **Problem:** A closing modal `<dialog>` restores focus to the element that opened it (`#pc-accounting`). That fires `focusin` on the floor, which calls `setCurrent()` with the stale piece, so the HUD, camera and threads jump back.
   - **Fix:** In the `close` handler, focus `#pc-<cur>` after the dialog's own focus restore (for example in a `requestAnimationFrame`). Alternatively, ignore `focusin` while a `closing` flag is set.

6. **The room close button scrolls away and long rooms have no persistent exit.**
   - **Location:** `.room-x` in `.rm-top` (`js/render.js:270`, `css/archive.css:400`, position static). Measured at y = −1362 px after scrolling; see `desktop-08-room-scrolled.png` and `mobile-04-room-scrolled.png`. Rooms are about 5,600 px tall.
   - **Problem:** Touch users must scroll all the way back up to leave a room. The visible label also tells them to press "Esc", which a phone does not have.
   - **Fix:** Make `.rm-top` `position: sticky; top: 0` with a backdrop, or add a fixed close button. Hide `<kbd>` hints with `@media (hover: none)`.

7. **Tab is hijacked on the floor, so the HUD, zoom and minimap are unreachable by keyboard.**
   - **Location:** `js/app.js:478-481`. The Tab sequence is skip link → top bar → `pc-accounting` → `pc-gdpval` → `pc-gdpx` → … and never reaches `#hud-next` buttons or `#zoom-in`. Shift+Tab is also captured. The map is an SVG with only a click handler (`js/app.js:295`).
   - **Fix:**
     - Keep the arrow keys and `.`/`,` for spatial travel, and use a non-Tab key such as `N` for "next neighbour".
     - Let Tab leave the floor.
     - Make the minimap focusable with arrow-key panning, or mark it `aria-hidden` and give the same actions elsewhere.

8. **Mobile nav labels wrap one syllable per line.**
   - **Location:** `mobile-01-landing.png`, `mobile-02-zone-p1.png` ("다/리", "사례/관", "도슨/트", "목/록"); `css/archive.css:42`, `:53`.
   - **Fix:** Add `white-space: nowrap; word-break: keep-all` to `.bar-zones button` and `.tool`. At 390 px, drop the logo word-mark to an icon or move the zone tabs into a segmented control.

9. **The zoom buttons are empty boxes on mobile.**
   - **Location:** `mobile-02-zone-p1.png` and `mobile-10-docent.png` (two blank squares at top right); `css/base.css:69` (`.tool kbd { display: none }` at ≤860 px), while the zoom buttons contain only `<kbd>+</kbd>` and `<kbd>−</kbd>` (`index.html:52-53`).
   - **Fix:** Exempt `.zoom .tool kbd` from that rule, or use a real "+" and "−" glyph outside `<kbd>`. Pinch already works, so consider hiding the buttons on touch.

10. **First-time visitors get no orientation.**
    - **Location:** `desktop-01-landing.png`, `mobile-01-landing.png`.
    - **Problem:** The landing view is a dense collage with no visible headline, no "what this is" line, and no "drag / click / press ?" hint. The explanation exists only in `.sr-only` (`index.html:42`). On mobile the whole floor is a 160 px strip in the middle of the screen.
    - **Fix:** Add a short visible intro card or caption on the overview, such as "바이브코딩 워크숍 자료 · 조각을 눌러 열기 · 끌어서 둘러보기". It can fade out on the first interaction. On mobile, open the 목록 (list) view or a guided first piece by default.

11. **Authoring provenance is shown as primary UI text.**
    - **Location:**
      - The HUD: "◐ 단서 P1_사무직벤치마크.md §1.3 :59" (`desktop-04-zone-p1.png`).
      - Every index row (`desktop-13-index.png`).
      - Room footers: "refs/drive/package_1105/…md §1.3 :59 감사 B-2 :142" (`desktop-23-room-accounting-scrolled.png`).
      - Gallery cards: "refs/drive/usecases/claudeai_2111…_* · 문구 refs/old-claude-design-brief.md :61" (`desktop-25-gallery-play.png`).
      - The gallery lede: "Drive usecases 7건, X 수집 22건" (`js/gallery.js:133`).
    - **Problem:** File names, line numbers and audit codes read like a debug build and crowd out the real sources (the X and article links).
    - **Fix:** Show visitors the public source (outlet or handle and link) plus the status badge. Move file and line provenance behind a "출처 상세" disclosure, or drop it from the public build.

12. **Floating thread labels collide with content and each other.**
    - **Location:**
      - `desktop-03-hover-piece.png` ("그래프 밖의 생활 밀착" is cut off by the bridge panel).
      - `desktop-11-docent.png` ("점수지기가 있어야 루프가 끝난다" is printed over the "시스템" card title).
      - `desktop-20-after-drag.png` ("컨텍스트: 약 3개월" and "하네스: 약 2개월" sit on the frame corners; "프롬프트: 약 3년" overlaps "프롬프트 엔지니어링은 죽었나").
      - `desktop-04-zone-p2.png` (a label is clipped at the left edge).
    - **Fix:** Run a simple label-avoidance pass (nudge along the thread until the label box does not intersect any `.pc` rect), clamp labels inside the viewport, and show only the labels of the current piece's threads.

### P2: polish

13. **Overview composition wastes space.** About 150 px of empty band sits above and below the floor at 1440×900, and the 사례관 column ends early, leaving a hollow lower right (`desktop-01-landing.png`). On mobile, about 80 % of the screen is empty (`mobile-01-landing.png`). **Fix:** Fit to the content bounds rather than the 12700×5600 world (`js/app.js:510`, `fit(zoneRect("all"))`), or rebalance the world height.
14. **The motion toggle and shortcuts are hidden on phones.** `css/archive.css:55` hides `M 모션` and `?` at ≤560 px, so mobile users cannot reduce motion from inside the site. The OS setting is still honoured (`mobile-30-reduced-t300ms.png`). **Fix:** Move them into an overflow menu instead of removing them.
15. **The gallery note wraps into a column on mobile.** "● 확인됨 입니다." is squeezed into a 1-character column (`mobile-13-gallery.png`) because `.gl-note` is `display: flex` with a bare trailing text node (`css/archive.css:620`). **Fix:** Use `flex-wrap: wrap`, or render the note as inline text.
16. **Gallery layout gaps.** The "@claudeai 공식 계정 1" group is a single 300 px card with roughly 1,000 px of blank space beside it (`desktop-25-gallery-play.png`), and the summary bar repeats the same three counts twice (`desktop-15-gallery.png`: the tiles "19 / 10 / 6", then the "쇼케이스 19 오피스 10 Blender 6" links). **Fix:** Let singleton groups flow inline with the next group, and merge the count tiles with the jump links.
17. **Neighbour cards with no image show a blank dark tile that repeats the title** ("GDPval: 전문가와 동등 이상" appears twice; `desktop-24-room-bottom-neighbours.png`). **Fix:** Use the piece's big numeral or a zone texture as the thumbnail, or drop the tile and keep the text card.
18. **Low-contrast "upcoming" step text in rooms.** The next step ("Action · Observation", "점수지기…") is dimmed almost to the background (`mobile-09-room-loop-step.png`, `desktop-08-room-scrolled.png` "2 / 5 Goal"). **Fix:** Keep inactive steps at least 3:1 (for example `--fog`) and differentiate them by weight or size rather than opacity.
19. **Too many typefaces.** Archivo (condensed), Gothic A1, Noto Serif KR, Pretendard, JetBrains Mono and Instrument Serif are all live on one screen (font list measured at runtime). The floor feels busier than it needs to. **Fix:** Limit the floor to serif headline + condensed numerals + sans body, and confine mono and Instrument Serif to the rooms.
20. **Shipping weight and leftovers.**
    - First load is 78 requests and 6.2 MB.
    - `fonts/Archivo-Variable.ttf` is a 636 KB unsubsetted TTF, while the other fonts are subset WOFF.
    - `js/data.js.bak-claudia` (80 KB backup) is publicly served.
    - `css/base.css` carries design-system-doc rules that this page never uses (`.palette-detail`, `.type-spec`, `.dope-ctl`, `.filmstrip`, `.recipe`, `.keys-grid`, with no matches in `index.html` or `js/`).
    - **Fix:** Subset Archivo to WOFF2, delete the `.bak` file, and tree-shake `base.css`.
21. **The skip link has the wrong target.** "목록 보기로 건너뛰기" (skip to list view) points at the `#index-open` button (`index.html:23`) rather than skipping to content, and activating the link does not open the list. **Fix:** Make it a button that opens the index dialog, or point it at a real landmark.

### What works well (for balance)

- **Reduced motion is thorough.** The intro is skipped, glides become cuts, ambient video is not played (0 playing), and diagrams render in their final state. See `desktop-30-reduced-t300ms.png`, `desktop-31-reduced-zone-jump.png` and `js/app.js:133-156`.
- **No console errors or warnings,** and no failed requests, in any run.
- **The list view and shortcuts dialog are clear accessible alternatives,** with visible focus rings (`desktop-13-index.png`, `desktop-14-shortcuts.png`).
- **The stepped loop diagram is the best component on the site** (`desktop-22-floor-step.png`, `desktop-08-room-scrolled.png`).
- **Letter shortcuts work under a Korean IME,** because the handler uses `e.code` (`js/app.js:447`).

## 5. Blockers

None that stopped the review. Two notes:

- On mobile, Playwright's `tap()` on `#pc-accounting` timed out because the minimap SVG and neighbouring pieces intercept the hit point at that framing. That is itself evidence of overlapping chrome. I opened that room with `ARchive.openRoom()` instead, and confirmed separately that a real coordinate tap on a visible piece does open its room (`mobile-02b-tap-piece.png`).
- The mobile "전체" (overview) button is hidden (`archive.css:55`), so I returned to the overview through the logo.

## Screenshots saved (`/workspace/blind/shots/`)

| File | What it shows |
|---|---|
| desktop-00-t0.png | Desktop at load, first frame |
| desktop-00b-t600ms.png | Desktop at 600 ms, intro mid-build |
| desktop-01-landing.png | Desktop overview after settling |
| desktop-02-intro-0150ms … 3300ms.png | Intro build-in sequence (7 frames) |
| desktop-03-hover-piece.png | Hover on the overview; thread labels collide or clip |
| desktop-04-zone-p1.png | Zone 1 framing; title under top bar, HUD, minimap and zoom over content, micro text |
| desktop-04-zone-bridge.png | Bridge framing; quote card, HUD over the CPA card |
| desktop-04-zone-p2-midglide.png | Part 2 diagram mid-build |
| desktop-04-zone-p2.png | Part 2 framing; clipped label at left |
| desktop-04-zone-gallery-zone.png | 사례관 zone; stale Part 2 HUD over the thumbnails |
| desktop-05-arrow-right-piece.png | Arrow-key travel to the bridge quote |
| desktop-06-tab-neighbour.png | Tab to the "loop" neighbour; HUD over the card corner |
| desktop-07-room-opening.png | Room opening |
| desktop-07-room-open.png | Loop room hero |
| desktop-08-room-scrolled.png | Room step 1/5; close button gone |
| desktop-09-room-next.png | → to the next room (1→26 %) |
| desktop-10-room-closing.png | Room exit fade |
| desktop-10-room-closed.png | Back on the floor |
| desktop-11-docent.png | Docent mode on desktop; label printed over the card title |
| desktop-12-esc-zone.png | Esc to zone level |
| desktop-12-esc-all.png | Esc to overview; stale HUD |
| desktop-13-index.png | List (목록) dialog with source paths |
| desktop-14-shortcuts.png | Shortcuts dialog |
| desktop-15-gallery.png | Gallery dialog header |
| desktop-16-gallery-scrolled.png | Gallery cards with file-path provenance |
| desktop-17-room-arrow2.png | Room after two → presses (gdpx) |
| desktop-18-after-room-close.png | After close, the floor reverts to the first room (bug) |
| desktop-19-tab-focus.png | Tab sequence end state |
| desktop-20-after-drag.png | Drag pan; label collisions, title under the logo |
| desktop-21-after-wheel.png | Wheel pan |
| desktop-22-floor-step.png | `.` stepping the loop diagram on the floor |
| desktop-23-room-accounting-scrolled.png | Room footer with internal paths and audit codes |
| desktop-24-room-bottom-neighbours.png | Neighbour cards with blank tiles |
| desktop-25-gallery-play.png | Gallery video playing; singleton-group gap |
| desktop-30-reduced-t300ms.png | Reduced motion: final state at 300 ms |
| desktop-31-reduced-zone-jump.png | Reduced motion: instant cut, diagram fully drawn |
| desktop-32-reduced-room.png | Reduced motion room |
| mobile-00-t0.png | Mobile at load, first frame |
| mobile-00b-t600ms.png | Mobile at 600 ms |
| mobile-01-landing.png | Mobile overview: tiny strip, wrapped nav |
| mobile-01b-landing-hidpi.png | Mobile overview at 2× DPR |
| mobile-02-zone-p1.png | Mobile zone 1: minimap over content, empty zoom boxes, micro text |
| mobile-02b-tap-piece.png | Tap opens the Claudia room |
| mobile-03-room.png | Mobile accounting room (readable, good) |
| mobile-04-room-scrolled.png | Mobile room scrolled; no close button |
| mobile-05-room-bottom.png | Mobile room neighbours |
| mobile-06-after-room.png | Back on the floor |
| mobile-07-zone-p2.png | Mobile Part 2; title under the top bar |
| mobile-08-room-loop.png | Mobile loop room hero |
| mobile-09-room-loop-step.png | Mobile loop step; dim upcoming text |
| mobile-10-docent.png | Mobile docent: one syllable per line (P0) |
| mobile-11-index.png | Mobile list view (works) |
| mobile-12-zone-gallery.png | Mobile 사례관 zone; stale HUD |
| mobile-13-gallery.png | Mobile gallery; "입니다." column wrap |
| mobile-14-gallery-scrolled.png | Mobile gallery cards with paths |
| mobile-15-overview-after.png | Mobile overview with stale HUD |
| mobile-30-reduced-t300ms.png | Mobile reduced motion |
