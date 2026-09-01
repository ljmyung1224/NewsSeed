import type { AppState, ExplanationLevel, GradeLevel, LearningStats, ReadingLevel, UserProfile } from "@/types";
import { initialStats, normalizeLearningStats, normalizePreferences } from "@/lib/storage";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

interface UserStateRow {
  nickname: string | null;
  grade: GradeLevel | null;
  interests: UserProfile["interests"] | null;
  custom_interests: string[] | null;
  reading_level: ReadingLevel | null;
  explanation_level: ExplanationLevel | null;
  daily_article_count: number | null;
  daily_delivery_time: string | null;
  onboarding_completed: boolean;
  created_at: string;
  xp: number;
  streak: number;
  last_completed_date: string | null;
  completed_dates: string[] | null;
  article_completions: LearningStats["articleCompletions"] | null;
  mission_rewards: LearningStats["missionRewards"] | null;
  leaf_currency: number | null;
  leaf_reward_events: LearningStats["leafRewardEvents"] | null;
  tree_item_purchases: LearningStats["treeItemPurchases"] | null;
  owned_tree_items: string[] | null;
  equipped_tree_items: LearningStats["equippedTreeItems"] | null;
  tree_customization_unlock_seen: boolean | null;
  tree_updated_at: string | null;
}

export async function loadCloudState(userId: string): Promise<AppState | null> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return null;
  const { data, error } = await supabase.from("user_learning_state").select("nickname,grade,interests,custom_interests,reading_level,explanation_level,daily_article_count,daily_delivery_time,onboarding_completed,created_at,xp,streak,last_completed_date,completed_dates,article_completions,mission_rewards,leaf_currency,leaf_reward_events,tree_item_purchases,owned_tree_items,equipped_tree_items,tree_customization_unlock_seen,tree_updated_at").eq("user_id", userId).maybeSingle<UserStateRow>();
  if (error || !data) return null;
  const profile = normalizePreferences({ nickname: data.nickname, gradeLevel: data.grade, interests: data.interests, customInterests: data.custom_interests, readingLevel: data.reading_level, explanationLevel: data.explanation_level, dailyArticleCount: data.daily_article_count, dailyDeliveryTime: data.daily_delivery_time ?? undefined, onboardingCompleted: data.onboarding_completed });
  return { profile, stats: normalizeLearningStats({ ...initialStats, xp: data.xp, streak: data.streak, lastCompletedDate: data.last_completed_date, completedDates: data.completed_dates ?? [], articleCompletions: data.article_completions ?? {}, missionRewards: data.mission_rewards ?? {}, leafCurrency: data.leaf_currency ?? 0, leafRewardEvents: data.leaf_reward_events ?? {}, treeItemPurchases: data.tree_item_purchases ?? {}, ownedTreeItems: data.owned_tree_items ?? [], equippedTreeItems: data.equipped_tree_items ?? initialStats.equippedTreeItems, treeCustomizationUnlockSeen: data.tree_customization_unlock_seen ?? false, treeUpdatedAt: data.tree_updated_at }) };
}

export async function saveCloudState(userId: string, state: AppState) {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return false;
  try {
    const { error } = await supabase.from("user_learning_state").upsert({ user_id: userId, nickname: state.profile?.nickname ?? null, grade: state.profile?.gradeLevel ?? null, interests: state.profile?.interests ?? [], custom_interests: state.profile?.customInterests ?? [], reading_level: state.profile?.readingLevel ?? "normal", explanation_level: state.profile?.explanationLevel ?? "easy", daily_article_count: state.profile?.dailyArticleCount ?? 1, daily_delivery_time: state.profile?.dailyDeliveryTime ?? null, onboarding_completed: state.profile?.onboardingCompleted ?? false, xp: state.stats.xp, streak: state.stats.streak, last_completed_date: state.stats.lastCompletedDate, completed_dates: state.stats.completedDates, article_completions: state.stats.articleCompletions, mission_rewards: state.stats.missionRewards, leaf_currency: state.stats.leafCurrency, leaf_reward_events: state.stats.leafRewardEvents, tree_item_purchases: state.stats.treeItemPurchases, owned_tree_items: state.stats.ownedTreeItems, equipped_tree_items: state.stats.equippedTreeItems, tree_customization_unlock_seen: state.stats.treeCustomizationUnlockSeen, tree_updated_at: state.stats.treeUpdatedAt, updated_at: new Date().toISOString() }, { onConflict: "user_id" });
    if (error) {
      if (process.env.NODE_ENV === "development") {
        const diagnostic = `code=${error.code ?? "unknown"} message=${error.message ?? "unknown"} details=${error.details ?? "none"} hint=${error.hint ?? "none"}`;
        console.warn(`[NewsSeed][Profile][save] Supabase upsert failed. ${diagnostic}`);
      }
      return false;
    }
    return true;
  } catch (error) {
    if (process.env.NODE_ENV === "development") console.warn(`[NewsSeed][Profile][save] Unexpected save failure. name=${error instanceof Error ? error.name : "UnknownError"} message=${error instanceof Error ? error.message : "Unknown error"}`);
    return false;
  }
}
