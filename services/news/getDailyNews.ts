import "server-only";
import { createHash } from "node:crypto";
import type { Article, Category, ContentGenerationPreferences, ExplanationLevel, GradeLevel, KidArticleContent, ReadingLevel } from "@/types";
import { categories } from "@/data/categories";
import { mockArticles } from "@/data/mockArticles";
import { fetchLatestNews, fetchNewsByQuery, type NewsProvider, type RawNewsArticle } from "@/services/news/fetchNews";
import { transformNewsForKids, type KidsContentTransformer } from "@/services/news/transformNews";
import { selectDailyNews } from "@/services/news/selectDailyNews";
import { naverApiHubProvider } from "@/services/news/providers/naverApiHubProvider";
import { geminiProvider } from "@/services/ai/gemini";
import { memoryArticleCache, runSingleFlight, type ArticleContentCache } from "@/services/news/articleCache";
import { evaluateArticleSafety, isAllowedForGrade } from "@/services/news/evaluateArticleSafety";

interface DailyNewsOptions {
  interests?: Category[]; difficulty?: GradeLevel; readingLevel?: ReadingLevel; explanationLevel?: ExplanationLevel;
  customInterests?: string[];
  count?: number; live?: boolean; newsProvider?: NewsProvider; contentTransformer?: KidsContentTransformer; contentCache?: ArticleContentCache;
}

type FallbackReason = NonNullable<Article["fallbackReason"]>;
type BuildArticleResult = { article: Article | null; failureReason?: FallbackReason };

const styleByCategory = new Map(categories.map(item => [item.name, item]));

export async function getDailyNews(options: DailyNewsOptions = {}): Promise<Article[]> {
  const { interests = [], customInterests = [], difficulty = "3-4", readingLevel = "normal", explanationLevel = "easy", count: requestedCount = 1, live = true, newsProvider = naverApiHubProvider, contentTransformer = geminiProvider, contentCache = memoryArticleCache } = options;
  const count = Math.min(5, Math.max(1, requestedCount));
  const preferences: ContentGenerationPreferences = { gradeLevel: difficulty, readingLevel, explanationLevel, interests, customInterests };
  const fallback = (reason: FallbackReason) => selectDailyNews(mockArticles, interests, count).map(article => ({ ...article, fallbackReason: reason }));
  if (!live) return fallback("live_disabled");
  if (!newsProvider.isConfigured() || !contentTransformer.isConfigured()) return fallback("missing_api_key");

  try {
    const targetCategories = chooseTargetCategories(interests, count);
    const fallbackCategory = interests[0] ?? "사회";
    const [categoryFetched, customFetched] = await Promise.all([
      Promise.all(targetCategories.map(category => fetchLatestNews(category, newsProvider))),
      Promise.all(customInterests.slice(0, 3).map(query => fetchNewsByQuery(query, fallbackCategory, newsProvider))),
    ]);
    const fetched = [...categoryFetched.flat(), ...customFetched.flat()];
    const unique = deduplicateNews(fetched).filter(article => {
      const reason = unsuitableForChildren(article);
      if (reason && process.env.NODE_ENV === "development") {
        console.info("[NewsSeed][NewsFilter] candidate skipped", { category: article.category, reason });
      }
      return !reason;
    });
    if (!unique.length) return fallback("naver_api_failed");
    const safetyResults = await Promise.all(unique.map(async article => ({ article, result: await evaluateArticleSafety(article) })));
    const safeArticles = safetyResults.filter(item => isAllowedForGrade(item.result, difficulty)).map(item => item.article);
    if (!safeArticles.length) return fallback("no_safe_candidate");

    const transformed: Article[] = [];
    const transformFailures: FallbackReason[] = [];
    let attempts = 0;
    for (const raw of orderCandidates(safeArticles, interests, count)) {
      if (transformed.length >= count || attempts >= count + 4) break;
      attempts += 1;
      const result = await buildArticle(raw, preferences, contentTransformer, contentCache);
      if (result.article) transformed.push(result.article);
      else if (result.failureReason) transformFailures.push(result.failureReason);
    }
    if (transformed.length < count) return fallback(transformFailures.includes("validation_failed") ? "validation_failed" : "gemini_failed");
    const selected = selectDailyNews(transformed, interests, count);
    const preferredCount = selected.filter(article => interests.includes(article.category)).length;
    const requiredPreferred = interests.length ? (count === 1 ? 1 : count - 1) : 0;
    return selected.length === count && preferredCount >= requiredPreferred ? selected : fallback("no_safe_candidate");
  } catch (error) {
    console.warn(`[NewsSeed] Daily news pipeline failed; using mock fallback: ${error instanceof Error ? error.message : "unknown error"}`);
    return fallback("naver_api_failed");
  }
}

async function buildArticle(raw: RawNewsArticle, preferences: ContentGenerationPreferences, transformer: KidsContentTransformer, cache: ArticleContentCache): Promise<BuildArticleResult> {
  let kidContent: KidArticleContent | null;
  let generatedAt: string;
  const cached = await cache.get(raw.url, preferences);
  if (cached) { kidContent = cached.content; generatedAt = cached.generatedAt; }
  else {
    let generationFailure: FallbackReason = "gemini_failed";
    const generated = await runSingleFlight(raw.url, preferences, async () => {
      const result = await transformNewsForKids(raw, preferences, transformer);
      if (!result.content) {
        generationFailure = result.failureReason ?? "gemini_failed";
        return null;
      }
      const value = { content: result.content, generatedAt: new Date().toISOString() };
      await cache.set(raw.url, preferences, value);
      return value;
    });
    if (!generated) return { article: null, failureReason: generationFailure };
    kidContent = generated.content;
    generatedAt = generated.generatedAt;
  }
  const style = styleByCategory.get(raw.category);
  const variant = `${preferences.gradeLevel}-${preferences.readingLevel}-${preferences.explanationLevel}`;
  const readableText = [...kidContent.easyExplanation, ...kidContent.whyItMatters].join(" ");
  return { article: {
    id: `news-${createHash("sha256").update(raw.url).digest("hex").slice(0, 16)}-${variant}`,
    category: raw.category, difficulty: preferences.gradeLevel, estimatedReadingTime: Math.max(1, Math.ceil(readableText.length / 400)),
    source: { title: raw.title, url: raw.url, publisher: raw.publisher, publishedAt: raw.publishedAt, description: raw.description },
    kidContent, generatedAt, sourceType: "news-api", emoji: style?.emoji ?? "📰", color: colorFor(raw.category),
  } };
}

function chooseTargetCategories(interests: Category[], count: number): Category[] {
  const all = categories.map(item => item.name);
  const seed = Math.floor(Date.now() / 86_400_000);
  const rotate = <T,>(items: T[]) => items.length ? [...items.slice(seed % items.length), ...items.slice(0, seed % items.length)] : [];
  const preferredTarget = count === 1 ? 1 : count - 1;
  const preferred = rotate([...new Set(interests)]).slice(0, Math.max(2, preferredTarget));
  const exploratory = rotate(all.filter(category => !interests.includes(category))).slice(0, 2);
  return [...preferred, ...exploratory, ...rotate(all)].filter((category, index, list) => list.indexOf(category) === index).slice(0, 6);
}

function orderCandidates(articles: RawNewsArticle[], interests: Category[], count: number) {
  const preferred = roundRobinByCategory(articles.filter(article => interests.includes(article.category)));
  const exploratory = roundRobinByCategory(articles.filter(article => !interests.includes(article.category)));
  const preferredTarget = count === 1 ? 1 : count - 1;
  const priority = [...preferred.slice(0, preferredTarget), ...exploratory.slice(0, count - preferredTarget)];
  return [...priority, ...preferred.slice(preferredTarget), ...exploratory.slice(count - preferredTarget)].filter((article, index, all) => all.findIndex(item => item.url === article.url) === index);
}

function roundRobinByCategory(articles: RawNewsArticle[]) {
  const groups = new Map<Category, RawNewsArticle[]>();
  articles.forEach(article => groups.set(article.category, [...(groups.get(article.category) ?? []), article]));
  const result: RawNewsArticle[] = [];
  while ([...groups.values()].some(group => group.length)) groups.forEach(group => { const next = group.shift(); if (next) result.push(next); });
  return result;
}

function deduplicateNews(articles: RawNewsArticle[]) { return articles.filter((article, index, all) => all.findIndex(item => item.url === article.url || item.title === article.title) === index); }

// Topic-level exclusions keep the feed focused on useful, age-appropriate news.
const unsuitableChildTopics: Array<[string, string]> = [
  ["이혼", "private_relationship"], ["양육비", "private_relationship"], ["열애", "private_relationship"],
  ["파경", "private_relationship"], ["사생활", "private_relationship"], ["결별", "private_relationship"],
  ["인스타", "celebrity_gossip"], ["유튜브", "celebrity_gossip"], ["방송인", "celebrity_gossip"],
  ["마약", "crime"], ["도박", "crime"], ["음주운전", "crime"], ["성폭력", "crime"],
  ["살인", "violence"], ["폭행", "violence"], ["참사", "tragedy"], ["시신", "tragedy"],
];

function unsuitableForChildren(article: RawNewsArticle) {
  const text = `${article.title} ${article.description ?? ""}`.toLocaleLowerCase("ko-KR");
  return unsuitableChildTopics.find(([keyword]) => text.includes(keyword))?.[1];
}

function colorFor(category: Category) {
  const colors: Record<Category, string> = { "경제": "#f2b938", "과학": "#4f8ee8", "사회": "#d36b6b", "국제": "#5a79d6", "환경": "#42b873", "문화": "#b06acb", "스포츠": "#ff9d42", "기술": "#557fe8", "동물": "#36a7ce", "우주": "#7267f0" };
  return colors[category];
}
