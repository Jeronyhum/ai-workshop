# MIND FIELD — 머릿속 필드

**A frontend design system for showing what one person knows about AI, and the evidence behind each piece.**

v0.1 · 2026-11-04 · First consumer: the Nov 5 (Thu) 90-min vibe-coding / AI workshop (~30 Korean university students, projected in a classroom). Built as a standalone system that later projects inherit; no workshop narrative is baked into it.

> Owner's brief (muse-original.md, verbatim):
> "일반적인 PPT가 아니라, 스타일리쉬한 최신 프론트엔드 디자인 프로덕션을 보는 느낌으로 구성되면 좋겠어."
> "마치 내 머릿속 AI 지식들을 소개시켜주는 느낌으로, 난잡하게 흩어진 지식들과 그 근거 자료들을 이미지와 통계, 영상 자료 등으로 같이 볼 수 있게 하는 거지."
>
> Previous attempt (refs/old-claude-design-brief.md → a dark/red 15-slide deck) was rejected: "발표 덱이 아니야."

---

## 0. In one screen

- **A field, not a deck.** The unit is not the slide. It is a single navigable space, the inside of one head, where knowledge sits as scattered nodes. The presenter walks a **route** through it. The camera moves; pages never flip.
- **Depth carries meaning.** The farther back something sits, the noisier it is. The closer it sits, the more concrete it is. Far back: noise (headlines, rumours). Middle: knowledge (nodes and threads). Near: evidence (paper you can read). Nearest: you (what it means for the student).
- **Three moves.** *Focus Pull* (camera to a node) → *Pull to Light* (the node unfolds into evidence paper) → *Lift* (the "그래서 나에게?" bridge rises to the front).
- **The fact gate is part of the design.** A claim cannot render without a source and a status. A "beat humans" number cannot render without its counterweight. Corrections stay visible.
- **Two temperatures.** *Ember* is the world's heat: claims, news, risk (Part 1). *Phosphor* is your agency: live agents and actions you can take (Part 2). The bridge between the parts is a temperature shift.
- **Motion is a material, with tokens.** Thought *drifts*. Evidence *snaps*. Nothing moves for decoration.

The name is a pun. AI news arrives as a **minefield** of half-true numbers ("AI가 회계사를 이겼다", "400개 난제"). The workshop shows a **mind field**: one head that walked through that minefield and kept the receipts.

---

## 1. Thesis and spatial model

### 1.1 Depth = distance from noise to meaning

```
 far ◀──────────────────────────────────────────────────────────▶ near (viewer)

 L0 NOISE 소음        L1 FIELD 지식          L2 LIGHT 근거          L3 ME 나
 headline fragments,  knowledge nodes,       evidence paper:        "그래서 나에게?"
 tickers, numbers     threads, clusters      image · stat · video   one sentence +
 without sources                             · source · status      one action
 fog on void,         bone lines on          bone paper, ink,       paper + phosphor tab
 blurred              graphite               real shadow
 motion: drift        motion: drift → focus  motion: paper snap     motion: lift
```

Moving toward the viewer means moving toward proof, and then toward the student. The z-axis carries the argument of the whole workshop: *noise → knowledge → evidence → judgement*.

### 1.2 Route, focus points, beats

- **Field**: the whole map, with clusters of nodes such as 사무직·벤치마크, 과학, 해킹·보안, 시장·비용, 인물·역사, 학생의 의미, 패러다임, 에이전트, 실전·플랫폼, 용어.
- **Route**: an ordered path through the field. It is the presenter's structure, and it replaces a slide order. The structure belongs to the builder; the system only gives it a shape.
- **Focus point**: one stop on the route. It defines a camera frame and a **Stage composition** (§6.3).
- **Beat**: one clicker press inside a focus point. Each beat triggers at most one lead motion.
- **Overview**: the camera pulls all the way back to show the whole head, with the visited route lit. This is the natural opening (scattered) and closing (connected) image.

---

## 2. Design principles

1. **Evidence before adjectives.** Show the image, number, clip, or source, not a word like "놀라운".
2. **Every claim has weight.** Superlatives travel with their condition. The system makes the pair the default shape (§4.6).
3. **One focus at a time.** Each stage has one accent and one lead motion. Everything else dims.
4. **Space, not pages.** Transitions are camera moves through one continuous world. Wipes, slide numbers, and "3 / 15" never appear.
5. **Korean first, projection proof.** Hangul is the primary script. Anything the audience must read is legible from the back row of a lit classroom.
6. **Honest about being made with AI.** Research provenance (which agent found what) is a visible, designed element, not a hidden footnote.
7. **No slop.** No purple gradients, glowing brains, robot hands, emoji bullets, or generic three-card feature rows (§8.2).

---

## 3. Tokens

All tokens ship as CSS custom properties (§3.8). Values are a proposal. The *roles* are the contract.

### 3.1 Color

**Field: the cool, dark space of thought**

| Token | Hex | Role |
|---|---|---|
| `--field-void` | `#07080A` | Outermost background, L0 |
| `--field-0` | `#0D0F11` | Base field |
| `--field-1` | `#14171A` | Raised panel, HUD |
| `--field-2` | `#1C2024` | Hover, cluster wash |
| `--line` | `#2B3136` | Hairlines, gridlines, dormant threads |
| `--line-strong` | `#434B52` | Active threads, axes |
| `--fog` | `#8C969D` | Secondary text on field (6.1:1 on field-0) |
| `--bone` | `#ECE7DD` | Primary text on field (15:1) |

**Paper: the warm material of evidence**

| Token | Hex | Role |
|---|---|---|
| `--paper-0` | `#F3EFE7` | Evidence sheet |
| `--paper-1` | `#E8E2D6` | Second sheet, stacked paper |
| `--paper-edge` | `#D3CBBB` | Sheet edge, rules on paper |
| `--ink` | `#131211` | Primary text on paper |
| `--ink-2` | `#4B4740` | Secondary text on paper |
| `--ink-3` | `#7A746A` | Large or decorative text only (4.0:1) |

Thought is cool and evidence is warm. The contrast between the two materials does work that color alone can't: when paper appears, the audience knows *this is the proof*.

**Accents: one per stage, and they carry meaning**

| Token | Hex | Role |
|---|---|---|
| `--signal` | `#FF4A1C` | **Ember.** The world's heat: the focal claim, risk, Part 1 accent (5.6:1 on field) |
| `--signal-ink` | `#C2330E` | Ember on paper (4.5:1) |
| `--phosphor` | `#C6F23A` | **Phosphor.** Your move: live agents, actions, Part 2 and bridge accent |
| `--phosphor-ink` | `#4F6B00` | Phosphor on paper (4.9:1) |
| `--accent` | `var(--signal)` | *The* accent of the current scene. The temperature shift re-points it (§5.3 #11) |

**Epistemic status: always glyph + label, never color alone**

| Status | Glyph | On field | On paper | Meaning |
|---|---|---|---|---|
| 확정 verified | ● | `--bone` | `--ink` | Primary source checked |
| 조건부 conditional | ◐ | `#F2B23A` | `#8A5A00` | True under a stated condition or basis |
| 미확인 unverified | ◌ + hatch | `--fog` | `--ink-3` | Single report, X post, not yet traced to an original |
| 제외 excluded | ⊘ + strike | `#6B7378` | `--ink-3` | Deliberately not used; shown only to teach verification |

**Data viz**

- Base series `--fog` at 60%. Highlighted series `--accent`. A human baseline is always a `--bone` (or `--ink`) rule, labelled directly.
- Heat ramp (CVE and similar): `#3A4146 → #6B5A4E → #A65A3A → #D9512A → #FF4A1C`.
- Never rainbow. At most one highlighted series per chart.

### 3.2 Typography

| Family | Role | Why |
|---|---|---|
| **Pretendard Variable** | Korean + Latin sans: text, UI, Korean display (800–900, tight tracking) | The best open Hangul UI face. Even rhythm with Latin. Variable weight |
| **Archivo** (variable, `wdth` 62–125, `wght` 100–900) | Numerals and Latin display | The width axis is a motion channel: numbers count up while widening from condensed to normal |
| **Hahmlet** (variable) | Voice: quotes from people, the speaker's "I" | A contemporary Korean serif that gives quotes a human voice next to the machine-sans |
| **JetBrains Mono** (falls back to Pretendard for Hangul) | Evidence metadata: sources, timecodes, kind tags, glossary indices, agent traces | Mono reads as "record". It is the typographic sign of evidence |

**Stage scale** (reference 1920×1080; tokens use `clamp(min, px/1920*100vw, max)`)

| Token | px @1080p | Line height | Use |
|---|---|---|---|
| `--t-micro` | 16 | 1.25 | Source lines, timecodes, kind tags (mono). Not for must-read text |
| `--t-caption` | 20 | 1.4 | Captions, chart labels |
| `--t-body` | 28 | 1.5 | **Projection floor** for anything the audience must read |
| `--t-lead` | 36 | 1.45 | Bridge sentences, definitions |
| `--t-h3` | 48 | 1.2 | Evidence claims |
| `--t-h2` | 72 | 1.08 | Focus titles |
| `--t-h1` | 112 | 1.0 | Cluster titles |
| `--t-display` | 180 | 0.92 | Stat numerals, chapter words |
| `--t-mega` | 320 | 0.85 | Poster numerals, cropped type (may bleed past the safe area) |

**Rules**

- Korean text uses `word-break: keep-all; line-break: strict;`. Never break inside a Korean word.
- Korean display tracking is `-0.03em` to `-0.045em`. Latin mono micro uses `+0.04em`, uppercase.
- All counting numbers use `font-variant-numeric: tabular-nums` so count-ups don't jitter.
- Keep decimals exactly as sourced: **7.2%**, not "7%". **56.4%**, not "약 56%".
- At most two weights per stage, plus mono.
- Quotes: Hahmlet for the Korean line. When a verbatim original exists, set the original-language line below it in mono micro.

### 3.3 Spacing

4px base. Use the scale only.

`--s-1 4 · --s-2 8 · --s-3 12 · --s-4 16 · --s-5 24 · --s-6 32 · --s-7 48 · --s-8 64 · --s-9 96 · --s-10 128 · --s-11 192 · --s-12 256`

- Inside components: `s-2`–`s-6`. Between components: `s-7`–`s-9`. Stage safe-area margins: `s-9` horizontal (96) and 72 vertical.
- Baseline grid: 8px.
- Poster compositions keep **at least 40% of the stage empty**. Dark space is a material here, not leftover space.

### 3.4 Radius

| Token | Value | Use |
|---|---|---|
| `--r-0` | 0 | Paper, frames, charts, video. Evidence is never rounded |
| `--r-1` | 2px | Inputs, kind tags |
| `--r-2` | 6px | HUD panels, agent trace rows |
| `--r-pill` | 999px | Glossary chips, status pills, provenance chips |
| `--r-node` | 50% | Concept nodes |

Sharp means fact; round means interface. That split is deliberate.

### 3.5 Depth and elevation

On the field, depth comes from **luminance, scale, and focus blur**, not drop shadows. Paper is the only physical object, so it is the only thing with a real shadow.

| Token | Value | Use |
|---|---|---|
| `--depth-noise` | scale .82 · blur 3px · opacity .35 | L0 fragments |
| `--depth-field` | scale 1 | L1 nodes |
| `--dof-dim` | blur 4px · opacity .28 | Everything not in focus |
| `--shadow-paper-1` | `0 1px 0 rgb(0 0 0/.25), 0 8px 24px -8px rgb(0 0 0/.55)` | Small evidence |
| `--shadow-paper-2` | `0 1px 0 rgb(0 0 0/.25), 0 28px 64px -16px rgb(0 0 0/.7)` | Hero evidence |
| `--glow-accent` | `0 0 0 1.5px var(--accent), 0 0 32px -4px color-mix(in oklab, var(--accent) 55%, transparent)` | Focused node only |
| `--hud-blur` | `backdrop-filter: blur(12px)` + 1px `--line` | HUD only (the single glass surface in the system) |

### 3.6 Texture

- **Grain**: a 256px noise tile, animated in `steps(6)` at about 12fps. Opacity `.07` on field, `.035` on paper. On a chapter cut, grain spikes to `.18` for one frame.
- **Vignette**: radial, field only, 0 → 35% at the corners.
- **Deckle edge**: an optional torn top edge, only on news-clipping evidence (from the mood board's torn paper). Nothing else gets it.
- **Hatch**: 45° 1px lines at 6px pitch. Used for 미확인 status and for saturated-benchmark bars.

### 3.7 Motion tokens

Full language in §5.

| Token | Value | Use |
|---|---|---|
| `--dur-tick` | 90ms | Hover, press |
| `--dur-quick` | 180ms | Chips, badges, tooltips |
| `--dur-base` | 280ms | Card state changes, focus ring |
| `--dur-paper` | 520ms | Pull to Light unfold |
| `--dur-scene` | 800ms | Stage composition enter, depth-of-field |
| `--dur-camera` | 1200ms | Focus Pull camera move |
| `--dur-count` | 1400ms | Number count-up |
| `--dur-chapter` | 1800ms | Chapter cut, temperature shift |
| `--dur-ambient` | 18–32s | Drift loops (random phase per node) |
| `--ease-arrive` | `cubic-bezier(.16,1,.3,1)` | Things entering (expo out) |
| `--ease-depart` | `cubic-bezier(.7,0,.84,0)` | Things leaving (expo in) |
| `--ease-camera` | `cubic-bezier(.76,0,.24,1)` | Camera moves (quart in-out) |
| `--ease-snap` | `cubic-bezier(.34,1.56,.64,1)` | Paper landing, slight overshoot |
| `--ease-drift` | `cubic-bezier(.37,0,.63,1)` | Ambient (sine in-out) |
| `--ease-scrub` | `linear` | Progress-bound drawing |
| `spring-paper` | stiffness 380 · damping 30 · mass 1 | JS spring for paper |
| `spring-beam` | stiffness 120 · damping 14 · mass 1 | Counterweight beam (visible wobble) |
| `--stagger-char` | 24ms | Typing labels |
| `--stagger-word` | 60ms | Headline words |
| `--stagger-item` | 90ms | Rows, nodes |
| `--stagger-card` | 140ms | Evidence cards |
| `--stagger-cap` | 600ms | No stagger sequence runs longer than this |

### 3.8 Token sheet

```css
:root {
  /* field */
  --field-void:#07080A; --field-0:#0D0F11; --field-1:#14171A; --field-2:#1C2024;
  --line:#2B3136; --line-strong:#434B52; --fog:#8C969D; --bone:#ECE7DD;
  /* paper */
  --paper-0:#F3EFE7; --paper-1:#E8E2D6; --paper-edge:#D3CBBB;
  --ink:#131211; --ink-2:#4B4740; --ink-3:#7A746A;
  /* accents */
  --signal:#FF4A1C; --signal-ink:#C2330E; --phosphor:#C6F23A; --phosphor-ink:#4F6B00;
  --accent:var(--signal);
  /* status */
  --st-verified:var(--bone); --st-conditional:#F2B23A; --st-conditional-ink:#8A5A00;
  --st-unverified:var(--fog); --st-excluded:#6B7378;
  /* type */
  --font-sans:"Pretendard Variable",Pretendard,"Apple SD Gothic Neo","Noto Sans KR",system-ui,sans-serif;
  --font-display:"Archivo","Pretendard Variable",sans-serif;
  --font-serif:"Hahmlet","Noto Serif KR",serif;
  --font-mono:"JetBrains Mono","Pretendard Variable",ui-monospace,monospace;
  --t-micro:clamp(12px,calc(16/1920*100vw),22px);  --t-caption:clamp(14px,calc(20/1920*100vw),28px);
  --t-body:clamp(18px,calc(28/1920*100vw),40px);   --t-lead:clamp(22px,calc(36/1920*100vw),52px);
  --t-h3:clamp(28px,calc(48/1920*100vw),68px);     --t-h2:clamp(40px,calc(72/1920*100vw),104px);
  --t-h1:clamp(56px,calc(112/1920*100vw),160px);   --t-display:clamp(88px,calc(180/1920*100vw),260px);
  --t-mega:clamp(140px,calc(320/1920*100vw),460px);
  /* space · radius */
  --s-1:4px; --s-2:8px; --s-3:12px; --s-4:16px; --s-5:24px; --s-6:32px;
  --s-7:48px; --s-8:64px; --s-9:96px; --s-10:128px; --s-11:192px; --s-12:256px;
  --r-0:0; --r-1:2px; --r-2:6px; --r-pill:999px; --r-node:50%;
  /* motion */
  --dur-tick:90ms; --dur-quick:180ms; --dur-base:280ms; --dur-paper:520ms; --dur-scene:800ms;
  --dur-camera:1200ms; --dur-count:1400ms; --dur-chapter:1800ms;
  --ease-arrive:cubic-bezier(.16,1,.3,1); --ease-depart:cubic-bezier(.7,0,.84,0);
  --ease-camera:cubic-bezier(.76,0,.24,1); --ease-snap:cubic-bezier(.34,1.56,.64,1);
  --ease-drift:cubic-bezier(.37,0,.63,1);
  --stagger-char:24ms; --stagger-word:60ms; --stagger-item:90ms; --stagger-card:140ms;
}
[data-temperature="live"] { --accent: var(--phosphor); }   /* Part 2 + bridge */
@media (prefers-reduced-motion: reduce) {
  :root { --dur-camera:1ms; --dur-paper:160ms; --dur-chapter:300ms; --dur-count:1ms; }
}
```

---

## 4. Components

Each component ships with its states **and its motion**: enter, focus, exit, and reduced-motion. Motion lives inside the component, not in a separate deck file. Names are bilingual so Korean speakers and code can both refer to them.

### 4.1 Knowledge Node · 지식 노드 (L1)

The atom of the field: one thing the speaker knows.

- **Anatomy**: glyph · label (mono micro, Korean allowed) · evidence count (tiny numeral) · halo (focus ring).
- **Kind → glyph shape**: concept ● · event ◆ · person ○ (ring) · number ▣ · media ▶ (in a square) · claim ◇.
- **Status → fill**: solid = 확정 · half = 조건부 · hatched = 미확인 · struck = 제외.
- **Size by weight** (number of evidence items): S 8px · M 12px · L 18px glyph.
- **States**:
  - *dormant*: opacity .55, label at 40%.
  - *near*: full label, hairline to its cluster.
  - *focused*: scale 1.25, `--glow-accent`, threads light up.
  - *visited*: a small tick, sits brighter than dormant.
  - *dimmed*: `--dof-dim` while another node is focused.
- **Motion**: ambient drift of ±3px over `--dur-ambient` with random phase. Focus uses `--dur-base` + `--ease-snap`. Label reveal uses `--dur-quick`.

### 4.2 Thread · 연결 (L1)

A relation between two nodes. Threads are what make scattered knowledge into a head.

- **Types**:
  - *cause →*: solid 1.5px, bone at 60%.
  - *contrast ↔*: dashed 6/6 in `--accent`.
  - *sequence*: solid fog with ticks.
  - *context*: dotted fog, 1px.
  - *tail question*: a cause line with a mono pill label: **왜?** · **그래서?** · **같이 볼 것**. This comes straight from the 꼬리질문 lane of the research.
- **Geometry**: gentle quadratic arcs. Never elbows (the Conveyor in §4.15 is the one exception).
- **Motion — Thread draw**: the stroke draws on (stroke-dashoffset, 600ms, `--ease-arrive`). One pulse dot then travels from source to target (900ms). The label types on at `--stagger-char`.

### 4.3 Cluster Label · 군집 (L1)

A topic name floating over a node group. Set in Pretendard 800 at `--t-h1`, opacity .14 at rest and .9 when the camera arrives. A mono index (`01`, `02`…) sits alongside, plus the count of nodes visited.

### 4.4 Evidence Card · 근거 카드 (L2)

This is the hero of the system: the thing that turns a claim into a fact.

- **Material**: `--paper-0`, `--r-0`, `--shadow-paper-1` or `-2`. Grain at paper strength.
- **Anatomy**, top to bottom:
  1. **Kind tag** (mono micro): `IMG · STAT · VIDEO · POST · PAPER · NEWS · QUOTE · DOC`.
  2. **Status badge** (right-aligned).
  3. **Media slot**: 16:9, 4:5, or 1:1. Images get a duotone (ink/paper) by default; product and UI shots keep full color.
  4. **Claim**: Pretendard 700, `--t-h3`, at most 2 lines.
  5. **Context**: `--t-body`, at most 2 lines.
  6. **Source line**: mono micro, `publisher · YYYY-MM-DD · short-url · 원문|요지`.
  7. **Provenance chip** (optional, §4.5).
  8. **Counterweight slot**: required when the claim is a superlative or a "beats humans" claim.
- **Sizes**: S 320w (cluster preview) · M 480w (dossier support) · L 800w (dossier hero) · XL full-bleed.
- **Variants**:
  - *Post* (X post): avatar, handle, ♥ likes and 조회 views in tabular mono. **Defaults to 미확인** until traced to an original. Engagement is not evidence.
  - *Paper*: arXiv ID, Latin title, authors in mono, one key figure.
  - *News clipping*: deckle edge, publisher masthead in Hahmlet, date.
  - *Image plate*: full-bleed image with a caption strip.
  - *Doc excerpt*: quoted passage with one phrase underlined in `--signal-ink`.
- **Rule**: no evidence card renders without a source line and a status. Enforce this in the data schema (§10), not by discipline.

### 4.5 Source Line · Status Badge · Provenance Chip

- **Source line**: always mono. It is the system's most repeated element and should feel like a film credit.
- **Status badge**: pill shape, glyph + Korean label (`● 확정`, `◐ 조건부`, `◌ 미확인`, `⊘ 제외`). An optional basis note follows on hover or in source mode.
- **Provenance chip**: names who researched the item. Values: `grok · X scout`, `muse · PM`, `dots · 꼬리질문`, `감독관 · fact gate`, `claude`. This makes the AI-made research visible. In the Part 2 "how this was made" moment it becomes a teaching device.

### 4.6 Counterweight · 저울 (L2): the signature component

A stat pair that refuses to show a headline number alone.

- **Anatomy**:
  - **Claim** side (ember): `--t-mega` numeral, the task, and who did it.
  - **Pivot**: a thin beam.
  - **Condition** side (bone or ink): `--t-display` numeral and its condition.
  - A source line for each side.
  - **Verdict** line (optional): one student-language sentence.
- **Contract**: `claim` and `counter` are both required props. A "beat humans" headline cannot render alone. This is the fact gate expressed as an API.
- **The beam is rhetorical, not a chart.** Never encode values in its tilt angle.
- **Motion — Counterweight**:
  1. The claim counts up (`--dur-count`, `--accent`) and the beam tilts toward it as it grows.
  2. Hold for 300ms.
  3. The counter drops in with a paper snap.
  4. The beam rebalances on `spring-beam` with a visible wobble and settles within about 900ms.
  5. The verdict types on.
- **Reference content** (verified pairs from the package; use these exactly):
  - Mercor simplified month-end close (2026-10-01): **Claude Opus 5 100%** (all 20 attempts) vs **human CPA average 37%**. Counterweight: **APEX-Accounting, full accounting tasks, best model 56.4%**.
  - GDPval: **GPT-5.2 Thinking 70.9%** (win + tie) ⟷ GDPx (deliberately hard expert tasks): **best model 12.0%**.
  - Office/admin exposure: **theoretical ~90%** ⟷ **observed coverage 34.3%**.

### 4.7 Stat Block · 숫자 포스터 (L2)

One number, treated like a poster.

- **Anatomy**: numeral (Archivo; during count-up `wdth` goes 62 → 100 and `wght` 700 → 800) · unit · label · **basis line** · delta chip (▲/▼ vs the previous figure) · source line · status.
- **Basis line is required** whenever a cohort or denominator exists. For example, `7.2% — 기준: 청년층(15~29세)` and `98.0% — 기준: 취업 희망자`.
- **Motion**: count-up with tabular numerals. The unit lands last with a snap. Decimals count at their final precision.

### 4.8 Chart Blocks · 차트

One chart is a stage. Its state changes by beat, Pudding-style; the system does not make a new chart for every number.

| Variant | For | Specific behaviour |
|---|---|---|
| **Bar Ranking** | Benchmarks | Horizontal bars, one highlighted. The human baseline is a labelled bone rule |
| **Rising Curve** | CVE growth | Fog area, bone line, last segment in `--accent`. A built-in *context annotation* can carry the counter-story (e.g. "발견·등록 체계 산업화: CNA 563개 기관") |
| **Slope** | Price changes | Two points, optional log y-axis, with the % change as a stat. **Must support rises**: H100 rental $1.70 (2025 low) → $2.88 (2026) is a rebound, never a decline-only story |
| **Saturation Meter** | HumanEval ~99%, MMLU-Pro ~90% | A gauge with a ceiling. Above 95% the bar hatches and shows the label `포화`: a saturated test is an old test |
| **Dual Bar** | Theory vs observed | An outline bar (~90%) sits behind a filled bar (34.3%) on one axis |
| **Stepper** | Any multi-state story | Same axes, data swapped per beat. Transitions use `--ease-camera` |

- **Chart rules**: label data directly, with no legends where possible. Axes in mono micro. Gridlines `--line` at 40%. A source line under every chart. Bars draw from the baseline on the beat with `--ease-arrive` and `--stagger-item`.

### 4.9 Video Frame · 영상 프레임 (L2)

- **Anatomy**:
  - Letterboxed frame (16:9 or 2.39:1) with a 1px `--line` border.
  - Timecode (mono) top-left; source credit and status bottom-left.
  - **Evidence-moment markers** (◆) on the scrubber.
  - Korean caption track.
  - **Poster frame** shown before play.
- **Modes**: *Stage* (10 cols) · *Dossier* (6 cols) · *PiP* (320w, docks bottom-right, muted, keeps playing while the speaker talks) · *Reel* (9:16, for X and shorts clips).
- **Offline fallback**: poster + QR code + short URL. A dead embed must never be shown live.
- **Motion**: opens like a projector iris: the letterbox bars slide in over `--dur-paper`, then the image fades up. PiP docking uses `--ease-camera`.
- **Rules**: no autoplay with sound (the presenter presses `V`). Unverified video passages (e.g. Normaltic body quotes) are never captioned as quotes.

### 4.10 Voice Card · 인물 발언 (L2)

- **Anatomy**: B&W duotone portrait · quote in Hahmlet at `--t-lead`–`--t-h3` · attribution and date in mono · a marker: **원문** (verbatim, with the original-language line below) or **요지** (paraphrase).
- **Triptych variant**: "세 사람이 다르게 읽는다", three voices side by side (Karpathy · Altman · Amodei), each with a one-word stance tag.
- **Rule**: a quote is marked 원문 only when its source is confirmed.

### 4.11 Correction Mark · 정정

Shows verification happening on screen. This is the habit the students most need (학생의미_메타 §2-2, §6).

- **Anatomy**: the original phrase is struck with a hatched `--accent` bar. The corrected phrase types on beside it, with a mono reason line under both.
- **Reference content** (from the fact gate):
  - `400개 난제 → 372개 결과군`
  - `창업 단지 1,000곳 → 826곳`
  - `나비에-스토크스 해결 → 강제 조건 변형 · 주장 단계`
  - `H100 가격 하락 → 2026 반등 국면`
  - `MMLUP → MMLU-Pro (≠ MMMU-Pro)`
- **Motion — Correction**:
  1. The strike draws (280ms).
  2. The struck text fades to 40%.
  3. The corrected text types on (`--stagger-char`).
  4. The reason line fades in.

### 4.12 Timeline · 연표 (L1/L2)

- **Anatomy**: a horizontal rail, era bands (Transformer → Scaling → Reasoning/CoT → Agents), events as ◆ with labels alternating above and below, and a **now cursor** (phosphor pulse).
- **Scale modes**: *linear* and *compressed* (log toward now).
- **Motion — Time Compression**: the rail morphs from linear to compressed over 1600ms on `--ease-camera`. Recent years spread out as the past compresses, so the acceleration becomes visible in one move. Clicking an event triggers a Focus Pull to its node.
- **Content**: dates come only from P1_인물과역사.md. Undated items, such as the Opus 5.5 release date, are shown without a date, never guessed.

### 4.13 Paradigm Rings · 패러다임 링

- **Anatomy**: concentric rings, innermost first: **Prompt ⊂ Context ⊂ Harness ⊂ Loop ⊂ Graph**. Each ring has its name set along its arc in mono and an era tag (when the term took hold, from P2_엔지니어링패러다임.md). Focusing a ring opens a one-line definition card.
- **Motion — Nesting**: each new ring expands outward from the previous ring's radius (700ms, `--ease-arrive`). The older ring's label dims but stays. The point: every paradigm *wraps* the previous one; none replaces it.
- **Read-mode fallback**: a vertical ladder.

### 4.14 Loop Orbit · 루프

- **Anatomy**: a circular orbit with four stations: **계획 → 실행 → 관찰 → 검증**. A phosphor token travels the orbit while an iteration counter (`iter 03`) ticks. An exit gate opens when verification passes.
- **States**: running · failed (the token flashes `--signal` at 검증 and takes a short "fix" spur back to 실행) · done · human-in-the-loop (one station becomes a person ring).
- **Variants**: *RSI loop*, AI improving AI, labelled `Anthropic 내부 측정 · 1% → 26%` (company-reported, so the status is 조건부).
- **Motion — Orbit**: one lap takes 2400ms on `--ease-drift` per segment. Each lap increments the counter with a quick tick.

### 4.15 Agent Kit · 에이전트 부품

These explain agents; they are not live software UI. They draw on the owner's liked posts in frontend_UI_library: agent status, tool calls, Trace, Agent Fleet, Handoff, Thinking process, and the Factorio-belt connector.

- **Trace Row**: step type (생각 · 도구 · 결과) · text · duration (mono) · status. "생각" rows get one restrained shimmer sweep (1.6s, a single pass, no loop).
- **Tool Call**: tool name (mono), collapsed args, result preview. States: queued · running (phosphor ring) · ok · error (signal).
- **Fleet**: an orchestrator node with sub-agents, status dots, and a count.
- **Handoff**: a baton token passes between two agents along a thread.
- **Conveyor Thread**: a belt-style edge with small task tokens moving continuously. Use it for swarms, orchestration, and the **making-of** map of how this workshop was researched (muse → grok / dots / 감독관 / meta → claude).

### 4.16 Glossary Chip · 용어 칩 + Glossary Tray · 용어 주머니

- **Chip**: an inline term in running Korean text. Pretendard 600, dotted underline, superscript mono index (`API¹⁴`). Activating it opens a **definition card** (paper S):
  - 한 줄 정의 (student level)
  - 비유 (analogy)
  - 예시 (example)
  - 공식 출처 (official source)
- **Kinds**:
  - *기초 용어*: GitHub, 호스팅, DIFF, API, TOOL, SKILL, 사고 수준, 모델 종류, 오픈웨이트.
  - *필수 개념*: AGENTS.md / CLAUDE.md, skill, 루틴, 결정론적 도구, 토큰, 컨텍스트, 압축, 슬래시 명령어.
- **Tray**: a bottom dock that collects every defined term (`용어 7/18`). Opening it shows the **Shelf** composition (§6.3).
- **Motion — Fly to Tray**: the chip lifts, arcs into the tray (700ms, `--ease-camera`), and the tray count ticks.

### 4.17 Bridge Card · 그래서 나에게? (L3)

The mandatory student-meaning layer between Part 1 and Part 2, and at the end of any cluster.

- **Anatomy**: paper with a phosphor tab reading **→ 나**. Below it: a student-language line (학생의미_메타 §4) at `--t-lead`, then **"오늘 바꿀 판단 한 가지"**, one action in Pretendard 700.
- **Motion — Lift**: the field and evidence recede (scale .96, dim). The card rises from below with `spring-paper` and the tab slides out.

### 4.18 Chapter Marker · 장 표지

- **Anatomy**: a giant cropped word at `--t-mega` that crosses the frame, a mono part index (`PART 01 · 지금 AI가 하는 일`), and a cluster count.
- **Motion**: Chapter Cut (§5.3 #10).

### 4.19 Limit Meter · 한도 미터

- **Anatomy**: rows of platform · cost (무료 / 유료) · limit text · quota meter · status. Uncertain limits are marked ◐ 조건부.
- **Layout**: Swiss table. No zebra stripes; hairline rules only.
- **Reference content**: 모두의 AI 실험실, `1인당 4만원 상당 토큰 · 선착순 3만명 목표`.

### 4.20 Presenter HUD · 진행 표시 + Overview Map

- **Top-left**: breadcrumb in mono (`01 사무직·벤치마크 / 회계`).
- **Top-right**: elapsed timer (turns amber at 80:00 of 90:00) and beat dots.
- **Bottom-left**: minimap of the field with the visited route lit.
- **Bottom-right**: key hints, auto-hiding after 2s idle.
- **Modes**:
  - **Source mode** (`S`): every element enlarges its source line.
  - **Overview** (`Esc`/`O`): camera pulls back to the whole field.
  - **Blackout** (`B`).
- The HUD is the system's only glass surface (`--hud-blur`).

### 4.21 Noise Ticker · 소음 (L0)

Fragments of real headlines and X-post first lines drift behind everything. They are blurred and fog-colored, never in focus. They are dense at the opening and on chapter cuts, and almost gone during focus. They are the "난잡하게 흩어진" state, made visible.

---

## 5. Motion language

### 5.1 Principles

1. **Motion shows relations.** Every movement says *cause*, *contrast*, *sequence*, *nesting*, *correction*, or *focus*. If it says none of these, cut it.
2. **Thought drifts, evidence snaps.** Field elements move slowly and organically on sine eases with ambient phase. Paper moves like paper: fast, crisp, a slight overshoot, a real shadow.
3. **Camera, not cuts.** Changing topic means moving through space. The only hard cut is the Chapter Cut, and it is treated as a *film* cut, not a slide transition.
4. **One lead, one follow.** Each beat gets at most one lead motion and one follow-up. Ambient drift continues at ≤ 4px amplitude.
5. **Reading order is choreography.** Elements enter in the order the eye should read them: kind → claim → media → source.
6. **Presenter time beats animation time.** Every animation is **interruptible**: the next beat jumps the current animation to its end state. Animations never queue, and the presenter never waits.
7. **Rest state is a design.** Every scene has a still frame that works as a screenshot or PDF page and in reduced motion.

### 5.2 Durations, easings, staggers

See §3.7. Rules of thumb:

- Entering uses `--ease-arrive`. Leaving uses `--ease-depart` at 60% of the entering duration.
- Reversing (the presenter goes back a beat) plays at 0.5× duration.
- Nothing the audience must read animates longer than `--dur-scene` before it is readable.

### 5.3 Signature transitions

| # | Name | When | Choreography | Timing | Reduced motion |
|---|---|---|---|---|---|
| 1 | **Scatter → Constellation** · 흩어짐→별자리 | Opening; reversed for the finale | L0 fragments float at random positions and rotations. On the beat, each flies to its node position; threads draw; cluster labels fade up | ≤ 2.4s total, `--ease-arrive`, `--stagger-item`, capped | Cross-fade to the final map |
| 2 | **Focus Pull** · 초점 당기기 | Route → next focus point | Camera translates and scales to the focus frame. Others go to `--dof-dim`. The focused node's threads draw | `--dur-camera`, `--ease-camera`; DOF over `--dur-scene` | 200ms fade |
| 3 | **Pull to Light** · 빛으로 꺼내기 | Node → evidence | Node glyph scales and morphs to a rectangle (clip-path inset). Paper rises from L1 to L2 as its shadow grows. Grain switches to paper strength. Contents enter in reading order. Field dims to 35% | `--dur-paper`, `--ease-snap` / `spring-paper`, `--stagger-item` | Paper fades in |
| 4 | **Counterweight** · 저울 | Stat pair | §4.6 | `--dur-count` + 300ms hold + `spring-beam` | Both values shown at rest |
| 5 | **Thread** · 실 잇기 | Relation reveal | Stroke draws, pulse travels, label types on | 600 / 900ms | Lines shown, no pulse |
| 6 | **Nesting** · 감싸기 | Paradigm rings | §4.13 | 700ms per ring | Static rings |
| 7 | **Orbit** · 궤도 | Loops | §4.14 | 2400ms per lap | Step-by-step highlight |
| 8 | **Time Compression** · 시간 압축 | Timeline | §4.12 | 1600ms, `--ease-camera` | Swap scales |
| 9 | **Correction** · 정정 | Fact-gate moments | §4.11 | ~1.2s total | Struck + corrected, static |
| 10 | **Chapter Cut** · 컷 | Part changes | Giant word slides across; a mask wipe reveals the new field region; one-frame grain spike plus two frames of black | `--dur-chapter` | Fade through black, 300ms |
| 11 | **Temperature Shift** · 온도 전환 | Part 1 → bridge → Part 2 | `--accent` interpolates ember → phosphor in OKLCH across every visible element while the Bridge Card lifts | `--dur-chapter` | Instant swap |
| 12 | **Fly to Tray** · 주머니로 | Glossary | §4.16 | 700ms | Count updates |

### 5.4 Beat model (clicker-safe)

| Key | Action |
|---|---|
| `→` `Space` `PageDown` | Next beat (clickers send PageDown or arrows) |
| `←` `PageUp` | Previous beat (fast reverse) |
| `Esc` / `O` | Overview map |
| `S` | Source mode |
| `G` | Glossary tray |
| `V` | Play / pause video |
| `B` | Blackout |
| `M` | Toggle reduced motion (rehearsal, safety) |
| `1`–`9` | Jump to cluster |

### 5.5 Performance budget

- Animate `transform` and `opacity` only. Apply blur to at most two layers at once; prefer pre-blurred duplicates.
- Grain is one tiled image moved by `background-position` in `steps()`. Never use per-frame canvas noise.
- At most about 60 animating nodes at a time. Off-screen clusters are frozen.
- Test at 1920×1080 on the presenting laptop, over HDMI, with the projector's actual contrast.

---

## 6. Layout and grid

### 6.1 Stage grid (the camera's frame)

- 16:9, reference 1920×1080.
- **Safe area**: 96px left and right, 72px top and bottom (projector overscan). Meaning stays inside; only decorative crops may bleed.
- 12 columns, 24px gutters (~122px columns), 8px baseline.
- The HUD lives in the outer 48px band and never overlaps content in the safe area.

### 6.2 Field (the world)

- An infinite canvas in world units. Each focus point stores its camera rect `{x, y, scale}`.
- **Suggested topology** (non-binding):
  - Part 1 clusters on the *warm west* side.
  - Part 2 clusters on the *live east* side.
  - 학생의 의미 (bridge) at the center.
  - L0 noise at the periphery.
  - Crossing the center triggers the Temperature Shift.
- The overview fits the whole field with 10% padding. Visited route segments glow in `--accent` at 40%.

### 6.3 Stage compositions

| Composition | Grid | Use |
|---|---|---|
| **Poster** | One element across 12 cols, may crop past the safe area; ≥ 40% empty | One number, one word, one quote |
| **Dossier** | Hero evidence 7 cols + support stack 5 cols (2–3 cards) + source rail | A claim with its proof |
| **Versus** | 6 + 6 with a pivot gutter | Counterweight, contrast |
| **Rail** | Full-width timeline in the lower third + detail band above | History, sequences |
| **Orbit** | Diagram 8 cols, centered + definition column 4 cols | Loops, rings, fleets |
| **Wall** | Masonry, 4 cols, of media evidence; one in focus, the rest dimmed | Use-case walls (X posts, images, clips) |
| **Shelf** | Swiss grid, 4×3 or 6×3, of paper cards | Glossary, platform limits |
| **Bridge** | Single card, 8 cols, centered; field faint behind | "그래서 나에게?" |

### 6.4 Read mode (≤ 900px, or `?read`)

For students opening the link afterwards on a phone:

- The route becomes a vertical scroll. Each focus point becomes a section.
- Pull to Light becomes a scroll-triggered reveal.
- The HUD becomes a top progress hairline.
- Components and tokens stay the same.

---

## 7. Content → component map (non-binding; structure is the builder's call)

| Research file (Drive package) | Cluster | Main components |
|---|---|---|
| P1_사무직벤치마크.md | 사무직·벤치마크 | Counterweight, Bar Ranking, Saturation Meter, Post cards (usecases) |
| P1_과학난제와지표.md | 과학 · 지표 | Correction Mark, Paper cards, Rising Curve (CVE), Slope (price) |
| P1_해킹보안.md | 해킹·보안 | News clippings, Fleet/Conveyor (HF swarm), Voice/Doc cards |
| P1_시장산업.md | 시장·비용 | Slope (H100 rebound, DDR5), Stat Block (basis labels), Limit Meter |
| P1_인물과역사.md | 인물·역사 | Voice Card triptych, Timeline, Post cards |
| 학생의미_메타.md | 학생의 의미 (bridge) | Bridge Card, Counterweight verdicts, Stat Blocks (채용 변화) |
| P2_엔지니어링패러다임.md | 패러다임 | Paradigm Rings, Timeline |
| P2_에이전트진화와실전.md | 에이전트 · 실전 | Loop Orbit, Agent Kit, Limit Meter, Evidence cards (hackathons) |
| P2_용어와필수개념.md | 용어 | Glossary Chip / Tray / Shelf |
| 감독관_감사.md | everywhere | Status Badge, Correction Mark, Counterweight contract |
| dots_꼬리질문.md | everywhere | Thread tail-question labels |
| frontend_UI_library, loop_graph, usecases, jobs_chart (Drive) | media | Evidence media slots, Video Frames, Agent Kit inspiration |

---

## 8. Rules

### 8.1 Fact gate as design (binding)

1. Every evidence element has a **source line** and a **status**, enforced in the schema.
2. "AI beat humans" claims render **only as a Counterweight**: accounting 100% ↔ full tasks 56.4%, GDPval ↔ GDPx 12.0%, theory ~90% ↔ observed 34.3%.
3. Statistics with a cohort or denominator have a **basis line**: 7.2% = 청년층(15~29세); 98.0% = 취업 희망자 기준.
4. The seven premise errors appear only as **Correction Marks**: H100 rebound, Navier-Stokes claim stage, 372 not 400, poisoning is pre-training (250 documents), Altman verbatim "slightly superhuman AI, 1 trillion", MMLU-Pro ≠ MMMU-Pro, and the "writing weights index" name is not used.
5. **Excluded items** (unsecured Normaltic body quotes, single-report claims, the 30% rider claim, "1,000 sites") never appear as claims. At most they appear struck, as a lesson.
6. X posts default to **◌ 미확인**. Like counts are context, not proof.
7. Company-reported numbers carry the company's name in the source line.

### 8.2 Do / Don't

**Do**
- One accent per stage. Lots of dark space.
- Real images, real numbers, real clips, each with a source.
- Direct labels on charts.
- `keep-all` Korean line breaks.
- End each cluster with one student action, not an emotion.

**Don't**
- Slide numbers, "slide 3/15", title-plus-bullets, more than 3 bullet items on a stage.
- Purple-blue gradients, gradient text, glassmorphism outside the HUD, emoji bullets, generic three-card rows.
- Glowing brains, robot hands, stock 3D blobs, lorem ipsum.
- Rainbow charts, legends where direct labels fit, numbers without a basis.
- Autoplay with sound, looping motion behind the speaker's words, animations the presenter has to wait for.

---

## 9. Rationale

- **Why a field.** The owner asked for "my head's AI knowledge, scattered, with its evidence". A head isn't paginated. A spatial field lets knowledge sit scattered (true to the brief) while a route gives the 90 minutes a spine. The rejected attempt failed on *format* ("발표 덱이 아니야"). MIND FIELD changes the unit from slide to space, so even a linear talk feels like moving through a product.
- **Why depth carries meaning.** Students should leave able to tell noise from evidence. Making that difference spatial means every Pull to Light *performs* verification. The design teaches the workshop's core skill without a lecture.
- **Why the fact gate lives in components.** The research package has a binding fact gate. Rules in a doc get forgotten at 2 a.m.; a component that won't render a lone superlative doesn't. That is also the honest version of "AI beat humans": the pair *is* the story (학생의미_메타 §0: "무서운 숫자 하나, 안심되는 숫자 하나").
- **Why paper.** A second, warm, physical material breaks 90 minutes of black-and-red. It gives evidence a distinct, trustworthy look, and it echoes the mood board's torn paper without turning into collage kitsch.
- **Why ember → phosphor.** Part 1 is the world happening *to* students (heat, risk). Part 2 is students *doing* (live agents). A global accent shift turns the mandatory bridge into a felt moment rather than a section header.
- **Why mono for evidence.** Sources are the most repeated element. Giving them a typeface of record makes credibility a texture of the whole system.
- **Why Korean-first, projection-first.** The audience reads Hangul from the back of a lit classroom. The projection floor (28px body at 1080p), `keep-all`, and tabular numerals are what separate "stylish" from "unreadable but stylish".
- **Why motion tokens inside components.** In Claude Design, a design system's documented contents are palette, typography, components, and layout patterns; motion is not one of them (see workflow-note.md). Shipping motion as tokens *and* as built-in component states is how it survives being inherited by later projects.
- **Why it ends with the map.** The closing overview, every visited node lit and connected, is the literal picture of "내 머릿속 AI 지식". The talk then hands it over: 이제 여러분 차례.

---

## 10. Implementation notes (for Claude Design → Claude Code handoff)

- **Tokens**: CSS custom properties as in §3.8. Any JS reads them via `getComputedStyle`, so there is a single source of truth.
- **Motion recipes**: named, reusable functions: `focusPull(node)`, `pullToLight(node)`, `counterweight(el)`, `threadDraw(edge)`, `nestRings(el)`, `orbit(el)`, `compressTime(rail)`, `correct(el)`, `chapterCut(to)`, `temperatureShift(to)`, `flyToTray(chip)`, `scatterToConstellation(field)`. Use Web Animations API or GSAP. Each returns a handle with `.finish()` so the next beat can interrupt it.
- **Data-driven**: the field is rendered from JSON. The schema makes the fact gate impossible to skip:

```json
{
  "id": "acct-close",
  "kind": "stat",
  "cluster": "office",
  "status": "verified",
  "claim":   { "value": "100%", "label": "Claude Opus 5 · 단순화 월말 결산 (20회 시도 전부)", "vs": "인간 CPA 평균 37%" },
  "counter": { "value": "56.4%", "label": "APEX-Accounting 전체 회계 과제 · 최고 모델" },
  "basis":   "Mercor 루브릭 채점",
  "source":  { "publisher": "Mercor", "date": "2026-10-01", "url": "<from P1_사무직벤치마크 §1.3>" },
  "provenance": "muse · P1_사무직벤치마크 §1.3",
  "threads": [{ "to": "gdpval", "type": "tail", "label": "왜?" }]
}
```

  `source` and `status` are required on every node. `counter` is required when `claim` exists.
- **Assets**: fonts and video files are self-hosted for offline use (projector rooms have bad Wi-Fi). Every video has a poster image, and YouTube links get the QR fallback.
- **Export**: export standalone HTML from Claude Design for the classroom; don't depend on a share link. Hand off to Claude Code to wire the full route, media, and keys.

---

## 11. Inputs and references

- Research package (start with 패키지_빌드브리프.md; 감독관_감사.md is the binding fact gate): https://drive.google.com/drive/folders/1_Nu9t1qyKBYNKL2ZoVyoeCJiHj2VY1C9
- Use-case media root: https://drive.google.com/drive/folders/1qs35QPJl7tfbGuUbzCARDUAgv8F5MQJK
  - frontend_UI_library (owner's liked UI/motion posts): https://drive.google.com/drive/folders/1nfNNHNe7SAn58kuuS8r437DNbdkFNLnH
  - usecases: https://drive.google.com/drive/folders/1SbZtjKhwUuCPUNosm6BsCl_kKb3y6eG7
  - loop_graph: https://drive.google.com/drive/folders/1KMjrXRJb8ADtsSFhEQyjn7b7XBWTpRHr
  - jobs_chart: https://drive.google.com/drive/folders/1hpK73vFpfjNUgn4CD7WBbmGYSZbfo4oQ
  - harness_rag: https://drive.google.com/drive/folders/1PCmGjT8fHJ2VLku6IDujOLG5c4EpxRCJ
  - labs: https://drive.google.com/drive/folders/1IFN2xdw89UrkhGYR6SNB9RbVp0_-sWhs
- Mood board (dark editorial, cinematic motion-poster, grain, giant cropped type, torn paper; palette #0B0B0C · #2A2A2C · #E8E4DC · #D4261C · #B6F23A · #E8541E): https://docs.google.com/document/d/17z0uqWxC-CI8ZYCa1QrIgQ6cFxTzTdIMq2h9YC5LCPc/edit
- Local refs: refs/디자인레퍼런스.md (Pudding scrollytelling, Lusion, Lando Norris, Awwwards motion patterns, claudevideo.org), refs/무드_컨셉보드.md, refs/old-claude-design-brief.md (X UI/motion post index).
- How this system relates to Claude Design's own design-system workflow: workflow-note.md.
