export type Category = "경제" | "과학" | "사회" | "국제" | "환경" | "문화" | "스포츠" | "기술" | "동물" | "우주";

export type GradeLevel = "1-2" | "3-4" | "5-6";
export type ReadingLevel = "easy" | "normal" | "challenge";
export type ExplanationLevel = "very-easy" | "easy" | "detailed";

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
  easyExplanation: string[];
  whyItMatters: string[];
  vocabulary: Vocabulary[];
  keyTakeaway: string;
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

export interface UserPreferences {
  nickname: string;
  gradeLevel: GradeLevel;
  interests: Category[];
  customInterests: string[];
  readingLevel: ReadingLevel;
  explanationLevel: ExplanationLevel;
  dailyArticleCount: number;
  dailyDeliveryTime?: string;
  onboardingCompleted: boolean;
}

export type ContentGenerationPreferences = Pick<UserPreferences, "gradeLevel" | "readingLevel" | "explanationLevel"> & Partial<Pick<UserPreferences, "interests" | "customInterests">>;

/** Backward-compatible name used by existing UI components. */
export type UserProfile = UserPreferences;

export interface LearningStats {
  xp: number;
  streak: number;
  lastCompletedDate: string | null;
  completedDates: string[];
  articleCompletions: Record<string, string[]>;
}

export interface AppState {
  profile: UserPreferences | null;
  stats: LearningStats;
}
