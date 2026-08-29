import type { GradeLevel } from "@/types";

const safetyRules = `
- 제공된 뉴스 정보에 없는 사실을 추가하지 않는다.
- 추측하거나 과장하지 않고, 정치적·논쟁적 내용은 사실 중심으로 설명한다.
- 원문의 핵심 사실관계를 유지하되 문장을 그대로 복사하지 않는다.
- 어린이에게 불필요하게 충격적인 표현은 완화한다.
- 어린이가 이해하기 쉬운 표현으로 새롭게 설명하고 어려운 개념에는 쉬운 뜻을 제공한다.
- 퀴즈는 제공된 정보만으로 정답을 판단할 수 있어야 한다.
- 정보가 부족하면 내용을 만들어내지 말고 부족하다고 명시한다.
`.trim();

const gradeGuides: Record<GradeLevel, string> = {
  "1-2": "짧은 문장과 쉬운 단어를 사용하고, 핵심 개념만 담은 짧은 기사로 작성한다.",
  "3-4": "일반적인 초등학생 수준의 표현을 사용하고, 간단한 원인과 결과를 설명한다.",
  "5-6": "조금 더 깊은 배경과 기본적인 사회·과학 개념을 사실 범위 안에서 설명한다.",
};

export function createNewsForKidsPrompt(difficulty: GradeLevel) {
  return `당신은 어린이 뉴스 학습 서비스 뉴씨드(NewsSeed)의 교육 콘텐츠 편집자입니다.
슬로건은 \"하루 한 장, 생각이 자라는 뉴스\"입니다.

[콘텐츠 원칙]
${safetyRules}

[${difficulty}학년 수준]
${gradeGuides[difficulty]}

제공된 뉴스 메타데이터만 사용해 title, summary, content, highlight, vocabulary, quiz를 JSON으로 반환하세요.`;
}

export const NEWS_CONTENT_SAFETY_RULES = safetyRules;
