import { BoltIcon, FlameIcon } from "@/components/icons";

export function StreakBadge({ streak, small = false }: { streak: number; small?: boolean }) {
  return <div className={`stat-badge ${small ? "px-3 py-2" : "px-3.5 py-2.5"}`}><FlameIcon size={small ? 18 : 20} className="text-[#ff792e]"/><span><b>{streak}일</b>{!small && <span className="hidden sm:inline"> 연속</span>}</span></div>;
}
export function XPBadge({ xp, small = false }: { xp: number; small?: boolean }) {
  return <div className={`stat-badge ${small ? "px-3 py-2" : "px-3.5 py-2.5"}`}><BoltIcon size={small ? 18 : 20} className="fill-[#f7c936] text-[#d9a812]"/><span><b>{xp}</b> XP</span></div>;
}
