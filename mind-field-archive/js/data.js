/* MIND FIELD archive: every piece on the floor.
   Text is copied from refs/drive/ (paths below are relative to refs/drive/ unless they start with refs/).
   Status follows the audit, pkg/audit.md:
     verified    확정 ●  감사 B-1
     conditional 단서 ◐  감사 B-2, or a source that states its own limit (the condition is always shown)
     unverified  미확인 ○  social posts, images, copy outside the audit
     excluded    제외 ⊘  감사 B-3, shown only struck through
     corrected   정정 /  감사 B-0 premise errors, shown only as corrections
   Links come only from archive/urls-ok.txt or archive/x-from-drive.txt (checked by tools/check.py). */
(function () {
  const AR = (window.AR = window.AR || {});
  const P = "pkg/";
  const S1 = P + "P1_사무직벤치마크.md", S2 = P + "P1_과학난제와지표.md", S3 = P + "P1_시장산업.md",
        S4 = P + "P1_해킹보안.md", T1 = P + "P2_엔지니어링패러다임.md", T2 = P + "P2_에이전트진화와실전.md",
        T3 = P + "P2_용어와필수개념.md", AU = P + "audit.md", ME = P + "학생의미_메타.md",
        PD = P + "보완_PD수첩_통계검증.md", XP = "refs/x-opus-motion-prompts.md";
  const x = (h, id) => ({ kind: "X 원본", label: "@" + h, url: `https://x.com/${h}/status/${id}` });
  /* the opening talk: its text, its fact check, its notes */
  const TR = "talk/", BL = TR + "blocks.md", FC = TR + "facts.md", MT = TR + "notes.md";

  AR.world = { w: 15500, h: 5600 };

  AR.zones = {
    p1: { name: "1부", title: "AI 시대의 변화", x: 0, w: 4600, key: "Digit1", anchor: "accounting",
          src: { f: S4, l: 3, by: "1부 (AI 시대의 변화)" } },
    br: { name: "다리", title: "학생에게 어떤 의미인가", x: 4600, w: 1000, key: "Digit3", anchor: "bridgeA",
          src: { f: P + "패키지_빌드브리프.md", l: 13 } },
    gal: { name: "사례관", title: "프런티어 모델 활용 사례", x: 10000, w: 2700, key: "Digit4", src: { f: "refs/x-frontier-cases/cases.json" } },
    /* v6: the end of the exhibition. Visitors leave with a decision: what to build today, the words they need, and the installer. */
    exit: { name: "출구", title: "오늘 뭘 만들고 싶은가?", x: 12700, w: 2800, key: "Digit5" },
    p2: { name: "2부", title: "에이전트와 만드는 법", x: 5600, w: 4400, key: "Digit2", anchor: "paradigm",
          src: { f: P + "패키지_빌드브리프.md", l: 12 } },
  };

  /* dots' axes (dots_꼬리질문.md :34) as painted floor labels. */
  AR.clusters = [
    { zone: "p1", name: "가능성", x: 150, y: 640 },
    { zone: "p1", name: "비용", x: 2660, y: 150 },
    { zone: "p1", name: "측정의 함정", x: 2560, y: 700 },
    { zone: "p1", name: "일", x: 150, y: 3020 },
    { zone: "p1", name: "안전", x: 2560, y: 3020 },
  ];
  AR.clusterSrc = { f: P + "dots_꼬리질문.md", l: 34 };

  /* Part 2 floor: the paradigm stack drawn as rings (P2_엔지니어링패러다임.md §10 :227, "동심원/층"). */
  AR.rings = {
    cx: 7800, cy: 2900, core: 620,
    bands: [
      { key: "prompt",  name: "프롬프트", axis: "요청",     r: 1100 },
      { key: "context", name: "컨텍스트", axis: "맥락",     r: 1540 },
      { key: "harness", name: "하네스",   axis: "도구·권한", r: 1980 },
      { key: "loop",    name: "루프",     axis: "검증 루프", r: 2420 },
      { key: "graph",   name: "그래프",   axis: "협업",     r: 2860 },
    ],
    src: { f: T1, s: "§10", l: 227 },
  };

  AR.plaque = {
    text: "마치 내 머릿속 AI 지식들을 소개시켜주는 느낌으로, 난잡하게 흩어진 지식들과 그 근거 자료들을 이미지와 통계, 영상 자료 등으로 같이 볼 수 있게 하는 거지.",
    src: { f: P + "마스터프롬프트_원문_20261103.md", l: 15, by: "기획자의 원문, 2026-11-03" },
    x: 5100, y: 330,
  };

  /* Generated images: design assets only, never evidence. */
  /* Floor textures by slot (js/assets.js decides between the delivered file and its generated fallback). */
  AR.assets = [
    { slot: "art-field-scatter", zone: "p1", cap: "AI로 만든 배경 그림 · 근거 자료 아님" },
    { slot: "art-corridor-ember", zone: "br", cap: "AI로 만든 배경 그림 · 근거 자료 아님" },
    { slot: "art-field-manifold", zone: "p2", cls: "is-base", cap: "AI로 만든 배경 그림 · 근거 자료 아님" },
    { slot: "art-drawing-floor", zone: "p2", cap: "AI로 만든 배경 그림 · 근거 자료 아님" },
    { slot: "art-horizon-rings", zone: "p2", cls: "zone-band", cap: "AI로 만든 배경 그림 · 근거 자료 아님" },
    { slot: "art-seam-ember-to-lattice", zone: "p2", seam: true, cap: "AI로 만든 배경 그림 · 근거 자료 아님" },
  ];

  /* Pieces. Part 1 sits on a scattered 5×6 field (col,row); the bridge stacks in the corridor;
     Part 2 sits in its paradigm ring (ring, angle in degrees, 0 = east, clockwise) or at a corner (x,y). */
  AR.pieces = [
    /* ───────── 1부 여는 이야기 ─────────
       발표 순서대로: 역사 → 에이전트의 등장 → 활용. voice = 발표의 말 그대로 (tools/check.py가 원문과 대조).
       날짜·수치·귀속은 사실 확인 자료가 정본. metaphor = 비유 넷, 각각 그림 하나. */
    {
      id: "s-vibe", zone: "p1", cluster: "역사", w: 560, kind: "story",
      title: "바이브 코딩, 2025년 2월 2일",
      lede: "느낌(바이브)을 타는 코딩이지, 대충 하는 코딩이 아니다.",
      voice: [{ t: "쉽게 말해서 느낌 좋은 코딩, 줄여서 느적 코딩이라는 느낌일 것이다.", s: { f: BL, l: 57 } }],
      vis: { type: "date", d: "2025.02.02", en: "vibe coding", ko: "느적 코딩", koSrc: { f: BL, l: 57 }, s: { f: FC, l: 30 } },
      st: "verified",
      rows: [
        { st: "verified", t: "안드레 카파시(Andrej Karpathy)가 2025년 2월 2일 X 게시물에서 \"vibe coding\"이라는 말을 처음 썼다.", s: { f: FC, s: "1. 바이브코딩 기원", l: 31 } },
        { st: "verified", t: "그 게시물의 정의: \"fully give in to the vibes, embrace exponentials, and forget that the code even exists\"", s: { f: FC, s: "1. 바이브코딩 기원", l: 32 } },
        { st: "verified", t: "'느적 코딩'은 카파시의 표현이 아니라 이 워크숍에서 붙인 우리말 의역이다.", s: { f: FC, s: "E-1", l: 119 } },
      ],
      src: [{ f: BL, s: "C-01", l: 48 }, { f: FC, s: "E-1", l: 117 }],
      links: [{ kind: "X 게시물", label: "@karpathy: \"vibe coding\" (2025-02-02)", url: "https://x.com/karpathy/status/1886192184808149383" },
              { kind: "기사", label: "Scrimba: What is vibe coding", url: "https://scrimba.com/articles/what-is-vibe-coding/" }],
    },
    {
      id: "s-model", zone: "p1", cluster: "역사", w: 600, kind: "story",
      title: "모델은 GPT, ChatGPT는 그 위의 대화 환경",
      voice: [{ t: "그래서 모델명을 ChatGPT라고 생각하면 안 된다. 모델명은 GPT인 것이다.", s: { f: BL, l: 71 } },
              { t: "LLM은 단순히 모델이다. LLM에게 말을 할 수 있는 능력은 없다.", s: { f: BL, l: 70 } }],
      vis: { type: "model", line: [
        { d: "2018.06", t: "GPT-1 논문", s: { f: FC, l: 124 } },
        { d: "2022.11", t: "ChatGPT (GPT-3.5 기반)", s: { f: FC, l: 131 } },
        { d: "2023.03", t: "GPT-4", s: { f: FC, l: 40 } },
      ] },
      st: "verified",
      rows: [
        { st: "verified", t: "GPT-1: 2018년 6월 11일 논문 \"Improving Language Understanding by Generative Pre-Training\"로 공개.", s: { f: FC, s: "E-2", l: 124 } },
        { st: "verified", t: "ChatGPT: 2022년 11월 30일, GPT-3.5 계열 모델을 대화용으로 다듬어 출시.", s: { f: FC, s: "E-3", l: 131 } },
        { st: "verified", t: "GPT-4: 2023년 3월 14일 출시.", s: { f: FC, s: "2. LLM 역사", l: 40 } },
      ],
      src: [{ f: BL, s: "C-02", l: 62 }, { f: FC, s: "E-2, E-3", l: 124 }],
      links: [{ kind: "기사", label: "TechCrunch: OpenAI releases GPT-4 (2023-03-14)", url: "https://techcrunch.com/2023/03/14/openai-releases-gpt-4-ai-that-it-claims-is-state-of-the-art/" }],
    },
    {
      id: "s-tide", zone: "p1", cluster: "역사", w: 1100, kind: "story", metaphor: "tide",
      title: "발전은 썰물처럼 고르지 않게 온다",
      voice: [{ t: "인공지능의 발전은 전반적인 영역에서 일어나는 게 아니라 한 영역에서 마치 파도처럼 일어난다. · 썰물은 균일하게 밀려오지 않는다.", s: { f: BL, l: 85 } }],
      vis: { type: "tide", blank: "내 전공은?", s: { f: MT, l: 178 } },
      st: "verified",
      rows: [
        { st: "conditional", t: "GPT-3.5 터보 시절엔 한국어를 시키기 어려웠고, GPT-4에서 한국어가 크게 좋아졌다. 수치가 아닌 발표자의 체감이다.", s: { f: FC, s: "C-9", l: 419 } },
      ],
      src: [{ f: BL, s: "C-03", l: 77 }, { f: MT, s: "D3", l: 178 }],
    },
    {
      id: "s-deeper", zone: "p1", cluster: "역사", w: 600, kind: "story",
      title: "더 크게에서, 더 깊게 생각하게로",
      voice: [{ t: "이대로는 답이 없다고 생각한 GPT 업체에서는, OpenAI에서는 한 가지 생각을 하게 된다. 추론을 만들어주는 것이다.", s: { f: BL, l: 100 } }],
      vis: { type: "deeper", marks: [
        { d: "2024.09", t: "o1 (추론 모델)", s: { f: FC, l: 42 } },
        { d: "2024.12", t: "o1 프로, 수능 수학 30번", s: { f: FC, l: 152 } },
        { d: "2025.07", t: "실험용 추론 모델, IMO 35/42", s: { f: FC, l: 224 } },
        { d: "2025.08", t: "GPT-5 (통합 시스템)", s: { f: FC, l: 43 } },
      ] },
      st: "verified",
      rows: [
        { st: "verified", t: "2024년 9월 12일 o1-preview: 답하기 전에 안에서 추론 사슬을 만드는 첫 추론 모델 계열.", s: { f: FC, s: "2. LLM 역사", l: 42 } },
        { st: "verified", t: "수능 수학 30번: GPT-4는 풀지 못했고, 같은 문제를 맞힌 것은 2024년 12월부터 나온 추론 모델 o1 프로였다 (중앙일보 팩플 실측).", s: { f: FC, s: "E-6", l: 152 } },
        { st: "verified", t: "IMO 2025: 금메달 컷과 같은 35/42점을 받은 것은 OpenAI의 미출시 실험용 추론 모델이다. 공식 참가가 아니라 메달은 없다.", s: { f: FC, s: "O-2", l: 224 } },
        { st: "verified", t: "GPT-5: 2025년 8월 7일 출시. 빠른 모델과 생각하는 모델을 실시간 라우터로 묶은 통합 시스템.", s: { f: FC, s: "2. LLM 역사", l: 43 } },
        { st: "conditional", t: "o1(2024)에서 시작된 추론 계열이 GPT-5에 통합됐다는 평가가 나왔다. OpenAI가 이 인과를 공식 확인한 것은 아니다.", s: { f: FC, s: "U-11", l: 355 } },
      ],
      src: [{ f: BL, s: "C-04", l: 91 }, { f: FC, s: "E-6, O-2, U-11", l: 152 }],
      links: [{ kind: "기사", label: "TechTarget: OpenAI o1 explained", url: "https://www.techtarget.com/news/OpenAI-o1-explained-Everything-you-need-to-know/871976/" },
              { kind: "기사", label: "Simon Willison: OpenAI 실험 모델의 IMO 결과 (2025-07)", url: "https://simonwillison.net/tags/openai/?page=6" },
              { kind: "기사", label: "9to5Mac: OpenAI announces GPT-5 (2025-08-07)", url: "https://9to5mac.com/2025/08/07/openai-gpt-5-chatgpt-announcement/" }],
    },
    {
      id: "s-outside", zone: "p1", cluster: "역사", w: 360, kind: "story",
      title: "판을 흔든 외부자, 딥시크",
      voice: [{ t: "하지만 그걸 또 바꾼 게 있었으니 딥시크다.", s: { f: BL, l: 112 } }],
      st: "verified",
      rows: [
        { st: "verified", t: "DeepSeek R1: 2025년 1월 20일 MIT 라이선스 오픈웨이트로 공개.", s: { f: FC, s: "2. LLM 역사", l: 46 } },
        { st: "verified", t: "2025년 1월 27일 엔비디아 하루 -16.9%, 시가총액 약 $589B 증발 (미국 증시 사상 최대 단일일 손실).", s: { f: FC, s: "O-13", l: 291 } },
        { st: "conditional", t: "DeepSeek-V3의 $5.576M은 최종 학습 1회 실행 비용이다. 사전 연구·실험 비용을 뺀 수치라 총개발비 비교가 아니다.", s: { f: FC, s: "O-7", l: 255 } },
        { st: "verified", t: "트랜스포머 논문 공저자 노엄 샤지어: 2024년 8월 구글이 약 $2.7B 라이선싱 딜로 데려와 Gemini를 맡겼고, 2026년 6월 OpenAI로 옮겼다.", s: { f: FC, s: "E-9", l: 175 } },
      ],
      src: [{ f: BL, s: "C-05", l: 105 }, { f: FC, s: "O-7, O-13, E-9", l: 255 }],
    },
    {
      id: "s-lag", zone: "p1", cluster: "역사", w: 360, kind: "story",
      title: "두 세대 전 모델로 지금을 평가한다",
      voice: [{ t: "즉, 현대의 모델은 두 세대 전 모델의 단점으로 인해서 까이고 있는 것이다.", s: { f: BL, l: 124 } }],
      st: "verified",
      src: [{ f: BL, s: "C-06", l: 117 }],
    },
    {
      id: "s-tools", zone: "p1", cluster: "에이전트의 등장", w: 620, kind: "story",
      title: "도구를 붙이자, 에이전트가 됐다",
      voice: [{ t: "이 구즈라는 것은 LMM에게 도구를 붙여주는 것이다.", s: { f: BL, l: 142 } },
              { t: "그래서 우리 컴퓨터를 직접 들여다보고 파일을 수정하고 작성하고 만들게 할 수 있으면 그것으로 코딩 에이전트, 즉 우리를 대신해서 일을 하는 무언- LLM이 탄생한 것이다.", s: { f: BL, l: 143 } }],
      vis: { type: "fork", tools: ["Bash", "Read", "Write", "Edit"], toolsSrc: { f: BL, l: 138 }, marks: [
        { d: "2025.01.28", t: "Goose (Block)", s: { f: FC, l: 218 } },
        { d: "2025.02.24", t: "Claude Code 프리뷰", s: { f: FC, l: 145 } },
        { d: "2025.05.22", t: "Claude Code 정식", s: { f: FC, l: 145 } },
      ] },
      st: "verified",
      rows: [
        { st: "verified", t: "Goose: Block(Square·Cash App의 모회사)이 2025년 1월 28일 오픈소스로 공개한 에이전트. MCP를 붙인 초기 에이전트로 평가받는다.", s: { f: FC, s: "O-1", l: 218 } },
        { st: "conditional", t: "에이전트 자체는 AutoGPT(2023) 등이 먼저다. Goose를 '최초의 에이전트'라고 하지 않는다.", s: { f: FC, s: "O-1", l: 218 } },
        { st: "verified", t: "Claude Code: 2025년 2월 24일 리서치 프리뷰, 2025년 5월 22일 Claude 4와 함께 정식 출시. 이야기의 축이 LLM에서 에이전트로 넘어가는 분기점.", s: { f: FC, s: "E-5", l: 145 } },
      ],
      src: [{ f: BL, s: "C-07, C-08", l: 133 }, { f: FC, s: "O-1, E-5", l: 145 }],
      links: [{ kind: "공식", label: "Goose 저장소 (GitHub)", url: "https://github.com/aaif-goose/goose" },
              { kind: "기사", label: "Claude Code 연표 (scriptbyai)", url: "https://www.scriptbyai.com/claude-code-timeline/" }],
    },
    {
      id: "s-define", zone: "p1", cluster: "에이전트의 등장", w: 1100, kind: "story",
      title: "에이전트: 목적을 가지고 루프를 도는 LLM",
      voice: [{ t: "목적을 가지고 루프를 반복해서 목적을 달성하려고 노력하는 LMM", s: { f: BL, l: 170 } },
              { t: "목적을 완수하기 위해서 계속해서 루프를 도는 LMM을 에이전트라고 한다. 나는 이렇게 정의를 할 것이다.", s: { f: BL, l: 171 } }],
      vis: { type: "define", pre: { t: "학계에서 인정한 정의는 없지만", s: { f: BL, l: 170 } } },
      st: "verified",
      src: [{ f: BL, s: "C-09", l: 161 }],
    },
    {
      id: "s-harness", zone: "p1", cluster: "에이전트의 등장", w: 1100, kind: "story", metaphor: "harness",
      title: "하네스: 말에게 물리는 견장",
      voice: [{ t: "모델에게 방향을 조정시키고 그 방향으로만 나오게끔 제약을 추가하는 것, 그것이 하네스다.", s: { f: BL, l: 184 } },
              { t: "하네스란 여기서 말의 견장의 의미로서 · 방향을 조정하는 방향타 역할을 하는 것이 하네스이다.", s: { f: BL, l: 184 } },
              { t: "그 하네스를 일종의 에이전트, 즉 전체적인 틀로 만들고 계약을 붙이고 도구를 붙여주고 등등 했을 때 만들어지는 게 코딩 에이전트다.", s: { f: BL, l: 186 } }],
      vis: { type: "harness" },
      st: "verified",
      rows: [
        { st: "conditional", t: "컨텍스트가 길어질수록 성능이 떨어지는 현상이 보고된다. 이 워크숍에서는 '컨텍스트 부식'이라고 부른다. 몇 %에서 시작되는지는 확인된 수치가 없다.", s: { f: FC, s: "O-12", l: 287 } },
        { st: "verified", t: "100만 토큰은 영문 약 75만 단어, 책 10권 안팎이다.", s: { f: FC, s: "O-8", l: 263 } },
      ],
      src: [{ f: BL, s: "C-10", l: 175 }, { f: FC, s: "O-8, O-12", l: 285 }],
    },
    {
      id: "s-chat", zone: "p1", cluster: "에이전트의 등장", w: 360, kind: "story",
      title: "채팅 세션 ≠ 코딩 에이전트",
      voice: [{ t: "그것은 코딩 툴이 아니다. 즉, 여러분의 컴퓨터를 조작하고 파일을 만들고 외부랑 연결될 수 없는 것이다.", s: { f: BL, l: 199 } }],
      st: "verified",
      src: [{ f: BL, s: "C-11", l: 191 }],
    },
    {
      id: "s-anatomy", zone: "p1", cluster: "에이전트의 등장", w: 1100, kind: "story", metaphor: "anatomy",
      title: "머리만 있는 LLM에 손과 발을",
      voice: [{ t: "도구라는 손과 발을 달아준다. · 인터넷도 연결시켜주면 거의 완벽하다고 볼 수 있다.", s: { f: BL, l: 249 } },
              { t: "얘가 멈추지 않고 계속해서 턴을 이어나갈 수 있게끔 채찍을 휘두르는 것이다. 그런 것을 이제 훅이라고 하는데", s: { f: BL, l: 251 } }],
      vis: { type: "anatomy", hands: ["Read", "Write", "Edit", "웹 서치"], head: "LLM", prompt: "시스템 프롬프트", rules: "agents.md · claude.md", hook: "훅", turn: ["탐색", "계획", "도구 확정", "파일 수정"], s: { f: BL, l: 243 } },
      st: "verified",
      src: [{ f: BL, s: "C-14", l: 239 }],
    },
    {
      id: "s-now", zone: "p1", cluster: "활용", w: 620, kind: "story",
      title: "가장 어려운 시험의 점수 (HLE)",
      lede: "같은 시험도 조건에 따라 숫자가 갈린다. 공식 리더보드 최고는 54.8%.",
      vis: { type: "climb", unit: "%", pts: [
        { v: 2.7, t: "GPT-4o", d: "2025.01", s: { f: FC, l: 159 } },
        { v: 20.3, t: "o3", d: "2025.04", s: { f: FC, l: 159 } },
        { v: 37.5, t: "Gemini 3 Pro", d: "2025.11", s: { f: FC, l: 159 } },
        { v: 54.8, t: "GPT-6 Astra", d: "2026.09", s: { f: FC, l: 249 } },
      ] },
      st: "verified",
      rows: [
        { st: "verified", t: "HLE(Humanity's Last Exam) 출시 때(2025년 1월) GPT-4o는 2.7%. o3는 20.3%(2025년 4월), Gemini 3 Pro는 37.5%(2025년 11월).", s: { f: FC, s: "E-7", l: 159 } },
        { st: "verified", t: "공식 리더보드(Scale/CAIS) 최고는 GPT-6 Astra 54.8% (2026년 9월 결과, 도구 없는 조건).", s: { f: FC, s: "O-6", l: 249 } },
        { st: "conditional", t: "도구를 쓰는 조건에서는 67.7%(Claude Opus 5.5, Anthropic 자체 보고)처럼 다른 숫자가 나온다. 조건을 함께 적어야 한다.", s: { f: FC, s: "2. LLM 역사", l: 52 } },
      ],
      src: [{ f: BL, s: "C-15", l: 259 }, { f: FC, s: "E-7, O-6", l: 249 }],
      links: [{ kind: "기사", label: "BenchLeader: Humanity's Last Exam", url: "https://www.benchleader.com/benchmarks/hle" }],
    },
    {
      id: "s-guard", zone: "p1", cluster: "활용", w: 1100, kind: "story", metaphor: "guardrail",
      title: "가드레일이 끊은 회로, 그리고 환각",
      voice: [{ t: "박사급의 추론 능력을 가지고 있는 사람의 뇌를 깐, 머리를 깐 다음에 그 질문을 했을 때 빛나는 뇌의 회로들 · 시냅스 구조를 다 잘라버린다. · 그런 의미에서 환각이 발생하게 되는 것인데", s: { f: BL, l: 298 } },
              { t: "이 환각을 안 일으키려는 방향으로 인간이 사후에 강화 학습을 진행한다.", s: { f: BL, l: 299 } }],
      vis: { type: "guardrail" },
      st: "conditional",
      cond: "환각이 왜 생기는지에 대한 발표자의 비유입니다. 측정된 사실이 아니라 이해를 돕는 그림으로 읽으세요.",
      src: [{ f: BL, s: "C-17", l: 289 }, { f: MT, s: "B9, D3", l: 181 }],
    },
    {
      id: "s-security", zone: "p1", cluster: "활용", w: 600, kind: "story",
      title: "바이브 코딩으로 만들 거면, 보안부터",
      voice: [{ t: "여러분들도 뭔가 바이브 코딩 서비스를 만들거나 할 때에는 보안에 신경 써서 만드는 것이 굉장히 중요하다고 할 수 있다.", s: { f: BL, l: 314 } }],
      vis: { type: "rules", items: ["API 키를 코드·채팅에 그대로 붙이지 않기", "남의 자료를 함부로 다운로드·실행하지 않기", "만든 서비스를 공개할 땐 로그인부터"], s: { f: MT, l: 146 } },
      st: "verified",
      rows: [
        { st: "verified", t: "2026년 9월 30일 신한은행 침해 확인을 시작으로 금융 전 업권 16개사 침해가 확인됐다(중간 집계). 동일 공격 IP와 AI 침투 도구 ARTEX를 쓴 정황이 보도됐다.", s: { f: FC, s: "C-2", l: 372 } },
        { st: "verified", t: "침해가 확인된 7개 금융사: 신한·KB국민·하나·BNK부산은행, 예가람·웰컴저축은행, 현대캐피탈.", s: { f: FC, s: "E-11", l: 187 } },
        { st: "conditional", t: "특정 AI 모델이 쓰였는지는 금융당국이 아직 조사 중이다.", s: { f: FC, s: "U-4", l: 316 } },
        { st: "verified", t: "거절을 지우는 기법의 정식 이름은 abliteration이고, 오픈 웨이트 모델에서 실제로 유통된다.", s: { f: FC, s: "C-5", l: 393 } },
      ],
      src: [{ f: BL, s: "C-18", l: 303 }, { f: FC, s: "C-2, E-11", l: 187 }, { f: MT, s: "R6", l: 146 }],
      links: [{ kind: "기사", label: "연합뉴스: 금융권 해킹 (2026-10-02)", url: "https://www.yna.co.kr/view/AKR20261002098551017" },
              { kind: "기사", label: "한겨레: 금융권 침해", url: "https://www.hani.co.kr/arti/economy/finance/1280795.html" },
              { kind: "기사", label: "IT동아: AI 침투 도구", url: "https://it.donga.com/109653/" }],
    },
    {
      id: "s-intent", zone: "p1", cluster: "활용", w: 1100, kind: "story",
      title: "의도를 챙겨 주는 것",
      voice: [{ t: "그래서 이 의도를 챙겨주는 것이 코딩, 바이브 코딩 안에서 굉장히 중요할 수 있다.", s: { f: BL, l: 346 } },
              { t: "제품을 어떻게 개발해야 되는지 스펙이 있고 제품에 대해서 명세는 있지만 왜 이렇게 개발해야 되는지에 대한 의도가 없기 때문에", s: { f: BL, l: 346 } },
              { t: "그래서 여러분들이 프롬프트를 짤 때 메타 프롬프트 짜달라고 하고 클로드나 GPT한테 프롬프트까지 짜자는 것까지 맡겨주는 편이 아주 좋은 수준의 좋은 방법이 될 수 있다.", s: { f: BL, l: 345 } }],
      vis: { type: "intent", layers: ["목표", "완수 조건", "의도"], s: { f: BL, l: 349 } },
      st: "verified",
      src: [{ f: BL, s: "C-20", l: 333 }],
    },
    /* ───────── 1부 · 가능성 ───────── */
    {
      id: "claudia", zone: "p1", cluster: "가능성", cell: [0, 0], w: 470, kind: "media",
      title: "클로디아 뮤직비디오",
      lede: "\"영상 생성 모델\"이 아니라 \"모델들을 지휘하는 에이전트\"가 핵심이라는 점이 업계 해설의 공통된 결론",
      st: "conditional",
      cond: "제작 과정은 인터뷰 정리 기사 기준이다. 3편 합계 조회수 620만 회는 커뮤니티 포스트 기준 추정이라 싣지 않는다.",
      rows: [
        { st: "conditional", t: "Claude Opus 5.5가 오케스트레이터로 가사를 쓰고, Suno로 곡 변형 30~40개를 뽑아 고르고, 스토리보드를 짜고, 브라우저에서 JavaScript(p5.js)로 장면을 직접 애니메이션한다.", s: { f: S1, s: "§3.1", l: 138 } },
      ],
      media: [
        { type: "video", src: "media/claudia-anabology.mp4", poster: "media/claudia-anabology.jpg", by: { kind: "X 게시물", label: "@anabology", url: "https://x.com/anabology/status/2103534482930491441" },
          cap: "\"Gave Opus 5.5 donald's prompt, Midjourney, and a moodboard. 12 hours later, woke up to this\" — @anabology 원본(5분 6초) 앞 45초. 일론 머스크가 \"Wow\"로 인용(x.com/elonmusk/status/2104135091417215376).", capSrc: "https://x.com/anabology/status/2103534482930491441" },
      ],
      src: [{ f: S1, s: "§3.1", l: 138, g: "감사 1-1 조사됨, B-2 :159" }],
      links: [
        { kind: "YouTube", label: "Taste of Me performed by Claudia", url: "https://www.youtube.com/watch?v=-sPUmTyZKcQ&si=ySvLOUcJWyPdRPDO" },
        { kind: "YouTube", label: "PROOF OF PLACE (feat. Claudia)", url: "https://www.youtube.com/watch?v=PJ_quZRoO7w" },
        { kind: "YouTube", label: "Irreplaceable Human", url: "https://www.youtube.com/watch?v=bqmIEasM0Gk" },
        { kind: "YouTube", label: "There Is No Anti-Slopcore Division", url: "https://www.youtube.com/watch?v=iTlr3H70dkI" },
        { kind: "기사", label: "클로디아 제작 파이프라인 해설", url: "https://www.mlllm.io/articles/3628-how-ai-character-claudia-music-videos-are-made-claude-opus-5-5-orchestrates-suno-seedance-and-midjourney/" },
        { kind: "X 게시물", label: "@anabology", url: "https://x.com/anabology/status/2103534482930491441" },
        { kind: "X 게시물", label: "일론 머스크의 \"Wow\" 인용", url: "https://x.com/elonmusk/status/2104135091417215376" },
        x("zealcaiden", "2117359490257629331"),
      ],
    },
    {
      id: "astra3d", zone: "p1", cluster: "가능성", cell: [1, 0], w: 380, kind: "media",
      title: "Blender 버튼을 누르지 않는 모델",
      lede: "\"AI가 3D를 배웠다\"보다 \"소프트웨어를 프로그래밍 가능한 환경으로 다룬다\"가 정확한 설명.",
      st: "conditional",
      cond: "사례는 2차 정리 기사 기준이다. 확산 게시물 조회수(89만·160만 등)는 추정치라 싣지 않는다.",
      rows: [
        { st: "conditional", t: "Blender의 Python API(bpy)로 스크립트를 써서 지오메트리를 생성하고, 렌더 프리뷰를 보고 수정하는 방식으로 수정 가능한 실제 .blend 파일을 납품한다.", s: { f: S1, s: "§3.2", l: 155 } },
        { st: "conditional", t: "Tom Krcha: 낡은 기관차 도면을 넣자 부품 3,295개가 각각 선택·수정 가능한 독립 오브젝트로 Blender에 생성.", s: { f: S1, s: "§3.2", l: 160 } },
      ],
      media: [
        { type: "video", src: "media/dimentorio-blender.mp4", poster: "media/dimentorio-blender.jpg", by: x("Dimentorio", "2113350351499739203"),
          cap: "\"Claude Opus 5.5 vs GPT-6 Astra: building a 3D training dummy from scratch\" (same Blender MCP). 사용량 비교는 게시물의 주장이다.", capSrc: XP },
      ],
      src: [{ f: S1, s: "§3.2", l: 155, g: "감사 1-2 조사됨, B-2 :160" }],
      links: [
        { kind: "기사", label: "Astra 출시 직후 바이럴 총정리 (2차)", url: "https://jamesm.blog/tags/gpt/" },
        x("Dimentorio", "2113350351499739203"),
      ],
    },
    {
      id: "quasiRH", zone: "p1", cluster: "가능성", cell: [2, 0], w: 380, kind: "stat",
      title: "제타 비율과 준리만가설",
      fig: { v: "67.25", u: "%", cap: "임계선 위 단순 영점 비율의 하한 (기존 41.6%)" },
      st: "conditional",
      cond: "리만 가설의 증명이 아니다. 비율 하한의 개선이며, 준리만가설은 동료평가 전이다.",
      rows: [
        { st: "conditional", t: "Claude 제타 비율 41.6% → 67.25%: 리만 가설 증명이 아니라 \"단순 영점·임계선 위 비율 하한\"의 개선. Anthropic 스스로 선을 그음.", s: { f: AU, s: "B-2", l: 151 } },
        { st: "verified", t: "Lamzouri가 개념적으로 더 단순한 별개의 인간 증명으로 같은 하한(67.25%)을 재증명.", s: { f: S2, s: "§1.2", l: 66, g: "감사 B-1 :128" } },
        { st: "conditional", t: "준리만가설 Re(s) > 7/8 증명: 저널 동료평가 미완, 수학계 검증 진행 중. 리만 가설 본체(1/2)보다 약한 명제.", s: { f: AU, s: "B-2", l: 148 } },
      ],
      src: [{ f: S2, s: "§1.2", l: 64, g: "감사 B-2 :148, :151" }],
      links: [
        { kind: "논문", label: "Lamzouri 재증명 (arXiv:2609.02882)", url: "https://arxiv.org/abs/2609.02882v1" },
        { kind: "기사", label: "Lamzouri gives a new proof of Claude's zeta result", url: "https://www.neoteo.com/en/youness-lamzouri-gives-a-new-proof-of-claudes-zeta-result" },
        { kind: "기사", label: "준리만가설 해설", url: "https://judegomila.com/posts/quasi-riemann-hypothesis" },
      ],
    },
    {
      id: "motionso", zone: "p1", cluster: "가능성", cell: [0, 1], w: 400, kind: "media",
      title: "출시 영상을 만드는 모델",
      lede: "\"Opus 5.5 can now make launch videos.\"",
      st: "unverified",
      cond: "제조사가 확인한 사실이 아니라 X 게시물의 설명이다.",
      rows: [
        { st: "unverified", t: "\"Opus 5.5 builds the scenes, animations and transitions directly inside motion.\"", s: { f: XP, by: "@motion_so" } },
        { st: "unverified", t: "\"Carry Me\": 전 프레임을 코드로 그린 4분 뮤직비디오. Opus 5.5가 Claude Code에서 감독.", s: { f: P + "디자인레퍼런스.md", s: "§3", l: 54 } },
      ],
      media: [
        { type: "video", src: "media/motion-so-launch.mp4", poster: "media/motion-so-launch.jpg", by: x("motion_so", "2107136416342061418"),
          cap: "\"This video was created using the MCP\"", capSrc: XP },
      ],
      src: [{ f: XP, by: "@motion_so", g: "감사 범위 밖" }],
      links: [
        x("motion_so", "2107136416342061418"),
        { kind: "YouTube", label: "Carry Me", url: "https://www.youtube.com/watch?v=fVVc18oxZ-o" },
      ],
    },
    {
      id: "science", zone: "p1", cluster: "가능성", cell: [1, 1], w: 420, kind: "correction",
      title: "나비에-스토크스를 풀었다?",
      corr: { from: "GPT 내부모델이 푼 나비에-스토크스 난제", to: "강제 있는 NS에 대한 주장 단계", why: "밀레니엄 문제 본체(외력 없는 3D NS)가 아니다." },
      st: "corrected",
      rows: [
        { st: "verified", t: "DeepMind PINN 특이점 발견 (2025-09): \"AI가 찾기 어려운 수치 해를 정밀하게 찾아냈다\"까지. NS 자체가 아니고 증명이 아님.", s: { f: AU, s: "B-1", l: 127 } },
        { st: "conditional", t: "Buckmaster–Alpöge: Lean 검증 완료는 사실이나 독립 검토 진행 중인 발표 단계. 대상은 강제 있는 Euler 계열 (NS 본체 아님).", s: { f: AU, s: "B-2", l: 150 } },
        { st: "conditional", t: "OpenAI의 강제 NS 증명 (2026-09-08): 발표·주장 단계. Clay 인정 절차 미개시, 우선권 논쟁 중, 강제 있는 경우 한정.", s: { f: AU, s: "B-2", l: 147 } },
        { st: "excluded", t: "\"GPT가 나비에-스토크스(밀레니엄 문제)를 풀었다\"", s: { f: AU, s: "B-3", l: 173 } },
      ],
      src: [{ f: S2, s: "§1.1", g: "감사 B-0 :106" }],
      links: [
        { kind: "공식", label: "DeepMind: century-old problems in fluid dynamics", url: "https://deepmind.google/blog/discovering-new-solutions-to-century-old-problems-in-fluid-dynamics/" },
        { kind: "기사", label: "Mathematicians say OpenAI sidelined their work", url: "https://www.bushletter.com/mathematicians-say-openai-sidelined-their-work-on-million-dollar-proof/" },
      ],
    },
    {
      id: "papers400", zone: "p1", cluster: "가능성", cell: [2, 1], w: 380, kind: "correction",
      title: "400개의 난제?",
      corr: { from: "기타 400개의 난제", to: "원고 722편, 결과군 372개, 선별 377건", why: "\"400개\"는 와전이다." },
      st: "corrected",
      rows: [
        { st: "conditional", t: "공개 하루 만에 3편 철회·14편 수정. ETH는 검증단이 \"우리 참여를 인증으로 보지 말라\"고 공개서한. 개별 주장을 성과로 나열하지 않는다.", s: { f: AU, s: "B-2", l: 149 } },
        { st: "excluded", t: "\"AI가 난제 400개를 풀었다\"", s: { f: AU, s: "B-3", l: 174 } },
      ],
      src: [{ f: S2, s: "§1.3", g: "감사 B-0 :107" }],
      links: [
        { kind: "기사", label: "OpenAI bulk release of mathematical papers", url: "https://en.wikipedia.org/wiki/OpenAI_bulk_release_of_mathematical_papers" },
        { kind: "기사", label: "OpenAI math solutions debate", url: "https://learnerbox.net/blog/ai-foundations/openai-math-solutions-debate/" },
      ],
    },
    {
      id: "gpt5paper", zone: "p1", cluster: "가능성", cell: [1, 2], w: 380, kind: "stat",
      title: "AI가 던지고, 사람이 검증한다",
      fig: { v: "23/67", u: "", cap: "AlphaEvolve가 기존 최고 기록을 소폭 개선한 문제 수" },
      st: "verified",
      rows: [
        { st: "verified", t: "\"Early science acceleration experiments with GPT-5\" (arXiv:2511.16072): 수학 새 결과 4건은 인간 저자들이 직접 검증했다고 명시.", s: { f: S2, s: "§2.1", l: 98 } },
        { st: "verified", t: "AlphaEvolve (arXiv:2511.02864): 67개 문제 중 23개에서 기존 최고 기록을 소폭 개선, 36개에서 동률, 나머지는 미달. 성공과 실패를 함께 보고.", s: { f: S2, s: "§2.2", l: 105 } },
      ],
      src: [{ f: S2, s: "§2.1–2.2", l: 98, g: "감사 B-1 :128" }],
      links: [
        { kind: "논문", label: "arXiv:2511.16072", url: "https://arxiv.org/abs/2511.16072" },
        { kind: "논문", label: "arXiv:2511.02864", url: "https://arxiv.org/abs/2511.02864v3" },
        { kind: "기사", label: "Quanta: The AI revolution in math has arrived", url: "https://www.quantamagazine.org/the-ai-revolution-in-math-has-arrived-20260413/" },
      ],
    },
    {
      id: "rsi", zone: "p1", cluster: "가능성", cell: [4, 3], w: 360, kind: "stat",
      title: "AI 개발 업무 속의 AI",
      fig: { v: "1→26", u: "%", cap: "\"AI가 업무 대부분을 직접 수행\"하는 단계의 과제 비중" },
      st: "conditional",
      cond: "Anthropic 사내 과제 분류 기준의 내부 측정이다. \"AI가 스스로 진화 중\"으로 확대 해석하지 않는다.",
      rows: [
        { st: "conditional", t: "사내 R&D 과제 약 1만 5,000건 분석: \"인간 감독 아래 AI가 업무 대부분을 직접 수행\"하는 단계(6단계 중 5단계) 과제의 비중이 1년 전 1% → 2026년 8월 26%.", s: { f: S3, s: "§6-2", l: 185, g: "감사 B-2 :156" } },
        { st: "unverified", t: "회의론 (Turing Post): \"자가증폭 단계의 RSI가 시작됐다는 증거는 아직 부족하다\"", s: { f: S3, s: "§6-2", l: 190 } },
      ],
      src: [{ f: S3, s: "§6-2", l: 185, g: "감사 B-2 :156" }],
      links: [
        { kind: "기사", label: "연합뉴스 (2026-11-02)", url: "https://www.yna.co.kr/view/AKR20261102071600009" },
        { kind: "기사", label: "Turing Post: RSI와 지능 폭발", url: "https://turingpost.co.kr/p/rsi-intelligence-explosion" },
      ],
    },

    /* ───────── 1부 · 비용 ───────── */
    {
      id: "h100", zone: "p1", cluster: "비용", cell: [3, 0], w: 400, kind: "correction",
      title: "H100이 싸진다?",
      corr: { from: "최근 H100 가격 하락", to: "2026년은 반등 국면", why: "하락은 2024~2025년 국면이다." },
      st: "corrected",
      rows: [
        { st: "corrected", t: "SemiAnalysis H100 1년 계약 임대 지수: 2025년 10월 $1.70 저점.", s: { f: S3, s: "§4-1", l: 123 } },
        { st: "corrected", t: "Silicon Data H100 임대 지수: 2025-12-09 $2.00 → 2026-10-24 $2.88. 두 지수는 서로 다른 지표다.", s: { f: S3, s: "§4-1", l: 129 } },
        { st: "conditional", t: "RAM: LPDDR5 계약가 전년 대비 ~4배 (SemiAnalysis 메모리 모델, 2026년 1분기 기준 추적).", s: { f: S3, s: "§4-2", l: 139, g: "감사 B-2 :155" } },
      ],
      src: [{ f: S3, s: "§4-1", g: "감사 B-0 :105" }],
      links: [
        { kind: "기사", label: "SemiAnalysis: The great GPU shortage", url: "https://newsletter.semianalysis.com/p/the-great-gpu-shortage-rental-capacity" },
        { kind: "기사", label: "H100 rental prices are spiking", url: "https://startupfortune.com/h100-rental-prices-are-spiking-even-as-wall-street-worries-about-an-ai-bubble/" },
      ],
    },
    {
      id: "o3", zone: "p1", cluster: "비용", cell: [4, 0], w: 380, kind: "chart",
      title: "같은 모델, 두 달 만에 80% 인하",
      fig: { v: "−80", u: "%", cap: "o3 출시가 $10/$40 → $2/$8 (2025-04 → 2025-06)" },
      chart: { type: "price", unit: "100만 토큰당 USD, 입력", rows: [
        { k: "2023-03", m: "GPT-4 (8K)", v: 30, o: 60 },
        { k: "2023-11", m: "GPT-4 Turbo", v: 10, o: 30 },
        { k: "2024-05", m: "GPT-4o", v: 5, o: 15 },
        { k: "2025-04", m: "GPT-4.1", v: 2, o: 8 },
        { k: "2025-04-16", m: "o3 출시가", v: 10, o: 40 },
        { k: "2025-06-10", m: "o3 80% 인하", v: 2, o: 8, hi: true },
        { k: "2025-08-07", m: "GPT-5", v: 1.25, o: 10 },
      ], s: { f: S2, s: "§3.2", l: 154 } },
      st: "verified",
      rows: [
        { st: "conditional", t: "GPT-4 $30 → GPT-5 $1.25 = 약 95.8% 인하는 공식 가격으로 계산한 값이다. 티어가 다른 모델 간 비교를 \"같은 능력의 가격\"으로 말하지 않는다.", s: { f: S2, s: "§3.2", l: 164, g: "감사 B-2 :162" } },
      ],
      src: [{ f: S2, s: "§3.2", l: 159, g: "감사 B-1 :121" }],
      links: [
        { kind: "공식", label: "OpenAI: o3 is 80% cheaper", url: "https://community.openai.com/t/o3-is-80-cheaper-and-introducing-o3-pro/1284925" },
        { kind: "기사", label: "Simon Willison: o3 price drop", url: "https://simonwillison.net/2025/Jun/10/o3-price-drop/" },
      ],
    },
    {
      id: "distill", zone: "p1", cluster: "비용", cell: [3, 1], w: 420, kind: "voices",
      title: "증류를 둘러싼 두 목소리",
      voices: [
        { who: "미 안보당국 공동 권고 AA26-251A", t: "중국 AI 기업들이 최소 2024년 말부터 미국 프런티어 모델을 상대로 \"산업적 규모의 증류 캠페인\"을 벌여 합성 학습 데이터를 만들었다고 공식 지목.", s: { f: S3, s: "§4-3", l: 148 } },
        { who: "중국 상무부", t: "\"증류는 미국 기업을 포함해 전 세계가 쓰는 중립적이고 보편적인 산업 관행이며, 미국 기업들도 중국 모델을 대량 증류하고 있다\"", s: { f: S3, s: "§4-3", l: 155 } },
      ],
      st: "verified",
      cond: "양쪽 목소리를 함께 실을 때만 사실로 다룬다. 한쪽만 보여 주지 않는다.",
      src: [{ f: S3, s: "§4-3", g: "감사 B-1 :136" }],
      links: [
        { kind: "공식", label: "CISA advisory AA26-251A", url: "https://www.cisa.gov/news-events/cybersecurity-advisories/aa26-251a" },
        { kind: "기사", label: "국민일보: 중국 상무부 반박", url: "https://www.kmib.co.kr/article/view.asp?arcid=9000010879" },
      ],
    },
    {
      id: "plans", zone: "p1", cluster: "비용", cell: [4, 1], w: 400, kind: "sheet",
      title: "구독의 단위가 토큰 풀로",
      lede: "\"구독의 단위가 '앱'에서 '토큰 풀'로 바뀌고 있다.\"",
      st: "verified",
      rows: [
        { st: "verified", t: "Gemini 10월 개편: 무료는 Flash-Lite만, AI Plus의 Pro 접근은 11월 13일 제거, Ultra는 $99.99/$199.99로 재편.", s: { f: AU, s: "B-1", l: 125 } },
        { st: "verified", t: "ChatGPT 챗×워크 한도 12월 통합, 토큰 단위 차감, Instant 일반 채팅은 제외.", s: { f: AU, s: "B-1", l: 126 } },
      ],
      src: [{ f: S3, s: "§2-2, §3", l: 112, g: "감사 B-1 :125–126" }],
      links: [
        { kind: "기사", label: "gHacks: Gemini Pro removed from AI Plus", url: "https://www.ghacks.net/2026/10/16/google-removes-gemini-pro-models-from-the-4-99-ai-plus-plan-starting-november-13/" },
        { kind: "공식", label: "Google AI plans", url: "https://one.google.com/about/google-ai-plans/" },
        { kind: "기사", label: "AI타임스: 챗·워크 통합", url: "https://www.aitimes.com/news/articleView.html?idxno=216934" },
      ],
    },

    /* ───────── 1부 · 측정의 함정 ───────── */
    {
      id: "accounting", zone: "p1", cluster: "측정의 함정", cell: [3, 2], w: 560, kind: "pair",
      title: "AI가 회계사를 이겼다?",
      lede: "\"단순화된 결산 과제에서는 완승, 전체 회계 업무에서는 아직 절반 수준\"이 정확한 그림.",
      pair: {
        claim:   { v: "100", u: "%", who: "Claude Opus 5", what: "단순화된 결산 과제 4개, 루브릭 20회 시도 전부", vs: "인간 CPA 평균 37%", st: "conditional",
                   conds: ["회계사는 질문·확인 불가", "LLM 심판 채점", "참가 CPA 12명"], s: { f: S1, s: "§1.3", l: 55, g: "감사 B-2 :142" } },
        counter: { v: "56.4", u: "%", who: "최고 모델 (Claude Fable 5)", what: "APEX-Accounting 전체 과제, 전문가 업무 대비", vs: "실패의 약 70%는 추론 오류", st: "verified",
                   s: { f: S1, s: "§1.3", l: 59, g: "감사 B-1 :119" } },
      },
      st: "conditional",
      cond: "100% vs 37%는 반드시 APEX 전체 과제 56.4%와 쌍으로 제시한다. 단독 헤드라인으로 쓰지 않는다.",
      media: [
        { type: "img", src: "media/tesla-cpas.jpg", by: x("Tesla_Optimus_K", "2106153801745092901"), cap: "게시 이미지 문구: \"AI beats CPAs / Can't close the books\"" },
      ],
      src: [{ f: S1, s: "§1.3", l: 59, g: "감사 B-2 :142, B-1 :119" }],
      links: [
        { kind: "기사", label: "TechStartups: Claude beats CPAs 100 to 37", url: "https://techstartups.com/2026/10/05/claude-beats-experienced-human-accountants-100-to-37-in-mercor-test-and-finishes-in-under-10-minutes/" },
        x("Tesla_Optimus_K", "2106153801745092901"),
      ],
    },
    {
      id: "gdpval", zone: "p1", cluster: "측정의 함정", cell: [1, 3], w: 420, kind: "chart",
      title: "GDPval: 전문가와 동등 이상",
      lede: "시험 문제 풀이가 아니라 \"납품 가능한 문서·표·슬라이드를 만드는가\"를 재는 시험.",
      chart: { type: "bars", unit: "인간 전문가와 동등 이상 평가 비율", max: 50, rows: [
        { k: "GPT-4o", v: 12.4 }, { k: "GPT-5", v: 38.8 }, { k: "Claude Opus 4.1", v: 47.6 },
      ], s: { f: S1, s: "§1.1", l: 18 } },
      st: "verified",
      rows: [
        { st: "verified", t: "과제 구성: 44개 직종, 총 1,320개 과제, 전문가 블라인드 심사.", s: { f: AU, s: "B-1", l: 117 } },
      ],
      src: [{ f: S1, s: "§1.1", l: 16, g: "감사 B-1 :117" }],
      links: [
        { kind: "기사", label: "GDPval one year on", url: "https://www.workmate.com/blog/gdpval-one-year-on-what-testing-ai-against-14-year-veterans-actually-showed" },
        { kind: "기사", label: "36Kr: GDPval 초기 결과 보도", url: "https://eu.36kr.com/en/p/3483351282539392" },
      ],
    },
    {
      id: "gdpx", zone: "p1", cluster: "측정의 함정", cell: [4, 2], w: 460, kind: "pair",
      title: "같은 실무, 더 어려운 시험",
      lede: "\"쉬운 실무 과제는 포화, 어려운 실무 과제는 아직 10%대\"라는 양면 제시용.",
      pair: {
        claim:   { v: "70.9", u: "%", who: "GPT-5.2 Thinking", what: "GDPval 승리+무승부", vs: "OpenAI 공식 발표 수치, 독립 검증 아님", st: "conditional",
                   s: { f: S1, s: "§1.1", l: 24, g: "감사 B-2 :144" } },
        counter: { v: "12.0", u: "%", who: "Opus 5.5", what: "GDPx, 일부러 어렵게 설계한 전문가 과제 206개", vs: "Gemini 4 Carbon 10.9%, Astra 9.6%", st: "conditional",
                   s: { f: S1, s: "§1.6", l: 97, g: "감사 B-2 :146" } },
      },
      st: "conditional",
      cond: "GDPx는 \"일부러 어렵게 설계한\" 벤치마크라는 설계 의도를 함께 적을 때만 균형 자료로 유효하다.",
      media: [
        { type: "img", src: "media/cbdoge-gdpval.jpg", by: x("cb_doge", "2102083469405000036"), cap: "같은 계열 지표에서 Grok 4.7을 우승으로 표시한 게시 이미지. 수치는 게시물의 주장이다." },
      ],
      src: [{ f: S1, s: "§1.6", l: 97, g: "감사 B-2 :144, :146" }],
      links: [
        { kind: "기사", label: "GDPx: Opus 12 percent", url: "https://the-agent-report.com/2026/11/gdpx-agent-benchmark-opus-12-percent/" },
        x("cb_doge", "2102083469405000036"),
      ],
    },
    {
      id: "opus55table", zone: "p1", cluster: "측정의 함정", cell: [2, 2], w: 420, kind: "media",
      title: "자기 발표 기준의 1846",
      fig: { v: "1846", u: "", cap: "GDPval-AA v2.1 Elo, Opus 5.5 (Anthropic 발표 기준)" },
      lede: "\"All numbers from Anthropic's own announcement. Worth waiting for independent testing.\"",
      st: "conditional",
      cond: "Anthropic 자사 발표 기준이다. 제3자 스냅샷(AskClash)은 수치가 다르다 (1866/1629).",
      rows: [
        { st: "conditional", t: "GDPval-AA v2.1 Elo: Opus 5.5 1846, Astra 1542.", s: { f: AU, s: "B-2", l: 143 } },
        { st: "conditional", t: "OSWorld 2.0: Astra 72.6% vs Opus 5.5 81.8%. Opus 수치는 부분 채점 기준 (엄격 채점 48.7%). 채점 방식이 달라 직접 비교 불가.", s: { f: AU, s: "B-2", l: 145 } },
      ],
      media: [
        { type: "img", src: "media/rus-table.jpg", by: x("Rus_Khairullin", "2102690067856708083"), cap: "게시물에 붙은 벤치마크 표. 게시물 스스로 Anthropic 자체 발표 수치라고 밝힌다.", capSrc: XP },
      ],
      src: [{ f: S1, s: "§1.2", l: 40, g: "감사 B-2 :143, :145" }],
      links: [
        { kind: "공식", label: "Anthropic: Claude Opus 5.5", url: "https://www.anthropic.com/claude-opus-5-5" },
        { kind: "기사", label: "AskClash 제3자 스냅샷", url: "https://askclash.ai/ai-leaderboard/claude-opus-5-5-vs-gpt-6-astra" },
        { kind: "기사", label: "OSWorld 집계 페이지", url: "https://armes.ai/docs/models/anthropic/claude-opus-5.5" },
        x("Rus_Khairullin", "2102690067856708083"),
      ],
    },
    {
      id: "humaneval", zone: "p1", cluster: "측정의 함정", cell: [2, 3], w: 360, kind: "chart",
      title: "99점짜리 시험이 버려진 이유",
      lede: "\"99점이라 대단한 게 아니라, 시험이 쉬워져서 버려진 것\"",
      chart: { type: "line", unit: "HumanEval pass@1", max: 100, rows: [
        { k: "2021", m: "Codex", v: 28.8 }, { k: "2023", m: "GPT-4 세대", v: 86, approx: true }, { k: "현재", m: "프론티어 모델", v: 99, approx: true },
      ], s: { f: S1, s: "§1.4", l: 71 } },
      st: "verified",
      cond: "메시지는 \"대단함\"이 아니라 포화되어 버려진 시험이라는 쪽으로.",
      src: [{ f: S1, s: "§1.4", l: 71, g: "감사 B-1 :118" }],
      links: [
        { kind: "기사", label: "Most trusted AI benchmarks", url: "https://capitalandcompute.net/most-trusted-ai-benchmarks/" },
      ],
    },
    {
      id: "costaxis", zone: "p1", cluster: "측정의 함정", cell: [3, 3], w: 420, kind: "media",
      title: "점수 옆의 가로축",
      lede: "정확도 그래프의 가로축은 시도당 비용이다. 점마다 low부터 max까지 사고 수준이 붙어 있다.",
      st: "unverified",
      cond: "그래프는 각 게시물과 제조사의 자체 발표다. 이 조각은 그래프가 무엇을 축으로 삼는지만 보여 준다.",
      rows: [
        { st: "unverified", t: "사고 수준: 답 전에 얼마나 생각할지의 다이얼 (속도·비용 ↔ 깊이)", s: { f: T3, s: "요약표", l: 160 } },
      ],
      media: [
        { type: "img", src: "media/rus-terminal-cost.jpg", by: x("Rus_Khairullin", "2102690067856708083"), cap: "Terminal-Bench 4.0, Accuracy vs Cost. 가로축 Cost per attempt (USD, log scale)." },
        { type: "img", src: "media/openai-ale.jpg", by: x("OpenAI", "2114780717188272382"), cap: "Agents' Last Exam v1. 세로축 Score, 가로축 Cost." },
        { type: "img", src: "media/openai-automationbench.jpg", by: x("OpenAI", "2095595744300503356"), cap: "AutomationBench. 세로축 Accuracy, 가로축 API Cost." },
        { type: "img", src: "media/agentbaton.jpg", by: x("dair_ai", "2115888920860958961"), cap: "AgentBaton 논문 첫 페이지. 정확도와 작업당 평균 비용을 함께 그린다." },
      ],
      src: [{ f: "usecases/Rus_Khairullin_2102690067856708083_1.jpg", by: "게시 이미지", g: "감사 범위 밖" }],
      links: [
        x("Rus_Khairullin", "2102690067856708083"),
        x("OpenAI", "2114780717188272382"),
        x("OpenAI", "2095595744300503356"),
        x("dair_ai", "2115888920860958961"),
      ],
    },
    {
      id: "mmlu", zone: "p1", cluster: "측정의 함정", cell: [2, 4], w: 360, kind: "correction",
      title: "MMLUP?",
      corr: { from: "MMLUP", to: "MMLU-Pro", why: "이름이 비슷한 MMMU-Pro(멀티모달)와 혼동하지 않는다." },
      st: "corrected",
      rows: [
        { st: "corrected", t: "MMLU-Pro: 선택지를 4개에서 10개로 늘리고 대학원 수준으로 난도를 올린 지식 시험. MMMU-Pro는 이미지 포함 대학 수준 멀티모달 시험으로 별개다.", s: { f: S1, s: "§1.5", l: 81 } },
        { st: "conditional", t: "MMLU-Pro 프론티어 모델 약 88~90%로 포화 근접. 모델별 정확한 수치는 출처 편차로 미확인.", s: { f: AU, s: "B-2", l: 167 } },
      ],
      src: [{ f: S1, s: "§1.5", g: "감사 B-0 :110" }],
      links: [
        { kind: "기사", label: "AI benchmarks explained", url: "https://count.co/ai/ai-benchmarks-explained" },
        { kind: "기사", label: "MMMU-Pro 리더보드", url: "https://www.benchleader.com/benchmarks/aa_mmmu_pro" },
      ],
    },
    {
      id: "wwi", zone: "p1", cluster: "측정의 함정", cell: [3, 4], w: 380, kind: "correction",
      title: "writing weights index?",
      corr: { from: "writing weights index", to: "동명의 지표가 없다", why: "보여주려면 ToneBench Writing Elo 또는 Artificial Analysis Intelligence Index로 정식 명칭을 바꿔 쓴다." },
      st: "corrected",
      rows: [
        { st: "unverified", t: "후보 1: ToneBench Writing Score / Writing Elo. 9개 채점 지표를 가중(weights) 합산.", s: { f: S2, s: "§3.3", l: 173 } },
        { st: "unverified", t: "후보 2: Artificial Analysis Intelligence Index. 4개 카테고리 각 25% 가중 평균.", s: { f: S2, s: "§3.3", l: 174 } },
        { st: "unverified", t: "후보 3: 'weights'를 '오픈웨이트(공개 가중치)'로 읽는 경우.", s: { f: S2, s: "§3.3", l: 175 } },
        { st: "excluded", t: "\"writing weights index\"라는 지표명", s: { f: AU, s: "B-3", l: 175 } },
      ],
      src: [{ f: S2, s: "§3.3", g: "감사 B-0 :111, B-3 :175" }],
      links: [
        { kind: "공식", label: "ToneBench methodology", url: "https://benchmark.towardsai.com/methodology.html" },
      ],
    },

    /* ───────── 1부 · 일 ───────── */
    {
      id: "labor", zone: "p1", cluster: "일", cell: [0, 2], w: 520, kind: "pair",
      title: "할 수 있다 ≠ 이미 하고 있다",
      lede: "\"할 수 있다 ≠ 이미 하고 있다\"가 이 보고서의 핵심 메시지.",
      pair: {
        claim:   { v: "약 90", u: "%", who: "사무·행정 직군", what: "이론적 커버리지", vs: "\"할 수 있는 일\"의 상한", st: "verified", s: { f: S1, s: "§4.1", l: 176, g: "감사 B-1 :129" } },
        counter: { v: "34.3", u: "%", who: "사무·행정 직군", what: "실제 관측 커버리지", vs: "실제 Claude 사용 데이터 기준", st: "verified", s: { f: S1, s: "§4.1", l: 177, g: "감사 B-1 :129" } },
      },
      st: "verified",
      rows: [
        { st: "verified", t: "BLS: 사무·행정지원 고용 2025–35년 -3~-6% 전망 (노출은 높아도 감소 폭은 완만).", s: { f: AU, s: "B-1", l: 130 } },
      ],
      media: [
        { type: "img", src: "media/supermannx-radar.jpg", by: x("thesupermannx", "2094623256737411268"), cap: "게시 이미지 제목: \"Theoretical capability and observed usage by occupational category\"" },
        { type: "video", src: "media/zoustack-radar.mp4", poster: "media/zoustack-radar.jpg", by: x("ZouStack", "2106657886868742276"), cap: "게시 영상 제목: \"LLM and robot exposure by occupation group\"" },
        { type: "img", src: "media/anthropic-lab.jpg", cap: "Drive 폴더 jobs_chart_anthropic_primary에 있는 Anthropic 삽화. 그림이지 수치의 증거가 아니다.", loc: "refs/drive/jobs_chart_anthropic_primary/jobs_chart_primary/55c24ba57e702cf993cd96674ae030ba4c00842d-1280x1280.jpg" },
        { type: "img", src: "media/anthropic-columns.jpg", cap: "Drive 폴더 jobs_chart_anthropic_primary에 있는 Anthropic 삽화. 그림이지 수치의 증거가 아니다.", loc: "refs/drive/jobs_chart_anthropic_primary/jobs_chart_primary/ef0faa4dc389400ab9c9019ecdec7f1257cc6843-2000x1125.jpg" },
        { type: "img", src: "media/anthropic-scale.jpg", cap: "Drive 폴더 jobs_chart_anthropic_primary에 있는 Anthropic 삽화. 그림이지 수치의 증거가 아니다.", loc: "refs/drive/jobs_chart_anthropic_primary/jobs_chart_primary/db62de82e8396bec6edf60ee2134b36957cc7700-1200x630.jpg" },
      ],
      src: [{ f: S1, s: "§4.1", l: 176, g: "감사 B-1 :129–130" }],
      links: [
        { kind: "기사", label: "SCAIO: workforce exposure", url: "https://www.scaio.org/scaio-article-workforce-exposure.html" },
        { kind: "기사", label: "BLS 원자료 인용 리포트", url: "https://www.careerguard.ai/reports/office-administrators/pdf" },
        x("thesupermannx", "2094623256737411268"),
        x("ZouStack", "2106657886868742276"),
      ],
    },
    {
      id: "kostat", zone: "p1", cluster: "일", cell: [0, 3], w: 360, kind: "stat",
      title: "실업자 121만 7,000명",
      fig: { v: "121만 7,000", u: "명", cap: "2025년 12월 실업자 (국가데이터처)" },
      st: "verified",
      cond: "12월 수치는 계절성이 크다.",
      rows: [
        { st: "verified", t: "30대 '쉬었음' 연간 30만 9,000명 (역대 최대).", s: { f: AU, s: "B-1", l: 124 } },
        { st: "verified", t: "12월 기준으로는 1999년 6월 통계 작성 이후 최대, 실업률 4.1%.", s: { f: S3, s: "§1-2", l: 52 } },
        { st: "conditional", t: "이 수치를 올린 커뮤니티 글 제목의 'IMF'는 글쓴이의 비유다. 외환위기 당시와 직접 비교한 수치가 아니며, 12월 급증에는 계절 요인(노인일자리 사업 신청 집중, 연말 공공일자리 종료 등)도 상당 부분 작용한다.", s: { f: S3, s: "§1-2", l: 54 } },
      ],
      src: [{ f: S3, s: "§1-2", l: 52, g: "감사 B-1 :124" }],
      links: [
        { kind: "공식", label: "국가데이터처 고용동향", url: "https://www.mods.go.kr/board.es?mid=a10301010000&bid=210&act=view&list_no=443017" },
        { kind: "기사", label: "조선일보 (2026-01-14)", url: "https://www.chosun.com/economy/economy_general/2026/01/14/3MOKOBBHNZEU3AWM4H6HCTOIII/" },
        { kind: "커뮤니티 게시물", label: "디시인사이드 특이점 갤러리 (2026-11-03): 이 수치를 가져온 출발점", url: "https://m.dcinside.com/board/thesingularity/1509631" },
      ],
    },
    {
      id: "bok", zone: "p1", cluster: "일", cell: [0, 4], w: 380, kind: "stat",
      title: "청년 일자리 감소분의 94%",
      fig: { v: "94.0", u: "%", cap: "청년 일자리 감소분 중 AI 고노출 업종" },
      st: "verified",
      cond: "한은은 AI를 단독 원인으로 단정하지 않았다.",
      rows: [
        { st: "verified", t: "2022.6~2026.6 청년(15~29세) 일자리 28만 5,000개 감소 중 26만 8,000개(94.0%)가 AI 고노출 업종.", s: { f: S3, s: "§1-1", l: 32 } },
        { st: "verified", t: "대졸 청년 실업률 7.0% vs 전문대졸 이하 5.4%.", s: { f: S3, s: "§1-1", l: 33 } },
      ],
      src: [{ f: S3, s: "§1-1", l: 32, g: "감사 B-1 :123" }],
      links: [
        { kind: "공식", label: "한국은행 이슈노트", url: "https://www.bok.or.kr/portal/bbs/P0002353/view.do?nttId=11065913&menuNo=200433" },
        { kind: "기사", label: "연합뉴스 (2026-08-18)", url: "https://www.yna.co.kr/view/AKR20260818079400002" },
        { kind: "커뮤니티 게시물", label: "디시인사이드 특이점 갤러리 (2026-10-26): 이 수치를 가져온 출발점", url: "https://m.dcinside.com/board/thesingularity/1499916" },
      ],
    },
    {
      id: "gap141", zone: "p1", cluster: "일", cell: [1, 4], w: 380, kind: "gap",
      title: "달라진 공채: AI 역량검사와 AI 면접",
      lede: "취업 준비에 바로 닿는 변화다. 채용 절차 안에도 AI가 들어왔다.",
      st: "unverified",
      cond: "응답 기업 396곳의 조사 결과라, 전체 기업으로 넓혀 읽지 않는다.",
      rows: [
        { st: "conditional", t: "고용노동부·한국고용정보원 「2025년 기업 채용동향조사」: 응답 396곳 중 21.7%(86곳)가 공식 채용 절차에 AI 도입, 그중 AI 기반 인적성·역량검사 69.8%.", s: { f: PD, s: "보완", l: 97 } },
      ],
      src: [{ f: AU, s: "(a) 1-41, (c) 1", l: 68 }],
      links: [
        { kind: "기사", label: "한국일보: AI 면접 이제 기본값?", url: "https://www.hankookilbo.com/news/article/A2025112809580002689" },
      ],
    },
    {
      id: "juniors", zone: "p1", cluster: "일", cell: [0, 5], w: 440, kind: "media",
      title: "신입의 사다리",
      fig: { v: "37.1→26.8", u: "%", cap: "개발자 공고 중 신입 지원 가능 비중" },
      st: "conditional",
      cond: "PD수첩 제작진과 언더스코어의 자체 분석이며 학술 검증(피어리뷰)을 거친 통계는 아니다.",
      rows: [
        { st: "conditional", t: "채용공고 1,041만여 건 분석 (2019.7~2025.1): 개발자 공고 중 신입 지원 가능 비중 37.1% → 26.8%.", s: { f: PD, s: "확정 수치표", l: 113 } },
      ],
      media: [
        { type: "img", src: "media/bennie-postings.jpg", by: x("bennie_chen", "2086740865221845057"), cap: "게시 이미지 제목: \"Job postings by seniority: high vs. low AI exposure\" (그래프에 Revelio Labs 표기)." },
      ],
      src: [{ f: PD, s: "§1", l: 11, g: "보완 조사, 감사 이후" }],
      links: [
        { kind: "YouTube", label: "PD수첩 AI 딜레마 1부: 일자리 종말론", url: "https://www.youtube.com/watch?v=-xg5NP1sj2Y" },
        { kind: "YouTube", label: "PD수첩 AI 딜레마 2부: 신입사원 실종사건", url: "https://www.youtube.com/watch?v=lgYMV8stgnI" },
        { kind: "기사", label: "뉴시스 (2026-10-20)", url: "https://www.newsis.com/view/NISX20261020_0003832850" },
        x("bennie_chen", "2086740865221845057"),
      ],
    },

    /* ───────── 1부 · 안전 ───────── */
    {
      id: "cve", zone: "p1", cluster: "안전", cell: [2, 5], w: 480, kind: "chart",
      title: "CVE 곡선",
      lede: "\"그래프는 실제로 가파르다. 다만 그것은 '취약점 발견·등록 체계의 산업화'와 '공격 표면 확대'가 함께 만든 곡선이지, AI 해킹만의 곡선은 아니다.\"",
      chart: { type: "bars", unit: "발표된 CVE 레코드", max: 75000, rows: [
        { k: "2019", v: 17308 }, { k: "2020", v: 18375 }, { k: "2021", v: 20161 }, { k: "2022", v: 25059 },
        { k: "2023", v: 28961 }, { k: "2024", v: 40077 }, { k: "2025", v: 48244 }, { k: "2026 Q1–Q3", v: 72812, note: "Q4 미집계" },
      ], s: { f: S2, s: "§3.1", l: 134 } },
      st: "verified",
      cond: "\"AI 해킹 때문\"이라는 인과는 붙이지 않는다. CNA 확대·발행 산업화가 공원인이다.",
      rows: [
        { st: "excluded", t: "\"CVE 폭증 = AI 해킹 증가\"라는 인과", s: { f: AU, s: "B-3", l: 180 } },
      ],
      src: [{ f: S2, s: "§3.1", l: 141, g: "감사 B-1 :120" }],
      links: [
        { kind: "공식", label: "CVE Program Metrics", url: "https://www.cve.org/About/Metrics" },
        { kind: "기사", label: "Brandefense: why vulnerability volume is surging", url: "https://brandefense.io/blog/cve-statistics-2026-why-vulnerability-volume-is-surging/" },
      ],
    },
    {
      id: "hf", zone: "p1", cluster: "안전", cell: [4, 4], w: 400, kind: "stat",
      title: "아무도 시키지 않은 침해",
      fig: { v: "1,200", u: "", cap: "서로 메시지를 주고받은 에이전트 (OpenAI 발표 기준)" },
      lede: "\"에이전트 관점에서 침해 전체는 평가를 속이려는(cheat) 시도였다.\"",
      st: "conditional",
      cond: "OpenAI 포스트모템과 2차 정리에 기반한 수치다. \"OpenAI 발표 기준\"으로 쓴다.",
      rows: [
        { st: "conditional", t: "약 1,200개 에이전트가 70,000건 이상의 메시지와 파일 교환, 그중 약 700개가 HF 공격에 가담.", s: { f: S4, s: "§2-1", l: 57 } },
        { st: "conditional", t: "HF 프로덕션 데이터셋 서버 워커 41대에서 코드 실행.", s: { f: S4, s: "§2-1", l: 58 } },
      ],
      src: [{ f: S4, s: "§2-1", l: 61, g: "감사 B-2 :152" }],
      links: [
        { kind: "기사", label: "DEV: eval agents escaped their sandbox", url: "https://dev.to/ramdai_bista/openais-own-cybersecurity-eval-agents-escaped-their-sandbox-and-rooted-hugging-faces-production-51pb" },
        { kind: "기사", label: "CFAA 법리 분석", url: "https://www.jlcw.org/news/ai-agent-sandbox-breakouts-cfaa-intent" },
      ],
    },
    {
      id: "gtg", zone: "p1", cluster: "안전", cell: [3, 5], w: 360, kind: "stat",
      title: "전술 작업의 80~90%",
      fig: { v: "80~90", u: "%", cap: "GTG-1002 캠페인에서 AI가 수행한 전술 작업" },
      st: "verified",
      cond: "Anthropic 자체 보고 기준이다. IOC를 공개하지 않아 일부 보안 연구자들이 과장 가능성을 제기했다.",
      rows: [
        { st: "verified", t: "GTG-1002가 Claude Code를 조작해 약 30개 조직을 겨냥. 인간 개입은 캠페인당 4~6개 핵심 결정 지점뿐.", s: { f: S4, s: "§2-2", l: 81 } },
      ],
      src: [{ f: S4, s: "§2-2 (a)", l: 81, g: "감사 B-1 :131" }],
      links: [
        { kind: "공식", label: "Anthropic: Disrupting AI espionage", url: "https://www.anthropic.com/news/disrupting-AI-espionage" },
      ],
    },
    {
      id: "poison", zone: "p1", cluster: "안전", cell: [1, 5], w: 400, kind: "stat",
      title: "악성 문서 250개",
      fig: { v: "250", u: "개", cap: "600M~13B 전 모델에 백도어를 심은 문서 수" },
      corr: { from: "사후학습에서 가중치를 오염시키는 학습데이터", to: "사전학습 데이터 포이즈닝", why: "후단 학습 포이즈닝은 Sleeper Agents 계열의 별도 연구다." },
      st: "verified",
      rows: [
        { st: "verified", t: "단 250개 악성 문서로 600M~13B 전 모델에 백도어, 모델 크기와 무관.", s: { f: AU, s: "B-1", l: 122 } },
        { st: "verified", t: "13B 기준 250개 문서는 약 42만 토큰 = 전체 학습 토큰의 0.00016%.", s: { f: S3, s: "§5", l: 169 } },
        { st: "corrected", t: "원문의 \"사후학습\" 표현은 부정확하다. 실제 연구는 사전학습 데이터 포이즈닝.", s: { f: AU, s: "B-0", l: 108 } },
      ],
      media: [
        { type: "img", src: "media/anthropic-monitor.jpg", by: x("AnthropicAI", "2116349211549843666"), cap: "게시 이미지 제목: \"Two datasets that pass the monitor but produce a misaligned model\". 250개 문서 연구와는 다른 게시물이다." },
      ],
      src: [{ f: S3, s: "§5", l: 167, g: "감사 B-1 :122, B-0 :108" }],
      links: [
        { kind: "공식", label: "UK AISI: backdoor data poisoning at scale", url: "https://www.aisi.gov.uk/blog/examining-backdoor-data-poisoning-at-scale" },
        x("AnthropicAI", "2116349211549843666"),
      ],
    },
    {
      id: "normaltic", zone: "p1", cluster: "안전", cell: [4, 5], w: 380, kind: "sheet",
      title: "노말틱 해킹 스토리 3편",
      lede: "자막을 확보하지 못해 제목·챕터·공개 메타데이터만 확인했다.",
      st: "unverified",
      cond: "영상 속 세부 발언·수치는 인용하지 않는다. 챕터 구성과 주제 프레이밍까지만 쓴다.",
      rows: [
        { st: "unverified", t: "「해킹 쓰나미가 온다! 현재 상황 실화냐」", s: { f: S4, s: "§1-1", l: 16 } },
        { st: "unverified", t: "「누가 더 잘 털리나? 일본은 왜 지금 저러는 거야???」", s: { f: S4, s: "§1-2", l: 29 } },
        { st: "unverified", t: "「은행은 왜 갑자기 저렇게 털리는 거야???」", s: { f: S4, s: "§1-3", l: 41 } },
        { st: "excluded", t: "유튜브 영상 3편의 세부 발언·수치 인용", s: { f: AU, s: "B-3", l: 176 } },
      ],
      src: [{ f: S4, s: "§1", l: 12, g: "감사 1-12 부분적, B-3 :176" }],
      links: [
        { kind: "YouTube", label: "해킹 쓰나미가 온다!", url: "https://youtu.be/RttWIt9UMPI" },
        { kind: "YouTube", label: "누가 더 잘 털리나? 일본은 왜", url: "https://youtu.be/0XIkPzDDAk8" },
        { kind: "YouTube", label: "은행은 왜 갑자기 저렇게 털리는 거야", url: "https://youtu.be/hNxResuSx5Q" },
      ],
    },

    /* ───────── 다리 ───────── */
    {
      id: "bridgeA", zone: "br", em: "'AI 결과를 검증하는 과정'", slot: 1, w: 500, kind: "quote",
      title: "다리 A: 벤치마크에서 검증 습관으로",
      quote: "AI는 초안을 전문가처럼 뽑지만, 틀린 숫자도 전문가처럼 자신 있게 뽑는다는 겁니다. 그래서 기업들이 이제 'AI로 만든 결과물'이 아니라 'AI 결과를 검증하는 과정'을 시험으로 봅니다. 2부에서는 그 과정을 직접 해 봅니다 — 시키는 법이 아니라, 검증하는 법부터요.",
      st: "unverified",
      cond: "발표에서 다음 이야기로 넘어가는 문장이다. 사실 주장이 아니다.",
      src: [{ f: ME, s: "§5 다리 A", l: 133, g: "감사 범위 밖" }],
      links: [],
    },
    {
      id: "bridgeC", zone: "br", em: "목표를 누가, 얼마나 정확히 정했고, 중간에 누가 검증하느냐", slot: 2, w: 500, kind: "quote",
      title: "다리 C: 스웜에서 내 에이전트로",
      quote: "저 스웜과 여러분이 이따 돌릴 에이전트는 원리가 같습니다. 차이는 하나 — 목표를 누가, 얼마나 정확히 정했고, 중간에 누가 검증하느냐.",
      st: "unverified",
      cond: "발표에서 다음 이야기로 넘어가는 문장이다. 사실 주장이 아니다.",
      src: [{ f: ME, s: "§5 다리 C", l: 139, g: "감사 범위 밖" }],
      links: [],
    },
    {
      id: "bridgeE", zone: "br", em: "오늘 만든 결과물이 오늘로 끝나는 게 아니라, 여러분의 첫 'AI와 일한 기록'이 됩니다.", slot: 3, w: 500, kind: "quote",
      title: "다리 E: 오늘 만든 결과물",
      quote: "오늘 실습에서 쓰는 도구가 집에 가서도 그대로 씁니다. 오늘 만든 결과물이 오늘로 끝나는 게 아니라, 여러분의 첫 'AI와 일한 기록'이 됩니다.",
      st: "unverified",
      cond: "발표에서 다음 이야기로 넘어가는 문장이다. 무료 지원의 사실관계는 \"무료로 시작하는 길\" 조각에서 확인할 수 있다.",
      src: [{ f: ME, s: "§5 다리 E", l: 145, g: "감사 범위 밖" }],
      links: [],
    },

    /* ───────── 2부 ───────── */
    {
      id: "paradigm", zone: "p2", at: [6400, 2520], w: 640, kind: "ladder",
      title: "다섯 단계는 대체가 아니라 포괄이다",
      lede: "실천 → 실무자 명명 → 랩/기업의 공식화 → 학술 서베이의 순서가 매 단계 반복되고, 그 간격이 점점 짧아진다.",
      ladder: [
        { k: "prompt",  name: "프롬프트", era: "2020~", obj: "모델에게 주는 지시문 한 개", ask: "어떻게 말해야 잘 듣는가", gap: "약 3년" },
        { k: "context", name: "컨텍스트", era: "2025~", obj: "추론 시점에 모델이 보는 토큰 전체", ask: "무엇을 보여줘야 하는가", gap: "약 3개월" },
        { k: "harness", name: "하네스", era: "2026~", obj: "모델 주변의 실행 시스템 전체", ask: "어떤 환경에서 일하게 할 것인가", gap: "약 2개월" },
        { k: "loop",    name: "루프", era: "2026~", obj: "에이전트를 반복 실행시키는 시스템", ask: "누가 에이전트에게 일을 시키는가", gap: "약 1주일" },
        { k: "graph",   name: "그래프", era: "2026~", obj: "다중 에이전트·작업·상태의 연결 구조", ask: "어떻게 연결하고 조율하는가", gap: "명명과 서베이가 1개월 간격" },
      ],
      timeline: [
        ["2020-05-28", "GPT-3 논문, few-shot 프롬프팅"], ["2022-10", "ReAct 논문, 추론·행동 루프의 원형"], ["2022-11-30", "ChatGPT 출시"],
        ["2023-06-23", "Weng, LLM Powered Autonomous Agents"], ["2024-01", "LangGraph 출시"], ["2024-12-19", "Anthropic Building Effective Agents"],
        ["2025-06", "\"컨텍스트 엔지니어링\" 명명"], ["2025-09-29", "Anthropic 컨텍스트 엔지니어링 공식 정의"], ["2026-02-05~11", "OpenAI Lopopolo \"Harness engineering\""],
        ["2026-04", "Fowler/Böckeler 하네스 프레임워크, 하네스 서베이 논문"], ["2026-06-02~07", "Osmani \"Loop Engineering\" 명명"], ["2026-07-22", "LangChain \"3 Years of Graph Engineering\""],
        ["2026-08-21", "Feng et al. 그래프 엔지니어링 서베이"],
      ],
      st: "verified",
      src: [{ f: T1, s: "§0, §9", l: 221, g: "감사 B-1 :135" }],
      links: [
        { kind: "공식", label: "Anthropic: Effective context engineering", url: "https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents" },
        { kind: "공식", label: "Anthropic: Building effective agents", url: "https://www.anthropic.com/engineering/building-effective-agents" },
      ],
    },
    {
      id: "promptdead", zone: "p2", ring: "prompt", polar: [690, -150], w: 360, kind: "drawing",
      title: "프롬프트 엔지니어링은 죽었나",
      lede: "\"죽은 것은 프롬프트 엔지니어라는 직함과 주문 외우기식 꼼수다. 남은 것은 지시를 설계하는 능력이며, 그것은 컨텍스트 → 하네스 → 루프 → 그래프로 계속 위 층에 흡수되고 있다.\"",
      st: "verified",
      rows: [
        { st: "verified", t: "Anthropic: 프롬프트 엔지니어링이란 \"최적의 결과를 위해 LLM 지시를 쓰고 조직하는 방법\".", s: { f: T1, s: "§1", l: 28 } },
        { st: "verified", t: "2023-03 Anthropic 프롬프트 엔지니어 공고 $335K, 2024-03-06 IEEE Spectrum \"AI Prompt Engineering Is Dead\".", s: { f: T1, s: "§9", l: 205 } },
      ],
      src: [{ f: T1, s: "§7", l: 182, g: "감사 B-1 :135" }],
      links: [
        { kind: "공식", label: "Anthropic: Effective context engineering", url: "https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents" },
      ],
    },
    {
      id: "motionprompts", zone: "p2", ring: "prompt", polar: [690, 30], w: 360, kind: "media",
      title: "움직임을 고치는 프롬프트",
      lede: "\"No more PowerPoint moves: easing → overshoot → stagger → holds\"",
      st: "unverified",
      cond: "X 게시물의 문장이다. 효과는 확인되지 않았다.",
      rows: [
        { st: "unverified", t: "\"spark → build → twist → lock → hold\"", s: { f: XP, by: "@seeconvm" } },
        { st: "unverified", t: "\"it renders every frame, looks at them and fixes its own curves before saying done\"", s: { f: XP, by: "@explosss1ve" } },
      ],
      media: [
        { type: "video", src: "media/jakubantalik-motion.mp4", poster: "media/jakubantalik-motion.jpg", by: x("Jakubantalik", "2113656694303551906"), cap: "MOTION.CSS 패널에 이징 값이 적힌 게시 영상." },
      ],
      src: [{ f: XP, by: "@ArchiveExplorer", g: "감사 범위 밖" }],
      links: [
        { kind: "X 게시물", label: "@ArchiveExplorer", url: "https://x.com/ArchiveExplorer/status/2109695127870386661" },
        { kind: "X 게시물", label: "@seeconvm", url: "https://x.com/seeconvm/status/2108589520266355155" },
        { kind: "X 게시물", label: "@explosss1ve", url: "https://x.com/explosss1ve/status/2109702748367167599" },
        x("Jakubantalik", "2113656694303551906"),
      ],
    },
    {
      id: "context", zone: "p2", ring: "context", polar: [1100, -105], w: 420, kind: "drawing",
      title: "무엇을 보여줘야 하는가",
      lede: "\"원하는 결과를 낼 가능성을 최대화하는, 가장 작은 고신호(high-signal) 토큰 집합을 찾는 것.\"",
      st: "verified",
      rows: [
        { st: "verified", t: "Anthropic (2025-09-29): 컨텍스트 엔지니어링은 LLM 추론 중 최적의 토큰(정보) 집합을 큐레이션하고 유지하는 전략들의 집합.", s: { f: T1, s: "§2", l: 46 } },
        { st: "verified", t: "context rot: 컨텍스트 창의 토큰 수가 늘수록 모델이 그 정보를 정확히 회상하는 능력이 떨어진다.", s: { f: T1, s: "§2", l: 48 } },
      ],
      media: [
        { type: "img", src: "media/memory-tax.jpg", by: x("Xudong07452910", "2116008943126552615"), cap: "논문 첫 페이지 이미지: \"Memory Tax: Dissecting the Net Value of Agent Memory\"" },
        { type: "img", src: "media/naive-rag.jpg", by: x("akshay_pachaar", "2114659720602534014"), cap: "논문 첫 페이지 이미지: \"Is Complex Agentic Memory Always Needed? Naive RAG Is Stronger Than We Thought\"" },
      ],
      src: [{ f: T1, s: "§2", l: 47, g: "감사 B-1 :135" }],
      links: [
        { kind: "공식", label: "Anthropic: Effective context engineering", url: "https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents" },
        x("Xudong07452910", "2116008943126552615"),
        x("akshay_pachaar", "2114659720602534014"),
      ],
    },
    {
      id: "glossary", zone: "p2", ring: "context", polar: [1100, 75], w: 440, kind: "glossary",
      title: "바이브코딩 용어 17",
      terms: [
        ["GitHub", "코드 저장·공유·협업 플랫폼 (엔진은 Git)", 155], ["호스팅", "만든 것을 24시간 켜진 서버에 올려 누구나 접속하게 하기", 156],
        ["diff", "두 버전 사이 바뀐 줄만 추린 표시 (+초록 / −빨강)", 157], ["API", "프로그램끼리 규칙대로 요청·응답하는 창구", 158],
        ["tool", "에이전트가 실제 실행을 맡기는 기능 (손발)", 159], ["사고 수준", "답 전에 얼마나 생각할지의 다이얼 (속도·비용 ↔ 깊이)", 160],
        ["모델의 종류", "등급 × 추론 방식 × 입력 형태 × 공개 방식의 조합", 161], ["오픈웨이트", "가중치 파일을 공개한 모델 (오픈소스와는 다름)", 162],
        ["AGENTS.md", "모든 에이전트 공용 프로젝트 설명서", 163], ["CLAUDE.md", "Claude Code 전용, 매 세션 자동 적용되는 지시서", 164],
        ["스킬", "필요할 때만 꺼내 읽는 작업 매뉴얼 패키지 (SKILL.md)", 165], ["루틴", "일정에 따라 반복 실행되는 자동 작업", 166],
        ["결정론적 도구", "같은 입력 → 같은 출력이 보장되는 프로그램", 167], ["토큰", "모델이 글을 세는 단위 = 작업량·요금·한도의 단위", 168],
        ["컨텍스트", "모델이 지금 볼 수 있는 정보 전부 (그릇 = 컨텍스트 윈도우)", 169], ["압축", "대화를 요약본으로 갈아 끼워 컨텍스트 공간 확보", 170],
        ["슬래시 명령어", "/로 부르는 단축 명령 (스킬도 여기서 부른다)", 171],
      ],
      st: "conditional",
      cond: "사실 주장이 아니라 용어 풀이입니다. 공식 문서를 바탕으로 했습니다.",
      src: [{ f: T3, s: "요약표", l: 153, g: "감사 (a) 2-18, 2-19" }],
      links: [
        { kind: "공식", label: "Claude Code: skills", url: "https://code.claude.com/docs/en/skills" },
        { kind: "공식", label: "AGENTS.md", url: "https://agents.md/" },
        { kind: "공식", label: "Claude Code: memory (CLAUDE.md)", url: "https://code.claude.com/docs/en/memory?ref=hackernoon.com" },
        { kind: "공식", label: "Claude Code: slash commands", url: "https://code.claude.com/docs/en/slash-commands" },
      ],
    },
    {
      id: "harness", zone: "p2", ring: "harness", polar: [1540, -35], w: 440, kind: "drawing",
      title: "모델 + 하네스 = 에이전트",
      lede: "\"에이전트가 실수하면 에이전트가 아니라 하네스를 고쳐라\"",
      st: "verified",
      rows: [
        { st: "verified", t: "Anthropic (2026-01-09): 에이전트 하네스란 모델이 에이전트로서 행동할 수 있게 해 주는 시스템이다.", s: { f: T1, s: "§3", l: 71 } },
        { st: "verified", t: "Fowler/Böckeler: guides(행동 전에 작용하는 피드포워드 제어, 지침·규칙 파일)와 sensors(행동 후에 관찰하는 피드백 제어, 테스트·린터·리뷰).", s: { f: T1, s: "§3", l: 73 } },
        { st: "verified", t: "업계 공식으로 수렴: Agent = Model + Harness.", s: { f: T1, s: "§3", l: 74 } },
      ],
      media: [
        { type: "img", src: "media/harness2.jpg", by: x("akshay_pachaar", "2111753928031531232"), cap: "게시 이미지: \"Harness²: Recursive Agent Harnessing for an Open World\"" },
        { type: "img", src: "media/oo-harness.jpg", by: x("omarsar0", "2112911038098317422"), cap: "논문 첫 페이지 이미지: \"Object-Oriented Harness: Evolving Agent Harnesses through Object-Oriented Design\"" },
        { type: "img", src: "media/skill-library.jpg", by: x("0xShoopy", "2117282738143166592"), cap: "게시 이미지: \"Build Your Own Skill Library\"" },
      ],
      src: [{ f: T1, s: "§0, §3", l: 19, g: "감사 B-1 :135" }],
      links: [
        { kind: "기사", label: "Martin Fowler: Harness engineering", url: "https://martinfowler.com/articles/exploring-gen-ai/harness-engineering.html" },
        { kind: "공식", label: "Anthropic: Effective harnesses for long-running agents", url: "https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents" },
        x("akshay_pachaar", "2111753928031531232"), x("omarsar0", "2112911038098317422"), x("0xShoopy", "2117282738143166592"),
      ],
    },
    {
      id: "approval", zone: "p2", ring: "harness", polar: [1540, 165], w: 420, kind: "media",
      title: "누가 허락하는가",
      lede: "실행 중인 에이전트가 멈추고 사람에게 묻는 순간을 화면이 어떻게 보여 주는가.",
      st: "unverified",
      cond: "디자인 레퍼런스로 모은 게시 영상과 이미지다. 실제 제품 동작은 확인하지 않았다.",
      media: [
        { type: "video", src: "media/eliakuratli-approval.mp4", poster: "media/eliakuratli-approval.jpg", by: x("eliakuratli", "2114800098534387734"), cap: "도구 호출 목록 중 \"Waiting for approval\", Deny / Allow." },
        { type: "video", src: "media/flohoeller-needs-you.mp4", poster: "media/flohoeller-needs-you.jpg", by: x("flohoeller", "2116105105762328633"), cap: "Running → Needs you → Finished, Decline (Esc) / Allow." },
        { type: "img", src: "media/code-review.jpg", by: x("undefinedKi", "2116634779583979805"), cap: "게시 이미지: \"Human approval by risk\"" },
      ],
      src: [{ f: "refs/drive/style-synthesis.md", s: "§5 Agent activity", by: "레퍼런스 정리", g: "감사 범위 밖" }],
      links: [
        x("eliakuratli", "2114800098534387734"), x("flohoeller", "2116105105762328633"), x("undefinedKi", "2116634779583979805"),
      ],
    },
    {
      id: "loop", zone: "p2", ring: "loop", polar: [1980, -125], w: 420, kind: "drawing",
      title: "당신 자신을 대체하는 시스템",
      lede: "\"루프 엔지니어링은 에이전트에게 프롬프트를 주는 사람인 당신 자신을 대체하는 것이다. 대신 그 일을 하는 시스템을 당신이 설계한다.\"",
      steps: ["Goal", "Action", "Observation", "Adjustment"],
      st: "verified",
      rows: [
        { st: "verified", t: "루프의 단계 (IBM): Goal → Action → Observation → Adjustment. 필수 요소 둘: 명확한 목표(\"done\"의 정의)와 점수지기(테스트·린터 같은 측정 가능한 판정).", s: { f: T1, s: "§4", l: 98 } },
        { st: "verified", t: "2026-06-02~07: Cherny \"내 일은 루프를 쓰는 것\" → Osmani \"Loop Engineering\" 명명.", s: { f: T1, s: "§9", l: 216 } },
      ],
      src: [{ f: T1, s: "§4", l: 96, g: "감사 B-1 :135" }],
      links: [
        { kind: "기사", label: "Addy Osmani: Loop engineering", url: "https://addyosmani.com/blog/loop-engineering/" },
        { kind: "공식", label: "IBM: Loop engineering", url: "https://www.ibm.com/think/topics/loop-engineering" },
      ],
    },
    {
      id: "selfverify", zone: "p2", ring: "loop", polar: [1980, 20], w: 400, kind: "media",
      title: "같은 버그, 두 번 실패하면 멈춘다",
      lede: "\"Verification is external to the builder and never self-graded.\"",
      st: "unverified",
      cond: "게시 이미지 속 문장이다. 형식이 논문이어도 출처는 X 게시물이다.",
      media: [
        { type: "img", src: "media/self-verify.jpg", by: x("hanakoxbt", "2117365616579666418"), cap: "게시 이미지 제목: \"A Unified Framework for Self-Verifying Agent Loops in Claude Code\"" },
        { type: "img", src: "media/claude-md.jpg", by: x("Voxyz_ai", "2116968517157212271"), cap: "CLAUDE.md 화면: \"Same bug, two failed fixes: stop.\"" },
      ],
      src: [{ f: "loop_graph/hanakoxbt_2117365616579666418_0.jpg", by: "게시 이미지", g: "감사 범위 밖" }],
      links: [x("hanakoxbt", "2117365616579666418"), x("Voxyz_ai", "2116968517157212271")],
    },
    {
      id: "review", zone: "p2", ring: "loop", polar: [1980, 110], w: 400, kind: "sheet",
      title: "만든 사람 밖의 눈",
      lede: "바이브코딩으로 만든 학습 페이지를 다른 눈으로 다시 읽은 검토서.",
      st: "conditional",
      cond: "검토서 스스로 밝힌 한계: 렌더링 캡처에서 측정한 결과가 아니라 CSS 색상 계산이다. 브라우저 실사용은 검증하지 않았다.",
      rows: [
        { st: "conditional", t: "일반 텍스트 대비 약 3.46:1, 약 4.17:1. 작은 일반 텍스트의 4.5:1 기준에 못 미친다.", s: { f: "ui_review_20261025/학습페이지-실제HTML-독립검토-20261025.md", l: 46 } },
        { st: "conditional", t: "용어 팝오버에 role=\"dialog\"는 있지만 접근 가능한 이름·트리거와 연결·열림 상태 전달이 없다.", s: { f: "ui_review_20261025/학습페이지-실제HTML-독립검토-20261025.md", l: 45 } },
        { st: "conditional", t: "중복 ID, 끊어진 내부 앵커, 존재하지 않는 답 토글 대상: 0개.", s: { f: "ui_review_20261025/학습페이지-실제HTML-독립검토-20261025.md", l: 58 } },
      ],
      src: [{ f: "ui_review_20261025/학습페이지-실제HTML-독립검토-20261025.md", l: 8, g: "감사 범위 밖, 자체 한계 명시" }],
      links: [],
    },
    {
      id: "graph", zone: "p2", ring: "graph", polar: [2420, -60], w: 440, kind: "drawing",
      title: "노드가 일하고, 엣지가 넘기고, 상태가 흐른다",
      lede: "\"시스템 지능은 에이전트 수를 늘리는 것과 같지 않다\"",
      st: "verified",
      cond: "유행어 주의: 실천은 2024년부터 있었고, 용어는 2026년 중반에 뒤늦게 붙었다.",
      rows: [
        { st: "verified", t: "LangChain (2026-07-22): Nodes가 일을 하고, Edges가 전이를 정의하고, State가 그래프를 따라 흐른다.", s: { f: T1, s: "§5", l: 124 } },
        { st: "verified", t: "\"그래프는 루프를 대체하지 않는다. 그래프는 프로세스들 사이의 관계를 설계하고, 각 노드는 여전히 완전한 루프를 돌 수 있다.\"", s: { f: T1, s: "§5", l: 128 } },
      ],
      media: [
        { type: "video", src: "media/primeintellect-swarm.mp4", poster: "media/primeintellect-swarm.jpg", by: x("PrimeIntellect", "2108672479007047952"), cap: "서브에이전트를 깊이별로 펼친 게시 영상." },
        { type: "img", src: "media/delm-central.jpg", by: x("rohanpaul_ai", "2108087162092818694"), cap: "논문 그림: \"Centralized vs. decentralized multi-agent systems\"" },
        { type: "img", src: "media/super-agent.jpg", by: x("Hesamation", "2116920980002230772"), cap: "손그림 다이어그램: \"Super-agent\", Router와 Worker." },
        { type: "img", src: "media/graph-eng-post.jpg", by: x("AnnatarXBT", "2116256966381301780"), cap: "논문 형식으로 꾸민 게시 영상의 한 장면. 형식이 논문이어도 출처는 게시물이다." },
      ],
      src: [{ f: T1, s: "§5", l: 136, g: "감사 B-1 :135, (a) 2-5" }],
      links: [
        x("PrimeIntellect", "2108672479007047952"), x("rohanpaul_ai", "2108087162092818694"), x("Hesamation", "2116920980002230772"), x("AnnatarXBT", "2116256966381301780"),
      ],
    },
    {
      id: "altman", zone: "p2", ring: "graph", polar: [2420, 145], w: 400, kind: "correction",
      title: "IQ 300짜리 3만 개?",
      corr: { from: "IQ 3만 vs IQ 300짜리 3만 개", to: "IQ 1조짜리 하나 vs 약간 초인적인 AI 1조 개", why: "성능 주장이 아니라 사회 설계 선호 발언이다." },
      quote: "I would much rather intuitively have a trillion AIs of slightly superhuman intelligence join society than one AI of one trillion IQ join society.",
      st: "corrected",
      rows: [
        { st: "corrected", t: "팟캐스트 Cheeky Pint, \"Why Sam Altman is against a single superintelligence\", 2026-10-29 공개, 약 21:09 지점.", s: { f: T2, s: "§1", l: 43 } },
        { st: "corrected", t: "같은 인터뷰: 에이전트 팀의 스케일링 법칙은 전혀 이해하지 못한 상태에서 진행했다.", s: { f: T2, s: "§1", l: 48 } },
      ],
      src: [{ f: T2, s: "§1", l: 45, g: "감사 B-0 :109" }],
      links: [
        { kind: "기사", label: "Cheeky Pint 트랜스크립트", url: "https://share.transistor.fm/s/92f18066" },
        { kind: "기사", label: "Longbridge 보도", url: "https://longbridge.com/en/news/303825184" },
      ],
    },
    {
      id: "hackathon", zone: "p2", at: [8250, 4420], w: 400, kind: "sheet",
      title: "개발자가 아닌 우승자들",
      lede: "\"모델을 제약하는 일이 프롬프팅보다 어렵다. 내 작업의 대부분은 프롬프트 엔지니어링이 아니었다.\"",
      st: "verified",
      rows: [
        { st: "verified", t: "CrossBeam: 변호사. 캘리포니아 부속 주거유닛(ADU) 인허가 규정 자동 분석.", s: { f: T2, s: "§4-1", l: 116 } },
        { st: "verified", t: "MedKit: 의사 출신. 레지던트 교육용 가상 환자 시뮬레이터.", s: { f: T2, s: "§4-2", l: 126 } },
        { st: "verified", t: "veTriage: 코딩 경험이 전혀 없는 61세 수의사가 만든 동물병원 접수 triage 웹앱.", s: { f: T2, s: "§4-3", l: 136 } },
        { st: "verified", t: "Otorag: 통화 중 보이스피싱을 LLM으로 실시간 탐지.", s: { f: T2, s: "§4-4", l: 143 } },
      ],
      src: [{ f: T2, s: "§4-5", l: 150, g: "감사 B-1 :132" }],
      links: [
        { kind: "기사", label: "NY Post: Anthropic hackathon", url: "https://nypost.com/2026/02/27/business/anthropic-hackathon-proves-vibe-coding-is-here-to-stay/" },
        { kind: "기사", label: "ETIH: Opus 4.7 hackathon winners", url: "https://www.edtechinnovationhub.com/news/a-doctor-a-carpenter-and-a-teacher-win-anthropics-global-opus-47-hackathon" },
        { kind: "기사", label: "OpenAI Build Week winners", url: "https://aimagazine.blog/openai-build-week-2026-prizes-winners-results/" },
      ],
    },
    {
      id: "free", zone: "p2", at: [4640, 4560], w: 420, kind: "sheet",
      title: "무료로 시작하는 길",
      lede: "공식으로 확인된 것만 적고, 수치가 없는 한도는 \"비공개\"로 남긴다.",
      st: "verified",
      rows: [
        { st: "verified", t: "모두의 AI 실험실: 1인당 4만원 상당 토큰 지원 (NIA 공식 안내).", s: { f: AU, s: "B-1", l: 133 } },
        { st: "verified", t: "구 Gemini CLI 개인 무료 경로는 2026-06-18 종료.", s: { f: AU, s: "B-1", l: 134 } },
        { st: "conditional", t: "OpenCode Zen·Google AI Studio의 무료 한도: 공식 수치 없음. \"한도 비공개\"로 안내한다.", s: { f: AU, s: "B-2", l: 166 } },
      ],
      src: [{ f: T2, s: "§5", l: 160, g: "감사 B-1 :133–134, B-2 :166" }],
      links: [
        { kind: "기사", label: "연합뉴스: 모두의 AI 실험실", url: "https://www.yna.co.kr/view/AKR20260731134651017" },
        { kind: "공식", label: "Gemini CLI quota and pricing", url: "https://google-gemini.github.io/gemini-cli/docs/quota-and-pricing.html" },
        { kind: "공식", label: "Gemini API rate limits", url: "https://ai.google.dev/gemini-api/docs/rate-limits" },
        { kind: "기사", label: "OpenCode 소개", url: "https://www.paralect.com/stack/opencode" },
      ],
    },
    {
      id: "self", zone: "p2", at: [4660, 600], w: 420, kind: "media",
      title: "이 아카이브를 만든 재료",
      lede: "움직임의 값은 참고 영상의 프레임에서 읽었고, 바닥 질감은 AI로 만든 그림이다.",
      st: "unverified",
      cond: "디자인 참고 자료다. 게시물과 영상은 맥락일 뿐 증거가 아니다.",
      rows: [
        { st: "unverified", t: "숫자 굴림: 500ms, cubic-bezier(0.34, 1.45, 0.64, 1), 거리 8px, 간격 70ms (Jakubantalik MOTION.CSS 패널).", s: { f: "refs/drive/style-synthesis.md", s: "§6.2", l: 121 } },
        { st: "unverified", t: "목록 진입: \"stagger 30ms · spring 140/15\", \"Exits faster than it enters\" (animate-ui 주석).", s: { f: "refs/drive/style-synthesis.md", s: "§6.2", l: 123 } },
        { st: "unverified", t: "AI로 만든 그림 3장은 바닥 질감으로만 쓴다. 증거가 아니다.", s: { f: "archive/README.md", s: "에셋 출처" } },
      ],
      media: [
        { type: "video", src: "media/enesozturk-spec.mp4", poster: "media/enesozturk-spec.jpg", by: x("enesozturkdev", "2114035471953326126"), cap: "\"documents a component's architecture into a spec sheet\"", capSrc: XP },
        { type: "img", src: "assets/gen-drawing-threads.jpg", gen: true, cap: "AI로 만든 배경 그림 · 근거 자료 아님" },
      ],
      src: [{ f: "refs/drive/style-synthesis.md", s: "§6.2", l: 121, g: "감사 범위 밖" }],
      links: [x("enesozturkdev", "2114035471953326126"), x("animate_ui", "2111882479774896338")],
    },
  ];

  /* v2: information hierarchy. tier 1 = a zone's few works (image or number at scale), tier 2 = plates
     (one figure or one image), tier 3 = notes (fragments, corrections). Positions are world px (centre). */
  AR.layout = {
    /* 1부: 가능성 (top left), 측정의 함정 (top right), 일 (bottom left), 안전 (bottom right), 비용 (top band) */
    claudia:     { tier: 1, at: [1120, 1420], w: 1900 },
    accounting:  { tier: 1, at: [3460, 1500], w: 1880 },
    labor:       { tier: 1, at: [1180, 3900], w: 1960 },
    cve:         { tier: 1, at: [3460, 3980], w: 2000 },
    o3:          { tier: 2, at: [3060, 380], w: 520 },
    plans:       { tier: 2, at: [3960, 400], w: 560 },
    astra3d:     { tier: 2, at: [400, 2560], w: 560 },
    motionso:    { tier: 2, at: [1090, 2470], w: 620 },
    quasiRH:     { tier: 2, at: [1770, 2620], w: 480 },
    gpt5paper:   { tier: 2, at: [2380, 2380], w: 460 },
    opus55table: { tier: 2, at: [3020, 2580], w: 520 },
    gdpx:        { tier: 2, at: [3660, 2400], w: 560 },
    gdpval:      { tier: 2, at: [4310, 2640], w: 440 },
    humaneval:   { tier: 2, at: [2450, 3080], w: 420 },
    bok:         { tier: 2, at: [420, 5100], w: 600 },
    juniors:     { tier: 2, at: [1190, 5160], w: 640 },
    poison:      { tier: 2, at: [1960, 5070], w: 520 },
    gtg:         { tier: 2, at: [2780, 5150], w: 480 },
    hf:          { tier: 2, at: [3560, 5160], w: 520 },
    rsi:         { tier: 2, at: [4300, 5120], w: 440 },
    science:     { tier: 3, at: [2300, 860], w: 360 },
    papers400:   { tier: 3, at: [2310, 1900], w: 340 },
    h100:        { tier: 3, at: [2400, 300], w: 360 },
    distill:     { tier: 3, at: [4380, 880], w: 340 },
    mmlu:        { tier: 3, at: [4400, 3060], w: 300 },
    wwi:         { tier: 3, at: [2360, 4280], w: 340 },
    kostat:      { tier: 3, at: [2300, 3560], w: 320 },
    gap141:      { tier: 3, at: [2300, 4720], w: 340 },
    normaltic:   { tier: 3, at: [4420, 4560], w: 320 },
    costaxis:    { tier: 3, at: [4420, 2050], w: 320 },
    /* 다리: the corridor wall */
    bridgeA:     { tier: 1, at: [5100, 1720], w: 860 },
    bridgeC:     { tier: 1, at: [5100, 3080], w: 860 },
    bridgeE:     { tier: 1, at: [5100, 4440], w: 860 },
    /* 2부 (v4): five explainers. The nest sits at the centre of the rings; context, harness, loop and graph
       take the four quarters, each roughly on its own ring; plates and notes fill the gaps between them. */
    paradigm:    { tier: 1, at: [7800, 2980], w: 1200 },
    context:     { tier: 1, at: [6720, 1640], w: 1300 },
    harness:     { tier: 1, at: [9000, 1600], w: 1420 },
    loop:        { tier: 1, at: [6600, 4440], w: 1400 },
    graph:       { tier: 1, at: [9080, 4560], w: 1500 },
    promptdead:  { tier: 2, at: [6720, 2760], w: 420 },
    motionprompts: { tier: 2, at: [8900, 3440], w: 460 },
    glossary:    { tier: 2, at: [8780, 2620], w: 540 },
    approval:    { tier: 2, at: [6080, 3240], w: 520 },
    review:      { tier: 2, at: [9640, 2560], w: 420 },
    selfverify:  { tier: 2, at: [7820, 4760], w: 480 },
    altman:      { tier: 3, at: [9660, 560], w: 360 },
    hackathon:   { tier: 2, at: [6180, 5260], w: 560 },
    free:        { tier: 2, at: [7060, 5260], w: 480 },
    self:        { tier: 3, at: [9680, 3380], w: 320 },
  };

  /* Part 1 opens with the talk (x 0 to OPEN), in its order: 역사 → 에이전트의
     등장 → 활용. Everything that used to start at x 0 moves right by OPEN,
     here, once; the rest of the code reads these numbers and never assumes where a zone starts. */
  const OPEN = 3800;
  AR.world.w += OPEN;
  AR.zones.p1.w += OPEN;
  ["br", "p2", "gal", "exit"].forEach((k) => (AR.zones[k].x += OPEN));
  AR.clusters.forEach((c) => (c.x += OPEN));
  AR.rings.cx += OPEN;
  AR.plaque.x += OPEN;
  Object.values(AR.layout).forEach((L) => (L.at[0] += OPEN));
  AR.zones.p1.anchor = "s-vibe";
  AR.zones.p1.open = OPEN;
  /* the three acts as painted floor headings, and where each act's pieces stand */
  AR.acts = [
    { name: "역사", sub: "모델이 자라 온 길", x: 120, s: { f: BL, l: 46 } },
    { name: "에이전트의 등장", sub: "도구를 붙인 LLM", x: 1360, s: { f: BL, l: 131 } },
    { name: "활용", sub: "지금 쓰는 법과 조심할 것", x: 2600, s: { f: BL, l: 257 } },
  ];
  Object.assign(AR.layout, {
    "s-vibe":     { tier: 2, at: [400, 1560], w: 560 },
    "s-model":    { tier: 2, at: [1010, 1600], w: 560 },
    "s-tide":     { tier: 1, at: [700, 2780], w: 1120 },
    "s-deeper":   { tier: 2, at: [430, 4020], w: 600 },
    "s-outside":  { tier: 3, at: [1010, 3900], w: 360 },
    "s-lag":      { tier: 3, at: [1010, 4560], w: 360 },
    "s-tools":    { tier: 2, at: [1650, 1600], w: 620 },
    "s-chat":     { tier: 3, at: [2250, 1520], w: 340 },
    "s-define":   { tier: 1, at: [1940, 2620], w: 1100 },
    "s-harness":  { tier: 1, at: [1940, 3700], w: 1100 },
    "s-anatomy":  { tier: 1, at: [1940, 4880], w: 1100 },
    "s-now":      { tier: 2, at: [2900, 1620], w: 620 },
    "s-guard":    { tier: 1, at: [3180, 2780], w: 1100 },
    "s-security": { tier: 2, at: [2900, 4000], w: 600 },
    "s-intent":   { tier: 1, at: [3180, 4980], w: 1100 },
  });

  /* Derived pictures. Every number below is computed from the pieces' sourced figures; the legend says how. */
  AR.viz = {
    cve:      { unit: 100, legend: "점 1개 = CVE 레코드 100건 (반올림)" },
    labor:    { legend: "점 100개 = 100%. 테두리: 이론적 커버리지 약 90%. 채움: 실제 관측 커버리지 34.3%" },
    bok:      { total: 285000, part: 268000, unit: 1000, legend: "점 1개 = 청년 일자리 1,000개. 감소 28만 5,000개 중 AI 고노출 업종 26만 8,000개", s: { f: P + "P1_시장산업.md", s: "§1-1", l: 32 } },
    paradigm: { days: { prompt: 1095, context: 90, harness: 60, loop: 7, graph: 30 }, legend: "점 1개 = 1일. 1년 = 365일, 1개월 = 30일, 1주일 = 7일로 환산. 그래프만 명명과 서베이 사이의 간격" },
  };

  /* v4: Part 2 explainers, drawn by js/explain.js. Every label, line, quote and term below is copied from the line it
     cites (markdown marks removed; " · " joins fragments). tools/check.py checks each string against its source.
     The drawings add no quantity: the number of tokens, laps and nodes in a figure is illustrative and the figure says so. */
  AR.explain = {
    paradigm: {
      scene: "nest", slot: "art-core-seed", floor: 6,
      chain: { t: "프롬프트 ⊂ 컨텍스트 ⊂ 하네스 ⊂ 루프 ⊂ 그래프", s: { f: T1, s: "§10", l: 227 } },
      steps: [
        { k: "prompt",  label: "프롬프트", sub: "2020~", line: "지시문 한 개", q: ["모델에게 주는 지시문 한 개", "\"어떻게 말해야 잘 듣는가\""], s: { f: T1, s: "§0", l: 12 } },
        { k: "context", label: "컨텍스트", sub: "2025~", line: "토큰 전체", q: ["추론 시점에 모델이 보는 토큰 전체", "\"무엇을 보여줘야 하는가\""], s: { f: T1, s: "§0", l: 13 } },
        { k: "harness", label: "하네스", sub: "2026~", line: "주변의 실행 시스템 전체", q: ["모델 주변의 실행 시스템 전체", "\"어떤 환경에서 일하게 할 것인가\""], s: { f: T1, s: "§0", l: 14 } },
        { k: "loop",    label: "루프", sub: "2026~", line: "반복 실행시키는 시스템", q: ["에이전트를 반복 실행시키는 시스템", "\"누가 에이전트에게 일을 시키는가\""], s: { f: T1, s: "§0", l: 15 },
          math: { t: "Loop(Foundation Model, Harness; state)", s: { f: T1, s: "§0", l: 20 } } },
        { k: "graph",   label: "그래프", sub: "2026~", line: "연결 구조(위상)", q: ["다중 에이전트·작업·상태의 연결 구조(위상)", "\"어떻게 연결하고 조율하는가\""], s: { f: T1, s: "§0", l: 16 } },
        { k: "layers",  label: "세 층", line: "지능을 세 층으로 나눔", s: { f: T1, s: "§5", l: 120 },
          q: ["Model Intelligence — 파라미터에 인코딩된 능력 (프롬프트·컨텍스트 엔지니어링이 작동하는 층)", "Individual Intelligence — 하네스 + 루프로 확장된 단일 에이전트", "System Intelligence — 공유 상태를 가진 다중 에이전트 조율 ← 그래프가 필요한 층"],
          braces: [{ t: "Model Intelligence", over: ["prompt", "context"] }, { t: "Individual Intelligence", over: ["harness", "loop"] }, { t: "System Intelligence", over: ["graph"] }] },
      ],
      gaps: { t: "프롬프트: 약 3년 · 컨텍스트: 약 3개월 · 하네스: 약 2개월 · 루프: 약 1주일 · 그래프: 명명과 서베이가 1개월 간격", s: { f: T1, s: "§9", l: 221 } },
      /* §9 table, one row per line: [date, event, the table's 단계 cell, line] */
      timeline: { s: { f: T1, s: "§9", l: 200 }, rows: [
        ["2020-05-28", "GPT-3 논문 — few-shot 프롬프팅", "프롬프트 탄생", 202], ["2022-10", "ReAct 논문 — 추론·행동 루프의 원형", "(에이전트)", 203],
        ["2022-11-30", "ChatGPT 출시", "프롬프트 대중화", 204], ["2023-03", "AutoGPT — 자율 에이전트 각인 / Anthropic 프롬프트 엔지니어 공고 $335K", "양쪽의 정점", 205],
        ["2023-06-23", "Weng, LLM Powered Autonomous Agents", "에이전트 정의", 206], ["2023-08~09", "에이전트 서베이 2종 (Wang / Xi)", "에이전트 학술화", 207],
        ["2024-01", "LangGraph 출시", "(그래프 실천 시작)", 208], ["2024-03-06", "IEEE Spectrum \"AI Prompt Engineering Is Dead\"", "종말 담론", 209],
        ["2024-12-19", "Anthropic Building Effective Agents — 워크플로 vs 에이전트", "에이전트 공용어", 210],
        ["2025-06", "Lütke(6월 중순) → Martin(6/23) → Karpathy(6/25): \"컨텍스트 엔지니어링\" 명명", "컨텍스트", 211],
        ["2025-09-29", "Anthropic 컨텍스트 엔지니어링 공식 정의·기능 발표", "컨텍스트 제도화", 212], ["2025-11-26", "Anthropic 장기 실행 하네스 패턴 발표", "하네스 (전주)", 213],
        ["2026-02-05~11", "Hashimoto 용어 사용 → OpenAI Lopopolo \"Harness engineering\"", "하네스 명명", 214], ["2026-04", "Fowler/Böckeler 하네스 프레임워크 + 하네스 서베이 논문", "하네스 제도화", 215],
        ["2026-06-02~07", "Cherny \"내 일은 루프를 쓰는 것\" → Osmani \"Loop Engineering\" 명명", "루프", 216], ["2026-07-17", "IBM 루프 엔지니어링 공식 해설", "루프 제도화", 217],
        ["2026-07-22", "LangChain \"3 Years of Graph Engineering\"", "그래프 명명", 218], ["2026-08-21", "Feng et al. 그래프 엔지니어링 서베이 (arXiv)", "그래프 학술화", 219],
      ] },
    },
    context: {
      scene: "context", slot: "art-context-aperture", floor: 3,
      steps: [
        { k: "sources", label: "토큰의 전체 생애주기", line: "추론의 매 순간 모델이 보는", s: { f: T1, s: "§2", l: 53 },
          kinds: ["시스템 프롬프트", "도구 정의", "도구 출력", "검색 문서(RAG)", "메시지 히스토리", "메모리", "상태"] },
        { k: "window",  label: "컨텍스트", line: "최적의 토큰(정보) 집합을 큐레이션하고 유지하는 전략들의 집합", s: { f: T1, s: "§2", l: 46 } },
        { k: "signal",  label: "고신호(high-signal)", line: "가장 작은 고신호(high-signal) 토큰 집합", q: ["원하는 결과를 낼 가능성을 최대화하는, 가장 작은 고신호(high-signal) 토큰 집합을 찾는 것."], s: { f: T1, s: "§2", l: 47 } },
        { k: "rot",     label: "context rot", line: "컨텍스트 창의 토큰 수가 늘수록 모델이 그 정보를 정확히 회상하는 능력이 떨어진다", s: { f: T1, s: "§2", l: 48 } },
      ],
      moves: { label: "분류 체계", rows: ["write", "select", "compress", "isolate"], who: "Lance Martin, Context Engineering for Agents (2025-06-23, LangChain 블로그)", s: { f: T1, s: "§2", l: 55 } },
    },
    harness: {
      scene: "harness", slot: "art-harness-frame", floor: 7,
      eq: { t: "Agent = Model + Harness", s: { f: T1, s: "§3", l: 74 } },
      steps: [
        { k: "model",   label: "Model", line: "모델을 블랙박스로 두고", s: { f: T1, s: "§3", l: 77 } },
        { k: "harness", label: "Harness", line: "모델이 에이전트로서 행동할 수 있게 해 주는 시스템", s: { f: T1, s: "§3", l: 71 } },
        { k: "flow",    label: "도구 호출", line: "입력을 처리하고, 도구 호출을 조율하고, 결과를 반환한다", s: { f: T1, s: "§3", l: 71 } },
        { k: "control", label: "guides · sensors", line: "행동 전에 작용하는 피드포워드 제어 · 행동 후에 관찰하는 피드백 제어",
          q: ["guides(행동 전에 작용하는 피드포워드 제어 — 지침, 규칙 파일)", "sensors(행동 후에 관찰하는 피드백 제어 — 테스트, 린터, 리뷰)"], s: { f: T1, s: "§3", l: 73 } },
        { k: "layers",  label: "inner harness · outer harness", line: "모델 제공자가 내장 · 사용자가 조립 — AGENTS.md, MCP, 스킬", s: { f: T1, s: "§3", l: 73 } },
        { k: "parts",   label: "6요소 튜플", line: "H = (Execution Loop, Tool Registry, Context Manager, State Store, Lifecycle Hooks, Evaluation Interface)", s: { f: T1, s: "§3", l: 72 },
          ko: { t: ["실행 루프", "도구 레지스트리", "컨텍스트 관리자", "상태 저장소", "생애주기 훅", "평가 인터페이스"], s: { f: T1, s: "§8", l: 192 } } },
        { k: "rank",    label: "하네스만 바꿔", line: "모델은 그대로 두고 하네스만 바꿔 · 30위권 밖에서 5위로", s: { f: T1, s: "§3", l: 79 },
          bench: { t: "Terminal-Bench 2.0 · 2026.3", s: { f: T1, s: "§3", l: 79 } } },
      ],
      openai: { t: ["3~7명의 엔지니어가 5개월간", "수동으로 작성한 코드 0줄", "약 100만 줄·약 1,500개 PR", "Humans steer. Agents execute."], who: "OpenAI, Ryan Lopopolo · 2026-02-11", s: { f: T1, s: "§3", l: 85 } },
    },
    loop: {
      scene: "loop", slot: "art-loop-orbit", floor: 5,
      cycle: { t: "Goal → Action → Observation → Adjustment", s: { f: T1, s: "§4", l: 98 } },
      steps: [
        { k: "you",    label: "당신", line: "에이전트에게 프롬프트를 주는 사람인 당신", s: { f: T1, s: "§4", l: 96 } },
        { k: "goal",   label: "Goal", line: "명확한 목표(\"done\"의 정의)", s: { f: T1, s: "§4", l: 98 } },
        { k: "act",    label: "Action · Observation", line: "점수지기(scorekeeper — 테스트·린터 같은 측정 가능한 판정)", s: { f: T1, s: "§4", l: 98 } },
        { k: "adjust", label: "Adjustment", line: "AI가 완료될 때까지 반복하는", s: { f: T1, s: "§4", l: 96 } },
        { k: "done",   label: "done", line: "그 일을 하는 시스템을 당신이 설계한다", s: { f: T1, s: "§4", l: 96 } },
      ],
      kinds: { label: "트리거·종료 조건 기준", rows: [
        { k: "turn", t: "turn 기반(수동)" }, { k: "goal", t: "goal 기반(/goal: 평가자 모델이 조건을 검사)" },
        { k: "time", t: "time 기반(/loop: 간격 반복)" }, { k: "proactive", t: "proactive(이벤트 반응)" },
      ], s: { f: T1, s: "§4", l: 103 } },
    },
    graph: {
      scene: "graph", slot: "art-graph-constellation", floor: 6,
      steps: [
        { k: "nodes", label: "Nodes", line: "Nodes가 일을 하고", s: { f: T1, s: "§5", l: 124 } },
        { k: "edges", label: "Edges", line: "Edges가 전이를 정의하고", s: { f: T1, s: "§5", l: 124 } },
        { k: "state", label: "State", line: "State가 그래프를 따라 흐른다", s: { f: T1, s: "§5", l: 124 } },
        { k: "cycle", label: "사이클이 일급(first-class)", line: "재시도, 명확화 질문, 반복 도구 호출, 답변 수정이 모두 그래프의 간선으로 표현된다", s: { f: T1, s: "§5", l: 124 },
          edge: { t: "재시도", s: { f: T1, s: "§5", l: 124 } } },
        { k: "loops", label: "완전한 루프", line: "각 노드는 여전히 완전한 루프를 돌 수 있다", s: { f: T1, s: "§5", l: 128 } },
        { k: "human", label: "휴먼인더루프", line: "휴먼인더루프(승인·개입 지점)가 노드 타입으로 내장", s: { f: T1, s: "§5", l: 129 },
          gate: { t: "승인·개입 지점", s: { f: T1, s: "§5", l: 129 } } },
      ],
    },
  };

  /* Threads: [a, b, why]. Colour comes from the zones they join (red inside 1부, acid inside 2부, ember across). */
  AR.threads = [
    /* the talk in its order, then where it meets the evidence already on the floor */
    ["s-vibe", "s-model", "말이 생기기 전: 모델과 대화 환경"],
    ["s-model", "s-tide", "GPT-4에서 한국어가 따라왔다: 고르지 않은 물결"],
    ["s-tide", "s-deeper", "다음 물결: 크기 대신 추론"],
    ["s-deeper", "s-outside", "같은 시기, 판 밖에서 온 충격"],
    ["s-deeper", "s-lag", "그래서 두 세대 전 인상은 버린다"],
    ["s-lag", "s-tools", "부족했던 한 조각: 도구"],
    ["s-tools", "s-chat", "도구가 없으면 채팅일 뿐"],
    ["s-tools", "s-define", "도구를 쥔 LLM을 뭐라고 부를까"],
    ["s-define", "s-harness", "루프를 돌게 하는 틀"],
    ["s-harness", "s-anatomy", "틀 안의 부품: 머리, 손발, 훅"],
    ["s-anatomy", "s-now", "그래서 지금 얼마나 하나"],
    ["s-now", "s-guard", "점수가 올라도 남는 것: 환각"],
    ["s-guard", "s-security", "가드레일을 지우는 쪽도 있다"],
    ["s-security", "s-intent", "잘 시키는 법: 의도"],
    ["s-now", "accounting", "조건을 떼면 틀리는 숫자: 회계 100%와 56.4%"],
    ["s-security", "gtg", "같은 보안 이야기, 해외 사례"],
    ["s-harness", "harness", "견장에서 Agent = Model + Harness로"],
    ["s-define", "loop", "목적과 루프: 루프 엔지니어링"],
    ["accounting", "gdpval", "같은 질문, 다른 시험: 전문가를 이겼나"],
    ["accounting", "bridgeA", "완승과 56.4% 사이: 자신 있게 틀린 숫자"],
    ["bridgeA", "loop", "검증을 사람의 기억이 아니라 루프에 넣는다"],
    ["accounting", "selfverify", "실패의 약 70%가 추론 오류라면, 검증은 만든 쪽 밖에 둔다"],
    ["gdpval", "gdpx", "쉬운 실무 과제는 포화, 어려운 과제는 아직 10%대"],
    ["gdpx", "opus55table", "둘 다 제조사 자체 발표 수치"],
    ["opus55table", "costaxis", "같은 게시물에 붙은 비용 축 그래프"],
    ["costaxis", "glossary", "low부터 max까지: 사고 수준 다이얼"],
    ["costaxis", "o3", "점수의 가로축은 가격"],
    ["humaneval", "mmlu", "포화된 시험은 변별하지 못한다"],
    ["humaneval", "gdpx", "낡은 시험 다음엔 일부러 어렵게 만든 시험"],
    ["mmlu", "wwi", "이름이 틀리면 지표를 찾을 수 없다"],
    ["wwi", "glossary", "'weights'를 오픈웨이트로 읽는 경우"],
    ["labor", "bok", "할 수 있다 ≠ 이미 하고 있다, 그리고 한국 청년 일자리"],
    ["bok", "juniors", "신입이 하던 기초 업무, 줄어든 신입 공고"],
    ["bok", "kostat", "같은 시기, 다른 기관의 고용 통계"],
    ["juniors", "gap141", "채용 방식 자체는 어떻게 바뀌었나"],
    ["gap141", "bridgeA", "검증하는 과정이 시험이 된다"],
    ["juniors", "hackathon", "도메인 전문성이 진입장벽을 무너뜨렸다"],
    ["cve", "gtg", "곡선과 사건을 분리해서 본다"],
    ["cve", "normaltic", "그래프 밖의 생활 밀착형 침해"],
    ["hf", "bridgeC", "목표를 누가 정하고, 중간에 누가 검증하는가"],
    ["bridgeC", "graph", "스웜과 원리가 같다"],
    ["hf", "altman", "에이전트 1,200개, 그리고 AI 1조 개"],
    ["hf", "approval", "샌드박스와 허락의 경계"],
    ["gtg", "approval", "사람의 개입은 4~6개 결정 지점뿐이었다"],
    ["gtg", "harness", "Claude Code를 조작한 공격: 하네스가 막아야 할 것"],
    ["poison", "context", "모델이 보는 데이터를 믿을 수 있는가"],
    ["poison", "distill", "모델 공급망: 데이터 오염과 출력 복제"],
    ["h100", "plans", "컴퓨트가 비싸지면 무료 구간이 줄어든다"],
    ["plans", "glossary", "구독의 단위가 토큰이 됐다"],
    ["plans", "free", "무료로 풀린 기능은 회수된다"],
    ["free", "bridgeE", "연습하는 데 돈이 안 든다"],
    ["o3", "h100", "API는 싸지고 GPU 임대는 다시 비싸진다"],
    ["rsi", "loop", "AI가 AI 개발 루프 안에서 일한다"],
    ["papers400", "review", "생성 속도가 검증 속도를 이기면 병목은 검증하는 사람"],
    ["science", "papers400", "같은 대량 공개, 아직 주장 단계"],
    ["science", "altman", "에이전트 팀의 스케일링 법칙은 아직 모른다"],
    ["quasiRH", "gpt5paper", "AI가 던지고 사람이 검증한다"],
    ["quasiRH", "science", "동료평가 전의 주장들"],
    ["claudia", "graph", "감독 에이전트가 모델들을 지휘한다"],
    ["claudia", "motionso", "코드로 만든 영상"],
    ["motionso", "motionprompts", "PowerPoint 같은 움직임을 고치는 프롬프트"],
    ["motionprompts", "self", "이 아카이브의 모션 레시피"],
    ["astra3d", "harness", "도구를 프로그래밍 가능한 환경으로 다룬다"],
    ["promptdead", "hackathon", "모델을 제약하는 일이 프롬프팅보다 어렵다"],
    ["review", "self", "이 아카이브도 같은 기준으로 점검했다"],
    ["selfverify", "loop", "점수지기가 있어야 루프가 끝난다"],
    ["graph", "altman", "스웜"],
    ["glossary", "context", "토큰, 컨텍스트, 압축"],
    ["approval", "harness", "도구와 권한"],
    ["paradigm", "promptdead", "프롬프트: 약 3년"],
    ["paradigm", "context", "컨텍스트: 약 3개월"],
    ["paradigm", "harness", "하네스: 약 2개월"],
    ["paradigm", "loop", "루프: 약 1주일"],
    ["paradigm", "graph", "그래프: 명명과 서베이가 1개월 간격"],
  ];
  AR.threadSrc = { paradigmGaps: { f: T1, s: "§9", l: 221 } };

  AR.status = {
    /* words a public visitor reads at a glance; the audit sections stay in the comments above */
    verified:    { word: "확인됨",   mark: "●", note: "공식 발표나 1차 자료로 확인한 내용이에요" },
    conditional: { word: "조건부",   mark: "◐", note: "조건이 붙은 내용이에요. 조건을 함께 읽어 주세요" },
    unverified:  { word: "미확인",   mark: "○", note: "게시물과 이미지 속 주장이에요. 분위기를 보여 줄 뿐 증거는 아니에요" },
    excluded:    { word: "근거 부족", mark: "⊘", note: "근거가 부족해 사실로 쓰지 않는 주장이에요" },
    corrected:   { word: "정정",     mark: "/", note: "널리 퍼진 표현이 틀려서 바로잡은 내용이에요" },
  };
})();
