import { NextResponse } from "next/server";
import type { Category, ExplanationLevel, GradeLevel, ReadingLevel } from "@/types";
import { categories } from "@/data/categories";
import { getDailyNews } from "@/services/news/getDailyNews";
import { normalizeCustomInterests } from "@/lib/storage";

const validCategories = new Set<Category>(categories.map(item => item.name));
const validDifficulties = new Set<GradeLevel>(["1-2", "3-4", "5-6"]);
const validReadingLevels = new Set<ReadingLevel>(["easy", "normal", "challenge"]);
const validExplanationLevels = new Set<ExplanationLevel>(["very-easy", "easy", "detailed"]);

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const difficultyParam = params.get("difficulty") as GradeLevel | null;
  const readingParam = params.get("readingLevel") as ReadingLevel | null;
  const explanationParam = params.get("explanationLevel") as ExplanationLevel | null;
  const difficulty = difficultyParam && validDifficulties.has(difficultyParam) ? difficultyParam : "3-4";
  const readingLevel = readingParam && validReadingLevels.has(readingParam) ? readingParam : "normal";
  const explanationLevel = explanationParam && validExplanationLevels.has(explanationParam) ? explanationParam : "easy";
  const count = Math.min(5, Math.max(1, Number.parseInt(params.get("count") ?? "3", 10) || 3));
  const interests = (params.get("interests") ?? "").split(",").filter((value): value is Category => validCategories.has(value as Category)).slice(0, 10);
  const customInterests = normalizeCustomInterests((params.get("customInterests") ?? "").split(","));
  const articles = await getDailyNews({ interests, customInterests, difficulty, readingLevel, explanationLevel, count, allowMockFallback: false });
  return NextResponse.json({ articles }, { headers: { "Cache-Control": "private, max-age=300" } });
}
