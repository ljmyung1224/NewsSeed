import { getDailyNews } from "@/services/news/getDailyNews";
import type { Category } from "@/types";
import { fetchLatestNews } from "@/services/news/fetchNews";
import { naverApiHubProvider } from "@/services/news/providers/naverApiHubProvider";

export async function GET() {
  if (process.env.NODE_ENV !== "development") return Response.json({ error: "Not found" }, { status: 404 });
  const tests: { category: Category; customInterests?: string[] }[] = [
    { category: "과학", customInterests: ["우주"] },
    { category: "경제" },
    { category: "스포츠" },
  ];
  const results = [];
  for (const test of tests) {
    const candidates = await fetchLatestNews(test.category, naverApiHubProvider);
    const [article] = await getDailyNews({ interests: [test.category], customInterests: test.customInterests, difficulty: "3-4", readingLevel: "normal", explanationLevel: "easy", count: 1 });
    const summary = { category: test.category, naverCandidateCount: candidates.length, publisher: article.source.publisher, sourceTitle: article.source.title, transformSuccess: article.sourceType === "news-api", fallback: article.sourceType === "mock" };
    console.info("[NewsSeed pipeline check]", summary);
    results.push(summary);
  }
  return Response.json({ results });
}
