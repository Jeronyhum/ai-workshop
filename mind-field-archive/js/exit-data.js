/* v6: the exit zone (출구). The decision a visitor leaves with: what to build today, which words they need, and how the
   workshop's one-click installer (Jeronyhum/ai-workshop, build/) sets them up.
   Every t (and every q) is copied verbatim from the cited line of the installer repo; tools/check.py checks them when
   the repo is reachable (the published layout puts this archive at ai-workshop/mind-field-archive/, next to build/).
   plain lines are this site's explanation in student language. The example sentences on the path cards are suggestions,
   except the one the installer itself prints. No key, token or secret is copied here. */
(function () {
  const AR = (window.AR = window.AR || {});
  const RM = "ai-workshop/README.md", IN = "ai-workshop/build/payload/install.sh", AG = "ai-workshop/build/payload/AGENTS.md";
  const BL = "talk/blocks.md";  /* the opening talk */
  AR.exit = {
    question: "오늘 뭘 만들고 싶은가?",
    lead: "다 둘러봤다면 이제 하나를 고를 차례입니다. 고른 길마다 알아야 할 낱말과 설치 순서를 이어 두었습니다.",
    /* the installer asks the same question at its last step and offers these categories */
    ask: { t: "이번 워크숍에서 무엇을 만들고 싶나요?", s: { f: IN, l: 324 } },
    picks: { t: ["업무 자동화", "정보 수집 도구", "개인용 웹앱", "글쓰기 도우미", "데이터 분석", "아직 모르겠음"], s: { f: IN, l: 325 } },
    paths: [
      { id: "club", name: "동아리 앱", sub: "회원 명단 · 행사 · 출석 · 공지", pick: "개인용 웹앱", glyph: "club",
        example: "동아리 회원 명단과 행사 출석을 한곳에서 관리하고 싶다",
        terms: ["spec", "repo", "deploy", "apikey", "agent"], steps: ["s1", "s2", "s6", "f2", "f6"] },
      { id: "folio", name: "포트폴리오 · 의뢰 받기", sub: "작업 소개 · 의뢰 양식 · 진행 상황", pick: "개인용 웹앱", glyph: "folio",
        example: "내 작업을 보여 주고 의뢰를 받는 사이트를 만들고 싶다",
        terms: ["deploy", "github", "spec", "diff", "prompt"], steps: ["s1", "s2", "s6", "f1", "f6"] },
      { id: "auto", name: "반복 업무 자동화", sub: "공지 요약 · 회비 정산 · 정리", pick: "업무 자동화", glyph: "auto",
        example: "매일 아침 공지사항을 요약해서 메일로 받고 싶다", exampleSrc: { f: IN, l: 335 },
        terms: ["loop", "routine", "api", "mcp", "apikey"], steps: ["s1", "s2", "s6", "f1", "f6"] },
      { id: "info", name: "정보 모으기 도구", sub: "검색 · 수집 · 요약", pick: "정보 수집 도구", glyph: "info",
        example: "관심 분야의 새 글을 모아 한 페이지로 보고 싶다",
        terms: ["mcp", "context", "token", "tool"], steps: ["s1", "s2", "s6", "f1", "f6"] },
      { id: "unsure", name: "아직 모르겠어요", sub: "질문부터 받기", pick: "아직 모르겠음", glyph: "unsure",
        example: "",
        coach: { t: "인사만 하고 질문은 3개 이하로 시작한다. 코드를 쓰지 않는다.", s: { f: AG, s: "첫 대화 규칙", l: 63 } },
        terms: ["vibe", "prompt", "agent"], steps: ["s1", "s2", "s6", "f1"] },
    ],
    install: {
      file: { t: "build/ssu-opencode-setup.cmd", s: { f: RM, l: 7 } },
      run: [
        { os: "Windows", t: "Windows 더블클릭", s: { f: RM, l: 7 } },
        { os: "macOS · Linux", t: "macOS/Linux는 터미널에서", cmd: "bash ssu-opencode-setup.cmd", s: { f: RM, l: 7 } },
      ],
      what: [
        { t: "OpenCode Desktop (+ Node/Git/uv 자동 설치)", plain: "AI와 함께 코딩하는 데스크톱 앱, 그리고 그 앱이 쓰는 기본 프로그램", s: { f: RM, l: 14 } },
        { t: "SSU BAZE API 키 입력", plain: "학교 게이트웨이를 쓰는 열쇠. 대시보드에서 발급받아 화면에만 입력", s: { f: RM, l: 15 } },
        { t: "게이트웨이 전 모델(61개) + MCP(35+) 설정을 라이브 카탈로그에서 생성", plain: "쓸 수 있는 AI 모델과 외부 도구 연결을 한 번에 설정", s: { f: RM, l: 16 } },
        { t: "크레딧/컨텍스트 HUD", plain: "남은 사용량과 대화 길이를 늘 보여 주는 작은 표시창", s: { f: RM, l: 17 } },
        { t: "Serena (MCP 등록, 심볼 단위 탐색·편집) + graphify (구조 지도 스킬)", plain: "코드를 함수 단위로 정확히 찾아 고치는 도구와, 프로젝트 구조 지도", s: { f: RM, l: 18 } },
        { t: "pstack 58 스킬 (cursor/plugins 기준) + spec-kit", plain: "좋은 작업 습관을 담은 스킬 묶음과, 명세부터 쓰게 돕는 도구", s: { f: RM, l: 19 } },
        { t: "vibe-coach 코치 스킬 — 첫 대화에서 의도·유사제품·API 비용을 먼저 묻는다", plain: "코드를 쓰기 전에 '무엇을, 왜'를 먼저 물어 주는 코치", s: { f: RM, l: 20 } },
      ],
      steps: [
        { id: "s1", t: "1/6 기반 프로그램", plain: "OpenCode 앱과, 앱이 쓰는 Node·Git·uv를 알아서 설치합니다. 이미 있으면 건너뜁니다.", s: { f: IN, l: 36 } },
        { id: "s2", t: "2/6 SSU API 키", plain: "대시보드가 열리면 키를 발급받아 붙여 넣습니다. 키는 화면에만 입력하고 어디에도 적어 두지 않습니다.", s: { f: IN, l: 169 } },
        { id: "s3", t: "3/6 설정 파일 배치", plain: "AI의 작업 규칙(AGENTS.md), 명령, 스킬 파일을 제자리에 둡니다.", s: { f: IN, l: 205 } },
        { id: "s4", t: "4/6 모델 설정 생성", plain: "게이트웨이에서 쓸 수 있는 모델 목록을 받아 설정 파일을 만듭니다.", s: { f: IN, l: 243 } },
        { id: "s5", t: "5/6 코드 도구 (Serena·graphify) + 워크플로 스킬", plain: "코드를 정밀하게 고치는 도구, 구조 지도, 작업 습관 스킬을 설치합니다.", s: { f: IN, l: 256 } },
        { id: "s6", t: "6/6 시작 설정", plain: "오늘 무엇을 만들지 고르고 한 문장으로 적습니다. 첫 대화가 이 문장에서 출발합니다.", s: { f: IN, l: 319 } },
      ],
      after: [
        { t: "OpenCode를 실행하세요.", s: { f: IN, l: 373 } },
        { t: "모델 목록에서 'BAZE' 계열을 고르세요.", s: { f: IN, l: 374 } },
        { t: "로 시작하고 싶어. 뭐부터 하면 돼?", lead: "첫 대화: \"고른 한 문장\"", s: { f: IN, l: 375 } },
      ],
      key: { t: "SSU_API_KEY 값을 화면에 출력하지 않는다.", plain: "API 키는 설치 화면에만 입력하세요. 채팅창, 파일, 스크린샷, 깃허브에 붙여 넣으면 남이 내 사용량을 쓸 수 있어요.", s: { f: AG, s: "키와 비밀", l: 77 } },
    },
    /* AGENTS.md "전체 흐름 (한 바퀴)": the six steps every session follows */
    flow: [
      { id: "f1", k: "의도", tool: "vibe-coach", t: "\"무엇을, 왜\"를 확정한다", plain: "AI가 코드를 쓰기 전에, 무엇을 왜 만드는지 질문으로 정리해요.", s: { f: AG, l: 8 } },
      { id: "f2", k: "명세", tool: "spec-kit", t: "명세 → 계획 → 작업 목록을 먼저 만든다", plain: "만들 범위를 문서로 적고, 계획과 할 일 목록으로 쪼개요.", s: { f: AG, l: 9 } },
      { id: "f3", k: "지도", tool: "graphify", t: "프로젝트 전체 구조와 영향 범위를 본다", plain: "프로젝트가 어떻게 이어져 있는지 지도를 그려, 하나를 고치면 어디가 영향받는지 봐요.", s: { f: AG, l: 10 } },
      { id: "f4", k: "정밀 작업", tool: "serena", t: "심볼 단위 탐색·편집을 한다", plain: "파일 전체가 아니라 필요한 함수만 찾아 정확히 고쳐요.", s: { f: AG, l: 11 } },
      { id: "f5", k: "규율", tool: "pstack", t: "pstack 스킬로 작업 방식을 잡는다", plain: "테스트 먼저 쓰기, 근거 보여 주기 같은 작업 습관을 스킬로 불러와요.", s: { f: AG, l: 12 } },
      { id: "f6", k: "검증", tool: "실행 결과", t: "실행 결과로 확인한다", plain: "'됐어요'라는 말 대신, 실제로 돌려 본 결과로 확인해요.", s: { f: AG, l: 13 } },
    ],
    flowName: { t: "전체 흐름 (한 바퀴)", s: { f: AG, l: 6 } },
    /* why the loop starts at 의도: the thesis the talk ends on, and where it stands on the floor */
    why: { t: "그래서 이 의도를 챙겨주는 것이 코딩, 바이브 코딩 안에서 굉장히 중요할 수 있다.", s: { f: BL, l: 346 }, piece: "s-intent" },
    links: [
      { label: "설치 파일", file: "ssu-opencode-setup.cmd", rel: "../build/ssu-opencode-setup.cmd" },
      { label: "AI 작업 규칙", file: "AGENTS.md", rel: "../build/payload/AGENTS.md" },
      { label: "저장소 안내", file: "README.md", rel: "../README.md" },
    ],
    github: "https://github.com/Jeronyhum/ai-workshop/tree/main/build",
  };
})();
