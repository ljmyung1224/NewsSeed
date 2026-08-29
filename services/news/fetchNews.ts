import "server-only";
import type { Category } from "@/types";

export interface RawNewsArticle {
  title: string;
  description?: string;
  url: string;
  publisher: string;
  publishedAt: string;
  category: Category;
  imageUrl?: string;
}

export interface NewsProvider {
  isConfigured(): boolean;
  fetchLatest(category: Category): Promise<RawNewsArticle[]>;
  fetchByQuery?(query: string, category: Category): Promise<RawNewsArticle[]>;
}

export async function fetchNewsByQuery(query: string, category: Category, provider?: NewsProvider): Promise<RawNewsArticle[]> {
  if (!provider?.isConfigured() || !provider.fetchByQuery) return [];
  try { return (await provider.fetchByQuery(query, category)).filter(article => article.title && article.description && article.url); }
  catch (error) { console.warn(`[NewsSeed] Custom-interest news search failed for ${category}: ${error instanceof Error ? error.message : "unknown error"}`); return []; }
}

/**
 * Server-only news metadata boundary.
 * A provider adapter will be injected here when a news API is selected.
 * Missing configuration and provider failures intentionally return [] so callers can fall back.
 */
export async function fetchLatestNews(category: Category, provider?: NewsProvider): Promise<RawNewsArticle[]> {
  if (!provider?.isConfigured()) return [];
  try {
    const articles = await provider.fetchLatest(category);
    return articles.filter(article => article.title && article.description && article.url && article.publisher && article.publishedAt && article.category === category);
  } catch (error) {
    console.warn(`[NewsSeed] Failed to fetch ${category} news metadata: ${error instanceof Error ? error.message : "unknown error"}`);
    return [];
  }
}
