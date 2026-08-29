import "server-only";
import type { Category } from "@/types";
import type { NewsProvider, RawNewsArticle } from "@/services/news/fetchNews";
import { categoryNewsQueries, sanitizeNewsQuery } from "@/services/news/newsQueries";

const API_ENDPOINT = "https://naverapihub.apigw.ntruss.com/search/v1/news";

interface NaverNewsItem {
  title?: string;
  originallink?: string;
  link?: string;
  description?: string;
  pubDate?: string;
}

interface NaverNewsResponse {
  items?: NaverNewsItem[];
}

const publisherNames: Record<string, string> = {
  "yna.co.kr": "연합뉴스",
  "newsis.com": "뉴시스",
  "khan.co.kr": "경향신문",
  "hani.co.kr": "한겨레",
  "donga.com": "동아일보",
  "chosun.com": "조선일보",
  "joongang.co.kr": "중앙일보",
  "mk.co.kr": "매일경제",
  "hankyung.com": "한국경제",
  "kbs.co.kr": "KBS",
  "mbc.co.kr": "MBC",
  "sbs.co.kr": "SBS",
  "ytn.co.kr": "YTN",
};

export const naverApiHubProvider: NewsProvider = {
  isConfigured() {
    return Boolean(process.env.NAVER_CLIENT_ID && process.env.NAVER_CLIENT_SECRET);
  },
  async fetchLatest(category) {
    return fetchQuery(categoryNewsQueries[category], category);
  },
  async fetchByQuery(query, category) {
    const safeQuery = sanitizeNewsQuery(query);
    if (!safeQuery) return [];
    return fetchQuery(`${safeQuery} 뉴스`, category);
  },
};

async function fetchQuery(query: string, category: Category) {
    const clientId = process.env.NAVER_CLIENT_ID;
    const clientSecret = process.env.NAVER_CLIENT_SECRET;
    if (!clientId || !clientSecret) return [];

    const params = new URLSearchParams({
      query,
      display: "10",
      start: "1",
      sort: "date",
    });
    const response = await fetch(`${API_ENDPOINT}?${params}`, {
      headers: {
        Accept: "application/json",
        "X-NCP-APIGW-API-KEY-ID": clientId,
        "X-NCP-APIGW-API-KEY": clientSecret,
      },
      cache: "no-store",
      signal: AbortSignal.timeout(8_000),
    });
    if (!response.ok) throw new Error(`NAVER API HUB responded with ${response.status}`);

    const payload = await response.json() as NaverNewsResponse;
    const candidates = (payload.items ?? []).flatMap((item): RawNewsArticle[] => {
      const url = validUrl(item.originallink) ?? validUrl(item.link);
      const publishedAt = toIsoDate(item.pubDate);
      const title = cleanText(item.title);
      const description = cleanText(item.description);
      if (!url || !publishedAt || !title || !description) return [];
      return [{
        title,
        description,
        url,
        publisher: publisherFromUrl(url),
        publishedAt,
        category,
      }];
    });
    return Promise.all(candidates.map(async article => ({ ...article, imageUrl: await extractOgImage(article.url) })));
}

async function extractOgImage(url: string) {
  try {
    const response = await fetch(url, { headers: { Accept: "text/html" }, cache: "no-store", signal: AbortSignal.timeout(3_000) });
    if (!response.ok) return undefined;
    const html = (await response.text()).slice(0, 500_000);
    const match = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i)
      ?? html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i);
    return match?.[1] ? validUrl(match[1]) ?? undefined : undefined;
  } catch { return undefined; }
}

function cleanText(value?: string) {
  if (!value) return "";
  return value
    .replace(/<[^>]+>/g, " ")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

function validUrl(value?: string) {
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:" ? url.toString() : null;
  } catch {
    return null;
  }
}

function toIsoDate(value?: string) {
  if (!value) return null;
  const timestamp = Date.parse(value);
  return Number.isNaN(timestamp) ? null : new Date(timestamp).toISOString();
}

function publisherFromUrl(value: string) {
  const hostname = new URL(value).hostname.replace(/^www\./, "");
  const knownDomain = Object.keys(publisherNames).find(domain => hostname === domain || hostname.endsWith(`.${domain}`));
  return knownDomain ? publisherNames[knownDomain] : hostname;
}
