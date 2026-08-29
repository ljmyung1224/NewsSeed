"use client";
import { useEffect, useMemo, useState } from "react";
import type { AppState, Article, UserProfile } from "@/types";
import { selectDailyNews } from "@/services/news/selectDailyNews";
import { TODAY } from "@/lib/date";
import { clearAnonymousState, completeArticle, completeDay, initialStats, loadState, saveState, STORAGE_KEY } from "@/lib/storage";
import { OnboardingScreen } from "@/features/onboarding/onboarding-screen";
import { HomeScreen } from "@/features/daily-news/home-screen";
import { LessonScreen } from "@/features/daily-news/lesson-screen";
import { CompletionScreen } from "@/features/daily-news/completion-screen";
import { AuthScreen } from "@/features/auth/auth-screen";
import { useAuth } from "@/features/auth/use-auth";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { loadCloudState, saveCloudState } from "@/services/user/userState";
type Screen = { name: "home" } | { name: "lesson"; index: number } | { name: "complete" };
export function NewseedApp({ initialArticles, authEnabled }: { initialArticles: Article[]; authEnabled: boolean }) {
  const [state, setState] = useState<AppState>({ profile: null, stats: initialStats });
  const [ready, setReady] = useState(false);
  const [screen, setScreen] = useState<Screen>({ name: "home" });
  const { user, ready: authReady } = useAuth(authEnabled);
  useEffect(() => {
    if (!authReady || (authEnabled && !user)) return;
    let active = true;
    const timer = window.setTimeout(async () => {
      const accountState = loadState(user?.id);
      const anonymousState = loadState();
      const localState = accountState.profile ? accountState : anonymousState;
      const cloudState = user ? await loadCloudState(user.id) : null;
      if (!active) return;
      const nextState = cloudState ?? localState;
      setState(nextState);
      setReady(true);
      if (user && !cloudState) {
        const migrated = await saveCloudState(user.id, localState);
        if (migrated && anonymousState.profile) clearAnonymousState();
      }
    }, 0);
    return () => { active = false; window.clearTimeout(timer); };
  }, [authEnabled, authReady, user]);
  useEffect(() => {
    if (!ready) return;
    saveState(state, user?.id);
    if (!user) return;
    const timer = window.setTimeout(() => { void saveCloudState(user.id, state); }, 350);
    return () => window.clearTimeout(timer);
  }, [state, ready, user]);
  const articles = useMemo(() => selectDailyNews(initialArticles, state.profile?.interests ?? []), [initialArticles, state.profile?.interests]);
  if (!authReady) return <LoadingScreen label="로그인 정보를 확인하는 중"/>;
  if (authEnabled && !user) return <AuthScreen/>;
  if (!ready) return <LoadingScreen label="나의 학습 기록을 불러오는 중"/>;
  if (!state.profile) return <OnboardingScreen onComplete={(profile: UserProfile) => { setState(current => ({ ...current, profile })); setScreen({name:"home"}); }} />;
  const openNext = () => { const done = state.stats.articleCompletions[TODAY] ?? []; const next = articles.findIndex(article => !done.includes(article.id)); setScreen({ name: "lesson", index: next === -1 ? 0 : next }); };
  const finishArticle = (index: number) => {
    const newStats = completeArticle(state.stats, TODAY, articles[index].id);
    const completed = newStats.articleCompletions[TODAY] ?? [];
    const nextIndex = articles.findIndex(article => !completed.includes(article.id));
    if (nextIndex !== -1) {
      setState(current => ({ ...current, stats: newStats }));
      setScreen({ name: "lesson", index: nextIndex });
      window.scrollTo(0, 0);
    } else {
      setState(current => ({ ...current, stats: completeDay(newStats, TODAY) }));
      setScreen({ name: "complete" });
    }
  };
  if (screen.name === "lesson") return <LessonScreen key={articles[screen.index].id} article={articles[screen.index]} index={screen.index} total={articles.length} onBack={()=>setScreen({name:"home"})} onComplete={()=>finishArticle(screen.index)}/>;
  if (screen.name === "complete") return <CompletionScreen xp={state.stats.xp} streak={state.stats.streak} onHome={()=>setScreen({name:"home"})}/>;
  const signOutOrReset = async () => {
    if (user) {
      if (window.confirm("뉴씨드에서 로그아웃할까요? 학습 기록은 계정에 안전하게 저장돼요.")) await getSupabaseBrowserClient()?.auth.signOut();
      return;
    }
    if (window.confirm("온보딩부터 다시 시작할까요? 학습 기록도 초기화돼요.")) { localStorage.removeItem(STORAGE_KEY); setState({profile:null,stats:initialStats}); }
  };
  return <HomeScreen profile={state.profile} stats={state.stats} articles={articles} accountLabel={user?.email ?? user?.user_metadata?.name} onStart={openNext} onOpenArticle={index=>setScreen({name:"lesson",index})} onAccount={signOutOrReset}/>;
}

function LoadingScreen({ label }: { label: string }) {
  return <div className="grid min-h-dvh place-items-center bg-[var(--cream)]"><div className="text-center"><div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-[#d9e7dc] border-t-[var(--green)]"/><p className="mt-4 text-sm font-bold text-[var(--muted)]">{label}</p></div></div>;
}
