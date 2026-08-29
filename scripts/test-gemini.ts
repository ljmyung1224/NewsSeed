import { createNewsForKidsPrompt } from "../lib/ai/newsPrompt";
import { GeminiCallError, generateGeminiText, transformWithGemini } from "../services/ai/gemini-core";
import { GEMINI_MODEL } from "../services/ai/gemini-config";
import type { ContentGenerationPreferences } from "../types";

const preferences: ContentGenerationPreferences = {
  gradeLevel: "3-4", readingLevel: "normal", explanationLevel: "easy", interests: ["과학"], customInterests: [],
};

async function main() {
  console.log(`GEMINI_API_KEY present: ${Boolean(process.env.GEMINI_API_KEY)}`);
  console.log(`model: ${GEMINI_MODEL}`);
  try {
  const plainText = await generateGeminiText("다음 문장을 초등학교 3학년이 이해하기 쉽게 한 문장으로 설명해줘: 지구는 태양 주위를 공전한다.");
  console.log("[plain] success:", plainText);

  const content = await transformWithGemini({
    title: "지구는 태양 주위를 돈다",
    description: "지구는 자전하면서 약 1년에 한 번 태양 주위를 공전한다.",
    url: "https://example.com/earth", publisher: "Gemini diagnostic", publishedAt: new Date().toISOString(), category: "과학",
  }, preferences, createNewsForKidsPrompt(preferences));
  console.log("[structured] success:", { title: content.title, paragraphs: content.easyExplanation.length, vocabulary: content.vocabulary.length, quiz: content.quiz.length });
  } catch (error) {
    if (error instanceof GeminiCallError) console.error("[Gemini test failed]", { name: error.name, message: error.message, status: error.status, providerErrorCode: error.providerErrorCode, model: GEMINI_MODEL, stage: error.stage, reason: error.reason });
    else console.error("[Gemini test failed]", { name: error instanceof Error ? error.name : "UnknownError", message: error instanceof Error ? error.message : "Unknown error", model: GEMINI_MODEL, stage: "unknown" });
    process.exitCode = 1;
  }
}

void main();
