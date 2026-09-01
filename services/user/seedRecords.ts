import type { Article, Category, SeedRecord } from "@/types";
import { recordDateKey } from "@/lib/growth";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

interface SeedRecordRow {
  article_id: string;
  article_title: string;
  category: Category;
  source_url: string;
  completed_at: string;
  completed_on: string;
  xp_earned: number;
  quiz_completed: boolean;
  kid_article_cache_key: string | null;
  article_snapshot: Article;
}

function isArticle(value: unknown): value is Article {
  if (!value || typeof value !== "object") return false;
  const article = value as Partial<Article>;
  return Boolean(article.id && article.category && article.source?.url && article.kidContent?.title);
}

function fromRow(row: SeedRecordRow): SeedRecord | null {
  if (!isArticle(row.article_snapshot)) return null;
  return {
    article: row.article_snapshot,
    completedAt: row.completed_at,
    xpEarned: row.xp_earned,
    quizCompleted: row.quiz_completed,
    kidArticleCacheKey: row.kid_article_cache_key ?? undefined,
  };
}

export async function loadCloudSeedRecords(userId: string): Promise<SeedRecord[]> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return [];
  const records: SeedRecord[] = [];
  const pageSize = 500;
  for (let from = 0; ; from += pageSize) {
    const { data, error } = await supabase.from("user_seed_records").select("article_id,article_title,category,source_url,completed_at,completed_on,xp_earned,quiz_completed,kid_article_cache_key,article_snapshot").eq("user_id", userId).order("completed_at", { ascending: false }).range(from, from + pageSize - 1);
    if (error) {
      if (process.env.NODE_ENV === "development") console.warn(`[NewsSeed][Seeds][load] Cloud seed load failed. code=${error.code ?? "unknown"} message=${error.message}`);
      return records;
    }
    const rows = (data ?? []) as SeedRecordRow[];
    records.push(...rows.flatMap(row => { const record = fromRow(row); return record ? [record] : []; }));
    if (rows.length < pageSize) break;
  }
  return records;
}

export async function saveCloudSeedRecords(userId: string, records: SeedRecord[]): Promise<boolean> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase || !records.length) return Boolean(supabase);
  const rows = records.map(record => ({
    user_id: userId,
    article_id: record.article.id,
    article_title: record.article.kidContent.title,
    category: record.article.category,
    source_url: record.article.source.url,
    completed_at: record.completedAt,
    completed_on: recordDateKey(record),
    xp_earned: record.xpEarned,
    quiz_completed: record.quizCompleted,
    kid_article_cache_key: record.kidArticleCacheKey ?? null,
    article_snapshot: record.article,
    updated_at: new Date().toISOString(),
  }));
  for (let start = 0; start < rows.length; start += 100) {
    const { error } = await supabase.from("user_seed_records").upsert(rows.slice(start, start + 100), { onConflict: "user_id,article_id,completed_on" });
    if (error) {
      if (process.env.NODE_ENV === "development") console.warn(`[NewsSeed][Seeds][save] Cloud seed save failed. code=${error.code ?? "unknown"} message=${error.message}`);
      return false;
    }
  }
  return true;
}
