"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { loadSeedRecords, mergeSeedRecords, replaceSeedRecords } from "@/lib/storage";
import { recordDateKey } from "@/lib/growth";
import { loadCloudSeedRecords, saveCloudSeedRecords } from "@/services/user/seedRecords";
import { useAuth } from "@/features/auth/use-auth";
import type { SeedRecord } from "@/types";

export function SeedsScreen({ authEnabled }: { authEnabled: boolean }) {
  const { user, ready } = useAuth(authEnabled);
  const [records, setRecords] = useState<SeedRecord[]>([]);
  useEffect(() => {
    if (!ready) return;
    let active = true;
    const timer = window.setTimeout(async () => {
      const accountRecords = loadSeedRecords(user?.id);
      const anonymousRecords = user ? loadSeedRecords() : [];
      const cloudRecords = user ? await loadCloudSeedRecords(user.id) : [];
      if (!active) return;
      const merged = mergeSeedRecords(accountRecords, anonymousRecords, cloudRecords);
      setRecords(merged);
      replaceSeedRecords(merged, user?.id);
      if (user && (accountRecords.length || anonymousRecords.length)) void saveCloudSeedRecords(user.id, mergeSeedRecords(accountRecords, anonymousRecords));
    }, 0);
    return () => { active = false; window.clearTimeout(timer); };
  }, [ready, user]);
  const groups = records.reduce<Record<string, SeedRecord[]>>((all, record) => { const date = recordDateKey(record); (all[date] ??= []).push(record); return all; }, {});
  return <main className="min-h-dvh bg-[var(--cream)] px-5 pb-16"><header className="mx-auto flex h-[76px] max-w-[760px] items-center justify-between"><Link href="/" className="font-black text-[var(--green-deep)]">← 오늘의 뉴씨드</Link><span className="eyebrow">MY NewsSeed</span></header><div className="mx-auto max-w-[760px]"><p className="eyebrow">MY SEED LIBRARY</p><h1 className="type-display mt-2 text-4xl">나의 씨앗 보관함 🌱</h1><p className="mt-3 text-[var(--muted)]">그동안 심은 지식 씨앗들이 자라고 있어요.</p>{!records.length ? <section className="card mt-8 p-8 text-center"><p className="text-4xl">🌱</p><h2 className="mt-4 text-xl font-black">아직 심은 씨앗이 없어요</h2><p className="mt-2 text-sm text-[var(--muted)]">오늘의 뉴씨드를 읽고 첫 씨앗을 심어보세요.</p><Link href="/" className="btn-primary mt-6 inline-flex px-6">오늘의 뉴씨드 보러 가기</Link></section> : <div className="mt-8 space-y-8">{Object.entries(groups).sort(([a], [b]) => b.localeCompare(a)).map(([date, items]) => <section key={date}><h2 className="flex items-center gap-2 text-lg font-black text-[var(--green-deep)]"><span>🌱</span>{new Intl.DateTimeFormat("ko-KR", { dateStyle: "long" }).format(new Date(`${date}T12:00:00`))}<span className="text-sm text-[var(--muted)]">{items.length}개</span></h2><div className="mt-3 space-y-3">{items.map(record => <Link key={`${date}-${record.article.id}`} href={`/seeds/${encodeURIComponent(record.article.id)}`} className="card block p-4 transition hover:-translate-y-0.5 hover:shadow-md"><div className="flex items-start gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-[var(--green-soft)] text-xl">{record.article.emoji}</span><div className="min-w-0"><p className="text-xs font-black text-[var(--green)]">{record.article.category} · {record.article.estimatedReadingTime}분 · +{record.xpEarned} XP</p><h3 className="mt-1 font-black">{record.article.kidContent.title}</h3><p className="mt-1 line-clamp-1 text-sm text-[var(--muted)]">{record.article.kidContent.keyTakeaway}</p></div></div></Link>)}</div></section>)}</div>}</div></main>;
}
