export type Category = "과학" | "우주" | "동물" | "스포츠" | "게임" | "경제" | "세계" | "환경" | "문화";

export type GradeLevel = "1-2" | "3-4" | "5-6";

export interface VocabularyItem {
  word: string;
  meaning: string;
}

export type Vocabulary = VocabularyItem;

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  answer: number;
  explanation: string;
}

export type Quiz = QuizQuestion;

export interface ArticleSource {
  title: string;
  url: string;
  publisher: string;
  publishedAt: string;
  description?: string;
}

export interface KidArticleContent {
  title: string;
  summary: string;
  content: string[];
  highlight: string;
  vocabulary: Vocabulary[];
  quiz: Quiz[];
}

export interface Article {
  id: string;
  category: Category;
  difficulty: GradeLevel;
  estimatedReadingTime: number;
  source: ArticleSource;
  kidContent: KidArticleContent;
  generatedAt?: string;
  sourceType: "mock" | "news-api";
  /** Presentation metadata. Replace with an asset service when editorial images are added. */
  emoji: string;
  color: string;
}

export interface UserProfile {
  nickname: string;
  grade: GradeLevel;
  interests: Category[];
}

export interface LearningStats {
  xp: number;
  streak: number;
  lastCompletedDate: string | null;
  completedDates: string[];
  articleCompletions: Record<string, string[]>;
}

export interface AppState {
  profile: UserProfile | null;
  stats: LearningStats;
}
