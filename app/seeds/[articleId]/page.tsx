"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import type { SeedRecord } from "@/types";
import { LessonScreen } from "@/features/daily-news/lesson-screen";
import { useAuth } from "@/features/auth/use-auth";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { loadSeedRecords, mergeSeedRecords, replaceSeedRecords } from "@/lib/storage";
import { loadCloudSeedRecords, saveCloudSeedRecords } from "@/services/user/seedRecords";

export default function SeedReplayPage() {
  const router = useRouter();
  const params = useParams<{ articleId: string }>();
  const { user, ready } = useAuth(isSupabaseConfigured());
  const [record, setRecord] = useState<SeedRecord | null | undefined>();

  useEffect(() => {
    if (!ready) return;
    let active = true;
    void (async () => {
      const accountRecords = loadSeedRecords(user?.id);
      const anonymousRecords = user ? loadSeedRecords() : [];
      const cloudRecords = user ? await loadCloudSeedRecords(user.id) : [];
      if (!active) return;
      const merged = mergeSeedRecords(accountRecords, anonymousRecords, cloudRecords);
      replaceSeedRecords(merged, user?.id);
      if (user && (accountRecords.length || anonymousRecords.length)) void saveCloudSeedRecords(user.id, mergeSeedRecords(accountRecords, anonymousRecords));
      setRecord(merged.find(item => item.article.id === params.articleId) ?? null);
    })();
    return () => { active = false; };
  }, [params.articleId, ready, user]);

  if (record === undefined) return <div className="grid min-h-dvh place-items-center bg-[var(--cream)]"><p className="font-bold text-[var(--muted)]">씨앗 기록을 불러오는 중...</p></div>;
  if (record === null) return <div className="grid min-h-dvh place-items-center bg-[var(--cream)] px-5"><div className="card max-w-md p-8 text-center"><p className="text-4xl">🌱</p><h1 className="mt-4 text-xl font-black">이 씨앗 기록을 찾지 못했어요</h1><button className="btn-primary mt-6" onClick={() => router.push("/seeds")}>보관함으로 돌아가기</button></div></div>;
  return <LessonScreen article={record.article} index={0} total={1} onBack={() => router.push("/seeds")} onComplete={() => router.push("/seeds")}/>;
}
