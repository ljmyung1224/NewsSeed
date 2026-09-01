import type { Category, DailyMissionId, SeedRecord } from "@/types";

export const missionDefinitions: { id: DailyMissionId; title: string; target: number; rewardXp: number; rewardLeaves: number; emoji: string }[] = [
  { id: "read-two", title: "기사 2개 읽기", target: 2, rewardXp: 5, rewardLeaves: 3, emoji: "📖" },
  { id: "quiz-two", title: "퀴즈 2개 맞히기", target: 2, rewardXp: 5, rewardLeaves: 3, emoji: "💡" },
  { id: "explore-one", title: "새로운 분야 1개 읽기", target: 1, rewardXp: 5, rewardLeaves: 4, emoji: "🧭" },
];

export function recordDateKey(record: SeedRecord) {
  const parts = new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Seoul", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(new Date(record.completedAt));
  const value = Object.fromEntries(parts.map(part => [part.type, part.value]));
  return `${value.year}-${value.month}-${value.day}`;
}

export function recordsForDate(records: SeedRecord[], date: string) {
  return records.filter(record => recordDateKey(record) === date);
}

export function getMissionProgress(records: SeedRecord[], date: string): Record<DailyMissionId, number> {
  const today = recordsForDate(records, date);
  const earlier = records.filter(record => recordDateKey(record) < date);
  const historicalCounts = getCategorySeedCounts(earlier);
  return {
    "read-two": Math.min(2, today.length),
    "quiz-two": Math.min(2, today.filter(record => record.quizCompleted).length),
    "explore-one": today.some(record => historicalCounts[record.article.category] === 0) ? 1 : 0,
  };
}

export function getCompletedMissionIds(records: SeedRecord[], date: string): DailyMissionId[] {
  const progress = getMissionProgress(records, date);
  return missionDefinitions.filter(mission => progress[mission.id] >= mission.target).map(mission => mission.id);
}

const categoryNames: Category[] = ["경제", "과학", "사회", "국제", "환경", "문화", "스포츠", "기술", "동물", "우주"];

export function getCategorySeedCounts(records: SeedRecord[]): Record<Category, number> {
  const counts = Object.fromEntries(categoryNames.map(category => [category, 0])) as Record<Category, number>;
  records.forEach(record => { counts[record.article.category] += 1; });
  return counts;
}

export const treeStages = [
  { id: "seed", name: "씨앗", minXp: 0, nextXp: 100, emoji: "🌰", shopLevel: 0 },
  { id: "sprout", name: "새싹", minXp: 100, nextXp: 300, emoji: "🌱", shopLevel: 0 },
  { id: "young-tree", name: "어린나무", minXp: 300, nextXp: 700, emoji: "🌳", shopLevel: 1 },
  { id: "green-tree", name: "푸른나무", minXp: 700, nextXp: 1500, emoji: "🌲", shopLevel: 2 },
  { id: "knowledge-tree", name: "지식나무", minXp: 1500, nextXp: null, emoji: "🌳", shopLevel: 3 },
] as const;

export function getTreeGrowth(xp: number) {
  const index = treeStages.findLastIndex(stage => xp >= stage.minXp);
  const stage = treeStages[Math.max(0, index)];
  const next = treeStages[index + 1];
  const progress = stage.nextXp ? Math.min(99, Math.max(0, Math.floor(((xp - stage.minXp) / (stage.nextXp - stage.minXp)) * 100))) : 100;
  return { stage, next, progress, customizationUnlocked: xp >= 300 };
}
