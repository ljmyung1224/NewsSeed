import type { EquippedTreeItems, LearningStats, TreeItemCategory } from "@/types";
import { getTreeGrowth } from "@/lib/growth";

export interface TreeShopItem { id: string; category: TreeItemCategory; name: string; price: number; minXp: number; preview: string; }

export const defaultEquippedTreeItems: EquippedTreeItems = { pot: "pot-default", decoration: "decor-none", background: "background-default", friend: "friend-none" };
export const defaultOwnedTreeItems = Object.values(defaultEquippedTreeItems);

export const treeShopItems: TreeShopItem[] = [
  { id: "pot-default", category: "pot", name: "기본 화분", price: 0, minXp: 0, preview: "🪴" },
  { id: "pot-yellow", category: "pot", name: "노란 화분", price: 30, minXp: 300, preview: "🟨" },
  { id: "pot-blue", category: "pot", name: "파란 화분", price: 50, minXp: 700, preview: "🟦" },
  { id: "decor-none", category: "decoration", name: "장식 없음", price: 0, minXp: 0, preview: "➖" },
  { id: "decor-star", category: "decoration", name: "별 장식", price: 40, minXp: 300, preview: "⭐" },
  { id: "decor-crown", category: "decoration", name: "지식 왕관", price: 120, minXp: 1500, preview: "👑" },
  { id: "background-default", category: "background", name: "기본 배경", price: 0, minXp: 0, preview: "☁️" },
  { id: "background-sky", category: "background", name: "맑은 하늘", price: 70, minXp: 300, preview: "🌤️" },
  { id: "background-night", category: "background", name: "밤하늘", price: 100, minXp: 700, preview: "🌙" },
  { id: "friend-none", category: "friend", name: "친구 없음", price: 0, minXp: 0, preview: "➖" },
  { id: "friend-bird", category: "friend", name: "작은 새", price: 80, minXp: 700, preview: "🐦" },
  { id: "friend-owl", category: "friend", name: "지혜 부엉이", price: 140, minXp: 1500, preview: "🦉" },
];

export function leafBalance(stats: Pick<LearningStats, "leafRewardEvents" | "treeItemPurchases">) {
  const earned = Object.values(stats.leafRewardEvents ?? {}).reduce((sum, value) => sum + Math.max(0, value), 0);
  const spent = Object.values(stats.treeItemPurchases ?? {}).reduce((sum, purchase) => sum + Math.max(0, purchase.cost), 0);
  return Math.max(0, earned - spent);
}

export function itemState(stats: LearningStats, item: TreeShopItem) {
  if (stats.equippedTreeItems[item.category] === item.id) return "equipped" as const;
  if (stats.ownedTreeItems.includes(item.id)) return "owned" as const;
  if (stats.xp < 300 || stats.xp < item.minXp) return "locked" as const;
  return "available" as const;
}

export function purchaseTreeItem(stats: LearningStats, item: TreeShopItem, now = new Date().toISOString()) {
  const status = itemState(stats, item);
  if (status === "locked") return { ok: false as const, reason: "locked" as const, stats };
  if (status === "owned" || status === "equipped") return { ok: false as const, reason: "owned" as const, stats };
  if (stats.leafCurrency < item.price) return { ok: false as const, reason: "insufficient" as const, stats };
  const next = { ...stats, treeItemPurchases: { ...stats.treeItemPurchases, [item.id]: { cost: item.price, purchasedAt: now } }, ownedTreeItems: [...new Set([...stats.ownedTreeItems, item.id])], treeUpdatedAt: now };
  return { ok: true as const, stats: { ...next, leafCurrency: leafBalance(next) } };
}

export function equipTreeItems(stats: LearningStats, equipped: EquippedTreeItems, now = new Date().toISOString()): LearningStats {
  const safe = { ...stats.equippedTreeItems };
  (Object.keys(equipped) as TreeItemCategory[]).forEach(category => {
    const item = treeShopItems.find(candidate => candidate.id === equipped[category] && candidate.category === category);
    if (item && stats.ownedTreeItems.includes(item.id) && stats.xp >= item.minXp && getTreeGrowth(stats.xp).customizationUnlocked) safe[category] = item.id;
  });
  return { ...stats, equippedTreeItems: safe, treeUpdatedAt: now };
}
