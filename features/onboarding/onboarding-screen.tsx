"use client";

import { useState } from "react";
import { categories } from "@/data/categories";
import type { Category, ExplanationLevel, GradeLevel, ReadingLevel, UserPreferences } from "@/types";
import { CheckIcon } from "@/components/icons";
import { SproutLogo } from "@/components/brand";
import { InterestSelector } from "@/components/interest-selector";

const grades: { value: GradeLevel; label: string; short: string }[] = [
  { value: "1-2", label: "초등학교 1~2학년", short: "1·2" }, { value: "3-4", label: "초등학교 3~4학년", short: "3·4" }, { value: "5-6", label: "초등학교 5~6학년", short: "5·6" },
];
const readingLevels: { value: ReadingLevel; label: string; description: string }[] = [
  { value: "easy", label: "쉬움", description: "짧고 편안하게 읽어요" }, { value: "normal", label: "보통", description: "학년 수준에 맞춰 읽어요" }, { value: "challenge", label: "도전", description: "조금 긴 글과 새 어휘에 도전해요" },
];
const explanationLevels: { value: ExplanationLevel; label: string; description: string }[] = [
  { value: "very-easy", label: "아주 쉽게", description: "핵심만 가장 쉬운 말로" }, { value: "easy", label: "쉽게", description: "배경과 원인을 차근차근" }, { value: "detailed", label: "자세히", description: "개념과 맥락까지 깊이 있게" },
];

export function OnboardingScreen({ onComplete, initialPreferences }: { onComplete: (profile: UserPreferences) => void; initialPreferences?: UserPreferences | null }) {
  const [step, setStep] = useState(0);
  const [nickname, setNickname] = useState(initialPreferences?.nickname ?? "");
  const [gradeLevel, setGradeLevel] = useState<GradeLevel | null>(initialPreferences?.gradeLevel ?? null);
  const [interests, setInterests] = useState<Category[]>(initialPreferences?.interests ?? categories.map(item => item.name));
  const [customInterests, setCustomInterests] = useState(initialPreferences?.customInterests ?? []);
  const [readingLevel, setReadingLevel] = useState<ReadingLevel>(initialPreferences?.readingLevel ?? "normal");
  const [explanationLevel, setExplanationLevel] = useState<ExplanationLevel>(initialPreferences?.explanationLevel ?? "easy");
  const [dailyArticleCount, setDailyArticleCount] = useState(initialPreferences?.dailyArticleCount ?? 1);
  const canContinue = step === 0 ? nickname.trim().length >= 2 : step === 1 ? gradeLevel !== null : step === 2 ? interests.length + customInterests.length > 0 : true;
  const next = () => {
    if (!canContinue) return;
    if (step < 3) setStep(step + 1);
    else onComplete({ nickname: nickname.trim(), gradeLevel: gradeLevel!, interests, customInterests, readingLevel, explanationLevel, dailyArticleCount, dailyDeliveryTime: initialPreferences?.dailyDeliveryTime, onboardingCompleted: true });
  };

  return <main className="onboarding-page min-h-dvh bg-[var(--cream)] px-5 py-6 sm:grid sm:place-items-center">
    <div className="mx-auto w-full max-w-[560px]">
      <div className="mb-7 flex items-center justify-between"><SproutLogo/><span className="text-sm font-extrabold text-[var(--muted)]">{step + 1} / 4</span></div>
      <div className="mb-8 flex gap-2">{[0,1,2,3].map(item => <div key={item} className={`h-2 flex-1 rounded-full transition-colors ${item <= step ? "bg-[var(--green)]" : "bg-[#dfe7e1]"}`}/>)}</div>
      <section className="card min-h-[500px] p-6 sm:p-9">
        {step === 0 && <div className="animate-rise"><span className="mb-6 grid h-20 w-20 place-items-center rounded-[26px] bg-[var(--green-soft)] text-4xl">🌱</span><p className="eyebrow">내 이름으로 시작해요</p><h1 className="mt-2 text-[28px] font-black tracking-[-0.04em]">어떻게 불러드릴까요?</h1><p className="mt-3 text-[15px] leading-relaxed text-[var(--muted)]">로그인한 계정에 나만의 신문과 학습 기록을 저장할게요.</p><label className="mt-8 block text-sm font-extrabold" htmlFor="nickname">닉네임</label><input id="nickname" autoFocus maxLength={10} value={nickname} onChange={event => setNickname(event.target.value)} onKeyDown={event => event.key === "Enter" && next()} placeholder="예: 새싹이" className="input mt-2"/><p className="mt-2 text-right text-xs font-bold text-[#9aa49d]">{nickname.length}/10</p></div>}
        {step === 1 && <div className="animate-rise"><span className="mb-6 grid h-20 w-20 place-items-center rounded-[26px] bg-[#fff4d7] text-4xl">📚</span><p className="eyebrow">기본 읽기 기준</p><h1 className="mt-2 text-[28px] font-black tracking-[-0.04em]">몇 학년인가요?</h1><p className="mt-3 text-[15px] text-[var(--muted)]">학년과 읽기 수준은 다음 단계에서 따로 조절할 수 있어요.</p><div className="mt-8 space-y-3">{grades.map(item => <button key={item.value} onClick={() => setGradeLevel(item.value)} className={`option-card ${gradeLevel === item.value ? "selected" : ""}`}><span className="grid h-10 w-10 place-items-center rounded-xl bg-[#f1f5f2] text-sm font-black text-[var(--green)]">{item.short}</span><span className="flex-1 font-extrabold">{item.label}</span>{gradeLevel === item.value && <Selected/>}</button>)}</div></div>}
        {step === 2 && <div className="animate-rise"><span className="mb-5 grid h-16 w-16 place-items-center rounded-[22px] bg-[#efeefe] text-3xl">✨</span><p className="eyebrow">나만의 관심 지도</p><h1 className="mt-2 text-[28px] font-black tracking-[-0.04em]">원하지 않는 분야만 빼보세요</h1><p className="mt-2 text-[15px] text-[var(--muted)]">처음에는 모든 분야가 선택되어 있어요. 기본 {interests.length}개, 기타 {customInterests.length}개</p><InterestSelector interests={interests} customInterests={customInterests} onInterestsChange={setInterests} onCustomInterestsChange={setCustomInterests}/></div>}
        {step === 3 && <div className="animate-rise"><span className="mb-5 grid h-16 w-16 place-items-center rounded-[22px] bg-[#e9f3ff] text-3xl">🎛️</span><p className="eyebrow">내게 딱 맞게</p><h1 className="mt-2 text-[28px] font-black tracking-[-0.04em]">신문 읽는 방법을 골라요</h1><SettingGroup title="읽기 수준" items={readingLevels} value={readingLevel} onChange={value => setReadingLevel(value as ReadingLevel)}/><SettingGroup title="설명 난이도" items={explanationLevels} value={explanationLevel} onChange={value => setExplanationLevel(value as ExplanationLevel)}/><div className="mt-6"><div className="flex items-center justify-between"><p className="text-sm font-black">하루 뉴스 개수</p><b className="text-sm text-[var(--green)]">{dailyArticleCount}개</b></div><div className="mt-3 grid grid-cols-5 gap-2">{[1,2,3,4,5].map(count => <button key={count} onClick={() => setDailyArticleCount(count)} className={`h-11 rounded-xl border-2 text-sm font-black transition ${dailyArticleCount === count ? "border-[var(--green)] bg-[var(--green-soft)] text-[var(--green-deep)]" : "border-[var(--line)] text-[var(--muted)]"}`}>{count}</button>)}</div></div></div>}
      </section>
      <div className="mt-5 flex gap-3">{step > 0 && <button onClick={() => setStep(step - 1)} className="btn-secondary w-[96px]">이전</button>}<button disabled={!canContinue} onClick={next} className="btn-primary flex-1">{step === 3 ? "나만의 신문 만들기" : "계속하기"}</button></div>
    </div>
  </main>;
}

function Selected({ small = false }: { small?: boolean }) { return <span className={`grid place-items-center rounded-full bg-[var(--green)] text-white ${small ? "h-5 w-5" : "h-6 w-6"}`}><CheckIcon size={small ? 12 : 15}/></span>; }

function SettingGroup({ title, items, value, onChange }: { title: string; items: { value: string; label: string; description: string }[]; value: string; onChange: (value: string) => void }) {
  return <div className="mt-6"><p className="mb-2 text-sm font-black">{title}</p><div className="grid grid-cols-3 gap-2">{items.map(item => <button key={item.value} onClick={() => onChange(item.value)} className={`rounded-xl border-2 p-2.5 text-left transition ${value === item.value ? "border-[var(--green)] bg-[var(--green-soft)]" : "border-[var(--line)]"}`}><span className="block text-sm font-black">{item.label}</span><span className="mt-1 hidden text-[10px] leading-snug text-[var(--muted)] sm:block">{item.description}</span></button>)}</div></div>;
}
