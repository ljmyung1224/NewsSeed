import type { AppState, LearningStats, UserProfile } from "@/types";
import { previousDate } from "@/lib/date";

export const STORAGE_KEY = "newseed-state-v1";
export const initialStats: LearningStats = { xp: 0, streak: 0, lastCompletedDate: null, completedDates: [], articleCompletions: {} };

function storageKey(userId?: string) { return userId ? `${STORAGE_KEY}:${userId}` : STORAGE_KEY; }

export function loadState(userId?: string): AppState {
  if (typeof window === "undefined") return { profile: null, stats: initialStats };
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey(userId)) ?? "null") as Partial<AppState> | null;
    return { profile: saved?.profile ?? null, stats: { ...initialStats, ...saved?.stats } };
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

export function createProfile(nickname: string, grade: UserProfile["grade"], interests: UserProfile["interests"]): UserProfile {
  return { nickname: nickname.trim(), grade, interests };
}
