# agent-workroom UI Library (shared frontend assets)
Built 2026-10-25 KST. Clones are shallow (`--depth 1`) in `skills/`. Stars = GitHub API at clone time.
See also: `posts-liked-ui.md` (sources from 민성's X likes), `open-design-analysis.md`.

## Cloned skills / frameworks
| Asset | Path | Source | ★ | License | Good for |
|---|---|---|---|---|---|
| Anthropic skills | skills/anthropics__skills | github.com/anthropics/skills | 183,444 | Mixed: design skills (frontend-design, canvas-design, theme-factory, web-artifacts-builder, brand-guidelines, algorithmic-art) **Apache-2.0**; docx/pdf/pptx/xlsx **proprietary, all rights reserved — do NOT redistribute/share** | frontend-design = distinctive aesthetic direction & anti-template typography rules |
| ui-ux-pro-max | skills/nextlevelbuilder__ui-ux-pro-max-skill | github.com/nextlevelbuilder/ui-ux-pro-max-skill | 139,786 | MIT | design intelligence DB: styles, palettes, font pairings, UX guidelines across stacks |
| shadcn/ui (+ skills `skills/shadcn`, `skills/migrate-radix-to-base`) | skills/shadcn-ui__ui | github.com/shadcn-ui/ui | 126,424 | MIT | component source, CLI, registry; agent skill for using shadcn CLI |
| open-design | skills/nexu-io__open-design | github.com/nexu-io/open-design | 103,717 | Apache-2.0 (vendored skills may carry own upstream licenses) | 151 design-system packs, 12 craft rules, ~170 skills, ~116 templates |
| taste-skill | skills/Leonxlnx__taste-skill | github.com/Leonxlnx/taste-skill | 101,889 | MIT | art direction, reference images, browser self-check |
| oil-ui | skills/oil-oil__oil-ui | github.com/oil-oil/oil-ui | 2,088 | MIT | explore distinct design directions |
| Claude-Code-Frontend-Design-Toolkit | skills/wilwaldon__Claude-Code-Frontend-Design-Toolkit | github.com/wilwaldon/Claude-Code-Frontend-Design-Toolkit | 1,220 | **none stated — internal reference only, don't redistribute** | curated list of frontend skills/tools |
| styleseed | skills/bitjaru__styleseed | github.com/bitjaru/styleseed | 988 | MIT | 23 design-method agent skills |
| superdesign-skill | skills/superdesigndev__superdesign-skill | github.com/superdesigndev/superdesign-skill | 899 | MIT | anti-slop design skill for coding agents |

## Web component libraries / sites (not cloned; from X likes)
shadcn AI Elements/Trace (ui.shadcn.com), ReUI (reui.io), Animate UI (animate-ui.com), Arc UI (uiarc.dev), Beautiful UI (beautifului.dev, agent/chat primitives), 23rd.dev, Bencho, BoardUI (dashboards), termcn, audiocn, Scrolltide (scroll templates+prompts), CopilotKit (generative UI, MIT), lintapple (UI lint), agency-agents (agent personas), Anatomy skill, inspiration: landdding, modulify, wedoflow. Check each site's license before copying code.

## Seen and skipped
- Leaked/proprietary system-prompt repos (e.g. "Claude design system prompt" leaks): not searched for, downloaded, or analyzed, per policy.
- X posts advertising "Anthropic motion design blueprint" PDFs of unclear provenance: not downloaded.

## Packages
Built 2026-10-25 KST in `packages/<name>/` using open-design's design-system format (`manifest.json` + `DESIGN.md` + `tokens.css`). Each manifest records the source URL, license, copyright holder, and path of origin.
- `shadcn-neutral`: https://github.com/shadcn-ui/ui (MIT)
- `taste-skill`: https://github.com/Leonxlnx/taste-skill (MIT)
- `od-cloudflare-kumo`: https://github.com/nexu-io/open-design (tokens from cloudflare/kumo, MIT; integration Apache-2.0)
- `od-brutalism`: https://github.com/nexu-io/open-design (Apache-2.0)
- `od-editorial`: https://github.com/nexu-io/open-design (Apache-2.0)
- `od-glassmorphism`: https://github.com/nexu-io/open-design (Apache-2.0)
- `_rules`: https://github.com/nexu-io/open-design craft/ (Apache-2.0) + https://github.com/anthropics/skills frontend-design (Apache-2.0). Rules only, no tokens.css. See `_rules/NOTICE`.
- `daisyui`: https://github.com/saadeghi/daisyui (MIT). Default light and dark themes.
- `workroom-console`: overlay on shadcn-neutral (MIT) + Cloudflare Kumo status/density via open-design (MIT/Apache-2.0); Pretendard (OFL-1.1) referenced in font stack. Owner console status/agent tokens.
- `uiverse-galaxy`: https://github.com/uiverse-io/galaxy (MIT). Index of community CSS/Tailwind elements, no tokens.css; per-author attribution required on copied snippets.
- `lintapple`: https://github.com/gholtzap/lintapple (MIT). Layout/type tokens from its example page; UI linter for checking demos.
- `dimensional-drawing`: https://github.com/enesozturk/dimensional-drawing (MIT). Monochrome spec-sheet tokens (grays, line weights, dashes) for component drawings.
- `primer`: https://github.com/primer/css (MIT). Typography and spacing only; the colors are in @primer/primitives, which isn't cloned.
- `chakra-ui`: https://github.com/chakra-ui/chakra-ui (MIT). v3 default primitive tokens.
- `_rules` also includes impeccable/: https://github.com/pbakaus/impeccable (Apache-2.0; its ios.md and android.md are derived from ehmo/platform-design-skills, MIT).

Tooling, not packaged: Style Dictionary (github.com/style-dictionary/style-dictionary, Apache-2.0) and Base UI (github.com/mui/base-ui, MIT, unstyled). Radix Primitives (github.com/radix-ui/primitives, MIT) is unstyled and its clone has no color tokens. Radix Colors is a separate repo that wasn't cloned.
Index/reference only: awesome-design-md (github.com/VoltAgent/awesome-design-md, MIT for the repo). No entries copied, because they capture third-party brand design systems and the entries don't carry their own permissive licenses.
Reference-only, nothing copied: DTCG format spec, Vuetify, Stencil, gztchan/awesome-design, Theo, Animate UI, React Bits (Commons Clause, not open source). Ant Design and MUI weren't cloned.
Reference-only, nothing copied: Claude-Code-Frontend-Design-Toolkit (github.com/wilwaldon/Claude-Code-Frontend-Design-Toolkit). It has no license.
Reference-only, nothing copied: awesome-opus5-5-videos (github.com/yihui-dev/awesome-opus5-5-videos). The repo is MIT, but its 475 motion/3D demos come from other people's posts.
Excluded: anthropics/skills docx/pdf/pptx/xlsx (proprietary).
