"use client";

import { useState } from "react";
import Link from "next/link";
import type { EquippedTreeItems, TreeItemCategory } from "@/types";
import { TreePreview } from "@/components/tree-preview";
import { defaultEquippedTreeItems, equipTreeItems, treeShopItems } from "@/lib/tree-shop";
import { getTreeGrowth } from "@/lib/growth";
import { useTreeState } from "@/features/tree/use-tree-state";

const groups: { id: TreeItemCategory; name: string }[] = [{ id: "pot", name: "화분" }, { id: "decoration", name: "장식" }, { id: "background", name: "배경" }, { id: "friend", name: "친구" }];

export default function TreeCustomizePage() {
  const { state, updateStats, ready } = useTreeState();
  if (!ready || !state) return <CustomizeLoading/>;
  return <CustomizeContent state={state} updateStats={updateStats}/>;
}

function CustomizeContent({ state, updateStats }: { state: NonNullable<ReturnType<typeof useTreeState>["state"]>; updateStats: ReturnType<typeof useTreeState>["updateStats"] }) {
  const [draft, setDraft] = useState<EquippedTreeItems>(state.stats.equippedTreeItems ?? defaultEquippedTreeItems);
  const [saved, setSaved] = useState(false);
  if (!getTreeGrowth(state.stats.xp).customizationUnlocked) return <main className="grid min-h-dvh place-items-center bg-[var(--cream)] px-5"><section className="card max-w-md p-8 text-center"><span className="text-4xl">🔒</span><h1 className="type-display mt-4 text-3xl">어린나무가 되면 꾸밀 수 있어요</h1><p className="mt-3 text-[var(--muted)]">어린나무까지 {Math.max(0, 300 - state.stats.xp)} XP 남았어요.</p><Link href="/tree" className="btn-primary mt-6 inline-block">돌아가기</Link></section></main>;
  const save = () => { updateStats(stats => equipTreeItems(stats, draft)); setSaved(true); };
  return <main className="min-h-dvh bg-[var(--cream)] px-5 pb-16"><header className="mx-auto flex h-20 max-w-[980px] items-center justify-between"><Link href="/tree" className="font-black text-[var(--green-deep)]">← 지식나무</Link><span className="font-black">나무 꾸미기</span></header><div className="mx-auto grid max-w-[980px] gap-6 lg:grid-cols-[1fr_1fr]"><section className="lg:sticky lg:top-6 lg:self-start"><TreePreview xp={state.stats.xp} equipped={draft}/><button onClick={save} className="btn-primary mt-4 w-full">이대로 꾸미기</button>{saved && <p className="mt-2 text-center text-sm font-black text-[var(--green)]">꾸미기를 저장했어요!</p>}</section><section className="card p-5 sm:p-6">{groups.map(group => <div key={group.id} className="mb-6 last:mb-0"><h2 className="type-display text-xl">{group.name}</h2><div className="mt-3 grid grid-cols-2 gap-2">{treeShopItems.filter(item => item.category === group.id && state.stats.ownedTreeItems.includes(item.id)).map(item => <button key={item.id} onClick={() => { setDraft(current => ({...current,[group.id]:item.id})); setSaved(false); }} className={`rounded-2xl border p-3 text-left ${draft[group.id] === item.id ? "border-[var(--green)] bg-[var(--green-soft)]" : "border-[var(--line)] bg-white"}`}><span className="text-2xl">{item.preview}</span><p className="mt-1 text-sm font-black">{item.name}</p></button>)}</div></div>)}</section></div></main>;
}

function CustomizeLoading() { return <div className="grid min-h-dvh place-items-center bg-[var(--cream)]"><p className="font-bold text-[var(--muted)]">꾸미기를 불러오는 중...</p></div>; }
