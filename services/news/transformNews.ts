import "server-only";
import type { ContentGenerationPreferences, KidArticleContent } from "@/types";
import type { RawNewsArticle } from "@/services/news/fetchNews";
import { createNewsForKidsPrompt } from "@/lib/ai/newsPrompt";
import type { AIContentProvider } from "@/services/ai/provider";

export type KidsContentTransformer = AIContentProvider;

export async function transformNewsForKids(article: RawNewsArticle, preferences: ContentGenerationPreferences, transformer?: KidsContentTransformer): Promise<KidArticleContent | null> {
  if (!transformer?.isConfigured()) return null;
  try { return await transformer.transform(article, preferences, createNewsForKidsPrompt(preferences)); }
  catch (error) { console.warn(`[NewsSeed] Kid-news transform failed: ${error instanceof Error ? error.message : "unknown error"}`); return null; }
}
