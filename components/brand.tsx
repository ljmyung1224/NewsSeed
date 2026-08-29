export function SproutLogo({ compact = false }: { compact?: boolean }) {
  return <div className="flex items-center gap-2.5" aria-label="뉴씨드">
    <span className="relative flex h-9 w-9 items-end justify-center rounded-xl bg-[var(--green-soft)] pb-1.5 text-[var(--green)] shadow-sm">
      <span className="absolute left-[9px] top-[6px] h-3 w-4 rotate-[25deg] rounded-[100%_0] bg-current" />
      <span className="absolute right-[8px] top-[4px] h-3 w-4 -rotate-[12deg] rounded-[0_100%] bg-[var(--lime)]" />
      <span className="h-4 w-0.5 rounded bg-current" />
    </span>
    {!compact && <span className="type-display text-xl text-[var(--ink)]">뉴씨드</span>}
  </div>;
}
