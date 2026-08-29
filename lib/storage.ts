import type { AppState, Category, LearningStats, UserPreferences } from "@/types";
import { previousDate } from "@/lib/date";

export const STORAGE_KEY = "newseed-state-v1";
export const initialStats: LearningStats = { xp: 0, streak: 0, lastCompletedDate: null, completedDates: [], articleCompletions: {} };

function storageKey(userId?: string) { return userId ? `${STORAGE_KEY}:${userId}` : STORAGE_KEY; }

export function loadState(userId?: string): AppState {
  if (typeof window === "undefined") return { profile: null, stats: initialStats };
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey(userId)) ?? "null") as Partial<AppState> | null;
    return { profile: normalizePreferences(saved?.profile), stats: { ...initialStats, ...saved?.stats } };
  } catch { return { profile: null, stats: initialStats }; }
}

export function saveState(state: AppState, userId?: string) {
  localStorage.setItem(storageKey(userId), JSON.stringify(state));
}

export function clearAnonymousState() { localStorage.removeItem(STORAGE_KEY); }

export function completeArticle(stats: LearningStats, date: string, articleId: string): LearningStats {
  const current = stats.articleCompletions[date] ?? [];
  if (current.includes(articleId)) return stats;
  return { ...stats, xp: stats.xp + 10, articleCompletions: { ...stats.articleCompletions, [date]: [...current, articleId] } };
}

export function completeDay(stats: LearningStats, date: string): LearningStats {
  if (stats.completedDates.includes(date)) return stats;
  const streak = stats.lastCompletedDate === previousDate(date) ? stats.streak + 1 : 1;
  return { ...stats, xp: stats.xp + 10, streak, lastCompletedDate: date, completedDates: [...stats.completedDates, date] };
}

export const defaultPreferences: Omit<UserPreferences, "nickname" | "gradeLevel" | "interests"> = {
  customInterests: [],
  readingLevel: "normal",
  explanationLevel: "easy",
  dailyArticleCount: 3,
  onboardingCompleted: true,
};

export function normalizePreferences(value: unknown): UserPreferences | null {
  if (!value || typeof value !== "object") return null;
  const legacy = value as Omit<Partial<UserPreferences>, "interests"> & { grade?: UserPreferences["gradeLevel"]; interests?: string[] };
  if (!legacy.nickname || !(legacy.gradeLevel ?? legacy.grade) || !legacy.interests) return null;
  const interests = legacy.interests.map(item => item === "세계" ? "국제" : item === "게임" ? "기술" : item).filter((item): item is Category => ["경제","과학","사회","국제","환경","문화","스포츠","기술","동물","우주"].includes(item));
  return {
    nickname: legacy.nickname,
    gradeLevel: legacy.gradeLevel ?? legacy.grade!,
    interests,
    customInterests: normalizeCustomInterests(legacy.customInterests),
    readingLevel: legacy.readingLevel ?? defaultPreferences.readingLevel,
    explanationLevel: legacy.explanationLevel ?? defaultPreferences.explanationLevel,
    dailyArticleCount: Math.min(5, Math.max(1, legacy.dailyArticleCount ?? defaultPreferences.dailyArticleCount)),
    dailyDeliveryTime: legacy.dailyDeliveryTime,
    onboardingCompleted: legacy.onboardingCompleted ?? true,
  };
}

export function normalizeCustomInterests(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  const seen = new Set<string>();
  return value.flatMap(item => {
    if (typeof item !== "string") return [];
    const clean = item.trim().replace(/\s+/g, " ").slice(0, 20);
    const key = clean.toLocaleLowerCase("ko-KR");
    if (!clean || seen.has(key)) return [];
    seen.add(key);
    return [clean];
  }).slice(0, 10);
}

export function createProfile(preferences: UserPreferences): UserPreferences {
  return { ...preferences, nickname: preferences.nickname.trim() };
}
