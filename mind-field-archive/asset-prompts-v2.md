# 디자인 에셋 생성 프롬프트, 2차 배치 (주로 2부)

민성의 요청: "디자인 에셋 좀더 받아서 claude한테 좀더 꾸미게 해줘. 특히 2부. 정보를 텍스트가 아닌 이미지로 전달하게 해줘. 인포그래픽과 3blue1brown 같은 스타일로 어려운 내용을 설명하는 식으로 구성하게 해줘."

이 문서는 1단계입니다. Muse와 Dots가 만들 이미지 12장의 프롬프트를 정합니다. 2단계에서 2부를 다시 짓습니다. 어려운 내용(다섯 단계의 포함 관계, 하네스, 루프, 그래프, 검증)을 SVG·CSS·JS로 그린 3Blue1Brown식 설명 애니메이션과 인포그래픽으로 보여 줄 예정입니다. 이 이미지들은 그 애니메이션 **밑에 깔리는 무대**입니다.

- **정보는 SVG가 나릅니다.** 선, 점, 움직임, 순서, 이름표는 2단계에서 코드로 그립니다. 그래서 정확하고 출처를 달 수 있습니다.
- **이미지는 깊이, 빛, 분위기만 나릅니다.** 생성 이미지는 디자인 에셋이고 증거가 아닙니다. 사이트에서는 늘 "생성 이미지 · 디자인 에셋"으로 표시됩니다. 이미지 안의 개수, 크기, 순서는 아무것도 뜻하지 않아야 합니다.

## 하나의 시각 언어

12장이 한 벌로 보여야 하고, 위에 얹힐 SVG 애니메이션과 같은 손에서 나온 것처럼 보여야 합니다.

**바탕.** 아주 짙은 회흑색에 푸른 기운이 아주 살짝 도는 무광 바탕입니다(`#0B0D10` 근처, 가장자리 `#090A0C`까지). 순수한 검정이나 짙은 남색은 쓰지 않습니다.

**선.** 3Blue1Brown 화면처럼 계산된 선입니다.
- 완전한 원, 곧은 직선, 매끄러운 베지에 곡선만 씁니다. 손떨림, 연필, 붓 자국은 없습니다. 1차 배치의 은필 드로잉과 다른 점입니다.
- 굵기는 2,048px 기준 1~3px의 가는 선입니다.
- 선의 심은 밝고, 빛 번짐은 짧고 부드럽게 둡니다(선 굵기의 4~6배 안에서 사라짐). 큰 후광이나 렌즈 플레어는 없습니다.

**팔레트.** 흰 선 말고는 한 장에 두 색까지만 씁니다.

| 이름 | 값 | 역할 |
|---|---|---|
| 분필 흰색 chalk | `#E8E4DC` | 기본 선, 구조 |
| 수학 파랑 math blue | `#5CC8E0` | 보조 구조선, 장(field)과 흐름. 3B1B의 파랑에서 온 색 |
| 산성 초록 acid | `#B6F23A` | **한 장에 하나의 초점만.** 눈이 따라가야 할 점이나 선 하나. 지금 2부 고리의 색과 같음 |
| 엠버 ember | `#E8541E` | 1부와 이어지는 자리에만(이음새 한 장). 2부 안에서는 쓰지 않음 |

**깊이.**
- 선이 그려진 평면은 대부분 정면입니다.
- 원근은 가로 띠(D-6)와 아치(D-2)에만 씁니다.
- 멀어지는 선은 흐려지고 가늘어집니다. 안개는 아주 옅게 둡니다.

**그레인.** 거의 보이지 않는 고운 필름 그레인을 둡니다(MIND FIELD 바탕과 이어지게).

**비워 둘 자리.** 장마다 SVG 애니메이션과 글자가 올라갈 "조용한 구역"을 정해 두었습니다. 그 구역에는 선도 빛도 두지 않습니다.

**정렬 기준점.** 장마다 기하 중심과 반지름을 이미지 폭에 대한 비율로 정했습니다. 2단계 SVG가 같은 비율로 그려져야 이미지의 빛과 코드의 선이 겹칩니다. 비율에서 벗어난 시안은 다시 뽑습니다.

## 지금 있는 gen2 시안 3장에 대해

`assets/gen2-agent-loop.jpg`, `gen2-harness-scaffold.jpg`, `gen2-nested-shells.jpg`가 이미 있습니다(1280 × 720). 선의 빛과 정밀함은 이 배치가 원하는 방향 그대로이고, 2단계에서 해당 자리의 대체(fallback)로 씁니다. 다만 세 가지를 고칩니다.

1. **바탕이 짙은 남색입니다.** MIND FIELD의 회흑색과 부딪칩니다. 바탕을 `#0B0D10`으로 내립니다.
2. **주황(호박)색 강조가 엠버와 겹칩니다.** 엠버는 "1부에서 건너온 것"을 뜻합니다. 2부 안의 강조는 산성 초록 하나로 바꿉니다.
3. **harness-scaffold의 주황 층에 칩 같은 부품이 보입니다.** 회로 기판 상투형에 가깝습니다. 하네스는 부품 없는 틀과 연결점으로만 그립니다.

## 공통 규칙 (12장 모두)

**넣지 않는 것.** 아래 네거티브를 모든 프롬프트에 붙입니다. 하나라도 보이면 다시 뽑습니다.

```
text, letters, numbers, digits, labels, captions, equations, formulas, axis ticks with numbers, legends, UI, buttons, dashboards, HUD, screens, charts with values, logos, watermark, signature, people, faces, hands, robots, brains, circuit boards, chips, PCB traces, binary code, neon signs, lens flare, bokeh, starfield, nebula, galaxy, sci-fi spaceship interior, glossy 3D render of devices, pure black background, navy blue background, orange or amber highlights, more than one green highlight
```

**한 줄 원칙.** 그림이 무엇을 "주장"하면 실패입니다. 예: 점이 정확히 몇 개, 화살표가 무엇을 가리키는지 읽힘. 형태는 은유이고, 뜻은 2단계 SVG와 글이 붙입니다.

**출력**
- JPEG, sRGB, 품질 82. 바닥 질감은 900KB 이하, 나머지는 700KB 이하.
- 저장 위치는 `archive/assets/`, 파일 이름은 아래 그대로. 후보는 `-v2`, `-v3`을 붙이고 최종본은 정확한 이름으로 저장합니다.
- 기존 `gen-*`, `gen2-*`, `muse-*`, `dots-*` 파일은 덮어쓰지 않습니다.
- 캡션, 워터마크, 테두리를 이미지에 넣지 않습니다.

**함께 보낼 기록.** 도구와 모델, 날짜, 시드, 최종 프롬프트, 후보정 내용. README의 에셋 출처 표에 옮겨 적습니다.

**연결(2단계에서).** 2단계에서 `js/assets.js`에 슬롯 12개를 더하고, 대체를 정합니다(아래 요약 표의 "대체"). 이미지가 도착하면 `python3 tools/assets.py`가 그 슬롯을 READY로 바꿉니다. 1단계인 지금은 사이트를 고치지 않았습니다.

**확인 방법**
1. 100% 확대로 글자·숫자처럼 읽히는 자국을 찾습니다.
2. 기준점 비율을 이미지 위에 원과 선으로 겹쳐 맞는지 봅니다.
3. 조용한 구역의 평균 밝기가 `#14161A` 이하인지 봅니다.
4. 산성 초록이 정확히 한 곳뿐인지 봅니다.

## 2부의 지금 배치 (참고)

2단계에서 자리를 다시 잡을 수 있으니, 각 항목의 "자리"는 역할과 함께 적었습니다.
- 2부 구역은 x 5600–10000, 높이 5600입니다.
- 동심원 고리의 중심은 (7800, 2900)입니다. 반지름: 핵 620, 프롬프트 1100, 컨텍스트 1540, 하네스 1980, 루프 2420, 그래프 2860. 고리 중심은 구역 가로 50%, 세로 약 52%에 있습니다.

| 조각 | 중심 (월드 px) | 폭 |
|---|---|---|
| 패러다임 표 | (7800, 2900) | 1040 |
| 하네스 등식 | (9080, 1700) | 1320 |
| 루프 도식 | (6640, 1080) | 1240 |
| 그래프 영상 | (9180, 4780) | 1300 |
| 컨텍스트 | (7540, 1420) | 520 |
| 허락(approval) | (6230, 3500) | 560 |
| 검증(selfverify) | (7380, 5040) | 520 |
| 검토(review) | (8420, 760) | 460 |

---

## Muse: 장(field)과 흐름 계열 6장

빛의 장, 입자, 궤도처럼 연속적인 것을 맡습니다.

### M-1. `muse2-field-manifold.jpg`: 2부 바닥 전체

- **비율과 크기:** 4:5 세로, 3200 × 4000 이상. 구역 4400 × 5600에 `cover`로 깔립니다.
- **자리:** 2부 바닥 질감의 새 바탕층(`.zone-p2`). 지금의 점 격자와 고리 SVG 밑에 깔립니다. 지금 이 자리의 슬롯 `muse-drawing-floor`보다 아래층입니다.
- **화면 처리:** screen 혼합, 불투명도 0.2~0.3.
- **기준점:** 휘어지는 격자의 우물 중심이 가로 50%, 세로 52%에 있어야 합니다(고리 중심과 일치).
- **조용한 구역:** 우물 중심 반지름 12%(패러다임 표 자리), 위쪽 띠 0~10%(2부 제목 자리).

```
A vast, dark, matte field seen straight on (#0B0D10, very slightly cool), carrying an extremely faint square coordinate lattice drawn in thin chalk-white hairlines (#E8E4DC at low brightness). The lattice bends smoothly into a shallow gravity well whose exact center sits at 50% of the width and 52% of the height: lines near the center curve inward like a rubber sheet pressed by an unseen weight, lines toward the edges are almost straight. A few lattice lines near the well are drawn in soft math blue (#5CC8E0), the rest stay chalk white. The very center of the well, within a radius of 12% of the width, is left completely empty and dark. The top 10% of the frame is empty. Precise computed geometry, perfectly smooth curves, short soft glow on each line, generous emptiness, barely visible fine grain. No highlights of any other color.
```

**확인:** 휘어짐 중심이 기준점에 있습니다. 중심 원 안이 비어 있습니다. 산성 초록이 없습니다(바닥은 초점을 두지 않음).

### M-2. `muse2-core-seed.jpg`: 고리의 중심, 프롬프트라는 씨앗

- **비율과 크기:** 1:1, 2400 × 2400 이상.
- **자리:** 패러다임 표 조각의 배경. 고리 중심 (7800, 2900)에 핵 지름 1240 크기로 깔립니다.
  - 2단계 계획: "프롬프트 ⊂ 컨텍스트 ⊂ 하네스 ⊂ 루프 ⊂ 그래프"를 안에서 밖으로 퍼지는 원으로 그리는 애니메이션의 첫 장면.
- **화면 처리:** screen 혼합, 불투명도 0.5, 원형 마스크(가장자리 15%에서 사라짐).
- **기준점:** 빛나는 점이 정확히 이미지 중심에 있습니다. 둘레의 옅은 동심원 반지름은 폭의 10%, 20%, 30%, 40%, 50%. 2단계 SVG의 다섯 고리와 비율이 같습니다.
- **조용한 구역:** 중심 반지름 6%~45% 사이의 대부분(표 글자가 올라감). 동심원 선은 아주 옅게.

```
A single small point of acid-green light (#B6F23A) at the exact center of a square dark field (#0B0D10). Around it, five perfectly concentric circles drawn as extremely faint chalk-white hairlines, at radii of 10%, 20%, 30%, 40% and 50% of the image width, each one fainter than the one inside it, the outermost almost invisible. A very soft, short halo around the central point only, fading within 4% of the width. Everything between the circles is clean, dark and empty. Perfect geometry, mathematical calm, like the first frame of an explanatory animation before anything moves. Barely visible fine grain.
```

**확인:** 초록은 가운데 점 하나뿐입니다. 동심원 반지름이 비율에 맞습니다. 원이 다섯 개를 넘지 않습니다.

### M-3. `muse2-context-aperture.jpg`: 컨텍스트, 무엇을 보여 줄 것인가

- **비율과 크기:** 16:10, 2560 × 1600 이상.
- **자리:** 컨텍스트 조각의 배경(2단계에서 1순위 설명 장면으로 키울 후보).
  - 2단계 계획: 수많은 토큰 점 중 일부만 창 안으로 들어오고, 창이 차면 옛 점이 흐려지는 애니메이션.
- **화면 처리:** 평상 혼합, 불투명도 0.7. 위에 SVG 점과 창 테두리가 올라갑니다.
- **기준점:** 부드러운 직사각형 창(aperture)의 중심이 가로 58%, 세로 50%, 창 크기는 폭의 34% × 높이의 46%.
- **조용한 구역:** 왼쪽 30%(설명 글).

```
A wide dark field (#0B0D10) filled with a loose, drifting cloud of thousands of tiny round particles of light in soft math blue (#5CC8E0) and dim chalk white, scattered like dust in a beam, densest toward the right and thinning to nothing on the left third, which stays empty and dark. In the right half, a soft rectangular window of clearer, slightly brighter space with rounded corners, centered at 58% of the width and 50% of the height, about 34% of the width wide and 46% of the height tall: particles inside the window are sharper and brighter, particles outside are blurred and dim, as if seen through frosted glass. The window has no drawn border, only the change in focus. No particle is green. Precise, calm, mathematical, with barely visible fine grain.
```

**확인:** 창이 기준점에 있습니다. 창 안팎의 초점 차이가 분명합니다. 왼쪽 30%가 비어 있습니다. 점이 글자나 숫자처럼 뭉치지 않습니다.

### M-4. `muse2-loop-orbit.jpg`: 루프, 끝날 때까지 도는 것

- **비율과 크기:** 1:1, 2400 × 2400 이상.
- **자리:** 루프 도식 작품의 배경. 지금 위치 (6640, 1080), 폭 1240의 왼쪽 절반(원형 도식 자리).
  - 2단계 계획: Goal → Action → Observation → Adjustment를 점 하나가 돌며, 바퀴마다 반지름이 줄어 "done"으로 수렴하는 애니메이션.
- **화면 처리:** screen 혼합, 불투명도 0.6.
- **기준점:** 나선의 중심이 정확히 이미지 중심. 가장 바깥 궤도의 반지름은 폭의 36%. 궤도 위 네 마디는 12시, 3시, 6시, 9시 방향.
- **조용한 구역:** 중심 반지름 8% 안("done" 표시 자리).

```
A long-exposure trace of a single point of light orbiting the exact center of a square dark field (#0B0D10). The path is a smooth inward spiral of about four turns: the outermost turn has a radius of 36% of the image width, and each turn is a little tighter, converging toward the center but stopping before it, leaving the central 8% radius empty and dark. The outer turns are drawn in chalk white, fading, and the innermost turn glows acid green (#B6F23A), the only green in the image. Four small round nodes sit on the outermost turn at the 12, 3, 6 and 9 o'clock positions, drawn as hollow chalk-white rings. Tiny unlabeled arrowheads along the outer turn suggest clockwise motion. Precise, smooth, calm, like a frame from a mathematics explainer. Barely visible fine grain.
```

**확인:** 초록은 가장 안쪽 궤도뿐입니다. 마디 네 개가 정확히 사방에 있습니다. 화살표에 글자가 없습니다.

### M-5. `muse2-swarm-streams.jpg`: 그래프 고리, 스웜의 흐름

- **비율과 크기:** 16:9, 2560 × 1440 이상.
- **자리:** 그래프 작품(스웜 영상)의 배경과 그래프 고리의 방 배경. 지금 위치 (9180, 4780), 폭 1300.
  - 2단계 계획: 많은 에이전트 점이 몇 개의 노드로 모였다 흩어지는 흐름장(vector field) 애니메이션.
- **화면 처리:** screen 혼합, 불투명도 0.45. 영상 뒤와 방 오른쪽에 마스크로 깔립니다.
- **기준점:** 흐름이 모이는 세 지점이 (28%, 40%), (55%, 62%), (78%, 35%).
- **조용한 구역:** 아래쪽 22%(캡션), 영상이 놓이는 가운데 60% × 60%는 밝기를 낮게.

```
A wide dark field (#0B0D10) filled with a smooth vector field of thin streamlines, like iron filings or wind lines, drawn as fine math-blue (#5CC8E0) and dim chalk-white hairlines. Thousands of tiny particles of light travel along the streamlines and gather into three soft convergence points at 28%/40%, 55%/62% and 78%/35% of the width and height, then flow out again. Only one convergence point, the one at 55%/62%, glows acid green (#B6F23A); the other two glow chalk white. The bottom 22% of the frame stays dark and almost empty. The central area is kept low in brightness so a video can sit on top of it. Perfectly smooth curves, precise, calm and elegant, no clutter. Barely visible fine grain.
```

**확인:** 모임점 세 개가 기준점에 있고 초록은 하나뿐입니다. 아래 22%가 비어 있습니다. 가운데가 어둡습니다.

### M-6. `muse2-horizon-rings.jpg`: 2부의 첫 장면, 기울어진 고리 지평

- **비율과 크기:** 3:1 가로, 3600 × 1200 이상.
- **자리:** 2부 구역 맨 위 띠(지금 2부 제목 "2부 에이전트와 만드는 법" 뒤, 높이 약 0~1400).
  - 구역 전체를 볼 때 2부의 대표 이미지가 되고, 2단계에서 고리 도면의 "원근 버전"으로 처음 보여 줍니다.
- **화면 처리:** 평상 혼합, 불투명도 0.85. 아래쪽은 바닥과 이어지게 그라데이션 마스크를 씁니다.
- **기준점:** 동심원 다섯 개가 낮은 각도에서 본 타원으로 놓입니다. 공통 중심은 가로 62%, 세로 70%.
- **조용한 구역:** 왼쪽 45% 위쪽 절반(제목 자리).

```
A wide panoramic view, very low and grazing, across a dark matte plane (#0B0D10) on which five perfectly concentric circles are drawn as thin luminous lines, seen in steep perspective so they become flat ellipses sharing one center at 62% of the width and 70% of the height. The innermost ellipse glows acid green (#B6F23A); the four outer ellipses are chalk white, each fainter and thinner as it recedes, the outermost dissolving into soft distance haze near the horizon. A faint math-blue (#5CC8E0) lattice on the plane follows the same perspective. The upper-left 45% of the frame is empty dark sky with no lines. Calm, vast, precise, like the opening shot of a mathematics film. Barely visible fine grain.
```

**확인:** 타원 다섯 개의 중심이 하나입니다. 초록은 가장 안쪽 타원뿐입니다. 왼쪽 위가 비어 있습니다.

---

## Dots: 구조와 문턱 계열 6장

틀, 문, 프리즘, 별자리처럼 구조적인 것을 맡습니다.

### D-1. `dots2-harness-frame.jpg`: 모델과 그 둘레의 틀

- **비율과 크기:** 4:3, 2400 × 1800 이상.
- **자리:** 하네스 작품(Agent = Model + Harness 등식)의 배경. 지금 위치 (9080, 1700), 폭 1320.
  - 2단계 계획: 가운데 빛 구(모델)에 틀(하네스)이 한 겹씩 조립되고, 연결점마다 도구·권한·기록이 붙는 애니메이션.
- **화면 처리:** screen 혼합, 불투명도 0.55.
- **기준점:** 구의 중심이 가로 64%, 세로 52%, 구 반지름은 폭의 7%. 틀은 구를 둘러싼 정육면체 와이어프레임이고 한 변이 폭의 34%. 틀 꼭짓점과 변의 중점, 모두 열두 곳에 작은 연결점이 있습니다.
- **조용한 구역:** 왼쪽 38%(등식 글자 자리).

```
A dark field (#0B0D10). Right of center, at 64% of the width and 52% of the height, a small softly glowing sphere of light in acid green (#B6F23A), radius about 7% of the image width, the only green in the image. Around it, a precise wireframe cube seen in gentle three-quarter view, edge length about 34% of the width, drawn in thin chalk-white (#E8E4DC) luminous lines, with a second, slightly larger and fainter cube in math blue (#5CC8E0) around the first, like two nested frames of scaffolding. Small hollow circular attachment points sit on the corners and at the midpoints of the edges of the inner cube. The frames contain nothing else: no components, no boards, no chips, no machinery. The left 38% of the frame is empty and dark. Precise, clean, architectural, calm. Barely visible fine grain.
```

**확인:** 틀 안에 부품이 없습니다(회로 기판처럼 보이면 실패). 초록은 구 하나뿐입니다. 왼쪽 38%가 비어 있습니다.

### D-2. `dots2-gap-arches.jpg`: 명명 간격이 짧아진다 (약 3년 → 약 1주일)

- **비율과 크기:** 3:4 세로, 1800 × 2400 이상.
- **자리:** 패러다임 표의 "명명 간격" 크기 비교 배경, 그리고 2부 방(패러다임)의 첫 화면.
  - 2단계 계획: 간격 다섯 개(약 3년, 약 3개월, 약 2개월, 약 1주일, 명명과 서베이가 1개월 간격)를 글자 크기와 막대로 보여 줌. 실제 크기 비교는 SVG가 하고, 이미지는 원근감만 줍니다.
- **화면 처리:** 평상 혼합, 불투명도 0.6.
- **기준점:** 소실점이 가로 50%, 세로 34%.
- **조용한 구역:** 아래 40%(글자 자리).

```
A tall view down a long corridor of freestanding arches standing on a dark matte floor (#0B0D10), seen in one-point perspective with the vanishing point at 50% of the width and 34% of the height. The arches are drawn as thin, perfectly geometric luminous outlines in chalk white (#E8E4DC), the nearest one large and bright, each next arch smaller, closer to the previous one and fainter, so the spacing between arches visibly shrinks as they recede. Only the farthest, smallest arch glows acid green (#B6F23A). A faint math-blue (#5CC8E0) floor line runs to the vanishing point. The bottom 40% of the frame is dark floor with no lines. No numbers, no marks on the arches, nothing that could be read as a quantity. Calm, precise, mathematical. Barely visible fine grain.
```

**확인:** 간격이 줄어드는 리듬만 보이고 정확한 개수나 비율을 주장하지 않습니다(아치 수는 6~9개 사이 아무 수나). 초록은 가장 먼 아치뿐입니다.

### D-3. `dots2-verify-prism.jpg`: 검증은 만든 쪽 밖에서

- **비율과 크기:** 16:10, 2560 × 1600 이상.
- **자리:** 검증(selfverify)·검토(review) 조각의 배경. 2단계에서 "검증 루프" 설명 장면의 무대.
  - 2단계 계획: 결과물(빛줄기)이 바깥의 판정기(프리즘)를 지나 통과와 멈춤으로 갈리는 애니메이션.
- **화면 처리:** screen 혼합, 불투명도 0.55.
- **기준점:** 프리즘(정삼각기둥의 단면)의 중심이 가로 52%, 세로 50%, 한 변이 높이의 30%. 들어오는 빛은 왼쪽 가장자리 세로 50%에서 출발합니다.
- **조용한 구역:** 위쪽 20%, 아래쪽 20%.

```
A dark field (#0B0D10). A single thin beam of chalk-white light (#E8E4DC) enters from the middle of the left edge and travels horizontally to a precise glass prism, drawn as a clean equilateral triangle outline in math blue (#5CC8E0), centered at 52% of the width and 50% of the height, each side about 30% of the image height. On the far side the beam splits: one thin branch continues straight on to the right edge, glowing acid green (#B6F23A), the only green in the image; a second, dimmer branch bends downward and stops short against a thin dark wall line, ending in a small soft fade. Perfect geometry, crisp optical clarity, calm. The top 20% and bottom 20% stay empty. Barely visible fine grain.
```

**확인:** 프리즘이 기준점에 있습니다. 통과 가지만 초록입니다. 무지개 분광처럼 여러 색으로 퍼지지 않습니다(흰, 파랑, 초록만).

### D-4. `dots2-approval-threshold.jpg`: 사람이 허락하는 문턱

- **비율과 크기:** 16:10, 2560 × 1600 이상.
- **자리:** 허락(approval) 조각의 배경. 2단계에서 "도구·권한" 설명 장면.
  - 2단계 계획: 에이전트의 경로가 문턱 앞에서 멈추고, 승인이 켜지면 이어지는 애니메이션.
- **화면 처리:** 평상 혼합, 불투명도 0.65.
- **기준점:** 문턱(두 개의 세로 기둥) 사이 중심이 가로 50%, 세로 54%, 기둥 간격은 폭의 14%.
- **조용한 구역:** 위쪽 30%.

```
A dark matte field (#0B0D10) with a single luminous path drawn as a smooth chalk-white (#E8E4DC) curve coming in from the lower left, flowing toward a threshold formed by two thin vertical posts of light in math blue (#5CC8E0), standing 14% of the width apart, centered at 50% of the width and 54% of the height. The path stops just before the threshold in a small resting point. Between the two posts hangs one small round light in acid green (#B6F23A), the only green in the image, like a signal waiting to be switched. Beyond the threshold, the continuation of the path is drawn only as a faint dotted hairline curving toward the upper right. The top 30% of the frame is empty and dark. Precise, quiet, clean. Barely visible fine grain.
```

**확인:** 문이나 자물쇠, 사람 모양이 없습니다(기둥과 빛만). 초록은 하나뿐입니다. 위쪽 30%가 비어 있습니다.

### D-5. `dots2-graph-constellation.jpg`: 노드가 일하고, 엣지가 넘기고, 상태가 흐른다

- **비율과 크기:** 16:9, 2560 × 1440 이상.
- **자리:** 그래프 고리 설명 장면과 그래프 방의 첫 화면. 2단계에서 스웜 영상과 나란히 놓일 그래프 구조 장면.
  - 2단계 계획: 노드에 불이 켜지고, 방향 있는 엣지를 따라 상태 점이 이동하며, 사이클(재시도)이 한 번 도는 애니메이션.
- **화면 처리:** screen 혼합, 불투명도 0.5.
- **기준점:** 노드 일곱 개 정도가 화면 가운데 70% × 60% 영역에 흩어져 있고, 그중 셋이 작은 사이클(삼각형 고리)을 이룹니다. 사이클의 중심은 가로 60%, 세로 46%.
- **조용한 구역:** 왼쪽 22%(설명 글).

```
A dark field (#0B0D10) with a sparse, elegant network: about seven small hollow round nodes drawn as chalk-white (#E8E4DC) luminous rings, spread across the central 70% by 60% of the frame, connected by thin smooth curved edges in math blue (#5CC8E0), each edge ending in a tiny unlabeled arrowhead. Three of the nodes form a small closed cycle of curved edges around a center at 60% of the width and 46% of the height; one edge of that cycle glows acid green (#B6F23A), the only green in the image. A few tiny particles of light sit on the edges as if in transit. The left 22% of the frame is empty. Not a starfield, not a constellation chart, no labels: a clean mathematical graph, precise and calm. Barely visible fine grain.
```

**확인:** 노드에 글자가 없습니다. 초록 엣지가 사이클 위의 하나뿐입니다. 별자리 지도처럼 별 이름이나 선이 많지 않습니다.

### D-6. `dots2-seam-ember-to-lattice.jpg`: 다리에서 2부로 넘어가는 이음새

- **비율과 크기:** 1:3 세로가 좋습니다. 안 되면 9:16으로 뽑고, 가운데 세로 1/3 안에 모든 것을 둡니다. 2048 높이 이상.
- **자리:** 다리 복도(x 4600–5600)와 2부(x 5600~)가 만나는 경계에 세로로 길게 놓입니다. 폭 약 600, 높이 5600.
  - 1부의 엠버 종이가 2부의 계산된 선으로 바뀌는 순간을 보여 주는 유일한 2부 바깥 자산입니다.
- **화면 처리:** 평상 혼합, 불투명도 0.8, 양옆으로 사라지는 마스크.
- **기준점:** 바뀌는 지점이 세로 중앙선. 왼쪽 절반은 엠버의 따뜻함, 오른쪽 절반은 차가운 격자.
- **조용한 구역:** 없음(가는 띠).

```
A tall, narrow vertical composition on a dark ground (#0B0D10). Along the left half, the torn edge of a sheet of bone-white paper (#E8E4DC) runs top to bottom, warmed by a low ember glow (#E8541E) from the left. Exactly at the vertical center line, the torn paper edge turns into precise geometry: the fibers of the paper continue to the right as thin, perfectly straight luminous hairlines that resolve into a clean square lattice in math blue (#5CC8E0) and chalk white, as if the paper were becoming a diagram. The right half is cool, ordered and dark. Keep everything within the central third of the width if the frame is wider than 1:3. No green, no text, no fire, no sparks. Precise, quiet, a single transition. Barely visible fine grain.
```

**확인:** 왼쪽만 따뜻하고 오른쪽만 차갑습니다. 바뀌는 지점이 세로 중앙입니다. 불꽃과 불티가 없습니다.

---

## 요약

| 파일 | 담당 | 비율 | 2부의 자리 | 대체 (2단계, 파일이 오기 전) |
|---|---|---|---|---|
| `muse2-field-manifold.jpg` | Muse | 4:5 | 2부 바닥 전체의 바탕층 | 없음 (지금의 점 격자) |
| `muse2-core-seed.jpg` | Muse | 1:1 | 고리 중심, 패러다임 표 배경 | `gen2-nested-shells.jpg` |
| `muse2-context-aperture.jpg` | Muse | 16:10 | 컨텍스트 설명 장면 | 없음 |
| `muse2-loop-orbit.jpg` | Muse | 1:1 | 루프 도식 작품 | `gen2-agent-loop.jpg` |
| `muse2-swarm-streams.jpg` | Muse | 16:9 | 그래프 작품(스웜 영상) 배경, 그래프 방 | `gen-drawing-threads.jpg` |
| `muse2-horizon-rings.jpg` | Muse | 3:1 | 2부 맨 위 띠, 제목 뒤 | 없음 |
| `dots2-harness-frame.jpg` | Dots | 4:3 | 하네스 등식 작품 | `gen2-harness-scaffold.jpg` |
| `dots2-gap-arches.jpg` | Dots | 3:4 | 명명 간격 크기 비교, 패러다임 방 | 없음 |
| `dots2-verify-prism.jpg` | Dots | 16:10 | 검증·검토 설명 장면 | 없음 |
| `dots2-approval-threshold.jpg` | Dots | 16:10 | 허락(도구·권한) 설명 장면 | 없음 |
| `dots2-graph-constellation.jpg` | Dots | 16:9 | 그래프 구조 설명 장면, 그래프 방 | 없음 |
| `dots2-seam-ember-to-lattice.jpg` | Dots | 1:3 (또는 9:16) | 다리와 2부의 경계 | 없음 |

- **2부 안에 놓이는 것:** 11장. 이음새 한 장은 경계에 걸칩니다.
- **장마다 한 가지 은유:** 씨앗(프롬프트), 창(컨텍스트), 틀(하네스), 나선(루프), 흐름과 별자리(그래프), 프리즘(검증), 문턱(허락), 아치(명명 간격). 2단계 애니메이션이 같은 은유를 SVG로 정확하게 그리고, 이미지는 그 밑에서 빛과 깊이만 줍니다.
- **보내는 순서:** 1차 배치(`asset-prompts.md`)의 `muse-*`, `dots-*` 8장과 겹치지 않습니다. 둘 다 아직 도착 전이면, 2부 장면에 직접 쓰이는 M-2, M-4, D-1, D-2를 먼저 보내 주시면 2단계를 빨리 시작할 수 있습니다.
