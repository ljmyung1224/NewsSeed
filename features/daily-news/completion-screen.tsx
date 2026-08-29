"use client";

import { CheckIcon, FlameIcon } from "@/components/icons";

export function CompletionScreen({ xp, streak, earnedXp, onHome }: { xp: number; streak: number; earnedXp: number; onHome: () => void }) {
  return <main className="relative grid min-h-dvh place-items-center overflow-hidden bg-[var(--green-deep)] px-5 py-10 text-white">
    <div className="confetti c1"/><div className="confetti c2"/><div className="confetti c3"/><div className="confetti c4"/><div className="confetti c5"/>
    <section className="relative z-10 w-full max-w-[500px] animate-rise text-center"><div className="relative mx-auto h-36 w-36"><div className="absolute inset-0 animate-pulse-ring rounded-full bg-[#a8e778]/15"/><div className="absolute inset-4 grid place-items-center rounded-[40px] bg-[#a8e778] text-6xl shadow-[0_8px_0_#6caf52]">🎉</div><span className="absolute -right-3 top-2 grid h-10 w-10 place-items-center rounded-full bg-white text-[var(--green)] shadow-lg"><CheckIcon size={23}/></span></div>
      <p className="mt-8 text-sm font-black tracking-[0.14em] text-[#a9dabb]">TODAY COMPLETE</p><h1 className="type-display mt-2 text-[38px] sm:text-5xl">오늘의 신문 완료!</h1><p className="mx-auto mt-4 max-w-sm text-[16px] font-medium leading-relaxed text-white/70">오늘 읽은 뉴스가 새로운 생각 씨앗이 되었어요.<br/>내일도 한 뼘 더 자라 볼까요?</p>
      <div className="mx-auto mt-8 grid max-w-sm grid-cols-2 gap-3"><div className="rounded-[20px] bg-white/10 p-4 backdrop-blur"><p className="text-xs font-bold text-white/60">오늘 받은 XP</p><p className="mt-1 text-2xl font-black text-[#f9d84a]">+{earnedXp} XP</p></div><div className="rounded-[20px] bg-white/10 p-4 backdrop-blur"><p className="text-xs font-bold text-white/60">연속 학습</p><p className="mt-1 flex items-center justify-center gap-1 text-2xl font-black"><FlameIcon className="text-[#ff8a3d]"/> {streak}일</p></div></div>
      <div className="mx-auto mt-4 max-w-sm rounded-2xl border border-white/10 bg-white/5 p-3 text-sm font-bold text-white/70">지금까지 모은 에너지 <b className="ml-1 text-white">{xp} XP</b></div>
      <button onClick={onHome} className="mt-8 w-full max-w-sm rounded-2xl bg-white px-5 py-4 font-black text-[var(--green-deep)] shadow-[0_5px_0_#b7c7bc] transition hover:bg-[#f5fff5] active:translate-y-1 active:shadow-none">홈으로 돌아가기</button><p className="mt-5 text-sm font-bold text-[#a9dabb]">내일도 새로운 세상이 기다리고 있어요.</p>
    </section>
  </main>;
}
