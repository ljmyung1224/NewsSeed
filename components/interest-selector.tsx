"use client";

import { useState } from "react";
import { categories } from "@/data/categories";
import { normalizeCustomInterests } from "@/lib/storage";
import type { Category } from "@/types";
import { CheckIcon } from "@/components/icons";

export function InterestSelector({ interests, customInterests, onInterestsChange, onCustomInterestsChange }: {
  interests: Category[];
  customInterests: string[];
  onInterestsChange: (value: Category[]) => void;
  onCustomInterestsChange: (value: string[]) => void;
}) {
  const [customOpen, setCustomOpen] = useState(customInterests.length > 0);
  const [draft, setDraft] = useState("");
  const toggle = (category: Category) => onInterestsChange(interests.includes(category) ? interests.filter(item => item !== category) : [...interests, category]);
  const addDraft = () => {
    const next = normalizeCustomInterests([...customInterests, ...draft.split(/[,，]/)]);
    onCustomInterestsChange(next);
    setDraft("");
  };
  return <>
    <div className="mt-5 grid grid-cols-3 gap-2.5 sm:grid-cols-5">{categories.map(item => { const active = interests.includes(item.name); return <button type="button" key={item.name} aria-pressed={active} onClick={() => toggle(item.name)} className={`relative rounded-2xl border-2 px-2 py-4 text-center transition active:scale-95 ${active ? "border-[var(--green)] bg-[var(--green-soft)] shadow-[0_3px_0_#b9dfc2]" : "border-[var(--line)] bg-white hover:bg-[#f8faf8]"}`}><span className="block text-2xl">{item.emoji}</span><span className={`mt-1.5 block text-sm font-extrabold ${active ? "text-[var(--green-deep)]" : "text-[var(--ink)]"}`}>{item.name}</span>{active && <span className="absolute right-1 top-1 grid h-5 w-5 place-items-center rounded-full bg-[var(--green)] text-white"><CheckIcon size={12}/></span>}</button>})}</div>
    <button type="button" aria-expanded={customOpen} onClick={() => setCustomOpen(value => !value)} className={`mt-3 flex w-full items-center justify-between rounded-2xl border-2 px-4 py-3 text-left font-extrabold ${customOpen ? "border-[var(--green)] bg-[var(--green-soft)]" : "border-[var(--line)] bg-white"}`}><span>✨ 기타 관심 분야</span><span>{customOpen ? "−" : "+"}</span></button>
    {customOpen && <div className="mt-3 rounded-2xl bg-[#f8faf8] p-4">
      <label htmlFor="custom-interest" className="text-sm font-black">직접 관심사를 적어보세요</label>
      <div className="mt-2 flex gap-2"><input id="custom-interest" className="input min-w-0" value={draft} maxLength={20} onChange={event => setDraft(event.target.value)} onKeyDown={event => { if (event.key === "Enter" || event.key === ",") { event.preventDefault(); addDraft(); } }} placeholder="공룡, 자동차, 로봇…"/><button type="button" onClick={addDraft} disabled={!draft.trim() || customInterests.length >= 10} className="btn-secondary min-w-16">추가</button></div>
      <p className="mt-2 text-xs font-medium text-[var(--muted)]">Enter 또는 쉼표로 추가 · 최대 10개, 각 20자</p>
      {customInterests.length > 0 && <div className="mt-3 flex flex-wrap gap-2">{customInterests.map(item => <span key={item} className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1.5 text-sm font-extrabold text-[var(--green-deep)] shadow-sm">{item}<button type="button" aria-label={`${item} 삭제`} onClick={() => onCustomInterestsChange(customInterests.filter(value => value !== item))} className="ml-1 text-[#8b958e]">×</button></span>)}</div>}
    </div>}
  </>;
}
