"use client";

import { useState } from "react";
import { categories } from "@/data/categories";
import type { Category, GradeLevel, UserProfile } from "@/types";
import { CheckIcon } from "@/components/icons";
import { SproutLogo } from "@/components/brand";

const grades: { value: GradeLevel; label: string; short: string }[] = [
  { value: "1-2", label: "초등학교 1~2학년", short: "1·2학년" },
  { value: "3-4", label: "초등학교 3~4학년", short: "3·4학년" },
  { value: "5-6", label: "초등학교 5~6학년", short: "5·6학년" },
];

export function OnboardingScreen({ onComplete }: { onComplete: (profile: UserProfile) => void }) {
  const [step, setStep] = useState(0);
  const [nickname, setNickname] = useState("");
  const [grade, setGrade] = useState<GradeLevel | null>(null);
  const [interests, setInterests] = useState<Category[]>([]);
  const canContinue = step === 0 ? nickname.trim().length >= 2 : step === 1 ? grade !== null : interests.length >= 3;
  const next = () => { if (!canContinue) return; if (step < 2) setStep(step + 1); else onComplete({ nickname: nickname.trim(), grade: grade!, interests }); };
  const toggle = (category: Category) => setInterests(current => current.includes(category) ? current.filter(item => item !== category) : [...current, category]);

  return <main className="min-h-dvh bg-[var(--cream)] px-5 py-6 sm:grid sm:place-items-center">
    <div className="mx-auto w-full max-w-[520px]">
      <div className="mb-8 flex items-center justify-between"><SproutLogo/><span className="text-sm font-extrabold text-[var(--muted)]">{step + 1} / 3</span></div>
      <div className="mb-9 flex gap-2">{[0,1,2].map(item => <div key={item} className={`h-2 flex-1 rounded-full transition-colors ${item <= step ? "bg-[var(--green)]" : "bg-[#dfe7e1]"}`}/>)}</div>
      <section className="card min-h-[460px] p-6 sm:p-9">
        {step === 0 && <div className="animate-rise">
          <span className="mb-6 grid h-20 w-20 place-items-center rounded-[26px] bg-[var(--green-soft)] text-4xl">🌱</span>
          <p className="eyebrow">반가워요!</p><h1 className="mt-2 text-[28px] font-black leading-tight tracking-[-0.04em]">어떻게 불러드릴까요?</h1><p className="mt-3 text-[15px] leading-relaxed text-[var(--muted)]">나만의 신문에 표시할 멋진 이름을 알려주세요.</p>
          <label className="mt-8 block text-sm font-extrabold" htmlFor="nickname">닉네임</label><input id="nickname" autoFocus maxLength={10} value={nickname} onChange={e => setNickname(e.target.value)} onKeyDown={e => e.key === "Enter" && next()} placeholder="예: 새싹이" className="input mt-2"/><p className="mt-2 text-right text-xs font-bold text-[#9aa49d]">{nickname.length}/10</p>
        </div>}
        {step === 1 && <div className="animate-rise">
          <span className="mb-6 grid h-20 w-20 place-items-center rounded-[26px] bg-[#fff4d7] text-4xl">📚</span>
          <p className="eyebrow">딱 맞는 난이도로</p><h1 className="mt-2 text-[28px] font-black leading-tight tracking-[-0.04em]">몇 학년인가요?</h1><p className="mt-3 text-[15px] text-[var(--muted)]">읽기 편한 말과 문장으로 뉴스를 준비할게요.</p>
          <div className="mt-8 space-y-3">{grades.map(item => <button key={item.value} onClick={() => setGrade(item.value)} className={`option-card ${grade === item.value ? "selected" : ""}`}><span className="grid h-10 w-10 place-items-center rounded-xl bg-[#f1f5f2] text-sm font-black text-[var(--green)]">{item.short.slice(0,3)}</span><span className="flex-1 font-extrabold">{item.label}</span>{grade === item.value && <span className="grid h-6 w-6 place-items-center rounded-full bg-[var(--green)] text-white"><CheckIcon size={15}/></span>}</button>)}</div>
        </div>}
        {step === 2 && <div className="animate-rise">
          <span className="mb-5 grid h-16 w-16 place-items-center rounded-[22px] bg-[#efeefe] text-3xl">✨</span>
          <p className="eyebrow">나만의 관심 지도</p><h1 className="mt-2 text-[28px] font-black leading-tight tracking-[-0.04em]">궁금한 것을 골라보세요</h1><p className="mt-2 text-[15px] text-[var(--muted)]">3개 이상 선택하면 딱 맞는 신문을 만들어요. <b className="text-[var(--green)]">{interests.length}개 선택</b></p>
          <div className="mt-6 grid grid-cols-3 gap-2.5">{categories.map(item => { const active = interests.includes(item.name); return <button key={item.name} onClick={() => toggle(item.name)} className={`relative rounded-2xl border-2 px-2 py-4 text-center transition active:scale-95 ${active ? "border-[var(--green)] bg-[var(--green-soft)] shadow-[0_3px_0_#b9dfc2]" : "border-[var(--line)] bg-white hover:bg-[#f8faf8]"}`}><span className="block text-2xl">{item.emoji}</span><span className={`mt-1.5 block text-sm font-extrabold ${active ? "text-[var(--green-deep)]" : "text-[var(--ink)]"}`}>{item.name}</span>{active && <span className="absolute right-1.5 top-1.5 grid h-5 w-5 place-items-center rounded-full bg-[var(--green)] text-white"><CheckIcon size={12}/></span>}</button>})}</div>
        </div>}
      </section>
      <div className="mt-5 flex gap-3">{step > 0 && <button onClick={() => setStep(step - 1)} className="btn-secondary w-[96px]">이전</button>}<button disabled={!canContinue} onClick={next} className="btn-primary flex-1">{step === 2 ? "나만의 신문 만들기" : "계속하기"}</button></div>
    </div>
  </main>;
}
