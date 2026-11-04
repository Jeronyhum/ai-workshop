/* v6: one glossary for the whole site. The term popovers (js/terms.js) and the exit zone's term section (js/exit.js) both read it.
   plain  the definition in plain Korean for students who don't major in CS, written for this site.
   q, s   the source fragment that plain rests on, copied verbatim from the cited line (tools/check.py checks it when the
          file is reachable). Entries with s: null are general explanations with no source in the materials; they say so.
   match  the words in the site's text that open this entry (longest first wins, so "API 키" beats "API").
   zones  where the word means this; e.g. "그래프" is a chart in Part 1, so it only opens the agent-graph entry in Part 2.
   core   shown as a card in the exit zone, in this order.
   voice  v6 (전사본): 민성's own line on this word, verbatim from his narration blocks (archive/materials/transcript/);
          shown under the plain definition, checked by tools/check.py like q. */
(function () {
  const AR = (window.AR = window.AR || {});
  const P = "package_1105/", T1 = P + "P2_엔지니어링패러다임.md", T3 = P + "P2_용어와필수개념.md", S1 = P + "P1_사무직벤치마크.md";
  const AW = "ai-workshop/build/payload/AGENTS.md", RM = "ai-workshop/README.md";
  const TR = "archive/materials/transcript/", BL = TR + "보완_전사본_근본내용_블록.md", FC = TR + "보완_전사본_사실검증.md";
  AR.glossary = [
    { id: "vibe", term: "바이브코딩", match: ["바이브코딩", "바이브 코딩"], core: 1,
      plain: "코드를 한 줄씩 직접 짜기보다, 만들고 싶은 것을 말로 설명하고 AI가 만든 결과를 보며 고쳐 가는 방식이에요. 말을 처음 쓴 사람은 안드레 카파시예요(2025년 2월 2일).", q: "창시 게시물의 날짜는 2025년 2월 2일", s: { f: FC, l: 31 },
      voice: { t: "쉽게 말해서 느낌 좋은 코딩, 줄여서 느적 코딩이라는 느낌일 것이다.", s: { f: BL, l: 57 } } },
    { id: "prompt", term: "프롬프트", match: ["프롬프트", "Prompt", "prompt"], core: 2,
      plain: "AI에게 보내는 지시문 한 덩어리예요. '이렇게 해 줘'라고 쓰는 바로 그 글이에요.", q: "모델에게 주는 지시문 한 개", s: { f: T1, s: "§0", l: 12 } },
    { id: "context", term: "컨텍스트", match: ["컨텍스트 윈도우", "컨텍스트", "Context", "context"], core: 3,
      plain: "AI가 지금 이 순간 볼 수 있는 정보 전부예요. 대화, 붙여 넣은 파일, 도구 결과가 모두 여기에 들어가고, 그릇(컨텍스트 윈도우)이 가득 차면 앞의 내용을 잘 기억하지 못해요.", q: "모델이 지금 볼 수 있는 정보 전부 (그릇 = 컨텍스트 윈도우)", s: { f: T3, s: "요약표", l: 169 } },
    { id: "token", term: "토큰", match: ["토큰"], core: 4,
      plain: "AI가 글을 세는 작은 조각 단위예요. 글이 길수록 토큰이 늘고, 그만큼 시간과 요금이 들어요.", q: "모델이 글을 세는 단위 = 작업량·요금·한도의 단위", s: { f: T3, s: "요약표", l: 168 } },
    { id: "agent", term: "에이전트", match: ["에이전트", "Agent", "agent"], core: 5,
      plain: "대답만 하는 챗봇이 아니라, 도구를 써서 파일을 고치고 명령을 실행하며 일을 끝까지 해내는 AI예요.", q: "LLM이 루프 안에서 자율적으로 도구를 사용하는 것", s: { f: T1, s: "§6", l: 149 } ,
      voice: { t: "목적을 가지고 루프를 반복해서 목적을 달성하려고 노력하는 LMM", s: { f: BL, l: 170 } } },
    { id: "subagent", term: "서브에이전트", match: ["서브에이전트", "sub-agent", "Sub-agent"], core: 0,
      plain: "큰 일을 쪼개 맡기는 보조 에이전트예요. 깨끗한 컨텍스트에서 따로 일하고 결과만 돌려줘요.", q: "깨끗한 컨텍스트를 가진 서브에이전트에게 위임", s: { f: T1, s: "§2", l: 54 } },
    { id: "harness", term: "하네스", match: ["하네스", "Harness", "harness"], core: 6,
      plain: "AI 모델을 감싸는 작업 환경이에요. 어떤 도구를 쓰게 할지, 어디까지 허락할지, 무엇으로 결과를 검사할지 정해 두는 틀이에요. 모델 + 하네스 = 에이전트.", q: "모델이 에이전트로서 행동할 수 있게 해 주는 시스템", s: { f: T1, s: "§3", l: 71 } ,
      voice: { t: "모델에게 방향을 조정시키고 그 방향으로만 나오게끔 제약을 추가하는 것, 그것이 하네스다.", s: { f: BL, l: 184 } } },
    { id: "loop", term: "루프", match: ["루프", "Loop"], core: 7,
      plain: "목표를 정해 두면 AI가 '해 보기 → 확인 → 고치기'를 끝날 때까지 되풀이하는 구조예요. 언제 끝난 건지(done)를 미리 정해 둬야 멈출 수 있어요.", q: "목적을 정의하면 AI가 완료될 때까지 반복하는 재귀적 목표", s: { f: T1, s: "§4", l: 96 } },
    { id: "graph", term: "그래프 (노드·엣지)", match: ["그래프", "노드", "엣지", "Nodes", "Edges"], zones: ["p2", "exit"], core: 0,
      plain: "여러 AI와 작업이 어떻게 이어져 일을 넘기는지 그린 연결도예요. 점(노드)이 일을 하고, 선(엣지)이 다음 차례를 정해요.", q: "Nodes가 일을 하고, Edges가 전이를 정의하고, State가 그래프를 따라 흐른다", s: { f: T1, s: "§5", l: 124 } },
    { id: "tool", term: "도구 호출", match: ["도구 호출", "도구 레지스트리"], core: 8,
      plain: "에이전트가 실제 일을 맡기는 기능 하나하나예요. 파일 읽기·쓰기, 명령 실행, 웹 검색 같은 것들이 AI의 손발이에요.", q: "에이전트가 실제 실행을 맡기는 기능 (손발)", s: { f: T3, s: "요약표", l: 159 } },
    { id: "mcp", term: "MCP", match: ["MCP"], core: 9,
      plain: "AI가 외부 도구(검색, 파일, 앱)를 부를 때 쓰는 공통 규격이에요. 도구마다 연결 방식을 새로 만들지 않아도 돼요.", q: "MCP(모델이 외부 도구를 부르는 표준 규격)", s: { f: AW, s: "공통 규칙", l: 70 } },
    { id: "api", term: "API", match: ["API"], core: 10,
      plain: "프로그램끼리 정해진 규칙대로 요청하고 답을 받는 창구예요. 식당 주문 창구처럼, 안쪽을 몰라도 메뉴대로 주문하면 돼요.", q: "프로그램끼리 규칙대로 요청·응답하는 창구", s: { f: T3, s: "요약표", l: 158 } },
    { id: "apikey", term: "API 키", match: ["API 키"], core: 11,
      plain: "API를 쓸 수 있게 해 주는 개인 비밀번호 같은 문자열이에요. 요금이 이 키로 계산되니 설치 화면에만 입력하고, 채팅·파일·스크린샷에는 남기지 마세요.", q: "화면에서만 입력", s: { f: RM, s: "설치되는 것", l: 15 } },
    { id: "repo", term: "리포지토리 (저장소)", match: ["리포지토리", "저장소", "repository"], core: 12,
      plain: "프로젝트 파일과 바뀐 이력을 함께 담는 폴더 단위예요. GitHub에 올려 두면 백업도 되고 여럿이 함께 고칠 수 있어요.", q: "코드가 담기는 폴더 단위를 저장소(repository)라고 부른다", s: { f: T3, s: "1-1", l: 13 } },
    { id: "github", term: "GitHub", match: ["GitHub", "깃허브"], core: 13,
      plain: "코드를 인터넷에 저장하고 여럿이 함께 고치는 서비스예요. 바뀐 이력을 실제로 기록하는 엔진은 Git이에요.", q: "코드 저장·공유·협업 플랫폼 (엔진은 Git)", s: { f: T3, s: "요약표", l: 155 } },
    { id: "terminal", term: "터미널", match: ["터미널"], core: 14,
      plain: "글자로 컴퓨터에 명령을 내리는 창이에요. 설치기와 AI 도구가 여기서 명령을 실행하고, 결과도 글자로 보여 줘요.", s: null },
    { id: "deploy", term: "배포 (호스팅)", match: ["배포", "호스팅"], core: 15,
      plain: "내 컴퓨터에서만 보이던 결과물을 24시간 켜진 서버에 올려, 링크만 있으면 누구나 볼 수 있게 하는 일이에요.", q: "만든 것을 24시간 켜진 서버에 올려 누구나 접속하게 하기", s: { f: T3, s: "요약표", l: 156 } },
    { id: "spec", term: "스펙 (명세)", match: ["스펙", "명세"], core: 16,
      plain: "만들기 전에 '무엇을, 누구를 위해, 어디까지' 만들지 적어 둔 문서예요. 설치기에 든 spec-kit이 명세 → 계획 → 작업 목록 순서로 쓰게 도와줘요.", q: "명세 → 계획 → 작업 목록을 먼저 만든다", s: { f: AW, s: "전체 흐름", l: 9 } },
    { id: "diff", term: "diff", match: ["diff"], core: 17,
      plain: "두 버전 사이에서 바뀐 줄만 골라 보여 주는 표시예요. AI가 코드를 고치면 사람은 전체가 아니라 diff를 검토하면 돼요.", q: "두 버전 사이 바뀐 줄만 추린 표시", s: { f: T3, s: "요약표", l: 157 } },
    { id: "skill", term: "스킬", match: ["스킬", "SKILL.md"], core: 18,
      plain: "필요할 때만 꺼내 읽는 작업 매뉴얼 묶음이에요. SKILL.md 파일에 '언제, 어떻게' 일할지를 적어 둬요.", q: "필요할 때만 꺼내 읽는 작업 매뉴얼 패키지 (SKILL.md)", s: { f: T3, s: "요약표", l: 165 } },
    { id: "agentsmd", term: "AGENTS.md", match: ["AGENTS.md"], core: 19,
      plain: "프로젝트 폴더에 두는 AI용 설명서예요. 빌드 방법, 규칙, 건드리면 안 되는 곳을 한 번 적어 두면 매번 설명하지 않아도 돼요.", q: "모든 에이전트 공용 프로젝트 설명서", s: { f: T3, s: "요약표", l: 163 } },
    { id: "claudemd", term: "CLAUDE.md", match: ["CLAUDE.md"], core: 0,
      plain: "Claude Code만 읽는 지시서예요. 세션을 시작할 때마다 자동으로 읽혀요.", q: "Claude Code 전용, 매 세션 자동 적용되는 지시서", s: { f: T3, s: "요약표", l: 164 } },
    { id: "benchmark", term: "벤치마크", match: ["벤치마크"], core: 0,
      plain: "AI 실력을 비교하려고 만든 시험 문제 묶음이에요. 모두 만점에 가까우면 '대단하다'보다 '시험이 낡았다'는 신호예요.", q: "포화된 벤치마크(HumanEval 99%, MMLU-Pro 약 90%)는 \"대단함\"의 근거가 아니라 \"시험이 낡았다\"는 신호", s: { f: S1, s: "정리", l: 201 } },
    { id: "compaction", term: "압축", match: ["압축", "compaction"], zones: ["p2", "exit"], core: 0,
      plain: "대화가 길어지면 앞부분을 요약본으로 바꿔 끼워 컨텍스트 공간을 확보하는 기능이에요.", q: "대화를 요약본으로 갈아 끼워 컨텍스트 공간 확보", s: { f: T3, s: "요약표", l: 170 } },
    { id: "openweights", term: "오픈웨이트", match: ["오픈웨이트"], core: 0,
      plain: "학습이 끝난 모델 파일(가중치)을 공개한 모델이에요. 내려받아 직접 돌릴 수 있지만, 만든 과정까지 공개하는 오픈소스와는 달라요.", q: "가중치 파일을 공개한 모델 (오픈소스와는 다름)", s: { f: T3, s: "요약표", l: 162 } },
    { id: "slash", term: "슬래시 명령어", match: ["슬래시 명령어", "슬래시 명령"], core: 0,
      plain: "/로 시작하는 단축 명령이에요. /speckit.specify처럼 자주 하는 일을 한 줄로 불러요.", q: "/로 부르는 단축 명령 (스킬도 여기서 부른다)", s: { f: T3, s: "요약표", l: 171 } },
    { id: "thinking", term: "사고 수준", match: ["사고 수준"], core: 0,
      plain: "AI가 답하기 전에 얼마나 오래 생각할지 정하는 다이얼이에요. 높이면 깊어지지만 느리고 비싸져요.", q: "답 전에 얼마나 생각할지의 다이얼 (속도·비용 ↔ 깊이)", s: { f: T3, s: "요약표", l: 160 } },
    { id: "routine", term: "루틴", match: ["루틴"], core: 0,
      plain: "정해 둔 일정에 따라 AI가 같은 작업을 알아서 되풀이하는 자동 작업이에요.", q: "일정에 따라 반복 실행되는 자동 작업", s: { f: T3, s: "요약표", l: 166 } },
    { id: "deterministic", term: "결정론적 도구", match: ["결정론적 도구"], core: 0,
      plain: "같은 입력을 넣으면 언제나 같은 결과가 나오는 프로그램이에요. 계산이나 테스트처럼 확정이 필요한 일은 AI보다 이쪽에 맡겨요.", q: "같은 입력 → 같은 출력이 보장되는 프로그램", s: { f: T3, s: "요약표", l: 167 } },
    { id: "rot", term: "컨텍스트 부식", match: ["컨텍스트 부식"], core: 0,
      plain: "컨텍스트가 길어질수록 AI의 성능이 떨어지는 현상이에요. 이 워크숍에서는 '컨텍스트 부식'이라고 불러요. 몇 %부터 시작되는지는 확인된 수치가 없어요.", q: "컨텍스트가 길어질수록 성능이 떨어지는 현상이 보고된다", s: { f: FC, l: 287 } },
    { id: "hook", term: "훅", match: ["훅"], core: 0,
      plain: "에이전트가 한 턴을 마치고 멈추려 할 때, 정해 둔 검사나 규칙을 자동으로 실행해서 다음 턴을 이어 가게 하는 장치예요.", q: "얘가 멈추지 않고 계속해서 턴을 이어나갈 수 있게끔 채찍을 휘두르는 것이다", s: { f: BL, l: 251 },
      voice: { t: "얘가 멈추지 않고 계속해서 턴을 이어나갈 수 있게끔 채찍을 휘두르는 것이다. 그런 것을 이제 훅이라고 하는데", s: { f: BL, l: 251 } } },
    { id: "metaprompt", term: "메타 프롬프트", match: ["메타 프롬프트"], core: 0,
      plain: "AI에게 '내가 쓸 프롬프트를 짜 줘'라고 먼저 맡기는 방법이에요. AI가 인터뷰하듯 질문해서 무엇을 왜 원하는지 파악한 뒤 프롬프트를 만들어 줘요.", q: "여러분들을 거의 인터뷰해서 의도를 파악하고", s: { f: BL, l: 344 },
      voice: { t: "그래서 여러분들이 프롬프트를 짤 때 메타 프롬프트 짜달라고 하고 클로드나 GPT한테 프롬프트까지 짜자는 것까지 맡겨주는 편이 아주 좋은 수준의 좋은 방법이 될 수 있다.", s: { f: BL, l: 345 } } },
    { id: "intent", term: "의도 (Intent)", match: ["의도"], core: 0,
      plain: "무엇을 만드는지(스펙)가 아니라 왜 그렇게 만드는지예요. 의도를 적어 주지 않으면 AI는 겉모습만 따라 하기 쉬워요.", q: "왜 이렇게 개발해야 되는지에 대한 의도가 없기 때문에", s: { f: BL, l: 346 },
      voice: { t: "그래서 이 의도를 챙겨주는 것이 코딩, 바이브 코딩 안에서 굉장히 중요할 수 있다.", s: { f: BL, l: 346 } } },
  ];
})();
