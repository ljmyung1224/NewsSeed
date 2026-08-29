import type { Category } from "@/types";

export const categoryNewsQueries: Record<Category, string> = {
  경제: "어린이 경제 물가 생활",
  과학: "과학 연구 발견",
  사회: "사회 교육 생활",
  국제: "국제 세계 소식",
  환경: "환경 기후 생태",
  문화: "문화 예술 전시",
  스포츠: "스포츠 경기 규칙 선수 도전",
  기술: "기술 인공지능 로봇",
  동물: "동물 생태 보호",
  우주: "우주 NASA 달 탐사 천문",
};

export function sanitizeNewsQuery(value: string) {
  return value.replace(/[<>\p{C}]/gu, " ").replace(/\s+/g, " ").trim().slice(0, 40);
}
