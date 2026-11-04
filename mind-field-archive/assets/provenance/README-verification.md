# MIND FIELD · Dots 2차 이미지 6장

## 결과 요약

6장의 원본 PNG와 지정 파일명의 sRGB JPEG를 함께 제공합니다. **내보내기 규격 충족과 디자인 지시 충족은 구분했습니다.** 모든 그림이 전체 조건을 통과한 최종본은 아닙니다. D1·D3·D4는 기하/구성 수정이 필요하고, D2는 아치 개수가 범위에 맞는지 확인이 필요합니다. D5는 핵심 그래프 구조를 충족하되 위치 보정이 권장되고, D6는 기본 조건을 충족하되 전환선이 정확한 수직선은 아닙니다.

원본 크기가 작은 D1~D5는 Lanczos로 확대했습니다. 출력 픽셀 수를 늘린 것이며 원래부터 해당 해상도로 생성되었다는 뜻이 아닙니다. D6는 원본 해상도를 그대로 유지했습니다.

## 파일 규격

| ID | JPEG 파일명 | 실제 원본 크기 | JPEG 출력 크기 | JPEG 바이트 | 처리 |
|---|---|---:|---:|---:|---|
| D-1 | dots2-harness-frame.jpg | 1448×1086 | 2400×1800 | 182,982 | 확대 |
| D-2 | dots2-gap-arches.jpg | 1086×1448 | 1800×2400 | 181,084 | 확대 |
| D-3 | dots2-verify-prism.jpg | 1586×992 | 2560×1600 | 115,208 | 확대 |
| D-4 | dots2-approval-threshold.jpg | 1586×992 | 2560×1600 | 123,449 | 확대 |
| D-5 | dots2-graph-constellation.jpg | 1672×941 | 2560×1440 | 157,895 | 확대 |
| D-6 | dots2-seam-ember-to-lattice.jpg | 724×2172 | 724×2172 | 172,627 | 원본 크기 유지 |

모든 JPEG는 RGB, 품질 82, 최적화·progressive 저장, 4:2:0 샘플링 및 sRGB ICC 프로파일을 사용했습니다. 원본 PNG에 색 프로파일이 없어 sRGB로 가정한 뒤 명시적으로 프로파일을 넣었습니다. 원본의 알려진 다른 색공간에서 변환했다는 뜻은 아닙니다.

## 개별 시각 검수

측정 좌표는 원본 기준입니다. 색 마스크와 수동 픽셀 위치를 이용한 근사치이며, 정확한 벡터/3D 좌표가 아닙니다. 초록 마스크는 G>150, G>1.15R, G>1.5B를 사용했습니다. 마스크와 밝기 수치만으로 내용이나 의미를 자동 판정하지 않았습니다.

### D-1 · dots2-harness-frame.jpg

**판정: 수정 권장: 구 크기·위치와 연결점 수**

**충족/관찰**
- 프레임 안에 회로 기판이나 기계 부품이 없고, 초록은 구 하나입니다.
- 왼쪽 38%가 비어 있습니다. 원본 해당 영역의 최대 RGB는 (14,16,20)입니다.

**차이/미확인**
- 초록 구 중심은 약 (66.8%,51.2%)로 지정 (64%,52%)보다 오른쪽입니다. 구의 뚜렷한 본체 반지름은 폭의 약 4.7~4.8%로 지정 7%보다 작습니다.
- 연결점은 시각적으로 약 16개가 보이며 지정된 12개와 다릅니다. 요청서의 “모든 꼭짓점과 변 중점”과 “열두 곳”도 서로 일치하지 않으므로, 12개가 우선인지 모든 지점이 우선인지 후속 설계에서 정해야 합니다.
- 내부 프레임 앞면 가로 변은 폭의 약 24.4%, 전체 투영 폭은 약 30.5%입니다. 3D 정육면체의 변 길이를 투영 사진에서 유일하게 정하기는 어렵지만 지정 34%와 정확히 일치한다고 검증하지 않았습니다.

### D-2 · dots2-gap-arches.jpg

**판정: 조건부 후보: 먼 아치 개수 확인 필요**

**충족/관찰**
- 원근감과 점점 짧아지는 간격이 보이고, 초록은 가장 먼 아치 하나에만 있습니다. 숫자나 비율 표시는 보이지 않습니다.
- 아래 40%에는 선이 보이지 않습니다. 해당 영역의 최대 RGB는 (37,42,44)입니다.

**차이/미확인**
- 먼 아치의 희미한 윤곽까지 포함하면 약 10개로 보입니다. 원근 끝의 윤곽이 겹치므로 정확한 개수는 불확실하며, 지정한 6~9개 범위를 통과했다고 판정하지 않았습니다. 3배 확대 크롭을 qa에 넣었습니다.
- 가장 먼 초록 아치의 중심은 약 (49.9%,35.4%)입니다. 이는 소실점의 대리지표일 뿐이며, 지정 소실점 (50%,34%)와 정밀하게 일치한 원근 투영으로 검증한 것은 아닙니다.
- 바닥은 차콜색으로 꽤 밝으며 미묘한 반사와 빛 번짐이 있습니다. 완전히 무광이고 균일한 #0B0D10 바닥으로 인증하지 않았습니다.

### D-3 · dots2-verify-prism.jpg

**판정: 수정 권장: 프리즘 크기·위치**

**충족/관찰**
- 흰 빛이 왼쪽 중앙에서 들어와 오른쪽의 초록 통과 가지와 아래의 흐린 정지 가지로 나뉩니다. 무지개 분광은 없습니다.
- 위·아래 20%가 비어 있습니다. 하단 정지 벽도 아래 20%를 침범하지 않습니다.

**차이/미확인**
- 삼각형의 밑변은 높이의 약 44%, 빗변도 약 43%입니다. 지정한 한 변 30%보다 상당히 큽니다.
- 수동 확인한 꼭짓점의 무게중심은 약 (52.7%,53.5%)입니다. 지정 중심 (52%,50%)보다 아래입니다. 외접 사각형 중심은 약 (52.7%,47.3%)이므로, 후속 애니메이션은 어떤 중심을 쓰는지 명시하는 것이 좋습니다.
- 삼각형은 대체로 정삼각형으로 보이지만 정확한 정삼각형의 벡터 기하로 검증한 것은 아닙니다.

### D-4 · dots2-approval-threshold.jpg

**판정: 수정 권장: 문턱 전 정지 의미·위치**

**충족/관찰**
- 문이나 자물쇠·사람 없이 두 세로 기둥과 초록 신호 하나만 있습니다. 위쪽 30%가 비어 있습니다.
- 문턱 뒤쪽은 희미한 점선이며, 실선과 구분됩니다.

**차이/미확인**
- 흰 실선은 왼쪽 기둥을 가로질러 두 기둥 사이에서 끝납니다. 따라서 “문턱 앞에서 멈춤”이 명확하게 충족되지 않습니다.
- 기둥의 대략적 중심은 (50.0%,57.9%)로 지정 (50%,54%)보다 아래입니다. 기둥 간격은 폭의 약 12.7%로 지정 14%보다 작습니다.
- 초록 신호 중심은 약 (50.0%,49.5%)입니다. 이 신호 중심과 기둥 전체의 중심은 서로 다릅니다.

### D-5 · dots2-graph-constellation.jpg

**판정: 구조 조건 통과 · 배치 보정 권장**

**충족/관찰**
- 속이 빈 원형 노드 7개와 방향 화살표가 있습니다. 노드에 글자가 없습니다.
- 노드 3개가 실제 닫힌 방향 사이클을 이루며 그 사이클의 한 엣지만 초록입니다. 별자리 이름이나 다수의 장식 별은 없습니다.
- 왼쪽 22%는 비어 있습니다. 해당 영역의 최대 RGB는 (12,16,20)입니다.

**차이/미확인**
- 사이클의 세 노드 중심을 평균한 위치는 약 (63.9%,47.1%)로 지정 (60%,46%)보다 오른쪽입니다.
- 오른쪽 아래 노드는 가로 약 87%에 있어 중앙 70% 영역(15~85%) 바깥으로 나갑니다. 아래 노드의 링 일부도 세로 중앙 60% 영역의 아래쪽 경계 밖입니다. 중심 영역 안에 엄격히 모두 들어간 배치라고 주장하지 않았습니다.

### D-6 · dots2-seam-ember-to-lattice.jpg

**판정: 기본 조건 통과 · 중심은 근사**

**충족/관찰**
- 원본이 724×2172, 정확한 1:3이며 높이 2048 이상을 원생성 해상도로 충족합니다. 확대하지 않았습니다.
- 왼쪽은 엠버색 종이, 오른쪽은 파랑·흰 격자로 구분됩니다. 초록, 글자, 불꽃, 불티는 관찰되지 않았습니다.
- 원본이 1:3이므로 더 넓은 이미지에만 적용되는 “중앙 1/3 안에 전부 배치” 조건은 해당하지 않습니다.

**차이/미확인**
- 전환은 찢어진 종이의 유기적인 가장자리이므로 정확한 수직 직선은 아닙니다. 경계는 중앙선 근처에서 굴곡지며 대체로 약간 왼쪽입니다. 고정된 중앙선에 완벽히 맞춘 애니메이션 에셋이라고 인증하지 않았습니다.
- 종이 섬유가 오른쪽 격자 선으로 이어지는 인상은 있지만, 모든 섬유가 하나의 격자 선에 정확히 연결되는 벡터 구조는 아닙니다.

## 공통 검수와 제한

- 원본 전체 이미지를 시각적으로 검토했습니다. 글자·숫자·워터마크·로고·사람은 관찰되지 않았습니다. 이 결과는 시각 검토이며 모든 픽셀에 대해 문자 부재를 증명한 것은 아닙니다.
- 생성된 밝은 윤곽 주위에 번짐이 있습니다. 균일한 단색 선이나 정밀 벡터 출력이 아닙니다. 지정 팔레트의 모든 픽셀값이 정확히 일치한다고 주장하지 않았습니다.
- 새 프롬프트는 그래프·기하·빛 선을 명시적으로 허용하므로, 1차 종이·필드 에셋의 “다이어그램 제외” 조건을 이번 6장에 잘못 적용하지 않았습니다.
- 실제 앱의 blend-mode·opacity·마스크·반응형 크롭 및 애니메이션 기준점은 검증하지 않았습니다. 이 폴더의 자산을 앱에 연결하거나 앱 코드를 수정하지 않았습니다.
- 원본을 보존하고 복사본도 포함했습니다. 파일 해시는 SHA256SUMS.txt로 확인할 수 있습니다.
- 외부 업로드·배포는 수행하지 않았습니다.

## 후보정 기록

- D1, D2: 전체 프레임을 비율 유지 확대했습니다.
- D3, D4: 정확한 16:10을 위해 원본 위·아래 0.375px씩만 중심 크롭하고 확대했습니다.
- D5: 정확한 16:9를 위해 원본 위·아래 0.25px씩만 중심 크롭하고 확대했습니다.
- D6: 크기·크롭 변경 없이 JPEG로 인코딩했습니다.
- 색·톤·오브젝트·기하를 보정하지 않았습니다. 내용상 차이를 변환 작업으로 숨기지 않았습니다. JPEG 압축과 리샘플링의 미세한 픽셀 변화만 있습니다.

## 생성 출처 및 실제 최종 프롬프트

- 도구: OpenAI image generation.
- 모델 이름과 시드: 도구에서 공개되지 않았습니다.
- 생성일: 2026-11-04.
- 입력 구성: specification + 줄바꿈 + prompt + 줄바꿈 + "Avoid: " + common_negative.
- D6만 common_negative에서 정확한 문자열 "orange or amber highlights, "를 제거했습니다. 요청된 엠버 전환에 대한 예외입니다.
- 아래와 verification.json의 exact_final_prompt는 이 구성을 그대로 보존합니다. source-specifications.json에는 원래 구성 요소와 확인 기준이 있습니다.

### D-1 실제 입력

```text
### D-1. `dots2-harness-frame.jpg`: 모델과 그 둘레의 틀

- **비율과 크기:** 4:3, 2400 × 1800 이상.
- **자리:** 하네스 작품(Agent = Model + Harness 등식)의 배경. 지금 위치 (9080, 1700), 폭 1320.
  - 2단계 계획: 가운데 빛 구(모델)에 틀(하네스)이 한 겹씩 조립되고, 연결점마다 도구·권한·기록이 붙는 애니메이션.
- **화면 처리:** screen 혼합, 불투명도 0.55.
- **기준점:** 구의 중심이 가로 64%, 세로 52%, 구 반지름은 폭의 7%. 틀은 구를 둘러싼 정육면체 와이어프레임이고 한 변이 폭의 34%. 틀 꼭짓점과 변의 중점, 모두 열두 곳에 작은 연결점이 있습니다.
- **조용한 구역:** 왼쪽 38%(등식 글자 자리).
A dark field (#0B0D10). Right of center, at 64% of the width and 52% of the height, a small softly glowing sphere of light in acid green (#B6F23A), radius about 7% of the image width, the only green in the image. Around it, a precise wireframe cube seen in gentle three-quarter view, edge length about 34% of the width, drawn in thin chalk-white (#E8E4DC) luminous lines, with a second, slightly larger and fainter cube in math blue (#5CC8E0) around the first, like two nested frames of scaffolding. Small hollow circular attachment points sit on the corners and at the midpoints of the edges of the inner cube. The frames contain nothing else: no components, no boards, no chips, no machinery. The left 38% of the frame is empty and dark. Precise, clean, architectural, calm. Barely visible fine grain.
Avoid: text, letters, numbers, digits, labels, captions, equations, formulas, axis ticks with numbers, legends, UI, buttons, dashboards, HUD, screens, charts with values, logos, watermark, signature, people, faces, hands, robots, brains, circuit boards, chips, PCB traces, binary code, neon signs, lens flare, bokeh, starfield, nebula, galaxy, sci-fi spaceship interior, glossy 3D render of devices, pure black background, navy blue background, orange or amber highlights, more than one green highlight
```

### D-2 실제 입력

```text
### D-2. `dots2-gap-arches.jpg`: 명명 간격이 짧아진다 (약 3년 → 약 1주일)

- **비율과 크기:** 3:4 세로, 1800 × 2400 이상.
- **자리:** 패러다임 표의 "명명 간격" 크기 비교 배경, 그리고 2부 방(패러다임)의 첫 화면.
  - 2단계 계획: 간격 다섯 개(약 3년, 약 3개월, 약 2개월, 약 1주일, 명명과 서베이가 1개월 간격)를 글자 크기와 막대로 보여 줌. 실제 크기 비교는 SVG가 하고, 이미지는 원근감만 줍니다.
- **화면 처리:** 평상 혼합, 불투명도 0.6.
- **기준점:** 소실점이 가로 50%, 세로 34%.
- **조용한 구역:** 아래 40%(글자 자리).
A tall view down a long corridor of freestanding arches standing on a dark matte floor (#0B0D10), seen in one-point perspective with the vanishing point at 50% of the width and 34% of the height. The arches are drawn as thin, perfectly geometric luminous outlines in chalk white (#E8E4DC), the nearest one large and bright, each next arch smaller, closer to the previous one and fainter, so the spacing between arches visibly shrinks as they recede. Only the farthest, smallest arch glows acid green (#B6F23A). A faint math-blue (#5CC8E0) floor line runs to the vanishing point. The bottom 40% of the frame is dark floor with no lines. No numbers, no marks on the arches, nothing that could be read as a quantity. Calm, precise, mathematical. Barely visible fine grain.
Avoid: text, letters, numbers, digits, labels, captions, equations, formulas, axis ticks with numbers, legends, UI, buttons, dashboards, HUD, screens, charts with values, logos, watermark, signature, people, faces, hands, robots, brains, circuit boards, chips, PCB traces, binary code, neon signs, lens flare, bokeh, starfield, nebula, galaxy, sci-fi spaceship interior, glossy 3D render of devices, pure black background, navy blue background, orange or amber highlights, more than one green highlight
```

### D-3 실제 입력

```text
### D-3. `dots2-verify-prism.jpg`: 검증은 만든 쪽 밖에서

- **비율과 크기:** 16:10, 2560 × 1600 이상.
- **자리:** 검증(selfverify)·검토(review) 조각의 배경. 2단계에서 "검증 루프" 설명 장면의 무대.
  - 2단계 계획: 결과물(빛줄기)이 바깥의 판정기(프리즘)를 지나 통과와 멈춤으로 갈리는 애니메이션.
- **화면 처리:** screen 혼합, 불투명도 0.55.
- **기준점:** 프리즘(정삼각기둥의 단면)의 중심이 가로 52%, 세로 50%, 한 변이 높이의 30%. 들어오는 빛은 왼쪽 가장자리 세로 50%에서 출발합니다.
- **조용한 구역:** 위쪽 20%, 아래쪽 20%.
A dark field (#0B0D10). A single thin beam of chalk-white light (#E8E4DC) enters from the middle of the left edge and travels horizontally to a precise glass prism, drawn as a clean equilateral triangle outline in math blue (#5CC8E0), centered at 52% of the width and 50% of the height, each side about 30% of the image height. On the far side the beam splits: one thin branch continues straight on to the right edge, glowing acid green (#B6F23A), the only green in the image; a second, dimmer branch bends downward and stops short against a thin dark wall line, ending in a small soft fade. Perfect geometry, crisp optical clarity, calm. The top 20% and bottom 20% stay empty. Barely visible fine grain.
Avoid: text, letters, numbers, digits, labels, captions, equations, formulas, axis ticks with numbers, legends, UI, buttons, dashboards, HUD, screens, charts with values, logos, watermark, signature, people, faces, hands, robots, brains, circuit boards, chips, PCB traces, binary code, neon signs, lens flare, bokeh, starfield, nebula, galaxy, sci-fi spaceship interior, glossy 3D render of devices, pure black background, navy blue background, orange or amber highlights, more than one green highlight
```

### D-4 실제 입력

```text
### D-4. `dots2-approval-threshold.jpg`: 사람이 허락하는 문턱

- **비율과 크기:** 16:10, 2560 × 1600 이상.
- **자리:** 허락(approval) 조각의 배경. 2단계에서 "도구·권한" 설명 장면.
  - 2단계 계획: 에이전트의 경로가 문턱 앞에서 멈추고, 승인이 켜지면 이어지는 애니메이션.
- **화면 처리:** 평상 혼합, 불투명도 0.65.
- **기준점:** 문턱(두 개의 세로 기둥) 사이 중심이 가로 50%, 세로 54%, 기둥 간격은 폭의 14%.
- **조용한 구역:** 위쪽 30%.
A dark matte field (#0B0D10) with a single luminous path drawn as a smooth chalk-white (#E8E4DC) curve coming in from the lower left, flowing toward a threshold formed by two thin vertical posts of light in math blue (#5CC8E0), standing 14% of the width apart, centered at 50% of the width and 54% of the height. The path stops just before the threshold in a small resting point. Between the two posts hangs one small round light in acid green (#B6F23A), the only green in the image, like a signal waiting to be switched. Beyond the threshold, the continuation of the path is drawn only as a faint dotted hairline curving toward the upper right. The top 30% of the frame is empty and dark. Precise, quiet, clean. Barely visible fine grain.
Avoid: text, letters, numbers, digits, labels, captions, equations, formulas, axis ticks with numbers, legends, UI, buttons, dashboards, HUD, screens, charts with values, logos, watermark, signature, people, faces, hands, robots, brains, circuit boards, chips, PCB traces, binary code, neon signs, lens flare, bokeh, starfield, nebula, galaxy, sci-fi spaceship interior, glossy 3D render of devices, pure black background, navy blue background, orange or amber highlights, more than one green highlight
```

### D-5 실제 입력

```text
### D-5. `dots2-graph-constellation.jpg`: 노드가 일하고, 엣지가 넘기고, 상태가 흐른다

- **비율과 크기:** 16:9, 2560 × 1440 이상.
- **자리:** 그래프 고리 설명 장면과 그래프 방의 첫 화면. 2단계에서 스웜 영상과 나란히 놓일 그래프 구조 장면.
  - 2단계 계획: 노드에 불이 켜지고, 방향 있는 엣지를 따라 상태 점이 이동하며, 사이클(재시도)이 한 번 도는 애니메이션.
- **화면 처리:** screen 혼합, 불투명도 0.5.
- **기준점:** 노드 일곱 개 정도가 화면 가운데 70% × 60% 영역에 흩어져 있고, 그중 셋이 작은 사이클(삼각형 고리)을 이룹니다. 사이클의 중심은 가로 60%, 세로 46%.
- **조용한 구역:** 왼쪽 22%(설명 글).
A dark field (#0B0D10) with a sparse, elegant network: about seven small hollow round nodes drawn as chalk-white (#E8E4DC) luminous rings, spread across the central 70% by 60% of the frame, connected by thin smooth curved edges in math blue (#5CC8E0), each edge ending in a tiny unlabeled arrowhead. Three of the nodes form a small closed cycle of curved edges around a center at 60% of the width and 46% of the height; one edge of that cycle glows acid green (#B6F23A), the only green in the image. A few tiny particles of light sit on the edges as if in transit. The left 22% of the frame is empty. Not a starfield, not a constellation chart, no labels: a clean mathematical graph, precise and calm. Barely visible fine grain.
Avoid: text, letters, numbers, digits, labels, captions, equations, formulas, axis ticks with numbers, legends, UI, buttons, dashboards, HUD, screens, charts with values, logos, watermark, signature, people, faces, hands, robots, brains, circuit boards, chips, PCB traces, binary code, neon signs, lens flare, bokeh, starfield, nebula, galaxy, sci-fi spaceship interior, glossy 3D render of devices, pure black background, navy blue background, orange or amber highlights, more than one green highlight
```

### D-6 실제 입력

```text
### D-6. `dots2-seam-ember-to-lattice.jpg`: 다리에서 2부로 넘어가는 이음새

- **비율과 크기:** 1:3 세로가 좋습니다. 안 되면 9:16으로 뽑고, 가운데 세로 1/3 안에 모든 것을 둡니다. 2048 높이 이상.
- **자리:** 다리 복도(x 4600–5600)와 2부(x 5600~)가 만나는 경계에 세로로 길게 놓입니다. 폭 약 600, 높이 5600.
  - 1부의 엠버 종이가 2부의 계산된 선으로 바뀌는 순간을 보여 주는 유일한 2부 바깥 자산입니다.
- **화면 처리:** 평상 혼합, 불투명도 0.8, 양옆으로 사라지는 마스크.
- **기준점:** 바뀌는 지점이 세로 중앙선. 왼쪽 절반은 엠버의 따뜻함, 오른쪽 절반은 차가운 격자.
- **조용한 구역:** 없음(가는 띠).
A tall, narrow vertical composition on a dark ground (#0B0D10). Along the left half, the torn edge of a sheet of bone-white paper (#E8E4DC) runs top to bottom, warmed by a low ember glow (#E8541E) from the left. Exactly at the vertical center line, the torn paper edge turns into precise geometry: the fibers of the paper continue to the right as thin, perfectly straight luminous hairlines that resolve into a clean square lattice in math blue (#5CC8E0) and chalk white, as if the paper were becoming a diagram. The right half is cool, ordered and dark. Keep everything within the central third of the width if the frame is wider than 1:3. No green, no text, no fire, no sparks. Precise, quiet, a single transition. Barely visible fine grain.
Avoid: text, letters, numbers, digits, labels, captions, equations, formulas, axis ticks with numbers, legends, UI, buttons, dashboards, HUD, screens, charts with values, logos, watermark, signature, people, faces, hands, robots, brains, circuit boards, chips, PCB traces, binary code, neon signs, lens flare, bokeh, starfield, nebula, galaxy, sci-fi spaceship interior, glossy 3D render of devices, pure black background, navy blue background, more than one green highlight
```

## 폴더 안내

- `archive/assets/`: JPEG 6장.
- `originals/`: 원본과 바이트가 동일한 PNG 6장. 원래 임시 파일명은 verification.json에 기록했습니다.
- `README-verification.md`: 이 보고서.
- `verification.json`: 픽셀 크기·해시·조용한 구역 통계·검수 결과·전체 최종 프롬프트.
- `source-specifications.json`: 요청서의 구조화된 사본.
- `SHA256SUMS.txt`: 원본 복사본과 JPEG의 SHA-256.
- `qa/arches-detail-3x.png`: 먼 아치 확인용 확대 크롭. 최종 자산이 아닙니다.
- `prepare_assets.py`, `write_report.py`: 재현 가능한 변환·보고서 코드. 기존 출력은 덮어쓰지 않습니다.
