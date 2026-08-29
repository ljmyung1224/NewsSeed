import type { Article } from "@/types";
import { ArrowIcon, CheckIcon, ClockIcon } from "@/components/icons";

export function NewsCard({ article, index, completed, onClick }: { article: Article; index: number; completed: boolean; onClick: () => void }) {
  return <button onClick={onClick} className="group flex w-full items-center gap-4 rounded-[22px] border border-[var(--line)] bg-white p-4 text-left shadow-[0_3px_0_#e4e9e5] transition hover:-translate-y-0.5 hover:border-[#cbd9cd] hover:shadow-[0_5px_0_#e0e7e2] active:translate-y-0 active:shadow-none sm:p-5">
    <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl text-2xl" style={{ backgroundColor: `${article.color}18` }}>{article.emoji}</span>
    <span className="min-w-0 flex-1">
      <span className="mb-1 flex items-center gap-2 text-xs font-extrabold" style={{ color: article.color }}><span>{index + 1}번째 씨앗</span><span>·</span><ClockIcon size={13}/><span>{article.estimatedReadingTime}분</span></span>
      <span className="block text-[15px] font-extrabold leading-snug text-[var(--ink)] sm:text-base">{article.kidContent.title}</span>
    </span>
    <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full ${completed ? "bg-[var(--green)] text-white" : "bg-[#f2f5f3] text-[var(--muted)] group-hover:bg-[var(--green-soft)] group-hover:text-[var(--green)]"}`}>{completed ? <CheckIcon size={17}/> : <ArrowIcon size={17}/>}</span>
  </button>;
}
