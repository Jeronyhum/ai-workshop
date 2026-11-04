# Persona synthesis: two vibe-coder visitors

**Personas**

| Persona | Who | Wants to build | Visit |
|---|---|---|---|
| A, 김도윤 | 경영학과 3학년 | A campus club and event management app | Desktop, plus one look on a phone |
| B, 이서연 | 시각디자인과 2학년 | A portfolio and commission-request web service | Desktop, then mobile |

**Method**
- Each persona was a fresh Sonnet 5.5 subagent (high effort). It got only its persona meta-prompt from `persona-meta-prompt.md`: the URL, the one line a visitor would know, its persona, and output paths.
- It walked http://localhost:8767/ in Chrome through Playwright, took screenshots, and kept a timestamped journey log.
- The same agent was then interviewed in **5 rounds**. The rounds covered the journey, the confusing moments, what was interesting, missing explanations, usefulness, and closing probes.

**Sources**
- Journey logs: `persona-A-journey.md` and `persona-B-journey.md`.
- Interview transcripts: `persona-A-interview.md` and `persona-B-interview.md`.
- Screenshots: `/workspace/blind/persona-A/` (A01–A30) and `/workspace/blind/persona-B/` (B01–B30).

**The interviewer's own checks.** These were run separately on the same server, read-only, to tell real defects from artifacts of automated clicking. They are marked **[checked]** below.

---

## 1. Usefulness verdicts

| | A, 김도윤 (club app) | B, 이서연 (portfolio + commission service) |
|---|---|---|
| Useful for building their target with vibe coding? | **Partly: 2/5** | **Partly: 2/5** (inspiration 4/5, how-to 1/5) |
| What helped | The "바이브코딩 용어 17" glossary: 호스팅, GitHub, 토큰 (A14). "다리 A", don't trust AI numbers (A16–17), which maps straight onto dues and receipts | The visual system (B02, B04); the dot-grid infographics that "explain without words" (B07, B12); the showcase, especially the scroll-site example (B22–24); the glossary (B08); the spotlight and motion-reduce ideas (B19, B25) |
| What was missing | Nothing for member list, sign-up, attendance or announcements. Hosting is defined but there's no how-to. No Korean step-by-step, no copyable prompts | Nothing for the request form, prices and slots, or status tracking. No "how it was made" on the examples. No prompts, steps or tools |
| What would raise the score | One Korean, numbered "동아리 앱 만들기: 오늘 밤 따라 하는 순서" guide, with one box per app part, copyable prompts and a checklist. This takes it to 4/5. Working navigation alone takes it to about 3/5 | A goal-based entrance, "오늘 뭘 만들고 싶으세요?", leading to a build-along with copyable prompts, AI screenshots and the edits made. A "만든 과정" panel on every showcase card |
| Would recommend? | Yes, with a warning: "a pretty exhibition with a good glossary, not a tutorial" | Yes, to design friends: "go to browse, not to learn", and "use a laptop" |
| Would come back? | For the glossary and the verify page, when a word or a number is in doubt. Not as a starting point | For design examples and the glossary. When she starts building, she'd open a tutorial elsewhere |

**Bottom line.** Both personas read the site as **an exhibition, not help**. Both landed on **partly useful, 2/5**, for the same structural reason. The site shows what AI can do and why to be careful. It doesn't show a non-coder **how to start building their own thing**.

---

## 2. Findings shared by both

1. **The first screen doesn't say what this is, who it's for, or where to start.** Both found the poster wall beautiful but couldn't tell "what's in it for me" (A01; B02, interview B1). The big numbers (100%, 56.4%, 34.3%) read as unlabelled.
2. **Navigation feels out of control.** This is the top thing each would fix.
   - **[checked, real] Top-menu "사례관" doesn't open the gallery.** It only pans the camera to the gallery zone and focuses a small "사례관 열기" button on the map. Both expected it to open the gallery (A18–22, B15). Pressing `4` does the same.
   - **[checked, real] The Tab hint fails after a mouse click.** After clicking the "도슨트" button with the mouse, focus stays in the top bar. Tab then moves to "목록" instead of the neighbouring piece, though the card on screen says "Tab" (B19–20). Tab does walk neighbours once focus is on the floor.
   - **[reported, not reproduced] "Scrolling threw me out of the reading view back to the map"** (A03→04; B08→09). A plain mouse-wheel scroll inside an open room did not close it in a fresh session. Both personas hit it, so it is probably a stray click landing on the backdrop or on a neighbour card while content moves. It needs investigation, not dismissal.
   - **[reported, partly reproduced] Clicks "land on the wrong piece".** The camera keeps gliding after a click or Esc, and a click during or just after the glide opens whatever is under the pointer (A19–21, B12–14). B saw it even after waiting 5 seconds.
   - **[checked] "목록" works** when the button itself is clicked: the index dialog opens. B found it (B21). A's failure (A05, A28) could not be reproduced and may be an artifact of A clicking by position.
3. **The vocabulary is never explained where it appears.**
   - Neither persona understood 하네스, 루프, 그래프 or 에이전트 (A, round 3; B03, B06).
   - A also hit 벤치마크, 노드/엣지 and 도구 호출.
   - Neither understood 감사 (audit? thanks?), 단서/정정, or the difference between 확정 and 확인됨.
   - The glossary helps, but it's buried: both found it by accident (A13–14, B08). It also lacks the very terms the 2부 pieces are built on.
4. **Source lines read as internal notes.** `refs/drive/…`, `:155` and `감사 B-1 :135` are noise to both (A, round 5; B10, B, round 5). Both said the *honesty* itself matters: "don't trust AI numbers" (A); "trust needs sources, just not like this" (B). Both proposed the same fix: plain labels, a single legend, and sources folded away behind a tap.
5. **A lot of English.** The gallery and office cases (A24–26, B18), and the diagram labels (B06), are hard for both. B said the English diagrams and unexplained terms made her feel "outside the conversation".
6. **Mobile is broken at first sight** ([checked] in B26 and B30).
   - The 390-wide home screen is a thin strip of posters in a black void.
   - Every top-menu label wraps one syllable per line ("1/부", "다/리", "사례/관", "도스/트", "목/록").
   - In the gallery header, "입니다." breaks into a column one character wide (B30).
   - On 2부, the menu overlaps the poster title, and the "Tab" chip shows on a phone (B29).

   A said they couldn't send the link to club members (A30). B said "as a designer I can't forgive this".
7. **What works, for both:**
   - the glossary;
   - "AI states wrong numbers with expert confidence" (다리 A);
   - the dot-grid infographics;
   - the spotlight idea;
   - the motion-reduce switch;
   - the 목록 view on mobile (B28).

## 3. Persona-specific findings

**A, 김도윤 (practical, impatient, reads English slowly)**
- He expected **도슨트 = a guided tour** ("여기서부터 시작하세요"), and got a spotlight (A02). That gap is a missed entry point.
- The 2부 scroll diagrams gave "a feeling, not a skill" (A, round 3). He wrote the line he wanted on the 하네스 page: "하네스는 AI 모델을 둘러싼 도구와 규칙 묶음이에요… 직접 앱을 만들 때는 AI에게 어떤 파일·시트를 건드리게 할지, 어디까지 허락할지를 정하는 일이에요." With such a line he'd change "skip" to "look at the first screen".
- He wanted an **actionable box at 다리 A** (A17): a three-step dues-sheet check covering the total, one receipt by hand, and asking the AI to explain its calculation.
- The **office case** about 12 spreadsheets (A26) is the closest to his life, but it is English-only with no Korean "how they did it".
- He never saw anything about **personal data** (member names and phone numbers) and wants a checklist for it.

**B, 이서연 (visual, design-literate, mobile-first)**
- **Odd first screen [not reproduced]:** her very first load showed the `#promptdead` reading view with no site name (B01). A fresh session here opened the overview with an empty hash. It is probably an artifact of her setup, but a deep-link landing still needs a visible site name and a way home.
- She wants **"how it was made" on every showcase card**: the prompt summary, the tools, the number of tries, the time taken, and a live link (B22–24). Right now there's only an "X 원본" link.
- She separates **inspiration (4/5) from how-to (1/5)**. Inspiration is "easy to find on Instagram/Behance", so the how-to gap decides her overall score.
- She would **borrow** the spotlight view (for a single work, with price and request buttons), the motion-reduce switch, the colour-coded zones, and the big-serif hierarchy.
- She designed the **goal-based entrance**: a dark ground, the question "오늘 뭘 만들고 싶으세요?", three coloured cards (portfolio / commission service / just browsing), and a skip button.
- **Tags:** she wants one legend for ●/○, and human source labels ("공식 발표", "게시물 한 개", "직접 확인 안 됨").
- She felt **anxiety from the many "미확인" notes**: "how far can I trust and follow this?". The honesty, without guidance, becomes doubt for a non-expert.

## 4. Prioritized fixes

P0 means it blocks understanding or use for these visitors. P1 means it clearly hurts their experience. P2 is polish.

| P | Fix | Where | Evidence |
|---|---|---|---|
| **P0** | Add a one-line "what this is, who it's for, where to start" on the first screen, with a visible **start-here entrance**. B's version: "오늘 뭘 만들고 싶으세요?" with goal cards. A's version: a "start here" button next to 도슨트 | Home / overview, top bar | A01, B02; A, rounds 1 and 5; B, rounds 4 and 5 |
| **P0** | Make the **top-menu "사례관" (and `4`) open the gallery**, not just pan to its zone. More generally, every menu item should do what its label says, right away, with feedback | Top bar zone buttons | A18–22, B15 [checked] |
| **P0** | Fix the **mobile first screen**: a stacked or fitted overview, a top menu that doesn't wrap per syllable (one scrolling row or a menu button), no overlap with poster titles, and no "Tab" hint on touch | 390-wide home and 2부 | A30, B26, B29 [checked] |
| **P1** | Add a **how-to layer for non-coders**: one Korean build-along (numbered steps, copyable prompts, a checklist). Ideally use two worked targets close to these visitors: a club/event app and a portfolio with a request form | A new entry from the start-here page | A, rounds 4 and 5; B, round 4 |
| **P1** | Add a **"만든 과정" panel to each showcase card**: prompt summary, tools, number of tries, time taken, live link, and a Korean summary for English posts | Gallery cards | B22–24, A26 |
| **P1** | Put a **plain "what this means for you" line** on each 2부 concept page (하네스, 루프, 그래프, 컨텍스트), and add these terms plus 에이전트, 벤치마크, 노드/엣지 and 도구 호출 to the glossary | 2부 rooms, glossary | A12, A (round 3, Q5), B03, B06 |
| **P1** | Make the **glossary findable**: a "용어" button in the top bar, and tappable hard words that open their definition in place | Top bar, all text | A13–14, B08; B (round 3, Q5) |
| **P1** | **Reduce the camera glide's capture of clicks.** Ignore or queue clicks during a glide, and don't let a click on the backdrop or a neighbour card fire while content is moving. Investigate the reported "scroll threw me out" | Floor and rooms | A03–04, A19–21, B08–09, B12–14 |
| **P1** | After the **도슨트** button is clicked, move focus to the current piece, so the advertised Tab and arrow keys work. Or rename 도슨트 to something that doesn't promise a guided tour, or make it one | Docent button | A02, B19–20 [checked] |
| **P1** | **Status labels:** one visible legend for 확정 / 단서 / 정정 / 미확인 / 확인됨. Plain words for "감사" (or drop it from visitor-facing text). Fold file paths and line numbers behind a "출처" tap with human labels | All rooms, gallery header | A (round 2, Q4), B (round 2, Q4; round 5, Q3) |
| **P2** | Put a **"what this means for you" box on 다리 A**, e.g. "AI가 만든 회비표의 합계, 직접 다시 더해 보기" in three steps | Bridge A room | A17; A (round 3, Q6) |
| **P2** | Fix the **gallery-header line break**: "확인됨 입니다." wraps one character per line at 390 | Gallery header, mobile | B30 [checked] |
| **P2** | Label the **big numbers on the overview**, so 100% / 56.4% / 34.3% don't read as decoration | Floor works | A01; B (round 1, Q3) |
| **P2** | A **home button** ("처음으로") alongside the Esc-step-back ladder | Room header | B11 |
| **P2** | Investigate the **doubled quote marks** at the start of a room quote (““…””) that A noticed | promptdead room | A03 |

## 5. Caveats

- **Automation.** The personas drove the site through Playwright scripts. Some clicks were made by screen position, and B's mobile steps ran in fresh sessions, so some "wrong place" reports may be artifacts. Each is labelled **[checked]**, **[not reproduced]** or **[partly reproduced]** above. Both personas also said themselves when they were unsure of the cause.
- **Not seen by either persona:** the 루프 and 그래프 rooms, the docent's full keyboard walk, pinch and drag on mobile, or any video playing in full motion (B saw a still after pressing play). Claims about those areas are absent, not negative.
- **Two personas** are a small sample with one shared profile (non-CS Korean students who vibe-code). The findings are directional.
