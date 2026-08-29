"use client";

import { useState } from "react";
import type { Provider } from "@supabase/supabase-js";
import { SproutLogo } from "@/components/brand";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { mockArticles } from "@/data/mockArticles";

const benefits = [
  { icon: "🔥", title: "매일 한 장", description: "짧게 읽으며 뉴스 습관 만들기" },
  { icon: "🎯", title: "내 관심사 맞춤", description: "좋아하는 분야와 읽기 수준에 맞게" },
  { icon: "🧠", title: "읽고 퀴즈", description: "문제를 풀며 이해도 확인하기" },
];

const sampleArticles = ["moon-garden", "sports-data", "money-value"].map(id => mockArticles.find(article => article.id === id)!).filter(Boolean);

const gradeLabels = { "1-2": "초등 1~2학년", "3-4": "초등 3~4학년", "5-6": "초등 5~6학년" } as const;

export function AuthScreen({ configured, onContinueAsGuest }: { configured: boolean; onContinueAsGuest?: () => void }) {
  const [loading, setLoading] = useState<Provider | null>(null);
  const [error, setError] = useState("");
  const [sampleIndex, setSampleIndex] = useState(0);
  const sample = sampleArticles[sampleIndex];
  const showPrevious = () => setSampleIndex(index => (index - 1 + sampleArticles.length) % sampleArticles.length);
  const showNext = () => setSampleIndex(index => (index + 1) % sampleArticles.length);

  const signIn = async (provider: "google" | "kakao") => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    setLoading(provider);
    setError("");
    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/auth/callback?next=/` },
    });
    if (authError) {
      setError("로그인을 시작하지 못했어요. 잠시 후 다시 시도해 주세요.");
      setLoading(null);
    }
  };

  return <main className="min-h-dvh overflow-x-hidden bg-[var(--cream)] px-4 py-5 sm:px-6 sm:py-8 lg:grid lg:place-items-center lg:px-8 lg:py-10">
    <div className="mx-auto grid w-full max-w-[1180px] gap-6 lg:grid-cols-[minmax(0,1.45fr)_minmax(360px,.85fr)] lg:items-center lg:gap-8 xl:gap-12">
      <section className="min-w-0 lg:py-3">
        <header className="animate-rise">
          <div className="flex items-center gap-3"><SproutLogo compact/><div><p className="text-xl font-black leading-none tracking-[-0.04em] text-[var(--ink)]">NewsSeed</p><p className="mt-1 text-[11px] font-bold leading-none tracking-[.12em] text-[var(--muted)]">뉴씨드</p></div></div>
          <p className="mt-5 text-sm font-black text-[var(--green)] sm:mt-7">하루 한 장, 생각이 자라는 뉴스</p>
          <h1 className="mt-2 max-w-[660px] text-[26px] font-black leading-[1.35] tracking-[-0.05em] sm:text-[34px] lg:text-[40px]">아이에게 맞는 뉴스가<br className="hidden sm:block"/> 매일 새로운 생각 씨앗이 돼요.</h1>
          <p className="mt-3 max-w-lg text-[15px] font-medium leading-[1.7] text-[var(--muted)] sm:text-[17px]">아이의 관심사와 읽기 수준에 맞춰<br className="hidden sm:block"/> 매일 새로운 뉴스를 쉽고 재미있게 배워요.</p>
        </header>

        <article className="mt-6 animate-rise overflow-hidden rounded-[26px] border border-[var(--line)] bg-white shadow-[0_6px_0_#e3e9e5] [animation-delay:80ms] sm:mt-7 sm:rounded-[30px]">
          <div className="flex items-center justify-between border-b border-[var(--line)] px-5 py-3.5 sm:px-6"><div><p className="text-[11px] font-black tracking-[.12em] text-[var(--green)]">TODAY&apos;S NEWSEED</p><h2 className="mt-0.5 text-lg font-black">오늘의 뉴씨드</h2></div><span className="seed-float grid h-10 w-10 place-items-center rounded-2xl bg-[var(--green-soft)] text-xl">🌱</span></div>
          <div className="p-5 sm:p-6">
            <div key={sample.id} className="sample-news-enter">
              <div className="flex flex-wrap items-center justify-between gap-2"><span className="rounded-full px-3 py-1.5 text-xs font-black" style={{ backgroundColor: `${sample.color}18`, color: sample.color }}>{sample.emoji} {sample.category}</span><span className="text-xs font-bold text-[var(--muted)]">{gradeLabels[sample.difficulty]} · {sample.estimatedReadingTime}분</span></div>
              <h3 className="mt-3.5 text-[22px] font-black leading-[1.35] tracking-[-0.04em] sm:text-[27px]">{sample.kidContent.title}</h3>
              <section className="mt-4"><p className="text-xs font-black text-[var(--green)]">쉬운 설명</p><p className="mt-1.5 line-clamp-3 text-[15px] font-medium leading-[1.65] text-[#3e4c43] sm:line-clamp-2 sm:text-[16px]">{sample.kidContent.easyExplanation[0]}</p></section>
              <section className="mt-4 hidden rounded-2xl bg-[#eef5ff] p-3.5 sm:block"><p className="text-xs font-black text-[#4c72ad]">왜 중요할까요?</p><p className="mt-1.5 line-clamp-2 text-sm font-medium leading-[1.6] text-[#425169]">{sample.kidContent.whyItMatters[0]}</p></section>
              <blockquote className="mt-4 rounded-2xl border-l-4 border-[var(--green)] bg-[var(--green-soft)] px-4 py-2.5 text-sm font-extrabold leading-[1.55] text-[var(--green-deep)]"><span className="mb-0.5 block text-[11px]">오늘의 한 줄 🌱</span>{sample.kidContent.keyTakeaway}</blockquote>
            </div>
            <div className="mt-4 flex items-center gap-2"><button type="button" onClick={showPrevious} aria-label="이전 샘플 뉴스" className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border-2 border-[var(--line)] bg-white text-lg font-black text-[var(--muted)] transition hover:border-[#bdc9c0] hover:bg-[#f8faf8] active:scale-95">‹</button><div className="min-w-0 flex-1 px-1"><div className="flex items-center justify-between gap-2"><span className="shrink-0 text-[11px] font-black text-[var(--muted)]">{sampleIndex + 1} / {sampleArticles.length} 오늘의 뉴스</span><button type="button" onClick={showNext} className="text-[11px] font-black text-[var(--green)] hover:underline">다음 뉴스</button></div><div className="mt-1.5 h-2 overflow-hidden rounded-full bg-[#e5ebe7]"><div key={sampleIndex} className="auth-preview-progress h-full rounded-full bg-[var(--green)]" style={{ width: `${((sampleIndex + 1) / sampleArticles.length) * 100}%` }}/></div></div><button type="button" onClick={showNext} aria-label="다음 샘플 뉴스" className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border-2 border-[var(--line)] bg-white text-lg font-black text-[var(--green)] transition hover:border-[var(--green)] hover:bg-[var(--green-soft)] active:scale-95">›</button></div>
          </div>
        </article>

        <div className="mt-4 grid grid-cols-3 gap-2 sm:mt-5 sm:gap-4">{benefits.map(benefit => <div key={benefit.title} className="min-w-0 rounded-2xl bg-white/65 px-2.5 py-3 text-center sm:flex sm:items-start sm:gap-2.5 sm:bg-transparent sm:px-0 sm:py-0 sm:text-left"><span className="text-xl leading-none sm:text-2xl">{benefit.icon}</span><div className="mt-1 sm:mt-0"><p className="text-xs font-black leading-tight sm:text-sm">{benefit.title}</p><p className="mt-1 hidden text-xs font-medium leading-[1.45] text-[var(--muted)] sm:block">{benefit.description}</p></div></div>)}</div>
      </section>

      <aside className="animate-rise [animation-delay:140ms] lg:sticky lg:top-10">
        <section className="w-full rounded-[26px] border border-[var(--line)] bg-white p-6 text-center shadow-[0_6px_0_#e2e9e4] sm:p-8 lg:rounded-[30px] lg:p-9">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-[20px] bg-[var(--green-soft)] text-[28px]">👋</span>
          <p className="eyebrow mt-4">WELCOME TO NEWSEED</p>
          <h2 className="mt-2 text-[26px] font-black tracking-[-0.05em] lg:text-[30px]">뉴씨드에 오신 걸<br/>환영해요!</h2>
          <p className="mx-auto mt-2.5 max-w-xs text-sm font-medium leading-relaxed text-[var(--muted)]">로그인하고 아이에게 맞는<br/>오늘의 뉴스를 시작해 볼까요?</p>
          <p className="mt-3 text-xs font-extrabold text-[var(--green-deep)]">3분이면 오늘의 뉴스 한 장을 읽을 수 있어요.</p>
          <div className="mt-5 space-y-3">
            <button disabled={!configured || loading !== null} onClick={() => signIn("google")} className="social-button"><span className="grid h-7 w-7 place-items-center rounded-full bg-white font-black text-[#4285f4] shadow-sm">G</span>{loading === "google" ? "구글로 이동 중..." : "Google로 계속하기"}</button>
            <button disabled={!configured || loading !== null} onClick={() => signIn("kakao")} className="social-button border-[#fee500] bg-[#fee500] text-[#191919] hover:bg-[#f5dc00]"><span className="text-xl">💬</span>{loading === "kakao" ? "카카오로 이동 중..." : "카카오로 계속하기"}</button>
          </div>
          {!configured && <div className="mt-5 border-t border-[var(--line)] pt-5"><p className="text-xs font-medium leading-relaxed text-[var(--muted)]">로그인 없이 샘플 뉴스를 체험해보세요.</p><button onClick={onContinueAsGuest} className="btn-secondary mt-3 w-full">먼저 둘러보기</button></div>}
          {error && <p role="alert" className="mt-4 rounded-xl bg-[#fff0ec] p-3 text-sm font-bold text-[#9e432f]">{error}</p>}
          <p className="mt-6 text-[11px] leading-relaxed text-[#8b958e]">로그인하면 서비스 이용을 위한 최소한의 계정 정보만 사용합니다.</p>
        </section>
      </aside>
    </div>
  </main>;
}
