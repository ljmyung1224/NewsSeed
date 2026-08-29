import "server-only";
import type { Category } from "@/types";
import type { NewsProvider, RawNewsArticle } from "@/services/news/fetchNews";

const queryByCategory: Record<Category, string> = {
  "경제": "경제 OR 금융 OR 물가", "과학": "과학 연구 OR 과학자", "사회": "사회 OR 교육 OR 생활", "국제": "국제 OR 세계",
  "환경": "환경 OR 기후 OR 탄소", "문화": "문화 OR 예술 OR 공연", "스포츠": "스포츠 OR 축구 OR 야구", "기술": "기술 OR 인공지능 OR 로봇", "동물": "동물 OR 생태", "우주": "우주 OR 천문 OR 행성",
};

interface GNewsResponse { articles?: Array<{ title?: string; description?: string; url?: string; publishedAt?: string; source?: { name?: string } }>; }

export const gnewsProvider: NewsProvider = {
  async fetchLatest(category, apiKey) {
    const params = new URLSearchParams({ q: queryByCategory[category], lang: "ko", country: "kr", max: "6", sortby: "publishedAt", apikey: apiKey });
    const response = await fetch(`https://gnews.io/api/v4/search?${params}`, { headers: { Accept: "application/json" }, cache: "no-store", signal: AbortSignal.timeout(8_000) });
    if (!response.ok) throw new Error(`GNews responded with ${response.status}`);
    const payload = await response.json() as GNewsResponse;
    return (payload.articles ?? []).flatMap((article): RawNewsArticle[] => {
      if (!article.title || !article.description || !article.url || !article.publishedAt || !article.source?.name) return [];
      try { const url = new URL(article.url); if (url.protocol !== "https:" && url.protocol !== "http:") return []; } catch { return []; }
      return [{ title: article.title.trim(), description: article.description.trim(), url: article.url, publisher: article.source.name.trim(), publishedAt: article.publishedAt, category }];
    });
  },
};
