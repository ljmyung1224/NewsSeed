import type { EquippedTreeItems } from "@/types";
import { getTreeGrowth } from "@/lib/growth";

const backgrounds: Record<string, string> = { "background-default": "bg-[#f2f8f2]", "background-sky": "bg-gradient-to-b from-[#bfe9ff] to-[#effbff]", "background-night": "bg-gradient-to-b from-[#28385f] to-[#7277a7]" };
const pots: Record<string, string> = { "pot-default": "bg-[#9b6148]", "pot-yellow": "bg-[#f2c84b]", "pot-blue": "bg-[#5c91df]" };
const decorations: Record<string, string> = { "decor-none": "", "decor-star": "⭐", "decor-crown": "👑" };
const friends: Record<string, string> = { "friend-none": "", "friend-bird": "🐦", "friend-owl": "🦉" };

export function TreePreview({ xp, equipped, compact = false }: { xp: number; equipped: EquippedTreeItems; compact?: boolean }) {
  const { stage } = getTreeGrowth(xp);
  return <div className={`relative overflow-hidden ${backgrounds[equipped.background] ?? backgrounds["background-default"]} ${compact ? "h-20 rounded-2xl" : "h-72 rounded-[32px]"}`}>
    <span className={`absolute left-1/2 top-[47%] -translate-x-1/2 -translate-y-1/2 ${compact ? "text-4xl" : "text-8xl"}`}>{stage.emoji}</span>
    <span className={`absolute left-1/2 -translate-x-1/2 ${compact ? "top-2 text-lg" : "top-8 text-4xl"}`}>{decorations[equipped.decoration] ?? ""}</span>
    <span className={`absolute ${compact ? "bottom-3 right-4 text-xl" : "bottom-12 right-[22%] text-4xl"}`}>{friends[equipped.friend] ?? ""}</span>
    {xp >= 100 && <span className={`absolute left-1/2 -translate-x-1/2 rounded-b-[45%] rounded-t-md shadow-sm ${pots[equipped.pot] ?? pots["pot-default"]} ${compact ? "bottom-2 h-4 w-8" : "bottom-7 h-9 w-16"}`}/>}
  </div>;
}
