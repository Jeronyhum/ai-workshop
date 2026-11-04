# 라이브러리와 글꼴의 출처 (v6)

이 파일은 v6 수정 단계에서 쓴 외부 코드와 글꼴을 적습니다. `CREDITS.md`는 올릴 때 만들어지므로, 그때 이 내용을 옮기면 됩니다.

## 자바스크립트 라이브러리: 없음

`fix-phase-permissions.md`는 three.js, GSAP, Lenis, Motion, OGL, postprocessing, 셰이더 라이브러리를 `vendor/`에 넣어 쓰는 것을 허락했습니다. v6에서는 **하나도 넣지 않았습니다.** 그래서 `vendor/` 폴더가 없고, CDN 요청도 없습니다.

| 필요했던 것 | 라이브러리 대신 한 것 | 크기 |
|---|---|---|
| 바닥 뒤의 움직이는 배경 (필름 그레인 대체) | `js/field.js`: WebGL 1 셰이더 하나(등고선, 구역별 색, 디더). 직접 썼습니다 | 6.1KB |
| 부드러운 카메라 이동 | 기존 CSS `transform` 전환과 `@property --z` | 0 |
| 용어 말풍선 | `js/terms.js`: 브라우저 내장 `popover` | 6.5KB |
| 스크롤 효과 | 기존 CSS 스크롤 기반 애니메이션 | 0 |

넣지 않은 이유:

- three.js와 OGL은 3D 장면을 위한 라이브러리입니다. 여기서 그리는 것은 화면을 덮는 평면 셰이더 하나라서 WebGL로 직접 그리는 편이 짧습니다(6.1KB).
- GSAP과 Motion이 할 일은 CSS 전환과 기존 rAF 코드가 이미 합니다.
- Lenis는 바닥(카메라)과 맞지 않습니다. 바닥에는 문서 스크롤이 없고, 방의 스크롤은 브라우저 기본이 낫습니다.
- 모든 움직임이 모션 줄임과 `M` 토글을 따라야 합니다. 이미 있는 한 곳(`ARchive.reduced()`)에서 끄는 편이 라이브러리마다 끄는 것보다 확실합니다.

## 글꼴 (모두 SIL Open Font License 1.1)

`fonts/`의 파일은 모두 이 사이트가 쓰는 글자만 남긴 WOFF2 서브셋입니다. 저작권 줄은 각 파일의 이름 표에서 읽었고, 라이선스 전문은 `fonts/OFL.txt`에 있습니다.

| 글꼴 | 저작권 | 파일 | 크기 |
|---|---|---|---|
| Archivo (가변, 폭 62–100, 굵기 400–900) | Copyright 2020 The Archivo Project Authors | `Archivo-subset.woff2` | 44KB |
| JetBrains Mono (가변) | Copyright 2020 The JetBrains Mono Project Authors | `JetBrainsMono-subset.woff2` | 35KB |
| Instrument Serif Regular, Italic | Copyright 2022 The Instrument Serif Project Authors | `InstrumentSerif-*-subset.woff2` | 각 17KB |
| Noto Serif CJK KR Regular, Bold | © 2017-2024 Adobe | `NotoSerifKR-*-subset.woff2` | 각 약 210KB |
| Pretendard Regular, Medium, Bold | Copyright © 2023 Kil Hyung-jin | `Pretendard-*-subset.woff2` | 각 77KB |
| Gothic A1 Regular, Bold, Black | (C) Copyright HanYang I&C Co.,Ltd. | `GothicA1-*-subset.woff2` (화면에서 쓰지 않아 내려받지 않음) | 52–66KB |

서브셋의 원본 TTF는 `tools/fonts-src/`에 있고 사이트는 내려받지 않습니다. 다시 만드는 법: `python3 tools/subset_latin.py`(라틴), `python3 tools/subset_ko.py`(한글).

## 규칙만 가져온 것

- **dale-ui** ([DaleStudy/daleui](https://github.com/DaleStudy/daleui) `fa0d72e`, MIT, Copyright (c) 2025 DaleStudy): 한국어 타이포그래피 규칙(글꼴 묶음, 행간, 자간, `keep-all`, 글자 크기 단계). 코드는 가져오지 않았습니다. v6의 용어 말풍선과 출구 구역도 이 규칙을 따릅니다. 자세한 대응은 `README.md`의 v5 절에 있습니다.
- **ai-workshop** (`../`, `https://github.com/Jeronyhum/ai-workshop`): 출구 구역의 OpenCode 설치 설명과 작업 흐름은 `build/` 아래 파일의 문장을 줄 번호와 함께 인용합니다. 파일을 복사하지 않고 링크합니다. API 키 같은 비밀값은 옮기지 않았습니다(`tools/check.py`가 확인).
