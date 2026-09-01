import { getTreeGrowth } from "../lib/growth";
import { grantLearningLeaves, initialStats, mergeLearningStats, normalizeLearningStats } from "../lib/storage";
import { equipTreeItems, itemState, purchaseTreeItem, treeShopItems } from "../lib/tree-shop";

const boundaries = [
  [0, "씨앗", 0], [99, "씨앗", 99], [100, "새싹", 0], [299, "새싹", 99],
  [300, "어린나무", 0], [699, "어린나무", 99], [700, "푸른나무", 0],
  [1499, "푸른나무", 99], [1500, "지식나무", 100],
] as const;

for (const [xp, expectedStage, expectedProgress] of boundaries) {
  const growth = getTreeGrowth(xp);
  assert(growth.stage.name === expectedStage, `${xp} XP stage`);
  assert(growth.progress === expectedProgress, `${xp} XP progress`);
  assert(growth.customizationUnlocked === (xp >= 300), `${xp} XP unlock`);
}

const star = treeShopItems.find(item => item.id === "decor-star")!;
const funded = normalizeLearningStats({ ...initialStats, xp: 300, leafRewardEvents: { setup: 100 } });
const purchase = purchaseTreeItem(funded, star);
assert(purchase.ok && purchase.stats.leafCurrency === 60, "purchase and balance deduction");
if (!purchase.ok) throw new Error("Purchase unexpectedly failed");
const repurchase = purchaseTreeItem(purchase.stats, star);
assert(!repurchase.ok && repurchase.reason === "owned" && repurchase.stats.leafCurrency === 60, "repurchase prevention");
const equipped = equipTreeItems(purchase.stats, { ...purchase.stats.equippedTreeItems, decoration: star.id });
assert(equipped.equippedTreeItems.decoration === star.id, "equip purchased item");

const poor = normalizeLearningStats({ ...initialStats, xp: 300, leafRewardEvents: { setup: 20 } });
const insufficient = purchaseTreeItem(poor, star);
assert(!insufficient.ok && insufficient.reason === "insufficient", "insufficient balance");
assert(itemState(normalizeLearningStats({ ...initialStats, xp: 299 }), star) === "locked", "stage lock");

const firstReward = grantLearningLeaves(initialStats, "2026-09-01", "article-a", []);
const repeatedReward = grantLearningLeaves(firstReward.stats, "2026-09-01", "article-a", []);
assert(firstReward.earnedLeaves === 5 && repeatedReward.earnedLeaves === 0, "leaf event deduplication");
assert(mergeLearningStats(firstReward.stats, firstReward.stats).leafCurrency === 5, "cloud merge does not add balances");

const refreshed = normalizeLearningStats(JSON.parse(JSON.stringify(equipped)));
assert(refreshed.leafCurrency === 60 && refreshed.equippedTreeItems.decoration === star.id, "serialized state restore");

console.info(`[Tree test] ${boundaries.length} boundaries, rewards, purchase, lock, equip, restore and merge passed.`);

function assert(condition: unknown, label: string): asserts condition {
  if (!condition) throw new Error(`[Tree test] Failed: ${label}`);
}
