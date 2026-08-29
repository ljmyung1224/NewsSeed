import "server-only";
import type { AIContentProvider } from "@/services/ai/provider";
import { transformWithGemini } from "@/services/ai/gemini-core";

export const geminiProvider: AIContentProvider = {
  isConfigured() {
    return Boolean(process.env.GEMINI_API_KEY);
  },
  transform(article, preferences, systemPrompt) {
    return transformWithGemini(article, preferences, systemPrompt);
  },
};
