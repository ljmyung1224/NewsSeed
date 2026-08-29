import "server-only";
import { createHash } from "node:crypto";
import type { ContentGenerationPreferences, KidArticleContent } from "@/types";
import type { RawNewsArticle } from "@/services/news/fetchNews";
import { createNewsForKidsPrompt } from "@/lib/ai/newsPrompt";
import type { AIContentProvider } from "@/services/ai/provider";
import { GeminiCallError } from "@/services/ai/gemini-core";
import { GEMINI_MODEL } from "@/services/ai/gemini-config";

export type KidsContentTransformer = AIContentProvider;

export async function transformNewsForKids(article: RawNewsArticle, preferences: ContentGenerationPreferences, transformer?: KidsContentTransformer): Promise<{ content: KidArticleContent | null; failureReason?: "gemini_failed" | "validation_failed" }> {
  if (!transformer?.isConfigured()) return { content: null, failureReason: "gemini_failed" };
  try {
    const content = await transformer.transform(article, preferences, createNewsForKidsPrompt(preferences));
    return { content: { ...content, quiz: content.quiz.slice(0, 1) } };
  }
  catch (error) {
    const candidateId = createHash("sha256").update(article.url).digest("hex").slice(0, 12);
    if (error instanceof GeminiCallError) {
      const details = { status: "failed", candidateId, category: article.category, model: GEMINI_MODEL, stage: error.stage, reason: error.reason, httpStatus: error.status, providerErrorCode: error.providerErrorCode, message: process.env.NODE_ENV === "development" ? error.message : undefined };
      if (process.env.NODE_ENV === "development" && error.reason === "article_not_transformable") console.info("[NewsSeed][Gemini][candidate-rejected]", details);
      else console.warn("[NewsSeed][Gemini]", details);
    }
    else console.warn("[NewsSeed][Gemini]", { status: "failed", candidateId, category: article.category, model: GEMINI_MODEL, stage: "unknown", reason: "unknown_error" });
    const failureReason = error instanceof GeminiCallError && ["parsing", "validation", "response"].includes(error.stage) ? "validation_failed" : "gemini_failed";
    return { content: null, failureReason };
  }
}
