import type { Article, Category } from "@/types";

export function selectDailyNews(articles: Article[], interests: Category[], count = 3): Article[] {
  if (count <= 0) return [];
  const uniqueById = articles.filter((article, index, all) => all.findIndex(item => item.id === article.id) === index);
  const preferred = uniqueById.filter(article => interests.includes(article.category));
  const exploratory = uniqueById.filter(article => !interests.includes(article.category));
  const chooseDistinct = (pool: Article[], limit: number, usedCategories: Set<Category>) => {
    const result: Article[] = [];
    for (const article of pool) {
      if (result.length >= limit) break;
      if (!usedCategories.has(article.category)) { result.push(article); usedCategories.add(article.category); }
    }
    for (const article of pool) {
      if (result.length >= limit) break;
      if (!result.some(item => item.id === article.id)) result.push(article);
    }
    return result;
  };
  const usedCategories = new Set<Category>();
  const interestCount = Math.min(2, count);
  const selected = chooseDistinct(preferred, interestCount, usedCategories);
  selected.push(...chooseDistinct(exploratory.filter(item => !selected.some(chosen => chosen.id === item.id)), count - selected.length, usedCategories));
  if (selected.length < count) selected.push(...chooseDistinct(uniqueById.filter(item => !selected.some(chosen => chosen.id === item.id)), count - selected.length, usedCategories));
  return selected.slice(0, count);
}
