import { createNewsForKidsPrompt } from "../lib/ai/newsPrompt";
import { GeminiCallError, transformWithGemini } from "../services/ai/gemini-core";
import { GEMINI_MODEL } from "../services/ai/gemini-config";
import type { Category, ContentGenerationPreferences } from "../types";

const endpoint = "https://naverapihub.apigw.ntruss.com/search/v1/news";
const tests: Array<{ category: Category; query: string }> = [
  { category: "과학", query: "과학 우주 뉴스" }, { category: "경제", query: "경제 뉴스" }, { category: "스포츠", query: "스포츠 뉴스" },
];
async function main() {
  const clientId = process.env.NAVER_CLIENT_ID;
  const clientSecret = process.env.NAVER_CLIENT_SECRET;
  if (!clientId || !clientSecret) throw new Error("NAVER credentials are not configured");
  const results = [];
  for (const test of tests) {
  const params = new URLSearchParams({ query: test.query, display: "10", start: "1", sort: "date" });
  const response = await fetch(`${endpoint}?${params}`, { headers: { Accept: "application/json", "X-NCP-APIGW-API-KEY-ID": clientId, "X-NCP-APIGW-API-KEY": clientSecret }, signal: AbortSignal.timeout(8_000) });
  if (!response.ok) throw new Error(`NAVER request failed: ${response.status}`);
  const payload = await response.json() as { items?: Array<{ title?: string; description?: string; originallink?: string; link?: string; pubDate?: string }> };
  const candidates = (payload.items ?? []).filter(item => item.title && item.description && (item.originallink || item.link));
  let transformedTitle = "";
  let lastReason = "no_candidate";
  for (const item of candidates.slice(0, 10)) {
    const preferences: ContentGenerationPreferences = { gradeLevel: "3-4", readingLevel: "normal", explanationLevel: "easy", interests: [test.category], customInterests: [] };
    try {
      const content = await transformWithGemini({ title: clean(item.title), description: clean(item.description), url: item.originallink || item.link || "", publisher: publisher(item.originallink || item.link || ""), publishedAt: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(), category: test.category }, preferences, createNewsForKidsPrompt(preferences));
      transformedTitle = content.title;
      lastReason = "none";
      break;
    } catch (error) {
      lastReason = error instanceof GeminiCallError ? `${error.stage}:${error.reason}` : "unknown";
    }
  }
    results.push({ category: test.category, naverFetch: candidates.length > 0, candidateCount: candidates.length, geminiRequest: Boolean(transformedTitle), schemaValid: Boolean(transformedTitle), fallback: !transformedTitle, title: transformedTitle || "-", reason: lastReason });
  }
  console.table(results);
  console.log(`model: ${GEMINI_MODEL}`);
  if (results.some(result => result.fallback)) process.exitCode = 1;
}

function clean(value = "") { return value.replace(/<[^>]+>/g, " ").replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&").replace(/\s+/g, " ").trim(); }
function publisher(value: string) { try { return new URL(value).hostname.replace(/^www\./, ""); } catch { return "unknown"; } }

void main().catch(error => {
  console.error("[News pipeline test failed]", { name: error instanceof Error ? error.name : "UnknownError", message: error instanceof Error ? error.message : "Unknown error", model: GEMINI_MODEL });
  process.exitCode = 1;
});
