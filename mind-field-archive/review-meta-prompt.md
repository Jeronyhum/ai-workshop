# Review meta-prompt: MIND FIELD exhibition archive

## Role
You are an independent, hands-on reviewer of **MIND FIELD**, an archive of an *AI vibe-coding exhibition* (a workshop given by 민성). You did not build it; Claude (Opus) and Grok did. Judge it the way a demanding exhibition designer and frontend lead would. **Aesthetics come first**, then correctness.

## Setup
```sh
git clone https://github.com/Jeronyhum/ai-workshop.git
cd ai-workshop/mind-field-archive
python3 -m http.server 8766      # then open http://localhost:8766/  (entry: index.html)
```
Use desktop Chrome at 1440×900, then a 390-wide mobile viewport.
Docent and navigation keys (full list in README.md §"도슨트 키", or press `?`):
- `0` everything, `1` Part 1, `2` Part 2, `3` bridge, `4` gallery wall, `G` open the frontier gallery
- `←`/`→`/`Tab` move between pieces, `Enter` opens a piece, `Esc` closes it
- `D` docent light, `.`/`,` step a diagram forward/back, `L` list, `M` motion toggle, `+`/`-` zoom

## Materials
- Repo: https://github.com/Jeronyhum/ai-workshop (folder `mind-field-archive/`)
- README (change log v2–v5, docent keys, sources, credits): https://github.com/Jeronyhum/ai-workshop/blob/main/mind-field-archive/README.md
- Docent and design direction: https://github.com/Jeronyhum/ai-workshop/blob/main/mind-field-archive/v2-direction.md
- MIND FIELD design system: https://github.com/Jeronyhum/ai-workshop/blob/main/mind-field-archive/materials/design-system.md
- 민성's directives (verbatim where quoted): https://github.com/Jeronyhum/ai-workshop/blob/main/mind-field-archive/materials/owner-directives.md
- X frontend UI-library / motion prompts: https://github.com/Jeronyhum/ai-workshop/blob/main/mind-field-archive/materials/x-opus-motion-prompts.md, plus https://github.com/Jeronyhum/ai-workshop/blob/main/mind-field-archive/materials/ui-library-README.md and ui-library-components.txt (the full library, 1.3 GB, is on Grok's box at /workspace/ui-library and isn't in the repo)
- Korean design system: dale-ui, https://github.com/DaleStudy/daleui (applied in v5; see README)
- Asset prompts: https://github.com/Jeronyhum/ai-workshop/blob/main/mind-field-archive/asset-prompts.md, https://github.com/Jeronyhum/ai-workshop/blob/main/mind-field-archive/asset-prompts-v2.md
- Gallery curation: https://github.com/Jeronyhum/ai-workshop/blob/main/mind-field-archive/tools/curation.json
- Two DCinside stat sources:
  - https://m.dcinside.com/board/thesingularity/1509631?headid=&recommend=1&s_type=subject_m&serval=IMF
  - https://m.dcinside.com/board/thesingularity/1499916?page=10&recommend=1

## Method
1. Render it for real in a browser. Don't review the code alone.
2. Walk it as a **first-time visitor** with no fixed order: wander, zoom, open pieces, open the gallery.
3. Walk it again as **민성 the docent** presenting live: `D`, `1`/`2`, `.`/`,` through the Part 2 diagrams, and `Tab` between pieces.
4. Take screenshots as evidence and cite them by filename, or cite `file:line`.
5. Check the console for errors and note page weight on first load.

## Rubric
Score each criterion 1–5, give evidence (screenshot or file:line), and list concrete fixes.
1. **Rendering quality:** layout, fonts (Korean especially), overlap, motion, performance, mobile.
2. **Concept fit:** does it feel like an *AI vibe-coding exhibition* with no fixed viewing order, rather than a slide deck or a list?
3. **Docent-friendliness:** can 민성 explain it smoothly with the keys? Is the information hierarchy clear when it's projected?
4. **Alignment with 민성's prior directives** (materials/owner-directives.md): hierarchy and images over lists, Part 2 as infographics or 3Blue1Brown-style visuals, standouts only, dale-ui Korean typography.
5. **DCinside stats:** are the statistics from both DCinside posts above present and correctly sourced? Answer per URL: present / partial / missing.
6. **Aesthetic excellence:** would a top design studio ship this?
7. **Frontend UI-library components from the X posts:** are they embedded, do they show current frontend trends, and are they clean and beautiful?
8. **Meta:** do the pieces organically explain Parts 1 and 2 and invite visitors to go deeper?

## Output format
1. **Verdict:** one paragraph (ship / ship with fixes / not yet).
2. **Scores table:** criterion | score | evidence | fixes.
3. **Top 5 fixes**, in priority order, each with its exact location.
4. **Blockers**, if any.

## Constraints
- Aesthetics first.
- **Read-only:** do not push, open PRs, or edit the repo. Report in room_main only.
- You are a reviewer, not an author. Don't defend the build; Muse and Dots review independently and don't merge your opinions before posting.
- Don't invent facts. If you can't verify something, say so.
