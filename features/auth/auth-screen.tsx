"use client";

import { useState, type CSSProperties } from "react";
import type { Provider } from "@supabase/supabase-js";
import type { Article } from "@/types";
import { SproutLogo } from "@/components/brand";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { getSupabaseProjectRef } from "@/lib/supabase/config";

const gradeLabels = { "1-2": "초등 1~2학년", "3-4": "초등 3~4학년", "5-6": "초등 5~6학년" } as const;

export function AuthScreen({ configured, sampleArticles: availableSamples, onContinueAsGuest }: { configured: boolean; sampleArticles: Article[]; onContinueAsGuest?: () => void }) {
  const sampleArticles = availableSamples.slice(0, 3);
  const [loading, setLoading] = useState<Provider | null>(null);
  const [error, setError] = useState("");
  const [sampleIndex, setSampleIndex] = useState(0);
  const [slideDirection, setSlideDirection] = useState<"previous" | "next">("next");
  const showPrevious = () => { setSlideDirection("previous"); setSampleIndex(index => (index - 1 + sampleArticles.length) % sampleArticles.length); };
  const showNext = () => { setSlideDirection("next"); setSampleIndex(index => (index + 1) % sampleArticles.length); };

  const signIn = async (provider: "google" | "kakao") => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    const redirectTo = `${window.location.origin}/auth/callback`;
    if (process.env.NODE_ENV === "development") {
      console.info("[NewsSeed][OAuth][start] Browser client diagnostics.", {
        provider,
        browserProjectRef: getSupabaseProjectRef(process.env.NEXT_PUBLIC_SUPABASE_URL),
        redirectDestination: redirectTo,
      });
    }
    setLoading(provider);
    setError("");
    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo },
    });
    if (authError) {
      setError("로그인을 시작하지 못했어요. 잠시 후 다시 시도해 주세요.");
      setLoading(null);
    }
  };

  return <main className="landing-shell min-h-dvh overflow-x-hidden bg-[var(--cream)] px-4 py-5 sm:px-6 sm:py-8 lg:grid lg:h-dvh lg:min-h-0 lg:place-items-center lg:overflow-y-hidden lg:px-8 lg:py-4">
    <div className="landing-grid mx-auto grid w-full max-w-[1240px] gap-6 lg:grid-cols-[minmax(0,1.45fr)_minmax(360px,.85fr)] lg:items-center lg:gap-8 xl:gap-10">
      <section className="min-w-0">
        <header className="landing-intro">
          <div className="landing-enter landing-logo flex items-center gap-3"><SproutLogo compact/><div><p className="type-display text-xl leading-none text-[var(--ink)]">NewsSeed</p><p className="type-display mt-1 text-[11px] leading-none tracking-[.08em] text-[var(--muted)]">뉴씨드</p></div></div>
          <p className="landing-enter landing-slogan mt-4 text-sm font-black text-[var(--green)] lg:mt-3">하루 한 장, 생각이 자라는 뉴스</p>
          <h1 className="type-display landing-enter landing-heading mt-1.5 text-[30px] sm:text-[38px] lg:text-[38px]">아이에게 맞는 뉴스가 매일 새로운 생각 씨앗이 돼요.</h1>
          <p className="landing-enter landing-description mt-2 text-[15px] font-medium leading-[1.6] text-[var(--muted)] sm:text-[16px]">아이의 관심사와 읽기 수준에 맞춰 매일 새로운 뉴스를 쉽고 재미있게 배워요.</p>
        </header>

        <div className="landing-enter landing-preview news-deck-shell mt-5">
          <div className="news-deck" aria-label="오늘의 뉴씨드 미리보기">
            {sampleArticles.map((article, index) => {
              const position = (index - sampleIndex + sampleArticles.length) % sampleArticles.length;
              return <article key={article.id} className="news-deck-card" aria-hidden={position !== 0} style={{ "--news-position": position, "--article-accent": article.color, "--article-soft": `${article.color}12` } as CSSProperties}>
                <div className="news-card-peek"><span>{article.emoji}</span><b>{article.category}</b></div>
                {position === 0 && <div key={`${article.id}-${slideDirection}`} className={`news-card-content sample-news-${slideDirection}`}>
                  <header className="news-card-header"><div><p>TODAY&apos;S NEWSEED</p><h2>오늘의 뉴씨드</h2></div><span>🌱</span></header>
                  <div className="news-card-body">
                    <div className="news-card-meta"><span style={{ backgroundColor: `${article.color}18`, color: article.color }}>{article.emoji} {article.category}</span><b>{gradeLabels[article.difficulty]} · {article.estimatedReadingTime}분</b></div>
                    <h3>{article.kidContent.title}</h3>
                    <section><p>쉬운 설명</p><div className="line-clamp-2">{article.kidContent.easyExplanation[0]}</div></section>
                    <section className="news-why"><p>왜 중요할까요?</p><div className="line-clamp-2">{article.kidContent.whyItMatters[0]}</div></section>
                    <blockquote><small>오늘의 한 줄 🌱</small><span>{article.kidContent.keyTakeaway}</span></blockquote>
                    <nav className="news-card-nav" aria-label="샘플 뉴스 탐색"><button type="button" onClick={showPrevious} aria-label="이전 샘플 뉴스">‹ <span>이전</span></button><div><b>{sampleIndex + 1} / {sampleArticles.length}</b><span>{sampleArticles.map((item, dotIndex) => <i key={item.id} className={dotIndex === sampleIndex ? "active" : ""}/>)}</span></div><button type="button" onClick={showNext} aria-label="다음 샘플 뉴스"><span>다음</span> ›</button></nav>
                  </div>
                </div>}
              </article>;
            })}
          </div>
        </div>

      </section>

      <aside className="landing-login lg:sticky lg:top-4">
        <section className="landing-login-card w-full rounded-[26px] border border-[var(--line)] bg-white p-6 text-center shadow-[0_6px_0_#e2e9e4] sm:p-7 lg:rounded-[30px] lg:p-7">
          <span className="mx-auto grid h-12 w-12 place-items-center rounded-[18px] bg-[var(--green-soft)] text-2xl">👋</span>
          <p className="eyebrow mt-3">WELCOME TO NEWSEED</p>
          <h2 className="type-display mt-1.5 text-[28px] leading-[1.25] lg:text-[30px]">뉴씨드에 오신 걸<br/>환영해요!</h2>
          <p className="mx-auto mt-2 max-w-xs text-sm font-medium leading-[1.55] text-[var(--muted)]">로그인하고 아이에게 맞는<br/>오늘의 뉴스를 시작해 볼까요?</p>
          <p className="mt-2.5 text-xs font-extrabold text-[var(--green-deep)]">3분이면 오늘의 뉴스 한 장을 읽을 수 있어요.</p>
          <div className="mt-4 space-y-2.5">
            <button disabled={!configured || loading !== null} onClick={() => signIn("google")} className="social-button"><span className="grid h-7 w-7 place-items-center rounded-full bg-white font-black text-[#4285f4] shadow-sm">G</span>{loading === "google" ? "구글로 이동 중..." : "Google로 계속하기"}</button>
            <button disabled={!configured || loading !== null} onClick={() => signIn("kakao")} className="social-button border-[#fee500] bg-[#fee500] text-[#191919] hover:bg-[#f5dc00]"><span className="text-xl">💬</span>{loading === "kakao" ? "카카오로 이동 중..." : "카카오로 계속하기"}</button>
          </div>
          {!configured && <div className="mt-4 border-t border-[var(--line)] pt-4"><p className="text-xs font-medium leading-relaxed text-[var(--muted)]">로그인 없이 샘플 뉴스를 체험해보세요.</p><button onClick={onContinueAsGuest} className="btn-secondary mt-2.5 w-full">먼저 둘러보기</button></div>}
          {error && <p role="alert" className="mt-4 rounded-xl bg-[#fff0ec] p-3 text-sm font-bold text-[#9e432f]">{error}</p>}
          <p className="mt-4 text-[11px] leading-[1.45] text-[#8b958e]">로그인하면 서비스 이용을 위한 최소한의 계정 정보만 사용합니다.</p>
        </section>
      </aside>
    </div>
  </main>;
}
