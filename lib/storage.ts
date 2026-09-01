import type { AppState, Category, DailyMissionId, LearningStats, SeedRecord, UserPreferences } from "@/types";
import { previousDate } from "@/lib/date";
import { getCompletedMissionIds, missionDefinitions, recordDateKey } from "@/lib/growth";
import { defaultEquippedTreeItems, defaultOwnedTreeItems, leafBalance } from "@/lib/tree-shop";

export const STORAGE_KEY = "newseed-state-v1";
export const SEEDS_KEY = "newseed-seeds-v1";
export const initialStats: LearningStats = { xp: 0, streak: 0, lastCompletedDate: null, completedDates: [], articleCompletions: {}, missionRewards: {}, leafCurrency: 0, leafRewardEvents: {}, treeItemPurchases: {}, ownedTreeItems: defaultOwnedTreeItems, equippedTreeItems: defaultEquippedTreeItems, treeCustomizationUnlockSeen: false, treeUpdatedAt: null };

function storageKey(userId?: string) { return userId ? `${STORAGE_KEY}:${userId}` : STORAGE_KEY; }
function seedsKey(userId?: string) { return userId ? `${SEEDS_KEY}:${userId}` : SEEDS_KEY; }

export function loadSeedRecords(userId?: string): import("@/types").SeedRecord[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(seedsKey(userId)) ?? "[]") as import("@/types").SeedRecord[]; } catch { return []; }
}

export function seedRecordKey(record: SeedRecord) {
  return `${record.article.id}:${recordDateKey(record)}`;
}

export function mergeSeedRecords(...collections: SeedRecord[][]): SeedRecord[] {
  const merged = new Map<string, SeedRecord>();
  collections.flat().forEach(record => {
    if (!record?.article?.id || !record.completedAt) return;
    const key = seedRecordKey(record);
    if (!merged.has(key)) merged.set(key, record);
  });
  return [...merged.values()].sort((a, b) => b.completedAt.localeCompare(a.completedAt));
}

export function replaceSeedRecords(records: SeedRecord[], userId?: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(seedsKey(userId), JSON.stringify(mergeSeedRecords(records).slice(0, 365)));
}

export function saveSeedRecord(record: import("@/types").SeedRecord, userId?: string) {
  const records = loadSeedRecords(userId);
  replaceSeedRecords([record, ...records], userId);
}

export function loadState(userId?: string): AppState {
  if (typeof window === "undefined") return { profile: null, stats: initialStats };
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey(userId)) ?? "null") as Partial<AppState> | null;
    return { profile: normalizePreferences(saved?.profile), stats: normalizeLearningStats({ ...initialStats, ...saved?.stats }) };
  } catch { return { profile: null, stats: initialStats }; }
}

export function saveState(state: AppState, userId?: string) {
  localStorage.setItem(storageKey(userId), JSON.stringify(state));
}

export function clearAnonymousState() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(SEEDS_KEY);
}

export function clearUserState(userId?: string) {
  if (typeof window === "undefined") return;
  localStorage.removeItem(storageKey(userId));
  localStorage.removeItem(seedsKey(userId));
}

export function clearAllLocalState() {
  if (typeof window === "undefined") return;
  for (let index = localStorage.length - 1; index >= 0; index -= 1) {
    const key = localStorage.key(index);
    if (key?.startsWith(STORAGE_KEY) || key?.startsWith(SEEDS_KEY)) localStorage.removeItem(key);
  }
}

export function completeArticle(stats: LearningStats, date: string, articleId: string): LearningStats {
  const current = [...new Set(stats.articleCompletions[date] ?? [])];
  if (current.includes(articleId)) return { ...stats, articleCompletions: { ...stats.articleCompletions, [date]: current } };
  return { ...stats, xp: stats.xp + 10, articleCompletions: { ...stats.articleCompletions, [date]: [...current, articleId] } };
}

export function normalizeLearningStats(stats: LearningStats): LearningStats {
  const articleCompletions = Object.fromEntries(Object.entries(stats.articleCompletions ?? {}).map(([date, ids]) => [date, [...new Set(ids)]]));
  const missionRewards = Object.fromEntries(Object.entries(stats.missionRewards ?? {}).map(([date, ids]) => [date, [...new Set(ids)].filter((id): id is DailyMissionId => missionDefinitions.some(mission => mission.id === id))]));
  const leafRewardEvents = stats.leafRewardEvents ?? {};
  const treeItemPurchases = stats.treeItemPurchases ?? {};
  const ownedTreeItems = [...new Set([...defaultOwnedTreeItems, ...(stats.ownedTreeItems ?? [])])];
  const equippedTreeItems = { ...defaultEquippedTreeItems, ...(stats.equippedTreeItems ?? {}) };
  const normalized = { ...initialStats, ...stats, articleCompletions, missionRewards, leafRewardEvents, treeItemPurchases, ownedTreeItems, equippedTreeItems };
  return { ...normalized, leafCurrency: leafBalance(normalized) };
}

export function mergeLearningStats(local: LearningStats, cloud: LearningStats): LearningStats {
  const articleDates = new Set([...Object.keys(local.articleCompletions), ...Object.keys(cloud.articleCompletions)]);
  const articleCompletions = Object.fromEntries([...articleDates].map(date => [date, [...new Set([...(local.articleCompletions[date] ?? []), ...(cloud.articleCompletions[date] ?? [])])]]));
  const missionDates = new Set([...Object.keys(local.missionRewards), ...Object.keys(cloud.missionRewards)]);
  const missionRewards = Object.fromEntries([...missionDates].map(date => [date, [...new Set([...(local.missionRewards[date] ?? []), ...(cloud.missionRewards[date] ?? [])])]]));
  const localTreeNewer = (local.treeUpdatedAt ?? "") >= (cloud.treeUpdatedAt ?? "");
  return normalizeLearningStats({
    ...cloud,
    xp: Math.max(local.xp, cloud.xp),
    streak: Math.max(local.streak, cloud.streak),
    lastCompletedDate: [local.lastCompletedDate, cloud.lastCompletedDate].filter(Boolean).sort().at(-1) ?? null,
    completedDates: [...new Set([...local.completedDates, ...cloud.completedDates])],
    articleCompletions,
    missionRewards,
    leafRewardEvents: { ...cloud.leafRewardEvents, ...local.leafRewardEvents },
    treeItemPurchases: { ...cloud.treeItemPurchases, ...local.treeItemPurchases },
    ownedTreeItems: [...new Set([...cloud.ownedTreeItems, ...local.ownedTreeItems])],
    equippedTreeItems: localTreeNewer ? local.equippedTreeItems : cloud.equippedTreeItems,
    treeCustomizationUnlockSeen: local.treeCustomizationUnlockSeen || cloud.treeCustomizationUnlockSeen,
    treeUpdatedAt: localTreeNewer ? local.treeUpdatedAt : cloud.treeUpdatedAt,
  });
}

export function completeDailyMissions(stats: LearningStats, date: string, records: SeedRecord[]): { stats: LearningStats; bonusXp: number; newlyCompleted: DailyMissionId[] } {
  const rewarded = stats.missionRewards[date] ?? [];
  const completed = getCompletedMissionIds(records, date);
  const newlyCompleted = completed.filter(id => !rewarded.includes(id));
  const bonusXp = missionDefinitions.filter(mission => newlyCompleted.includes(mission.id)).reduce((sum, mission) => sum + mission.rewardXp, 0);
  if (!newlyCompleted.length) return { stats, bonusXp: 0, newlyCompleted: [] };
  return { stats: { ...stats, xp: stats.xp + bonusXp, missionRewards: { ...stats.missionRewards, [date]: [...rewarded, ...newlyCompleted] } }, bonusXp, newlyCompleted };
}

export function grantLearningLeaves(stats: LearningStats, date: string, articleId: string, newlyCompleted: DailyMissionId[]): { stats: LearningStats; earnedLeaves: number } {
  const events: Record<string, number> = {
    [`article:${date}:${articleId}`]: 3,
    [`quiz:${date}:${articleId}`]: 2,
  };
  newlyCompleted.forEach(id => { events[`mission:${date}:${id}`] = missionDefinitions.find(mission => mission.id === id)?.rewardLeaves ?? 0; });
  const completedMissionIds = new Set([...(stats.missionRewards[date] ?? []), ...newlyCompleted]);
  if (missionDefinitions.every(mission => completedMissionIds.has(mission.id))) events[`mission-all:${date}`] = 5;
  const additions = Object.fromEntries(Object.entries(events).filter(([key]) => !(key in stats.leafRewardEvents)));
  const earnedLeaves = Object.values(additions).reduce((sum, amount) => sum + amount, 0);
  const next = { ...stats, leafRewardEvents: { ...stats.leafRewardEvents, ...additions } };
  return { stats: { ...next, leafCurrency: leafBalance(next) }, earnedLeaves };
}

export function completeDay(stats: LearningStats, date: string): LearningStats {
  if (stats.completedDates.includes(date)) return stats;
  const streak = stats.lastCompletedDate === previousDate(date) ? stats.streak + 1 : 1;
  return { ...stats, xp: stats.xp + 10, streak, lastCompletedDate: date, completedDates: [...stats.completedDates, date] };
}

export const defaultPreferences: Omit<UserPreferences, "nickname" | "gradeLevel" | "interests"> = {
  customInterests: [],
  readingLevel: "normal",
  explanationLevel: "easy",
  dailyArticleCount: 1,
  onboardingCompleted: true,
};

export function normalizePreferences(value: unknown): UserPreferences | null {
  if (!value || typeof value !== "object") return null;
  const legacy = value as Omit<Partial<UserPreferences>, "interests"> & { grade?: UserPreferences["gradeLevel"]; interests?: string[] };
  if (!legacy.nickname || !(legacy.gradeLevel ?? legacy.grade) || !legacy.interests) return null;
  const interests = legacy.interests.map(item => item === "세계" ? "국제" : item === "게임" ? "기술" : item).filter((item): item is Category => ["경제","과학","사회","국제","환경","문화","스포츠","기술","동물","우주"].includes(item));
  return {
    nickname: legacy.nickname,
    gradeLevel: legacy.gradeLevel ?? legacy.grade!,
    interests,
    customInterests: normalizeCustomInterests(legacy.customInterests),
    readingLevel: legacy.readingLevel ?? defaultPreferences.readingLevel,
    explanationLevel: legacy.explanationLevel ?? defaultPreferences.explanationLevel,
    dailyArticleCount: Math.min(5, Math.max(1, legacy.dailyArticleCount ?? defaultPreferences.dailyArticleCount)),
    dailyDeliveryTime: legacy.dailyDeliveryTime,
    onboardingCompleted: legacy.onboardingCompleted ?? true,
  };
}

export function normalizeCustomInterests(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  const seen = new Set<string>();
  return value.flatMap(item => {
    if (typeof item !== "string") return [];
    const clean = item.trim().replace(/\s+/g, " ").slice(0, 20);
    const key = clean.toLocaleLowerCase("ko-KR");
    if (!clean || seen.has(key)) return [];
    seen.add(key);
    return [clean];
  }).slice(0, 10);
}

export function createProfile(preferences: UserPreferences): UserPreferences {
  return { ...preferences, nickname: preferences.nickname.trim() };
}
