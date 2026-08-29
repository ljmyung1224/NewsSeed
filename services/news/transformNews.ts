import "server-only";
import type { GradeLevel, KidArticleContent } from "@/types";
import type { RawNewsArticle } from "@/services/news/fetchNews";
import { createNewsForKidsPrompt } from "@/lib/ai/newsPrompt";

export interface KidsContentTransformer {
  transform(article: RawNewsArticle, difficulty: GradeLevel, systemPrompt: string): Promise<KidArticleContent>;
}

/**
 * Server-only AI boundary. No LLM is called until a transformer adapter is supplied.
 * Returning null prevents placeholder text from being mistaken for verified editorial content.
 */
export async function transformNewsForKids(
  article: RawNewsArticle,
  difficulty: GradeLevel,
  transformer?: KidsContentTransformer,
): Promise<KidArticleContent | null> {
  if (!process.env.OPENAI_API_KEY || !transformer) return null;
  try {
    return await transformer.transform(article, difficulty, createNewsForKidsPrompt(difficulty));
  } catch (error) {
    console.error("[NewsSeed] Failed to transform news for kids.", error);
    return null;
  }
}
