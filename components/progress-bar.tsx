export function ProgressBar({ value, label }: { value: number; label?: string }) {
  return <div className="w-full">
    {label && <div className="mb-2 flex justify-between text-xs font-bold text-[var(--muted)]"><span>{label}</span><span>{Math.round(value)}%</span></div>}
    <div className="h-2.5 overflow-hidden rounded-full bg-[#e8eee9]"><div className="h-full rounded-full bg-[var(--green)] transition-[width] duration-500 ease-out" style={{ width: `${Math.max(4, value)}%` }} /></div>
  </div>;
}
