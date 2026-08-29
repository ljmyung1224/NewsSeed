import "server-only";
import type { ContentGenerationPreferences, KidArticleContent } from "@/types";

export interface CachedKidContent { content: KidArticleContent; generatedAt: string; }
export interface ArticleContentCache {
  get(sourceUrl: string, preferences: ContentGenerationPreferences): Promise<CachedKidContent | null>;
  set(sourceUrl: string, preferences: ContentGenerationPreferences, value: CachedKidContent): Promise<void>;
}

interface MemoryEntry extends CachedKidContent { expiresAt: number; }
const globalCache = globalThis as typeof globalThis & { __newsseedContentCache?: Map<string, MemoryEntry>; __newsseedContentInFlight?: Map<string, Promise<CachedKidContent | null>> };
const entries = globalCache.__newsseedContentCache ?? new Map<string, MemoryEntry>();
const inFlight = globalCache.__newsseedContentInFlight ?? new Map<string, Promise<CachedKidContent | null>>();
globalCache.__newsseedContentCache = entries;
globalCache.__newsseedContentInFlight = inFlight;
const keyFor = (url: string, preferences: ContentGenerationPreferences) => `${preferences.gradeLevel}:${preferences.readingLevel}:${preferences.explanationLevel}:${url}`;

/** Development adapter. A Supabase adapter can implement the same interface later. */
export const memoryArticleCache: ArticleContentCache = {
  async get(sourceUrl, preferences) {
    const key = keyFor(sourceUrl, preferences);
    const entry = entries.get(key);
    if (!entry || entry.expiresAt <= Date.now()) { entries.delete(key); return null; }
    return { content: entry.content, generatedAt: entry.generatedAt };
  },
  async set(sourceUrl, preferences, value) { entries.set(keyFor(sourceUrl, preferences), { ...value, expiresAt: Date.now() + 24 * 60 * 60 * 1000 }); },
};

export async function runSingleFlight(sourceUrl: string, preferences: ContentGenerationPreferences, generate: () => Promise<CachedKidContent | null>) {
  const key = keyFor(sourceUrl, preferences);
  const existing = inFlight.get(key);
  if (existing) return existing;
  const pending = generate().finally(() => inFlight.delete(key));
  inFlight.set(key, pending);
  return pending;
}
