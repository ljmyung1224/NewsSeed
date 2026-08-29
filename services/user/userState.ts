import type { AppState, GradeLevel, LearningStats, UserProfile } from "@/types";
import { initialStats } from "@/lib/storage";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

interface UserStateRow {
  nickname: string | null;
  grade: GradeLevel | null;
  interests: UserProfile["interests"] | null;
  xp: number;
  streak: number;
  last_completed_date: string | null;
  completed_dates: string[] | null;
  article_completions: LearningStats["articleCompletions"] | null;
}

export async function loadCloudState(userId: string): Promise<AppState | null> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return null;
  const { data, error } = await supabase.from("user_learning_state").select("nickname,grade,interests,xp,streak,last_completed_date,completed_dates,article_completions").eq("user_id", userId).maybeSingle<UserStateRow>();
  if (error || !data) return null;
  const profile = data.nickname && data.grade && data.interests ? { nickname: data.nickname, grade: data.grade, interests: data.interests } : null;
  return { profile, stats: { ...initialStats, xp: data.xp, streak: data.streak, lastCompletedDate: data.last_completed_date, completedDates: data.completed_dates ?? [], articleCompletions: data.article_completions ?? {} } };
}

export async function saveCloudState(userId: string, state: AppState) {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return false;
  const { error } = await supabase.from("user_learning_state").upsert({ user_id: userId, nickname: state.profile?.nickname ?? null, grade: state.profile?.grade ?? null, interests: state.profile?.interests ?? [], xp: state.stats.xp, streak: state.stats.streak, last_completed_date: state.stats.lastCompletedDate, completed_dates: state.stats.completedDates, article_completions: state.stats.articleCompletions, updated_at: new Date().toISOString() }, { onConflict: "user_id" });
  return !error;
}
