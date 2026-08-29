"use client";

import { useState } from "react";
import type { Provider } from "@supabase/supabase-js";
import { SproutLogo } from "@/components/brand";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export function AuthScreen() {
  const [loading, setLoading] = useState<Provider | null>(null);
  const [error, setError] = useState("");
  const signIn = async (provider: "google" | "kakao") => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    setLoading(provider); setError("");
    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/auth/callback?next=/` },
    });
    if (authError) { setError("로그인을 시작하지 못했어요. 잠시 후 다시 시도해 주세요."); setLoading(null); }
  };
  return <main className="grid min-h-dvh place-items-center bg-[var(--cream)] px-5 py-10">
    <section className="w-full max-w-[460px] animate-rise rounded-[28px] border border-[var(--line)] bg-white p-6 text-center shadow-[0_6px_0_#e2e9e4] sm:p-9">
      <div className="flex justify-center"><SproutLogo/></div>
      <div className="mx-auto mt-8 grid h-24 w-24 place-items-center rounded-[30px] bg-[var(--green-soft)] text-5xl">🌱</div>
      <p className="eyebrow mt-7">하루 한 장, 생각이 자라는 뉴스</p>
      <h1 className="mt-2 text-[30px] font-black tracking-[-0.05em]">나만의 씨앗을 키워요</h1>
      <p className="mx-auto mt-3 max-w-xs text-[15px] font-medium leading-relaxed text-[var(--muted)]">로그인하면 관심사와 학습 기록, XP와 연속 학습을 안전하게 이어갈 수 있어요.</p>
      <div className="mt-8 space-y-3">
        <button disabled={loading !== null} onClick={() => signIn("google")} className="social-button"><span className="grid h-7 w-7 place-items-center rounded-full bg-white font-black text-[#4285f4] shadow-sm">G</span>{loading === "google" ? "구글로 이동 중..." : "Google로 계속하기"}</button>
        <button disabled={loading !== null} onClick={() => signIn("kakao")} className="social-button border-[#fee500] bg-[#fee500] text-[#191919] hover:bg-[#f5dc00]"><span className="text-xl">💬</span>{loading === "kakao" ? "카카오로 이동 중..." : "카카오로 계속하기"}</button>
      </div>
      {error && <p role="alert" className="mt-4 rounded-xl bg-[#fff0ec] p-3 text-sm font-bold text-[#9e432f]">{error}</p>}
      <p className="mt-6 text-xs leading-relaxed text-[#8b958e]">로그인하면 서비스 이용을 위한 최소한의 계정 정보만 사용합니다.</p>
    </section>
  </main>;
}
