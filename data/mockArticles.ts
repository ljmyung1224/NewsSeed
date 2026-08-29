import type { Article, KidArticleContent } from "@/types";

type MockArticleSeed = Omit<Article, "source" | "kidContent" | "generatedAt" | "sourceType"> & KidArticleContent;

const mockArticleSeeds: MockArticleSeed[] = [
  {
    id: "moon-garden", category: "우주", emoji: "🌕", color: "#7267f0", difficulty: "3-4", estimatedReadingTime: 2,
    title: "달에도 작은 정원을 만들 수 있을까요?",
    summary: "과학자들이 달의 흙과 비슷한 땅에서 식물을 키우는 실험을 하고 있어요.",
    content: [
      "우주인이 달에서 오래 지내려면 지구에서 모든 먹거리를 가져가는 대신, 달에서 직접 식물을 키우는 방법이 필요해요.",
      "과학자들은 달의 흙과 아주 비슷하게 만든 흙에 씨앗을 심었습니다. 식물은 처음에는 천천히 자랐지만, 빛과 물을 알맞게 주자 작은 잎을 틔웠어요.",
      "아직 달의 강한 방사선과 큰 온도 차이라는 문제가 남아 있어요. 연구팀은 식물을 보호하는 온실을 만들면 달 정원도 가능할 것으로 기대하고 있습니다."
    ],
    highlight: "작은 씨앗 한 알이 미래의 우주 탐험을 도울 수 있어요.",
    vocabulary: [{ word: "방사선", meaning: "눈에는 보이지 않지만 공간을 지나가며 물질에 영향을 주는 에너지예요." }, { word: "온실", meaning: "햇빛과 따뜻한 온도를 이용해 식물을 잘 자라게 만든 공간이에요." }],
    quiz: [{ id: "mq1", question: "과학자들이 달에서 식물을 키우려는 가장 큰 이유는 무엇일까요?", options: ["달을 초록색으로 칠하려고", "우주인이 먹거리를 직접 기르려고", "달의 온도를 낮추려고"], answer: 1, explanation: "달에서 직접 식물을 키우면 지구에서 가져갈 먹거리의 양을 줄일 수 있어요." }]
  },
  {
    id: "football-record", category: "스포츠", emoji: "⚽", color: "#ff9d42", difficulty: "3-4", estimatedReadingTime: 2,
    title: "축구공은 경기에서 얼마나 멀리 달렸을까?",
    summary: "선수와 공의 움직임을 숫자로 기록하는 스포츠 기술을 알아봐요.",
    content: ["요즘 축구 경기장에는 선수와 공의 움직임을 살피는 작은 센서와 카메라가 있어요.", "이 장비는 선수가 달린 거리, 공의 속도, 패스가 이어진 횟수를 실시간으로 기록합니다. 감독은 이 자료를 보고 선수의 체력을 살피고 다음 작전을 세워요.", "하지만 숫자가 경기의 전부는 아니에요. 서로 돕는 마음과 순간의 판단처럼 숫자로 표현하기 어려운 능력도 승리를 만듭니다."],
    highlight: "기록은 더 좋은 질문을 찾게 해 주는 경기의 또 다른 지도예요.",
    vocabulary: [{ word: "센서", meaning: "빛, 움직임, 온도 같은 변화를 알아채서 신호로 바꾸는 장치예요." }, { word: "실시간", meaning: "어떤 일이 일어나는 바로 그때를 뜻해요." }],
    quiz: [{ id: "fq1", question: "경기장의 센서가 기록하지 않는 것은 무엇일까요?", options: ["선수가 달린 거리", "공의 속도", "선수의 기쁜 마음"], answer: 2, explanation: "마음과 순간의 판단은 숫자로 정확히 기록하기 어려워요." }]
  },
  {
    id: "money-value", category: "경제", emoji: "🪙", color: "#f2b938", difficulty: "5-6", estimatedReadingTime: 3,
    title: "우리가 쓰는 돈의 가치는 왜 달라질까요?",
    summary: "물건의 가격과 돈의 가치가 움직이는 까닭을 쉬운 예로 배워요.",
    content: ["같은 천 원으로 살 수 있는 물건의 양은 언제나 같지 않아요. 물건을 사고 싶은 사람은 많은데 물건이 부족하면 가격이 오를 수 있습니다.", "한국은행은 물가가 너무 빠르게 오르거나 경기가 지나치게 가라앉지 않도록 기준금리를 조절해요. 기준금리가 바뀌면 저축과 대출에 붙는 이자도 영향을 받아요.", "가격이 변하는 까닭을 알면 용돈을 언제 쓰고 얼마나 모을지 더 현명하게 생각할 수 있어요."],
    highlight: "경제를 배운다는 것은 내 선택이 세상과 어떻게 이어지는지 알아가는 일이에요.",
    vocabulary: [{ word: "물가", meaning: "여러 물건과 서비스의 가격을 한데 모아 살펴본 값이에요." }, { word: "기준금리", meaning: "은행에서 돈을 빌리거나 맡길 때 이자의 기준이 되는 숫자예요." }],
    quiz: [{ id: "eq1", question: "사고 싶은 사람은 많은데 물건이 부족하면 보통 어떻게 될까요?", options: ["가격이 오를 수 있어요", "모든 물건이 무료가 돼요", "돈이 사라져요"], answer: 0, explanation: "수요가 공급보다 많아지면 물건의 가격이 오를 수 있어요." }]
  },
  {
    id: "whale-song", category: "동물", emoji: "🐋", color: "#36a7ce", difficulty: "1-2", estimatedReadingTime: 2,
    title: "고래는 왜 노래를 부를까요?",
    summary: "아주 먼 바다까지 전해지는 고래의 특별한 대화를 들어봐요.",
    content: ["고래는 바닷속에서 길고 낮은 소리를 내요. 이 소리는 물속에서 아주 멀리까지 퍼집니다.", "고래는 노래로 친구의 위치를 찾고 서로 신호를 보내요. 어떤 고래의 노래는 계절에 따라 조금씩 달라지기도 합니다.", "과학자들은 바다에 마이크를 넣어 고래의 소리를 듣고, 고래가 어디로 이동하는지 연구하고 있어요."],
    highlight: "넓은 바다는 고래의 노래가 오가는 커다란 대화방이에요.",
    vocabulary: [{ word: "신호", meaning: "생각이나 상태를 다른 사람에게 알리기 위한 표시나 소리예요." }],
    quiz: [{ id: "wq1", question: "고래의 노래가 멀리 퍼지는 곳은 어디일까요?", options: ["바닷속", "운동장", "구름 위"], answer: 0, explanation: "고래의 낮은 소리는 물속에서 아주 멀리까지 퍼져요." }]
  },
  {
    id: "forest-network", category: "환경", emoji: "🌳", color: "#42b873", difficulty: "3-4", estimatedReadingTime: 2,
    title: "숲속 나무들은 서로 도울 수 있을까요?",
    summary: "땅속 곰팡이 실로 이어지는 놀라운 숲의 연결망을 만나봐요.",
    content: ["숲의 땅속에는 나무뿌리와 아주 가는 곰팡이 실이 이어져 있어요.", "이 연결을 통해 나무는 물과 영양분을 주고받을 수 있습니다. 큰 나무 주변에서 어린 나무가 자라는 데에도 도움을 줄 수 있어요.", "숲은 나무 한 그루의 모임이 아니라 여러 생물이 관계를 맺고 살아가는 커다란 생태계입니다."],
    highlight: "건강한 숲은 서로 연결된 생명들이 함께 만든 결과예요.",
    vocabulary: [{ word: "영양분", meaning: "생물이 자라고 힘을 내는 데 필요한 물질이에요." }, { word: "생태계", meaning: "생물과 주변 환경이 서로 영향을 주고받는 하나의 세계예요." }],
    quiz: [{ id: "tq1", question: "나무뿌리와 곰팡이 실을 통해 오갈 수 있는 것은?", options: ["물과 영양분", "축구공", "별빛"], answer: 0, explanation: "나무들은 땅속 연결을 통해 물과 영양분을 주고받을 수 있어요." }]
  },
  {
    id: "game-music", category: "게임", emoji: "🎮", color: "#e36e94", difficulty: "3-4", estimatedReadingTime: 2,
    title: "게임 음악은 어떻게 마음을 움직일까요?",
    summary: "장면에 따라 달라지는 음악이 게임에 주는 힘을 살펴봐요.",
    content: ["게임 속 음악은 플레이어에게 다음 상황을 알려주는 역할을 해요.", "빠른 음악은 긴장감을 높이고, 잔잔한 음악은 안전한 곳에 도착했다는 느낌을 줍니다. 작곡가는 장면의 색과 움직임까지 살피며 곡을 만들어요.", "같은 장면도 음악이 달라지면 전혀 다른 이야기처럼 느껴질 수 있습니다."],
    highlight: "음악은 보이지 않지만 게임의 이야기를 이끄는 안내자예요.",
    vocabulary: [{ word: "긴장감", meaning: "무슨 일이 생길지 몰라 마음이 조마조마한 느낌이에요." }, { word: "작곡가", meaning: "새로운 음악을 만드는 사람이에요." }],
    quiz: [{ id: "gq1", question: "빠른 게임 음악은 보통 어떤 느낌을 높일까요?", options: ["긴장감", "졸린 느낌", "배고픔"], answer: 0, explanation: "빠른 리듬은 곧 중요한 일이 생길 듯한 긴장감을 줘요." }]
  }
];

export const mockArticles: Article[] = mockArticleSeeds.map(({ title, summary, content, highlight, vocabulary, quiz, ...article }) => ({
  ...article,
  source: {
    title: "NewsSeed 개발용 예시 기사",
    url: "",
    publisher: "NewsSeed",
    publishedAt: "2026-08-29",
    description: "실제 뉴스 API 연동 전 콘텐츠 흐름을 검증하기 위한 개발용 기사입니다.",
  },
  kidContent: { title, summary, content, highlight, vocabulary, quiz },
  generatedAt: "2026-08-29T00:00:00.000Z",
  sourceType: "mock" as const,
}));
