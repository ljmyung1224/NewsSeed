"use client";
import { useEffect, useMemo, useState } from "react";
import type { AppState, Article, UserPreferences } from "@/types";
import { selectDailyNews } from "@/services/news/selectDailyNews";
import { TODAY } from "@/lib/date";
import { clearAnonymousState, completeArticle, completeDay, initialStats, loadState, saveState, saveSeedRecord } from "@/lib/storage";
import { OnboardingScreen } from "@/features/onboarding/onboarding-screen";
import { HomeScreen } from "@/features/daily-news/home-screen";
import { LessonScreen } from "@/features/daily-news/lesson-screen";
import { CompletionScreen } from "@/features/daily-news/completion-screen";
import { AuthScreen } from "@/features/auth/auth-screen";
import { useAuth } from "@/features/auth/use-auth";
import { loadCloudState, saveCloudState } from "@/services/user/userState";
import { useRouter } from "next/navigation";
type Screen = { name: "home" } | { name: "lesson"; index: number } | { name: "complete" };
export function NewseedApp({ initialArticles, authEnabled }: { initialArticles: Article[]; authEnabled: boolean }) {
  const router = useRouter();
  const [state, setState] = useState<AppState>({ profile: null, stats: initialStats });
  const [availableArticles, setAvailableArticles] = useState(initialArticles);
  const [ready, setReady] = useState(false);
  const [screen, setScreen] = useState<Screen>({ name: "home" });
  const [earnedXp, setEarnedXp] = useState(0);
  const [guestMode, setGuestMode] = useState(false);
  const [newsStatus, setNewsStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [newsRetry, setNewsRetry] = useState(0);
  const { user, ready: authReady } = useAuth(authEnabled);
  useEffect(() => {
    if (!authReady || (!user && !guestMode)) return;
    let active = true;
    const timer = window.setTimeout(async () => {
      const accountState = loadState(user?.id);
      const anonymousState = loadState();
      const localState = accountState.profile ? accountState : anonymousState;
      const cloudState = user ? await loadCloudState(user.id) : null;
      if (!active) return;
      // Keep a locally edited profile usable even if remote sync is temporarily unavailable.
      const nextState = localState.profile ? { ...cloudState, ...localState, stats: cloudState?.stats ?? localState.stats } : (cloudState ?? localState);
      setState(nextState);
      setReady(true);
      if (user && !cloudState) {
        const migrated = await saveCloudState(user.id, localState);
        if (migrated && anonymousState.profile) clearAnonymousState();
      }
    }, 0);
    return () => { active = false; window.clearTimeout(timer); };
  }, [authReady, guestMode, user]);
  useEffect(() => {
    if (!ready) return;
    saveState(state, user?.id);
    if (!user) return;
    const timer = window.setTimeout(() => { void saveCloudState(user.id, state); }, 350);
    return () => window.clearTimeout(timer);
  }, [state, ready, user]);
  useEffect(() => {
    if (!ready || !state.profile) return;
    let active = true;
    const controller = new AbortController();
    const params = new URLSearchParams({ difficulty: state.profile.gradeLevel, readingLevel: state.profile.readingLevel, explanationLevel: state.profile.explanationLevel, count: String(state.profile.dailyArticleCount), interests: state.profile.interests.join(","), customInterests: state.profile.customInterests.join(",") });
    fetch(`/api/daily-news?${params}`, { signal: controller.signal })
      .then(response => response.ok ? response.json() as Promise<{ articles: Article[] }> : Promise.reject(new Error(`Daily news responded with ${response.status}`)))
      .then(data => {
        if (!active) return;
        const liveArticles = data.articles.filter(article => article.sourceType === "news-api");
        if (liveArticles.length !== state.profile?.dailyArticleCount) throw new Error("Live news count did not match the requested count");
        setAvailableArticles(liveArticles);
        setNewsStatus("ready");
      })
      .catch(error => {
        if (!active || error instanceof Error && error.name === "AbortError") return;
        console.error("[NewsSeed] Live news unavailable.", error);
        setNewsStatus("error");
      });
    return () => { active = false; controller.abort(); };
  }, [newsRetry, ready, state.profile]);
  const articles = useMemo(() => selectDailyNews(availableArticles.filter(article => article.sourceType === "news-api"), state.profile?.interests ?? [], state.profile?.dailyArticleCount ?? 1), [availableArticles, state.profile?.dailyArticleCount, state.profile?.interests]);
  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;
    articles.forEach(article => console.info("[NewsSeed Article]", article.sourceType === "news-api" ? {
      sourceType: article.sourceType, sourceTitle: article.source.title, publisher: article.source.publisher, category: article.category,
    } : { sourceType: article.sourceType, fallbackReason: article.fallbackReason ?? "unknown" }));
  }, [articles]);
  if (!authReady) return <LoadingScreen label="로그인 정보를 확인하는 중"/>;
  if (!user && !guestMode) return <AuthScreen configured={authEnabled} sampleArticles={initialArticles} onContinueAsGuest={() => setGuestMode(true)}/>;
  if (!ready) return <LoadingScreen label="나의 학습 기록을 불러오는 중"/>;
  if (!state.profile) return <OnboardingScreen onComplete={(profile: UserPreferences) => { setState(current => ({ ...current, profile })); setScreen({name:"home"}); }} />;
  if (newsStatus === "idle" || newsStatus === "loading") return <LoadingScreen label="오늘의 뉴스를 준비하는 중"/>;
  if (newsStatus === "error" || !articles.length) return <NewsUnavailableScreen onRetry={() => setNewsRetry(current => current + 1)}/>;
  const openNext = () => { const done = state.stats.articleCompletions[TODAY] ?? []; const next = articles.findIndex(article => !done.includes(article.id)); setScreen({ name: "lesson", index: next === -1 ? 0 : next }); };
  const finishArticle = (index: number) => {
    const alreadyCompleted = (state.stats.articleCompletions[TODAY] ?? []).includes(articles[index].id);
    const newStats = completeArticle(state.stats, TODAY, articles[index].id);
    const completed = newStats.articleCompletions[TODAY] ?? [];
    const dayComplete = completed.length >= articles.length;
    const nextStats = alreadyCompleted ? newStats : (dayComplete ? completeDay(newStats, TODAY) : newStats);
    setEarnedXp(alreadyCompleted ? 0 : nextStats.xp - state.stats.xp);
    if (!alreadyCompleted) saveSeedRecord({ article: articles[index], completedAt: new Date().toISOString(), xpEarned: nextStats.xp - state.stats.xp, quizCompleted: true }, user?.id);
    setState(current => ({ ...current, stats: nextStats }));
    setScreen({ name: "complete" });
  };
  if (screen.name === "lesson") return <LessonScreen key={articles[screen.index].id} article={articles[screen.index]} index={screen.index} total={articles.length} onBack={()=>setScreen({name:"home"})} onComplete={()=>finishArticle(screen.index)}/>;
  if (screen.name === "complete") return <CompletionScreen xp={state.stats.xp} streak={state.stats.streak} earnedXp={earnedXp} completedCount={(state.stats.articleCompletions[TODAY] ?? []).length} totalCount={articles.length} onHome={()=>setScreen({name:"home"})}/>;
  return <HomeScreen profile={state.profile} stats={state.stats} articles={articles} accountLabel={user?.email ?? user?.user_metadata?.name} onStart={openNext} onOpenArticle={index=>setScreen({name:"lesson",index})} onAccount={() => router.push("/profile")}/>;
}

function LoadingScreen({ label }: { label: string }) {
  return <div className="grid min-h-dvh place-items-center bg-[var(--cream)]"><div className="text-center"><div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-[#d9e7dc] border-t-[var(--green)]"/><p className="mt-4 text-sm font-bold text-[var(--muted)]">{label}</p></div></div>;
}

function NewsUnavailableScreen({ onRetry }: { onRetry: () => void }) {
  return <div className="grid min-h-dvh place-items-center bg-[var(--cream)] px-5"><div className="card max-w-md p-8 text-center"><span className="text-4xl">📰</span><h1 className="mt-4 text-2xl font-black">오늘의 뉴스를 준비하지 못했어요</h1><p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">실제 뉴스 API에서 뉴스를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.</p><button onClick={onRetry} className="btn-primary mt-6 w-full">다시 불러오기</button></div></div>;
}
