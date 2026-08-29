import "server-only";
import type { ContentGenerationPreferences, KidArticleContent } from "@/types";
import type { RawNewsArticle } from "@/services/news/fetchNews";
import { createNewsForKidsPrompt } from "@/lib/ai/newsPrompt";

export interface KidsContentTransformer {
  transform(article: RawNewsArticle, preferences: ContentGenerationPreferences, systemPrompt: string): Promise<KidArticleContent>;
}

export async function transformNewsForKids(article: RawNewsArticle, preferences: ContentGenerationPreferences, transformer?: KidsContentTransformer): Promise<KidArticleContent | null> {
  if (!process.env.OPENAI_API_KEY || !transformer) return null;
  try { return await transformer.transform(article, preferences, createNewsForKidsPrompt(preferences)); }
  catch (error) { console.error("[NewsSeed] Failed to transform news for kids.", error); return null; }
}
