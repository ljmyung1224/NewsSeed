import type { GradeLevel } from "@/types";
import type { RawNewsArticle } from "@/services/news/fetchNews";

export interface ArticleSafetyResult { safe: boolean; reason?: string; ageRestriction?: GradeLevel; }
export interface ArticleSafetyEvaluator { evaluate(article: RawNewsArticle): Promise<ArticleSafetyResult>; }

const blockedPatterns = ["자살", "자해", "성폭행", "성폭력", "강간", "음란", "포르노", "토막", "참수", "시신 훼손", "잔혹한 살인", "혐오 표현"];
const olderChildPatterns = ["총격", "유혈", "폭탄 테러", "전쟁 사망", "강한 폭력"];

/** Rule-based MVP boundary. Inject an ArticleSafetyEvaluator here when an AI classifier is introduced. */
export async function evaluateArticleSafety(article: RawNewsArticle, evaluator?: ArticleSafetyEvaluator): Promise<ArticleSafetyResult> {
  if (evaluator) return evaluator.evaluate(article);
  const text = `${article.title} ${article.description ?? ""}`.toLowerCase();
  const blocked = blockedPatterns.find(keyword => text.includes(keyword));
  if (blocked) return { safe: false, reason: `어린이에게 부적절할 수 있는 주제 감지: ${blocked}` };
  const restricted = olderChildPatterns.find(keyword => text.includes(keyword));
  if (restricted) return { safe: true, reason: `고학년 보호가 필요한 주제 감지: ${restricted}`, ageRestriction: "5-6" };
  return { safe: true };
}

export function isAllowedForGrade(result: ArticleSafetyResult, gradeLevel: GradeLevel) {
  if (!result.safe) return false;
  if (!result.ageRestriction) return true;
  return gradeLevel === "5-6";
}
