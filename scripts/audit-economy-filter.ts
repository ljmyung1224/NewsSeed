import { createHash } from "node:crypto";
import { createNewsForKidsPrompt } from "../lib/ai/newsPrompt";
import { GeminiCallError, transformWithGemini } from "../services/ai/gemini-core";
import { GEMINI_MODEL } from "../services/ai/gemini-config";
import type { ContentGenerationPreferences } from "../types";

const endpoint = "https://naverapihub.apigw.ntruss.com/search/v1/news";

async function main() {
  const clientId = process.env.NAVER_CLIENT_ID;
  const clientSecret = process.env.NAVER_CLIENT_SECRET;
  if (!clientId || !clientSecret) throw new Error("NAVER credentials are not configured");
  const params = new URLSearchParams({ query: "경제 물가 금리 기업", display: "10", start: "1", sort: "date" });
  const response = await fetch(`${endpoint}?${params}`, { headers: { Accept: "application/json", "X-NCP-APIGW-API-KEY-ID": clientId, "X-NCP-APIGW-API-KEY": clientSecret }, signal: AbortSignal.timeout(8_000) });
  if (!response.ok) throw new Error(`NAVER request failed: ${response.status}`);
  const payload = await response.json() as { items?: Array<{ title?: string; description?: string; originallink?: string; link?: string; pubDate?: string }> };
  const candidates = (payload.items ?? []).filter(item => item.title && item.description && (item.originallink || item.link)).slice(0, 6);
  const preferences: ContentGenerationPreferences = { gradeLevel: "3-4", readingLevel: "normal", explanationLevel: "easy", interests: ["경제"], customInterests: [] };
  const results = [];
  for (const item of candidates) {
    const url = item.originallink || item.link || "";
    const candidateId = createHash("sha256").update(url).digest("hex").slice(0, 12);
    try {
      const content = await transformWithGemini({ title: clean(item.title), description: clean(item.description), url, publisher: publisher(url), publishedAt: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(), category: "경제" }, preferences, createNewsForKidsPrompt(preferences));
      results.push({ candidateId, category: "경제", accepted: true, reason: "none", transformedTitle: content.title });
    } catch (error) {
      results.push({ candidateId, category: "경제", accepted: false, reason: error instanceof GeminiCallError ? error.reason : "unknown", transformedTitle: "-" });
    }
  }
  console.table(results);
  const accepted = results.filter(result => result.accepted).length;
  console.log({ model: GEMINI_MODEL, tested: results.length, accepted, rejected: results.length - accepted, acceptanceRate: results.length ? `${Math.round(accepted / results.length * 100)}%` : "0%" });
  if (!accepted) process.exitCode = 1;
}

function clean(value = "") { return value.replace(/<[^>]+>/g, " ").replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&").replace(/\s+/g, " ").trim(); }
function publisher(value: string) { try { return new URL(value).hostname.replace(/^www\./, ""); } catch { return "unknown"; } }

void main().catch(error => {
  console.error("[Economy filter audit failed]", { name: error instanceof Error ? error.name : "UnknownError", message: error instanceof Error ? error.message : "Unknown error", model: GEMINI_MODEL });
  process.exitCode = 1;
});
