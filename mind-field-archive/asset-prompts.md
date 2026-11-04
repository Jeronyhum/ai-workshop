# 디자인 에셋 생성 프롬프트 (Dots, Muse용)

MIND FIELD 아카이브(`archive/`)에 쓸 질감·분위기 이미지 8장의 프롬프트입니다. Dots가 4장(필드와 종이 계열), Muse가 4장(도면과 엠버 계열)을 맡습니다. 재료 계열을 한 사람이 맡아야 같은 계열의 이미지끼리 톤이 맞습니다.

이 이미지들은 **디자인 에셋**입니다. 사이트에서 "생성 이미지 · 디자인 에셋"으로 표시되고, 어떤 주장의 증거로도 쓰이지 않습니다. 그래서 무엇인가를 보여 주거나 설명하는 그림이 되면 안 됩니다.


## v3: 슬롯 재매핑 (v2 배치 기준, 지금 유효한 표)

아래 표가 지금 사이트의 실제 자리입니다. 각 항목 본문의 "쓰이는 곳"과 "연결" 줄은 pass 1 좌표로 쓰였으니 이 표가 우선합니다. 프롬프트 본문(구도, 팔레트, 네거티브)은 그대로 씁니다.

연결은 끝나 있습니다. 슬롯은 `js/assets.js`의 `AR.assetSlots` 한 곳에 있고, 각 슬롯은 파일이 도착하기 전까지 기존 생성 이미지를 대체로 씁니다.

이미지가 도착하면:
1. `archive/assets/`에 정확한 이름으로 넣습니다.
2. `archive/`에서 `python3 tools/assets.py`를 실행합니다. 그 슬롯이 READY 목록에 올라가 새 파일을 씁니다.
3. 파일이 깨져 불러오지 못하면 `onerror`로 대체 이미지로 돌아갑니다.

| 파일 | 담당 | v2/v3 자리 | 화면에서의 처리 | 대체 (지금 보이는 것) |
|---|---|---|---|---|
| `dots-field-scatter.jpg` | Dots | 1부 바닥 질감 `.zone-p1 .zone-tex`. 구역 4600 × 5600 (세로 비율 0.82) | 흑백, screen, 불투명도 0.34 | `gen-field-fragments.jpg` |
| `dots-room-field.jpg` | Dots | 1부 방 배경 `.room[data-zone=p1]::before` | 오른쪽 정렬, 왼쪽으로 사라지는 마스크, 흑백, screen, 0.2 | `gen-field-fragments.jpg` |
| `dots-paper-stock.jpg` | Dots | 종이 재료 `.dip`(회계 이면화), `.plaque`(입구 명판). 512px 타일, multiply | 글자 대비를 위해 가장 어두운 곳은 `#D0CABC` 이상 | 없음 (단색 bone 유지) |
| `dots-threads-list.jpg` | Dots | 목록 보기 배경 `.index::before` | 오른쪽 마스크, screen, 0.1 | `gen-drawing-threads.jpg` |
| `muse-drawing-floor.jpg` | Muse | 2부 바닥 질감 `.zone-p2 .zone-tex`. 구역 4400 × 5600, 고리 중심은 가로 50%, 세로 52% | screen, 0.1. 닫힌 도형 금지는 그대로 | `gen-drawing-threads.jpg` |
| `muse-room-drawing.jpg` | Muse | 2부 방 배경 `.room[data-zone=p2]::before` | 오른쪽 마스크, screen, 0.14 | `gen-drawing-threads.jpg` |
| `muse-corridor-ember.jpg` | Muse | 다리 복도 벽 `.zone-br .zone-tex`. 복도는 1000 × 5600 (약 1:5.6)이라 9:16 이미지는 가운데 약 32%가 보입니다 (pass 1의 22%보다 넓음). 다리 문장 조각이 높이 약 31%, 55%, 79%에, 명판이 6~20%에 놓입니다 | 불투명도 0.9, 채도 1.15, 밝기 0.82 | `gen-paper-ember.jpg` |
| `muse-room-bridge.jpg` | Muse | 다리 방 배경 `.room[data-zone=br]::before` | 오른쪽 마스크, 0.32 | `gen-paper-ember.jpg` |

## 공통 규칙 (8장 모두)

**팔레트.** 아래 여섯 값만 씁니다. 한 장에 액센트(빨강, 산성 초록, 엠버)는 하나만 씁니다.

| 이름 | 값 | 쓰임 |
|---|---|---|
| near-black | `#0B0B0C` | 1부 바탕 |
| charcoal | `#2A2A2C` | 그림자, 어두운 면 |
| bone | `#E8E4DC` | 종이, 가는 선 |
| signal red | `#D4261C` | 1부 액센트 |
| acid green | `#B6F23A` | 2부 액센트 |
| ember | `#E8541E` | 다리와 "건너는" 액센트, 열기 |

2부 도면 바탕만 `#0E0E10`을 씁니다(사이트의 2부 바닥색).

**재료.** 사이트는 세 재료로만 이루어져 있습니다. 이미지도 이 셋 안에서 만듭니다.
- 필드: 거의 검은 무광 바탕, 필름 그레인, 넓은 빈 어둠.
- 종이: 글씨 없는 bone색 종이, 찢긴 가장자리, 섬유, 실제 그림자.
- 도면: 가는 선, 작도선, 점 격자, 눈금. 숫자와 글자는 없습니다.

**넣지 않는 것.** 아래 항목은 모든 프롬프트의 네거티브에 들어갑니다. 생성 결과에 하나라도 보이면 다시 뽑습니다.
- 글자, 숫자, 손글씨, 글자처럼 보이는 자국, 치수 표기, 눈금 숫자
- 로고, 상표, 워터마크, 서명, 도장
- 사람, 얼굴, 손, 실루엣
- 차트, 그래프, 표, 지도, 다이어그램, 화면, UI, 대시보드. 증거나 자료처럼 읽힐 수 있는 모든 것
- AI를 상징하는 상투 이미지: 로봇, 뇌, 회로 기판, 칩, 이진수, 파란 홀로그램, HUD
- 네온 글로우, 렌즈 플레어, 보케 조명, 불꽃과 불티 같은 입자, 그라데이션 배경

**출력.**
- JPEG, sRGB, 품질 82 정도. 바닥 질감은 900KB 이하, 나머지는 700KB 이하로 줄입니다. 지금 있는 생성 이미지는 170~320KB입니다.
- 파일 이름은 아래에 적힌 그대로 씁니다. 후보를 더 내고 싶으면 `-v2`, `-v3`을 붙입니다. 최종본은 정확한 파일 이름 하나로 저장합니다.
- 저장 위치는 `archive/assets/`입니다. 기존 `gen-*.jpg`는 덮어쓰지 않습니다.
- 이미지 안에 캡션, 워터마크, 테두리를 넣지 않습니다.

**함께 보내 줄 기록.** README의 에셋 출처 표에 옮겨 적습니다.
- 도구와 모델 이름, 생성 날짜, 시드(있으면)
- 실제로 쓴 최종 프롬프트, 후보정 내용(자르기, 크기, 톤)

**사이트 연결.** 이 문서는 프롬프트만 정합니다. 사이트 코드는 이번에 바꾸지 않았습니다.
- 기존 자리를 바꾸는 3장(바닥 질감): 이미지가 도착하면 `js/data.js`의 `AR.assets` 파일 경로만 바꾸면 됩니다.
- 새 자리 5장(방 배경, 종이 질감, 목록 배경): `css/archive.css`에 배경 규칙을 추가해야 합니다. 각 항목의 "연결" 줄에 무엇을 바꿀지 적어 두었습니다.

**공통 확인 방법.**
1. 100%로 확대해 화면 전체를 훑습니다. 글자나 숫자처럼 읽히는 자국이 있으면 실패입니다.
2. 흑백으로 바꿔 봅니다. 1부 바닥 질감은 흑백으로만 보이므로, 흑백에서 형태가 살아 있어야 합니다.
3. 각 항목의 "확인" 기준을 봅니다.

---

## Dots: 필드와 종이 계열

### 1. `dots-field-scatter.jpg`

- **비율과 크기:** 3:4 세로, 2304 × 3072 이상
- **쓰이는 곳:** 1부 바닥 질감
  - 지금 자리: `assets/gen-field-fragments.jpg`. 이것을 대체합니다.
  - 구조: `js/data.js`의 `AR.assets`(zone `p1`)에서 `.zone-p1` 안의 `<img class="zone-tex">`로 들어갑니다.
  - 표시 방식: `css/archive.css`의 `.zone-p1 .zone-tex`에서 불투명도 0.17, 흑백(`grayscale(1)`), `mix-blend-mode: screen`.
  - 크기: 1부 구역은 3600 × 4900 (세로 비율 0.73)이고 `object-fit: cover`로 채웁니다. 지금 이미지는 가로형이라 많이 잘립니다.
  - 위에 올라가는 것: 조각 30개와 빨간 실. 흑백, screen 혼합이라 검은 바탕 위의 밝은 형태만 남습니다. 색은 화면에 나오지 않습니다.
- **연결:** `AR.assets`의 p1 항목 `file`을 `assets/dots-field-scatter.jpg`로 바꿉니다.

**프롬프트**

```
Overhead photograph of a near-black matte surface (#0B0B0C) with small torn scraps of blank bone-white paper (#E8E4DC) scattered unevenly across it, as if a handful of notes had been thrown and left where they fell. The scraps range from fingernail-sized to palm-sized; some are curled, some folded once, all with soft fibrous torn edges. The scatter is uneven and organic: two or three loose drifts where scraps gather, and wide empty dark areas between them. Nothing aligned, nothing in rows. A single soft, low light from the upper left; each scrap casts a short soft shadow on the dark surface. Fine film grain over the whole frame. Every scrap of paper is completely blank. Monochrome in feeling: bone and near-black only. Quiet, still, photographic, matte.
```

**네거티브:** text, letters, numbers, handwriting, printed marks, ruled lines on the paper, stamps, logos, watermark, people, hands, any object other than paper, charts, maps, screens, glow, bokeh, colored light, vignette, border, frame

**확인**
- 화면의 60% 이상이 빈 어둠입니다.
- 종이 조각에 줄, 인쇄, 글자 같은 자국이 없습니다.
- 흑백 변환 후에도 조각의 찢긴 가장자리가 보입니다.

### 2. `dots-room-field.jpg`

- **비율과 크기:** 16:9, 2560 × 1440 이상
- **쓰이는 곳:** 새 자리, 1부 조각의 방(상세 보기) 배경
  - 방은 화면 전체를 덮는 `dialog.room[data-zone="p1"]`입니다.
  - 제목, 수치, 본문이 왼쪽과 가운데 4분의 3을 차지합니다. 이미지는 오른쪽 가장자리에만 형태가 있어야 합니다.
- **연결:** `css/archive.css`에 `.room[data-zone="p1"] { background: var(--field) url("../assets/dots-room-field.jpg") right top / cover no-repeat fixed; }`를 추가합니다. 불투명도는 이미지 자체를 어둡게 만들어 맞춥니다. 본문 회색 글자(`#8E8B85`)가 대비 4.5:1을 유지해야 합니다.

**프롬프트**

```
Wide cinematic still of an almost empty near-black space (#0B0B0C). At the far right edge, partly cut off by the frame, one sheet of blank bone-white paper (#E8E4DC) with a torn lower edge rests at a slight angle on the dark surface. A narrow raking light from the right makes its fibers and torn deckle edge catch the light; the paper falls off into darkness toward the center of the frame. A single taut thread of signal red (#D4261C) enters from the right edge, crosses the paper, and trails off into the dark; it is the only color in the image. The left two-thirds of the frame is deep, nearly flat black with only fine film grain, no objects. Restrained, still, matte, photographic.
```

**네거티브:** text, letters, numbers, writing on the paper, logos, watermark, people, hands, glow, neon, lens flare, bokeh, gradient sky, smoke, multiple colors, charts, screens, desk objects

**확인**
- 왼쪽 3분의 2에 사물이 없습니다.
- 그 영역의 평균 밝기가 `#141416` 이하입니다.
- 빨강은 실 하나뿐입니다.

### 3. `dots-paper-stock.jpg`

- **비율과 크기:** 1:1, 2048 × 2048 이상. 이음매 없이 반복되는 타일이어야 합니다.
- **쓰이는 곳:** 새 자리, 종이 재료의 질감
  - 1부 종이 조각: `.pc[data-mat="paper"]::before`, 다리 조각: `.pc[data-mat="ember"]::before`
  - 입구 명판(`.plaque`)
  - 방 안의 종이 그림: `.room-fig .pr`, `.corr-slip`, `.voices`, `.room-quote.is-bridge`
  - 이 모두가 지금은 단색 `#E8E4DC`입니다. 검은 잉크 글자(`#0B0B0C`, `#4A4741`)가 이 위에 바로 놓이므로 밝고 대비가 낮아야 합니다.
- **연결:** 위 선택자에 `background-image: url("../assets/dots-paper-stock.jpg"); background-size: 512px; background-blend-mode: multiply;`를 추가합니다.

**프롬프트**

```
Seamless tileable texture of uncoated bone-white paper stock (#E8E4DC), photographed straight on, flat and evenly lit, filling the entire frame edge to edge. Subtle visible cotton fibers, faint soft mottling, a few tiny inclusions, a very slight tooth to the surface. Even overall brightness: no shadows, no folds, no creases, no edges, no corners, no vignette, no lighting falloff. Tone variation stays within a few percent of the base color. The texture must tile without visible seams on all four sides.
```

**네거티브:** text, letters, numbers, watermark, logo, ruled lines, grid, stains, coffee rings, folds, creases, torn edges, shadows, vignette, color cast, yellowed or aged look

**확인**
- 2 × 2로 이어 붙여 이음매가 보이지 않습니다.
- 가장 어두운 곳이 `#D0CABC`보다 어둡지 않습니다. 그래야 `#4A4741` 글자가 4.5:1 이상을 유지합니다.
- 평균색이 `#E8E4DC`에 가깝습니다.

### 4. `dots-threads-list.jpg`

- **비율과 크기:** 16:9, 2560 × 1440 이상
- **쓰이는 곳:** 새 자리, 목록 보기(`L` 키, `dialog.index`) 배경
  - 목록은 조각 48개를 줄로 늘어놓은 화면입니다.
  - 바닥의 주제인 "조각을 잇는 실"을 질감으로만 깝니다. 줄 글자 뒤에 깔리므로 아주 어둡고 성겨야 합니다.
- **연결:** `css/archive.css`의 `.index`에 `background: var(--field) url("../assets/dots-threads-list.jpg") center / cover no-repeat fixed;`를 추가합니다.

**프롬프트**

```
Macro photograph in near-black space (#0B0B0C): a few very fine bone-white threads (#E8E4DC), dim and slightly out of focus, cross the frame at shallow angles from the left and right edges and meet loosely in the middle third, where two of them are tied together in one small simple knot. Only the knot catches a warm ember light (#E8541E); the fiber twist is sharp there and softens along the threads toward the edges. Most of the frame is empty black with fine film grain; the threads are thin lines, never a web or a net. Calm, minimal, tactile.
```

**네거티브:** text, letters, numbers, logos, watermark, people, hands, needles, fabric, rope, spider web, net, network diagram, nodes, glowing lines, neon, fiber optics, bokeh, particles, sparks, multiple accent colors

**확인**
- 실이 다섯 가닥 이하입니다. 망이나 그물처럼 보이지 않습니다.
- 색은 매듭의 엠버 하나입니다.
- 네트워크 다이어그램처럼 읽히지 않습니다.

---

## Muse: 도면과 엠버 계열

### 5. `muse-drawing-floor.jpg`

- **비율과 크기:** 1:1, 3072 × 3072 이상
- **쓰이는 곳:** 2부 바닥 질감
  - 지금 자리: `assets/gen-drawing-threads.jpg`. 이것을 대체합니다.
  - 구조: `AR.assets`(zone `p2`)에서 `.zone-p2 .zone-tex`로 들어갑니다.
  - 표시 방식: 불투명도 0.09, `mix-blend-mode: screen`. 2부 구역은 4400 × 4900이고 `cover`로 채웁니다.
  - 위에 올라가는 것: 사이트가 SVG로 그리는 동심원 고리 여섯 개. 고리의 중심은 이미지 가로 가운데, 세로로 절반보다 약간 아래(약 51%)입니다.
  - 지금 이미지는 사각형 회로 같은 형태가 고리와 싸워서 불투명도를 0.09까지 내렸습니다. 새 이미지는 닫힌 도형 없이 작도의 흔적만 있어야 합니다.
- **연결:** `AR.assets`의 p2 항목 `file`을 `assets/muse-drawing-floor.jpg`로 바꿉니다. 고리와 싸우지 않으면 `.zone-p2 .zone-tex` 불투명도를 0.15~0.2로 올립니다.

**프롬프트**

```
Top-down view of a dark drafting surface (#0E0E10) holding only the faint traces a draftsman leaves behind: a few long straight construction lines at shallow angles, light compass prick marks, short perpendicular tick marks without any numbers, partial arcs swept from a point slightly below the center of the frame, half-erased ghost lines, and a barely visible dot grid. All marks are hairline thin and bone-white (#E8E4DC) at low brightness, slightly uneven, like silverpoint on dark paper. The marks loosely orient toward that point below center and grow sparser toward the corners. A few tiny acid-green (#B6F23A) points sit where two lines intersect; they are the only color. No closed shapes: no full circles, no rectangles, no boxes. Matte, quiet, mostly empty.
```

**네거티브:** numbers, letters, dimension labels, measurements, ruler markings with numerals, text, logos, watermark, full circles, rectangles, boxes, circuit board, chip, traces with pads, blueprint blue, HUD, neon glow, screens, UI, hands, drawing tools, people

**확인**
- 완전한 원과 사각형이 없습니다.
- 숫자나 글자 같은 표기가 없습니다.
- 초록은 작은 점뿐입니다.
- 가운데 약간 아래가 비교적 비어 있습니다(그 자리에 패러다임 표 조각이 놓입니다).

### 6. `muse-room-drawing.jpg`

- **비율과 크기:** 16:9, 2560 × 1440 이상
- **쓰이는 곳:** 새 자리, 2부 조각의 방 배경(`dialog.room[data-zone="p2"]`)
  - 2부 방에는 정의, 표, 용어, 논문 첫 페이지 이미지가 놓입니다.
  - 이미지는 오른쪽 가장자리에만 형태가 있어야 합니다.
- **연결:** `.room[data-zone="p2"] { background: #0E0E10 url("../assets/muse-room-drawing.jpg") right center / cover no-repeat fixed; }`를 추가합니다.

**프롬프트**

```
Wide still of a near-black drafting atmosphere (#0E0E10). At the right edge, partly cropped by the frame, one large hand-drawn compass arc in a thin bone-white line (#E8E4DC), its center off-frame to the right, with two or three concentric partial arcs inside it, slightly uneven, carrying small tick marks along them and no labels. One small acid-green (#B6F23A) point where an arc crosses a straight construction line; it is the only color. The left two-thirds of the frame is flat dark with only a barely visible dot grid and fine grain. Matte, precise, calm.
```

**네거티브:** numbers, letters, labels, text, logos, watermark, full circles, rectangles, UI, HUD, screens, blueprint blue, neon glow, lens flare, hands, tools, people, charts, diagrams with nodes

**확인**
- 왼쪽 3분의 2에 선이 없습니다(점 격자 제외).
- 눈금에 숫자가 없습니다.
- 초록은 점 하나입니다.

### 7. `muse-corridor-ember.jpg`

- **비율과 크기:** 지원되면 1:4 세로를 씁니다. 안 되면 9:16을 쓰고, 2048 높이 이상으로 뽑습니다.
- **쓰이는 곳:** 다리 복도 질감
  - 지금 자리: `assets/gen-paper-ember.jpg`. 이것을 대체합니다.
  - 구조: `AR.assets`(zone `br`)에서 `.zone-br .zone-tex`로 들어갑니다.
  - 표시 방식: 불투명도 0.55, `mix-blend-mode: screen`, `object-position: 50% 40%`.
  - 크기: 복도는 600 × 4900(약 1:8)입니다. 9:16 이미지는 `cover`로 채우면 **가운데 세로 띠, 가로 폭의 약 22%만** 보입니다. 지금 이미지는 이 때문에 종이의 대부분이 잘려 나갑니다.
  - 위에 올라가는 것: 높이 약 13~25%에 입구 명판(bone 종이), 약 35%, 57%, 79%에 다리 문장 조각 세 장.
- **연결:** `AR.assets`의 br 항목 `file`을 `assets/muse-corridor-ember.jpg`로 바꿉니다.

**프롬프트**

```
Tall, narrow vertical composition on a near-black ground (#0B0B0C): one long strip of crumpled, torn bone-white paper (#E8E4DC) runs down the vertical center of the frame, from near the top to the bottom. It is lit from below by a warm ember glow (#E8541E), as if from coals just out of frame; the warmth climbs the paper and fades toward the top, so the bottom third is warmest and the top third is dim. Creases and torn edges catch the warm light. Keep all of the paper and all of the light inside the central fifth of the frame width; the left and right sides are plain near-black, because they will be cropped away. Fine film grain. Warmth only: no flames, no fire, no smoke, no sparks.
```

**네거티브:** text, letters, numbers, writing on the paper, logos, watermark, flames, fire, smoke, sparks, floating embers, particles, people, hands, candles, lamps, glow halo, lens flare, wide composition, objects at the sides

**확인**
- 가운데 5분의 1 바깥에 형태나 빛이 없습니다.
- 불꽃과 입자가 없습니다.
- 위로 갈수록 어두워집니다. 위쪽 명판 아래는 밝기가 낮아야 명판이 떠 보입니다.

### 8. `muse-room-bridge.jpg`

- **비율과 크기:** 16:9, 2560 × 1440 이상
- **쓰이는 곳:** 새 자리, 다리 조각의 방 배경(`dialog.room[data-zone="br"]`)
  - 다리 방에는 학생의미 메타의 전환 문장이 큰 글씨로 엠버 종이 위에 놓입니다.
  - 배경은 오른쪽 아래 모서리에만 온기가 있어야 합니다.
- **연결:** `.room[data-zone="br"] { background: var(--field) url("../assets/muse-room-bridge.jpg") right bottom / cover no-repeat fixed; }`를 추가합니다.

**프롬프트**

```
Wide still in near-black (#0B0B0C). In the bottom right corner only, the corner of a blank sheet of bone-white paper (#E8E4DC) lies on a dark surface; its torn edge is warmed by a low ember light (#E8541E) coming from just beyond the bottom edge of the frame. The warmth spreads a little onto the dark surface and fades out within the lower right quarter. Everything else is deep black with fine film grain. Calm, like the last warm light at the end of a corridor.
```

**네거티브:** text, letters, numbers, writing on the paper, logos, watermark, flames, fire, smoke, sparks, particles, people, hands, lamps, windows, sky, lens flare, gradient background, second accent color

**확인**
- 형태와 빛이 오른쪽 아래 4분의 1 안에만 있습니다.
- 종이에 글씨가 없습니다.
- 색은 엠버 하나입니다.

---

## 요약

| 파일 | 담당 | 비율 | 자리 | 지금 상태 |
|---|---|---|---|---|
| `dots-field-scatter.jpg` | Dots | 3:4 | 1부 바닥 질감 | `gen-field-fragments.jpg` 대체 (경로만 바꾸면 됨) |
| `dots-room-field.jpg` | Dots | 16:9 | 1부 방 배경 | 새 자리, CSS 추가 필요 |
| `dots-paper-stock.jpg` | Dots | 1:1 타일 | 종이 조각, 명판, 방의 종이 그림 | 새 자리, CSS 추가 필요 |
| `dots-threads-list.jpg` | Dots | 16:9 | 목록 보기 배경 | 새 자리, CSS 추가 필요 |
| `muse-drawing-floor.jpg` | Muse | 1:1 | 2부 바닥 질감 | `gen-drawing-threads.jpg` 대체 (경로만 바꾸면 됨) |
| `muse-room-drawing.jpg` | Muse | 16:9 | 2부 방 배경 | 새 자리, CSS 추가 필요 |
| `muse-corridor-ember.jpg` | Muse | 1:4 (또는 9:16) | 다리 복도 질감 | `gen-paper-ember.jpg` 대체 (경로만 바꾸면 됨) |
| `muse-room-bridge.jpg` | Muse | 16:9 | 다리 방 배경 | 새 자리, CSS 추가 필요 |

이미지가 도착하면 아카이브 세션이 다음을 합니다.
1. 공통 확인을 거칩니다.
2. `AR.assets`와 CSS에 연결합니다.
3. README의 에셋 출처 표에 도구, 모델, 날짜, 최종 프롬프트를 적습니다.
4. `tools/check.py`를 다시 실행합니다. 바닥 질감의 캡션은 이 스크립트가 "생성 이미지 · 디자인 에셋"인지 확인합니다.
