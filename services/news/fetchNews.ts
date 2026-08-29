import "server-only";
import type { Category } from "@/types";

export interface RawNewsArticle {
  title: string;
  description?: string;
  url: string;
  publisher: string;
  publishedAt: string;
}

export interface NewsProvider {
  fetchLatest(category: Category, apiKey: string): Promise<RawNewsArticle[]>;
}

/**
 * Server-only news metadata boundary.
 * A provider adapter will be injected here when a news API is selected.
 * Missing configuration and provider failures intentionally return [] so callers can fall back.
 */
export async function fetchLatestNews(category: Category, provider?: NewsProvider): Promise<RawNewsArticle[]> {
  const apiKey = process.env.NEWS_API_KEY;
  if (!apiKey || !provider) return [];
  try {
    const articles = await provider.fetchLatest(category, apiKey);
    return articles.filter(article => article.title && article.url && article.publisher && article.publishedAt);
  } catch (error) {
    console.error(`[NewsSeed] Failed to fetch ${category} news metadata.`, error);
    return [];
  }
}
