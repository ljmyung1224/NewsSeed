"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { SproutLogo } from "@/components/brand";
import { InterestSelector } from "@/components/interest-selector";
import { useAuth } from "@/features/auth/use-auth";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { clearAllLocalState, clearUserState, loadState, saveState } from "@/lib/storage";
import { loadCloudState, saveCloudState } from "@/services/user/userState";
import type { AppState, ExplanationLevel, GradeLevel, ReadingLevel, UserPreferences } from "@/types";

const gradeOptions: { value: GradeLevel; label: string }[] = [{ value: "1-2", label: "1~2학년" }, { value: "3-4", label: "3~4학년" }, { value: "5-6", label: "5~6학년" }];
const readingOptions: { value: ReadingLevel; label: string }[] = [{ value: "easy", label: "쉬움" }, { value: "normal", label: "보통" }, { value: "challenge", label: "도전" }];
const explanationOptions: { value: ExplanationLevel; label: string }[] = [{ value: "very-easy", label: "아주 쉽게" }, { value: "easy", label: "쉽게" }, { value: "detailed", label: "자세히" }];

export function ProfileScreen({ authEnabled }: { authEnabled: boolean }) {
  const router = useRouter();
  const { user, ready: authReady } = useAuth(authEnabled);
  const [state, setState] = useState<AppState | null>(null);
  const [draft, setDraft] = useState<UserPreferences | null>(null);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error" | "deleting">("idle");
  useEffect(() => { if (!authReady) return; if (authEnabled && !user) { router.replace("/"); return; } void (async () => { const local = user ? loadState(user.id) : loadState(); const next = user && !local.profile ? await loadCloudState(user.id) ?? local : local; setState(next); setDraft(next.profile); })(); }, [authEnabled, authReady, router, user]);
  const provider = providerLabel(user);
  const readCount = useMemo(() => state ? Object.values(state.stats.articleCompletions).reduce((sum, ids) => sum + ids.length, 0) : 0, [state]);
  if (!authReady || !state) return <Loading/>;
  if (!draft) return <main className="grid min-h-dvh place-items-center bg-[var(--cream)] px-5"><div className="card max-w-md p-8 text-center"><span className="text-4xl">🌱</span><h1 className="mt-4 text-2xl font-black">먼저 맞춤 설정을 마쳐주세요</h1><button onClick={() => router.replace("/")} className="btn-primary mt-6 w-full">온보딩으로 가기</button></div></main>;
  const update = <K extends keyof UserPreferences>(key: K, value: UserPreferences[K]) => setDraft(current => current ? { ...current, [key]: value } : current);
  const save = async () => {
    if (!draft.nickname.trim() || draft.interests.length + draft.customInterests.length === 0) return;
    setStatus("saving");
    const next = { ...state, profile: { ...draft, nickname: draft.nickname.trim() } };
    saveState(next, user?.id);
    if (user) await saveCloudState(user.id, next);
    // Apply the change locally even when the remote sync fails, so the UI never
    // discards the user's edit. The development console contains the safe
    // Supabase error details needed to repair the remote schema/RLS setup.
    setState(next); setDraft(next.profile);
    setStatus("saved");
  };
  const signOut = async () => { const supabase = getSupabaseBrowserClient(); await supabase?.auth.signOut(); router.replace("/"); router.refresh(); };
  const deleteAccount = async () => {
    if (!window.confirm("회원탈퇴하면 로그인 계정과 모든 학습 기록이 삭제됩니다. 계속할까요?")) return;
    setStatus("deleting");
    const response = await fetch("/api/account/delete", { method: "DELETE" });
    if (!response.ok) {
      setStatus("error");
      return;
    }
    clearUserState(user?.id);
    clearAllLocalState();
    const supabase = getSupabaseBrowserClient();
    await supabase?.auth.signOut();
    router.replace("/");
    router.refresh();
  };
  return <main className="profile-page min-h-dvh bg-[var(--cream)] pb-16">
    <header className="border-b border-[var(--line)] bg-white/90 px-5"><div className="mx-auto flex h-[68px] max-w-[900px] items-center justify-between"><SproutLogo/><button onClick={() => router.push("/")} className="btn-secondary min-h-10 px-4 text-sm">홈으로</button></div></header>
    <div className="mx-auto max-w-[900px] px-5 pt-8">
      <p className="eyebrow">MY NewsSeed</p><h1 className="mt-1 text-3xl font-black tracking-[-0.04em]">프로필</h1><p className="mt-2 text-[var(--muted)]">나에게 맞는 뉴씨드를 관리해요.</p>
      <section className="card mt-6 p-5 sm:p-7"><div className="flex items-center gap-4"><div className="grid h-16 w-16 place-items-center rounded-[22px] bg-[var(--green-soft)] text-2xl font-black text-[var(--green-deep)]">{draft.nickname.slice(0, 1)}</div><div><h2 className="text-xl font-black">{draft.nickname}</h2><p className="mt-1 text-sm font-bold text-[var(--muted)]">{provider}로 로그인</p>{user?.email && <p className="mt-0.5 text-sm text-[var(--muted)]">{user.email}</p>}</div></div>
        <dl className="mt-6 grid gap-4 border-t border-[var(--line)] pt-5 text-sm sm:grid-cols-2"><Info label="로그인 방식" value={provider}/><Info label="가입일" value={formatDate(user?.created_at)}/><Info label="로그인 이메일" value={user?.email ?? "계정에서 제공하지 않음"}/><Info label="현재 학년" value={`${draft.gradeLevel}학년`}/></dl></section>
      <section className="card mt-6 p-5 sm:p-7"><h2 className="text-xl font-black">뉴스 맞춤 설정</h2><p className="mt-1 text-sm text-[var(--muted)]">저장하면 다음 추천 뉴스부터 바로 반영돼요.</p>
        <label className="mt-6 block text-sm font-black" htmlFor="profile-nickname">닉네임</label><input id="profile-nickname" className="input mt-2" maxLength={10} value={draft.nickname} onChange={event => update("nickname", event.target.value)}/>
        <Choice title="학년" items={gradeOptions} value={draft.gradeLevel} onChange={value => update("gradeLevel", value as GradeLevel)}/>
        <div className="mt-6"><div className="flex items-center justify-between"><p className="text-sm font-black">관심 분야</p><span className="text-xs font-extrabold text-[var(--green)]">{draft.interests.length + draft.customInterests.length}개</span></div><InterestSelector interests={draft.interests} customInterests={draft.customInterests} onInterestsChange={value => update("interests", value)} onCustomInterestsChange={value => update("customInterests", value)}/></div>
        <Choice title="읽기 수준" items={readingOptions} value={draft.readingLevel} onChange={value => update("readingLevel", value as ReadingLevel)}/><Choice title="설명 난이도" items={explanationOptions} value={draft.explanationLevel} onChange={value => update("explanationLevel", value as ExplanationLevel)}/>
        <div className="mt-6"><p className="text-sm font-black">하루 뉴스 개수</p><div className="mt-2 grid grid-cols-5 gap-2">{[1,2,3,4,5].map(count => <button type="button" key={count} onClick={() => update("dailyArticleCount", count)} className={`h-11 rounded-xl border-2 font-black ${draft.dailyArticleCount === count ? "border-[var(--green)] bg-[var(--green-soft)] text-[var(--green-deep)]" : "border-[var(--line)]"}`}>{count}</button>)}</div></div>
        <div className="mt-6 flex items-center justify-between rounded-2xl bg-[#f7faf8] p-4"><div><p className="text-sm font-black">알림 시간</p><p className="mt-1 text-xs text-[var(--muted)]">알림 기능은 준비 중이에요.</p></div><span className="rounded-full bg-white px-3 py-1 text-xs font-black text-[var(--muted)]">준비 중</span></div>
        <button onClick={save} disabled={status === "saving" || !draft.nickname.trim() || draft.interests.length + draft.customInterests.length === 0} className="btn-primary mt-7 w-full">{status === "saving" ? "저장 중…" : "맞춤 설정 저장"}</button>{status === "saved" && <p className="mt-3 text-center text-sm font-bold text-[var(--green)]">저장했어요. 다음 뉴스에 반영할게요!</p>}{status === "error" && <p role="alert" className="mt-3 text-center text-sm font-bold text-[#a34737]">저장하지 못했어요. 잠시 후 다시 시도해주세요.</p>}
      </section>
      <section className="card mt-6 p-5 sm:p-7"><h2 className="text-xl font-black">나의 성장</h2>{state.stats.xp || readCount ? <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4"><Stat label="연속 학습" value={`${state.stats.streak}일`}/><Stat label="총 XP" value={`${state.stats.xp}`}/><Stat label="읽은 뉴스" value={`${readCount}개`}/><Stat label="관심 분야" value={`${draft.interests.length + draft.customInterests.length}개`}/></div> : <p className="mt-4 rounded-2xl bg-[#f7faf8] p-5 text-sm font-bold text-[var(--muted)]">아직 학습 기록이 없어요. 오늘의 뉴스 한 장부터 시작해봐요.</p>}</section>
      <section className="mt-6 rounded-[24px] border border-[#efd6d0] bg-white p-5 sm:p-7"><h2 className="text-lg font-black">계정</h2><div className="mt-4 grid gap-3 sm:grid-cols-2"><button onClick={signOut} className="min-h-12 rounded-2xl border-2 border-[var(--line)] bg-white font-black text-[var(--muted)] transition hover:bg-[#f7faf8]">로그아웃</button><button onClick={deleteAccount} disabled={status === "deleting"} className="min-h-12 rounded-2xl border-2 border-[#e8bdb3] bg-[#fff6f3] font-black text-[#a34737] transition hover:bg-[#ffede8]">{status === "deleting" ? "탈퇴 처리 중…" : "회원탈퇴"}</button></div>{status === "error" && <p role="alert" className="mt-3 text-center text-sm font-bold text-[#a34737]">회원탈퇴에 실패했어요. 서버 설정을 확인해 주세요.</p>}</section>
    </div>
  </main>;
}

function Choice({ title, items, value, onChange }: { title: string; items: { value: string; label: string }[]; value: string; onChange: (value: string) => void }) { return <div className="mt-6"><p className="text-sm font-black">{title}</p><div className="mt-2 grid grid-cols-3 gap-2">{items.map(item => <button type="button" key={item.value} onClick={() => onChange(item.value)} className={`min-h-11 rounded-xl border-2 text-sm font-black ${value === item.value ? "border-[var(--green)] bg-[var(--green-soft)] text-[var(--green-deep)]" : "border-[var(--line)]"}`}>{item.label}</button>)}</div></div>; }
function Info({ label, value }: { label: string; value: string }) { return <div><dt className="font-bold text-[var(--muted)]">{label}</dt><dd className="mt-1 font-black">{value}</dd></div>; }
function Stat({ label, value }: { label: string; value: string }) { return <div className="rounded-2xl bg-[#f7faf8] p-3 text-center"><b className="block text-lg text-[var(--green-deep)]">{value}</b><span className="text-xs font-bold text-[var(--muted)]">{label}</span></div>; }
function providerLabel(user: User | null) { const provider = user?.app_metadata?.provider; return provider === "google" ? "Google" : provider === "kakao" ? "Kakao" : "이메일"; }
function formatDate(value?: string) { return value ? new Intl.DateTimeFormat("ko-KR", { dateStyle: "medium" }).format(new Date(value)) : "확인할 수 없음"; }
function Loading() { return <div className="grid min-h-dvh place-items-center bg-[var(--cream)]"><div className="h-10 w-10 animate-spin rounded-full border-4 border-[#d9e7dc] border-t-[var(--green)]"/></div>; }
