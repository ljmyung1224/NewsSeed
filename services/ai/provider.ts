import "server-only";
import type { ContentGenerationPreferences, KidArticleContent } from "@/types";
import type { RawNewsArticle } from "@/services/news/fetchNews";

/** Server-only boundary for an AI content generator. */
export interface AIContentProvider {
  isConfigured(): boolean;
  transform(
    article: RawNewsArticle,
    preferences: ContentGenerationPreferences,
    systemPrompt: string,
  ): Promise<KidArticleContent>;
}
