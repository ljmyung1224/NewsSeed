import "server-only";
import type { Article, Category, GradeLevel } from "@/types";
import { categories } from "@/data/categories";
import { mockArticles } from "@/data/mockArticles";
import { fetchLatestNews, type NewsProvider } from "@/services/news/fetchNews";
import { transformNewsForKids, type KidsContentTransformer } from "@/services/news/transformNews";
import { selectDailyNews } from "@/services/news/selectDailyNews";

interface DailyNewsOptions { interests?: Category[]; difficulty?: GradeLevel; count?: number; newsProvider?: NewsProvider; contentTransformer?: KidsContentTransformer; }

export async function getDailyNews(options: DailyNewsOptions = {}): Promise<Article[]> {
  const { interests, difficulty = "3-4", count, newsProvider, contentTransformer } = options;
  try {
    const candidates = (await Promise.all(categories.map(async ({ name, emoji }) => {
      const rawArticles = await fetchLatestNews(name, newsProvider);
      return Promise.all(rawArticles.map(async (raw, index): Promise<Article | null> => {
        const kidContent = await transformNewsForKids(raw, difficulty, contentTransformer);
        if (!kidContent) return null;
        return { id: `news-${name}-${index}-${raw.publishedAt}`, category: name, difficulty, estimatedReadingTime: Math.max(1, Math.ceil(kidContent.content.join(" ").length / 450)), source: { title: raw.title, url: raw.url, publisher: raw.publisher, publishedAt: raw.publishedAt, description: raw.description }, kidContent, generatedAt: new Date().toISOString(), sourceType: "news-api", emoji, color: "#35a852" };
      }));
    }))).flat().filter((article): article is Article => article !== null);
    const available = candidates.length ? candidates : mockArticles;
    return interests ? selectDailyNews(available, interests, count ?? 3) : available;
  } catch (error) {
    console.error("[NewsSeed] Daily news pipeline failed; using mock fallback.", error);
    return interests ? selectDailyNews(mockArticles, interests, count ?? 3) : mockArticles;
  }
}
