import { TODAY } from "@/lib/date";
import { CheckIcon } from "@/components/icons";

export function MonthlyCalendar({ completedDates }: { completedDates: string[] }) {
  const year = 2026, month = 7;
  const days = Array.from({ length: 31 }, (_, index) => index + 1);
  const leading = new Date(year, month, 1).getDay();
  const mondayLeading = (leading + 6) % 7;
  return <section className="card p-5 sm:p-6">
    <div className="mb-5 flex items-end justify-between"><div><p className="eyebrow">나의 성장 기록</p><h2 className="mt-1 text-xl font-black">8월의 씨앗</h2></div><div className="rounded-full bg-[var(--green-soft)] px-3 py-1.5 text-xs font-extrabold text-[var(--green)]">{completedDates.filter(d => d.startsWith("2026-08")).length}일 완료</div></div>
    <div className="grid grid-cols-7 text-center text-xs font-bold text-[var(--muted)]">{["월","화","수","목","금","토","일"].map(day => <div key={day} className="pb-3">{day}</div>)}</div>
    <div className="grid grid-cols-7 gap-y-2 text-center">{Array.from({length:mondayLeading}).map((_,i)=><div key={`blank-${i}`}/>) }{days.map(day => {
      const date = `2026-08-${String(day).padStart(2,"0")}`; const done = completedDates.includes(date); const today = date === TODAY;
      return <div key={day} className="grid h-9 place-items-center"><span className={`relative grid h-8 w-8 place-items-center rounded-full text-xs font-bold ${done ? "bg-[var(--green)] text-white shadow-sm" : today ? "border-2 border-[var(--green)] text-[var(--green)]" : "text-[#647069]"}`}>{done ? <CheckIcon size={15}/> : day}{today && <i className="absolute -bottom-1 h-1 w-1 rounded-full bg-[var(--green)]"/>}</span></div>;
    })}</div>
  </section>;
}
