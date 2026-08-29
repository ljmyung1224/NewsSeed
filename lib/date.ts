export const TODAY = "2026-08-29";

export function formatKoreanDate(dateString = TODAY, includeWeekday = true) {
  return new Intl.DateTimeFormat("ko-KR", { year: "numeric", month: "long", day: "numeric", ...(includeWeekday ? { weekday: "long" as const } : {}) }).format(new Date(`${dateString}T12:00:00`));
}

export function previousDate(dateString: string) {
  const date = new Date(`${dateString}T12:00:00`);
  date.setDate(date.getDate() - 1);
  return date.toISOString().slice(0, 10);
}
