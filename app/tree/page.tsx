"use client";

import Link from "next/link";
import { TreePreview } from "@/components/tree-preview";
import { getTreeGrowth } from "@/lib/growth";
import { useTreeState } from "@/features/tree/use-tree-state";

export default function TreePage() {
  const { state, ready } = useTreeState();
  if (!ready || !state) return <TreeLoading/>;
  const { stage, next, progress, customizationUnlocked } = getTreeGrowth(state.stats.xp);
  return <main className="min-h-dvh bg-[var(--cream)] px-5 pb-16"><header className="mx-auto flex h-20 max-w-[980px] items-center justify-between"><Link href="/" className="font-black text-[var(--green-deep)]">← 홈으로</Link><span className="rounded-full bg-white px-4 py-2 text-sm font-black shadow-sm">🍃 {state.stats.leafCurrency}</span></header><div className="mx-auto grid max-w-[980px] gap-6 lg:grid-cols-[1.15fr_0.85fr]"><section className="card p-5 sm:p-7"><p className="eyebrow">MY KNOWLEDGE TREE</p><h1 className="type-display mt-2 text-4xl">나의 지식나무</h1><div className="mt-6"><TreePreview xp={state.stats.xp} equipped={state.stats.equippedTreeItems}/></div></section><aside className="space-y-5"><section className="card p-6"><p className="text-sm font-black text-[var(--green)]">현재 단계</p><h2 className="type-display mt-1 text-3xl">{stage.name}</h2><div className="mt-4 flex justify-between text-sm font-black"><span>{state.stats.xp} XP</span><span>🍃 {state.stats.leafCurrency}개</span></div><div className="mt-3 h-3 overflow-hidden rounded-full bg-[#e5ece7]"><div className="h-full rounded-full bg-[var(--green)]" style={{width:`${progress}%`}}/></div><p className="mt-2 text-sm font-bold text-[var(--muted)]">{next ? `${next.name}까지 ${next.minXp - state.stats.xp} XP` : "지식나무가 완전히 자랐어요!"}</p></section><section className="card p-6">{customizationUnlocked ? <><h2 className="type-display text-2xl">나만의 나무 만들기</h2><p className="mt-2 text-sm text-[var(--muted)]">모은 잎사귀로 아이템을 사고 나무를 꾸며보세요.</p><div className="mt-5 grid grid-cols-2 gap-3"><Link href="/tree/customize" className="btn-primary text-center">꾸미기</Link><Link href="/tree/shop" className="btn-secondary text-center">상점</Link></div></> : <><p className="text-3xl">🔒</p><h2 className="type-display mt-3 text-2xl">나무 꾸미기</h2><p className="mt-2 text-sm font-bold text-[var(--muted)]">어린나무가 되면 꾸밀 수 있어요.<br/>어린나무까지 {Math.max(0, 300 - state.stats.xp)} XP 남았어요 🌱</p><Link href="/tree/shop" className="btn-secondary mt-5 block text-center">상점 구경하기</Link></>}</section></aside></div></main>;
}

function TreeLoading() { return <div className="grid min-h-dvh place-items-center bg-[var(--cream)]"><p className="font-bold text-[var(--muted)]">지식나무를 불러오는 중...</p></div>; }
