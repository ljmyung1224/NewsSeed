import type { AppState, ExplanationLevel, GradeLevel, LearningStats, ReadingLevel, UserProfile } from "@/types";
import { initialStats, normalizePreferences } from "@/lib/storage";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

interface UserStateRow {
  nickname: string | null;
  grade: GradeLevel | null;
  interests: UserProfile["interests"] | null;
  reading_level: ReadingLevel | null;
  explanation_level: ExplanationLevel | null;
  daily_article_count: number | null;
  daily_delivery_time: string | null;
  xp: number;
  streak: number;
  last_completed_date: string | null;
  completed_dates: string[] | null;
  article_completions: LearningStats["articleCompletions"] | null;
}

export async function loadCloudState(userId: string): Promise<AppState | null> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return null;
  const { data, error } = await supabase.from("user_learning_state").select("nickname,grade,interests,reading_level,explanation_level,daily_article_count,daily_delivery_time,xp,streak,last_completed_date,completed_dates,article_completions").eq("user_id", userId).maybeSingle<UserStateRow>();
  if (error || !data) return null;
  const profile = normalizePreferences({ nickname: data.nickname, gradeLevel: data.grade, interests: data.interests, readingLevel: data.reading_level, explanationLevel: data.explanation_level, dailyArticleCount: data.daily_article_count, dailyDeliveryTime: data.daily_delivery_time ?? undefined });
  return { profile, stats: { ...initialStats, xp: data.xp, streak: data.streak, lastCompletedDate: data.last_completed_date, completedDates: data.completed_dates ?? [], articleCompletions: data.article_completions ?? {} } };
}

export async function saveCloudState(userId: string, state: AppState) {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return false;
  const { error } = await supabase.from("user_learning_state").upsert({ user_id: userId, nickname: state.profile?.nickname ?? null, grade: state.profile?.gradeLevel ?? null, interests: state.profile?.interests ?? [], reading_level: state.profile?.readingLevel ?? "normal", explanation_level: state.profile?.explanationLevel ?? "easy", daily_article_count: state.profile?.dailyArticleCount ?? 3, daily_delivery_time: state.profile?.dailyDeliveryTime ?? null, xp: state.stats.xp, streak: state.stats.streak, last_completed_date: state.stats.lastCompletedDate, completed_dates: state.stats.completedDates, article_completions: state.stats.articleCompletions, updated_at: new Date().toISOString() }, { onConflict: "user_id" });
  return !error;
}
