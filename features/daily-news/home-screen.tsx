"use client";

import type { Article, UserProfile, LearningStats } from "@/types";
import { formatKoreanDate, TODAY } from "@/lib/date";
import { SproutLogo } from "@/components/brand";
import { StreakBadge, XPBadge } from "@/components/badges";
import { ArrowIcon, ClockIcon } from "@/components/icons";
import { NewsCard } from "@/components/news-card";
import { MonthlyCalendar } from "@/components/monthly-calendar";
import Link from "next/link";

export function HomeScreen({ profile, stats, articles, accountLabel, onStart, onOpenArticle, onAccount }: { profile: UserProfile; stats: LearningStats; articles: Article[]; accountLabel?: string; onStart: () => void; onOpenArticle: (index: number) => void; onAccount: () => void }) {
  const completed = stats.articleCompletions[TODAY] ?? [];
  const completedCount = Math.min(completed.filter(id => articles.some(article => article.id === id)).length, articles.length);
  const allDone = stats.completedDates.includes(TODAY);
  return <main className="min-h-dvh bg-[var(--cream)] pb-14">
    <header className="border-b border-[var(--line)] bg-white/90 px-5 backdrop-blur"><div className="mx-auto flex h-[68px] max-w-[1050px] items-center justify-between"><SproutLogo/><div className="flex items-center gap-2"><StreakBadge streak={stats.streak} small/><XPBadge xp={stats.xp} small/><button onClick={onAccount} aria-label="프로필 열기" title={accountLabel ? `${accountLabel} · 프로필` : "프로필"} className="ml-1 flex h-10 items-center gap-2 rounded-full border border-[#d9e5dc] bg-white pl-1 pr-3 text-sm font-black text-[var(--green-deep)] shadow-sm transition hover:bg-[var(--green-soft)]"><span className="grid h-8 w-8 place-items-center rounded-full bg-[#eff4f0] text-[var(--green)]">{profile.nickname.slice(0,1)}</span><span className="hidden sm:inline">프로필</span></button></div></div></header>
    <div className="mx-auto max-w-[1050px] px-5 pt-7 sm:pt-10">
      <div className="mb-6"><p className="text-sm font-bold text-[var(--muted)]">{formatKoreanDate()}</p><h1 className="type-display mt-1 text-[30px] sm:text-[34px]">안녕, {profile.nickname}! <span className="inline-block origin-bottom animate-wave">👋</span></h1><p className="mt-2 text-[15px] text-[var(--muted)]">오늘도 세상을 향한 호기심을 심어볼까요?</p></div>
      <div className="grid gap-6 lg:grid-cols-[1.35fr_0.85fr]">
        <div className="space-y-6">
          <section className="relative overflow-hidden rounded-[28px] bg-[var(--green-deep)] p-6 text-white shadow-[0_8px_0_#174b2f] sm:p-8">
            <div className="absolute -right-12 -top-14 h-48 w-48 rounded-full bg-white/5"/><div className="absolute bottom-[-65px] right-16 h-36 w-36 rounded-full bg-[#8bd96e]/10"/>
            <div className="relative"><div className="flex items-start justify-between"><div><p className="text-xs font-extrabold tracking-[0.12em] text-[#a9dabb]">TODAY&apos;S NewsSeed</p><h2 className="type-display mt-2 text-[32px] sm:text-[40px]">오늘의 뉴씨드</h2></div><span className="grid h-16 w-16 place-items-center rounded-[22px] bg-white/10 text-3xl">{allDone ? "🌳" : "🌱"}</span></div>
              <div className="mt-7 space-y-3">{articles.map((article, index) => <div key={article.id} className="flex items-center gap-3 text-sm font-bold text-white/90"><span className={`grid h-6 w-6 shrink-0 place-items-center rounded-full text-[11px] ${completed.includes(article.id) ? "bg-[#87d96c] text-[#124a2c]" : "bg-white/12"}`}>{completed.includes(article.id) ? "✓" : index + 1}</span><span className="truncate">{article.kidContent.title}</span></div>)}</div>
              <div className="mt-7 flex items-center justify-between border-t border-white/15 pt-5"><span className="flex items-center gap-2 text-sm font-bold text-white/70"><ClockIcon size={17}/>{articles.reduce((sum,a)=>sum+a.estimatedReadingTime,0)}분이면 완성!</span><span className="text-sm font-black text-[#b8e897]">{completedCount}/{articles.length} 완료</span></div>
              <button onClick={onStart} className="type-display mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#a8e778] px-5 py-4 text-[17px] text-[#164a2f] shadow-[0_4px_0_#6caf52] transition hover:bg-[#b5ed89] active:translate-y-1 active:shadow-none">{allDone ? "오늘의 신문 다시 보기" : completedCount ? "이어서 읽기" : "오늘의 신문 시작하기"}<ArrowIcon size={19}/></button>
            </div>
          </section>
          <section><div className="mb-3 flex items-center justify-between"><h2 className="type-display type-section">오늘 심을 지식 씨앗</h2><span className="text-xs font-bold text-[var(--muted)]">관심사 맞춤</span></div><div className="space-y-3">{articles.map((article,index)=><NewsCard key={article.id} article={article} index={index} completed={completed.includes(article.id)} onClick={()=>onOpenArticle(index)}/>)}</div></section>
        </div>
        <aside className="space-y-6"><section className="card p-5 sm:p-6"><h2 className="type-display type-section">이번 주 성장</h2><div className="mt-4 flex items-center gap-4"><div className="grid h-16 w-16 place-items-center rounded-2xl bg-[#fff2e7] text-3xl">🔥</div><div><p className="text-2xl font-black">{stats.streak}일 연속</p><p className="mt-1 text-sm text-[var(--muted)]">꾸준함이 지식을 키워요</p></div></div><div className="mt-5 grid grid-cols-7 gap-1.5">{["월","화","수","목","금","토","일"].map((day,index)=><div key={day} className="text-center"><span className={`mx-auto grid h-8 w-8 place-items-center rounded-full text-xs font-black ${index===5 && allDone ? "bg-[#ff8a3d] text-white" : index===5 ? "border-2 border-dashed border-[#f4a372] text-[#e87a31]" : "bg-[#f0f4f1] text-[#a5ada7]"}`}>{index===5 && allDone ? "✓" : day}</span></div>)}</div></section><MonthlyCalendar completedDates={stats.completedDates}/></aside>
      </div>
      <Link href="/seeds" className="mt-6 block overflow-hidden rounded-[22px] bg-[var(--green-soft)] p-5 transition hover:-translate-y-0.5"><div className="flex items-center gap-4"><span className="text-4xl">🌱</span><div><h2 className="type-display text-lg text-[var(--green-deep)]">나의 씨앗 보관함</h2><p className="mt-1 text-sm font-bold text-[var(--green-deep)]">지금까지 심은 지식 씨앗을 다시 만나보세요.</p></div></div></Link>
    </div>
  </main>;
}
